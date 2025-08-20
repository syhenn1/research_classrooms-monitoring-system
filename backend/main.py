import eventlet
eventlet.monkey_patch()

from flask import Flask, request, jsonify, Response, session, g
from flask_cors import CORS
from flask_socketio import SocketIO
import mysql.connector
from mysql.connector import pooling
import cv2
from ultralytics import YOLO
from datetime import datetime
import time
import uuid
import threading
import torch

DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
if DEVICE == 'cpu':
    pass

app = Flask(__name__)

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'monitoring_system'
}

def initialize_database():
    try:
        temp_conn_config = DB_CONFIG.copy()
        temp_conn_config.pop('database', None)
        temp_conn = mysql.connector.connect(**temp_conn_config)
        cursor = temp_conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']} CHARACTER SET UTF8MB4 COLLATE utf8mb4_unicode_ci")
        cursor.close()
        temp_conn.close()
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        create_sessions_table = """
        CREATE TABLE IF NOT EXISTS sessions (
          session_id VARCHAR(36) PRIMARY KEY, session_name VARCHAR(255) NOT NULL, date VARCHAR(50) NOT NULL,
          time VARCHAR(50) NOT NULL, disruptionTotal INT NOT NULL, cheatingTotal INT NOT NULL
        ) ENGINE=InnoDB;
        """
        create_logs_table = """
        CREATE TABLE IF NOT EXISTS logs (
          id INT PRIMARY KEY AUTO_INCREMENT, session_id VARCHAR(36) NOT NULL, label VARCHAR(255) NOT NULL,
          confidence FLOAT NOT NULL, classtype VARCHAR(50) NOT NULL, time VARCHAR(50) NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions (session_id)
        ) ENGINE=InnoDB;
        """
        cursor.execute(create_sessions_table)
        cursor.execute(create_logs_table)
        conn.commit()
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        exit(1)

initialize_database()
app.config.update(DB_CONFIG)
app.config.update(MYSQL_POOL_NAME='flask_pool', MYSQL_POOL_SIZE=5)
db_pool = mysql.connector.pooling.MySQLConnectionPool(
    pool_name=app.config['MYSQL_POOL_NAME'], pool_size=app.config['MYSQL_POOL_SIZE'], **DB_CONFIG
)

@app.teardown_appcontext
def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.3:3000"])
app.secret_key = "ganti_dengan_kunci_rahasia_yang_aman"
app.config.update(SESSION_COOKIE_SAMESITE="None", SESSION_COOKIE_SECURE=True)

MODELS = {
    'quiz': YOLO('models/yolov8n.pt'),
    'disruption': YOLO('models/yolov8n.pt')
}
if DEVICE == 'cuda':
    for model_name in MODELS:
        MODELS[model_name].to(DEVICE)

socketio = SocketIO(app, cors_allowed_origins="*")

class MonitoringManager:
    def __init__(self, socketio_instance, db_pool_instance, models_dict):
        self.socketio = socketio_instance
        self.db_pool = db_pool_instance
        self.models = models_dict

        self.cap = None
        self.latest_frame = None
        self.frame_lock = threading.Lock()
        self.stop_event = threading.Event()
        
        self.producer_thread = None
        self.consumer_thread = None
        self.thread_lock = threading.Lock()
        
        self.PROXIMITY_THRESHOLD = 500

    def _open_camera_safely(self, camera_index):
        capture = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
        if capture.isOpened():
            return capture
        capture = cv2.VideoCapture(camera_index)
        if capture.isOpened():
            return capture
        return None

    def _find_matching_box(self, label, center_x, center_y, used_ids, instance_labels):
        for existing_id, data in instance_labels.items():
            if existing_id in used_ids: continue
            existing_label, ex, ey, _ = existing_id.split('_')
            if existing_label != label: continue
            ex = int(ex)
            ey = int(ey)
            distance = ((center_x - ex) ** 2 + (center_y - ey) ** 2) ** 0.5
            if distance <= self.PROXIMITY_THRESHOLD:
                return existing_id
        return None

    def _producer_task(self, camera_index):
        self.cap = self._open_camera_safely(camera_index)
        if not self.cap:
            return
        while not self.stop_event.is_set():
            success, frame = self.cap.read()
            if not success: break
            with self.frame_lock:
                self.latest_frame = frame.copy()
            self.socketio.sleep(0.01)
        if self.cap: self.cap.release()
        self.cap = None
        with self.frame_lock: self.latest_frame = None

    def _generate_raw_frames(self):
        while not self.stop_event.is_set():
            with self.frame_lock:
                if self.latest_frame is None:
                    self.socketio.sleep(0.1)
                    continue
                frame = self.latest_frame.copy()
            frame = cv2.flip(frame, 1)
            _, buffer = cv2.imencode('.jpg', frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            self.socketio.sleep(0.03)

    def _consumer_task(self, classtype, active_session_id):
        model = self.models.get(classtype, self.models['disruption'])
        class_names = model.names
        
        RESIZE_WIDTH = 416
        FRAME_SKIP = 3
        cooldown_interval = 5
        instance_labels = {}
        instance_counter = 0
        frame_count = 0

        while not self.stop_event.is_set():
            with self.frame_lock:
                if self.latest_frame is None:
                    self.socketio.sleep(0.1)
                    continue
                frame = self.latest_frame.copy()

            frame_count += 1
            if frame_count % (FRAME_SKIP + 1) != 0: continue

            original_height, original_width, _ = frame.shape
            scale = RESIZE_WIDTH / original_width
            small_frame = cv2.resize(frame, (RESIZE_WIDTH, int(original_height * scale)))
            results = model(small_frame, verbose=False, device=DEVICE)
            
            now = time.time()
            detections, current_instances, used_ids = [], set(), set()

            for box in results[0].boxes:
                conf = float(box.conf[0])
                label = class_names[int(box.cls[0])]
                x1_sm, y1_sm, x2_sm, y2_sm = map(int, box.xyxy[0])
                x1, y1 = int(x1_sm / scale), int(y1_sm / scale)
                x2, y2 = int(x2_sm / scale), int(y2_sm / scale)
                center_x, center_y = (x1 + x2) // 2, (y1 + y2) // 2
                
                matched_box_id = self._find_matching_box(label, center_x, center_y, used_ids, instance_labels)
                box_id = matched_box_id if matched_box_id else f"{label}_{center_x}_{center_y}_{instance_counter}"
                if not matched_box_id: instance_counter += 1
                used_ids.add(box_id)
                current_instances.add(box_id)

                if box_id not in instance_labels: instance_labels[box_id] = {'start_time': now, 'logged': False}
                
                instance_data = instance_labels[box_id]
                if not instance_data['logged'] and (now - instance_data['start_time']) >= cooldown_interval:
                    instance_data['logged'] = True
                    timestamp = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
                    try:
                        db_conn = self.db_pool.get_connection()
                        cursor = db_conn.cursor()
                        query = 'INSERT INTO logs (session_id, label, confidence, classtype, time) VALUES (%s, %s, %s, %s, %s)'
                        values = (active_session_id, label, round(conf * 100, 2), classtype, timestamp)
                        cursor.execute(query, values)
                        db_conn.commit()
                        cursor.close()
                        db_conn.close()
                    except Exception as e:
                        pass

                flipped_x1, flipped_x2 = original_width - x2, original_width - x1
                detections.append({'x1': flipped_x1, 'y1': y1, 'x2': flipped_x2, 'y2': y2, 'label': label, 'confidence': f"{conf:.2%}", 'logged': instance_data['logged']})

            for box_id in list(instance_labels.keys()):
                if box_id not in current_instances: del instance_labels[box_id]

            self.socketio.emit('detection_data', {'boxes': detections, 'frame_width': original_width, 'frame_height': original_height})
            self.socketio.sleep(0)

    def start(self, classtype, camera_index, active_session_id):
        with self.thread_lock:
            if self.producer_thread is None:
                self.stop_event.clear()
                self.producer_thread = self.socketio.start_background_task(self._producer_task, camera_index)
                self.consumer_thread = self.socketio.start_background_task(self._consumer_task, classtype, active_session_id)

    def stop(self):
        self.stop_event.set()
        with self.thread_lock:
            self.producer_thread = None
            self.consumer_thread = None
        return jsonify({'message': 'Semua thread dihentikan.'}), 200

    def get_status(self):
        return not self.stop_event.is_set() and self.producer_thread is not None
        
monitoring_manager = MonitoringManager(socketio, db_pool, MODELS)

@app.route('/video_feed/<classtype>/<int:camera_index>')
def video_feed(classtype, camera_index):
    active_session_id = session.get("active_session_id")
    if not active_session_id:
        return "Sesi aktif tidak ditemukan.", 400
    monitoring_manager.start(classtype, camera_index, active_session_id)
    return Response(monitoring_manager._generate_raw_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/camera/stop', methods=['POST'])
def stop_camera_stream():
    return monitoring_manager.stop()

@app.route('/api/camera-status')
def camera_status():
    active_session_id = session.get("active_session_id")
    return jsonify({
        'camera_in_use': monitoring_manager.get_status(),
        'has_active_session': active_session_id is not None,
        'active_session_id': active_session_id
    })

def get_db_connection_for_api():
    if 'db' not in g:
        g.db = db_pool.get_connection()
    return g.db

@app.route('/api/cameras/available')
def get_available_cameras():
    count = 0
    for i in range(10):
        cap = cv2.VideoCapture(i)
        if cap.isOpened():
            count += 1
            cap.release()
        else:
            break
    return jsonify({'count': count})

@app.route('/api/logs/<session_id>', methods=['GET'])
def get_logs(session_id):
    db = get_db_connection_for_api()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM logs WHERE session_id = %s', (session_id,))
    logs = cursor.fetchall()
    cursor.close()
    return jsonify(logs)

@app.route('/api/total')
def total_count():
    active_session_id = session.get("active_session_id")
    if not active_session_id:
        return jsonify({'total': 0})
    db = get_db_connection_for_api()
    cursor = db.cursor()
    cursor.execute('SELECT COUNT(id) FROM logs WHERE session_id = %s', (active_session_id,))
    count = cursor.fetchone()[0]
    cursor.close()
    return jsonify({'total': count})

@app.route('/api/sessions', methods=['POST'])
def create_session():
    data = request.json
    new_session = {
        "session_id": str(uuid.uuid4()), "session_name": data.get("session_name"),
        "date": datetime.now().strftime("%d %B %Y"), "time": datetime.now().strftime("%H.%M.%S"),
        "disruptionTotal": 0, "cheatingTotal": 0
    }
    db = get_db_connection_for_api()
    cursor = db.cursor()
    query = 'INSERT INTO sessions (session_id, session_name, date, time, disruptionTotal, cheatingTotal) VALUES (%s, %s, %s, %s, %s, %s)'
    values = tuple(new_session.values())
    cursor.execute(query, values)
    db.commit()
    cursor.close()
    session["active_session_id"] = new_session["session_id"]
    session.modified = True
    return jsonify(new_session), 201

@app.route('/api/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    db = get_db_connection_for_api()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM sessions WHERE session_id = %s', (session_id,))
    session_found = cursor.fetchone()
    cursor.close()
    if not session_found: return jsonify({'message': 'Sesi tidak ditemukan'}), 404
    return jsonify({'session': session_found}), 200

@app.route('/api/active-session', methods=['GET'])
def get_active_session():
    active_id = session.get("active_session_id")
    if not active_id: return jsonify({'message': 'Tidak ada sesi aktif'}), 404
    db = get_db_connection_for_api()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM sessions WHERE session_id = %s', (active_id,))
    session_found = cursor.fetchone()
    cursor.close()
    if not session_found:
        session.pop("active_session_id", None)
        return jsonify({'message': 'Sesi aktif tidak ditemukan di server'}), 404
    return jsonify({'session': session_found}), 200

@app.route('/api/sessions/<session_id>', methods=['PATCH'])
def update_session_totals(session_id):
    data = request.get_json()
    db = get_db_connection_for_api()
    cursor = db.cursor(dictionary=True)
    if 'disruptionTotal' in data: cursor.execute('UPDATE sessions SET disruptionTotal = %s WHERE session_id = %s', (data['disruptionTotal'], session_id))
    if 'cheatingTotal' in data: cursor.execute('UPDATE sessions SET cheatingTotal = %s WHERE session_id = %s', (data['cheatingTotal'], session_id))
    db.commit()
    cursor.execute('SELECT * FROM sessions WHERE session_id = %s', (session_id,))
    session_found = cursor.fetchone()
    cursor.close()
    if not session_found: return jsonify({'message': 'Sesi tidak ditemukan setelah update'}), 404
    return jsonify({'message': 'Sesi berhasil diperbarui', 'session': session_found}), 200

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    db = get_db_connection_for_api()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM sessions ORDER BY date DESC, time DESC')
    sessions_list = cursor.fetchall()
    cursor.close()
    return jsonify(sessions_list)

@app.route('/api/session/end', methods=['POST'])
def end_session():
    active_session_id = session.pop("active_session_id", None)
    monitoring_manager.stop()
    return jsonify({'message': 'Sesi aktif telah diakhiri','session_id': active_session_id}), 200

@socketio.on('connect')
def handle_connect():
    pass

@socketio.on('disconnect')
def handle_disconnect():
    pass

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=True)
from flask import Flask, request, jsonify, Response, session, g
from flask_cors import CORS
import mysql.connector
from mysql.connector import pooling
import cv2
from ultralytics import YOLO
from datetime import datetime
import time
import uuid
import threading

# --- Konfigurasi Aplikasi & Database ---
app = Flask(__name__)

DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'monitoring_system'
}

def initialize_database():
    """
    Membuat database dan tabel secara otomatis jika belum ada.
    """
    try:
        # Koneksi sementara tanpa menentukan database untuk mengecek/membuat DB
        temp_conn_config = DB_CONFIG.copy()
        temp_conn_config.pop('database', None) # Hapus key 'database' untuk koneksi awal

        temp_conn = mysql.connector.connect(**temp_conn_config)
        cursor = temp_conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']} CHARACTER SET UTF8MB4 COLLATE utf8mb4_unicode_ci")
        print(f"✅ Database '{DB_CONFIG['database']}' siap digunakan.")
        cursor.close()
        temp_conn.close()

        # Koneksi ke database yang sudah pasti ada untuk membuat tabel
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()

        create_sessions_table = """
        CREATE TABLE IF NOT EXISTS sessions (
          session_id VARCHAR(36) PRIMARY KEY,
          session_name VARCHAR(255) NOT NULL,
          date VARCHAR(50) NOT NULL,
          time VARCHAR(50) NOT NULL,
          disruptionTotal INT NOT NULL,
          cheatingTotal INT NOT NULL
        ) ENGINE=InnoDB;
        """
        create_logs_table = """
        CREATE TABLE IF NOT EXISTS logs (
          id INT PRIMARY KEY AUTO_INCREMENT,
          session_id VARCHAR(36) NOT NULL,
          label VARCHAR(255) NOT NULL,
          confidence FLOAT NOT NULL,
          classtype VARCHAR(50) NOT NULL,
          time VARCHAR(50) NOT NULL,
          FOREIGN KEY (session_id) REFERENCES sessions (session_id)
        ) ENGINE=InnoDB;
        """
        cursor.execute(create_sessions_table)
        cursor.execute(create_logs_table)
        conn.commit()
        print("✅ Tabel 'sessions' dan 'logs' siap digunakan.")
        cursor.close()
        conn.close()
    except mysql.connector.Error as err:
        print(f"❌ Gagal menginisialisasi database: {err}")
        exit(1)

initialize_database()

app.config.update(DB_CONFIG)
app.config.update(
    MYSQL_POOL_NAME='flask_pool',
    MYSQL_POOL_SIZE=5
)

try:
    db_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name=app.config['MYSQL_POOL_NAME'],
        pool_size=app.config['MYSQL_POOL_SIZE'],
        **DB_CONFIG
    )
    print("✅ MySQL Connection Pool berhasil dibuat.")
except Exception as e:
    print(f"❌ Gagal membuat MySQL Connection Pool: {e}")

def get_db():
    if 'db' not in g:
        g.db = db_pool.get_connection()
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.3:3000"])
app.secret_key = "ganti_dengan_kunci_rahasia_yang_aman"
app.config.update(
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=True,
)
app.teardown_appcontext(close_db)

camera_in_use = False
camera_lock = threading.Lock()
stop_stream_event = threading.Event()
PROXIMITY_THRESHOLD = 500

def open_camera_safely(camera_index):
    cap = cv2.VideoCapture(camera_index + cv2.CAP_DSHOW)
    if cap.isOpened():
        print(f"✅ Kamera {camera_index} berhasil dibuka dengan backend DSHOW.")
        return cap
    cap = cv2.VideoCapture(camera_index)
    if cap.isOpened():
        print(f"✅ Kamera {camera_index} berhasil dibuka dengan backend default.")
        return cap
    print(f"❌ Gagal membuka kamera {camera_index} dengan semua metode yang dicoba.")
    return None

def find_matching_box(label, center_x, center_y, used_ids, instance_labels):
    for existing_id, data in instance_labels.items():
        if existing_id in used_ids:
            continue
        existing_label, ex, ey, _ = existing_id.split('_')
        if existing_label != label:
            continue
        ex = int(ex)
        ey = int(ey)
        distance = ((center_x - ex) ** 2 + (center_y - ey) ** 2) ** 0.5
        if distance <= PROXIMITY_THRESHOLD:
            return existing_id
    return None

def generate_frames(classtype='None', usedModel='None', active_session_id=None, camera_index=0):
    global camera_in_use
    stop_stream_event.clear()
    if not active_session_id:
        return
    with camera_lock:
        if camera_in_use:
            return
        camera_in_use = True
    
    cap = open_camera_safely(camera_index)
    if not cap.isOpened():
        with camera_lock:
            camera_in_use = False
        yield (b'--frame\r\n'
               b'Content-Type: text/plain\r\n\r\n'
               b'Camera not found\r\n')
        return

    instance_labels = {}
    instance_counter = 0
    model = YOLO(f'models/{usedModel}.pt')
    class_names = model.names
    cooldown_interval = 5

    try:
        while not stop_stream_event.is_set():
            success, frame = cap.read()
            if not success:
                break
            frame = cv2.flip(frame, 1)
            results = model(frame, verbose=False)
            now = time.time()
            current_instances = set()
            used_ids = set()

            for box in results[0].boxes:
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                label = class_names[cls_id]
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                center_x = (x1 + x2) // 2
                center_y = (y1 + y2) // 2
                matched_box_id = find_matching_box(label, center_x, center_y, used_ids, instance_labels)
                if matched_box_id:
                    box_id = matched_box_id
                else:
                    box_id = f"{label}_{center_x}_{center_y}_{instance_counter}"
                    instance_counter += 1
                used_ids.add(box_id)
                current_instances.add(box_id)
                if box_id not in instance_labels:
                    instance_labels[box_id] = {'start_time': now, 'logged': False}
                
                instance_data = instance_labels[box_id]
                duration = now - instance_data['start_time']

                if not instance_data['logged'] and duration >= cooldown_interval:
                    timestamp = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
                    db_conn = None
                    try:
                        db_conn = db_pool.get_connection()
                        cursor = db_conn.cursor()
                        query = 'INSERT INTO logs (session_id, label, confidence, classtype, time) VALUES (%s, %s, %s, %s, %s)'
                        values = (active_session_id, label, round(conf * 100, 2), classtype, timestamp)
                        cursor.execute(query, values)
                        db_conn.commit()
                        cursor.close()
                        instance_data['logged'] = True
                        print(f"✅ Logged to MySQL: {label} untuk sesi {active_session_id}")
                    except Exception as e:
                        print(f"❌ Gagal log ke MySQL: {e}")
                    finally:
                        if db_conn and db_conn.is_connected():
                            db_conn.close()

                box_color = (0, 0, 255) if instance_data['logged'] else (0, 255, 0)
                text = f"{label}: {conf:.2%}"
                cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)
                cv2.putText(frame, text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, box_color, 2)

            for box_id in list(instance_labels.keys()):
                if box_id not in current_instances:
                    del instance_labels[box_id]
            _, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    except Exception as e:
        print(f"Terjadi error pada video stream: {e}")
    finally:
        print(f"🎥 Melepaskan kamera untuk stream sesi {active_session_id}.")
        cap.release()
        with camera_lock:
            camera_in_use = False

@app.route('/api/cameras/available')
def get_available_cameras():
    count = 0
    for i in range(10):
        cap = open_camera_safely(i)
        if cap:
            count += 1
            cap.release()
        else:
            break
    return jsonify({'count': count})

@app.route('/api/camera/stop', methods=['POST'])
def stop_camera_stream():
    print("🔴 Menerima sinyal untuk menghentikan stream kamera.")
    stop_stream_event.set()
    time.sleep(0.5) 
    return jsonify({'message': 'Sinyal untuk menghentikan stream telah dikirim.'}), 200

@app.route('/api/camera-status')
def camera_status():
    active_session_id = session.get("active_session_id")
    return jsonify({
        'camera_in_use': camera_in_use,
        'has_active_session': active_session_id is not None,
        'active_session_id': active_session_id
    })

@app.route('/video_feed/<classtype>/<int:camera_index>')
def video_feed(classtype, camera_index):
    if classtype == 'quiz':
        usedModel = "yolov8n"
    else:
        usedModel = 'disruption-best-v3'
    active_session_id = session.get("active_session_id")
    if not active_session_id:
        return "Sesi aktif tidak ditemukan.", 400
    return Response(
        generate_frames(classtype, usedModel, active_session_id, camera_index),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

@app.route('/api/logs/<session_id>', methods=['GET'])
def get_logs(session_id):
    db = get_db()
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
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT COUNT(id) FROM logs WHERE session_id = %s', (active_session_id,))
    count = cursor.fetchone()[0]
    cursor.close()
    return jsonify({'total': count})

@app.route('/api/sessions', methods=['POST'])
def create_session():
    data = request.json
    new_session = {
        "session_id": str(uuid.uuid4()),
        "session_name": data.get("session_name"),
        "date": datetime.now().strftime("%d %B %Y"),
        "time": datetime.now().strftime("%H.%M.%S"),
        "disruptionTotal": 0,
        "cheatingTotal": 0
    }
    db = get_db()
    cursor = db.cursor()
    query = 'INSERT INTO sessions (session_id, session_name, date, time, disruptionTotal, cheatingTotal) VALUES (%s, %s, %s, %s, %s, %s)'
    values = (new_session["session_id"], new_session["session_name"], new_session["date"], new_session["time"], new_session["disruptionTotal"], new_session["cheatingTotal"])
    cursor.execute(query, values)
    db.commit()
    cursor.close()
    session["active_session_id"] = new_session["session_id"]
    session.modified = True
    return jsonify(new_session), 201

@app.route('/api/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM sessions WHERE session_id = %s', (session_id,))
    session_found = cursor.fetchone()
    cursor.close()
    if not session_found:
        return jsonify({'message': 'Sesi tidak ditemukan'}), 404
    return jsonify({'session': session_found}), 200

@app.route('/api/active-session', methods=['GET'])
def get_active_session():
    active_id = session.get("active_session_id")
    if not active_id:
        return jsonify({'message': 'Tidak ada sesi aktif'}), 404
    db = get_db()
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
    db = get_db()
    cursor = db.cursor(dictionary=True)
    
    if 'disruptionTotal' in data:
        cursor.execute('UPDATE sessions SET disruptionTotal = %s WHERE session_id = %s', (data['disruptionTotal'], session_id))
    if 'cheatingTotal' in data:
        cursor.execute('UPDATE sessions SET cheatingTotal = %s WHERE session_id = %s', (data['cheatingTotal'], session_id))
    
    db.commit()
    
    cursor.execute('SELECT * FROM sessions WHERE session_id = %s', (session_id,))
    session_found = cursor.fetchone()
    cursor.close()
    
    if not session_found:
         return jsonify({'message': 'Sesi tidak ditemukan setelah update'}), 404
    
    return jsonify({'message': 'Sesi berhasil diperbarui', 'session': session_found}), 200

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM sessions ORDER BY date DESC, time DESC')
    sessions_list = cursor.fetchall()
    cursor.close()
    return jsonify(sessions_list)

@app.route('/api/session/end', methods=['POST'])
def end_session():
    active_session_id = session.pop("active_session_id", None)
    print(f"🛑 Sesi diakhiri: {active_session_id}")
    stop_stream_event.set() 
    return jsonify({
        'message': 'Sesi aktif telah diakhiri',
        'session_id': active_session_id
    }), 200

@app.route('/api/debug-session')
def debug_session():
    return jsonify(dict(session))

@app.route('/logout')
def logout():
    session.clear()
    stop_stream_event.set() 
    return "Session cleared!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
from flask import Flask, request, jsonify, Response, session
from flask_cors import CORS
import cv2
from ultralytics import YOLO
from datetime import datetime
import time
import uuid

logs_storage = []
sessions_storage = []

app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.3:3000"])

# Session default Flask cukup ini:
app.secret_key = "rahasia_ku"  # ganti dengan secret key aman

app.config.update(
    SESSION_COOKIE_SAMESITE="None",
    SESSION_COOKIE_SECURE=True,  # karena development belum pakai HTTPS
)

# Variabel global untuk semua user (model kamera, dsb.)
cap = cv2.VideoCapture(0)
PROXIMITY_THRESHOLD = 500
instance_labels = {}
instance_counter = 0

def find_matching_box(label, center_x, center_y, used_ids):
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

def generate_frames(classtype='None', usedModel='None', active_session_id=None):
    if not active_session_id:
        return
    
    global instance_counter, instance_labels
    instance_labels = {}
    instance_counter = 0

    model = YOLO(f'models/{usedModel}.pt')
    class_names = model.names
    cooldown_interval = 5

    while True:
        success, frame = cap.read()
        if not success:
            print("❌ Gagal membaca frame dari kamera.")
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

            matched_box_id = find_matching_box(label, center_x, center_y, used_ids)
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
                logs_storage.append({
                    'session_id': active_session_id,
                    'label': label,
                    'confidence': round(conf * 100, 2),
                    'classtype': classtype,
                    'time': timestamp
                })
                instance_data['logged'] = True

            box_color = (0, 0, 255) if instance_data['logged'] else (0, 255, 0)
            text = f"{label}: {conf:.2%}"
            cv2.rectangle(frame, (x1, y1), (x2, y2), box_color, 2)
            cv2.putText(frame, text, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, box_color, 2)

        for box_id in list(instance_labels.keys()):
            if box_id not in current_instances:
                del instance_labels[box_id]

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

def find_session_by_id(session_id):
    return next((s for s in sessions_storage if s['session_id'] == session_id), None)

# ================= ROUTES =================
@app.route('/video_feed/<classtype>')
def video_feed(classtype):
    if classtype == 'quiz':
        usedModel = "cheating-best"
    else:
        usedModel = 'yolov8n'
    active_session_id = session.get("active_session_id")
    return Response(
        generate_frames(classtype, usedModel, active_session_id),
        mimetype='multipart/x-mixed-replace; boundary=frame'
    )

@app.route('/api/logs/<session_id>', methods=['GET'])
def get_logs(session_id):
    filtered_logs = [log for log in logs_storage if log.get('session_id') == session_id]
    return jsonify(filtered_logs)

@app.route('/api/total')
def total_count():
    active_session_id = session.get("active_session_id")
    if not active_session_id:
        return jsonify({'total': 0})

    count = sum(1 for log in logs_storage if log.get('session_id') == active_session_id)
    return jsonify({'total': count})


@app.route('/api/sessions', methods=['POST'])
def create_session():
    data = request.json
    new_session = {
        "session_id": str(uuid.uuid4()),
        "session_name": data.get("session_name"),
        "date": datetime.now().strftime("%d %B %Y"),
        "time": datetime.now().strftime("%H.%M.%S"),
        "theoryTotal": 0,
        "quizTotal": 0
    }
    session["active_session_id"] = new_session["session_id"]
    sessions_storage.append(new_session)
    session.modified = True
    return jsonify(new_session), 201

@app.route('/api/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    session_found = find_session_by_id(session_id)
    if not session_found:
        return jsonify({'message': 'Session not found'}), 404
    return jsonify({'session': session_found}), 200

@app.route('/api/active-session', methods=['GET'])
def get_active_session():
    active_id = session.get("active_session_id")
    if not active_id:
        return jsonify({'message': 'No active session'}), 404
    session_found = find_session_by_id(active_id)
    if not session_found:
        return jsonify({'message': 'Active session not found'}), 404
    return jsonify({'session': session_found}), 200

@app.route('/api/sessions/<session_id>', methods=['PATCH'])
def update_session_totals(session_id):
    data = request.get_json()
    session_found = find_session_by_id(session_id)
    if not session_found:
        return jsonify({'message': 'Session not found'}), 404

    if 'theoryTotal' in data:
        session_found['theoryTotal'] = data['theoryTotal']
    if 'quizTotal' in data:
        session_found['quizTotal'] = data['quizTotal']

    return jsonify({'message': 'Session updated successfully', 'session': session_found}), 200

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    return jsonify(session.get("sessions", []))

@app.route('/api/set-session/<session_id>', methods=['POST'])
def set_active_session(session_id):
    session["active_session_id"] = session_id
    return jsonify({'message': f'Active session set to {session_id}'}), 200

@app.route('/api/session/end', methods=['POST'])
def end_session():
    active_session_id = session.get("active_session_id")
    session.pop("active_session_id", None)
    return jsonify({
        'message': 'Active session ended',
        'session_id': active_session_id
    }), 200

@app.route('/api/set-monitor', methods=['POST'])
def set_monitor():
    data = request.get_json()
    session["active_monitor"] = data.get('status', False)
    return jsonify({'monitor_status': session["active_monitor"]}), 200

@app.route('/api/debug-session')
def debug_session():
    return jsonify(dict(session))

@app.route('/api/test-set-session')
def test_set_session():
    session['active_session_id'] = 'test-session-123'
    return jsonify({'message': 'test session set'})

@app.route('/logout')
def logout():
    session.clear()
    return "Session cleared!"

@app.route('/api/logs/all')
def get_all_logs():
    return jsonify(logs_storage)

@app.route('/api/sessions/all')
def get_all_sessions():
    return jsonify(sessions_storage)

print("Registered routes:")
for rule in app.url_map.iter_rules():
    print(rule)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)

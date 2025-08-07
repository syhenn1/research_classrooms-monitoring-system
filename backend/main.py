from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import cv2
from ultralytics import YOLO
from datetime import datetime
import time
import uuid
import threading

app = Flask(__name__)
CORS(app)

sessions = []
logs = []

active_session_id = None
active_monitor = False

log_interval = 5 
active_labels = {}
PROXIMITY_THRESHOLD = 500 

log_cooldowns = {} 
instance_labels = {} 
instance_counter = 0

cap = cv2.VideoCapture(0)

def find_matching_box(label, center_x, center_y, used_ids):
    for existing_id, data in instance_labels.items():
        if existing_id in used_ids:
            continue  # Skip already matched instances in current frame
        existing_label, ex, ey, _ = existing_id.split('_')
        if existing_label != label:
            continue
        ex = int(ex)
        ey = int(ey)
        distance = ((center_x - ex) ** 2 + (center_y - ey) ** 2) ** 0.5
        if distance <= PROXIMITY_THRESHOLD:
            return existing_id
    return None

def round_grid(value, grid_size):
    return int(grid_size * round(float(value)/grid_size))

def generate_frames(classtype='None',usedModel='None'):

    model = YOLO(f'models/{usedModel}.pt')
    class_names = model.names

    global active_session_id
    cooldown_interval = 5 

    while True:
        if active_session_id is None:
            break 

        success, frame = cap.read()
        if not success:
            print("❌ Gagal membaca frame dari kamera.")
            break

        frame = cv2.flip(frame, 1)
        results = model(frame, verbose=False)

        now = time.time()
        current_instances = set()

        global instance_counter
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
                # New instance detected → assign new unique ID
                box_id = f"{label}_{center_x}_{center_y}_{instance_counter}"
                instance_counter += 1

            used_ids.add(box_id)
            current_instances.add(box_id)

            if active_session_id:
                if box_id not in instance_labels:
                    instance_labels[box_id] = {
                        'start_time': now,
                        'logged': False
                    }

                instance_data = instance_labels[box_id]
                duration = now - instance_data['start_time']

                if not instance_data['logged'] and duration >= cooldown_interval:
                    timestamp = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
                    logs.append({
                        'session_id': active_session_id,
                        'label': label,
                        'confidence': round(conf * 100, 2),
                        'classtype': classtype,
                        'time': timestamp
                    })
                    instance_data['logged'] = True

            if box_id in instance_labels and instance_labels[box_id]['logged']:
                box_color = (0, 0, 255)  # RED
            else:
                box_color = (0, 255, 0)  # GREEN

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


@app.route('/video_feed/theory')
def video_feed():
    return Response(generate_frames('theory','yolov8n'), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed/quiz')
def video_feed_quiz():
    return Response(generate_frames('quiz','disruption-best-v3'), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/logs')
def get_logs():
    if not active_session_id:
        return jsonify([])

    filtered_logs = [log for log in logs if log['session_id'] == active_session_id]
    return jsonify(filtered_logs[-1000:])

@app.route ('/api/logs/all')
def get_all_logs():
    return jsonify(logs)

@app.route('/api/total')
def total_count():
    if not active_session_id:
        return jsonify({'total': 0})

    total = sum(1 for log in logs if log['session_id'] == active_session_id)
    return jsonify({'total': total})

@app.route('/api/active-session', methods=['GET'])
def get_active_session():
    if not active_session_id:
        return jsonify({'message': 'No active session', 'session': None}), 200

    active_session = next((s for s in sessions if s['session_id'] == active_session_id), None)
    return jsonify({'session': active_session}), 200

@app.route('/api/sessions', methods=['POST'])
def create_session():
    data = request.get_json()
    new_session = {
        'session_id': str(uuid.uuid4()),
        'session_name': data['session_name'],
        'time': data['time'],
        'date': data['date'],
        'theoryTotal': 0,
        'quizTotal': 0
    }
    sessions.append(new_session)
    return jsonify({
        'session_id': new_session['session_id'],
        'message': 'Session created successfully'
    }), 201

@app.route('/api/sessions/<session_id>', methods=['PATCH'])
def update_session_totals(session_id):
    data = request.get_json()
    session = next((s for s in sessions if s['session_id'] == session_id), None)

    if not session:
        return jsonify({'message': 'Session not found'}), 404

    # Update fields jika dikirim di request body
    if 'theoryTotal' in data:
        session['theoryTotal'] = data['theoryTotal']
    if 'quizTotal' in data:
        session['quizTotal'] = data['quizTotal']

    return jsonify({'message': 'Session updated successfully', 'session': session}), 200


@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    return jsonify(sessions)

@app.route('/api/set-session/<session_id>', methods=['POST'])
def set_active_session(session_id):
    global active_session_id
    active_session_id = session_id
    return jsonify({'message': f'Active session set to {session_id}'}), 200

@app.route('/api/session/end', methods=['POST'])
def end_session():
    global active_session_id
    active_session_id = None
    return jsonify({'message': 'Active session ended'}), 200

@app.route('/api/set-monitor', methods=['POST'])
def set_monitor():
    global active_monitor
    data = request.get_json()
    active_monitor = data.get('status', False)
    return jsonify({'monitor_status': active_monitor}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)


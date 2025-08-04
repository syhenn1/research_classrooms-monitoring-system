from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import cv2
from ultralytics import YOLO
from datetime import datetime
import time

app = Flask(__name__)
CORS(app)

# Global storage
sessions = []
logs = []
active_session_id = None

# YOLO Model
model = YOLO('models/yolov8n.pt')
class_names = model.names
cap = cv2.VideoCapture(0)

# Logging state
log_interval = 5  # seconds
active_labels = {}  # {label: {'start': timestamp, 'logged': bool}}

@app.route('/api/sessions', methods=['POST'])
def create_session():
    data = request.get_json()
    new_session = {
        'session_id': len(sessions) + 1,
        'session_name': data['session_name'],
        'date': data['date'],
        'lecturer': data['lecturer'],
        'subject': data['subject'],
        'class_name': data['class_name'],
        'room': data['room']
    }
    sessions.append(new_session)
    return jsonify({
        'session_id': new_session['session_id'],
        'message': 'Session created successfully'
    }), 201

@app.route('/api/sessions', methods=['GET'])
def get_sessions():
    return jsonify(sessions)

@app.route('/api/set-session/<int:session_id>', methods=['POST'])
def set_active_session(session_id):
    global active_session_id
    active_session_id = session_id
    return jsonify({'message': f'Active session set to {session_id}'}), 200

def generate_frames(classtype='None'):
    global active_session_id
    while True:
        success, frame = cap.read()
        if not success:
            break

        frame = cv2.flip(frame, 1)
        results = model(frame, verbose=False)

        now = time.time()
        detected_labels = set()

        for box in results[0].boxes:
            conf = float(box.conf[0])
            cls_id = int(box.cls[0])
            label = class_names[cls_id]
            detected_labels.add(label)

            x1, y1, x2, y2 = map(int, box.xyxy[0])
            text = f"{label}: {conf:.2%}"
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(frame, text, (x1, y1 - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

            # Logging to memory
            if active_session_id:
                if label not in active_labels:
                    active_labels[label] = {'start': now, 'logged': False}
                else:
                    duration = now - active_labels[label]['start']
                    if duration >= log_interval and not active_labels[label]['logged']:
                        timestamp = datetime.now().strftime('%Y-%m-%dT%H:%M:%S')
                        logs.append({
                            'session_id': active_session_id,
                            'label': label,
                            'confidence': round(conf * 100, 2),
                            'classtype': classtype,
                            'time': timestamp
                        })
                        active_labels[label]['logged'] = True

        # Remove labels not detected anymore
        for label in list(active_labels.keys()):
            if label not in detected_labels:
                del active_labels[label]

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed/theory')
def video_feed():
    return Response(generate_frames('theory'), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video_feed/quiz')
def video_feed_quiz():
    return Response(generate_frames('quiz'), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/logs')
def get_logs():
    if not active_session_id:
        return jsonify([])

    filtered_logs = [log for log in logs if log['session_id'] == active_session_id]
    return jsonify(filtered_logs[-30:])

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)



# from flask import Flask, Response, jsonify
# from flask_cors import CORS
# import cv2
# from ultralytics import YOLO
# from datetime import datetime
# from collections import defaultdict
# import mysql.connector
# from db_config import get_connection
# from app import create_app

# import time

# app = create_app()
# CORS(app)

# model = YOLO('models/yolov8n.pt')
# class_names = model.names
# cap = cv2.VideoCapture(0)

# logs = []
# log_interval = 5  # dalam detik
# active_labels = {}  # {label: {'start': timestamp, 'logged': bool}}
# total_counter = defaultdict(int)

# def generate_frames():
#     while True:
#         success, frame = cap.read()
#         if not success:
#             break

#         frame = cv2.flip(frame, 1)
#         results = model(frame, verbose=False)

#         now = time.time()
#         detected_labels = set()

#         for box in results[0].boxes:
#             conf = float(box.conf[0])
#             cls_id = int(box.cls[0])
#             label = class_names[cls_id]
#             detected_labels.add(label)

#             x1, y1, x2, y2 = map(int, box.xyxy[0])
#             text = f"{label}: {conf:.2%}"
#             cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
#             cv2.putText(frame, text, (x1, y1 - 10),
#                         cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

#             # Inisialisasi atau update waktu mulai label ini
#             if label not in active_labels:
#                 active_labels[label] = {'start': now, 'logged': False}
#             else:
#                 duration = now - active_labels[label]['start']
#                 if duration >= log_interval and not active_labels[label]['logged']:
#                     timestamp = datetime.now()
                    
#                     # # Simpan ke database
#                     # conn = get_connection()
#                     # cursor = conn.cursor()
#                     # cursor.execute(
#                     #     "INSERT INTO logs (label, confidence, timestamp) VALUES (%s, %s, %s)",
#                     #     (label, round(conf * 100, 2), timestamp)
#                     # )
#                     # conn.commit()
#                     # conn.close()

#                     logs.append({
#                         'label': label,
#                         'confidence': round(conf * 100, 2),
#                         'time': timestamp.strftime('%Y-%m-%dT%H:%M:%S')
#                     })
                    
#                     active_labels[label]['logged'] = True
#                     total_counter[label] += 1



#         # Hapus label yang tidak muncul lagi (reset)
#         for label in list(active_labels.keys()):
#             if label not in detected_labels:
#                 del active_labels[label]

#         _, buffer = cv2.imencode('.jpg', frame)
#         frame_bytes = buffer.tobytes()
#         yield (b'--frame\r\n'
#                b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

# @app.route('/video_feed')
# def video_feed():
#     return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

# @app.route('/api/logs')
# def get_logs():
#     return jsonify(logs[-30:])

# @app.route('/api/total')
# def total_count():
#     return jsonify({'total': len(logs)})


# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=8000)
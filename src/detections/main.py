from flask import Flask, Response, jsonify
from flask_cors import CORS
import cv2
from ultralytics import YOLO
from datetime import datetime
import time

app = Flask(__name__)
CORS(app)

model = YOLO('models/disruption-best-v2.pt')
class_names = model.names
cap = cv2.VideoCapture(0)

logs = []
log_interval = 5  # dalam detik
active_labels = {}  # {label: {'start': timestamp, 'logged': bool}}

def generate_frames():
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

            # Inisialisasi atau update waktu mulai label ini
            if label not in active_labels:
                active_labels[label] = {'start': now, 'logged': False}
            else:
                duration = now - active_labels[label]['start']
                if duration >= log_interval and not active_labels[label]['logged']:
                    logs.append({
                        'label': label,
                        'confidence': round(conf * 100, 2),
                        'time': datetime.now().strftime('%I:%M:%S %p')
                    })
                    active_labels[label]['logged'] = True

        # Hapus label yang tidak muncul lagi (reset)
        for label in list(active_labels.keys()):
            if label not in detected_labels:
                del active_labels[label]

        _, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/logs')
def get_logs():
    return jsonify(logs[-30:])

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)

from app import db
from datetime import datetime

class Session(db.Model):
    __tablename__ = 'sessions'
    session_id = db.Column(db.Integer, primary_key=True)
    session_name = db.Column(db.String(100), nullable=False)
    date = db.Column(db.Date, nullable=False)
    lecturer = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    class_name = db.Column(db.String(100), nullable=False)
    room = db.Column(db.String(50), nullable=False)

    logs = db.relationship('Log', backref='session', lazy=True)

class Log(db.Model):
    __tablename__ = 'logs'
    id = db.Column(db.Integer, primary_key=True)
    label = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float)
    time = db.Column(db.DateTime, default=datetime.utcnow)

    session_id = db.Column(db.Integer, db.ForeignKey('sessions.session_id'), nullable=False)

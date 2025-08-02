from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    
    # Config Database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:@localhost/monitoring_system'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Init Extensions
    db.init_app(app)
    migrate.init_app(app, db)

    from app import dbmodel

    return app

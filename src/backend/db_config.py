import mysql.connector

def get_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",  # ganti jika ada
        database="monitoring_system"
    )
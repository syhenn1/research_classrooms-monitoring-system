import mysql.connector
from mysql.connector import errorcode

DB_NAME = 'monitoring_system'

def create_database():
    try:
        cnx = mysql.connector.connect(user='root', password='')
        cursor = cnx.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} DEFAULT CHARACTER SET 'utf8'")
        print(f"Database `{DB_NAME}` checked/created successfully.")
        cursor.close()
        cnx.close()
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("Access denied: Check your username or password.")
        else:
            print(err)

if __name__ == "__main__":
    create_database()

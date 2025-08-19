import json
import sqlite3
from RSSUtils import DBFunctions

# Load configs
configs = json.load(open('config.json'))
CONTENT_DIR = configs['content_dir']
EXPIRE_TIME = configs['expire_time']
DB_NAME     = configs['db_name']

def setup_db():
    # Setup db if none exists
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS downloads (
            uid TEXT PRIMARY KEY,
            feed TEXT,
            title TEXT,
            release_date DATETIME,
            file_path TEXT,
            download_link TEXT,
            downloaded BOOLEAN,
            keep BOOLEAN DEFAULT False
        )
    ''')
    conn.commit()
    conn.close()

setup_db()

file = open('rss-links.json')
data = json.load(file)
DBFunctions.check_for_new(data, DB_NAME, EXPIRE_TIME, CONTENT_DIR)
DBFunctions.download_all_missing(DB_NAME)
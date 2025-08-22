import sys
import json
import sqlite3
from RSSUtils import DBFunctions

# This script acts essentially as the controller, taking arguments and calling functions defined in other files

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
            summary TEXT,
            file_path TEXT,
            download_link TEXT,
            downloaded BOOLEAN,
            keep BOOLEAN DEFAULT False
        )
    ''')
    conn.commit()
    conn.close()

setup_db()

# Do I add this to check_for_new or leave it here?
# TODO: Support adding new feeds while running
file = open('rss-links.json')
data = json.load(file)

if __name__ == "__main__":
    function_name = sys.argv[1]
    db_file_name = DB_NAME

    if function_name == "check_new":
        DBFunctions.check_new(data, DB_NAME, EXPIRE_TIME, CONTENT_DIR)

    elif function_name == "get_all_episodes":
        print(DBFunctions.get_all_episodes(DB_NAME))

    elif function_name == "download_all_missing":
        DBFunctions.download_all_missing(DB_NAME)

    elif function_name == "download":
        DBFunctions.download(DB_NAME, sys.argv[2])

    elif function_name == "delete":
        DBFunctions.delete(DB_NAME, sys.argv[2])

    elif function_name == "delete_expired":
        if len(sys.argv) == 2:
            DBFunctions.delete_expired(DB_NAME, EXPIRE_TIME)
        elif len(sys.argv) == 3:
            DBFunctions.delete_expired(DB_NAME, int(sys.argv[2]))
            
    elif function_name == "set_keep":
        episode_id = sys.argv[2]
        new_setting = False
        
        if sys.argv[3] == "True":
            new_setting = True
        elif sys.argv[3] != "False":
            print(f"new setting must be True or False (recieved {sys.argv[3]})")
            sys.exit(1)

        DBFunctions.set_keep(DB_NAME, episode_id, new_setting)
    
    elif function_name == "get_summary":
        episode_id = sys.argv[2]
        DBFunctions.get_summary(DB_NAME, episode_id)
    
    elif function_name == "get_config":
        DBFunctions.get_config(sys.argv[2])

    else:
        print(f"Error: Attempted to call unknown function '{function_name}'")
        sys.exit(1)
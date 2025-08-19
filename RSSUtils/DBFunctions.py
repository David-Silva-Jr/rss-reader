import sqlite3
import feedparser
import os
import requests
from datetime import datetime, timedelta
from dateutil import parser

# TODO: Find some way to get the runtime of the episode without downloading the whole episode
# rss_feed_data should be the array of feeds from rss-links
def check_for_new(rss_feed_data, db_file_name, expire_time, content_dir):
    conn = sqlite3.connect(db_file_name)
    cursor = conn.cursor()

    now = datetime.now().astimezone()
    # item is an individual item from rss-links
    for item in rss_feed_data:
        feed = feedparser.parse(item['link'])
        feed_name = feed['feed']['title']

        print(f"searching for new entries from {feed_name}...")
        for entry in feed['entries']:
            publish_date = parser.parse(entry['published'])
            episode_name = entry['title']
            # TODO: Store download_url encrypted in case there's auth data in the url
            download_url = entry['enclosures'][0]['href']
            
            # TODO: Find out if images are included in the mp3 metadata, get image from entry data if not
            # print(entry['image'])

            cursor.execute("SELECT uid FROM downloads WHERE uid = ?", [entry['id']])
            if cursor.fetchone() is None and publish_date > (now - timedelta(days = expire_time)):
                print(f"New entry found: {episode_name} ({entry['published']})")

                # clean up download url (they might have extra params or other data on them)
                base_url = download_url.split("?")[0]
                root, extension = os.path.splitext(base_url)

                file_path = os.path.join(content_dir, feed_name, episode_name + extension)
                db_data = (entry['id'], item['name'], episode_name, publish_date.isoformat(), file_path, download_url, False)

                cursor.execute("INSERT INTO downloads (uid, feed, title, release_date, file_path, download_link, downloaded) VALUES (?, ?, ?, ?, ?, ?, ?)", db_data)
        print()
    conn.commit()
    conn.close()

# TODO: Add check to make sure episode is not already downloaded first
def download_missing_episode(db_file_name, episode_id):
    conn = sqlite3.connect(db_file_name)
    cursor = conn.cursor()
    cursor.execute('SELECT file_path, download_link FROM downloads WHERE uid = ?', [episode_id])

    db_entry = cursor.fetchone()
    if db_entry is None:
        print(f"no episode found with id {episode_id}")
    else:
        directory, file_name = os.path.split(db_entry[0])
        download_url = db_entry[1]

        print(f"downloading {file_name}...")
        try:
            response = requests.get(download_url)
            response.raise_for_status()
        except requests.exceptions.HTTPError as err:
            print(f"Error getting {file_name}: {err}")
            conn.close()
            return

        os.makedirs(directory, exist_ok=True)
        with open(db_entry[0], 'wb') as f:
            f.write(response.content)

    cursor.execute('UPDATE downloads SET downloaded = True WHERE uid = ?', [episode_id])
    print("download complete")

    conn.commit()
    conn.close()


def download_all_missing(db_file_name):
    conn = sqlite3.connect(db_file_name)
    cursor = conn.cursor()

    cursor.execute('SELECT uid FROM downloads WHERE downloaded = FALSE')
    missing = cursor.fetchall()
    for entry in missing:
        download_missing_episode(db_file_name, entry[0])

def delete_episode(db_file_name, episode_id):
    conn = sqlite3.connect(db_file_name)
    cursor = conn.cursor()
    
    cursor.execute('SELECT file_path FROM downloads WHERE uid = ?', [episode_id])

    db_entry = cursor.fetchone()
    if db_entry is None:
        print(f"no episode found with id {episode_id}")
        conn.close()
        return

    file_path = db_entry[0]
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
        else:
            print(f"no file found at: {file_path}, deleting from db")
    except OSError as e:
        print(f"error deleting file {file_path}: {e}")
        conn.close()
        return

    cursor.execute('DELETE FROM downloads WHERE uid = ?', [episode_id])
    print(f"deleted episode with id {episode_id}")
    
    conn.commit()
    conn.close()

def delete_expired_episodes(db_file_name, expire_time):
    conn = sqlite3.connect(db_file_name)
    cursor = conn.cursor()
    cutoff = datetime.now() - timedelta(days = expire_time)

    cursor.execute("SELECT uid FROM downloads WHERE release_date < ? AND keep = False", [cutoff.isoformat()])
    old_files = cursor.fetchall()

    for entry in old_files:
        delete_episode(db_file_name, entry[0])

def set_keep(db_file_name, episode_id, new_keep_val):
    conn = sqlite3.connect(db_file_name)
    cursor = conn.cursor()

    cursor.execute("UPDATE downloads SET keep = ? WHERE uid = ?", new_keep_val, episode_id)
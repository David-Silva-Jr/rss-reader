import json
import feedparser
import requests
import os
import sqlite3
from datetime import datetime, timedelta

configs = json.load(open('config.json'))

def setup_db():
    conn = sqlite3.connect(configs['db_name'])
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS downloads (
            guid TEXT PRIMARY KEY,
            feed TEXT,
            title TEXT,
            file_path TEXT,
            release_date DATETIME
        )
    ''')
    conn.commit()
    conn.close()

def check_and_download():
    file = open('rss-links.json')
    data = json.load(file)

    conn = sqlite3.connect(configs['db_name'])
    cursor = conn.cursor()

    now = datetime.now()

    for item in data:
        print(f"Searching for new entries from {item['name']}...")
        feed = feedparser.parse(item['link'])
        for entry in feed['items']:
            publishDate = datetime.strptime(entry['published'], "%a, %d %b %Y %H:%M:%S %Z")

            cursor.execute("SELECT guid FROM downloads WHERE guid = ?", [entry['id']])
            if cursor.fetchone() is None and publishDate > (now - timedelta(days = configs['expire_time'])):
                print(f"New entry found: {entry['title']} ({entry['published']})")
                file_path = download(entry, item['name'])
                db_data = (entry['id'], item['name'], entry['title'], file_path, publishDate.isoformat())
                cursor.execute("INSERT INTO downloads (guid, feed, title, file_path, release_date) VALUES (?, ?, ?, ?, ?)", db_data)
        print()
    conn.commit()
    conn.close()

def delete_expired_entries():
    conn = sqlite3.connect(configs['db_name'])
    cursor = conn.cursor()
    cutoff = datetime.now() - timedelta(days = configs['expire_time'])

    cursor.execute("SELECT file_path FROM downloads WHERE release_date < ?", [cutoff.isoformat()])
    old_files = cursor.fetchall()

    for entry in old_files:
        file_path = entry[0]
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"deleted expired file: {file_path}")
        else:
            print(f"attempted to delete but no such file: {file_path}")

    cursor.execute("DELETE FROM downloads WHERE release_date < ?", [cutoff.isoformat()])
    conn.commit()
    conn.close()

def download(rss_entry, source):
    # TODO: Add handling for error cases, for example, ...['href'] doesn't exist, or os.path.splitext fails to get a file extension, etc.
    download_url = rss_entry['enclosures'][0]['href']
    response = requests.get(download_url)
    try:
        response.raise_for_status()
    except requests.exceptions.HTTPError as err:
        print(f"Error getting {rss_entry['title']}: {err}")
        return

    base_url = download_url.split("?")[0]
    root, extension = os.path.splitext(base_url)

    print("downloading...")
    os.makedirs(os.path.join(configs['content_dir'], source), exist_ok=True)
    file_path = os.path.join(configs['content_dir'], source, rss_entry['title'] + extension)
    with open(file_path, 'wb') as f:
        f.write(response.content)
    print("download complete")
    return file_path

setup_db()
check_and_download()
delete_expired_entries()
import sqlite3
import json
import os

def export_words_for_cloud():
    db_path = "../../server/prisma/dev.db"
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT id, text, partOfSpeech, phonetic, meanings, examples, category FROM Word")
        rows = cursor.fetchall()

        cloud_data = []
        for row in rows:
            # WeChat Cloud DB expects one JSON object per line for import
            word = {
                "id": row[0],
                "text": row[1],
                "partOfSpeech": row[2],
                "phonetic": row[3] if row[3] else "",
                "meanings": json.loads(row[4]) if row[4] else [],
                "examples": json.loads(row[5]) if row[5] else [],
                "category": row[6] or "GENERAL"
            }
            cloud_data.append(json.dumps(word, ensure_ascii=False))

        output_path = "words_export.json"
        with open(output_path, "w", encoding="utf-8") as f:
            f.write("\n".join(cloud_data))

        print(f"Successfully exported {len(cloud_data)} words to {output_path}")
        print("You can now import this file into the WeChat Cloud Database 'words' collection.")

    except Exception as e:
        print(f"Export failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    export_words_for_cloud()

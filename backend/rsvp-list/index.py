import json
import os
from urllib.parse import urlparse, unquote
import pg8000.native

def get_db():
    u = urlparse(os.environ['DATABASE_URL'])
    return pg8000.native.Connection(
        host=u.hostname,
        port=u.port or 5432,
        database=u.path.lstrip('/'),
        user=unquote(u.username),
        password=unquote(u.password),
    )

def handler(event: dict, context) -> dict:
    """Возвращает список всех ответов гостей из таблицы rsvp_responses."""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    conn = get_db()
    rows = conn.run(
        "SELECT id, name, attend, guests, wishes, created_at FROM rsvp_responses ORDER BY created_at DESC"
    )
    conn.close()

    result = [
        {
            'id': r[0],
            'name': r[1],
            'attend': r[2],
            'guests': r[3],
            'wishes': r[4],
            'created_at': r[5].isoformat() if r[5] else None,
        }
        for r in rows
    ]

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'responses': result}, ensure_ascii=False),
    }

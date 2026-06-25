import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from urllib.parse import urlparse, unquote
import pg8000.native

TO_EMAIL = "maksim.gusev.2003@bk.ru"

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
    """Получает RSVP-ответ гостя, сохраняет в БД и отправляет письмо на почту жениха."""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    name = body.get('name', '—')
    attend_raw = body.get('attend', 'yes')
    attend_label = 'Придёт ✅' if attend_raw == 'yes' else 'Не сможет ❌'
    guests = int(body.get('guests', 1))
    wishes = body.get('wishes', '')

    def esc(s):
        return str(s).replace("'", "''")

    conn = get_db()
    conn.run(
        f"INSERT INTO rsvp_responses (name, attend, guests, wishes) VALUES ('{esc(name)}', '{esc(attend_raw)}', {int(guests)}, '{esc(wishes)}')"
    )
    conn.close()

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
      <h2 style="color:#c0603a;border-bottom:2px solid #c0603a;padding-bottom:8px">
        💌 Новый ответ на приглашение
      </h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:10px 0;color:#888;width:140px">Гость</td>
            <td style="padding:10px 0;font-weight:bold">{name}</td></tr>
        <tr style="background:#f9f6f3"><td style="padding:10px;color:#888">Присутствие</td>
            <td style="padding:10px">{attend_label}</td></tr>
        <tr><td style="padding:10px 0;color:#888">Кол-во гостей</td>
            <td style="padding:10px 0">{guests}</td></tr>
        <tr style="background:#f9f6f3"><td style="padding:10px;color:#888">Пожелания</td>
            <td style="padding:10px">{wishes or '—'}</td></tr>
      </table>
      <p style="color:#aaa;font-size:12px;margin-top:24px">
        Приглашение Максима и Екатерины · 7 августа 2026
      </p>
    </div>
    """

    msg = MIMEMultipart('alternative')
    msg['Subject'] = f"RSVP: {name}"
    msg['From'] = os.environ['SMTP_USER']
    msg['To'] = TO_EMAIL
    msg.attach(MIMEText(html, 'html'))

    with smtplib.SMTP_SSL(os.environ['SMTP_HOST'], int(os.environ['SMTP_PORT'])) as server:
        server.login(os.environ['SMTP_USER'], os.environ['SMTP_PASSWORD'])
        server.sendmail(os.environ['SMTP_USER'], TO_EMAIL, msg.as_string())

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'ok': True}),
    }
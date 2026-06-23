import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

TO_EMAIL = "maksim.gusev.2003@bk.ru"

def handler(event: dict, context) -> dict:
    """Получает RSVP-ответ гостя и отправляет письмо на почту жениха."""
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    name = body.get('name', '—')
    attend = 'Придёт ✅' if body.get('attend') == 'yes' else 'Не сможет ❌'
    guests = body.get('guests', '1')
    wishes = body.get('wishes', '—')

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
      <h2 style="color:#c0603a;border-bottom:2px solid #c0603a;padding-bottom:8px">
        💌 Новый ответ на приглашение
      </h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:10px 0;color:#888;width:140px">Гость</td>
            <td style="padding:10px 0;font-weight:bold">{name}</td></tr>
        <tr style="background:#f9f6f3"><td style="padding:10px;color:#888">Присутствие</td>
            <td style="padding:10px">{attend}</td></tr>
        <tr><td style="padding:10px 0;color:#888">Кол-во гостей</td>
            <td style="padding:10px 0">{guests}</td></tr>
        <tr style="background:#f9f6f3"><td style="padding:10px;color:#888">Пожелания</td>
            <td style="padding:10px">{wishes}</td></tr>
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

    smtp_host = os.environ['SMTP_HOST']
    smtp_port = int(os.environ['SMTP_PORT'])
    smtp_user = os.environ['SMTP_USER']
    smtp_pass = os.environ['SMTP_PASSWORD']

    with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, TO_EMAIL, msg.as_string())

    return {
        'statusCode': 200,
        'headers': cors,
        'body': json.dumps({'ok': True}),
    }

import os
import re
import json
import logging
from datetime import datetime
from flask import Flask, request, jsonify
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
import openai
from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv


# ENVIRONMENT & CONFIG SETUP
load_dotenv()  # Load variables from .env

app = Flask(__name__)
app.config.from_pyfile('config.py')


# LOGGING SETUP
logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)s | %(message)s')
logger = logging.getLogger('HospitalityAI')


# SERVICE INITIALIZATION
twilio_client = Client(app.config['TWILIO_ACCOUNT_SID'], app.config['TWILIO_AUTH_TOKEN'])
openai.api_key = app.config['OPENAI_API_KEY']

scheduler = BackgroundScheduler(daemon=True)
scheduler.start()


# MESSAGE TEMPLATES
MESSAGE_TEMPLATES = {
    'confirmation': "✅ Booking Confirmed\nRoom {room} blocked from {start} to {end}",
    'price_update': "💲 Price Updated\nRoom {room} set to ₹{price} on {date}",
    'checkin': "🔑 Check-in Instructions\nCode: {code}\nMap: {map_url}",
    'error': "❌ Error\n{message}\nOur team is fixing this!"
}


# COMMAND PARSER
def parse_command(message):
    block_pattern = r"block room (\d+) from (.+?) to (.+)"
    price_pattern = r"set price to ₹?(\d+) on (.+)"

    if match := re.search(block_pattern, message, re.IGNORECASE):
        return {
            'command': 'block_room',
            'room': match.group(1),
            'from': match.group(2),
            'to': match.group(3)
        }

    if match := re.search(price_pattern, message, re.IGNORECASE):
        return {
            'command': 'set_price',
            'room': 'all',
            'price': match.group(1),
            'date': match.group(2)
        }

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Convert hotel commands to JSON. Output ONLY JSON."},
                {"role": "user", "content": message}
            ],
            max_tokens=150
        )
        return json.loads(response.choices[0].message['content'])
    except Exception as e:
        logger.error(f"NLP fallback failed: {str(e)}")
        raise ValueError("Couldn't understand your command. Please try again.")


# SIMULATED DATABASE LOGGER
def save_command(command):
    logger.info(f"Simulated DB Save: {command}")


# WHATSAPP SENDER
def send_whatsapp(to, template_name, **context):
    try:
        body = MESSAGE_TEMPLATES[template_name].format(**context)
        twilio_client.messages.create(
            body=body,
            from_='whatsapp:' + app.config['TWILIO_PHONE_NUMBER'],
            to='whatsapp:' + to
        )
        return True
    except Exception as e:
        logger.error(f"WhatsApp send failed: {str(e)}")
        return False


# DAILY BACKGROUND JOB

@scheduler.scheduled_job('cron', hour=8)
def send_daily_updates():
    logger.info("Daily update job ran (no actual work configured).")


# ROUTES
@app.route('/')
def home():
    return jsonify({"message": "✅ Hospitality AI is running!"}), 200

@app.route('/health')
def health_check():
    return jsonify({
        "status": "active",
        "services": {
            "scheduler": "running" if scheduler.running else "stopped",
            "database": "disabled"
        }
    }), 200

@app.route('/whatsapp', methods=['POST'])
def whatsapp_webhook():
    try:
        sender = request.form.get('From', '').split(':')[-1]
        message_body = request.form.get('Body', '').strip()

        logger.info(f"Incoming from {sender} > {message_body}")

        command = parse_command(message_body)
        save_command(command)

        if command['command'] == 'block_room':
            send_whatsapp(sender, 'confirmation', room=command['room'], start=command['from'], end=command['to'])
        elif command['command'] == 'set_price':
            send_whatsapp(sender, 'price_update', room=command['room'], price=command['price'], date=command['date'])

        resp = MessagingResponse()
        resp.message("✅ Command processed successfully.")
        return str(resp)

    except Exception as e:
        logger.exception("Processing error")
        if 'sender' in locals():
            send_whatsapp(sender, 'error', message=str(e))
        resp = MessagingResponse()
        resp.message("❌ Oops! Something went wrong.")
        return str(resp)


# RUN APP

if __name__ == '__main__':
    scheduler.add_job(send_daily_updates, 'cron', hour=8)
    app.run(
        host='0.0.0.0',
        port=app.config.get('PORT', 5000),
        debug=app.config.get('DEBUG', False),
        use_reloader=False
    )

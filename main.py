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

"""
Project Cubix
Hospitality AI WhatsApp Bot
Team: Yash, Krish, Devansh
"""

#ENVIRONMENT SETUP
load_dotenv()

app = Flask(__name__)
app.config['OPENAI_API_KEY'] = os.getenv("OPENAI_API_KEY")
app.config['TWILIO_ACCOUNT_SID'] = os.getenv("TWILIO_ACCOUNT_SID")
app.config['TWILIO_AUTH_TOKEN'] = os.getenv("TWILIO_AUTH_TOKEN")
app.config['TWILIO_PHONE_NUMBER'] = os.getenv("TWILIO_PHONE_NUMBER")
app.config['DEBUG'] = os.getenv("DEBUG", "False") == "True"
app.config['PORT'] = int(os.getenv("PORT", 5000))

# LOGGER SETUP
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s | %(message)s')
logger = logging.getLogger('CubixAssistant')

# API CLIENTS
twilio_bot = Client(app.config['TWILIO_ACCOUNT_SID'], app.config['TWILIO_AUTH_TOKEN'])
openai.api_key = app.config['OPENAI_API_KEY']

# BACKGROUND TASKS
cron_runner = BackgroundScheduler(daemon=True)
cron_runner.start()

# ========== WHATSAPP MESSAGE TEMPLATES ==========
REPLY_TEMPLATES = {
    'room_locked': "Hey! Room {room} is blocked from {start} to {end}. Enjoy your stay!",
    'rate_updated': "Rate set: Room {room} now costs ₹{price} on {date}",
    'entry_pass': "Your Check-in Code: {code}\nMap: {map_url}",
    'oops': "Something broke: {message}\nTeam CUBIX is on it."
}


# ========== MESSAGE PARSER ==========
def cubix_parse(message):
    """Yash handles command understanding here."""
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
        logger.exception("OpenAI fallback failed")
        raise ValueError("🤖 Couldn't understand your command. Try a simpler format.")


# ========== SIMULATED DB LOGGER ==========
def krish_log_command(data):
    logger.info(f"[Saved by Krish] Command logged: {data}")


# ========== MESSAGE DISPATCHER ==========
def devansh_notify_user(number, template, **details):
    try:
        msg = REPLY_TEMPLATES[template].format(**details)
        twilio_bot.messages.create(
            body=msg,
            from_='whatsapp:' + app.config['TWILIO_PHONE_NUMBER'],
            to='whatsapp:' + number
        )
        return True
    except Exception as e:
        logger.error(f"Devansh's message failed: {str(e)}")
        return False


# ========== DAILY JOB BY KRISH ==========
@cron_runner.scheduled_job('cron', hour=8)
def cubix_daily_job():
    logger.info("[Cron Job] Daily task ran. No operation defined yet.")


# ========== ROUTES ==========
@app.route('/ping')
def cubix_home():
    return jsonify({"msg": "Cubix Hospitality AI is Live!"}), 200


@app.route('/')
def homepage():
    return jsonify({"message": "🚀 Cubix Hospitality AI is running!", "status": "OK"}), 200


@app.route('/status')
def cubix_health():
    return jsonify({
        "status": "working",
        "modules": {
            "cron": "running" if cron_runner.running else "not running",
            "db": "simulated"
        }
    }), 200


@app.route('/whatsapp', methods=['POST'])
def cubix_whatsapp_webhook():
    try:
        sender = request.form.get('From', '').split(':')[-1]
        message_body = request.form.get('Body', '').strip()

        logger.info(f"Incoming from {sender} > {message_body}")

        command = cubix_parse(message_body)
        krish_log_command(command)

        if command['command'] == 'block_room':
            devansh_notify_user(sender, 'room_locked', room=command['room'], start=command['from'], end=command['to'])
        elif command['command'] == 'set_price':
            devansh_notify_user(sender, 'rate_updated', room=command['room'], price=command['price'],
                                date=command['date'])

        resp = MessagingResponse()
        resp.message("✅ Command processed successfully.")
        return str(resp)

    except Exception as e:
        logger.exception("❌ Processing error")
        if 'sender' in locals():
            devansh_notify_user(sender, 'oops', message=str(e))
        resp = MessagingResponse()
        resp.message("❌ Something went wrong.")
        return str(resp)


# ========== RUN SERVER ==========
if __name__ == '__main__':
    cron_runner.add_job(cubix_daily_job, 'cron', hour=8)
    app.run(
        host='0.0.0.0',
        port=app.config.get('PORT', 5000),
        debug=app.config.get('DEBUG', False),
        use_reloader=False
    )

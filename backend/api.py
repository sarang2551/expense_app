from flask import Flask
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def home():
    return 'Hello, World!'

@app.route('/time')
def get_time():
    return f'The current time is: {datetime.now()}'
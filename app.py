from flask import Flask, request, jsonify, render_template
import joblib
import math
from collections import Counter
import pandas as pd

app = Flask(__name__, template_folder='templates')

scaler = joblib.load('models/scaler.joblib')
model = joblib.load('models/lr_model.joblib')

def contains_weak_patterns(password):
    pwd_lower = password.lower()
    weak_substrings = ['123', '1234', 'password', 'qwerty', 'admin', 'abc']
    return any(sub in pwd_lower for sub in weak_substrings)

def get_crack_time(password):
    pool = 0
    if any(c.islower() for c in password): pool += 26
    if any(c.isupper() for c in password): pool += 26
    if any(c.isdigit() for c in password): pool += 10
    if any(not c.isalnum() for c in password): pool += 32

    if pool == 0 or len(password) == 0:
        return "Instantly"

    combinations = pool ** len(password)
    guesses_per_second = 100_000_000_000
    seconds = combinations / guesses_per_second

    if seconds < 1: return "Instantly"
    elif seconds < 60: return f"{int(seconds)} seconds"
    elif seconds < 3600: return f"{int(seconds/60)} minutes"
    elif seconds < 86400: return f"{int(seconds/3600)} hours"
    elif seconds < 31536000: return f"{int(seconds/86400)} days"
    elif seconds < 3153600000: return f"{int(seconds/31536000)} years"
    else: return "Centuries"

def extract_features(password):
    length = len(password)
    lower = sum(1 for c in password if c.islower())
    upper = sum(1 for c in password if c.isupper())
    digits = sum(1 for c in password if c.isdigit())
    special = length - (lower + upper + digits)

    entropy = 0
    if length > 0:
        counts = Counter(password)
        for count in counts.values():
            p = count / length
            entropy -= p * math.log2(p)

    return pd.DataFrame([[length, lower, upper, digits, special, entropy]],
                        columns=['length', 'lowercase_count', 'uppercase_count', 'digit_count', 'special_count', 'entropy'])

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    password = data.get('password', '')

    if not password:
        return jsonify({'error': 'No password provided'})

    if contains_weak_patterns(password):
        return jsonify({
            'strength': 0, 
            'feedback': 'Contains common sequence',
            'crack_time': get_crack_time(password)
        })

    features = extract_features(password)
    features_scaled = scaler.transform(features)
    prediction = model.predict(features_scaled)[0]

    return jsonify({
        'strength': int(prediction), 
        'feedback': 'AI Analyzed',
        'crack_time': get_crack_time(password)
    })

if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask, request, jsonify, render_template
from zxcvbn import zxcvbn
import re

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    password = data.get('password', '')

    if not password:
        return jsonify({'strength': 0, 'crack_time': '', 'meets_requirements': False})
    results = zxcvbn(password)
    z_score = results['score']


    length_ok = len(password) >= 8
    case_ok = bool(re.search(r'(?=.*[a-z])(?=.*[A-Z])', password))
    number_ok = bool(re.search(r'\d', password))
    symbol_ok = bool(re.search(r'[^A-Za-z0-9]', password))
    
    meets_all_requirements = length_ok and case_ok and number_ok and symbol_ok

    is_common_pattern = bool(re.match(r'^[a-zA-Z]+[@#!$%^&*][0-9]+$', password)) or 'name' in password.lower()
    if is_common_pattern or not length_ok:
        strength_score = 0
    elif meets_all_requirements and z_score >= 3:
        strength_score = 2  
    else:
        strength_score = 1  

    crack_time = results['crack_times_display']['offline_fast_hashing_1e10_per_second']

    return jsonify({
        'strength': strength_score,
        'crack_time': crack_time
    })

if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, request, jsonify, render_template
from zxcvbn import zxcvbn

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    password = data.get('password', '')

    if not password:
        return jsonify({'strength': 0, 'crack_time': '', 'feedback': ''})

    results = zxcvbn(password)
    
    z_score = results['score']
    if z_score <= 1:
        strength_score = 0
    elif z_score == 2:
        strength_score = 1
    else:
        strength_score = 2

    crack_time = results['crack_times_display']['offline_fast_hashing_1e10_per_second']
    
    warning = results['feedback']['warning']
    suggestions = results['feedback']['suggestions']
    
    if warning:
        feedback_text = warning
    elif suggestions:
        feedback_text = suggestions[0]
    else:
        feedback_text = "Looking good"

    return jsonify({
        'strength': strength_score,
        'crack_time': crack_time,
        'feedback': feedback_text
    })

if __name__ == '__main__':
    app.run(debug=True)
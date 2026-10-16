async function checkStrength() {
    const password = document.getElementById('pwdInput').value;
    const resultDiv = document.getElementById('result');
    const progressFill = document.getElementById('progress-bar');
    const feedbackText = document.getElementById('feedback-text');

    if (password.length === 0) {
        resultDiv.innerHTML = "";
        progressFill.style.width = "0%";
        feedbackText.innerHTML = "";
        return;
    }

    const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: password})
    });

    const data = await response.json();
    if (data.feedback === 'AI Analyzed') {
        feedbackText.innerHTML = "";
    } else {
        feedbackText.innerHTML = data.feedback;
    }

    if (data.strength === 0) {
        resultDiv.innerHTML = "🔴 Weak";
        resultDiv.style.color = "#ef4444";
        progressFill.style.width = "33%";
        progressFill.style.backgroundColor = "#ef4444";
        progressFill.style.boxShadow = "0 0 10px #ef4444";
    } else if (data.strength === 1) {
        resultDiv.innerHTML = "🟡 Medium";
        resultDiv.style.color = "white";
        progressFill.style.width = "66%";
        progressFill.style.backgroundColor = "#eab308";
        progressFill.style.boxShadow = "0 0 10px #eab308";
    } else if (data.strength === 2) {
        resultDiv.innerHTML = "🟢 Strong";
        resultDiv.style.color = "white";
        progressFill.style.width = "100%";
        progressFill.style.backgroundColor = "#22c55e";
        progressFill.style.boxShadow = "0 0 10px #22c55e";
    }
    
}
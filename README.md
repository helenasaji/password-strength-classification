# 🔐 AI Password Strength Classifier
A machine learning-powered web application that analyzes password strength in real-time. Developed as a final-year BCA minor project, this tool combines a custom mathematical feature-engineering pipeline with a lightweight Flask backend and a modern Glassmorphism user interface.

## 📸 Application Preview

**Catching Common/Weak Passwords:**
![Weak Password Demo](images/demo-weak.png)

**Evaluating Medium Passwords:**
![Medium Password Demo](images/demo-medium.png)

**Validating Strong Passwords:**
![Strong Password Demo](images/demo-strong.png)

## ✨ Features
* **Real-Time AI Analysis:** Grades passwords instantly as you type.
* **Mathematical Feature Engineering:** Calculates Shannon entropy, character distribution, and string length dynamically.
* **Heuristic Override:** Intercepts common human-error patterns (e.g., dictionary words, sequential numbers) before they reach the AI, covering dataset blind spots.
* **Modern UI/UX:** Built with a responsive, dark-mode Glassmorphism design and an interactive glowing progress bar.

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend:** Python, Flask
* **Machine Learning:** Scikit-Learn, Pandas, Joblib
* **Deployment:** Vercel

## 🧠 Machine Learning Approach
This project utilized a dataset of 240,000 passwords uniformly distributed across Weak, Medium, and Strong classifications. 

During the Data Science phase, two models were trained and evaluated:
1. **Random Forest Classifier:** Achieved 100% accuracy.
2. **Logistic Regression:** Achieved 100% accuracy.

**Model Selection:** While Random Forest is highly robust, Logistic Regression was explicitly chosen for the final production deployment. Because the engineered features (entropy, length, character counts) established clear, linear mathematical thresholds, Logistic Regression achieved a perfect score with a significantly smaller memory footprint and faster inference time, making it the optimal choice for a web API.

## Project Structure
```text
password_strength_classification/
├── data/
│   └── processed/engineered_passwords.csv
├── images/
│   ├── demo-medium.jpg
│   ├── demo-strong.jpg
│   └── demo-weak.jpg
├── models/
│   ├── lr_model.joblib
│   └── scaler.joblib
├── notebooks/
│   ├── 01_data_exploration.ipynb
│   └── 02_model_training.ipynb
├── static/
│   ├── script.js
│   └── style.css
├── templates/
│   └── index.html
├── app.py
├── requirements.txt
└── vercel.json
```

## 👩‍💻 Author
Helena Saji

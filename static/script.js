const passwordInput = document.getElementById("pwdInput");
const resultText = document.getElementById("result");
const feedbackText = document.getElementById("feedback-text");
const progressFill = document.getElementById("progress-bar");
const percentText = document.getElementById("percent");
const togglePassword = document.getElementById("togglePassword");
const crackTimeText = document.getElementById("crack-time");
let latestRequest = 0;

togglePassword.addEventListener("click", function () {
  const isVisible = passwordInput.type === "text";
  passwordInput.type = isVisible ? "password" : "text";
  togglePassword.textContent = isVisible ? "SHOW" : "HIDE";
});

async function checkStrength() {
  const password = passwordInput.value;
  const requestId = ++latestRequest;

  if (password.length === 0) {
    resultText.textContent = "WAITING";
    resultText.style.color = "#f0f0f0"; /* Soft White */
    feedbackText.textContent = "Tips will appear here...";
    crackTimeText.textContent = "";
    progressFill.style.width = "0%";
    progressFill.style.background = "#423738"; /* Iron Wash */
    percentText.textContent = "0%";
    return;
  }


  if (password.includes(" ")) {
    resultText.textContent = "INVALID";
    resultText.style.color = "#828384"; /* Steel */
    feedbackText.textContent = "Spaces are not allowed in this password.";
    crackTimeText.textContent = "";
    progressFill.style.width = "0%";
    progressFill.style.background = "#423738"; /* Iron Wash */
    percentText.textContent = "—";
    return;
  }

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        password: password
      })
    });

    if (!response.ok) {
      throw new Error("Prediction request failed.");
    }
    const data = await response.json();
    
    if (requestId !== latestRequest) {
      return;
    }
    const strengthLevels = {
      0: {
        label: "WEAK",
        color: "#474747", /* Graphite*/
        width: "33%",
        percent: "33%"
      },
      1: {
        label: "MEDIUM",
        color: "#828384", /* Steel colour*/
        width: "66%",
        percent: "66%"
      },
      2: {
        label: "STRONG",
        color: "#af50ff", /* Violet colour*/
        width: "100%",
        percent: "100%"
      }
    };

    const level = strengthLevels[data.strength];

    if (!level) {
      throw new Error("Invalid strength classification.");
    }
    
    resultText.textContent = level.label;
    resultText.style.color = level.color;
    progressFill.style.width = level.width;
    progressFill.style.background = level.color;
    percentText.textContent = level.percent;
    
    feedbackText.textContent = data.feedback === "AI Analyzed" ? "" : (data.feedback || "");
    
    if (data.crack_time === "Instantly") {
      crackTimeText.textContent = "Cracked instantly";
    } else {
      crackTimeText.textContent = `Estimated time to crack: ${data.crack_time}`;
    }

  } catch (error) {
    if (requestId !== latestRequest) {
      return;
    }
    resultText.textContent = "ERROR";
    resultText.style.color = "#828384"; /* Steel colour*/
    feedbackText.textContent = "Please make sure your Python server is running.";
    progressFill.style.width = "0%";
    progressFill.style.background = "#423738";  /* Iron wash*/
    percentText.textContent = "—";

    console.error("Password analysis error:", error);
  }
}

passwordInput.addEventListener("input", checkStrength);

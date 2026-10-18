const passwordInput = document.getElementById("pwdInput");
const resultText = document.getElementById("result");
const feedbackText = document.getElementById("feedback-text");
const progressFill = document.getElementById("progress-bar");
const percentText = document.getElementById("percent");
const progressContainer = document.querySelector(".progress-container");
const togglePassword = document.getElementById("togglePassword");
const crackTimeText = document.getElementById("crack-time");
let latestRequest = 0;
togglePassword.addEventListener("click", function () {
  const isVisible = passwordInput.type === "text";
  passwordInput.type = isVisible ? "password" : "text";
  togglePassword.setAttribute(
    "aria-label",
    isVisible ? "Show password" : "Hide password"
  );
});
async function checkStrength() {
  const password = passwordInput.value;
  const requestId = ++latestRequest;
  if (password.length === 0) {
    resultText.textContent = "Tips will appear here...";
    resultText.style.color = "#aebfe9";
    feedbackText.textContent = "";
    crackTimeText.textContent = "";
    progressFill.style.width = "0%";
    progressFill.style.background = "linear-gradient(90deg, #df4ecb, #5d63ff)";
    percentText.textContent = "0%";
    progressContainer.setAttribute("aria-valuenow", "0");
    return;
  }

  if (password.includes(" ")) {
    resultText.textContent = "⚠️ Invalid Input";
    resultText.style.color = "#ff626f";
    feedbackText.textContent = "Spaces are not allowed in this password.";
    crackTimeText.textContent = "";
    
    progressFill.style.width = "0%";
    progressFill.style.background = "#ff626f";
    
    percentText.textContent = "—";
    progressContainer.setAttribute("aria-valuenow", "0");
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
        label: "🔴 Weak",
        color: "#ff626f",
        width: "33%",
        percent: "33%"
      },
      1: {
        label: "🟡 Medium",
        color: "#ffb84d",
        width: "66%",
        percent: "66%"
      },
      2: {
        label: "🟢 Strong",
        color: "#22c55e",
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

    progressContainer.setAttribute("aria-valuenow", level.percent.replace("%", ""));
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
    resultText.textContent = "Unable to analyze right now";
    resultText.style.color = "#ffb84d";
    feedbackText.textContent = "Please make sure your Python server is running and the /predict endpoint is available.";

    progressFill.style.width = "0%";
    percentText.textContent = "—";
    progressContainer.setAttribute("aria-valuenow", "0");

    console.error("Password analysis error:", error);
  }
}
passwordInput.addEventListener("input", checkStrength);

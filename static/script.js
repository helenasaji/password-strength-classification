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
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePassword.setAttribute("aria-label", "Hide password");
    togglePassword.setAttribute("aria-pressed", "true");
  } else {
    passwordInput.type = "password";
    togglePassword.setAttribute("aria-label", "Show password");
    togglePassword.setAttribute("aria-pressed", "false");
  }
});

function updateProgress(width, color, percent) {
  progressFill.style.width = width;
  progressFill.style.background = color;
  percentText.textContent = percent;
  progressContainer.setAttribute(
    "aria-valuenow",
    percent === "—" ? "0" : percent.replace("%", "")
  );
}

function resetInterface() {
  resultText.textContent = "Tips will appear here...";
  resultText.style.color = "#a09aaf";
  feedbackText.textContent = "";
  crackTimeText.textContent = "";
  updateProgress("0%", "linear-gradient(90deg, #b6a2ff, #7047ff)", "0%");
}

async function checkStrength() {
  const password = passwordInput.value;
  const requestId = ++latestRequest;

  if (password.length === 0) {
    resetInterface();
    return;
  }

  if (password.includes(" ")) {
    resultText.textContent = "⚠️ Invalid Input";
    resultText.style.color = "#ff626f";
    feedbackText.textContent = "Spaces are not allowed in this password.";
    crackTimeText.textContent = "";
    updateProgress("0%", "#ff626f", "—");
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

    updateProgress(level.width, level.color, level.percent);

    feedbackText.textContent = data.feedback === "AI Analyzed" ? "" : (data.feedback || "");

    if (data.crack_time === "Instantly") {
      crackTimeText.textContent = "Cracked instantly";
    } else if (data.crack_time) {
      crackTimeText.textContent = `Estimated time to crack: ${data.crack_time}`;
    } else {
      crackTimeText.textContent = "";
    }

  } catch (error) {
    if (requestId !== latestRequest) {
      return;
    }

    resultText.textContent = "Unable to analyze right now";
    resultText.style.color = "#ffb84d";
    feedbackText.textContent = "Please make sure your Python server is running and the /predict endpoint is available.";
    crackTimeText.textContent = "";
    updateProgress("0%", "#ffb84d", "—");
    console.error("Password analysis error:", error);
  }
}

passwordInput.addEventListener("input", checkStrength);
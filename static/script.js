function resetInterface() {
  resultText.textContent = "Tips";
  resultText.style.color = "var(--text-white)";
  resultText.style.backgroundColor = "transparent"; 
  feedbackText.textContent = "";
  crackTimeText.textContent = "";
  updateProgress("0%", "var(--accent-color)", "0%");
}

async function checkStrength() {
  const password = passwordInput.value;
  const requestId = ++latestRequest;

  if (password.length === 0) {
    resetInterface();
    return;
  }

  if (password.includes(" ")) {
    resultText.textContent = "Invalid Input";
    resultText.style.color = "#ff626f";
    resultText.style.backgroundColor = "rgba(255, 98, 111, 0.15)";
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
        label: "Weak",
        color: "#ff626f",
        bgColor: "rgba(255, 98, 111, 0.15)", 
        width: "33%",
        percent: "33%"
      },
      1: {
        label: "Medium",
        color: "#ffb84d",
        bgColor: "rgba(255, 184, 77, 0.15)", 
        width: "66%",
        percent: "66%"
      },
      2: {
        label: "Strong",
        color: "#22c55e",
        bgColor: "rgba(34, 197, 94, 0.15)", 
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
    resultText.style.backgroundColor = level.bgColor;

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

    resultText.textContent = "Unable to analyze";
    resultText.style.color = "#ffb84d";
    resultText.style.backgroundColor = "rgba(255, 184, 77, 0.15)";
    feedbackText.textContent = "Please make sure your Python server is running and the /predict endpoint is available.";
    crackTimeText.textContent = "";
    updateProgress("0%", "#ffb84d", "—");
    console.error("Password analysis error:", error);
  }
}

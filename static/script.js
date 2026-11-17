const passwordInput = document.getElementById("pwdInput");
const resultText = document.getElementById("result");
const feedbackText = document.getElementById("feedback-text");
const progressFill = document.getElementById("progress-bar");
const percentText = document.getElementById("percent");
const progressContainer = document.querySelector(".progress-container");
const togglePassword = document.getElementById("togglePassword");
const crackTimeText = document.getElementById("crack-time");
const shieldGraphic = document.querySelector(".shield-foreground-img");

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

function updateChecklist(password) {
  const lengthCheck = document.getElementById("check-length");
  const checkCase = document.getElementById("check-case");
  const numberCheck = document.getElementById("check-number");
  const symbolCheck = document.getElementById("check-symbol");

  if(lengthCheck && checkCase && numberCheck && symbolCheck) {
    password.length >= 8 ? lengthCheck.classList.add("valid") : lengthCheck.classList.remove("valid");
    (/(?=.*[a-z])(?=.*[A-Z])/.test(password)) ? checkCase.classList.add("valid") : checkCase.classList.remove("valid");
    /\d/.test(password) ? numberCheck.classList.add("valid") : numberCheck.classList.remove("valid");
    /[^A-Za-z0-9]/.test(password) ? symbolCheck.classList.add("valid") : symbolCheck.classList.remove("valid");
  }
}

function resetInterface() {
  resultText.textContent = "Tips";
  resultText.style.color = "var(--text-white)";
  resultText.style.backgroundColor = "transparent"; 
  feedbackText.innerHTML = "Start typing to see security tips.";
  crackTimeText.textContent = "";
  updateProgress("0%", "var(--accent-color)", "0%");
  updateChecklist("");
  if (shieldGraphic) shieldGraphic.classList.remove("shield-strong-glow");
}

function getSmartTips(password, strength) {
  if (password.length === 0) return "Start typing to see security tips.";
  
  let tips = [];
  let heading = "";

  if (strength === 0) {
    heading = `<span class="weak-heading">Too predictable!</span>`;
    tips.push("Avoid predictable sequences or common patterns.");
    tips.push("Try a longer, unique passphrase.");
  } else if (strength === 1) {
    tips.push("Consider increasing the password length and adding symbols.");
  } else if (strength === 2) {
    tips.push("Good! Your password is secure.");
  }

  return heading + `<ul>` + tips.map(tip => `<li>${tip}</li>`).join('') + `</ul>`;
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
    feedbackText.innerHTML = "Spaces are not allowed in this password.";
    crackTimeText.textContent = "";
    updateProgress("0%", "#ff626f", "—");
    if (shieldGraphic) shieldGraphic.classList.remove("shield-strong-glow");
    return;
  }

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password })
    });

    if (!response.ok) throw new Error("Prediction request failed.");

    const data = await response.json();
    if (requestId !== latestRequest) return;

    const strengthLevels = {
      0: { label: "Weak", color: "#ff626f", bgColor: "rgba(255, 98, 111, 0.15)", width: "33%", percent: "33%" },
      1: { label: "Medium", color: "#ffb84d", textColor: "#f97316", bgColor: "rgba(249, 115, 22, 0.15)", width: "66%", percent: "66%" },
      2: { label: "Strong", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.15)", width: "100%", percent: "100%" }
    };

    const level = strengthLevels[data.strength];

    resultText.textContent = level.label;
    resultText.style.color = level.textColor || level.color;
    resultText.style.backgroundColor = level.bgColor;

    updateProgress(level.width, level.color, level.percent);

    if (shieldGraphic) {
      if (data.strength === 2) {
        shieldGraphic.classList.add("shield-strong-glow");
      } else {
        shieldGraphic.classList.remove("shield-strong-glow");
      }
    }

    feedbackText.innerHTML = getSmartTips(password, data.strength);
    crackTimeText.textContent = data.crack_time === "Instantly" ? "Cracked instantly" : `Estimated time to crack: ${data.crack_time}`;

  } catch (error) {
    if (requestId !== latestRequest) return;
    console.error("Error:", error);
  }
}

passwordInput.addEventListener("input", function() {
  checkStrength();
  updateChecklist(passwordInput.value);
});

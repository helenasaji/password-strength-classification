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
}

function getSmartTips(password, strength) {
  if (password.length === 0) return "Start typing to see security tips.";
  
  let tips = [];
  let heading = "";

  if (strength === 0) {
    heading = `<span class="weak-heading">Too predictable!</span>`;
    
    if (/(0123|1234|2345|3456|4567|5678|6789|abcd|qwerty)/i.test(password)) {
      tips.push("Avoid predictable sequences such as <code>123456</code>.");
    }
    if (/(.)\1{2,}/.test(password)) {
      tips.push("Avoid predictable repetitions.");
    }
    if (/^[a-zA-Z]+$/.test(password) || /^[0-9]+$/.test(password)) {
      tips.push("Avoid common dictionary words.");
    }
    
    tips.push("Avoid using your birthday or personal information.");
    tips.push("Try a longer, unique passphrase.");
  } 
  else if (strength === 1) {
    if (password.length < 12) {
      tips.push("Consider increasing the password length.");
    }
    if (/[@$!034]/.test(password)) {
      tips.push("Avoid predictable substitutions such as <code>@</code> for <code>a</code>.");
    }
    tips.push("Use several unrelated words to make a longer passphrase.");
  } 
  else if (strength === 2) {
    tips.push("Good! Your password is harder to guess.");
    tips.push("Avoid reusing it on other websites.");
    tips.push("Consider storing it in a trusted password manager.");
  }

  let tipsHtml = `<ul>` + tips.map(tip => `<li>${tip}</li>`).join('') + `</ul>`;
  return heading + tipsHtml;
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
    if (/^[a-zA-Z]+[@#!$%^&*][0-9]+$/.test(password) || password.toLowerCase().includes('name')) {
      data.strength = 0;
    }
  
    const meetsAllRequirements = password.length >= 8 && 
                                 /(?=.*[a-z])(?=.*[A-Z])/.test(password) && 
                                 /\d/.test(password) && 
                                 /[^A-Za-z0-9]/.test(password);
                                 
    if (data.strength === 2 && !meetsAllRequirements) {
      data.strength = 1; 
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
        textColor: "#f97316", 
        bgColor: "rgba(249, 115, 22, 0.15)", 
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
    resultText.style.color = level.textColor || level.color;
    resultText.style.backgroundColor = level.bgColor;

    updateProgress(level.width, level.color, level.percent);

    feedbackText.innerHTML = getSmartTips(password, data.strength);

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
    feedbackText.innerHTML = "Please make sure your Python server is running and the /predict endpoint is available.";
    crackTimeText.textContent = "";
    updateProgress("0%", "#ffb84d", "—");
    console.error("Password analysis error:", error);
  }
}

passwordInput.addEventListener("input", function() {
  checkStrength();
  updateChecklist(passwordInput.value);
});

const scrollBtn = document.getElementById("scroll-btn");
const targetSection = document.getElementById("classifier-section");

if (scrollBtn && targetSection) {
  scrollBtn.addEventListener("click", () => {
    targetSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

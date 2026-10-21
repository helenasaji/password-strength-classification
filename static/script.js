
const canvas = document.getElementById("canvas");
const swatches = document.querySelectorAll(".swatch");

const fontToggle = document.getElementById("fontToggle");
const fontLabel = document.getElementById("fontLabel");
const typeAa = document.querySelector(".type-aa");
const heroTitle = document.querySelector(".hero-title");

const defaultAccent = "#7047ff";

/* Change the violet accent using the color palette */

swatches.forEach((swatch) => {
  swatch.addEventListener("click", () => {
    const selectedColor = swatch.dataset.color;

    // Update the active color
    swatches.forEach((item) => {
      item.classList.remove("active");
      item.removeAttribute("aria-pressed");
    });

    swatch.classList.add("active");
    swatch.setAttribute("aria-pressed", "true");

    // Update the interface accent
    canvas.style.setProperty(
      "--current-accent",
      selectedColor
    );

    // Update the title gradient
    heroTitle.style.background = `
      linear-gradient(
        180deg,
        ${selectedColor === "#0b0914" ? "#c7c0db" : selectedColor},
        #bba8ff 65%,
        #a38aff
      )
    `;

    heroTitle.style.webkitBackgroundClip = "text";
    heroTitle.style.backgroundClip = "text";
    heroTitle.style.webkitTextFillColor = "transparent";
  });
});

/* Switch the typography specimen */

let alternateFont = false;

fontToggle.addEventListener("click", () => {
  alternateFont = !alternateFont;

  if (alternateFont) {
    typeAa.style.fontFamily = "Georgia, serif";
    heroTitle.style.fontFamily = "Georgia, serif";

    fontLabel.textContent = "SERIF";
    fontToggle.setAttribute(
      "aria-label",
      "Switch to Geist typography"
    );
  } else {
    typeAa.style.fontFamily = '"Geist", sans-serif';
    heroTitle.style.fontFamily = '"Geist", sans-serif';

    fontLabel.textContent = "GEIST";
    fontToggle.setAttribute(
      "aria-label",
      "Switch to serif typography"
    );
  }
});

/* Initialize the default palette selection */

const initialSwatch = document.querySelector(
  '.swatch[data-color="#7047ff"]'
);

if (initialSwatch) {
  initialSwatch.setAttribute("aria-pressed", "true");
}

swatches.forEach((swatch) => {
  if (!swatch.hasAttribute("aria-pressed")) {
    swatch.setAttribute("aria-pressed", "false");
  }
});

canvas.style.setProperty("--current-accent", defaultAccent);

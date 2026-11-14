const currentDisplay = document.getElementById("current");
const previousDisplay = document.getElementById("previous");

let currentValue = "0";
let firstNumber = null;
let selectedOperation = null;
let shouldReset = false;

function updateDisplay() {
    currentDisplay.textContent = currentValue;
}

function enterNumber(number) {
    if (shouldReset) {
        currentValue = "0";
        shouldReset = false;
    }

    if (number === "." && currentValue.includes(".")) return;

    if (currentValue === "0" && number !== ".") {
        currentValue = number;
    } else {
        currentValue += number;
    }

    updateDisplay();
}

function selectOperation(operation) {
    firstNumber = Number(currentValue);
    selectedOperation = operation;
    previousDisplay.textContent = currentValue + " " + getSymbol(operation);
    shouldReset = true;
}

function getSymbol(operation) {
    const symbols = {
        add: "+",
        subtract: "−",
        multiply: "×",
        divide: "÷"
    };

    return symbols[operation] || "";
}

async function calculate() {
    if (selectedOperation === null) return;

    const secondNumber = Number(currentValue);

    try {
        const response = await fetch("/api/calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                a: firstNumber,
                b: secondNumber,
                operation: selectedOperation
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Calculation failed");
        }

        currentValue = String(data.result);
        previousDisplay.textContent =
            firstNumber + " " +
            getSymbol(selectedOperation) + " " +
            secondNumber + " =";

        selectedOperation = null;
        firstNumber = null;
        shouldReset = true;

    } catch (error) {
        currentValue = error.message;
        shouldReset = true;
    }

    updateDisplay();
}

function clearCalculator() {
    currentValue = "0";
    firstNumber = null;
    selectedOperation = null;
    shouldReset = false;
    previousDisplay.textContent = "";
    updateDisplay();
}

function deleteNumber() {
    if (shouldReset) return;

    currentValue = currentValue.slice(0, -1) || "0";
    updateDisplay();
}

async function percentage() {
    try {
        const response = await fetch("/api/calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                a: Number(currentValue),
                b: 0,
                operation: "percent"
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Calculation failed");
        }

        currentValue = String(data.result);
        shouldReset = true;
        updateDisplay();

    } catch (error) {
        currentValue = error.message;
        shouldReset = true;
        updateDisplay();
    }
}

document.querySelectorAll("[data-number]").forEach(button => {
    button.addEventListener("click", () => {
        enterNumber(button.dataset.number);
    });
});

document.querySelectorAll("[data-operation]").forEach(button => {
    button.addEventListener("click", () => {
        selectOperation(button.dataset.operation);
    });
});

document.querySelector('[data-action="calculate"]')
    .addEventListener("click", calculate);

document.querySelector('[data-action="clear"]')
    .addEventListener("click", clearCalculator);

document.querySelector('[data-action="delete"]')
    .addEventListener("click", deleteNumber);

document.querySelector('[data-action="percent"]')
    .addEventListener("click", percentage);
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
// ===== KEYBOARD SUPPORT =====
const keyMap = {
  "+": '[data-operation="add"]',
  "-": '[data-operation="subtract"]',
  "*": '[data-operation="multiply"]',
  "x": '[data-operation="multiply"]',
  "/": '[data-operation="divide"]',
  "%": '[data-action="percent"]',
  "Enter": '[data-action="calculate"]',
  "=": '[data-action="calculate"]',
  "Backspace": '[data-action="delete"]',
  "Escape": '[data-action="clear"]',
  "Delete": '[data-action="clear"]',
  "c": '[data-action="clear"]',
  "C": '[data-action="clear"]'
};

document.addEventListener("keydown", (event) => {
  // let browser shortcuts like Ctrl+R still work
  if (event.ctrlKey || event.metaKey || event.altKey) return;

  let selector = null;

  if ((event.key >= "0" && event.key <= "9") || event.key === ".") {
    selector = `[data-number="${event.key}"]`;
  } else if (keyMap[event.key]) {
    selector = keyMap[event.key];
  }

  if (!selector) return;

  event.preventDefault();

  const button = document.querySelector(selector);
  if (!button) return;

  button.click();

  // little press animation
  button.classList.add("pressed");
  setTimeout(() => button.classList.remove("pressed"), 120);
});
// ===== CHAINED MATH (2 + 3 + 4 works without pressing =) =====
// This replaces the old selectOperation above (the last definition wins).
let busy = false;        // true while the server is calculating a chain step
const waitingKeys = [];  // buttons pressed while the server was busy

// If you press buttons while the server is busy, remember them and replay in order
document.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || button.dataset.replay) return;
    if (busy) {
        event.stopImmediatePropagation();
        waitingKeys.push(button);
    }
}, true);

function replayWaitingKeys() {
    while (waitingKeys.length && !busy) {
        const button = waitingKeys.shift();
        button.dataset.replay = "1";
        button.click();
        delete button.dataset.replay;
    }
}

async function selectOperation(operation) {
    // Operator pressed right after another operator: just switch it
    if (selectedOperation !== null && shouldReset) {
        selectedOperation = operation;
        previousDisplay.textContent = firstNumber + " " + getSymbol(operation);
        return;
    }

    // Chained math: finish the pending calculation first
    if (selectedOperation !== null && !shouldReset) {
        busy = true;
        try {
            const response = await fetch("/api/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    a: firstNumber,
                    b: Number(currentValue),
                    operation: selectedOperation
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Calculation failed");
            }

            currentValue = String(data.result);
        } catch (error) {
            currentValue = error.message;
            firstNumber = null;
            selectedOperation = null;
            shouldReset = true;
            previousDisplay.textContent = "";
            updateDisplay();
            busy = false;
            waitingKeys.length = 0;
            return;
        }
        updateDisplay();
    }

    firstNumber = Number(currentValue);
    selectedOperation = operation;
    previousDisplay.textContent = currentValue + " " + getSymbol(operation);
    shouldReset = true;

    busy = false;
    replayWaitingKeys();
}
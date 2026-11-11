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
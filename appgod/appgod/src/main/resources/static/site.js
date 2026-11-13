// ===== Is the app running as an installed app? =====
function isInstalledApp() {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        window.navigator.standalone === true
    );
}

const installButtons = [
    document.getElementById("heroInstall"),
    document.getElementById("cardInstall")
];
const openCalc = document.getElementById("openCalc");
const installMsg = document.getElementById("installMsg");
const installSection = document.getElementById("install");

let deferredPrompt = null;

// Chrome tells us when the app can be installed
window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
});

window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installMsg.textContent = "✅ APP GOD is installed! Open it from your desktop, Start menu or home screen.";
});

function showSteps(message) {
    if (message) installMsg.textContent = message;
    installSection.scrollIntoView({ behavior: "smooth" });
    installSection.classList.remove("flash");
    void installSection.offsetWidth;
    installSection.classList.add("flash");
}

async function handleInstallClick() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        return;
    }
    showSteps(
        "No install pop-up here? Follow the steps for your device below. " +
        "If you already installed APP GOD, just open it from your desktop or home screen."
    );
}

installButtons.forEach((button) => {
    if (button) button.addEventListener("click", handleInstallClick);
});

// Already inside the installed app: show the calculator button
if (isInstalledApp()) {
    openCalc.hidden = false;
    installButtons.forEach((button) => {
        if (button) button.hidden = true;
    });
    installMsg.textContent = "✅ You're using the installed app. Open the calculator any time!";
}

// ===== Service worker =====
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js");
    });
}
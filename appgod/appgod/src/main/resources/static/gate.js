// Runs before the page is drawn: decides if the calculator may be used.
// The calculator only works inside the installed app (or on localhost while building).
(function () {
    var installed =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        window.matchMedia("(display-mode: minimal-ui)").matches ||
        window.navigator.standalone === true;

    var isLocal =
        location.hostname === "localhost" || location.hostname === "127.0.0.1";

    if (!installed && !isLocal) {
        document.documentElement.classList.add("locked");
    }
})();
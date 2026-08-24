const root = document.documentElement;
const controller = document.querySelector("#theme-controller");
const button = document.querySelector("[command='--switch-theme']");

const modes = [
    "light",
    "dark",
    "auto",
];

let mode = "light";

function applyTheme() {
    root.style.colorScheme =
        mode === "auto"
            ? "light dark"
            : mode;

    button.textContent = `Theme: ${mode[0].toUpperCase()}${mode.slice(1)}`;
}

function cycleTheme() {
    const index = modes.indexOf(mode);
    mode = modes[(index + 1) % modes.length];

    applyTheme();

    console.log(`Theme: ${mode}`);
}

controller.addEventListener("command", (event) => {
    if (event.command === "--switch-theme") {
        cycleTheme();
    }
});

applyTheme();

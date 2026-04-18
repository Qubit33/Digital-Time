const StopwatchState = {
    interval: null,
    startTime: 0,
    elapsedTime: 0,
    isRunning: false
};

const DOM = {
    stopwatch: document.getElementById("stopwatch"),
    clock: document.getElementById("clock"),
    btnStart: document.getElementById("btn-start"),
    btnPause: document.getElementById("btn-pause"),
    btnReset: document.getElementById("btn-reset")
};

Object.entries(DOM).forEach(([key, element]) => {
    if (!element) {
        console.warn(`Elemento não encontrado: ${key}`);
    }
});

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map(v => String(v).padStart(2, "0"))
        .join(":");
}

function updateStopwatchDisplay() {
    const now = Date.now();
    StopwatchState.elapsedTime = now - StopwatchState.startTime;

    if (DOM.stopwatch) {
        DOM.stopwatch.innerText = formatTime(StopwatchState.elapsedTime);
    }
}

function startStopwatch() {
    if (StopwatchState.isRunning) return;

    StopwatchState.startTime = Date.now() - StopwatchState.elapsedTime;
    StopwatchState.interval = setInterval(updateStopwatchDisplay, 100);
    StopwatchState.isRunning = true;

    updateButtonStates();
}

function pauseStopwatch() {
    if (!StopwatchState.isRunning) return;

    clearInterval(StopwatchState.interval);
    StopwatchState.isRunning = false;

    updateButtonStates();
}

function resetStopwatch() {
    clearInterval(StopwatchState.interval);

    StopwatchState.isRunning = false;
    StopwatchState.elapsedTime = 0;
    StopwatchState.startTime = 0;

    if (DOM.stopwatch) {
        DOM.stopwatch.innerText = "00:00:00";
    }

    updateButtonStates();
}

function updateButtonStates() {
    if (!DOM.btnStart || !DOM.btnPause) return;

    if (StopwatchState.isRunning) {
        DOM.btnStart.disabled = true;
        DOM.btnStart.style.opacity = "0.5";
        DOM.btnPause.disabled = false;
        DOM.btnPause.style.opacity = "1";
    } else {
        DOM.btnStart.disabled = false;
        DOM.btnStart.style.opacity = "1";
        DOM.btnPause.disabled = true;
        DOM.btnPause.style.opacity = "0.5";
    }
}

DOM.btnStart?.addEventListener("click", startStopwatch);
DOM.btnPause?.addEventListener("click", pauseStopwatch);
DOM.btnReset?.addEventListener("click", resetStopwatch);

window.addEventListener("beforeunload", () => {
    clearInterval(StopwatchState.interval);
    StopwatchState.isRunning = false;
});

updateButtonStates();
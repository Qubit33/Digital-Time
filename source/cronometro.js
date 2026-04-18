// CRONÔMETRO - Sistema Completo 
// Update: 16/04/26 ═════════════════════════════════════
// ESTADO DO CRONÔMETRO ═════════════════════════════════════
const StopwatchState = {
    interval: null,
    startTime: 0,
    elapsedTime: 0,
    isRunning: false
};

// - 
// ELEMENTOS DO DOM ═════════════════════════════════════
const DOM = {
    stopwatch: document.getElementById("stopwatch"),
    clock: document.getElementById("clock"),
    btnStart: document.getElementById("btn-start"),
    btnPause: document.getElementById("btn-pause"),
    btnReset: document.getElementById("btn-reset")
};

// Validação de elementos
Object.entries(DOM).forEach(([key, element]) => {
    if (!element) {
        console.warn(`Elemento não encontrado: ${key}`);
    }
});

//-
// FORMATAR TEMPO (HH:MM:SS) ═════════════════════════════════════
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map(value => String(value).padStart(2, '0'))
        .join(':');
}

//- 
// ATUALIZAR DISPLAY DO CRONÔMETRO ═════════════════════════════════════
function updateStopwatchDisplay() {
    const now = Date.now();
    StopwatchState.elapsedTime = now - StopwatchState.startTime;

    // Atualizar display de tempo
    if (DOM.stopwatch) {
        DOM.stopwatch.innerText = formatTime(StopwatchState.elapsedTime);
    }
}

//-
// INICIAR CRONÔMETRO ═════════════════════════════════════
function startStopwatch() {
    if (StopwatchState.isRunning) return; // Evita múltiplas execuções

    StopwatchState.startTime = Date.now() - StopwatchState.elapsedTime;
    StopwatchState.interval = setInterval(updateStopwatchDisplay, 100);
    StopwatchState.isRunning = true;

    // Atualizar estado dos botões
    updateButtonStates();
}

//-
// PAUSAR CRONÔMETRO ═════════════════════════════════════
function pauseStopwatch() {
    if (!StopwatchState.isRunning) return; // Evita erros

    clearInterval(StopwatchState.interval);
    StopwatchState.isRunning = false;

    // Atualizar estado dos botões
    updateButtonStates();
}

//-
// RESETAR CRONÔMETRO ═════════════════════════════════════
function resetStopwatch() {
    clearInterval(StopwatchState.interval);
    
    StopwatchState.isRunning = false;
    StopwatchState.elapsedTime = 0;
    StopwatchState.startTime = 0;

    // Resetar displays
    if (DOM.stopwatch) {
        DOM.stopwatch.innerText = "00:00:00";
    }

    // Atualizar estado dos botões
    updateButtonStates();
}

//-
// ATUALIZAR ESTADO DOS BOTÕES ═════════════════════════════════════
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

//-
// EVENT LISTENERS ═════════════════════════════════════
if (DOM.btnStart) {
    DOM.btnStart.addEventListener("click", startStopwatch);
}

if (DOM.btnPause) {
    DOM.btnPause.addEventListener("click", pauseStopwatch);
}

if (DOM.btnReset) {
    DOM.btnReset.addEventListener("click", resetStopwatch);
}

//-
// CLEANUP AO SAIR ═════════════════════════════════════
window.addEventListener("beforeunload", () => {
    clearInterval(StopwatchState.interval);
    StopwatchState.isRunning = false;
});

//-
// INICIALIZAÇÃO ═════════════════════════════════════
console.log("Cronômetro carregado com sucesso");
updateButtonStates(); // Inicializar estado dos botões
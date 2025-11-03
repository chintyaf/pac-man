// Animation Control State
const animationState = {
    isPaused: false,
    shouldSkip: false,
    shouldStepBack: false,
    history: [],
    historyIndex: -1,
    maxHistorySize: 100,
};

// Save state to history
function saveStateToHistory() {
    const state = {
        grid: grid.map((cell) => ({
            walls: [...cell.walls],
            color: [...cell.color],
            sedangDicek: cell.sedangDicek,
            adalahParent: cell.adalahParent,
            menujuParent: cell.menujuParent,
            checked: cell.checked,
            isSet: cell.isSet,
        })),
        wallIndex: window.currentWallIndex || 0,
        message: messageDiv?.querySelector(".status-msg")?.textContent || "",
        status: messageDiv?.querySelector(".status-header")?.textContent || "",
    };

    // Remove future history if we're not at the end
    if (animationState.historyIndex < animationState.history.length - 1) {
        animationState.history = animationState.history.slice(
            0,
            animationState.historyIndex + 1
        );
    }

    // Add new state
    animationState.history.push(state);

    // Limit history size
    if (animationState.history.length > animationState.maxHistorySize) {
        animationState.history.shift();
    } else {
        animationState.historyIndex++;
    }
}

// Restore state from history
function restoreStateFromHistory(index) {
    if (index < 0 || index >= animationState.history.length) return false;

    const state = animationState.history[index];

    // Restore grid state
    for (let i = 0; i < grid.length; i++) {
        grid[i].walls = [...state.grid[i].walls];
        grid[i].color = [...state.grid[i].color];
        grid[i].sedangDicek = state.grid[i].sedangDicek;
        grid[i].adalahParent = state.grid[i].adalahParent;
        grid[i].menujuParent = state.grid[i].menujuParent;
        grid[i].checked = state.grid[i].checked;
        grid[i].isSet = state.grid[i].isSet;
    }

    // Restore UI
    setMessage(state.message);
    setStatus(state.status);
    window.currentWallIndex = state.wallIndex;

    drawGrid();
    animationState.historyIndex = index;
    return true;
}

// Step back function
function stepBack() {
    if (animationState.historyIndex > 0) {
        restoreStateFromHistory(animationState.historyIndex - 1);
        return true;
    }
    return false;
}

// Delay

const speedSlider = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");

function getDelayFromSpeed(speed) {
    const minDelay = 20; // fast
    const maxDelay = 1000; // slow
    const normalized = (100 - speed) / 100;
    return Math.round(
        minDelay + (maxDelay - minDelay) * Math.pow(normalized, 2)
    );
}

let delay = getDelayFromSpeed(speedSlider.value);

speedSlider.addEventListener("input", () => {
    speedValue.textContent = speedSlider.value;
    delay = getDelayFromSpeed(speedSlider.value);
    console.log(delay);
});

// Modified sleep function with pause support
async function sleep(ms = delay) {
    // Save state before any pause
    saveStateToHistory();

    // Skip if requested
    if (animationState.shouldSkip) {
        return Promise.resolve();
    }

    // Handle pause
    if (animationState.isPaused) {
        await new Promise((resolve) => {
            const checkPause = setInterval(() => {
                if (!animationState.isPaused || animationState.shouldSkip) {
                    clearInterval(checkPause);
                    resolve();
                }
            }, 100);
        });
    }

    // Normal delay
    if (!animationState.shouldSkip) {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }
}

// Button Controls Setup
function setupAnimationControls() {
    // Create control panel if it doesn't exist
    let controlPanel = document.getElementById("animation-controls");
    if (!controlPanel) {
        controlPanel = document.createElement("div");
        controlPanel.id = "animation-controls";
        controlPanel.style.cssText =
            "margin: 10px 0; display: flex; gap: 10px;";

        // Pause/Resume button
        const pauseBtn = document.createElement("button");
        pauseBtn.id = "pauseBtn";
        pauseBtn.textContent = "Pause";
        pauseBtn.onclick = togglePause;

        // Skip button
        const skipBtn = document.createElement("button");
        skipBtn.id = "skipBtn";
        skipBtn.textContent = "Skip Animation";
        skipBtn.onclick = skipAnimation;

        // Step Back button
        const stepBackBtn = document.createElement("button");
        stepBackBtn.id = "stepBackBtn";
        stepBackBtn.textContent = "Step Back";
        stepBackBtn.onclick = stepBackAction;

        // Reset button
        const resetBtn = document.createElement("button");
        resetBtn.id = "resetBtn";
        resetBtn.textContent = "Reset";
        resetBtn.onclick = resetAnimation;

        controlPanel.appendChild(pauseBtn);
        controlPanel.appendChild(stepBackBtn);
        controlPanel.appendChild(skipBtn);
        controlPanel.appendChild(resetBtn);

        // Insert after message div or at top of body
        const messageDiv = document.getElementById("message");
        if (messageDiv && messageDiv.parentNode) {
            messageDiv.parentNode.insertBefore(
                controlPanel,
                messageDiv.nextSibling
            );
        } else {
            document.body.insertBefore(controlPanel, document.body.firstChild);
        }
    }
}

// Toggle pause
function togglePause() {
    animationState.isPaused = !animationState.isPaused;
    const pauseBtn = document.getElementById("pauseBtn");
    if (pauseBtn) {
        pauseBtn.textContent = animationState.isPaused ? "Resume" : "Pause";
    }
}

// Skip animation
function skipAnimation() {
    animationState.shouldSkip = true;
    animationState.isPaused = false;
    const pauseBtn = document.getElementById("pauseBtn");
    if (pauseBtn) {
        pauseBtn.textContent = "Pause";
    }
}

// Step back action
function stepBackAction() {
    if (animationState.isPaused) {
        if (!stepBack()) {
            alert("No previous state available");
        }
    } else {
        alert("Please pause the animation first");
    }
}

// Reset animation
function resetAnimation() {
    if (confirm("Reset the entire animation?")) {
        animationState.isPaused = false;
        animationState.shouldSkip = false;
        animationState.history = [];
        animationState.historyIndex = -1;
        window.location.reload();
    }
}

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
    // Space is already used for start
    if (e.code === "KeyP") {
        // P for pause
        e.preventDefault();
        togglePause();
    } else if (e.code === "KeyS") {
        // S for skip
        e.preventDefault();
        skipAnimation();
    } else if (e.code === "KeyB") {
        // B for back
        e.preventDefault();
        stepBackAction();
    } else if (e.code === "KeyR" && e.ctrlKey) {
        // Ctrl+R for reset
        e.preventDefault();
        resetAnimation();
    }
});

// Initialize controls when page loads
window.addEventListener("load", () => {
    setupAnimationControls();
});

// Export for use in other files
window.setupAnimationControls = {
    state: animationState,
    saveState: saveStateToHistory,
    restoreState: restoreStateFromHistory,
    stepBack: stepBack,
    togglePause: togglePause,
    skipAnimation: skipAnimation,
};

/* =========================================================================================
   ADAPTIVE CRUISE CONTROL — SIMULATION ENGINE
   
   Faithful JavaScript implementation of the MATLAB ACC algorithm
   Reference: Source Code/Adaptive Cruise Control.m
   
   MODES:
     0 → Normal Mode     (Manual velocity regulation with kinetic drag)
     1 → Cruise Control   (Automated speed maintenance, no drag)
     2 → Adaptive Cruise  (Proximity-aware auto speed modulation)
   
   PINS (Simulated):
     A0 → Increase Speed (Potentiometer)
     A1 → Decrease Speed (Potentiometer)
     A2 → Cancel / Normal Mode (Push Button)
     A3 → Set Speed / Cruise (Push Button)
     A4 → Adaptive Cruise Control (Push Button)
     D13 → Acceleration LED (Green)
     D12 → Braking LED (Red)
     D10 → Ultrasonic Trigger
     D8  → Ultrasonic Echo
   
   Author: Amey Thakur
   ========================================================================================= */

'use strict';

// ─── STATE ───────────────────────────────────────────────────────────────────
const state = {
    speed: 0,             // Current vehicle speed (integer, km/h equivalent)
    mode: 0,              // 0: Normal, 1: Cruise, 2: Adaptive
    distance: 0.50,       // Simulated ultrasonic distance (meters)
    constant: 0,          // Cached cruise target speed (set when entering ACC)

    // Simulated analog pin voltages (0–5V)
    pins: {
        A0: 0,  // Increase speed
        A1: 0,  // Decrease speed
        A2: 0,  // Cancel
        A3: 0,  // Set speed (cruise)
        A4: 0,  // Adaptive cruise
    },

    // Digital pin states
    D13: false,           // Acceleration LED
    D12: false,           // Braking LED
    D10: false,           // Ultrasonic trigger
    D8: false,            // Ultrasonic echo

    // UI state
    startupPhase: 0,      // 0: welcome, 1: group, 2: running
    running: false,
    serialLines: [],
};


// ─── DOM REFERENCES ──────────────────────────────────────────────────────────
const DOM = {
    // LCD
    lcdRow1: document.getElementById('lcd-row-1'),
    lcdRow2: document.getElementById('lcd-row-2'),

    // LEDs
    ledGreen: document.getElementById('led-green'),
    ledRed: document.getElementById('led-red'),

    // Arduino pins
    pinD13: document.getElementById('pin-d13'),
    pinD12: document.getElementById('pin-d12'),
    pinD10: document.getElementById('pin-d10'),
    pinD8: document.getElementById('pin-d8'),

    // Analog bars
    barA0: document.getElementById('bar-a0'),
    barA1: document.getElementById('bar-a1'),
    barA2: document.getElementById('bar-a2'),
    barA3: document.getElementById('bar-a3'),
    barA4: document.getElementById('bar-a4'),

    // Sensor
    distanceDisplay: document.getElementById('distance-display'),
    proximityStatus: document.getElementById('proximity-status'),
    distanceSlider: document.getElementById('distance-slider'),
    sensorWaves: document.getElementById('sensor-waves'),
    sensorBeam: document.getElementById('sensor-beam'),

    // Telemetry
    teleSpeed: document.getElementById('tele-speed'),
    teleMode: document.getElementById('tele-mode'),
    teleModeCode: document.getElementById('tele-mode-code'),
    teleTarget: document.getElementById('tele-target'),
    teleDistance: document.getElementById('tele-distance'),

    // Road
    leadVehicle: document.getElementById('lead-vehicle'),
    egoVehicle: document.getElementById('ego-vehicle'),
    distanceIndicator: document.getElementById('distance-indicator'),
    distanceValueRoad: document.getElementById('distance-value-road'),

    // Serial
    serialOutput: document.getElementById('serial-output'),

    // COM
    comIndicator: document.getElementById('com-indicator'),
    comStatus: document.getElementById('com-status'),

    // Buttons
    btnIncrease: document.getElementById('btn-increase'),
    btnDecrease: document.getElementById('btn-decrease'),
    btnCancel: document.getElementById('btn-cancel'),
    btnCruise: document.getElementById('btn-cruise'),
    btnAdaptive: document.getElementById('btn-adaptive'),
};


// ─── SERIAL LOGGER ───────────────────────────────────────────────────────────
function serialLog(message, type = 'info') {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour12: false }) + '.' +
        String(now.getMilliseconds()).padStart(3, '0');

    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    line.innerHTML = `<span class="timestamp">[${timestamp}]</span> ${message}`;

    DOM.serialOutput.appendChild(line);

    // Keep max 100 lines
    while (DOM.serialOutput.children.length > 100) {
        DOM.serialOutput.removeChild(DOM.serialOutput.firstChild);
    }

    DOM.serialOutput.scrollTop = DOM.serialOutput.scrollHeight;
}


// ─── LCD CONTROLLER ──────────────────────────────────────────────────────────
function clearLCD() {
    DOM.lcdRow1.textContent = '';
    DOM.lcdRow2.textContent = '';
}

function printLCD(row, text) {
    if (row === 1) {
        DOM.lcdRow1.textContent = text;
    } else {
        DOM.lcdRow2.textContent = text;
    }
}


// ─── PIN CONTROLLER ──────────────────────────────────────────────────────────
function writeDigitalPin(pin, value) {
    state[pin] = !!value;
    updatePinVisuals();
}

function updatePinVisuals() {
    // D13 — Acceleration LED (Green)
    DOM.pinD13.className = 'pin-led' + (state.D13 ? ' on-green' : '');
    DOM.ledGreen.className = 'led-bulb green' + (state.D13 ? ' active' : '');

    // D12 — Braking LED (Red)
    DOM.pinD12.className = 'pin-led' + (state.D12 ? ' on-red' : '');
    DOM.ledRed.className = 'led-bulb red' + (state.D12 ? ' active' : '');

    // D10/D8 — Ultrasonic (active in ACC mode)
    const sensorActive = state.mode === 2;
    DOM.pinD10.className = 'pin-led' + (sensorActive ? ' on-cyan' : '');
    DOM.pinD8.className = 'pin-led' + (sensorActive ? ' on-cyan' : '');

    // Sensor beam
    DOM.sensorBeam.className = 'sensor-beam' + (sensorActive ? ' active' : '');
}

function updateAnalogBars(activePin) {
    const bars = { A0: DOM.barA0, A1: DOM.barA1, A2: DOM.barA2, A3: DOM.barA3, A4: DOM.barA4 };
    Object.keys(bars).forEach(pin => {
        bars[pin].className = 'analog-bar' + (pin === activePin ? ' active' : '');
    });
}


// ─── SENSOR CONTROLLER ──────────────────────────────────────────────────────
function updateSensor() {
    const sliderVal = parseInt(DOM.distanceSlider.value);
    state.distance = sliderVal / 100; // 0.00 to 1.00 meters

    const distStr = state.distance.toFixed(2) + ' m';
    DOM.distanceDisplay.textContent = distStr;
    DOM.distanceValueRoad.textContent = distStr;
    DOM.teleDistance.textContent = state.distance.toFixed(2);

    // Proximity status
    const isDanger = state.distance < 0.3;
    DOM.proximityStatus.textContent = isDanger ? 'HAZARD' : 'SAFE';
    DOM.proximityStatus.className = 'readout-value ' + (isDanger ? 'danger' : 'safe');
    DOM.distanceDisplay.className = 'readout-value ' + (isDanger ? 'danger' : '');
    DOM.sensorWaves.className = 'sensor-waves' + (isDanger ? ' danger' : '');

    // Update road visualization
    updateRoadVisualization();
}

function updateRoadVisualization() {
    // Position lead vehicle based on distance (closer = further left)
    const minLeft = 40;  // Closest position (%)
    const maxLeft = 80;  // Farthest position (%)
    const leadPos = minLeft + (state.distance * (maxLeft - minLeft));
    DOM.leadVehicle.style.left = leadPos + '%';

    // Distance indicator position
    const egoRight = 32;
    const indicatorLeft = egoRight;
    const indicatorRight = 100 - leadPos;
    DOM.distanceIndicator.style.left = indicatorLeft + '%';
    DOM.distanceIndicator.style.right = indicatorRight + '%';

    // Show distance indicator in ACC mode
    DOM.distanceIndicator.className = state.mode === 2 ? 'visible' : '';

    // Brake lights on lead vehicle
    const brakeLights = DOM.leadVehicle.querySelectorAll('.brake-light');
    brakeLights.forEach(light => {
        light.className = 'brake-light ' + light.classList[1] + (state.distance < 0.3 ? ' active' : '');
    });

    // Headlights on ego vehicle
    const headlights = DOM.egoVehicle.querySelectorAll('.headlight');
    headlights.forEach(light => {
        light.className = 'headlight ' + light.classList[1] + (state.D13 ? ' active' : '');
    });
}


// ─── TELEMETRY UPDATER ───────────────────────────────────────────────────────
function updateTelemetry() {
    DOM.teleSpeed.textContent = state.speed;

    const modeNames = ['Normal', 'Cruise', 'Adaptive'];
    const modeCodes = ['Mode 0', 'Mode 1', 'Mode 2'];
    DOM.teleMode.textContent = modeNames[state.mode];
    DOM.teleModeCode.textContent = modeCodes[state.mode];

    DOM.teleTarget.textContent = state.mode === 2 ? state.constant : '—';

    // Mode button highlights
    DOM.btnCancel.className = 'ctrl-btn cancel' + (state.mode === 0 ? ' active-mode' : '');
    DOM.btnCruise.className = 'ctrl-btn cruise' + (state.mode === 1 ? ' active-mode' : '');
    DOM.btnAdaptive.className = 'ctrl-btn adaptive' + (state.mode === 2 ? ' active-mode' : '');
}


// ─── ROAD ANIMATION ──────────────────────────────────────────────────────────
function updateRoadAnimation() {
    const markers = document.querySelectorAll('.lane-marker');
    const speedFactor = Math.max(state.speed, 0);

    markers.forEach(marker => {
        // Speed controls animation duration (faster speed = faster animation)
        if (speedFactor > 0) {
            const duration = Math.max(0.3, 3 - (speedFactor / 40));
            marker.style.animationDuration = duration + 's';
            marker.style.animationPlayState = 'running';
        } else {
            marker.style.animationPlayState = 'paused';
        }
    });
}


// ─── CORE ACC ENGINE ─────────────────────────────────────────────────────────
// This directly mirrors the MATLAB while-loop logic from Adaptive Cruise Control.m

function accTick() {
    if (!state.running) return;

    // ── MODE 0: NORMAL OPERATION ──
    if (state.mode === 0) {
        if (state.pins.A0 >= 4) {
            // Accelerate
            writeDigitalPin('D13', 1);
            writeDigitalPin('D12', 0);
            state.speed += 1;
        } else if (state.pins.A1 >= 4) {
            // Manual braking
            state.speed -= 1;
        } else {
            // Natural kinetic deceleration (drag)
            state.speed -= 1;
        }

        // Velocity boundary enforcement
        if (state.speed < 0) {
            writeDigitalPin('D13', 0);
            writeDigitalPin('D12', 1);
            state.speed = 0;
        }

        // LCD output
        clearLCD();
        printLCD(1, 'Vehicle Speed:');
        printLCD(2, state.speed.toString());
    }

    // ── MODE 1: CRUISE CONTROL ──
    else if (state.mode === 1) {
        if (state.pins.A0 >= 4) {
            writeDigitalPin('D13', 1);
            writeDigitalPin('D12', 0);
            state.speed += 1;
        } else if (state.pins.A1 >= 4) {
            state.speed -= 1;
        }
        // No drag in cruise mode — speed is maintained

        // Safety boundary
        if (state.speed < 0) {
            writeDigitalPin('D13', 0);
            writeDigitalPin('D12', 1);
            state.speed = 0;
        }

        // LCD output
        clearLCD();
        printLCD(1, 'Cruise mode:');
        printLCD(2, state.speed.toString());
    }

    // ── MODE 2: ADAPTIVE CRUISE CONTROL ──
    else if (state.mode === 2) {
        writeDigitalPin('D13', 1);
        writeDigitalPin('D12', 0);

        // Predictive Distance Control Algorithm
        if (state.distance < 0.3) {
            // Hazard detected → automated deceleration
            serialLog(`PROXIMITY WARNING: ${state.distance.toFixed(2)}m`, 'danger');
            state.speed -= 1;
        } else {
            // Safe zone → velocity restoration to target cruise speed
            serialLog(`PATH CLEAR: ${state.distance.toFixed(2)}m`, 'success');
            state.speed += 1;
        }

        // Velocity cap — do not exceed cached cruise speed
        if (state.speed > state.constant) {
            state.speed = state.constant;
        }

        // Universal safety guard
        if (state.speed < 0) {
            writeDigitalPin('D13', 0);
            writeDigitalPin('D12', 1);
            state.speed = 0;
        }

        // LCD output
        clearLCD();
        printLCD(1, 'Adap_Cruise_mode');
        printLCD(2, state.speed.toString());
    }

    // Update all displays
    updateTelemetry();
    updatePinVisuals();
    updateRoadAnimation();
    updateRoadVisualization();
}


// ─── CONTROL HANDLERS ────────────────────────────────────────────────────────

// Speed buttons (hold-to-repeat with mousedown/up)
let speedInterval = null;

function startSpeedAction(pin) {
    state.pins[pin] = 5; // Simulate 5V (>= 4V threshold)
    updateAnalogBars(pin);
    accTick();

    speedInterval = setInterval(() => {
        accTick();
    }, 150);
}

function stopSpeedAction(pin) {
    state.pins[pin] = 0;
    updateAnalogBars(null);
    clearInterval(speedInterval);
    speedInterval = null;
}

// Increase Speed (A0)
DOM.btnIncrease.addEventListener('mousedown', (e) => {
    e.preventDefault();
    DOM.btnIncrease.classList.add('pressed');
    startSpeedAction('A0');
});

DOM.btnIncrease.addEventListener('mouseup', () => {
    DOM.btnIncrease.classList.remove('pressed');
    stopSpeedAction('A0');
});

DOM.btnIncrease.addEventListener('mouseleave', () => {
    DOM.btnIncrease.classList.remove('pressed');
    stopSpeedAction('A0');
});

// Touch support for increase
DOM.btnIncrease.addEventListener('touchstart', (e) => {
    e.preventDefault();
    DOM.btnIncrease.classList.add('pressed');
    startSpeedAction('A0');
});

DOM.btnIncrease.addEventListener('touchend', () => {
    DOM.btnIncrease.classList.remove('pressed');
    stopSpeedAction('A0');
});

// Decrease Speed (A1)
DOM.btnDecrease.addEventListener('mousedown', (e) => {
    e.preventDefault();
    DOM.btnDecrease.classList.add('pressed');
    startSpeedAction('A1');
});

DOM.btnDecrease.addEventListener('mouseup', () => {
    DOM.btnDecrease.classList.remove('pressed');
    stopSpeedAction('A1');
});

DOM.btnDecrease.addEventListener('mouseleave', () => {
    DOM.btnDecrease.classList.remove('pressed');
    stopSpeedAction('A1');
});

// Touch support for decrease
DOM.btnDecrease.addEventListener('touchstart', (e) => {
    e.preventDefault();
    DOM.btnDecrease.classList.add('pressed');
    startSpeedAction('A1');
});

DOM.btnDecrease.addEventListener('touchend', () => {
    DOM.btnDecrease.classList.remove('pressed');
    stopSpeedAction('A1');
});


// Mode Buttons (click = toggle)
DOM.btnCancel.addEventListener('click', () => {
    state.pins.A2 = 5;
    updateAnalogBars('A2');
    serialLog('Mode transition → NORMAL (Mode 0)', 'system');
    state.mode = 0;
    writeDigitalPin('D13', 0);
    writeDigitalPin('D12', 0);
    accTick();
    setTimeout(() => { state.pins.A2 = 0; updateAnalogBars(null); }, 300);
});

DOM.btnCruise.addEventListener('click', () => {
    state.pins.A3 = 5;
    updateAnalogBars('A3');
    serialLog(`Mode transition → CRUISE CONTROL (Mode 1) | Speed maintained at ${state.speed} km/h`, 'system');
    state.mode = 1;
    accTick();
    setTimeout(() => { state.pins.A3 = 0; updateAnalogBars(null); }, 300);
});

DOM.btnAdaptive.addEventListener('click', () => {
    state.pins.A4 = 5;
    updateAnalogBars('A4');
    state.constant = state.speed; // Cache current speed as cruise target
    serialLog(`Mode transition → ADAPTIVE CRUISE (Mode 2) | Target locked: ${state.constant} km/h`, 'system');
    state.mode = 2;
    accTick();
    setTimeout(() => { state.pins.A4 = 0; updateAnalogBars(null); }, 300);
});


// Distance Slider
DOM.distanceSlider.addEventListener('input', () => {
    updateSensor();
});


// Keyboard Controls
document.addEventListener('keydown', (e) => {
    if (!state.running) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            e.preventDefault();
            if (!speedInterval) {
                DOM.btnIncrease.classList.add('pressed');
                startSpeedAction('A0');
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            e.preventDefault();
            if (!speedInterval) {
                DOM.btnDecrease.classList.add('pressed');
                startSpeedAction('A1');
            }
            break;
        case '1':
            DOM.btnCancel.click();
            break;
        case '2':
            DOM.btnCruise.click();
            break;
        case '3':
            DOM.btnAdaptive.click();
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            DOM.btnIncrease.classList.remove('pressed');
            stopSpeedAction('A0');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            DOM.btnDecrease.classList.remove('pressed');
            stopSpeedAction('A1');
            break;
    }
});


// ─── NATURAL DRAG LOOP ──────────────────────────────────────────────────────
// In Normal Mode (mode 0), speed decreases naturally when no button is held
// This runs independently to simulate kinetic drag

setInterval(() => {
    if (!state.running) return;
    if (state.mode !== 0) return;
    if (state.pins.A0 >= 4 || state.pins.A1 >= 4) return;

    // Natural deceleration
    if (state.speed > 0) {
        state.speed -= 1;
        writeDigitalPin('D13', 0);

        if (state.speed <= 0) {
            state.speed = 0;
            writeDigitalPin('D12', 1);
        }

        clearLCD();
        printLCD(1, 'Vehicle Speed:');
        printLCD(2, state.speed.toString());
        updateTelemetry();
        updatePinVisuals();
        updateRoadAnimation();
    }
}, 1500); // Natural drag every 1.5s (matching MATLAB pause(1.5))


// ─── ADAPTIVE MODE AUTO-CYCLE ────────────────────────────────────────────────
// In ACC mode, the system continuously reads distance and adjusts speed

setInterval(() => {
    if (!state.running) return;
    if (state.mode !== 2) return;

    updateSensor();
    accTick();
}, 500);


// ─── STARTUP SEQUENCE ────────────────────────────────────────────────────────
// Mirrors the MATLAB startup: welcome screen → group info → operational

function startupSequence() {
    serialLog('═══════════════════════════════════════════', 'info');
    serialLog('Adaptive Cruise Control — Simulation v1.0', 'info');
    serialLog('Arduino Uno R3 · COM5 · 9600 baud', 'info');
    serialLog('═══════════════════════════════════════════', 'info');
    serialLog('Initializing Arduino board...', 'system');
    serialLog('Loading libraries: Ultrasonic, ExampleLCD/LCDAddOn', 'system');

    // Phase 0: Welcome Screen
    setTimeout(() => {
        serialLog('LCD initialized. Displaying welcome message...', 'info');
        clearLCD();
        printLCD(1, 'WELCOME TO');
        printLCD(2, 'ACC PROJECT');
    }, 500);

    // Phase 1: Group Info
    setTimeout(() => {
        serialLog('Displaying group information...', 'info');
        clearLCD();
        printLCD(1, 'Group 32');
        printLCD(2, 'Amey,Brano,Nandu');
    }, 3500);

    // Phase 2: Ready
    setTimeout(() => {
        serialLog('System initialization complete.', 'success');
        serialLog('Entering real-time control loop...', 'success');
        serialLog('─────────────────────────────────────────', 'info');
        serialLog('Controls: ↑/W = Accelerate | ↓/S = Brake', 'info');
        serialLog('Modes: 1 = Normal | 2 = Cruise | 3 = Adaptive', 'info');
        serialLog('─────────────────────────────────────────', 'info');

        state.running = true;
        state.mode = 0;

        clearLCD();
        printLCD(1, 'Vehicle Speed:');
        printLCD(2, '0');

        updateTelemetry();
        updatePinVisuals();
        updateSensor();
        updateRoadAnimation();
    }, 6500);
}


// ─── INITIALIZATION ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateSensor();
    updateRoadVisualization();
    startupSequence();
});

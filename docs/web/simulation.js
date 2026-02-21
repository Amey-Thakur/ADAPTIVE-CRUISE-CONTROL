/* ┌──────────────────────────────────────────────────────────────────────────────┐
 * │  File:         simulation.js                                                 │
 * │  Author:       Amey Thakur                                                   │
 * │  Profile:      https://github.com/Amey-Thakur                                │
 * │  Repository:   https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL        │
 * │                                                                              │
 * │  Description:  Core simulation engine for the Adaptive Cruise Control        │
 * │                (ACC) web application. This module is a faithful JavaScript   │
 * │                port of the original MATLAB ACC algorithm. It manages         │
 * │                three operating modes (Normal, Cruise, Adaptive), handles     │
 * │                simulated Arduino I/O (LEDs, pins, LCD, HC-SR04 sensor),      │
 * │                and drives all real-time dashboard updates including the      │
 * │                speedometer, telemetry, road visualization, and serial        │
 * │                monitor output.                                               │
 * │                                                                              │
 * │  Modes:        0 → Normal | 1 → Cruise Control | 2 → Adaptive Cruise         │
 * │  Pin Map:      A0 Accel | A1 Brake | A2 Cancel | A3 Cruise | A4 ACC          │
 * │                D13 Green LED | D12 Red LED | D10 Trig | D8 Echo              │
 * │                                                                              │
 * │  Technology:   Vanilla JavaScript (ES6+), Web Audio API                      │
 * │  Released:     September 08, 2023                                            │
 * │  License:      MIT                                                           │
 * └──────────────────────────────────────────────────────────────────────────────┘ */

'use strict';

// ─── SIMULATION STATE ────────────────────────────────────────────────────────
// Central state object holding all runtime values for the ACC simulation.
// Mode codes: 0 = Normal (manual), 1 = Cruise Control, 2 = Adaptive Cruise.
const S = {
    speed: 0,
    mode: 0,           // Active operating mode (0: Normal, 1: Cruise, 2: Adaptive)
    distance: 0.50,    // HC-SR04 ultrasonic sensor reading in meters
    constant: 0,       // Cruise target speed, captured at the moment of ACC activation
    D13: false,        // Green LED (D13) — illuminates during acceleration
    D12: false,        // Red LED (D12) — illuminates during braking or vehicle stop
    running: false,    // Whether the simulation control loop is active
    lastLog: '',       // Tracks the most recent log message to suppress duplicates
    pins: { A0: 0, A1: 0, A2: 0, A3: 0, A4: 0 },  // Simulated analog pin voltage levels (0–5V)
    hornBlinking: false, // Prevents overlapping headlight flash sequences during horn
};

// ─── DOM ELEMENT REFERENCES ─────────────────────────────────────────────────
// Cached references to all interactive DOM elements. Using a single lookup
// on initialization avoids repeated querySelector calls during the control loop.
const $ = id => document.getElementById(id);

const D = {
    lcd1: $('lcd-1'), lcd2: $('lcd-2'),
    gaugeArc: $('gauge-arc'), gaugeNum: $('gauge-num'),
    infoMode: $('info-mode'), infoCode: $('info-code'),
    infoTarget: $('info-target'), infoDist: $('info-dist'),
    modeBadge: $('mode-badge'),
    statusDot: $('status-dot'), statusText: $('status-text'),
    ledG: $('hw-led-g'), ledR: $('hw-led-r'),
    ledT: $('hw-led-t'), ledE: $('hw-led-e'),
    serial: $('serial'),
    distSlider: $('dist-slider'), sliderVal: $('slider-val'),
    distLabel: $('dist-label'), distLabelVal: $('dist-label-val'),
    leadCar: $('lead-car'), egoCar: $('ego-car'),
    sensorCone: $('sensor-cone'),
    btnUp: $('btn-up'), btnDown: $('btn-down'),
    btnCloser: $('btn-closer'), btnFarther: $('btn-farther'),
    btnM0: $('btn-m0'), btnM1: $('btn-m1'), btnM2: $('btn-m2'),
    themeToggle: $('theme-toggle'),
    iconSun: $('icon-sun'), iconMoon: $('icon-moon'),
    laneStrip: $('lane-strip'),
};

// Analog pin bar fill elements (A0–A4), used to visualize active pin states.
const PF = {
    A0: $('pf-a0'), A1: $('pf-a1'), A2: $('pf-a2'), A3: $('pf-a3'), A4: $('pf-a4'),
};


// ─── THEME MANAGEMENT ───────────────────────────────────────────────────────
// Handles dark/light theme persistence using localStorage and updates the
// toggle icon accordingly. Preference is stored under the key 'acc-theme'.
function initTheme() {
    const saved = localStorage.getItem('acc-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon();
}

function toggleTheme() {
    const curr = document.documentElement.getAttribute('data-theme');
    const next = curr === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('acc-theme', next);
    updateThemeIcon();
}

function updateThemeIcon() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    D.iconSun.style.display = dark ? 'block' : 'none';
    D.iconMoon.style.display = dark ? 'none' : 'block';
}


// ─── SERIAL MONITOR LOGGER ──────────────────────────────────────────────────
// Appends a timestamped log entry to the serial monitor panel. Each entry
// includes a high-resolution timestamp (HH:MM:SS.mmm) and a CSS class
// for color-coding: 'info', 'success', 'warn', 'danger', or 'sys'.
// Duplicate consecutive messages are suppressed to reduce visual noise.
// The buffer is capped at 100 entries to maintain rendering performance.
function log(msg, cls = 'info') {
    // Skip if this message is identical to the previous entry
    if (msg === S.lastLog) return;
    S.lastLog = msg;

    const t = new Date();
    const ts = t.toLocaleTimeString('en-US', { hour12: false });
    const ms = String(t.getMilliseconds()).padStart(3, '0');
    const el = document.createElement('div');
    el.innerHTML = `<span class="ts">[${ts}.${ms}]</span> <span class="${cls}">${msg}</span>`;
    D.serial.appendChild(el);
    while (D.serial.children.length > 100) D.serial.removeChild(D.serial.firstChild);
    D.serial.scrollTop = D.serial.scrollHeight;
}


// ─── HORN SOUND ─────────────────────────────────────────────────────────────
// Generates a dual-tone car horn using the Web Audio API (F + A notes).
// Simultaneously triggers a double-flash on the ACC vehicle's headlights.
// Audio is fail-safe — gracefully catches blocked or unsupported contexts.
function playHorn() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();

        const playTone = (freq, type, start, dur, vol) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(vol, start + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.01, start + dur);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(start);
            osc.stop(start + dur);
        };

        const now = ctx.currentTime;
        // Standard automotive dual-tone horn: F (340 Hz) and A (420 Hz)
        playTone(340, 'triangle', now, 0.4, 0.15);
        playTone(420, 'triangle', now, 0.4, 0.15);
        log('ACC Vehicle Horn: HOOOOONK! 🔊', 'sys');

        // Double-flash headlight sequence (150ms on, 150ms off, 150ms on)
        if (!S.hornBlinking) {
            S.hornBlinking = true;
            const hl = D.egoCar.querySelectorAll('.headlight');
            const setFlash = (active) => hl.forEach(h => h.classList.toggle('flash', active));

            setFlash(true);
            setTimeout(() => setFlash(false), 150);
            setTimeout(() => setFlash(true), 300);
            setTimeout(() => setFlash(false), 450);
            setTimeout(() => { S.hornBlinking = false; }, 500);
        }
    } catch (e) {
        console.warn('Audio blocked or not supported');
    }
}

// ─── CINEMATIC SEQUENCE ─────────────────────────────────────────────────────
// Interactive Easter egg sequence activated by typing 'amey' or clicking the 
// header title. Plays a power-up sound effect, overlays a holographic 
// blueprint view of the ACC algorithm, and streams the algorithm 
// pseudocode into the serial monitor.
function playPowerUpSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 3);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 4);
    } catch (e) { }
}

function startCinematic() {
    const layer = $('cinematic-layer');
    if (layer.classList.contains('on')) return;

    const algorithm = [
        "// ═══ ADAPTIVE CRUISE CONTROL ═══",
        "// Arduino Uno R3 · MATLAB Port · Amey Thakur",
        "//",
        "void ACC_Tick() {",
        "  float dist = ultrasonic.read();",
        "  int speed  = get_speed();",
        "  //",
        "  digitalWrite(D13, HIGH); // Accel LED ON",
        "  digitalWrite(D12, LOW);  // Brake LED OFF",
        "  //",
        "  if (dist < 0.30) {",
        "    if (speed > 0) speed -= 1;",
        "    lcd.print(\"Adaptive:\", speed);",
        "    setStatus(ADAPTIVE_DANGER);",
        "  } else {",
        "    if (speed < v_constant) speed += 1;",
        "    setStatus(ADAPTIVE_SAFE);",
        "  }",
        "  //",
        "  if (speed > v_constant) speed = v_constant;",
        "  if (speed == 0) {",
        "    digitalWrite(D13, LOW);",
        "    digitalWrite(D12, HIGH);",
        "    Serial.println(\"Collision Avoidance\");",
        "  }",
        "  //",
        "  lcd.print(\"Adaptive Cruise:\", speed);",
        "  refreshAll();",
        "}",
        "// ═══ CONTROL LOOP: STABLE ═══"
    ];

    layer.innerHTML = `
        <div class="hologram-title">
            <h2>Adaptive Cruise Control</h2>
            <div class="holo-sub">Designed & Developed by Amey Thakur</div>
            <div class="holo-tip">
                In vehicle platoons, maintaining a safe following distance is critical.
                The Constant Time-Gap Policy (CTGP) ensures that as speed increases,
                the gap between vehicles scales proportionally &mdash; preventing
                chain-reaction collisions and preserving String Stability across
                the entire convoy.
            </div>
        </div>
    `;

    layer.classList.add('on');
    document.body.classList.add('cinematic-active');
    D.egoCar.classList.add('ego-blueprint');
    $('road').classList.add('supersonic');

    playPowerUpSound();

    // Stream algorithm lines into the serial monitor at 150ms intervals
    let line = 0;
    const streamInterval = setInterval(() => {
        if (line < algorithm.length) {
            log(algorithm[line], 'sys');
            line++;
        } else {
            clearInterval(streamInterval);
            setTimeout(endSequence, 2500);
        }
    }, 150);

    function endSequence() {
        layer.classList.remove('on');
        document.body.classList.remove('cinematic-active');
        D.egoCar.classList.remove('ego-blueprint');
        $('road').classList.remove('supersonic');
        setTimeout(() => { layer.innerHTML = ''; }, 500);
    }
}


// ─── LCD DISPLAY ────────────────────────────────────────────────────────────
// Updates the simulated 16×2 character LCD. Row 1 typically shows the mode
// label; Row 2 shows the current speed or status value.
function lcd(r1, r2) {
    D.lcd1.textContent = r1;
    D.lcd2.textContent = r2;
}


// ─── DIGITAL PIN CONTROL ────────────────────────────────────────────────────
// Sets simulated digital pin states (D12, D13) and refreshes the hardware
// panel to reflect LED, sensor cone, headlight, and tail light states.
function setPin(pin, val) {
    S[pin] = !!val;
}

function refreshHW() {
    D.ledG.className = 'hw-led green' + (S.D13 ? ' on' : '');
    D.ledR.className = 'hw-led red' + (S.D12 ? ' on' : '');

    const sensor = S.mode === 2;
    D.ledT.className = 'hw-led cyan' + (sensor ? ' on' : '');
    D.ledE.className = 'hw-led cyan' + (sensor ? ' on' : '');

    // HC-SR04 sensor cone visibility and danger state
    const danger = S.distance < 0.3;
    D.sensorCone.className = 'sensor-cone' +
        (sensor ? ' on' : '') +
        (sensor && danger ? ' danger' : '');

    // Headlights: ACC vehicle follows D13 state; lead vehicle stays on
    const egoHL = D.egoCar.querySelectorAll('.headlight');
    egoHL.forEach(h => h.classList.toggle('on', S.D13));

    const leadHL = D.leadCar.querySelectorAll('.headlight');
    leadHL.forEach(h => h.classList.add('on'));

    // Tail lights: ACC vehicle follows D12 (brake); lead follows proximity
    const egoTL = D.egoCar.querySelectorAll('.tail-light');
    egoTL.forEach(t => t.classList.toggle('on', S.D12));

    const leadTL = D.leadCar.querySelectorAll('.tail-light');
    leadTL.forEach(t => t.classList.toggle('on', danger));

    // Distance label overlay (visible only in Adaptive Mode)
    D.distLabel.className = sensor ? 'show' : '';
}

function refreshPinBars(active) {
    Object.keys(PF).forEach(p => {
        PF[p].className = 'pbar-fill' + (p === active ? ' on' : '');
    });
}


// ─── SPEEDOMETER GAUGE ──────────────────────────────────────────────────────
// Updates the SVG arc gauge. The arc length is proportional to the current
// speed (0–80 km/h range). Stroke color shifts at 20 and 50 km/h thresholds.
const ARC_LEN = 157;

function refreshGauge() {
    const pct = Math.min(S.speed / 80, 1);
    const offset = ARC_LEN - (ARC_LEN * pct);
    D.gaugeArc.setAttribute('stroke-dashoffset', offset);
    D.gaugeNum.textContent = S.speed;

    if (S.speed === 0) {
        D.gaugeArc.setAttribute('stroke', 'var(--text4)');
    } else if (S.speed < 20) {
        D.gaugeArc.setAttribute('stroke', 'var(--green)');
    } else if (S.speed < 50) {
        D.gaugeArc.setAttribute('stroke', 'var(--accent)');
    } else {
        D.gaugeArc.setAttribute('stroke', 'var(--amber)');
    }
}


// ─── HC-SR04 DISTANCE SENSOR ────────────────────────────────────────────────
// Reads the slider value (0–100), converts it to meters (0.00–1.00m),
// and updates all distance displays across the dashboard.
function refreshSensor() {
    const v = parseInt(D.distSlider.value);
    S.distance = v / 100;

    const str = S.distance.toFixed(2) + 'm';
    D.sliderVal.textContent = str;
    D.infoDist.textContent = str;
    D.distLabelVal.textContent = str;
}


// ─── ROAD VISUALIZATION ────────────────────────────────────────────────────
// Positions the lead vehicle on the road based on the distance reading.
// Adjusts the lane marker animation speed proportional to vehicle velocity.
function refreshRoad() {
    const pos = 42 + (S.distance * 38);
    D.leadCar.style.left = pos + '%';

    if (S.speed > 0) {
        // Lane marker scroll rate: inversely proportional to speed.
        // Lower duration values produce faster visual scrolling.
        const dur = Math.max(0.1, 2.0 - (S.speed / 45));
        D.laneStrip.style.setProperty('--road-speed', dur + 's');
        D.laneStrip.style.animationPlayState = 'running';
    } else {
        D.laneStrip.style.animationPlayState = 'paused';
    }
}


// ─── TELEMETRY AND STATUS BAR ───────────────────────────────────────────────
// Refreshes the telemetry panel (mode, code, target, distance) and updates
// the status bar text and indicator dot color. Status keys map to predefined
// descriptive messages for each operational state.
const MODE_NAMES = ['Normal', 'Cruise', 'Adaptive'];
const MODE_CLASSES = ['', 'cruise', 'adaptive'];
const MODE_BTN_CLASSES = ['m0-active', 'm1-active', 'm2-active'];

const STATUS_MSGS = {
    normal_idle: 'Normal Mode — Vehicle at rest. Press ▲ or W to accelerate.',
    normal_accel: 'Normal Mode — Accelerating. Speed increases by 1 km/h per tick.',
    normal_brake: 'Normal Mode — Braking. Speed decreases by 1 km/h per tick.',
    normal_drag: 'Normal Mode — No input. Natural kinetic drag reduces speed gradually.',
    cruise_hold: 'Cruise Control — Speed is maintained automatically. No kinetic drag.',
    cruise_accel: 'Cruise Control — Manual override: increasing speed above cruise set point.',
    cruise_brake: 'Cruise Control — Manual override: decreasing speed.',
    adaptive_safe: 'Adaptive Cruise — Path clear. Restoring speed to cruise target: ',
    adaptive_danger: 'Adaptive Cruise — ⚠ Proximity < 0.3m! Auto-decelerating for safety.',
    adaptive_cap: 'Adaptive Cruise — Speed at target ceiling. Maintaining velocity.',
};

function refreshTelemetry() {
    D.infoMode.textContent = MODE_NAMES[S.mode];
    D.infoCode.textContent = S.mode;
    D.infoTarget.textContent = S.mode === 2 ? S.constant : '—';

    D.modeBadge.textContent = MODE_NAMES[S.mode] + ' Mode';
    D.modeBadge.className = 'mode-badge ' + MODE_CLASSES[S.mode];

    [D.btnM0, D.btnM1, D.btnM2].forEach((b, i) => {
        b.className = 'btn btn-mode' + (S.mode === i ? ' active ' + MODE_BTN_CLASSES[i] : '');
    });
}

function setStatus(key, extra = '') {
    D.statusText.textContent = (STATUS_MSGS[key] || key) + extra;

    const isDanger = key.includes('danger');
    const isWarn = key.includes('drag') || key.includes('brake');
    D.statusDot.className = 'status-dot' +
        (isDanger ? ' danger' : isWarn ? ' warning' : '');
}


// ─── CORE ACC ENGINE ────────────────────────────────────────────────────────
// Main control loop tick function. Executes one iteration of the ACC
// algorithm based on the current mode and pin input states. This is a
// direct port of the MATLAB control logic (Adaptive Cruise Control.m).
function tick() {
    if (!S.running) return;

    // Mode 0 — Normal: Manual acceleration and braking via analog pins A0/A1.
    if (S.mode === 0) {
        if (S.pins.A0 >= 4) {
            setPin('D13', 1); setPin('D12', 0);
            S.speed += 1;
            log(`NORMAL MODE: Acceleration active.Speed: ${S.speed} km / h`, 'success');
            setStatus('normal_accel');
        } else if (S.pins.A1 >= 4) {
            if (S.speed > 0) {
                S.speed -= 1;
                log(`NORMAL MODE: Braking active.Speed decreased: ${S.speed} km / h`, 'warn');
            }
            setStatus('normal_brake');
        }
        if (S.speed === 0 && S.pins.A0 < 4 && S.pins.A1 < 4) {
            setPin('D13', 0); setPin('D12', 1);
            if (S.lastLog !== 'NORMAL MODE: Vehicle stopped (0 km/h)') {
                log('NORMAL MODE: Vehicle stopped (0 km/h)', 'danger');
            }
            setStatus('normal_idle');
        }
        lcd('Vehicle Speed:', String(S.speed));
    }

    // Mode 1 — Cruise Control: Speed is held constant. Manual override is allowed.
    else if (S.mode === 1) {
        if (S.pins.A0 >= 4) {
            setPin('D13', 1); setPin('D12', 0);
            S.speed += 1;
            log(`CRUISE MODE: Manual acceleration.Speed: ${S.speed} km / h`, 'success');
            setStatus('cruise_accel');
        } else if (S.speed === 0 && S.pins.A1 >= 4) {
            if (S.lastLog !== 'CRUISE MODE: Manual brake applied. Vehicle stopped.') {
                log('CRUISE MODE: Manual brake applied. Vehicle stopped.', 'danger');
            }
            setStatus('cruise_brake');
        } else if (S.pins.A1 >= 4) {
            S.speed -= 1;
            log(`CRUISE MODE: Manual braking.Speed decreased: ${S.speed} km / h`, 'warn');
            setStatus('cruise_brake');
        } else {
            setStatus('cruise_hold');
        }
        if (S.speed === 0 && S.pins.A0 < 4 && S.pins.A1 < 4) { setPin('D13', 0); setPin('D12', 1); }
        lcd('Cruise Mode:', String(S.speed));
    }

    // Mode 2 — Adaptive Cruise: Speed auto-adjusts based on HC-SR04 distance.
    // If distance < 0.30m (danger zone), the vehicle decelerates.
    // Otherwise, speed ramps back toward the stored cruise target.
    else if (S.mode === 2) {
        setPin('D13', 1); setPin('D12', 0);

        if (S.distance < 0.3) {
            if (S.speed > 0) {
                S.speed -= 1;
                log(`ADAPTIVE WARNING: Dist ${S.distance.toFixed(2)} m | Speed decreased: ${S.speed} km / h`, 'danger');
            }
            setStatus('adaptive_danger');
        } else {
            if (S.speed < S.constant) {
                S.speed += 1;
                log(`ADAPTIVE MODE: Path clear | Speed returning to ${S.speed} km / h`, 'success');
            }
            setStatus('adaptive_safe', S.constant + ' km/h');
        }

        if (S.speed > S.constant) S.speed = S.constant;
        if (S.speed === 0) {
            setPin('D13', 0); setPin('D12', 1);
            if (S.lastLog !== 'ADAPTIVE MODE: Collision avoidance - Vehicle stopped.') {
                log('ADAPTIVE MODE: Collision avoidance - Vehicle stopped.', 'danger');
            }
        }
        lcd('Adaptive Cruise:', String(S.speed));
    }

    refreshAll();
}

function refreshAll() {
    refreshGauge();
    refreshHW();
    refreshRoad();
    refreshTelemetry();
    refreshSensor();
}


// ─── SPEED CONTROLS ─────────────────────────────────────────────────────────
// Hold-to-repeat acceleration and braking. Pressing and holding the speed
// buttons triggers tick() at 130ms intervals for continuous speed change.
let spdInt = null;

function startSpeed(pin) {
    S.pins[pin] = 5;
    refreshPinBars(pin);
    tick();
    spdInt = setInterval(tick, 130);
}

function stopSpeed(pin) {
    S.pins[pin] = 0;
    refreshPinBars(null);
    clearInterval(spdInt);
    spdInt = null;
}

// Mouse event bindings for speed buttons
D.btnUp.addEventListener('mousedown', e => { e.preventDefault(); D.btnUp.classList.add('pressed'); startSpeed('A0'); });
D.btnUp.addEventListener('mouseup', () => { D.btnUp.classList.remove('pressed'); stopSpeed('A0'); });
D.btnUp.addEventListener('mouseleave', () => { D.btnUp.classList.remove('pressed'); stopSpeed('A0'); });

D.btnDown.addEventListener('mousedown', e => { e.preventDefault(); D.btnDown.classList.add('pressed'); startSpeed('A1'); });
D.btnDown.addEventListener('mouseup', () => { D.btnDown.classList.remove('pressed'); stopSpeed('A1'); });
D.btnDown.addEventListener('mouseleave', () => { D.btnDown.classList.remove('pressed'); stopSpeed('A1'); });

// Touch event bindings for speed buttons (mobile support)
D.btnUp.addEventListener('touchstart', e => { e.preventDefault(); D.btnUp.classList.add('pressed'); startSpeed('A0'); });
D.btnUp.addEventListener('touchend', () => { D.btnUp.classList.remove('pressed'); stopSpeed('A0'); });
D.btnDown.addEventListener('touchstart', e => { e.preventDefault(); D.btnDown.classList.add('pressed'); startSpeed('A1'); });
D.btnDown.addEventListener('touchend', () => { D.btnDown.classList.remove('pressed'); stopSpeed('A1'); });


// ─── MODE SELECTION BUTTONS ─────────────────────────────────────────────────
// Each mode button writes 5V to its corresponding analog pin, switches
// the operating mode, logs the transition, and triggers a single tick.
// The pin flash lasts 250ms to provide visual feedback.
D.btnM0.addEventListener('click', () => {
    S.pins.A2 = 5; refreshPinBars('A2');
    S.mode = 0;
    setPin('D13', 0); setPin('D12', 0);
    log('Mode → NORMAL (Mode 0)', 'sys');
    setStatus('normal_idle');
    tick();
    setTimeout(() => { S.pins.A2 = 0; refreshPinBars(null); }, 250);
});

D.btnM1.addEventListener('click', () => {
    S.pins.A3 = 5; refreshPinBars('A3');
    S.mode = 1;
    log(`Mode → CRUISE CONTROL(Mode 1) | Maintaining ${S.speed} km / h`, 'sys');
    setStatus('cruise_hold');
    tick();
    setTimeout(() => { S.pins.A3 = 0; refreshPinBars(null); }, 250);
});

D.btnM2.addEventListener('click', () => {
    S.pins.A4 = 5; refreshPinBars('A4');
    S.constant = S.speed;
    S.mode = 2;
    log(`Mode → ADAPTIVE CRUISE(Mode 2) | Target: ${S.constant} km / h`, 'sys');
    setStatus('adaptive_safe', S.constant + ' km/h');
    tick();
    setTimeout(() => { S.pins.A4 = 0; refreshPinBars(null); }, 250);
});


// ─── DISTANCE SLIDER ────────────────────────────────────────────────────────
// Direct slider input handler for the HC-SR04 distance sensor simulation.
D.distSlider.addEventListener('input', () => { refreshSensor(); refreshHW(); });


// ─── DISTANCE STEP BUTTONS ──────────────────────────────────────────────────
// Hold-to-repeat distance adjustment. Each step changes the slider by ±2
// units (0.02m). Holding the button repeats at 100ms intervals.
let distInt = null;

function stepDistance(delta) {
    const v = parseInt(D.distSlider.value) + delta;
    D.distSlider.value = Math.max(0, Math.min(100, v));
    refreshSensor(); refreshHW();
}

function startDist(delta, btn) {
    btn.classList.add('pressed');
    stepDistance(delta);
    distInt = setInterval(() => stepDistance(delta), 100);
}

function stopDist(btn) {
    btn.classList.remove('pressed');
    clearInterval(distInt); distInt = null;
}

// Closer button bindings (mouse + touch)
D.btnCloser.addEventListener('mousedown', e => { e.preventDefault(); startDist(-2, D.btnCloser); });
D.btnCloser.addEventListener('mouseup', () => stopDist(D.btnCloser));
D.btnCloser.addEventListener('mouseleave', () => stopDist(D.btnCloser));
D.btnCloser.addEventListener('touchstart', e => { e.preventDefault(); startDist(-2, D.btnCloser); });
D.btnCloser.addEventListener('touchend', () => stopDist(D.btnCloser));

// Farther button bindings (mouse + touch)
D.btnFarther.addEventListener('mousedown', e => { e.preventDefault(); startDist(2, D.btnFarther); });
D.btnFarther.addEventListener('mouseup', () => stopDist(D.btnFarther));
D.btnFarther.addEventListener('mouseleave', () => stopDist(D.btnFarther));
D.btnFarther.addEventListener('touchstart', e => { e.preventDefault(); startDist(2, D.btnFarther); });
D.btnFarther.addEventListener('touchend', () => stopDist(D.btnFarther));


// ─── KEYBOARD INPUT HANDLING ────────────────────────────────────────────────
// Maps keyboard keys to simulation controls. Arrow keys and WASD control
// speed and distance; number keys 1/2/3 switch operating modes.
document.addEventListener('keydown', e => {
    if (!S.running) return;
    if (e.repeat) return;
    switch (e.key.toLowerCase()) {
        case 'arrowup': case 'w':
            e.preventDefault();
            if (!spdInt) { D.btnUp.classList.add('pressed'); startSpeed('A0'); }
            break;
        case 'arrowdown': case 's':
            e.preventDefault();
            if (!spdInt) { D.btnDown.classList.add('pressed'); startSpeed('A1'); }
            break;
        case 'arrowleft': case 'a':
            e.preventDefault();
            if (!distInt) startDist(-2, D.btnCloser);
            break;
        case 'arrowright': case 'd':
            e.preventDefault();
            if (!distInt) startDist(2, D.btnFarther);
            break;
        case '1': D.btnM0.click(); break;
        case '2': D.btnM1.click(); break;
        case '3': D.btnM2.click(); break;
    }
});

document.addEventListener('keyup', e => {
    switch (e.key.toLowerCase()) {
        case 'arrowup': case 'w':
            D.btnUp.classList.remove('pressed'); stopSpeed('A0'); break;
        case 'arrowdown': case 's':
            D.btnDown.classList.remove('pressed'); stopSpeed('A1'); break;
        case 'arrowleft': case 'a':
            stopDist(D.btnCloser); break;
        case 'arrowright': case 'd':
            stopDist(D.btnFarther); break;
    }
});


// ─── KINETIC DRAG (Normal Mode Only) ────────────────────────────────────────
// In Normal Mode, speed gradually decreases by 1 km/h every 1.5 seconds
// when no acceleration or braking input is active. This simulates natural
// deceleration due to rolling resistance and aerodynamic drag.
setInterval(() => {
    if (!S.running || S.mode !== 0) return;
    if (S.pins.A0 >= 4 || S.pins.A1 >= 4) return;
    if (S.speed > 0) {
        S.speed -= 1;
        setPin('D13', 0);
        if (S.speed > 0) {
            log(`KINETIC DRAG: Speed decreased: ${S.speed} km / h`, 'warn');
        } else {
            S.speed = 0;
            setPin('D12', 1);
            log('KINETIC DRAG: Momentum lost. Vehicle stopped.', 'danger');
        }
        setStatus(S.speed > 0 ? 'normal_drag' : 'normal_idle');
        lcd('Vehicle Speed:', String(S.speed));
        refreshAll();
    }
}, 1500);


// ─── ADAPTIVE MODE AUTO-CYCLE ───────────────────────────────────────────────
// In Adaptive Cruise Mode, the control loop runs automatically every 500ms.
// This interval re-reads the distance sensor and adjusts speed accordingly,
// independent of any manual input.
setInterval(() => {
    if (!S.running || S.mode !== 2) return;
    refreshSensor();
    tick();
}, 500);


// ─── THEME TOGGLE BINDING ───────────────────────────────────────────────────
D.themeToggle.addEventListener('click', toggleTheme);


// ─── BOOT SEQUENCE ──────────────────────────────────────────────────────────
// Initializes the serial monitor with system identification, displays
// the LCD welcome screen, shows team information, and activates the
// control loop after a staged 5.5-second startup delay.
function boot() {
    log('═══════════════════════════════════════', 'info');
    log('Adaptive Cruise Control · Simulation', 'info');
    log('Arduino Uno R3 · COM5 · 9600 baud', 'info');
    log('Author: <a href="https://github.com/Amey-Thakur" target="_blank" style="color: inherit; text-decoration: underline;">Amey Thakur</a>', 'info');
    log('═══════════════════════════════════════', 'info');
    log('Initializing: Ultrasonic, ExampleLCD/LCDAddOn', 'sys');

    setStatus('Initializing system — Arduino Uno connecting on COM5...');

    setTimeout(() => {
        log('LCD initialized. Welcome screen...', 'info');
        lcd('WELCOME TO', 'ACC PROJECT');
        setStatus('Startup sequence — Displaying project welcome message...');
    }, 400);

    setTimeout(() => {
        lcd('Group 32', 'Amey,Brano,Nandu');
        log('Group info displayed.', 'info');
        setStatus('Startup sequence — Displaying team information...');
    }, 3000);

    setTimeout(() => {
        S.running = true;
        S.mode = 0;
        lcd('Vehicle Speed:', '0');
        log('System ready. Entering control loop.', 'success');
        log('Keys: ↑/W Accel · ↓/S Brake · ←/A Closer · →/D Farther · 1/2/3 Mode', 'info');
        setStatus('normal_idle');
        refreshAll();
    }, 5500);
}


// ─── APPLICATION INITIALIZATION ─────────────────────────────────────────────
// Entry point. Runs the loading screen animation, initializes theme and
// sensor state, binds the cinematic Easter egg, and sets up the horn
// interaction. The boot() sequence is triggered once the loader completes.
document.addEventListener('DOMContentLoaded', () => {
    // Loading screen progress bar animation (synced with 3-second CSS car drive)
    const loaderScreen = document.getElementById('loader-screen');
    const loaderBar = document.getElementById('loader-bar');
    const loadDuration = 3000; // 3 seconds — synced with car animation
    const loadStart = performance.now();

    function animateLoader(now) {
        const elapsed = now - loadStart;
        const progress = Math.min((elapsed / loadDuration) * 100, 100);
        loaderBar.style.width = progress + '%';

        if (progress < 100) {
            requestAnimationFrame(animateLoader);
        } else {
            // Progress complete — fade out overlay and start simulation
            setTimeout(() => {
                loaderScreen.classList.add('fade');
                loaderScreen.addEventListener('transitionend', () => {
                    loaderScreen.remove();
                }, { once: true });
                // Begin the ACC boot sequence after loader exits
                boot();
            }, 300);
        }
    }
    requestAnimationFrame(animateLoader);

    // Disable right-click context menu and text selection for kiosk-style UX
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());

    // Developer console branding
    console.log(
        "%c🚘 Adaptive Cruise Control",
        "color: #3b82f6; font-size: 24px; font-weight: 800; font-family: 'Inter', sans-serif;"
    );
    console.log(
        "%cDesigned & Developed by Amey Thakur %c______________________________________________________",
        "color: #94a3b8; font-size: 13px; font-style: italic; font-family: 'Inter', sans-serif;",
        "color: #334155; font-size: 10px;"
    );
    console.log(
        "%c 👤 Profile: %chttps://github.com/Amey-Thakur\n%c 📂 Repo:    %chttps://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL",
        "color: #818cf8; font-size: 12px; font-weight: bold;", "color: #94a3b8; font-size: 12px; text-decoration: none;",
        "color: #fbbf24; font-size: 12px; font-weight: bold;", "color: #94a3b8; font-size: 12px; text-decoration: none;"
    );
    console.log(
        "\n%c 💡 Engineering Tip:\n%c Implementing a Constant Time-Gap Policy (CTGP) is essential for 'String Stability'. This ensures that speed fluctuations do not amplify across vehicle platoons, maintaining smooth and safe traffic flow dynamics.",
        "color: #22c55e; font-size: 12px; font-weight: bold; font-family: 'Inter', sans-serif;",
        "color: #cbd5e1; font-size: 12px; font-style: italic; line-height: 1.5; font-family: 'Inter', sans-serif;"
    );

    initTheme();
    refreshSensor();
    refreshRoad();

    // Cinematic trigger: typing 'amey' or clicking the header title
    const title = document.querySelector('#header h1');
    if (title) {
        title.style.cursor = 'pointer';
        title.addEventListener('click', startCinematic);
    }

    let eggBuffer = '';
    let eggTimer = null;
    document.addEventListener('keydown', (e) => {
        eggBuffer += e.key.toLowerCase();
        clearTimeout(eggTimer);
        eggTimer = setTimeout(() => eggBuffer = '', 2000);
        if (eggBuffer.includes('amey')) {
            eggBuffer = '';
            startCinematic();
        }
    });

    // Horn interaction: clicking the ACC vehicle body triggers a dual-tone horn
    const egoBody = D.egoCar.querySelector('.car-body');
    if (egoBody) {
        egoBody.addEventListener('click', () => {
            console.log('📡 ACC Horn Activated');
            playHorn();
        });
    }

});

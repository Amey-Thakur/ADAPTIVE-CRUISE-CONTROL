/* =========================================================================================
   ADAPTIVE CRUISE CONTROL — SIMULATION ENGINE v4

   Faithful JS port of the MATLAB ACC algorithm (Adaptive Cruise Control.m)
   2-Lane road · Lane changing · Overtaking · Moving traffic

   MODES: 0 → Normal | 1 → Cruise Control | 2 → Adaptive Cruise
   PINS:  A0 Accel | A1 Brake | A2 Cancel | A3 Cruise | A4 ACC
          D13 Green LED | D12 Red LED | D10 Trig | D8 Echo

   Author: Amey Thakur
   ========================================================================================= */

'use strict';

// ─── STATE ───────────────────────────────────────────────────────────────────
const S = {
    speed: 0,
    mode: 0,           // 0: Normal, 1: Cruise, 2: Adaptive
    distance: 0.50,
    constant: 0,       // Cruise target (cached on ACC activation)
    D13: false,        // Green LED
    D12: false,        // Red LED
    running: false,
    lane: 0,           // 0 = main (bottom), 1 = overtake (top)
    pins: { A0: 0, A1: 0, A2: 0, A3: 0, A4: 0 },
};

// ─── DOM ─────────────────────────────────────────────────────────────────────
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
    btnLaneUp: $('btn-lane-up'), btnLaneDown: $('btn-lane-down'),
    btnM0: $('btn-m0'), btnM1: $('btn-m1'), btnM2: $('btn-m2'),
    themeToggle: $('theme-toggle'),
    iconSun: $('icon-sun'), iconMoon: $('icon-moon'),
};

// Pin bar refs
const PF = {
    A0: $('pf-a0'), A1: $('pf-a1'), A2: $('pf-a2'), A3: $('pf-a3'), A4: $('pf-a4'),
};


// ─── THEME ───────────────────────────────────────────────────────────────────
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


// ─── SERIAL LOGGER ───────────────────────────────────────────────────────────
function log(msg, cls = 'info') {
    const t = new Date();
    const ts = t.toLocaleTimeString('en-US', { hour12: false });
    const ms = String(t.getMilliseconds()).padStart(3, '0');
    const el = document.createElement('div');
    el.innerHTML = `<span class="ts">[${ts}.${ms}]</span> <span class="${cls}">${msg}</span>`;
    D.serial.appendChild(el);
    while (D.serial.children.length > 80) D.serial.removeChild(D.serial.firstChild);
    D.serial.scrollTop = D.serial.scrollHeight;
}


// ─── LCD ─────────────────────────────────────────────────────────────────────
function lcd(r1, r2) {
    D.lcd1.textContent = r1;
    D.lcd2.textContent = r2;
}


// ─── PIN WRITES ──────────────────────────────────────────────────────────────
function setPin(pin, val) {
    S[pin] = !!val;
}

function refreshHW() {
    D.ledG.className = 'hw-led green' + (S.D13 ? ' on' : '');
    D.ledR.className = 'hw-led red' + (S.D12 ? ' on' : '');

    const sensor = S.mode === 2;
    D.ledT.className = 'hw-led cyan' + (sensor ? ' on' : '');
    D.ledE.className = 'hw-led cyan' + (sensor ? ' on' : '');

    // Sensor cone
    const effectiveDist = getEffectiveDistance();
    const danger = effectiveDist < 0.3;
    D.sensorCone.className = 'sensor-cone' +
        (sensor ? ' on' : '') +
        (sensor && danger ? ' danger' : '');

    // Headlights
    const hl = D.egoCar.querySelectorAll('.headlight');
    hl.forEach(h => h.classList.toggle('on', S.D13));

    // Tail lights on lead (only when same lane + danger)
    const tl = D.leadCar.querySelectorAll('.tail-light');
    const sameLane = S.lane === 0;
    tl.forEach(t => t.classList.toggle('on', danger && sensor && sameLane));

    // Distance label
    D.distLabel.className = sensor ? 'show' : '';
}

function refreshPinBars(active) {
    Object.keys(PF).forEach(p => {
        PF[p].className = 'pbar-fill' + (p === active ? ' on' : '');
    });
}


// ─── GAUGE ───────────────────────────────────────────────────────────────────
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


// ─── DISTANCE LOGIC ──────────────────────────────────────────────────────────
function getEffectiveDistance() {
    if (S.lane === 0) return S.distance;  // same lane as lead
    return 1.00;                           // different lane: path clear
}

function refreshSensor() {
    const v = parseInt(D.distSlider.value);
    S.distance = v / 100;

    const eff = getEffectiveDistance();
    const str = eff.toFixed(2) + 'm';
    D.sliderVal.textContent = S.distance.toFixed(2) + 'm';
    D.infoDist.textContent = str;
    D.distLabelVal.textContent = eff.toFixed(2) + ' m';
}


// ─── ROAD ────────────────────────────────────────────────────────────────────
function refreshRoad() {
    // Lead car position based on distance (always bottom lane)
    const pos = 42 + (S.distance * 38);
    D.leadCar.style.left = pos + '%';

    // Ego car lane
    D.egoCar.className = 'car ' + (S.lane === 1 ? 'lane-top' : 'lane-bottom');

    // Road animation speed
    const dashes = document.querySelectorAll('.dash');
    dashes.forEach(d => {
        if (S.speed > 0) {
            d.style.animationDuration = Math.max(0.2, 2.5 - (S.speed / 35)) + 's';
            d.style.animationPlayState = 'running';
        } else {
            d.style.animationPlayState = 'paused';
        }
    });
}





// ─── LANE CHANGE ─────────────────────────────────────────────────────────────
function changeLane(targetLane) {
    if (!S.running) return;
    if (S.lane === targetLane) return;

    S.lane = targetLane;
    const name = targetLane === 1 ? 'OVERTAKE' : 'MAIN';
    log(`LANE CHANGE → ${name} lane`, 'sys');

    if (S.mode === 2) {
        if (targetLane === 1) {
            log('Path clear in overtake lane. ACC accelerating to target.', 'success');
        } else {
            log('Merged back to main lane. Resuming distance tracking.', 'info');
        }
    }

    refreshRoad();
    refreshSensor();
    refreshHW();
}


// ─── TELEMETRY & STATUS ──────────────────────────────────────────────────────
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
    adaptive_overtake: 'Adaptive Cruise — Overtake lane. Path clear, accelerating to target.',
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


// ─── CORE ACC ENGINE ─────────────────────────────────────────────────────────
function tick() {
    if (!S.running) return;

    const effectiveDist = getEffectiveDistance();

    // MODE 0: NORMAL
    if (S.mode === 0) {
        if (S.pins.A0 >= 4) {
            setPin('D13', 1); setPin('D12', 0);
            S.speed += 1;
            setStatus('normal_accel');
        } else if (S.pins.A1 >= 4) {
            S.speed -= 1;
            setStatus('normal_brake');
        }
        if (S.speed < 0) { setPin('D13', 0); setPin('D12', 1); S.speed = 0; }
        if (S.speed === 0 && S.pins.A0 < 4 && S.pins.A1 < 4) setStatus('normal_idle');
        lcd('Vehicle Speed:', String(S.speed));
    }

    // MODE 1: CRUISE CONTROL
    else if (S.mode === 1) {
        if (S.pins.A0 >= 4) {
            setPin('D13', 1); setPin('D12', 0);
            S.speed += 1;
            setStatus('cruise_accel');
        } else if (S.pins.A1 >= 4) {
            S.speed -= 1;
            setStatus('cruise_brake');
        } else {
            setStatus('cruise_hold');
        }
        if (S.speed < 0) { setPin('D13', 0); setPin('D12', 1); S.speed = 0; }
        lcd('Cruise Mode:', String(S.speed));
    }

    // MODE 2: ADAPTIVE CRUISE
    else if (S.mode === 2) {
        setPin('D13', 1); setPin('D12', 0);

        if (S.lane === 1) {
            // Overtake lane — path always clear
            log(`OVERTAKE LANE: Path clear`, 'success');
            S.speed += 1;
            setStatus('adaptive_overtake');
        } else if (effectiveDist < 0.3) {
            log(`PROXIMITY WARNING: ${effectiveDist.toFixed(2)}m — Auto-decelerating`, 'danger');
            S.speed -= 1;
            setStatus('adaptive_danger');
        } else {
            log(`PATH CLEAR: ${effectiveDist.toFixed(2)}m`, 'success');
            S.speed += 1;
            setStatus('adaptive_safe', S.constant + ' km/h');
        }

        if (S.speed > S.constant) {
            S.speed = S.constant;
            setStatus('adaptive_cap');
        }
        if (S.speed < 0) { setPin('D13', 0); setPin('D12', 1); S.speed = 0; }
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


// ─── SPEED CONTROLS (hold-to-repeat) ─────────────────────────────────────────
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

// Mouse
D.btnUp.addEventListener('mousedown', e => { e.preventDefault(); D.btnUp.classList.add('pressed'); startSpeed('A0'); });
D.btnUp.addEventListener('mouseup', () => { D.btnUp.classList.remove('pressed'); stopSpeed('A0'); });
D.btnUp.addEventListener('mouseleave', () => { D.btnUp.classList.remove('pressed'); stopSpeed('A0'); });

D.btnDown.addEventListener('mousedown', e => { e.preventDefault(); D.btnDown.classList.add('pressed'); startSpeed('A1'); });
D.btnDown.addEventListener('mouseup', () => { D.btnDown.classList.remove('pressed'); stopSpeed('A1'); });
D.btnDown.addEventListener('mouseleave', () => { D.btnDown.classList.remove('pressed'); stopSpeed('A1'); });

// Touch
D.btnUp.addEventListener('touchstart', e => { e.preventDefault(); D.btnUp.classList.add('pressed'); startSpeed('A0'); });
D.btnUp.addEventListener('touchend', () => { D.btnUp.classList.remove('pressed'); stopSpeed('A0'); });
D.btnDown.addEventListener('touchstart', e => { e.preventDefault(); D.btnDown.classList.add('pressed'); startSpeed('A1'); });
D.btnDown.addEventListener('touchend', () => { D.btnDown.classList.remove('pressed'); stopSpeed('A1'); });


// ─── MODE BUTTONS ────────────────────────────────────────────────────────────
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
    log(`Mode → CRUISE CONTROL (Mode 1) | Maintaining ${S.speed} km/h`, 'sys');
    setStatus('cruise_hold');
    tick();
    setTimeout(() => { S.pins.A3 = 0; refreshPinBars(null); }, 250);
});

D.btnM2.addEventListener('click', () => {
    S.pins.A4 = 5; refreshPinBars('A4');
    S.constant = S.speed;
    S.mode = 2;
    log(`Mode → ADAPTIVE CRUISE (Mode 2) | Target: ${S.constant} km/h`, 'sys');
    setStatus('adaptive_safe', S.constant + ' km/h');
    tick();
    setTimeout(() => { S.pins.A4 = 0; refreshPinBars(null); }, 250);
});


// ─── DISTANCE SLIDER ─────────────────────────────────────────────────────────
D.distSlider.addEventListener('input', () => { refreshSensor(); refreshHW(); });


// ─── DISTANCE BUTTONS (← Closer / → Farther) ────────────────────────────────
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

// Closer
D.btnCloser.addEventListener('mousedown', e => { e.preventDefault(); startDist(-2, D.btnCloser); });
D.btnCloser.addEventListener('mouseup', () => stopDist(D.btnCloser));
D.btnCloser.addEventListener('mouseleave', () => stopDist(D.btnCloser));
D.btnCloser.addEventListener('touchstart', e => { e.preventDefault(); startDist(-2, D.btnCloser); });
D.btnCloser.addEventListener('touchend', () => stopDist(D.btnCloser));

// Farther
D.btnFarther.addEventListener('mousedown', e => { e.preventDefault(); startDist(2, D.btnFarther); });
D.btnFarther.addEventListener('mouseup', () => stopDist(D.btnFarther));
D.btnFarther.addEventListener('mouseleave', () => stopDist(D.btnFarther));
D.btnFarther.addEventListener('touchstart', e => { e.preventDefault(); startDist(2, D.btnFarther); });
D.btnFarther.addEventListener('touchend', () => stopDist(D.btnFarther));


// ─── LANE BUTTONS ────────────────────────────────────────────────────────────
D.btnLaneUp.addEventListener('click', () => {
    D.btnLaneUp.classList.add('pressed');
    changeLane(1);
    setTimeout(() => D.btnLaneUp.classList.remove('pressed'), 200);
});

D.btnLaneDown.addEventListener('click', () => {
    D.btnLaneDown.classList.add('pressed');
    changeLane(0);
    setTimeout(() => D.btnLaneDown.classList.remove('pressed'), 200);
});


// ─── KEYBOARD ────────────────────────────────────────────────────────────────
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
        case 'q':
            e.preventDefault();
            changeLane(1);
            break;
        case 'e':
            e.preventDefault();
            changeLane(0);
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


// ─── NATURAL DRAG (Normal mode only, no inputs) ─────────────────────────────
setInterval(() => {
    if (!S.running || S.mode !== 0) return;
    if (S.pins.A0 >= 4 || S.pins.A1 >= 4) return;
    if (S.speed > 0) {
        S.speed -= 1;
        setPin('D13', 0);
        if (S.speed <= 0) { S.speed = 0; setPin('D12', 1); }
        setStatus(S.speed > 0 ? 'normal_drag' : 'normal_idle');
        lcd('Vehicle Speed:', String(S.speed));
        refreshAll();
    }
}, 1500);


// ─── ADAPTIVE AUTO-CYCLE ────────────────────────────────────────────────────
setInterval(() => {
    if (!S.running || S.mode !== 2) return;
    refreshSensor();
    tick();
}, 500);





// ─── THEME TOGGLE ────────────────────────────────────────────────────────────
D.themeToggle.addEventListener('click', toggleTheme);


// ─── STARTUP SEQUENCE ────────────────────────────────────────────────────────
function boot() {
    log('═══════════════════════════════════════', 'info');
    log('Adaptive Cruise Control · Simulation', 'info');
    log('Arduino Uno R3 · COM5 · 9600 baud', 'info');
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
        log('Keys: ↑/W Accel · ↓/S Brake · ←/A Closer · →/D Farther', 'info');
        log('Keys: Q Overtake Lane · E Main Lane · 1/2/3 Mode', 'info');
        setStatus('normal_idle');
        refreshAll();
    }, 5500);
}


// ─── INIT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Security: Anti-right-click & Anti-select
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('selectstart', e => e.preventDefault());

    // Easter Egg
    console.log(
        "%c🚘 ACC Simulation v4.0.0",
        "color: #3b82f6; font-size: 20px; font-weight: bold; font-family: 'Inter', sans-serif;"
    );
    console.log(
        "%cDesigned & Developed by Amey Thakur\n%c\"Precision is the soul of engineering.\"",
        "color: #94a3b8; font-size: 14px; font-style: italic;",
        "color: #22c55e; font-size: 12px; font-weight: bold;"
    );

    initTheme();
    refreshSensor();
    refreshRoad();
    boot();
});

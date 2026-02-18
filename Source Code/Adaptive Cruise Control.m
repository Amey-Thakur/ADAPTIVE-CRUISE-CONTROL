% =========================================================================================
% FILE NAME: Adaptive Cruise Control.m
% AUTHOR: [Amey Thakur](https://github.com/Amey-Thakur)
% GROUP MEMBERS: Nandeshwar Royal Uppalapati, Brano Bruno Barshmen
% PROJECT REPO: https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL
% COURSE REPO: https://github.com/Amey-Thakur/COMPUTATIONAL-METHODS-AND-MODELING-FOR-ENGINEERING-APPLICATIONS
%
% DESCRIPTION:
% This MATLAB script implements a high-fidelity Adaptive Cruise Control (ACC) system 
% utilizing the MATLAB Support Package for Arduino. The system dynamically manages 
% vehicle velocity through real-time sensor feedback, enabling automated speed 
% regulation based on environmental proximity.
%
% HOW IT WORKS:
% The system operates in three distinct pedagogical modes:
% 1. Normal Mode: Manual velocity regulation via analog potentiometers.
% 2. Cruise Control: Automated maintenance of a user-defined target velocity.
% 3. Adaptive Cruise: Proximity-aware velocity modulation. The system utilizes 
%    an ultrasonic sensor to detect leading vehicles; if the safety distance (0.3m) 
%    is breached, the system automatically decelerates. Once the path is clear, 
%    it returns to the cruise velocity.
%
% TECHNOLOGY STACK:
% - Programming Language: MATLAB (R2023a+)
% - Hardware Interface: Arduino Uno (COM5)
% - Peripherals: Ultrasonic Sensor (HC-SR04), 16x2 LCD Display (I2C/Parallel), 
%   Analog Potentiometers, LED Indicators.
% 
% RELEASE DATE: September 08, 2023
% LICENSE: MIT License
% =========================================================================================

% --- Environment Initialization ---
clc;    % Clear Command Window for professional output
clear;  % Purge all variables from the workspace to ensure state integrity

% --- Hardware Configuration ---
% Establishes a communication bridge with the Arduino Uno on COM5
% Includes necessary hardware abstraction layers for Ultrasonic sensing and LCD output
ar = arduino('COM5', 'Uno', 'Libraries', {'Ultrasonic', 'ExampleLCD/LCDAddOn'}, 'ForceBuildOn', true);

% Initialization of the HC-SR04 Ultrasonic proximity sensor
% Dedicated Trigger Pin: D10 | Echo Pin: D8
ul = ultrasonic(ar, 'D10', 'D8');

% Configuration of the 16x2 LCD Peripheral
% Defines Register Select (D7), Enable (D6), and 4-bit Data Bus (D5, D4, D3, D2)
lcd = addon(ar, 'ExampleLCD/LCDAddOn', 'RegisterSelectPin', 'D7', 'EnablePin', 'D6', 'DataPins', {'D5', 'D4', 'D3', 'D2'});

% --- System Startup Sequence ---
initializeLCD(lcd); % Initialize LCD buffer and hardware
clearLCD(lcd);      % Flush display for initial branding
printLCD(lcd, 'WELCOME TO');
printLCD(lcd, 'ACC PROJECT');
pause(5);           % Display welcome sequence for 5 seconds

clearLCD(lcd);
printLCD(lcd, 'Group 32');
printLCD(lcd, 'Amey,Brano,Nandu');
pause(5);           % Display authorship sequence for 5 seconds
clearLCD(lcd);

% --- State Variable Declaration ---
speed = 0;                  % Current simulated vehicle velocity (initializes at rest)
increase_speed = 0;         % Potentiometer input buffer for acceleration
decrease_speed = 0;         % Potentiometer input buffer for deceleration
cancel = 0;                 % Control override buffer (Manual Reset)
set_speed = 0;              % Cruise Control activation buffer
adaptive_cruise_speed = 0;  % ACC activation buffer
distance = 0;               % Real-time proximity data (meters)
mode = 0;                   % Operational Mode (0: Normal, 1: Cruise, 2: Adaptive)

% --- Real-Time Control Loop ---
while true
    % 1: Sensory Data Acquisition
    % Read analog control voltages (0-5V) to determine user intent
    increase_speed = readVoltage(ar, 'A0');
    decrease_speed = readVoltage(ar, 'A1');
    cancel = readVoltage(ar, 'A2');
    set_speed = readVoltage(ar, 'A3');
    adaptive_cruise_speed = readVoltage(ar, 'A4');

    % Read ultrasonic proximity measurement
    distance = readDistance(ul);

    % 2: Mode Selection Logic
    if cancel >= 4
        mode = 0;   % Transition to Normal Operational Mode
    elseif set_speed >= 4
        mode = 1;   % Transition to Cruise Control Mode
    elseif adaptive_cruise_speed >= 4
        mode = 2;   % Transition to Adaptive Cruise Control (ACC) Mode
        constant = speed; % Cache current velocity as the Target Cruise Velocity
    end

    % 3: Computational Processing & Actuation
    
    % --- MODE 0: NORMAL OPERATION ---
    if mode == 0
        if increase_speed >= 4
            % Simulate Acceleration
            writeDigitalPin(ar, 'D13', 1); % Trigger Acceleration Indicator (LED)
            writeDigitalPin(ar, 'D12', 0);
            speed = speed + 1;
            pause(0.1);
        elseif decrease_speed >= 4
            % Simulate Manual Braking
            speed = speed - 1;
            pause(0.1);
        else
            % Simulate Natural Kinetic Deceleration (Drag)
            speed = speed - 1;
            pause(1.5);
        end

        % Velocity Boundary Enforcement
        if speed < 0
            writeDigitalPin(ar, 'D13', 0);
            writeDigitalPin(ar, 'D12', 1); % Trigger Stop Indicator (LED)
            speed = 0;
        end
        
        % Data Visualization
        printLCD(lcd, 'Vehicle Speed: ');
        printLCD(lcd, [strcat(num2str(speed))]);
        
    % --- MODE 1: CRUISE CONTROL ---
    elseif mode == 1
        if increase_speed >= 4
            writeDigitalPin(ar, 'D13', 1);
            writeDigitalPin(ar, 'D12', 0);
            speed = speed + 1;
            pause(0.1);
        elseif decrease_speed >= 4
            speed = speed - 1;
            pause(0.1);
        end

        % Safety Boundary Enforcement
        if speed < 0
            writeDigitalPin(ar, 'D13', 0);
            writeDigitalPin(ar, 'D12', 1);
            speed = 0;
        end

        % Mode and Velocity Feedback
        printLCD(lcd, 'Cruise mode: ');
        printLCD(lcd, [strcat(num2str(speed))]);
        
    % --- MODE 2: ADAPTIVE CRUISE CONTROL (ACC) ---
    elseif mode == 2
        clearLCD(lcd);
        pause(0.5);      % Visual confirmation of mode transition
        initializeLCD(lcd);
        writeDigitalPin(ar, 'D13', 1);
        writeDigitalPin(ar, 'D12', 0);

        % Predictive Distance Control Algorithm
        if distance < 0.3
            % Hazard Detected: Automated Deceleration Sequence
            disp(['PROXIMITY WARNING: ', num2str(distance), 'm']);
            speed = speed - 1;
        else
            % Safe Zone: Velocity Restoration to Target Cruise Speed
            disp(['PATH CLEAR: ', num2str(distance), 'm']);
            speed = speed + 1;
        end

        % Velocity Cap: Do not exceed user-defined Cruise Speed
        if speed > constant
            speed = constant;
        end
        
        % Universal Safety Guard
        if speed < 0
            writeDigitalPin(ar, 'D13', 0);
            writeDigitalPin(ar, 'D12', 1);
            speed = 0;
        end

        % Real-time ACC Status Feedback
        printLCD(lcd, 'Adap_Cruise_mode');
        printLCD(lcd, [strcat(num2str(speed))]);
    end
end

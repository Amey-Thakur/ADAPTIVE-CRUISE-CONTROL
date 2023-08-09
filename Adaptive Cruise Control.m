% Clear all variables in the workspace
clc;
clear;

% Creation of variable for Arduino
ar = arduino('COM5','Uno','Libraries',{'Ultrasonic','ExampleLCD/LCDAddOn'},'ForceBuildOn',true);
% Initializes a connection with an Arduino board connected to COM5 port
% and specifies the libraries to be used (Ultrasonic and ExampleLCD/LCDAddOn)

% Creation of variable for Ultrasonic Sensor
ul = ultrasonic(ar,'D10','D8');
% Initializes an ultrasonic sensor connected to digital pins D10 (trigger)
% and D8 (echo) of the Arduino
lcd = addon(ar,"ExampleLCD/LCDAddOn",'RegisterSelectPin','D7','EnablePin','D6','DataPins',{'D5','D4','D3','D2'});
% Initializes an LCD display connected to the Arduino using specific pins

initializeLCD(lcd);
% Initializes the LCD display

clearLCD(lcd);
% Clears the content displayed on the LCD

printLCD(lcd, 'WELCOME TO');
printLCD(lcd, 'ACC PROJECT');
% Prints "WELCOME TO" on the first line of the LCD display
% Prints "ACC PROJECT" on the second line of the LCD display
pause(5);
% Pauses MATLAB execution for 5 seconds

clearLCD(lcd);
% Clears the content displayed on the LCD

printLCD(lcd, 'Group 32');
printLCD(lcd, 'Amey,Brano,Nandu');
% Prints "Group 32" on the first line of the LCD display
% Prints "Amey,Brano,Nandu" on the second line of the LCD display

pause(5);
% Pauses MATLAB execution for 5 seconds

% Declaration of Variables
speed = 0;
increase_speed = 0;
decrease_speed = 0;
cancel = 0;
set_speed = 0;
adaptive_cruise_speed = 0;
distance = 0;
mode = 0;

while true
    % Infinite loop to continuously monitor and update the speed
    % Get inputs from user
    increase_speed = readVoltage(ar,'A0');
    % Read the voltage value from analog input pin A0
    decrease_speed = readVoltage(ar,'A1');
    % Read the voltage value from analog input pin A1
    cancel = readVoltage(ar,'A2');
    % Read the voltage value from analog input pin A2
    set_speed = readVoltage(ar,'A3');
    % Read the voltage value from analog input pin A3
    adaptive_cruise_speed = readVoltage(ar,'A4');
    % Read the voltage value from analog input pin A4

    % Get the input from the ultrasonic sensor as distance
    distance = readDistance(ul);

    if cancel >= 4
        mode = 0;
        % If the cancel button is pressed (voltage value >= 4),
        % set mode to 0 (Normal Mode)
    elseif set_speed >= 4
        mode = 1;
        % If the set speed button is pressed (voltage value >= 4),
        % set mode to 1 (Cruise Control Mode)
    elseif adaptive_cruise_speed >= 4
        mode = 2;
        constant = speed;
        % If the adaptive cruise control button is pressed (voltage value >= 4),
        % set mode to 2 (Adaptive Cruise Control Mode) and store the current speed in 'constant'
    end

    % Normal Mode
    if mode == 0
        if increase_speed >= 4
            writeDigitalPin(ar, 'D13', 1);
            writeDigitalPin(ar, 'D12', 0);
            speed = speed + 1;
            pause(0.1);
        elseif decrease_speed >= 4
            speed = speed - 1;
            pause(0.1);
        else
            speed = speed - 1;
            pause(1.5);
        end

        if speed < 0
            writeDigitalPin(ar, 'D13', 0);
            writeDigitalPin(ar, 'D12', 1);
            speed = 0;
        end
        printLCD(lcd,'Vehicle Speed: ');
        % Prints "Vehicle Speed: " on the LCD display
        printLCD(lcd,[strcat(num2str(speed))]);
        % Prints the current speed on the LCD display
    % Cruise Control Mode
    elseif mode == 1
        if increase_speed >= 4
            writeDigitalPin(ar, 'D13', 1);
            writeDigitalPin(ar, 'D12', 0);
            speed = speed + 1;
            pause(0.1);
        elseif decrease_speed >= 4
            speed = speed - 1;
            pause(0.1)
        end

        if speed < 0
            writeDigitalPin(ar, 'D13', 0);
            writeDigitalPin(ar, 'D12', 1);
            speed = 0;
        end

        printLCD(lcd,'Cruise mode: ');
        % Prints "Cruise mode: " on the LCD display
        printLCD(lcd,[strcat(num2str(speed))]);
        % Prints the current speed on the LCD display
    % Adaptive Cruise Control Mode
    elseif mode == 2
        clearLCD(lcd);
        pause(0.5);
        % Clears the LCD display and pauses for 0.5 seconds (blinking effect)
        initializeLCD(lcd);
        % Reinitializes the LCD display
        writeDigitalPin(ar, 'D13', 1);
        writeDigitalPin(ar, 'D12', 0);

        if distance < 0.3
            disp(distance);
            speed = speed - 1;
        else
            disp(distance);
            speed = speed + 1;
        end

        if speed > constant
            speed = constant;
        end
        if speed < 0
            writeDigitalPin(ar, 'D13', 0);
            writeDigitalPin(ar, 'D12', 1);
            speed = 0;
        end

        printLCD(lcd,'Adap_Cruise_mode');
        % Prints "Adap_Cruise_mode" on the LCD display
        printLCD(lcd,[strcat(num2str(speed))]);
        % Prints the current speed on the LCD display
    end
end

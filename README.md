# ADAPTIVE-CRUISE-CONTROL

 👍🏻 GENG8030: MATLAB - Project [SEMESTER II]
 
 - [X] **GENG8030: [MATLAB](https://github.com/Amey-Thakur/COMPUTATIONAL-METHODS-AND-MODELING-FOR-ENGINEERING-APPLICATIONS)**

---

>**[Matlab code](https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL/blob/main/Adaptive%20Cruise%20Control.m)**

![ACC Circuit View](https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL/assets/54937357/66e33659-2604-45a3-b138-b829941594d5)

---

### Flowchart

![image](https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL/assets/54937357/3d4f8413-2923-4855-b758-851bf653572f)

---

### Algorithm: ACC

    1.	Initialize the Arduino board and Ultrasonic Sensor.
    2.	Initialize the LCD display and clear its content.
    3.	Print project name and group number on the first two lines of the LCD display.
    4.	Pause execution for 5 seconds to display the information.
    5.	Clear the LCD display.
    6.	Print team members' names on the LCD display.
    7.	Pause execution for 5 seconds to display the information.
    8.	Declare and initialize variables for various inputs and modes:
        -	speed: current vehicle speed
        -	increase_speed: input from the increase speed button
        -	decrease_speed: input from the decrease speed button
        -	cancel: input from the cancel button
        -	set_speed: input from the set speed button
        -	adaptive_cruise_speed: input from the adaptive cruise control button
        -	distance: distance measured by the ultrasonic sensor
        -	mode: variable to indicate the current mode of operation (0 = Normal Mode, 1 = Cruise Control Mode, 2 = Adaptive Cruise Control Mode)
    9.	Enter an infinite loop to continuously monitor and update the vehicle speed.
        -	Read inputs from the analog pins on the Arduino board for the various buttons and the ultrasonic sensor.
        -	Determine the mode of operation based on button inputs:
        -	If the cancel button is pressed (voltage value >= 4), set mode to 0 (Normal Mode).
        -	If the set speed button is pressed (voltage value >= 4), set mode to 1 (Cruise Control Mode).
        -	If the adaptive cruise control button is pressed (voltage value >= 4), set mode to 2 (Adaptive Cruise Control Mode) and store the current speed in 'constant'.

    10.	Implement different behaviors based on the current mode:
        -	Normal Mode:
        -	Increase speed if the increase speed button is pressed.
        -	Decrease speed if the decrease speed button is pressed.
        -	Gradually decrease speed if no button is pressed.
        -	Ensure speed doesn't go below 0.
        -	Display the current speed on the LCD display with the label "Vehicle Speed: ".

        -	Cruise Control Mode:
        -	Increase speed if the increase speed button is pressed.
        -	Decrease speed if the decrease speed button is pressed.
        -	Ensure speed doesn't go below 0.
        -	Display the current speed on the LCD display with the label "Cruise mode: ".
        
        -	Adaptive Cruise Control Mode:
        -	Clear the LCD display and display a blinking effect.
        -	Reinitialize the LCD display.
        -	Activate the vehicle's motor (D13) and deactivate the brake (D12).
        -	Adjust speed based on the distance measured by the ultrasonic sensor:
        -	If the distance is less than 0.3 units, decrease the speed.
        -	If the distance is greater than or equal to 0.3 units, increase the speed.
        -	Ensure the speed doesn't exceed the constant value (stored previously).
        -	Ensure speed doesn't go below 0.
        -	Display the current speed on the LCD display with the label "Adap_Cruise_mode".

    11.	End of the infinite loop.

---

### Working Model

A. Circuit Connections

![Circuit Connections](https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL/assets/54937357/622277b5-b2b8-461e-8d48-7099bd46342d)

B. Welcome Message

 ![Welcome message](https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL/assets/54937357/9d45eef8-df90-4f74-9881-49fd9664f90a)

C.	Group Number & Names

 ![Group Number   Names](https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL/assets/54937357/0c4f6580-c18c-4445-a4a6-35247d9c3dbc)

D.	Circuit at initial (zero speed)

 ![Circuit at initial (zero speed)](https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL/assets/54937357/03f5102e-808f-47ec-9a63-78bd2adf1edf)

E.	Circuit in Cruise Mode (non-zero speed)

 ![Circuit in Cruise Mode (non-zero speed)](https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL/assets/54937357/44df42e4-3892-41ba-9ed0-9689ece2e6ea)

F.	Circuit in Cruise Mode (zero speed)

 ![Circuit in Cruise Mode (zero speed)](https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL/assets/54937357/d6665663-4968-4c11-bf7a-9d7aabfae584)

G.	Circuit in Adaptive Cruise Control Mode (no object in front of the ultrasonic sensor)

 ![Circuit in Adaptive Cruise Control Mode (no object in front of ultrasonic sensor)](https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL/assets/54937357/9a0aa4e9-0bb7-4b6f-ae79-059dd163e5f0)

H.	Circuit in Adaptive Cruise Control Mode (an object in front of the ultrasonic sensor)

![Circuit in Adaptive Cruise Control Mode (an object in front of ultrasonic sensor)](https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL/assets/54937357/f583253e-b616-4e5d-bf90-248a140ba1b1)

---

<p align="center"> <b> 👉🏻 Presented as a part of the 2nd Semester Project @ University of Windsor 👈🏻 <b> </p>

<p align="center"> <b> 👷 Project Authors: Amey Thakur, Nandeshwar Royal and Brano Barshmen (Batch of 2024) <b> </p>
 
<p align="center"><a href='https://github.com/Amey-Thakur/MENG-COMPUTER-ENGINEERING', style='color: greenyellow;'> ✌🏻 Back To Engineering ✌🏻</p>

<div align="center">

  # Adaptive Cruise Control

  [![License](https://img.shields.io/badge/License-MIT-lightgrey)](LICENSE)
  ![Status](https://img.shields.io/badge/Status-Completed-success)
  ![MATLAB | Simulink](https://img.shields.io/badge/Stack-MATLAB%20%7C%20Simulink-orange?style=flat&logo=mathworks&logoColor=white)
  ![Arduino](https://img.shields.io/badge/Arduino-Uno-00979D?style=flat)
  [![Developed by Amey Thakur](https://img.shields.io/badge/Developed%20by-Amey%20Thakur-blue.svg)](https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL)

  An Adaptive Cruise Control (ACC) system developed as a **2nd-Semester Project** for the **MEng Computer Engineering** program. This implementation utilizes MATLAB and Arduino to demonstrate real-time sensory feedback, automated speed regulation, and proximity-aware safety logic.

  **[Source Code](Source%20Code/)** &nbsp;·&nbsp; **[Technical Specification](docs/SPECIFICATION.md)** &nbsp;·&nbsp; **[ACC Algorithm](Source%20Code/Adaptive%20Cruise%20Control%20Algorithm.txt)**

  <img src="Source Code/figures/Adaptive Cruise Control Overview.jpg" width="80%" alt="ACC Overview">

</div>

---

<div align="center">

  [Authors](#authors) &nbsp;·&nbsp; [Overview](#overview) &nbsp;·&nbsp; [Features](#features) &nbsp;·&nbsp; [Structure](#project-structure) &nbsp;·&nbsp; [Hardware Components](#hardware-components) &nbsp;·&nbsp; [Tinkercad Simulation](#tinkercad-simulation) &nbsp;·&nbsp; [Working Model](#arduino-working-model) &nbsp;·&nbsp; [Usage Guidelines](#usage-guidelines) &nbsp;·&nbsp; [License](#license) &nbsp;·&nbsp; [About](#about-this-repository) &nbsp;·&nbsp; [Acknowledgments](#acknowledgments)

</div>

---

<!-- AUTHORS -->
<div align="center">

  ## Authors

  **University of Windsor | MEng Computer Engineering | Batch of 2024**

| <a href="https://github.com/Amey-Thakur"><img src="https://github.com/Amey-Thakur.png" width="150" height="150" alt="Amey Thakur"></a><br>[**Amey Thakur**](https://github.com/Amey-Thakur)<br><br>[![ORCID](https://img.shields.io/badge/ORCID-0000--0001--5644--1575-green.svg)](https://orcid.org/0000-0001-5644-1575) |
| :---: |

</div>

> [!IMPORTANT]
> ### 🤝🏻 Special Acknowledgement
> *Special thanks to **Brano Bruno Barshmen** and **Nandeshwar Royal Uppalapati** for their meaningful contributions, guidance, and support that helped shape this work.*

---

<!-- OVERVIEW -->
## Overview

The **Adaptive Cruise Control (ACC)** system is a sophisticated embedded control project developed during the **2nd Semester** of the **MEng in Computer Engineering** program at the **University of Windsor**. The project implements a closed-loop control system that manages vehicle velocity through real-time telemetry. By utilizing an ultrasonic sensor to monitor the distance to leading vehicles, the system dynamically adjusts speed to maintain a safe threshold of **0.3 meters**. This project demonstrates the practical application of the **MATLAB Support Package for Arduino**, bridge-linking high-level computational logic with physical hardware actuators and indicators.

> [!TIP]
> **Engineering Synthesis**: The development of this Adaptive Cruise Control system explores the critical transition from manual open-loop participation to automated **Closed-Loop Feedback Control**. By utilizing deterministic logic to bridge real-time telemetric distance acquisition with variable motor-speed actuation, the project demonstrates the fundamental principles of **cyber-physical systems**. This implementation serves as a scholarly milestone in understanding how digital abstractions can reliably govern physical safety parameters in automotive environments.

### Resources

| # | Resource | Description |
|---|---|---|
| 1 | [Technical Specification](docs/SPECIFICATION.md) | Technical architecture and control logic specification |
| 2 | [ACC Algorithm](Source%20Code/Adaptive%20Cruise%20Control%20Algorithm.txt) | Step-by-step logic for speed and proximity regulation |
| 3 | [Source Code](Source%20Code/Adaptive%20Cruise%20Control.m) | Primary MATLAB implementation script |
| 4 | [Arduino Working Model](Source%20Code/figures/Arduino%20Working%20Model/) | Physical hardware implementation and operational states |
| 5 | [Hardware Components](Source%20Code/figures/Hardware%20Components/) | Visual documentation of standalone project components |
| 6 | [Tinkercad Simulation](Source%20Code/figures/Tinkercad%20Simulation/) | Virtual prototyping results and circuit logic views |
| 7 | [MATLAB Repository](https://github.com/Amey-Thakur/COMPUTATIONAL-METHODS-AND-MODELING-FOR-ENGINEERING-APPLICATIONS) | Academic repository for Computational Methods and Modeling |
| 8 | [Engineering Repository](https://github.com/Amey-Thakur/MENG-COMPUTER-ENGINEERING) | Master repository for MEng Computer Engineering |

---

<!-- FEATURES -->
## Features

| Feature | Description |
|---------|-------------|
| **Normal Mode** | Manual velocity regulation via potentiometers with simulated kinetic drag. |
| **Cruise Control** | Automated maintenance of a user-defined target velocity. |
| **Adaptive Logic** | Proximity-aware deceleration when safety buffers are breached (< 0.3m). |
| **Real-time Feedback** | Standard LCD telemetry showing vehicle speed and operational mode. |
| **Safety Indicators** | Dual-LED system for real-time acceleration (Green) and braking (Red) status. |
| **Hardware Integration** | Direct interface with Arduino Uno and HC-SR04 Ultrasonic sensors. |

### Tech Stack
- **Programming Language**: MATLAB (R2023a+)
- **Hardware Abstraction**: MATLAB Support Package for Arduino
- **Peripheral Libraries**: `Ultrasonic`, `ExampleLCD/LCDAddOn`
- **Controller**: Arduino Uno
- **Peripherals**: HC-SR04 Ultrasonic Sensor, 16x2 LCD Display (I2C/Parallel)
- **Control Interface**: 5x Analog Potentiometers (Manual Control & Mode PWM)
- **Safety Indicators**: Dual-LED Feedback System (Green: Accel | Red: Stop)
- **Simulation Platform**: Tinkercad (Hardware & Schematic Prototyping)

---

<!-- STRUCTURE -->
## Project Structure

```python
ADAPTIVE-CRUISE-CONTROL/
│
├── docs/                                    # Formal Documentation
│   └── SPECIFICATION.md                     # Technical Architecture & Specification
│
├── Source Code/                             # Core Implementation
│   ├── figures/                             # Visual Documentation Assets
│   │   ├── Arduino Working Model/           # Real-world Hardware Implementation
│   │   ├── Hardware Components/             # Standalone Component Visuals
│   │   ├── Tinkercad Simulation/            # Virtual Prototyping Results
│   │   ├── Adaptive Cruise Control Flowchart.png
│   │   ├── Adaptive Cruise Control Overview.jpg
│   │   ├── Component Table.jpg
│   │   └── Project Gantt Chart.jpg
│   │
│   ├── Adaptive Cruise Control.m            # Main MATLAB Control Script
│   └── Adaptive Cruise Control Algorithm.txt# Logistical Algorithm Steps
│
├── .gitattributes                           # Git Configuration
├── .gitignore                               # Git Ignore Rules
├── CITATION.cff                             # Citation Metadata
├── codemeta.json                            # Project Metadata (JSON-LD)
├── LICENSE                                  # MIT License
├── README.md                                # Main Documentation
└── SECURITY.md                              # Security Policy & Posture
```

---

<!-- HARDWARE GALLERY -->
## Hardware Components

<div align="center">

  ### Bill of Materials: Component Table
  
  | Name | Quantity | Component |
  | :--- | :---: | :--- |
  | **U2** | 1 | Arduino Uno R3 |
  | **S1, S2, S3, S4, S5** | 5 | Pushbutton |
  | **R1, R2** | 2 | 10 mΩ Resistor |
  | **R3, R4, R5** | 3 | 50 mΩ Resistor |
  | **U3** | 1 | LCD 16 x 2 |
  | **Rpot2** | 1 | 250 kΩ Potentiometer |
  | **DIST1** | 1 | Ultrasonic Distance Sensor |
  | **D1, D2** | 2 | Red LED |
  | **R6, R7** | 2 | 10 kΩ Resistor |

  ### Main Controller & Display Interface
  
  **Arduino Uno R3: Technical Pinout & Architecture**  <br><br>
  <img src="Source Code/figures/Hardware Components/02 - Arduino Uno.png" width="650" alt="Arduino Uno Technical Diagram">

  **LCD Display (16x2): Pin Configuration & Interface**  <br><br>
  <img src="Source Code/figures/Hardware Components/01 - LCD Display.png" width="400" alt="LCD Display Technical Diagram">

  ### Sensory & Connectivity
  <br>

  | Ultrasonic Sensor (HC-SR04) | Jumper Wires: Connectivity |
  | :---: | :---: |
  | <img src="Source Code/figures/Hardware Components/05 - Ultrasonic Sensor.png" width="400" alt="Ultrasonic Sensor"> | <img src="Source Code/figures/Hardware Components/07 - Jumper Wires.jpg" width="400" alt="Jumper Wires"> |
  | **Resistor Color Codes** | **Breadboard Technical Layout** |
  | <img src="Source Code/figures/Hardware Components/06 - Resistor.png" width="400" alt="Resistor"> | <img src="Source Code/figures/Hardware Components/08 - Breadboard.png" width="400" alt="Breadboard"> |

  ### User Interface & Input Controls
  <br>

  | Potentiometer Control | Push Button | Digital Input |
  | :---: | :---: | :---: |
  | <img src="Source Code/figures/Hardware Components/09 - Potentiometer.png" width="230" alt="Potentiometer"> | <img src="Source Code/figures/Hardware Components/03 - Push Button.jpg" width="230" alt="Push Button"> | <img src="Source Code/figures/Hardware Components/04 - Digital Input.jpg" width="230" alt="Digital Input"> |

</div>

---

<!-- SIMULATION RESULTS -->
## Tinkercad Simulation

<div align="center">

  ### Circuit View
  *Detailed virtual breadboard layout demonstrating sensor-to-controller mapping.*
  <br><br>
  <img src="Source Code/figures/Tinkercad Simulation/01 - Circuit View.jpg" width="90%" alt="Circuit View">

  ### Schematic View
  *Electrical representation of the ACC logic, highlighting terminal interconnectivity.*
  <br><br>
  <img src="Source Code/figures/Tinkercad Simulation/02 - Schematic View.jpg" width="90%" alt="Schematic View">

  ### Simulation Logic
  *Visualizing discrete state transitions between manual cruise and autonomous adaptive speed control.*
  <br><br>
  | Welcome Message | Group Details | Initial Resting State |
  | :---: | :---: | :---: |
  | <img src="Source Code/figures/Tinkercad Simulation/03 - Welcome Message.jpg" width="250"> | <img src="Source Code/figures/Tinkercad Simulation/04 - Group Number & Names.jpg" width="250"> | <img src="Source Code/figures/Tinkercad Simulation/05 - Circuit at Initial (Zero Speed).jpg" width="250"> |
  | **Cruise Active** | **Cruise (Zero Speed)** | **Adaptive (Safe)** |
  | <img src="Source Code/figures/Tinkercad Simulation/06 - Circuit in Cruise Mode (Non-Zero Speed).jpg" width="250"> | <img src="Source Code/figures/Tinkercad Simulation/07 - Circuit in Cruise Mode (Zero Speed).jpg" width="250"> | <img src="Source Code/figures/Tinkercad Simulation/08 - Adaptive Cruise Mode (Safe Distance).jpg" width="250"> |

</div>

---

<!-- WORKING MODEL -->
## Arduino Working Model

<div align="center">

  ### Physical Circuit Connections
  *Macro-perspective of the finalized Arduino assembly within the hardware enclosure.*
  <br><br>
  <img src="Source Code/figures/Arduino Working Model/01 - Circuit Connections.jpg" width="90%" alt="Hardware Connections">

  ### Hardware States
  *Real-time performance of the physical system across various cruise and safety scenarios.*
  <br><br>
  | Activation Screen | Member Display | System Resting |
  | :---: | :---: | :---: |
  | <img src="Source Code/figures/Arduino Working Model/02 - Welcome Message.jpg" width="250"> | <img src="Source Code/figures/Arduino Working Model/03 - Group Number & Names.jpg" width="250"> | <img src="Source Code/figures/Arduino Working Model/04 - Circuit at Initial (Zero Speed).jpg" width="250"> |
  | **Cruise Velocity** | **Adaptive Control** | **Hazard Detected** |
  | <img src="Source Code/figures/Arduino Working Model/05 - Circuit in Cruise Mode (Non-Zero Speed).jpg" width="250"> | <img src="Source Code/figures/Arduino Working Model/07 - Adaptive Cruise Mode (No Object in Front of Sensor).jpg" width="250"> | <img src="Source Code/figures/Arduino Working Model/08 - Adaptive Cruise Mode (Object in Front of Sensor).jpg" width="250"> |

</div>

---

<!-- LOGISTICS -->
## Project Logistics

<div align="center">

  ### Project Flowchart
  <br>
  <img src="Source Code/figures/Adaptive Cruise Control Flowchart.png" width="90%" alt="ACC Flowchart">

  ### Gantt Chart
  <br>
  <img src="Source Code/figures/Project Gantt Chart.jpg" width="90%" alt="Gantt Chart">

</div>

---

<!-- USAGE SECTION -->
## Usage Guidelines

This repository is shared to support scholarly exchange and advance ideas in modern automotive control systems.

**For Students**  
Utilize this project as a reference for MATLAB-Arduino interfacing, sensor fusion, and closed-loop control logic. The source code and simulation screenshots provide a comprehensive roadmap for hardware-level programming.

**For Educators**  
This repository serves as a practical implementation of real-time control systems. Attribution is appreciated when utilizing the architectural flow or technical visuals for instructional purposes.

**For Researchers**  
The technical specification and modular code structure provide insights into the behavioral modeling of adaptive cruise systems in a controlled academic environment.

---

<!-- LICENSE -->
## License

This repository and its technical assets are made available under the **MIT License**. See the [LICENSE](LICENSE) file for complete terms.

> [!NOTE]
> **Summary**: You are free to share and adapt this content for any purpose, even commercially, as long as you provide appropriate attribution to the original author.

Copyright © 2023 Amey Thakur

---

<!-- ABOUT -->
## About This Repository

**Created & Maintained by**: [Amey Thakur](https://github.com/Amey-Thakur)  
**Academic Journey**: Master of Engineering in Computer Engineering (2023-2024)  
**Course**: [Computational Methods and Modeling](https://github.com/Amey-Thakur/COMPUTATIONAL-METHODS-AND-MODELING-FOR-ENGINEERING-APPLICATIONS)  
**Institution**: [University of Windsor](https://www.uwindsor.ca/), Windsor, Ontario  
**Faculty**: [Faculty of Engineering](https://www.uwindsor.ca/engineering/)

This project showcases the **Adaptive Cruise Control (ACC)** system, a real-time engineering solution developed to address automotive safety and efficiency. It serves as a milestone in the academic study of computational methods and modeling for engineering applications.

**Connect:** [GitHub](https://github.com/Amey-Thakur) &nbsp;·&nbsp; [LinkedIn](https://www.linkedin.com/in/amey-thakur) &nbsp;·&nbsp; [ORCID](https://orcid.org/0000-0001-5644-1575)

### Acknowledgments

Grateful acknowledgment to [**Mega Satish**](https://github.com/msatmod) for her meaningful contributions, guidance, and support that helped shape this work. Her collaboration and technical insights were instrumental in achieving the project's functional objectives.

Grateful acknowledgment to project partners **Brano Bruno Barshmen** and **Nandeshwar Royal Uppalapati** for their collaborative spirit and technical contributions during the development of this adaptive cruise control system.

Grateful acknowledgment to the faculty members of the Department of Electrical and Computer Engineering at the University of Windsor for their guidance and instruction. Their expertise in computational modeling and embedded systems was vital to the successful realization of this project.

Special thanks to the engineering project partners and peers for their continuous support and collaborative spirit throughout the 2023-2024 academic cycle.

---

<!-- FOOTER SECTION -->
<div align="center">

  [↑ Back to Top](#adaptive-cruise-control)

  [Authors](#authors) &nbsp;·&nbsp; [Overview](#overview) &nbsp;·&nbsp; [Features](#features) &nbsp;·&nbsp; [Structure](#project-structure) &nbsp;·&nbsp; [Hardware Components](#hardware-components) &nbsp;·&nbsp; [Tinkercad Simulation](#tinkercad-simulation) &nbsp;·&nbsp; [Working Model](#arduino-working-model) &nbsp;·&nbsp; [License](#license) &nbsp;·&nbsp; [About](#about-this-repository) &nbsp;·&nbsp; [Acknowledgments](#acknowledgments)

  <br>

  🔬 **[MATLAB Repository](https://github.com/Amey-Thakur/COMPUTATIONAL-METHODS-AND-MODELING-FOR-ENGINEERING-APPLICATIONS)** &nbsp;·&nbsp; 🏎️ **[Adaptive Cruise Control](#adaptive-cruise-control)**

  ---

  #### Presented as part of the 2nd Semester Project @ University of Windsor

  ---

  ### 🎓 [Computer Engineering Repository](https://github.com/Amey-Thakur/MENG-COMPUTER-ENGINEERING)

  **Master of Engineering (M.Eng.) - University of Windsor**

  *Coursework, simulations, engineering projects, and academic research.*

</div>
<div align="center">

  <a href="https://amey-thakur.github.io/ADAPTIVE-CRUISE-CONTROL/"><img src="docs/Matlab Logo.png" alt="MATLAB | Simulink" width="100"/></a>

  # Adaptive Cruise Control

  [![License](https://img.shields.io/badge/License-MIT-lightgrey)](LICENSE)
  ![Status](https://img.shields.io/badge/Status-Completed-success)
  ![MATLAB | Simulink](https://img.shields.io/badge/Stack-MATLAB%20%7C%20Simulink-orange?style=flat&logo=mathworks&logoColor=white)
  ![Arduino](https://img.shields.io/badge/Arduino-Uno-00979D?style=flat)
  [![Live Demo](https://img.shields.io/badge/Live%20Demo-ACC-dc143c?style=flat)](https://amey-thakur.github.io/ADAPTIVE-CRUISE-CONTROL/)
  [![Developed by Amey Thakur](https://img.shields.io/badge/Developed%20by-Amey%20Thakur-blue.svg)](https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL)

  An Adaptive Cruise Control (ACC) system developed as a **2nd-Semester Project** for the **MEng Computer Engineering** program. This implementation utilizes MATLAB and Arduino to demonstrate real-time sensory feedback, automated speed regulation, and proximity-aware safety logic.

  **[Source Code](Source%20Code/)** &nbsp;·&nbsp; **[Technical Specification](docs/SPECIFICATION.md)** &nbsp;·&nbsp; **[Live Demo](https://amey-thakur.github.io/ADAPTIVE-CRUISE-CONTROL/)**

  <img src="Source Code/figures/Adaptive Cruise Control Overview.jpg" width="80%" alt="ACC Overview">

</div>

---

<div align="center">

  [Authors](#authors) &nbsp;·&nbsp; [Overview](#overview) &nbsp;·&nbsp; [Features](#features) &nbsp;·&nbsp; [Structure](#project-structure) &nbsp;·&nbsp; [Quick Start](#quick-start) &nbsp;·&nbsp; [Hardware Components](#hardware-components) &nbsp;·&nbsp; [Tinkercad Simulation](#tinkercad-simulation) &nbsp;·&nbsp; [Working Model](#arduino-working-model) &nbsp;·&nbsp; [Development Roadmap](#development-roadmap) &nbsp;·&nbsp; [Usage Guidelines](#usage-guidelines) &nbsp;·&nbsp; [License](#license) &nbsp;·&nbsp; [About](#about-this-repository) &nbsp;·&nbsp; [Acknowledgments](#acknowledgments)

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

> [!NOTE]
> **Methodological Significance**: This project functions as an intensive case study in **Hardware-in-the-Loop (HIL)** simulation and modular system design. By establishing a robust bi-directional communication bridge between **MATLAB's high-level numerical processing** and the **Arduino's real-time peripheral control**, the architecture validates the feasibility of deploying complex analytical models onto resource-constrained embedded hardware. This methodology underscores the importance of architectural portability and cross-platform algorithmic alignment in modern automotive control engineering.

### Resources

| # | Resource | Description |
|---|---|---|
| 1 | [Project Report](Matlab%20Project/Final%20Report/Adaptive%20Cruise%20Control%20Final%20Report.pdf) | Comprehensive academic report on system design and results |
| 2 | [Technical Specification](docs/SPECIFICATION.md) | Technical architecture and control logic specification |
| 3 | [ACC Algorithm](Source%20Code/Adaptive%20Cruise%20Control%20Algorithm.txt) | Step-by-step logic for speed and proximity regulation |
| 4 | [Source Code](Source%20Code/Adaptive%20Cruise%20Control.m) | Primary MATLAB implementation script |
| 5 | [Arduino Working Model](Source%20Code/figures/Arduino%20Working%20Model/) | Physical hardware implementation and operational states |
| 6 | [Hardware Components](Source%20Code/figures/Hardware%20Components/) | Visual documentation of standalone project components |
| 7 | [Tinkercad Simulation](Source%20Code/figures/Tinkercad%20Simulation/) | Virtual prototyping results and circuit logic views |
| 8 | [MATLAB Repository](https://github.com/Amey-Thakur/COMPUTATIONAL-METHODS-AND-MODELING-FOR-ENGINEERING-APPLICATIONS) | Academic repository for Computational Methods and Modeling |
| 9 | [Engineering Repository](https://github.com/Amey-Thakur/MENG-COMPUTER-ENGINEERING) | Master repository for MEng Computer Engineering |

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
| **Interactive Simulation** | High-fidelity Web PWA mirroring the MATLAB control logic for hardware-agnostic system validation. |
| **Hardware Integration** | Direct interface with Arduino Uno and HC-SR04 Ultrasonic sensors via MATLAB API. |

> [!TIP]
> **Cyber-Physical Feedback Control**: The transition from manual open-loop actuators to automated **Closed-Loop Feedback Control** is a fundamental paradigm in automotive engineering. By synthesizing real-time telemetric distance data from the **HC-SR04** and mapping it through a deterministic control law, this system achieves autonomous speed regulation. Implementing concepts such as the **Constant Time-Gap Policy (CTGP)** is essential for ensuring "String Stability," which prevents the propagation and amplification of speed disturbances within vehicle platoons.

### Tech Stack
- **Numerical Computing**: MATLAB (R2023a+) & Control System Toolbox
- **Embedded Controller**: Arduino Uno R3 (ATmega328P Architecture)
- **Hardware Abstraction**: MATLAB Support Package for Arduino Hardware
- **Hardware Peripherals**: HC-SR04 Ultrasonic Sensor, 16x2 I2C/Parallel LCD Display
- **Simulation Web Engine**: Vanilla JavaScript (ES6+), CSS3 Flexbox/Grid, and Web Audio API
- **Deployment & Architecture**: Progressive Web App (PWA) with Service Worker offline caching
- **Prototyping Environment**: Tinkercad for electrical schematic validation and transient logic modeling
- **Libraries & Drivers**: `Ultrasonic.h`, `LiquidCrystal_I2C.h` (Hardware), `sw.js` (Web)

---

<!-- STRUCTURE -->
## Project Structure

```python
ADAPTIVE-CRUISE-CONTROL/
│
├── .github/
│   └── workflows/
│       └── deploy-pages.yml                 # GitHub Pages Deployment Workflow
│
├── docs/                                    # Formal Documentation
│   ├── Matlab Logo.png                      # MATLAB Branding Asset
│   ├── SPECIFICATION.md                     # Technical Architecture & Specification
│   └── web/                                 # Interactive ACC Simulation (GitHub Pages)
│       ├── index.html                       # Simulation Entry Point
│       ├── style.css                        # Design System & Styles
│       └── simulation.js                    # ACC Engine (JS Port of MATLAB Logic)
│
├── Matlab Project/                          # Academic Deliverables
│   ├── Final Report/                        # Final Project Report & MATLAB Source
│   │   ├── Adaptive Cruise Control Final Report.pdf
│   │   ├── Final Report Cover Page.pdf
│   │   ├── Group32_Amey_Brano_Nandu.m       # Team MATLAB Source Code
│   │   └── Summer_2023_Final_Project_Report_&_Presentation_Instructions.pdf
│   │
│   ├── Preliminary Report/                  # Initial System Architecture Report
│   │   ├── Adaptive Cruise Control Preliminary Report.pdf
│   │   ├── Cover Page.pdf
│   │   ├── Group 32 - Adaptive Cruise Control Preliminary Report.pdf
│   │   └── Summer 2023 - Primary Report Project Instructions.pdf
│   │
│   ├── Adaptive Cruise Control.pdf          # Project Overview Document
│   ├── Project Groups.pdf                   # Group Allocation Record
│   └── Smart Parking Management System.pdf  # Supplementary Reference
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

<!-- QUICK START -->
<a name="quick-start"></a>
## Quick Start

### 1. Prerequisites
- **MATLAB R2023a+**: Required for running the ACC control script. [Download MATLAB](https://www.mathworks.com/products/matlab.html)
- **MATLAB Support Package for Arduino Hardware**: For Arduino-MATLAB interfacing. [Install Package](https://www.mathworks.com/matlabcentral/fileexchange/47522-matlab-support-package-for-arduino-hardware)
- **Arduino Uno R3**: Physical microcontroller for hardware deployment.
- **Git**: For version control and cloning. [Download Git](https://git-scm.com/downloads)

> [!WARNING]
> **Hardware Configuration**
>
> Ensure the Arduino Uno is properly connected via USB and recognized by MATLAB before executing the control script. The HC-SR04 ultrasonic sensor and LCD display must be wired according to the [Technical Specification](docs/SPECIFICATION.md).

### 2. Installation & Setup

#### Step 1: Clone the Repository
Open your terminal and clone the repository:
```bash
git clone https://github.com/Amey-Thakur/ADAPTIVE-CRUISE-CONTROL.git
cd ADAPTIVE-CRUISE-CONTROL
```

#### Step 2: Install Arduino Support Package
In the MATLAB Command Window, install the required hardware support:
```matlab
matlabAddonInstaller
```
Search for and install **"MATLAB Support Package for Arduino Hardware"**.

### 3. Execution

#### Run the ACC System
Launch the primary control script in MATLAB:
```matlab
run("Source Code/Adaptive Cruise Control.m")
```

> [!TIP]
> **Simulation First**
>
> Before deploying on physical hardware, prototype and validate circuit logic using the Tinkercad simulation:
>
> 👉🏻 **[View Tinkercad Simulation](#tinkercad-simulation)**
>
> You can also explore the **interactive browser-based simulation**, no hardware or MATLAB required:
>
> 🚘 **[Launch Live Demo](https://amey-thakur.github.io/ADAPTIVE-CRUISE-CONTROL/)**

---

<!-- HARDWARE GALLERY -->
## Hardware Components
*Comprehensive inventory of the physical and electronic assets utilized in the ACC architecture.*

<div align="center">

  ### Bill of Materials: Component Table
  *Quantified technical breakdown of active and passive components.*
  
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
  *Core processing unit and the primary visual monitoring dashboard.*
  
  **Arduino Uno R3: Technical Pinout & Architecture**  <br><br>
  <img src="Source Code/figures/Hardware Components/02 - Arduino Uno.png" width="650" alt="Arduino Uno Technical Diagram">

  **LCD Display (16x2): Pin Configuration & Interface**  <br><br>
  <img src="Source Code/figures/Hardware Components/01 - LCD Display.png" width="400" alt="LCD Display Technical Diagram">

  ### Sensory & Connectivity
  *Environmental perception via ultrasonic telemetry and modular circuit interconnects.*
  <br><br>

  | Ultrasonic Sensor (HC-SR04) | Jumper Wires: Connectivity |
  | :---: | :---: |
  | <img src="Source Code/figures/Hardware Components/05 - Ultrasonic Sensor.png" width="400" alt="Ultrasonic Sensor"> | <img src="Source Code/figures/Hardware Components/07 - Jumper Wires.jpg" width="400" alt="Jumper Wires"> |
  | **Resistor Color Codes** | **Breadboard Technical Layout** |
  | <img src="Source Code/figures/Hardware Components/06 - Resistor.png" width="400" alt="Resistor"> | <img src="Source Code/figures/Hardware Components/08 - Breadboard.png" width="400" alt="Breadboard"> |

  ### User Interface & Input Controls
  *Tactile actuators and variable resistance inputs for manual system overrides.*
  <br><br>

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
  | Welcome Message | Group Details |
  | :---: | :---: |
  | <img src="Source Code/figures/Tinkercad Simulation/03 - Welcome Message.jpg" width="380"> | <img src="Source Code/figures/Tinkercad Simulation/04 - Group Number & Names.jpg" width="380"> |
  | **Initial Resting State** | **Cruise Active** |
  | <img src="Source Code/figures/Tinkercad Simulation/05 - Circuit at Initial (Zero Speed).jpg" width="380"> | <img src="Source Code/figures/Tinkercad Simulation/06 - Circuit in Cruise Mode (Non-Zero Speed).jpg" width="380"> |
  | **Cruise (Zero Speed)** | **Adaptive (Safe)** |
  | <img src="Source Code/figures/Tinkercad Simulation/07 - Circuit in Cruise Mode (Zero Speed).jpg" width="380"> | <img src="Source Code/figures/Tinkercad Simulation/08 - Adaptive Cruise Mode (Safe Distance).jpg" width="380"> |

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
  | Activation Screen | Member Display |
  | :---: | :---: |
  | <img src="Source Code/figures/Arduino Working Model/02 - Welcome Message.jpg" width="380"> | <img src="Source Code/figures/Arduino Working Model/03 - Group Number & Names.jpg" width="380"> |
  | **System Resting** | **Cruise Velocity** |
  | <img src="Source Code/figures/Arduino Working Model/04 - Circuit at Initial (Zero Speed).jpg" width="380"> | <img src="Source Code/figures/Arduino Working Model/05 - Circuit in Cruise Mode (Non-Zero Speed).jpg" width="380"> |
  | **Adaptive Control** | **Hazard Detected** |
  | <img src="Source Code/figures/Arduino Working Model/07 - Adaptive Cruise Mode (No Object in Front of Sensor).jpg" width="380"> | <img src="Source Code/figures/Arduino Working Model/08 - Adaptive Cruise Mode (Object in Front of Sensor).jpg" width="380"> |

</div>

---

<!-- LOGISTICS -->
## Development Roadmap
*Strategic timeline and logic execution architecture from project inception to final realization.*

<div align="center">

  ### Project Flowchart
  *Algorithmic sequence for sensory feedback, speed regulation, and adaptive braking.*
  <br><br>
  <img src="Source Code/figures/Adaptive Cruise Control Flowchart.png" width="90%" alt="ACC Flowchart">

  ### Project Gantt Chart
  *Phased development lifecycle including hardware selection, circuit design, and code optimization.*
  <br><br>
  <img src="Source Code/figures/Project Gantt Chart.jpg" width="90%" alt="Gantt Chart">

</div>

---

<!-- USAGE SECTION -->
## Usage Guidelines

This repository is openly shared to support learning and knowledge exchange across the academic community.

**For Students**  
Use this project as reference material for understanding **MATLAB-Arduino Interfacing**, **Sensor Fusion**, and **Closed-Loop Control Logic**. The source code and simulation documentation are available for study to facilitate self-paced learning and exploration of **cyber-physical systems and automated control architecture**.

**For Educators**  
This repository serves as a practical implementation of real-time embedded systems. Attribution is appreciated when utilizing content.

**For Researchers**  
The technical specification and modular code structure provide insights into the behavioral modeling of adaptive cruise systems in a controlled academic environment.

---

<!-- LICENSE -->
## License

This repository and all linked academic content are made available under the **MIT License**. See the [LICENSE](LICENSE) file for complete terms.

> [!NOTE]
> **Summary**: You are free to share and adapt this content for any purpose, even commercially, as long as you provide appropriate attribution to the original author.

Copyright © 2023 Amey Thakur

---

<!-- ABOUT -->
## About This Repository

**Created & Maintained by**: [Amey Thakur](https://github.com/Amey-Thakur)  
**Academic Journey**: Master of Engineering in Computer Engineering (2023-2024)  
**Course**: [GENG 8030 · Computational Methods and Modeling for Engineering Applications](https://github.com/Amey-Thakur/COMPUTATIONAL-METHODS-AND-MODELING-FOR-ENGINEERING-APPLICATIONS)  
**Institution**: [University of Windsor](https://www.uwindsor.ca/), Windsor, Ontario  
**Faculty**: [Faculty of Engineering](https://www.uwindsor.ca/engineering/)

This project showcases the **Adaptive Cruise Control (ACC)** system, a real-time engineering solution developed to address automotive safety and efficiency. It serves as a milestone in the academic study of computational methods and modeling for engineering applications.

**Connect:** [GitHub](https://github.com/Amey-Thakur) &nbsp;·&nbsp; [LinkedIn](https://www.linkedin.com/in/amey-thakur) &nbsp;·&nbsp; [ORCID](https://orcid.org/0000-0001-5644-1575)

### Acknowledgments

Grateful acknowledgment to my **Major Project** teammates, **Nandeshwar Royal Uppalapati** and **Brano Bruno Barshmen**, for their collaborative excellence and shared commitment throughout the semester. Our collective efforts in synthesizing complex datasets, developing rigorous technical architectures, and authoring comprehensive engineering reports were fundamental to the successful realization of our objectives. This partnership not only strengthened the analytical depth of our shared deliverables but also provided invaluable insights into the dynamics of high-performance engineering teamwork.

Grateful acknowledgment to **Jason Horn**, **[Writing Support Desk](https://github.com/Amey-Thakur/WRITING-SUPPORT)**, **University of Windsor**, for his distinguished mentorship and scholarly guidance. His analytical feedback and methodological rigor were instrumental in refining the intellectual depth and professional caliber of my academic work. His dedication stands as a testament to the pursuit of academic excellence and professional integrity.

Special thanks to the **mentors** and **peers** whose encouragement, discussions, and support contributed meaningfully to this learning experience.

---

<!-- FOOTER SECTION -->
<div align="center">

  [↑ Back to Top](#adaptive-cruise-control)

  [Authors](#authors) &nbsp;·&nbsp; [Overview](#overview) &nbsp;·&nbsp; [Features](#features) &nbsp;·&nbsp; [Structure](#project-structure) &nbsp;·&nbsp; [Quick Start](#quick-start) &nbsp;·&nbsp; [Hardware Components](#hardware-components) &nbsp;·&nbsp; [Tinkercad Simulation](#tinkercad-simulation) &nbsp;·&nbsp; [Working Model](#arduino-working-model) &nbsp;·&nbsp; [Development Roadmap](#development-roadmap) &nbsp;·&nbsp; [Usage Guidelines](#usage-guidelines) &nbsp;·&nbsp; [License](#license) &nbsp;·&nbsp; [About](#about-this-repository) &nbsp;·&nbsp; [Acknowledgments](#acknowledgments)

  <br>

  <a href="https://github.com/Amey-Thakur/COMPUTATIONAL-METHODS-AND-MODELING-FOR-ENGINEERING-APPLICATIONS"><img src="docs/Matlab Logo.png" width="18" height="18" valign="middle"></a> **[MATLAB Repository](https://github.com/Amey-Thakur/COMPUTATIONAL-METHODS-AND-MODELING-FOR-ENGINEERING-APPLICATIONS)** &nbsp;·&nbsp; 🚘 **[Adaptive Cruise Control](https://amey-thakur.github.io/ADAPTIVE-CRUISE-CONTROL/)**

  ---

  #### Presented as part of the 2nd Semester Project @ University of Windsor

  ---

  ### 🎓 [MEng Computer Engineering Repository](https://github.com/Amey-Thakur/MENG-COMPUTER-ENGINEERING)

  **Computer Engineering (M.Eng.) - University of Windsor**

  *Semester-wise curriculum, laboratories, projects, and academic notes.*

</div>
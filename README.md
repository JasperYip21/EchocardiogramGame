# EchoSim: Cardiac Ultrasound Simulator & Quiz

## Overview

This interactive web-based simulator is designed to test your knowledge of **standard cardiac ultrasound (echocardiogram) views** and **underlying anatomy**. The core goal is to correctly position a virtual probe to capture the required cardiac image and then identify the corresponding anatomical structure to answer quiz questions.

---

## Getting Started

1.  **Launch the Game:** The simulation starts with a loading screen, followed with fullscreen prompt/title card.
2.  **Start Quiz:** Click **Start Simulation** to begin the quiz flow.
3.  **Start Sandbox:** Click **Sandbox Mode** for free practice without scoring.
4.  **Instructions:** Click the **Instructions** button at any time to review the interactive tutorial slideshow.

---

## Gameplay Instructions

The main screen is divided into an explanation area (left), the patient's chest outline (middle) and the ultrasound image display (right).

### Controls & Interaction

| Element | Function | Note |
| :--- | :--- | :--- |
| **Probe (Transducer)** | **Drag and drop** the probe onto the numbered circular target zones on the chest. | This action automatically sets the correct **Rotation** and **Tail Position**. |
| **Toggle View** | Appears when a target zone supports multiple views (e.g., Parasternal Long-axis vs. Short-axis). | Click to cycle through all available views at that specific position. |
| **Exit to Menu** | Button to bring up the confirmation prompt to return to the Title Screen. | This resets your score and progress. |

### Answering Questions (Quiz Mode)

1.  **Capture the View:** Drag the probe over the target zone mentioned in the question. The probe will **automatically snap** to the correct rotation and display the corresponding echocardiogram image.
2.  **Identify the Structure:** The image will contain small, interactive circles marking anatomical features. **Click the circle** that corresponds to the structure mentioned in the current quiz question.
3.  **Review Feedback:** The feedback modal will appear immediately.

### Anatomy Practice (Sandbox Mode)

1.  Drag and drop the probe onto any zone to capture an image.
2.  Click any interactive circle.
3.  The **Part Display** on the screen will update immediately, identifying the anatomical structure you clicked, allowing for free exploration.

---

## Scoring & Progression

* **Correct Answer:** The system displays a "✅ Correct!" message. Click **Next Question** to proceed.
* **Incorrect Answer:** The system displays an "❌ Incorrect" message.
    * You can click **Show Answer** to reveal the correct structure on the image.
    * Click **Next Question** to proceed.
* **Quiz End:** After the final question, the **End Screen** displays your score and offers a **Restart Simulation** button.

---

## Files & Structure Overview

The application is structured logically to separate data from presentation and interaction logic.

| File/Section | Role | Key Functions/Data |
| :--- | :--- | :--- |
| **Data Model (e.g., `imageData.js`)** | **The source of truth for all content.** | `quizData`, `imageSetsByAngleAndTail`, `circlePositionsByKey` (positions/answers). |
| **Game Flow & UI State** | **Manages screen transitions and global state.** | Starts Quiz/Sandbox, `initUI()`, handles Exit/Restart, sets mode flags (`isSimulatorActive`). |
| **Probe Dragging & Transform** | **Handles user input on the probe.** | `mousedown`, `mousemove`, `mouseup` listeners, `applyProbeTransform()`, `resetProbe()`. |
| **Main Simulator Logic** | **Core engine for rendering the view.** | `updateImagePreview()`, `loadQuestion()`, handles **probe zone detection**, **image injection**, and **circle click logic**. |
| **Quiz Feedback & Progression** | **Controls post-answer flow.** | Logic for scoring, showing/hiding feedback modal, and transitioning to the next question or `endScreen`. |
| **Tutorial Slideshow** | **Handles instructional UI.** | `updateSlideshow()`, manages slide content and navigation buttons. |

---

## Getting Started

### Prerequisites

You need a modern web browser to run the simulation (e.g. Chrome, Firefox, Edge, Safari).

### Installation (Local)

1.  **Clone the repository:**

2.  **Open the application:** Simply open the `index.html` file in your preferred web browser. Since the application only uses local resources (HTML, CSS, JS, images), no web server is required.

---

## Note

This simulation uses **implied orientation** settings. The probe will automatically snap its rotation and tail position to the appropriate values when placed in a valid position, guiding the user towards capturing standard echocardiographic views.
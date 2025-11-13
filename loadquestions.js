/**
 * -----------------------------------------------------------------------------
 * SIMULATOR INTERACTION & QUIZ LOGIC
 * -----------------------------------------------------------------------------
 * This is the primary script controlling the real-time interaction of the probe 
 * with the body model and the resulting ultrasound image display. It handles 
 * loading quiz content, checking if the probe is over a valid zone, dynamically 
 * adjusting the probe's orientation, displaying the correct image, and executing 
 * the logic for the quiz and sandbox interaction modes.
 * 
 * FUNCTIONS:
 * - loadQuestion(): Initializes or loads the current quiz question's text, number, 
 * and calls key visualization updates (`updateImagePreview`, `applyProbeTransform`, 
 * `refreshRope`).
 * - updateImagePreview(): The core engine. It checks the probe's position against 
 * `cells`, determines the correct view (angle/tail), updates the probe's visual 
 * transform, injects the ultrasound image and interactive circles, and runs 
 * the logic for both Sandbox and Quiz modes. It also handles the 'Switch View' 
 * button positioning and error states.
 * 
 * EVENT LISTENERS:
 * - toggleButton (click): Cycles through the available views/orientations for
 * the current drop zone (`lastCellPos`). It resets rope animation history (`lastControl1`, 
 * `lastControl2`) to ensure a fresh drawing of the cable.
 * - .circle (click): Executes the core answer logic.
 * In **Sandbox Mode**, it displays the anatomical feature text and highlights the circle green.
 * In **Quiz Mode**, it checks the answer, updates the score, sets feedback text
 * (Correct/Incorrect), and triggers the feedback modal.
 * 
 * GLOBAL VARIABLES (State & Elements):
 * - cells: NodeList of all valid drop zones on the body model.
 * - rotationDisplay, tailDisplay, viewDisplay: UI elements showing probe orientation.
 * - partDisplay: Element showing the anatomical name in Sandbox mode.
 * - pos, currentQuestionIndex, score, sweepDeg, tailPosition, currentViewIndex, lastCellPos, position: Critical state trackers for quiz progress and probe orientation.
 * - activeCircleElement: Tracks the currently highlighted circle element for visual feedback. 
 * - isSimulatorActive: (boolean) True when the probe is interactable in the quiz or sandbox.
 * - isFeedbackActive: (boolean) True when the answer feedback modal is displayed.
 * - isSandBoxActive: (boolean) True when the application is in the free-play sandbox mode.
 * - gameStarted: (boolean) True once the quiz process has been initiated.
 *
 * EXTERNAL DEPENDENCIES (Variables/Functions):
 * - probe, imagePanel, probeImgEl, partDisplay, correctAnswerImage, containerOverlay, etc. (Numerous UI/probe elements).
 * - quizData, cellOrientationMap, imageSetsByAngleAndTail, circlePositionsByKey (All data models).
 * - setProbeTailImage(), resetProbe(), degreesToClock(), refreshRope(), applyProbeTransform() (Utility functions).
**/

const cells = document.querySelectorAll('.cell');   // Where probe can be dropped
const questionNumber = document.querySelector('.question-number');
const questionText = document.querySelector('.question-text');
const partContainer = document.getElementById('partContainer');
const questionArea = document.getElementById('questionArea');
const questionBox = document.getElementById("questionBox");
const toggleButton = document.getElementById('viewToggleButton');
const rotationDisplay = document.getElementById('rotationDisplay');
const tailDisplay = document.getElementById('tailDisplay');
const bodyArea = document.querySelector('.body-area');

let currentQuestionIndex = 0;
let score = 0;
let sweepDeg = 0;
let tailPosition = 'up';
let lastCellPos = null;
let immediate = false;
let position = 0;
let currentViewIndex = 0;
let lastControl1 = null;
let lastControl2 = null;
let activeCircleElement = null;

// Global game state variables
let isSimulatorActive = false;
let isFeedbackActive = false;
let isSandBoxActive = false;
let gameStarted = false;

// Load current quiz question
function loadQuestion() {
  const qData = quizData[currentQuestionIndex];
  if (!qData) {
    questionBox.textContent = "⚠️ No question found.";
    return;
  }
  
  // Update question displays
  questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.length}`;
  questionText.textContent = qData.question;
  currentQuestion.textContent = currentQuestionIndex + 1;
  questionBox.textContent = qData.question;
  if (currentQuestion) {
    currentQuestion.textContent = currentQuestionIndex + 1;
  }

  updateImagePreview();
  applyProbeTransform();
  refreshRope();
}

// Update image based on probe position & orientation. Handle quiz logic
function updateImagePreview() {
  const probeBox     = probe.getBoundingClientRect(); 
  const probeCenterX = probeBox.left + probeBox.width  / 2;
  const probeCenterY = probeBox.top  + probeBox.height / 2;

  const match = Array.from(cells).find(cell => {
    const b = cell.getBoundingClientRect();
    return probeCenterX >= b.left &&
           probeCenterX <= b.right &&
           probeCenterY >= b.top &&
           probeCenterY <= b.bottom;
  });

  // Always clear the image panel & hide controls
  imagePanel.innerHTML = '';
  partDisplay.textContent = '-';
  toggleButton.classList.add('hidden');
  showAnswerButton.classList.add('hidden');
  nextQuestionButton.classList.add('hidden');
  correctAnswerImage.classList.add('hidden');

  // If no valid cell, reset probe and show message
  if (!match) {
    resetProbe();
    imagePanel.innerHTML = '<span>Drop the probe on a valid zone to view an image</span>';
    refreshRope();
    return;
  }

  // We have a valid cell → load its views
  const pos   = +match.dataset.pos;
  const views = cellOrientationMap[pos] || [];

  if (!views.length) {
    imagePanel.innerHTML = '<span>Invalid position for this probe orientation</span>';
    refreshRope();
    return;
  }

  // If moved to a new cell, reset the view index
  if (lastCellPos !== pos) {
    currentViewIndex = 0;
    lastCellPos      = pos;
  }

  // Show “switch view” UI if there are multiples
  if (views.length > 1 && (isSimulatorActive || isSandBoxActive)) {
    toggleButton.classList.remove('hidden');
    toggleButton.textContent = `Switch View (${currentViewIndex+1}/${views.length})`;

    const probeBox = probe.getBoundingClientRect();
    requestAnimationFrame(() => {
      const btnW = toggleButton.offsetWidth;
      const btnH = toggleButton.offsetHeight;
      toggleButton.style.left = `${probeBox.left + probeBox.width/2 - btnW/2}px`;
      toggleButton.style.top  = `${probeBox.top  + probeBox.height/2 - btnH/2 - 80}px`;
    });
  }

  // Pull the orientation, angle & tailDir
  const { angle, tail: tailDir, view } = views[currentViewIndex % views.length];

  // Apply the probe transform
  sweepDeg     = angle;
  tailPosition = tailDir;
  setProbeTailImage(tailDir);

  const flip = tailDir === 'down' ? 'scaleX(-1)' : '';
  probe.style.transform = `rotate(${angle}deg) ${flip}`;

  // Update UI text
  rotationDisplay.textContent = degreesToClock(angle);
  tailDisplay.textContent     = tailDir === 'up' ? 'Tail Up' : 'Tail Down';
  viewDisplay.textContent     = view;

  // Exception for PLAX (only one view) for probe transformation
  if (pos === 2 && currentViewIndex % views.length === 2) {
      probeImgEl.src = './images/probe_v.png';
      probe.style.transform = 'rotate(300deg)';
      tailDisplay.textContent = 'Tail Neutral';

      refreshRope();
  }

  if (pos === 1) {
      probeImgEl.src = './images/probe_tail_up.png';
      rotationDisplay.textContent = '12 o\'clock';
      position = 1;

      refreshRope();
  }
  else {
      position = 0;

      refreshRope();
  }

  console.log(pos)

  // Inject the images + circles
  const key      = `${angle}_${tailDir}`;
  const imageSet = imageSetsByAngleAndTail[key]?.[pos-1];

  // Check for image path for the current probe position (key/pos).
  if (!imageSet) {
    imagePanel.innerHTML = `<span>No image for key "${key}" at pos ${pos}</span>`;
  } else {
    // Display the image
    const img = document.createElement('img');
    img.src = imageSet;
    img.alt = `Image ${pos} at ${angle}° (${tailDir})`;

    // Add circles for interaction
    const circles = circlePositionsByKey[key]?.[pos - 1] || [];
    circles.forEach(circleData => {
      const circle = document.createElement('div');
      circle.className = 'circle';
      
      // Position in %
      circle.style.top = `${circleData.y}%`;
      circle.style.left = `${circleData.x}%`;

      // Circle interaction logic for QUIZ and SANDBOX
      circle.addEventListener('click', () => {
        // Change active components and logic based on mode
        if (isSandBoxActive) {    // SANDBOX MODE
          feedbackBox.classList.add('hidden');
          containerOverlay.classList.add('hidden');
          questionTitleScreen.classList.add('hidden');
          isSimulatorActive = false;
          isFeedbackActive = false;
          partDisplay.textContent = circleData.text;

          // Highlight the active circle
          if (activeCircleElement) {
            activeCircleElement.classList.remove('active-circle');
          }
          circle.classList.add('active-circle');
          activeCircleElement = circle;

        } else {  // QUIZ MODE
          const qData = quizData[currentQuestionIndex];
          const selectedAnswer = circleData.answer;

          // Check answer
          if (pos === qData.correctPosition && selectedAnswer === qData.correctAnswer && !isFeedbackActive) {
            score++;
            feedbackText.textContent = "✅ Correct!";
            nextQuestionButton.classList.remove('hidden');
            correctAnswerImage.classList.add('hidden');
          } else if (!isFeedbackActive) {
            feedbackText.textContent = `❌ Incorrect.`;
            showAnswerButton.classList.remove('hidden');
            nextQuestionButton.classList.remove('hidden');
            correctAnswerImage.classList.add('hidden');
          }

          if (currentQuestionIndex === quizData.length - 1) {
            nextQuestionButton.textContent = 'End Quiz';
          } else {
            nextQuestionButton.textContent = 'Next Question'; // Ensure text is reset for earlier questions
          }
          
          // Show feedback modal
          feedbackBox.classList.remove('hidden');
          containerOverlay.classList.remove('hidden');
          questionTitleScreen.classList.add('hidden');
          isSimulatorActive = false;
          isFeedbackActive = true;
        }
      });

      imagePanel.appendChild(circle);
    });

    imagePanel.appendChild(img);
  }

  // Final rope refresh
  refreshRope();
}

// Toggle between views if multiple exist
toggleButton.addEventListener('click', () => {
  const views = cellOrientationMap[lastCellPos] || [];
  currentViewIndex = (currentViewIndex + 1) % views.length;

  // reset rope history so it snaps to new view
  lastProbeCoords = null;
  lastControl1 = null;
  lastControl2 = null;

  updateImagePreview();
  refreshRope();
});
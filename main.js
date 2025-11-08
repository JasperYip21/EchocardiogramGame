/**
 * -----------------------------------------------------------------------------
 * GAME FLOW & UI STATE MANAGEMENT SCRIPT 
 * -----------------------------------------------------------------------------
 * This script is the central controller for the application's overall state and 
 * screen transitions (Loading Screen, Title, Simulator, Sandbox, End Screen, Prompts).
 * It manages the flow between different application modes, handles initialization 
 * (UI resets, image preloading), and provides essential utility functions.
 * 
 * FUNCTIONS:
 * - initUI(): Initializes the simulator view, resets display values (rotation, view), and preloads all images.
 * - degreesToClock(angle): Converts a degree value to a standard clock face string (e.g., "3 o'clock").
 * - preloadImages(): Preloads all ultrasound and general images, returning a Promise that resolves when all are loaded.
 * 
 * EVENT LISTENERS:
 * - fullscreenBtn (click): Enters fullscreen mode.
 * - document (DOMContentLoaded): Manages the loading screen and preloads assets before showing the title screen.
 * - document (fullscreenchange): Handles logic when exiting fullscreen (e.g., via Esc).
 * - startButton (click): Begins the main quiz simulation.
 * - sandBoxButton (click): Enters the free-play sandbox mode.
 * - continueButton (click): Proceeds from the question intro screen to the simulator.
 * - exitButton (click): Shows the exit confirmation prompt.
 * - confirmExitButton (click): Resets state and exits to the Title Screen.
 * - cancelExitButton (click): Hides the exit confirmation prompt.
 * - restartButton (click): Resets state and begins the quiz again from the start.
 * 
 * GLOBAL VARIABLES (State & Elements):
 * - Screens/Prompts: fullscreenPrompt, promptOverlay, titleScreen, endScreen, 
 * questionTitleScreen, exitPrompt.
 * - Core UI: container, imagePanel, finalScore, currentQuestion.
 * - Buttons: startButton, sandBoxButton, exitButton, restartButton, 
 * continueButton, fullscreenBtn, confirmExitButton, cancelExitButton.
 * - Slideshow/Tutorial: prevSlideButton, nextSlideButton, slideIndicator, slideshowContainer.
 * 
 * EXTERNAL DEPENDENCIES (Variables/Functions):
 * - score, currentQuestionIndex, sweepDeg, tailPosition, currentViewIndex, lastCellPos
 * - loadQuestion(), refreshRope(), updateImagePreview(), containerOverlay
 * - imageSetsByAngleAndTail (Data structure for image paths)
**/

const loadingScreen = document.getElementById('loadingScreen');
const fullscreenPrompt = document.getElementById('fullscreenPrompt');
const promptOverlay = document.getElementById('promptOverlay');
const titleScreen = document.getElementById('titleScreen');
const startButton = document.getElementById('startButton');
const sandBoxButton = document.getElementById('sandBoxButton');
const container = document.querySelector('.container');
const imagePanel = document.getElementById('imageDisplay');
const exitButton = document.getElementById('exitButton');
const endScreen = document.getElementById('endScreen');
const finalScore = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const questionTitleScreen = document.getElementById('questionTitleScreen');
const continueButton = document.getElementById('continueButton');
const currentQuestion = document.getElementById('currentQuestion');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const prevSlideButton = document.getElementById('prevSlideButton');
const nextSlideButton = document.getElementById('nextSlideButton');
const slideIndicator = document.getElementById('slideIndicator');
const slideshowContainer = document.getElementById('slideshowContainer');
const exitPrompt = document.getElementById('exitPrompt');
const confirmExitButton = document.getElementById('confirmExitButton');
const cancelExitButton = document.getElementById('cancelExitButton');
const generalAssetSources = [
  './images/probe_h.png', './images/probe_v.png', './images/body2.png', './images/probe_tail_down.png',
  './images/probe_tail_up.png', './images/probe_explanation_2.png',
  './Echo_Images/answer/Q1_ans.png', './Echo_Images/answer/Q2_ans.png', './Echo_Images/answer/Q3_ans.png',
  './Echo_Images/answer/Q4_ans.png', './Echo_Images/answer/Q5_ans.png',
  './Echo_Images/tutorial/tutorial1.png', './Echo_Images/tutorial/tutorial2.png', './Echo_Images/tutorial/tutorial3.png',
  './Echo_Images/tutorial/tutorial4.png', './Echo_Images/tutorial/tutorial5.png', './Echo_Images/tutorial/tutorial6.png',
  './Echo_Images/tutorial/tutorial7.png', './Echo_Images/tutorial/tutorial8.png'
]


function initUI() {
  loadQuestion();
  refreshRope();
  sweepDeg = 90;
  rotationDisplay.textContent = '3 o\'clock';
  tailDisplay.textContent = 'Tail Down';
  viewDisplay.textContent = '-';
}

// Convert degrees to clock face representation
function degreesToClock(angle) {
  const normalized = ((angle % 360) + 360) % 360;
  const hourIndex = Math.round(normalized / 30) % 12;
  const labels = [
    "12 o'clock","1 o'clock","2 o'clock","3 o'clock",
    "4 o'clock","5 o'clock","6 o'clock","7 o'clock",
    "8 o'clock","9 o'clock","10 o'clock","11 o'clock"
  ];
  return labels[hourIndex];
}

// Preloads all ultrasound images and returns a Promise that resolves when all are loaded.
function preloadImages() {
  let allImageSources = [];

  // Quiz Images
  if (typeof imageSetsByAngleAndTail !== 'undefined') {
    allImageSources = allImageSources.concat(
      Object.values(imageSetsByAngleAndTail).flat()
    );
  }

  // General Images
  if (typeof generalAssetSources !== 'undefined') {
    allImageSources = allImageSources.concat(generalAssetSources);
  }
  
  if (allImageSources.length === 0) {
    console.warn('No images found to preload. Proceeding immediately.');
    return Promise.resolve();
  }

  // Create an array of Promises, one for each image load operation.
  const loadPromises = allImageSources.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Resolve the promise when the image successfully loads or errors
      img.onload = () => resolve(src); 
      img.onerror = () => {
          console.warn(`Failed to load image: ${src}`);
          resolve(src); // Resolve so a single error doesn't stop the launch
      };
      
      img.src = src;
    });
  });

  return Promise.all(loadPromises);
}

// Loading Screen, on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  // Promise that resolves only after 3 seconds.
  const minimumTimePromise = new Promise(resolve => {
    setTimeout(resolve, 3000);
  });

  // Preloading images.
  const imageLoadPromise = preloadImages();

  // Use Promise.all() to wait for BOTH the 5-second timer AND image loading to finish.
  Promise.all([imageLoadPromise, minimumTimePromise])
    .then(() => {
      console.log('All assets loaded and minimum time elapsed. Launching game.');

      if (loadingScreen) { loadingScreen.classList.add('hidden'); }

      if (fullscreenPrompt) { fullscreenPrompt.classList.remove('hidden'); }

      if (titleScreen) { titleScreen.classList.remove('hidden'); }
    })
    .catch(error => {
      console.error('An unexpected error occurred during preloading:', error);
  });
});

// Button to enter fullscreen mode
fullscreenBtn.addEventListener('click', () => {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }

  fullscreenPrompt.classList.add('hidden');
  promptOverlay.classList.add('hidden');
});

// Make sure the game pauses if exiting fullscreen
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    fullscreenPrompt.classList.remove('hidden');
    promptOverlay.classList.remove('hidden');
  }
});

// Start Quiz
startButton.addEventListener('click', () => {
  titleScreen.classList.add('hidden');
  questionTitleScreen.classList.remove('hidden');
  gameStarted = true;
  currentQuestionIndex = 0;
  score = 0;
  loadQuestion();
});

// Enter sandbox mode
sandBoxButton.addEventListener('click', () => {
  titleScreen.classList.add('hidden');
  container.classList.remove('hidden');
  questionArea.classList.add('hidden');
  partContainer.classList.remove('hidden');
  isSimulatorActive = false;
  isSandBoxActive = true;
  initUI();
  updateImagePreview();
  loadQuestion();
});

// Continue to quiz
continueButton.addEventListener('click', () => {
  feedbackBox.classList.add('hidden');
  questionTitleScreen.classList.add('hidden');
  container.classList.remove('hidden');
  isSimulatorActive = true;
  initUI();
  updateImagePreview();
  loadQuestion();
});

// Enter exit prompt
exitButton.addEventListener('click', () => {
  exitPrompt.classList.remove('hidden');
  containerOverlay.classList.remove('hidden');
});

// Confirm exit to title screen
confirmExitButton.addEventListener('click', () => {
  // Reset to title screen
  isSimulatorActive = false;
  isSandBoxActive = false;
  gameStarted = false;
  currentQuestionIndex = 0;
  score = 0;
  container.classList.add('hidden');
  titleScreen.classList.remove('hidden');
  questionArea.classList.remove('hidden');
  partContainer.classList.add('hidden');
  exitPrompt.classList.add('hidden');
  containerOverlay.classList.add('hidden');
});

// Cancel exit prompt
cancelExitButton.addEventListener('click', () => {
  exitPrompt.classList.add('hidden');
  containerOverlay.classList.add('hidden');
});

// Restart quiz
restartButton.addEventListener('click', () => {
  currentQuestionIndex = 0;
  score = 0;
  sweepDeg = 90;
  tailPosition = 'down';
  currentViewIndex = 0;
  lastCellPos = null;
  
  // UI updates
  endScreen.classList.add('hidden');
  titleScreen.classList.remove('hidden');
  probe.style.left = '120px';
  probe.style.top = '200px';
  probe.style.transform = 'rotate(0deg)';
  
  // Clear confetti
  document.querySelectorAll('.confetti').forEach(el => el.remove());
  
  loadQuestion();
  updateRope();
}); 
/**
 * -----------------------------------------------------------------------------
 * TUTORIAL SLIDESHOW CONTROLLER
 * -----------------------------------------------------------------------------
 * This module manages the display, content, and navigation for the application's 
 * instruction/tutorial slideshow. It uses a core data array (tutorialSlides) to 
 * populate a single visible slide element, minimizing DOM manipulation.
 * 
 * FUNCTIONS:
 * - updateSlideshow(): The main controller. It uses the 'currentSlide' index to 
 * fetch corresponding data (text, image source, alt text) and dynamically updates 
 * the slide content, the indicator (e.g., "3 of 8"), and the visibility of 
 * navigation/close buttons.
 * 
 * EVENT LISTENERS:
 * - tutorialButton (click): Starts the tutorial slideshow from the main entry point (e.g., Title Screen).
 * - tutorialButton2 (click): Starts the tutorial slideshow from the secondary entry point (e.g., during Simulation).
 * - prevSlideButton (click): Navigates backward through the slides, hidden on the first slide.
 * - nextSlideButton (click): Navigates forward through the slides, hidden on the last slide.
 * - closeTutorialX (click): Closes the tutorial using the 'X' button.
 * - closeTutorialButton (click): Closes the tutorial using the main 'Close' button shown on the last slide.
 *
 * GLOBAL VARIABLES (State & Elements):
 * - currentSlide: (number) Tracks the current 1-based slide index.
 * - tutorialSlides: (Array of Objects) The source of truth for all tutorial content 
 * (text, image paths, etc.).
 * - tutorialOverlay: The main container/modal for the whole tutorial interface.
 * - prevSlideButton, nextSlideButton, closeTutorialButton, slideIndicator: The navigation and display UI elements.
 * - tutorialText, tutorialImage: The elements within the slideshow updated with dynamic content.
 * 
 * INITIALIZATION:
 * - The DOMContentLoaded listener ensures the 'Previous' and 'Close' buttons 
 * are correctly hidden, and the indicator is set to '1 of X' upon page load.
**/

const tutorialOverlay = document.getElementById('tutorialOverlay');
const closeTutorialX = document.getElementById('closeTutorialX');
const tutorialButton = document.getElementById('tutorialButton');
const tutorialButton2 = document.getElementById('tutorialButton2');
const tutorialText = document.getElementById('tutorialText');
const tutorialImage = document.getElementById('tutorialImage');

let currentSlide = 1;

// Data structure for tutorial slides
const tutorialSlides = [
    {
        slideNum: 1,
        text: "Use your mouse to drag the ultrasound probe over the circular zones on the body to see different ultrasound images.",
        imageSrc: "Echo_Images/tutorial/tutorial1.PNG",
        altText: "Tutorial Step 1: Dragging the probe."
    },
    {
        slideNum: 2,
        text: "The probe automatically rotates and adjusts its tail position based on the position of the probe on the body",
        imageSrc: "Echo_Images/tutorial/tutorial2.PNG",
        altText: "Tutorial Step 2: Probe rotation and tail adjustment."
    },
    {
        slideNum: 3,
        text: "When placing the probe on the intercostal space, you can click the \"Switch View\" button to switch between parasternal long-axis and short-axis views.",
        imageSrc: "Echo_Images/tutorial/tutorial3.PNG",
        altText: "Tutorial Step 3: Switching between long-axis and short-axis views."
    },
    {
        slideNum: 4,
        text: "Answer questions by clicking on the correct anatomical structures in the ultrasound image.",
        imageSrc: "Echo_Images/tutorial/tutorial4.PNG",
        altText: "Tutorial Step 4: Answering questions by clicking structures."
    },
    {
        slideNum: 5,
        text: "After selecting an answer, you will receive immediate feedback indicating whether your choice was correct or incorrect.",
        imageSrc: "Echo_Images/tutorial/tutorial5.PNG",
        altText: "Tutorial Step 5: Immediate feedback on answers."
    },
    {
        slideNum: 6,
        text: "For the Simulation Mode, you can click on the circles to check what anatomical structure they represent.",
        imageSrc: "Echo_Images/tutorial/tutorial6.PNG",
        altText: "Tutorial Step 6: Checking anatomical structures."
    },
    {
        slideNum: 7,
        text: "You can exit the Simulation anytime by using the 'Exit To Menu' button.",
        imageSrc: "Echo_Images/tutorial/tutorial7.PNG",
        altText: "Tutorial Step 7: Exiting the Simulation."
    },
    {
        slideNum: 8,
        text: "You can review these instructions anytime by clicking the 'Instructions' button.",
        imageSrc: "Echo_Images/tutorial/tutorial8.PNG",
        altText: "Tutorial Step 8: Reviewing instructions."
    }
];

// Update the visibility and state of the slideshow
function updateSlideshow(){
    const currentSlideData = tutorialSlides[currentSlide - 1];

    if (!currentSlideData) {
        console.error(`No data found for slide ${currentSlide}`);
        return;
    }

    tutorialText.textContent = currentSlideData.text;
    tutorialImage.src = currentSlideData.imageSrc;
    tutorialImage.alt = currentSlideData.altText;

    slideIndicator.textContent = `${currentSlide} of ${tutorialSlides.length}`;
    
    const isFirstSlide = currentSlide === 1;
    const isLastSlide = currentSlide === tutorialSlides.length;
    
    prevSlideButton.classList.toggle('hidden', isFirstSlide);
    nextSlideButton.classList.toggle('hidden', isLastSlide);
    closeTutorialButton.classList.toggle('hidden', !isLastSlide);
}

// Button used to start the tutorial in Title Screen
tutorialButton.addEventListener('click', () => {
  tutorialOverlay.classList.remove('hidden');
  containerOverlay.classList.remove('hidden');
  currentSlide = 1;
  updateSlideshow();
});

// Second Button used to start the tutorial during Simulation
tutorialButton2.addEventListener('click', () => {
  tutorialOverlay.classList.remove('hidden');
  containerOverlay.classList.remove('hidden');
  currentSlide = 1;
  updateSlideshow();
});

// 'X' Close Tutorial button
closeTutorialX.addEventListener('click', () => {
  tutorialOverlay.classList.add('hidden');
  containerOverlay.classList.add('hidden');
});

// Close Tutorial button on the last slide.
closeTutorialButton.addEventListener('click', () => {
  tutorialOverlay.classList.add('hidden');
  containerOverlay.classList.add('hidden');
});

// Next Slide button.
nextSlideButton.addEventListener('click', () => {
  if (currentSlide < tutorialSlides.length) {
    currentSlide++;
    updateSlideshow();
  }
});

// Previous Slide button.
prevSlideButton.addEventListener('click', () => {
  if (currentSlide > 1) {
    currentSlide--;
    updateSlideshow();
  }
});

// Initial setup on page load
document.addEventListener('DOMContentLoaded', () => {
    prevSlideButton.classList.add('hidden');
    closeTutorialButton.classList.add('hidden');
    slideIndicator.textContent = `1 of ${tutorialSlides.length}`;
});
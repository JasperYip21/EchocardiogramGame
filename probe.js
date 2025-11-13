/**
 * -----------------------------------------------------------------------------
 * PROBE DRAGGING AND TRANSFORMATION CONTROLLER
 * -----------------------------------------------------------------------------
 * This script manages the user interaction (dragging) and visual state (rotation/flip)
 * of the ultrasound probe element within the simulator.
 * 
 * It ensures the probe is draggable, constrained to the main container, and its 
 * visual appearance (image source, rotation, and tail flip) accurately reflects 
 * the simulation state.
 * 
 * FUNCTIONS:
 * - setProbeTailImage(tail): Updates the probe's image source based on the current 'tailPosition' (up/down).
 * - applyProbeTransform(): Builds and applies the necessary CSS transform (rotation and scale/flip) based on current state variables (sweepDeg, tailPosition).
 * - resetProbe(): Resets the probe's state variables (sweepDeg, tailPosition) and UI display to their default values (e.g., 90 degrees/3 o'clock).
 * - getProbeCenter(probeEl): Utility function to calculate the precise center coordinates of the probe element relative to the viewport.
 * 
 * EVENT LISTENERS:
 * - mousedown on probe: Initiates the drag operation, calculates initial offset (offsetX/Y), and changes the cursor to 'grabbing'.
 * - mousemove on document: Updates the probe's position based on mouse movement, constrains the probe within the container boundaries, and triggers updates for the rope and image preview functions.
 * - mouseup on document: Terminates the drag operation and resets the cursor.
 * 
 * GLOBAL VARIABLES (State & Elements):
 * - probe: The main probe element container (draggable).
 * - probeImage / probeImgEl: The <img> element inside the probe container.
 * - probeImages: Object mapping tail positions ('up', 'down') to image paths.
 * - isDragging: (boolean) Flag indicating if the probe is currently being dragged.
 * - offsetX, offsetY: Numerical offsets used to prevent the probe from jumping on mousedown.
 * - lastProbeCoords: Stores the last known coordinates of the probe (used externally for rope drawing/collision detection).
 * - sweepDeg, tailPosition, position: Critical variables defining the probe's current visual orientation.
 * 
 * EXTERNAL DEPENDENCIES (Functions):
 * - container, rotationDisplay, viewDisplay, tailDisplay
 * - updateRope(), updateImagePreview()
**/


const probe = document.getElementById('probe');
const probeImage = probe.querySelector('img');
const probeImages = {
  up: './images/probe_tail_down.png',
  down: './images/probe_tail_down.png'
};
const probeImgEl = probe ? probe.querySelector('img') : null;

let lastProbeCoords = null;
let isDragging = false;
let offsetX = 0;
let offsetY = 0;

probeImage.draggable = false;
probeImgEl.draggable = false;
probeImage.style.pointerEvents = 'none';
probeImgEl.style.pointerEvents = 'none';

// Update probe image based on tail position
function setProbeTailImage(tail) {
  const src = probeImages[tail] || probeImgEl.src;
  if (probeImgEl.src !== src) probeImgEl.src = src;
}

// Probe drag functionality
probe.addEventListener('mousedown', (e) => {
  isDragging = true;

  // Get mouse position relative to probe's top-left corner
  const probeOffsetLeft = probe.offsetLeft;
  const probeOffsetTop = probe.offsetTop;

  offsetX = e.clientX - (container.getBoundingClientRect().left + probeOffsetLeft);
  offsetY = e.clientY - (container.getBoundingClientRect().top + probeOffsetTop);

  probe.style.cursor = 'grabbing';
  e.preventDefault();
});

// Apply rotation and flip transforms to probe
function applyProbeTransform() {
  // pivot  at the center of probe image
  probe.style.transformOrigin = 'center center';

  // build the same transform you use when dragging
  const flip = tailPosition === 'up' ? 'scaleY(1)' : 'scaleX(-1)';
  const rot = `rotate(${sweepDeg}deg)`;
  probe.style.transform = `${rot} ${flip}`;
}

// Reset probe to default state
function resetProbe() {
  sweepDeg = 90;
  tailPosition = 'down';
  position = 0;
  rotationDisplay.textContent = "3 o'clock";
  viewDisplay.textContent = '-';
  tailDisplay.textContent = 'Tail Down';

  setProbeTailImage(tailPosition);
  probe.style.transform = 'rotate(90deg) scaleX(-1)';
}

// Update probe position on mouse move
document.addEventListener('mousemove', (e) => {
  if (!isDragging) return;

  const containerRect = container.getBoundingClientRect();
  let newLeft = e.clientX - containerRect.left - offsetX;
  let newTop = e.clientY - containerRect.top - offsetY;

  // Constrain within container
  const maxLeft = containerRect.width - probe.offsetWidth;
  const maxTop = containerRect.height - probe.offsetHeight;
  newLeft = Math.max(0, Math.min(newLeft, maxLeft));
  newTop = Math.max(0, Math.min(newTop, maxTop));

  probe.style.left = `${newLeft}px`;
  probe.style.top = `${newTop}px`;

  updateRope();
  updateImagePreview();
});

// End dragging on mouse up
document.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    probe.style.cursor = 'grab';
  }
});

// Calculate the center coordinates of the probe element
function getProbeCenter(probeEl) {
  const rect = probeEl.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
    width: rect.width,
    height: rect.height
  };
}

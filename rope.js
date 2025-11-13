/**
 * -----------------------------------------------------------------------------
 * ROPE VISUALIZATION MODULE
 * -----------------------------------------------------------------------------
 * This script is responsible for dynamically drawing and positioning the SVG Bézier 
 * curve that visually represents the cable connecting the ultrasound machine to 
 * the draggable probe. 
 * 
 * It calculates screen positions, transforms them into SVG coordinates, and uses 
 * fixed control points to create a realistic, curved cable effect that changes 
 * based on the probe's orientation and position.
 * 
 * FUNCTIONS:
 * - updateRope(): The main function that calculates the start, end, and two control 
 * points for the Bézier curve and updates the 'd' attribute of the SVG path.
 * - refreshRope(): Uses a double requestAnimationFrame() to ensure the SVG rope is 
 * updated after any DOM changes (like probe movement or style transforms).
 * - getTailAnchor(probeEl, angleDeg, tailDir, currentViewIndex): Calculates the 
 * precise screen coordinates of the probe's "tail" connection point based on 
 * the probe's center, rotation angle, and tail direction.
 * - toSvgCoords(x, y): Converts standard viewport (screen) coordinates into the 
 * correct coordinate system used by the SVG canvas, essential for accurate drawing.
 * - animateRope(from, to, duration): Linearly interpolates (lerps) between two 
 * defined rope path states over a specified duration to create a smooth animation 
 * when the probe changes position or orientation dramatically (currently unused 
 * in updateRope).
 * 
 * GLOBAL VARIABLES (Elements & State):
 * - ropePath: The SVG `<path>` element that draws the cable.
 * - probe: The draggable probe element.
 * - sweepDeg, tailPosition, currentViewIndex: Critical state variables defining 
 * the probe's orientation, required for calculating the tail anchor point.
 * 
 * EXTERNAL DEPENDENCIES:
 * - getProbeCenter(probeEl): Function used to find the center point of the probe.
 * - The HTML structure must include elements with classes/IDs: `.machine-area` 
 * and `.rope-container svg`.
**/

const ropePath = document.getElementById('ropePath');

// Update rope visualization with sine wave effect for tail up
function updateRope() {
  const mBox = document.querySelector('.machine-area').getBoundingClientRect();
  const mScreen = { x: mBox.left + mBox.width/2, y: mBox.top + 20 };

  const tailScreen = getTailAnchor(probe, sweepDeg, tailPosition, currentViewIndex, position);

  // control points
  let c1x, c1y, c2x, c2y;
  if (tailPosition === 'up') {
    c1x = mScreen.x + (tailScreen.x - mScreen.x) * 0.7;
    c1y = mScreen.y - 50;
    c2x = c1x;
    c2y = tailScreen.y - 350;
  } else {
    c1x = mScreen.x + (tailScreen.x - mScreen.x) * 0.5;
    c1y = mScreen.y - 150;
    c2x = mScreen.x + (tailScreen.x - mScreen.x) * 0.7;
    c2y = tailScreen.y + 100;
  }

  const mSvg  = toSvgCoords(mScreen.x, mScreen.y);
  const tSvg  = toSvgCoords(tailScreen.x, tailScreen.y);
  const c1Svg = toSvgCoords(c1x, c1y);
  const c2Svg = toSvgCoords(c2x, c2y);

  const d = `M ${mSvg.x},${mSvg.y}
             C ${c1Svg.x},${c1Svg.y}
               ${c2Svg.x},${c2Svg.y}
               ${tSvg.x},${tSvg.y}`.replace(/\s+/g,' ');

  ropePath.setAttribute('d', d);
}

// Refresh rope after DOM updates
function refreshRope() {
  // double rAF to ensure styles & layout are updated
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      updateRope();
    });
  });
}

// Calculate the tail tip coordinates 
function getTailAnchor(probeEl, angleDeg, tailDir, currentViewIndex, position) {
  const { x: cx, y: cy} = getProbeCenter(probeEl);

  // radius from center to edge (half width)
  const r = 160 / 2;

  // convert to radians
  const theta = angleDeg * Math.PI / 180;

  // Tail convention: if "up", put it on the left side of the probe;
  // if "down", put it on the right side.
  const offsetAngle = tailDir === 'down' ? theta : theta + Math.PI;

  console.log('pos:', position, theta);
  if (currentViewIndex === 2) {
    return { x: cx, y: cy };
  }
  if (position === 1) {
    return {
      x: cx + r * Math.cos(270 * Math.PI / 180),
      y: cy + r * Math.sin(270 * Math.PI / 180)
    };
  } else {
    return {
      x: cx + r * Math.cos(offsetAngle),
      y: cy + r * Math.sin(offsetAngle)
    };
  }
}

// Converts screen coordinates to SVG coordinates
function toSvgCoords(x, y) {
  const svg = document.querySelector('.rope-container svg');
  const pt = svg.createSVGPoint();
  pt.x = x;
  pt.y = y;

  const screenCTM = svg.getScreenCTM();
  if (!screenCTM) {
    console.warn('SVG CTM not available');
    return { x: x, y: y };
  }

  return pt.matrixTransform(screenCTM.inverse());
}

// Animate rope transition between two states
function animateRope(from, to, duration = 200) {
  const start = performance.now();

  function step(timestamp) {
    const progress = Math.min((timestamp - start) / duration, 1);

    const lerp = (a, b) => a + (b - a) * progress;

    const path = `M ${lerp(from.machine.x, to.machine.x)},${lerp(from.machine.y, to.machine.y)}
                  C ${lerp(from.control1.x, to.control1.x)},${lerp(from.control1.y, to.control1.y)}
                    ${lerp(from.control2.x, to.control2.x)},${lerp(from.control2.y, to.control2.y)}
                    ${lerp(from.probe.x, to.probe.x)},${lerp(from.probe.y, to.probe.y)}`;

    ropePath.setAttribute('d', path);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}
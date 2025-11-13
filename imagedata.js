/**
 * -----------------------------------------------------------------------------
 * QUIZ DATA MODEL
 * -----------------------------------------------------------------------------
 * This file serves as the definitive data model for the interactive simulation and 
 * quiz features. It organizes the mapping between probe placement, resulting 
 * ultrasound images, interactive anatomical markers, and corresponding quiz questions.
 * 
 * GLOBAL VARIABLES (Data Structures):
 * - imageSetsByAngleAndTail: (Object) Maps the combination of probe angle and 
 * tail direction (the "key," e.g., "30_up") to an array of four image paths. The 
 * index of the array corresponds to the cell position (pos 1-4).
 * - cellOrientationMap: (Object) Maps the body position/drop zone index (pos 1-4) 
 * to an array of possible probe orientations (angle, tail direction, and view name). 
 * This enables the 'Switch View' feature.
 * - circlePositionsByKey: (Object) Defines the interactive circles for the quiz 
 * and sandbox mode. It maps the image key ("angle_tail") to a two-dimensional array 
 * where the second dimension corresponds to the cell position. Each circle object 
 * defines its position (x, y as percentages), the anatomical text, and the correct 
 * answer letter for the quiz.
 * - quizData: (Array of Objects) The sequence of quiz questions. Each object holds 
 * the question text, the required probe orientation key, the correct body position 
 * (`correctPosition`), the correct answer identifier (`correctAnswer`), and the 
 * image path showing the correct answer highlight.
 * 
 * NOTES:
 * - Data keys often use a format like "ANGLE_TAIL" (e.g., "30_up") to unify data access.
 * - Array indexing is 0-based, while position variables (pos, slideNum) are often 1-based, 
 * requiring index adjustments (e.g., `pos - 1`) in the controller scripts.
**/



// Image Data for different angles and tail positions
  const imageSetsByAngleAndTail = {
      "30_up": ["Echo_Images/30_up_1.png", "Echo_Images/30_up_2.png", "Echo_Images/30_up_3.png", "Echo_Images/30_up_4.png"],       // @ 2 = PSAX
      "30_down": ["Echo_Images/30_down_1.png", "Echo_Images/30_down_2.png", "Echo_Images/30_down_3.png", "Echo_Images/30_down_4.png"],   // @ 2 = PSAX AV level
      "90_up": ["Echo_Images/90_up_1.png", "Echo_Images/90_up_2.png", "Echo_Images/90_up_3.png", "Echo_Images/90_up_4.png"],     // @ 1 = Suprasternal notch
      "90_down": ["Echo_Images/90_down_1.png", "Echo_Images/90_down_2.png", "Echo_Images/90_down_3.png", "Echo_Images/90_down_4.png"],  // @ 3 = S4C, @ 4 = A4C
      "300_up": ["Echo_Images/300_up_1.png", "Echo_Images/300_up_2.png", "Echo_Images/300_up_3.png", "Echo_Images/300_up_4.png"]      // @ 2 = PLAX
  };
  
  // Cell orientation map for angles and tail direction
  const cellOrientationMap = {
      1: [{ angle: 90, tail: 'up', view: 'Suprasternal Notch'}],    // Suprasternal notch
      2: [
          { angle: 30, tail: 'up', view: 'Parasternal Short-axis'},      // PSAX
          { angle: 30, tail: 'down', view: 'Parasternal Short-axis AV'},    // PSAX AV level
          { angle: 300, tail: 'up', view: 'Parasternal Long-axis'},     // PLAX
      ],
      3: [{ angle: 90, tail: 'down', view: 'Subcostal 4-chamber'}],   // S4C
      4: [{ angle: 90, tail: 'down', view: 'Apical 4-chamber'}],   // A4C
  };
  
  // Circle positions for each question based on angle and tail direction
  const circlePositionsByKey = {
      "30_up": [
          [],
          [   // PSAX
              { x: 45, y: 54, answer: "A", text: "Left Ventricle" }   // Left Ventricle
          ],
          [],
          []
      ],
  
      "30_down": [
          [],
          [    // PSAX AV level
              { x: 45, y: 56, answer: "B", text: "Aortic Valve" },  // Aortic Valve
              { x: 45, y: 37, answer: "C", text: "Right Ventricular Outflow Tract" },  // Right Ventricular Outflow Tract
              { x: 45, y: 70, answer: "D", text: "Left Atrium" }, // Left Atrium
              { x: 30, y: 60, answer: "E", text: "Right Atrium" },  // Right Atrium
          ],
          [],
          []
      ],
  
      "300_up": [
          [],
          [    // PLAX
              { x: 40, y: 50, answer: "F", text: "Left Ventricle" },  // Left Ventricle
              { x: 53, y: 30, answer: "G", text: "Right Ventricle" },  // Right Ventricle
              { x: 65, y: 60, answer: "H", text: "Left Atrium" }, // Left Atrium
              { x: 53, y: 60, answer: "I", text: "Mitral Valve" },  // Mitral Valve
              { x: 60, y: 49, answer: "K", text: "Aortic Root" }   // Aortic Root
          ],
          [],
          []
      ],
  
      "90_up": [
          [   // Suprasternal notch
              { x: 45, y: 28, answer: "A", text: "Brachiocephalic Trunk" },  // Brachiocephalic Trunk
              { x: 50, y: 35, answer: "B", text: "Left Common Carotid Artery" },  // Left Common Carotid Artery
              { x: 35, y: 60, answer: "C", text: "Thoracic Descending Artery" }, // Thoracic Descending Artery
              { x: 28, y: 45, answer: "D", text: "Right Pulmonary Artery" },  // Right Pulmonary Artery
          ],
          [],
          [],
          []
      ],
  
      "90_down": [
          [],
          [],
          [     // Subcostal 4C
              { x: 50, y: 30, answer: "A", text: "Liver" }, // Liver
              { x: 30, y: 65, answer: "B", text: "Right Atrium" }, // Right Atrium
              { x: 53, y: 58, answer: "C", text: "Left Ventricle" } // Left Ventricle
          ],
          [     // A4C
              { x: 38, y: 54, answer: "A", text: "Right Ventricle" },  // Right Ventricle
              { x: 54, y: 50, answer: "B", text: "Left Ventricle" },  // Left Ventricle
              { x: 42, y: 63, answer: "C", text: "Tricuspid Valve" },  //  Tricuspid Valve
              { x: 53, y: 60, answer: "D", text: "Mitral Valve" },  //  Mitral Valve
              { x: 41, y: 67, answer: "E", text: "Right Atrium" },  // Right Atrium
              { x: 55, y: 70, answer: "F", text: "Left Atrium" },  //  Left Atrium
          ],
      ]
  };
  
  // Quiz data for questions
  const quizData = [
      {
          question: "Obtain the parasternal long axis view (PLAX) and identify the right ventricle on the image.",
        //   question: "-",
          key: "300_up",
          correctPosition: 2,
          correctAnswer: "G",
          correctImage: "Echo_Images/answer/Q1_ans.png"
      },
      {
          question: "Obtain the parasternal short axis view (PSAX) and identify the aortic valve.",
          key: "30_down",
          correctPosition: 2,
          correctAnswer: "B",
          correctImage: "Echo_Images/answer/Q2_ans.png"
      },
      {
          question: "Obtain the suprasternal notch view and identify the right pulmonary artery.",
          key: "90_up",
          correctPosition: 1,
          correctAnswer: "D",
          correctImage: "Echo_Images/answer/Q3_ans.png"
      },
      {
          question: "Obtain the apical 4-chamber view (A4C) and identify the left atrium.",
          key: "90_down",
          correctPosition: 4,
          correctAnswer: "F",
          correctImage: "Echo_Images/answer/Q4_ans.png"
      },
      {
          question: "Obtain the subcostal 4-chamber view (S4C) and identify the left ventricle.",
          key: "90_down",
          correctPosition: 3,
          correctAnswer: "C",
          correctImage: "Echo_Images/answer/Q5_ans.png"
      }
  ]
  
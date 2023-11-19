// Serial info from : https://itp.nyu.edu/physcomp/labs/labs-serial-communication/lab-serial-input-to-the-p5-js-ide/

/* Global variables */

// size of canvas
const width = 960;
const height = 540;

// framerate
const fr = 60;

// for serial communication
let serial;

// time settings in frames
const GAME_LENGTH = fr * 60;
const TITLE_SCREEN_TIME = fr * 3;
const GAME_START_TIME = fr * 3;
const MESSAGE_TIME = fr * 1.6;
const TUTORIAL_TIME = fr * 18;
const GAME_OVER_TIME = fr * 3;

// keep track of a player's score
let score = 0;
let scoreText = "";

// running count (of frames) for how long a game has been running
let gameDuration = 0;

// toggles between Arduino and keyboard controls
const USE_ARDUINO = false;

// global boolean for the flashlight's state
let flashlightOn = false;

// count variable used for misc things
let count = 0;

// enum for determining the state of the program
const STATE = {
   Title: 0,
   Tutorial: 1,
   Game: 2,
   GameOver: 3
}

// current state of the program (from enum)
let programState;

// variables containing the images used throughout the game
let ghostSprites;
let ghostJumpscare;
let logoSprite;
let flashlightSprite;

// ghost object
let ghost;

// pulse object if not using the arduino
let osc = new p5.Oscillator('sine');

// loads every image from the ./media folder
function preload() {
   flashlightSprite = loadImage('media/flashHole.png');
   ghostJumpscare = loadImage('media/jumpscare.png');
   logoSprite = loadImage('media/phantomLogo.png');

   ghostSprites = [
      loadImage('media/ghost1.png')
   ];
}

function updateFlashlight() {
   let serialString = serial.read();
   console.log(serialString)
 
   let photoVal = Number(serialString);
   console.log(photoVal);
   flashlightOn = photoVal > 10;
}


/**
 * setup :
 */
function setup() {
   createCanvas(width, height);
   
   getAudioContext().suspend();
   osc.amp(0);
   osc.start();

   imageMode(CENTER);

   frameRate(fr);

   programState = STATE.Title;
   count = TITLE_SCREEN_TIME;

   if (USE_ARDUINO) {
      serial = new p5.SerialPort();
      serial.open('COM5');
      serial.on('data', updateFlashlight);
   }
}

// need this for audio to play in keyboard mode
function keyPressed() {
   userStartAudio();
}

/**
 * draw :
 * loop that runs fr times a second
 */
function draw() {

   // input from keyboard if no arduino
   if (!USE_ARDUINO) {
      // p5js property, as long as a key is pressed, flashlight on
      flashlightOn = keyIsPressed;
   }

   noStroke();

   // draw black or yellow background
   if (flashlightOn || (programState === STATE.GameOver && (count > 0))) {
      background("#ffe791");
   } else {
      background("#000000");
   }

   // flashlight circular cover
   imageMode(CORNER);
   image(flashlightSprite, 0, 0);

   // case for each state of the game from STATE enum
   switch (programState) {

      // title screen
      case STATE.Title:
         imageMode(CENTER);
         image(logoSprite, width / 2, height / 2); // logo

         textAlign(CENTER, CENTER);
         textSize(30);

         if (flashlightOn) {
            // count down from 3 seconds
            fill(0);
            text(`Starting in ${Math.ceil(count / fr)}...`, width / 2, height * (3 / 4));
            count -= 0.8;
            if (count <= 0) {
               count = TUTORIAL_TIME;
               programState = STATE.Tutorial;
            }
         }
         else {
            // instruct the player to start the game
            fill(255);
            count = TITLE_SCREEN_TIME;
            if (USE_ARDUINO) {
               text("- Turn on the FlashBox -", width / 2, height * (3 / 4));
            }
            else {
               text("- Hold Any Key -", width / 2, height * (3 / 4));
            }
         }

         break;

      // tutorial text explaining how to play the game
      case STATE.Tutorial:
         count -= 1;

         // progress bar
         fill('#ffe791');
         rect(width * 1 / 10, height * 8.5 / 10, width * 8 / 10, height * 1 / 10, 15);
         fill(0);
         rect(width * 1.1 / 10, height * 8.6 / 10, width * (7.8 / 10) * ((TUTORIAL_TIME - count) / TUTORIAL_TIME), height * 0.8 / 10, 15);

         textAlign(CENTER, CENTER);
         textSize(30);

         if (flashlightOn) {
            fill(0);
         } else {
            fill(255);
         }

         // tutorial text
         text('GHOSTS are trying to spook you in the night!', width / 2, height * 1 / 5);
         text('Wait for them to get close,', width / 2, height * 1.8 / 5);
         text('then hit them with your FLASHLIGHT!', width / 2, height * 2.2 / 5);
         text('Listen for the GHOSTS as they approach!', width / 2, height * 3 / 5);
         text('Can you survive the night?', width / 2, height * 3.7 / 5);

         if (count <= 0) {
            // start game!
            programState = STATE.Game;
            ghost = new Ghost(ghostSprites, fr);
            gameDuration = 0;
            count = GAME_START_TIME;
            score = 0;
         }

         break;

      case STATE.Game: 

         textAlign(CENTER, CENTER);

         // da main game
         if (count > 0) {
            // starting countdown
            if (flashlightOn) {
               fill(0);

               if (Math.floor(count / 8) % 2 === 0) {
                  textSize(40);
                  text(`TURN OFF FLASHLIGHT`, width / 2, height * 1 / 5);
               }

            } else {
               fill(255);
            }

            textSize(70 * (1 + ((GAME_START_TIME / fr) - (Math.ceil(count / fr))) / 3));

            text(`${Math.ceil(count / fr)}`, width / 2, height / 2);
            count -= 0.7;

            if (count < 0) count = 0;
            break;

         }

         // reduce time
         gameDuration++;
         if (gameDuration >= GAME_LENGTH) {
            programState = STATE.GameOver;
            count = GAME_OVER_TIME;
            break;
         }

         // game loop
         if (ghost == null || ghost.delete) {
            ghost = new Ghost(ghostSprites, fr);
         }

         if (ghost.distance() >= 100) {
            programState = STATE.GameOver;
            count = GAME_OVER_TIME;
            break;
         }

         if (ghost.update(flashlightOn)){
            // ghost was caught, award points
            let dist = ghost.distance();
            if (dist > 92) {
               score += 10;
               scoreText = `EXCELLENT! +10`;
            }
            else if (dist > 78) {
               score += 7;
               scoreText = `GREAT! +7`;
            }
            else if (dist > 60) {
               score += 5;
               scoreText = `ALRIGHT! +5`;
            }
            else {
               score += 3;
               scoreText = `MEH! +3`;
            }
            // shows a message
            count = -MESSAGE_TIME;
         }
         ghost.draw(width, height);


         // hud
         fill(255);
         textSize(30);

         text(`TIME\n${Math.floor((GAME_LENGTH - gameDuration) / fr)}`, width * 0.6 / 10, height * 0.88 / 10);
         text(`SCORE\n${score}`, width * 9.15 / 10, height * 0.88 / 10);

         // point message?
         if (count < 0) {
            textSize(30);
            if (flashlightOn) {
               fill(0, 255 * (1 - ((count + MESSAGE_TIME) / MESSAGE_TIME)));
            } else {
               fill(255, 255 * (1 - ((count + MESSAGE_TIME) / MESSAGE_TIME)));
            }
            text(scoreText, width/2, height * 1/9);
            
            count++;
         } else {
            count = 0;
         }

         // sound output
         if (USE_ARDUINO) {
            serial.write(ghost.distance());
         } else {
            // pulse object
            let ghostPitch = ghost.pitch();
            if (ghostPitch === 0) {
               osc.amp(0, 0.1);
            } else {
               osc.amp(0.2, 0.1);
               osc.freq(ghostPitch, 0.1);
            }
         }
         break;


      case STATE.GameOver:
         osc.amp(0, 0.1);
         if (USE_ARDUINO) serial.write(0);

         // score
         fill(255);
         textSize(30);
         text(`SCORE\n${score}`, width * 9.15 / 10, height * 0.88 / 10);

         if (count > 0) {
            // background is forced to be yellow here
            count--;
            
            // game over text
            textSize(50);

            // game over by time? Or game over by death
            if (gameDuration < GAME_LENGTH) {
               // by death, draw ghost
               let offset = (Math.floor(count / 6) % 2) ? 5 : -5;
               imageMode(CENTER);
               image(ghostJumpscare, width/2 + offset, height/2);

               fill('#ffe791');
               text(`BOO!`, width * 1 / 2, height * 1 / 5);
            }
            else {
               fill(0);
               text(`TIME UP!`, width * 1 / 2, height * 1 / 2);
            }

            if (count <= 0) { 
               count = -TITLE_SCREEN_TIME;
            }

            break;
         }

         // restart game
         if (!flashlightOn) {
            // count down from 3 seconds
            fill(255);
            text(`Restarting in ${Math.ceil(-count / fr)}...`, width / 2, height / 2);
            count += 0.8;
            if (count >= 0) {
               // start game!
               programState = STATE.Game;
               ghost = new Ghost(ghostSprites, fr);
               gameDuration = 0;
               count = GAME_START_TIME;
               score = 0;
            }
         }
         else {
            // instruct the player to start the game
            fill(0);
            count = -TITLE_SCREEN_TIME;
            text("- Turn Off the Flashlight to Restart -", width / 2, height / 2);
         }

         break;
         
   }
}

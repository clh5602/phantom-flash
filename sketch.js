"use strict"; //catch some common coding errors

/* Global variables */

// size of canvas
const width = 960;
const height = 540;

// framerate
const fr = 60;

// time settings in frames
const GAME_LENGTH = fr * 100;
const TITLE_SCREEN_TIME = fr * 3;
const GAME_START_TIME = fr * 3;
const TUTORIAL_TIME = fr * 20;

// keep track of a player's score
let score = 0;

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
let pulse = new p5.Pulse();

// loads every image from the ./media folder
function preload() {
   flashlightSprite = loadImage('media/flashHole.png');
   ghostJumpscare = loadImage('media/jumpscare.png');
   logoSprite = loadImage('media/phantomLogo.png');

   ghostSprites = [
      loadImage('media/ghost1.png')
   ];
}

/**
 * setup :
 */
function setup() {
   createCanvas(width, height);
   imageMode(CENTER);

   frameRate(fr);

   programState = STATE.Game;
   count = GAME_START_TIME;
}

/**
 * draw :
 * loop that runs fr times a second
 */
function draw() {

   // input from flashlight
   if (USE_ARDUINO) {

   } else {
      // p5js property, as long as a key is pressed, flashlight on
      flashlightOn = keyIsPressed;
   }

   noStroke();

   // draw black or yellow background
   if (flashlightOn) {
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
         rect(width * 1/10, height * 8.5 / 10, width * 8/10, height * 1/10, 15);
         fill(0);
         rect(width * 1.1/10, height * 8.6 / 10, width * (7.8/10) * ((TUTORIAL_TIME - count) / TUTORIAL_TIME), height * 0.8/10, 15);

         textAlign(CENTER, CENTER);
         textSize(30);

         if (flashlightOn) {
            fill(0);
         } else {
            fill(255);
         }

         // tutorial text
         text('GHOSTS are trying to spook you in the night!', width/2, height * 1/5);
         text('Wait for them to get close,', width/2, height * 1.8/5);
         text('then hit them with your FLASHLIGHT!', width/2, height * 2.2/5);
         text('Listen for the GHOSTS as they approach!', width/2, height * 3/5);
         text('Can you survive the night?', width/2, height * 3.7/5);

         if (count <= 0) {
            // start game!
            programState = STATE.Game;
            ghost = new Ghost(ghostSprites);
            gameDuration = 0;
            count = GAME_START_TIME;
            score = 0;
         }

         break;

      case STATE.Game: {
         textAlign(CENTER, CENTER);

         // da main game
         if (count > 0) {
            // starting countdown
            if (flashlightOn) {
               fill(0);
               
               if (Math.floor(count / 8) % 2 === 0) {
                  textSize(40);
                  text(`TURN OFF FLASHLIGHT`, width/2, height * 1/5);
               }
               
            } else {
               fill(255);
            }

            textSize(70 * (1 + ((GAME_START_TIME / fr) - (Math.ceil(count / fr))) / 3));

            text(`${Math.ceil(count / fr)}`, width/2, height/2);
            count -= 0.7;

            break;

         }

         // game loop
         if (ghost == null || ghost.delete) {
            ghost = new Ghost(ghostSprites);
         }



         // hud
         fill(255);
         textSize(30);

         text(`TIME\n${Math.floor((GAME_LENGTH - gameDuration)/fr)}`, width * 0.6/10, height * 0.88/10);
         text(`SCORE\n${score}`, width * 9.15/10, height * 0.88/10);
      }
   }
}

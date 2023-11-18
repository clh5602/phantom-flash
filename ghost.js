const PATTERN_COUNT = 4;
const FADE_TIMER_MAX = 45; // frames to fade out
const PAUSE_MAX = 90; // frames to pause
let PATTERN_LENGTH = 6 * 60; // time in seconds a function should last

class Ghost {

    constructor(ghostSprites, fr) {
        this.dist = 0; // 0 - 100
        this.pattern = Math.floor(Math.random() * (PATTERN_COUNT));
        this.design = ghostSprites[Math.floor(Math.random() * ghostSprites.length)];
        this.pauseTimer = PAUSE_MAX;
        this.delete = false;
        this.activeTimer = 0;
        this.fadeTimer = FADE_TIMER_MAX;
        PATTERN_LENGTH = 8 + Math.floor(Math.random() * 4);
        PATTERN_LENGTH *= fr;
    }

    // either fades out,
    // hides if far away,
    // or begins fading if caught
    // returns true when caught
    update(flashState) {
        if (this.fadeTimer != FADE_TIMER_MAX) {
            // continue fading away
            this.fadeTimer--;
            this.delete = (this.fadeTimer <= 0);
        }
        else if (flashState) {
            // flashlight on
            if (this.pauseTimer <= 0 && this.dist >= 40) {
                // in range to disappear
                this.fadeTimer--;
                return true;
            }
            else {
                // ghost not ready to disappear
                this.pauseTimer = PAUSE_MAX;
            }
        }
        else {
            this.activeTimer++;
            // flashlight off, can move
            if (this.pauseTimer > 0) {
                this.pauseTimer--;
                return false;
            }

            switch(this.pattern) {

                case 1:
                    // step pattern
                    this.dist = 5 + Math.floor(this.activeTimer / (PATTERN_LENGTH / 10)) * 10;
                    break;

                case 2:
                    // reverse parabola
                    if (this.activeTimer < PATTERN_LENGTH / 2) {
                        this.dist = map(this.activeTimer, PATTERN_LENGTH/2, 0, 20, 50);
                    } else {
                        this.dist = map(this.activeTimer, PATTERN_LENGTH/2, PATTERN_LENGTH, 20, 100);
                    }
                    break;

                case 3:
                    // pause
                    if (this.activeTimer < PATTERN_LENGTH * 0.35) {
                        this.dist = map(this.activeTimer, 0, PATTERN_LENGTH * 0.35, 0, 35);
                    } 
                    else if (this.activeTimer < PATTERN_LENGTH * 0.55) {
                        this.dist = 35;
                    }
                    else {
                        this.dist = map(this.activeTimer, PATTERN_LENGTH * 0.55, PATTERN_LENGTH, 35, 100);
                    }
                    break;

                case 4:
                    // ramps
                    if (this.activeTimer < PATTERN_LENGTH * 0.33) {
                        this.dist = map(this.activeTimer, 0, PATTERN_LENGTH * 0.33, 0, 45);
                    } 
                    else if (this.activeTimer < PATTERN_LENGTH * 0.66) {
                        this.dist = map(this.activeTimer, PATTERN_LENGTH * 0.33, PATTERN_LENGTH * 0.66, 30, 75);
                    }
                    else {
                        this.dist = map(this.activeTimer, PATTERN_LENGTH * 0.66, PATTERN_LENGTH, 60, 100);
                    }
                    break;

                default:
                    // linear pattern
                    this.dist += 100 / (PATTERN_LENGTH);
                    break;
            }
        }

        return false;

    }

    // draws the fade out sprite
    draw(width, height) {
        if (this.fadeTimer != FADE_TIMER_MAX) {
            imageMode(CENTER);
            let size = (this.dist / 100) * 512;

            tint(255, (this.fadeTimer / FADE_TIMER_MAX) * 255);

            image(this.design, width / 2, height / 2, size, size);

            tint(255, 255);
        }
    }

    // returns the pitch that the piezo should play
    pitch() {
        if (this.pauseTimer > 0 || this.fadeTimer != FADE_TIMER_MAX) {
            return 0;
        }
        else {
            if (this.dist > 100) {
                return 1000;
            }
            return this.dist * 10;
        }
    }

    // gets the distance
    distance() {
        return this.dist;
    }

}
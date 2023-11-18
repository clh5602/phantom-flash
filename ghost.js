const PATTERN_COUNT = 1;
const FADE_TIMER_MAX = 45; // frames to fade out
const PAUSE_MAX = 90; // frames to pause
const PATTERN_LENGTH = 8; // time in seconds a function should last

class Ghost {

    constructor(ghostSprites) {
        this.dist = 0; // 0 - 100
        this.pattern = Math.floor(Math.random() * PATTERN_COUNT);
        this.design = ghostSprites[Math.floor(Math.random() * ghostSprites.length)];
        this.pauseTimer = PAUSE_MAX;
        this.delete = false;
        this.activeTimer = 0;
        this.fadeTimer = FADE_TIMER_MAX;
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
            if (this.pauseTimer <= 0 && this.dist >= 50) {
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
            // flashlight off, can move
            if (this.pauseTimer > 0) {
                this.pauseTimer--;
                return false;
            }

            switch(this.pattern) {
                default:
                    // linear pattern
                    this.dist += 100 / (60 * PATTERN_LENGTH);
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
            return this.dist * 40;
        }
    }

    // gets the distance
    distance() {
        return this.dist;
    }

}
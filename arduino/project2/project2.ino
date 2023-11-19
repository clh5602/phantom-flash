// variable to hold sensor value
int sensorValue;
int incomingPitch;

// Piezo pin
const int piezoPin = 8;

void setup() {
  Serial.begin(9600);
}

void loop() {
  //read the input from A0 and store it in a variable
  sensorValue = analogRead(A0);

  // send value through serial communication
  Serial.write(map(sensorValue, 0, 1023, 0, 255)); // only send 0-255

  // listen for serial communication from the game
  if (Serial.available() > 0) {
    incomingPitch = Serial.read(); // can only read 0-255

    // play the pitch
    if (incomingPitch == 0) {
      noTone(piezoPin);
    }
    else { // if pitch is 0, no noise
      tone(piezoPin, incomingPitch * 10, 20);
    }

  } else {
    noTone(piezoPin);
  }

  // wait for a moment
  delay(10);
}

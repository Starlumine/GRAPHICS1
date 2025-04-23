const int JOYX_PIN = A0;
const int JOYY_PIN = A1;
const int SW_PIN = 2;
const int BUZZER_PIN = 9;

const int NUM_READINGS = 10;

struct AxisReadings {
  int readIndex;
  int readings[NUM_READINGS];
  float total = 0;
  int average = 0;
  int zeroed;
} xAxisReadings, yAxisReadings;

bool zeroing = false;
bool ready = false;

void setup() {
  Serial.begin(9600);

  pinMode(SW_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW); // keep buzzer silent by default

  for (int i = 0; i < NUM_READINGS; i++) {
    xAxisReadings.readings[i] = 0;
    yAxisReadings.readings[i] = 0;
  }

  xAxisReadings.readIndex = 0;
  yAxisReadings.readIndex = 0;
}

void loop() {
  int xValue = analogRead(JOYX_PIN);
  int yValue = analogRead(JOYY_PIN);
  int swValue = !digitalRead(SW_PIN);  // invert button (pressed = 1)

  smoothAxis(&xAxisReadings, xValue);
  smoothAxis(&yAxisReadings, yValue);

  // Handle incoming serial commands
  if (Serial.available() > 0) {
    String msg = Serial.readStringUntil('\n');
    msg.trim();  // remove whitespace

    if (msg == "zero") {
      zeroing = true;
    } else if (msg == "buzz") {
      Serial.println("Buzz received!");
      digitalWrite(BUZZER_PIN, HIGH);
      delay(100);  // beep duration
      digitalWrite(BUZZER_PIN, LOW);
    }
  }

  // If zeroing requested, set the zero values
  if (zeroing) {
    xAxisReadings.zeroed = xAxisReadings.average;
    yAxisReadings.zeroed = yAxisReadings.average;
    zeroing = false;
    ready = true;
  }

  // Send serial output if joystick is ready
  if (ready) {
    Serial.print(xAxisReadings.average - xAxisReadings.zeroed);
    Serial.print(",");
    Serial.print(yAxisReadings.average - yAxisReadings.zeroed);
    Serial.print(",");
    Serial.println(swValue);  // 1 = pressed, 0 = not
  }

  delay(16);  // roughly 60 FPS
}

void smoothAxis(AxisReadings *readings, int newValue) {
  int index = readings->readIndex;
  readings->total -= readings->readings[index];
  readings->readings[index] = newValue;
  readings->total += newValue;

  readings->readIndex++;
  if (readings->readIndex >= NUM_READINGS)
    readings->readIndex = 0;

  readings->average = round(readings->total / NUM_READINGS);
}

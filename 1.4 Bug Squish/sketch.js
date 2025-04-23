let GameStates = Object.freeze({
  START: "start",
  PLAY: "play",
  END: "end"
});

let gameState = GameStates.START, score = 0, highScore = 0, time = 30, textPadding = 15;
let cockroachSprite, splatSprite, splatSound, scuttleSound, skitteringSound;
let cockroaches = [], splats = [], speedIncrease = 0.2, spawnInterval = 0.5, lastSpawnTime = 0, minCockroachCount = 8;

let port, connectionButton, zeroButton;
let joystick = { x: 0, y: 0, button: 0 };
let cursorX, cursorY, speed = 0.01;
let buttonPressedLastFrame = false;

function preload() {
  cockroachSprite = loadImage("media/Cockroach.png");
  splatSprite = loadImage("media/squished.png");
  splatSound = loadSound("media/splat.mp3");
  scuttleSound = loadSound("media/skittering.mp3");
  skitteringSound = loadSound("media/skittering.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  port = createSerial();
  connectionButton = createButton('Connect');
  connectionButton.position(10, height - 60);
  connectionButton.mousePressed(async () => {
    await port.open();
  });

  zeroButton = createButton('Zero Joystick');
  zeroButton.position(100, height - 60);
  zeroButton.mousePressed(() => {
    if (port.opened) port.write('zero\n');
  });

  for (let i = 0; i < minCockroachCount; i++) {
    cockroaches.push(new Cockroach(random(width), random(height)));
  }

  cursorX = width / 2;
  cursorY = height / 2;

  splatSound.setVolume(0.8);
  scuttleSound.setVolume(0.1);
  skitteringSound.setVolume(0.5);
}

function draw() {
  background(220);
  readSerial();

  switch (gameState) {
    case GameStates.START:
      textAlign(CENTER, CENTER);
      textSize(18);
      text("Press joystick button to Start", width / 2, height / 2);
      break;

    case GameStates.PLAY:
      if (cockroaches.length > 0 && !scuttleSound.isPlaying()) {
        scuttleSound.loop();
      } else if (cockroaches.length === 0 && scuttleSound.isPlaying()) {
        scuttleSound.stop();
      }

      if (skitteringSound && skitteringSound.isLoaded()) {
        let speedMultiplier = 1 + (30 - time) / 30;
        skitteringSound.rate(speedMultiplier);
        if (!skitteringSound.isPlaying()) skitteringSound.loop();
      }

      textAlign(LEFT, TOP);
      text("Score: " + score, textPadding, textPadding);
      textAlign(RIGHT, TOP);
      text("Time: " + Math.ceil(time), width - textPadding, textPadding);

      time -= deltaTime / 1000;
      if (time <= 0) {
        gameState = GameStates.END;
        scuttleSound.stop();
        skitteringSound.stop();
      }

      if (cockroaches.length < minCockroachCount && millis() - lastSpawnTime > spawnInterval * 1000) {
        let newCockroach = new Cockroach(random(width), random(height));
        if (cockroaches.length > 0) {
          newCockroach.speed = cockroaches[0].speed;
        }
        cockroaches.push(newCockroach);
        lastSpawnTime = millis();
      }

      for (let cockroach of cockroaches) {
        cockroach.move();
        cockroach.draw();
      }

      for (let splat of splats) {
        image(splatSprite, splat.x - 40, splat.y - 40, 80, 80);
      }

      // Check for bug squish using joystick button
      if (joystick.button === 1 && !buttonPressedLastFrame) {
        for (let i = cockroaches.length - 1; i >= 0; i--) {
          if (cockroaches[i].isClicked(cursorX, cursorY)) {
            splats.push({ x: cockroaches[i].x + 40, y: cockroaches[i].y + 40 });
            cockroaches.splice(i, 1);
            score++;
            if (splatSound.isLoaded()) splatSound.play();
            if (port.opened) port.write("buzz\n");
            for (let roach of cockroaches) {
              roach.speed += speedIncrease;
            }
          }
        }
      }
      buttonPressedLastFrame = joystick.button === 1;

      // Draw virtual cursor
      fill(255, 0, 0);
      noStroke();
      circle(cursorX, cursorY, 20);

      break;

    case GameStates.END:
      textAlign(CENTER, CENTER);
      text("Game Over!", width / 2, height / 2 - 20);
      text("Score: " + score, width / 2, height / 2);
      if (score > highScore) highScore = score;
      text("High Score: " + highScore, width / 2, height / 2 + 20);
      text("Press joystick button to Restart", width / 2, height / 2 + 40);
      break;
  }

  // Move cursor
  cursorX += joystick.x * speed;
  cursorY += joystick.y * speed;
  cursorX = constrain(cursorX, 0, width);
  cursorY = constrain(cursorY, 0, height);
}

function readSerial() {
  let str = port.readUntil('\n');
  if (str !== "") {
    str = str.trim();
    const values = str.split(',');
    if (values.length === 3) {
      joystick.x = Number(values[0]);
      joystick.y = Number(values[1]);
      joystick.button = Number(values[2]);
    }
  }

  if (gameState === GameStates.START && joystick.button === 1 && !buttonPressedLastFrame) {
    gameState = GameStates.PLAY;
  }

  if (gameState === GameStates.END && joystick.button === 1 && !buttonPressedLastFrame) {
    gameState = GameStates.START;
    score = 0;
    time = 30;
    cockroaches = [];
    splats = [];
    scuttleSound.stop();
    skitteringSound.stop();
    for (let i = 0; i < minCockroachCount; i++) {
      cockroaches.push(new Cockroach(random(width), random(height)));
    }
  }
}

class Cockroach {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 2;
    this.frame = 0;
    this.spriteWidth = cockroachSprite.width / 4;
    this.direction = randomDirection();
    this.changeInterval = 100;
    this.lastChange = millis();
  }

  move() {
    if (millis() - this.lastChange > this.changeInterval) {
      if (random() < 0.1) {
        this.direction = randomDirection();
      }
      this.lastChange = millis();
    }

    if (this.direction === "left") {
      this.x -= this.speed;
      if (this.x < 0) { this.x = 0; this.direction = randomDirection(); }
    } else if (this.direction === "right") {
      this.x += this.speed;
      if (this.x > width - 80) { this.x = width - 80; this.direction = randomDirection(); }
    } else if (this.direction === "up") {
      this.y -= this.speed;
      if (this.y < 0) { this.y = 0; this.direction = randomDirection(); }
    } else if (this.direction === "down") {
      this.y += this.speed;
      if (this.y > height - 80) { this.y = height - 80; this.direction = randomDirection(); }
    }

    this.frame = (this.frame + 1) % 4;
  }

  draw() {
    push();
    translate(this.x + 40, this.y + 40);
    if (this.direction === "left") rotate(radians(270));
    else if (this.direction === "right") rotate(radians(90));
    else if (this.direction === "down") rotate(radians(180));
    image(cockroachSprite, -40, -40, 80, 80, this.frame * this.spriteWidth, 0, this.spriteWidth, cockroachSprite.height);
    pop();
  }

  isClicked(px, py) {
    return px > this.x && px < this.x + 80 && py > this.y && py < this.y + 80;
  }
}

function randomDirection() {
  let dirs = ["left", "right", "up", "down"];
  return random(dirs);
}

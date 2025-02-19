let GameStates = Object.freeze({ 
  START: "start",
  PLAY: "play",
  END: "end"
});

let gameState = GameStates.START;
let score = 0;
let highScore = 0;
let time = 30;
let textPadding = 15;
let cockroachSprite;
let splatSprite;
let cockroaches = [];
let splats = [];
let speedIncrease = 0.2; // Speed boost after each splat
let spawnInterval = .5; // Seconds between new cockroach spawns
let lastSpawnTime = 0;
let minCockroachCount = 8; 

function preload() {
  cockroachSprite = loadImage("media/Cockroach.png");
  splatSprite = loadImage("media/squished.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < minCockroachCount; i++) {
    cockroaches.push(new Cockroach(random(width), random(height)));
  }
}

function draw() {
  background(220);

  switch(gameState) {
    case GameStates.START:
      textAlign(CENTER, CENTER);
      textSize(18);
      text("Press ENTER to Start", width / 2, height / 2);
      break;

    case GameStates.PLAY:
      textAlign(LEFT, TOP);
      text("Score: " + score, textPadding, textPadding);
      textAlign(RIGHT, TOP);
      text("Time: " + Math.ceil(time), width - textPadding, textPadding);
      
      time -= deltaTime / 1000;
      if (time <= 0) {
        gameState = GameStates.END;
      }

      // Spawn new cockroaches to maintain minimum count
      if (cockroaches.length < minCockroachCount && millis() - lastSpawnTime > spawnInterval * 1000) {
        let newCockroach = new Cockroach(random(width), random(height));

        // Ensures speed difficulty is the same
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

      break;

    case GameStates.END:
      textAlign(CENTER, CENTER);
      text("Game Over!", width / 2, height / 2 - 20);
      text("Score: " + score, width / 2, height / 2);
      
      if (score > highScore) {
        highScore = score;
      }

      text("High Score: " + highScore, width / 2, height / 2 + 20);
      text("Press ENTER to Restart", width / 2, height / 2 + 40);
      break;
  }
}

function keyPressed() {
  switch(gameState) {
    case GameStates.START:
      if (keyCode === ENTER) {
        gameState = GameStates.PLAY;
      }
      break;

    case GameStates.END:
      if (keyCode === ENTER) {
        gameState = GameStates.START;
        score = 0;
        time = 30;
        cockroaches = [];
        splats = [];
        for (let i = 0; i < minCockroachCount; i++) {
          cockroaches.push(new Cockroach(random(width), random(height)));
        }
      }
      break;
  }
}

function mousePressed() {
  for (let i = cockroaches.length - 1; i >= 0; i--) {
    if (cockroaches[i].isClicked(mouseX, mouseY)) {
      splats.push({ x: cockroaches[i].x + 40, y: cockroaches[i].y + 40 }); // Center splat
      cockroaches.splice(i, 1);
      score++;

      // Speed up all existing cockroaches
      for (let roach of cockroaches) {
        roach.speed += speedIncrease;
      }
    }
  }
}

function randomDirection() {
  let dirs = ["left", "right", "up", "down"];
  return random(dirs);
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

    if (this.direction === "left") {
      rotate(radians(270));  
    } else if (this.direction === "right") {
      rotate(radians(90));  
    } else if (this.direction === "down") {
      rotate(radians(180));  
    } else if (this.direction === "up") {
      rotate(radians(0));  
    }

    image(cockroachSprite, -40, -40, 80, 80, this.frame * this.spriteWidth, 0, this.spriteWidth, cockroachSprite.height);
    pop();
  }

  isClicked(px, py) {
    return px > this.x && px < this.x + 80 && py > this.y && py < this.y + 80;
  }
}

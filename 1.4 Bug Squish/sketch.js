let GameStates = Object.freeze({ 
  START: "start",
  PLAY: "play",
  END: "end"
});

// Game state variables
let gameState = GameStates.START, score = 0, highScore = 0, time = 30, textPadding = 15;

// Game assets
let cockroachSprite, splatSprite, splatSound, scuttleSound;

// Game mechanics
let cockroaches = [], splats = [], speedIncrease = 0.2, spawnInterval = 0.5, lastSpawnTime = 0, minCockroachCount = 8;

// Background music variables
let squishSynth, filt, LFOfilt, panner, fmSynth, noise1, noiseEnv, filt1, escapeSynth, missSynth, basicSynth, padSynth, arpSynth, arpPattern, noiseSynth, noiseLoop;

function preload() {
  cockroachSprite = loadImage("media/Cockroach.png");
  splatSprite = loadImage("media/squished.png");
  splatSound = loadSound("media/splat.mp3");
  splatSound.setVolume(0.8); // Set volume to 80%
  scuttleSound = loadSound("media/bug_scuttling.wav");
  scuttleSound.setVolume(0.1); // Set volume to 10%
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
      // Handle scuttling sound
      if (cockroaches.length > 0 && !scuttleSound.isPlaying()) {
        scuttleSound.loop();
      } else if (cockroaches.length === 0 && scuttleSound.isPlaying()) {
        scuttleSound.stop();
      }

      textAlign(LEFT, TOP);
      text("Score: " + score, textPadding, textPadding);
      textAlign(RIGHT, TOP);
      text("Time: " + Math.ceil(time), width - textPadding, textPadding);
      
      time -= deltaTime / 1000;
      if (time <= 0) {
        gameState = GameStates.END;
        scuttleSound.stop();
        stopBackgroundMusic(); // Stop the background music
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
        startBackgroundMusic(); // Start the background music
      }
      break;

    case GameStates.END:
      if (keyCode === ENTER) {
        gameState = GameStates.START;
        score = 0;
        time = 30;
        cockroaches = [];
        splats = [];
        scuttleSound.stop();
        stopBackgroundMusic(); // Stop the background music
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
      splatSound.play();

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

// Background music functions
function startBackgroundMusic() {
  padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sine" },
    envelope: {
      attack: 4,
      decay: 2,
      sustain: 0.5,
      release: 6
    }
  }).toDestination();

  let padNotes = ["C4", "E4", "G4", "B4"];
  let padIndex = 0;

  new Tone.Loop(time => {
    padSynth.triggerAttackRelease(padNotes[padIndex % padNotes.length], 6, time);
    padIndex++;
  }, "8s").start(0);

  arpSynth = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: {
      attack: 0.04,
      decay: 0.2,
      sustain: 0.1,
      release: 0.5
    }
  }).toDestination();

  arpPattern = new Tone.Pattern((time, note) => {
    arpSynth.triggerAttackRelease(note, "8n", time);
  }, ["C5", "E5", "G5", "B5"], "upDown");

  arpPattern.interval = "8n";
  arpPattern.start(0);

  noiseSynth = new Tone.NoiseSynth({
    noise: { type: "brown" },
    envelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0,
      release: 0.1
    }
  }).toDestination();

  noiseLoop = new Tone.Loop(time => {
    noiseSynth.triggerAttackRelease("8n", time);
  }, "4n");

  noiseLoop.start(0);

  Tone.Transport.start();
}

function stopBackgroundMusic() {
  if (arpPattern && arpPattern.state === "started") {
    arpPattern.stop();
  }
  if (noiseLoop && noiseLoop.state === "started") {
    noiseLoop.stop();
  }
  Tone.Transport.stop();
}
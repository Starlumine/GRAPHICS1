let GameStates = Object.freeze({ 
  START: "start",
  PLAY: "play",
  END: "end"
});

let gameState = GameStates.START, score = 0, highScore = 0, time = 30, textPadding = 15;

let cockroachSprite, splatSprite, splatSound, scuttleSound, skitteringSound;

let cockroaches = [], splats = [], speedIncrease = 0.2, spawnInterval = 0.5, lastSpawnTime = 0, minCockroachCount = 8;

let squishSynth, filt, LFOfilt, panner, fmSynth, noise1, noiseEnv, filt1, escapeSynth, missSynth, basicSynth, padSynth, arpSynth, arpPattern, noiseSynth, noiseLoop;

function preload() {
  cockroachSprite = loadImage("media/Cockroach.png");
  splatSprite = loadImage("media/squished.png");
  splatSound = loadSound("media/splat.mp3");
  splatSound.setVolume(0.8); 
  scuttleSound = loadSound("media/skittering.mp3");
  scuttleSound.setVolume(0.1);
  skitteringSound = loadSound("media/skittering.mp3", 
    () => console.log("Skittering sound loaded successfully"),
    () => console.error("Error loading skittering sound")
  );
  skitteringSound.setVolume(0.5);
  skitteringSound.loop(); // Make it loop continuously
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

      if (skitteringSound && skitteringSound.isPlaying()) {

        let speedMultiplier = 1 + (30 - time) / 30;
        skitteringSound.rate(speedMultiplier);
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
        stopBackgroundMusic(); 
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
        startBackgroundMusic(); 
        console.log("Attempting to play skittering sound...");
        if (skitteringSound && skitteringSound.isLoaded()) {
          skitteringSound.play();
          skitteringSound.rate(1.0); 
          console.log("Skittering sound started playing");
        } else {
          console.error("Skittering sound not loaded or not available");
        }
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
        skitteringSound.stop();
        stopBackgroundMusic(); 
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
      splats.push({ x: cockroaches[i].x + 40, y: cockroaches[i].y + 40 });
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

function startBackgroundMusic() {
  // Increase the tempo for a more upbeat feel
  Tone.Transport.bpm.value = 140; // Faster tempo

  // Create a bright pad synth
  padSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "sawtooth" }, // Brighter sound
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.5,
      release: 0.5
    }
  }).toDestination();

  let padNotes = ["C4", "E4", "G4", "B4"];
  let padIndex = 0;

  // Add a rhythmic pad loop
  new Tone.Loop(time => {
    padSynth.triggerAttackRelease(padNotes[padIndex % padNotes.length], "8n", time);
    padIndex++;
  }, "2n").start(0);


  arpPattern = new Tone.Pattern((time, note) => {
    arpSynth.triggerAttackRelease(note, "16n", time);
  }, ["C5", "E5", "G5", "B5", "C6", "E6", "G6", "B6"], "upDown");

  arpPattern.interval = "16n";
  arpPattern.start(0);

  let bassSynth = new Tone.MonoSynth({
    oscillator: { type: "sawtooth" },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.3,
      release: 0.1
    },
    filter: {
      type: "lowpass",
      frequency: 200,
      Q: 1
    }
  }).toDestination();

  let bassNotes = ["C2", "G2", "C2", "G2"];
  let bassIndex = 0;

  new Tone.Loop(time => {
    bassSynth.triggerAttackRelease(bassNotes[bassIndex % bassNotes.length], "8n", time);
    bassIndex++;
  }, "1n").start(0);

  let drumSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0,
      release: 0.1
    }
  }).toDestination();

  let drumPattern = new Tone.Pattern((time, note) => {
    drumSynth.triggerAttackRelease(note, "8n", time);
  }, ["C2", null, "C2", null, "C2", null, "C2", null]);

  drumPattern.interval = "8n";
  drumPattern.start(0);

  let hiHatSynth = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0,
      release: 0.1
    }
  }).toDestination();

  let hiHatPattern = new Tone.Pattern((time, note) => {
    hiHatSynth.triggerAttackRelease("16n", time);
  }, ["16n", "16n", "16n", "16n"]);

  hiHatPattern.interval = "16n";
  hiHatPattern.start(0);

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
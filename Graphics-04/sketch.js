let roundGirl, greenGirl, sombreroGuy;
let characters = [];

function preload() {
  roundGirl = loadImage("media/round girl.png");
  greenGirl = loadImage("media/green girl.png");
  sombreroGuy = loadImage("media/sombrero.png");
}

function setup() {
  createCanvas(400, 400);
  imageMode(CENTER);

  // Create characters with random positions
  characters.push(new Character(random(0, width - 80), random(0, height - 80), roundGirl));
  characters.push(new Character(random(0, width - 80), random(0, height - 80), greenGirl));
  characters.push(new Character(random(0, width - 80), random(0, height - 80), sombreroGuy));

  // Assign animations
  for (let char of characters) {
    char.addAnimation("move", new SpriteAnimation(char.spriteSheet, 0, 0, 9));
    char.addAnimation("stand", new SpriteAnimation(char.spriteSheet, 0, 0, 1));
    char.currentAnimation = "stand";
  }
}

function draw() {
  background(220);

  // Draw all characters
  for (let char of characters) {
    char.draw();
  }
}

function keyPressed() {
  for (let char of characters) {
    char.keyPressed();
  }
}

function keyReleased() {
  for (let char of characters) {
    char.keyReleased();
  }
}

class Character {
  constructor(x, y, spriteSheet) {
    this.x = x;
    this.y = y;
    this.spriteSheet = spriteSheet;
    this.currentAnimation = "stand";
    this.animations = {};
    this.facingLeft = false;
  }

  addAnimation(key, animation) {
    this.animations[key] = animation;
  }

  draw() {
    let animation = this.animations[this.currentAnimation];
    if (animation) {
      if (this.currentAnimation === "move") {
        this.x += this.facingLeft ? -2 : 2;
      }
      push();
      translate(this.x, this.y);
      if (this.facingLeft) scale(-1, 1);
      animation.draw();
      pop();
    }
  }

  keyPressed() {
    switch (keyCode) {
      case LEFT_ARROW:
        this.currentAnimation = "move";
        this.facingLeft = true;
        break;
      case RIGHT_ARROW:
        this.currentAnimation = "move";
        this.facingLeft = false;
        break;
    }
  }

  keyReleased() {
    this.currentAnimation = "stand";
  }
}

class SpriteAnimation {
  constructor(spritesheet, startu, startv, duration) {
    this.spritesheet = spritesheet;
    this.u = startu;
    this.v = startv;
    this.duration = duration;
    this.startu = startu;
    this.frameCount = 0;
  }

  draw() {
    image(this.spritesheet, 0, 0, 80, 80, this.u * 80, this.v * 80, 80, 80);

    this.frameCount++;
    if (this.frameCount % 10 === 0) this.u++;

    if (this.u == this.startu + this.duration) this.u = this.startu;
  }
}

let coinImage;
let synth1, synth2;
let reverb, delay, filter, lfo;
let showCoin = false;

function preload() {
  coinImage = loadImage("media/coin.png"); 
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Set up the synths
  synth1 = new Tone.Synth({
    oscillator: {
      type: "sine" 
    },
    envelope: {
      attack: 0.01,
      decay: 0.2,
      sustain: 0,
      release: 0.1
    }
  }).toDestination();

  synth2 = new Tone.Synth({
    oscillator: {
      type: "triangle" 
    },
    envelope: {
      attack: 0.01,
      decay: 0.15,
      sustain: 0,
      release: 0.08
    }
  }).toDestination();

  reverb = new Tone.Reverb({
    decay: 1,
    wet: 0.3
  }).toDestination();

  delay = new Tone.FeedbackDelay({
    delayTime: 0.2,
    feedback: 0.1,
    wet: 0.2
  }).toDestination();

  synth1.chain(reverb, delay);
  synth2.chain(reverb, delay);

  filter = new Tone.Filter(500, "lowpass").toDestination();
  synth1.connect(filter);

  lfo = new Tone.LFO(0.1, 400, 1200).start(); 
  lfo.connect(filter.frequency);
}

function draw() {
  background(220);

  if (showCoin) {
    imageMode(CENTER);
    image(coinImage, width / 2, height / 2, 500, 300); 
  }
}

function mousePressed() {
  showCoin = true;

  // Plays the main sound
  synth1.triggerAttackRelease("E6", "16n");

  // Adds a second chime for a layered sound effect
  setTimeout(() => {
    synth2.triggerAttackRelease("G6", "16n");
  }, 50); 
}

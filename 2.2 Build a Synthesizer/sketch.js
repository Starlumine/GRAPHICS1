// Load Tone.js library
let toneScript = document.createElement('script');
toneScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js';
toneScript.onload = () => {
  console.log('Tone.js loaded');
  setupSynth();
};
document.head.appendChild(toneScript);

let synth, polySynth, filter, filterFreqSlider;

let keyNotes = {
  'a': 'C4',
  's': 'D4',
  'd': 'E4',
  'f': 'F4',
  'g': 'G4',
  'h': 'A4',
  'j': 'B4',
  'k': 'C5'
};

let polyKeyNotes = {
  'q': 'C3',
  'w': 'D3',
  'e': 'E3',
  'r': 'F3',
  't': 'G3',
  'y': 'A3',
  'u': 'B3',
  'i': 'C4'
};

function setupSynth() {
  filter = new Tone.Filter(1500, "lowpass").toDestination();
  synth = new Tone.Synth({
    oscillator: {
      type: 'sawtooth'
    },
    envelope: {
      attack: 0.1,
      decay: 0.2,
      sustain: 0.9,
      release: 0.3
    }
  }).connect(filter);

  // Polyphonic Synth
  polySynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'sawtooth'
    },
    envelope: {
      attack: 0.1,
      decay: 0.1,
      sustain: 1,
      release: 0.1
    }
  }).connect(filter);
}

function setup() {
  createCanvas(400, 250);

  filterFreqSlider = createSlider(20, 20000, 1500, 1);
  filterFreqSlider.position(20, 150); 
  filterFreqSlider.style('width', '360px'); 

  textSize(16);
  fill(0);
  text("Custom Synth: A-S-D-F-G-H-J-K (C4-C5)", 20, 30);
  text("Polyphonic Synth: Q-W-E-R-T-Y-U-I (C3-C4)", 20, 60);
  text("Use the slider to control filter frequency.", 20, 120);
}

function draw() {
  filter.frequency.value = filterFreqSlider.value();
}

function keyPressed() {
  let pitch = keyNotes[key];
  let polyPitch = polyKeyNotes[key];

  if (pitch) {
    synth.triggerAttack(pitch);
  } else if (polyPitch) {
    polySynth.triggerAttack(polyPitch);
  }
}

function keyReleased() {
  let pitch = keyNotes[key];
  let polyPitch = polyKeyNotes[key];

  if (pitch) {
    synth.triggerRelease();
  } else if (polyPitch) {
    polySynth.triggerRelease(polyPitch);
  }
}
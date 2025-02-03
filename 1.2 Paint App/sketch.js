let currentColor;
let colors = [
  'red', 'orange', 'yellow', '#72eb57', 'cyan',
  'blue', 'magenta', '#4d2002', 'white', 'black' ];


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
  currentColor = 0;
}

function drawPalette() {
  

  stroke('white')
  strokeWeight(2)

  fill('red');
  square(0,0,30);
  
  fill('orange');
  square(0,30,30);

  fill('yellow');
  square(0,60,30);

  fill('#72eb57'); //green
  square(0,90,30);

  fill('cyan');
  square(0,120,30);

  fill('blue');
  square(0,150,30);

  fill('magenta');
  square(0,180,30);

  fill('#4d2002'); //brown
  square(0,210,30);

  fill('white');
  square(0,240,30);

  fill('black');
  square(0,270,30);
}

function mousePressed() {
  if (mouseX < 30 && mouseY < 300) { // Within the palette area
    let index = floor(mouseY / 30);
    currentColor = colors[index];
  }
}

function drawing(){
  stroke(currentColor);
  strokeWeight(7);
  line(pmouseX, pmouseY, mouseX, mouseY)
}

function draw(){
  drawPalette(); 

  if(mouseIsPressed){
    if(mouseX > 31) {
      drawing();
    }
  }
}
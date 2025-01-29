function setup() {
  createCanvas(100, 100);
}

function draw() {
  background(0, 0, 255);
  fill(48,117,48);
  strokeWeight(1.5);
  stroke('white')
  circle(50,50,36)

  fill('red')
  
  beginShape();
  
  vertex(50, 32.5);   // Top point
  vertex(55, 45);     // Bottom right
  vertex(67.5, 45);   // Top right
  vertex(57.5, 52.5); // Inner right
  vertex(62.5, 65);   // Bottom right tip
  vertex(50, 57.5);   // Bottom center
  vertex(37.5, 65);   // Bottom left tip
  vertex(42.5, 52.5); // Inner left
  vertex(32.5, 45);   // Top left
  vertex(45, 45);     // Bottom left
  
  endShape(CLOSE);
  
  endShape(CLOSE);
}

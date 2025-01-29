function setup() {
  createCanvas(200, 83);
  noStroke();
}

function draw() {
  background(0);

  fill('yellow');
  arc(45, 42, 70, 70,  -(HALF_PI + QUARTER_PI), HALF_PI + QUARTER_PI);

  fill('red');
  circle(130,42,70);

  fill('red');

  square(95.1,38,39);

  fill('red');
  square(125.92,38,39);

  fill('white');
  circle(110,40,19)

  fill('white');
  circle(150,40,19)

  fill('blue');
  circle(110,40,12)

  fill('blue');
  circle(150,40,12)
}

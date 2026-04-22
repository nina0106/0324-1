let grasses = [];
let bubbles = [];
let fishes = []; // 儲存小丑魚的陣列

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.style('position', 'fixed');
  canvas.style('top', '0');
  canvas.style('left', '0');
  canvas.style('pointer-events', 'none'); 
  canvas.style('z-index', '1');

  let iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('position', 'fixed');
  iframe.style('top', '0');
  iframe.style('left', '0');
  iframe.style('width', '100%');
  iframe.style('height', '100%');
  iframe.style('border', 'none');
  iframe.style('z-index', '0');
  iframe.style('pointer-events', 'auto');

  // 初始化水草
  let colors = ['#f94144', '#f3722c', '#f8961e', '#f9844a', '#f9c74f', '#90be6d', '#43aa8b', '#4d908e', '#577590', '#277da1'];
  for (let i = 0; i < 40; i++) {
    grasses.push({
      c: random(colors),
      hRate: 0.4 * random(0.7, 1.3),
      baseW: random(12, 22),
      shakeSpeed: random(0.002, 0.006),
      noiseOffset: random(1000),
      startX: map(i, 0, 39, width * 0.02, width * 0.98)
    });
  }

  // 初始化 5 隻小丑魚
  for (let i = 0; i < 5; i++) {
    fishes.push(new Clownfish());
  }
}

function draw() {
  clear();
  background('rgba(173, 232, 244, 0.15)'); // 稍微降低透明度，讓網頁更清晰

  // --- 繪製水草 ---
  drawGrasses();

  // --- 繪製泡泡 ---
  handleBubbles();

  // --- 繪製小丑魚 ---
  for (let fish of fishes) {
    fish.update();
    fish.display();
  }
}

function drawGrasses() {
  noFill();
  for (let g of grasses) {
    let c = color(g.c);
    c.setAlpha(80);
    stroke(c);
    
    beginShape();
    let grassHeight = height * g.hRate;
    let points = 25;
    for (let i = 0; i <= points; i++) {
      let t = i / points;
      let y = lerp(height, height - grassHeight, t);
      let offsetX = map(noise(g.noiseOffset + i * 0.03, frameCount * g.shakeSpeed), 0, 1, -60, 60) * t;
      let x = g.startX + offsetX;
      
      // 動態調整粗細：底部粗，頂部細
      strokeWeight(map(t, 0, 1, g.baseW, 2));
      curveVertex(x, y);
      if (i === 0 || i === points) curveVertex(x, y);
    }
    endShape();
  }
}

function handleBubbles() {
  if (random(1) < 0.06) {
    bubbles.push({
      x: random(width),
      y: height + 20,
      size: random(15, 40), // 泡泡變大了
      speed: random(1, 2.5),
      popY: random(height * 0.1, height * 0.7),
      popping: false,
      popTimer: 0,
      noiseOff: random(1000)
    });
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    let b = bubbles[i];
    if (b.popping) {
      b.popTimer++;
      let alpha = map(b.popTimer, 0, 12, 150, 0);
      let r = b.size + b.popTimer * 4;
      stroke(255, alpha);
      strokeWeight(2);
      noFill();
      ellipse(b.x, b.y, r, r);
      if (b.popTimer > 12) bubbles.splice(i, 1);
    } else {
      b.y -= b.speed;
      b.x += sin(frameCount * 0.02 + b.noiseOff) * 0.8; // 優化漂移路徑
      
      // 繪製大泡泡外框與反光
      stroke(255, 150);
      strokeWeight(1);
      fill(255, 30);
      circle(b.x, b.y, b.size);
      
      // 高光效果
      noStroke();
      fill(255, 180);
      circle(b.x - b.size * 0.2, b.y - b.size * 0.2, b.size * 0.25);
      
      if (b.y < b.popY) b.popping = true;
    }
  }
}

// 小丑魚類別
class Clownfish {
  constructor() {
    this.init();
  }

  init() {
    this.x = random(width);
    this.y = random(height * 0.2, height * 0.8);
    this.w = random(40, 65); // 魚的身長
    this.h = this.w * 0.6;   // 魚的身高
    this.speed = random(1, 2.5);
    this.dir = random() > 0.5 ? 1 : -1;
    this.yOff = random(1000); // 用於垂直律動
  }

  update() {
    this.x += this.speed * this.dir;
    this.y += sin(frameCount * 0.03 + this.yOff) * 0.5; // 輕微上下游動

    // 撞牆迴轉
    if (this.x > width + 100 || this.x < -100) {
      this.dir *= -1;
      this.y = random(height * 0.2, height * 0.8);
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    if (this.dir === 1) scale(-1, 1); // 轉向

    noStroke();
    
    // 1. 尾鰭
    fill(255, 140, 0);
    triangle(this.w * 0.4, 0, this.w * 0.7, -this.h * 0.4, this.w * 0.7, this.h * 0.4);
    fill(0); // 尾鰭黑邊
    triangle(this.w * 0.65, -this.h * 0.2, this.w * 0.72, -this.h * 0.4, this.w * 0.72, 0);

    // 2. 身體 (橢圓)
    fill(255, 140, 0); // 經典橘色
    ellipse(0, 0, this.w, this.h);

    // 3. 白色條紋
    fill(255);
    rectMode(CENTER);
    rect(-this.w * 0.1, 0, this.w * 0.2, this.h * 0.9, 5);
    rect(this.w * 0.25, 0, this.w * 0.15, this.h * 0.7, 3);

    // 4. 眼睛
    fill(255);
    circle(-this.w * 0.3, -this.h * 0.1, this.h * 0.25);
    fill(0);
    circle(-this.w * 0.32, -this.h * 0.1, this.h * 0.12);

    // 5. 胸鰭
    fill(255, 140, 0, 200);
    arc(0, this.h * 0.1, this.w * 0.3, this.h * 0.4, 0, PI);

    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
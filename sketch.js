let buildingModel;
let cam;

// タッチ誤判定（スワイプとタップの混同）を防ぐための変数
let touchStartX = 0;
let touchStartY = 0;

const spots = [
  { id: 1, shapeType: "sphere", name: "防災ブース・転倒防止ブース", desc: "●1F 剣道場　【防災段ボール迷路】\n　迷路内の防災クイズを解いて楽しく遊びながら学ぼう！\n●2F 柔道場　【転び方体験教室】\n　柔道指導員(卒業生)による上手な転び方と転ばない為の体験会", pos: [-20, -10, -6], color: [255, 71, 87] },
  { id: 2, shapeType: "sphere", name: "体育館ステージ", desc: "吹奏楽部、ダンス部、Jコーラス部のステージ\nサンバ、コスプレ、卒業生、教員、高校生有志\n魅力的なステージが盛りだくさん", pos: [5, -15, -4], color: [46, 213, 115] },
  { id: 3, shapeType: "sphere", name: "医療体験・縁日・英語体験ブース", desc: "●講義室1　【Enjoy縁日！】【英語体験ブース】\n　こどもが楽しめる射的や輪投げなど遊びがたくさん。太子高校生と一緒に楽しく英語を学ぼう！\n●講義室2,3 【医療体験ブース】\n　社会医療法人三栄会ツカザキ病院さんによる様々な体験を実施予定！", pos: [-42, -12, -8], color: [30, 144, 255] },
  { id: 4, shapeType: "sphere", name: "茶道部・調理手芸部・総合実践", desc: "お茶席、お菓子販売、地元企業コラボ商品販売", pos: [-35, 10, -6], color: [255, 159, 26] },
  { id: 5, shapeType: "cone", name: "一般受付・パンフ配布", desc: "ご来場時にお越しください。パンフレットのお渡しします。", pos: [-55, -3, -5], color: [155, 89, 182] },
  { id: 6, shapeType: "cone", name: "キッチンカー広場", desc: "トルティーヤ、カレー、ケバブ、アサイー、チヂミ、バナナケーキなど、地域で活躍中のお店が集結！", pos: [-7, 3, -5], color: [230, 126, 34] },
  { id: 7, shapeType: "cone", name: "駐輪場", desc: "自転車・バイクでお越しの方はこちらをご利用ください。", pos: [-60, 20, -5], color: [52, 73, 94] },

  // --- 【細い針ピン（トイレ 3個）】 ---
  { id: 8, shapeType: "pin", name: "トイレ①（校舎1F）", desc: "校舎1階 本館東側のトイレです。", pos: [-10, 15, -13], color: [0, 168, 255] },
  { id: 9, shapeType: "pin", name: "トイレ②（講義棟）", desc: "講義棟内のトイレです。", pos: [-35, -10, -13], color: [0, 168, 255] },
  { id: 10, shapeType: "pin", name: "トイレ③（体育館付近）", desc: "武道場裏のトイレです。", pos: [-15, -20, -13], color: [0, 168, 255] }
];

function preload() {
  buildingModel = loadModel('school.obj', true);
}

function setup() {
  // 画面全体にフィット
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  
  // iOS Safari でのジェスチャー衝突を防止
  canvas.elt.style.touchAction = 'none';

  angleMode(DEGREES);
  cam = createCamera();
  resetView();
}

function draw() {
  background(245);
  orbitControl();

  ambientLight(140);
  directionalLight(255, 255, 255, 0.8, 1, -0.5);

  push();
  translate(0, -40, 0);

  rotateZ(80);
  scale(-1, 1, 1);
  rotateY(85);
  rotateX(10);

  fill(230, 230, 230);
  noStroke();

  model(buildingModel);

  drawSpots();
  pop();
}

function drawSpots() {
  for (let spot of spots) {
    push();
    translate(spot.pos[0], spot.pos[1], spot.pos[2]);

    if (spot.shapeType !== "pin") {
      let bounce = -abs(sin(frameCount * 3 + spot.id * 50)) * 2;
      translate(0, 0, bounce);
    }

    let screenPos = getScreenPosition(0, 0, 0);
    spot.sx = screenPos.x;
    spot.sy = screenPos.y;

    fill(spot.color[0], spot.color[1], spot.color[2]);
    noStroke();

    if (spot.shapeType === "cone") {
      push();
      rotateX(-90);
      translate(0, 3, 0);
      cone(2.5, 6);
      pop();
    } else if (spot.shapeType === "pin") {
      push();
      rotateX(90);
      
      push();
      fill(200); 
      translate(0, 3, 0); 
      cylinder(0.4, 6); 
      pop();

      push();
      translate(0, 6, 0); 
      sphere(1.5);
      pop();

      pop();
    } else {
      sphere(2.5);
    }
    pop();
  }
}

function getScreenPosition(x, y, z) {
  let gl = _renderer;
  let mv = gl.uMVMatrix.mat4;
  let p = gl.uPMatrix.mat4;

  let wx = mv[0]*x + mv[4]*y + mv[8]*z + mv[12];
  let wy = mv[1]*x + mv[5]*y + mv[9]*z + mv[13];
  let wz = mv[2]*x + mv[6]*y + mv[10]*z + mv[14];
  let ww = mv[3]*x + mv[7]*y + mv[11]*z + mv[15];

  if (ww === 0) return { x: -999, y: -999 };

  let px = p[0]*wx + p[4]*wy + p[8]*wz + p[12]*ww;
  let py = p[1]*wx + p[5]*wy + p[9]*wz + p[13]*ww;
  let pw = p[3]*wx + p[7]*wy + p[11]*wz + p[15]*ww;

  if (pw === 0) return { x: -999, y: -999 };

  let sx = (px / pw + 1) * width / 2;
  let sy = (-py / pw + 1) * height / 2;

  return { x: sx, y: sy };
}

// ピンのタップ判定
function checkSpotClick(clickX, clickY) {
  // 右上ボタンの範囲はタップを無効化
  if (clickY < 75 && clickX > width - 170) return;

  let bestSpot = null;
  // スマホの指操作に合わせて少し広め(65px)に判定
  let minDistance = 65;

  for (let spot of spots) {
    if (spot.sx === undefined || spot.sy === undefined) continue;
    let d = dist(clickX, clickY, spot.sx, spot.sy);
    if (d < minDistance) {
      minDistance = d;
      bestSpot = spot;
    }
  }

  if (bestSpot) {
    showCard(bestSpot.name, bestSpot.desc);
  }
}

// --- 【スマホ・PC完全対応のタップ判定ロジック】 ---

// 指を置いた位置を記録
function touchStarted() {
  if (touches.length > 0) {
    touchStartX = touches[0].x;
    touchStartY = touches[0].y;
  }
}

// 指を離したときに判定（スワイプ回転中はタップと見なさない）
function touchEnded() {
  let endX = (touches.length > 0) ? touches[0].x : mouseX;
  let endY = (touches.length > 0) ? touches[0].y : mouseY;
  
  // 移動量が15px未満（＝純粋なタップ）の場合のみ実行
  let moveDist = dist(touchStartX, touchStartY, endX, endY);
  if (moveDist < 15) {
    checkSpotClick(endX, endY);
  }
}

// PCマウス用クリック
function mouseClicked() {
  // タッチデバイス以外（マウス操作）の場合のみ発火
  if (!('ontouchstart' in window)) {
    checkSpotClick(mouseX, mouseY);
  }
}

function showCard(title, desc) {
  document.getElementById('card-title').innerText = title;
  document.getElementById('card-desc').innerText = desc;
  document.getElementById('info-card').classList.add('active');
}

function closeCard() {
  document.getElementById('info-card').classList.remove('active');
}

function resetView() {
  cam.camera(0, -78, 156, 0, 0, 0);
  closeCard();
}

// 端末の向きが変わったりリサイズされた時に再フィット
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
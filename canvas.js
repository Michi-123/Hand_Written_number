CANVAS_WIDTH=280;
CANVAS_HEIGHT=280;

var D=document;
var drawing = false;
// 前回の座標を記録する（初期値：０）
var before_x = 0;
var before_y = 0;

var canvas
var ctx
var n_canvas = 4

canvas = document.getElementById('canvas')
ctx = canvas.getContext('2d')
canvas.addEventListener('mousemove', draw_canvas)

// マウスをクリックしてる時
canvas.addEventListener('mousedown', function(e) {
    drawing = true;
    var rect = e.target.getBoundingClientRect();
    before_x = e.clientX - rect.left;
    before_y = e.clientY - rect.top;
});
// マウスをクリックしてない時
canvas.addEventListener('mouseup', function() {
  drawing = false;
});


// 描画の処理
function draw_canvas(e) {
  // drawingがtrueじゃなかったら返す
  if (!drawing){
    return
  };
  var rect = e.target.getBoundingClientRect();
  var x = e.clientX - rect.left;
  var y = e.clientY - rect.top;
  var color = document.getElementById('color').value;

  // 描画
  ctx.lineCap = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(before_x, before_y);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.closePath();
  // 描画最後の座標を前回の座標に代入する
  before_x = x;
  before_y = y;
}


function getCanvasData(e){

  var myImageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  var data = myImageData.data;
  // var text0=text1=text2="";
  var row = 0;

  // 画像データ配列 Block Channel Row
  var block = [];

  // Channel alpha
  var channel = [];
  var steps = 10;
  for(var i = 0 ; i < CANVAS_HEIGHT ; i += steps){

    // Rows
    var rowData = [];
    for (var j = 0 ; j < CANVAS_WIDTH - 1 ; j += steps){

      opacity = data[(j * 4 + 3) + (i * CANVAS_WIDTH * 4)]; // 不透明度
      picxel = opacity > 256 / 2 ? 1 : 0;
      rowData.push(picxel);
    }
    channel.push(rowData);
  }

  block.push(channel);

  // 行の間引き
  if(false){
    var smallData = "";
    var normalArray = normalData.split("\n");
    for (var i = 0 ; i < normalArray.length ; i++){
      smallData += normalArray[i] + "\n";
    }
  }

  return block;
}

function clearCanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //D.getElementById('predicted').innerHTML = " "
    //D.getElementById('hypothesis').innerHTML = " "
}

function addCanvasData(){

  var num = $('input[name=num]:checked').val();
  var element = $("#indicator .n" + num)
  var indicator = element.text()
  
  indicator += String.fromCharCode(9609) // ? 9608  ? 9616
  element.html(indicator)

 //  var radio = document.getElementsByName('num')
 //  // 取得したラジオボタンオブジェクトから選択されたものを探し出す
  // var idx;
  // for(var i = 0 ; i < radio.length ; i++){
  //  if (radio[i].checked) {
  //    //選択されたラジオボタンのvalue値を取得する
  //    idx = radio[i].value;
  //    break
  //  }
  // }
  var idx = $('input[name=num]:checked').val()

  // One hot vector
  var t = []
  for (var i = 0 ; i < target.length ; i++){
    t[i] = 0
  }
  t[idx] = 1

  X_batch.push(getCanvasData())
  T_batch.push(t)

  clearCanvas()
}


function img2canvas(image){
  //ctx.drawImage(image, dx, dy)
  //image:画像オブジェクト　dx:貼り付け位置のx座標　dy:貼り付け位置のy座標
  //座標は基本的に左上が始点(0,0)です。
  //ctx.drawImage(image, dx, dy, dw, dh)
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  //dw:貼り付け時の画像の横幅　dh:貼り付け時の画像の縦幅
  //この2つの指定がない場合は、元画像のそのままの縦横（1倍）で貼り付けられます。
  //ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
  //sx,sy,sw,shは、貼り付ける前の元画像をトリミングするためのパラメータです
  //sx:元画像のトリミング始点のx座標　sy:元画像のトリミング始点のy座標
  //sw:元画像のsxから横にswの位置までをトリミング
  //sh:元画像のsyから縦にshの位置までをトリミング
}

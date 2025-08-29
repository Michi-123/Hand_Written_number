var X_batch = []
var T_batch = []

var t_number = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
// var t_alphabet = ['A','B','C']
var t_alphabet = ['A','B','C','D','E','F','G','H','I','J']
var t_kana = ['い','ろ','は','に','ほ','へ','と']
// var t_kana = ['い','ろ','は','に','ほ','へ','と','ち','り','ぬ','る','を']
var t_sign = ['◯','×','△','◎','☆']
var target = t_number // Initial data

$(function(){
  $('#predict_type').change(  function(){clearCanvas();changeLabel()})
  $('input[name=tab]').change(function(){changeTab()})
  $('#learning_rate_range').change(function(event){setLearningRate(this)})

  $('#predict').click(        function(){predict()})
  $('#clear_canvas').click(   function(){clearCanvas();clearGraph()})
  $('#clear_batch').click(    function(){clearBatch()})
  $('#add_btn').click(        function(){addCanvasData()})
  $('#init_weights').click(   function(){initWeights()})
  $('#train_btn').click(      function(){clearLoss(); train()})

  $('#radio').find('input:first').attr('checked', true)
})

$(D).keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);

  // A
  if(keycode == '65' || keycode == '97'){
    addCanvasData()  
  }
  // T
  if (keycode == '116' || keycode == '84'){
    train()
  }
  // C
  if (keycode == '99' || keycode == '67'){
    clearCanvas();clearGraph()
  }
  // P
  if (keycode == '112' || keycode == '80'){
    predict()
  }

  if (keycode == '27'){
    log("ESC")
  }

})


function changeLabel(){

  $('.graph').html("")
  $('.indicator').html("&nbsp;")

  var v = $('#predict_type').val()

  switch (v) {
    case "0":
      target = t_number
      break
    case "1":
      target = t_alphabet
      break
    case "2":
      target = t_kana
      break
    case "3":
      target = t_sign
      break
    default:
      target = []
  }

  // if ( v == 0 ){
  //   target = t_number
  // } else if ( v == 1 ) {
  //   target = t_alphabet
  // } else if ( v == 2 ) {
  //   target = t_kana
  // } else if ( v == 3 ) {
  //   target = t_kigou
  // } else {
  //   target = []    
  // }

  createTable()
}

function changeTab(){
  if ( $('#tab_batch_size').prop('checked') == true){
    $('#indicator').css('display', 'block')
    $('#radio').css('display', 'block')
    $('#graph').css('display', 'none')

  } else { 

    $('#indicator').css('display', 'none')
    $('#radio').css('display', 'none')
    $('#graph').css('display', 'block')
  }
}


function setLearningRate(element){

  var v = $(element).val()
  log(v)
  var rearningRate = 0.1
  switch (parseInt(v)){
    case 0:
      rearningRate = 0.9
      break
    case 1:
      rearningRate = 0.5
      break
    case 2:
      rearningRate = 0.2
      break
    case 3:
      rearningRate = 0.1
      break
    case 4:
      rearningRate = 0.05
      break      
    case 5:
      rearningRate = 0.01
      break
    default:
      log("default: " + v)
      break

  }
  $('#learning_rate').val(rearningRate)
}


function drawSoftmaxGraph(h){

  var s = softmax(h)

  clearGraph()

  for(var i =0 ; i < s.length ; i++){
    var e = $('#graph .n' + i)
    // var g = e.html()
    var v = parseInt(s[i] * 300)
    //log(v)
    //for(var j = 0 ; j < v ; j++){
    //  g += "|"
    //}
    //e.html("<b><font color=#00cc00>" + g + "</font></b>")
    var html = ""
    html += "<div class='bar_graph' style='width:@px'>"
    html += " &nbsp;"
    html += "</div>"

    html = html.replace("@", v)
    e.html(html)
  }
}


function check_nan(x){

  for (var c = 0; c < x.length; c++) {
    for(var i = 0; i < x[0].length; i++) {
      for(var j = 0; j < x[0][0].length; j++) {
        //
        if ( isNaN( x[c][i][j] ) ) {
          console.log(c, i, j);
        }
      }
    }
  }
}


// 数値用の比較関数を定義
function compareNumbers(a, b) {
  return a - b;
}





function clearBatch(){

  if (!confirm("バッチデータをクリアしますか？")){
    return
  }

  X_batch = []
  T_batch = []
  $('.indicator').html("&nbsp;")
}


// function getImg(){
// 	var img = new Image();    //新規画像オブジェクト
// 	// コールバックを設定
// 	img.onload = function(){
// 		img2canvas(img)
// 	}
// 	img.src = "img/A.png";   //読み込みたい画像のパス
// }


function createTable(){

  var table
  var row

  table = $('#label')
  table.empty()
  row = ""
  for (var i = 0 ; i < target.length ; i ++){
    row = "<tr><td class='cell cellnum@'>@"
    row = row.replace('@', i)
    row = row.replace('@', target[i])
    table.append(row);    
  }

  table = $('#graph')
  table.empty()
  row = ""
  for (var i = 0 ; i < target.length ; i ++){
    row = "<tr><td class='graph n@'>"
    row = row.replace('@', i)
    table.append(row)    
  }

  table = $('#radio')
  table.empty()
  row = ""
  for (var i = 0 ; i < target.length ; i ++){
    row = "<tr><td><input type='radio' name='num' value='@'>"
    row = row.replace('@', i)
    table.append(row)
  }
  // Let first row checked. 
  table.find('input:first').attr('checked', true)

  table = $('#indicator')
  table.empty()
  row = ""
  for (var i = 0 ; i < target.length ; i ++){
    row = "<tr><td class='indicator n@'>&nbsp;"
    row = row.replace('@', i)
    table.append(row)
  }
}


function clearGraph(){
  $('.graph').html("")
}


function initWeights(){
  if(!confirm("Are you sure initialize Weights?")){
    return
  }

//  initConvWeights(cW1)
//  initConvWeights(cW2)
//  initConvBias(cb1)
//  initConvBias(cb2)
//  initW(W1)
//  initW(b1)
  initW(W2)
  initBias(b2)
}

function log(n){ console.log(n) }

function clearLoss(){
    D.getElementById('loss').innerHTML = "-";
}

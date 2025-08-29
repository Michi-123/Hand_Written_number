var losses
var NUM_FILTER = cW1.length
var drop_rate = 0.5;

// Variables for backpropergation.
var h1 = []
var h2 = []
var h_fn = []
var h_dropout = []

function predict(x, train) {
  // x shape is (N, 1, 28, 28)
  if (!x) {
    var x = getCanvasData();
  }

  // Repeat for number of filters.
  var num_filter1 = cW1.length;
  var num_filter2 = cW2.length;

  var conv1 = [];
  var conv2 = [];
  var h = [];

  // Conv1
  for (var n = 0 ; n < num_filter1 ; n++) {

    // Conv1
    conv1[n] = convolution(cW1[n], x, cb1[n], false);

    // Relu
    conv1[n] = relu(conv1[n]);
  }

  // Conv2
  for (var n = 0 ; n < num_filter2 ; n++) {

    // Conv2
    conv2[n] = convolution(cW2[n], conv1, cb2[n], false);

    // Relu
    conv2[n] = relu(conv2[n]);

    // Pool1 width, height, stride, padding
    conv2[n] = pool(conv2[n], 2, 2, 2, 0);

    // •¡”‚Ì2ŽŸŒ³o—Í‚ð1ŽŸŒ³‚É•ÏŠ·
    h = im2col_a(conv2[n], h, n);
  }

  h1.push(h)

	// Affine1
  h = affine(h, W1, b1);

  // Relu
  h = relu(h);

  // Dropout
  h = dropout1d(h , drop_rate);

  h2.push(h)

  // Affine2
  h = affine(h, W2, b2)

  var y = indexOfMax(h);
  var maxVal = Math.max.apply(null, h);

 	predicted = target[y]

  if (!train){
    $('#predicted').text( predicted )
    document.getElementById("hypothesis").innerHTML = maxVal;
    //document.getElementById("hypothesis_all").innerHTML = h;
    drawSoftmaxGraph(h)
  }

  return h
}


function softmax(arr) {
    return arr.map(function(value,index) {
      return Math.exp(value) / arr.map( function(y /*value*/){ return Math.exp(y) } ).reduce( function(a,b){ return a+b })
    })
}

function softmax_uncompressed(h){
  var sum = 0
  for (var i = 0 ; i < h.length ; i++){
    sum += Math.exp(h[i])
  }

  sum += 1e-6

  var out = []
  for (var i = 0 ; i < h.length ; i++){
    var k = Math.exp(h[i])
    out.push(k / sum) 
  }
  return out
}


function convolution(filter, x, bias, padding){

  var convout = [];
  var conv_ch = [];

  if( padding ) {
    x = add_pad(x);
  }

  var shape = getShape(x[0]);
  var H = shape[0], W = shape[1];
  var offset = 0;

  // Just the case of that kernel size is 3 and stride is 1!
  if( !padding ){
    offset = 2;
  }

  // Repeat by channels, and culcrate convolutional image.
  for (var c = 0; c < x.length; c++){
    conv_ch[c] = [];

    for (var i = 0; i < H - offset ; i++){
      conv_ch[c][i] = [];
      for (var j = 0; j < W - offset ; j++){

        conv_ch[c][i][j] = calcconv(filter[c], x[c], i, j, bias);
      }
    }
  }

  // Fill convout array with 0. (Initialize)
  for (var i = 0; i < conv_ch[0].length; i++){
    convout[i] = [];
    for (var j = 0; j < conv_ch[0][i].length; j++){
      convout[i][j] = 0;
    }
  }

  // Sum of each channel.
  // for (var c = 0; c < conv_ch.length; c++){
  for (var c = 0; c < conv_ch.length; c++){
    for (var i = 0; i < conv_ch[c].length; i++){
      for (var j = 0; j < conv_ch[c][i].length; j++){
        convout[i][j] += conv_ch[c][i][j];
      }
    }
  }

  // Add bias.
  for (var i = 0; i < convout.length; i++){
    for (var j = 0; j < convout[i].length; j++){
      convout[i][j] += bias;
    }
  }

  return convout;
}

function calcconv(filter, x, i, j, bias){
  var m = 0;
  var n = 0;
  var sum = 0;
  var ksize = 3; // filter.length;

  for (var m = 0; m < ksize; m++){
    for (var n = 0; n < ksize; n++){

      var t = x[i + m ][j + n ] * filter[m][n];
      if (isNaN(t)){
          aaa = 1;
      }

      sum += x[i + m ][j + n ] * filter[m][n];
    }
  }

  return sum;
}

function pool(x, pool_h, pool_w, stride, pad){

  var shape = getShape(x);
  var H = shape[0];
  var W = shape[1];

  var out_h = parseInt(H / stride);
  var out_w = parseInt(W / stride);
  var out = [];
  var out_ = [];

  for (var i = 0 ; i < out_h ; i++){
    out_[i] = [];
    var row = [];
    for (var j = 0 ; j < out_w ; j++){

      // Get values in cell(2x2).
      var pools = [];
      for (var m = i * 2; m < (i * 2 + 2); m++){
        for (var n = j * 2 ; n < (j * 2 + 2); n++){
            // console.log(m,n);
            pools.push(x[m][n]);
        }
      }

      var maxpool = Math.max.apply(null, pools);
      out_[i].push(maxpool);
    }
  }

  return out_;
}


function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}


function relu(x){

  if(x.length){
    for(var i = 0 ; i < x.length ; i++){

      // Do reccurent loop.
      x[i] = relu(x[i]);

    }
  } else {
    if(x < 0) x = 0;
  }
  return x;
}


function add_pad(x){

  var out = []
  var out_ch = []

  // Image size;
  var img_size = x[0].length;

  // Create top or bottom pad.
  var top_bottom_pad = [];
  for (var i = 0 ; i < img_size + 2 ; i++){
    top_bottom_pad.push(0);
  }

  //
  for (var c = 0 ; c < img_size; c++){
    out_ch[0] = top_bottom_pad;
    for (var i = 0; i < img_size; i++) {
      out_ch[i + 1] = [0];
      for (var j = 0 ; j < img_size ; j++) {
        out_ch[i + 1][j + 1] = x[i][j];
      }
      out_ch[i + 1][j + 1] = 0;
    }

    out_ch.push(top_bottom_pad);
    out.push[out_ch];
  }

  return out;
}


function affine(x, w, b){

  var out = [];
  for (var i = 0 ; i < w.length ; i++){
    var u = 0;
    for (var j = 0 ; j < w[0].length; j++){
      var s = x[j] * w[i][j];
      u += x[j] * w[i][j];
    }
    out.push(u);
  }

  if (!b) return out
 
  // bias 
  for (var i = 0 ; i < out.length; i++){
    out[i] += b[i];
  }

  return out;
}


// affine_bw



function dropout2d(x, drop_rate) {

  // if (Math.random() > drop_rate) {
  //   return x;
  // }

  var out = [];
  for (var i = 0 ; i < x.length; i++){
    out[i] = [];
    for (var j = 0 ; j < x[0].length; j++){

      if (Math.random() > drop_rate) {
        out[i][j] = x[i][j] * (1/(1 - drop_rate)) ;
      } else {
        out[i][j] = 0;
      }
    }
  }
  return out;
}


function dropout1d(x, drop_rate) {

  // if (Math.random() > drop_rate) {
  //   return x;
  // }

  // For test
  var out = [];
  for (var i = 0 ; i < x.length; i++){
      out[i] = x[i] * (1 - drop_rate)
  }
  return out;
}


function im2col_a(x, h, filter_num){

  var poolout_size = x.length;

  for(m = 0 ; m < poolout_size; ++m){
    for(n = 0; n < poolout_size; ++n){
      h[filter_num * poolout_size * poolout_size + poolout_size * m + n ] = x[m][n];
    }
  }
  return h;
}

//function softmax(x){
  // def softmax(x):
  //     if x.ndim == 2:
  //         x = x.T
  //         x = x - np.max(x, axis=0)
  //         y = np.exp(x) / np.sum(np.exp(x), axis=0)
  //         return y.T
//}

function _convolution_old(x, weight){
    // cW1.shape
    var FN=30, C=1, ksize=5; // FH=5, FW=5, ksize=5;

    // x.shape
    var N=1, C=1, H=28, W=28;
    var pad=0, stride=1;
    var out_h = 1 + parseInt((H + 2*pad - ksize) / stride);
    var out_w = 1 + parseInt((W + 2*pad - ksize) / stride);
    var col = im2col(x, C, H, W, ksize, stride, pad);
    var col_W = reshape1(weight, FN, -1);

    col = T(col);
    col_W = T(col_W);
    var out = dot(col, col_W, null);// ˆêŽž“I‚É1ch ‚¾‚¯
    out = reshape2(out, N, out_h, out_w, -1);
    out = transpose(out, 0, 3, 1, 2);

    self.x = x;
    self.col = col;
    self.col_W = col_W;

    return out;
}


function _pool_old(x, pool_h, pool_w, stride, pad){

  var out = "";
  var shape = getShape(x[0]);
  var N = shape[0];
  var C = shape[1];
  var H = shape[2];
  var W = shape[3];

  var out_h = parseInt(1 + (H - pool_h) / stride);
  var out_w = parseInt(1 + (W - pool_w) / stride);

  var col = im2col(x, C, pool_h, pool_w, N, stride, pad);
  col = reshape(col, [pool_h * pool_w, -1]);
  col = T(col);

  return out;
}


/*
 * float* data_im
 * int channels,
 * int height,
 * int width
 * int ksize,
 * int stride,
 * int pad,
 * float* data_col
 */
 function im2col(data_im, channels, height, width, ksize, stride, pad)
 {
     // Add
     data_im = im_3dTo1d(data_im);

     var c,h,w;
     var height_col = (height + 2*pad - ksize) / stride + 1;
     var width_col = (width + 2*pad - ksize) / stride + 1;

     var data_col = [];
     var channels_col = channels * ksize * ksize;
     for (c = 0; c < channels_col; ++c) {

         // Add
         data_col[c] = [];

         var w_offset = c % ksize;
         // var h_offset = (c / ksize) % ksize;
         // var c_im = (c / ksize) / ksize;

         // Add
         var h_offset = parseInt(c / ksize) % ksize;
         var c_im = parseInt(parseInt(c / ksize) / ksize);

         for (h = 0; h < height_col; ++h) {
             for (w = 0; w < width_col; ++w) {
                 var im_row = h_offset + h * stride;
                 var im_col = w_offset + w * stride;
                 var col_index = (0 * height_col + h) * width_col + w;
                 // data_col[col_index] = im2col_get_pixel(data_im,
                 //         height, width, channels, im_row, im_col, c_im, pad);

                 // Add
                 data_col[c][col_index] = im2col_get_pixel(data_im,
                         height, width, channels, im_row, im_col, c_im, pad);
             }
         }
     }
     return data_col;
 }

 /*
  * float *im,
  * int height,
  * int width,
  * int channels,
  * int row,
  * int col,
  * int channel,
  * int pad
  */
function im2col_get_pixel(im, height, width, channels, row, col, channel, pad){
   row -= pad;
   col -= pad;

   if (row < 0 || col < 0 ||
       row >= height || col >= width) return 0;
   var out = im[col + width*(row + height*channel)];
   return out;
}


// Add
function im_3dTo1d(data_im, out){
    if(out==null){
      var out = [];
    }
    // Channel
    var size = data_im.length;
    if(size){
      for (var n = 0; n < data_im.length ; n++){
        im_3dTo1d(data_im[n], out);
      }
    }else{
      out.push(data_im);
    }
    return out;
}

function getShape(x, shape){

  if (shape == null){
    shape=[];
  }

  var size = x.length;
  if( size ){
    shape.push(size);
    getShape(x[0], shape);
  } else {
    return shape;
  }
  return shape;
}


function dot(x,w,bias){
  var out=[];
  for(var row=0; row < x.length; row++){
    out[row]=[];
    var e = x[row];
    for(var i=0; i < w[0].length; i++){
      var u = 0;
      for(var j=0; j < e.length; j++){
        u += e[j] * w[j][i];
      }
      if (bias!=null){
        u += bias[i];
      }
      out[row].push(u);
    }
  }
  return out;
}


/*
 * Con't use -1 parameter
 */
function reshape1(W, d1, d2, d3, d4){
  //const list = W.reduce((pre,current) => {pre.push(...current);return pre},[]);

  // n-d to 1d
  var list = [];
  for (var i = 0 ; i < W.length ; i++){
    for(var j = 0; j < W[0].length ; j++){
      for(var k = 0 ; k < W[0][0].length ; k++){
        for(var l = 0 ; l < W[0][0][0].length ; l++){
          list.push(W[i][j][k][l]);
        }
      }
    }
  }

  var len = list.length;
  var out = [];
  for (var i = 0; i < d1; i++){
    if (d2){
      if (d2 == -1){
        d2 = len / d1;
      }
      out[i] = [];
      for (var j = 0 ; j < d2 ; j ++){
        out[i].push(list[i*j+j]);
      }
    }
  }
  return out;
}

/*
 * Con't use -1 parameter
 */
function reshape2(W, N, d1, d2, d3){

  // const list = W.reduce((pre,current) => {pre.push(...current);return pre},[]);

  // n-d to 1d
  var list = [];
  for (var i = 0 ; i < W.length ; i++){
    for(var j = 0; j < W[0].length ; j++){
      list.push(W[i][j]);
    }
  }

  var len = list.length;
  var out = [];
  for (var i = 0; i < d1; i++){
    // d3‚Í -1
    d3 = len / (d1 * d2);
    out[i] = [];
    for (var j = 0 ; j < d2 ; j ++){
      out[i][j] = [];
      for (var k = 0 ; k < d3 ; k++){
        out[i][j].push(list[i*j+j]);
      }
    }
  }
  // N=1ch‚ÌŒÅ’è‚É‚µ‚Ä‚ ‚é‚Ì‚ÅA
  out = [out];
  return out;
}


function reshape(x, shape_array, out, n){

  if (out == null){
    out = [];
    // array (loop) number .
    n = 0;
    x = im_3dTo1d(x);
  }

  for (var i = 0; i < shape_array[n]; i++){
    if(shape_array.length > n+1){
        reshape(x, shape_array, out, n+1);
    } else {
      out.push( x[i*2 + n] );
    }
  }
  return out;

}


function copyArray(x, out){

  var first = false;
  if (out==null){
    out = [];
    first = true;
  }

  var size = x.length;
  if(size){
    // Ä‹Aˆ——p ‰Šú‰»
    var out_ = [];
    for(var i = 0 ; i < size ; i++){
      out_ = copyArray(x[i], out_);
    }
    out.push(out_);

  } else {
    out.push(x);
  }

  if (first){
    return out[0];
  } else {
    return out;
  }
}


/*
 * Transpose just 2 dimendion
 */
function T(x){
  // const transpose = a => a[0].map((_, c) => a.map(r => r[c]));
  // return transpose(array);;

  t=[];
  for (var i = 0 ; i < x[0].length ; i++){
    t[i] = [];
    for (var j = 0 ; j < x.length ; j++){
      t[i][j] = x[j][i]
    }
  }
  return t;
}

/*
 * Transpose tensole
 */
function T_tensole(x){
  // const transpose = a => a[0].map((_, c) => a.map(r => r[c]));
  // return transpose(array);;

  var batch_size = x.length
  var t = [];
  for (var n = 0 ; n < batch_size ; n++){
    t[n] = []
    for (var i = 0 ; i < x[n][0].length ; i++){
      t[n][i] = [];
      for (var j = 0 ; j < x.length ; j++){
        t[n][i][j] = x[n][j][i]
      }
    }
  }

  return t;
}


function transpose(x, d1, d2, d3, d4){

  // d1=0 d2=3 d3=1 d4=2
  // x.shape = 1, 24, 24, 30
  // to 1, 30, 24, 24

  // Initialize
  var out = [];
  for (var i = 0 ; i < 30; i++){
    out[i] = [];
    for (var j = 0 ; j < 24 ; j++){
      out[i][j] = [];
      for (var k = 0 ; k < 24 ; k++){
        out[i][j][k] = 0;
      }
    }
  }

  for (var i=0 ; i < 24 ; i++){
    for (var j=0; j < 24; j++){
      for (var k=0; k < 30; k++){
        // 0, 3, 1, 2 ‚Ì‡”Ô
        out[k][i][j] = 9;//x[0][i][j][k];
      }
    }
  }
  out = [out];
  return out;
}





function np_zeros(arrayData){
  var zerosArray = [];
  for(i=0; i < arrayData[0]; i++){
    var data1 = [];
    for(j=0; j < arrayData[1]; j++){
      var data2 = [];
      for(k=0;k < arrayData[2]; k++){
        var data3 = [];
        for(l=0; l < arrayData[3]; l++){
          var data4 = [];
          for(m=0; m < arrayData[4]; m++){
            var data5 = [];
            for(n=0; n < arrayData[5]; n++){
              data5.push(0);
            }
            data4.push(data5);
          }
          data3.push(data4);
        }
        data2.push(data4);
      }
      data1.push(data3);
    }
    zerosArray.push(data2);
  }
  return zerosArray;
}

function train(){

  var loss = 10
  var epoch = D.querySelector('#epoch').value
  var N = X_batch.length
  var Y

  losses = []

  // while(loss > 1.2) {
  for(var e = 1 ; e <= epoch ; e++){

    // Initialize grobal
    Y = []
    h1 = []
    h2 = []
    h_fn = []
    h_dropout = []

    for(var i = 0; i < N; i++){
      var h = predict(X_batch[i], true)
      y = softmax(h)
      Y.push(y)
    }

    loss = backward(Y, T_batch)
    losses.push(loss)
    console.log("e: " + e + "  loss: " + loss)
  }
  D.getElementById('loss').innerHTML = loss
}

//
function backward(y, t) {

  var N = y.length
  var dy = []

  for (var n = 0 ; n < N ; n++) {
    dy[n] = []
    for ( var i = 0 ; i < y[0].length ; i++ ) {
      dy[n][i] = (y[n][i] - t[n][i]) / N
    }
  }

  var db2 = bias_bw(dy)
  var dW2 = affine_bw(T(dy), h2)

  update(dW2, db2)

  var loss = 0
  for (var i = 0 ; i < dy.length ; i++) {
    for(var j = 0 ; j < dy[0].length ; j++) {
      loss += Math.abs(dy[i][j])
    }
  }
  return loss / N
}

function update(dW2, db2){

  var learning_rate = $('#learning_rate').val()

  for (var i = 0 ; i < dW2.length ; i++ ){
    for (var j = 0 ; j < dW2[0].length ; j++){
      W2[i][j] -= dW2[i][j] * learning_rate
    }
  }

  for (var j = 0 ; j < db2.length ; j++){
    b2[j] -= db2[j] * learning_rate
  }

}


function affine_bw(a, b){

  // a[M,L] b[L,N]
  var out = []
  var M = a.length
  var L = b.length
  var N = b[0].length

  for (var i = 0 ; i < M ; i++){
    out[i] = []
    for (var j = 0 ; j < N ; j++){
      out[i][j] = 0
      for (var k = 0 ; k < L ; k++){
        out[i][j] += a[i][k] * b[k][j]
      }
    }
  }
  return out;
}


function relu_bw(dh, h){
  var dout = []
  var N = dh.length

  for(var i = 0 ; i < N ; i++){
    dout[i] = []
    for(var j = 0 ; j < dh[i].length ; j++){
      var v = dh[i][j] * h[i][j]
      dout[i].push(v)
    }
  }
  return dout
}


function bias_bw(dh){

  var dout = []
  var N = dh.length

  for (var i = 0 ; i < dh[0].length ; i++) {
    dout[i] = 0.0 
    for ( var n = 0 ; n < N ; n++ ) {
      dout[i] += dh[n][i]
    }
  }

  return dout
}


// function np_pad(arrayData, pad_width, mode){
//   // pad_width ‚ðƒ‹[ƒv‚³‚¹‚ÄPadding
//   var padArrayData = arrayData;
//   return padArrayData;
// }


function random_normal(){
  r1 = Math.random() - 0.5
  r2 = Math.random() - 0.5
  return (r1 + r2) * 0.1
}

function initConvWeights(W){
    for(var n=0; n<W.length; n++){
      for(var c=0; c<W[n].length; c++){
        for(var p=0; p<W[n][c].length; p++){
            for(var q=0; q<W[n][c][p].length; q++){
                W[n][c][p][q] = random_normal()
            }
        }
    }
  }
}

function initConvBias(b){
    for(var n=0; n<b.length; n++){
      b[n] = 0
  }
}

function initW(W){
  for(var m = 0 ; m < W.length ; m++){
    //W[m] = []
    for(var n = 0 ; n < W[0].length ; n++){
      W[m][n] = random_normal()
    }
  }
}

function initBias(b){
    for(var n=0; n<b.length; n++){
      b[n] = 0.0
  }
}

const FS = 3 // フィルターサイズ
const FN = 8 // フィルター数

var pad = 0
var stride = 1 
var im , out1, out2

var MAP_SIZE = (X.length + 2 * pad - FS) / stride + 1

function fw(x){
	im = x
	x = conv(x)
	x = flatten(x, F1)
	out1 = x
	x = fc(x, W1, b1)
	x = relu(x)
	out2 = x
	x = fc(x, W2, b2)
	y = softmax(x)
}

function conv(x, W){
	var out = []
	for (var c = 0; c < W.length; c++){
		out[c] = []
		for (var h = 0; h < MAP_SIZE; h++){
			out[c][h] = []
			for (var w = 0; w < MAP_SIZE; w++){
				var f = 0
				for (var fh = 0; fh < FS; fh++){
					for (var fw = 0; fw < FS; fw++){
						f += x[h + fh][w + fw] * W[c][fh][fw]
					}
				}
			}
			out[c][h][w] = f
		}
	}
	return out
}

function addpad(x){
	var out = []
	for (var i = 0; i < x.length; i++){
		out[i] = []
		out[i].push(0)
		for (var j = 0; j < x[0].length; j++){
			out[i].push( x[i][j] )
		}
		out[i].push(0)
	}
	
	var a = []
	for (var i = 0; i < x.length + 2; i++){
		a.push(0)
	}
	
	x.unshift(a)
	x.push(a)
	
	return x
}

function flatten(x){
	var out = []
	for (var i = 0; x.length; i++){
		for (var j = 0; j < x[0].length; j++){
			for (var k = 0; k < x[0][0].length; k++){
				out.push( x[i][j][k] )
			}
		}
	}
}

function fc(x, W, b){
	// Wの形式に注意
	var out = []
	for (var j = 0; j < W[0].length; j++){
		var a = 0
		for (var i = 0; i < W.length; i++){
			a += W[i][j] * x[i]
		}
		a += b[j]
		out.push(a)
	}
	return out
}

function relu(x){
	var out = []
	for (var i = 0; i < x.length; i++){
		var a = x[i] < 0 ? 0 : x[i]
		out.push(a)
	}
	return out
}

function softmax(x){
	
	var max = -9 
	for (var i = 0; i < x.length; i++){
		if (max < x[i]){
			max = x[i]
		}
	}
	
	for (var i = 0; i < x.length; i++){
		x[i] -= max
	}
	
	var s = 0
	for (var i = 0; x.length; i++){
		s += Math.exp(x[i])
	}
	
	var out = []
	for (var i = 0; x.length; i++){
		var a = Math.exp(x[i]) / s
		out.push(a)
	}
	
	return out
}



function bw(y, t){
	dy = softmax_cross_entropy(y, t)
	d = fc_bw(dy, out2, W2)
	d_param['W2'] = d[1]
	d_param['b2'] = d[2]
	d = relu_bw(d[0], out1)
	d = fc_bw(d, out1, W1)
	d_param['W1'] = d[1]
	d_param['b1'] = d[2]
	d = unflatten(d[0])
	d = conv_bw(d)
	d_param['F1'] = d
	return d
}

function softmax_cross_entropy(y, t){
	dy = []
	for (var i = 0; i < y.length; i++) {
		dy.push(y[i] - t[i])
	}
	return dy
}

function fc_bw(dx, x, W){
	var dout = dw = db = []
	for (var i = 0; i < dx.length; i++){
		db[i] = d[i]
	}
	
	for (var i < 0; i < W.length; i++){
		dW[i][j] = dx[j] * x[i]
		dout[i] += dx[j] * W[i][j]
	}
	
	return [dout, dW, db]
}

function relu_bw(dx, x){
	var dout = []
	for (var i = 0; i < x.length; i++){
		var a = x[i] <= 0 ? 0 : dx[i]
		dout.push(a)
	}
	return dout
}

function unflatten(dx){
	var dout = []
	
	var i = 0
	var a = []
	for (var c = 0; c < FN; c++){
		var a[c] = []
		for (var h = 0; h < MAP_SIZE; h++){
			a[c][h] = []
			for (var w = 0; w < MAP_SIZE; w++){
				a[c][h][w] = dx[i++]
			}
		}
	}
	return dout
}

function conv_bw(dx){
	var dout = []
	for (var c = 0; c < FN; c++){
		dout[c] = []
		for (var fh = 0; fh < FS; fh++){
			dout[c][fh] = []
			for (var fw = 0; fw < FS; fw++){
				var k = 0
				for (var h = 0; h < MAP_SIZE; h++){
					for (var w = 0; w < MAP_SIZE; w++){
						k += im[h + fh][w+ fw] * dx[c][h][w]
					}
				}
				dout[c][fh].push(k)
			}
		}
	}
	return dout
}

function getFilter(){
	var f = []
	for (var n = 0; n < FN; n++) {
		f[n] = []
		for (var h = 0; h < FS; h++){
			f[n][h] = []
			for (var w = 0; w < FS; w++){
				f[n][f][w] = rand_norm()
			}
		}
	}
	return f
}

function getBias(n){
	var out = []
	for (var i = 0; i < n; i++){
		out.push(0)
	}
	return out
}

function getWeight(n_in, n_out){
	var W = []
	for (var i = 0; i < n_in; i++){
		W[i] = []
		for (var j = 0; j < n_out; j++){
			W[i][j] = rand_norm()
		}
	}
	return W
}

function rand_norm(){
	var s = 0
	for (var i = 0; i < 12; i++){
		s += Math.random()
	}
	return s - 6
}

function update(){
	var pname
	
	pname = "W1"
	for (var i = 0; i < param[pname].length; i++){
		for (var j = 0; j < param[pname][0].length; j++) {
			param[pname][i][j] -= d_param[pname][i][j] * LR
		}
	}
	
}


// function setParam(){
	
// }

// function argmax(x){
// }

// function train(){

// }

// function test(){
// }

// function cls(){
// }


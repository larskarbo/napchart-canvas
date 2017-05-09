var Napchart = require('./'),
  fs = require('fs'),
  Canvas = require('canvas'),
  Image = Canvas.Image,
  canvas = new Canvas(500, 500),
  ctx = canvas.getContext('2d')

var mynapchart = Napchart.init(ctx, {
  interaction: false
})

var out = fs.createWriteStream(__dirname + '/text.png')
var stream = canvas.pngStream()

stream.on('data', function(chunk){
  out.write(chunk);
});

stream.on('end', function(){
  console.log('saved png');
});

// console.log('<img src="' + canvas.toDataURL() + '" />')

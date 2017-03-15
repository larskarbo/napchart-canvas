var Napchart = require('./'),
  Canvas = require('canvas'),
  Image = Canvas.Image,
  canvas = new Canvas(200, 200),
  ctx = canvas.getContext('2d')

var mynapchart = new Napchart(ctx)

console.log('<img src="' + canvas.toDataURL() + '" />')

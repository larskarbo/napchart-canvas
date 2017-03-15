

module.exports = function (Napchart) {
  var helpers = Napchart.helpers;


  helpers.strokeSegment = function(chart, start, end, config){
  	var ctx = chart.ctx
  	ctx.save()
  	ctx.strokeStyle = config.color
  	ctx.lineWidth = config.stroke.lineWidth
  	ctx.lineJoin = 'mittel'

  	Napchart.shape.createSegment(chart, config.outerRadius, config.innerRadius, start, end);

  	ctx.stroke();
  	ctx.restore()
  }

}
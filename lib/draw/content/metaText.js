module.exports = function (chart) {
  var ctx = chart.ctx
  var helpers = chart.helpers
  var config = chart.config

  ctx.save()

  ctx.fillStyle="black"
  // var textPosition = helpers.minutesToXY(chart, 0, 0)
  var textPosition = {
  	x:chart.w/2,
  	y:chart.h/2 - 40
  }

  var oldFont = ctx.font
  ctx.font = 'bold ' + ctx.font
  var text = chart.data.title

  ctx.fillText(text, textPosition.x, textPosition.y)


  ctx.font = oldFont
  textPosition.y += chart.config.fontSize * 1.5

  var text = chart.data.description
  ctx.fillText(text, textPosition.x, textPosition.y)



  var types = chart.data.types
  Object.keys(types).forEach(function(id) {
  	if(types[id].name.length == 0){
  		return
  	}
  	textPosition.y += chart.config.fontSize * 1.5
  	var minutes = chart.data.elements.reduce((minutes, element) => {
  	  if(element.typeId == id){
  	    return minutes + helpers.duration(element.start, element.end)
  	  }else{
  	    return minutes
  	  }
  	}, 0)
  	var text = types[id].name + ': ' + helpers.minutesToReadable(minutes)
    
  	ctx.fillText(text, textPosition.x, textPosition.y)

  	var width = ctx.measureText(text).width
  	var squarePosition = {
  		x: textPosition.x - width/2 - 15,
  		y: textPosition.y - 6
  	}
  	ctx.save()

    var squareSize = 10
  	ctx.fillStyle = chart.styles[types[id].style].color
  	ctx.fillRect(squarePosition.x, squarePosition.y, squareSize, squareSize)
  	ctx.restore()
  })

  // console.log(chart.shape)
  ctx.restore()


}

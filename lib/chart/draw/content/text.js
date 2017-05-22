module.exports = function (chart, Napchart) {
  var ctx = chart.ctx
  var helpers = Napchart.helpers

  chart.data.elements.forEach(function(element) {
  	var type = element.type
    ctx.save()
    var middleMinutes = helpers.middlePoint(element.start, element.end)
    var radius

    if(helpers.range(element.start, element.end) > 120){
    	radius = (type.lane.start + type.lane.end)/2
    }else{
    	radius = type.lane.end + chart.config.textDistance
    }

    var textPosition = helpers.minutesToXY(chart, middleMinutes, radius)

    var width = ctx.measureText(element.text).width + 10
    var height = chart.config.fontSize + 6
    ctx.fillStyle = type.style.color
    ctx.globalAlpha = 0.8
    ctx.fillRect(textPosition.x - width/2, textPosition.y - height/2, width, height)
    ctx.globalAlpha = 1

    ctx.fillStyle = 'white'

    ctx.fillText(element.text, textPosition.x, textPosition.y)




    ctx.restore()
  })
}

module.exports = function (chart) {
  var ctx = chart.ctx
  var helpers = chart.helpers
  var config = chart.config

  chart.data.elements.forEach(function(element) {
    var type = element.type
    var lane = config.lanes[type.lane]
    var style = chart.styles[type.style]

    ctx.save()
    var middleMinutes = helpers.middlePoint(element.start, element.end)
    var radius

    if(helpers.range(element.start, element.end) > 120){
    	radius = (lane.start + lane.end)/2
    }else{
    	radius = lane.end + chart.config.textDistance
    }

    var textPosition = helpers.minutesToXY(chart, middleMinutes, radius)

    var width = ctx.measureText(element.text).width + 10
    var height = chart.config.fontSize + 6
    ctx.fillStyle = style.color
    ctx.globalAlpha = 0.8
    ctx.fillRect(textPosition.x - width/2, textPosition.y - height/2, width, height)
    ctx.globalAlpha = 1

    ctx.fillStyle = 'white'

    ctx.fillText(element.text, textPosition.x, textPosition.y)




    ctx.restore()
  })
}

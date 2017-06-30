module.exports = function (chart) {
  var ctx = chart.ctx
  var helpers = chart.helpers
  var config = chart.config

  chart.data.elements.forEach(function(element) {
    var text = element.text
    if(text.length == 0){
        // return
    }


    var type = chart.data.types[element.typeId]
    var lane = config.lanes[element.lane]
    var style = chart.styles[type.style]

    ctx.save()
    var middleMinutes = helpers.middlePoint(element.start, element.end)
    var radius

    if(!chart.shapeIsContinous || helpers.duration(element.start, element.end) > 120){
    	radius = (lane.start + lane.end)/2
    }else{
    	radius = lane.end + chart.config.content.textDistance
    }
    if(element.lane == 0){
      radius = lane.start - chart.config.content.textDistance
    }


    var textPosition = helpers.minutesToXY(chart, middleMinutes, radius)

    var text = helpers.minutesToReadable(helpers.duration(element.start, element.end))
    if(element.text.length > 0){
        text = element.text + ' ' + text
    }

    var width = ctx.measureText(text).width + 10
    var height = chart.config.fontSize + 6
    ctx.fillStyle = style.color
    ctx.globalAlpha = 0.7
    ctx.fillRect(textPosition.x - width/2, textPosition.y - height/2, width, height)
    ctx.globalAlpha = 1

    ctx.fillStyle = 'white'

    ctx.fillText(text, textPosition.x, textPosition.y)




    ctx.restore()
  })
}

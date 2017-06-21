module.exports = function (chart) {
  var ctx = chart.ctx
  var helpers = chart.helpers
  var config = chart.config

  chart.data.elements.forEach(function(element) {
    var type = chart.data.types[element.typeId]
    var lane = config.lanes[element.lane]
    var style = chart.styles[type.style]

    ctx.save()

    var radius = lane.end + config.content.handleTimes.distance
    if(element.lane == 0){
      var radius = lane.start - config.content.handleTimes.distance
    }

    ctx.font = helpers.fontSize(chart, config.content.handleTimes.fontSize)
    ctx.fillStyle = config.content.handleTimes.color

    var textPositionStart = helpers.minutesToXY(chart, element.start, radius)
    var textPositionEnd = helpers.minutesToXY(chart, element.end, radius)



    ctx.fillText(helpers.minutesToClock(element.start), textPositionStart.x, textPositionStart.y)
    ctx.fillText(helpers.minutesToClock(element.end), textPositionEnd.x, textPositionEnd.y)

    ctx.restore()
  })
}

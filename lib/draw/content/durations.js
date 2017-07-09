module.exports = function (chart) {
  var ctx = chart.ctx
  var data = chart.data
  var helpers = chart.helpers
  var config = chart.config

  data.elements.forEach(function(element) {
    var type = data.types[element.typeId]
    var lane = config.lanes[element.lane]
    var style = chart.styles[type.style]

    ctx.save()


    ctx.fillStyle = style.color
    
    var duration = helpers.minutesToReadable(helpers.duration(element.start, element.end))
    var textPositionStart = helpers.minutesToXY(chart, helpers.middlePoint(element.start,element.end), lane.start-10)
    ctx.fillText(duration, textPositionStart.x, textPositionStart.y)

    ctx.restore()
  })
}
module.exports = function (chart) {
  var ctx = chart.ctx
  var data = chart.data
  var helpers = chart.helpers
  var config = chart.config

  data.selected.forEach(function(element) {
    var type = element.type
    var lane = config.lanes[type.lane]
    var style = chart.styles[type.style]

    ctx.save()

    var handle1 = helpers.minutesToXY(chart, element.start, lane.end)
    var handle2 = helpers.minutesToXY(chart, element.end, lane.end)
    
    ctx.fillStyle = style.color

    helpers.circle(chart, handle1, style.handleBig);
    ctx.fill()
    helpers.circle(chart, handle2, style.handleBig);
    ctx.fill()


    ctx.fillStyle = 'white'

    helpers.circle(chart, handle1, style.handleSmall);
    ctx.fill()
    helpers.circle(chart, handle2, style.handleSmall);
    ctx.fill()



    ctx.restore()
  })
}

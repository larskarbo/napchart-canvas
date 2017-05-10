module.exports = function (chart, Napchart) {
  var ctx = chart.ctx
  var data = chart.data
  var canvas = ctx.canvas
  var helpers = Napchart.helpers

  data.selected.forEach(function(element) {
    var lane = element.type.lane
    var style = element.type.style

    ctx.save()

    var handle1 = helpers.minutesToXY(chart, element.start, lane.end)
    var handle2 = helpers.minutesToXY(chart, element.end, lane.end)
    
    ctx.fillStyle = style.color

    helpers.circle(chart, handle1, 10);
    ctx.fill()
    helpers.circle(chart, handle2, 10);
    ctx.fill()


    ctx.fillStyle = 'white'

    helpers.circle(chart, handle1, 4);
    ctx.fill()
    helpers.circle(chart, handle2, 4);
    ctx.fill()



    ctx.restore()
  })
}

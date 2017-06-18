module.exports = function (chart) {
  var ctx = chart.ctx
  var data = chart.data
  var helpers = chart.helpers
  var config = chart.config

  data.selected.forEach(function(id) {
    var element = data.elements.find(e => id == e.id)
    var type = data.types[element.typeId]
    var lane = config.lanes[type.lane]
    var style = chart.styles[type.style]

    ctx.save()

    var handle1 = helpers.minutesToXY(chart, element.start, lane.end)
    var handle2 = helpers.minutesToXY(chart, element.end, lane.end)
    
    ctx.fillStyle = 'white'

    helpers.circle(chart, handle1, config.content.handles.outer);
    ctx.fill()
    helpers.circle(chart, handle2, config.content.handles.outer);
    ctx.fill()


    ctx.fillStyle = style.color
    
    helpers.circle(chart, handle1, config.content.handles.inner);
    ctx.fill()
    helpers.circle(chart, handle2, config.content.handles.inner);
    ctx.fill()



    ctx.restore()
  })
}

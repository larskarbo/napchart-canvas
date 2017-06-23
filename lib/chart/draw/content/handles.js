module.exports = function (chart) {
  var ctx = chart.ctx
  var data = chart.data
  var helpers = chart.helpers
  var config = chart.config

  data.selected.forEach(function(id) {
    var element = data.elements.find(e => id == e.id)
    var type = data.types[element.typeId]
    var lane = config.lanes[element.lane]
    var style = chart.styles[type.style]

    ctx.save()



    var arr = ['start', 'end']

    arr.forEach(function(startOrEnd) {
      var handle = helpers.minutesToXY(chart, element[startOrEnd], lane.end)

      ctx.globalAlpha = 0.1
      ctx.fillStyle = style.color

      helpers.circle(chart, handle, config.handlesClickDistance);
      ctx.fill()

      if(chart.isActive(element.id, startOrEnd)){
        ctx.globalAlpha = 0.5
        ctx.fillStyle = style.color

        helpers.circle(chart, handle, config.content.handles);
        ctx.fill()
      }
      
    })

    
    



    ctx.restore()
  })
}

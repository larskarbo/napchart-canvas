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
      
      var innerColor, outerColor

      if((chart.isHover(element.id, startOrEnd) || chart.isActive(element.id, startOrEnd)) && !chart.isActive(element.id, 'middle')){
        innerColor = style.weakColor
        outerColor = style.color
      } else {
        innerColor = style.color
        outerColor = "white"
      }

      ctx.fillStyle = outerColor

      helpers.circle(chart, handle, config.content.handles.outer);
      ctx.fill()


      ctx.fillStyle = innerColor
      
      helpers.circle(chart, handle, config.content.handles.inner);
      ctx.fill()
    })

    
    



    ctx.restore()
  })
}

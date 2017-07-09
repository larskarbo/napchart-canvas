module.exports = function (chart) {
  var ctx = chart.ctx
  var helpers = chart.helpers
  var config = chart.config

  chart.data.elements.forEach(function(element) {
    var type = chart.data.types[element.typeId]
    var lane = config.lanes[element.lane]
    var style = chart.styles[type.style]

    ctx.save()

    var arr = ['start', 'end']

    arr.forEach(function(startOrEnd) {
      if(chart.isActive(element.id, 'middle') || chart.isActive(element.id, startOrEnd)){
        var settings = config.content.handleTimesActive
      } else {
        var settings = config.content.handleTimes
      }
        if(element[startOrEnd] % 240 < 5 || element[startOrEnd] % 240 > 235){
          // if close to a big number on the face, dont draw
          return
        }

      var radius = lane.end + settings.distance
      if(element.lane == 0){
        var radius = lane.start - settings.distance
      }

      ctx.fillStyle = settings.color
      
      ctx.font = helpers.fontSize(chart, settings.fontSize)
      var textPositionStart = helpers.minutesToXY(chart, element[startOrEnd], radius)
      ctx.fillText(helpers.minutesToClock(element[startOrEnd]), textPositionStart.x, textPositionStart.y)
    })


    ctx.restore()
  })
}

module.exports = function (chart) {
  var ctx = chart.ctx
  var data = chart.data
  var helpers = chart.helpers
  var config = chart.config

  // fill
  data.elements.forEach(function(element) {
    var type = data.types[element.typeId]
    var lane = config.lanes[type.lane]
    var style = chart.styles[type.style]

    ctx.save()
    ctx.fillStyle = style.color
    if(chart.isActive(element.id, 'middle')){
      ctx.globalAlpha = style.opacities.activeOpacity
    } else if(chart.isSelected(element.id)){
      ctx.globalAlpha = style.opacities.selectedOpacity
    } else if(chart.isHover(element.id, 'middle')){
      ctx.globalAlpha = style.opacities.hoverOpacity
    } else {
      ctx.globalAlpha = style.opacities.opacity
    }

    helpers.createSegment(chart, lane.end, lane.start, element.start, element.end)

    ctx.fill()
    ctx.restore()
  })

  

  // stroke

  data.elements.forEach(function(element) {
    var ctx = chart.ctx
    var type = data.types[element.typeId]
    var lane = config.lanes[type.lane]
    var style = chart.styles[type.style]

    ctx.save()
    ctx.strokeStyle = style.color
    ctx.lineWidth = style.stroke.lineWidth
    ctx.lineJoin = 'mittel'

    helpers.createSegment(chart, lane.end, lane.start, element.start, element.end);

    ctx.stroke();
    ctx.restore()
  });
}

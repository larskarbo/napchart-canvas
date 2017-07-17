module.exports = function (chart, ctx) {
  var lanes = chart.shape.lanes
  var helpers = chart.helpers
  ctx.lineWidth = chart.config.face.stroke


  ctx.strokeStyle = chart.config.face.weakStrokeColor
  ctx.beginPath()
  helpers.createCurve(chart, 1, 1439, lanes[0].start)
  ctx.stroke()

  ctx.strokeStyle = chart.config.face.strokeColor

  ctx.beginPath()
  helpers.createCurve(chart, 1, 1439, lanes[1].start)
  ctx.stroke()

  ctx.beginPath()
  helpers.createCurve(chart, 1, 1439, lanes[1].end)
  ctx.stroke()

}

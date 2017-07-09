module.exports = function (Napchart) {
  Napchart.draw.elements.line = function (chart, minutes, radius1, radius2) {
    var ctx = chart.ctx
    var config = Napchart.config
    var helpers = Napchart.helpers

    ctx.save()
    ctx.beginPath()
    var s = Napchart.shape.minutesToXY(chart, minutes, radius1)
    var e = Napchart.shape.minutesToXY(chart, minutes, radius2)
    ctx.moveTo(s.x, s.y)
    ctx.lineTo(e.x, e.y)
    ctx.stroke()
    ctx.restore()
  }
}

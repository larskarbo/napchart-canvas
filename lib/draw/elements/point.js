module.exports = function (Napchart) {
  Napchart.draw.elements = {}
  Napchart.draw.elements.point = function (chart, minutes, radius) {
    var ctx = chart.ctx
    var config = Napchart.config
    var helpers = Napchart.helpers

    ctx.save()
    ctx.beginPath()
    var c = Napchart.shape.minutesToXY(chart, minutes, radius)
    ctx.arc(c.x, c.y, 2, 0, 2 * Math.PI, false)
    ctx.fill()
    ctx.restore()
  }
}

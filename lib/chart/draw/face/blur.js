module.exports = function (Napchart) {
  Napchart.draw.face.blur = function (chart) {
    var ctx = chart.ctx
    var config = Napchart.config
    var helpers = Napchart.helpers

    // if(clockConfig.blurCircle.opacity == 1){
    // 	// then its better just to make a hole
    // 	return clearClockCircle(ctx,clockConfig.blurCircle.radius*draw.ratio)
    // }

    ctx.save()
    ctx.fillStyle = config.face.background
    ctx.globalAlpha = config.face.blurCircle.opacity
    ctx.beginPath()
    Napchart.shape.createCurve(chart, config.face.blurCircle.radius, 0, 1440)
    ctx.fill()
    ctx.restore()
  }
}

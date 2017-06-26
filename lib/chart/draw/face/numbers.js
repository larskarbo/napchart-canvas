function drawClockNumbers (ctx, ampm) {
  var width = draw.w
  var height = draw.h

  impfontpixels = 5 * draw.ratio
  ctx.fillStyle = clockConfig.clockNumbers.color
  numberRadius = clockConfig.clockNumbers.radius * draw.ratio
  ctx.font = impfontpixels + 'px Verdana'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  var ampmTable = {
    0: 'Midnight',
    4: '4 AM',
    8: '8 AM',
    12: 'Noon',
    16: '4 PM',
    20: '8 PM',
    24: 'LOL PM'
  }

  for (i = 0; i <= 24; i++) {
    if (i === 0 || i == 4 || i == 16 || i == 20 || i == 8 || i == 12 || (chart.shapeIsContinous && i == 24)) {
      degrees = (helpers.degreesToRadiens((15 * i) + 270))
      xval = width / 2 + Math.cos(degrees) * numberRadius
      yval = height / 2 + Math.sin(degrees) * numberRadius
      if (ampm) {
        ctx.fillText(ampmTable[i], xval, yval)
      } else {
        ctx.fillText(i, xval, yval)
      }
    }
  }
}

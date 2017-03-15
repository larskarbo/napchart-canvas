function drawTimeIndicators (ctx, selected) {
  var element, name, count, duration, timeLocation, radius, time
  var position = {}
  var pointsToDraw = []
  var canvas = ctx.canvas

  name = selected.name
  count = selected.count
  element = napchartCore.returnElement(name, count)
  duration = helpers.range(element.start, element.end)
  timeLocation = clockConfig.timeLocation
  radius = (barConfig[name].outerRadius + timeLocation) * draw.ratio

  // push start
  pointsToDraw.push({
    minutes: element.start
  })

  // if element is big enough, push end
  if (duration > 90) {
    pointsToDraw.push({
      minutes: element.end
    })
  }

  ctx.save()

  // ctx config
  ctx.font = 3 * draw.ratio + 'px verdana'
  ctx.fillStyle = barConfig.general.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = ctx.globalAlpha * 0.4

  for (var i = 0; i < pointsToDraw.length; i++) {
    minutes = pointsToDraw[i].minutes

    // skip if close to 0, 4, 8, 12, 16 or 20 (every 240 minutes)
    if (minutes % 240 <= 15 || minutes % 240 >= 225) { continue }

    time = helpers.minutesToClock(minutes)
    position = helpers.minutesToXY(minutes, radius, canvas.width / 2, canvas.height / 2)

    // draw
    ctx.fillText(time, position.x, position.y)
  }

  ctx.restore()
}

import config from './../settings'

function duration (ctx, selected) {
  console.log('ye')
}

function nfo (ctx, selected) {
  var element, name, count, duration, middle, radius
  var position = {}
  var radius = 22 * draw.ratio
  var canvas = ctx.canvas

  name = selected.name
  count = selected.count
  element = napchartCore.returnElement(name, count)
  duration = helpers.minutesToReadable(helpers.range(element.start, element.end), 120)

  // find position
  middle = helpers.middle(element.start, element.end)
  position = helpers.minutesToXY(middle, radius, canvas.width / 2, canvas.height / 2)

  ctx.save()

  // ctx config
  ctx.font = barConfig.general.textSize * draw.ratio + 'px verdana'
  ctx.fillStyle = barConfig.general.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = ctx.globalAlpha * 0.6

  // draw
  ctx.fillText(duration, position.x, position.y)

  ctx.restore()
}

export { duration, nfo }

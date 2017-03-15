function drawHandles (ctx, data) {
  var outerColor, innerColor
  ctx.save()

  ctx.translate(draw.w / 2, draw.h / 2)
  for (var name in data) {
    if (typeof barConfig[name].rangeHandles === 'undefined' || !barConfig[name].rangeHandles) { continue }

    for (var i = 0; i < data[name].length; i++) {
      var element = data[name][i],
        count = i

      if (!napchartCore.isSelected(name, count)) { continue }

      for (s = 0; s < 2; s++) {
        var point = helpers.minutesToXY(element[['start', 'end'][s]], barConfig[name].outerRadius * draw.ratio)

        if (interactCanvas.isActive(name, i, ['start', 'end'][s])) {
          outerColor = 'red'
          innerColor = 'green'
        } else if (interactCanvas.isHover(name, i, ['start', 'end'][s]) && !interactCanvas.isActive(name, i)) {
          outerColor = 'white'
          innerColor = 'blue'
        } else {
          outerColor = 'white'
          innerColor = barConfig[name].color
        }
        ctx.fillStyle = outerColor
        ctx.beginPath()
        ctx.arc(point.x, point.y, 1 * draw.ratio, 0, 2 * Math.PI, false)
        ctx.fill()

        ctx.fillStyle = innerColor
        ctx.beginPath()
        ctx.arc(point.x, point.y, 0.7 * draw.ratio, 0, 2 * Math.PI, false)
        ctx.fill()
      }
    }
  }
  ctx.restore()
}

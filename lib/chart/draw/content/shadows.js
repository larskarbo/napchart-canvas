function drawShadows (ctx, data) {
  ctx.save()
  for (var name in data) {
    var innerRadius = 0
    var outerRadius = barConfig[name].innerRadius
    ctx.fillStyle = barConfig[name].color

    for (var i = 0; i < data[name].length; i++) {
      var count = i

      if (!interactCanvas.isActive(name, count) && !napchartCore.isSelected(name, count)) { continue }

      ctx.save()
      var start = data[name][i].start
      var end = data[name][i].end
      var startRadians = helpers.minutesToRadians(data[name][count].start)
      var endRadians = helpers.minutesToRadians(data[name][count].end)
      var lineToXY = helpers.minutesToXY(data[name][count].end, innerRadius)

      createSegment(ctx, outerRadius, innerRadius, start, end)

      ctx.globalAlpha = 0.1 * ctx.globalAlpha

      ctx.fill()
      ctx.restore()
    }
  }
  ctx.restore()
}

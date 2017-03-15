function drawDistanceToNearElements (ctx, data, selectedElement, bars) {
  // draws the distance to the nearby elements of the selected element
  var array = [], elementPush, selected, before, after

  if (bars.indexOf(selectedElement.name) == -1) { return }

  if (!interactCanvas.isActive(selectedElement.name, selectedElement.count)) { return }

  // FIRST - find the elements near the selected element (max one on each side):

  // loop through the bar types specified
  for (var i = 0; i < bars.length; i++) {
    if (typeof data[bars[i]] === 'undefined') { continue }

    // add elements into new array
    for (var f = 0; f < data[bars[i]].length; f++) {
      if (typeof data[bars[i]][f] !== 'undefined') {
        elementPush = data[bars[i]][f]

        if (napchartCore.isSelected(bars[i], f)) {
          elementPush.selected = true
        }

        array.push(elementPush)
      }
    }
  }

  // nothing to do if only one element
  if (array.length == 1) { return }

  // sort array
  array = array.sort(function (a, b) {
    return a.start - b.start
  })

  // find out which element in new array is the selected one
  for (var i = 0; i < array.length; i++) {
    if (typeof array[i].selected !== 'undefined') {
      selected = i
    }
  }

  // ok, great we have an array with sorted values and know what element is selected
  // then all we have to do is to find the two elements besides the selected element in the array, right?
  before = selected - 1
  if (before < 0) { before = array.length - 1 }

  after = selected + 1
  if (after > array.length - 1) { after = 0 }

  // SECOND - find out if they are close enough, then draw
  var radius = 45
  var textRadius = 36 * draw.ratio
  var canvas = ctx.canvas
  var fontSize = barConfig.general.textSize * draw.ratio

  ctx.save()

  ctx.strokeStyle = '#d2d2d2'
  ctx.strokeStyle = clockConfig.between.strokeColor
  ctx.fillStyle = clockConfig.between.textColor
  ctx.lineWidth = 3
  ctx.font = fontSize + 'px verdana'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = ctx.globalAlpha * clockConfig.between.opacity

  // push start and endpoints to draw array
  var drawArr = []
  drawArr.push({
    start: array[before].end,
    end: array[selected].start
  })
  drawArr.push({
    start: array[selected].end,
    end: array[after].start
  })

  drawArr.forEach(function (element) {
    var distance, start, end, middle, startRadians, endRadians, text

    distance = helpers.range(element.start, element.end)
    text = helpers.minutesToReadable(distance, 120)

    if (distance <= 720 && distance >= 60) {
      start = helpers.calc(element.start, 15)
      end = helpers.calc(element.end, -15)
      middle = helpers.calc(start, distance / 2)

      middleXY = helpers.minutesToXY(middle, textRadius, canvas.width / 2, canvas.height / 2)

      // stroke
      ctx.beginPath()
      createCurve(ctx, radius, start, end)
      ctx.stroke()

      // text
      ctx.fillText(text, middleXY.x, middleXY.y)
    }
  })

  ctx.restore()
}

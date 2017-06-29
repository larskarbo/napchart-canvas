module.exports = function (chart) {
  var ctx = chart.ctx
  var data = chart.data
  var helpers = chart.helpers
  var config = chart.config

  // we need to go through one lane at the time and check if we
  // should draw distances

  config.lanes.forEach(function(lane, i) {
    var elementsWithThisLane = data.elements.filter(e => e.lane == i)
    elementsWithThisLane.forEach(function(element) {
      if(chart.isSelected(element.id)){
        drawDistanceToNearElements(element, elementsWithThisLane)
      }
    })
  })


  function drawDistanceToNearElements(mainElement, elements){
    var type = data.types[mainElement.typeId]
    var lane = config.lanes[mainElement.lane]
    var style = chart.styles[type.style]

    ctx.save()
    ctx.fillStyle = 'red'
    
    // FIRST - find the elements near the main element (max one on each side):

    // nothing to do if only one element
    if (elements.length == 1) return

    // sort array
    elements = elements.sort(function (a, b) {
      return a.start - b.start
    })

    // find out which element in new array is the selected one
    var mainElementIndex = elements.findIndex(e => e.id == mainElement.id)

    // ok, great we have an array with sorted values and know what element is selected
    // then all we have to do is to find the two elements besides the selected element in the array, right?
    var before = mainElementIndex - 1
    if (before < 0) {
      before = elements.length - 1
    }

    var after = mainElementIndex + 1
    if (after > elements.length - 1) {
      after = 0
    }
    
    // SECOND - draw
    ctx.save()

    // ctx.strokeStyle = '#d2d2d2'
    // ctx.strokeStyle = clockConfig.between.strokeColor
    // ctx.fillStyle = clockConfig.between.textColor
    // ctx.lineWidth = 3
    // ctx.globalAlpha = ctx.globalAlpha * clockConfig.between.opacity
    // push start and endpoints to draw elements
    var drawArr = []
    drawArr.push({
      start: elements[before].end,
      end: mainElement.start
    })
    drawArr.push({
      start: mainElement.end,
      end: elements[after].start
    })

    var radius = lane.start + (lane.end - lane.start)/3
    var textRadius = lane.start + (lane.end - lane.start)*2/3

    drawArr.forEach(function (element) {
      var distance = helpers.duration(element.start, element.end)
      var text = helpers.minutesToReadable(distance, 120)

      if (distance <= 720 && distance >= 60) {
        start = helpers.limit(element.start + 15)
        end = helpers.limit(element.end - 15)
        middle = helpers.limit(start + (distance / 2))


          ctx.beginPath()
        // stroke
        helpers.createCurve(chart, start, end, radius, false, () => {
          ctx.stroke()
        })
        

        // subracting 10 because of text width
        // should probably find a way to calculate it better
        var middleXY = helpers.minutesToXY(chart, middle - 10, textRadius)
        // text
        ctx.fillText(text, middleXY.x, middleXY.y)
      }
    })

    ctx.restore()
  }
}
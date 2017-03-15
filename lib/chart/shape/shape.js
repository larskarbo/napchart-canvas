module.exports = function (Napchart) {
  var shape = [
    {
      type: 'arc',
      radians: Math.PI / 4
    },
    {
      type: 'line',
      minutes: 200
    },
    {
      type: 'arc',
      radians: Math.PI
    },
    {
      type: 'line',
      minutes: 200
    },
    {
      type: 'arc',
      radians: Math.PI * 3 / 4
    }
  ]

  var shape = [
    {
      type: 'arc',
      radians: Math.PI * 2
    }
  ]

  function calculateShape (chart, shape) {
    var minutesPreservedByLine = 0
    var radius = 100

    for (var i = 0; i < shape.length; i++) {
      if (shape[i].type == 'line') {
        minutesPreservedByLine += shape[i].minutes
      }
    }

    var spaceForArcs = 1440 - minutesPreservedByLine
    if (spaceForArcs < 0) {
      throw new Error('too much space is given to straight segments in the shape')
    }

    var totalRadians = 0
    for (var i = 0; i < shape.length; i++) {
      shape[i].angle = totalRadians

      if (shape[i].type == 'arc') {
        totalRadians += shape[i].radians
      }
    }

    var pathLengthPerMinute
    // calc. minutes
    for (var i = 0; i < shape.length; i++) {
      if (shape[i].type == 'arc') {
        shape[i].minutes = (shape[i].radians / totalRadians) * spaceForArcs

        // find perimeter of whole main circle, then find length of this
        shape[i].pathLength = radius * 2 * Math.PI * (shape[i].radians / (Math.PI * 2))

        // only need to do this once
        if (i == 0) {
          pathLengthPerMinute = shape[i].pathLength / shape[i].minutes
        }
      }
    }

    for (var i = 0; i < shape.length; i++) {
      if (shape[i].type == 'line') {
        shape[i].pathLength = shape[i].minutes * pathLengthPerMinute
      }
    }

    var sumMinutes = 0
    for (var i = 0; i < shape.length; i++) {
      shape[i].start = sumMinutes
      shape[i].end = sumMinutes + shape[i].minutes

      sumMinutes += shape[i].minutes
    }

    // find centres
    for (var i = 0; i < shape.length; i++) {
      // console.log(i)
      if (i == 0) {
        shape[i].centre = {
          x: chart.w / 2,
          y: chart.h / 2
        }
      } else {
        shape[i].centre = shape[i - 1].endCentre
      }

      if (shape[i].type == 'line') {
        shape[i].endCentre = {
          x: shape[i].centre.x + Math.cos(shape[i].angle) * shape[i].pathLength,
          y: shape[i].centre.y + (Math.sin(shape[i].angle) * shape[i].pathLength)
        }
      } else {
        shape[i].endCentre = shape[i].centre
      }
    }

    return shape
  }

  Napchart.shape = function (chart) {
    var ctx = chart.ctx
  }

  Napchart.initShape = function (chart) {
    chart.shape = calculateShape(chart, JSON.parse(JSON.stringify(shape)))
  }

  Napchart.shape.minutesToXY = function (chart, minutes, radius) {
    var ctx = chart.ctx
    var helpers = Napchart.helpers

    var c = { // center
      x: chart.w / 2,
      y: chart.h / 2
    }
    var r = radius

    var cumRad = 0
    var nowPoint = {
      x: c.x,
      y: c.y - r
    }

    var shape = chart.shape

    // find which block we are in
    var block
    for (var i = 0; i < shape.length; i++) {
      var e = shape[i]

      // if start is inside this shapeBlock
      if (helpers.isInside(minutes, e.start, e.end)) {
        block = shape[i]
      }
    }
    // console.log(block)
    if (block.type == 'line') {
      console.log('alarm')
      var minuteInblock = helpers.getProgressBetweenTwoValues(minutes, block.start, block.end)
      var pathLength = minuteInblock * block.pathLength
      console.log(pathLength)
      var angle = block.angle - Math.PI / 2
      var pls = {
        x: Math.cos(angle) * pathLength,
        y: -Math.sin(angle) * pathLength
      }
      var o = {
        x: Math.cos(angle) * r + block.centre.x + pls.x,
        y: Math.sin(angle) * r + block.centre.y + pls.y
      }
    } else if (block.type == 'arc') {
      var radStart = block.angle - Math.PI / 2
      var pointRad = helpers.getProgressBetweenTwoValues(minutes, block.start, block.end) * block.radians + radStart

      var o = {
        x: Math.cos(pointRad) * r + block.centre.x,
        y: Math.sin(pointRad) * r + block.centre.y
      }
    }

    return o
  }

  Napchart.shape.createCurve = function (chart, radius, start, end, anticlockwise) {
    var ctx = chart.ctx
    var helpers = Napchart.helpers

    var c = {
      x: chart.w / 2,
      y: chart.h / 2
    }
    var r = radius

    var cumRad = 0
    var nowPoint = {
      x: c.x,
      y: c.y - r
    }
    var shape = helpers.clone(chart.shape)
    if (anticlockwise) {
      shape.reverse()
    }

    // find start
    var startBlock, endBlock
    for (var i = 0; i < shape.length; i++) {
      var e = shape[i]

      // if start is inside this shapeBlock
      if (helpers.isInside(start, e.start, e.end)) {
        startBlock = i
      }
      // if end is inside this shapeBlock
      if (helpers.isInside(end, e.start, e.end)) {
        endBlock = i
      }
    }

    // create iterable task array
    var taskArray = []
    var skipEndCheck = false
    var defaultTask
    if (anticlockwise) {
      defaultTask = {
        start: 1,
        end: 0
      }
    } else {
      defaultTask = {
        start: 0,
        end: 1
      }
    }

    for (var i = startBlock; i < shape.length; i++) {
      var task = {
        shape: shape[i],
        start: defaultTask.start,
        end: defaultTask.end
      }

      if (i == startBlock) {
        task.start = helpers.getProgressBetweenTwoValues(start, shape[i].start, shape[i].end)
      }
      if (i == endBlock) {
        task.end = helpers.getProgressBetweenTwoValues(end, shape[i].start, shape[i].end)
      }
      if (i == startBlock && i == endBlock && (task.end > task.start && anticlockwise) || (task.end < task.start && !anticlockwise)) {
        // make sure things are correct when end is less than start
        if (taskArray.length == 0) {
          // it is beginning
          task.end = defaultTask.end
          skipEndCheck = true
        } else {
          // it is end
          task.start = defaultTask.start
        }
      }
      //
      // var oldEnd = task.end
      // task.end = task.start
      // task.start = oldEnd

      taskArray.push(task)

      if (i == endBlock) {
        if (skipEndCheck) {
          skipEndCheck = false
        // let it run a round and add all shapes
        } else {
          // finished.. nothing more to do here!
          break
        }
      }

      // if we reached end of array without having found
      // the end point, it means that we have to go to
      // the beginning again
      // ex. when start:700 end:300
      if (i == shape.length - 1) {
        i = -1
      }
    }

    for (var i = 0; i < taskArray.length; i++) {
      var shape = taskArray[i].shape
      if (shape.type == 'arc') {
        var shapeStart = shape.angle - (Math.PI / 2)
        var start = shapeStart + (taskArray[i].start * shape.radians)
        var end = shapeStart + (taskArray[i].end * shape.radians)
        ctx.arc(shape.centre.x, shape.centre.y, r, start, end, anticlockwise)

        var radNormalize = shape.angle + shape.radians - (Math.PI / 2) // because my circle is not the same as the math circle
        nowPoint.x = c.x + Math.cos(radNormalize) * r
        nowPoint.y = c.y + Math.sin(radNormalize) * r
      } else if (shape.type == 'line') {
        var distance = {
          x: Math.cos(shape.angle) * shape.pathLength,
          y: Math.sin(shape.angle) * shape.pathLength
        }
        var shapeStart = {
          x: shape.centre.x + Math.sin(shape.angle) * r,
          y: shape.centre.y - Math.cos(shape.angle) * r
        }
        var start = {
          x: shapeStart.x + distance.x * taskArray[i].start,
          y: shapeStart.y + distance.y * taskArray[i].start
        }
        var end = {
          x: shapeStart.x + distance.x * taskArray[i].end,
          y: shapeStart.y + distance.y * taskArray[i].end
        }

        if (i == 0) {
          ctx.lineTo(start.x, start.y)
        }
        ctx.lineTo(end.x, end.y)
      }
    }
  }

  Napchart.shape.createSegment = function (chart, outer, inner, start, end) {
    var ctx = chart.ctx
    ctx.beginPath()
    Napchart.shape.createCurve(chart, outer, start, end)
    Napchart.shape.createCurve(chart, inner, end, start, true)
    ctx.closePath()
  }
}

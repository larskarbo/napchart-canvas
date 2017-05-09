

module.exports = function(Napchart) {
  
  var helpers = Napchart.helpers

  helpers.XYtoMinutes = function (chart, minutes, radius){
    
    var shape = chart.shape

    return 200
  }

  helpers.minutesToXY = function (chart, minutes, radius){
    var ctx = chart.ctx
    var shape = chart.shape

    var minutes = helpers.limit(minutes);
    // Find out which shapeElement we find our point in
    var shapeElement = shape.find(function (element){
      return (minutes >= element.start && minutes <= element.end)
    })
    if(typeof shapeElement == 'undefined'){
      console.log(minutes)
      console.log(shape.find(function (element){
        console.log(element)
        return (minutes >= element.start && minutes <= element.end)
      }))
    }
    
    // Decimal used to calculate where the point is inside the shape
    var positionInShape = (minutes - shapeElement.start) / shapeElement.minutes

    if(shapeElement.type === 'line'){

      var basePoint = {
        x: shapeElement.startpoint.x + Math.cos(shapeElement.startAngle) * positionInShape * shapeElement.length,
        y: shapeElement.startpoint.y + Math.sin(shapeElement.startAngle) * positionInShape * shapeElement.length
      }
      var point = {
        x: basePoint.x + Math.cos(shapeElement.startAngle-Math.PI/2) * radius,
        y: basePoint.y + Math.sin(shapeElement.startAngle-Math.PI/2) * radius
      }

    }else if (shapeElement.type === 'arc'){

      var centerOfArc = shapeElement.startpoint;
      var angle = positionInShape * shapeElement.radians
      var point = {
        x: centerOfArc.x + Math.cos(shapeElement.startAngle + angle -Math.PI/2) * radius,
        y: centerOfArc.y + Math.sin(shapeElement.startAngle + angle -Math.PI/2) * radius
      }

    }

    return point
  }

  helpers.createCurve = function createCurve(chart, start, end, radius, anticlockwise){
    var ctx = chart.ctx

    if(typeof anticlockwise == 'undefined'){
      var anticlockwise = false;
    }

    var shape = chart.shape.slice();
    if(anticlockwise){
      shape.reverse();
    }

    // find out which shapeElement has the start and end
    var startElementIndex, endElementIndex
    shape.forEach(function(element, i) {
      if(helpers.isInside(start, element.start, element.end)){
        startElementIndex = i
      }
      if(helpers.isInside(end, element.start, element.end)){
        endElementIndex = i;
      }
    })
    
    var shapeElements = []
    // create iterable task array
    var taskArray = [];
    var skipEndCheck = false;
    var defaultTask;
    if(anticlockwise){
      defaultTask = {
        start: 1,
        end: 0
      }
    }else{
      defaultTask = {
        start: 0,
        end: 1
      }
    }

    for (var i = startElementIndex; i < shape.length; i++) {
      var task = {
        shapeElement: shape[i],
        start: defaultTask.start,
        end: defaultTask.end
      }

      if(i == startElementIndex){
        task.start = helpers.getPositionBetweenTwoValues(start,shape[i].start,shape[i].end);
      }
      if(i == endElementIndex){
        task.end = helpers.getPositionBetweenTwoValues(end,shape[i].start,shape[i].end);
      }
      if(i == startElementIndex && i == endElementIndex && (task.end > task.start && anticlockwise) || (task.end < task.start && !anticlockwise)){
        // make sure things are correct when end is less than start
        if(taskArray.length == 0){
          // it is beginning
          task.end = defaultTask.end;
          skipEndCheck = true;
        }else {
          // it is end
          task.start = defaultTask.start;
        }
      }

      taskArray.push(task);

      if(i == endElementIndex){
        if(skipEndCheck){
          skipEndCheck = false;
          // let it run a round and add all shapes
        }else{
          // finished.. nothing more to do here!
          break;
        }
      }

      // if we reached end of array without having found
      // the end point, it means that we have to go to
      // the beginning again
      // ex. when start:700 end:300
      if(i == shape.length-1){
        i = -1;
      }
    }
    taskArray.forEach(function(task, i) {
      var shapeElement = task.shapeElement;
      if(shapeElement.type === 'arc'){
        var shapeStart = shapeElement.startAngle-(Math.PI/2);
        var start = shapeStart + (taskArray[i].start * shapeElement.radians);
        var end = shapeStart + (taskArray[i].end * shapeElement.radians);
        ctx.arc(shapeElement.startpoint.x, shapeElement.startpoint.y, radius, start, end, anticlockwise);
      }else if(shapeElement.type === 'line'){
        var startPoint = helpers.minutesToXY(chart,shapeElement.start + shapeElement.minutes * task.start, radius)
        var endPoint = helpers.minutesToXY(chart,shapeElement.start + shapeElement.minutes * task.end, radius)
        ctx.lineTo(startPoint.x,startPoint.y)
        ctx.lineTo(endPoint.x,endPoint.y)
      }
    })
  }

  helpers.createSegment = function (chart, outer, inner, start, end) {
    var ctx = chart.ctx
    ctx.beginPath()
    Napchart.helpers.createCurve(chart, start, end, outer)
    Napchart.helpers.createCurve(chart, end, start, inner, true)
    ctx.closePath()
  }

}

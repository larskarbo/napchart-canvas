/*
*  interactCanvas
*
*  This module adds support for modifying a schedule
*  directly on the canvas with mouse or touch
*/

var hitDetect = require('./hitDetect')
// window.countFPS = (function () {
//   var lastLoop = (new Date()).getMilliseconds();
//   var count = 1;
//   var fps = 0;

//   return function () {
//     var currentLoop = (new Date()).getMilliseconds();
//     if (lastLoop > currentLoop) {
//       fps = count;
//       count = 1;
//     } else {
//       count += 1;
//     }
//     lastLoop = currentLoop;
//     return fps;
//   };
// }());

module.exports = function (Napchart) {
  var helpers = Napchart.helpers


  Napchart.interactCanvas = {
    init: function (chart) {
      if(!chart.config.interaction){
        return
      }

      chart.thinking = false

      var canvas = chart.canvas

      document.addEventListener('mousemove', function(e) {
        move(e, chart)
      })

      canvas.addEventListener('mousedown', function(e) {
        down(e, chart)
      })
      // canvas.addEventListener('touchstart', down)
      document.addEventListener('mouseup', function(e) {
        up(e, chart)
      })
      // document.addEventListener('touchend', function(e) {
      //   up(e, chart)
      // })
    // document.addEventListener('touchstart',deselect)
    }
  }

  // currently not doing multi-touch
  var position = {}
  var mouseDown = false


  function down (e, chart) {
    e.stopPropagation()
    e.preventDefault()

    position = {
      x: e.clientX,
      y: e.clientY
    }

    var hit = hitDetect(chart, getCoordinates(position, chart))

    if (Object.keys(hit).length == 0) {
      // if no hit
      deselect(chart)
      return
    } else {
      hit.identifier = 'mouse'
      chart.setActive(hit)
      select(chart, hit.elementId)
    }

    update(chart)
  }

  function move(e, chart) {
    position = {
      x: e.clientX,
      y: e.clientY
    }

    update(chart)
  }


  function up(e, chart) {
    chart.removeActive('mouse')

    update(chart)
  }

  function update(chart) {
    // lets do this
    var activeElements = chart.data.activeElements

    if(activeElements.length > 0){
      var coordinates = getCoordinates(position, chart)
      var info = helpers.XYtoInfo(chart, coordinates.x, coordinates.y)

      move(activeElements[0], info)
    }

    function move(hit, info) {
      // clone our element
      var originElement = chart.data.elements.find(element => element.id == hit.elementId)
      var changes = {
        // element containig id and changes that should be done
        id: originElement.id
      }

      // do different things based on if you hit a handle (start, end) or the middle of the object
      if(hit.type == 'start' || hit.type == 'end'){
        var minutes = snap(Math.round(info.minutes))
        if(originElement[hit.type] != minutes){
          changes[hit.type] = minutes
        }
      } else {
        // hit.type is middle
        var duration = helpers.duration(originElement.start, originElement.end)
        var positionInElement = hit.positionInElement
        if(typeof positionInElement == 'undefined'){
          positionInElement = duration / 2
        }

        var start = snap(helpers.limit(Math.round(info.minutes - positionInElement)))
        var end = helpers.limit(start + duration)

        if(originElement.start != start || originElement.end != end){
          changes.start = start
          changes.end = end
        }
      }

      // find lane
      if(hit.type == 'middle'){
        var distance = info.distance
        var lanes = chart.config.lanes
        var theLane = lanes.findIndex(function(lane, i) {
          if(distance > lane.start && distance <= lane.end){
            return true
          }
          if(i === 0 && distance <= lane.start){
            return true
          }
          if(i === lanes.length-1 && distance > lane.end){
            return true
          }
        })

        if(theLane != originElement.lane){ // if changed
          changes.lane = theLane
        }
      }

      if(Object.keys(changes).length > 1){
        chart.updateElement(changes)
      }
    }
  }

  // helper functions :

  function getCoordinates (position, chart) {
    var boundingRect = chart.canvas.getBoundingClientRect()

    return {
      x: position.x - boundingRect.left,
      y: position.y - boundingRect.top
    }
  }

  function snap(input) {
    var output = input

    //hour
    if(input%60 < 7)
      output = input-input%60;
    else if(input%60 > 55)
      output = input+(60-input%60);

    //half hours
    else{
      input += 30;

      if(input%60 < 5)
        output = input-input%60-30;
      else if(input%60 > 55)
        output = input+(60-input%60)-30;
    }
    return output
  }

  function select (chart, id) {
    // notify core module:
    chart.setSelected(id)
  }

  function deselect (chart, element) {
    if (typeof element == 'undefined') {
      // deselect all
      chart.deselect()
    }
    // deselect one
    chart.deselect(element)
  }

  // because maybe multitouch in the future
  function getActiveElement (chart, identifier) {
    var activeElements = chart.data.activeElements
    for (var i = 0; i < activeElements.length; i++) {
      if (activeElements[i].identifier == identifier) {
        return activeElements[i]
      }
    }
    return false
  }
}

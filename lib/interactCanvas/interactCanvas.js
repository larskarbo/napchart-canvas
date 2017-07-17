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

      function addListeners(element, eventNames, listener) {
        eventNames.split(' ').forEach(eventName => {
          element.addEventListener(eventName, listener)
        })
      }

      addListeners(document.getElementById('root'), 'mousemove touchmove', e => {
        if(chart.data.activeElements.length > 0){
          e.stopPropagation()
          e.preventDefault()
        }
        move(e, chart)
      })
      
      addListeners(window, 'mousedown touchstart', e => {
        // e.stopPropagation()
        // e.preventDefault()
        down(e, chart)
      })

      addListeners(window, 'mouseup touchend', e => {
        // e.stopPropagation()
        // e.preventDefault()
        up(e, chart)
      })
    }
  }

  // currently not doing multi-touch
  var position = {}
  var mouseDown = false


  function down (e, chart) {
    

    position = getPosition(e)
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
    position = getPosition(e)

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
        var lanes = chart.shape.lanes
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
  function getPosition(e) {
    if(typeof e.touches != 'undefined'){
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      }
    } else {
      return {
        x: e.clientX,
        y: e.clientY
      }
    }
  }

  function getCoordinates (position, chart) {
    var boundingRect = chart.canvas.getBoundingClientRect()

    return {
      x: position.x - boundingRect.left,
      y: position.y - boundingRect.top
    }
  }

  function snap(input) {
    return Math.round(input/5)*5
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

/*
*  interactCanvas
*
*  This module adds support for modifying a schedule
*  directly on the canvas with mouse or touch
*/

module.exports = function (Napchart) {
  var helpers = Napchart.helpers

  Napchart.interactCanvas = {
    init: function (chart) {
      if(!chart.config.interaction) return

      var canvas = chart.canvas

      document.addEventListener('mousemove', function(e) {
        drag(e, chart)
      })

      canvas.addEventListener('mousedown', function(e) {
        down(e, chart)
      })
      // canvas.addEventListener('touchstart', down)
      document.addEventListener('mouseup', function(e) {
        up(e, chart)
      })
      document.addEventListener('touchend', function(e) {
        up(e, chart)
      })
    // document.addEventListener('touchstart',deselect)
    }
  }

  var mouseHover = {},
    hoverDistance = 6,
    selectedOpacity = 1

  function down (e, chart) {
    e.stopPropagation()
    e.preventDefault()

    var coordinates = getCoordinates(e, chart)
    var hit = hitDetect(chart, coordinates)

    // return of no hit
    if (Object.keys(hit).length == 0) {
      deselect(chart)
      return
    }

    // set identifier
    if (typeof e.changedTouches != 'undefined') {
      hit.identifier = e.changedTouches[0].identifier
    }else {
      hit.identifier = 'mouse'
    }

    chart.setActive(hit)

    // if (typeof e.changedTouches != 'undefined') {
    //   document.addEventListener('touchmove', drag)
    // }else {
    //   document.addEventListener('mousemove', function(e) {
    //     drag(e, chart)
    //   })
    // }

    select(chart, hit.elementId)

    drag(e, chart) // to  make sure the handles positions to the cursor even before movement
  }

  function getCoordinates (e, chart) {
    var mouseX,mouseY
    var canvas = chart.canvas
    // origo is (0,0)
    var boundingRect = canvas.getBoundingClientRect()

    var width = canvas.width
    var height = canvas.height

    if (e.changedTouches) {
      mouseX = e.changedTouches[0].clientX - boundingRect.left
      mouseY = e.changedTouches[0].clientY - boundingRect.top
    }else {
      mouseX = e.clientX - boundingRect.left
      mouseY = e.clientY - boundingRect.top
    }

    return {
      x: mouseX,
      y: mouseY
    }
  }

  function hitDetect (chart, coordinates) {
    var canvas = chart.canvas
    var data = chart.data

    // will return:
    // element
    // type (start, end, or middle)
    // distance

    var hit = {}

    // hit detection of handles:

    var distance;

    data.elements.forEach(function(element) {
      var type = data.types[element.typeId]
      var lane = chart.config.lanes[element.lane]

      // if element is not selected, continue
      if (!chart.isSelected(element.id)){
        return
      }
      ['start', 'end'].forEach(function(startOrEnd) {
        var point = helpers.minutesToXY(chart, element[startOrEnd], lane.end)
        
        distance = helpers.distance(point.x, point.y, coordinates)
        if(distance < chart.config.handlesClickDistance){
          if (typeof hit.distance == 'undefined' || distance < hit.distance) {
            hit = {
              elementId: element.id,
              type: startOrEnd,
              distance: distance
            }
          }
        }
      })
    })


    // if no handle is hit, check for middle hit

    if (Object.keys(hit).length == 0) {

      var info = helpers.XYtoInfo(chart, coordinates.x, coordinates.y)

      // loop through elements
      data.elements.forEach(function(element) {
        var type = data.types[element.typeId]
        var lane = chart.config.lanes[element.lane]

        // check if point is inside element horizontally
        if (helpers.isInside(info.minutes, element.start, element.end)) {

          // check if point is inside element vertically
          var innerRadius = lane.start
          var outerRadius = lane.end

          if (info.distance > innerRadius && info.distance < outerRadius) {
            positionInElement = info.minutes-element.start
            hit = {
              elementId: element.id,
              type: 'middle',
              positionInElement: positionInElement
            }
          }
        }
      })
      
    }


    return hit
  }

  function hover (e, chart) {
    var coordinates = getCoordinates(e, chart)
    var hit = hitDetect(chart, coordinates)
    console.log(findIdentifier(e))
    if(Object.keys(hit).length > 0){
      chart.setHover(hit.elementId, hit.type)
    }else{
      chart.removeHovers()
    }

    // chart.redraw()
  }


  function drag (e, chart) {
    var identifier = findIdentifier(e)
    var dragElement = getActiveElement(chart, identifier)

    if (!dragElement) {
      return
    }

    var coordinates = getCoordinates(e, chart)
    var info = helpers.XYtoInfo(chart, coordinates.x, coordinates.y)
    var minutes = info.minutes
    var originElement = chart.data.elements.find(element => element.id == dragElement.elementId)

    if(dragElement.type == 'start' || dragElement.type == 'end'){
      originElement[dragElement.type] = snap(Math.round(minutes))
    }
    else if(dragElement.type == 'middle'){
      var duration = helpers.duration(originElement.start, originElement.end)
      var positionInElement = dragElement.positionInElement
      if(typeof positionInElement == 'undefined'){
        positionInElement = duration / 2
      }

      originElement.start = snap(helpers.limit(Math.round(minutes - positionInElement)))
      originElement.end = helpers.limit(originElement.start + duration)
    }

    originElement.duration = helpers.duration(originElement.start, originElement.end)

    // find lane
    if(dragElement.type == 'middle'){
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

      originElement.lane = theLane
    }
    
    console.log(originElement)
    chart.updateElement(originElement)

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
  }

  function unfocus (e) {
    // checks if click is on a part of the site that should make the
    // current selected elements be deselected

    var x, y
    var domElement

    x = e.clientX
    y = e.clientY

    var domElement = document.elementFromPoint(x, y)
  }

  function select (chart, id) {
    // notify core module:
    chart.setSelected(id)
  }

  function deselect (chart, element) {
    if (typeof element == 'undefined') {
      // deselect all
      chart.deselect()
      document.removeEventListener('touchmove', drag)
      document.removeEventListener('mousemove', drag)
    }
    // deselect one
    chart.deselect(element)
  }

  function findIdentifier (e) {
    if (e.type.search('mouse') >= 0) {
      return 'mouse'
    }else {
      return e.changedTouches[0].identifier
    }
  }

  function getActiveElement (chart, identifier) {
    var activeElements = chart.data.activeElements
    for (var i = 0; i < activeElements.length; i++) {
      if (activeElements[i].identifier == identifier) {
        return activeElements[i]
      }
    }
    return false
  }

  function up (e, chart) {
    var identifier = findIdentifier(e)

    // find the shit to remove
    chart.removeActive(identifier)
  }

  function snap (input) {
    var output = input

    if (settings.getValue('snap10')) {
      output = 10 * Math.round(input / 10)
    }else if (settings.getValue('snap5')) {
      output = 5 * Math.round(input / 5)
    }else {

      // hour
      if (input % 60 < 7)
        output = input - input % 60
      else if (input % 60 > 53)
        output = input + (60 - input % 60)

      // half hours
      else {
        input += 30

        if (input % 60 < 5)
          output = input - input % 60 - 30
        else if (input % 60 > 55)
          output = input + (60 - input % 60) - 30
      }
    }

    return output
  }
}

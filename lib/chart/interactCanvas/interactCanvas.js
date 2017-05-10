/*
*  interactCanvas
*
*  This module adds support for modifying a schedule
*  directly on the canvas with mouse or touch
*/

module.exports = function (Napchart) {
  var helpers = Napchart.helpers

  Napchart.on('initialize', function (chart) {
    if(!chart.config.interaction) return

    var canvas = chart.canvas

    canvas.addEventListener('mousemove', function(e) {
      hover(e, chart)
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
  })

  var mouseHover = {},
    activeElements = [],
    hoverDistance = 6,
    selectedOpacity = 1

  function down (e, chart) {
    e.stopPropagation()

    var canvas = e.target || e.srcElement
    var coordinates = getCoordinates(e, chart)
    var hit = {}

    hit = hitDetect(chart, coordinates)

    // return of no hit
    if (Object.keys(hit).length == 0) {
      deselect(chart)
      return
    }

    e.preventDefault()

    // set identifier
    if (typeof e.changedTouches != 'undefined') {
      hit.identifier = e.changedTouches[0].identifier
    }else {
      hit.identifier = 'mouse'
    }

    // deselect other elements if they are not being touched
    if (activeElements.length === 0) {
      deselect(chart)
    }

    activeElements.push(hit)

    if (typeof e.changedTouches != 'undefined') {
      document.addEventListener('touchmove', drag)
    }else {
      document.addEventListener('mousemove', function(e) {
        drag(e, chart)
      })
    }

    select(chart, hit.count)

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
    // name (core, nap, busy)
    // count (0, 1, 2 ..)
    // type (start, end, or middle)

    var hit = false
    var value, point, i, distance

    // hit detection of handles (will overwrite current mouseHover object
    // from draw if hovering a handle):
    // for (var name in data) {
    //   if (typeof barConfig[name].rangeHandles == 'undefined' || !barConfig[name].rangeHandles)
    //     continue

    //   for (i = 0; i < data[name].length; i++) {

    //     // if element is not selected, continue
    //     if (!chart.checkElementState('selected', name, i))
    //       continue

    //     for (s = 0; s < 2; s++) {
    //       value = data[name][i][['start', 'end'][s]]
    //       point = helpers.minutesToXY(value, barConfig[name].outerRadius * draw.drawRatio)

    //       distance = helpers.distance(point.x, point.y, coordinates.x, coordinates.y)
    //       if (distance < hoverDistance * draw.drawRatio) {
    //         if (typeof hit.distance == 'undefined' || distance < hit.distance) {
    //           // overwrite current hit object
    //           hit = {
    //             name: name,
    //             count: i,
    //             type: ['start', 'end'][s],
    //             distance: distance
    //           }
    //         }
    //       }
    //     }
    //   }
    // }

    // if no handle is hit, check for middle hit

    if (Object.keys(hit).length == 0) {

      var info = helpers.XYtoInfo(chart, coordinates.x, coordinates.y)

      // loop through elements
      data.elements.forEach(function(element, index) {

        // check if point is inside element horizontally
        if (helpers.isInside(info.minutes, element.start, element.end)) {

          // check if point is inside element vertically
          var innerRadius = element.type.lane.start
          var outerRadius = element.type.lane.end

          if (info.distance > innerRadius && info.distance < outerRadius) {
            positionInElement = info.minutes-element.start
            hit = {
              element: element,
              count: index,
              type: 'whole',
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

    if(hit){
      chart.setElementState(hit.count, 'hover')
    }else{
      chart.removeElementStates()
    }

    chart.redraw()
  }


  function drag (e, chart) {
    var identifier = findIdentifier(e)

    var dragElement = getActiveElement(identifier)

    if (!dragElement) {
      return
    }

    // expose minutes variable to getMoveValues() function
    var coordinates = getCoordinates(e, chart)
    var minutes = helpers.XYtoInfo(chart, coordinates.x, coordinates.y).minutes
    var element = dragElement.element

    var positionInElement = dragElement.positionInElement
    var duration = helpers.range(element.start, element.end)

    element.start = helpers.limit(minutes - positionInElement)
    element.end = helpers.limit(element.start + duration)

    chart.redraw()
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

  function select (chart, count) {
    // notify core module:
    chart.setSelected(count)
  }

  function deselect (chart, count) {
    if (typeof count == 'undefined') {
      // deselect all
      chart.deselect()
      document.removeEventListener('touchmove', drag)
      document.removeEventListener('mousemove', drag)
    }
    // deselect one
    chart.deselect(count)
  }

  function findIdentifier (e) {
    if (e.type.search('mouse') >= 0) {
      return 'mouse'
    }else {
      return e.changedTouches[0].identifier
    }
  }

  function getActiveElement (identifier) {
    for (var i = 0; i < activeElements.length; i++) {
      if (activeElements[i].identifier == identifier) {
        return activeElements[i]
      }
    }
    return false
  }

  function removeActiveElement (identifier) {
    for (var i = 0; i < activeElements.length; i++) {
      if (activeElements[i].identifier == identifier) {
        activeElements.splice(i, 1)
      }
    }
  }

  function up (e, chart) {
    var identifier = findIdentifier(e)
    var element = getActiveElement(identifier)

    if (activeElements.length != 0) {
      // chartHistory.add(napchartCore.getSchedule(), 'moved ' + element.name + ' ' + (element.count + 1))
    }

    // find the shit to remove
    removeActiveElement(identifier)

    chart.redraw
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

  function checkState (element, name, count, type) {
    // checks if
    function check (element) {
      if (name == element.name && count == element.count) {
        if (typeof type == 'undefined' || type == element.type) {
          return true
        }
      }
    }

    if (typeof element.elements != 'undefined') {
      // there are more than one element
      return element.elements.some(check)
    }else {
      // one element
      return check(element)
    }
  }
}

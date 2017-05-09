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

    // canvas.addEventListener('mousemove', hover)
    canvas.addEventListener('mousedown', function(e) {
      down(e, chart)
    })
    // canvas.addEventListener('touchstart', down)
    // document.addEventListener('mouseup', up)
    // document.addEventListener('touchend', up)
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

    console.log('hit', hit)

    // return of no hit
    if (Object.keys(hit).length == 0) {
      deselect()
      return
    }

    e.preventDefault()

    return 

    // set identifier
    if (typeof e.changedTouches != 'undefined') {
      hit.identifier = e.changedTouches[0].identifier
    }else {
      hit.identifier = 'mouse'
    }

    hit.canvas = canvas

    // deselect other elements if they are not being touched
    if (activeElements.length === 0) {
      deselect()
    }

    activeElements.push(hit)

    if (typeof e.changedTouches != 'undefined') {
      document.addEventListener('touchmove', drag)
    }else {
      document.addEventListener('mousemove', drag)
    }

    select(hit.name, hit.count)

    drag(e) // to  make sure the handles positions to the cursor even before movement

    helpers.requestAnimFrame.call(window, draw.drawUpdate)
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
      x: mouseX - width / 2,
      y: mouseY - height / 2
    }
  }

  function hitDetect (chart, coordinates) {
    var canvas = chart.canvas
    var data = chart.data
    var barConfig = chart.config.bars

    // will return:
    // name (core, nap, busy)
    // count (0, 1, 2 ..)
    // type (start, end, or middle)

    var hit = {}
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
      var minutes, distanceToCenter
      var start, end
      var outerRadius, innerRadius

      var positionInElement

      minutes = helpers.XYtoMinutes(chart, coordinates.x, coordinates.y)
      console.log(minutes)
      distanceToCenter = helpers.distance(coordinates.x, coordinates.y, 0, 0)

      // loop through elements
      data.elements.forEach(function(element, index) {
        // check if point is inside element horizontally
        start = element.start
        end = element.end

        if (helpers.isInside(minutes, start, end)) {

          // check if point is inside element vertically
          innerRadius = element.type.lane.start
          outerRadius = element.type.lane.end
          if (distanceToCenter > innerRadius && distanceToCenter < outerRadius) {
            positionInElement = minutes-start
            hit = {
              count: i,
              type: 'whole',
              positionInElement: positionInElement
            }
          }
        }
      })
      
    }

    return hit
  }

  function hover (e) {
    var canvas = napchartCore.getCanvas(),
      coordinates = getCoordinates(e, canvas),
      data = napchartCore.getSchedule(),
      barConfig = draw.getBarConfig()

    helpers.requestAnimFrame.call(window, draw.drawUpdate)

    var hit = hitDetect(coordinates)

    mouseHover = hit
  }


  function drag (e) {
    var identifier
    identifier = findIdentifier(e)

    var dragElement, name, count, element, coordinates, minutes

    // newValues is an object that will replace the existing one with new values
    var newValues = {}, positionInElement, duration, start, end

    dragElement = getActiveElement(identifier)

    if (!dragElement) {
      return
    }

    // expose minutes variable to getMoveValues() function
    coordinates = getCoordinates(e, dragElement.canvas)
    minutes = helpers.XYtoMinutes(chart, coordinates.x, coordinates.y)

    if (typeof dragElement.elements != 'undefined') {
      // many elements linked

      var newElements = []
      var master = {}
      dragElement.elements.some(function (element) {
        getMoveValues(element, function (name, count, newValues) {
          // all this fuzz because we need to make the dragging snappable
          // and the snapping should only listen to the element you are clicking on
          // and all other have to follow

          if (name == dragElement.master.name && count == dragElement.master.count) {
            master = newValues
          }
          newElements.push({
            name: name,
            count: count,
            values: newValues
          })
        })
      })

      // run through newElements array and snap values

      var masterStart = master.start
      // find out how much the snap function did
      var shift = snap(masterStart) - masterStart

      // do the same impact to the other elements
      for (var i = 0; i < newElements.length; i++) {
        newElements[i].values.start = helpers.calc(newElements[i].values.start, shift)
        newElements[i].values.end = helpers.calc(newElements[i].values.end, shift)
      }

      function modify (newValueElement) {
        napchartCore.modifyElement(newValueElement.name, newValueElement.count, newValueElement.values)
      }

      // send all the shiny new elements to the core for modification :-)
      newElements.forEach(modify)
    }else {
      var snapAll = true
      getMoveValues(dragElement, function (name, count, newValues) {
        napchartCore.modifyElement(name, count, newValues)
      })
    }

    function getMoveValues (dragElement, callback) {
      name = dragElement.name
      count = dragElement.count
      element = napchartCore.returnElement(name, count)

      if (dragElement.type == 'start') {
        start = snap(minutes)
        newValues = {start: start}
      }
      else if (dragElement.type == 'end') {
        end = snap(minutes)
        newValues = {end: end}
      }
      else if (dragElement.type == 'whole') {
        positionInElement = dragElement.positionInElement
        duration = helpers.range(element.start, element.end)
        start = helpers.calc(minutes, -positionInElement)
        if (typeof snapAll != 'undefined')
          start = snap(start)
        end = helpers.calc(start, duration)
        newValues = {start: start,end: end}
      }

      callback(name, count, newValues)
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

  function select (name, count) {
    if (settings.getValue('moveSim') && name != 'busy') {
      // select all
      var data = napchartCore.getSchedule()

      for (var name in data) {
        if (name == 'busy')
          continue

        for (var i = 0; i < data[name].length; i++) {
          napchartCore.setSelected(name, i)
        }
      }
    }
    // notify core module:
    napchartCore.setSelected(name, count)
  }

  function deselect (name, count) {
    // if (typeof name == 'undefined') {
    //   // deselect all
    //   napchartCore.deselect()
    //   document.removeEventListener('touchmove', drag)
    //   document.removeEventListener('mousemove', drag)
    // }
    // // deselect one
    // napchartCore.deselect(name, count)
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

  function up (e) {
    var identifier = findIdentifier(e)
    var element = getActiveElement(identifier)

    if (activeElements.length != 0) {
      chartHistory.add(napchartCore.getSchedule(), 'moved ' + element.name + ' ' + (element.count + 1))
    }

    // find the shit to remove
    removeActiveElement(identifier)

    helpers.requestAnimFrame.call(window, draw.drawUpdate)
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

/*
*
* Shape module
*
*/

var shapes = require('./shapes')
var calculateShape = require('./calculateShape')
var animateShape = require('./animateShape')

module.exports = function (Napchart) {
  var helpers = Napchart.helpers
  var currentShape

  Napchart.shape = {
    initShape: function(chart) {
        setShape(chart, chart.data.shape)
    },
    changeShape: function(chart) {
      changeShape(chart)
    }
  }

  // add some extra helpers
  var shapeHelpers = require('./shapeHelpers')(Napchart)

  function setShape(chart, shape) {
    if(typeof shape == 'string'){
      currentShape = shape
      shape = shapes[shape]
    }
    chart.shape = calculateShape(chart, shape)
  }

  function changeShape(chart) {
    var oldShape = helpers.clone(shapes[chart.oldShape])
    var newShape = helpers.clone(shapes[chart.data.shape])

    animateShape(chart, oldShape, newShape, function(animatedShape, finished) {
      if(finished){
        // to clean out all garbage from that animation function
        var shape = shapes[chart.data.shape]
      } else {
        var shape = animatedShape
      }
      chart.shape = calculateShape(chart, JSON.parse(JSON.stringify(shape)))
      chart.needFullRedraw = true
      chart.draw()
    })
  }


}

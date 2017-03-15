(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Napchart = require('./')

var mynapchart = new Napchart(document.getElementById('canvas').getContext('2d'))

mynapchart.setData({
  nap: [],
  core: [{start: 1410, end: 480, state:'active'}, {start: 1000, end: 1020}],
  busy: [{start: 700, end: 900}]
})

console.log(mynapchart)

window.lol = mynapchart
},{"./":12}],2:[function(require,module,exports){
/*
*  Core module of Napchart
*
*/

module.exports = function (Napchart) {
  var helpers = Napchart.helpers
  var modules = []

  Napchart.prototype.initialize = function (ctx, config) {
    var chart = this

    chart.ctx = ctx
    chart.canvas = ctx.canvas
    chart.width = chart.w = ctx.canvas.width
    chart.height = chart.h = ctx.canvas.height
    chart.ratio = chart.h / 100
    chart.config = initConfig(config)
    chart.data = {}

    scaleConfig(chart.config, chart.ratio)
    Napchart.initShape(chart)
    helpers.retinaScale(chart)
    Napchart.draw(this)
    console.log(modules)
    modules[0](chart)
  }

  Napchart.prototype.setData = function (data) {
    this.data = data
    console.log('setdata', this)
    Napchart.draw(this)
  }

  Napchart.addModule = function (f) {
    modules.push(f)
    console.log('setdata', this)
  }

  /**
   * Initializes the given config with global and Napchart default values.
   */
  function initConfig (config) {
    config = config || {}

    config = helpers.extend(Napchart.config, config)

    return config
  }

  function scaleConfig (config, ratio) {
    function scaleFn (base, value, key) {
      // body...
      // console.log(value)
      if (value > 1) {
        // value = 199
        base[key] = value * ratio
      // console.log(key, value)
      }
    }
    helpers.deepEach(config, scaleFn)
    return config
  }
}

},{}],3:[function(require,module,exports){
module.exports = function (Napchart) {
  Napchart.config = {
    face: { // define how the background clock should be drawn
      circles: [
        {radius: 34},
        {radius: 24}
      ],
      clearCircle: 20,
      blurCircle: {
        radius: 29,
        opacity: 0.8
      },
      stroke: 1,
      strokeColor: '#777777',
      impStrokeColor: '#262626',
      clockNumbers: {
        radius: 44,
        color: '#262626'
      },
      between: {
        strokeColor: '#d2d2d2',
        textColor: 'black',
        opacity: 0.5
      },
      timeLocation: 4 // how far away from the bar the time indicators should be
    },
    bars: {
      core: {
        stack: 0,
        color: '#c70e0e',
        innerRadius: 29,
        outerRadius: 40,
        stroke: {
          lineWidth: 1
        },
        rangeHandles: true,
        opacity: 1,
        hoverOpacity: 0.5,
        activeOpacity: 0.5,
        selected: {
          strokeColor: '#FF6363',
          lineWidth: 1,
          expand: 0.5
        }
      },
      nap: {
        stack: 1,
        color: '#c70e0e',
        innerRadius: 29,
        outerRadius: 40,
        stroke: {
          lineWidth: 2
        },
        opacity: 0.6,
        hoverOpacity: 0.5,
        activeOpacity: 0.5,
        selected: {
          strokeColor: 'grey',
          lineWidth: 1,
          expand: 0.5
        }
      },
      busy: {
        stack: 2,
        color: '#1f1f1f',
        innerRadius: 29,
        outerRadius: 36,
        stroke: {
          lineWidth: 2
        },
        rangeHandles: true,
        opacity: 0.6,
        hoverOpacity: 0.5,
        activeOpacity: 0.5,
        selected: {
          strokeColor: '#FF6363',
          lineWidth: 1,
          expand: 0.5
        }
      },
      general: {
        textSize: 4,
        color: 'black'
      }
    }
  }
}
// var Config = {}
// Config.barConfig = {

// }

// 	Config.darkBarConfig = { //when darkmode is on
// 		core:{
// 			color:'#733134',
// 			opacity:0.7,
// 			hoverOpacity:0.7,
// 			activeOpacity:0.7,
// 			selected:{
// 				strokeColor:'#FF6363',
// 				lineWidth:1,
// 				expand:0.5
// 			}
// 		},
// 		nap:{
// 			color:'#c70e0e',
// 			opacity:0.7,
// 			hoverOpacity:0.7,
// 			activeOpacity:0.7,
// 			selected:{
// 				strokeColor:'#FF6363',
// 				lineWidth:1,
// 				expand:0.5
// 			}
// 		},
// 		busy:{
// 			color:'#9E9E9E',
// 			opacity:0.6,
// 			hoverOpacity:0.5,
// 			activeOpacity:0.5,
// 			selected:{
// 				strokeColor:'#FF6363',
// 				lineWidth:1,
// 				expand:0.5
// 			}
// 		},
// 		general:{
// 			color:'white'
// 		}
// 	}

// 	Config.darkClockConfig = {
// 		background:'#373737',
// 		circles:[
// 		{radius:36},
// 		{radius:29},
// 		{radius:20},
// 		{radius:2}
// 		],
// 		clearCircle: 20,
// 		blurCircle:{
// 			radius:29,
// 			opacity:0.5
// 		},
// 		stroke:0.32,
// 		strokeColor:'#525252',
// 		impStrokeColor:'EDEDED',
// 		clockNumbers:{
// 			radius:44,
// 			color:'#BFBFBF'
// 		},
// 		between:{
// 			strokeColor: '#A5A5A5',
// 			textColor: 'white',
// 			opacity: 0.9,
// 		},
// 		timeLocation:4, //how far away from the bar the time indicators should be
// 	}

},{}],4:[function(require,module,exports){


module.exports = function (Napchart) {
  var helpers = Napchart.helpers;


  helpers.strokeSegment = function(chart, start, end, config){
  	var ctx = chart.ctx
  	ctx.save()
  	ctx.strokeStyle = config.color
  	ctx.lineWidth = config.stroke.lineWidth
  	ctx.lineJoin = 'mittel'

  	Napchart.shape.createSegment(chart, config.outerRadius, config.innerRadius, start, end);

  	ctx.stroke();
  	ctx.restore()
  }

}
},{}],5:[function(require,module,exports){
module.exports = function (chart, Napchart) {
  var ctx = chart.ctx
  var data = chart.data
  var canvas = ctx.canvas
  var barConfig = chart.config.bars
  var helpers = Napchart.helpers

  helpers.eachElement(chart, function(element, config){
    var ctx = chart.ctx
    ctx.save()
    ctx.fillStyle = config.color
    
    switch(element.state){
      case 'active':
        ctx.globalAlpha = config.activeOpacity
        break
      case 'hover':
        ctx.globalAlpha = config.hoverOpacity
        break
      default:
        ctx.globalAlpha = config.opacity
    }

    Napchart.shape.createSegment(chart, config.outerRadius, config.innerRadius, element.start, element.end);

    ctx.fill()
    ctx.restore()
  })


  helpers.eachElement(chart, function(element, config){
    helpers.strokeSegment(chart, element.start, element.end, config)
  });

  // for (var name in data) {
  //   var opacity = barConfig[name].opacity,
  //     hoverOpacity = barConfig[name].hoverOpacity,
  //     activeOpacity = barConfig[name].activeOpacity

  //     // if(interactCanvas.isActive(name,count,'whole') || napchartCore.isSelected(name,count)){
  //     // 	ctx.globalAlpha = activeOpacity
  //     // }

  //     // else if(interactCanvas.isActive(name,count) || interactCanvas.isHover(name,count,'whole')){
  //     // 	ctx.globalAlpha=hoverOpacity
  //     // }

  //     // else{
  //     ctx.globalAlpha=opacity
  //     // }
  //   }
  // }
}


    // var pcanvas = document.createElement('canvas');
    // pcanvas.height = 40;
    // pcanvas.width = 20;
    // pctx = pcanvas.getContext('2d');
    // pctx.fillStyle = config.color;
    // pctx.arc(5, 5, 5, 0, Math.PI*2)
    // pctx.arc(15, 25, 5, 0, Math.PI*2)
    // pctx.fill();
    // var pattern = ctx.createPattern(pcanvas, 'repeat')
},{}],6:[function(require,module,exports){
module.exports = function (Napchart) {
  Napchart.draw = function (chart) {
    chart.circle = function (radius) {
      var ctx = chart.ctx
      ctx.strokeStyle = chart.config.face.strokeColor
      ctx.lineWidth = chart.config.face.stroke

      ctx.beginPath()
      Napchart.shape.createCurve(chart, radius, 0, 1440)
      ctx.stroke()
    }

    require('./face/circles')(chart)
    require('./face/lines')(chart)
    require('./elements/circle')(chart)

    require('./content/bars')(chart, Napchart)
  }
}

},{"./content/bars":5,"./elements/circle":7,"./face/circles":8,"./face/lines":9}],7:[function(require,module,exports){
module.exports = function (radius) {
  // var ctx = chart.ctx
  // ctx.strokeStyle = chart.config.face.strokeColor
  // ctx.lineWidth = chart.config.face.stroke

  // ctx.beginPath()
  // // Napchart.shape.createCurve(chart, radius, 0, 1440)
  // ctx.stroke()
}

},{}],8:[function(require,module,exports){
module.exports = function (chart) {
  var circles = chart.config.face.circles

  for (i = 0; i < circles.length; i++) {
    chart.circle(circles[i].radius)
  }

// for (var i = 0; i < 24; i++) {
// 	var minutes = i*1440/24
// 	Napchart.draw.elements.line(chart, minutes, 0, circles[0].radius)
// }
}

},{}],9:[function(require,module,exports){
module.exports = function (chart) {
  // var ctx = chart.ctx
  // var config = Napchart.config
  // var helpers = Napchart.helpers

  // var radius=200
  // ctx.save()
  // ctx.strokeStyle = config.face.strokeColor
  // ctx.lineWidth = config.face.stroke *5
  // ctx.beginPath()
  // // ctx.fillRect(0, 0, 50, 50)
  // ctx.translate(chart.w/2,chart.h/2)
  // for(var i=0;i<12;i++){
  // 	var c=helpers.minutesToXY(i*60,radius)
  // 	ctx.moveTo(c.x,c.y)
  // 	c=helpers.minutesToXY(i*60+720,radius)
  // 	ctx.lineTo(c.x,c.y)
  // }
  // ctx.stroke()

  // ctx.beginPath()
  // ctx.strokeStyle = config.face.impStrokeColor

  // c=helpers.minutesToXY(0,radius)
  // ctx.moveTo(c.x,c.y)
  // c=helpers.minutesToXY(720,radius)
  // ctx.lineTo(c.x,c.y)
  // c=helpers.minutesToXY(240,radius)
  // ctx.moveTo(c.x,c.y)
  // c=helpers.minutesToXY(960,radius)
  // ctx.lineTo(c.x,c.y)
  // c=helpers.minutesToXY(480,radius)
  // ctx.moveTo(c.x,c.y)
  // c=helpers.minutesToXY(1200,radius)
  // ctx.lineTo(c.x,c.y)
  // ctx.closePath()
  // ctx.stroke()
  // ctx.restore()
}

},{}],10:[function(require,module,exports){
/*
*  Fancy module that does shit
*/

module.exports = function (Napchart) {
	Napchart.addModule(function(chart) {

		document.getElementById("canvas").addEventListener("click", function() {
			// console.log(Napchart.prototype)
			chart.setData({
			  nap: [],
			  core: [{start: 1310, end: 180, state:'active'}, {start: 500, end: 1020}],
			  busy: [{start: 700, end: 900}]
			})
		});

	})
}
},{}],11:[function(require,module,exports){
/* global window: false */
/* global document: false */
'use strict'

module.exports = function (Chart) {
  // Global Chart helpers object for utility methods and classes
  var helpers = Chart.helpers = {}
  helpers.range = function (start, end) {
    if (end < start) {
      return 1440 - start + end
    } else {
      return end - start
    }
  }

  helpers.getProgressBetweenTwoValues = function (pos, start, end) {
    return helpers.range(start, pos) / helpers.range(start, end)
  }
  helpers.pointIsInside = function (point, start, end) {
    if (end > start) {
      if (point < end && point > start) { return true }
    } else if (start > end) {
      if (point > start || point < end) { return true }
    }
    if (point == start || point == end) {
      return true
    }
    return false
  }

  helpers.isInside = helpers.pointIsInside
  helpers.minutesToXY = function (minutes, radius) {
    var o = {}
    o.y = Math.sin((minutes / 1440) * (Math.PI * 2) - (Math.PI / 2)) * radius
    o.x = Math.cos((minutes / 1440) * (Math.PI * 2) - (Math.PI / 2)) * radius
    return o
  }

  helpers.eachElement = function (chart, callback) {
    var data = chart.data
    var config

    for (var name in data) {
      config = chart.config.bars[name]

      for (var i = 0; i < data[name].length; i++) {
        callback(data[name][i], config)
      }
    }
  }

  helpers.each = function (loopable, callback, self, reverse) {
    // Check to see if null or undefined firstly.
    var i, len
    if (helpers.isArray(loopable)) {
      len = loopable.length
      if (reverse) {
        for (i = len - 1; i >= 0; i--) {
          callback.call(self, loopable[i], i)
        }
      } else {
        for (i = 0; i < len; i++) {
          callback.call(self, loopable[i], i)
        }
      }
    } else if (typeof loopable === 'object') {
      var keys = Object.keys(loopable)
      len = keys.length
      for (i = 0; i < len; i++) {
        callback.call(self, loopable[keys[i]], keys[i])
      }
    }
  }

  helpers.deepEach = function (loopable, callback) {
    // Check to see if null or undefined firstly.
    var i, len
    function search (loopable, cb) {
      if (helpers.isArray(loopable)) {
        for (var i = 0; i < loopable.length; i++) {
          cb(loopable, loopable[i], i)
        }
      } else if (typeof loopable === 'object') {
        var keys = Object.keys(loopable)
        for (var i = 0; i < keys.length; i++) {
          cb(loopable, loopable[keys[i]], keys[i])
        }
      }
    }

    function found (base, value, key) {
      if (helpers.isArray(value) || typeof value === 'object') {
        search(value, found)
      } else {
        callback(base, value, key)
      }
    }

    search(loopable, found)
  }
  helpers.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj))
  }
  helpers.extend = function (base) {
    var setFn = function (value, key) {
      base[key] = value
    }
    for (var i = 1, ilen = arguments.length; i < ilen; i++) {
      helpers.each(arguments[i], setFn)
    }
    return base
  }
  // Need a special merge function to chart configs since they are now grouped
  helpers.configMerge = function (_base) {
    var base = helpers.clone(_base)
    helpers.each(Array.prototype.slice.call(arguments, 1), function (extension) {
      helpers.each(extension, function (value, key) {
        var baseHasProperty = base.hasOwnProperty(key)
        var baseVal = baseHasProperty ? base[key] : {}

        if (key === 'scales') {
          // Scale config merging is complex. Add our own function here for that
          base[key] = helpers.scaleMerge(baseVal, value)
        } else if (key === 'scale') {
          // Used in polar area & radar charts since there is only one scale
          base[key] = helpers.configMerge(baseVal, Chart.scaleService.getScaleDefaults(value.type), value)
        } else if (baseHasProperty &&
          typeof baseVal === 'object' &&
          !helpers.isArray(baseVal) &&
          baseVal !== null &&
          typeof value === 'object' &&
          !helpers.isArray(value)) {
          // If we are overwriting an object with an object, do a merge of the properties.
          base[key] = helpers.configMerge(baseVal, value)
        } else {
          // can just overwrite the value in this case
          base[key] = value
        }
      })
    })

    return base
  }
  helpers.scaleMerge = function (_base, extension) {
    var base = helpers.clone(_base)

    helpers.each(extension, function (value, key) {
      if (key === 'xAxes' || key === 'yAxes') {
        // These properties are arrays of items
        if (base.hasOwnProperty(key)) {
          helpers.each(value, function (valueObj, index) {
            var axisType = helpers.getValueOrDefault(valueObj.type, key === 'xAxes' ? 'category' : 'linear')
            var axisDefaults = Chart.scaleService.getScaleDefaults(axisType)
            if (index >= base[key].length || !base[key][index].type) {
              base[key].push(helpers.configMerge(axisDefaults, valueObj))
            } else if (valueObj.type && valueObj.type !== base[key][index].type) {
              // Type changed. Bring in the new defaults before we bring in valueObj so that valueObj can override the correct scale defaults
              base[key][index] = helpers.configMerge(base[key][index], axisDefaults, valueObj)
            } else {
              // Type is the same
              base[key][index] = helpers.configMerge(base[key][index], valueObj)
            }
          })
        } else {
          base[key] = []
          helpers.each(value, function (valueObj) {
            var axisType = helpers.getValueOrDefault(valueObj.type, key === 'xAxes' ? 'category' : 'linear')
            base[key].push(helpers.configMerge(Chart.scaleService.getScaleDefaults(axisType), valueObj))
          })
        }
      } else if (base.hasOwnProperty(key) && typeof base[key] === 'object' && base[key] !== null && typeof value === 'object') {
        // If we are overwriting an object with an object, do a merge of the properties.
        base[key] = helpers.configMerge(base[key], value)
      } else {
        // can just overwrite the value in this case
        base[key] = value
      }
    })

    return base
  }
  helpers.getValueAtIndexOrDefault = function (value, index, defaultValue) {
    if (value === undefined || value === null) {
      return defaultValue
    }

    if (helpers.isArray(value)) {
      return index < value.length ? value[index] : defaultValue
    }

    return value
  }
  helpers.getValueOrDefault = function (value, defaultValue) {
    return value === undefined ? defaultValue : value
  }
  helpers.indexOf = Array.prototype.indexOf
    ? function (array, item) {
      return array.indexOf(item)
    }
    : function (array, item) {
      for (var i = 0, ilen = array.length; i < ilen; ++i) {
        if (array[i] === item) {
          return i
        }
      }
      return -1
    }
  helpers.where = function (collection, filterCallback) {
    if (helpers.isArray(collection) && Array.prototype.filter) {
      return collection.filter(filterCallback)
    }
    var filtered = []

    helpers.each(collection, function (item) {
      if (filterCallback(item)) {
        filtered.push(item)
      }
    })

    return filtered
  }
  helpers.findIndex = Array.prototype.findIndex
    ? function (array, callback, scope) {
      return array.findIndex(callback, scope)
    }
    : function (array, callback, scope) {
      scope = scope === undefined ? array : scope
      for (var i = 0, ilen = array.length; i < ilen; ++i) {
        if (callback.call(scope, array[i], i, array)) {
          return i
        }
      }
      return -1
    }
  helpers.findNextWhere = function (arrayToSearch, filterCallback, startIndex) {
    // Default to start of the array
    if (startIndex === undefined || startIndex === null) {
      startIndex = -1
    }
    for (var i = startIndex + 1; i < arrayToSearch.length; i++) {
      var currentItem = arrayToSearch[i]
      if (filterCallback(currentItem)) {
        return currentItem
      }
    }
  }
  helpers.findPreviousWhere = function (arrayToSearch, filterCallback, startIndex) {
    // Default to end of the array
    if (startIndex === undefined || startIndex === null) {
      startIndex = arrayToSearch.length
    }
    for (var i = startIndex - 1; i >= 0; i--) {
      var currentItem = arrayToSearch[i]
      if (filterCallback(currentItem)) {
        return currentItem
      }
    }
  }
  helpers.inherits = function (extensions) {
    // Basic javascript inheritance based on the model created in Backbone.js
    var me = this
    var ChartElement = (extensions && extensions.hasOwnProperty('constructor')) ? extensions.constructor : function () {
      return me.apply(this, arguments)
    }

    var Surrogate = function () {
      this.constructor = ChartElement
    }
    Surrogate.prototype = me.prototype
    ChartElement.prototype = new Surrogate()

    ChartElement.extend = helpers.inherits

    if (extensions) {
      helpers.extend(ChartElement.prototype, extensions)
    }

    ChartElement.__super__ = me.prototype

    return ChartElement
  }
  helpers.noop = function () {}
  helpers.uid = (function () {
    var id = 0
    return function () {
      return id++
    }
  }())
  // -- Math methods
  helpers.isNumber = function (n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
  }
  helpers.almostEquals = function (x, y, epsilon) {
    return Math.abs(x - y) < epsilon
  }
  helpers.almostWhole = function (x, epsilon) {
    var rounded = Math.round(x)
    return (((rounded - epsilon) < x) && ((rounded + epsilon) > x))
  }
  helpers.max = function (array) {
    return array.reduce(function (max, value) {
      if (!isNaN(value)) {
        return Math.max(max, value)
      }
      return max
    }, Number.NEGATIVE_INFINITY)
  }
  helpers.min = function (array) {
    return array.reduce(function (min, value) {
      if (!isNaN(value)) {
        return Math.min(min, value)
      }
      return min
    }, Number.POSITIVE_INFINITY)
  }
  helpers.sign = Math.sign
    ? function (x) {
      return Math.sign(x)
    }
    : function (x) {
      x = +x // convert to a number
      if (x === 0 || isNaN(x)) {
        return x
      }
      return x > 0 ? 1 : -1
    }
  helpers.log10 = Math.log10
    ? function (x) {
      return Math.log10(x)
    }
    : function (x) {
      return Math.log(x) / Math.LN10
    }
  helpers.toRadians = function (degrees) {
    return degrees * (Math.PI / 180)
  }
  helpers.toDegrees = function (radians) {
    return radians * (180 / Math.PI)
  }
  // Gets the angle from vertical upright to the point about a centre.
  helpers.getAngleFromPoint = function (centrePoint, anglePoint) {
    var distanceFromXCenter = anglePoint.x - centrePoint.x,
      distanceFromYCenter = anglePoint.y - centrePoint.y,
      radialDistanceFromCenter = Math.sqrt(distanceFromXCenter * distanceFromXCenter + distanceFromYCenter * distanceFromYCenter)

    var angle = Math.atan2(distanceFromYCenter, distanceFromXCenter)

    if (angle < (-0.5 * Math.PI)) {
      angle += 2.0 * Math.PI // make sure the returned angle is in the range of (-PI/2, 3PI/2]
    }

    return {
      angle: angle,
      distance: radialDistanceFromCenter
    }
  }
  helpers.distanceBetweenPoints = function (pt1, pt2) {
    return Math.sqrt(Math.pow(pt2.x - pt1.x, 2) + Math.pow(pt2.y - pt1.y, 2))
  }
  helpers.aliasPixel = function (pixelWidth) {
    return (pixelWidth % 2 === 0) ? 0 : 0.5
  }
  helpers.splineCurve = function (firstPoint, middlePoint, afterPoint, t) {
    // Props to Rob Spencer at scaled innovation for his post on splining between points
    // http://scaledinnovation.com/analytics/splines/aboutSplines.html

    // This function must also respect "skipped" points

    var previous = firstPoint.skip ? middlePoint : firstPoint,
      current = middlePoint,
      next = afterPoint.skip ? middlePoint : afterPoint

    var d01 = Math.sqrt(Math.pow(current.x - previous.x, 2) + Math.pow(current.y - previous.y, 2))
    var d12 = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.y - current.y, 2))

    var s01 = d01 / (d01 + d12)
    var s12 = d12 / (d01 + d12)

    // If all points are the same, s01 & s02 will be inf
    s01 = isNaN(s01) ? 0 : s01
    s12 = isNaN(s12) ? 0 : s12

    var fa = t * s01 // scaling factor for triangle Ta
    var fb = t * s12

    return {
      previous: {
        x: current.x - fa * (next.x - previous.x),
        y: current.y - fa * (next.y - previous.y)
      },
      next: {
        x: current.x + fb * (next.x - previous.x),
        y: current.y + fb * (next.y - previous.y)
      }
    }
  }
  helpers.EPSILON = Number.EPSILON || 1e-14
  helpers.splineCurveMonotone = function (points) {
    // This function calculates Bézier control points in a similar way than |splineCurve|,
    // but preserves monotonicity of the provided data and ensures no local extremums are added
    // between the dataset discrete points due to the interpolation.
    // See : https://en.wikipedia.org/wiki/Monotone_cubic_interpolation

    var pointsWithTangents = (points || []).map(function (point) {
      return {
        model: point._model,
        deltaK: 0,
        mK: 0
      }
    })

    // Calculate slopes (deltaK) and initialize tangents (mK)
    var pointsLen = pointsWithTangents.length
    var i, pointBefore, pointCurrent, pointAfter
    for (i = 0; i < pointsLen; ++i) {
      pointCurrent = pointsWithTangents[i]
      if (pointCurrent.model.skip) {
        continue
      }

      pointBefore = i > 0 ? pointsWithTangents[i - 1] : null
      pointAfter = i < pointsLen - 1 ? pointsWithTangents[i + 1] : null
      if (pointAfter && !pointAfter.model.skip) {
        var slopeDeltaX = (pointAfter.model.x - pointCurrent.model.x)

        // In the case of two points that appear at the same x pixel, slopeDeltaX is 0
        pointCurrent.deltaK = slopeDeltaX !== 0 ? (pointAfter.model.y - pointCurrent.model.y) / slopeDeltaX : 0
      }

      if (!pointBefore || pointBefore.model.skip) {
        pointCurrent.mK = pointCurrent.deltaK
      } else if (!pointAfter || pointAfter.model.skip) {
        pointCurrent.mK = pointBefore.deltaK
      } else if (this.sign(pointBefore.deltaK) !== this.sign(pointCurrent.deltaK)) {
        pointCurrent.mK = 0
      } else {
        pointCurrent.mK = (pointBefore.deltaK + pointCurrent.deltaK) / 2
      }
    }

    // Adjust tangents to ensure monotonic properties
    var alphaK, betaK, tauK, squaredMagnitude
    for (i = 0; i < pointsLen - 1; ++i) {
      pointCurrent = pointsWithTangents[i]
      pointAfter = pointsWithTangents[i + 1]
      if (pointCurrent.model.skip || pointAfter.model.skip) {
        continue
      }

      if (helpers.almostEquals(pointCurrent.deltaK, 0, this.EPSILON)) {
        pointCurrent.mK = pointAfter.mK = 0
        continue
      }

      alphaK = pointCurrent.mK / pointCurrent.deltaK
      betaK = pointAfter.mK / pointCurrent.deltaK
      squaredMagnitude = Math.pow(alphaK, 2) + Math.pow(betaK, 2)
      if (squaredMagnitude <= 9) {
        continue
      }

      tauK = 3 / Math.sqrt(squaredMagnitude)
      pointCurrent.mK = alphaK * tauK * pointCurrent.deltaK
      pointAfter.mK = betaK * tauK * pointCurrent.deltaK
    }

    // Compute control points
    var deltaX
    for (i = 0; i < pointsLen; ++i) {
      pointCurrent = pointsWithTangents[i]
      if (pointCurrent.model.skip) {
        continue
      }

      pointBefore = i > 0 ? pointsWithTangents[i - 1] : null
      pointAfter = i < pointsLen - 1 ? pointsWithTangents[i + 1] : null
      if (pointBefore && !pointBefore.model.skip) {
        deltaX = (pointCurrent.model.x - pointBefore.model.x) / 3
        pointCurrent.model.controlPointPreviousX = pointCurrent.model.x - deltaX
        pointCurrent.model.controlPointPreviousY = pointCurrent.model.y - deltaX * pointCurrent.mK
      }
      if (pointAfter && !pointAfter.model.skip) {
        deltaX = (pointAfter.model.x - pointCurrent.model.x) / 3
        pointCurrent.model.controlPointNextX = pointCurrent.model.x + deltaX
        pointCurrent.model.controlPointNextY = pointCurrent.model.y + deltaX * pointCurrent.mK
      }
    }
  }
  helpers.nextItem = function (collection, index, loop) {
    if (loop) {
      return index >= collection.length - 1 ? collection[0] : collection[index + 1]
    }
    return index >= collection.length - 1 ? collection[collection.length - 1] : collection[index + 1]
  }
  helpers.previousItem = function (collection, index, loop) {
    if (loop) {
      return index <= 0 ? collection[collection.length - 1] : collection[index - 1]
    }
    return index <= 0 ? collection[0] : collection[index - 1]
  }
  // Implementation of the nice number algorithm used in determining where axis labels will go
  helpers.niceNum = function (range, round) {
    var exponent = Math.floor(helpers.log10(range))
    var fraction = range / Math.pow(10, exponent)
    var niceFraction

    if (round) {
      if (fraction < 1.5) {
        niceFraction = 1
      } else if (fraction < 3) {
        niceFraction = 2
      } else if (fraction < 7) {
        niceFraction = 5
      } else {
        niceFraction = 10
      }
    } else if (fraction <= 1.0) {
      niceFraction = 1
    } else if (fraction <= 2) {
      niceFraction = 2
    } else if (fraction <= 5) {
      niceFraction = 5
    } else {
      niceFraction = 10
    }

    return niceFraction * Math.pow(10, exponent)
  }
  // Easing functions adapted from Robert Penner's easing equations
  // http://www.robertpenner.com/easing/
  var easingEffects = helpers.easingEffects = {
    linear: function (t) {
      return t
    },
    easeInQuad: function (t) {
      return t * t
    },
    easeOutQuad: function (t) {
      return -1 * t * (t - 2)
    },
    easeInOutQuad: function (t) {
      if ((t /= 1 / 2) < 1) {
        return 1 / 2 * t * t
      }
      return -1 / 2 * ((--t) * (t - 2) - 1)
    },
    easeInCubic: function (t) {
      return t * t * t
    },
    easeOutCubic: function (t) {
      return 1 * ((t = t / 1 - 1) * t * t + 1)
    },
    easeInOutCubic: function (t) {
      if ((t /= 1 / 2) < 1) {
        return 1 / 2 * t * t * t
      }
      return 1 / 2 * ((t -= 2) * t * t + 2)
    },
    easeInQuart: function (t) {
      return t * t * t * t
    },
    easeOutQuart: function (t) {
      return -1 * ((t = t / 1 - 1) * t * t * t - 1)
    },
    easeInOutQuart: function (t) {
      if ((t /= 1 / 2) < 1) {
        return 1 / 2 * t * t * t * t
      }
      return -1 / 2 * ((t -= 2) * t * t * t - 2)
    },
    easeInQuint: function (t) {
      return 1 * (t /= 1) * t * t * t * t
    },
    easeOutQuint: function (t) {
      return 1 * ((t = t / 1 - 1) * t * t * t * t + 1)
    },
    easeInOutQuint: function (t) {
      if ((t /= 1 / 2) < 1) {
        return 1 / 2 * t * t * t * t * t
      }
      return 1 / 2 * ((t -= 2) * t * t * t * t + 2)
    },
    easeInSine: function (t) {
      return -1 * Math.cos(t / 1 * (Math.PI / 2)) + 1
    },
    easeOutSine: function (t) {
      return 1 * Math.sin(t / 1 * (Math.PI / 2))
    },
    easeInOutSine: function (t) {
      return -1 / 2 * (Math.cos(Math.PI * t / 1) - 1)
    },
    easeInExpo: function (t) {
      return (t === 0) ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1))
    },
    easeOutExpo: function (t) {
      return (t === 1) ? 1 : 1 * (-Math.pow(2, -10 * t / 1) + 1)
    },
    easeInOutExpo: function (t) {
      if (t === 0) {
        return 0
      }
      if (t === 1) {
        return 1
      }
      if ((t /= 1 / 2) < 1) {
        return 1 / 2 * Math.pow(2, 10 * (t - 1))
      }
      return 1 / 2 * (-Math.pow(2, -10 * --t) + 2)
    },
    easeInCirc: function (t) {
      if (t >= 1) {
        return t
      }
      return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1)
    },
    easeOutCirc: function (t) {
      return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t)
    },
    easeInOutCirc: function (t) {
      if ((t /= 1 / 2) < 1) {
        return -1 / 2 * (Math.sqrt(1 - t * t) - 1)
      }
      return 1 / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1)
    },
    easeInElastic: function (t) {
      var s = 1.70158
      var p = 0
      var a = 1
      if (t === 0) {
        return 0
      }
      if ((t /= 1) === 1) {
        return 1
      }
      if (!p) {
        p = 1 * 0.3
      }
      if (a < Math.abs(1)) {
        a = 1
        s = p / 4
      } else {
        s = p / (2 * Math.PI) * Math.asin(1 / a)
      }
      return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p))
    },
    easeOutElastic: function (t) {
      var s = 1.70158
      var p = 0
      var a = 1
      if (t === 0) {
        return 0
      }
      if ((t /= 1) === 1) {
        return 1
      }
      if (!p) {
        p = 1 * 0.3
      }
      if (a < Math.abs(1)) {
        a = 1
        s = p / 4
      } else {
        s = p / (2 * Math.PI) * Math.asin(1 / a)
      }
      return a * Math.pow(2, -10 * t) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) + 1
    },
    easeInOutElastic: function (t) {
      var s = 1.70158
      var p = 0
      var a = 1
      if (t === 0) {
        return 0
      }
      if ((t /= 1 / 2) === 2) {
        return 1
      }
      if (!p) {
        p = 1 * (0.3 * 1.5)
      }
      if (a < Math.abs(1)) {
        a = 1
        s = p / 4
      } else {
        s = p / (2 * Math.PI) * Math.asin(1 / a)
      }
      if (t < 1) {
        return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p))
      }
      return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * 1 - s) * (2 * Math.PI) / p) * 0.5 + 1
    },
    easeInBack: function (t) {
      var s = 1.70158
      return 1 * (t /= 1) * t * ((s + 1) * t - s)
    },
    easeOutBack: function (t) {
      var s = 1.70158
      return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1)
    },
    easeInOutBack: function (t) {
      var s = 1.70158
      if ((t /= 1 / 2) < 1) {
        return 1 / 2 * (t * t * (((s *= (1.525)) + 1) * t - s))
      }
      return 1 / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2)
    },
    easeInBounce: function (t) {
      return 1 - easingEffects.easeOutBounce(1 - t)
    },
    easeOutBounce: function (t) {
      if ((t /= 1) < (1 / 2.75)) {
        return 1 * (7.5625 * t * t)
      } else if (t < (2 / 2.75)) {
        return 1 * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75)
      } else if (t < (2.5 / 2.75)) {
        return 1 * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375)
      }
      return 1 * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375)
    },
    easeInOutBounce: function (t) {
      if (t < 1 / 2) {
        return easingEffects.easeInBounce(t * 2) * 0.5
      }
      return easingEffects.easeOutBounce(t * 2 - 1) * 0.5 + 1 * 0.5
    }
  }
  // Request animation polyfill - http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
  // helpers.requestAnimFrame = (function() {
  //     return window.requestAnimationFrame ||
  //         window.webkitRequestAnimationFrame ||
  //         window.mozRequestAnimationFrame ||
  //         window.oRequestAnimationFrame ||
  //         window.msRequestAnimationFrame ||
  //         function(callback) {
  //             return window.setTimeout(callback, 1000 / 60)
  //         }
  // }())
  // -- DOM methods
  helpers.getRelativePosition = function (evt, chart) {
    var mouseX, mouseY
    var e = evt.originalEvent || evt,
      canvas = evt.currentTarget || evt.srcElement,
      boundingRect = canvas.getBoundingClientRect()

    var touches = e.touches
    if (touches && touches.length > 0) {
      mouseX = touches[0].clientX
      mouseY = touches[0].clientY
    } else {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    // Scale mouse coordinates into canvas coordinates
    // by following the pattern laid out by 'jerryj' in the comments of
    // http://www.html5canvastutorials.com/advanced/html5-canvas-mouse-coordinates/
    var paddingLeft = parseFloat(helpers.getStyle(canvas, 'padding-left'))
    var paddingTop = parseFloat(helpers.getStyle(canvas, 'padding-top'))
    var paddingRight = parseFloat(helpers.getStyle(canvas, 'padding-right'))
    var paddingBottom = parseFloat(helpers.getStyle(canvas, 'padding-bottom'))
    var width = boundingRect.right - boundingRect.left - paddingLeft - paddingRight
    var height = boundingRect.bottom - boundingRect.top - paddingTop - paddingBottom

    // We divide by the current device pixel ratio, because the canvas is scaled up by that amount in each direction. However
    // the backend model is in unscaled coordinates. Since we are going to deal with our model coordinates, we go back here
    mouseX = Math.round((mouseX - boundingRect.left - paddingLeft) / (width) * canvas.width / chart.currentDevicePixelRatio)
    mouseY = Math.round((mouseY - boundingRect.top - paddingTop) / (height) * canvas.height / chart.currentDevicePixelRatio)

    return {
      x: mouseX,
      y: mouseY
    }
  }
  helpers.addEvent = function (node, eventType, method) {
    if (node.addEventListener) {
      node.addEventListener(eventType, method)
    } else if (node.attachEvent) {
      node.attachEvent('on' + eventType, method)
    } else {
      node['on' + eventType] = method
    }
  }
  helpers.removeEvent = function (node, eventType, handler) {
    if (node.removeEventListener) {
      node.removeEventListener(eventType, handler, false)
    } else if (node.detachEvent) {
      node.detachEvent('on' + eventType, handler)
    } else {
      node['on' + eventType] = helpers.noop
    }
  }

  // Private helper function to convert max-width/max-height values that may be percentages into a number
  function parseMaxStyle (styleValue, node, parentProperty) {
    var valueInPixels
    if (typeof (styleValue) === 'string') {
      valueInPixels = parseInt(styleValue, 10)

      if (styleValue.indexOf('%') !== -1) {
        // percentage * size in dimension
        valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty]
      }
    } else {
      valueInPixels = styleValue
    }

    return valueInPixels
  }

  /**
   * Returns if the given value contains an effective constraint.
   * @private
   */
  function isConstrainedValue (value) {
    return value !== undefined && value !== null && value !== 'none'
  }

  // Private helper to get a constraint dimension
  // @param domNode : the node to check the constraint on
  // @param maxStyle : the style that defines the maximum for the direction we are using (maxWidth / maxHeight)
  // @param percentageProperty : property of parent to use when calculating width as a percentage
  // @see http://www.nathanaeljones.com/blog/2013/reading-max-width-cross-browser
  function getConstraintDimension (domNode, maxStyle, percentageProperty) {
    var view = document.defaultView
    var parentNode = domNode.parentNode
    var constrainedNode = view.getComputedStyle(domNode)[maxStyle]
    var constrainedContainer = view.getComputedStyle(parentNode)[maxStyle]
    var hasCNode = isConstrainedValue(constrainedNode)
    var hasCContainer = isConstrainedValue(constrainedContainer)
    var infinity = Number.POSITIVE_INFINITY

    if (hasCNode || hasCContainer) {
      return Math.min(
        hasCNode ? parseMaxStyle(constrainedNode, domNode, percentageProperty) : infinity,
        hasCContainer ? parseMaxStyle(constrainedContainer, parentNode, percentageProperty) : infinity)
    }

    return 'none'
  }
  // returns Number or undefined if no constraint
  helpers.getConstraintWidth = function (domNode) {
    return getConstraintDimension(domNode, 'max-width', 'clientWidth')
  }
  // returns Number or undefined if no constraint
  helpers.getConstraintHeight = function (domNode) {
    return getConstraintDimension(domNode, 'max-height', 'clientHeight')
  }
  helpers.getMaximumWidth = function (domNode) {
    var container = domNode.parentNode
    var paddingLeft = parseInt(helpers.getStyle(container, 'padding-left'), 10)
    var paddingRight = parseInt(helpers.getStyle(container, 'padding-right'), 10)
    var w = container.clientWidth - paddingLeft - paddingRight
    var cw = helpers.getConstraintWidth(domNode)
    return isNaN(cw) ? w : Math.min(w, cw)
  }
  helpers.getMaximumHeight = function (domNode) {
    var container = domNode.parentNode
    var paddingTop = parseInt(helpers.getStyle(container, 'padding-top'), 10)
    var paddingBottom = parseInt(helpers.getStyle(container, 'padding-bottom'), 10)
    var h = container.clientHeight - paddingTop - paddingBottom
    var ch = helpers.getConstraintHeight(domNode)
    return isNaN(ch) ? h : Math.min(h, ch)
  }
  helpers.getStyle = function (el, property) {
    return el.currentStyle
      ? el.currentStyle[property]
      : document.defaultView.getComputedStyle(el, null).getPropertyValue(property)
  }
  helpers.retinaScale = function (chart) {
    if (typeof window === 'undefined') { return 'this is server' }

    var pixelRatio = chart.currentDevicePixelRatio = window.devicePixelRatio || 1
    if (pixelRatio === 1) {
      return
    }

    var canvas = chart.canvas
    var height = chart.height
    var width = chart.width

    canvas.height = height * pixelRatio
    canvas.width = width * pixelRatio
    chart.ctx.scale(pixelRatio, pixelRatio)

    // If no style has been set on the canvas, the render size is used as display size,
    // making the chart visually bigger, so let's enforce it to the "correct" values.
    // See https://github.com/chartjs/Chart.js/issues/3575
    canvas.style.height = height + 'px'
    canvas.style.width = width + 'px'
  }
  // -- Canvas methods
  helpers.clear = function (chart) {
    chart.ctx.clearRect(0, 0, chart.width, chart.height)
  }
  helpers.fontString = function (pixelSize, fontStyle, fontFamily) {
    return fontStyle + ' ' + pixelSize + 'px ' + fontFamily
  }
  helpers.longestText = function (ctx, font, arrayOfThings, cache) {
    cache = cache || {}
    var data = cache.data = cache.data || {}
    var gc = cache.garbageCollect = cache.garbageCollect || []

    if (cache.font !== font) {
      data = cache.data = {}
      gc = cache.garbageCollect = []
      cache.font = font
    }

    ctx.font = font
    var longest = 0
    helpers.each(arrayOfThings, function (thing) {
      // Undefined strings and arrays should not be measured
      if (thing !== undefined && thing !== null && helpers.isArray(thing) !== true) {
        longest = helpers.measureText(ctx, data, gc, longest, thing)
      } else if (helpers.isArray(thing)) {
        // if it is an array lets measure each element
        // to do maybe simplify this function a bit so we can do this more recursively?
        helpers.each(thing, function (nestedThing) {
          // Undefined strings and arrays should not be measured
          if (nestedThing !== undefined && nestedThing !== null && !helpers.isArray(nestedThing)) {
            longest = helpers.measureText(ctx, data, gc, longest, nestedThing)
          }
        })
      }
    })

    var gcLen = gc.length / 2
    if (gcLen > arrayOfThings.length) {
      for (var i = 0; i < gcLen; i++) {
        delete data[gc[i]]
      }
      gc.splice(0, gcLen)
    }
    return longest
  }
  helpers.measureText = function (ctx, data, gc, longest, string) {
    var textWidth = data[string]
    if (!textWidth) {
      textWidth = data[string] = ctx.measureText(string).width
      gc.push(string)
    }
    if (textWidth > longest) {
      longest = textWidth
    }
    return longest
  }
  helpers.numberOfLabelLines = function (arrayOfThings) {
    var numberOfLines = 1
    helpers.each(arrayOfThings, function (thing) {
      if (helpers.isArray(thing)) {
        if (thing.length > numberOfLines) {
          numberOfLines = thing.length
        }
      }
    })
    return numberOfLines
  }
  helpers.drawRoundedRectangle = function (ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }
  helpers.color = function (c) {
    if (!color) {
      console.error('Color.js not found!')
      return c
    }

    /* global CanvasGradient */
    if (c instanceof CanvasGradient) {
      return color(Chart.defaults.global.defaultColor)
    }

    return color(c)
  }
  helpers.isArray = Array.isArray
    ? function (obj) {
      return Array.isArray(obj)
    }
    : function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]'
    }
  // ! @see http://stackoverflow.com/a/14853974
  helpers.arrayEquals = function (a0, a1) {
    var i, ilen, v0, v1

    if (!a0 || !a1 || a0.length !== a1.length) {
      return false
    }

    for (i = 0, ilen = a0.length; i < ilen; ++i) {
      v0 = a0[i]
      v1 = a1[i]

      if (v0 instanceof Array && v1 instanceof Array) {
        if (!helpers.arrayEquals(v0, v1)) {
          return false
        }
      } else if (v0 !== v1) {
        // NOTE: two different object instances will never be equal: {x:20} != {x:20}
        return false
      }
    }

    return true
  }
  helpers.callCallback = function (fn, args, _tArg) {
    if (fn && typeof fn.call === 'function') {
      fn.apply(_tArg, args)
    }
  }
  helpers.getHoverColor = function (colorValue) {
    /* global CanvasPattern */
    return (colorValue instanceof CanvasPattern)
      ? colorValue
      : helpers.color(colorValue).saturate(0.5).darken(0.1).rgbString()
  }
}

},{}],12:[function(require,module,exports){
var Napchart = require('./init')()

/* helper functions */
require('./helpers')(Napchart)
require('./draw/canvasHelpers')(Napchart)

/* config files */
require('./config')(Napchart)

/* real shit */
require('./chart')(Napchart)

/* drawing */
require('./shape/shape')(Napchart)
require('./draw/draw')(Napchart)

/* other modules */
require('./fancymodule')(Napchart)

module.exports = Napchart
},{"./chart":2,"./config":3,"./draw/canvasHelpers":4,"./draw/draw":6,"./fancymodule":10,"./helpers":11,"./init":13,"./shape/shape":14}],13:[function(require,module,exports){


module.exports = function () {
  // var config = defaults
  var Napchart = function (item, config) {
    this.initialize(item, config)
    return this
  }

  return Napchart
}

},{}],14:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY2hhcnQvYnJvd3NlcnRlc3QuanMiLCJsaWIvY2hhcnQvY2hhcnQuanMiLCJsaWIvY2hhcnQvY29uZmlnLmpzIiwibGliL2NoYXJ0L2RyYXcvY2FudmFzSGVscGVycy5qcyIsImxpYi9jaGFydC9kcmF3L2NvbnRlbnQvYmFycy5qcyIsImxpYi9jaGFydC9kcmF3L2RyYXcuanMiLCJsaWIvY2hhcnQvZHJhdy9lbGVtZW50cy9jaXJjbGUuanMiLCJsaWIvY2hhcnQvZHJhdy9mYWNlL2NpcmNsZXMuanMiLCJsaWIvY2hhcnQvZHJhdy9mYWNlL2xpbmVzLmpzIiwibGliL2NoYXJ0L2ZhbmN5bW9kdWxlLmpzIiwibGliL2NoYXJ0L2hlbHBlcnMuanMiLCJsaWIvY2hhcnQvaW5kZXguanMiLCJsaWIvY2hhcnQvaW5pdC5qcyIsImxpYi9jaGFydC9zaGFwZS9zaGFwZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqZ0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIE5hcGNoYXJ0ID0gcmVxdWlyZSgnLi8nKVxyXG5cclxudmFyIG15bmFwY2hhcnQgPSBuZXcgTmFwY2hhcnQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJykpXHJcblxyXG5teW5hcGNoYXJ0LnNldERhdGEoe1xyXG4gIG5hcDogW10sXHJcbiAgY29yZTogW3tzdGFydDogMTQxMCwgZW5kOiA0ODAsIHN0YXRlOidhY3RpdmUnfSwge3N0YXJ0OiAxMDAwLCBlbmQ6IDEwMjB9XSxcclxuICBidXN5OiBbe3N0YXJ0OiA3MDAsIGVuZDogOTAwfV1cclxufSlcclxuXHJcbmNvbnNvbGUubG9nKG15bmFwY2hhcnQpXHJcblxyXG53aW5kb3cubG9sID0gbXluYXBjaGFydCIsIi8qXHJcbiogIENvcmUgbW9kdWxlIG9mIE5hcGNoYXJ0XHJcbipcclxuKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcbiAgdmFyIG1vZHVsZXMgPSBbXVxyXG5cclxuICBOYXBjaGFydC5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uIChjdHgsIGNvbmZpZykge1xyXG4gICAgdmFyIGNoYXJ0ID0gdGhpc1xyXG5cclxuICAgIGNoYXJ0LmN0eCA9IGN0eFxyXG4gICAgY2hhcnQuY2FudmFzID0gY3R4LmNhbnZhc1xyXG4gICAgY2hhcnQud2lkdGggPSBjaGFydC53ID0gY3R4LmNhbnZhcy53aWR0aFxyXG4gICAgY2hhcnQuaGVpZ2h0ID0gY2hhcnQuaCA9IGN0eC5jYW52YXMuaGVpZ2h0XHJcbiAgICBjaGFydC5yYXRpbyA9IGNoYXJ0LmggLyAxMDBcclxuICAgIGNoYXJ0LmNvbmZpZyA9IGluaXRDb25maWcoY29uZmlnKVxyXG4gICAgY2hhcnQuZGF0YSA9IHt9XHJcblxyXG4gICAgc2NhbGVDb25maWcoY2hhcnQuY29uZmlnLCBjaGFydC5yYXRpbylcclxuICAgIE5hcGNoYXJ0LmluaXRTaGFwZShjaGFydClcclxuICAgIGhlbHBlcnMucmV0aW5hU2NhbGUoY2hhcnQpXHJcbiAgICBOYXBjaGFydC5kcmF3KHRoaXMpXHJcbiAgICBjb25zb2xlLmxvZyhtb2R1bGVzKVxyXG4gICAgbW9kdWxlc1swXShjaGFydClcclxuICB9XHJcblxyXG4gIE5hcGNoYXJ0LnByb3RvdHlwZS5zZXREYXRhID0gZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgIHRoaXMuZGF0YSA9IGRhdGFcclxuICAgIGNvbnNvbGUubG9nKCdzZXRkYXRhJywgdGhpcylcclxuICAgIE5hcGNoYXJ0LmRyYXcodGhpcylcclxuICB9XHJcblxyXG4gIE5hcGNoYXJ0LmFkZE1vZHVsZSA9IGZ1bmN0aW9uIChmKSB7XHJcbiAgICBtb2R1bGVzLnB1c2goZilcclxuICAgIGNvbnNvbGUubG9nKCdzZXRkYXRhJywgdGhpcylcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEluaXRpYWxpemVzIHRoZSBnaXZlbiBjb25maWcgd2l0aCBnbG9iYWwgYW5kIE5hcGNoYXJ0IGRlZmF1bHQgdmFsdWVzLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGluaXRDb25maWcgKGNvbmZpZykge1xyXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9XHJcblxyXG4gICAgY29uZmlnID0gaGVscGVycy5leHRlbmQoTmFwY2hhcnQuY29uZmlnLCBjb25maWcpXHJcblxyXG4gICAgcmV0dXJuIGNvbmZpZ1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2NhbGVDb25maWcgKGNvbmZpZywgcmF0aW8pIHtcclxuICAgIGZ1bmN0aW9uIHNjYWxlRm4gKGJhc2UsIHZhbHVlLCBrZXkpIHtcclxuICAgICAgLy8gYm9keS4uLlxyXG4gICAgICAvLyBjb25zb2xlLmxvZyh2YWx1ZSlcclxuICAgICAgaWYgKHZhbHVlID4gMSkge1xyXG4gICAgICAgIC8vIHZhbHVlID0gMTk5XHJcbiAgICAgICAgYmFzZVtrZXldID0gdmFsdWUgKiByYXRpb1xyXG4gICAgICAvLyBjb25zb2xlLmxvZyhrZXksIHZhbHVlKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBoZWxwZXJzLmRlZXBFYWNoKGNvbmZpZywgc2NhbGVGbilcclxuICAgIHJldHVybiBjb25maWdcclxuICB9XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTmFwY2hhcnQpIHtcclxuICBOYXBjaGFydC5jb25maWcgPSB7XHJcbiAgICBmYWNlOiB7IC8vIGRlZmluZSBob3cgdGhlIGJhY2tncm91bmQgY2xvY2sgc2hvdWxkIGJlIGRyYXduXHJcbiAgICAgIGNpcmNsZXM6IFtcclxuICAgICAgICB7cmFkaXVzOiAzNH0sXHJcbiAgICAgICAge3JhZGl1czogMjR9XHJcbiAgICAgIF0sXHJcbiAgICAgIGNsZWFyQ2lyY2xlOiAyMCxcclxuICAgICAgYmx1ckNpcmNsZToge1xyXG4gICAgICAgIHJhZGl1czogMjksXHJcbiAgICAgICAgb3BhY2l0eTogMC44XHJcbiAgICAgIH0sXHJcbiAgICAgIHN0cm9rZTogMSxcclxuICAgICAgc3Ryb2tlQ29sb3I6ICcjNzc3Nzc3JyxcclxuICAgICAgaW1wU3Ryb2tlQ29sb3I6ICcjMjYyNjI2JyxcclxuICAgICAgY2xvY2tOdW1iZXJzOiB7XHJcbiAgICAgICAgcmFkaXVzOiA0NCxcclxuICAgICAgICBjb2xvcjogJyMyNjI2MjYnXHJcbiAgICAgIH0sXHJcbiAgICAgIGJldHdlZW46IHtcclxuICAgICAgICBzdHJva2VDb2xvcjogJyNkMmQyZDInLFxyXG4gICAgICAgIHRleHRDb2xvcjogJ2JsYWNrJyxcclxuICAgICAgICBvcGFjaXR5OiAwLjVcclxuICAgICAgfSxcclxuICAgICAgdGltZUxvY2F0aW9uOiA0IC8vIGhvdyBmYXIgYXdheSBmcm9tIHRoZSBiYXIgdGhlIHRpbWUgaW5kaWNhdG9ycyBzaG91bGQgYmVcclxuICAgIH0sXHJcbiAgICBiYXJzOiB7XHJcbiAgICAgIGNvcmU6IHtcclxuICAgICAgICBzdGFjazogMCxcclxuICAgICAgICBjb2xvcjogJyNjNzBlMGUnLFxyXG4gICAgICAgIGlubmVyUmFkaXVzOiAyOSxcclxuICAgICAgICBvdXRlclJhZGl1czogNDAsXHJcbiAgICAgICAgc3Ryb2tlOiB7XHJcbiAgICAgICAgICBsaW5lV2lkdGg6IDFcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJhbmdlSGFuZGxlczogdHJ1ZSxcclxuICAgICAgICBvcGFjaXR5OiAxLFxyXG4gICAgICAgIGhvdmVyT3BhY2l0eTogMC41LFxyXG4gICAgICAgIGFjdGl2ZU9wYWNpdHk6IDAuNSxcclxuICAgICAgICBzZWxlY3RlZDoge1xyXG4gICAgICAgICAgc3Ryb2tlQ29sb3I6ICcjRkY2MzYzJyxcclxuICAgICAgICAgIGxpbmVXaWR0aDogMSxcclxuICAgICAgICAgIGV4cGFuZDogMC41XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBuYXA6IHtcclxuICAgICAgICBzdGFjazogMSxcclxuICAgICAgICBjb2xvcjogJyNjNzBlMGUnLFxyXG4gICAgICAgIGlubmVyUmFkaXVzOiAyOSxcclxuICAgICAgICBvdXRlclJhZGl1czogNDAsXHJcbiAgICAgICAgc3Ryb2tlOiB7XHJcbiAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9wYWNpdHk6IDAuNixcclxuICAgICAgICBob3Zlck9wYWNpdHk6IDAuNSxcclxuICAgICAgICBhY3RpdmVPcGFjaXR5OiAwLjUsXHJcbiAgICAgICAgc2VsZWN0ZWQ6IHtcclxuICAgICAgICAgIHN0cm9rZUNvbG9yOiAnZ3JleScsXHJcbiAgICAgICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgICAgICBleHBhbmQ6IDAuNVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgYnVzeToge1xyXG4gICAgICAgIHN0YWNrOiAyLFxyXG4gICAgICAgIGNvbG9yOiAnIzFmMWYxZicsXHJcbiAgICAgICAgaW5uZXJSYWRpdXM6IDI5LFxyXG4gICAgICAgIG91dGVyUmFkaXVzOiAzNixcclxuICAgICAgICBzdHJva2U6IHtcclxuICAgICAgICAgIGxpbmVXaWR0aDogMlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmFuZ2VIYW5kbGVzOiB0cnVlLFxyXG4gICAgICAgIG9wYWNpdHk6IDAuNixcclxuICAgICAgICBob3Zlck9wYWNpdHk6IDAuNSxcclxuICAgICAgICBhY3RpdmVPcGFjaXR5OiAwLjUsXHJcbiAgICAgICAgc2VsZWN0ZWQ6IHtcclxuICAgICAgICAgIHN0cm9rZUNvbG9yOiAnI0ZGNjM2MycsXHJcbiAgICAgICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgICAgICBleHBhbmQ6IDAuNVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgZ2VuZXJhbDoge1xyXG4gICAgICAgIHRleHRTaXplOiA0LFxyXG4gICAgICAgIGNvbG9yOiAnYmxhY2snXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn1cclxuLy8gdmFyIENvbmZpZyA9IHt9XHJcbi8vIENvbmZpZy5iYXJDb25maWcgPSB7XHJcblxyXG4vLyB9XHJcblxyXG4vLyBcdENvbmZpZy5kYXJrQmFyQ29uZmlnID0geyAvL3doZW4gZGFya21vZGUgaXMgb25cclxuLy8gXHRcdGNvcmU6e1xyXG4vLyBcdFx0XHRjb2xvcjonIzczMzEzNCcsXHJcbi8vIFx0XHRcdG9wYWNpdHk6MC43LFxyXG4vLyBcdFx0XHRob3Zlck9wYWNpdHk6MC43LFxyXG4vLyBcdFx0XHRhY3RpdmVPcGFjaXR5OjAuNyxcclxuLy8gXHRcdFx0c2VsZWN0ZWQ6e1xyXG4vLyBcdFx0XHRcdHN0cm9rZUNvbG9yOicjRkY2MzYzJyxcclxuLy8gXHRcdFx0XHRsaW5lV2lkdGg6MSxcclxuLy8gXHRcdFx0XHRleHBhbmQ6MC41XHJcbi8vIFx0XHRcdH1cclxuLy8gXHRcdH0sXHJcbi8vIFx0XHRuYXA6e1xyXG4vLyBcdFx0XHRjb2xvcjonI2M3MGUwZScsXHJcbi8vIFx0XHRcdG9wYWNpdHk6MC43LFxyXG4vLyBcdFx0XHRob3Zlck9wYWNpdHk6MC43LFxyXG4vLyBcdFx0XHRhY3RpdmVPcGFjaXR5OjAuNyxcclxuLy8gXHRcdFx0c2VsZWN0ZWQ6e1xyXG4vLyBcdFx0XHRcdHN0cm9rZUNvbG9yOicjRkY2MzYzJyxcclxuLy8gXHRcdFx0XHRsaW5lV2lkdGg6MSxcclxuLy8gXHRcdFx0XHRleHBhbmQ6MC41XHJcbi8vIFx0XHRcdH1cclxuLy8gXHRcdH0sXHJcbi8vIFx0XHRidXN5OntcclxuLy8gXHRcdFx0Y29sb3I6JyM5RTlFOUUnLFxyXG4vLyBcdFx0XHRvcGFjaXR5OjAuNixcclxuLy8gXHRcdFx0aG92ZXJPcGFjaXR5OjAuNSxcclxuLy8gXHRcdFx0YWN0aXZlT3BhY2l0eTowLjUsXHJcbi8vIFx0XHRcdHNlbGVjdGVkOntcclxuLy8gXHRcdFx0XHRzdHJva2VDb2xvcjonI0ZGNjM2MycsXHJcbi8vIFx0XHRcdFx0bGluZVdpZHRoOjEsXHJcbi8vIFx0XHRcdFx0ZXhwYW5kOjAuNVxyXG4vLyBcdFx0XHR9XHJcbi8vIFx0XHR9LFxyXG4vLyBcdFx0Z2VuZXJhbDp7XHJcbi8vIFx0XHRcdGNvbG9yOid3aGl0ZSdcclxuLy8gXHRcdH1cclxuLy8gXHR9XHJcblxyXG4vLyBcdENvbmZpZy5kYXJrQ2xvY2tDb25maWcgPSB7XHJcbi8vIFx0XHRiYWNrZ3JvdW5kOicjMzczNzM3JyxcclxuLy8gXHRcdGNpcmNsZXM6W1xyXG4vLyBcdFx0e3JhZGl1czozNn0sXHJcbi8vIFx0XHR7cmFkaXVzOjI5fSxcclxuLy8gXHRcdHtyYWRpdXM6MjB9LFxyXG4vLyBcdFx0e3JhZGl1czoyfVxyXG4vLyBcdFx0XSxcclxuLy8gXHRcdGNsZWFyQ2lyY2xlOiAyMCxcclxuLy8gXHRcdGJsdXJDaXJjbGU6e1xyXG4vLyBcdFx0XHRyYWRpdXM6MjksXHJcbi8vIFx0XHRcdG9wYWNpdHk6MC41XHJcbi8vIFx0XHR9LFxyXG4vLyBcdFx0c3Ryb2tlOjAuMzIsXHJcbi8vIFx0XHRzdHJva2VDb2xvcjonIzUyNTI1MicsXHJcbi8vIFx0XHRpbXBTdHJva2VDb2xvcjonRURFREVEJyxcclxuLy8gXHRcdGNsb2NrTnVtYmVyczp7XHJcbi8vIFx0XHRcdHJhZGl1czo0NCxcclxuLy8gXHRcdFx0Y29sb3I6JyNCRkJGQkYnXHJcbi8vIFx0XHR9LFxyXG4vLyBcdFx0YmV0d2Vlbjp7XHJcbi8vIFx0XHRcdHN0cm9rZUNvbG9yOiAnI0E1QTVBNScsXHJcbi8vIFx0XHRcdHRleHRDb2xvcjogJ3doaXRlJyxcclxuLy8gXHRcdFx0b3BhY2l0eTogMC45LFxyXG4vLyBcdFx0fSxcclxuLy8gXHRcdHRpbWVMb2NhdGlvbjo0LCAvL2hvdyBmYXIgYXdheSBmcm9tIHRoZSBiYXIgdGhlIHRpbWUgaW5kaWNhdG9ycyBzaG91bGQgYmVcclxuLy8gXHR9XHJcbiIsIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTmFwY2hhcnQpIHtcclxuICB2YXIgaGVscGVycyA9IE5hcGNoYXJ0LmhlbHBlcnM7XHJcblxyXG5cclxuICBoZWxwZXJzLnN0cm9rZVNlZ21lbnQgPSBmdW5jdGlvbihjaGFydCwgc3RhcnQsIGVuZCwgY29uZmlnKXtcclxuICBcdHZhciBjdHggPSBjaGFydC5jdHhcclxuICBcdGN0eC5zYXZlKClcclxuICBcdGN0eC5zdHJva2VTdHlsZSA9IGNvbmZpZy5jb2xvclxyXG4gIFx0Y3R4LmxpbmVXaWR0aCA9IGNvbmZpZy5zdHJva2UubGluZVdpZHRoXHJcbiAgXHRjdHgubGluZUpvaW4gPSAnbWl0dGVsJ1xyXG5cclxuICBcdE5hcGNoYXJ0LnNoYXBlLmNyZWF0ZVNlZ21lbnQoY2hhcnQsIGNvbmZpZy5vdXRlclJhZGl1cywgY29uZmlnLmlubmVyUmFkaXVzLCBzdGFydCwgZW5kKTtcclxuXHJcbiAgXHRjdHguc3Ryb2tlKCk7XHJcbiAgXHRjdHgucmVzdG9yZSgpXHJcbiAgfVxyXG5cclxufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYXJ0LCBOYXBjaGFydCkge1xyXG4gIHZhciBjdHggPSBjaGFydC5jdHhcclxuICB2YXIgZGF0YSA9IGNoYXJ0LmRhdGFcclxuICB2YXIgY2FudmFzID0gY3R4LmNhbnZhc1xyXG4gIHZhciBiYXJDb25maWcgPSBjaGFydC5jb25maWcuYmFyc1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG5cclxuICBoZWxwZXJzLmVhY2hFbGVtZW50KGNoYXJ0LCBmdW5jdGlvbihlbGVtZW50LCBjb25maWcpe1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gICAgY3R4LnNhdmUoKVxyXG4gICAgY3R4LmZpbGxTdHlsZSA9IGNvbmZpZy5jb2xvclxyXG4gICAgXHJcbiAgICBzd2l0Y2goZWxlbWVudC5zdGF0ZSl7XHJcbiAgICAgIGNhc2UgJ2FjdGl2ZSc6XHJcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gY29uZmlnLmFjdGl2ZU9wYWNpdHlcclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICdob3Zlcic6XHJcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gY29uZmlnLmhvdmVyT3BhY2l0eVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gY29uZmlnLm9wYWNpdHlcclxuICAgIH1cclxuXHJcbiAgICBOYXBjaGFydC5zaGFwZS5jcmVhdGVTZWdtZW50KGNoYXJ0LCBjb25maWcub3V0ZXJSYWRpdXMsIGNvbmZpZy5pbm5lclJhZGl1cywgZWxlbWVudC5zdGFydCwgZWxlbWVudC5lbmQpO1xyXG5cclxuICAgIGN0eC5maWxsKClcclxuICAgIGN0eC5yZXN0b3JlKClcclxuICB9KVxyXG5cclxuXHJcbiAgaGVscGVycy5lYWNoRWxlbWVudChjaGFydCwgZnVuY3Rpb24oZWxlbWVudCwgY29uZmlnKXtcclxuICAgIGhlbHBlcnMuc3Ryb2tlU2VnbWVudChjaGFydCwgZWxlbWVudC5zdGFydCwgZWxlbWVudC5lbmQsIGNvbmZpZylcclxuICB9KTtcclxuXHJcbiAgLy8gZm9yICh2YXIgbmFtZSBpbiBkYXRhKSB7XHJcbiAgLy8gICB2YXIgb3BhY2l0eSA9IGJhckNvbmZpZ1tuYW1lXS5vcGFjaXR5LFxyXG4gIC8vICAgICBob3Zlck9wYWNpdHkgPSBiYXJDb25maWdbbmFtZV0uaG92ZXJPcGFjaXR5LFxyXG4gIC8vICAgICBhY3RpdmVPcGFjaXR5ID0gYmFyQ29uZmlnW25hbWVdLmFjdGl2ZU9wYWNpdHlcclxuXHJcbiAgLy8gICAgIC8vIGlmKGludGVyYWN0Q2FudmFzLmlzQWN0aXZlKG5hbWUsY291bnQsJ3dob2xlJykgfHwgbmFwY2hhcnRDb3JlLmlzU2VsZWN0ZWQobmFtZSxjb3VudCkpe1xyXG4gIC8vICAgICAvLyBcdGN0eC5nbG9iYWxBbHBoYSA9IGFjdGl2ZU9wYWNpdHlcclxuICAvLyAgICAgLy8gfVxyXG5cclxuICAvLyAgICAgLy8gZWxzZSBpZihpbnRlcmFjdENhbnZhcy5pc0FjdGl2ZShuYW1lLGNvdW50KSB8fCBpbnRlcmFjdENhbnZhcy5pc0hvdmVyKG5hbWUsY291bnQsJ3dob2xlJykpe1xyXG4gIC8vICAgICAvLyBcdGN0eC5nbG9iYWxBbHBoYT1ob3Zlck9wYWNpdHlcclxuICAvLyAgICAgLy8gfVxyXG5cclxuICAvLyAgICAgLy8gZWxzZXtcclxuICAvLyAgICAgY3R4Lmdsb2JhbEFscGhhPW9wYWNpdHlcclxuICAvLyAgICAgLy8gfVxyXG4gIC8vICAgfVxyXG4gIC8vIH1cclxufVxyXG5cclxuXHJcbiAgICAvLyB2YXIgcGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgLy8gcGNhbnZhcy5oZWlnaHQgPSA0MDtcclxuICAgIC8vIHBjYW52YXMud2lkdGggPSAyMDtcclxuICAgIC8vIHBjdHggPSBwY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAvLyBwY3R4LmZpbGxTdHlsZSA9IGNvbmZpZy5jb2xvcjtcclxuICAgIC8vIHBjdHguYXJjKDUsIDUsIDUsIDAsIE1hdGguUEkqMilcclxuICAgIC8vIHBjdHguYXJjKDE1LCAyNSwgNSwgMCwgTWF0aC5QSSoyKVxyXG4gICAgLy8gcGN0eC5maWxsKCk7XHJcbiAgICAvLyB2YXIgcGF0dGVybiA9IGN0eC5jcmVhdGVQYXR0ZXJuKHBjYW52YXMsICdyZXBlYXQnKSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XG4gIE5hcGNoYXJ0LmRyYXcgPSBmdW5jdGlvbiAoY2hhcnQpIHtcbiAgICBjaGFydC5jaXJjbGUgPSBmdW5jdGlvbiAocmFkaXVzKSB7XHJcbiAgICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gY2hhcnQuY29uZmlnLmZhY2Uuc3Ryb2tlQ29sb3JcclxuICAgICAgY3R4LmxpbmVXaWR0aCA9IGNoYXJ0LmNvbmZpZy5mYWNlLnN0cm9rZVxyXG5cclxuICAgICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICAgIE5hcGNoYXJ0LnNoYXBlLmNyZWF0ZUN1cnZlKGNoYXJ0LCByYWRpdXMsIDAsIDE0NDApXHJcbiAgICAgIGN0eC5zdHJva2UoKVxyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUoJy4vZmFjZS9jaXJjbGVzJykoY2hhcnQpXHJcbiAgICByZXF1aXJlKCcuL2ZhY2UvbGluZXMnKShjaGFydClcclxuICAgIHJlcXVpcmUoJy4vZWxlbWVudHMvY2lyY2xlJykoY2hhcnQpXHJcblxyXG4gICAgcmVxdWlyZSgnLi9jb250ZW50L2JhcnMnKShjaGFydCwgTmFwY2hhcnQpXHJcbiAgfVxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChyYWRpdXMpIHtcclxuICAvLyB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgLy8gY3R4LnN0cm9rZVN0eWxlID0gY2hhcnQuY29uZmlnLmZhY2Uuc3Ryb2tlQ29sb3JcclxuICAvLyBjdHgubGluZVdpZHRoID0gY2hhcnQuY29uZmlnLmZhY2Uuc3Ryb2tlXHJcblxyXG4gIC8vIGN0eC5iZWdpblBhdGgoKVxyXG4gIC8vIC8vIE5hcGNoYXJ0LnNoYXBlLmNyZWF0ZUN1cnZlKGNoYXJ0LCByYWRpdXMsIDAsIDE0NDApXHJcbiAgLy8gY3R4LnN0cm9rZSgpXHJcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYXJ0KSB7XG4gIHZhciBjaXJjbGVzID0gY2hhcnQuY29uZmlnLmZhY2UuY2lyY2xlc1xyXG5cclxuICBmb3IgKGkgPSAwOyBpIDwgY2lyY2xlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgY2hhcnQuY2lyY2xlKGNpcmNsZXNbaV0ucmFkaXVzKVxyXG4gIH1cclxuXHJcbi8vIGZvciAodmFyIGkgPSAwOyBpIDwgMjQ7IGkrKykge1xyXG4vLyBcdHZhciBtaW51dGVzID0gaSoxNDQwLzI0XHJcbi8vIFx0TmFwY2hhcnQuZHJhdy5lbGVtZW50cy5saW5lKGNoYXJ0LCBtaW51dGVzLCAwLCBjaXJjbGVzWzBdLnJhZGl1cylcclxuLy8gfVxyXG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFydCkge1xyXG4gIC8vIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAvLyB2YXIgY29uZmlnID0gTmFwY2hhcnQuY29uZmlnXHJcbiAgLy8gdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gIC8vIHZhciByYWRpdXM9MjAwXHJcbiAgLy8gY3R4LnNhdmUoKVxyXG4gIC8vIGN0eC5zdHJva2VTdHlsZSA9IGNvbmZpZy5mYWNlLnN0cm9rZUNvbG9yXHJcbiAgLy8gY3R4LmxpbmVXaWR0aCA9IGNvbmZpZy5mYWNlLnN0cm9rZSAqNVxyXG4gIC8vIGN0eC5iZWdpblBhdGgoKVxyXG4gIC8vIC8vIGN0eC5maWxsUmVjdCgwLCAwLCA1MCwgNTApXHJcbiAgLy8gY3R4LnRyYW5zbGF0ZShjaGFydC53LzIsY2hhcnQuaC8yKVxyXG4gIC8vIGZvcih2YXIgaT0wO2k8MTI7aSsrKXtcclxuICAvLyBcdHZhciBjPWhlbHBlcnMubWludXRlc1RvWFkoaSo2MCxyYWRpdXMpXHJcbiAgLy8gXHRjdHgubW92ZVRvKGMueCxjLnkpXHJcbiAgLy8gXHRjPWhlbHBlcnMubWludXRlc1RvWFkoaSo2MCs3MjAscmFkaXVzKVxyXG4gIC8vIFx0Y3R4LmxpbmVUbyhjLngsYy55KVxyXG4gIC8vIH1cclxuICAvLyBjdHguc3Ryb2tlKClcclxuXHJcbiAgLy8gY3R4LmJlZ2luUGF0aCgpXHJcbiAgLy8gY3R4LnN0cm9rZVN0eWxlID0gY29uZmlnLmZhY2UuaW1wU3Ryb2tlQ29sb3JcclxuXHJcbiAgLy8gYz1oZWxwZXJzLm1pbnV0ZXNUb1hZKDAscmFkaXVzKVxyXG4gIC8vIGN0eC5tb3ZlVG8oYy54LGMueSlcclxuICAvLyBjPWhlbHBlcnMubWludXRlc1RvWFkoNzIwLHJhZGl1cylcclxuICAvLyBjdHgubGluZVRvKGMueCxjLnkpXHJcbiAgLy8gYz1oZWxwZXJzLm1pbnV0ZXNUb1hZKDI0MCxyYWRpdXMpXHJcbiAgLy8gY3R4Lm1vdmVUbyhjLngsYy55KVxyXG4gIC8vIGM9aGVscGVycy5taW51dGVzVG9YWSg5NjAscmFkaXVzKVxyXG4gIC8vIGN0eC5saW5lVG8oYy54LGMueSlcclxuICAvLyBjPWhlbHBlcnMubWludXRlc1RvWFkoNDgwLHJhZGl1cylcclxuICAvLyBjdHgubW92ZVRvKGMueCxjLnkpXHJcbiAgLy8gYz1oZWxwZXJzLm1pbnV0ZXNUb1hZKDEyMDAscmFkaXVzKVxyXG4gIC8vIGN0eC5saW5lVG8oYy54LGMueSlcclxuICAvLyBjdHguY2xvc2VQYXRoKClcclxuICAvLyBjdHguc3Ryb2tlKClcclxuICAvLyBjdHgucmVzdG9yZSgpXHJcbn1cbiIsIi8qXHJcbiogIEZhbmN5IG1vZHVsZSB0aGF0IGRvZXMgc2hpdFxyXG4qL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTmFwY2hhcnQpIHtcclxuXHROYXBjaGFydC5hZGRNb2R1bGUoZnVuY3Rpb24oY2hhcnQpIHtcclxuXHJcblx0XHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdC8vIGNvbnNvbGUubG9nKE5hcGNoYXJ0LnByb3RvdHlwZSlcclxuXHRcdFx0Y2hhcnQuc2V0RGF0YSh7XHJcblx0XHRcdCAgbmFwOiBbXSxcclxuXHRcdFx0ICBjb3JlOiBbe3N0YXJ0OiAxMzEwLCBlbmQ6IDE4MCwgc3RhdGU6J2FjdGl2ZSd9LCB7c3RhcnQ6IDUwMCwgZW5kOiAxMDIwfV0sXHJcblx0XHRcdCAgYnVzeTogW3tzdGFydDogNzAwLCBlbmQ6IDkwMH1dXHJcblx0XHRcdH0pXHJcblx0XHR9KTtcclxuXHJcblx0fSlcclxufSIsIi8qIGdsb2JhbCB3aW5kb3c6IGZhbHNlICovXG4vKiBnbG9iYWwgZG9jdW1lbnQ6IGZhbHNlICovXG4ndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQ2hhcnQpIHtcbiAgLy8gR2xvYmFsIENoYXJ0IGhlbHBlcnMgb2JqZWN0IGZvciB1dGlsaXR5IG1ldGhvZHMgYW5kIGNsYXNzZXNcbiAgdmFyIGhlbHBlcnMgPSBDaGFydC5oZWxwZXJzID0ge31cbiAgaGVscGVycy5yYW5nZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gICAgaWYgKGVuZCA8IHN0YXJ0KSB7XG4gICAgICByZXR1cm4gMTQ0MCAtIHN0YXJ0ICsgZW5kXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBlbmQgLSBzdGFydFxuICAgIH1cbiAgfVxuXG4gIGhlbHBlcnMuZ2V0UHJvZ3Jlc3NCZXR3ZWVuVHdvVmFsdWVzID0gZnVuY3Rpb24gKHBvcywgc3RhcnQsIGVuZCkge1xuICAgIHJldHVybiBoZWxwZXJzLnJhbmdlKHN0YXJ0LCBwb3MpIC8gaGVscGVycy5yYW5nZShzdGFydCwgZW5kKVxuICB9XG4gIGhlbHBlcnMucG9pbnRJc0luc2lkZSA9IGZ1bmN0aW9uIChwb2ludCwgc3RhcnQsIGVuZCkge1xuICAgIGlmIChlbmQgPiBzdGFydCkge1xuICAgICAgaWYgKHBvaW50IDwgZW5kICYmIHBvaW50ID4gc3RhcnQpIHsgcmV0dXJuIHRydWUgfVxuICAgIH0gZWxzZSBpZiAoc3RhcnQgPiBlbmQpIHtcbiAgICAgIGlmIChwb2ludCA+IHN0YXJ0IHx8IHBvaW50IDwgZW5kKSB7IHJldHVybiB0cnVlIH1cbiAgICB9XG4gICAgaWYgKHBvaW50ID09IHN0YXJ0IHx8IHBvaW50ID09IGVuZCkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBoZWxwZXJzLmlzSW5zaWRlID0gaGVscGVycy5wb2ludElzSW5zaWRlXG4gIGhlbHBlcnMubWludXRlc1RvWFkgPSBmdW5jdGlvbiAobWludXRlcywgcmFkaXVzKSB7XG4gICAgdmFyIG8gPSB7fVxuICAgIG8ueSA9IE1hdGguc2luKChtaW51dGVzIC8gMTQ0MCkgKiAoTWF0aC5QSSAqIDIpIC0gKE1hdGguUEkgLyAyKSkgKiByYWRpdXNcbiAgICBvLnggPSBNYXRoLmNvcygobWludXRlcyAvIDE0NDApICogKE1hdGguUEkgKiAyKSAtIChNYXRoLlBJIC8gMikpICogcmFkaXVzXG4gICAgcmV0dXJuIG9cbiAgfVxuXG4gIGhlbHBlcnMuZWFjaEVsZW1lbnQgPSBmdW5jdGlvbiAoY2hhcnQsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGRhdGEgPSBjaGFydC5kYXRhXG4gICAgdmFyIGNvbmZpZ1xuXG4gICAgZm9yICh2YXIgbmFtZSBpbiBkYXRhKSB7XG4gICAgICBjb25maWcgPSBjaGFydC5jb25maWcuYmFyc1tuYW1lXVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFbbmFtZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2FsbGJhY2soZGF0YVtuYW1lXVtpXSwgY29uZmlnKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhlbHBlcnMuZWFjaCA9IGZ1bmN0aW9uIChsb29wYWJsZSwgY2FsbGJhY2ssIHNlbGYsIHJldmVyc2UpIHtcbiAgICAvLyBDaGVjayB0byBzZWUgaWYgbnVsbCBvciB1bmRlZmluZWQgZmlyc3RseS5cbiAgICB2YXIgaSwgbGVuXG4gICAgaWYgKGhlbHBlcnMuaXNBcnJheShsb29wYWJsZSkpIHtcbiAgICAgIGxlbiA9IGxvb3BhYmxlLmxlbmd0aFxuICAgICAgaWYgKHJldmVyc2UpIHtcbiAgICAgICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGxvb3BhYmxlW2ldLCBpKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGxvb3BhYmxlW2ldLCBpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbG9vcGFibGUgPT09ICdvYmplY3QnKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGxvb3BhYmxlKVxuICAgICAgbGVuID0ga2V5cy5sZW5ndGhcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGxvb3BhYmxlW2tleXNbaV1dLCBrZXlzW2ldKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhlbHBlcnMuZGVlcEVhY2ggPSBmdW5jdGlvbiAobG9vcGFibGUsIGNhbGxiYWNrKSB7XG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIG51bGwgb3IgdW5kZWZpbmVkIGZpcnN0bHkuXG4gICAgdmFyIGksIGxlblxuICAgIGZ1bmN0aW9uIHNlYXJjaCAobG9vcGFibGUsIGNiKSB7XG4gICAgICBpZiAoaGVscGVycy5pc0FycmF5KGxvb3BhYmxlKSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvb3BhYmxlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2IobG9vcGFibGUsIGxvb3BhYmxlW2ldLCBpKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsb29wYWJsZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhsb29wYWJsZSlcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2IobG9vcGFibGUsIGxvb3BhYmxlW2tleXNbaV1dLCBrZXlzW2ldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm91bmQgKGJhc2UsIHZhbHVlLCBrZXkpIHtcbiAgICAgIGlmIChoZWxwZXJzLmlzQXJyYXkodmFsdWUpIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgc2VhcmNoKHZhbHVlLCBmb3VuZClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrKGJhc2UsIHZhbHVlLCBrZXkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VhcmNoKGxvb3BhYmxlLCBmb3VuZClcbiAgfVxuICBoZWxwZXJzLmNsb25lID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gIH1cbiAgaGVscGVycy5leHRlbmQgPSBmdW5jdGlvbiAoYmFzZSkge1xuICAgIHZhciBzZXRGbiA9IGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICBiYXNlW2tleV0gPSB2YWx1ZVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMSwgaWxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbGVuOyBpKyspIHtcbiAgICAgIGhlbHBlcnMuZWFjaChhcmd1bWVudHNbaV0sIHNldEZuKVxuICAgIH1cbiAgICByZXR1cm4gYmFzZVxuICB9XG4gIC8vIE5lZWQgYSBzcGVjaWFsIG1lcmdlIGZ1bmN0aW9uIHRvIGNoYXJ0IGNvbmZpZ3Mgc2luY2UgdGhleSBhcmUgbm93IGdyb3VwZWRcbiAgaGVscGVycy5jb25maWdNZXJnZSA9IGZ1bmN0aW9uIChfYmFzZSkge1xuICAgIHZhciBiYXNlID0gaGVscGVycy5jbG9uZShfYmFzZSlcbiAgICBoZWxwZXJzLmVhY2goQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgZnVuY3Rpb24gKGV4dGVuc2lvbikge1xuICAgICAgaGVscGVycy5lYWNoKGV4dGVuc2lvbiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgdmFyIGJhc2VIYXNQcm9wZXJ0eSA9IGJhc2UuaGFzT3duUHJvcGVydHkoa2V5KVxuICAgICAgICB2YXIgYmFzZVZhbCA9IGJhc2VIYXNQcm9wZXJ0eSA/IGJhc2Vba2V5XSA6IHt9XG5cbiAgICAgICAgaWYgKGtleSA9PT0gJ3NjYWxlcycpIHtcbiAgICAgICAgICAvLyBTY2FsZSBjb25maWcgbWVyZ2luZyBpcyBjb21wbGV4LiBBZGQgb3VyIG93biBmdW5jdGlvbiBoZXJlIGZvciB0aGF0XG4gICAgICAgICAgYmFzZVtrZXldID0gaGVscGVycy5zY2FsZU1lcmdlKGJhc2VWYWwsIHZhbHVlKVxuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3NjYWxlJykge1xuICAgICAgICAgIC8vIFVzZWQgaW4gcG9sYXIgYXJlYSAmIHJhZGFyIGNoYXJ0cyBzaW5jZSB0aGVyZSBpcyBvbmx5IG9uZSBzY2FsZVxuICAgICAgICAgIGJhc2Vba2V5XSA9IGhlbHBlcnMuY29uZmlnTWVyZ2UoYmFzZVZhbCwgQ2hhcnQuc2NhbGVTZXJ2aWNlLmdldFNjYWxlRGVmYXVsdHModmFsdWUudHlwZSksIHZhbHVlKVxuICAgICAgICB9IGVsc2UgaWYgKGJhc2VIYXNQcm9wZXJ0eSAmJlxuICAgICAgICAgIHR5cGVvZiBiYXNlVmFsID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICFoZWxwZXJzLmlzQXJyYXkoYmFzZVZhbCkgJiZcbiAgICAgICAgICBiYXNlVmFsICE9PSBudWxsICYmXG4gICAgICAgICAgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICFoZWxwZXJzLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgLy8gSWYgd2UgYXJlIG92ZXJ3cml0aW5nIGFuIG9iamVjdCB3aXRoIGFuIG9iamVjdCwgZG8gYSBtZXJnZSBvZiB0aGUgcHJvcGVydGllcy5cbiAgICAgICAgICBiYXNlW2tleV0gPSBoZWxwZXJzLmNvbmZpZ01lcmdlKGJhc2VWYWwsIHZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGNhbiBqdXN0IG92ZXJ3cml0ZSB0aGUgdmFsdWUgaW4gdGhpcyBjYXNlXG4gICAgICAgICAgYmFzZVtrZXldID0gdmFsdWVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIGJhc2VcbiAgfVxuICBoZWxwZXJzLnNjYWxlTWVyZ2UgPSBmdW5jdGlvbiAoX2Jhc2UsIGV4dGVuc2lvbikge1xuICAgIHZhciBiYXNlID0gaGVscGVycy5jbG9uZShfYmFzZSlcblxuICAgIGhlbHBlcnMuZWFjaChleHRlbnNpb24sIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICBpZiAoa2V5ID09PSAneEF4ZXMnIHx8IGtleSA9PT0gJ3lBeGVzJykge1xuICAgICAgICAvLyBUaGVzZSBwcm9wZXJ0aWVzIGFyZSBhcnJheXMgb2YgaXRlbXNcbiAgICAgICAgaWYgKGJhc2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIGhlbHBlcnMuZWFjaCh2YWx1ZSwgZnVuY3Rpb24gKHZhbHVlT2JqLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGF4aXNUeXBlID0gaGVscGVycy5nZXRWYWx1ZU9yRGVmYXVsdCh2YWx1ZU9iai50eXBlLCBrZXkgPT09ICd4QXhlcycgPyAnY2F0ZWdvcnknIDogJ2xpbmVhcicpXG4gICAgICAgICAgICB2YXIgYXhpc0RlZmF1bHRzID0gQ2hhcnQuc2NhbGVTZXJ2aWNlLmdldFNjYWxlRGVmYXVsdHMoYXhpc1R5cGUpXG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gYmFzZVtrZXldLmxlbmd0aCB8fCAhYmFzZVtrZXldW2luZGV4XS50eXBlKSB7XG4gICAgICAgICAgICAgIGJhc2Vba2V5XS5wdXNoKGhlbHBlcnMuY29uZmlnTWVyZ2UoYXhpc0RlZmF1bHRzLCB2YWx1ZU9iaikpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlT2JqLnR5cGUgJiYgdmFsdWVPYmoudHlwZSAhPT0gYmFzZVtrZXldW2luZGV4XS50eXBlKSB7XG4gICAgICAgICAgICAgIC8vIFR5cGUgY2hhbmdlZC4gQnJpbmcgaW4gdGhlIG5ldyBkZWZhdWx0cyBiZWZvcmUgd2UgYnJpbmcgaW4gdmFsdWVPYmogc28gdGhhdCB2YWx1ZU9iaiBjYW4gb3ZlcnJpZGUgdGhlIGNvcnJlY3Qgc2NhbGUgZGVmYXVsdHNcbiAgICAgICAgICAgICAgYmFzZVtrZXldW2luZGV4XSA9IGhlbHBlcnMuY29uZmlnTWVyZ2UoYmFzZVtrZXldW2luZGV4XSwgYXhpc0RlZmF1bHRzLCB2YWx1ZU9iailcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFR5cGUgaXMgdGhlIHNhbWVcbiAgICAgICAgICAgICAgYmFzZVtrZXldW2luZGV4XSA9IGhlbHBlcnMuY29uZmlnTWVyZ2UoYmFzZVtrZXldW2luZGV4XSwgdmFsdWVPYmopXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiYXNlW2tleV0gPSBbXVxuICAgICAgICAgIGhlbHBlcnMuZWFjaCh2YWx1ZSwgZnVuY3Rpb24gKHZhbHVlT2JqKSB7XG4gICAgICAgICAgICB2YXIgYXhpc1R5cGUgPSBoZWxwZXJzLmdldFZhbHVlT3JEZWZhdWx0KHZhbHVlT2JqLnR5cGUsIGtleSA9PT0gJ3hBeGVzJyA/ICdjYXRlZ29yeScgOiAnbGluZWFyJylcbiAgICAgICAgICAgIGJhc2Vba2V5XS5wdXNoKGhlbHBlcnMuY29uZmlnTWVyZ2UoQ2hhcnQuc2NhbGVTZXJ2aWNlLmdldFNjYWxlRGVmYXVsdHMoYXhpc1R5cGUpLCB2YWx1ZU9iaikpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChiYXNlLmhhc093blByb3BlcnR5KGtleSkgJiYgdHlwZW9mIGJhc2Vba2V5XSA9PT0gJ29iamVjdCcgJiYgYmFzZVtrZXldICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gSWYgd2UgYXJlIG92ZXJ3cml0aW5nIGFuIG9iamVjdCB3aXRoIGFuIG9iamVjdCwgZG8gYSBtZXJnZSBvZiB0aGUgcHJvcGVydGllcy5cbiAgICAgICAgYmFzZVtrZXldID0gaGVscGVycy5jb25maWdNZXJnZShiYXNlW2tleV0sIHZhbHVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2FuIGp1c3Qgb3ZlcndyaXRlIHRoZSB2YWx1ZSBpbiB0aGlzIGNhc2VcbiAgICAgICAgYmFzZVtrZXldID0gdmFsdWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGJhc2VcbiAgfVxuICBoZWxwZXJzLmdldFZhbHVlQXRJbmRleE9yRGVmYXVsdCA9IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGRlZmF1bHRWYWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gZGVmYXVsdFZhbHVlXG4gICAgfVxuXG4gICAgaWYgKGhlbHBlcnMuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBpbmRleCA8IHZhbHVlLmxlbmd0aCA/IHZhbHVlW2luZGV4XSA6IGRlZmF1bHRWYWx1ZVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZVxuICB9XG4gIGhlbHBlcnMuZ2V0VmFsdWVPckRlZmF1bHQgPSBmdW5jdGlvbiAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFZhbHVlIDogdmFsdWVcbiAgfVxuICBoZWxwZXJzLmluZGV4T2YgPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZlxuICAgID8gZnVuY3Rpb24gKGFycmF5LCBpdGVtKSB7XG4gICAgICByZXR1cm4gYXJyYXkuaW5kZXhPZihpdGVtKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIChhcnJheSwgaXRlbSkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGlsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBpbGVuOyArK2kpIHtcbiAgICAgICAgaWYgKGFycmF5W2ldID09PSBpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICBoZWxwZXJzLndoZXJlID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGZpbHRlckNhbGxiYWNrKSB7XG4gICAgaWYgKGhlbHBlcnMuaXNBcnJheShjb2xsZWN0aW9uKSAmJiBBcnJheS5wcm90b3R5cGUuZmlsdGVyKSB7XG4gICAgICByZXR1cm4gY29sbGVjdGlvbi5maWx0ZXIoZmlsdGVyQ2FsbGJhY2spXG4gICAgfVxuICAgIHZhciBmaWx0ZXJlZCA9IFtdXG5cbiAgICBoZWxwZXJzLmVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIGlmIChmaWx0ZXJDYWxsYmFjayhpdGVtKSkge1xuICAgICAgICBmaWx0ZXJlZC5wdXNoKGl0ZW0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBmaWx0ZXJlZFxuICB9XG4gIGhlbHBlcnMuZmluZEluZGV4ID0gQXJyYXkucHJvdG90eXBlLmZpbmRJbmRleFxuICAgID8gZnVuY3Rpb24gKGFycmF5LCBjYWxsYmFjaywgc2NvcGUpIHtcbiAgICAgIHJldHVybiBhcnJheS5maW5kSW5kZXgoY2FsbGJhY2ssIHNjb3BlKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIChhcnJheSwgY2FsbGJhY2ssIHNjb3BlKSB7XG4gICAgICBzY29wZSA9IHNjb3BlID09PSB1bmRlZmluZWQgPyBhcnJheSA6IHNjb3BlXG4gICAgICBmb3IgKHZhciBpID0gMCwgaWxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGlsZW47ICsraSkge1xuICAgICAgICBpZiAoY2FsbGJhY2suY2FsbChzY29wZSwgYXJyYXlbaV0sIGksIGFycmF5KSkge1xuICAgICAgICAgIHJldHVybiBpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgaGVscGVycy5maW5kTmV4dFdoZXJlID0gZnVuY3Rpb24gKGFycmF5VG9TZWFyY2gsIGZpbHRlckNhbGxiYWNrLCBzdGFydEluZGV4KSB7XG4gICAgLy8gRGVmYXVsdCB0byBzdGFydCBvZiB0aGUgYXJyYXlcbiAgICBpZiAoc3RhcnRJbmRleCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0SW5kZXggPT09IG51bGwpIHtcbiAgICAgIHN0YXJ0SW5kZXggPSAtMVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gc3RhcnRJbmRleCArIDE7IGkgPCBhcnJheVRvU2VhcmNoLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY3VycmVudEl0ZW0gPSBhcnJheVRvU2VhcmNoW2ldXG4gICAgICBpZiAoZmlsdGVyQ2FsbGJhY2soY3VycmVudEl0ZW0pKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50SXRlbVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLmZpbmRQcmV2aW91c1doZXJlID0gZnVuY3Rpb24gKGFycmF5VG9TZWFyY2gsIGZpbHRlckNhbGxiYWNrLCBzdGFydEluZGV4KSB7XG4gICAgLy8gRGVmYXVsdCB0byBlbmQgb2YgdGhlIGFycmF5XG4gICAgaWYgKHN0YXJ0SW5kZXggPT09IHVuZGVmaW5lZCB8fCBzdGFydEluZGV4ID09PSBudWxsKSB7XG4gICAgICBzdGFydEluZGV4ID0gYXJyYXlUb1NlYXJjaC5sZW5ndGhcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGN1cnJlbnRJdGVtID0gYXJyYXlUb1NlYXJjaFtpXVxuICAgICAgaWYgKGZpbHRlckNhbGxiYWNrKGN1cnJlbnRJdGVtKSkge1xuICAgICAgICByZXR1cm4gY3VycmVudEl0ZW1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaGVscGVycy5pbmhlcml0cyA9IGZ1bmN0aW9uIChleHRlbnNpb25zKSB7XG4gICAgLy8gQmFzaWMgamF2YXNjcmlwdCBpbmhlcml0YW5jZSBiYXNlZCBvbiB0aGUgbW9kZWwgY3JlYXRlZCBpbiBCYWNrYm9uZS5qc1xuICAgIHZhciBtZSA9IHRoaXNcbiAgICB2YXIgQ2hhcnRFbGVtZW50ID0gKGV4dGVuc2lvbnMgJiYgZXh0ZW5zaW9ucy5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSkgPyBleHRlbnNpb25zLmNvbnN0cnVjdG9yIDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9XG5cbiAgICB2YXIgU3Vycm9nYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jb25zdHJ1Y3RvciA9IENoYXJ0RWxlbWVudFxuICAgIH1cbiAgICBTdXJyb2dhdGUucHJvdG90eXBlID0gbWUucHJvdG90eXBlXG4gICAgQ2hhcnRFbGVtZW50LnByb3RvdHlwZSA9IG5ldyBTdXJyb2dhdGUoKVxuXG4gICAgQ2hhcnRFbGVtZW50LmV4dGVuZCA9IGhlbHBlcnMuaW5oZXJpdHNcblxuICAgIGlmIChleHRlbnNpb25zKSB7XG4gICAgICBoZWxwZXJzLmV4dGVuZChDaGFydEVsZW1lbnQucHJvdG90eXBlLCBleHRlbnNpb25zKVxuICAgIH1cblxuICAgIENoYXJ0RWxlbWVudC5fX3N1cGVyX18gPSBtZS5wcm90b3R5cGVcblxuICAgIHJldHVybiBDaGFydEVsZW1lbnRcbiAgfVxuICBoZWxwZXJzLm5vb3AgPSBmdW5jdGlvbiAoKSB7fVxuICBoZWxwZXJzLnVpZCA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGlkID0gMFxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaWQrK1xuICAgIH1cbiAgfSgpKVxuICAvLyAtLSBNYXRoIG1ldGhvZHNcbiAgaGVscGVycy5pc051bWJlciA9IGZ1bmN0aW9uIChuKSB7XG4gICAgcmV0dXJuICFpc05hTihwYXJzZUZsb2F0KG4pKSAmJiBpc0Zpbml0ZShuKVxuICB9XG4gIGhlbHBlcnMuYWxtb3N0RXF1YWxzID0gZnVuY3Rpb24gKHgsIHksIGVwc2lsb24pIHtcbiAgICByZXR1cm4gTWF0aC5hYnMoeCAtIHkpIDwgZXBzaWxvblxuICB9XG4gIGhlbHBlcnMuYWxtb3N0V2hvbGUgPSBmdW5jdGlvbiAoeCwgZXBzaWxvbikge1xuICAgIHZhciByb3VuZGVkID0gTWF0aC5yb3VuZCh4KVxuICAgIHJldHVybiAoKChyb3VuZGVkIC0gZXBzaWxvbikgPCB4KSAmJiAoKHJvdW5kZWQgKyBlcHNpbG9uKSA+IHgpKVxuICB9XG4gIGhlbHBlcnMubWF4ID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgcmV0dXJuIGFycmF5LnJlZHVjZShmdW5jdGlvbiAobWF4LCB2YWx1ZSkge1xuICAgICAgaWYgKCFpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KG1heCwgdmFsdWUpXG4gICAgICB9XG4gICAgICByZXR1cm4gbWF4XG4gICAgfSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKVxuICB9XG4gIGhlbHBlcnMubWluID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgcmV0dXJuIGFycmF5LnJlZHVjZShmdW5jdGlvbiAobWluLCB2YWx1ZSkge1xuICAgICAgaWYgKCFpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKG1pbiwgdmFsdWUpXG4gICAgICB9XG4gICAgICByZXR1cm4gbWluXG4gICAgfSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxuICB9XG4gIGhlbHBlcnMuc2lnbiA9IE1hdGguc2lnblxuICAgID8gZnVuY3Rpb24gKHgpIHtcbiAgICAgIHJldHVybiBNYXRoLnNpZ24oeClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiAoeCkge1xuICAgICAgeCA9ICt4IC8vIGNvbnZlcnQgdG8gYSBudW1iZXJcbiAgICAgIGlmICh4ID09PSAwIHx8IGlzTmFOKHgpKSB7XG4gICAgICAgIHJldHVybiB4XG4gICAgICB9XG4gICAgICByZXR1cm4geCA+IDAgPyAxIDogLTFcbiAgICB9XG4gIGhlbHBlcnMubG9nMTAgPSBNYXRoLmxvZzEwXG4gICAgPyBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIE1hdGgubG9nMTAoeClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIE1hdGgubG9nKHgpIC8gTWF0aC5MTjEwXG4gICAgfVxuICBoZWxwZXJzLnRvUmFkaWFucyA9IGZ1bmN0aW9uIChkZWdyZWVzKSB7XG4gICAgcmV0dXJuIGRlZ3JlZXMgKiAoTWF0aC5QSSAvIDE4MClcbiAgfVxuICBoZWxwZXJzLnRvRGVncmVlcyA9IGZ1bmN0aW9uIChyYWRpYW5zKSB7XG4gICAgcmV0dXJuIHJhZGlhbnMgKiAoMTgwIC8gTWF0aC5QSSlcbiAgfVxuICAvLyBHZXRzIHRoZSBhbmdsZSBmcm9tIHZlcnRpY2FsIHVwcmlnaHQgdG8gdGhlIHBvaW50IGFib3V0IGEgY2VudHJlLlxuICBoZWxwZXJzLmdldEFuZ2xlRnJvbVBvaW50ID0gZnVuY3Rpb24gKGNlbnRyZVBvaW50LCBhbmdsZVBvaW50KSB7XG4gICAgdmFyIGRpc3RhbmNlRnJvbVhDZW50ZXIgPSBhbmdsZVBvaW50LnggLSBjZW50cmVQb2ludC54LFxuICAgICAgZGlzdGFuY2VGcm9tWUNlbnRlciA9IGFuZ2xlUG9pbnQueSAtIGNlbnRyZVBvaW50LnksXG4gICAgICByYWRpYWxEaXN0YW5jZUZyb21DZW50ZXIgPSBNYXRoLnNxcnQoZGlzdGFuY2VGcm9tWENlbnRlciAqIGRpc3RhbmNlRnJvbVhDZW50ZXIgKyBkaXN0YW5jZUZyb21ZQ2VudGVyICogZGlzdGFuY2VGcm9tWUNlbnRlcilcblxuICAgIHZhciBhbmdsZSA9IE1hdGguYXRhbjIoZGlzdGFuY2VGcm9tWUNlbnRlciwgZGlzdGFuY2VGcm9tWENlbnRlcilcblxuICAgIGlmIChhbmdsZSA8ICgtMC41ICogTWF0aC5QSSkpIHtcbiAgICAgIGFuZ2xlICs9IDIuMCAqIE1hdGguUEkgLy8gbWFrZSBzdXJlIHRoZSByZXR1cm5lZCBhbmdsZSBpcyBpbiB0aGUgcmFuZ2Ugb2YgKC1QSS8yLCAzUEkvMl1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgYW5nbGU6IGFuZ2xlLFxuICAgICAgZGlzdGFuY2U6IHJhZGlhbERpc3RhbmNlRnJvbUNlbnRlclxuICAgIH1cbiAgfVxuICBoZWxwZXJzLmRpc3RhbmNlQmV0d2VlblBvaW50cyA9IGZ1bmN0aW9uIChwdDEsIHB0Mikge1xuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3cocHQyLnggLSBwdDEueCwgMikgKyBNYXRoLnBvdyhwdDIueSAtIHB0MS55LCAyKSlcbiAgfVxuICBoZWxwZXJzLmFsaWFzUGl4ZWwgPSBmdW5jdGlvbiAocGl4ZWxXaWR0aCkge1xuICAgIHJldHVybiAocGl4ZWxXaWR0aCAlIDIgPT09IDApID8gMCA6IDAuNVxuICB9XG4gIGhlbHBlcnMuc3BsaW5lQ3VydmUgPSBmdW5jdGlvbiAoZmlyc3RQb2ludCwgbWlkZGxlUG9pbnQsIGFmdGVyUG9pbnQsIHQpIHtcbiAgICAvLyBQcm9wcyB0byBSb2IgU3BlbmNlciBhdCBzY2FsZWQgaW5ub3ZhdGlvbiBmb3IgaGlzIHBvc3Qgb24gc3BsaW5pbmcgYmV0d2VlbiBwb2ludHNcbiAgICAvLyBodHRwOi8vc2NhbGVkaW5ub3ZhdGlvbi5jb20vYW5hbHl0aWNzL3NwbGluZXMvYWJvdXRTcGxpbmVzLmh0bWxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gbXVzdCBhbHNvIHJlc3BlY3QgXCJza2lwcGVkXCIgcG9pbnRzXG5cbiAgICB2YXIgcHJldmlvdXMgPSBmaXJzdFBvaW50LnNraXAgPyBtaWRkbGVQb2ludCA6IGZpcnN0UG9pbnQsXG4gICAgICBjdXJyZW50ID0gbWlkZGxlUG9pbnQsXG4gICAgICBuZXh0ID0gYWZ0ZXJQb2ludC5za2lwID8gbWlkZGxlUG9pbnQgOiBhZnRlclBvaW50XG5cbiAgICB2YXIgZDAxID0gTWF0aC5zcXJ0KE1hdGgucG93KGN1cnJlbnQueCAtIHByZXZpb3VzLngsIDIpICsgTWF0aC5wb3coY3VycmVudC55IC0gcHJldmlvdXMueSwgMikpXG4gICAgdmFyIGQxMiA9IE1hdGguc3FydChNYXRoLnBvdyhuZXh0LnggLSBjdXJyZW50LngsIDIpICsgTWF0aC5wb3cobmV4dC55IC0gY3VycmVudC55LCAyKSlcblxuICAgIHZhciBzMDEgPSBkMDEgLyAoZDAxICsgZDEyKVxuICAgIHZhciBzMTIgPSBkMTIgLyAoZDAxICsgZDEyKVxuXG4gICAgLy8gSWYgYWxsIHBvaW50cyBhcmUgdGhlIHNhbWUsIHMwMSAmIHMwMiB3aWxsIGJlIGluZlxuICAgIHMwMSA9IGlzTmFOKHMwMSkgPyAwIDogczAxXG4gICAgczEyID0gaXNOYU4oczEyKSA/IDAgOiBzMTJcblxuICAgIHZhciBmYSA9IHQgKiBzMDEgLy8gc2NhbGluZyBmYWN0b3IgZm9yIHRyaWFuZ2xlIFRhXG4gICAgdmFyIGZiID0gdCAqIHMxMlxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHByZXZpb3VzOiB7XG4gICAgICAgIHg6IGN1cnJlbnQueCAtIGZhICogKG5leHQueCAtIHByZXZpb3VzLngpLFxuICAgICAgICB5OiBjdXJyZW50LnkgLSBmYSAqIChuZXh0LnkgLSBwcmV2aW91cy55KVxuICAgICAgfSxcbiAgICAgIG5leHQ6IHtcbiAgICAgICAgeDogY3VycmVudC54ICsgZmIgKiAobmV4dC54IC0gcHJldmlvdXMueCksXG4gICAgICAgIHk6IGN1cnJlbnQueSArIGZiICogKG5leHQueSAtIHByZXZpb3VzLnkpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGhlbHBlcnMuRVBTSUxPTiA9IE51bWJlci5FUFNJTE9OIHx8IDFlLTE0XG4gIGhlbHBlcnMuc3BsaW5lQ3VydmVNb25vdG9uZSA9IGZ1bmN0aW9uIChwb2ludHMpIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGNhbGN1bGF0ZXMgQsOpemllciBjb250cm9sIHBvaW50cyBpbiBhIHNpbWlsYXIgd2F5IHRoYW4gfHNwbGluZUN1cnZlfCxcbiAgICAvLyBidXQgcHJlc2VydmVzIG1vbm90b25pY2l0eSBvZiB0aGUgcHJvdmlkZWQgZGF0YSBhbmQgZW5zdXJlcyBubyBsb2NhbCBleHRyZW11bXMgYXJlIGFkZGVkXG4gICAgLy8gYmV0d2VlbiB0aGUgZGF0YXNldCBkaXNjcmV0ZSBwb2ludHMgZHVlIHRvIHRoZSBpbnRlcnBvbGF0aW9uLlxuICAgIC8vIFNlZSA6IGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01vbm90b25lX2N1YmljX2ludGVycG9sYXRpb25cblxuICAgIHZhciBwb2ludHNXaXRoVGFuZ2VudHMgPSAocG9pbnRzIHx8IFtdKS5tYXAoZnVuY3Rpb24gKHBvaW50KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtb2RlbDogcG9pbnQuX21vZGVsLFxuICAgICAgICBkZWx0YUs6IDAsXG4gICAgICAgIG1LOiAwXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIENhbGN1bGF0ZSBzbG9wZXMgKGRlbHRhSykgYW5kIGluaXRpYWxpemUgdGFuZ2VudHMgKG1LKVxuICAgIHZhciBwb2ludHNMZW4gPSBwb2ludHNXaXRoVGFuZ2VudHMubGVuZ3RoXG4gICAgdmFyIGksIHBvaW50QmVmb3JlLCBwb2ludEN1cnJlbnQsIHBvaW50QWZ0ZXJcbiAgICBmb3IgKGkgPSAwOyBpIDwgcG9pbnRzTGVuOyArK2kpIHtcbiAgICAgIHBvaW50Q3VycmVudCA9IHBvaW50c1dpdGhUYW5nZW50c1tpXVxuICAgICAgaWYgKHBvaW50Q3VycmVudC5tb2RlbC5za2lwKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHBvaW50QmVmb3JlID0gaSA+IDAgPyBwb2ludHNXaXRoVGFuZ2VudHNbaSAtIDFdIDogbnVsbFxuICAgICAgcG9pbnRBZnRlciA9IGkgPCBwb2ludHNMZW4gLSAxID8gcG9pbnRzV2l0aFRhbmdlbnRzW2kgKyAxXSA6IG51bGxcbiAgICAgIGlmIChwb2ludEFmdGVyICYmICFwb2ludEFmdGVyLm1vZGVsLnNraXApIHtcbiAgICAgICAgdmFyIHNsb3BlRGVsdGFYID0gKHBvaW50QWZ0ZXIubW9kZWwueCAtIHBvaW50Q3VycmVudC5tb2RlbC54KVxuXG4gICAgICAgIC8vIEluIHRoZSBjYXNlIG9mIHR3byBwb2ludHMgdGhhdCBhcHBlYXIgYXQgdGhlIHNhbWUgeCBwaXhlbCwgc2xvcGVEZWx0YVggaXMgMFxuICAgICAgICBwb2ludEN1cnJlbnQuZGVsdGFLID0gc2xvcGVEZWx0YVggIT09IDAgPyAocG9pbnRBZnRlci5tb2RlbC55IC0gcG9pbnRDdXJyZW50Lm1vZGVsLnkpIC8gc2xvcGVEZWx0YVggOiAwXG4gICAgICB9XG5cbiAgICAgIGlmICghcG9pbnRCZWZvcmUgfHwgcG9pbnRCZWZvcmUubW9kZWwuc2tpcCkge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgICB9IGVsc2UgaWYgKCFwb2ludEFmdGVyIHx8IHBvaW50QWZ0ZXIubW9kZWwuc2tpcCkge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSBwb2ludEJlZm9yZS5kZWx0YUtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zaWduKHBvaW50QmVmb3JlLmRlbHRhSykgIT09IHRoaXMuc2lnbihwb2ludEN1cnJlbnQuZGVsdGFLKSkge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSAwXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSAocG9pbnRCZWZvcmUuZGVsdGFLICsgcG9pbnRDdXJyZW50LmRlbHRhSykgLyAyXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRqdXN0IHRhbmdlbnRzIHRvIGVuc3VyZSBtb25vdG9uaWMgcHJvcGVydGllc1xuICAgIHZhciBhbHBoYUssIGJldGFLLCB0YXVLLCBzcXVhcmVkTWFnbml0dWRlXG4gICAgZm9yIChpID0gMDsgaSA8IHBvaW50c0xlbiAtIDE7ICsraSkge1xuICAgICAgcG9pbnRDdXJyZW50ID0gcG9pbnRzV2l0aFRhbmdlbnRzW2ldXG4gICAgICBwb2ludEFmdGVyID0gcG9pbnRzV2l0aFRhbmdlbnRzW2kgKyAxXVxuICAgICAgaWYgKHBvaW50Q3VycmVudC5tb2RlbC5za2lwIHx8IHBvaW50QWZ0ZXIubW9kZWwuc2tpcCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAoaGVscGVycy5hbG1vc3RFcXVhbHMocG9pbnRDdXJyZW50LmRlbHRhSywgMCwgdGhpcy5FUFNJTE9OKSkge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSBwb2ludEFmdGVyLm1LID0gMFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBhbHBoYUsgPSBwb2ludEN1cnJlbnQubUsgLyBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgICBiZXRhSyA9IHBvaW50QWZ0ZXIubUsgLyBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgICBzcXVhcmVkTWFnbml0dWRlID0gTWF0aC5wb3coYWxwaGFLLCAyKSArIE1hdGgucG93KGJldGFLLCAyKVxuICAgICAgaWYgKHNxdWFyZWRNYWduaXR1ZGUgPD0gOSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB0YXVLID0gMyAvIE1hdGguc3FydChzcXVhcmVkTWFnbml0dWRlKVxuICAgICAgcG9pbnRDdXJyZW50Lm1LID0gYWxwaGFLICogdGF1SyAqIHBvaW50Q3VycmVudC5kZWx0YUtcbiAgICAgIHBvaW50QWZ0ZXIubUsgPSBiZXRhSyAqIHRhdUsgKiBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgfVxuXG4gICAgLy8gQ29tcHV0ZSBjb250cm9sIHBvaW50c1xuICAgIHZhciBkZWx0YVhcbiAgICBmb3IgKGkgPSAwOyBpIDwgcG9pbnRzTGVuOyArK2kpIHtcbiAgICAgIHBvaW50Q3VycmVudCA9IHBvaW50c1dpdGhUYW5nZW50c1tpXVxuICAgICAgaWYgKHBvaW50Q3VycmVudC5tb2RlbC5za2lwKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHBvaW50QmVmb3JlID0gaSA+IDAgPyBwb2ludHNXaXRoVGFuZ2VudHNbaSAtIDFdIDogbnVsbFxuICAgICAgcG9pbnRBZnRlciA9IGkgPCBwb2ludHNMZW4gLSAxID8gcG9pbnRzV2l0aFRhbmdlbnRzW2kgKyAxXSA6IG51bGxcbiAgICAgIGlmIChwb2ludEJlZm9yZSAmJiAhcG9pbnRCZWZvcmUubW9kZWwuc2tpcCkge1xuICAgICAgICBkZWx0YVggPSAocG9pbnRDdXJyZW50Lm1vZGVsLnggLSBwb2ludEJlZm9yZS5tb2RlbC54KSAvIDNcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1vZGVsLmNvbnRyb2xQb2ludFByZXZpb3VzWCA9IHBvaW50Q3VycmVudC5tb2RlbC54IC0gZGVsdGFYXG4gICAgICAgIHBvaW50Q3VycmVudC5tb2RlbC5jb250cm9sUG9pbnRQcmV2aW91c1kgPSBwb2ludEN1cnJlbnQubW9kZWwueSAtIGRlbHRhWCAqIHBvaW50Q3VycmVudC5tS1xuICAgICAgfVxuICAgICAgaWYgKHBvaW50QWZ0ZXIgJiYgIXBvaW50QWZ0ZXIubW9kZWwuc2tpcCkge1xuICAgICAgICBkZWx0YVggPSAocG9pbnRBZnRlci5tb2RlbC54IC0gcG9pbnRDdXJyZW50Lm1vZGVsLngpIC8gM1xuICAgICAgICBwb2ludEN1cnJlbnQubW9kZWwuY29udHJvbFBvaW50TmV4dFggPSBwb2ludEN1cnJlbnQubW9kZWwueCArIGRlbHRhWFxuICAgICAgICBwb2ludEN1cnJlbnQubW9kZWwuY29udHJvbFBvaW50TmV4dFkgPSBwb2ludEN1cnJlbnQubW9kZWwueSArIGRlbHRhWCAqIHBvaW50Q3VycmVudC5tS1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLm5leHRJdGVtID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGluZGV4LCBsb29wKSB7XG4gICAgaWYgKGxvb3ApIHtcbiAgICAgIHJldHVybiBpbmRleCA+PSBjb2xsZWN0aW9uLmxlbmd0aCAtIDEgPyBjb2xsZWN0aW9uWzBdIDogY29sbGVjdGlvbltpbmRleCArIDFdXG4gICAgfVxuICAgIHJldHVybiBpbmRleCA+PSBjb2xsZWN0aW9uLmxlbmd0aCAtIDEgPyBjb2xsZWN0aW9uW2NvbGxlY3Rpb24ubGVuZ3RoIC0gMV0gOiBjb2xsZWN0aW9uW2luZGV4ICsgMV1cbiAgfVxuICBoZWxwZXJzLnByZXZpb3VzSXRlbSA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBpbmRleCwgbG9vcCkge1xuICAgIGlmIChsb29wKSB7XG4gICAgICByZXR1cm4gaW5kZXggPD0gMCA/IGNvbGxlY3Rpb25bY29sbGVjdGlvbi5sZW5ndGggLSAxXSA6IGNvbGxlY3Rpb25baW5kZXggLSAxXVxuICAgIH1cbiAgICByZXR1cm4gaW5kZXggPD0gMCA/IGNvbGxlY3Rpb25bMF0gOiBjb2xsZWN0aW9uW2luZGV4IC0gMV1cbiAgfVxuICAvLyBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgbmljZSBudW1iZXIgYWxnb3JpdGhtIHVzZWQgaW4gZGV0ZXJtaW5pbmcgd2hlcmUgYXhpcyBsYWJlbHMgd2lsbCBnb1xuICBoZWxwZXJzLm5pY2VOdW0gPSBmdW5jdGlvbiAocmFuZ2UsIHJvdW5kKSB7XG4gICAgdmFyIGV4cG9uZW50ID0gTWF0aC5mbG9vcihoZWxwZXJzLmxvZzEwKHJhbmdlKSlcbiAgICB2YXIgZnJhY3Rpb24gPSByYW5nZSAvIE1hdGgucG93KDEwLCBleHBvbmVudClcbiAgICB2YXIgbmljZUZyYWN0aW9uXG5cbiAgICBpZiAocm91bmQpIHtcbiAgICAgIGlmIChmcmFjdGlvbiA8IDEuNSkge1xuICAgICAgICBuaWNlRnJhY3Rpb24gPSAxXG4gICAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDwgMykge1xuICAgICAgICBuaWNlRnJhY3Rpb24gPSAyXG4gICAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDwgNykge1xuICAgICAgICBuaWNlRnJhY3Rpb24gPSA1XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuaWNlRnJhY3Rpb24gPSAxMFxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPD0gMS4wKSB7XG4gICAgICBuaWNlRnJhY3Rpb24gPSAxXG4gICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8PSAyKSB7XG4gICAgICBuaWNlRnJhY3Rpb24gPSAyXG4gICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8PSA1KSB7XG4gICAgICBuaWNlRnJhY3Rpb24gPSA1XG4gICAgfSBlbHNlIHtcbiAgICAgIG5pY2VGcmFjdGlvbiA9IDEwXG4gICAgfVxuXG4gICAgcmV0dXJuIG5pY2VGcmFjdGlvbiAqIE1hdGgucG93KDEwLCBleHBvbmVudClcbiAgfVxuICAvLyBFYXNpbmcgZnVuY3Rpb25zIGFkYXB0ZWQgZnJvbSBSb2JlcnQgUGVubmVyJ3MgZWFzaW5nIGVxdWF0aW9uc1xuICAvLyBodHRwOi8vd3d3LnJvYmVydHBlbm5lci5jb20vZWFzaW5nL1xuICB2YXIgZWFzaW5nRWZmZWN0cyA9IGhlbHBlcnMuZWFzaW5nRWZmZWN0cyA9IHtcbiAgICBsaW5lYXI6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gdFxuICAgIH0sXG4gICAgZWFzZUluUXVhZDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiB0ICogdFxuICAgIH0sXG4gICAgZWFzZU91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gLTEgKiB0ICogKHQgLSAyKVxuICAgIH0sXG4gICAgZWFzZUluT3V0UXVhZDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqIHQgKiB0XG4gICAgICB9XG4gICAgICByZXR1cm4gLTEgLyAyICogKCgtLXQpICogKHQgLSAyKSAtIDEpXG4gICAgfSxcbiAgICBlYXNlSW5DdWJpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiB0ICogdCAqIHRcbiAgICB9LFxuICAgIGVhc2VPdXRDdWJpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxICogKCh0ID0gdCAvIDEgLSAxKSAqIHQgKiB0ICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dEN1YmljOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogdCAqIHQgKiB0XG4gICAgICB9XG4gICAgICByZXR1cm4gMSAvIDIgKiAoKHQgLT0gMikgKiB0ICogdCArIDIpXG4gICAgfSxcbiAgICBlYXNlSW5RdWFydDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiB0ICogdCAqIHQgKiB0XG4gICAgfSxcbiAgICBlYXNlT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gLTEgKiAoKHQgPSB0IC8gMSAtIDEpICogdCAqIHQgKiB0IC0gMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dFF1YXJ0OiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogdCAqIHQgKiB0ICogdFxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xIC8gMiAqICgodCAtPSAyKSAqIHQgKiB0ICogdCAtIDIpXG4gICAgfSxcbiAgICBlYXNlSW5RdWludDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxICogKHQgLz0gMSkgKiB0ICogdCAqIHQgKiB0XG4gICAgfSxcbiAgICBlYXNlT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gMSAqICgodCA9IHQgLyAxIC0gMSkgKiB0ICogdCAqIHQgKiB0ICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dFF1aW50OiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogdCAqIHQgKiB0ICogdCAqIHRcbiAgICAgIH1cbiAgICAgIHJldHVybiAxIC8gMiAqICgodCAtPSAyKSAqIHQgKiB0ICogdCAqIHQgKyAyKVxuICAgIH0sXG4gICAgZWFzZUluU2luZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAtMSAqIE1hdGguY29zKHQgLyAxICogKE1hdGguUEkgLyAyKSkgKyAxXG4gICAgfSxcbiAgICBlYXNlT3V0U2luZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxICogTWF0aC5zaW4odCAvIDEgKiAoTWF0aC5QSSAvIDIpKVxuICAgIH0sXG4gICAgZWFzZUluT3V0U2luZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAtMSAvIDIgKiAoTWF0aC5jb3MoTWF0aC5QSSAqIHQgLyAxKSAtIDEpXG4gICAgfSxcbiAgICBlYXNlSW5FeHBvOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuICh0ID09PSAwKSA/IDEgOiAxICogTWF0aC5wb3coMiwgMTAgKiAodCAvIDEgLSAxKSlcbiAgICB9LFxuICAgIGVhc2VPdXRFeHBvOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuICh0ID09PSAxKSA/IDEgOiAxICogKC1NYXRoLnBvdygyLCAtMTAgKiB0IC8gMSkgKyAxKVxuICAgIH0sXG4gICAgZWFzZUluT3V0RXhwbzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICh0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgICBpZiAodCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogTWF0aC5wb3coMiwgMTAgKiAodCAtIDEpKVxuICAgICAgfVxuICAgICAgcmV0dXJuIDEgLyAyICogKC1NYXRoLnBvdygyLCAtMTAgKiAtLXQpICsgMilcbiAgICB9LFxuICAgIGVhc2VJbkNpcmM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAodCA+PSAxKSB7XG4gICAgICAgIHJldHVybiB0XG4gICAgICB9XG4gICAgICByZXR1cm4gLTEgKiAoTWF0aC5zcXJ0KDEgLSAodCAvPSAxKSAqIHQpIC0gMSlcbiAgICB9LFxuICAgIGVhc2VPdXRDaXJjOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgKiBNYXRoLnNxcnQoMSAtICh0ID0gdCAvIDEgLSAxKSAqIHQpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRDaXJjOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIC0xIC8gMiAqIChNYXRoLnNxcnQoMSAtIHQgKiB0KSAtIDEpXG4gICAgICB9XG4gICAgICByZXR1cm4gMSAvIDIgKiAoTWF0aC5zcXJ0KDEgLSAodCAtPSAyKSAqIHQpICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbkVsYXN0aWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIHZhciBwID0gMFxuICAgICAgdmFyIGEgPSAxXG4gICAgICBpZiAodCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuICAgICAgaWYgKCh0IC89IDEpID09PSAxKSB7XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9XG4gICAgICBpZiAoIXApIHtcbiAgICAgICAgcCA9IDEgKiAwLjNcbiAgICAgIH1cbiAgICAgIGlmIChhIDwgTWF0aC5hYnMoMSkpIHtcbiAgICAgICAgYSA9IDFcbiAgICAgICAgcyA9IHAgLyA0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzID0gcCAvICgyICogTWF0aC5QSSkgKiBNYXRoLmFzaW4oMSAvIGEpXG4gICAgICB9XG4gICAgICByZXR1cm4gLShhICogTWF0aC5wb3coMiwgMTAgKiAodCAtPSAxKSkgKiBNYXRoLnNpbigodCAqIDEgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSlcbiAgICB9LFxuICAgIGVhc2VPdXRFbGFzdGljOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICB2YXIgcCA9IDBcbiAgICAgIHZhciBhID0gMVxuICAgICAgaWYgKHQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cbiAgICAgIGlmICgodCAvPSAxKSA9PT0gMSkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgaWYgKCFwKSB7XG4gICAgICAgIHAgPSAxICogMC4zXG4gICAgICB9XG4gICAgICBpZiAoYSA8IE1hdGguYWJzKDEpKSB7XG4gICAgICAgIGEgPSAxXG4gICAgICAgIHMgPSBwIC8gNFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcyA9IHAgLyAoMiAqIE1hdGguUEkpICogTWF0aC5hc2luKDEgLyBhKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGEgKiBNYXRoLnBvdygyLCAtMTAgKiB0KSAqIE1hdGguc2luKCh0ICogMSAtIHMpICogKDIgKiBNYXRoLlBJKSAvIHApICsgMVxuICAgIH0sXG4gICAgZWFzZUluT3V0RWxhc3RpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgdmFyIHAgPSAwXG4gICAgICB2YXIgYSA9IDFcbiAgICAgIGlmICh0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpID09PSAyKSB7XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9XG4gICAgICBpZiAoIXApIHtcbiAgICAgICAgcCA9IDEgKiAoMC4zICogMS41KVxuICAgICAgfVxuICAgICAgaWYgKGEgPCBNYXRoLmFicygxKSkge1xuICAgICAgICBhID0gMVxuICAgICAgICBzID0gcCAvIDRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMgPSBwIC8gKDIgKiBNYXRoLlBJKSAqIE1hdGguYXNpbigxIC8gYSlcbiAgICAgIH1cbiAgICAgIGlmICh0IDwgMSkge1xuICAgICAgICByZXR1cm4gLTAuNSAqIChhICogTWF0aC5wb3coMiwgMTAgKiAodCAtPSAxKSkgKiBNYXRoLnNpbigodCAqIDEgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBhICogTWF0aC5wb3coMiwgLTEwICogKHQgLT0gMSkpICogTWF0aC5zaW4oKHQgKiAxIC0gcykgKiAoMiAqIE1hdGguUEkpIC8gcCkgKiAwLjUgKyAxXG4gICAgfSxcbiAgICBlYXNlSW5CYWNrOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICByZXR1cm4gMSAqICh0IC89IDEpICogdCAqICgocyArIDEpICogdCAtIHMpXG4gICAgfSxcbiAgICBlYXNlT3V0QmFjazogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgcmV0dXJuIDEgKiAoKHQgPSB0IC8gMSAtIDEpICogdCAqICgocyArIDEpICogdCArIHMpICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dEJhY2s6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqICh0ICogdCAqICgoKHMgKj0gKDEuNTI1KSkgKyAxKSAqIHQgLSBzKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAxIC8gMiAqICgodCAtPSAyKSAqIHQgKiAoKChzICo9ICgxLjUyNSkpICsgMSkgKiB0ICsgcykgKyAyKVxuICAgIH0sXG4gICAgZWFzZUluQm91bmNlOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgLSBlYXNpbmdFZmZlY3RzLmVhc2VPdXRCb3VuY2UoMSAtIHQpXG4gICAgfSxcbiAgICBlYXNlT3V0Qm91bmNlOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEpIDwgKDEgLyAyLjc1KSkge1xuICAgICAgICByZXR1cm4gMSAqICg3LjU2MjUgKiB0ICogdClcbiAgICAgIH0gZWxzZSBpZiAodCA8ICgyIC8gMi43NSkpIHtcbiAgICAgICAgcmV0dXJuIDEgKiAoNy41NjI1ICogKHQgLT0gKDEuNSAvIDIuNzUpKSAqIHQgKyAwLjc1KVxuICAgICAgfSBlbHNlIGlmICh0IDwgKDIuNSAvIDIuNzUpKSB7XG4gICAgICAgIHJldHVybiAxICogKDcuNTYyNSAqICh0IC09ICgyLjI1IC8gMi43NSkpICogdCArIDAuOTM3NSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAxICogKDcuNTYyNSAqICh0IC09ICgyLjYyNSAvIDIuNzUpKSAqIHQgKyAwLjk4NDM3NSlcbiAgICB9LFxuICAgIGVhc2VJbk91dEJvdW5jZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICh0IDwgMSAvIDIpIHtcbiAgICAgICAgcmV0dXJuIGVhc2luZ0VmZmVjdHMuZWFzZUluQm91bmNlKHQgKiAyKSAqIDAuNVxuICAgICAgfVxuICAgICAgcmV0dXJuIGVhc2luZ0VmZmVjdHMuZWFzZU91dEJvdW5jZSh0ICogMiAtIDEpICogMC41ICsgMSAqIDAuNVxuICAgIH1cbiAgfVxuICAvLyBSZXF1ZXN0IGFuaW1hdGlvbiBwb2x5ZmlsbCAtIGh0dHA6Ly93d3cucGF1bGlyaXNoLmNvbS8yMDExL3JlcXVlc3RhbmltYXRpb25mcmFtZS1mb3Itc21hcnQtYW5pbWF0aW5nL1xuICAvLyBoZWxwZXJzLnJlcXVlc3RBbmltRnJhbWUgPSAoZnVuY3Rpb24oKSB7XG4gIC8vICAgICByZXR1cm4gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAvLyAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgLy8gICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gIC8vICAgICAgICAgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgLy8gICAgICAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgLy8gICAgICAgICBmdW5jdGlvbihjYWxsYmFjaykge1xuICAvLyAgICAgICAgICAgICByZXR1cm4gd2luZG93LnNldFRpbWVvdXQoY2FsbGJhY2ssIDEwMDAgLyA2MClcbiAgLy8gICAgICAgICB9XG4gIC8vIH0oKSlcbiAgLy8gLS0gRE9NIG1ldGhvZHNcbiAgaGVscGVycy5nZXRSZWxhdGl2ZVBvc2l0aW9uID0gZnVuY3Rpb24gKGV2dCwgY2hhcnQpIHtcbiAgICB2YXIgbW91c2VYLCBtb3VzZVlcbiAgICB2YXIgZSA9IGV2dC5vcmlnaW5hbEV2ZW50IHx8IGV2dCxcbiAgICAgIGNhbnZhcyA9IGV2dC5jdXJyZW50VGFyZ2V0IHx8IGV2dC5zcmNFbGVtZW50LFxuICAgICAgYm91bmRpbmdSZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cbiAgICB2YXIgdG91Y2hlcyA9IGUudG91Y2hlc1xuICAgIGlmICh0b3VjaGVzICYmIHRvdWNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgbW91c2VYID0gdG91Y2hlc1swXS5jbGllbnRYXG4gICAgICBtb3VzZVkgPSB0b3VjaGVzWzBdLmNsaWVudFlcbiAgICB9IGVsc2Uge1xuICAgICAgbW91c2VYID0gZS5jbGllbnRYXG4gICAgICBtb3VzZVkgPSBlLmNsaWVudFlcbiAgICB9XG5cbiAgICAvLyBTY2FsZSBtb3VzZSBjb29yZGluYXRlcyBpbnRvIGNhbnZhcyBjb29yZGluYXRlc1xuICAgIC8vIGJ5IGZvbGxvd2luZyB0aGUgcGF0dGVybiBsYWlkIG91dCBieSAnamVycnlqJyBpbiB0aGUgY29tbWVudHMgb2ZcbiAgICAvLyBodHRwOi8vd3d3Lmh0bWw1Y2FudmFzdHV0b3JpYWxzLmNvbS9hZHZhbmNlZC9odG1sNS1jYW52YXMtbW91c2UtY29vcmRpbmF0ZXMvXG4gICAgdmFyIHBhZGRpbmdMZWZ0ID0gcGFyc2VGbG9hdChoZWxwZXJzLmdldFN0eWxlKGNhbnZhcywgJ3BhZGRpbmctbGVmdCcpKVxuICAgIHZhciBwYWRkaW5nVG9wID0gcGFyc2VGbG9hdChoZWxwZXJzLmdldFN0eWxlKGNhbnZhcywgJ3BhZGRpbmctdG9wJykpXG4gICAgdmFyIHBhZGRpbmdSaWdodCA9IHBhcnNlRmxvYXQoaGVscGVycy5nZXRTdHlsZShjYW52YXMsICdwYWRkaW5nLXJpZ2h0JykpXG4gICAgdmFyIHBhZGRpbmdCb3R0b20gPSBwYXJzZUZsb2F0KGhlbHBlcnMuZ2V0U3R5bGUoY2FudmFzLCAncGFkZGluZy1ib3R0b20nKSlcbiAgICB2YXIgd2lkdGggPSBib3VuZGluZ1JlY3QucmlnaHQgLSBib3VuZGluZ1JlY3QubGVmdCAtIHBhZGRpbmdMZWZ0IC0gcGFkZGluZ1JpZ2h0XG4gICAgdmFyIGhlaWdodCA9IGJvdW5kaW5nUmVjdC5ib3R0b20gLSBib3VuZGluZ1JlY3QudG9wIC0gcGFkZGluZ1RvcCAtIHBhZGRpbmdCb3R0b21cblxuICAgIC8vIFdlIGRpdmlkZSBieSB0aGUgY3VycmVudCBkZXZpY2UgcGl4ZWwgcmF0aW8sIGJlY2F1c2UgdGhlIGNhbnZhcyBpcyBzY2FsZWQgdXAgYnkgdGhhdCBhbW91bnQgaW4gZWFjaCBkaXJlY3Rpb24uIEhvd2V2ZXJcbiAgICAvLyB0aGUgYmFja2VuZCBtb2RlbCBpcyBpbiB1bnNjYWxlZCBjb29yZGluYXRlcy4gU2luY2Ugd2UgYXJlIGdvaW5nIHRvIGRlYWwgd2l0aCBvdXIgbW9kZWwgY29vcmRpbmF0ZXMsIHdlIGdvIGJhY2sgaGVyZVxuICAgIG1vdXNlWCA9IE1hdGgucm91bmQoKG1vdXNlWCAtIGJvdW5kaW5nUmVjdC5sZWZ0IC0gcGFkZGluZ0xlZnQpIC8gKHdpZHRoKSAqIGNhbnZhcy53aWR0aCAvIGNoYXJ0LmN1cnJlbnREZXZpY2VQaXhlbFJhdGlvKVxuICAgIG1vdXNlWSA9IE1hdGgucm91bmQoKG1vdXNlWSAtIGJvdW5kaW5nUmVjdC50b3AgLSBwYWRkaW5nVG9wKSAvIChoZWlnaHQpICogY2FudmFzLmhlaWdodCAvIGNoYXJ0LmN1cnJlbnREZXZpY2VQaXhlbFJhdGlvKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IG1vdXNlWCxcbiAgICAgIHk6IG1vdXNlWVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLmFkZEV2ZW50ID0gZnVuY3Rpb24gKG5vZGUsIGV2ZW50VHlwZSwgbWV0aG9kKSB7XG4gICAgaWYgKG5vZGUuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgbWV0aG9kKVxuICAgIH0gZWxzZSBpZiAobm9kZS5hdHRhY2hFdmVudCkge1xuICAgICAgbm9kZS5hdHRhY2hFdmVudCgnb24nICsgZXZlbnRUeXBlLCBtZXRob2QpXG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGVbJ29uJyArIGV2ZW50VHlwZV0gPSBtZXRob2RcbiAgICB9XG4gIH1cbiAgaGVscGVycy5yZW1vdmVFdmVudCA9IGZ1bmN0aW9uIChub2RlLCBldmVudFR5cGUsIGhhbmRsZXIpIHtcbiAgICBpZiAobm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBoYW5kbGVyLCBmYWxzZSlcbiAgICB9IGVsc2UgaWYgKG5vZGUuZGV0YWNoRXZlbnQpIHtcbiAgICAgIG5vZGUuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgaGFuZGxlcilcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZVsnb24nICsgZXZlbnRUeXBlXSA9IGhlbHBlcnMubm9vcFxuICAgIH1cbiAgfVxuXG4gIC8vIFByaXZhdGUgaGVscGVyIGZ1bmN0aW9uIHRvIGNvbnZlcnQgbWF4LXdpZHRoL21heC1oZWlnaHQgdmFsdWVzIHRoYXQgbWF5IGJlIHBlcmNlbnRhZ2VzIGludG8gYSBudW1iZXJcbiAgZnVuY3Rpb24gcGFyc2VNYXhTdHlsZSAoc3R5bGVWYWx1ZSwgbm9kZSwgcGFyZW50UHJvcGVydHkpIHtcbiAgICB2YXIgdmFsdWVJblBpeGVsc1xuICAgIGlmICh0eXBlb2YgKHN0eWxlVmFsdWUpID09PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWVJblBpeGVscyA9IHBhcnNlSW50KHN0eWxlVmFsdWUsIDEwKVxuXG4gICAgICBpZiAoc3R5bGVWYWx1ZS5pbmRleE9mKCclJykgIT09IC0xKSB7XG4gICAgICAgIC8vIHBlcmNlbnRhZ2UgKiBzaXplIGluIGRpbWVuc2lvblxuICAgICAgICB2YWx1ZUluUGl4ZWxzID0gdmFsdWVJblBpeGVscyAvIDEwMCAqIG5vZGUucGFyZW50Tm9kZVtwYXJlbnRQcm9wZXJ0eV1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWVJblBpeGVscyA9IHN0eWxlVmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWVJblBpeGVsc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgdGhlIGdpdmVuIHZhbHVlIGNvbnRhaW5zIGFuIGVmZmVjdGl2ZSBjb25zdHJhaW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gaXNDb25zdHJhaW5lZFZhbHVlICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSAnbm9uZSdcbiAgfVxuXG4gIC8vIFByaXZhdGUgaGVscGVyIHRvIGdldCBhIGNvbnN0cmFpbnQgZGltZW5zaW9uXG4gIC8vIEBwYXJhbSBkb21Ob2RlIDogdGhlIG5vZGUgdG8gY2hlY2sgdGhlIGNvbnN0cmFpbnQgb25cbiAgLy8gQHBhcmFtIG1heFN0eWxlIDogdGhlIHN0eWxlIHRoYXQgZGVmaW5lcyB0aGUgbWF4aW11bSBmb3IgdGhlIGRpcmVjdGlvbiB3ZSBhcmUgdXNpbmcgKG1heFdpZHRoIC8gbWF4SGVpZ2h0KVxuICAvLyBAcGFyYW0gcGVyY2VudGFnZVByb3BlcnR5IDogcHJvcGVydHkgb2YgcGFyZW50IHRvIHVzZSB3aGVuIGNhbGN1bGF0aW5nIHdpZHRoIGFzIGEgcGVyY2VudGFnZVxuICAvLyBAc2VlIGh0dHA6Ly93d3cubmF0aGFuYWVsam9uZXMuY29tL2Jsb2cvMjAxMy9yZWFkaW5nLW1heC13aWR0aC1jcm9zcy1icm93c2VyXG4gIGZ1bmN0aW9uIGdldENvbnN0cmFpbnREaW1lbnNpb24gKGRvbU5vZGUsIG1heFN0eWxlLCBwZXJjZW50YWdlUHJvcGVydHkpIHtcbiAgICB2YXIgdmlldyA9IGRvY3VtZW50LmRlZmF1bHRWaWV3XG4gICAgdmFyIHBhcmVudE5vZGUgPSBkb21Ob2RlLnBhcmVudE5vZGVcbiAgICB2YXIgY29uc3RyYWluZWROb2RlID0gdmlldy5nZXRDb21wdXRlZFN0eWxlKGRvbU5vZGUpW21heFN0eWxlXVxuICAgIHZhciBjb25zdHJhaW5lZENvbnRhaW5lciA9IHZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShwYXJlbnROb2RlKVttYXhTdHlsZV1cbiAgICB2YXIgaGFzQ05vZGUgPSBpc0NvbnN0cmFpbmVkVmFsdWUoY29uc3RyYWluZWROb2RlKVxuICAgIHZhciBoYXNDQ29udGFpbmVyID0gaXNDb25zdHJhaW5lZFZhbHVlKGNvbnN0cmFpbmVkQ29udGFpbmVyKVxuICAgIHZhciBpbmZpbml0eSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuXG4gICAgaWYgKGhhc0NOb2RlIHx8IGhhc0NDb250YWluZXIpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbihcbiAgICAgICAgaGFzQ05vZGUgPyBwYXJzZU1heFN0eWxlKGNvbnN0cmFpbmVkTm9kZSwgZG9tTm9kZSwgcGVyY2VudGFnZVByb3BlcnR5KSA6IGluZmluaXR5LFxuICAgICAgICBoYXNDQ29udGFpbmVyID8gcGFyc2VNYXhTdHlsZShjb25zdHJhaW5lZENvbnRhaW5lciwgcGFyZW50Tm9kZSwgcGVyY2VudGFnZVByb3BlcnR5KSA6IGluZmluaXR5KVxuICAgIH1cblxuICAgIHJldHVybiAnbm9uZSdcbiAgfVxuICAvLyByZXR1cm5zIE51bWJlciBvciB1bmRlZmluZWQgaWYgbm8gY29uc3RyYWludFxuICBoZWxwZXJzLmdldENvbnN0cmFpbnRXaWR0aCA9IGZ1bmN0aW9uIChkb21Ob2RlKSB7XG4gICAgcmV0dXJuIGdldENvbnN0cmFpbnREaW1lbnNpb24oZG9tTm9kZSwgJ21heC13aWR0aCcsICdjbGllbnRXaWR0aCcpXG4gIH1cbiAgLy8gcmV0dXJucyBOdW1iZXIgb3IgdW5kZWZpbmVkIGlmIG5vIGNvbnN0cmFpbnRcbiAgaGVscGVycy5nZXRDb25zdHJhaW50SGVpZ2h0ID0gZnVuY3Rpb24gKGRvbU5vZGUpIHtcbiAgICByZXR1cm4gZ2V0Q29uc3RyYWludERpbWVuc2lvbihkb21Ob2RlLCAnbWF4LWhlaWdodCcsICdjbGllbnRIZWlnaHQnKVxuICB9XG4gIGhlbHBlcnMuZ2V0TWF4aW11bVdpZHRoID0gZnVuY3Rpb24gKGRvbU5vZGUpIHtcbiAgICB2YXIgY29udGFpbmVyID0gZG9tTm9kZS5wYXJlbnROb2RlXG4gICAgdmFyIHBhZGRpbmdMZWZ0ID0gcGFyc2VJbnQoaGVscGVycy5nZXRTdHlsZShjb250YWluZXIsICdwYWRkaW5nLWxlZnQnKSwgMTApXG4gICAgdmFyIHBhZGRpbmdSaWdodCA9IHBhcnNlSW50KGhlbHBlcnMuZ2V0U3R5bGUoY29udGFpbmVyLCAncGFkZGluZy1yaWdodCcpLCAxMClcbiAgICB2YXIgdyA9IGNvbnRhaW5lci5jbGllbnRXaWR0aCAtIHBhZGRpbmdMZWZ0IC0gcGFkZGluZ1JpZ2h0XG4gICAgdmFyIGN3ID0gaGVscGVycy5nZXRDb25zdHJhaW50V2lkdGgoZG9tTm9kZSlcbiAgICByZXR1cm4gaXNOYU4oY3cpID8gdyA6IE1hdGgubWluKHcsIGN3KVxuICB9XG4gIGhlbHBlcnMuZ2V0TWF4aW11bUhlaWdodCA9IGZ1bmN0aW9uIChkb21Ob2RlKSB7XG4gICAgdmFyIGNvbnRhaW5lciA9IGRvbU5vZGUucGFyZW50Tm9kZVxuICAgIHZhciBwYWRkaW5nVG9wID0gcGFyc2VJbnQoaGVscGVycy5nZXRTdHlsZShjb250YWluZXIsICdwYWRkaW5nLXRvcCcpLCAxMClcbiAgICB2YXIgcGFkZGluZ0JvdHRvbSA9IHBhcnNlSW50KGhlbHBlcnMuZ2V0U3R5bGUoY29udGFpbmVyLCAncGFkZGluZy1ib3R0b20nKSwgMTApXG4gICAgdmFyIGggPSBjb250YWluZXIuY2xpZW50SGVpZ2h0IC0gcGFkZGluZ1RvcCAtIHBhZGRpbmdCb3R0b21cbiAgICB2YXIgY2ggPSBoZWxwZXJzLmdldENvbnN0cmFpbnRIZWlnaHQoZG9tTm9kZSlcbiAgICByZXR1cm4gaXNOYU4oY2gpID8gaCA6IE1hdGgubWluKGgsIGNoKVxuICB9XG4gIGhlbHBlcnMuZ2V0U3R5bGUgPSBmdW5jdGlvbiAoZWwsIHByb3BlcnR5KSB7XG4gICAgcmV0dXJuIGVsLmN1cnJlbnRTdHlsZVxuICAgICAgPyBlbC5jdXJyZW50U3R5bGVbcHJvcGVydHldXG4gICAgICA6IGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpLmdldFByb3BlcnR5VmFsdWUocHJvcGVydHkpXG4gIH1cbiAgaGVscGVycy5yZXRpbmFTY2FsZSA9IGZ1bmN0aW9uIChjaGFydCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgeyByZXR1cm4gJ3RoaXMgaXMgc2VydmVyJyB9XG5cbiAgICB2YXIgcGl4ZWxSYXRpbyA9IGNoYXJ0LmN1cnJlbnREZXZpY2VQaXhlbFJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMVxuICAgIGlmIChwaXhlbFJhdGlvID09PSAxKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgY2FudmFzID0gY2hhcnQuY2FudmFzXG4gICAgdmFyIGhlaWdodCA9IGNoYXJ0LmhlaWdodFxuICAgIHZhciB3aWR0aCA9IGNoYXJ0LndpZHRoXG5cbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0ICogcGl4ZWxSYXRpb1xuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoICogcGl4ZWxSYXRpb1xuICAgIGNoYXJ0LmN0eC5zY2FsZShwaXhlbFJhdGlvLCBwaXhlbFJhdGlvKVxuXG4gICAgLy8gSWYgbm8gc3R5bGUgaGFzIGJlZW4gc2V0IG9uIHRoZSBjYW52YXMsIHRoZSByZW5kZXIgc2l6ZSBpcyB1c2VkIGFzIGRpc3BsYXkgc2l6ZSxcbiAgICAvLyBtYWtpbmcgdGhlIGNoYXJ0IHZpc3VhbGx5IGJpZ2dlciwgc28gbGV0J3MgZW5mb3JjZSBpdCB0byB0aGUgXCJjb3JyZWN0XCIgdmFsdWVzLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vY2hhcnRqcy9DaGFydC5qcy9pc3N1ZXMvMzU3NVxuICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnXG4gICAgY2FudmFzLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnXG4gIH1cbiAgLy8gLS0gQ2FudmFzIG1ldGhvZHNcbiAgaGVscGVycy5jbGVhciA9IGZ1bmN0aW9uIChjaGFydCkge1xuICAgIGNoYXJ0LmN0eC5jbGVhclJlY3QoMCwgMCwgY2hhcnQud2lkdGgsIGNoYXJ0LmhlaWdodClcbiAgfVxuICBoZWxwZXJzLmZvbnRTdHJpbmcgPSBmdW5jdGlvbiAocGl4ZWxTaXplLCBmb250U3R5bGUsIGZvbnRGYW1pbHkpIHtcbiAgICByZXR1cm4gZm9udFN0eWxlICsgJyAnICsgcGl4ZWxTaXplICsgJ3B4ICcgKyBmb250RmFtaWx5XG4gIH1cbiAgaGVscGVycy5sb25nZXN0VGV4dCA9IGZ1bmN0aW9uIChjdHgsIGZvbnQsIGFycmF5T2ZUaGluZ3MsIGNhY2hlKSB7XG4gICAgY2FjaGUgPSBjYWNoZSB8fCB7fVxuICAgIHZhciBkYXRhID0gY2FjaGUuZGF0YSA9IGNhY2hlLmRhdGEgfHwge31cbiAgICB2YXIgZ2MgPSBjYWNoZS5nYXJiYWdlQ29sbGVjdCA9IGNhY2hlLmdhcmJhZ2VDb2xsZWN0IHx8IFtdXG5cbiAgICBpZiAoY2FjaGUuZm9udCAhPT0gZm9udCkge1xuICAgICAgZGF0YSA9IGNhY2hlLmRhdGEgPSB7fVxuICAgICAgZ2MgPSBjYWNoZS5nYXJiYWdlQ29sbGVjdCA9IFtdXG4gICAgICBjYWNoZS5mb250ID0gZm9udFxuICAgIH1cblxuICAgIGN0eC5mb250ID0gZm9udFxuICAgIHZhciBsb25nZXN0ID0gMFxuICAgIGhlbHBlcnMuZWFjaChhcnJheU9mVGhpbmdzLCBmdW5jdGlvbiAodGhpbmcpIHtcbiAgICAgIC8vIFVuZGVmaW5lZCBzdHJpbmdzIGFuZCBhcnJheXMgc2hvdWxkIG5vdCBiZSBtZWFzdXJlZFxuICAgICAgaWYgKHRoaW5nICE9PSB1bmRlZmluZWQgJiYgdGhpbmcgIT09IG51bGwgJiYgaGVscGVycy5pc0FycmF5KHRoaW5nKSAhPT0gdHJ1ZSkge1xuICAgICAgICBsb25nZXN0ID0gaGVscGVycy5tZWFzdXJlVGV4dChjdHgsIGRhdGEsIGdjLCBsb25nZXN0LCB0aGluZylcbiAgICAgIH0gZWxzZSBpZiAoaGVscGVycy5pc0FycmF5KHRoaW5nKSkge1xuICAgICAgICAvLyBpZiBpdCBpcyBhbiBhcnJheSBsZXRzIG1lYXN1cmUgZWFjaCBlbGVtZW50XG4gICAgICAgIC8vIHRvIGRvIG1heWJlIHNpbXBsaWZ5IHRoaXMgZnVuY3Rpb24gYSBiaXQgc28gd2UgY2FuIGRvIHRoaXMgbW9yZSByZWN1cnNpdmVseT9cbiAgICAgICAgaGVscGVycy5lYWNoKHRoaW5nLCBmdW5jdGlvbiAobmVzdGVkVGhpbmcpIHtcbiAgICAgICAgICAvLyBVbmRlZmluZWQgc3RyaW5ncyBhbmQgYXJyYXlzIHNob3VsZCBub3QgYmUgbWVhc3VyZWRcbiAgICAgICAgICBpZiAobmVzdGVkVGhpbmcgIT09IHVuZGVmaW5lZCAmJiBuZXN0ZWRUaGluZyAhPT0gbnVsbCAmJiAhaGVscGVycy5pc0FycmF5KG5lc3RlZFRoaW5nKSkge1xuICAgICAgICAgICAgbG9uZ2VzdCA9IGhlbHBlcnMubWVhc3VyZVRleHQoY3R4LCBkYXRhLCBnYywgbG9uZ2VzdCwgbmVzdGVkVGhpbmcpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB2YXIgZ2NMZW4gPSBnYy5sZW5ndGggLyAyXG4gICAgaWYgKGdjTGVuID4gYXJyYXlPZlRoaW5ncy5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2NMZW47IGkrKykge1xuICAgICAgICBkZWxldGUgZGF0YVtnY1tpXV1cbiAgICAgIH1cbiAgICAgIGdjLnNwbGljZSgwLCBnY0xlbilcbiAgICB9XG4gICAgcmV0dXJuIGxvbmdlc3RcbiAgfVxuICBoZWxwZXJzLm1lYXN1cmVUZXh0ID0gZnVuY3Rpb24gKGN0eCwgZGF0YSwgZ2MsIGxvbmdlc3QsIHN0cmluZykge1xuICAgIHZhciB0ZXh0V2lkdGggPSBkYXRhW3N0cmluZ11cbiAgICBpZiAoIXRleHRXaWR0aCkge1xuICAgICAgdGV4dFdpZHRoID0gZGF0YVtzdHJpbmddID0gY3R4Lm1lYXN1cmVUZXh0KHN0cmluZykud2lkdGhcbiAgICAgIGdjLnB1c2goc3RyaW5nKVxuICAgIH1cbiAgICBpZiAodGV4dFdpZHRoID4gbG9uZ2VzdCkge1xuICAgICAgbG9uZ2VzdCA9IHRleHRXaWR0aFxuICAgIH1cbiAgICByZXR1cm4gbG9uZ2VzdFxuICB9XG4gIGhlbHBlcnMubnVtYmVyT2ZMYWJlbExpbmVzID0gZnVuY3Rpb24gKGFycmF5T2ZUaGluZ3MpIHtcbiAgICB2YXIgbnVtYmVyT2ZMaW5lcyA9IDFcbiAgICBoZWxwZXJzLmVhY2goYXJyYXlPZlRoaW5ncywgZnVuY3Rpb24gKHRoaW5nKSB7XG4gICAgICBpZiAoaGVscGVycy5pc0FycmF5KHRoaW5nKSkge1xuICAgICAgICBpZiAodGhpbmcubGVuZ3RoID4gbnVtYmVyT2ZMaW5lcykge1xuICAgICAgICAgIG51bWJlck9mTGluZXMgPSB0aGluZy5sZW5ndGhcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIG51bWJlck9mTGluZXNcbiAgfVxuICBoZWxwZXJzLmRyYXdSb3VuZGVkUmVjdGFuZ2xlID0gZnVuY3Rpb24gKGN0eCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgcmFkaXVzKSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgY3R4Lm1vdmVUbyh4ICsgcmFkaXVzLCB5KVxuICAgIGN0eC5saW5lVG8oeCArIHdpZHRoIC0gcmFkaXVzLCB5KVxuICAgIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKHggKyB3aWR0aCwgeSwgeCArIHdpZHRoLCB5ICsgcmFkaXVzKVxuICAgIGN0eC5saW5lVG8oeCArIHdpZHRoLCB5ICsgaGVpZ2h0IC0gcmFkaXVzKVxuICAgIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKHggKyB3aWR0aCwgeSArIGhlaWdodCwgeCArIHdpZHRoIC0gcmFkaXVzLCB5ICsgaGVpZ2h0KVxuICAgIGN0eC5saW5lVG8oeCArIHJhZGl1cywgeSArIGhlaWdodClcbiAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4LCB5ICsgaGVpZ2h0LCB4LCB5ICsgaGVpZ2h0IC0gcmFkaXVzKVxuICAgIGN0eC5saW5lVG8oeCwgeSArIHJhZGl1cylcbiAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4LCB5LCB4ICsgcmFkaXVzLCB5KVxuICAgIGN0eC5jbG9zZVBhdGgoKVxuICB9XG4gIGhlbHBlcnMuY29sb3IgPSBmdW5jdGlvbiAoYykge1xuICAgIGlmICghY29sb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvbG9yLmpzIG5vdCBmb3VuZCEnKVxuICAgICAgcmV0dXJuIGNcbiAgICB9XG5cbiAgICAvKiBnbG9iYWwgQ2FudmFzR3JhZGllbnQgKi9cbiAgICBpZiAoYyBpbnN0YW5jZW9mIENhbnZhc0dyYWRpZW50KSB7XG4gICAgICByZXR1cm4gY29sb3IoQ2hhcnQuZGVmYXVsdHMuZ2xvYmFsLmRlZmF1bHRDb2xvcilcbiAgICB9XG5cbiAgICByZXR1cm4gY29sb3IoYylcbiAgfVxuICBoZWxwZXJzLmlzQXJyYXkgPSBBcnJheS5pc0FycmF5XG4gICAgPyBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShvYmopXG4gICAgfVxuICAgIDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgfVxuICAvLyAhIEBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTQ4NTM5NzRcbiAgaGVscGVycy5hcnJheUVxdWFscyA9IGZ1bmN0aW9uIChhMCwgYTEpIHtcbiAgICB2YXIgaSwgaWxlbiwgdjAsIHYxXG5cbiAgICBpZiAoIWEwIHx8ICFhMSB8fCBhMC5sZW5ndGggIT09IGExLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgZm9yIChpID0gMCwgaWxlbiA9IGEwLmxlbmd0aDsgaSA8IGlsZW47ICsraSkge1xuICAgICAgdjAgPSBhMFtpXVxuICAgICAgdjEgPSBhMVtpXVxuXG4gICAgICBpZiAodjAgaW5zdGFuY2VvZiBBcnJheSAmJiB2MSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGlmICghaGVscGVycy5hcnJheUVxdWFscyh2MCwgdjEpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodjAgIT09IHYxKSB7XG4gICAgICAgIC8vIE5PVEU6IHR3byBkaWZmZXJlbnQgb2JqZWN0IGluc3RhbmNlcyB3aWxsIG5ldmVyIGJlIGVxdWFsOiB7eDoyMH0gIT0ge3g6MjB9XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgaGVscGVycy5jYWxsQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZm4sIGFyZ3MsIF90QXJnKSB7XG4gICAgaWYgKGZuICYmIHR5cGVvZiBmbi5jYWxsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmbi5hcHBseShfdEFyZywgYXJncylcbiAgICB9XG4gIH1cbiAgaGVscGVycy5nZXRIb3ZlckNvbG9yID0gZnVuY3Rpb24gKGNvbG9yVmFsdWUpIHtcbiAgICAvKiBnbG9iYWwgQ2FudmFzUGF0dGVybiAqL1xuICAgIHJldHVybiAoY29sb3JWYWx1ZSBpbnN0YW5jZW9mIENhbnZhc1BhdHRlcm4pXG4gICAgICA/IGNvbG9yVmFsdWVcbiAgICAgIDogaGVscGVycy5jb2xvcihjb2xvclZhbHVlKS5zYXR1cmF0ZSgwLjUpLmRhcmtlbigwLjEpLnJnYlN0cmluZygpXG4gIH1cbn1cbiIsInZhciBOYXBjaGFydCA9IHJlcXVpcmUoJy4vaW5pdCcpKClcclxuXHJcbi8qIGhlbHBlciBmdW5jdGlvbnMgKi9cclxucmVxdWlyZSgnLi9oZWxwZXJzJykoTmFwY2hhcnQpXHJcbnJlcXVpcmUoJy4vZHJhdy9jYW52YXNIZWxwZXJzJykoTmFwY2hhcnQpXHJcblxyXG4vKiBjb25maWcgZmlsZXMgKi9cclxucmVxdWlyZSgnLi9jb25maWcnKShOYXBjaGFydClcclxuXHJcbi8qIHJlYWwgc2hpdCAqL1xyXG5yZXF1aXJlKCcuL2NoYXJ0JykoTmFwY2hhcnQpXHJcblxyXG4vKiBkcmF3aW5nICovXHJcbnJlcXVpcmUoJy4vc2hhcGUvc2hhcGUnKShOYXBjaGFydClcclxucmVxdWlyZSgnLi9kcmF3L2RyYXcnKShOYXBjaGFydClcclxuXHJcbi8qIG90aGVyIG1vZHVsZXMgKi9cclxucmVxdWlyZSgnLi9mYW5jeW1vZHVsZScpKE5hcGNoYXJ0KVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBOYXBjaGFydCIsIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgLy8gdmFyIGNvbmZpZyA9IGRlZmF1bHRzXHJcbiAgdmFyIE5hcGNoYXJ0ID0gZnVuY3Rpb24gKGl0ZW0sIGNvbmZpZykge1xyXG4gICAgdGhpcy5pbml0aWFsaXplKGl0ZW0sIGNvbmZpZylcclxuICAgIHJldHVybiB0aGlzXHJcbiAgfVxyXG5cclxuICByZXR1cm4gTmFwY2hhcnRcclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBzaGFwZSA9IFtcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2FyYycsXHJcbiAgICAgIHJhZGlhbnM6IE1hdGguUEkgLyA0XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgIG1pbnV0ZXM6IDIwMFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2FyYycsXHJcbiAgICAgIHJhZGlhbnM6IE1hdGguUElcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgbWludXRlczogMjAwXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnYXJjJyxcclxuICAgICAgcmFkaWFuczogTWF0aC5QSSAqIDMgLyA0XHJcbiAgICB9XHJcbiAgXVxyXG5cclxuICB2YXIgc2hhcGUgPSBbXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdhcmMnLFxyXG4gICAgICByYWRpYW5zOiBNYXRoLlBJICogMlxyXG4gICAgfVxyXG4gIF1cclxuXHJcbiAgZnVuY3Rpb24gY2FsY3VsYXRlU2hhcGUgKGNoYXJ0LCBzaGFwZSkge1xyXG4gICAgdmFyIG1pbnV0ZXNQcmVzZXJ2ZWRCeUxpbmUgPSAwXHJcbiAgICB2YXIgcmFkaXVzID0gMTAwXHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaGFwZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoc2hhcGVbaV0udHlwZSA9PSAnbGluZScpIHtcclxuICAgICAgICBtaW51dGVzUHJlc2VydmVkQnlMaW5lICs9IHNoYXBlW2ldLm1pbnV0ZXNcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzcGFjZUZvckFyY3MgPSAxNDQwIC0gbWludXRlc1ByZXNlcnZlZEJ5TGluZVxyXG4gICAgaWYgKHNwYWNlRm9yQXJjcyA8IDApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd0b28gbXVjaCBzcGFjZSBpcyBnaXZlbiB0byBzdHJhaWdodCBzZWdtZW50cyBpbiB0aGUgc2hhcGUnKVxyXG4gICAgfVxyXG5cclxuICAgIHZhciB0b3RhbFJhZGlhbnMgPSAwXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNoYXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHNoYXBlW2ldLmFuZ2xlID0gdG90YWxSYWRpYW5zXHJcblxyXG4gICAgICBpZiAoc2hhcGVbaV0udHlwZSA9PSAnYXJjJykge1xyXG4gICAgICAgIHRvdGFsUmFkaWFucyArPSBzaGFwZVtpXS5yYWRpYW5zXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGF0aExlbmd0aFBlck1pbnV0ZVxyXG4gICAgLy8gY2FsYy4gbWludXRlc1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaGFwZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoc2hhcGVbaV0udHlwZSA9PSAnYXJjJykge1xyXG4gICAgICAgIHNoYXBlW2ldLm1pbnV0ZXMgPSAoc2hhcGVbaV0ucmFkaWFucyAvIHRvdGFsUmFkaWFucykgKiBzcGFjZUZvckFyY3NcclxuXHJcbiAgICAgICAgLy8gZmluZCBwZXJpbWV0ZXIgb2Ygd2hvbGUgbWFpbiBjaXJjbGUsIHRoZW4gZmluZCBsZW5ndGggb2YgdGhpc1xyXG4gICAgICAgIHNoYXBlW2ldLnBhdGhMZW5ndGggPSByYWRpdXMgKiAyICogTWF0aC5QSSAqIChzaGFwZVtpXS5yYWRpYW5zIC8gKE1hdGguUEkgKiAyKSlcclxuXHJcbiAgICAgICAgLy8gb25seSBuZWVkIHRvIGRvIHRoaXMgb25jZVxyXG4gICAgICAgIGlmIChpID09IDApIHtcclxuICAgICAgICAgIHBhdGhMZW5ndGhQZXJNaW51dGUgPSBzaGFwZVtpXS5wYXRoTGVuZ3RoIC8gc2hhcGVbaV0ubWludXRlc1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2hhcGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHNoYXBlW2ldLnR5cGUgPT0gJ2xpbmUnKSB7XHJcbiAgICAgICAgc2hhcGVbaV0ucGF0aExlbmd0aCA9IHNoYXBlW2ldLm1pbnV0ZXMgKiBwYXRoTGVuZ3RoUGVyTWludXRlXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc3VtTWludXRlcyA9IDBcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2hhcGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgc2hhcGVbaV0uc3RhcnQgPSBzdW1NaW51dGVzXHJcbiAgICAgIHNoYXBlW2ldLmVuZCA9IHN1bU1pbnV0ZXMgKyBzaGFwZVtpXS5taW51dGVzXHJcblxyXG4gICAgICBzdW1NaW51dGVzICs9IHNoYXBlW2ldLm1pbnV0ZXNcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaW5kIGNlbnRyZXNcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2hhcGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgLy8gY29uc29sZS5sb2coaSlcclxuICAgICAgaWYgKGkgPT0gMCkge1xyXG4gICAgICAgIHNoYXBlW2ldLmNlbnRyZSA9IHtcclxuICAgICAgICAgIHg6IGNoYXJ0LncgLyAyLFxyXG4gICAgICAgICAgeTogY2hhcnQuaCAvIDJcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2hhcGVbaV0uY2VudHJlID0gc2hhcGVbaSAtIDFdLmVuZENlbnRyZVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2hhcGVbaV0udHlwZSA9PSAnbGluZScpIHtcclxuICAgICAgICBzaGFwZVtpXS5lbmRDZW50cmUgPSB7XHJcbiAgICAgICAgICB4OiBzaGFwZVtpXS5jZW50cmUueCArIE1hdGguY29zKHNoYXBlW2ldLmFuZ2xlKSAqIHNoYXBlW2ldLnBhdGhMZW5ndGgsXHJcbiAgICAgICAgICB5OiBzaGFwZVtpXS5jZW50cmUueSArIChNYXRoLnNpbihzaGFwZVtpXS5hbmdsZSkgKiBzaGFwZVtpXS5wYXRoTGVuZ3RoKVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzaGFwZVtpXS5lbmRDZW50cmUgPSBzaGFwZVtpXS5jZW50cmVcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzaGFwZVxyXG4gIH1cclxuXHJcbiAgTmFwY2hhcnQuc2hhcGUgPSBmdW5jdGlvbiAoY2hhcnQpIHtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICB9XHJcblxyXG4gIE5hcGNoYXJ0LmluaXRTaGFwZSA9IGZ1bmN0aW9uIChjaGFydCkge1xyXG4gICAgY2hhcnQuc2hhcGUgPSBjYWxjdWxhdGVTaGFwZShjaGFydCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzaGFwZSkpKVxyXG4gIH1cclxuXHJcbiAgTmFwY2hhcnQuc2hhcGUubWludXRlc1RvWFkgPSBmdW5jdGlvbiAoY2hhcnQsIG1pbnV0ZXMsIHJhZGl1cykge1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gICAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gICAgdmFyIGMgPSB7IC8vIGNlbnRlclxyXG4gICAgICB4OiBjaGFydC53IC8gMixcclxuICAgICAgeTogY2hhcnQuaCAvIDJcclxuICAgIH1cclxuICAgIHZhciByID0gcmFkaXVzXHJcblxyXG4gICAgdmFyIGN1bVJhZCA9IDBcclxuICAgIHZhciBub3dQb2ludCA9IHtcclxuICAgICAgeDogYy54LFxyXG4gICAgICB5OiBjLnkgLSByXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNoYXBlID0gY2hhcnQuc2hhcGVcclxuXHJcbiAgICAvLyBmaW5kIHdoaWNoIGJsb2NrIHdlIGFyZSBpblxyXG4gICAgdmFyIGJsb2NrXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNoYXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBlID0gc2hhcGVbaV1cclxuXHJcbiAgICAgIC8vIGlmIHN0YXJ0IGlzIGluc2lkZSB0aGlzIHNoYXBlQmxvY2tcclxuICAgICAgaWYgKGhlbHBlcnMuaXNJbnNpZGUobWludXRlcywgZS5zdGFydCwgZS5lbmQpKSB7XHJcbiAgICAgICAgYmxvY2sgPSBzaGFwZVtpXVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBjb25zb2xlLmxvZyhibG9jaylcclxuICAgIGlmIChibG9jay50eXBlID09ICdsaW5lJykge1xyXG4gICAgICBjb25zb2xlLmxvZygnYWxhcm0nKVxyXG4gICAgICB2YXIgbWludXRlSW5ibG9jayA9IGhlbHBlcnMuZ2V0UHJvZ3Jlc3NCZXR3ZWVuVHdvVmFsdWVzKG1pbnV0ZXMsIGJsb2NrLnN0YXJ0LCBibG9jay5lbmQpXHJcbiAgICAgIHZhciBwYXRoTGVuZ3RoID0gbWludXRlSW5ibG9jayAqIGJsb2NrLnBhdGhMZW5ndGhcclxuICAgICAgY29uc29sZS5sb2cocGF0aExlbmd0aClcclxuICAgICAgdmFyIGFuZ2xlID0gYmxvY2suYW5nbGUgLSBNYXRoLlBJIC8gMlxyXG4gICAgICB2YXIgcGxzID0ge1xyXG4gICAgICAgIHg6IE1hdGguY29zKGFuZ2xlKSAqIHBhdGhMZW5ndGgsXHJcbiAgICAgICAgeTogLU1hdGguc2luKGFuZ2xlKSAqIHBhdGhMZW5ndGhcclxuICAgICAgfVxyXG4gICAgICB2YXIgbyA9IHtcclxuICAgICAgICB4OiBNYXRoLmNvcyhhbmdsZSkgKiByICsgYmxvY2suY2VudHJlLnggKyBwbHMueCxcclxuICAgICAgICB5OiBNYXRoLnNpbihhbmdsZSkgKiByICsgYmxvY2suY2VudHJlLnkgKyBwbHMueVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGJsb2NrLnR5cGUgPT0gJ2FyYycpIHtcclxuICAgICAgdmFyIHJhZFN0YXJ0ID0gYmxvY2suYW5nbGUgLSBNYXRoLlBJIC8gMlxyXG4gICAgICB2YXIgcG9pbnRSYWQgPSBoZWxwZXJzLmdldFByb2dyZXNzQmV0d2VlblR3b1ZhbHVlcyhtaW51dGVzLCBibG9jay5zdGFydCwgYmxvY2suZW5kKSAqIGJsb2NrLnJhZGlhbnMgKyByYWRTdGFydFxyXG5cclxuICAgICAgdmFyIG8gPSB7XHJcbiAgICAgICAgeDogTWF0aC5jb3MocG9pbnRSYWQpICogciArIGJsb2NrLmNlbnRyZS54LFxyXG4gICAgICAgIHk6IE1hdGguc2luKHBvaW50UmFkKSAqIHIgKyBibG9jay5jZW50cmUueVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9cclxuICB9XHJcblxyXG4gIE5hcGNoYXJ0LnNoYXBlLmNyZWF0ZUN1cnZlID0gZnVuY3Rpb24gKGNoYXJ0LCByYWRpdXMsIHN0YXJ0LCBlbmQsIGFudGljbG9ja3dpc2UpIHtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAgIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG5cclxuICAgIHZhciBjID0ge1xyXG4gICAgICB4OiBjaGFydC53IC8gMixcclxuICAgICAgeTogY2hhcnQuaCAvIDJcclxuICAgIH1cclxuICAgIHZhciByID0gcmFkaXVzXHJcblxyXG4gICAgdmFyIGN1bVJhZCA9IDBcclxuICAgIHZhciBub3dQb2ludCA9IHtcclxuICAgICAgeDogYy54LFxyXG4gICAgICB5OiBjLnkgLSByXHJcbiAgICB9XHJcbiAgICB2YXIgc2hhcGUgPSBoZWxwZXJzLmNsb25lKGNoYXJ0LnNoYXBlKVxyXG4gICAgaWYgKGFudGljbG9ja3dpc2UpIHtcclxuICAgICAgc2hhcGUucmV2ZXJzZSgpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmluZCBzdGFydFxyXG4gICAgdmFyIHN0YXJ0QmxvY2ssIGVuZEJsb2NrXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNoYXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBlID0gc2hhcGVbaV1cclxuXHJcbiAgICAgIC8vIGlmIHN0YXJ0IGlzIGluc2lkZSB0aGlzIHNoYXBlQmxvY2tcclxuICAgICAgaWYgKGhlbHBlcnMuaXNJbnNpZGUoc3RhcnQsIGUuc3RhcnQsIGUuZW5kKSkge1xyXG4gICAgICAgIHN0YXJ0QmxvY2sgPSBpXHJcbiAgICAgIH1cclxuICAgICAgLy8gaWYgZW5kIGlzIGluc2lkZSB0aGlzIHNoYXBlQmxvY2tcclxuICAgICAgaWYgKGhlbHBlcnMuaXNJbnNpZGUoZW5kLCBlLnN0YXJ0LCBlLmVuZCkpIHtcclxuICAgICAgICBlbmRCbG9jayA9IGlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0ZSBpdGVyYWJsZSB0YXNrIGFycmF5XHJcbiAgICB2YXIgdGFza0FycmF5ID0gW11cclxuICAgIHZhciBza2lwRW5kQ2hlY2sgPSBmYWxzZVxyXG4gICAgdmFyIGRlZmF1bHRUYXNrXHJcbiAgICBpZiAoYW50aWNsb2Nrd2lzZSkge1xyXG4gICAgICBkZWZhdWx0VGFzayA9IHtcclxuICAgICAgICBzdGFydDogMSxcclxuICAgICAgICBlbmQ6IDBcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGVmYXVsdFRhc2sgPSB7XHJcbiAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgZW5kOiAxXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBpID0gc3RhcnRCbG9jazsgaSA8IHNoYXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciB0YXNrID0ge1xyXG4gICAgICAgIHNoYXBlOiBzaGFwZVtpXSxcclxuICAgICAgICBzdGFydDogZGVmYXVsdFRhc2suc3RhcnQsXHJcbiAgICAgICAgZW5kOiBkZWZhdWx0VGFzay5lbmRcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGkgPT0gc3RhcnRCbG9jaykge1xyXG4gICAgICAgIHRhc2suc3RhcnQgPSBoZWxwZXJzLmdldFByb2dyZXNzQmV0d2VlblR3b1ZhbHVlcyhzdGFydCwgc2hhcGVbaV0uc3RhcnQsIHNoYXBlW2ldLmVuZClcclxuICAgICAgfVxyXG4gICAgICBpZiAoaSA9PSBlbmRCbG9jaykge1xyXG4gICAgICAgIHRhc2suZW5kID0gaGVscGVycy5nZXRQcm9ncmVzc0JldHdlZW5Ud29WYWx1ZXMoZW5kLCBzaGFwZVtpXS5zdGFydCwgc2hhcGVbaV0uZW5kKVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpID09IHN0YXJ0QmxvY2sgJiYgaSA9PSBlbmRCbG9jayAmJiAodGFzay5lbmQgPiB0YXNrLnN0YXJ0ICYmIGFudGljbG9ja3dpc2UpIHx8ICh0YXNrLmVuZCA8IHRhc2suc3RhcnQgJiYgIWFudGljbG9ja3dpc2UpKSB7XHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoaW5ncyBhcmUgY29ycmVjdCB3aGVuIGVuZCBpcyBsZXNzIHRoYW4gc3RhcnRcclxuICAgICAgICBpZiAodGFza0FycmF5Lmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAvLyBpdCBpcyBiZWdpbm5pbmdcclxuICAgICAgICAgIHRhc2suZW5kID0gZGVmYXVsdFRhc2suZW5kXHJcbiAgICAgICAgICBza2lwRW5kQ2hlY2sgPSB0cnVlXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIGl0IGlzIGVuZFxyXG4gICAgICAgICAgdGFzay5zdGFydCA9IGRlZmF1bHRUYXNrLnN0YXJ0XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vXHJcbiAgICAgIC8vIHZhciBvbGRFbmQgPSB0YXNrLmVuZFxyXG4gICAgICAvLyB0YXNrLmVuZCA9IHRhc2suc3RhcnRcclxuICAgICAgLy8gdGFzay5zdGFydCA9IG9sZEVuZFxyXG5cclxuICAgICAgdGFza0FycmF5LnB1c2godGFzaylcclxuXHJcbiAgICAgIGlmIChpID09IGVuZEJsb2NrKSB7XHJcbiAgICAgICAgaWYgKHNraXBFbmRDaGVjaykge1xyXG4gICAgICAgICAgc2tpcEVuZENoZWNrID0gZmFsc2VcclxuICAgICAgICAvLyBsZXQgaXQgcnVuIGEgcm91bmQgYW5kIGFkZCBhbGwgc2hhcGVzXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIGZpbmlzaGVkLi4gbm90aGluZyBtb3JlIHRvIGRvIGhlcmUhXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgd2UgcmVhY2hlZCBlbmQgb2YgYXJyYXkgd2l0aG91dCBoYXZpbmcgZm91bmRcclxuICAgICAgLy8gdGhlIGVuZCBwb2ludCwgaXQgbWVhbnMgdGhhdCB3ZSBoYXZlIHRvIGdvIHRvXHJcbiAgICAgIC8vIHRoZSBiZWdpbm5pbmcgYWdhaW5cclxuICAgICAgLy8gZXguIHdoZW4gc3RhcnQ6NzAwIGVuZDozMDBcclxuICAgICAgaWYgKGkgPT0gc2hhcGUubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgIGkgPSAtMVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXNrQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIHNoYXBlID0gdGFza0FycmF5W2ldLnNoYXBlXHJcbiAgICAgIGlmIChzaGFwZS50eXBlID09ICdhcmMnKSB7XHJcbiAgICAgICAgdmFyIHNoYXBlU3RhcnQgPSBzaGFwZS5hbmdsZSAtIChNYXRoLlBJIC8gMilcclxuICAgICAgICB2YXIgc3RhcnQgPSBzaGFwZVN0YXJ0ICsgKHRhc2tBcnJheVtpXS5zdGFydCAqIHNoYXBlLnJhZGlhbnMpXHJcbiAgICAgICAgdmFyIGVuZCA9IHNoYXBlU3RhcnQgKyAodGFza0FycmF5W2ldLmVuZCAqIHNoYXBlLnJhZGlhbnMpXHJcbiAgICAgICAgY3R4LmFyYyhzaGFwZS5jZW50cmUueCwgc2hhcGUuY2VudHJlLnksIHIsIHN0YXJ0LCBlbmQsIGFudGljbG9ja3dpc2UpXHJcblxyXG4gICAgICAgIHZhciByYWROb3JtYWxpemUgPSBzaGFwZS5hbmdsZSArIHNoYXBlLnJhZGlhbnMgLSAoTWF0aC5QSSAvIDIpIC8vIGJlY2F1c2UgbXkgY2lyY2xlIGlzIG5vdCB0aGUgc2FtZSBhcyB0aGUgbWF0aCBjaXJjbGVcclxuICAgICAgICBub3dQb2ludC54ID0gYy54ICsgTWF0aC5jb3MocmFkTm9ybWFsaXplKSAqIHJcclxuICAgICAgICBub3dQb2ludC55ID0gYy55ICsgTWF0aC5zaW4ocmFkTm9ybWFsaXplKSAqIHJcclxuICAgICAgfSBlbHNlIGlmIChzaGFwZS50eXBlID09ICdsaW5lJykge1xyXG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHtcclxuICAgICAgICAgIHg6IE1hdGguY29zKHNoYXBlLmFuZ2xlKSAqIHNoYXBlLnBhdGhMZW5ndGgsXHJcbiAgICAgICAgICB5OiBNYXRoLnNpbihzaGFwZS5hbmdsZSkgKiBzaGFwZS5wYXRoTGVuZ3RoXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzaGFwZVN0YXJ0ID0ge1xyXG4gICAgICAgICAgeDogc2hhcGUuY2VudHJlLnggKyBNYXRoLnNpbihzaGFwZS5hbmdsZSkgKiByLFxyXG4gICAgICAgICAgeTogc2hhcGUuY2VudHJlLnkgLSBNYXRoLmNvcyhzaGFwZS5hbmdsZSkgKiByXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzdGFydCA9IHtcclxuICAgICAgICAgIHg6IHNoYXBlU3RhcnQueCArIGRpc3RhbmNlLnggKiB0YXNrQXJyYXlbaV0uc3RhcnQsXHJcbiAgICAgICAgICB5OiBzaGFwZVN0YXJ0LnkgKyBkaXN0YW5jZS55ICogdGFza0FycmF5W2ldLnN0YXJ0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBlbmQgPSB7XHJcbiAgICAgICAgICB4OiBzaGFwZVN0YXJ0LnggKyBkaXN0YW5jZS54ICogdGFza0FycmF5W2ldLmVuZCxcclxuICAgICAgICAgIHk6IHNoYXBlU3RhcnQueSArIGRpc3RhbmNlLnkgKiB0YXNrQXJyYXlbaV0uZW5kXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSA9PSAwKSB7XHJcbiAgICAgICAgICBjdHgubGluZVRvKHN0YXJ0LngsIHN0YXJ0LnkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN0eC5saW5lVG8oZW5kLngsIGVuZC55KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBOYXBjaGFydC5zaGFwZS5jcmVhdGVTZWdtZW50ID0gZnVuY3Rpb24gKGNoYXJ0LCBvdXRlciwgaW5uZXIsIHN0YXJ0LCBlbmQpIHtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgTmFwY2hhcnQuc2hhcGUuY3JlYXRlQ3VydmUoY2hhcnQsIG91dGVyLCBzdGFydCwgZW5kKVxyXG4gICAgTmFwY2hhcnQuc2hhcGUuY3JlYXRlQ3VydmUoY2hhcnQsIGlubmVyLCBlbmQsIHN0YXJ0LCB0cnVlKVxyXG4gICAgY3R4LmNsb3NlUGF0aCgpXHJcbiAgfVxyXG59XHJcbiJdfQ==

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Napchart = require('./')

var mynapchart = Napchart.init(document.getElementById('canvas').getContext('2d'))

// mynapchart.setData({
//   nap: [],
//   core: [{start: 1410, end: 480, state:'active'}, {start: 1000, end: 1020}],
//   busy: [{start: 700, end: 900}]
// })

// console.log(mynapchart)

window.lol = mynapchart
},{"./":11}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
/*
*  Core module of Napchart
*
*/

module.exports = function (Napchart) {
  var helpers = Napchart.helpers
  var modules = []
  var hooks = {
    'initialize':[],
    'dataChange':[],
    'shapeChange':[]
  }

  Napchart.on = function(hook, f){
    hooks[hook].push(f);
  }

  function fireHook(hook, argument) {
    hooks[hook].forEach(function(f){
      f(argument)
    })
  }

  Napchart.init = function (ctx, config) {
    
    var instance = (function(){
      // private
      // var data = {};

      // public
      return {
        setElementState: function() {

        },
        setElement: function() {

        },
        setShape: function() {

        },
        setData: function(data) {
          this.data = data;
          fireHook('dataChange')
        },
        getData: function() {
          return data
        }
      }

    }());

    // also public
    instance.ctx = ctx
    instance.canvas = ctx.canvas
    instance.width = instance.w = ctx.canvas.width
    instance.height = instance.h = ctx.canvas.height
    instance.ratio = instance.h / 100
    instance.config = initConfig(config)
    instance.data = {}


    scaleConfig(instance.config, instance.ratio)
    Napchart.initShape(instance)

    fireHook('initialize', instance)

    // helpers.retinaScale(chart)
    // Napchart.draw(instance)
    // console.log(modules)
    // modules[0](chart)

    return instance
  }

  

  // Napchart.prototype.setData = function (data) {
  //   this.data = data
  //   console.log('setdata', this)
  //   Napchart.draw(this)
  // }

  // Napchart.addModule = function (f) {
  //   modules.push(f)
  //   console.log('setdata', this)
  // }

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
  var chart;

  Napchart.on('initialize', function(instance) {
    chart = instance
    draw(chart);
  })

  Napchart.on('dataChange', function(instance) {
    draw(chart)
  })

  function draw(chart) {
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

},{}],11:[function(require,module,exports){
var Napchart = require('./init')()

/* helper functions */
require('./helpers')(Napchart)
require('./draw/canvasHelpers')(Napchart)

/* config files */
require('./config')(Napchart)

/* real shit */
require('./core')(Napchart)

/* drawing */
require('./shape/shape')(Napchart)
require('./draw/draw')(Napchart)
require('./interactCanvas/interactCanvas')(Napchart)


/* other modules */
// require('./fancymodule')(Napchart)

module.exports = Napchart
},{"./config":2,"./core":3,"./draw/canvasHelpers":4,"./draw/draw":6,"./helpers":10,"./init":12,"./interactCanvas/interactCanvas":13,"./shape/shape":14}],12:[function(require,module,exports){


module.exports = function () {
  // var config = defaults
  var Napchart = function (item, config) {
    this.initialize(item, config)
    return
  }

  return Napchart
}

},{}],13:[function(require,module,exports){
/*
*  Fancy module that does shit
*/

module.exports = function (Napchart) {
  var chart;

  Napchart.on('initialize', function(instance) {
    chart = instance
    chart.canvas.onclick = function() {
    	chart.setData({
		  nap: [],
		  core: [{start: 1410, end: 480, state:'active'}, {start: 1000, end: 1020}],
		  busy: [{start: 700, end: 900}]
		})
    }
  })
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY2hhcnQvYnJvd3NlcnRlc3QuanMiLCJsaWIvY2hhcnQvY29uZmlnLmpzIiwibGliL2NoYXJ0L2NvcmUuanMiLCJsaWIvY2hhcnQvZHJhdy9jYW52YXNIZWxwZXJzLmpzIiwibGliL2NoYXJ0L2RyYXcvY29udGVudC9iYXJzLmpzIiwibGliL2NoYXJ0L2RyYXcvZHJhdy5qcyIsImxpYi9jaGFydC9kcmF3L2VsZW1lbnRzL2NpcmNsZS5qcyIsImxpYi9jaGFydC9kcmF3L2ZhY2UvY2lyY2xlcy5qcyIsImxpYi9jaGFydC9kcmF3L2ZhY2UvbGluZXMuanMiLCJsaWIvY2hhcnQvaGVscGVycy5qcyIsImxpYi9jaGFydC9pbmRleC5qcyIsImxpYi9jaGFydC9pbml0LmpzIiwibGliL2NoYXJ0L2ludGVyYWN0Q2FudmFzL2ludGVyYWN0Q2FudmFzLmpzIiwibGliL2NoYXJ0L3NoYXBlL3NoYXBlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqZ0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgTmFwY2hhcnQgPSByZXF1aXJlKCcuLycpXHJcblxyXG52YXIgbXluYXBjaGFydCA9IE5hcGNoYXJ0LmluaXQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJykpXHJcblxyXG4vLyBteW5hcGNoYXJ0LnNldERhdGEoe1xyXG4vLyAgIG5hcDogW10sXHJcbi8vICAgY29yZTogW3tzdGFydDogMTQxMCwgZW5kOiA0ODAsIHN0YXRlOidhY3RpdmUnfSwge3N0YXJ0OiAxMDAwLCBlbmQ6IDEwMjB9XSxcclxuLy8gICBidXN5OiBbe3N0YXJ0OiA3MDAsIGVuZDogOTAwfV1cclxuLy8gfSlcclxuXHJcbi8vIGNvbnNvbGUubG9nKG15bmFwY2hhcnQpXHJcblxyXG53aW5kb3cubG9sID0gbXluYXBjaGFydCIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgTmFwY2hhcnQuY29uZmlnID0ge1xyXG4gICAgZmFjZTogeyAvLyBkZWZpbmUgaG93IHRoZSBiYWNrZ3JvdW5kIGNsb2NrIHNob3VsZCBiZSBkcmF3blxyXG4gICAgICBjaXJjbGVzOiBbXHJcbiAgICAgICAge3JhZGl1czogMzR9LFxyXG4gICAgICAgIHtyYWRpdXM6IDI0fVxyXG4gICAgICBdLFxyXG4gICAgICBjbGVhckNpcmNsZTogMjAsXHJcbiAgICAgIGJsdXJDaXJjbGU6IHtcclxuICAgICAgICByYWRpdXM6IDI5LFxyXG4gICAgICAgIG9wYWNpdHk6IDAuOFxyXG4gICAgICB9LFxyXG4gICAgICBzdHJva2U6IDEsXHJcbiAgICAgIHN0cm9rZUNvbG9yOiAnIzc3Nzc3NycsXHJcbiAgICAgIGltcFN0cm9rZUNvbG9yOiAnIzI2MjYyNicsXHJcbiAgICAgIGNsb2NrTnVtYmVyczoge1xyXG4gICAgICAgIHJhZGl1czogNDQsXHJcbiAgICAgICAgY29sb3I6ICcjMjYyNjI2J1xyXG4gICAgICB9LFxyXG4gICAgICBiZXR3ZWVuOiB7XHJcbiAgICAgICAgc3Ryb2tlQ29sb3I6ICcjZDJkMmQyJyxcclxuICAgICAgICB0ZXh0Q29sb3I6ICdibGFjaycsXHJcbiAgICAgICAgb3BhY2l0eTogMC41XHJcbiAgICAgIH0sXHJcbiAgICAgIHRpbWVMb2NhdGlvbjogNCAvLyBob3cgZmFyIGF3YXkgZnJvbSB0aGUgYmFyIHRoZSB0aW1lIGluZGljYXRvcnMgc2hvdWxkIGJlXHJcbiAgICB9LFxyXG4gICAgYmFyczoge1xyXG4gICAgICBjb3JlOiB7XHJcbiAgICAgICAgc3RhY2s6IDAsXHJcbiAgICAgICAgY29sb3I6ICcjYzcwZTBlJyxcclxuICAgICAgICBpbm5lclJhZGl1czogMjksXHJcbiAgICAgICAgb3V0ZXJSYWRpdXM6IDQwLFxyXG4gICAgICAgIHN0cm9rZToge1xyXG4gICAgICAgICAgbGluZVdpZHRoOiAxXHJcbiAgICAgICAgfSxcclxuICAgICAgICByYW5nZUhhbmRsZXM6IHRydWUsXHJcbiAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICBob3Zlck9wYWNpdHk6IDAuNSxcclxuICAgICAgICBhY3RpdmVPcGFjaXR5OiAwLjUsXHJcbiAgICAgICAgc2VsZWN0ZWQ6IHtcclxuICAgICAgICAgIHN0cm9rZUNvbG9yOiAnI0ZGNjM2MycsXHJcbiAgICAgICAgICBsaW5lV2lkdGg6IDEsXHJcbiAgICAgICAgICBleHBhbmQ6IDAuNVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgbmFwOiB7XHJcbiAgICAgICAgc3RhY2s6IDEsXHJcbiAgICAgICAgY29sb3I6ICcjYzcwZTBlJyxcclxuICAgICAgICBpbm5lclJhZGl1czogMjksXHJcbiAgICAgICAgb3V0ZXJSYWRpdXM6IDQwLFxyXG4gICAgICAgIHN0cm9rZToge1xyXG4gICAgICAgICAgbGluZVdpZHRoOiAyXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvcGFjaXR5OiAwLjYsXHJcbiAgICAgICAgaG92ZXJPcGFjaXR5OiAwLjUsXHJcbiAgICAgICAgYWN0aXZlT3BhY2l0eTogMC41LFxyXG4gICAgICAgIHNlbGVjdGVkOiB7XHJcbiAgICAgICAgICBzdHJva2VDb2xvcjogJ2dyZXknLFxyXG4gICAgICAgICAgbGluZVdpZHRoOiAxLFxyXG4gICAgICAgICAgZXhwYW5kOiAwLjVcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGJ1c3k6IHtcclxuICAgICAgICBzdGFjazogMixcclxuICAgICAgICBjb2xvcjogJyMxZjFmMWYnLFxyXG4gICAgICAgIGlubmVyUmFkaXVzOiAyOSxcclxuICAgICAgICBvdXRlclJhZGl1czogMzYsXHJcbiAgICAgICAgc3Ryb2tlOiB7XHJcbiAgICAgICAgICBsaW5lV2lkdGg6IDJcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJhbmdlSGFuZGxlczogdHJ1ZSxcclxuICAgICAgICBvcGFjaXR5OiAwLjYsXHJcbiAgICAgICAgaG92ZXJPcGFjaXR5OiAwLjUsXHJcbiAgICAgICAgYWN0aXZlT3BhY2l0eTogMC41LFxyXG4gICAgICAgIHNlbGVjdGVkOiB7XHJcbiAgICAgICAgICBzdHJva2VDb2xvcjogJyNGRjYzNjMnLFxyXG4gICAgICAgICAgbGluZVdpZHRoOiAxLFxyXG4gICAgICAgICAgZXhwYW5kOiAwLjVcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGdlbmVyYWw6IHtcclxuICAgICAgICB0ZXh0U2l6ZTogNCxcclxuICAgICAgICBjb2xvcjogJ2JsYWNrJ1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbi8vIHZhciBDb25maWcgPSB7fVxyXG4vLyBDb25maWcuYmFyQ29uZmlnID0ge1xyXG5cclxuLy8gfVxyXG5cclxuLy8gXHRDb25maWcuZGFya0JhckNvbmZpZyA9IHsgLy93aGVuIGRhcmttb2RlIGlzIG9uXHJcbi8vIFx0XHRjb3JlOntcclxuLy8gXHRcdFx0Y29sb3I6JyM3MzMxMzQnLFxyXG4vLyBcdFx0XHRvcGFjaXR5OjAuNyxcclxuLy8gXHRcdFx0aG92ZXJPcGFjaXR5OjAuNyxcclxuLy8gXHRcdFx0YWN0aXZlT3BhY2l0eTowLjcsXHJcbi8vIFx0XHRcdHNlbGVjdGVkOntcclxuLy8gXHRcdFx0XHRzdHJva2VDb2xvcjonI0ZGNjM2MycsXHJcbi8vIFx0XHRcdFx0bGluZVdpZHRoOjEsXHJcbi8vIFx0XHRcdFx0ZXhwYW5kOjAuNVxyXG4vLyBcdFx0XHR9XHJcbi8vIFx0XHR9LFxyXG4vLyBcdFx0bmFwOntcclxuLy8gXHRcdFx0Y29sb3I6JyNjNzBlMGUnLFxyXG4vLyBcdFx0XHRvcGFjaXR5OjAuNyxcclxuLy8gXHRcdFx0aG92ZXJPcGFjaXR5OjAuNyxcclxuLy8gXHRcdFx0YWN0aXZlT3BhY2l0eTowLjcsXHJcbi8vIFx0XHRcdHNlbGVjdGVkOntcclxuLy8gXHRcdFx0XHRzdHJva2VDb2xvcjonI0ZGNjM2MycsXHJcbi8vIFx0XHRcdFx0bGluZVdpZHRoOjEsXHJcbi8vIFx0XHRcdFx0ZXhwYW5kOjAuNVxyXG4vLyBcdFx0XHR9XHJcbi8vIFx0XHR9LFxyXG4vLyBcdFx0YnVzeTp7XHJcbi8vIFx0XHRcdGNvbG9yOicjOUU5RTlFJyxcclxuLy8gXHRcdFx0b3BhY2l0eTowLjYsXHJcbi8vIFx0XHRcdGhvdmVyT3BhY2l0eTowLjUsXHJcbi8vIFx0XHRcdGFjdGl2ZU9wYWNpdHk6MC41LFxyXG4vLyBcdFx0XHRzZWxlY3RlZDp7XHJcbi8vIFx0XHRcdFx0c3Ryb2tlQ29sb3I6JyNGRjYzNjMnLFxyXG4vLyBcdFx0XHRcdGxpbmVXaWR0aDoxLFxyXG4vLyBcdFx0XHRcdGV4cGFuZDowLjVcclxuLy8gXHRcdFx0fVxyXG4vLyBcdFx0fSxcclxuLy8gXHRcdGdlbmVyYWw6e1xyXG4vLyBcdFx0XHRjb2xvcjond2hpdGUnXHJcbi8vIFx0XHR9XHJcbi8vIFx0fVxyXG5cclxuLy8gXHRDb25maWcuZGFya0Nsb2NrQ29uZmlnID0ge1xyXG4vLyBcdFx0YmFja2dyb3VuZDonIzM3MzczNycsXHJcbi8vIFx0XHRjaXJjbGVzOltcclxuLy8gXHRcdHtyYWRpdXM6MzZ9LFxyXG4vLyBcdFx0e3JhZGl1czoyOX0sXHJcbi8vIFx0XHR7cmFkaXVzOjIwfSxcclxuLy8gXHRcdHtyYWRpdXM6Mn1cclxuLy8gXHRcdF0sXHJcbi8vIFx0XHRjbGVhckNpcmNsZTogMjAsXHJcbi8vIFx0XHRibHVyQ2lyY2xlOntcclxuLy8gXHRcdFx0cmFkaXVzOjI5LFxyXG4vLyBcdFx0XHRvcGFjaXR5OjAuNVxyXG4vLyBcdFx0fSxcclxuLy8gXHRcdHN0cm9rZTowLjMyLFxyXG4vLyBcdFx0c3Ryb2tlQ29sb3I6JyM1MjUyNTInLFxyXG4vLyBcdFx0aW1wU3Ryb2tlQ29sb3I6J0VERURFRCcsXHJcbi8vIFx0XHRjbG9ja051bWJlcnM6e1xyXG4vLyBcdFx0XHRyYWRpdXM6NDQsXHJcbi8vIFx0XHRcdGNvbG9yOicjQkZCRkJGJ1xyXG4vLyBcdFx0fSxcclxuLy8gXHRcdGJldHdlZW46e1xyXG4vLyBcdFx0XHRzdHJva2VDb2xvcjogJyNBNUE1QTUnLFxyXG4vLyBcdFx0XHR0ZXh0Q29sb3I6ICd3aGl0ZScsXHJcbi8vIFx0XHRcdG9wYWNpdHk6IDAuOSxcclxuLy8gXHRcdH0sXHJcbi8vIFx0XHR0aW1lTG9jYXRpb246NCwgLy9ob3cgZmFyIGF3YXkgZnJvbSB0aGUgYmFyIHRoZSB0aW1lIGluZGljYXRvcnMgc2hvdWxkIGJlXHJcbi8vIFx0fVxyXG4iLCIvKlxyXG4qICBDb3JlIG1vZHVsZSBvZiBOYXBjaGFydFxyXG4qXHJcbiovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG4gIHZhciBtb2R1bGVzID0gW11cclxuICB2YXIgaG9va3MgPSB7XHJcbiAgICAnaW5pdGlhbGl6ZSc6W10sXHJcbiAgICAnZGF0YUNoYW5nZSc6W10sXHJcbiAgICAnc2hhcGVDaGFuZ2UnOltdXHJcbiAgfVxyXG5cclxuICBOYXBjaGFydC5vbiA9IGZ1bmN0aW9uKGhvb2ssIGYpe1xyXG4gICAgaG9va3NbaG9va10ucHVzaChmKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZpcmVIb29rKGhvb2ssIGFyZ3VtZW50KSB7XHJcbiAgICBob29rc1tob29rXS5mb3JFYWNoKGZ1bmN0aW9uKGYpe1xyXG4gICAgICBmKGFyZ3VtZW50KVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE5hcGNoYXJ0LmluaXQgPSBmdW5jdGlvbiAoY3R4LCBjb25maWcpIHtcclxuICAgIFxyXG4gICAgdmFyIGluc3RhbmNlID0gKGZ1bmN0aW9uKCl7XHJcbiAgICAgIC8vIHByaXZhdGVcclxuICAgICAgLy8gdmFyIGRhdGEgPSB7fTtcclxuXHJcbiAgICAgIC8vIHB1YmxpY1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHNldEVsZW1lbnRTdGF0ZTogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0RWxlbWVudDogZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0U2hhcGU6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldERhdGE6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XHJcbiAgICAgICAgICBmaXJlSG9vaygnZGF0YUNoYW5nZScpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXREYXRhOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiBkYXRhXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgfSgpKTtcclxuXHJcbiAgICAvLyBhbHNvIHB1YmxpY1xyXG4gICAgaW5zdGFuY2UuY3R4ID0gY3R4XHJcbiAgICBpbnN0YW5jZS5jYW52YXMgPSBjdHguY2FudmFzXHJcbiAgICBpbnN0YW5jZS53aWR0aCA9IGluc3RhbmNlLncgPSBjdHguY2FudmFzLndpZHRoXHJcbiAgICBpbnN0YW5jZS5oZWlnaHQgPSBpbnN0YW5jZS5oID0gY3R4LmNhbnZhcy5oZWlnaHRcclxuICAgIGluc3RhbmNlLnJhdGlvID0gaW5zdGFuY2UuaCAvIDEwMFxyXG4gICAgaW5zdGFuY2UuY29uZmlnID0gaW5pdENvbmZpZyhjb25maWcpXHJcbiAgICBpbnN0YW5jZS5kYXRhID0ge31cclxuXHJcblxyXG4gICAgc2NhbGVDb25maWcoaW5zdGFuY2UuY29uZmlnLCBpbnN0YW5jZS5yYXRpbylcclxuICAgIE5hcGNoYXJ0LmluaXRTaGFwZShpbnN0YW5jZSlcclxuXHJcbiAgICBmaXJlSG9vaygnaW5pdGlhbGl6ZScsIGluc3RhbmNlKVxyXG5cclxuICAgIC8vIGhlbHBlcnMucmV0aW5hU2NhbGUoY2hhcnQpXHJcbiAgICAvLyBOYXBjaGFydC5kcmF3KGluc3RhbmNlKVxyXG4gICAgLy8gY29uc29sZS5sb2cobW9kdWxlcylcclxuICAgIC8vIG1vZHVsZXNbMF0oY2hhcnQpXHJcblxyXG4gICAgcmV0dXJuIGluc3RhbmNlXHJcbiAgfVxyXG5cclxuICBcclxuXHJcbiAgLy8gTmFwY2hhcnQucHJvdG90eXBlLnNldERhdGEgPSBmdW5jdGlvbiAoZGF0YSkge1xyXG4gIC8vICAgdGhpcy5kYXRhID0gZGF0YVxyXG4gIC8vICAgY29uc29sZS5sb2coJ3NldGRhdGEnLCB0aGlzKVxyXG4gIC8vICAgTmFwY2hhcnQuZHJhdyh0aGlzKVxyXG4gIC8vIH1cclxuXHJcbiAgLy8gTmFwY2hhcnQuYWRkTW9kdWxlID0gZnVuY3Rpb24gKGYpIHtcclxuICAvLyAgIG1vZHVsZXMucHVzaChmKVxyXG4gIC8vICAgY29uc29sZS5sb2coJ3NldGRhdGEnLCB0aGlzKVxyXG4gIC8vIH1cclxuXHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGdpdmVuIGNvbmZpZyB3aXRoIGdsb2JhbCBhbmQgTmFwY2hhcnQgZGVmYXVsdCB2YWx1ZXMuXHJcbiAgICovXHJcbiAgZnVuY3Rpb24gaW5pdENvbmZpZyAoY29uZmlnKSB7XHJcbiAgICBjb25maWcgPSBjb25maWcgfHwge31cclxuXHJcbiAgICBjb25maWcgPSBoZWxwZXJzLmV4dGVuZChOYXBjaGFydC5jb25maWcsIGNvbmZpZylcclxuXHJcbiAgICByZXR1cm4gY29uZmlnXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzY2FsZUNvbmZpZyAoY29uZmlnLCByYXRpbykge1xyXG4gICAgZnVuY3Rpb24gc2NhbGVGbiAoYmFzZSwgdmFsdWUsIGtleSkge1xyXG4gICAgICAvLyBib2R5Li4uXHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKHZhbHVlKVxyXG4gICAgICBpZiAodmFsdWUgPiAxKSB7XHJcbiAgICAgICAgLy8gdmFsdWUgPSAxOTlcclxuICAgICAgICBiYXNlW2tleV0gPSB2YWx1ZSAqIHJhdGlvXHJcbiAgICAgIC8vIGNvbnNvbGUubG9nKGtleSwgdmFsdWUpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGhlbHBlcnMuZGVlcEVhY2goY29uZmlnLCBzY2FsZUZuKVxyXG4gICAgcmV0dXJuIGNvbmZpZ1xyXG4gIH1cclxufVxyXG4iLCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzO1xyXG5cclxuXHJcbiAgaGVscGVycy5zdHJva2VTZWdtZW50ID0gZnVuY3Rpb24oY2hhcnQsIHN0YXJ0LCBlbmQsIGNvbmZpZyl7XHJcbiAgXHR2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgXHRjdHguc2F2ZSgpXHJcbiAgXHRjdHguc3Ryb2tlU3R5bGUgPSBjb25maWcuY29sb3JcclxuICBcdGN0eC5saW5lV2lkdGggPSBjb25maWcuc3Ryb2tlLmxpbmVXaWR0aFxyXG4gIFx0Y3R4LmxpbmVKb2luID0gJ21pdHRlbCdcclxuXHJcbiAgXHROYXBjaGFydC5zaGFwZS5jcmVhdGVTZWdtZW50KGNoYXJ0LCBjb25maWcub3V0ZXJSYWRpdXMsIGNvbmZpZy5pbm5lclJhZGl1cywgc3RhcnQsIGVuZCk7XHJcblxyXG4gIFx0Y3R4LnN0cm9rZSgpO1xyXG4gIFx0Y3R4LnJlc3RvcmUoKVxyXG4gIH1cclxuXHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFydCwgTmFwY2hhcnQpIHtcclxuICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgdmFyIGRhdGEgPSBjaGFydC5kYXRhXHJcbiAgdmFyIGNhbnZhcyA9IGN0eC5jYW52YXNcclxuICB2YXIgYmFyQ29uZmlnID0gY2hhcnQuY29uZmlnLmJhcnNcclxuICB2YXIgaGVscGVycyA9IE5hcGNoYXJ0LmhlbHBlcnNcclxuXHJcbiAgaGVscGVycy5lYWNoRWxlbWVudChjaGFydCwgZnVuY3Rpb24oZWxlbWVudCwgY29uZmlnKXtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAgIGN0eC5zYXZlKClcclxuICAgIGN0eC5maWxsU3R5bGUgPSBjb25maWcuY29sb3JcclxuICAgIFxyXG4gICAgc3dpdGNoKGVsZW1lbnQuc3RhdGUpe1xyXG4gICAgICBjYXNlICdhY3RpdmUnOlxyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IGNvbmZpZy5hY3RpdmVPcGFjaXR5XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAnaG92ZXInOlxyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IGNvbmZpZy5ob3Zlck9wYWNpdHlcclxuICAgICAgICBicmVha1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IGNvbmZpZy5vcGFjaXR5XHJcbiAgICB9XHJcblxyXG4gICAgTmFwY2hhcnQuc2hhcGUuY3JlYXRlU2VnbWVudChjaGFydCwgY29uZmlnLm91dGVyUmFkaXVzLCBjb25maWcuaW5uZXJSYWRpdXMsIGVsZW1lbnQuc3RhcnQsIGVsZW1lbnQuZW5kKTtcclxuXHJcbiAgICBjdHguZmlsbCgpXHJcbiAgICBjdHgucmVzdG9yZSgpXHJcbiAgfSlcclxuXHJcblxyXG4gIGhlbHBlcnMuZWFjaEVsZW1lbnQoY2hhcnQsIGZ1bmN0aW9uKGVsZW1lbnQsIGNvbmZpZyl7XHJcbiAgICBoZWxwZXJzLnN0cm9rZVNlZ21lbnQoY2hhcnQsIGVsZW1lbnQuc3RhcnQsIGVsZW1lbnQuZW5kLCBjb25maWcpXHJcbiAgfSk7XHJcblxyXG4gIC8vIGZvciAodmFyIG5hbWUgaW4gZGF0YSkge1xyXG4gIC8vICAgdmFyIG9wYWNpdHkgPSBiYXJDb25maWdbbmFtZV0ub3BhY2l0eSxcclxuICAvLyAgICAgaG92ZXJPcGFjaXR5ID0gYmFyQ29uZmlnW25hbWVdLmhvdmVyT3BhY2l0eSxcclxuICAvLyAgICAgYWN0aXZlT3BhY2l0eSA9IGJhckNvbmZpZ1tuYW1lXS5hY3RpdmVPcGFjaXR5XHJcblxyXG4gIC8vICAgICAvLyBpZihpbnRlcmFjdENhbnZhcy5pc0FjdGl2ZShuYW1lLGNvdW50LCd3aG9sZScpIHx8IG5hcGNoYXJ0Q29yZS5pc1NlbGVjdGVkKG5hbWUsY291bnQpKXtcclxuICAvLyAgICAgLy8gXHRjdHguZ2xvYmFsQWxwaGEgPSBhY3RpdmVPcGFjaXR5XHJcbiAgLy8gICAgIC8vIH1cclxuXHJcbiAgLy8gICAgIC8vIGVsc2UgaWYoaW50ZXJhY3RDYW52YXMuaXNBY3RpdmUobmFtZSxjb3VudCkgfHwgaW50ZXJhY3RDYW52YXMuaXNIb3ZlcihuYW1lLGNvdW50LCd3aG9sZScpKXtcclxuICAvLyAgICAgLy8gXHRjdHguZ2xvYmFsQWxwaGE9aG92ZXJPcGFjaXR5XHJcbiAgLy8gICAgIC8vIH1cclxuXHJcbiAgLy8gICAgIC8vIGVsc2V7XHJcbiAgLy8gICAgIGN0eC5nbG9iYWxBbHBoYT1vcGFjaXR5XHJcbiAgLy8gICAgIC8vIH1cclxuICAvLyAgIH1cclxuICAvLyB9XHJcbn1cclxuXHJcblxyXG4gICAgLy8gdmFyIHBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIC8vIHBjYW52YXMuaGVpZ2h0ID0gNDA7XHJcbiAgICAvLyBwY2FudmFzLndpZHRoID0gMjA7XHJcbiAgICAvLyBwY3R4ID0gcGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgLy8gcGN0eC5maWxsU3R5bGUgPSBjb25maWcuY29sb3I7XHJcbiAgICAvLyBwY3R4LmFyYyg1LCA1LCA1LCAwLCBNYXRoLlBJKjIpXHJcbiAgICAvLyBwY3R4LmFyYygxNSwgMjUsIDUsIDAsIE1hdGguUEkqMilcclxuICAgIC8vIHBjdHguZmlsbCgpO1xyXG4gICAgLy8gdmFyIHBhdHRlcm4gPSBjdHguY3JlYXRlUGF0dGVybihwY2FudmFzLCAncmVwZWF0JykiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBjaGFydDtcclxuXHJcbiAgTmFwY2hhcnQub24oJ2luaXRpYWxpemUnLCBmdW5jdGlvbihpbnN0YW5jZSkge1xyXG4gICAgY2hhcnQgPSBpbnN0YW5jZVxyXG4gICAgZHJhdyhjaGFydCk7XHJcbiAgfSlcclxuXHJcbiAgTmFwY2hhcnQub24oJ2RhdGFDaGFuZ2UnLCBmdW5jdGlvbihpbnN0YW5jZSkge1xyXG4gICAgZHJhdyhjaGFydClcclxuICB9KVxyXG5cclxuICBmdW5jdGlvbiBkcmF3KGNoYXJ0KSB7XHJcbiAgICBjaGFydC5jaXJjbGUgPSBmdW5jdGlvbiAocmFkaXVzKSB7XHJcbiAgICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gY2hhcnQuY29uZmlnLmZhY2Uuc3Ryb2tlQ29sb3JcclxuICAgICAgY3R4LmxpbmVXaWR0aCA9IGNoYXJ0LmNvbmZpZy5mYWNlLnN0cm9rZVxyXG5cclxuICAgICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICAgIE5hcGNoYXJ0LnNoYXBlLmNyZWF0ZUN1cnZlKGNoYXJ0LCByYWRpdXMsIDAsIDE0NDApXHJcbiAgICAgIGN0eC5zdHJva2UoKVxyXG4gICAgfVxyXG5cclxuICAgIHJlcXVpcmUoJy4vZmFjZS9jaXJjbGVzJykoY2hhcnQpXHJcbiAgICByZXF1aXJlKCcuL2ZhY2UvbGluZXMnKShjaGFydClcclxuICAgIHJlcXVpcmUoJy4vZWxlbWVudHMvY2lyY2xlJykoY2hhcnQpXHJcblxyXG4gICAgcmVxdWlyZSgnLi9jb250ZW50L2JhcnMnKShjaGFydCwgTmFwY2hhcnQpXHJcbiAgfVxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHJhZGl1cykge1xyXG4gIC8vIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAvLyBjdHguc3Ryb2tlU3R5bGUgPSBjaGFydC5jb25maWcuZmFjZS5zdHJva2VDb2xvclxyXG4gIC8vIGN0eC5saW5lV2lkdGggPSBjaGFydC5jb25maWcuZmFjZS5zdHJva2VcclxuXHJcbiAgLy8gY3R4LmJlZ2luUGF0aCgpXHJcbiAgLy8gLy8gTmFwY2hhcnQuc2hhcGUuY3JlYXRlQ3VydmUoY2hhcnQsIHJhZGl1cywgMCwgMTQ0MClcclxuICAvLyBjdHguc3Ryb2tlKClcclxufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2hhcnQpIHtcbiAgdmFyIGNpcmNsZXMgPSBjaGFydC5jb25maWcuZmFjZS5jaXJjbGVzXHJcblxyXG4gIGZvciAoaSA9IDA7IGkgPCBjaXJjbGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBjaGFydC5jaXJjbGUoY2lyY2xlc1tpXS5yYWRpdXMpXHJcbiAgfVxyXG5cclxuLy8gZm9yICh2YXIgaSA9IDA7IGkgPCAyNDsgaSsrKSB7XHJcbi8vIFx0dmFyIG1pbnV0ZXMgPSBpKjE0NDAvMjRcclxuLy8gXHROYXBjaGFydC5kcmF3LmVsZW1lbnRzLmxpbmUoY2hhcnQsIG1pbnV0ZXMsIDAsIGNpcmNsZXNbMF0ucmFkaXVzKVxyXG4vLyB9XHJcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYXJ0KSB7XHJcbiAgLy8gdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gIC8vIHZhciBjb25maWcgPSBOYXBjaGFydC5jb25maWdcclxuICAvLyB2YXIgaGVscGVycyA9IE5hcGNoYXJ0LmhlbHBlcnNcclxuXHJcbiAgLy8gdmFyIHJhZGl1cz0yMDBcclxuICAvLyBjdHguc2F2ZSgpXHJcbiAgLy8gY3R4LnN0cm9rZVN0eWxlID0gY29uZmlnLmZhY2Uuc3Ryb2tlQ29sb3JcclxuICAvLyBjdHgubGluZVdpZHRoID0gY29uZmlnLmZhY2Uuc3Ryb2tlICo1XHJcbiAgLy8gY3R4LmJlZ2luUGF0aCgpXHJcbiAgLy8gLy8gY3R4LmZpbGxSZWN0KDAsIDAsIDUwLCA1MClcclxuICAvLyBjdHgudHJhbnNsYXRlKGNoYXJ0LncvMixjaGFydC5oLzIpXHJcbiAgLy8gZm9yKHZhciBpPTA7aTwxMjtpKyspe1xyXG4gIC8vIFx0dmFyIGM9aGVscGVycy5taW51dGVzVG9YWShpKjYwLHJhZGl1cylcclxuICAvLyBcdGN0eC5tb3ZlVG8oYy54LGMueSlcclxuICAvLyBcdGM9aGVscGVycy5taW51dGVzVG9YWShpKjYwKzcyMCxyYWRpdXMpXHJcbiAgLy8gXHRjdHgubGluZVRvKGMueCxjLnkpXHJcbiAgLy8gfVxyXG4gIC8vIGN0eC5zdHJva2UoKVxyXG5cclxuICAvLyBjdHguYmVnaW5QYXRoKClcclxuICAvLyBjdHguc3Ryb2tlU3R5bGUgPSBjb25maWcuZmFjZS5pbXBTdHJva2VDb2xvclxyXG5cclxuICAvLyBjPWhlbHBlcnMubWludXRlc1RvWFkoMCxyYWRpdXMpXHJcbiAgLy8gY3R4Lm1vdmVUbyhjLngsYy55KVxyXG4gIC8vIGM9aGVscGVycy5taW51dGVzVG9YWSg3MjAscmFkaXVzKVxyXG4gIC8vIGN0eC5saW5lVG8oYy54LGMueSlcclxuICAvLyBjPWhlbHBlcnMubWludXRlc1RvWFkoMjQwLHJhZGl1cylcclxuICAvLyBjdHgubW92ZVRvKGMueCxjLnkpXHJcbiAgLy8gYz1oZWxwZXJzLm1pbnV0ZXNUb1hZKDk2MCxyYWRpdXMpXHJcbiAgLy8gY3R4LmxpbmVUbyhjLngsYy55KVxyXG4gIC8vIGM9aGVscGVycy5taW51dGVzVG9YWSg0ODAscmFkaXVzKVxyXG4gIC8vIGN0eC5tb3ZlVG8oYy54LGMueSlcclxuICAvLyBjPWhlbHBlcnMubWludXRlc1RvWFkoMTIwMCxyYWRpdXMpXHJcbiAgLy8gY3R4LmxpbmVUbyhjLngsYy55KVxyXG4gIC8vIGN0eC5jbG9zZVBhdGgoKVxyXG4gIC8vIGN0eC5zdHJva2UoKVxyXG4gIC8vIGN0eC5yZXN0b3JlKClcclxufVxuIiwiLyogZ2xvYmFsIHdpbmRvdzogZmFsc2UgKi9cbi8qIGdsb2JhbCBkb2N1bWVudDogZmFsc2UgKi9cbid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChDaGFydCkge1xuICAvLyBHbG9iYWwgQ2hhcnQgaGVscGVycyBvYmplY3QgZm9yIHV0aWxpdHkgbWV0aG9kcyBhbmQgY2xhc3Nlc1xuICB2YXIgaGVscGVycyA9IENoYXJ0LmhlbHBlcnMgPSB7fVxuICBoZWxwZXJzLnJhbmdlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgICBpZiAoZW5kIDwgc3RhcnQpIHtcbiAgICAgIHJldHVybiAxNDQwIC0gc3RhcnQgKyBlbmRcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGVuZCAtIHN0YXJ0XG4gICAgfVxuICB9XG5cbiAgaGVscGVycy5nZXRQcm9ncmVzc0JldHdlZW5Ud29WYWx1ZXMgPSBmdW5jdGlvbiAocG9zLCBzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIGhlbHBlcnMucmFuZ2Uoc3RhcnQsIHBvcykgLyBoZWxwZXJzLnJhbmdlKHN0YXJ0LCBlbmQpXG4gIH1cbiAgaGVscGVycy5wb2ludElzSW5zaWRlID0gZnVuY3Rpb24gKHBvaW50LCBzdGFydCwgZW5kKSB7XG4gICAgaWYgKGVuZCA+IHN0YXJ0KSB7XG4gICAgICBpZiAocG9pbnQgPCBlbmQgJiYgcG9pbnQgPiBzdGFydCkgeyByZXR1cm4gdHJ1ZSB9XG4gICAgfSBlbHNlIGlmIChzdGFydCA+IGVuZCkge1xuICAgICAgaWYgKHBvaW50ID4gc3RhcnQgfHwgcG9pbnQgPCBlbmQpIHsgcmV0dXJuIHRydWUgfVxuICAgIH1cbiAgICBpZiAocG9pbnQgPT0gc3RhcnQgfHwgcG9pbnQgPT0gZW5kKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGhlbHBlcnMuaXNJbnNpZGUgPSBoZWxwZXJzLnBvaW50SXNJbnNpZGVcbiAgaGVscGVycy5taW51dGVzVG9YWSA9IGZ1bmN0aW9uIChtaW51dGVzLCByYWRpdXMpIHtcbiAgICB2YXIgbyA9IHt9XG4gICAgby55ID0gTWF0aC5zaW4oKG1pbnV0ZXMgLyAxNDQwKSAqIChNYXRoLlBJICogMikgLSAoTWF0aC5QSSAvIDIpKSAqIHJhZGl1c1xuICAgIG8ueCA9IE1hdGguY29zKChtaW51dGVzIC8gMTQ0MCkgKiAoTWF0aC5QSSAqIDIpIC0gKE1hdGguUEkgLyAyKSkgKiByYWRpdXNcbiAgICByZXR1cm4gb1xuICB9XG5cbiAgaGVscGVycy5lYWNoRWxlbWVudCA9IGZ1bmN0aW9uIChjaGFydCwgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IGNoYXJ0LmRhdGFcbiAgICB2YXIgY29uZmlnXG5cbiAgICBmb3IgKHZhciBuYW1lIGluIGRhdGEpIHtcbiAgICAgIGNvbmZpZyA9IGNoYXJ0LmNvbmZpZy5iYXJzW25hbWVdXG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YVtuYW1lXS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjYWxsYmFjayhkYXRhW25hbWVdW2ldLCBjb25maWcpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGVscGVycy5lYWNoID0gZnVuY3Rpb24gKGxvb3BhYmxlLCBjYWxsYmFjaywgc2VsZiwgcmV2ZXJzZSkge1xuICAgIC8vIENoZWNrIHRvIHNlZSBpZiBudWxsIG9yIHVuZGVmaW5lZCBmaXJzdGx5LlxuICAgIHZhciBpLCBsZW5cbiAgICBpZiAoaGVscGVycy5pc0FycmF5KGxvb3BhYmxlKSkge1xuICAgICAgbGVuID0gbG9vcGFibGUubGVuZ3RoXG4gICAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgICBmb3IgKGkgPSBsZW4gLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgbG9vcGFibGVbaV0sIGkpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgbG9vcGFibGVbaV0sIGkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBsb29wYWJsZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobG9vcGFibGUpXG4gICAgICBsZW4gPSBrZXlzLmxlbmd0aFxuICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgbG9vcGFibGVba2V5c1tpXV0sIGtleXNbaV0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGVscGVycy5kZWVwRWFjaCA9IGZ1bmN0aW9uIChsb29wYWJsZSwgY2FsbGJhY2spIHtcbiAgICAvLyBDaGVjayB0byBzZWUgaWYgbnVsbCBvciB1bmRlZmluZWQgZmlyc3RseS5cbiAgICB2YXIgaSwgbGVuXG4gICAgZnVuY3Rpb24gc2VhcmNoIChsb29wYWJsZSwgY2IpIHtcbiAgICAgIGlmIChoZWxwZXJzLmlzQXJyYXkobG9vcGFibGUpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9vcGFibGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjYihsb29wYWJsZSwgbG9vcGFibGVbaV0sIGkpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxvb3BhYmxlID09PSAnb2JqZWN0Jykge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGxvb3BhYmxlKVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjYihsb29wYWJsZSwgbG9vcGFibGVba2V5c1tpXV0sIGtleXNbaV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmb3VuZCAoYmFzZSwgdmFsdWUsIGtleSkge1xuICAgICAgaWYgKGhlbHBlcnMuaXNBcnJheSh2YWx1ZSkgfHwgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBzZWFyY2godmFsdWUsIGZvdW5kKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2soYmFzZSwgdmFsdWUsIGtleSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWFyY2gobG9vcGFibGUsIGZvdW5kKVxuICB9XG4gIGhlbHBlcnMuY2xvbmUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSlcbiAgfVxuICBoZWxwZXJzLmV4dGVuZCA9IGZ1bmN0aW9uIChiYXNlKSB7XG4gICAgdmFyIHNldEZuID0gZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgIGJhc2Vba2V5XSA9IHZhbHVlXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAxLCBpbGVuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsZW47IGkrKykge1xuICAgICAgaGVscGVycy5lYWNoKGFyZ3VtZW50c1tpXSwgc2V0Rm4pXG4gICAgfVxuICAgIHJldHVybiBiYXNlXG4gIH1cbiAgLy8gTmVlZCBhIHNwZWNpYWwgbWVyZ2UgZnVuY3Rpb24gdG8gY2hhcnQgY29uZmlncyBzaW5jZSB0aGV5IGFyZSBub3cgZ3JvdXBlZFxuICBoZWxwZXJzLmNvbmZpZ01lcmdlID0gZnVuY3Rpb24gKF9iYXNlKSB7XG4gICAgdmFyIGJhc2UgPSBoZWxwZXJzLmNsb25lKF9iYXNlKVxuICAgIGhlbHBlcnMuZWFjaChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbiAoZXh0ZW5zaW9uKSB7XG4gICAgICBoZWxwZXJzLmVhY2goZXh0ZW5zaW9uLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICB2YXIgYmFzZUhhc1Byb3BlcnR5ID0gYmFzZS5oYXNPd25Qcm9wZXJ0eShrZXkpXG4gICAgICAgIHZhciBiYXNlVmFsID0gYmFzZUhhc1Byb3BlcnR5ID8gYmFzZVtrZXldIDoge31cblxuICAgICAgICBpZiAoa2V5ID09PSAnc2NhbGVzJykge1xuICAgICAgICAgIC8vIFNjYWxlIGNvbmZpZyBtZXJnaW5nIGlzIGNvbXBsZXguIEFkZCBvdXIgb3duIGZ1bmN0aW9uIGhlcmUgZm9yIHRoYXRcbiAgICAgICAgICBiYXNlW2tleV0gPSBoZWxwZXJzLnNjYWxlTWVyZ2UoYmFzZVZhbCwgdmFsdWUpXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnc2NhbGUnKSB7XG4gICAgICAgICAgLy8gVXNlZCBpbiBwb2xhciBhcmVhICYgcmFkYXIgY2hhcnRzIHNpbmNlIHRoZXJlIGlzIG9ubHkgb25lIHNjYWxlXG4gICAgICAgICAgYmFzZVtrZXldID0gaGVscGVycy5jb25maWdNZXJnZShiYXNlVmFsLCBDaGFydC5zY2FsZVNlcnZpY2UuZ2V0U2NhbGVEZWZhdWx0cyh2YWx1ZS50eXBlKSwgdmFsdWUpXG4gICAgICAgIH0gZWxzZSBpZiAoYmFzZUhhc1Byb3BlcnR5ICYmXG4gICAgICAgICAgdHlwZW9mIGJhc2VWYWwgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgIWhlbHBlcnMuaXNBcnJheShiYXNlVmFsKSAmJlxuICAgICAgICAgIGJhc2VWYWwgIT09IG51bGwgJiZcbiAgICAgICAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgIWhlbHBlcnMuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAvLyBJZiB3ZSBhcmUgb3ZlcndyaXRpbmcgYW4gb2JqZWN0IHdpdGggYW4gb2JqZWN0LCBkbyBhIG1lcmdlIG9mIHRoZSBwcm9wZXJ0aWVzLlxuICAgICAgICAgIGJhc2Vba2V5XSA9IGhlbHBlcnMuY29uZmlnTWVyZ2UoYmFzZVZhbCwgdmFsdWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gY2FuIGp1c3Qgb3ZlcndyaXRlIHRoZSB2YWx1ZSBpbiB0aGlzIGNhc2VcbiAgICAgICAgICBiYXNlW2tleV0gPSB2YWx1ZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG5cbiAgICByZXR1cm4gYmFzZVxuICB9XG4gIGhlbHBlcnMuc2NhbGVNZXJnZSA9IGZ1bmN0aW9uIChfYmFzZSwgZXh0ZW5zaW9uKSB7XG4gICAgdmFyIGJhc2UgPSBoZWxwZXJzLmNsb25lKF9iYXNlKVxuXG4gICAgaGVscGVycy5lYWNoKGV4dGVuc2lvbiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgIGlmIChrZXkgPT09ICd4QXhlcycgfHwga2V5ID09PSAneUF4ZXMnKSB7XG4gICAgICAgIC8vIFRoZXNlIHByb3BlcnRpZXMgYXJlIGFycmF5cyBvZiBpdGVtc1xuICAgICAgICBpZiAoYmFzZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgaGVscGVycy5lYWNoKHZhbHVlLCBmdW5jdGlvbiAodmFsdWVPYmosIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgYXhpc1R5cGUgPSBoZWxwZXJzLmdldFZhbHVlT3JEZWZhdWx0KHZhbHVlT2JqLnR5cGUsIGtleSA9PT0gJ3hBeGVzJyA/ICdjYXRlZ29yeScgOiAnbGluZWFyJylcbiAgICAgICAgICAgIHZhciBheGlzRGVmYXVsdHMgPSBDaGFydC5zY2FsZVNlcnZpY2UuZ2V0U2NhbGVEZWZhdWx0cyhheGlzVHlwZSlcbiAgICAgICAgICAgIGlmIChpbmRleCA+PSBiYXNlW2tleV0ubGVuZ3RoIHx8ICFiYXNlW2tleV1baW5kZXhdLnR5cGUpIHtcbiAgICAgICAgICAgICAgYmFzZVtrZXldLnB1c2goaGVscGVycy5jb25maWdNZXJnZShheGlzRGVmYXVsdHMsIHZhbHVlT2JqKSlcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVPYmoudHlwZSAmJiB2YWx1ZU9iai50eXBlICE9PSBiYXNlW2tleV1baW5kZXhdLnR5cGUpIHtcbiAgICAgICAgICAgICAgLy8gVHlwZSBjaGFuZ2VkLiBCcmluZyBpbiB0aGUgbmV3IGRlZmF1bHRzIGJlZm9yZSB3ZSBicmluZyBpbiB2YWx1ZU9iaiBzbyB0aGF0IHZhbHVlT2JqIGNhbiBvdmVycmlkZSB0aGUgY29ycmVjdCBzY2FsZSBkZWZhdWx0c1xuICAgICAgICAgICAgICBiYXNlW2tleV1baW5kZXhdID0gaGVscGVycy5jb25maWdNZXJnZShiYXNlW2tleV1baW5kZXhdLCBheGlzRGVmYXVsdHMsIHZhbHVlT2JqKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVHlwZSBpcyB0aGUgc2FtZVxuICAgICAgICAgICAgICBiYXNlW2tleV1baW5kZXhdID0gaGVscGVycy5jb25maWdNZXJnZShiYXNlW2tleV1baW5kZXhdLCB2YWx1ZU9iailcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJhc2Vba2V5XSA9IFtdXG4gICAgICAgICAgaGVscGVycy5lYWNoKHZhbHVlLCBmdW5jdGlvbiAodmFsdWVPYmopIHtcbiAgICAgICAgICAgIHZhciBheGlzVHlwZSA9IGhlbHBlcnMuZ2V0VmFsdWVPckRlZmF1bHQodmFsdWVPYmoudHlwZSwga2V5ID09PSAneEF4ZXMnID8gJ2NhdGVnb3J5JyA6ICdsaW5lYXInKVxuICAgICAgICAgICAgYmFzZVtrZXldLnB1c2goaGVscGVycy5jb25maWdNZXJnZShDaGFydC5zY2FsZVNlcnZpY2UuZ2V0U2NhbGVEZWZhdWx0cyhheGlzVHlwZSksIHZhbHVlT2JqKSlcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGJhc2UuaGFzT3duUHJvcGVydHkoa2V5KSAmJiB0eXBlb2YgYmFzZVtrZXldID09PSAnb2JqZWN0JyAmJiBiYXNlW2tleV0gIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBJZiB3ZSBhcmUgb3ZlcndyaXRpbmcgYW4gb2JqZWN0IHdpdGggYW4gb2JqZWN0LCBkbyBhIG1lcmdlIG9mIHRoZSBwcm9wZXJ0aWVzLlxuICAgICAgICBiYXNlW2tleV0gPSBoZWxwZXJzLmNvbmZpZ01lcmdlKGJhc2Vba2V5XSwgdmFsdWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjYW4ganVzdCBvdmVyd3JpdGUgdGhlIHZhbHVlIGluIHRoaXMgY2FzZVxuICAgICAgICBiYXNlW2tleV0gPSB2YWx1ZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gYmFzZVxuICB9XG4gIGhlbHBlcnMuZ2V0VmFsdWVBdEluZGV4T3JEZWZhdWx0ID0gZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgZGVmYXVsdFZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgICB9XG5cbiAgICBpZiAoaGVscGVycy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGluZGV4IDwgdmFsdWUubGVuZ3RoID8gdmFsdWVbaW5kZXhdIDogZGVmYXVsdFZhbHVlXG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cbiAgaGVscGVycy5nZXRWYWx1ZU9yRGVmYXVsdCA9IGZ1bmN0aW9uICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyBkZWZhdWx0VmFsdWUgOiB2YWx1ZVxuICB9XG4gIGhlbHBlcnMuaW5kZXhPZiA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mXG4gICAgPyBmdW5jdGlvbiAoYXJyYXksIGl0ZW0pIHtcbiAgICAgIHJldHVybiBhcnJheS5pbmRleE9mKGl0ZW0pXG4gICAgfVxuICAgIDogZnVuY3Rpb24gKGFycmF5LCBpdGVtKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgaWxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGlsZW47ICsraSkge1xuICAgICAgICBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gaVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gIGhlbHBlcnMud2hlcmUgPSBmdW5jdGlvbiAoY29sbGVjdGlvbiwgZmlsdGVyQ2FsbGJhY2spIHtcbiAgICBpZiAoaGVscGVycy5pc0FycmF5KGNvbGxlY3Rpb24pICYmIEFycmF5LnByb3RvdHlwZS5maWx0ZXIpIHtcbiAgICAgIHJldHVybiBjb2xsZWN0aW9uLmZpbHRlcihmaWx0ZXJDYWxsYmFjaylcbiAgICB9XG4gICAgdmFyIGZpbHRlcmVkID0gW11cblxuICAgIGhlbHBlcnMuZWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgaWYgKGZpbHRlckNhbGxiYWNrKGl0ZW0pKSB7XG4gICAgICAgIGZpbHRlcmVkLnB1c2goaXRlbSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGZpbHRlcmVkXG4gIH1cbiAgaGVscGVycy5maW5kSW5kZXggPSBBcnJheS5wcm90b3R5cGUuZmluZEluZGV4XG4gICAgPyBmdW5jdGlvbiAoYXJyYXksIGNhbGxiYWNrLCBzY29wZSkge1xuICAgICAgcmV0dXJuIGFycmF5LmZpbmRJbmRleChjYWxsYmFjaywgc2NvcGUpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gKGFycmF5LCBjYWxsYmFjaywgc2NvcGUpIHtcbiAgICAgIHNjb3BlID0gc2NvcGUgPT09IHVuZGVmaW5lZCA/IGFycmF5IDogc2NvcGVcbiAgICAgIGZvciAodmFyIGkgPSAwLCBpbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgaWxlbjsgKytpKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5jYWxsKHNjb3BlLCBhcnJheVtpXSwgaSwgYXJyYXkpKSB7XG4gICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICBoZWxwZXJzLmZpbmROZXh0V2hlcmUgPSBmdW5jdGlvbiAoYXJyYXlUb1NlYXJjaCwgZmlsdGVyQ2FsbGJhY2ssIHN0YXJ0SW5kZXgpIHtcbiAgICAvLyBEZWZhdWx0IHRvIHN0YXJ0IG9mIHRoZSBhcnJheVxuICAgIGlmIChzdGFydEluZGV4ID09PSB1bmRlZmluZWQgfHwgc3RhcnRJbmRleCA9PT0gbnVsbCkge1xuICAgICAgc3RhcnRJbmRleCA9IC0xXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSBzdGFydEluZGV4ICsgMTsgaSA8IGFycmF5VG9TZWFyY2gubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjdXJyZW50SXRlbSA9IGFycmF5VG9TZWFyY2hbaV1cbiAgICAgIGlmIChmaWx0ZXJDYWxsYmFjayhjdXJyZW50SXRlbSkpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRJdGVtXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGhlbHBlcnMuZmluZFByZXZpb3VzV2hlcmUgPSBmdW5jdGlvbiAoYXJyYXlUb1NlYXJjaCwgZmlsdGVyQ2FsbGJhY2ssIHN0YXJ0SW5kZXgpIHtcbiAgICAvLyBEZWZhdWx0IHRvIGVuZCBvZiB0aGUgYXJyYXlcbiAgICBpZiAoc3RhcnRJbmRleCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0SW5kZXggPT09IG51bGwpIHtcbiAgICAgIHN0YXJ0SW5kZXggPSBhcnJheVRvU2VhcmNoLmxlbmd0aFxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gc3RhcnRJbmRleCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgY3VycmVudEl0ZW0gPSBhcnJheVRvU2VhcmNoW2ldXG4gICAgICBpZiAoZmlsdGVyQ2FsbGJhY2soY3VycmVudEl0ZW0pKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50SXRlbVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLmluaGVyaXRzID0gZnVuY3Rpb24gKGV4dGVuc2lvbnMpIHtcbiAgICAvLyBCYXNpYyBqYXZhc2NyaXB0IGluaGVyaXRhbmNlIGJhc2VkIG9uIHRoZSBtb2RlbCBjcmVhdGVkIGluIEJhY2tib25lLmpzXG4gICAgdmFyIG1lID0gdGhpc1xuICAgIHZhciBDaGFydEVsZW1lbnQgPSAoZXh0ZW5zaW9ucyAmJiBleHRlbnNpb25zLmhhc093blByb3BlcnR5KCdjb25zdHJ1Y3RvcicpKSA/IGV4dGVuc2lvbnMuY29uc3RydWN0b3IgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbWUuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIH1cblxuICAgIHZhciBTdXJyb2dhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNvbnN0cnVjdG9yID0gQ2hhcnRFbGVtZW50XG4gICAgfVxuICAgIFN1cnJvZ2F0ZS5wcm90b3R5cGUgPSBtZS5wcm90b3R5cGVcbiAgICBDaGFydEVsZW1lbnQucHJvdG90eXBlID0gbmV3IFN1cnJvZ2F0ZSgpXG5cbiAgICBDaGFydEVsZW1lbnQuZXh0ZW5kID0gaGVscGVycy5pbmhlcml0c1xuXG4gICAgaWYgKGV4dGVuc2lvbnMpIHtcbiAgICAgIGhlbHBlcnMuZXh0ZW5kKENoYXJ0RWxlbWVudC5wcm90b3R5cGUsIGV4dGVuc2lvbnMpXG4gICAgfVxuXG4gICAgQ2hhcnRFbGVtZW50Ll9fc3VwZXJfXyA9IG1lLnByb3RvdHlwZVxuXG4gICAgcmV0dXJuIENoYXJ0RWxlbWVudFxuICB9XG4gIGhlbHBlcnMubm9vcCA9IGZ1bmN0aW9uICgpIHt9XG4gIGhlbHBlcnMudWlkID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaWQgPSAwXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpZCsrXG4gICAgfVxuICB9KCkpXG4gIC8vIC0tIE1hdGggbWV0aG9kc1xuICBoZWxwZXJzLmlzTnVtYmVyID0gZnVuY3Rpb24gKG4pIHtcbiAgICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQobikpICYmIGlzRmluaXRlKG4pXG4gIH1cbiAgaGVscGVycy5hbG1vc3RFcXVhbHMgPSBmdW5jdGlvbiAoeCwgeSwgZXBzaWxvbikge1xuICAgIHJldHVybiBNYXRoLmFicyh4IC0geSkgPCBlcHNpbG9uXG4gIH1cbiAgaGVscGVycy5hbG1vc3RXaG9sZSA9IGZ1bmN0aW9uICh4LCBlcHNpbG9uKSB7XG4gICAgdmFyIHJvdW5kZWQgPSBNYXRoLnJvdW5kKHgpXG4gICAgcmV0dXJuICgoKHJvdW5kZWQgLSBlcHNpbG9uKSA8IHgpICYmICgocm91bmRlZCArIGVwc2lsb24pID4geCkpXG4gIH1cbiAgaGVscGVycy5tYXggPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICByZXR1cm4gYXJyYXkucmVkdWNlKGZ1bmN0aW9uIChtYXgsIHZhbHVlKSB7XG4gICAgICBpZiAoIWlzTmFOKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgobWF4LCB2YWx1ZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXhcbiAgICB9LCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpXG4gIH1cbiAgaGVscGVycy5taW4gPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICByZXR1cm4gYXJyYXkucmVkdWNlKGZ1bmN0aW9uIChtaW4sIHZhbHVlKSB7XG4gICAgICBpZiAoIWlzTmFOKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gTWF0aC5taW4obWluLCB2YWx1ZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBtaW5cbiAgICB9LCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG4gIH1cbiAgaGVscGVycy5zaWduID0gTWF0aC5zaWduXG4gICAgPyBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIE1hdGguc2lnbih4KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uICh4KSB7XG4gICAgICB4ID0gK3ggLy8gY29udmVydCB0byBhIG51bWJlclxuICAgICAgaWYgKHggPT09IDAgfHwgaXNOYU4oeCkpIHtcbiAgICAgICAgcmV0dXJuIHhcbiAgICAgIH1cbiAgICAgIHJldHVybiB4ID4gMCA/IDEgOiAtMVxuICAgIH1cbiAgaGVscGVycy5sb2cxMCA9IE1hdGgubG9nMTBcbiAgICA/IGZ1bmN0aW9uICh4KSB7XG4gICAgICByZXR1cm4gTWF0aC5sb2cxMCh4KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uICh4KSB7XG4gICAgICByZXR1cm4gTWF0aC5sb2coeCkgLyBNYXRoLkxOMTBcbiAgICB9XG4gIGhlbHBlcnMudG9SYWRpYW5zID0gZnVuY3Rpb24gKGRlZ3JlZXMpIHtcbiAgICByZXR1cm4gZGVncmVlcyAqIChNYXRoLlBJIC8gMTgwKVxuICB9XG4gIGhlbHBlcnMudG9EZWdyZWVzID0gZnVuY3Rpb24gKHJhZGlhbnMpIHtcbiAgICByZXR1cm4gcmFkaWFucyAqICgxODAgLyBNYXRoLlBJKVxuICB9XG4gIC8vIEdldHMgdGhlIGFuZ2xlIGZyb20gdmVydGljYWwgdXByaWdodCB0byB0aGUgcG9pbnQgYWJvdXQgYSBjZW50cmUuXG4gIGhlbHBlcnMuZ2V0QW5nbGVGcm9tUG9pbnQgPSBmdW5jdGlvbiAoY2VudHJlUG9pbnQsIGFuZ2xlUG9pbnQpIHtcbiAgICB2YXIgZGlzdGFuY2VGcm9tWENlbnRlciA9IGFuZ2xlUG9pbnQueCAtIGNlbnRyZVBvaW50LngsXG4gICAgICBkaXN0YW5jZUZyb21ZQ2VudGVyID0gYW5nbGVQb2ludC55IC0gY2VudHJlUG9pbnQueSxcbiAgICAgIHJhZGlhbERpc3RhbmNlRnJvbUNlbnRlciA9IE1hdGguc3FydChkaXN0YW5jZUZyb21YQ2VudGVyICogZGlzdGFuY2VGcm9tWENlbnRlciArIGRpc3RhbmNlRnJvbVlDZW50ZXIgKiBkaXN0YW5jZUZyb21ZQ2VudGVyKVxuXG4gICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuMihkaXN0YW5jZUZyb21ZQ2VudGVyLCBkaXN0YW5jZUZyb21YQ2VudGVyKVxuXG4gICAgaWYgKGFuZ2xlIDwgKC0wLjUgKiBNYXRoLlBJKSkge1xuICAgICAgYW5nbGUgKz0gMi4wICogTWF0aC5QSSAvLyBtYWtlIHN1cmUgdGhlIHJldHVybmVkIGFuZ2xlIGlzIGluIHRoZSByYW5nZSBvZiAoLVBJLzIsIDNQSS8yXVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBhbmdsZTogYW5nbGUsXG4gICAgICBkaXN0YW5jZTogcmFkaWFsRGlzdGFuY2VGcm9tQ2VudGVyXG4gICAgfVxuICB9XG4gIGhlbHBlcnMuZGlzdGFuY2VCZXR3ZWVuUG9pbnRzID0gZnVuY3Rpb24gKHB0MSwgcHQyKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwdDIueCAtIHB0MS54LCAyKSArIE1hdGgucG93KHB0Mi55IC0gcHQxLnksIDIpKVxuICB9XG4gIGhlbHBlcnMuYWxpYXNQaXhlbCA9IGZ1bmN0aW9uIChwaXhlbFdpZHRoKSB7XG4gICAgcmV0dXJuIChwaXhlbFdpZHRoICUgMiA9PT0gMCkgPyAwIDogMC41XG4gIH1cbiAgaGVscGVycy5zcGxpbmVDdXJ2ZSA9IGZ1bmN0aW9uIChmaXJzdFBvaW50LCBtaWRkbGVQb2ludCwgYWZ0ZXJQb2ludCwgdCkge1xuICAgIC8vIFByb3BzIHRvIFJvYiBTcGVuY2VyIGF0IHNjYWxlZCBpbm5vdmF0aW9uIGZvciBoaXMgcG9zdCBvbiBzcGxpbmluZyBiZXR3ZWVuIHBvaW50c1xuICAgIC8vIGh0dHA6Ly9zY2FsZWRpbm5vdmF0aW9uLmNvbS9hbmFseXRpY3Mvc3BsaW5lcy9hYm91dFNwbGluZXMuaHRtbFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBtdXN0IGFsc28gcmVzcGVjdCBcInNraXBwZWRcIiBwb2ludHNcblxuICAgIHZhciBwcmV2aW91cyA9IGZpcnN0UG9pbnQuc2tpcCA/IG1pZGRsZVBvaW50IDogZmlyc3RQb2ludCxcbiAgICAgIGN1cnJlbnQgPSBtaWRkbGVQb2ludCxcbiAgICAgIG5leHQgPSBhZnRlclBvaW50LnNraXAgPyBtaWRkbGVQb2ludCA6IGFmdGVyUG9pbnRcblxuICAgIHZhciBkMDEgPSBNYXRoLnNxcnQoTWF0aC5wb3coY3VycmVudC54IC0gcHJldmlvdXMueCwgMikgKyBNYXRoLnBvdyhjdXJyZW50LnkgLSBwcmV2aW91cy55LCAyKSlcbiAgICB2YXIgZDEyID0gTWF0aC5zcXJ0KE1hdGgucG93KG5leHQueCAtIGN1cnJlbnQueCwgMikgKyBNYXRoLnBvdyhuZXh0LnkgLSBjdXJyZW50LnksIDIpKVxuXG4gICAgdmFyIHMwMSA9IGQwMSAvIChkMDEgKyBkMTIpXG4gICAgdmFyIHMxMiA9IGQxMiAvIChkMDEgKyBkMTIpXG5cbiAgICAvLyBJZiBhbGwgcG9pbnRzIGFyZSB0aGUgc2FtZSwgczAxICYgczAyIHdpbGwgYmUgaW5mXG4gICAgczAxID0gaXNOYU4oczAxKSA/IDAgOiBzMDFcbiAgICBzMTIgPSBpc05hTihzMTIpID8gMCA6IHMxMlxuXG4gICAgdmFyIGZhID0gdCAqIHMwMSAvLyBzY2FsaW5nIGZhY3RvciBmb3IgdHJpYW5nbGUgVGFcbiAgICB2YXIgZmIgPSB0ICogczEyXG5cbiAgICByZXR1cm4ge1xuICAgICAgcHJldmlvdXM6IHtcbiAgICAgICAgeDogY3VycmVudC54IC0gZmEgKiAobmV4dC54IC0gcHJldmlvdXMueCksXG4gICAgICAgIHk6IGN1cnJlbnQueSAtIGZhICogKG5leHQueSAtIHByZXZpb3VzLnkpXG4gICAgICB9LFxuICAgICAgbmV4dDoge1xuICAgICAgICB4OiBjdXJyZW50LnggKyBmYiAqIChuZXh0LnggLSBwcmV2aW91cy54KSxcbiAgICAgICAgeTogY3VycmVudC55ICsgZmIgKiAobmV4dC55IC0gcHJldmlvdXMueSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaGVscGVycy5FUFNJTE9OID0gTnVtYmVyLkVQU0lMT04gfHwgMWUtMTRcbiAgaGVscGVycy5zcGxpbmVDdXJ2ZU1vbm90b25lID0gZnVuY3Rpb24gKHBvaW50cykge1xuICAgIC8vIFRoaXMgZnVuY3Rpb24gY2FsY3VsYXRlcyBCw6l6aWVyIGNvbnRyb2wgcG9pbnRzIGluIGEgc2ltaWxhciB3YXkgdGhhbiB8c3BsaW5lQ3VydmV8LFxuICAgIC8vIGJ1dCBwcmVzZXJ2ZXMgbW9ub3RvbmljaXR5IG9mIHRoZSBwcm92aWRlZCBkYXRhIGFuZCBlbnN1cmVzIG5vIGxvY2FsIGV4dHJlbXVtcyBhcmUgYWRkZWRcbiAgICAvLyBiZXR3ZWVuIHRoZSBkYXRhc2V0IGRpc2NyZXRlIHBvaW50cyBkdWUgdG8gdGhlIGludGVycG9sYXRpb24uXG4gICAgLy8gU2VlIDogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTW9ub3RvbmVfY3ViaWNfaW50ZXJwb2xhdGlvblxuXG4gICAgdmFyIHBvaW50c1dpdGhUYW5nZW50cyA9IChwb2ludHMgfHwgW10pLm1hcChmdW5jdGlvbiAocG9pbnQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1vZGVsOiBwb2ludC5fbW9kZWwsXG4gICAgICAgIGRlbHRhSzogMCxcbiAgICAgICAgbUs6IDBcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gQ2FsY3VsYXRlIHNsb3BlcyAoZGVsdGFLKSBhbmQgaW5pdGlhbGl6ZSB0YW5nZW50cyAobUspXG4gICAgdmFyIHBvaW50c0xlbiA9IHBvaW50c1dpdGhUYW5nZW50cy5sZW5ndGhcbiAgICB2YXIgaSwgcG9pbnRCZWZvcmUsIHBvaW50Q3VycmVudCwgcG9pbnRBZnRlclxuICAgIGZvciAoaSA9IDA7IGkgPCBwb2ludHNMZW47ICsraSkge1xuICAgICAgcG9pbnRDdXJyZW50ID0gcG9pbnRzV2l0aFRhbmdlbnRzW2ldXG4gICAgICBpZiAocG9pbnRDdXJyZW50Lm1vZGVsLnNraXApIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgcG9pbnRCZWZvcmUgPSBpID4gMCA/IHBvaW50c1dpdGhUYW5nZW50c1tpIC0gMV0gOiBudWxsXG4gICAgICBwb2ludEFmdGVyID0gaSA8IHBvaW50c0xlbiAtIDEgPyBwb2ludHNXaXRoVGFuZ2VudHNbaSArIDFdIDogbnVsbFxuICAgICAgaWYgKHBvaW50QWZ0ZXIgJiYgIXBvaW50QWZ0ZXIubW9kZWwuc2tpcCkge1xuICAgICAgICB2YXIgc2xvcGVEZWx0YVggPSAocG9pbnRBZnRlci5tb2RlbC54IC0gcG9pbnRDdXJyZW50Lm1vZGVsLngpXG5cbiAgICAgICAgLy8gSW4gdGhlIGNhc2Ugb2YgdHdvIHBvaW50cyB0aGF0IGFwcGVhciBhdCB0aGUgc2FtZSB4IHBpeGVsLCBzbG9wZURlbHRhWCBpcyAwXG4gICAgICAgIHBvaW50Q3VycmVudC5kZWx0YUsgPSBzbG9wZURlbHRhWCAhPT0gMCA/IChwb2ludEFmdGVyLm1vZGVsLnkgLSBwb2ludEN1cnJlbnQubW9kZWwueSkgLyBzbG9wZURlbHRhWCA6IDBcbiAgICAgIH1cblxuICAgICAgaWYgKCFwb2ludEJlZm9yZSB8fCBwb2ludEJlZm9yZS5tb2RlbC5za2lwKSB7XG4gICAgICAgIHBvaW50Q3VycmVudC5tSyA9IHBvaW50Q3VycmVudC5kZWx0YUtcbiAgICAgIH0gZWxzZSBpZiAoIXBvaW50QWZ0ZXIgfHwgcG9pbnRBZnRlci5tb2RlbC5za2lwKSB7XG4gICAgICAgIHBvaW50Q3VycmVudC5tSyA9IHBvaW50QmVmb3JlLmRlbHRhS1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnNpZ24ocG9pbnRCZWZvcmUuZGVsdGFLKSAhPT0gdGhpcy5zaWduKHBvaW50Q3VycmVudC5kZWx0YUspKSB7XG4gICAgICAgIHBvaW50Q3VycmVudC5tSyA9IDBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvaW50Q3VycmVudC5tSyA9IChwb2ludEJlZm9yZS5kZWx0YUsgKyBwb2ludEN1cnJlbnQuZGVsdGFLKSAvIDJcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGp1c3QgdGFuZ2VudHMgdG8gZW5zdXJlIG1vbm90b25pYyBwcm9wZXJ0aWVzXG4gICAgdmFyIGFscGhhSywgYmV0YUssIHRhdUssIHNxdWFyZWRNYWduaXR1ZGVcbiAgICBmb3IgKGkgPSAwOyBpIDwgcG9pbnRzTGVuIC0gMTsgKytpKSB7XG4gICAgICBwb2ludEN1cnJlbnQgPSBwb2ludHNXaXRoVGFuZ2VudHNbaV1cbiAgICAgIHBvaW50QWZ0ZXIgPSBwb2ludHNXaXRoVGFuZ2VudHNbaSArIDFdXG4gICAgICBpZiAocG9pbnRDdXJyZW50Lm1vZGVsLnNraXAgfHwgcG9pbnRBZnRlci5tb2RlbC5za2lwKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChoZWxwZXJzLmFsbW9zdEVxdWFscyhwb2ludEN1cnJlbnQuZGVsdGFLLCAwLCB0aGlzLkVQU0lMT04pKSB7XG4gICAgICAgIHBvaW50Q3VycmVudC5tSyA9IHBvaW50QWZ0ZXIubUsgPSAwXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGFscGhhSyA9IHBvaW50Q3VycmVudC5tSyAvIHBvaW50Q3VycmVudC5kZWx0YUtcbiAgICAgIGJldGFLID0gcG9pbnRBZnRlci5tSyAvIHBvaW50Q3VycmVudC5kZWx0YUtcbiAgICAgIHNxdWFyZWRNYWduaXR1ZGUgPSBNYXRoLnBvdyhhbHBoYUssIDIpICsgTWF0aC5wb3coYmV0YUssIDIpXG4gICAgICBpZiAoc3F1YXJlZE1hZ25pdHVkZSA8PSA5KSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHRhdUsgPSAzIC8gTWF0aC5zcXJ0KHNxdWFyZWRNYWduaXR1ZGUpXG4gICAgICBwb2ludEN1cnJlbnQubUsgPSBhbHBoYUsgKiB0YXVLICogcG9pbnRDdXJyZW50LmRlbHRhS1xuICAgICAgcG9pbnRBZnRlci5tSyA9IGJldGFLICogdGF1SyAqIHBvaW50Q3VycmVudC5kZWx0YUtcbiAgICB9XG5cbiAgICAvLyBDb21wdXRlIGNvbnRyb2wgcG9pbnRzXG4gICAgdmFyIGRlbHRhWFxuICAgIGZvciAoaSA9IDA7IGkgPCBwb2ludHNMZW47ICsraSkge1xuICAgICAgcG9pbnRDdXJyZW50ID0gcG9pbnRzV2l0aFRhbmdlbnRzW2ldXG4gICAgICBpZiAocG9pbnRDdXJyZW50Lm1vZGVsLnNraXApIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgcG9pbnRCZWZvcmUgPSBpID4gMCA/IHBvaW50c1dpdGhUYW5nZW50c1tpIC0gMV0gOiBudWxsXG4gICAgICBwb2ludEFmdGVyID0gaSA8IHBvaW50c0xlbiAtIDEgPyBwb2ludHNXaXRoVGFuZ2VudHNbaSArIDFdIDogbnVsbFxuICAgICAgaWYgKHBvaW50QmVmb3JlICYmICFwb2ludEJlZm9yZS5tb2RlbC5za2lwKSB7XG4gICAgICAgIGRlbHRhWCA9IChwb2ludEN1cnJlbnQubW9kZWwueCAtIHBvaW50QmVmb3JlLm1vZGVsLngpIC8gM1xuICAgICAgICBwb2ludEN1cnJlbnQubW9kZWwuY29udHJvbFBvaW50UHJldmlvdXNYID0gcG9pbnRDdXJyZW50Lm1vZGVsLnggLSBkZWx0YVhcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1vZGVsLmNvbnRyb2xQb2ludFByZXZpb3VzWSA9IHBvaW50Q3VycmVudC5tb2RlbC55IC0gZGVsdGFYICogcG9pbnRDdXJyZW50Lm1LXG4gICAgICB9XG4gICAgICBpZiAocG9pbnRBZnRlciAmJiAhcG9pbnRBZnRlci5tb2RlbC5za2lwKSB7XG4gICAgICAgIGRlbHRhWCA9IChwb2ludEFmdGVyLm1vZGVsLnggLSBwb2ludEN1cnJlbnQubW9kZWwueCkgLyAzXG4gICAgICAgIHBvaW50Q3VycmVudC5tb2RlbC5jb250cm9sUG9pbnROZXh0WCA9IHBvaW50Q3VycmVudC5tb2RlbC54ICsgZGVsdGFYXG4gICAgICAgIHBvaW50Q3VycmVudC5tb2RlbC5jb250cm9sUG9pbnROZXh0WSA9IHBvaW50Q3VycmVudC5tb2RlbC55ICsgZGVsdGFYICogcG9pbnRDdXJyZW50Lm1LXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGhlbHBlcnMubmV4dEl0ZW0gPSBmdW5jdGlvbiAoY29sbGVjdGlvbiwgaW5kZXgsIGxvb3ApIHtcbiAgICBpZiAobG9vcCkge1xuICAgICAgcmV0dXJuIGluZGV4ID49IGNvbGxlY3Rpb24ubGVuZ3RoIC0gMSA/IGNvbGxlY3Rpb25bMF0gOiBjb2xsZWN0aW9uW2luZGV4ICsgMV1cbiAgICB9XG4gICAgcmV0dXJuIGluZGV4ID49IGNvbGxlY3Rpb24ubGVuZ3RoIC0gMSA/IGNvbGxlY3Rpb25bY29sbGVjdGlvbi5sZW5ndGggLSAxXSA6IGNvbGxlY3Rpb25baW5kZXggKyAxXVxuICB9XG4gIGhlbHBlcnMucHJldmlvdXNJdGVtID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGluZGV4LCBsb29wKSB7XG4gICAgaWYgKGxvb3ApIHtcbiAgICAgIHJldHVybiBpbmRleCA8PSAwID8gY29sbGVjdGlvbltjb2xsZWN0aW9uLmxlbmd0aCAtIDFdIDogY29sbGVjdGlvbltpbmRleCAtIDFdXG4gICAgfVxuICAgIHJldHVybiBpbmRleCA8PSAwID8gY29sbGVjdGlvblswXSA6IGNvbGxlY3Rpb25baW5kZXggLSAxXVxuICB9XG4gIC8vIEltcGxlbWVudGF0aW9uIG9mIHRoZSBuaWNlIG51bWJlciBhbGdvcml0aG0gdXNlZCBpbiBkZXRlcm1pbmluZyB3aGVyZSBheGlzIGxhYmVscyB3aWxsIGdvXG4gIGhlbHBlcnMubmljZU51bSA9IGZ1bmN0aW9uIChyYW5nZSwgcm91bmQpIHtcbiAgICB2YXIgZXhwb25lbnQgPSBNYXRoLmZsb29yKGhlbHBlcnMubG9nMTAocmFuZ2UpKVxuICAgIHZhciBmcmFjdGlvbiA9IHJhbmdlIC8gTWF0aC5wb3coMTAsIGV4cG9uZW50KVxuICAgIHZhciBuaWNlRnJhY3Rpb25cblxuICAgIGlmIChyb3VuZCkge1xuICAgICAgaWYgKGZyYWN0aW9uIDwgMS41KSB7XG4gICAgICAgIG5pY2VGcmFjdGlvbiA9IDFcbiAgICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPCAzKSB7XG4gICAgICAgIG5pY2VGcmFjdGlvbiA9IDJcbiAgICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPCA3KSB7XG4gICAgICAgIG5pY2VGcmFjdGlvbiA9IDVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5pY2VGcmFjdGlvbiA9IDEwXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8PSAxLjApIHtcbiAgICAgIG5pY2VGcmFjdGlvbiA9IDFcbiAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDw9IDIpIHtcbiAgICAgIG5pY2VGcmFjdGlvbiA9IDJcbiAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDw9IDUpIHtcbiAgICAgIG5pY2VGcmFjdGlvbiA9IDVcbiAgICB9IGVsc2Uge1xuICAgICAgbmljZUZyYWN0aW9uID0gMTBcbiAgICB9XG5cbiAgICByZXR1cm4gbmljZUZyYWN0aW9uICogTWF0aC5wb3coMTAsIGV4cG9uZW50KVxuICB9XG4gIC8vIEVhc2luZyBmdW5jdGlvbnMgYWRhcHRlZCBmcm9tIFJvYmVydCBQZW5uZXIncyBlYXNpbmcgZXF1YXRpb25zXG4gIC8vIGh0dHA6Ly93d3cucm9iZXJ0cGVubmVyLmNvbS9lYXNpbmcvXG4gIHZhciBlYXNpbmdFZmZlY3RzID0gaGVscGVycy5lYXNpbmdFZmZlY3RzID0ge1xuICAgIGxpbmVhcjogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiB0XG4gICAgfSxcbiAgICBlYXNlSW5RdWFkOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIHQgKiB0XG4gICAgfSxcbiAgICBlYXNlT3V0UXVhZDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAtMSAqIHQgKiAodCAtIDIpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRRdWFkOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogdCAqIHRcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMSAvIDIgKiAoKC0tdCkgKiAodCAtIDIpIC0gMSlcbiAgICB9LFxuICAgIGVhc2VJbkN1YmljOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIHQgKiB0ICogdFxuICAgIH0sXG4gICAgZWFzZU91dEN1YmljOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgKiAoKHQgPSB0IC8gMSAtIDEpICogdCAqIHQgKyAxKVxuICAgIH0sXG4gICAgZWFzZUluT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gMSAvIDIgKiB0ICogdCAqIHRcbiAgICAgIH1cbiAgICAgIHJldHVybiAxIC8gMiAqICgodCAtPSAyKSAqIHQgKiB0ICsgMilcbiAgICB9LFxuICAgIGVhc2VJblF1YXJ0OiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIHQgKiB0ICogdCAqIHRcbiAgICB9LFxuICAgIGVhc2VPdXRRdWFydDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAtMSAqICgodCA9IHQgLyAxIC0gMSkgKiB0ICogdCAqIHQgLSAxKVxuICAgIH0sXG4gICAgZWFzZUluT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gMSAvIDIgKiB0ICogdCAqIHQgKiB0XG4gICAgICB9XG4gICAgICByZXR1cm4gLTEgLyAyICogKCh0IC09IDIpICogdCAqIHQgKiB0IC0gMilcbiAgICB9LFxuICAgIGVhc2VJblF1aW50OiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgKiAodCAvPSAxKSAqIHQgKiB0ICogdCAqIHRcbiAgICB9LFxuICAgIGVhc2VPdXRRdWludDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxICogKCh0ID0gdCAvIDEgLSAxKSAqIHQgKiB0ICogdCAqIHQgKyAxKVxuICAgIH0sXG4gICAgZWFzZUluT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gMSAvIDIgKiB0ICogdCAqIHQgKiB0ICogdFxuICAgICAgfVxuICAgICAgcmV0dXJuIDEgLyAyICogKCh0IC09IDIpICogdCAqIHQgKiB0ICogdCArIDIpXG4gICAgfSxcbiAgICBlYXNlSW5TaW5lOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIC0xICogTWF0aC5jb3ModCAvIDEgKiAoTWF0aC5QSSAvIDIpKSArIDFcbiAgICB9LFxuICAgIGVhc2VPdXRTaW5lOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgKiBNYXRoLnNpbih0IC8gMSAqIChNYXRoLlBJIC8gMikpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRTaW5lOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIC0xIC8gMiAqIChNYXRoLmNvcyhNYXRoLlBJICogdCAvIDEpIC0gMSlcbiAgICB9LFxuICAgIGVhc2VJbkV4cG86IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gKHQgPT09IDApID8gMSA6IDEgKiBNYXRoLnBvdygyLCAxMCAqICh0IC8gMSAtIDEpKVxuICAgIH0sXG4gICAgZWFzZU91dEV4cG86IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gKHQgPT09IDEpID8gMSA6IDEgKiAoLU1hdGgucG93KDIsIC0xMCAqIHQgLyAxKSArIDEpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRFeHBvOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKHQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cbiAgICAgIGlmICh0ID09PSAxKSB7XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gMSAvIDIgKiBNYXRoLnBvdygyLCAxMCAqICh0IC0gMSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gMSAvIDIgKiAoLU1hdGgucG93KDIsIC0xMCAqIC0tdCkgKyAyKVxuICAgIH0sXG4gICAgZWFzZUluQ2lyYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICh0ID49IDEpIHtcbiAgICAgICAgcmV0dXJuIHRcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMSAqIChNYXRoLnNxcnQoMSAtICh0IC89IDEpICogdCkgLSAxKVxuICAgIH0sXG4gICAgZWFzZU91dENpcmM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gMSAqIE1hdGguc3FydCgxIC0gKHQgPSB0IC8gMSAtIDEpICogdClcbiAgICB9LFxuICAgIGVhc2VJbk91dENpcmM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gLTEgLyAyICogKE1hdGguc3FydCgxIC0gdCAqIHQpIC0gMSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAxIC8gMiAqIChNYXRoLnNxcnQoMSAtICh0IC09IDIpICogdCkgKyAxKVxuICAgIH0sXG4gICAgZWFzZUluRWxhc3RpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgdmFyIHAgPSAwXG4gICAgICB2YXIgYSA9IDFcbiAgICAgIGlmICh0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgICBpZiAoKHQgLz0gMSkgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIH1cbiAgICAgIGlmICghcCkge1xuICAgICAgICBwID0gMSAqIDAuM1xuICAgICAgfVxuICAgICAgaWYgKGEgPCBNYXRoLmFicygxKSkge1xuICAgICAgICBhID0gMVxuICAgICAgICBzID0gcCAvIDRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMgPSBwIC8gKDIgKiBNYXRoLlBJKSAqIE1hdGguYXNpbigxIC8gYSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAtKGEgKiBNYXRoLnBvdygyLCAxMCAqICh0IC09IDEpKSAqIE1hdGguc2luKCh0ICogMSAtIHMpICogKDIgKiBNYXRoLlBJKSAvIHApKVxuICAgIH0sXG4gICAgZWFzZU91dEVsYXN0aWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIHZhciBwID0gMFxuICAgICAgdmFyIGEgPSAxXG4gICAgICBpZiAodCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuICAgICAgaWYgKCh0IC89IDEpID09PSAxKSB7XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9XG4gICAgICBpZiAoIXApIHtcbiAgICAgICAgcCA9IDEgKiAwLjNcbiAgICAgIH1cbiAgICAgIGlmIChhIDwgTWF0aC5hYnMoMSkpIHtcbiAgICAgICAgYSA9IDFcbiAgICAgICAgcyA9IHAgLyA0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzID0gcCAvICgyICogTWF0aC5QSSkgKiBNYXRoLmFzaW4oMSAvIGEpXG4gICAgICB9XG4gICAgICByZXR1cm4gYSAqIE1hdGgucG93KDIsIC0xMCAqIHQpICogTWF0aC5zaW4oKHQgKiAxIC0gcykgKiAoMiAqIE1hdGguUEkpIC8gcCkgKyAxXG4gICAgfSxcbiAgICBlYXNlSW5PdXRFbGFzdGljOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICB2YXIgcCA9IDBcbiAgICAgIHZhciBhID0gMVxuICAgICAgaWYgKHQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cbiAgICAgIGlmICgodCAvPSAxIC8gMikgPT09IDIpIHtcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIH1cbiAgICAgIGlmICghcCkge1xuICAgICAgICBwID0gMSAqICgwLjMgKiAxLjUpXG4gICAgICB9XG4gICAgICBpZiAoYSA8IE1hdGguYWJzKDEpKSB7XG4gICAgICAgIGEgPSAxXG4gICAgICAgIHMgPSBwIC8gNFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcyA9IHAgLyAoMiAqIE1hdGguUEkpICogTWF0aC5hc2luKDEgLyBhKVxuICAgICAgfVxuICAgICAgaWYgKHQgPCAxKSB7XG4gICAgICAgIHJldHVybiAtMC41ICogKGEgKiBNYXRoLnBvdygyLCAxMCAqICh0IC09IDEpKSAqIE1hdGguc2luKCh0ICogMSAtIHMpICogKDIgKiBNYXRoLlBJKSAvIHApKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGEgKiBNYXRoLnBvdygyLCAtMTAgKiAodCAtPSAxKSkgKiBNYXRoLnNpbigodCAqIDEgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSAqIDAuNSArIDFcbiAgICB9LFxuICAgIGVhc2VJbkJhY2s6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIHJldHVybiAxICogKHQgLz0gMSkgKiB0ICogKChzICsgMSkgKiB0IC0gcylcbiAgICB9LFxuICAgIGVhc2VPdXRCYWNrOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICByZXR1cm4gMSAqICgodCA9IHQgLyAxIC0gMSkgKiB0ICogKChzICsgMSkgKiB0ICsgcykgKyAxKVxuICAgIH0sXG4gICAgZWFzZUluT3V0QmFjazogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogKHQgKiB0ICogKCgocyAqPSAoMS41MjUpKSArIDEpICogdCAtIHMpKVxuICAgICAgfVxuICAgICAgcmV0dXJuIDEgLyAyICogKCh0IC09IDIpICogdCAqICgoKHMgKj0gKDEuNTI1KSkgKyAxKSAqIHQgKyBzKSArIDIpXG4gICAgfSxcbiAgICBlYXNlSW5Cb3VuY2U6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gMSAtIGVhc2luZ0VmZmVjdHMuZWFzZU91dEJvdW5jZSgxIC0gdClcbiAgICB9LFxuICAgIGVhc2VPdXRCb3VuY2U6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAoKHQgLz0gMSkgPCAoMSAvIDIuNzUpKSB7XG4gICAgICAgIHJldHVybiAxICogKDcuNTYyNSAqIHQgKiB0KVxuICAgICAgfSBlbHNlIGlmICh0IDwgKDIgLyAyLjc1KSkge1xuICAgICAgICByZXR1cm4gMSAqICg3LjU2MjUgKiAodCAtPSAoMS41IC8gMi43NSkpICogdCArIDAuNzUpXG4gICAgICB9IGVsc2UgaWYgKHQgPCAoMi41IC8gMi43NSkpIHtcbiAgICAgICAgcmV0dXJuIDEgKiAoNy41NjI1ICogKHQgLT0gKDIuMjUgLyAyLjc1KSkgKiB0ICsgMC45Mzc1KVxuICAgICAgfVxuICAgICAgcmV0dXJuIDEgKiAoNy41NjI1ICogKHQgLT0gKDIuNjI1IC8gMi43NSkpICogdCArIDAuOTg0Mzc1KVxuICAgIH0sXG4gICAgZWFzZUluT3V0Qm91bmNlOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKHQgPCAxIC8gMikge1xuICAgICAgICByZXR1cm4gZWFzaW5nRWZmZWN0cy5lYXNlSW5Cb3VuY2UodCAqIDIpICogMC41XG4gICAgICB9XG4gICAgICByZXR1cm4gZWFzaW5nRWZmZWN0cy5lYXNlT3V0Qm91bmNlKHQgKiAyIC0gMSkgKiAwLjUgKyAxICogMC41XG4gICAgfVxuICB9XG4gIC8vIFJlcXVlc3QgYW5pbWF0aW9uIHBvbHlmaWxsIC0gaHR0cDovL3d3dy5wYXVsaXJpc2guY29tLzIwMTEvcmVxdWVzdGFuaW1hdGlvbmZyYW1lLWZvci1zbWFydC1hbmltYXRpbmcvXG4gIC8vIGhlbHBlcnMucmVxdWVzdEFuaW1GcmFtZSA9IChmdW5jdGlvbigpIHtcbiAgLy8gICAgIHJldHVybiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG4gIC8vICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAvLyAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcbiAgLy8gICAgICAgICB3aW5kb3cub1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAvLyAgICAgICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAvLyAgICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gIC8vICAgICAgICAgICAgIHJldHVybiB3aW5kb3cuc2V0VGltZW91dChjYWxsYmFjaywgMTAwMCAvIDYwKVxuICAvLyAgICAgICAgIH1cbiAgLy8gfSgpKVxuICAvLyAtLSBET00gbWV0aG9kc1xuICBoZWxwZXJzLmdldFJlbGF0aXZlUG9zaXRpb24gPSBmdW5jdGlvbiAoZXZ0LCBjaGFydCkge1xuICAgIHZhciBtb3VzZVgsIG1vdXNlWVxuICAgIHZhciBlID0gZXZ0Lm9yaWdpbmFsRXZlbnQgfHwgZXZ0LFxuICAgICAgY2FudmFzID0gZXZ0LmN1cnJlbnRUYXJnZXQgfHwgZXZ0LnNyY0VsZW1lbnQsXG4gICAgICBib3VuZGluZ1JlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgIHZhciB0b3VjaGVzID0gZS50b3VjaGVzXG4gICAgaWYgKHRvdWNoZXMgJiYgdG91Y2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICBtb3VzZVggPSB0b3VjaGVzWzBdLmNsaWVudFhcbiAgICAgIG1vdXNlWSA9IHRvdWNoZXNbMF0uY2xpZW50WVxuICAgIH0gZWxzZSB7XG4gICAgICBtb3VzZVggPSBlLmNsaWVudFhcbiAgICAgIG1vdXNlWSA9IGUuY2xpZW50WVxuICAgIH1cblxuICAgIC8vIFNjYWxlIG1vdXNlIGNvb3JkaW5hdGVzIGludG8gY2FudmFzIGNvb3JkaW5hdGVzXG4gICAgLy8gYnkgZm9sbG93aW5nIHRoZSBwYXR0ZXJuIGxhaWQgb3V0IGJ5ICdqZXJyeWonIGluIHRoZSBjb21tZW50cyBvZlxuICAgIC8vIGh0dHA6Ly93d3cuaHRtbDVjYW52YXN0dXRvcmlhbHMuY29tL2FkdmFuY2VkL2h0bWw1LWNhbnZhcy1tb3VzZS1jb29yZGluYXRlcy9cbiAgICB2YXIgcGFkZGluZ0xlZnQgPSBwYXJzZUZsb2F0KGhlbHBlcnMuZ2V0U3R5bGUoY2FudmFzLCAncGFkZGluZy1sZWZ0JykpXG4gICAgdmFyIHBhZGRpbmdUb3AgPSBwYXJzZUZsb2F0KGhlbHBlcnMuZ2V0U3R5bGUoY2FudmFzLCAncGFkZGluZy10b3AnKSlcbiAgICB2YXIgcGFkZGluZ1JpZ2h0ID0gcGFyc2VGbG9hdChoZWxwZXJzLmdldFN0eWxlKGNhbnZhcywgJ3BhZGRpbmctcmlnaHQnKSlcbiAgICB2YXIgcGFkZGluZ0JvdHRvbSA9IHBhcnNlRmxvYXQoaGVscGVycy5nZXRTdHlsZShjYW52YXMsICdwYWRkaW5nLWJvdHRvbScpKVxuICAgIHZhciB3aWR0aCA9IGJvdW5kaW5nUmVjdC5yaWdodCAtIGJvdW5kaW5nUmVjdC5sZWZ0IC0gcGFkZGluZ0xlZnQgLSBwYWRkaW5nUmlnaHRcbiAgICB2YXIgaGVpZ2h0ID0gYm91bmRpbmdSZWN0LmJvdHRvbSAtIGJvdW5kaW5nUmVjdC50b3AgLSBwYWRkaW5nVG9wIC0gcGFkZGluZ0JvdHRvbVxuXG4gICAgLy8gV2UgZGl2aWRlIGJ5IHRoZSBjdXJyZW50IGRldmljZSBwaXhlbCByYXRpbywgYmVjYXVzZSB0aGUgY2FudmFzIGlzIHNjYWxlZCB1cCBieSB0aGF0IGFtb3VudCBpbiBlYWNoIGRpcmVjdGlvbi4gSG93ZXZlclxuICAgIC8vIHRoZSBiYWNrZW5kIG1vZGVsIGlzIGluIHVuc2NhbGVkIGNvb3JkaW5hdGVzLiBTaW5jZSB3ZSBhcmUgZ29pbmcgdG8gZGVhbCB3aXRoIG91ciBtb2RlbCBjb29yZGluYXRlcywgd2UgZ28gYmFjayBoZXJlXG4gICAgbW91c2VYID0gTWF0aC5yb3VuZCgobW91c2VYIC0gYm91bmRpbmdSZWN0LmxlZnQgLSBwYWRkaW5nTGVmdCkgLyAod2lkdGgpICogY2FudmFzLndpZHRoIC8gY2hhcnQuY3VycmVudERldmljZVBpeGVsUmF0aW8pXG4gICAgbW91c2VZID0gTWF0aC5yb3VuZCgobW91c2VZIC0gYm91bmRpbmdSZWN0LnRvcCAtIHBhZGRpbmdUb3ApIC8gKGhlaWdodCkgKiBjYW52YXMuaGVpZ2h0IC8gY2hhcnQuY3VycmVudERldmljZVBpeGVsUmF0aW8pXG5cbiAgICByZXR1cm4ge1xuICAgICAgeDogbW91c2VYLFxuICAgICAgeTogbW91c2VZXG4gICAgfVxuICB9XG4gIGhlbHBlcnMuYWRkRXZlbnQgPSBmdW5jdGlvbiAobm9kZSwgZXZlbnRUeXBlLCBtZXRob2QpIHtcbiAgICBpZiAobm9kZS5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBtZXRob2QpXG4gICAgfSBlbHNlIGlmIChub2RlLmF0dGFjaEV2ZW50KSB7XG4gICAgICBub2RlLmF0dGFjaEV2ZW50KCdvbicgKyBldmVudFR5cGUsIG1ldGhvZClcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZVsnb24nICsgZXZlbnRUeXBlXSA9IG1ldGhvZFxuICAgIH1cbiAgfVxuICBoZWxwZXJzLnJlbW92ZUV2ZW50ID0gZnVuY3Rpb24gKG5vZGUsIGV2ZW50VHlwZSwgaGFuZGxlcikge1xuICAgIGlmIChub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGhhbmRsZXIsIGZhbHNlKVxuICAgIH0gZWxzZSBpZiAobm9kZS5kZXRhY2hFdmVudCkge1xuICAgICAgbm9kZS5kZXRhY2hFdmVudCgnb24nICsgZXZlbnRUeXBlLCBoYW5kbGVyKVxuICAgIH0gZWxzZSB7XG4gICAgICBub2RlWydvbicgKyBldmVudFR5cGVdID0gaGVscGVycy5ub29wXG4gICAgfVxuICB9XG5cbiAgLy8gUHJpdmF0ZSBoZWxwZXIgZnVuY3Rpb24gdG8gY29udmVydCBtYXgtd2lkdGgvbWF4LWhlaWdodCB2YWx1ZXMgdGhhdCBtYXkgYmUgcGVyY2VudGFnZXMgaW50byBhIG51bWJlclxuICBmdW5jdGlvbiBwYXJzZU1heFN0eWxlIChzdHlsZVZhbHVlLCBub2RlLCBwYXJlbnRQcm9wZXJ0eSkge1xuICAgIHZhciB2YWx1ZUluUGl4ZWxzXG4gICAgaWYgKHR5cGVvZiAoc3R5bGVWYWx1ZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZUluUGl4ZWxzID0gcGFyc2VJbnQoc3R5bGVWYWx1ZSwgMTApXG5cbiAgICAgIGlmIChzdHlsZVZhbHVlLmluZGV4T2YoJyUnKSAhPT0gLTEpIHtcbiAgICAgICAgLy8gcGVyY2VudGFnZSAqIHNpemUgaW4gZGltZW5zaW9uXG4gICAgICAgIHZhbHVlSW5QaXhlbHMgPSB2YWx1ZUluUGl4ZWxzIC8gMTAwICogbm9kZS5wYXJlbnROb2RlW3BhcmVudFByb3BlcnR5XVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZUluUGl4ZWxzID0gc3R5bGVWYWx1ZVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZUluUGl4ZWxzXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBpZiB0aGUgZ2l2ZW4gdmFsdWUgY29udGFpbnMgYW4gZWZmZWN0aXZlIGNvbnN0cmFpbnQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBpc0NvbnN0cmFpbmVkVmFsdWUgKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09ICdub25lJ1xuICB9XG5cbiAgLy8gUHJpdmF0ZSBoZWxwZXIgdG8gZ2V0IGEgY29uc3RyYWludCBkaW1lbnNpb25cbiAgLy8gQHBhcmFtIGRvbU5vZGUgOiB0aGUgbm9kZSB0byBjaGVjayB0aGUgY29uc3RyYWludCBvblxuICAvLyBAcGFyYW0gbWF4U3R5bGUgOiB0aGUgc3R5bGUgdGhhdCBkZWZpbmVzIHRoZSBtYXhpbXVtIGZvciB0aGUgZGlyZWN0aW9uIHdlIGFyZSB1c2luZyAobWF4V2lkdGggLyBtYXhIZWlnaHQpXG4gIC8vIEBwYXJhbSBwZXJjZW50YWdlUHJvcGVydHkgOiBwcm9wZXJ0eSBvZiBwYXJlbnQgdG8gdXNlIHdoZW4gY2FsY3VsYXRpbmcgd2lkdGggYXMgYSBwZXJjZW50YWdlXG4gIC8vIEBzZWUgaHR0cDovL3d3dy5uYXRoYW5hZWxqb25lcy5jb20vYmxvZy8yMDEzL3JlYWRpbmctbWF4LXdpZHRoLWNyb3NzLWJyb3dzZXJcbiAgZnVuY3Rpb24gZ2V0Q29uc3RyYWludERpbWVuc2lvbiAoZG9tTm9kZSwgbWF4U3R5bGUsIHBlcmNlbnRhZ2VQcm9wZXJ0eSkge1xuICAgIHZhciB2aWV3ID0gZG9jdW1lbnQuZGVmYXVsdFZpZXdcbiAgICB2YXIgcGFyZW50Tm9kZSA9IGRvbU5vZGUucGFyZW50Tm9kZVxuICAgIHZhciBjb25zdHJhaW5lZE5vZGUgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUoZG9tTm9kZSlbbWF4U3R5bGVdXG4gICAgdmFyIGNvbnN0cmFpbmVkQ29udGFpbmVyID0gdmlldy5nZXRDb21wdXRlZFN0eWxlKHBhcmVudE5vZGUpW21heFN0eWxlXVxuICAgIHZhciBoYXNDTm9kZSA9IGlzQ29uc3RyYWluZWRWYWx1ZShjb25zdHJhaW5lZE5vZGUpXG4gICAgdmFyIGhhc0NDb250YWluZXIgPSBpc0NvbnN0cmFpbmVkVmFsdWUoY29uc3RyYWluZWRDb250YWluZXIpXG4gICAgdmFyIGluZmluaXR5ID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXG5cbiAgICBpZiAoaGFzQ05vZGUgfHwgaGFzQ0NvbnRhaW5lcikge1xuICAgICAgcmV0dXJuIE1hdGgubWluKFxuICAgICAgICBoYXNDTm9kZSA/IHBhcnNlTWF4U3R5bGUoY29uc3RyYWluZWROb2RlLCBkb21Ob2RlLCBwZXJjZW50YWdlUHJvcGVydHkpIDogaW5maW5pdHksXG4gICAgICAgIGhhc0NDb250YWluZXIgPyBwYXJzZU1heFN0eWxlKGNvbnN0cmFpbmVkQ29udGFpbmVyLCBwYXJlbnROb2RlLCBwZXJjZW50YWdlUHJvcGVydHkpIDogaW5maW5pdHkpXG4gICAgfVxuXG4gICAgcmV0dXJuICdub25lJ1xuICB9XG4gIC8vIHJldHVybnMgTnVtYmVyIG9yIHVuZGVmaW5lZCBpZiBubyBjb25zdHJhaW50XG4gIGhlbHBlcnMuZ2V0Q29uc3RyYWludFdpZHRoID0gZnVuY3Rpb24gKGRvbU5vZGUpIHtcbiAgICByZXR1cm4gZ2V0Q29uc3RyYWludERpbWVuc2lvbihkb21Ob2RlLCAnbWF4LXdpZHRoJywgJ2NsaWVudFdpZHRoJylcbiAgfVxuICAvLyByZXR1cm5zIE51bWJlciBvciB1bmRlZmluZWQgaWYgbm8gY29uc3RyYWludFxuICBoZWxwZXJzLmdldENvbnN0cmFpbnRIZWlnaHQgPSBmdW5jdGlvbiAoZG9tTm9kZSkge1xuICAgIHJldHVybiBnZXRDb25zdHJhaW50RGltZW5zaW9uKGRvbU5vZGUsICdtYXgtaGVpZ2h0JywgJ2NsaWVudEhlaWdodCcpXG4gIH1cbiAgaGVscGVycy5nZXRNYXhpbXVtV2lkdGggPSBmdW5jdGlvbiAoZG9tTm9kZSkge1xuICAgIHZhciBjb250YWluZXIgPSBkb21Ob2RlLnBhcmVudE5vZGVcbiAgICB2YXIgcGFkZGluZ0xlZnQgPSBwYXJzZUludChoZWxwZXJzLmdldFN0eWxlKGNvbnRhaW5lciwgJ3BhZGRpbmctbGVmdCcpLCAxMClcbiAgICB2YXIgcGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoaGVscGVycy5nZXRTdHlsZShjb250YWluZXIsICdwYWRkaW5nLXJpZ2h0JyksIDEwKVxuICAgIHZhciB3ID0gY29udGFpbmVyLmNsaWVudFdpZHRoIC0gcGFkZGluZ0xlZnQgLSBwYWRkaW5nUmlnaHRcbiAgICB2YXIgY3cgPSBoZWxwZXJzLmdldENvbnN0cmFpbnRXaWR0aChkb21Ob2RlKVxuICAgIHJldHVybiBpc05hTihjdykgPyB3IDogTWF0aC5taW4odywgY3cpXG4gIH1cbiAgaGVscGVycy5nZXRNYXhpbXVtSGVpZ2h0ID0gZnVuY3Rpb24gKGRvbU5vZGUpIHtcbiAgICB2YXIgY29udGFpbmVyID0gZG9tTm9kZS5wYXJlbnROb2RlXG4gICAgdmFyIHBhZGRpbmdUb3AgPSBwYXJzZUludChoZWxwZXJzLmdldFN0eWxlKGNvbnRhaW5lciwgJ3BhZGRpbmctdG9wJyksIDEwKVxuICAgIHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VJbnQoaGVscGVycy5nZXRTdHlsZShjb250YWluZXIsICdwYWRkaW5nLWJvdHRvbScpLCAxMClcbiAgICB2YXIgaCA9IGNvbnRhaW5lci5jbGllbnRIZWlnaHQgLSBwYWRkaW5nVG9wIC0gcGFkZGluZ0JvdHRvbVxuICAgIHZhciBjaCA9IGhlbHBlcnMuZ2V0Q29uc3RyYWludEhlaWdodChkb21Ob2RlKVxuICAgIHJldHVybiBpc05hTihjaCkgPyBoIDogTWF0aC5taW4oaCwgY2gpXG4gIH1cbiAgaGVscGVycy5nZXRTdHlsZSA9IGZ1bmN0aW9uIChlbCwgcHJvcGVydHkpIHtcbiAgICByZXR1cm4gZWwuY3VycmVudFN0eWxlXG4gICAgICA/IGVsLmN1cnJlbnRTdHlsZVtwcm9wZXJ0eV1cbiAgICAgIDogZG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSlcbiAgfVxuICBoZWxwZXJzLnJldGluYVNjYWxlID0gZnVuY3Rpb24gKGNoYXJ0KSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7IHJldHVybiAndGhpcyBpcyBzZXJ2ZXInIH1cblxuICAgIHZhciBwaXhlbFJhdGlvID0gY2hhcnQuY3VycmVudERldmljZVBpeGVsUmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxXG4gICAgaWYgKHBpeGVsUmF0aW8gPT09IDEpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciBjYW52YXMgPSBjaGFydC5jYW52YXNcbiAgICB2YXIgaGVpZ2h0ID0gY2hhcnQuaGVpZ2h0XG4gICAgdmFyIHdpZHRoID0gY2hhcnQud2lkdGhcblxuICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgKiBwaXhlbFJhdGlvXG4gICAgY2FudmFzLndpZHRoID0gd2lkdGggKiBwaXhlbFJhdGlvXG4gICAgY2hhcnQuY3R4LnNjYWxlKHBpeGVsUmF0aW8sIHBpeGVsUmF0aW8pXG5cbiAgICAvLyBJZiBubyBzdHlsZSBoYXMgYmVlbiBzZXQgb24gdGhlIGNhbnZhcywgdGhlIHJlbmRlciBzaXplIGlzIHVzZWQgYXMgZGlzcGxheSBzaXplLFxuICAgIC8vIG1ha2luZyB0aGUgY2hhcnQgdmlzdWFsbHkgYmlnZ2VyLCBzbyBsZXQncyBlbmZvcmNlIGl0IHRvIHRoZSBcImNvcnJlY3RcIiB2YWx1ZXMuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGFydGpzL0NoYXJ0LmpzL2lzc3Vlcy8zNTc1XG4gICAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCdcbiAgICBjYW52YXMuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCdcbiAgfVxuICAvLyAtLSBDYW52YXMgbWV0aG9kc1xuICBoZWxwZXJzLmNsZWFyID0gZnVuY3Rpb24gKGNoYXJ0KSB7XG4gICAgY2hhcnQuY3R4LmNsZWFyUmVjdCgwLCAwLCBjaGFydC53aWR0aCwgY2hhcnQuaGVpZ2h0KVxuICB9XG4gIGhlbHBlcnMuZm9udFN0cmluZyA9IGZ1bmN0aW9uIChwaXhlbFNpemUsIGZvbnRTdHlsZSwgZm9udEZhbWlseSkge1xuICAgIHJldHVybiBmb250U3R5bGUgKyAnICcgKyBwaXhlbFNpemUgKyAncHggJyArIGZvbnRGYW1pbHlcbiAgfVxuICBoZWxwZXJzLmxvbmdlc3RUZXh0ID0gZnVuY3Rpb24gKGN0eCwgZm9udCwgYXJyYXlPZlRoaW5ncywgY2FjaGUpIHtcbiAgICBjYWNoZSA9IGNhY2hlIHx8IHt9XG4gICAgdmFyIGRhdGEgPSBjYWNoZS5kYXRhID0gY2FjaGUuZGF0YSB8fCB7fVxuICAgIHZhciBnYyA9IGNhY2hlLmdhcmJhZ2VDb2xsZWN0ID0gY2FjaGUuZ2FyYmFnZUNvbGxlY3QgfHwgW11cblxuICAgIGlmIChjYWNoZS5mb250ICE9PSBmb250KSB7XG4gICAgICBkYXRhID0gY2FjaGUuZGF0YSA9IHt9XG4gICAgICBnYyA9IGNhY2hlLmdhcmJhZ2VDb2xsZWN0ID0gW11cbiAgICAgIGNhY2hlLmZvbnQgPSBmb250XG4gICAgfVxuXG4gICAgY3R4LmZvbnQgPSBmb250XG4gICAgdmFyIGxvbmdlc3QgPSAwXG4gICAgaGVscGVycy5lYWNoKGFycmF5T2ZUaGluZ3MsIGZ1bmN0aW9uICh0aGluZykge1xuICAgICAgLy8gVW5kZWZpbmVkIHN0cmluZ3MgYW5kIGFycmF5cyBzaG91bGQgbm90IGJlIG1lYXN1cmVkXG4gICAgICBpZiAodGhpbmcgIT09IHVuZGVmaW5lZCAmJiB0aGluZyAhPT0gbnVsbCAmJiBoZWxwZXJzLmlzQXJyYXkodGhpbmcpICE9PSB0cnVlKSB7XG4gICAgICAgIGxvbmdlc3QgPSBoZWxwZXJzLm1lYXN1cmVUZXh0KGN0eCwgZGF0YSwgZ2MsIGxvbmdlc3QsIHRoaW5nKVxuICAgICAgfSBlbHNlIGlmIChoZWxwZXJzLmlzQXJyYXkodGhpbmcpKSB7XG4gICAgICAgIC8vIGlmIGl0IGlzIGFuIGFycmF5IGxldHMgbWVhc3VyZSBlYWNoIGVsZW1lbnRcbiAgICAgICAgLy8gdG8gZG8gbWF5YmUgc2ltcGxpZnkgdGhpcyBmdW5jdGlvbiBhIGJpdCBzbyB3ZSBjYW4gZG8gdGhpcyBtb3JlIHJlY3Vyc2l2ZWx5P1xuICAgICAgICBoZWxwZXJzLmVhY2godGhpbmcsIGZ1bmN0aW9uIChuZXN0ZWRUaGluZykge1xuICAgICAgICAgIC8vIFVuZGVmaW5lZCBzdHJpbmdzIGFuZCBhcnJheXMgc2hvdWxkIG5vdCBiZSBtZWFzdXJlZFxuICAgICAgICAgIGlmIChuZXN0ZWRUaGluZyAhPT0gdW5kZWZpbmVkICYmIG5lc3RlZFRoaW5nICE9PSBudWxsICYmICFoZWxwZXJzLmlzQXJyYXkobmVzdGVkVGhpbmcpKSB7XG4gICAgICAgICAgICBsb25nZXN0ID0gaGVscGVycy5tZWFzdXJlVGV4dChjdHgsIGRhdGEsIGdjLCBsb25nZXN0LCBuZXN0ZWRUaGluZylcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHZhciBnY0xlbiA9IGdjLmxlbmd0aCAvIDJcbiAgICBpZiAoZ2NMZW4gPiBhcnJheU9mVGhpbmdzLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnY0xlbjsgaSsrKSB7XG4gICAgICAgIGRlbGV0ZSBkYXRhW2djW2ldXVxuICAgICAgfVxuICAgICAgZ2Muc3BsaWNlKDAsIGdjTGVuKVxuICAgIH1cbiAgICByZXR1cm4gbG9uZ2VzdFxuICB9XG4gIGhlbHBlcnMubWVhc3VyZVRleHQgPSBmdW5jdGlvbiAoY3R4LCBkYXRhLCBnYywgbG9uZ2VzdCwgc3RyaW5nKSB7XG4gICAgdmFyIHRleHRXaWR0aCA9IGRhdGFbc3RyaW5nXVxuICAgIGlmICghdGV4dFdpZHRoKSB7XG4gICAgICB0ZXh0V2lkdGggPSBkYXRhW3N0cmluZ10gPSBjdHgubWVhc3VyZVRleHQoc3RyaW5nKS53aWR0aFxuICAgICAgZ2MucHVzaChzdHJpbmcpXG4gICAgfVxuICAgIGlmICh0ZXh0V2lkdGggPiBsb25nZXN0KSB7XG4gICAgICBsb25nZXN0ID0gdGV4dFdpZHRoXG4gICAgfVxuICAgIHJldHVybiBsb25nZXN0XG4gIH1cbiAgaGVscGVycy5udW1iZXJPZkxhYmVsTGluZXMgPSBmdW5jdGlvbiAoYXJyYXlPZlRoaW5ncykge1xuICAgIHZhciBudW1iZXJPZkxpbmVzID0gMVxuICAgIGhlbHBlcnMuZWFjaChhcnJheU9mVGhpbmdzLCBmdW5jdGlvbiAodGhpbmcpIHtcbiAgICAgIGlmIChoZWxwZXJzLmlzQXJyYXkodGhpbmcpKSB7XG4gICAgICAgIGlmICh0aGluZy5sZW5ndGggPiBudW1iZXJPZkxpbmVzKSB7XG4gICAgICAgICAgbnVtYmVyT2ZMaW5lcyA9IHRoaW5nLmxlbmd0aFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gbnVtYmVyT2ZMaW5lc1xuICB9XG4gIGhlbHBlcnMuZHJhd1JvdW5kZWRSZWN0YW5nbGUgPSBmdW5jdGlvbiAoY3R4LCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCByYWRpdXMpIHtcbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHgubW92ZVRvKHggKyByYWRpdXMsIHkpXG4gICAgY3R4LmxpbmVUbyh4ICsgd2lkdGggLSByYWRpdXMsIHkpXG4gICAgY3R4LnF1YWRyYXRpY0N1cnZlVG8oeCArIHdpZHRoLCB5LCB4ICsgd2lkdGgsIHkgKyByYWRpdXMpXG4gICAgY3R4LmxpbmVUbyh4ICsgd2lkdGgsIHkgKyBoZWlnaHQgLSByYWRpdXMpXG4gICAgY3R4LnF1YWRyYXRpY0N1cnZlVG8oeCArIHdpZHRoLCB5ICsgaGVpZ2h0LCB4ICsgd2lkdGggLSByYWRpdXMsIHkgKyBoZWlnaHQpXG4gICAgY3R4LmxpbmVUbyh4ICsgcmFkaXVzLCB5ICsgaGVpZ2h0KVxuICAgIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKHgsIHkgKyBoZWlnaHQsIHgsIHkgKyBoZWlnaHQgLSByYWRpdXMpXG4gICAgY3R4LmxpbmVUbyh4LCB5ICsgcmFkaXVzKVxuICAgIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKHgsIHksIHggKyByYWRpdXMsIHkpXG4gICAgY3R4LmNsb3NlUGF0aCgpXG4gIH1cbiAgaGVscGVycy5jb2xvciA9IGZ1bmN0aW9uIChjKSB7XG4gICAgaWYgKCFjb2xvcikge1xuICAgICAgY29uc29sZS5lcnJvcignQ29sb3IuanMgbm90IGZvdW5kIScpXG4gICAgICByZXR1cm4gY1xuICAgIH1cblxuICAgIC8qIGdsb2JhbCBDYW52YXNHcmFkaWVudCAqL1xuICAgIGlmIChjIGluc3RhbmNlb2YgQ2FudmFzR3JhZGllbnQpIHtcbiAgICAgIHJldHVybiBjb2xvcihDaGFydC5kZWZhdWx0cy5nbG9iYWwuZGVmYXVsdENvbG9yKVxuICAgIH1cblxuICAgIHJldHVybiBjb2xvcihjKVxuICB9XG4gIGhlbHBlcnMuaXNBcnJheSA9IEFycmF5LmlzQXJyYXlcbiAgICA/IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KG9iailcbiAgICB9XG4gICAgOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgICB9XG4gIC8vICEgQHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNDg1Mzk3NFxuICBoZWxwZXJzLmFycmF5RXF1YWxzID0gZnVuY3Rpb24gKGEwLCBhMSkge1xuICAgIHZhciBpLCBpbGVuLCB2MCwgdjFcblxuICAgIGlmICghYTAgfHwgIWExIHx8IGEwLmxlbmd0aCAhPT0gYTEubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwLCBpbGVuID0gYTAubGVuZ3RoOyBpIDwgaWxlbjsgKytpKSB7XG4gICAgICB2MCA9IGEwW2ldXG4gICAgICB2MSA9IGExW2ldXG5cbiAgICAgIGlmICh2MCBpbnN0YW5jZW9mIEFycmF5ICYmIHYxIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgaWYgKCFoZWxwZXJzLmFycmF5RXF1YWxzKHYwLCB2MSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh2MCAhPT0gdjEpIHtcbiAgICAgICAgLy8gTk9URTogdHdvIGRpZmZlcmVudCBvYmplY3QgaW5zdGFuY2VzIHdpbGwgbmV2ZXIgYmUgZXF1YWw6IHt4OjIwfSAhPSB7eDoyMH1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBoZWxwZXJzLmNhbGxDYWxsYmFjayA9IGZ1bmN0aW9uIChmbiwgYXJncywgX3RBcmcpIHtcbiAgICBpZiAoZm4gJiYgdHlwZW9mIGZuLmNhbGwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZuLmFwcGx5KF90QXJnLCBhcmdzKVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLmdldEhvdmVyQ29sb3IgPSBmdW5jdGlvbiAoY29sb3JWYWx1ZSkge1xuICAgIC8qIGdsb2JhbCBDYW52YXNQYXR0ZXJuICovXG4gICAgcmV0dXJuIChjb2xvclZhbHVlIGluc3RhbmNlb2YgQ2FudmFzUGF0dGVybilcbiAgICAgID8gY29sb3JWYWx1ZVxuICAgICAgOiBoZWxwZXJzLmNvbG9yKGNvbG9yVmFsdWUpLnNhdHVyYXRlKDAuNSkuZGFya2VuKDAuMSkucmdiU3RyaW5nKClcbiAgfVxufVxuIiwidmFyIE5hcGNoYXJ0ID0gcmVxdWlyZSgnLi9pbml0JykoKVxyXG5cclxuLyogaGVscGVyIGZ1bmN0aW9ucyAqL1xyXG5yZXF1aXJlKCcuL2hlbHBlcnMnKShOYXBjaGFydClcclxucmVxdWlyZSgnLi9kcmF3L2NhbnZhc0hlbHBlcnMnKShOYXBjaGFydClcclxuXHJcbi8qIGNvbmZpZyBmaWxlcyAqL1xyXG5yZXF1aXJlKCcuL2NvbmZpZycpKE5hcGNoYXJ0KVxyXG5cclxuLyogcmVhbCBzaGl0ICovXHJcbnJlcXVpcmUoJy4vY29yZScpKE5hcGNoYXJ0KVxyXG5cclxuLyogZHJhd2luZyAqL1xyXG5yZXF1aXJlKCcuL3NoYXBlL3NoYXBlJykoTmFwY2hhcnQpXHJcbnJlcXVpcmUoJy4vZHJhdy9kcmF3JykoTmFwY2hhcnQpXHJcbnJlcXVpcmUoJy4vaW50ZXJhY3RDYW52YXMvaW50ZXJhY3RDYW52YXMnKShOYXBjaGFydClcclxuXHJcblxyXG4vKiBvdGhlciBtb2R1bGVzICovXHJcbi8vIHJlcXVpcmUoJy4vZmFuY3ltb2R1bGUnKShOYXBjaGFydClcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTmFwY2hhcnQiLCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCkge1xyXG4gIC8vIHZhciBjb25maWcgPSBkZWZhdWx0c1xyXG4gIHZhciBOYXBjaGFydCA9IGZ1bmN0aW9uIChpdGVtLCBjb25maWcpIHtcclxuICAgIHRoaXMuaW5pdGlhbGl6ZShpdGVtLCBjb25maWcpXHJcbiAgICByZXR1cm5cclxuICB9XHJcblxyXG4gIHJldHVybiBOYXBjaGFydFxyXG59XHJcbiIsIi8qXHJcbiogIEZhbmN5IG1vZHVsZSB0aGF0IGRvZXMgc2hpdFxyXG4qL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTmFwY2hhcnQpIHtcclxuICB2YXIgY2hhcnQ7XHJcblxyXG4gIE5hcGNoYXJ0Lm9uKCdpbml0aWFsaXplJywgZnVuY3Rpb24oaW5zdGFuY2UpIHtcclxuICAgIGNoYXJ0ID0gaW5zdGFuY2VcclxuICAgIGNoYXJ0LmNhbnZhcy5vbmNsaWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICBcdGNoYXJ0LnNldERhdGEoe1xyXG5cdFx0ICBuYXA6IFtdLFxyXG5cdFx0ICBjb3JlOiBbe3N0YXJ0OiAxNDEwLCBlbmQ6IDQ4MCwgc3RhdGU6J2FjdGl2ZSd9LCB7c3RhcnQ6IDEwMDAsIGVuZDogMTAyMH1dLFxyXG5cdFx0ICBidXN5OiBbe3N0YXJ0OiA3MDAsIGVuZDogOTAwfV1cclxuXHRcdH0pXHJcbiAgICB9XHJcbiAgfSlcclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBzaGFwZSA9IFtcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2FyYycsXHJcbiAgICAgIHJhZGlhbnM6IE1hdGguUEkgLyA0XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgIG1pbnV0ZXM6IDIwMFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2FyYycsXHJcbiAgICAgIHJhZGlhbnM6IE1hdGguUElcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgbWludXRlczogMjAwXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnYXJjJyxcclxuICAgICAgcmFkaWFuczogTWF0aC5QSSAqIDMgLyA0XHJcbiAgICB9XHJcbiAgXVxyXG5cclxuICB2YXIgc2hhcGUgPSBbXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdhcmMnLFxyXG4gICAgICByYWRpYW5zOiBNYXRoLlBJICogMlxyXG4gICAgfVxyXG4gIF1cclxuXHJcbiAgZnVuY3Rpb24gY2FsY3VsYXRlU2hhcGUgKGNoYXJ0LCBzaGFwZSkge1xyXG4gICAgdmFyIG1pbnV0ZXNQcmVzZXJ2ZWRCeUxpbmUgPSAwXHJcbiAgICB2YXIgcmFkaXVzID0gMTAwXHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaGFwZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoc2hhcGVbaV0udHlwZSA9PSAnbGluZScpIHtcclxuICAgICAgICBtaW51dGVzUHJlc2VydmVkQnlMaW5lICs9IHNoYXBlW2ldLm1pbnV0ZXNcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzcGFjZUZvckFyY3MgPSAxNDQwIC0gbWludXRlc1ByZXNlcnZlZEJ5TGluZVxyXG4gICAgaWYgKHNwYWNlRm9yQXJjcyA8IDApIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCd0b28gbXVjaCBzcGFjZSBpcyBnaXZlbiB0byBzdHJhaWdodCBzZWdtZW50cyBpbiB0aGUgc2hhcGUnKVxyXG4gICAgfVxyXG5cclxuICAgIHZhciB0b3RhbFJhZGlhbnMgPSAwXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNoYXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHNoYXBlW2ldLmFuZ2xlID0gdG90YWxSYWRpYW5zXHJcblxyXG4gICAgICBpZiAoc2hhcGVbaV0udHlwZSA9PSAnYXJjJykge1xyXG4gICAgICAgIHRvdGFsUmFkaWFucyArPSBzaGFwZVtpXS5yYWRpYW5zXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgcGF0aExlbmd0aFBlck1pbnV0ZVxyXG4gICAgLy8gY2FsYy4gbWludXRlc1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaGFwZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoc2hhcGVbaV0udHlwZSA9PSAnYXJjJykge1xyXG4gICAgICAgIHNoYXBlW2ldLm1pbnV0ZXMgPSAoc2hhcGVbaV0ucmFkaWFucyAvIHRvdGFsUmFkaWFucykgKiBzcGFjZUZvckFyY3NcclxuXHJcbiAgICAgICAgLy8gZmluZCBwZXJpbWV0ZXIgb2Ygd2hvbGUgbWFpbiBjaXJjbGUsIHRoZW4gZmluZCBsZW5ndGggb2YgdGhpc1xyXG4gICAgICAgIHNoYXBlW2ldLnBhdGhMZW5ndGggPSByYWRpdXMgKiAyICogTWF0aC5QSSAqIChzaGFwZVtpXS5yYWRpYW5zIC8gKE1hdGguUEkgKiAyKSlcclxuXHJcbiAgICAgICAgLy8gb25seSBuZWVkIHRvIGRvIHRoaXMgb25jZVxyXG4gICAgICAgIGlmIChpID09IDApIHtcclxuICAgICAgICAgIHBhdGhMZW5ndGhQZXJNaW51dGUgPSBzaGFwZVtpXS5wYXRoTGVuZ3RoIC8gc2hhcGVbaV0ubWludXRlc1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2hhcGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHNoYXBlW2ldLnR5cGUgPT0gJ2xpbmUnKSB7XHJcbiAgICAgICAgc2hhcGVbaV0ucGF0aExlbmd0aCA9IHNoYXBlW2ldLm1pbnV0ZXMgKiBwYXRoTGVuZ3RoUGVyTWludXRlXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgc3VtTWludXRlcyA9IDBcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2hhcGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgc2hhcGVbaV0uc3RhcnQgPSBzdW1NaW51dGVzXHJcbiAgICAgIHNoYXBlW2ldLmVuZCA9IHN1bU1pbnV0ZXMgKyBzaGFwZVtpXS5taW51dGVzXHJcblxyXG4gICAgICBzdW1NaW51dGVzICs9IHNoYXBlW2ldLm1pbnV0ZXNcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaW5kIGNlbnRyZXNcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2hhcGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgLy8gY29uc29sZS5sb2coaSlcclxuICAgICAgaWYgKGkgPT0gMCkge1xyXG4gICAgICAgIHNoYXBlW2ldLmNlbnRyZSA9IHtcclxuICAgICAgICAgIHg6IGNoYXJ0LncgLyAyLFxyXG4gICAgICAgICAgeTogY2hhcnQuaCAvIDJcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2hhcGVbaV0uY2VudHJlID0gc2hhcGVbaSAtIDFdLmVuZENlbnRyZVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoc2hhcGVbaV0udHlwZSA9PSAnbGluZScpIHtcclxuICAgICAgICBzaGFwZVtpXS5lbmRDZW50cmUgPSB7XHJcbiAgICAgICAgICB4OiBzaGFwZVtpXS5jZW50cmUueCArIE1hdGguY29zKHNoYXBlW2ldLmFuZ2xlKSAqIHNoYXBlW2ldLnBhdGhMZW5ndGgsXHJcbiAgICAgICAgICB5OiBzaGFwZVtpXS5jZW50cmUueSArIChNYXRoLnNpbihzaGFwZVtpXS5hbmdsZSkgKiBzaGFwZVtpXS5wYXRoTGVuZ3RoKVxyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzaGFwZVtpXS5lbmRDZW50cmUgPSBzaGFwZVtpXS5jZW50cmVcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzaGFwZVxyXG4gIH1cclxuXHJcbiAgTmFwY2hhcnQuc2hhcGUgPSBmdW5jdGlvbiAoY2hhcnQpIHtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICB9XHJcblxyXG4gIE5hcGNoYXJ0LmluaXRTaGFwZSA9IGZ1bmN0aW9uIChjaGFydCkge1xyXG4gICAgY2hhcnQuc2hhcGUgPSBjYWxjdWxhdGVTaGFwZShjaGFydCwgSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzaGFwZSkpKVxyXG4gIH1cclxuXHJcbiAgTmFwY2hhcnQuc2hhcGUubWludXRlc1RvWFkgPSBmdW5jdGlvbiAoY2hhcnQsIG1pbnV0ZXMsIHJhZGl1cykge1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gICAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gICAgdmFyIGMgPSB7IC8vIGNlbnRlclxyXG4gICAgICB4OiBjaGFydC53IC8gMixcclxuICAgICAgeTogY2hhcnQuaCAvIDJcclxuICAgIH1cclxuICAgIHZhciByID0gcmFkaXVzXHJcblxyXG4gICAgdmFyIGN1bVJhZCA9IDBcclxuICAgIHZhciBub3dQb2ludCA9IHtcclxuICAgICAgeDogYy54LFxyXG4gICAgICB5OiBjLnkgLSByXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNoYXBlID0gY2hhcnQuc2hhcGVcclxuXHJcbiAgICAvLyBmaW5kIHdoaWNoIGJsb2NrIHdlIGFyZSBpblxyXG4gICAgdmFyIGJsb2NrXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNoYXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBlID0gc2hhcGVbaV1cclxuXHJcbiAgICAgIC8vIGlmIHN0YXJ0IGlzIGluc2lkZSB0aGlzIHNoYXBlQmxvY2tcclxuICAgICAgaWYgKGhlbHBlcnMuaXNJbnNpZGUobWludXRlcywgZS5zdGFydCwgZS5lbmQpKSB7XHJcbiAgICAgICAgYmxvY2sgPSBzaGFwZVtpXVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBjb25zb2xlLmxvZyhibG9jaylcclxuICAgIGlmIChibG9jay50eXBlID09ICdsaW5lJykge1xyXG4gICAgICBjb25zb2xlLmxvZygnYWxhcm0nKVxyXG4gICAgICB2YXIgbWludXRlSW5ibG9jayA9IGhlbHBlcnMuZ2V0UHJvZ3Jlc3NCZXR3ZWVuVHdvVmFsdWVzKG1pbnV0ZXMsIGJsb2NrLnN0YXJ0LCBibG9jay5lbmQpXHJcbiAgICAgIHZhciBwYXRoTGVuZ3RoID0gbWludXRlSW5ibG9jayAqIGJsb2NrLnBhdGhMZW5ndGhcclxuICAgICAgY29uc29sZS5sb2cocGF0aExlbmd0aClcclxuICAgICAgdmFyIGFuZ2xlID0gYmxvY2suYW5nbGUgLSBNYXRoLlBJIC8gMlxyXG4gICAgICB2YXIgcGxzID0ge1xyXG4gICAgICAgIHg6IE1hdGguY29zKGFuZ2xlKSAqIHBhdGhMZW5ndGgsXHJcbiAgICAgICAgeTogLU1hdGguc2luKGFuZ2xlKSAqIHBhdGhMZW5ndGhcclxuICAgICAgfVxyXG4gICAgICB2YXIgbyA9IHtcclxuICAgICAgICB4OiBNYXRoLmNvcyhhbmdsZSkgKiByICsgYmxvY2suY2VudHJlLnggKyBwbHMueCxcclxuICAgICAgICB5OiBNYXRoLnNpbihhbmdsZSkgKiByICsgYmxvY2suY2VudHJlLnkgKyBwbHMueVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGJsb2NrLnR5cGUgPT0gJ2FyYycpIHtcclxuICAgICAgdmFyIHJhZFN0YXJ0ID0gYmxvY2suYW5nbGUgLSBNYXRoLlBJIC8gMlxyXG4gICAgICB2YXIgcG9pbnRSYWQgPSBoZWxwZXJzLmdldFByb2dyZXNzQmV0d2VlblR3b1ZhbHVlcyhtaW51dGVzLCBibG9jay5zdGFydCwgYmxvY2suZW5kKSAqIGJsb2NrLnJhZGlhbnMgKyByYWRTdGFydFxyXG5cclxuICAgICAgdmFyIG8gPSB7XHJcbiAgICAgICAgeDogTWF0aC5jb3MocG9pbnRSYWQpICogciArIGJsb2NrLmNlbnRyZS54LFxyXG4gICAgICAgIHk6IE1hdGguc2luKHBvaW50UmFkKSAqIHIgKyBibG9jay5jZW50cmUueVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9cclxuICB9XHJcblxyXG4gIE5hcGNoYXJ0LnNoYXBlLmNyZWF0ZUN1cnZlID0gZnVuY3Rpb24gKGNoYXJ0LCByYWRpdXMsIHN0YXJ0LCBlbmQsIGFudGljbG9ja3dpc2UpIHtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAgIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG5cclxuICAgIHZhciBjID0ge1xyXG4gICAgICB4OiBjaGFydC53IC8gMixcclxuICAgICAgeTogY2hhcnQuaCAvIDJcclxuICAgIH1cclxuICAgIHZhciByID0gcmFkaXVzXHJcblxyXG4gICAgdmFyIGN1bVJhZCA9IDBcclxuICAgIHZhciBub3dQb2ludCA9IHtcclxuICAgICAgeDogYy54LFxyXG4gICAgICB5OiBjLnkgLSByXHJcbiAgICB9XHJcbiAgICB2YXIgc2hhcGUgPSBoZWxwZXJzLmNsb25lKGNoYXJ0LnNoYXBlKVxyXG4gICAgaWYgKGFudGljbG9ja3dpc2UpIHtcclxuICAgICAgc2hhcGUucmV2ZXJzZSgpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmluZCBzdGFydFxyXG4gICAgdmFyIHN0YXJ0QmxvY2ssIGVuZEJsb2NrXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNoYXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciBlID0gc2hhcGVbaV1cclxuXHJcbiAgICAgIC8vIGlmIHN0YXJ0IGlzIGluc2lkZSB0aGlzIHNoYXBlQmxvY2tcclxuICAgICAgaWYgKGhlbHBlcnMuaXNJbnNpZGUoc3RhcnQsIGUuc3RhcnQsIGUuZW5kKSkge1xyXG4gICAgICAgIHN0YXJ0QmxvY2sgPSBpXHJcbiAgICAgIH1cclxuICAgICAgLy8gaWYgZW5kIGlzIGluc2lkZSB0aGlzIHNoYXBlQmxvY2tcclxuICAgICAgaWYgKGhlbHBlcnMuaXNJbnNpZGUoZW5kLCBlLnN0YXJ0LCBlLmVuZCkpIHtcclxuICAgICAgICBlbmRCbG9jayA9IGlcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0ZSBpdGVyYWJsZSB0YXNrIGFycmF5XHJcbiAgICB2YXIgdGFza0FycmF5ID0gW11cclxuICAgIHZhciBza2lwRW5kQ2hlY2sgPSBmYWxzZVxyXG4gICAgdmFyIGRlZmF1bHRUYXNrXHJcbiAgICBpZiAoYW50aWNsb2Nrd2lzZSkge1xyXG4gICAgICBkZWZhdWx0VGFzayA9IHtcclxuICAgICAgICBzdGFydDogMSxcclxuICAgICAgICBlbmQ6IDBcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZGVmYXVsdFRhc2sgPSB7XHJcbiAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgZW5kOiAxXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBpID0gc3RhcnRCbG9jazsgaSA8IHNoYXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciB0YXNrID0ge1xyXG4gICAgICAgIHNoYXBlOiBzaGFwZVtpXSxcclxuICAgICAgICBzdGFydDogZGVmYXVsdFRhc2suc3RhcnQsXHJcbiAgICAgICAgZW5kOiBkZWZhdWx0VGFzay5lbmRcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGkgPT0gc3RhcnRCbG9jaykge1xyXG4gICAgICAgIHRhc2suc3RhcnQgPSBoZWxwZXJzLmdldFByb2dyZXNzQmV0d2VlblR3b1ZhbHVlcyhzdGFydCwgc2hhcGVbaV0uc3RhcnQsIHNoYXBlW2ldLmVuZClcclxuICAgICAgfVxyXG4gICAgICBpZiAoaSA9PSBlbmRCbG9jaykge1xyXG4gICAgICAgIHRhc2suZW5kID0gaGVscGVycy5nZXRQcm9ncmVzc0JldHdlZW5Ud29WYWx1ZXMoZW5kLCBzaGFwZVtpXS5zdGFydCwgc2hhcGVbaV0uZW5kKVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpID09IHN0YXJ0QmxvY2sgJiYgaSA9PSBlbmRCbG9jayAmJiAodGFzay5lbmQgPiB0YXNrLnN0YXJ0ICYmIGFudGljbG9ja3dpc2UpIHx8ICh0YXNrLmVuZCA8IHRhc2suc3RhcnQgJiYgIWFudGljbG9ja3dpc2UpKSB7XHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoaW5ncyBhcmUgY29ycmVjdCB3aGVuIGVuZCBpcyBsZXNzIHRoYW4gc3RhcnRcclxuICAgICAgICBpZiAodGFza0FycmF5Lmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAvLyBpdCBpcyBiZWdpbm5pbmdcclxuICAgICAgICAgIHRhc2suZW5kID0gZGVmYXVsdFRhc2suZW5kXHJcbiAgICAgICAgICBza2lwRW5kQ2hlY2sgPSB0cnVlXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIGl0IGlzIGVuZFxyXG4gICAgICAgICAgdGFzay5zdGFydCA9IGRlZmF1bHRUYXNrLnN0YXJ0XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIC8vXHJcbiAgICAgIC8vIHZhciBvbGRFbmQgPSB0YXNrLmVuZFxyXG4gICAgICAvLyB0YXNrLmVuZCA9IHRhc2suc3RhcnRcclxuICAgICAgLy8gdGFzay5zdGFydCA9IG9sZEVuZFxyXG5cclxuICAgICAgdGFza0FycmF5LnB1c2godGFzaylcclxuXHJcbiAgICAgIGlmIChpID09IGVuZEJsb2NrKSB7XHJcbiAgICAgICAgaWYgKHNraXBFbmRDaGVjaykge1xyXG4gICAgICAgICAgc2tpcEVuZENoZWNrID0gZmFsc2VcclxuICAgICAgICAvLyBsZXQgaXQgcnVuIGEgcm91bmQgYW5kIGFkZCBhbGwgc2hhcGVzXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIGZpbmlzaGVkLi4gbm90aGluZyBtb3JlIHRvIGRvIGhlcmUhXHJcbiAgICAgICAgICBicmVha1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgd2UgcmVhY2hlZCBlbmQgb2YgYXJyYXkgd2l0aG91dCBoYXZpbmcgZm91bmRcclxuICAgICAgLy8gdGhlIGVuZCBwb2ludCwgaXQgbWVhbnMgdGhhdCB3ZSBoYXZlIHRvIGdvIHRvXHJcbiAgICAgIC8vIHRoZSBiZWdpbm5pbmcgYWdhaW5cclxuICAgICAgLy8gZXguIHdoZW4gc3RhcnQ6NzAwIGVuZDozMDBcclxuICAgICAgaWYgKGkgPT0gc2hhcGUubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgIGkgPSAtMVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0YXNrQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIHNoYXBlID0gdGFza0FycmF5W2ldLnNoYXBlXHJcbiAgICAgIGlmIChzaGFwZS50eXBlID09ICdhcmMnKSB7XHJcbiAgICAgICAgdmFyIHNoYXBlU3RhcnQgPSBzaGFwZS5hbmdsZSAtIChNYXRoLlBJIC8gMilcclxuICAgICAgICB2YXIgc3RhcnQgPSBzaGFwZVN0YXJ0ICsgKHRhc2tBcnJheVtpXS5zdGFydCAqIHNoYXBlLnJhZGlhbnMpXHJcbiAgICAgICAgdmFyIGVuZCA9IHNoYXBlU3RhcnQgKyAodGFza0FycmF5W2ldLmVuZCAqIHNoYXBlLnJhZGlhbnMpXHJcbiAgICAgICAgY3R4LmFyYyhzaGFwZS5jZW50cmUueCwgc2hhcGUuY2VudHJlLnksIHIsIHN0YXJ0LCBlbmQsIGFudGljbG9ja3dpc2UpXHJcblxyXG4gICAgICAgIHZhciByYWROb3JtYWxpemUgPSBzaGFwZS5hbmdsZSArIHNoYXBlLnJhZGlhbnMgLSAoTWF0aC5QSSAvIDIpIC8vIGJlY2F1c2UgbXkgY2lyY2xlIGlzIG5vdCB0aGUgc2FtZSBhcyB0aGUgbWF0aCBjaXJjbGVcclxuICAgICAgICBub3dQb2ludC54ID0gYy54ICsgTWF0aC5jb3MocmFkTm9ybWFsaXplKSAqIHJcclxuICAgICAgICBub3dQb2ludC55ID0gYy55ICsgTWF0aC5zaW4ocmFkTm9ybWFsaXplKSAqIHJcclxuICAgICAgfSBlbHNlIGlmIChzaGFwZS50eXBlID09ICdsaW5lJykge1xyXG4gICAgICAgIHZhciBkaXN0YW5jZSA9IHtcclxuICAgICAgICAgIHg6IE1hdGguY29zKHNoYXBlLmFuZ2xlKSAqIHNoYXBlLnBhdGhMZW5ndGgsXHJcbiAgICAgICAgICB5OiBNYXRoLnNpbihzaGFwZS5hbmdsZSkgKiBzaGFwZS5wYXRoTGVuZ3RoXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzaGFwZVN0YXJ0ID0ge1xyXG4gICAgICAgICAgeDogc2hhcGUuY2VudHJlLnggKyBNYXRoLnNpbihzaGFwZS5hbmdsZSkgKiByLFxyXG4gICAgICAgICAgeTogc2hhcGUuY2VudHJlLnkgLSBNYXRoLmNvcyhzaGFwZS5hbmdsZSkgKiByXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzdGFydCA9IHtcclxuICAgICAgICAgIHg6IHNoYXBlU3RhcnQueCArIGRpc3RhbmNlLnggKiB0YXNrQXJyYXlbaV0uc3RhcnQsXHJcbiAgICAgICAgICB5OiBzaGFwZVN0YXJ0LnkgKyBkaXN0YW5jZS55ICogdGFza0FycmF5W2ldLnN0YXJ0XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBlbmQgPSB7XHJcbiAgICAgICAgICB4OiBzaGFwZVN0YXJ0LnggKyBkaXN0YW5jZS54ICogdGFza0FycmF5W2ldLmVuZCxcclxuICAgICAgICAgIHk6IHNoYXBlU3RhcnQueSArIGRpc3RhbmNlLnkgKiB0YXNrQXJyYXlbaV0uZW5kXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSA9PSAwKSB7XHJcbiAgICAgICAgICBjdHgubGluZVRvKHN0YXJ0LngsIHN0YXJ0LnkpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGN0eC5saW5lVG8oZW5kLngsIGVuZC55KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBOYXBjaGFydC5zaGFwZS5jcmVhdGVTZWdtZW50ID0gZnVuY3Rpb24gKGNoYXJ0LCBvdXRlciwgaW5uZXIsIHN0YXJ0LCBlbmQpIHtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgTmFwY2hhcnQuc2hhcGUuY3JlYXRlQ3VydmUoY2hhcnQsIG91dGVyLCBzdGFydCwgZW5kKVxyXG4gICAgTmFwY2hhcnQuc2hhcGUuY3JlYXRlQ3VydmUoY2hhcnQsIGlubmVyLCBlbmQsIHN0YXJ0LCB0cnVlKVxyXG4gICAgY3R4LmNsb3NlUGF0aCgpXHJcbiAgfVxyXG59XHJcbiJdfQ==

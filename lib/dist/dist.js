(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

module.exports = function (Napchart) {
  Napchart.config = {
    interaction: true,
    shape: 'circle',
    baseRadius:32,
    font:'helvetica',
    layers:[16, 20, 28, 34],
    lanes:[], // will be generated based on the layers array
    face: { // define how the background clock should be drawn
      stroke: 0.15,
      weakStrokeColor: '#dddddd',
      strokeColor: '#777777',
      importantStrokeColor: 'black',
	  importantLineWidth: 0.3,
      numbers: {
        radius: 40,
        color: '#262626',
        size: 3.3
      },
      fiveMinuteStrokesLength: 0,
      tenMinuteStrokesLength: 0.5,
      hourStrokesLength: 3,
    },
    defaultTypes: {
      sleep: {
        style: 'red',
        noScale: true,
        lane: 2
      },
      busy: {
        style: 'black',
        noScale: true,
        lane: 1,
      },
    }
  }
}
},{}],2:[function(require,module,exports){
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
    'shapeChange':[],
    'benchmark':[],
    'setShape':[],
    'animateShape':[]
  }

  Napchart.on = function(hook, f){
    hooks[hook].push(f);
  }

  function fireHook(hook) {
    var args = [...arguments].slice(1)
    // console.log(args)
    hooks[hook].forEach(function(f){
      f(args[0], args[1])
    })
  }

  Napchart.init = function (ctx, config) {
    
    var chart = (function(){
      // private
      // var data = {};

      // public
      return {
        setElementState: function() {

        },
        checkElementState: function(state, name, i) {
          return false
        },
        setElement: function() {

        },
        setShape: function(shape) {
          fireHook('setShape', this, shape)
          fireHook('dataChange', this)
        },
        animateShape: function(shape) {
          // fireHook('setShape', this, shape)
          // fireHook('dataChange', this)

          fireHook('animateShape', this, shape)
        },
        setElements: function(elements) {
          var chart = this
          elements.forEach(function(element) {
            element.type = chart.types[element.type]
          })
          this.data.elements = elements;
          fireHook('dataChange', this)
        },
        redraw: function() {
          fireHook('dataChange', this)
        },
        getData: function() {
          return this.data
        },
        benchmark: function() {
          fireHook('benchmark', this)
        },
        setConfig: function(config) {
          // Napchart.config = config
          chart.config = config
          scaleConfig(chart.config, chart.ratio)
          this.redraw()
        }
        
      }

    }());

    // also public
    chart.ctx = ctx
    chart.canvas = ctx.canvas
    chart.width = chart.w = ctx.canvas.width
    chart.height = chart.h = ctx.canvas.height
    chart.ratio = chart.h / 100
    chart.config = initConfig(config)
    chart.data = {
      elements: []
    }
    chart.types = {}


    scaleConfig(chart.config, chart.ratio)
    addDefaultTypes(chart)

    fireHook('initialize', chart)

    return chart
  }

  function initConfig (config) {
    config = config || {}
    config = helpers.extend(JSON.parse(JSON.stringify(Napchart.config)), config)

    // generate lanes
    for (var i = 0; i < config.layers.length; i++) {
      if(i == 0) continue;

      config.lanes.push({
        start:config.layers[i-1],
        end:config.layers[i]
      })
    }

    return config
  }

  function scaleConfig (config, ratio) {
    function scaleFn (base, value, key) {
      if(base.noScale){
        return
      }
      else if (value > 1 || value < 1 || value === 1) {
        base[key] = value * ratio
      }
    }
    helpers.deepEach(config, scaleFn)
    return config
  }

  function addDefaultTypes(chart) {
    chart.types = chart.config.defaultTypes
  }
}

},{}],3:[function(require,module,exports){


module.exports = function (Napchart) {
  var helpers = Napchart.helpers;


  helpers.strokeSegment = function(chart, start, end, config){
  	var ctx = chart.ctx
  	ctx.save()
  	ctx.strokeStyle = config.color
  	ctx.lineWidth = chart.config.bars.general.stroke.lineWidth
  	ctx.lineJoin = 'mittel'

  	helpers.createSegment(chart, config.outerRadius, config.innerRadius, start, end);

  	ctx.stroke();
  	ctx.restore()
  }

  helpers.createFontString = function(chart, size) {
    return size + 'px ' + chart.config.font
  }

}
},{}],4:[function(require,module,exports){
module.exports = function (chart, Napchart) {
  var ctx = chart.ctx
  ctx.clearRect(0,0,chart.w,chart.h)
}
},{}],5:[function(require,module,exports){
module.exports = function (chart, Napchart) {
  var ctx = chart.ctx
  var data = chart.data
  var canvas = ctx.canvas
  var barConfig = chart.config.bars
  var helpers = Napchart.helpers
  
  console.log(data)

  // fill

  data.elements.forEach(function(element) {
    var ctx = chart.ctx
    var type = element.type
    var lane = chart.config.lanes[type.lane]
    var style = Napchart.styles[type.style]
    ctx.save()
    ctx.fillStyle = style.color

    switch(element.state){
      case 'active':
        ctx.globalAlpha = style.opacities.activeOpacity
        break
      case 'hover':
        ctx.globalAlpha = style.opacities.hoverOpacity
        break
      default:
        ctx.globalAlpha = style.opacities.opacity
    }

    console.log(lane.end, lane.start, element.start, element.end);
    helpers.createSegment(chart, lane.end, lane.start, element.start, element.end);

    ctx.fill()
    ctx.restore()
  })

  

  // stroke

  data.elements.forEach(function(element) {
    var ctx = chart.ctx
    var type = element.type
    var lane = chart.config.lanes[type.lane]
    var style = Napchart.styles[type.style]

    ctx.save()
    ctx.strokeStyle = style.color
    ctx.lineWidth = style.stroke.lineWidth
    ctx.lineJoin = 'mittel'

    helpers.createSegment(chart, lane.end, lane.start, element.start, element.end);

    ctx.stroke();
    ctx.restore()
  });
}

},{}],6:[function(require,module,exports){


module.exports = function (Napchart) {

  // import styles
  require('./styles')(Napchart)

  Napchart.on('initialize', function(instance) {
    draw(instance);
  })

  Napchart.on('dataChange', function(instance) {
    draw(instance)
  })

  Napchart.on('benchmark', function(instance) {
    benchmark(instance)
  })

  var tasks = {
    // clear
    clear: require('./clear'),

    // face
    circles: require('./face/circles'),
    lines: require('./face/lines'),
    text: require('./face/text'),

    // content
    bars: require('./content/bars'),
  }

  function draw(chart) {
    for (task in tasks) {
      tasks[task](chart, Napchart)
    }
  }

  function benchmark(chart) {
    var iterations = 1000
    for (task in tasks) {
      var start = Date.now()
      for (var i = 0; i < iterations; i++) {
        tasks[task](chart, Napchart)
      }
      var end = Date.now()
      console.log(`${task} x ${iterations} ` + (end-start) + ' ms')
    }
  }
}

},{"./clear":4,"./content/bars":5,"./face/circles":7,"./face/lines":8,"./face/text":9,"./styles":10}],7:[function(require,module,exports){
module.exports = function (chart, Napchart) {
  var layers = chart.config.layers
  var ctx = chart.ctx
  ctx.lineWidth = chart.config.face.stroke

  ctx.strokeStyle = chart.config.face.strokeColor
  for (var i = layers.length - 1; i >= layers.length - 2; i--) {
  	ctx.beginPath()
    Napchart.helpers.createCurve(chart, 0, 1440, layers[i])
    ctx.stroke()
  }

  ctx.strokeStyle = chart.config.face.weakStrokeColor
  for (var i = layers.length - 3; i >= layers.length - 3; i--) {
  	ctx.beginPath()
    Napchart.helpers.createCurve(chart, 0, 1440, layers[i])
    ctx.stroke()
  }
}

},{}],8:[function(require,module,exports){
module.exports = function (chart, Napchart) {
  var helpers = Napchart.helpers

  var ctx = chart.ctx
  var config = chart.config
  var lanes = config.lanes
  
  ctx.lineWidth = config.face.stroke
  ctx.save()

  // every hour normal

  ctx.strokeStyle = config.face.strokeColor
  ctx.beginPath()

  for(var i=0;i<24;i++){
  	var s = helpers.minutesToXY(chart, i*60, lanes[lanes.length - 1].start)
  	var e = helpers.minutesToXY(chart, i*60, lanes[lanes.length - 1].end + config.face.hourStrokesLength)
    ctx.moveTo(s.x,s.y)
    ctx.lineTo(e.x,e.y)
  }
  ctx.stroke()

  // every hour weak

  ctx.strokeStyle = config.face.weakStrokeColor
  ctx.beginPath()

  for(var i=0;i<24;i++){
    var s = helpers.minutesToXY(chart, i*60, lanes[lanes.length - 2].start)
    var e = helpers.minutesToXY(chart, i*60, lanes[lanes.length - 2].end)
    ctx.moveTo(s.x,s.y)
    ctx.lineTo(e.x,e.y)
  }
  ctx.stroke()


  // important hours

  ctx.lineWidth = config.face.importantLineWidth
  ctx.strokeStyle = config.face.importantStrokeColor
  ctx.beginPath()

  for(var i=0;i<24;i = i+4){
    var s = helpers.minutesToXY(chart, i*60, lanes[lanes.length - 1].start)
    var e = helpers.minutesToXY(chart, i*60, lanes[lanes.length - 1].end + config.face.hourStrokesLength)
    ctx.moveTo(s.x,s.y)
    ctx.lineTo(e.x,e.y)
  }
  
  ctx.stroke()

  // every 10 minutes

  /*
  ctx.strokeStyle = config.face.strokeColor
  ctx.beginPath()


  for(var i=0;i<1440/10;i++){
    var s = helpers.minutesToXY(chart, i*10, lanes[lanes.length - 1].end)
    var e = helpers.minutesToXY(chart, i*10, lanes[lanes.length - 1].end + config.face.tenMinuteStrokesLength)
    ctx.moveTo(s.x,s.y)
    ctx.lineTo(e.x,e.y)
  }
  ctx.stroke()
  ctx.beginPath()
  */


  // every 5 minutes

  /*
  ctx.strokeStyle = config.face.strokeColor
  ctx.beginPath()

  for(var i=0.5;i<1440/10;i++){
    var s = helpers.minutesToXY(chart, i*10, lanes[lanes.length - 1].end)
    var e = helpers.minutesToXY(chart, i*10, lanes[lanes.length - 1].end + config.face.fiveMinuteStrokesLength)
    ctx.moveTo(s.x,s.y)
    ctx.lineTo(e.x,e.y)
  }

  ctx.stroke()
  */


  
  
  ctx.restore()
}

},{}],9:[function(require,module,exports){
module.exports = function (chart, Napchart) {
  var helpers = Napchart.helpers

  var ctx = chart.ctx
  var config = chart.config

  ctx.save()
  ctx.font = helpers.createFontString(chart, config.face.numbers.size)
  ctx.fillStyle = config.face.numbers.color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for(var i=0;i<24;i = i+4){
  	var p = helpers.minutesToXY(chart, i*60, config.face.numbers.radius)
    ctx.fillText(i, p.x, p.y)
  }

  ctx.restore()
}

},{}],10:[function(require,module,exports){


module.exports = function (Napchart) {
  var helpers = Napchart.helpers
  var styles = Napchart.styles = {
    
  }

  styles.default = {
    textSize: 4,
    color: 'green',
    opacities: {
      noScale:true,
      opacity: 0.6,
      hoverOpacity: 0.5,
      activeOpacity: 0.5,
    },
    stroke: {
      lineWidth:4.5
    }
  }

  styles.red = helpers.extend({}, styles.default, {
    color: '#c70e0e',
    selected: {
      strokeColor: '#FF6363',
    }
  }) 

  styles.black = helpers.extend({}, styles.default, {
    color: '#1f1f1f',
    selected: {
      strokeColor: '#FF6363',
    }
  })

  styles.blue = helpers.extend({}, styles.default, {
    color: 'blue'
  })
  
  console.log(Napchart.styles)

}
},{}],11:[function(require,module,exports){
/*
*  Fancy module that does shit
*/

module.exports = function (Napchart) {
  var chart;

  Napchart.on('initialize', function(instance) {
    chart = instance
    // chart.setData()
  })
}

},{}],12:[function(require,module,exports){
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

  helpers.getPositionBetweenTwoValues = function(pos, start, end){
      return helpers.range(start,pos) / helpers.range(start, end)
  }

  helpers.limit = function (value) {
    if(value == 1440) return 1440
    return value - 1440 * Math.floor(value/1440)
  }
  window.helpers = helpers
  helpers.shortestWay = function(a) {
    // alternative??console.log(a - 1440 * Math.floor(a/720))

    // 1440/2 = 720
    if(a > 720){
      return a - 1440
    } else if(a < -720){
      return a + 1440
    } else {
      return a
    }

  }

  helpers.getProgressBetweenTwoValues = function (pos, start, end) {
    return helpers.range(start, pos) / helpers.range(start, end)
  }
  helpers.isInside = function (point, start, end) {
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
  

  helpers.distance = function (x1,y1,x2,y2){
    var y = y2-y1;
    var x = x2-x1;
    return Math.sqrt(y*y+x*x);
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

  helpers.eachElementYo = function (data, callback) {
    for (var name in data) {
      for (var i = 0; i < data[name].length; i++) {
        callback(name, i)
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

},{}],13:[function(require,module,exports){
window.Napchart = {}

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
require('./fancymodule')(Napchart)
// require('./animation')(Napchart)

module.exports = window.Napchart
},{"./config":1,"./core":2,"./draw/canvasHelpers":3,"./draw/draw":6,"./fancymodule":11,"./helpers":12,"./interactCanvas/interactCanvas":14,"./shape/shape":16}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
/**
 *
 * function calculateShape
 * 
 * This function takes a normal shape definition object
 * and calculates positions and sizes
 *
 * Returns a more detailed shape object that is later
 * assigned to chart.shape and used when drawing
 *
 */

  module.exports = function calculateShape(chart, shape){

    /**
     * Add radians or minutes properties
     */

    shape.forEach(function(element) {
      if(element.type === 'arc'){
        element.length = element.value
        element.radians = element.value
      }else if(element.type === 'line'){
        element.length = element.value
      }
    })

    /**
     * Find out totalRadians
     * This be 2 * PI if the shape is circular
     */

    var totalRadians = 0
    shape.forEach(function(element) {
      // if(element.type === 'arc'){
        totalRadians += element.value
      // }
    })


    // *
    //  * Find the sum of minutes in the line elements
    //  * Arc elements does not define minutes, only radians
     

    // var totalMinutes = 0
    // shape.forEach(function(element) {
    //   if(element.type === 'line'){
    //     totalMinutes += element.minutes
    //   }
    // })

    // if(totalMinutes > 1440){
    //   throw new Err('Too many minutes in line segments')
    // }

    /**
     * Find out angle of shapes
     */

    shape.forEach(function(element, i) {
      if(i === 0) element.startAngle = 0 
      else element.startAngle = shape[i-1].endAngle
      
      if(element.type === 'arc'){
        element.endAngle = element.startAngle + element.radians
      }else if(element.type === 'line'){
        element.endAngle = element.startAngle
      }
    })

    /**
     * Find out length of the shapes
     * 
     * Perimeter of circle = 2 * radius * PI
     */

    // var minuteLengthRatio = 0.45
    // var foundArc = shape.some(function(element, i) {
    //   if(element.type === 'arc'){
    //     element.length = baseRadius * element.radians
    //     if(element.minutes != 0)
    //     minuteLengthRatio = element.length / element.minutes
    //     console.log(element.length, element.minutes)
    //     return true
    //   }
    // })

    var totalLength = 0
    shape.forEach(function(element, i) {
      if(element.type === 'arc'){
        element.length = element.length * chart.config.baseRadius
      }else if(element.type === 'line'){
        element.length = element.length * chart.ratio
      }
      totalLength += element.length
    })

    /**
     * Calculate how many minutes each arc element should get
     * based on how many minutes are left after line elements
     * get what they should have
     */

    var minutesLeftForArcs = 1440 
    shape.forEach(function(element) {
      element.minutes = Math.ceil((element.length / totalLength) * 1440)
    })

    /**
     * Ok, so totalMinutes is now 1440
     * Now we need to create a .start and .end point on all
     * the shape elements
     */

    shape.forEach(function(element, i) {
      if(i === 0) element.start = 0
      else if(i > 0) element.start = shape[i-1].end
      element.end = element.start + element.minutes
    })

    /**
     * Calculate startpoints and endpoints
     * First point is center
     * The point only changes on line-segments
     */

    var center = {
      x:chart.w/2,
      y:chart.h/2
    }
    shape.forEach(function(element, i) {
      if(i === 0){
        element.startpoint = center
        element.endpoint = center
      }else if(element.type === 'arc'){
        element.startpoint = shape[i-1].endpoint
        element.endpoint = shape[i-1].endpoint
      }else if(element.type === 'line'){
        element.startpoint = shape[i-1].endpoint
      }
      if(element.type === 'line'){
        element.endpoint = {
          x: element.startpoint.x + Math.cos(element.startAngle) * element.length,
          y: element.startpoint.y + Math.sin(element.startAngle) * element.length
        }
      }
    })

    /**
     * Center the shape
     */

    var limits = {}
    function pushLimits(point){
      if(Object.keys(limits).length === 0){
        limits = {
          up: point.y,
          down: point.y,
          left: point.x,
          right: point.x
        }
      }else{
        if(point.y < limits.up) limits.up = point.y
        if(point.y > limits.down) limits.down = point.y
        if(point.x < limits.left) limits.left = point.x
        if(point.x > limits.right) limits.right = point.x
      }
    }
    shape.forEach(function(element, i) {
      pushLimits(element.startpoint)
      pushLimits(element.endpoint)
    })

    // we need to know the distances to the edge of the canvas
    limits.down = chart.h - limits.down
    limits.right = chart.w - limits.right

    // the distances should be equal, therefore, shift the points
    // if it is not
    var shiftLeft = (limits.left - limits.right) / 2
    var shiftUp = (limits.up - limits.down) / 2
    
    shape.forEach(function(element, i) {
      element.startpoint = {
        x: element.startpoint.x - shiftLeft,
        y: element.startpoint.y - shiftUp
      }
      element.endpoint = {
        x: element.endpoint.x - shiftLeft,
        y: element.endpoint.y - shiftUp
      }
    })

    return shape
  }

  
},{}],16:[function(require,module,exports){
/*
*
* Shape module
*
*/

var shapes = require('./shapes')
var calculateShape = require('./calculateShape')

module.exports = function (Napchart) {
  var helpers = Napchart.helpers
  var currentShape

  Napchart.on('initialize', function(chart) {
      setShape(chart, chart.config.shape)
      // document.querySelector('.logo').addEventListener('click', function() {
      //   changeShape(chart)
      // })
  })

  Napchart.on('setShape', setShape) 

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
    // if(currentShape === 'smisle'){
    //   chart.animateShape(shapes['circle'])
    //   currentShape = 'circle'
    // }
    // chart.animateShape(shapes['horizontalEllipse'])
    var next = false
    for(prop in shapes){
      if(next){
        chart.animateShape(shapes[prop])
        currentShape = prop
        next = false
        return
      }
      if(currentShape === prop){
        next = true
      }
    }
    if(next === true){
      chart.animateShape(shapes['circle'])
      currentShape = 'circle'
    }

    chart.redraw()
  }


}

},{"./calculateShape":15,"./shapeHelpers":17,"./shapes":18}],17:[function(require,module,exports){


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

},{}],18:[function(require,module,exports){


module.exports = {
  circle: [
    {
      type: 'arc',
      value: Math.PI*2
    },
  ],
  line: [
    {
      type: 'line',
      value: 100
    },
  ],
  horizontalEllipse: [
    {
      type: 'arc',
      value: Math.PI / 4
    },
    {
      type: 'line',
      value: 20
    },
    {
      type: 'arc',
      value: Math.PI
    },
    {
      type: 'line',
      value: 20
    },
    {
      type: 'arc',
      value: Math.PI * 3 / 4
    }
  ],
  // smile: [
  //   {
  //     type: 'arc',
  //     value: Math.PI
  //   },
  //   {
  //     type: 'line',
  //     value: 150
  //   },
  //   {
  //     type: 'arc',
  //     value: Math.PI
  //   },
  //   {
  //     type: 'line',
  //     value: 150
  //   }
  // ],
  // verticalEllipse: [
  //   {
  //     type: 'arc',
  //     value: Math.PI/2
  //   },
  //   {
  //     type: 'line',
  //     value: 150
  //   },
  //   {
  //     type: 'arc',
  //     value: Math.PI
  //   },
  //   {
  //     type: 'line',
  //     value: 150
  //   },
  //   {
  //     type: 'arc',
  //     value: Math.PI/2
  //   }
  // ],
  // fucked: [
  //   {
  //     type: 'arc',
  //     value: Math.PI/2*3
  //   },
  //   {
  //     type: 'line',
  //     value: 100
  //   },
  //   {
  //     type: 'arc',
  //     value: Math.PI/2
  //   },
  //   {
  //     type: 'line',
  //     value: 100
  //   },
  //   {
  //     type: 'arc',
  //     value: Math.PI/2
  //   },
  //   {
  //     type: 'line',
  //     value: 50
  //   },
  // ]
}
},{}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY2hhcnQvY29uZmlnLmpzIiwibGliL2NoYXJ0L2NvcmUuanMiLCJsaWIvY2hhcnQvZHJhdy9jYW52YXNIZWxwZXJzLmpzIiwibGliL2NoYXJ0L2RyYXcvY2xlYXIuanMiLCJsaWIvY2hhcnQvZHJhdy9jb250ZW50L2JhcnMuanMiLCJsaWIvY2hhcnQvZHJhdy9kcmF3LmpzIiwibGliL2NoYXJ0L2RyYXcvZmFjZS9jaXJjbGVzLmpzIiwibGliL2NoYXJ0L2RyYXcvZmFjZS9saW5lcy5qcyIsImxpYi9jaGFydC9kcmF3L2ZhY2UvdGV4dC5qcyIsImxpYi9jaGFydC9kcmF3L3N0eWxlcy5qcyIsImxpYi9jaGFydC9mYW5jeW1vZHVsZS5qcyIsImxpYi9jaGFydC9oZWxwZXJzLmpzIiwibGliL2NoYXJ0L2luZGV4LmpzIiwibGliL2NoYXJ0L2ludGVyYWN0Q2FudmFzL2ludGVyYWN0Q2FudmFzLmpzIiwibGliL2NoYXJ0L3NoYXBlL2NhbGN1bGF0ZVNoYXBlLmpzIiwibGliL2NoYXJ0L3NoYXBlL3NoYXBlLmpzIiwibGliL2NoYXJ0L3NoYXBlL3NoYXBlSGVscGVycy5qcyIsImxpYi9jaGFydC9zaGFwZS9zaGFwZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcmhDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIE5hcGNoYXJ0LmNvbmZpZyA9IHtcclxuICAgIGludGVyYWN0aW9uOiB0cnVlLFxyXG4gICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgYmFzZVJhZGl1czozMixcclxuICAgIGZvbnQ6J2hlbHZldGljYScsXHJcbiAgICBsYXllcnM6WzE2LCAyMCwgMjgsIDM0XSxcclxuICAgIGxhbmVzOltdLCAvLyB3aWxsIGJlIGdlbmVyYXRlZCBiYXNlZCBvbiB0aGUgbGF5ZXJzIGFycmF5XHJcbiAgICBmYWNlOiB7IC8vIGRlZmluZSBob3cgdGhlIGJhY2tncm91bmQgY2xvY2sgc2hvdWxkIGJlIGRyYXduXHJcbiAgICAgIHN0cm9rZTogMC4xNSxcclxuICAgICAgd2Vha1N0cm9rZUNvbG9yOiAnI2RkZGRkZCcsXHJcbiAgICAgIHN0cm9rZUNvbG9yOiAnIzc3Nzc3NycsXHJcbiAgICAgIGltcG9ydGFudFN0cm9rZUNvbG9yOiAnYmxhY2snLFxyXG5cdCAgaW1wb3J0YW50TGluZVdpZHRoOiAwLjMsXHJcbiAgICAgIG51bWJlcnM6IHtcclxuICAgICAgICByYWRpdXM6IDQwLFxyXG4gICAgICAgIGNvbG9yOiAnIzI2MjYyNicsXHJcbiAgICAgICAgc2l6ZTogMy4zXHJcbiAgICAgIH0sXHJcbiAgICAgIGZpdmVNaW51dGVTdHJva2VzTGVuZ3RoOiAwLFxyXG4gICAgICB0ZW5NaW51dGVTdHJva2VzTGVuZ3RoOiAwLjUsXHJcbiAgICAgIGhvdXJTdHJva2VzTGVuZ3RoOiAzLFxyXG4gICAgfSxcclxuICAgIGRlZmF1bHRUeXBlczoge1xyXG4gICAgICBzbGVlcDoge1xyXG4gICAgICAgIHN0eWxlOiAncmVkJyxcclxuICAgICAgICBub1NjYWxlOiB0cnVlLFxyXG4gICAgICAgIGxhbmU6IDJcclxuICAgICAgfSxcclxuICAgICAgYnVzeToge1xyXG4gICAgICAgIHN0eWxlOiAnYmxhY2snLFxyXG4gICAgICAgIG5vU2NhbGU6IHRydWUsXHJcbiAgICAgICAgbGFuZTogMSxcclxuICAgICAgfSxcclxuICAgIH1cclxuICB9XHJcbn0iLCIvKlxyXG4qICBDb3JlIG1vZHVsZSBvZiBOYXBjaGFydFxyXG4qXHJcbiovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG4gIHZhciBtb2R1bGVzID0gW11cclxuICB2YXIgaG9va3MgPSB7XHJcbiAgICAnaW5pdGlhbGl6ZSc6W10sXHJcbiAgICAnZGF0YUNoYW5nZSc6W10sXHJcbiAgICAnc2hhcGVDaGFuZ2UnOltdLFxyXG4gICAgJ2JlbmNobWFyayc6W10sXHJcbiAgICAnc2V0U2hhcGUnOltdLFxyXG4gICAgJ2FuaW1hdGVTaGFwZSc6W11cclxuICB9XHJcblxyXG4gIE5hcGNoYXJ0Lm9uID0gZnVuY3Rpb24oaG9vaywgZil7XHJcbiAgICBob29rc1tob29rXS5wdXNoKGYpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmlyZUhvb2soaG9vaykge1xyXG4gICAgdmFyIGFyZ3MgPSBbLi4uYXJndW1lbnRzXS5zbGljZSgxKVxyXG4gICAgLy8gY29uc29sZS5sb2coYXJncylcclxuICAgIGhvb2tzW2hvb2tdLmZvckVhY2goZnVuY3Rpb24oZil7XHJcbiAgICAgIGYoYXJnc1swXSwgYXJnc1sxXSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBOYXBjaGFydC5pbml0ID0gZnVuY3Rpb24gKGN0eCwgY29uZmlnKSB7XHJcbiAgICBcclxuICAgIHZhciBjaGFydCA9IChmdW5jdGlvbigpe1xyXG4gICAgICAvLyBwcml2YXRlXHJcbiAgICAgIC8vIHZhciBkYXRhID0ge307XHJcblxyXG4gICAgICAvLyBwdWJsaWNcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzZXRFbGVtZW50U3RhdGU6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNoZWNrRWxlbWVudFN0YXRlOiBmdW5jdGlvbihzdGF0ZSwgbmFtZSwgaSkge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRFbGVtZW50OiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRTaGFwZTogZnVuY3Rpb24oc2hhcGUpIHtcclxuICAgICAgICAgIGZpcmVIb29rKCdzZXRTaGFwZScsIHRoaXMsIHNoYXBlKVxyXG4gICAgICAgICAgZmlyZUhvb2soJ2RhdGFDaGFuZ2UnLCB0aGlzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYW5pbWF0ZVNoYXBlOiBmdW5jdGlvbihzaGFwZSkge1xyXG4gICAgICAgICAgLy8gZmlyZUhvb2soJ3NldFNoYXBlJywgdGhpcywgc2hhcGUpXHJcbiAgICAgICAgICAvLyBmaXJlSG9vaygnZGF0YUNoYW5nZScsIHRoaXMpXHJcblxyXG4gICAgICAgICAgZmlyZUhvb2soJ2FuaW1hdGVTaGFwZScsIHRoaXMsIHNoYXBlKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0RWxlbWVudHM6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICB2YXIgY2hhcnQgPSB0aGlzXHJcbiAgICAgICAgICBlbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZWxlbWVudC50eXBlID0gY2hhcnQudHlwZXNbZWxlbWVudC50eXBlXVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIHRoaXMuZGF0YS5lbGVtZW50cyA9IGVsZW1lbnRzO1xyXG4gICAgICAgICAgZmlyZUhvb2soJ2RhdGFDaGFuZ2UnLCB0aGlzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVkcmF3OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGZpcmVIb29rKCdkYXRhQ2hhbmdlJywgdGhpcylcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldERhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYmVuY2htYXJrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGZpcmVIb29rKCdiZW5jaG1hcmsnLCB0aGlzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0Q29uZmlnOiBmdW5jdGlvbihjb25maWcpIHtcclxuICAgICAgICAgIC8vIE5hcGNoYXJ0LmNvbmZpZyA9IGNvbmZpZ1xyXG4gICAgICAgICAgY2hhcnQuY29uZmlnID0gY29uZmlnXHJcbiAgICAgICAgICBzY2FsZUNvbmZpZyhjaGFydC5jb25maWcsIGNoYXJ0LnJhdGlvKVxyXG4gICAgICAgICAgdGhpcy5yZWRyYXcoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgfVxyXG5cclxuICAgIH0oKSk7XHJcblxyXG4gICAgLy8gYWxzbyBwdWJsaWNcclxuICAgIGNoYXJ0LmN0eCA9IGN0eFxyXG4gICAgY2hhcnQuY2FudmFzID0gY3R4LmNhbnZhc1xyXG4gICAgY2hhcnQud2lkdGggPSBjaGFydC53ID0gY3R4LmNhbnZhcy53aWR0aFxyXG4gICAgY2hhcnQuaGVpZ2h0ID0gY2hhcnQuaCA9IGN0eC5jYW52YXMuaGVpZ2h0XHJcbiAgICBjaGFydC5yYXRpbyA9IGNoYXJ0LmggLyAxMDBcclxuICAgIGNoYXJ0LmNvbmZpZyA9IGluaXRDb25maWcoY29uZmlnKVxyXG4gICAgY2hhcnQuZGF0YSA9IHtcclxuICAgICAgZWxlbWVudHM6IFtdXHJcbiAgICB9XHJcbiAgICBjaGFydC50eXBlcyA9IHt9XHJcblxyXG5cclxuICAgIHNjYWxlQ29uZmlnKGNoYXJ0LmNvbmZpZywgY2hhcnQucmF0aW8pXHJcbiAgICBhZGREZWZhdWx0VHlwZXMoY2hhcnQpXHJcblxyXG4gICAgZmlyZUhvb2soJ2luaXRpYWxpemUnLCBjaGFydClcclxuXHJcbiAgICByZXR1cm4gY2hhcnRcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRDb25maWcgKGNvbmZpZykge1xyXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9XHJcbiAgICBjb25maWcgPSBoZWxwZXJzLmV4dGVuZChKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KE5hcGNoYXJ0LmNvbmZpZykpLCBjb25maWcpXHJcblxyXG4gICAgLy8gZ2VuZXJhdGUgbGFuZXNcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29uZmlnLmxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZihpID09IDApIGNvbnRpbnVlO1xyXG5cclxuICAgICAgY29uZmlnLmxhbmVzLnB1c2goe1xyXG4gICAgICAgIHN0YXJ0OmNvbmZpZy5sYXllcnNbaS0xXSxcclxuICAgICAgICBlbmQ6Y29uZmlnLmxheWVyc1tpXVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb25maWdcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNjYWxlQ29uZmlnIChjb25maWcsIHJhdGlvKSB7XHJcbiAgICBmdW5jdGlvbiBzY2FsZUZuIChiYXNlLCB2YWx1ZSwga2V5KSB7XHJcbiAgICAgIGlmKGJhc2Uubm9TY2FsZSl7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAodmFsdWUgPiAxIHx8IHZhbHVlIDwgMSB8fCB2YWx1ZSA9PT0gMSkge1xyXG4gICAgICAgIGJhc2Vba2V5XSA9IHZhbHVlICogcmF0aW9cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaGVscGVycy5kZWVwRWFjaChjb25maWcsIHNjYWxlRm4pXHJcbiAgICByZXR1cm4gY29uZmlnXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGREZWZhdWx0VHlwZXMoY2hhcnQpIHtcclxuICAgIGNoYXJ0LnR5cGVzID0gY2hhcnQuY29uZmlnLmRlZmF1bHRUeXBlc1xyXG4gIH1cclxufVxyXG4iLCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzO1xyXG5cclxuXHJcbiAgaGVscGVycy5zdHJva2VTZWdtZW50ID0gZnVuY3Rpb24oY2hhcnQsIHN0YXJ0LCBlbmQsIGNvbmZpZyl7XHJcbiAgXHR2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgXHRjdHguc2F2ZSgpXHJcbiAgXHRjdHguc3Ryb2tlU3R5bGUgPSBjb25maWcuY29sb3JcclxuICBcdGN0eC5saW5lV2lkdGggPSBjaGFydC5jb25maWcuYmFycy5nZW5lcmFsLnN0cm9rZS5saW5lV2lkdGhcclxuICBcdGN0eC5saW5lSm9pbiA9ICdtaXR0ZWwnXHJcblxyXG4gIFx0aGVscGVycy5jcmVhdGVTZWdtZW50KGNoYXJ0LCBjb25maWcub3V0ZXJSYWRpdXMsIGNvbmZpZy5pbm5lclJhZGl1cywgc3RhcnQsIGVuZCk7XHJcblxyXG4gIFx0Y3R4LnN0cm9rZSgpO1xyXG4gIFx0Y3R4LnJlc3RvcmUoKVxyXG4gIH1cclxuXHJcbiAgaGVscGVycy5jcmVhdGVGb250U3RyaW5nID0gZnVuY3Rpb24oY2hhcnQsIHNpemUpIHtcclxuICAgIHJldHVybiBzaXplICsgJ3B4ICcgKyBjaGFydC5jb25maWcuZm9udFxyXG4gIH1cclxuXHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFydCwgTmFwY2hhcnQpIHtcclxuICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgY3R4LmNsZWFyUmVjdCgwLDAsY2hhcnQudyxjaGFydC5oKVxyXG59IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2hhcnQsIE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gIHZhciBkYXRhID0gY2hhcnQuZGF0YVxyXG4gIHZhciBjYW52YXMgPSBjdHguY2FudmFzXHJcbiAgdmFyIGJhckNvbmZpZyA9IGNoYXJ0LmNvbmZpZy5iYXJzXHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcbiAgXHJcbiAgY29uc29sZS5sb2coZGF0YSlcclxuXHJcbiAgLy8gZmlsbFxyXG5cclxuICBkYXRhLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gICAgdmFyIHR5cGUgPSBlbGVtZW50LnR5cGVcclxuICAgIHZhciBsYW5lID0gY2hhcnQuY29uZmlnLmxhbmVzW3R5cGUubGFuZV1cclxuICAgIHZhciBzdHlsZSA9IE5hcGNoYXJ0LnN0eWxlc1t0eXBlLnN0eWxlXVxyXG4gICAgY3R4LnNhdmUoKVxyXG4gICAgY3R4LmZpbGxTdHlsZSA9IHN0eWxlLmNvbG9yXHJcblxyXG4gICAgc3dpdGNoKGVsZW1lbnQuc3RhdGUpe1xyXG4gICAgICBjYXNlICdhY3RpdmUnOlxyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IHN0eWxlLm9wYWNpdGllcy5hY3RpdmVPcGFjaXR5XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAnaG92ZXInOlxyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IHN0eWxlLm9wYWNpdGllcy5ob3Zlck9wYWNpdHlcclxuICAgICAgICBicmVha1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IHN0eWxlLm9wYWNpdGllcy5vcGFjaXR5XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2cobGFuZS5lbmQsIGxhbmUuc3RhcnQsIGVsZW1lbnQuc3RhcnQsIGVsZW1lbnQuZW5kKTtcclxuICAgIGhlbHBlcnMuY3JlYXRlU2VnbWVudChjaGFydCwgbGFuZS5lbmQsIGxhbmUuc3RhcnQsIGVsZW1lbnQuc3RhcnQsIGVsZW1lbnQuZW5kKTtcclxuXHJcbiAgICBjdHguZmlsbCgpXHJcbiAgICBjdHgucmVzdG9yZSgpXHJcbiAgfSlcclxuXHJcbiAgXHJcblxyXG4gIC8vIHN0cm9rZVxyXG5cclxuICBkYXRhLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gICAgdmFyIHR5cGUgPSBlbGVtZW50LnR5cGVcclxuICAgIHZhciBsYW5lID0gY2hhcnQuY29uZmlnLmxhbmVzW3R5cGUubGFuZV1cclxuICAgIHZhciBzdHlsZSA9IE5hcGNoYXJ0LnN0eWxlc1t0eXBlLnN0eWxlXVxyXG5cclxuICAgIGN0eC5zYXZlKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IHN0eWxlLmNvbG9yXHJcbiAgICBjdHgubGluZVdpZHRoID0gc3R5bGUuc3Ryb2tlLmxpbmVXaWR0aFxyXG4gICAgY3R4LmxpbmVKb2luID0gJ21pdHRlbCdcclxuXHJcbiAgICBoZWxwZXJzLmNyZWF0ZVNlZ21lbnQoY2hhcnQsIGxhbmUuZW5kLCBsYW5lLnN0YXJ0LCBlbGVtZW50LnN0YXJ0LCBlbGVtZW50LmVuZCk7XHJcblxyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKVxyXG4gIH0pO1xyXG59XHJcbiIsIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTmFwY2hhcnQpIHtcclxuXHJcbiAgLy8gaW1wb3J0IHN0eWxlc1xyXG4gIHJlcXVpcmUoJy4vc3R5bGVzJykoTmFwY2hhcnQpXHJcblxyXG4gIE5hcGNoYXJ0Lm9uKCdpbml0aWFsaXplJywgZnVuY3Rpb24oaW5zdGFuY2UpIHtcclxuICAgIGRyYXcoaW5zdGFuY2UpO1xyXG4gIH0pXHJcblxyXG4gIE5hcGNoYXJ0Lm9uKCdkYXRhQ2hhbmdlJywgZnVuY3Rpb24oaW5zdGFuY2UpIHtcclxuICAgIGRyYXcoaW5zdGFuY2UpXHJcbiAgfSlcclxuXHJcbiAgTmFwY2hhcnQub24oJ2JlbmNobWFyaycsIGZ1bmN0aW9uKGluc3RhbmNlKSB7XHJcbiAgICBiZW5jaG1hcmsoaW5zdGFuY2UpXHJcbiAgfSlcclxuXHJcbiAgdmFyIHRhc2tzID0ge1xyXG4gICAgLy8gY2xlYXJcclxuICAgIGNsZWFyOiByZXF1aXJlKCcuL2NsZWFyJyksXHJcblxyXG4gICAgLy8gZmFjZVxyXG4gICAgY2lyY2xlczogcmVxdWlyZSgnLi9mYWNlL2NpcmNsZXMnKSxcclxuICAgIGxpbmVzOiByZXF1aXJlKCcuL2ZhY2UvbGluZXMnKSxcclxuICAgIHRleHQ6IHJlcXVpcmUoJy4vZmFjZS90ZXh0JyksXHJcblxyXG4gICAgLy8gY29udGVudFxyXG4gICAgYmFyczogcmVxdWlyZSgnLi9jb250ZW50L2JhcnMnKSxcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRyYXcoY2hhcnQpIHtcclxuICAgIGZvciAodGFzayBpbiB0YXNrcykge1xyXG4gICAgICB0YXNrc1t0YXNrXShjaGFydCwgTmFwY2hhcnQpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBiZW5jaG1hcmsoY2hhcnQpIHtcclxuICAgIHZhciBpdGVyYXRpb25zID0gMTAwMFxyXG4gICAgZm9yICh0YXNrIGluIHRhc2tzKSB7XHJcbiAgICAgIHZhciBzdGFydCA9IERhdGUubm93KClcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVyYXRpb25zOyBpKyspIHtcclxuICAgICAgICB0YXNrc1t0YXNrXShjaGFydCwgTmFwY2hhcnQpXHJcbiAgICAgIH1cclxuICAgICAgdmFyIGVuZCA9IERhdGUubm93KClcclxuICAgICAgY29uc29sZS5sb2coYCR7dGFza30geCAke2l0ZXJhdGlvbnN9IGAgKyAoZW5kLXN0YXJ0KSArICcgbXMnKVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFydCwgTmFwY2hhcnQpIHtcclxuICB2YXIgbGF5ZXJzID0gY2hhcnQuY29uZmlnLmxheWVyc1xyXG4gIHZhciBjdHggPSBjaGFydC5jdHhcclxuICBjdHgubGluZVdpZHRoID0gY2hhcnQuY29uZmlnLmZhY2Uuc3Ryb2tlXHJcblxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGNoYXJ0LmNvbmZpZy5mYWNlLnN0cm9rZUNvbG9yXHJcbiAgZm9yICh2YXIgaSA9IGxheWVycy5sZW5ndGggLSAxOyBpID49IGxheWVycy5sZW5ndGggLSAyOyBpLS0pIHtcclxuICBcdGN0eC5iZWdpblBhdGgoKVxyXG4gICAgTmFwY2hhcnQuaGVscGVycy5jcmVhdGVDdXJ2ZShjaGFydCwgMCwgMTQ0MCwgbGF5ZXJzW2ldKVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgfVxyXG5cclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjaGFydC5jb25maWcuZmFjZS53ZWFrU3Ryb2tlQ29sb3JcclxuICBmb3IgKHZhciBpID0gbGF5ZXJzLmxlbmd0aCAtIDM7IGkgPj0gbGF5ZXJzLmxlbmd0aCAtIDM7IGktLSkge1xyXG4gIFx0Y3R4LmJlZ2luUGF0aCgpXHJcbiAgICBOYXBjaGFydC5oZWxwZXJzLmNyZWF0ZUN1cnZlKGNoYXJ0LCAwLCAxNDQwLCBsYXllcnNbaV0pXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICB9XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2hhcnQsIE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gIHZhciBjdHggPSBjaGFydC5jdHhcclxuICB2YXIgY29uZmlnID0gY2hhcnQuY29uZmlnXHJcbiAgdmFyIGxhbmVzID0gY29uZmlnLmxhbmVzXHJcbiAgXHJcbiAgY3R4LmxpbmVXaWR0aCA9IGNvbmZpZy5mYWNlLnN0cm9rZVxyXG4gIGN0eC5zYXZlKClcclxuXHJcbiAgLy8gZXZlcnkgaG91ciBub3JtYWxcclxuXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY29uZmlnLmZhY2Uuc3Ryb2tlQ29sb3JcclxuICBjdHguYmVnaW5QYXRoKClcclxuXHJcbiAgZm9yKHZhciBpPTA7aTwyNDtpKyspe1xyXG4gIFx0dmFyIHMgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjYwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAxXS5zdGFydClcclxuICBcdHZhciBlID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSo2MCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMV0uZW5kICsgY29uZmlnLmZhY2UuaG91clN0cm9rZXNMZW5ndGgpXHJcbiAgICBjdHgubW92ZVRvKHMueCxzLnkpXHJcbiAgICBjdHgubGluZVRvKGUueCxlLnkpXHJcbiAgfVxyXG4gIGN0eC5zdHJva2UoKVxyXG5cclxuICAvLyBldmVyeSBob3VyIHdlYWtcclxuXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY29uZmlnLmZhY2Uud2Vha1N0cm9rZUNvbG9yXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcblxyXG4gIGZvcih2YXIgaT0wO2k8MjQ7aSsrKXtcclxuICAgIHZhciBzID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSo2MCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMl0uc3RhcnQpXHJcbiAgICB2YXIgZSA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqNjAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDJdLmVuZClcclxuICAgIGN0eC5tb3ZlVG8ocy54LHMueSlcclxuICAgIGN0eC5saW5lVG8oZS54LGUueSlcclxuICB9XHJcbiAgY3R4LnN0cm9rZSgpXHJcblxyXG5cclxuICAvLyBpbXBvcnRhbnQgaG91cnNcclxuXHJcbiAgY3R4LmxpbmVXaWR0aCA9IGNvbmZpZy5mYWNlLmltcG9ydGFudExpbmVXaWR0aFxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbmZpZy5mYWNlLmltcG9ydGFudFN0cm9rZUNvbG9yXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcblxyXG4gIGZvcih2YXIgaT0wO2k8MjQ7aSA9IGkrNCl7XHJcbiAgICB2YXIgcyA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqNjAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDFdLnN0YXJ0KVxyXG4gICAgdmFyIGUgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjYwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAxXS5lbmQgKyBjb25maWcuZmFjZS5ob3VyU3Ryb2tlc0xlbmd0aClcclxuICAgIGN0eC5tb3ZlVG8ocy54LHMueSlcclxuICAgIGN0eC5saW5lVG8oZS54LGUueSlcclxuICB9XHJcbiAgXHJcbiAgY3R4LnN0cm9rZSgpXHJcblxyXG4gIC8vIGV2ZXJ5IDEwIG1pbnV0ZXNcclxuXHJcbiAgLypcclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjb25maWcuZmFjZS5zdHJva2VDb2xvclxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG5cclxuXHJcbiAgZm9yKHZhciBpPTA7aTwxNDQwLzEwO2krKyl7XHJcbiAgICB2YXIgcyA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqMTAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDFdLmVuZClcclxuICAgIHZhciBlID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSoxMCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMV0uZW5kICsgY29uZmlnLmZhY2UudGVuTWludXRlU3Ryb2tlc0xlbmd0aClcclxuICAgIGN0eC5tb3ZlVG8ocy54LHMueSlcclxuICAgIGN0eC5saW5lVG8oZS54LGUueSlcclxuICB9XHJcbiAgY3R4LnN0cm9rZSgpXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgKi9cclxuXHJcblxyXG4gIC8vIGV2ZXJ5IDUgbWludXRlc1xyXG5cclxuICAvKlxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbmZpZy5mYWNlLnN0cm9rZUNvbG9yXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcblxyXG4gIGZvcih2YXIgaT0wLjU7aTwxNDQwLzEwO2krKyl7XHJcbiAgICB2YXIgcyA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqMTAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDFdLmVuZClcclxuICAgIHZhciBlID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSoxMCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMV0uZW5kICsgY29uZmlnLmZhY2UuZml2ZU1pbnV0ZVN0cm9rZXNMZW5ndGgpXHJcbiAgICBjdHgubW92ZVRvKHMueCxzLnkpXHJcbiAgICBjdHgubGluZVRvKGUueCxlLnkpXHJcbiAgfVxyXG5cclxuICBjdHguc3Ryb2tlKClcclxuICAqL1xyXG5cclxuXHJcbiAgXHJcbiAgXHJcbiAgY3R4LnJlc3RvcmUoKVxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYXJ0LCBOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG5cclxuICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgdmFyIGNvbmZpZyA9IGNoYXJ0LmNvbmZpZ1xyXG5cclxuICBjdHguc2F2ZSgpXHJcbiAgY3R4LmZvbnQgPSBoZWxwZXJzLmNyZWF0ZUZvbnRTdHJpbmcoY2hhcnQsIGNvbmZpZy5mYWNlLm51bWJlcnMuc2l6ZSlcclxuICBjdHguZmlsbFN0eWxlID0gY29uZmlnLmZhY2UubnVtYmVycy5jb2xvclxyXG4gIGN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJ1xyXG4gIGN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJ1xyXG5cclxuICBmb3IodmFyIGk9MDtpPDI0O2kgPSBpKzQpe1xyXG4gIFx0dmFyIHAgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjYwLCBjb25maWcuZmFjZS5udW1iZXJzLnJhZGl1cylcclxuICAgIGN0eC5maWxsVGV4dChpLCBwLngsIHAueSlcclxuICB9XHJcblxyXG4gIGN0eC5yZXN0b3JlKClcclxufVxyXG4iLCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcbiAgdmFyIHN0eWxlcyA9IE5hcGNoYXJ0LnN0eWxlcyA9IHtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgc3R5bGVzLmRlZmF1bHQgPSB7XHJcbiAgICB0ZXh0U2l6ZTogNCxcclxuICAgIGNvbG9yOiAnZ3JlZW4nLFxyXG4gICAgb3BhY2l0aWVzOiB7XHJcbiAgICAgIG5vU2NhbGU6dHJ1ZSxcclxuICAgICAgb3BhY2l0eTogMC42LFxyXG4gICAgICBob3Zlck9wYWNpdHk6IDAuNSxcclxuICAgICAgYWN0aXZlT3BhY2l0eTogMC41LFxyXG4gICAgfSxcclxuICAgIHN0cm9rZToge1xyXG4gICAgICBsaW5lV2lkdGg6NC41XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzdHlsZXMucmVkID0gaGVscGVycy5leHRlbmQoe30sIHN0eWxlcy5kZWZhdWx0LCB7XHJcbiAgICBjb2xvcjogJyNjNzBlMGUnLFxyXG4gICAgc2VsZWN0ZWQ6IHtcclxuICAgICAgc3Ryb2tlQ29sb3I6ICcjRkY2MzYzJyxcclxuICAgIH1cclxuICB9KSBcclxuXHJcbiAgc3R5bGVzLmJsYWNrID0gaGVscGVycy5leHRlbmQoe30sIHN0eWxlcy5kZWZhdWx0LCB7XHJcbiAgICBjb2xvcjogJyMxZjFmMWYnLFxyXG4gICAgc2VsZWN0ZWQ6IHtcclxuICAgICAgc3Ryb2tlQ29sb3I6ICcjRkY2MzYzJyxcclxuICAgIH1cclxuICB9KVxyXG5cclxuICBzdHlsZXMuYmx1ZSA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBzdHlsZXMuZGVmYXVsdCwge1xyXG4gICAgY29sb3I6ICdibHVlJ1xyXG4gIH0pXHJcbiAgXHJcbiAgY29uc29sZS5sb2coTmFwY2hhcnQuc3R5bGVzKVxyXG5cclxufSIsIi8qXHJcbiogIEZhbmN5IG1vZHVsZSB0aGF0IGRvZXMgc2hpdFxyXG4qL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTmFwY2hhcnQpIHtcclxuICB2YXIgY2hhcnQ7XHJcblxyXG4gIE5hcGNoYXJ0Lm9uKCdpbml0aWFsaXplJywgZnVuY3Rpb24oaW5zdGFuY2UpIHtcclxuICAgIGNoYXJ0ID0gaW5zdGFuY2VcclxuICAgIC8vIGNoYXJ0LnNldERhdGEoKVxyXG4gIH0pXHJcbn1cclxuIiwiLyogZ2xvYmFsIHdpbmRvdzogZmFsc2UgKi9cbi8qIGdsb2JhbCBkb2N1bWVudDogZmFsc2UgKi9cbid1c2Ugc3RyaWN0J1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChDaGFydCkge1xuICAvLyBHbG9iYWwgQ2hhcnQgaGVscGVycyBvYmplY3QgZm9yIHV0aWxpdHkgbWV0aG9kcyBhbmQgY2xhc3Nlc1xuICB2YXIgaGVscGVycyA9IENoYXJ0LmhlbHBlcnMgPSB7fVxuICBoZWxwZXJzLnJhbmdlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgICBpZiAoZW5kIDwgc3RhcnQpIHtcbiAgICAgIHJldHVybiAxNDQwIC0gc3RhcnQgKyBlbmRcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGVuZCAtIHN0YXJ0XG4gICAgfVxuICB9XG5cbiAgaGVscGVycy5nZXRQb3NpdGlvbkJldHdlZW5Ud29WYWx1ZXMgPSBmdW5jdGlvbihwb3MsIHN0YXJ0LCBlbmQpe1xuICAgICAgcmV0dXJuIGhlbHBlcnMucmFuZ2Uoc3RhcnQscG9zKSAvIGhlbHBlcnMucmFuZ2Uoc3RhcnQsIGVuZClcbiAgfVxuXG4gIGhlbHBlcnMubGltaXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZih2YWx1ZSA9PSAxNDQwKSByZXR1cm4gMTQ0MFxuICAgIHJldHVybiB2YWx1ZSAtIDE0NDAgKiBNYXRoLmZsb29yKHZhbHVlLzE0NDApXG4gIH1cbiAgd2luZG93LmhlbHBlcnMgPSBoZWxwZXJzXG4gIGhlbHBlcnMuc2hvcnRlc3RXYXkgPSBmdW5jdGlvbihhKSB7XG4gICAgLy8gYWx0ZXJuYXRpdmU/P2NvbnNvbGUubG9nKGEgLSAxNDQwICogTWF0aC5mbG9vcihhLzcyMCkpXG5cbiAgICAvLyAxNDQwLzIgPSA3MjBcbiAgICBpZihhID4gNzIwKXtcbiAgICAgIHJldHVybiBhIC0gMTQ0MFxuICAgIH0gZWxzZSBpZihhIDwgLTcyMCl7XG4gICAgICByZXR1cm4gYSArIDE0NDBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFcbiAgICB9XG5cbiAgfVxuXG4gIGhlbHBlcnMuZ2V0UHJvZ3Jlc3NCZXR3ZWVuVHdvVmFsdWVzID0gZnVuY3Rpb24gKHBvcywgc3RhcnQsIGVuZCkge1xuICAgIHJldHVybiBoZWxwZXJzLnJhbmdlKHN0YXJ0LCBwb3MpIC8gaGVscGVycy5yYW5nZShzdGFydCwgZW5kKVxuICB9XG4gIGhlbHBlcnMuaXNJbnNpZGUgPSBmdW5jdGlvbiAocG9pbnQsIHN0YXJ0LCBlbmQpIHtcbiAgICBpZiAoZW5kID4gc3RhcnQpIHtcbiAgICAgIGlmIChwb2ludCA8IGVuZCAmJiBwb2ludCA+IHN0YXJ0KSB7IHJldHVybiB0cnVlIH1cbiAgICB9IGVsc2UgaWYgKHN0YXJ0ID4gZW5kKSB7XG4gICAgICBpZiAocG9pbnQgPiBzdGFydCB8fCBwb2ludCA8IGVuZCkgeyByZXR1cm4gdHJ1ZSB9XG4gICAgfVxuICAgIGlmIChwb2ludCA9PSBzdGFydCB8fCBwb2ludCA9PSBlbmQpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIFxuXG4gIGhlbHBlcnMuZGlzdGFuY2UgPSBmdW5jdGlvbiAoeDEseTEseDIseTIpe1xuICAgIHZhciB5ID0geTIteTE7XG4gICAgdmFyIHggPSB4Mi14MTtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHkqeSt4KngpO1xuICB9XG5cbiAgaGVscGVycy5lYWNoRWxlbWVudCA9IGZ1bmN0aW9uIChjaGFydCwgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IGNoYXJ0LmRhdGFcbiAgICB2YXIgY29uZmlnXG5cbiAgICBmb3IgKHZhciBuYW1lIGluIGRhdGEpIHtcbiAgICAgIGNvbmZpZyA9IGNoYXJ0LmNvbmZpZy5iYXJzW25hbWVdXG4gICAgICBcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YVtuYW1lXS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjYWxsYmFjayhkYXRhW25hbWVdW2ldLCBjb25maWcpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGVscGVycy5lYWNoRWxlbWVudFlvID0gZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiBkYXRhKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFbbmFtZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2FsbGJhY2sobmFtZSwgaSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoZWxwZXJzLmVhY2ggPSBmdW5jdGlvbiAobG9vcGFibGUsIGNhbGxiYWNrLCBzZWxmLCByZXZlcnNlKSB7XG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIG51bGwgb3IgdW5kZWZpbmVkIGZpcnN0bHkuXG4gICAgdmFyIGksIGxlblxuICAgIGlmIChoZWxwZXJzLmlzQXJyYXkobG9vcGFibGUpKSB7XG4gICAgICBsZW4gPSBsb29wYWJsZS5sZW5ndGhcbiAgICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICAgIGZvciAoaSA9IGxlbiAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmLCBsb29wYWJsZVtpXSwgaSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmLCBsb29wYWJsZVtpXSwgaSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGxvb3BhYmxlID09PSAnb2JqZWN0Jykge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhsb29wYWJsZSlcbiAgICAgIGxlbiA9IGtleXMubGVuZ3RoXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmLCBsb29wYWJsZVtrZXlzW2ldXSwga2V5c1tpXSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoZWxwZXJzLmRlZXBFYWNoID0gZnVuY3Rpb24gKGxvb3BhYmxlLCBjYWxsYmFjaykge1xuICAgIC8vIENoZWNrIHRvIHNlZSBpZiBudWxsIG9yIHVuZGVmaW5lZCBmaXJzdGx5LlxuICAgIHZhciBpLCBsZW5cbiAgICBmdW5jdGlvbiBzZWFyY2ggKGxvb3BhYmxlLCBjYikge1xuICAgICAgaWYgKGhlbHBlcnMuaXNBcnJheShsb29wYWJsZSkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb29wYWJsZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNiKGxvb3BhYmxlLCBsb29wYWJsZVtpXSwgaSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbG9vcGFibGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobG9vcGFibGUpXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNiKGxvb3BhYmxlLCBsb29wYWJsZVtrZXlzW2ldXSwga2V5c1tpXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvdW5kIChiYXNlLCB2YWx1ZSwga2V5KSB7XG4gICAgICBpZiAoaGVscGVycy5pc0FycmF5KHZhbHVlKSB8fCB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHNlYXJjaCh2YWx1ZSwgZm91bmQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayhiYXNlLCB2YWx1ZSwga2V5KVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlYXJjaChsb29wYWJsZSwgZm91bmQpXG4gIH1cbiAgaGVscGVycy5jbG9uZSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKVxuICB9XG4gIGhlbHBlcnMuZXh0ZW5kID0gZnVuY3Rpb24gKGJhc2UpIHtcbiAgICB2YXIgc2V0Rm4gPSBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgYmFzZVtrZXldID0gdmFsdWVcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDEsIGlsZW4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWxlbjsgaSsrKSB7XG4gICAgICBoZWxwZXJzLmVhY2goYXJndW1lbnRzW2ldLCBzZXRGbilcbiAgICB9XG4gICAgcmV0dXJuIGJhc2VcbiAgfVxuICAvLyBOZWVkIGEgc3BlY2lhbCBtZXJnZSBmdW5jdGlvbiB0byBjaGFydCBjb25maWdzIHNpbmNlIHRoZXkgYXJlIG5vdyBncm91cGVkXG4gIGhlbHBlcnMuY29uZmlnTWVyZ2UgPSBmdW5jdGlvbiAoX2Jhc2UpIHtcbiAgICB2YXIgYmFzZSA9IGhlbHBlcnMuY2xvbmUoX2Jhc2UpXG4gICAgaGVscGVycy5lYWNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uIChleHRlbnNpb24pIHtcbiAgICAgIGhlbHBlcnMuZWFjaChleHRlbnNpb24sIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgIHZhciBiYXNlSGFzUHJvcGVydHkgPSBiYXNlLmhhc093blByb3BlcnR5KGtleSlcbiAgICAgICAgdmFyIGJhc2VWYWwgPSBiYXNlSGFzUHJvcGVydHkgPyBiYXNlW2tleV0gOiB7fVxuXG4gICAgICAgIGlmIChrZXkgPT09ICdzY2FsZXMnKSB7XG4gICAgICAgICAgLy8gU2NhbGUgY29uZmlnIG1lcmdpbmcgaXMgY29tcGxleC4gQWRkIG91ciBvd24gZnVuY3Rpb24gaGVyZSBmb3IgdGhhdFxuICAgICAgICAgIGJhc2Vba2V5XSA9IGhlbHBlcnMuc2NhbGVNZXJnZShiYXNlVmFsLCB2YWx1ZSlcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdzY2FsZScpIHtcbiAgICAgICAgICAvLyBVc2VkIGluIHBvbGFyIGFyZWEgJiByYWRhciBjaGFydHMgc2luY2UgdGhlcmUgaXMgb25seSBvbmUgc2NhbGVcbiAgICAgICAgICBiYXNlW2tleV0gPSBoZWxwZXJzLmNvbmZpZ01lcmdlKGJhc2VWYWwsIENoYXJ0LnNjYWxlU2VydmljZS5nZXRTY2FsZURlZmF1bHRzKHZhbHVlLnR5cGUpLCB2YWx1ZSlcbiAgICAgICAgfSBlbHNlIGlmIChiYXNlSGFzUHJvcGVydHkgJiZcbiAgICAgICAgICB0eXBlb2YgYmFzZVZhbCA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAhaGVscGVycy5pc0FycmF5KGJhc2VWYWwpICYmXG4gICAgICAgICAgYmFzZVZhbCAhPT0gbnVsbCAmJlxuICAgICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAhaGVscGVycy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgIC8vIElmIHdlIGFyZSBvdmVyd3JpdGluZyBhbiBvYmplY3Qgd2l0aCBhbiBvYmplY3QsIGRvIGEgbWVyZ2Ugb2YgdGhlIHByb3BlcnRpZXMuXG4gICAgICAgICAgYmFzZVtrZXldID0gaGVscGVycy5jb25maWdNZXJnZShiYXNlVmFsLCB2YWx1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBjYW4ganVzdCBvdmVyd3JpdGUgdGhlIHZhbHVlIGluIHRoaXMgY2FzZVxuICAgICAgICAgIGJhc2Vba2V5XSA9IHZhbHVlXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHJldHVybiBiYXNlXG4gIH1cbiAgaGVscGVycy5zY2FsZU1lcmdlID0gZnVuY3Rpb24gKF9iYXNlLCBleHRlbnNpb24pIHtcbiAgICB2YXIgYmFzZSA9IGhlbHBlcnMuY2xvbmUoX2Jhc2UpXG5cbiAgICBoZWxwZXJzLmVhY2goZXh0ZW5zaW9uLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgaWYgKGtleSA9PT0gJ3hBeGVzJyB8fCBrZXkgPT09ICd5QXhlcycpIHtcbiAgICAgICAgLy8gVGhlc2UgcHJvcGVydGllcyBhcmUgYXJyYXlzIG9mIGl0ZW1zXG4gICAgICAgIGlmIChiYXNlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBoZWxwZXJzLmVhY2godmFsdWUsIGZ1bmN0aW9uICh2YWx1ZU9iaiwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBheGlzVHlwZSA9IGhlbHBlcnMuZ2V0VmFsdWVPckRlZmF1bHQodmFsdWVPYmoudHlwZSwga2V5ID09PSAneEF4ZXMnID8gJ2NhdGVnb3J5JyA6ICdsaW5lYXInKVxuICAgICAgICAgICAgdmFyIGF4aXNEZWZhdWx0cyA9IENoYXJ0LnNjYWxlU2VydmljZS5nZXRTY2FsZURlZmF1bHRzKGF4aXNUeXBlKVxuICAgICAgICAgICAgaWYgKGluZGV4ID49IGJhc2Vba2V5XS5sZW5ndGggfHwgIWJhc2Vba2V5XVtpbmRleF0udHlwZSkge1xuICAgICAgICAgICAgICBiYXNlW2tleV0ucHVzaChoZWxwZXJzLmNvbmZpZ01lcmdlKGF4aXNEZWZhdWx0cywgdmFsdWVPYmopKVxuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZU9iai50eXBlICYmIHZhbHVlT2JqLnR5cGUgIT09IGJhc2Vba2V5XVtpbmRleF0udHlwZSkge1xuICAgICAgICAgICAgICAvLyBUeXBlIGNoYW5nZWQuIEJyaW5nIGluIHRoZSBuZXcgZGVmYXVsdHMgYmVmb3JlIHdlIGJyaW5nIGluIHZhbHVlT2JqIHNvIHRoYXQgdmFsdWVPYmogY2FuIG92ZXJyaWRlIHRoZSBjb3JyZWN0IHNjYWxlIGRlZmF1bHRzXG4gICAgICAgICAgICAgIGJhc2Vba2V5XVtpbmRleF0gPSBoZWxwZXJzLmNvbmZpZ01lcmdlKGJhc2Vba2V5XVtpbmRleF0sIGF4aXNEZWZhdWx0cywgdmFsdWVPYmopXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUeXBlIGlzIHRoZSBzYW1lXG4gICAgICAgICAgICAgIGJhc2Vba2V5XVtpbmRleF0gPSBoZWxwZXJzLmNvbmZpZ01lcmdlKGJhc2Vba2V5XVtpbmRleF0sIHZhbHVlT2JqKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmFzZVtrZXldID0gW11cbiAgICAgICAgICBoZWxwZXJzLmVhY2godmFsdWUsIGZ1bmN0aW9uICh2YWx1ZU9iaikge1xuICAgICAgICAgICAgdmFyIGF4aXNUeXBlID0gaGVscGVycy5nZXRWYWx1ZU9yRGVmYXVsdCh2YWx1ZU9iai50eXBlLCBrZXkgPT09ICd4QXhlcycgPyAnY2F0ZWdvcnknIDogJ2xpbmVhcicpXG4gICAgICAgICAgICBiYXNlW2tleV0ucHVzaChoZWxwZXJzLmNvbmZpZ01lcmdlKENoYXJ0LnNjYWxlU2VydmljZS5nZXRTY2FsZURlZmF1bHRzKGF4aXNUeXBlKSwgdmFsdWVPYmopKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYmFzZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIHR5cGVvZiBiYXNlW2tleV0gPT09ICdvYmplY3QnICYmIGJhc2Vba2V5XSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIElmIHdlIGFyZSBvdmVyd3JpdGluZyBhbiBvYmplY3Qgd2l0aCBhbiBvYmplY3QsIGRvIGEgbWVyZ2Ugb2YgdGhlIHByb3BlcnRpZXMuXG4gICAgICAgIGJhc2Vba2V5XSA9IGhlbHBlcnMuY29uZmlnTWVyZ2UoYmFzZVtrZXldLCB2YWx1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNhbiBqdXN0IG92ZXJ3cml0ZSB0aGUgdmFsdWUgaW4gdGhpcyBjYXNlXG4gICAgICAgIGJhc2Vba2V5XSA9IHZhbHVlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBiYXNlXG4gIH1cbiAgaGVscGVycy5nZXRWYWx1ZUF0SW5kZXhPckRlZmF1bHQgPSBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBkZWZhdWx0VmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICAgIH1cblxuICAgIGlmIChoZWxwZXJzLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICByZXR1cm4gaW5kZXggPCB2YWx1ZS5sZW5ndGggPyB2YWx1ZVtpbmRleF0gOiBkZWZhdWx0VmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuICBoZWxwZXJzLmdldFZhbHVlT3JEZWZhdWx0ID0gZnVuY3Rpb24gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRWYWx1ZSA6IHZhbHVlXG4gIH1cbiAgaGVscGVycy5pbmRleE9mID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2ZcbiAgICA/IGZ1bmN0aW9uIChhcnJheSwgaXRlbSkge1xuICAgICAgcmV0dXJuIGFycmF5LmluZGV4T2YoaXRlbSlcbiAgICB9XG4gICAgOiBmdW5jdGlvbiAoYXJyYXksIGl0ZW0pIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBpbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgaWxlbjsgKytpKSB7XG4gICAgICAgIGlmIChhcnJheVtpXSA9PT0gaXRlbSkge1xuICAgICAgICAgIHJldHVybiBpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgaGVscGVycy53aGVyZSA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBmaWx0ZXJDYWxsYmFjaykge1xuICAgIGlmIChoZWxwZXJzLmlzQXJyYXkoY29sbGVjdGlvbikgJiYgQXJyYXkucHJvdG90eXBlLmZpbHRlcikge1xuICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uZmlsdGVyKGZpbHRlckNhbGxiYWNrKVxuICAgIH1cbiAgICB2YXIgZmlsdGVyZWQgPSBbXVxuXG4gICAgaGVscGVycy5lYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICBpZiAoZmlsdGVyQ2FsbGJhY2soaXRlbSkpIHtcbiAgICAgICAgZmlsdGVyZWQucHVzaChpdGVtKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gZmlsdGVyZWRcbiAgfVxuICBoZWxwZXJzLmZpbmRJbmRleCA9IEFycmF5LnByb3RvdHlwZS5maW5kSW5kZXhcbiAgICA/IGZ1bmN0aW9uIChhcnJheSwgY2FsbGJhY2ssIHNjb3BlKSB7XG4gICAgICByZXR1cm4gYXJyYXkuZmluZEluZGV4KGNhbGxiYWNrLCBzY29wZSlcbiAgICB9XG4gICAgOiBmdW5jdGlvbiAoYXJyYXksIGNhbGxiYWNrLCBzY29wZSkge1xuICAgICAgc2NvcGUgPSBzY29wZSA9PT0gdW5kZWZpbmVkID8gYXJyYXkgOiBzY29wZVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGlsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBpbGVuOyArK2kpIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoc2NvcGUsIGFycmF5W2ldLCBpLCBhcnJheSkpIHtcbiAgICAgICAgICByZXR1cm4gaVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gIGhlbHBlcnMuZmluZE5leHRXaGVyZSA9IGZ1bmN0aW9uIChhcnJheVRvU2VhcmNoLCBmaWx0ZXJDYWxsYmFjaywgc3RhcnRJbmRleCkge1xuICAgIC8vIERlZmF1bHQgdG8gc3RhcnQgb2YgdGhlIGFycmF5XG4gICAgaWYgKHN0YXJ0SW5kZXggPT09IHVuZGVmaW5lZCB8fCBzdGFydEluZGV4ID09PSBudWxsKSB7XG4gICAgICBzdGFydEluZGV4ID0gLTFcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXggKyAxOyBpIDwgYXJyYXlUb1NlYXJjaC5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGN1cnJlbnRJdGVtID0gYXJyYXlUb1NlYXJjaFtpXVxuICAgICAgaWYgKGZpbHRlckNhbGxiYWNrKGN1cnJlbnRJdGVtKSkge1xuICAgICAgICByZXR1cm4gY3VycmVudEl0ZW1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaGVscGVycy5maW5kUHJldmlvdXNXaGVyZSA9IGZ1bmN0aW9uIChhcnJheVRvU2VhcmNoLCBmaWx0ZXJDYWxsYmFjaywgc3RhcnRJbmRleCkge1xuICAgIC8vIERlZmF1bHQgdG8gZW5kIG9mIHRoZSBhcnJheVxuICAgIGlmIChzdGFydEluZGV4ID09PSB1bmRlZmluZWQgfHwgc3RhcnRJbmRleCA9PT0gbnVsbCkge1xuICAgICAgc3RhcnRJbmRleCA9IGFycmF5VG9TZWFyY2gubGVuZ3RoXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSBzdGFydEluZGV4IC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBjdXJyZW50SXRlbSA9IGFycmF5VG9TZWFyY2hbaV1cbiAgICAgIGlmIChmaWx0ZXJDYWxsYmFjayhjdXJyZW50SXRlbSkpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRJdGVtXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGhlbHBlcnMuaW5oZXJpdHMgPSBmdW5jdGlvbiAoZXh0ZW5zaW9ucykge1xuICAgIC8vIEJhc2ljIGphdmFzY3JpcHQgaW5oZXJpdGFuY2UgYmFzZWQgb24gdGhlIG1vZGVsIGNyZWF0ZWQgaW4gQmFja2JvbmUuanNcbiAgICB2YXIgbWUgPSB0aGlzXG4gICAgdmFyIENoYXJ0RWxlbWVudCA9IChleHRlbnNpb25zICYmIGV4dGVuc2lvbnMuaGFzT3duUHJvcGVydHkoJ2NvbnN0cnVjdG9yJykpID8gZXh0ZW5zaW9ucy5jb25zdHJ1Y3RvciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBtZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgfVxuXG4gICAgdmFyIFN1cnJvZ2F0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY29uc3RydWN0b3IgPSBDaGFydEVsZW1lbnRcbiAgICB9XG4gICAgU3Vycm9nYXRlLnByb3RvdHlwZSA9IG1lLnByb3RvdHlwZVxuICAgIENoYXJ0RWxlbWVudC5wcm90b3R5cGUgPSBuZXcgU3Vycm9nYXRlKClcblxuICAgIENoYXJ0RWxlbWVudC5leHRlbmQgPSBoZWxwZXJzLmluaGVyaXRzXG5cbiAgICBpZiAoZXh0ZW5zaW9ucykge1xuICAgICAgaGVscGVycy5leHRlbmQoQ2hhcnRFbGVtZW50LnByb3RvdHlwZSwgZXh0ZW5zaW9ucylcbiAgICB9XG5cbiAgICBDaGFydEVsZW1lbnQuX19zdXBlcl9fID0gbWUucHJvdG90eXBlXG5cbiAgICByZXR1cm4gQ2hhcnRFbGVtZW50XG4gIH1cbiAgaGVscGVycy5ub29wID0gZnVuY3Rpb24gKCkge31cbiAgaGVscGVycy51aWQgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZCA9IDBcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGlkKytcbiAgICB9XG4gIH0oKSlcbiAgLy8gLS0gTWF0aCBtZXRob2RzXG4gIGhlbHBlcnMuaXNOdW1iZXIgPSBmdW5jdGlvbiAobikge1xuICAgIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdChuKSkgJiYgaXNGaW5pdGUobilcbiAgfVxuICBoZWxwZXJzLmFsbW9zdEVxdWFscyA9IGZ1bmN0aW9uICh4LCB5LCBlcHNpbG9uKSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKHggLSB5KSA8IGVwc2lsb25cbiAgfVxuICBoZWxwZXJzLmFsbW9zdFdob2xlID0gZnVuY3Rpb24gKHgsIGVwc2lsb24pIHtcbiAgICB2YXIgcm91bmRlZCA9IE1hdGgucm91bmQoeClcbiAgICByZXR1cm4gKCgocm91bmRlZCAtIGVwc2lsb24pIDwgeCkgJiYgKChyb3VuZGVkICsgZXBzaWxvbikgPiB4KSlcbiAgfVxuICBoZWxwZXJzLm1heCA9IGZ1bmN0aW9uIChhcnJheSkge1xuICAgIHJldHVybiBhcnJheS5yZWR1Y2UoZnVuY3Rpb24gKG1heCwgdmFsdWUpIHtcbiAgICAgIGlmICghaXNOYU4odmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heChtYXgsIHZhbHVlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1heFxuICAgIH0sIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSlcbiAgfVxuICBoZWxwZXJzLm1pbiA9IGZ1bmN0aW9uIChhcnJheSkge1xuICAgIHJldHVybiBhcnJheS5yZWR1Y2UoZnVuY3Rpb24gKG1pbiwgdmFsdWUpIHtcbiAgICAgIGlmICghaXNOYU4odmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1pbihtaW4sIHZhbHVlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1pblxuICAgIH0sIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSlcbiAgfVxuICBoZWxwZXJzLnNpZ24gPSBNYXRoLnNpZ25cbiAgICA/IGZ1bmN0aW9uICh4KSB7XG4gICAgICByZXR1cm4gTWF0aC5zaWduKHgpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gKHgpIHtcbiAgICAgIHggPSAreCAvLyBjb252ZXJ0IHRvIGEgbnVtYmVyXG4gICAgICBpZiAoeCA9PT0gMCB8fCBpc05hTih4KSkge1xuICAgICAgICByZXR1cm4geFxuICAgICAgfVxuICAgICAgcmV0dXJuIHggPiAwID8gMSA6IC0xXG4gICAgfVxuICBoZWxwZXJzLmxvZzEwID0gTWF0aC5sb2cxMFxuICAgID8gZnVuY3Rpb24gKHgpIHtcbiAgICAgIHJldHVybiBNYXRoLmxvZzEwKHgpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gKHgpIHtcbiAgICAgIHJldHVybiBNYXRoLmxvZyh4KSAvIE1hdGguTE4xMFxuICAgIH1cbiAgaGVscGVycy50b1JhZGlhbnMgPSBmdW5jdGlvbiAoZGVncmVlcykge1xuICAgIHJldHVybiBkZWdyZWVzICogKE1hdGguUEkgLyAxODApXG4gIH1cbiAgaGVscGVycy50b0RlZ3JlZXMgPSBmdW5jdGlvbiAocmFkaWFucykge1xuICAgIHJldHVybiByYWRpYW5zICogKDE4MCAvIE1hdGguUEkpXG4gIH1cbiAgLy8gR2V0cyB0aGUgYW5nbGUgZnJvbSB2ZXJ0aWNhbCB1cHJpZ2h0IHRvIHRoZSBwb2ludCBhYm91dCBhIGNlbnRyZS5cbiAgaGVscGVycy5nZXRBbmdsZUZyb21Qb2ludCA9IGZ1bmN0aW9uIChjZW50cmVQb2ludCwgYW5nbGVQb2ludCkge1xuICAgIHZhciBkaXN0YW5jZUZyb21YQ2VudGVyID0gYW5nbGVQb2ludC54IC0gY2VudHJlUG9pbnQueCxcbiAgICAgIGRpc3RhbmNlRnJvbVlDZW50ZXIgPSBhbmdsZVBvaW50LnkgLSBjZW50cmVQb2ludC55LFxuICAgICAgcmFkaWFsRGlzdGFuY2VGcm9tQ2VudGVyID0gTWF0aC5zcXJ0KGRpc3RhbmNlRnJvbVhDZW50ZXIgKiBkaXN0YW5jZUZyb21YQ2VudGVyICsgZGlzdGFuY2VGcm9tWUNlbnRlciAqIGRpc3RhbmNlRnJvbVlDZW50ZXIpXG5cbiAgICB2YXIgYW5nbGUgPSBNYXRoLmF0YW4yKGRpc3RhbmNlRnJvbVlDZW50ZXIsIGRpc3RhbmNlRnJvbVhDZW50ZXIpXG5cbiAgICBpZiAoYW5nbGUgPCAoLTAuNSAqIE1hdGguUEkpKSB7XG4gICAgICBhbmdsZSArPSAyLjAgKiBNYXRoLlBJIC8vIG1ha2Ugc3VyZSB0aGUgcmV0dXJuZWQgYW5nbGUgaXMgaW4gdGhlIHJhbmdlIG9mICgtUEkvMiwgM1BJLzJdXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFuZ2xlOiBhbmdsZSxcbiAgICAgIGRpc3RhbmNlOiByYWRpYWxEaXN0YW5jZUZyb21DZW50ZXJcbiAgICB9XG4gIH1cbiAgaGVscGVycy5kaXN0YW5jZUJldHdlZW5Qb2ludHMgPSBmdW5jdGlvbiAocHQxLCBwdDIpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHB0Mi54IC0gcHQxLngsIDIpICsgTWF0aC5wb3cocHQyLnkgLSBwdDEueSwgMikpXG4gIH1cbiAgaGVscGVycy5hbGlhc1BpeGVsID0gZnVuY3Rpb24gKHBpeGVsV2lkdGgpIHtcbiAgICByZXR1cm4gKHBpeGVsV2lkdGggJSAyID09PSAwKSA/IDAgOiAwLjVcbiAgfVxuICBoZWxwZXJzLnNwbGluZUN1cnZlID0gZnVuY3Rpb24gKGZpcnN0UG9pbnQsIG1pZGRsZVBvaW50LCBhZnRlclBvaW50LCB0KSB7XG4gICAgLy8gUHJvcHMgdG8gUm9iIFNwZW5jZXIgYXQgc2NhbGVkIGlubm92YXRpb24gZm9yIGhpcyBwb3N0IG9uIHNwbGluaW5nIGJldHdlZW4gcG9pbnRzXG4gICAgLy8gaHR0cDovL3NjYWxlZGlubm92YXRpb24uY29tL2FuYWx5dGljcy9zcGxpbmVzL2Fib3V0U3BsaW5lcy5odG1sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIG11c3QgYWxzbyByZXNwZWN0IFwic2tpcHBlZFwiIHBvaW50c1xuXG4gICAgdmFyIHByZXZpb3VzID0gZmlyc3RQb2ludC5za2lwID8gbWlkZGxlUG9pbnQgOiBmaXJzdFBvaW50LFxuICAgICAgY3VycmVudCA9IG1pZGRsZVBvaW50LFxuICAgICAgbmV4dCA9IGFmdGVyUG9pbnQuc2tpcCA/IG1pZGRsZVBvaW50IDogYWZ0ZXJQb2ludFxuXG4gICAgdmFyIGQwMSA9IE1hdGguc3FydChNYXRoLnBvdyhjdXJyZW50LnggLSBwcmV2aW91cy54LCAyKSArIE1hdGgucG93KGN1cnJlbnQueSAtIHByZXZpb3VzLnksIDIpKVxuICAgIHZhciBkMTIgPSBNYXRoLnNxcnQoTWF0aC5wb3cobmV4dC54IC0gY3VycmVudC54LCAyKSArIE1hdGgucG93KG5leHQueSAtIGN1cnJlbnQueSwgMikpXG5cbiAgICB2YXIgczAxID0gZDAxIC8gKGQwMSArIGQxMilcbiAgICB2YXIgczEyID0gZDEyIC8gKGQwMSArIGQxMilcblxuICAgIC8vIElmIGFsbCBwb2ludHMgYXJlIHRoZSBzYW1lLCBzMDEgJiBzMDIgd2lsbCBiZSBpbmZcbiAgICBzMDEgPSBpc05hTihzMDEpID8gMCA6IHMwMVxuICAgIHMxMiA9IGlzTmFOKHMxMikgPyAwIDogczEyXG5cbiAgICB2YXIgZmEgPSB0ICogczAxIC8vIHNjYWxpbmcgZmFjdG9yIGZvciB0cmlhbmdsZSBUYVxuICAgIHZhciBmYiA9IHQgKiBzMTJcblxuICAgIHJldHVybiB7XG4gICAgICBwcmV2aW91czoge1xuICAgICAgICB4OiBjdXJyZW50LnggLSBmYSAqIChuZXh0LnggLSBwcmV2aW91cy54KSxcbiAgICAgICAgeTogY3VycmVudC55IC0gZmEgKiAobmV4dC55IC0gcHJldmlvdXMueSlcbiAgICAgIH0sXG4gICAgICBuZXh0OiB7XG4gICAgICAgIHg6IGN1cnJlbnQueCArIGZiICogKG5leHQueCAtIHByZXZpb3VzLngpLFxuICAgICAgICB5OiBjdXJyZW50LnkgKyBmYiAqIChuZXh0LnkgLSBwcmV2aW91cy55KVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLkVQU0lMT04gPSBOdW1iZXIuRVBTSUxPTiB8fCAxZS0xNFxuICBoZWxwZXJzLnNwbGluZUN1cnZlTW9ub3RvbmUgPSBmdW5jdGlvbiAocG9pbnRzKSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBjYWxjdWxhdGVzIELDqXppZXIgY29udHJvbCBwb2ludHMgaW4gYSBzaW1pbGFyIHdheSB0aGFuIHxzcGxpbmVDdXJ2ZXwsXG4gICAgLy8gYnV0IHByZXNlcnZlcyBtb25vdG9uaWNpdHkgb2YgdGhlIHByb3ZpZGVkIGRhdGEgYW5kIGVuc3VyZXMgbm8gbG9jYWwgZXh0cmVtdW1zIGFyZSBhZGRlZFxuICAgIC8vIGJldHdlZW4gdGhlIGRhdGFzZXQgZGlzY3JldGUgcG9pbnRzIGR1ZSB0byB0aGUgaW50ZXJwb2xhdGlvbi5cbiAgICAvLyBTZWUgOiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Nb25vdG9uZV9jdWJpY19pbnRlcnBvbGF0aW9uXG5cbiAgICB2YXIgcG9pbnRzV2l0aFRhbmdlbnRzID0gKHBvaW50cyB8fCBbXSkubWFwKGZ1bmN0aW9uIChwb2ludCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbW9kZWw6IHBvaW50Ll9tb2RlbCxcbiAgICAgICAgZGVsdGFLOiAwLFxuICAgICAgICBtSzogMFxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBDYWxjdWxhdGUgc2xvcGVzIChkZWx0YUspIGFuZCBpbml0aWFsaXplIHRhbmdlbnRzIChtSylcbiAgICB2YXIgcG9pbnRzTGVuID0gcG9pbnRzV2l0aFRhbmdlbnRzLmxlbmd0aFxuICAgIHZhciBpLCBwb2ludEJlZm9yZSwgcG9pbnRDdXJyZW50LCBwb2ludEFmdGVyXG4gICAgZm9yIChpID0gMDsgaSA8IHBvaW50c0xlbjsgKytpKSB7XG4gICAgICBwb2ludEN1cnJlbnQgPSBwb2ludHNXaXRoVGFuZ2VudHNbaV1cbiAgICAgIGlmIChwb2ludEN1cnJlbnQubW9kZWwuc2tpcCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBwb2ludEJlZm9yZSA9IGkgPiAwID8gcG9pbnRzV2l0aFRhbmdlbnRzW2kgLSAxXSA6IG51bGxcbiAgICAgIHBvaW50QWZ0ZXIgPSBpIDwgcG9pbnRzTGVuIC0gMSA/IHBvaW50c1dpdGhUYW5nZW50c1tpICsgMV0gOiBudWxsXG4gICAgICBpZiAocG9pbnRBZnRlciAmJiAhcG9pbnRBZnRlci5tb2RlbC5za2lwKSB7XG4gICAgICAgIHZhciBzbG9wZURlbHRhWCA9IChwb2ludEFmdGVyLm1vZGVsLnggLSBwb2ludEN1cnJlbnQubW9kZWwueClcblxuICAgICAgICAvLyBJbiB0aGUgY2FzZSBvZiB0d28gcG9pbnRzIHRoYXQgYXBwZWFyIGF0IHRoZSBzYW1lIHggcGl4ZWwsIHNsb3BlRGVsdGFYIGlzIDBcbiAgICAgICAgcG9pbnRDdXJyZW50LmRlbHRhSyA9IHNsb3BlRGVsdGFYICE9PSAwID8gKHBvaW50QWZ0ZXIubW9kZWwueSAtIHBvaW50Q3VycmVudC5tb2RlbC55KSAvIHNsb3BlRGVsdGFYIDogMFxuICAgICAgfVxuXG4gICAgICBpZiAoIXBvaW50QmVmb3JlIHx8IHBvaW50QmVmb3JlLm1vZGVsLnNraXApIHtcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1LID0gcG9pbnRDdXJyZW50LmRlbHRhS1xuICAgICAgfSBlbHNlIGlmICghcG9pbnRBZnRlciB8fCBwb2ludEFmdGVyLm1vZGVsLnNraXApIHtcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1LID0gcG9pbnRCZWZvcmUuZGVsdGFLXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc2lnbihwb2ludEJlZm9yZS5kZWx0YUspICE9PSB0aGlzLnNpZ24ocG9pbnRDdXJyZW50LmRlbHRhSykpIHtcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1LID0gMFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1LID0gKHBvaW50QmVmb3JlLmRlbHRhSyArIHBvaW50Q3VycmVudC5kZWx0YUspIC8gMlxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkanVzdCB0YW5nZW50cyB0byBlbnN1cmUgbW9ub3RvbmljIHByb3BlcnRpZXNcbiAgICB2YXIgYWxwaGFLLCBiZXRhSywgdGF1Sywgc3F1YXJlZE1hZ25pdHVkZVxuICAgIGZvciAoaSA9IDA7IGkgPCBwb2ludHNMZW4gLSAxOyArK2kpIHtcbiAgICAgIHBvaW50Q3VycmVudCA9IHBvaW50c1dpdGhUYW5nZW50c1tpXVxuICAgICAgcG9pbnRBZnRlciA9IHBvaW50c1dpdGhUYW5nZW50c1tpICsgMV1cbiAgICAgIGlmIChwb2ludEN1cnJlbnQubW9kZWwuc2tpcCB8fCBwb2ludEFmdGVyLm1vZGVsLnNraXApIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYgKGhlbHBlcnMuYWxtb3N0RXF1YWxzKHBvaW50Q3VycmVudC5kZWx0YUssIDAsIHRoaXMuRVBTSUxPTikpIHtcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1LID0gcG9pbnRBZnRlci5tSyA9IDBcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgYWxwaGFLID0gcG9pbnRDdXJyZW50Lm1LIC8gcG9pbnRDdXJyZW50LmRlbHRhS1xuICAgICAgYmV0YUsgPSBwb2ludEFmdGVyLm1LIC8gcG9pbnRDdXJyZW50LmRlbHRhS1xuICAgICAgc3F1YXJlZE1hZ25pdHVkZSA9IE1hdGgucG93KGFscGhhSywgMikgKyBNYXRoLnBvdyhiZXRhSywgMilcbiAgICAgIGlmIChzcXVhcmVkTWFnbml0dWRlIDw9IDkpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgdGF1SyA9IDMgLyBNYXRoLnNxcnQoc3F1YXJlZE1hZ25pdHVkZSlcbiAgICAgIHBvaW50Q3VycmVudC5tSyA9IGFscGhhSyAqIHRhdUsgKiBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgICBwb2ludEFmdGVyLm1LID0gYmV0YUsgKiB0YXVLICogcG9pbnRDdXJyZW50LmRlbHRhS1xuICAgIH1cblxuICAgIC8vIENvbXB1dGUgY29udHJvbCBwb2ludHNcbiAgICB2YXIgZGVsdGFYXG4gICAgZm9yIChpID0gMDsgaSA8IHBvaW50c0xlbjsgKytpKSB7XG4gICAgICBwb2ludEN1cnJlbnQgPSBwb2ludHNXaXRoVGFuZ2VudHNbaV1cbiAgICAgIGlmIChwb2ludEN1cnJlbnQubW9kZWwuc2tpcCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBwb2ludEJlZm9yZSA9IGkgPiAwID8gcG9pbnRzV2l0aFRhbmdlbnRzW2kgLSAxXSA6IG51bGxcbiAgICAgIHBvaW50QWZ0ZXIgPSBpIDwgcG9pbnRzTGVuIC0gMSA/IHBvaW50c1dpdGhUYW5nZW50c1tpICsgMV0gOiBudWxsXG4gICAgICBpZiAocG9pbnRCZWZvcmUgJiYgIXBvaW50QmVmb3JlLm1vZGVsLnNraXApIHtcbiAgICAgICAgZGVsdGFYID0gKHBvaW50Q3VycmVudC5tb2RlbC54IC0gcG9pbnRCZWZvcmUubW9kZWwueCkgLyAzXG4gICAgICAgIHBvaW50Q3VycmVudC5tb2RlbC5jb250cm9sUG9pbnRQcmV2aW91c1ggPSBwb2ludEN1cnJlbnQubW9kZWwueCAtIGRlbHRhWFxuICAgICAgICBwb2ludEN1cnJlbnQubW9kZWwuY29udHJvbFBvaW50UHJldmlvdXNZID0gcG9pbnRDdXJyZW50Lm1vZGVsLnkgLSBkZWx0YVggKiBwb2ludEN1cnJlbnQubUtcbiAgICAgIH1cbiAgICAgIGlmIChwb2ludEFmdGVyICYmICFwb2ludEFmdGVyLm1vZGVsLnNraXApIHtcbiAgICAgICAgZGVsdGFYID0gKHBvaW50QWZ0ZXIubW9kZWwueCAtIHBvaW50Q3VycmVudC5tb2RlbC54KSAvIDNcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1vZGVsLmNvbnRyb2xQb2ludE5leHRYID0gcG9pbnRDdXJyZW50Lm1vZGVsLnggKyBkZWx0YVhcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1vZGVsLmNvbnRyb2xQb2ludE5leHRZID0gcG9pbnRDdXJyZW50Lm1vZGVsLnkgKyBkZWx0YVggKiBwb2ludEN1cnJlbnQubUtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaGVscGVycy5uZXh0SXRlbSA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBpbmRleCwgbG9vcCkge1xuICAgIGlmIChsb29wKSB7XG4gICAgICByZXR1cm4gaW5kZXggPj0gY29sbGVjdGlvbi5sZW5ndGggLSAxID8gY29sbGVjdGlvblswXSA6IGNvbGxlY3Rpb25baW5kZXggKyAxXVxuICAgIH1cbiAgICByZXR1cm4gaW5kZXggPj0gY29sbGVjdGlvbi5sZW5ndGggLSAxID8gY29sbGVjdGlvbltjb2xsZWN0aW9uLmxlbmd0aCAtIDFdIDogY29sbGVjdGlvbltpbmRleCArIDFdXG4gIH1cbiAgaGVscGVycy5wcmV2aW91c0l0ZW0gPSBmdW5jdGlvbiAoY29sbGVjdGlvbiwgaW5kZXgsIGxvb3ApIHtcbiAgICBpZiAobG9vcCkge1xuICAgICAgcmV0dXJuIGluZGV4IDw9IDAgPyBjb2xsZWN0aW9uW2NvbGxlY3Rpb24ubGVuZ3RoIC0gMV0gOiBjb2xsZWN0aW9uW2luZGV4IC0gMV1cbiAgICB9XG4gICAgcmV0dXJuIGluZGV4IDw9IDAgPyBjb2xsZWN0aW9uWzBdIDogY29sbGVjdGlvbltpbmRleCAtIDFdXG4gIH1cbiAgLy8gSW1wbGVtZW50YXRpb24gb2YgdGhlIG5pY2UgbnVtYmVyIGFsZ29yaXRobSB1c2VkIGluIGRldGVybWluaW5nIHdoZXJlIGF4aXMgbGFiZWxzIHdpbGwgZ29cbiAgaGVscGVycy5uaWNlTnVtID0gZnVuY3Rpb24gKHJhbmdlLCByb3VuZCkge1xuICAgIHZhciBleHBvbmVudCA9IE1hdGguZmxvb3IoaGVscGVycy5sb2cxMChyYW5nZSkpXG4gICAgdmFyIGZyYWN0aW9uID0gcmFuZ2UgLyBNYXRoLnBvdygxMCwgZXhwb25lbnQpXG4gICAgdmFyIG5pY2VGcmFjdGlvblxuXG4gICAgaWYgKHJvdW5kKSB7XG4gICAgICBpZiAoZnJhY3Rpb24gPCAxLjUpIHtcbiAgICAgICAgbmljZUZyYWN0aW9uID0gMVxuICAgICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8IDMpIHtcbiAgICAgICAgbmljZUZyYWN0aW9uID0gMlxuICAgICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8IDcpIHtcbiAgICAgICAgbmljZUZyYWN0aW9uID0gNVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmljZUZyYWN0aW9uID0gMTBcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDw9IDEuMCkge1xuICAgICAgbmljZUZyYWN0aW9uID0gMVxuICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPD0gMikge1xuICAgICAgbmljZUZyYWN0aW9uID0gMlxuICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPD0gNSkge1xuICAgICAgbmljZUZyYWN0aW9uID0gNVxuICAgIH0gZWxzZSB7XG4gICAgICBuaWNlRnJhY3Rpb24gPSAxMFxuICAgIH1cblxuICAgIHJldHVybiBuaWNlRnJhY3Rpb24gKiBNYXRoLnBvdygxMCwgZXhwb25lbnQpXG4gIH1cbiAgLy8gRWFzaW5nIGZ1bmN0aW9ucyBhZGFwdGVkIGZyb20gUm9iZXJ0IFBlbm5lcidzIGVhc2luZyBlcXVhdGlvbnNcbiAgLy8gaHR0cDovL3d3dy5yb2JlcnRwZW5uZXIuY29tL2Vhc2luZy9cbiAgdmFyIGVhc2luZ0VmZmVjdHMgPSBoZWxwZXJzLmVhc2luZ0VmZmVjdHMgPSB7XG4gICAgbGluZWFyOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIHRcbiAgICB9LFxuICAgIGVhc2VJblF1YWQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gdCAqIHRcbiAgICB9LFxuICAgIGVhc2VPdXRRdWFkOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIC0xICogdCAqICh0IC0gMilcbiAgICB9LFxuICAgIGVhc2VJbk91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gMSAvIDIgKiB0ICogdFxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xIC8gMiAqICgoLS10KSAqICh0IC0gMikgLSAxKVxuICAgIH0sXG4gICAgZWFzZUluQ3ViaWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gdCAqIHQgKiB0XG4gICAgfSxcbiAgICBlYXNlT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gMSAqICgodCA9IHQgLyAxIC0gMSkgKiB0ICogdCArIDEpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRDdWJpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqIHQgKiB0ICogdFxuICAgICAgfVxuICAgICAgcmV0dXJuIDEgLyAyICogKCh0IC09IDIpICogdCAqIHQgKyAyKVxuICAgIH0sXG4gICAgZWFzZUluUXVhcnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gdCAqIHQgKiB0ICogdFxuICAgIH0sXG4gICAgZWFzZU91dFF1YXJ0OiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIC0xICogKCh0ID0gdCAvIDEgLSAxKSAqIHQgKiB0ICogdCAtIDEpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRRdWFydDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqIHQgKiB0ICogdCAqIHRcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMSAvIDIgKiAoKHQgLT0gMikgKiB0ICogdCAqIHQgLSAyKVxuICAgIH0sXG4gICAgZWFzZUluUXVpbnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gMSAqICh0IC89IDEpICogdCAqIHQgKiB0ICogdFxuICAgIH0sXG4gICAgZWFzZU91dFF1aW50OiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgKiAoKHQgPSB0IC8gMSAtIDEpICogdCAqIHQgKiB0ICogdCArIDEpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRRdWludDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqIHQgKiB0ICogdCAqIHQgKiB0XG4gICAgICB9XG4gICAgICByZXR1cm4gMSAvIDIgKiAoKHQgLT0gMikgKiB0ICogdCAqIHQgKiB0ICsgMilcbiAgICB9LFxuICAgIGVhc2VJblNpbmU6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gLTEgKiBNYXRoLmNvcyh0IC8gMSAqIChNYXRoLlBJIC8gMikpICsgMVxuICAgIH0sXG4gICAgZWFzZU91dFNpbmU6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gMSAqIE1hdGguc2luKHQgLyAxICogKE1hdGguUEkgLyAyKSlcbiAgICB9LFxuICAgIGVhc2VJbk91dFNpbmU6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gLTEgLyAyICogKE1hdGguY29zKE1hdGguUEkgKiB0IC8gMSkgLSAxKVxuICAgIH0sXG4gICAgZWFzZUluRXhwbzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAodCA9PT0gMCkgPyAxIDogMSAqIE1hdGgucG93KDIsIDEwICogKHQgLyAxIC0gMSkpXG4gICAgfSxcbiAgICBlYXNlT3V0RXhwbzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAodCA9PT0gMSkgPyAxIDogMSAqICgtTWF0aC5wb3coMiwgLTEwICogdCAvIDEpICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dEV4cG86IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAodCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuICAgICAgaWYgKHQgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIH1cbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqIE1hdGgucG93KDIsIDEwICogKHQgLSAxKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAxIC8gMiAqICgtTWF0aC5wb3coMiwgLTEwICogLS10KSArIDIpXG4gICAgfSxcbiAgICBlYXNlSW5DaXJjOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKHQgPj0gMSkge1xuICAgICAgICByZXR1cm4gdFxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xICogKE1hdGguc3FydCgxIC0gKHQgLz0gMSkgKiB0KSAtIDEpXG4gICAgfSxcbiAgICBlYXNlT3V0Q2lyYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxICogTWF0aC5zcXJ0KDEgLSAodCA9IHQgLyAxIC0gMSkgKiB0KVxuICAgIH0sXG4gICAgZWFzZUluT3V0Q2lyYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAtMSAvIDIgKiAoTWF0aC5zcXJ0KDEgLSB0ICogdCkgLSAxKVxuICAgICAgfVxuICAgICAgcmV0dXJuIDEgLyAyICogKE1hdGguc3FydCgxIC0gKHQgLT0gMikgKiB0KSArIDEpXG4gICAgfSxcbiAgICBlYXNlSW5FbGFzdGljOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICB2YXIgcCA9IDBcbiAgICAgIHZhciBhID0gMVxuICAgICAgaWYgKHQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cbiAgICAgIGlmICgodCAvPSAxKSA9PT0gMSkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgaWYgKCFwKSB7XG4gICAgICAgIHAgPSAxICogMC4zXG4gICAgICB9XG4gICAgICBpZiAoYSA8IE1hdGguYWJzKDEpKSB7XG4gICAgICAgIGEgPSAxXG4gICAgICAgIHMgPSBwIC8gNFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcyA9IHAgLyAoMiAqIE1hdGguUEkpICogTWF0aC5hc2luKDEgLyBhKVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0oYSAqIE1hdGgucG93KDIsIDEwICogKHQgLT0gMSkpICogTWF0aC5zaW4oKHQgKiAxIC0gcykgKiAoMiAqIE1hdGguUEkpIC8gcCkpXG4gICAgfSxcbiAgICBlYXNlT3V0RWxhc3RpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgdmFyIHAgPSAwXG4gICAgICB2YXIgYSA9IDFcbiAgICAgIGlmICh0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgICBpZiAoKHQgLz0gMSkgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIH1cbiAgICAgIGlmICghcCkge1xuICAgICAgICBwID0gMSAqIDAuM1xuICAgICAgfVxuICAgICAgaWYgKGEgPCBNYXRoLmFicygxKSkge1xuICAgICAgICBhID0gMVxuICAgICAgICBzID0gcCAvIDRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMgPSBwIC8gKDIgKiBNYXRoLlBJKSAqIE1hdGguYXNpbigxIC8gYSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBhICogTWF0aC5wb3coMiwgLTEwICogdCkgKiBNYXRoLnNpbigodCAqIDEgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSArIDFcbiAgICB9LFxuICAgIGVhc2VJbk91dEVsYXN0aWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIHZhciBwID0gMFxuICAgICAgdmFyIGEgPSAxXG4gICAgICBpZiAodCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuICAgICAgaWYgKCh0IC89IDEgLyAyKSA9PT0gMikge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgaWYgKCFwKSB7XG4gICAgICAgIHAgPSAxICogKDAuMyAqIDEuNSlcbiAgICAgIH1cbiAgICAgIGlmIChhIDwgTWF0aC5hYnMoMSkpIHtcbiAgICAgICAgYSA9IDFcbiAgICAgICAgcyA9IHAgLyA0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzID0gcCAvICgyICogTWF0aC5QSSkgKiBNYXRoLmFzaW4oMSAvIGEpXG4gICAgICB9XG4gICAgICBpZiAodCA8IDEpIHtcbiAgICAgICAgcmV0dXJuIC0wLjUgKiAoYSAqIE1hdGgucG93KDIsIDEwICogKHQgLT0gMSkpICogTWF0aC5zaW4oKHQgKiAxIC0gcykgKiAoMiAqIE1hdGguUEkpIC8gcCkpXG4gICAgICB9XG4gICAgICByZXR1cm4gYSAqIE1hdGgucG93KDIsIC0xMCAqICh0IC09IDEpKSAqIE1hdGguc2luKCh0ICogMSAtIHMpICogKDIgKiBNYXRoLlBJKSAvIHApICogMC41ICsgMVxuICAgIH0sXG4gICAgZWFzZUluQmFjazogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgcmV0dXJuIDEgKiAodCAvPSAxKSAqIHQgKiAoKHMgKyAxKSAqIHQgLSBzKVxuICAgIH0sXG4gICAgZWFzZU91dEJhY2s6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIHJldHVybiAxICogKCh0ID0gdCAvIDEgLSAxKSAqIHQgKiAoKHMgKyAxKSAqIHQgKyBzKSArIDEpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRCYWNrOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gMSAvIDIgKiAodCAqIHQgKiAoKChzICo9ICgxLjUyNSkpICsgMSkgKiB0IC0gcykpXG4gICAgICB9XG4gICAgICByZXR1cm4gMSAvIDIgKiAoKHQgLT0gMikgKiB0ICogKCgocyAqPSAoMS41MjUpKSArIDEpICogdCArIHMpICsgMilcbiAgICB9LFxuICAgIGVhc2VJbkJvdW5jZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxIC0gZWFzaW5nRWZmZWN0cy5lYXNlT3V0Qm91bmNlKDEgLSB0KVxuICAgIH0sXG4gICAgZWFzZU91dEJvdW5jZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICgodCAvPSAxKSA8ICgxIC8gMi43NSkpIHtcbiAgICAgICAgcmV0dXJuIDEgKiAoNy41NjI1ICogdCAqIHQpXG4gICAgICB9IGVsc2UgaWYgKHQgPCAoMiAvIDIuNzUpKSB7XG4gICAgICAgIHJldHVybiAxICogKDcuNTYyNSAqICh0IC09ICgxLjUgLyAyLjc1KSkgKiB0ICsgMC43NSlcbiAgICAgIH0gZWxzZSBpZiAodCA8ICgyLjUgLyAyLjc1KSkge1xuICAgICAgICByZXR1cm4gMSAqICg3LjU2MjUgKiAodCAtPSAoMi4yNSAvIDIuNzUpKSAqIHQgKyAwLjkzNzUpXG4gICAgICB9XG4gICAgICByZXR1cm4gMSAqICg3LjU2MjUgKiAodCAtPSAoMi42MjUgLyAyLjc1KSkgKiB0ICsgMC45ODQzNzUpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRCb3VuY2U6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAodCA8IDEgLyAyKSB7XG4gICAgICAgIHJldHVybiBlYXNpbmdFZmZlY3RzLmVhc2VJbkJvdW5jZSh0ICogMikgKiAwLjVcbiAgICAgIH1cbiAgICAgIHJldHVybiBlYXNpbmdFZmZlY3RzLmVhc2VPdXRCb3VuY2UodCAqIDIgLSAxKSAqIDAuNSArIDEgKiAwLjVcbiAgICB9XG4gIH1cbiAgXG4gIC8vIC0tIERPTSBtZXRob2RzXG4gIGhlbHBlcnMuZ2V0UmVsYXRpdmVQb3NpdGlvbiA9IGZ1bmN0aW9uIChldnQsIGNoYXJ0KSB7XG4gICAgdmFyIG1vdXNlWCwgbW91c2VZXG4gICAgdmFyIGUgPSBldnQub3JpZ2luYWxFdmVudCB8fCBldnQsXG4gICAgICBjYW52YXMgPSBldnQuY3VycmVudFRhcmdldCB8fCBldnQuc3JjRWxlbWVudCxcbiAgICAgIGJvdW5kaW5nUmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgdmFyIHRvdWNoZXMgPSBlLnRvdWNoZXNcbiAgICBpZiAodG91Y2hlcyAmJiB0b3VjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIG1vdXNlWCA9IHRvdWNoZXNbMF0uY2xpZW50WFxuICAgICAgbW91c2VZID0gdG91Y2hlc1swXS5jbGllbnRZXG4gICAgfSBlbHNlIHtcbiAgICAgIG1vdXNlWCA9IGUuY2xpZW50WFxuICAgICAgbW91c2VZID0gZS5jbGllbnRZXG4gICAgfVxuXG4gICAgLy8gU2NhbGUgbW91c2UgY29vcmRpbmF0ZXMgaW50byBjYW52YXMgY29vcmRpbmF0ZXNcbiAgICAvLyBieSBmb2xsb3dpbmcgdGhlIHBhdHRlcm4gbGFpZCBvdXQgYnkgJ2plcnJ5aicgaW4gdGhlIGNvbW1lbnRzIG9mXG4gICAgLy8gaHR0cDovL3d3dy5odG1sNWNhbnZhc3R1dG9yaWFscy5jb20vYWR2YW5jZWQvaHRtbDUtY2FudmFzLW1vdXNlLWNvb3JkaW5hdGVzL1xuICAgIHZhciBwYWRkaW5nTGVmdCA9IHBhcnNlRmxvYXQoaGVscGVycy5nZXRTdHlsZShjYW52YXMsICdwYWRkaW5nLWxlZnQnKSlcbiAgICB2YXIgcGFkZGluZ1RvcCA9IHBhcnNlRmxvYXQoaGVscGVycy5nZXRTdHlsZShjYW52YXMsICdwYWRkaW5nLXRvcCcpKVxuICAgIHZhciBwYWRkaW5nUmlnaHQgPSBwYXJzZUZsb2F0KGhlbHBlcnMuZ2V0U3R5bGUoY2FudmFzLCAncGFkZGluZy1yaWdodCcpKVxuICAgIHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VGbG9hdChoZWxwZXJzLmdldFN0eWxlKGNhbnZhcywgJ3BhZGRpbmctYm90dG9tJykpXG4gICAgdmFyIHdpZHRoID0gYm91bmRpbmdSZWN0LnJpZ2h0IC0gYm91bmRpbmdSZWN0LmxlZnQgLSBwYWRkaW5nTGVmdCAtIHBhZGRpbmdSaWdodFxuICAgIHZhciBoZWlnaHQgPSBib3VuZGluZ1JlY3QuYm90dG9tIC0gYm91bmRpbmdSZWN0LnRvcCAtIHBhZGRpbmdUb3AgLSBwYWRkaW5nQm90dG9tXG5cbiAgICAvLyBXZSBkaXZpZGUgYnkgdGhlIGN1cnJlbnQgZGV2aWNlIHBpeGVsIHJhdGlvLCBiZWNhdXNlIHRoZSBjYW52YXMgaXMgc2NhbGVkIHVwIGJ5IHRoYXQgYW1vdW50IGluIGVhY2ggZGlyZWN0aW9uLiBIb3dldmVyXG4gICAgLy8gdGhlIGJhY2tlbmQgbW9kZWwgaXMgaW4gdW5zY2FsZWQgY29vcmRpbmF0ZXMuIFNpbmNlIHdlIGFyZSBnb2luZyB0byBkZWFsIHdpdGggb3VyIG1vZGVsIGNvb3JkaW5hdGVzLCB3ZSBnbyBiYWNrIGhlcmVcbiAgICBtb3VzZVggPSBNYXRoLnJvdW5kKChtb3VzZVggLSBib3VuZGluZ1JlY3QubGVmdCAtIHBhZGRpbmdMZWZ0KSAvICh3aWR0aCkgKiBjYW52YXMud2lkdGggLyBjaGFydC5jdXJyZW50RGV2aWNlUGl4ZWxSYXRpbylcbiAgICBtb3VzZVkgPSBNYXRoLnJvdW5kKChtb3VzZVkgLSBib3VuZGluZ1JlY3QudG9wIC0gcGFkZGluZ1RvcCkgLyAoaGVpZ2h0KSAqIGNhbnZhcy5oZWlnaHQgLyBjaGFydC5jdXJyZW50RGV2aWNlUGl4ZWxSYXRpbylcblxuICAgIHJldHVybiB7XG4gICAgICB4OiBtb3VzZVgsXG4gICAgICB5OiBtb3VzZVlcbiAgICB9XG4gIH1cbiAgaGVscGVycy5hZGRFdmVudCA9IGZ1bmN0aW9uIChub2RlLCBldmVudFR5cGUsIG1ldGhvZCkge1xuICAgIGlmIChub2RlLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIG1ldGhvZClcbiAgICB9IGVsc2UgaWYgKG5vZGUuYXR0YWNoRXZlbnQpIHtcbiAgICAgIG5vZGUuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgbWV0aG9kKVxuICAgIH0gZWxzZSB7XG4gICAgICBub2RlWydvbicgKyBldmVudFR5cGVdID0gbWV0aG9kXG4gICAgfVxuICB9XG4gIGhlbHBlcnMucmVtb3ZlRXZlbnQgPSBmdW5jdGlvbiAobm9kZSwgZXZlbnRUeXBlLCBoYW5kbGVyKSB7XG4gICAgaWYgKG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgaGFuZGxlciwgZmFsc2UpXG4gICAgfSBlbHNlIGlmIChub2RlLmRldGFjaEV2ZW50KSB7XG4gICAgICBub2RlLmRldGFjaEV2ZW50KCdvbicgKyBldmVudFR5cGUsIGhhbmRsZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGVbJ29uJyArIGV2ZW50VHlwZV0gPSBoZWxwZXJzLm5vb3BcbiAgICB9XG4gIH1cblxuICAvLyBQcml2YXRlIGhlbHBlciBmdW5jdGlvbiB0byBjb252ZXJ0IG1heC13aWR0aC9tYXgtaGVpZ2h0IHZhbHVlcyB0aGF0IG1heSBiZSBwZXJjZW50YWdlcyBpbnRvIGEgbnVtYmVyXG4gIGZ1bmN0aW9uIHBhcnNlTWF4U3R5bGUgKHN0eWxlVmFsdWUsIG5vZGUsIHBhcmVudFByb3BlcnR5KSB7XG4gICAgdmFyIHZhbHVlSW5QaXhlbHNcbiAgICBpZiAodHlwZW9mIChzdHlsZVZhbHVlKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlSW5QaXhlbHMgPSBwYXJzZUludChzdHlsZVZhbHVlLCAxMClcblxuICAgICAgaWYgKHN0eWxlVmFsdWUuaW5kZXhPZignJScpICE9PSAtMSkge1xuICAgICAgICAvLyBwZXJjZW50YWdlICogc2l6ZSBpbiBkaW1lbnNpb25cbiAgICAgICAgdmFsdWVJblBpeGVscyA9IHZhbHVlSW5QaXhlbHMgLyAxMDAgKiBub2RlLnBhcmVudE5vZGVbcGFyZW50UHJvcGVydHldXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlSW5QaXhlbHMgPSBzdHlsZVZhbHVlXG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlSW5QaXhlbHNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIHRoZSBnaXZlbiB2YWx1ZSBjb250YWlucyBhbiBlZmZlY3RpdmUgY29uc3RyYWludC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZ1bmN0aW9uIGlzQ29uc3RyYWluZWRWYWx1ZSAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gJ25vbmUnXG4gIH1cblxuICAvLyBQcml2YXRlIGhlbHBlciB0byBnZXQgYSBjb25zdHJhaW50IGRpbWVuc2lvblxuICAvLyBAcGFyYW0gZG9tTm9kZSA6IHRoZSBub2RlIHRvIGNoZWNrIHRoZSBjb25zdHJhaW50IG9uXG4gIC8vIEBwYXJhbSBtYXhTdHlsZSA6IHRoZSBzdHlsZSB0aGF0IGRlZmluZXMgdGhlIG1heGltdW0gZm9yIHRoZSBkaXJlY3Rpb24gd2UgYXJlIHVzaW5nIChtYXhXaWR0aCAvIG1heEhlaWdodClcbiAgLy8gQHBhcmFtIHBlcmNlbnRhZ2VQcm9wZXJ0eSA6IHByb3BlcnR5IG9mIHBhcmVudCB0byB1c2Ugd2hlbiBjYWxjdWxhdGluZyB3aWR0aCBhcyBhIHBlcmNlbnRhZ2VcbiAgLy8gQHNlZSBodHRwOi8vd3d3Lm5hdGhhbmFlbGpvbmVzLmNvbS9ibG9nLzIwMTMvcmVhZGluZy1tYXgtd2lkdGgtY3Jvc3MtYnJvd3NlclxuICBmdW5jdGlvbiBnZXRDb25zdHJhaW50RGltZW5zaW9uIChkb21Ob2RlLCBtYXhTdHlsZSwgcGVyY2VudGFnZVByb3BlcnR5KSB7XG4gICAgdmFyIHZpZXcgPSBkb2N1bWVudC5kZWZhdWx0Vmlld1xuICAgIHZhciBwYXJlbnROb2RlID0gZG9tTm9kZS5wYXJlbnROb2RlXG4gICAgdmFyIGNvbnN0cmFpbmVkTm9kZSA9IHZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShkb21Ob2RlKVttYXhTdHlsZV1cbiAgICB2YXIgY29uc3RyYWluZWRDb250YWluZXIgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUocGFyZW50Tm9kZSlbbWF4U3R5bGVdXG4gICAgdmFyIGhhc0NOb2RlID0gaXNDb25zdHJhaW5lZFZhbHVlKGNvbnN0cmFpbmVkTm9kZSlcbiAgICB2YXIgaGFzQ0NvbnRhaW5lciA9IGlzQ29uc3RyYWluZWRWYWx1ZShjb25zdHJhaW5lZENvbnRhaW5lcilcbiAgICB2YXIgaW5maW5pdHkgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlcblxuICAgIGlmIChoYXNDTm9kZSB8fCBoYXNDQ29udGFpbmVyKSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4oXG4gICAgICAgIGhhc0NOb2RlID8gcGFyc2VNYXhTdHlsZShjb25zdHJhaW5lZE5vZGUsIGRvbU5vZGUsIHBlcmNlbnRhZ2VQcm9wZXJ0eSkgOiBpbmZpbml0eSxcbiAgICAgICAgaGFzQ0NvbnRhaW5lciA/IHBhcnNlTWF4U3R5bGUoY29uc3RyYWluZWRDb250YWluZXIsIHBhcmVudE5vZGUsIHBlcmNlbnRhZ2VQcm9wZXJ0eSkgOiBpbmZpbml0eSlcbiAgICB9XG5cbiAgICByZXR1cm4gJ25vbmUnXG4gIH1cbiAgLy8gcmV0dXJucyBOdW1iZXIgb3IgdW5kZWZpbmVkIGlmIG5vIGNvbnN0cmFpbnRcbiAgaGVscGVycy5nZXRDb25zdHJhaW50V2lkdGggPSBmdW5jdGlvbiAoZG9tTm9kZSkge1xuICAgIHJldHVybiBnZXRDb25zdHJhaW50RGltZW5zaW9uKGRvbU5vZGUsICdtYXgtd2lkdGgnLCAnY2xpZW50V2lkdGgnKVxuICB9XG4gIC8vIHJldHVybnMgTnVtYmVyIG9yIHVuZGVmaW5lZCBpZiBubyBjb25zdHJhaW50XG4gIGhlbHBlcnMuZ2V0Q29uc3RyYWludEhlaWdodCA9IGZ1bmN0aW9uIChkb21Ob2RlKSB7XG4gICAgcmV0dXJuIGdldENvbnN0cmFpbnREaW1lbnNpb24oZG9tTm9kZSwgJ21heC1oZWlnaHQnLCAnY2xpZW50SGVpZ2h0JylcbiAgfVxuICBoZWxwZXJzLmdldE1heGltdW1XaWR0aCA9IGZ1bmN0aW9uIChkb21Ob2RlKSB7XG4gICAgdmFyIGNvbnRhaW5lciA9IGRvbU5vZGUucGFyZW50Tm9kZVxuICAgIHZhciBwYWRkaW5nTGVmdCA9IHBhcnNlSW50KGhlbHBlcnMuZ2V0U3R5bGUoY29udGFpbmVyLCAncGFkZGluZy1sZWZ0JyksIDEwKVxuICAgIHZhciBwYWRkaW5nUmlnaHQgPSBwYXJzZUludChoZWxwZXJzLmdldFN0eWxlKGNvbnRhaW5lciwgJ3BhZGRpbmctcmlnaHQnKSwgMTApXG4gICAgdmFyIHcgPSBjb250YWluZXIuY2xpZW50V2lkdGggLSBwYWRkaW5nTGVmdCAtIHBhZGRpbmdSaWdodFxuICAgIHZhciBjdyA9IGhlbHBlcnMuZ2V0Q29uc3RyYWludFdpZHRoKGRvbU5vZGUpXG4gICAgcmV0dXJuIGlzTmFOKGN3KSA/IHcgOiBNYXRoLm1pbih3LCBjdylcbiAgfVxuICBoZWxwZXJzLmdldE1heGltdW1IZWlnaHQgPSBmdW5jdGlvbiAoZG9tTm9kZSkge1xuICAgIHZhciBjb250YWluZXIgPSBkb21Ob2RlLnBhcmVudE5vZGVcbiAgICB2YXIgcGFkZGluZ1RvcCA9IHBhcnNlSW50KGhlbHBlcnMuZ2V0U3R5bGUoY29udGFpbmVyLCAncGFkZGluZy10b3AnKSwgMTApXG4gICAgdmFyIHBhZGRpbmdCb3R0b20gPSBwYXJzZUludChoZWxwZXJzLmdldFN0eWxlKGNvbnRhaW5lciwgJ3BhZGRpbmctYm90dG9tJyksIDEwKVxuICAgIHZhciBoID0gY29udGFpbmVyLmNsaWVudEhlaWdodCAtIHBhZGRpbmdUb3AgLSBwYWRkaW5nQm90dG9tXG4gICAgdmFyIGNoID0gaGVscGVycy5nZXRDb25zdHJhaW50SGVpZ2h0KGRvbU5vZGUpXG4gICAgcmV0dXJuIGlzTmFOKGNoKSA/IGggOiBNYXRoLm1pbihoLCBjaClcbiAgfVxuICBoZWxwZXJzLmdldFN0eWxlID0gZnVuY3Rpb24gKGVsLCBwcm9wZXJ0eSkge1xuICAgIHJldHVybiBlbC5jdXJyZW50U3R5bGVcbiAgICAgID8gZWwuY3VycmVudFN0eWxlW3Byb3BlcnR5XVxuICAgICAgOiBkb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGVsLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5KVxuICB9XG4gIGhlbHBlcnMucmV0aW5hU2NhbGUgPSBmdW5jdGlvbiAoY2hhcnQpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHsgcmV0dXJuICd0aGlzIGlzIHNlcnZlcicgfVxuXG4gICAgdmFyIHBpeGVsUmF0aW8gPSBjaGFydC5jdXJyZW50RGV2aWNlUGl4ZWxSYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDFcbiAgICBpZiAocGl4ZWxSYXRpbyA9PT0gMSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIGNhbnZhcyA9IGNoYXJ0LmNhbnZhc1xuICAgIHZhciBoZWlnaHQgPSBjaGFydC5oZWlnaHRcbiAgICB2YXIgd2lkdGggPSBjaGFydC53aWR0aFxuXG4gICAgY2FudmFzLmhlaWdodCA9IGhlaWdodCAqIHBpeGVsUmF0aW9cbiAgICBjYW52YXMud2lkdGggPSB3aWR0aCAqIHBpeGVsUmF0aW9cbiAgICBjaGFydC5jdHguc2NhbGUocGl4ZWxSYXRpbywgcGl4ZWxSYXRpbylcblxuICAgIC8vIElmIG5vIHN0eWxlIGhhcyBiZWVuIHNldCBvbiB0aGUgY2FudmFzLCB0aGUgcmVuZGVyIHNpemUgaXMgdXNlZCBhcyBkaXNwbGF5IHNpemUsXG4gICAgLy8gbWFraW5nIHRoZSBjaGFydCB2aXN1YWxseSBiaWdnZXIsIHNvIGxldCdzIGVuZm9yY2UgaXQgdG8gdGhlIFwiY29ycmVjdFwiIHZhbHVlcy5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2NoYXJ0anMvQ2hhcnQuanMvaXNzdWVzLzM1NzVcbiAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4J1xuICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xuICB9XG4gIC8vIC0tIENhbnZhcyBtZXRob2RzXG4gIGhlbHBlcnMuY2xlYXIgPSBmdW5jdGlvbiAoY2hhcnQpIHtcbiAgICBjaGFydC5jdHguY2xlYXJSZWN0KDAsIDAsIGNoYXJ0LndpZHRoLCBjaGFydC5oZWlnaHQpXG4gIH1cbiAgaGVscGVycy5mb250U3RyaW5nID0gZnVuY3Rpb24gKHBpeGVsU2l6ZSwgZm9udFN0eWxlLCBmb250RmFtaWx5KSB7XG4gICAgcmV0dXJuIGZvbnRTdHlsZSArICcgJyArIHBpeGVsU2l6ZSArICdweCAnICsgZm9udEZhbWlseVxuICB9XG4gIGhlbHBlcnMubG9uZ2VzdFRleHQgPSBmdW5jdGlvbiAoY3R4LCBmb250LCBhcnJheU9mVGhpbmdzLCBjYWNoZSkge1xuICAgIGNhY2hlID0gY2FjaGUgfHwge31cbiAgICB2YXIgZGF0YSA9IGNhY2hlLmRhdGEgPSBjYWNoZS5kYXRhIHx8IHt9XG4gICAgdmFyIGdjID0gY2FjaGUuZ2FyYmFnZUNvbGxlY3QgPSBjYWNoZS5nYXJiYWdlQ29sbGVjdCB8fCBbXVxuXG4gICAgaWYgKGNhY2hlLmZvbnQgIT09IGZvbnQpIHtcbiAgICAgIGRhdGEgPSBjYWNoZS5kYXRhID0ge31cbiAgICAgIGdjID0gY2FjaGUuZ2FyYmFnZUNvbGxlY3QgPSBbXVxuICAgICAgY2FjaGUuZm9udCA9IGZvbnRcbiAgICB9XG5cbiAgICBjdHguZm9udCA9IGZvbnRcbiAgICB2YXIgbG9uZ2VzdCA9IDBcbiAgICBoZWxwZXJzLmVhY2goYXJyYXlPZlRoaW5ncywgZnVuY3Rpb24gKHRoaW5nKSB7XG4gICAgICAvLyBVbmRlZmluZWQgc3RyaW5ncyBhbmQgYXJyYXlzIHNob3VsZCBub3QgYmUgbWVhc3VyZWRcbiAgICAgIGlmICh0aGluZyAhPT0gdW5kZWZpbmVkICYmIHRoaW5nICE9PSBudWxsICYmIGhlbHBlcnMuaXNBcnJheSh0aGluZykgIT09IHRydWUpIHtcbiAgICAgICAgbG9uZ2VzdCA9IGhlbHBlcnMubWVhc3VyZVRleHQoY3R4LCBkYXRhLCBnYywgbG9uZ2VzdCwgdGhpbmcpXG4gICAgICB9IGVsc2UgaWYgKGhlbHBlcnMuaXNBcnJheSh0aGluZykpIHtcbiAgICAgICAgLy8gaWYgaXQgaXMgYW4gYXJyYXkgbGV0cyBtZWFzdXJlIGVhY2ggZWxlbWVudFxuICAgICAgICAvLyB0byBkbyBtYXliZSBzaW1wbGlmeSB0aGlzIGZ1bmN0aW9uIGEgYml0IHNvIHdlIGNhbiBkbyB0aGlzIG1vcmUgcmVjdXJzaXZlbHk/XG4gICAgICAgIGhlbHBlcnMuZWFjaCh0aGluZywgZnVuY3Rpb24gKG5lc3RlZFRoaW5nKSB7XG4gICAgICAgICAgLy8gVW5kZWZpbmVkIHN0cmluZ3MgYW5kIGFycmF5cyBzaG91bGQgbm90IGJlIG1lYXN1cmVkXG4gICAgICAgICAgaWYgKG5lc3RlZFRoaW5nICE9PSB1bmRlZmluZWQgJiYgbmVzdGVkVGhpbmcgIT09IG51bGwgJiYgIWhlbHBlcnMuaXNBcnJheShuZXN0ZWRUaGluZykpIHtcbiAgICAgICAgICAgIGxvbmdlc3QgPSBoZWxwZXJzLm1lYXN1cmVUZXh0KGN0eCwgZGF0YSwgZ2MsIGxvbmdlc3QsIG5lc3RlZFRoaW5nKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdmFyIGdjTGVuID0gZ2MubGVuZ3RoIC8gMlxuICAgIGlmIChnY0xlbiA+IGFycmF5T2ZUaGluZ3MubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdjTGVuOyBpKyspIHtcbiAgICAgICAgZGVsZXRlIGRhdGFbZ2NbaV1dXG4gICAgICB9XG4gICAgICBnYy5zcGxpY2UoMCwgZ2NMZW4pXG4gICAgfVxuICAgIHJldHVybiBsb25nZXN0XG4gIH1cbiAgaGVscGVycy5tZWFzdXJlVGV4dCA9IGZ1bmN0aW9uIChjdHgsIGRhdGEsIGdjLCBsb25nZXN0LCBzdHJpbmcpIHtcbiAgICB2YXIgdGV4dFdpZHRoID0gZGF0YVtzdHJpbmddXG4gICAgaWYgKCF0ZXh0V2lkdGgpIHtcbiAgICAgIHRleHRXaWR0aCA9IGRhdGFbc3RyaW5nXSA9IGN0eC5tZWFzdXJlVGV4dChzdHJpbmcpLndpZHRoXG4gICAgICBnYy5wdXNoKHN0cmluZylcbiAgICB9XG4gICAgaWYgKHRleHRXaWR0aCA+IGxvbmdlc3QpIHtcbiAgICAgIGxvbmdlc3QgPSB0ZXh0V2lkdGhcbiAgICB9XG4gICAgcmV0dXJuIGxvbmdlc3RcbiAgfVxuICBoZWxwZXJzLm51bWJlck9mTGFiZWxMaW5lcyA9IGZ1bmN0aW9uIChhcnJheU9mVGhpbmdzKSB7XG4gICAgdmFyIG51bWJlck9mTGluZXMgPSAxXG4gICAgaGVscGVycy5lYWNoKGFycmF5T2ZUaGluZ3MsIGZ1bmN0aW9uICh0aGluZykge1xuICAgICAgaWYgKGhlbHBlcnMuaXNBcnJheSh0aGluZykpIHtcbiAgICAgICAgaWYgKHRoaW5nLmxlbmd0aCA+IG51bWJlck9mTGluZXMpIHtcbiAgICAgICAgICBudW1iZXJPZkxpbmVzID0gdGhpbmcubGVuZ3RoXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBudW1iZXJPZkxpbmVzXG4gIH1cbiAgaGVscGVycy5kcmF3Um91bmRlZFJlY3RhbmdsZSA9IGZ1bmN0aW9uIChjdHgsIHgsIHksIHdpZHRoLCBoZWlnaHQsIHJhZGl1cykge1xuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5tb3ZlVG8oeCArIHJhZGl1cywgeSlcbiAgICBjdHgubGluZVRvKHggKyB3aWR0aCAtIHJhZGl1cywgeSlcbiAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4ICsgd2lkdGgsIHksIHggKyB3aWR0aCwgeSArIHJhZGl1cylcbiAgICBjdHgubGluZVRvKHggKyB3aWR0aCwgeSArIGhlaWdodCAtIHJhZGl1cylcbiAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4ICsgd2lkdGgsIHkgKyBoZWlnaHQsIHggKyB3aWR0aCAtIHJhZGl1cywgeSArIGhlaWdodClcbiAgICBjdHgubGluZVRvKHggKyByYWRpdXMsIHkgKyBoZWlnaHQpXG4gICAgY3R4LnF1YWRyYXRpY0N1cnZlVG8oeCwgeSArIGhlaWdodCwgeCwgeSArIGhlaWdodCAtIHJhZGl1cylcbiAgICBjdHgubGluZVRvKHgsIHkgKyByYWRpdXMpXG4gICAgY3R4LnF1YWRyYXRpY0N1cnZlVG8oeCwgeSwgeCArIHJhZGl1cywgeSlcbiAgICBjdHguY2xvc2VQYXRoKClcbiAgfVxuICBoZWxwZXJzLmNvbG9yID0gZnVuY3Rpb24gKGMpIHtcbiAgICBpZiAoIWNvbG9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdDb2xvci5qcyBub3QgZm91bmQhJylcbiAgICAgIHJldHVybiBjXG4gICAgfVxuXG4gICAgLyogZ2xvYmFsIENhbnZhc0dyYWRpZW50ICovXG4gICAgaWYgKGMgaW5zdGFuY2VvZiBDYW52YXNHcmFkaWVudCkge1xuICAgICAgcmV0dXJuIGNvbG9yKENoYXJ0LmRlZmF1bHRzLmdsb2JhbC5kZWZhdWx0Q29sb3IpXG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbG9yKGMpXG4gIH1cbiAgaGVscGVycy5pc0FycmF5ID0gQXJyYXkuaXNBcnJheVxuICAgID8gZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkob2JqKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICAgIH1cbiAgLy8gISBAc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE0ODUzOTc0XG4gIGhlbHBlcnMuYXJyYXlFcXVhbHMgPSBmdW5jdGlvbiAoYTAsIGExKSB7XG4gICAgdmFyIGksIGlsZW4sIHYwLCB2MVxuXG4gICAgaWYgKCFhMCB8fCAhYTEgfHwgYTAubGVuZ3RoICE9PSBhMS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGZvciAoaSA9IDAsIGlsZW4gPSBhMC5sZW5ndGg7IGkgPCBpbGVuOyArK2kpIHtcbiAgICAgIHYwID0gYTBbaV1cbiAgICAgIHYxID0gYTFbaV1cblxuICAgICAgaWYgKHYwIGluc3RhbmNlb2YgQXJyYXkgJiYgdjEgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBpZiAoIWhlbHBlcnMuYXJyYXlFcXVhbHModjAsIHYxKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHYwICE9PSB2MSkge1xuICAgICAgICAvLyBOT1RFOiB0d28gZGlmZmVyZW50IG9iamVjdCBpbnN0YW5jZXMgd2lsbCBuZXZlciBiZSBlcXVhbDoge3g6MjB9ICE9IHt4OjIwfVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIGhlbHBlcnMuY2FsbENhbGxiYWNrID0gZnVuY3Rpb24gKGZuLCBhcmdzLCBfdEFyZykge1xuICAgIGlmIChmbiAmJiB0eXBlb2YgZm4uY2FsbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZm4uYXBwbHkoX3RBcmcsIGFyZ3MpXG4gICAgfVxuICB9XG4gIGhlbHBlcnMuZ2V0SG92ZXJDb2xvciA9IGZ1bmN0aW9uIChjb2xvclZhbHVlKSB7XG4gICAgLyogZ2xvYmFsIENhbnZhc1BhdHRlcm4gKi9cbiAgICByZXR1cm4gKGNvbG9yVmFsdWUgaW5zdGFuY2VvZiBDYW52YXNQYXR0ZXJuKVxuICAgICAgPyBjb2xvclZhbHVlXG4gICAgICA6IGhlbHBlcnMuY29sb3IoY29sb3JWYWx1ZSkuc2F0dXJhdGUoMC41KS5kYXJrZW4oMC4xKS5yZ2JTdHJpbmcoKVxuICB9XG59XG4iLCJ3aW5kb3cuTmFwY2hhcnQgPSB7fVxyXG5cclxuLyogaGVscGVyIGZ1bmN0aW9ucyAqL1xyXG5yZXF1aXJlKCcuL2hlbHBlcnMnKShOYXBjaGFydClcclxucmVxdWlyZSgnLi9kcmF3L2NhbnZhc0hlbHBlcnMnKShOYXBjaGFydClcclxuXHJcbi8qIGNvbmZpZyBmaWxlcyAqL1xyXG5yZXF1aXJlKCcuL2NvbmZpZycpKE5hcGNoYXJ0KVxyXG5cclxuLyogcmVhbCBzaGl0ICovXHJcbnJlcXVpcmUoJy4vY29yZScpKE5hcGNoYXJ0KVxyXG5cclxuLyogZHJhd2luZyAqL1xyXG5yZXF1aXJlKCcuL3NoYXBlL3NoYXBlJykoTmFwY2hhcnQpXHJcbnJlcXVpcmUoJy4vZHJhdy9kcmF3JykoTmFwY2hhcnQpXHJcbnJlcXVpcmUoJy4vaW50ZXJhY3RDYW52YXMvaW50ZXJhY3RDYW52YXMnKShOYXBjaGFydClcclxuXHJcbi8qIG90aGVyIG1vZHVsZXMgKi9cclxucmVxdWlyZSgnLi9mYW5jeW1vZHVsZScpKE5hcGNoYXJ0KVxyXG4vLyByZXF1aXJlKCcuL2FuaW1hdGlvbicpKE5hcGNoYXJ0KVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuTmFwY2hhcnQiLCIvKlxyXG4qICBpbnRlcmFjdENhbnZhc1xyXG4qXHJcbiogIFRoaXMgbW9kdWxlIGFkZHMgc3VwcG9ydCBmb3IgbW9kaWZ5aW5nIGEgc2NoZWR1bGVcclxuKiAgZGlyZWN0bHkgb24gdGhlIGNhbnZhcyB3aXRoIG1vdXNlIG9yIHRvdWNoXHJcbiovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG5cclxuICBOYXBjaGFydC5vbignaW5pdGlhbGl6ZScsIGZ1bmN0aW9uIChjaGFydCkge1xyXG4gICAgaWYoIWNoYXJ0LmNvbmZpZy5pbnRlcmFjdGlvbikgcmV0dXJuXHJcblxyXG4gICAgdmFyIGNhbnZhcyA9IGNoYXJ0LmNhbnZhc1xyXG5cclxuICAgIC8vIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBob3ZlcilcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGRvd24oZSwgY2hhcnQpXHJcbiAgICB9KVxyXG4gICAgLy8gY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBkb3duKVxyXG4gICAgLy8gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHVwKVxyXG4gICAgLy8gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB1cClcclxuICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JyxkZXNlbGVjdClcclxuICB9KVxyXG5cclxuICB2YXIgbW91c2VIb3ZlciA9IHt9LFxyXG4gICAgYWN0aXZlRWxlbWVudHMgPSBbXSxcclxuICAgIGhvdmVyRGlzdGFuY2UgPSA2LFxyXG4gICAgc2VsZWN0ZWRPcGFjaXR5ID0gMVxyXG5cclxuICBmdW5jdGlvbiBkb3duIChlLCBjaGFydCkge1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG5cclxuICAgIHZhciBjYW52YXMgPSBlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnRcclxuICAgIHZhciBjb29yZGluYXRlcyA9IGdldENvb3JkaW5hdGVzKGUsIGNoYXJ0KVxyXG4gICAgdmFyIGhpdCA9IHt9XHJcblxyXG4gICAgaGl0ID0gaGl0RGV0ZWN0KGNoYXJ0LCBjb29yZGluYXRlcylcclxuXHJcbiAgICBjb25zb2xlLmxvZygnaGl0JywgaGl0KVxyXG5cclxuICAgIC8vIHJldHVybiBvZiBubyBoaXRcclxuICAgIGlmIChPYmplY3Qua2V5cyhoaXQpLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIGRlc2VsZWN0KClcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgcmV0dXJuIFxyXG5cclxuICAgIC8vIHNldCBpZGVudGlmaWVyXHJcbiAgICBpZiAodHlwZW9mIGUuY2hhbmdlZFRvdWNoZXMgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgaGl0LmlkZW50aWZpZXIgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmlkZW50aWZpZXJcclxuICAgIH1lbHNlIHtcclxuICAgICAgaGl0LmlkZW50aWZpZXIgPSAnbW91c2UnXHJcbiAgICB9XHJcblxyXG4gICAgaGl0LmNhbnZhcyA9IGNhbnZhc1xyXG5cclxuICAgIC8vIGRlc2VsZWN0IG90aGVyIGVsZW1lbnRzIGlmIHRoZXkgYXJlIG5vdCBiZWluZyB0b3VjaGVkXHJcbiAgICBpZiAoYWN0aXZlRWxlbWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGRlc2VsZWN0KClcclxuICAgIH1cclxuXHJcbiAgICBhY3RpdmVFbGVtZW50cy5wdXNoKGhpdClcclxuXHJcbiAgICBpZiAodHlwZW9mIGUuY2hhbmdlZFRvdWNoZXMgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZHJhZylcclxuICAgIH1lbHNlIHtcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZHJhZylcclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3QoaGl0Lm5hbWUsIGhpdC5jb3VudClcclxuXHJcbiAgICBkcmFnKGUpIC8vIHRvICBtYWtlIHN1cmUgdGhlIGhhbmRsZXMgcG9zaXRpb25zIHRvIHRoZSBjdXJzb3IgZXZlbiBiZWZvcmUgbW92ZW1lbnRcclxuXHJcbiAgICBoZWxwZXJzLnJlcXVlc3RBbmltRnJhbWUuY2FsbCh3aW5kb3csIGRyYXcuZHJhd1VwZGF0ZSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldENvb3JkaW5hdGVzIChlLCBjaGFydCkge1xyXG4gICAgdmFyIG1vdXNlWCxtb3VzZVlcclxuICAgIHZhciBjYW52YXMgPSBjaGFydC5jYW52YXNcclxuICAgIC8vIG9yaWdvIGlzICgwLDApXHJcbiAgICB2YXIgYm91bmRpbmdSZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcblxyXG4gICAgdmFyIHdpZHRoID0gY2FudmFzLndpZHRoXHJcbiAgICB2YXIgaGVpZ2h0ID0gY2FudmFzLmhlaWdodFxyXG5cclxuICAgIGlmIChlLmNoYW5nZWRUb3VjaGVzKSB7XHJcbiAgICAgIG1vdXNlWCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0XHJcbiAgICAgIG1vdXNlWSA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3BcclxuICAgIH1lbHNlIHtcclxuICAgICAgbW91c2VYID0gZS5jbGllbnRYIC0gYm91bmRpbmdSZWN0LmxlZnRcclxuICAgICAgbW91c2VZID0gZS5jbGllbnRZIC0gYm91bmRpbmdSZWN0LnRvcFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IG1vdXNlWCAtIHdpZHRoIC8gMixcclxuICAgICAgeTogbW91c2VZIC0gaGVpZ2h0IC8gMlxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGl0RGV0ZWN0IChjaGFydCwgY29vcmRpbmF0ZXMpIHtcclxuICAgIHZhciBjYW52YXMgPSBjaGFydC5jYW52YXNcclxuICAgIHZhciBkYXRhID0gY2hhcnQuZGF0YVxyXG4gICAgdmFyIGJhckNvbmZpZyA9IGNoYXJ0LmNvbmZpZy5iYXJzXHJcblxyXG4gICAgLy8gd2lsbCByZXR1cm46XHJcbiAgICAvLyBuYW1lIChjb3JlLCBuYXAsIGJ1c3kpXHJcbiAgICAvLyBjb3VudCAoMCwgMSwgMiAuLilcclxuICAgIC8vIHR5cGUgKHN0YXJ0LCBlbmQsIG9yIG1pZGRsZSlcclxuXHJcbiAgICB2YXIgaGl0ID0ge31cclxuICAgIHZhciB2YWx1ZSwgcG9pbnQsIGksIGRpc3RhbmNlXHJcblxyXG4gICAgLy8gaGl0IGRldGVjdGlvbiBvZiBoYW5kbGVzICh3aWxsIG92ZXJ3cml0ZSBjdXJyZW50IG1vdXNlSG92ZXIgb2JqZWN0XHJcbiAgICAvLyBmcm9tIGRyYXcgaWYgaG92ZXJpbmcgYSBoYW5kbGUpOlxyXG4gICAgLy8gZm9yICh2YXIgbmFtZSBpbiBkYXRhKSB7XHJcbiAgICAvLyAgIGlmICh0eXBlb2YgYmFyQ29uZmlnW25hbWVdLnJhbmdlSGFuZGxlcyA9PSAndW5kZWZpbmVkJyB8fCAhYmFyQ29uZmlnW25hbWVdLnJhbmdlSGFuZGxlcylcclxuICAgIC8vICAgICBjb250aW51ZVxyXG5cclxuICAgIC8vICAgZm9yIChpID0gMDsgaSA8IGRhdGFbbmFtZV0ubGVuZ3RoOyBpKyspIHtcclxuXHJcbiAgICAvLyAgICAgLy8gaWYgZWxlbWVudCBpcyBub3Qgc2VsZWN0ZWQsIGNvbnRpbnVlXHJcbiAgICAvLyAgICAgaWYgKCFjaGFydC5jaGVja0VsZW1lbnRTdGF0ZSgnc2VsZWN0ZWQnLCBuYW1lLCBpKSlcclxuICAgIC8vICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgLy8gICAgIGZvciAocyA9IDA7IHMgPCAyOyBzKyspIHtcclxuICAgIC8vICAgICAgIHZhbHVlID0gZGF0YVtuYW1lXVtpXVtbJ3N0YXJ0JywgJ2VuZCddW3NdXVxyXG4gICAgLy8gICAgICAgcG9pbnQgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKHZhbHVlLCBiYXJDb25maWdbbmFtZV0ub3V0ZXJSYWRpdXMgKiBkcmF3LmRyYXdSYXRpbylcclxuXHJcbiAgICAvLyAgICAgICBkaXN0YW5jZSA9IGhlbHBlcnMuZGlzdGFuY2UocG9pbnQueCwgcG9pbnQueSwgY29vcmRpbmF0ZXMueCwgY29vcmRpbmF0ZXMueSlcclxuICAgIC8vICAgICAgIGlmIChkaXN0YW5jZSA8IGhvdmVyRGlzdGFuY2UgKiBkcmF3LmRyYXdSYXRpbykge1xyXG4gICAgLy8gICAgICAgICBpZiAodHlwZW9mIGhpdC5kaXN0YW5jZSA9PSAndW5kZWZpbmVkJyB8fCBkaXN0YW5jZSA8IGhpdC5kaXN0YW5jZSkge1xyXG4gICAgLy8gICAgICAgICAgIC8vIG92ZXJ3cml0ZSBjdXJyZW50IGhpdCBvYmplY3RcclxuICAgIC8vICAgICAgICAgICBoaXQgPSB7XHJcbiAgICAvLyAgICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgLy8gICAgICAgICAgICAgY291bnQ6IGksXHJcbiAgICAvLyAgICAgICAgICAgICB0eXBlOiBbJ3N0YXJ0JywgJ2VuZCddW3NdLFxyXG4gICAgLy8gICAgICAgICAgICAgZGlzdGFuY2U6IGRpc3RhbmNlXHJcbiAgICAvLyAgICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgICB9XHJcbiAgICAvLyAgICAgICB9XHJcbiAgICAvLyAgICAgfVxyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9XHJcblxyXG4gICAgLy8gaWYgbm8gaGFuZGxlIGlzIGhpdCwgY2hlY2sgZm9yIG1pZGRsZSBoaXRcclxuXHJcbiAgICBpZiAoT2JqZWN0LmtleXMoaGl0KS5sZW5ndGggPT0gMCkge1xyXG4gICAgICB2YXIgbWludXRlcywgZGlzdGFuY2VUb0NlbnRlclxyXG4gICAgICB2YXIgc3RhcnQsIGVuZFxyXG4gICAgICB2YXIgb3V0ZXJSYWRpdXMsIGlubmVyUmFkaXVzXHJcblxyXG4gICAgICB2YXIgcG9zaXRpb25JbkVsZW1lbnRcclxuXHJcbiAgICAgIG1pbnV0ZXMgPSBoZWxwZXJzLlhZdG9NaW51dGVzKGNoYXJ0LCBjb29yZGluYXRlcy54LCBjb29yZGluYXRlcy55KVxyXG4gICAgICBjb25zb2xlLmxvZyhtaW51dGVzKVxyXG4gICAgICBkaXN0YW5jZVRvQ2VudGVyID0gaGVscGVycy5kaXN0YW5jZShjb29yZGluYXRlcy54LCBjb29yZGluYXRlcy55LCAwLCAwKVxyXG5cclxuICAgICAgLy8gbG9vcCB0aHJvdWdoIGVsZW1lbnRzXHJcbiAgICAgIGRhdGEuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpbmRleCkge1xyXG4gICAgICAgIC8vIGNoZWNrIGlmIHBvaW50IGlzIGluc2lkZSBlbGVtZW50IGhvcml6b250YWxseVxyXG4gICAgICAgIHN0YXJ0ID0gZWxlbWVudC5zdGFydFxyXG4gICAgICAgIGVuZCA9IGVsZW1lbnQuZW5kXHJcblxyXG4gICAgICAgIGlmIChoZWxwZXJzLmlzSW5zaWRlKG1pbnV0ZXMsIHN0YXJ0LCBlbmQpKSB7XHJcblxyXG4gICAgICAgICAgLy8gY2hlY2sgaWYgcG9pbnQgaXMgaW5zaWRlIGVsZW1lbnQgdmVydGljYWxseVxyXG4gICAgICAgICAgaW5uZXJSYWRpdXMgPSBlbGVtZW50LnR5cGUubGFuZS5zdGFydFxyXG4gICAgICAgICAgb3V0ZXJSYWRpdXMgPSBlbGVtZW50LnR5cGUubGFuZS5lbmRcclxuICAgICAgICAgIGlmIChkaXN0YW5jZVRvQ2VudGVyID4gaW5uZXJSYWRpdXMgJiYgZGlzdGFuY2VUb0NlbnRlciA8IG91dGVyUmFkaXVzKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uSW5FbGVtZW50ID0gbWludXRlcy1zdGFydFxyXG4gICAgICAgICAgICBoaXQgPSB7XHJcbiAgICAgICAgICAgICAgY291bnQ6IGksXHJcbiAgICAgICAgICAgICAgdHlwZTogJ3dob2xlJyxcclxuICAgICAgICAgICAgICBwb3NpdGlvbkluRWxlbWVudDogcG9zaXRpb25JbkVsZW1lbnRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICAgXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGhpdFxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaG92ZXIgKGUpIHtcclxuICAgIHZhciBjYW52YXMgPSBuYXBjaGFydENvcmUuZ2V0Q2FudmFzKCksXHJcbiAgICAgIGNvb3JkaW5hdGVzID0gZ2V0Q29vcmRpbmF0ZXMoZSwgY2FudmFzKSxcclxuICAgICAgZGF0YSA9IG5hcGNoYXJ0Q29yZS5nZXRTY2hlZHVsZSgpLFxyXG4gICAgICBiYXJDb25maWcgPSBkcmF3LmdldEJhckNvbmZpZygpXHJcblxyXG4gICAgaGVscGVycy5yZXF1ZXN0QW5pbUZyYW1lLmNhbGwod2luZG93LCBkcmF3LmRyYXdVcGRhdGUpXHJcblxyXG4gICAgdmFyIGhpdCA9IGhpdERldGVjdChjb29yZGluYXRlcylcclxuXHJcbiAgICBtb3VzZUhvdmVyID0gaGl0XHJcbiAgfVxyXG5cclxuXHJcbiAgZnVuY3Rpb24gZHJhZyAoZSkge1xyXG4gICAgdmFyIGlkZW50aWZpZXJcclxuICAgIGlkZW50aWZpZXIgPSBmaW5kSWRlbnRpZmllcihlKVxyXG5cclxuICAgIHZhciBkcmFnRWxlbWVudCwgbmFtZSwgY291bnQsIGVsZW1lbnQsIGNvb3JkaW5hdGVzLCBtaW51dGVzXHJcblxyXG4gICAgLy8gbmV3VmFsdWVzIGlzIGFuIG9iamVjdCB0aGF0IHdpbGwgcmVwbGFjZSB0aGUgZXhpc3Rpbmcgb25lIHdpdGggbmV3IHZhbHVlc1xyXG4gICAgdmFyIG5ld1ZhbHVlcyA9IHt9LCBwb3NpdGlvbkluRWxlbWVudCwgZHVyYXRpb24sIHN0YXJ0LCBlbmRcclxuXHJcbiAgICBkcmFnRWxlbWVudCA9IGdldEFjdGl2ZUVsZW1lbnQoaWRlbnRpZmllcilcclxuXHJcbiAgICBpZiAoIWRyYWdFbGVtZW50KSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIC8vIGV4cG9zZSBtaW51dGVzIHZhcmlhYmxlIHRvIGdldE1vdmVWYWx1ZXMoKSBmdW5jdGlvblxyXG4gICAgY29vcmRpbmF0ZXMgPSBnZXRDb29yZGluYXRlcyhlLCBkcmFnRWxlbWVudC5jYW52YXMpXHJcbiAgICBtaW51dGVzID0gaGVscGVycy5YWXRvTWludXRlcyhjaGFydCwgY29vcmRpbmF0ZXMueCwgY29vcmRpbmF0ZXMueSlcclxuXHJcbiAgICBpZiAodHlwZW9mIGRyYWdFbGVtZW50LmVsZW1lbnRzICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIC8vIG1hbnkgZWxlbWVudHMgbGlua2VkXHJcblxyXG4gICAgICB2YXIgbmV3RWxlbWVudHMgPSBbXVxyXG4gICAgICB2YXIgbWFzdGVyID0ge31cclxuICAgICAgZHJhZ0VsZW1lbnQuZWxlbWVudHMuc29tZShmdW5jdGlvbiAoZWxlbWVudCkge1xyXG4gICAgICAgIGdldE1vdmVWYWx1ZXMoZWxlbWVudCwgZnVuY3Rpb24gKG5hbWUsIGNvdW50LCBuZXdWYWx1ZXMpIHtcclxuICAgICAgICAgIC8vIGFsbCB0aGlzIGZ1enogYmVjYXVzZSB3ZSBuZWVkIHRvIG1ha2UgdGhlIGRyYWdnaW5nIHNuYXBwYWJsZVxyXG4gICAgICAgICAgLy8gYW5kIHRoZSBzbmFwcGluZyBzaG91bGQgb25seSBsaXN0ZW4gdG8gdGhlIGVsZW1lbnQgeW91IGFyZSBjbGlja2luZyBvblxyXG4gICAgICAgICAgLy8gYW5kIGFsbCBvdGhlciBoYXZlIHRvIGZvbGxvd1xyXG5cclxuICAgICAgICAgIGlmIChuYW1lID09IGRyYWdFbGVtZW50Lm1hc3Rlci5uYW1lICYmIGNvdW50ID09IGRyYWdFbGVtZW50Lm1hc3Rlci5jb3VudCkge1xyXG4gICAgICAgICAgICBtYXN0ZXIgPSBuZXdWYWx1ZXNcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG5ld0VsZW1lbnRzLnB1c2goe1xyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICBjb3VudDogY291bnQsXHJcbiAgICAgICAgICAgIHZhbHVlczogbmV3VmFsdWVzXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICAvLyBydW4gdGhyb3VnaCBuZXdFbGVtZW50cyBhcnJheSBhbmQgc25hcCB2YWx1ZXNcclxuXHJcbiAgICAgIHZhciBtYXN0ZXJTdGFydCA9IG1hc3Rlci5zdGFydFxyXG4gICAgICAvLyBmaW5kIG91dCBob3cgbXVjaCB0aGUgc25hcCBmdW5jdGlvbiBkaWRcclxuICAgICAgdmFyIHNoaWZ0ID0gc25hcChtYXN0ZXJTdGFydCkgLSBtYXN0ZXJTdGFydFxyXG5cclxuICAgICAgLy8gZG8gdGhlIHNhbWUgaW1wYWN0IHRvIHRoZSBvdGhlciBlbGVtZW50c1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG5ld0VsZW1lbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbmV3RWxlbWVudHNbaV0udmFsdWVzLnN0YXJ0ID0gaGVscGVycy5jYWxjKG5ld0VsZW1lbnRzW2ldLnZhbHVlcy5zdGFydCwgc2hpZnQpXHJcbiAgICAgICAgbmV3RWxlbWVudHNbaV0udmFsdWVzLmVuZCA9IGhlbHBlcnMuY2FsYyhuZXdFbGVtZW50c1tpXS52YWx1ZXMuZW5kLCBzaGlmdClcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gbW9kaWZ5IChuZXdWYWx1ZUVsZW1lbnQpIHtcclxuICAgICAgICBuYXBjaGFydENvcmUubW9kaWZ5RWxlbWVudChuZXdWYWx1ZUVsZW1lbnQubmFtZSwgbmV3VmFsdWVFbGVtZW50LmNvdW50LCBuZXdWYWx1ZUVsZW1lbnQudmFsdWVzKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBzZW5kIGFsbCB0aGUgc2hpbnkgbmV3IGVsZW1lbnRzIHRvIHRoZSBjb3JlIGZvciBtb2RpZmljYXRpb24gOi0pXHJcbiAgICAgIG5ld0VsZW1lbnRzLmZvckVhY2gobW9kaWZ5KVxyXG4gICAgfWVsc2Uge1xyXG4gICAgICB2YXIgc25hcEFsbCA9IHRydWVcclxuICAgICAgZ2V0TW92ZVZhbHVlcyhkcmFnRWxlbWVudCwgZnVuY3Rpb24gKG5hbWUsIGNvdW50LCBuZXdWYWx1ZXMpIHtcclxuICAgICAgICBuYXBjaGFydENvcmUubW9kaWZ5RWxlbWVudChuYW1lLCBjb3VudCwgbmV3VmFsdWVzKVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldE1vdmVWYWx1ZXMgKGRyYWdFbGVtZW50LCBjYWxsYmFjaykge1xyXG4gICAgICBuYW1lID0gZHJhZ0VsZW1lbnQubmFtZVxyXG4gICAgICBjb3VudCA9IGRyYWdFbGVtZW50LmNvdW50XHJcbiAgICAgIGVsZW1lbnQgPSBuYXBjaGFydENvcmUucmV0dXJuRWxlbWVudChuYW1lLCBjb3VudClcclxuXHJcbiAgICAgIGlmIChkcmFnRWxlbWVudC50eXBlID09ICdzdGFydCcpIHtcclxuICAgICAgICBzdGFydCA9IHNuYXAobWludXRlcylcclxuICAgICAgICBuZXdWYWx1ZXMgPSB7c3RhcnQ6IHN0YXJ0fVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGRyYWdFbGVtZW50LnR5cGUgPT0gJ2VuZCcpIHtcclxuICAgICAgICBlbmQgPSBzbmFwKG1pbnV0ZXMpXHJcbiAgICAgICAgbmV3VmFsdWVzID0ge2VuZDogZW5kfVxyXG4gICAgICB9XHJcbiAgICAgIGVsc2UgaWYgKGRyYWdFbGVtZW50LnR5cGUgPT0gJ3dob2xlJykge1xyXG4gICAgICAgIHBvc2l0aW9uSW5FbGVtZW50ID0gZHJhZ0VsZW1lbnQucG9zaXRpb25JbkVsZW1lbnRcclxuICAgICAgICBkdXJhdGlvbiA9IGhlbHBlcnMucmFuZ2UoZWxlbWVudC5zdGFydCwgZWxlbWVudC5lbmQpXHJcbiAgICAgICAgc3RhcnQgPSBoZWxwZXJzLmNhbGMobWludXRlcywgLXBvc2l0aW9uSW5FbGVtZW50KVxyXG4gICAgICAgIGlmICh0eXBlb2Ygc25hcEFsbCAhPSAndW5kZWZpbmVkJylcclxuICAgICAgICAgIHN0YXJ0ID0gc25hcChzdGFydClcclxuICAgICAgICBlbmQgPSBoZWxwZXJzLmNhbGMoc3RhcnQsIGR1cmF0aW9uKVxyXG4gICAgICAgIG5ld1ZhbHVlcyA9IHtzdGFydDogc3RhcnQsZW5kOiBlbmR9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNhbGxiYWNrKG5hbWUsIGNvdW50LCBuZXdWYWx1ZXMpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB1bmZvY3VzIChlKSB7XHJcbiAgICAvLyBjaGVja3MgaWYgY2xpY2sgaXMgb24gYSBwYXJ0IG9mIHRoZSBzaXRlIHRoYXQgc2hvdWxkIG1ha2UgdGhlXHJcbiAgICAvLyBjdXJyZW50IHNlbGVjdGVkIGVsZW1lbnRzIGJlIGRlc2VsZWN0ZWRcclxuXHJcbiAgICB2YXIgeCwgeVxyXG4gICAgdmFyIGRvbUVsZW1lbnRcclxuXHJcbiAgICB4ID0gZS5jbGllbnRYXHJcbiAgICB5ID0gZS5jbGllbnRZXHJcblxyXG4gICAgdmFyIGRvbUVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZWxlY3QgKG5hbWUsIGNvdW50KSB7XHJcbiAgICBpZiAoc2V0dGluZ3MuZ2V0VmFsdWUoJ21vdmVTaW0nKSAmJiBuYW1lICE9ICdidXN5Jykge1xyXG4gICAgICAvLyBzZWxlY3QgYWxsXHJcbiAgICAgIHZhciBkYXRhID0gbmFwY2hhcnRDb3JlLmdldFNjaGVkdWxlKClcclxuXHJcbiAgICAgIGZvciAodmFyIG5hbWUgaW4gZGF0YSkge1xyXG4gICAgICAgIGlmIChuYW1lID09ICdidXN5JylcclxuICAgICAgICAgIGNvbnRpbnVlXHJcblxyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YVtuYW1lXS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgbmFwY2hhcnRDb3JlLnNldFNlbGVjdGVkKG5hbWUsIGkpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAvLyBub3RpZnkgY29yZSBtb2R1bGU6XHJcbiAgICBuYXBjaGFydENvcmUuc2V0U2VsZWN0ZWQobmFtZSwgY291bnQpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkZXNlbGVjdCAobmFtZSwgY291bnQpIHtcclxuICAgIC8vIGlmICh0eXBlb2YgbmFtZSA9PSAndW5kZWZpbmVkJykge1xyXG4gICAgLy8gICAvLyBkZXNlbGVjdCBhbGxcclxuICAgIC8vICAgbmFwY2hhcnRDb3JlLmRlc2VsZWN0KClcclxuICAgIC8vICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZHJhZylcclxuICAgIC8vICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZHJhZylcclxuICAgIC8vIH1cclxuICAgIC8vIC8vIGRlc2VsZWN0IG9uZVxyXG4gICAgLy8gbmFwY2hhcnRDb3JlLmRlc2VsZWN0KG5hbWUsIGNvdW50KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmluZElkZW50aWZpZXIgKGUpIHtcclxuICAgIGlmIChlLnR5cGUuc2VhcmNoKCdtb3VzZScpID49IDApIHtcclxuICAgICAgcmV0dXJuICdtb3VzZSdcclxuICAgIH1lbHNlIHtcclxuICAgICAgcmV0dXJuIGUuY2hhbmdlZFRvdWNoZXNbMF0uaWRlbnRpZmllclxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0QWN0aXZlRWxlbWVudCAoaWRlbnRpZmllcikge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3RpdmVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoYWN0aXZlRWxlbWVudHNbaV0uaWRlbnRpZmllciA9PSBpZGVudGlmaWVyKSB7XHJcbiAgICAgICAgcmV0dXJuIGFjdGl2ZUVsZW1lbnRzW2ldXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVtb3ZlQWN0aXZlRWxlbWVudCAoaWRlbnRpZmllcikge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3RpdmVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoYWN0aXZlRWxlbWVudHNbaV0uaWRlbnRpZmllciA9PSBpZGVudGlmaWVyKSB7XHJcbiAgICAgICAgYWN0aXZlRWxlbWVudHMuc3BsaWNlKGksIDEpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVwIChlKSB7XHJcbiAgICB2YXIgaWRlbnRpZmllciA9IGZpbmRJZGVudGlmaWVyKGUpXHJcbiAgICB2YXIgZWxlbWVudCA9IGdldEFjdGl2ZUVsZW1lbnQoaWRlbnRpZmllcilcclxuXHJcbiAgICBpZiAoYWN0aXZlRWxlbWVudHMubGVuZ3RoICE9IDApIHtcclxuICAgICAgY2hhcnRIaXN0b3J5LmFkZChuYXBjaGFydENvcmUuZ2V0U2NoZWR1bGUoKSwgJ21vdmVkICcgKyBlbGVtZW50Lm5hbWUgKyAnICcgKyAoZWxlbWVudC5jb3VudCArIDEpKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGZpbmQgdGhlIHNoaXQgdG8gcmVtb3ZlXHJcbiAgICByZW1vdmVBY3RpdmVFbGVtZW50KGlkZW50aWZpZXIpXHJcblxyXG4gICAgaGVscGVycy5yZXF1ZXN0QW5pbUZyYW1lLmNhbGwod2luZG93LCBkcmF3LmRyYXdVcGRhdGUpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzbmFwIChpbnB1dCkge1xyXG4gICAgdmFyIG91dHB1dCA9IGlucHV0XHJcblxyXG4gICAgaWYgKHNldHRpbmdzLmdldFZhbHVlKCdzbmFwMTAnKSkge1xyXG4gICAgICBvdXRwdXQgPSAxMCAqIE1hdGgucm91bmQoaW5wdXQgLyAxMClcclxuICAgIH1lbHNlIGlmIChzZXR0aW5ncy5nZXRWYWx1ZSgnc25hcDUnKSkge1xyXG4gICAgICBvdXRwdXQgPSA1ICogTWF0aC5yb3VuZChpbnB1dCAvIDUpXHJcbiAgICB9ZWxzZSB7XHJcblxyXG4gICAgICAvLyBob3VyXHJcbiAgICAgIGlmIChpbnB1dCAlIDYwIDwgNylcclxuICAgICAgICBvdXRwdXQgPSBpbnB1dCAtIGlucHV0ICUgNjBcclxuICAgICAgZWxzZSBpZiAoaW5wdXQgJSA2MCA+IDUzKVxyXG4gICAgICAgIG91dHB1dCA9IGlucHV0ICsgKDYwIC0gaW5wdXQgJSA2MClcclxuXHJcbiAgICAgIC8vIGhhbGYgaG91cnNcclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgaW5wdXQgKz0gMzBcclxuXHJcbiAgICAgICAgaWYgKGlucHV0ICUgNjAgPCA1KVxyXG4gICAgICAgICAgb3V0cHV0ID0gaW5wdXQgLSBpbnB1dCAlIDYwIC0gMzBcclxuICAgICAgICBlbHNlIGlmIChpbnB1dCAlIDYwID4gNTUpXHJcbiAgICAgICAgICBvdXRwdXQgPSBpbnB1dCArICg2MCAtIGlucHV0ICUgNjApIC0gMzBcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvdXRwdXRcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNoZWNrU3RhdGUgKGVsZW1lbnQsIG5hbWUsIGNvdW50LCB0eXBlKSB7XHJcbiAgICAvLyBjaGVja3MgaWZcclxuICAgIGZ1bmN0aW9uIGNoZWNrIChlbGVtZW50KSB7XHJcbiAgICAgIGlmIChuYW1lID09IGVsZW1lbnQubmFtZSAmJiBjb3VudCA9PSBlbGVtZW50LmNvdW50KSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiB0eXBlID09ICd1bmRlZmluZWQnIHx8IHR5cGUgPT0gZWxlbWVudC50eXBlKSB7XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0eXBlb2YgZWxlbWVudC5lbGVtZW50cyAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICAvLyB0aGVyZSBhcmUgbW9yZSB0aGFuIG9uZSBlbGVtZW50XHJcbiAgICAgIHJldHVybiBlbGVtZW50LmVsZW1lbnRzLnNvbWUoY2hlY2spXHJcbiAgICB9ZWxzZSB7XHJcbiAgICAgIC8vIG9uZSBlbGVtZW50XHJcbiAgICAgIHJldHVybiBjaGVjayhlbGVtZW50KVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCIvKipcclxuICpcclxuICogZnVuY3Rpb24gY2FsY3VsYXRlU2hhcGVcclxuICogXHJcbiAqIFRoaXMgZnVuY3Rpb24gdGFrZXMgYSBub3JtYWwgc2hhcGUgZGVmaW5pdGlvbiBvYmplY3RcclxuICogYW5kIGNhbGN1bGF0ZXMgcG9zaXRpb25zIGFuZCBzaXplc1xyXG4gKlxyXG4gKiBSZXR1cm5zIGEgbW9yZSBkZXRhaWxlZCBzaGFwZSBvYmplY3QgdGhhdCBpcyBsYXRlclxyXG4gKiBhc3NpZ25lZCB0byBjaGFydC5zaGFwZSBhbmQgdXNlZCB3aGVuIGRyYXdpbmdcclxuICpcclxuICovXHJcblxyXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2FsY3VsYXRlU2hhcGUoY2hhcnQsIHNoYXBlKXtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCByYWRpYW5zIG9yIG1pbnV0ZXMgcHJvcGVydGllc1xyXG4gICAgICovXHJcblxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICAgIGVsZW1lbnQubGVuZ3RoID0gZWxlbWVudC52YWx1ZVxyXG4gICAgICAgIGVsZW1lbnQucmFkaWFucyA9IGVsZW1lbnQudmFsdWVcclxuICAgICAgfWVsc2UgaWYoZWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG4gICAgICAgIGVsZW1lbnQubGVuZ3RoID0gZWxlbWVudC52YWx1ZVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZCBvdXQgdG90YWxSYWRpYW5zXHJcbiAgICAgKiBUaGlzIGJlIDIgKiBQSSBpZiB0aGUgc2hhcGUgaXMgY2lyY3VsYXJcclxuICAgICAqL1xyXG5cclxuICAgIHZhciB0b3RhbFJhZGlhbnMgPSAwXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgLy8gaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgdG90YWxSYWRpYW5zICs9IGVsZW1lbnQudmFsdWVcclxuICAgICAgLy8gfVxyXG4gICAgfSlcclxuXHJcblxyXG4gICAgLy8gKlxyXG4gICAgLy8gICogRmluZCB0aGUgc3VtIG9mIG1pbnV0ZXMgaW4gdGhlIGxpbmUgZWxlbWVudHNcclxuICAgIC8vICAqIEFyYyBlbGVtZW50cyBkb2VzIG5vdCBkZWZpbmUgbWludXRlcywgb25seSByYWRpYW5zXHJcbiAgICAgXHJcblxyXG4gICAgLy8gdmFyIHRvdGFsTWludXRlcyA9IDBcclxuICAgIC8vIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgLy8gICBpZihlbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAvLyAgICAgdG90YWxNaW51dGVzICs9IGVsZW1lbnQubWludXRlc1xyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9KVxyXG5cclxuICAgIC8vIGlmKHRvdGFsTWludXRlcyA+IDE0NDApe1xyXG4gICAgLy8gICB0aHJvdyBuZXcgRXJyKCdUb28gbWFueSBtaW51dGVzIGluIGxpbmUgc2VnbWVudHMnKVxyXG4gICAgLy8gfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZCBvdXQgYW5nbGUgb2Ygc2hhcGVzXHJcbiAgICAgKi9cclxuXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgaWYoaSA9PT0gMCkgZWxlbWVudC5zdGFydEFuZ2xlID0gMCBcclxuICAgICAgZWxzZSBlbGVtZW50LnN0YXJ0QW5nbGUgPSBzaGFwZVtpLTFdLmVuZEFuZ2xlXHJcbiAgICAgIFxyXG4gICAgICBpZihlbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuICAgICAgICBlbGVtZW50LmVuZEFuZ2xlID0gZWxlbWVudC5zdGFydEFuZ2xlICsgZWxlbWVudC5yYWRpYW5zXHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICBlbGVtZW50LmVuZEFuZ2xlID0gZWxlbWVudC5zdGFydEFuZ2xlXHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIG91dCBsZW5ndGggb2YgdGhlIHNoYXBlc1xyXG4gICAgICogXHJcbiAgICAgKiBQZXJpbWV0ZXIgb2YgY2lyY2xlID0gMiAqIHJhZGl1cyAqIFBJXHJcbiAgICAgKi9cclxuXHJcbiAgICAvLyB2YXIgbWludXRlTGVuZ3RoUmF0aW8gPSAwLjQ1XHJcbiAgICAvLyB2YXIgZm91bmRBcmMgPSBzaGFwZS5zb21lKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgIC8vICAgaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAvLyAgICAgZWxlbWVudC5sZW5ndGggPSBiYXNlUmFkaXVzICogZWxlbWVudC5yYWRpYW5zXHJcbiAgICAvLyAgICAgaWYoZWxlbWVudC5taW51dGVzICE9IDApXHJcbiAgICAvLyAgICAgbWludXRlTGVuZ3RoUmF0aW8gPSBlbGVtZW50Lmxlbmd0aCAvIGVsZW1lbnQubWludXRlc1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKGVsZW1lbnQubGVuZ3RoLCBlbGVtZW50Lm1pbnV0ZXMpXHJcbiAgICAvLyAgICAgcmV0dXJuIHRydWVcclxuICAgIC8vICAgfVxyXG4gICAgLy8gfSlcclxuXHJcbiAgICB2YXIgdG90YWxMZW5ndGggPSAwXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgZWxlbWVudC5sZW5ndGggPSBlbGVtZW50Lmxlbmd0aCAqIGNoYXJ0LmNvbmZpZy5iYXNlUmFkaXVzXHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICBlbGVtZW50Lmxlbmd0aCA9IGVsZW1lbnQubGVuZ3RoICogY2hhcnQucmF0aW9cclxuICAgICAgfVxyXG4gICAgICB0b3RhbExlbmd0aCArPSBlbGVtZW50Lmxlbmd0aFxyXG4gICAgfSlcclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSBob3cgbWFueSBtaW51dGVzIGVhY2ggYXJjIGVsZW1lbnQgc2hvdWxkIGdldFxyXG4gICAgICogYmFzZWQgb24gaG93IG1hbnkgbWludXRlcyBhcmUgbGVmdCBhZnRlciBsaW5lIGVsZW1lbnRzXHJcbiAgICAgKiBnZXQgd2hhdCB0aGV5IHNob3VsZCBoYXZlXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgbWludXRlc0xlZnRGb3JBcmNzID0gMTQ0MCBcclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICBlbGVtZW50Lm1pbnV0ZXMgPSBNYXRoLmNlaWwoKGVsZW1lbnQubGVuZ3RoIC8gdG90YWxMZW5ndGgpICogMTQ0MClcclxuICAgIH0pXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPaywgc28gdG90YWxNaW51dGVzIGlzIG5vdyAxNDQwXHJcbiAgICAgKiBOb3cgd2UgbmVlZCB0byBjcmVhdGUgYSAuc3RhcnQgYW5kIC5lbmQgcG9pbnQgb24gYWxsXHJcbiAgICAgKiB0aGUgc2hhcGUgZWxlbWVudHNcclxuICAgICAqL1xyXG5cclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaSkge1xyXG4gICAgICBpZihpID09PSAwKSBlbGVtZW50LnN0YXJ0ID0gMFxyXG4gICAgICBlbHNlIGlmKGkgPiAwKSBlbGVtZW50LnN0YXJ0ID0gc2hhcGVbaS0xXS5lbmRcclxuICAgICAgZWxlbWVudC5lbmQgPSBlbGVtZW50LnN0YXJ0ICsgZWxlbWVudC5taW51dGVzXHJcbiAgICB9KVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIHN0YXJ0cG9pbnRzIGFuZCBlbmRwb2ludHNcclxuICAgICAqIEZpcnN0IHBvaW50IGlzIGNlbnRlclxyXG4gICAgICogVGhlIHBvaW50IG9ubHkgY2hhbmdlcyBvbiBsaW5lLXNlZ21lbnRzXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgY2VudGVyID0ge1xyXG4gICAgICB4OmNoYXJ0LncvMixcclxuICAgICAgeTpjaGFydC5oLzJcclxuICAgIH1cclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaSkge1xyXG4gICAgICBpZihpID09PSAwKXtcclxuICAgICAgICBlbGVtZW50LnN0YXJ0cG9pbnQgPSBjZW50ZXJcclxuICAgICAgICBlbGVtZW50LmVuZHBvaW50ID0gY2VudGVyXHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICAgIGVsZW1lbnQuc3RhcnRwb2ludCA9IHNoYXBlW2ktMV0uZW5kcG9pbnRcclxuICAgICAgICBlbGVtZW50LmVuZHBvaW50ID0gc2hhcGVbaS0xXS5lbmRwb2ludFxyXG4gICAgICB9ZWxzZSBpZihlbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAgICAgZWxlbWVudC5zdGFydHBvaW50ID0gc2hhcGVbaS0xXS5lbmRwb2ludFxyXG4gICAgICB9XHJcbiAgICAgIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICBlbGVtZW50LmVuZHBvaW50ID0ge1xyXG4gICAgICAgICAgeDogZWxlbWVudC5zdGFydHBvaW50LnggKyBNYXRoLmNvcyhlbGVtZW50LnN0YXJ0QW5nbGUpICogZWxlbWVudC5sZW5ndGgsXHJcbiAgICAgICAgICB5OiBlbGVtZW50LnN0YXJ0cG9pbnQueSArIE1hdGguc2luKGVsZW1lbnQuc3RhcnRBbmdsZSkgKiBlbGVtZW50Lmxlbmd0aFxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICAvKipcclxuICAgICAqIENlbnRlciB0aGUgc2hhcGVcclxuICAgICAqL1xyXG5cclxuICAgIHZhciBsaW1pdHMgPSB7fVxyXG4gICAgZnVuY3Rpb24gcHVzaExpbWl0cyhwb2ludCl7XHJcbiAgICAgIGlmKE9iamVjdC5rZXlzKGxpbWl0cykubGVuZ3RoID09PSAwKXtcclxuICAgICAgICBsaW1pdHMgPSB7XHJcbiAgICAgICAgICB1cDogcG9pbnQueSxcclxuICAgICAgICAgIGRvd246IHBvaW50LnksXHJcbiAgICAgICAgICBsZWZ0OiBwb2ludC54LFxyXG4gICAgICAgICAgcmlnaHQ6IHBvaW50LnhcclxuICAgICAgICB9XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIGlmKHBvaW50LnkgPCBsaW1pdHMudXApIGxpbWl0cy51cCA9IHBvaW50LnlcclxuICAgICAgICBpZihwb2ludC55ID4gbGltaXRzLmRvd24pIGxpbWl0cy5kb3duID0gcG9pbnQueVxyXG4gICAgICAgIGlmKHBvaW50LnggPCBsaW1pdHMubGVmdCkgbGltaXRzLmxlZnQgPSBwb2ludC54XHJcbiAgICAgICAgaWYocG9pbnQueCA+IGxpbWl0cy5yaWdodCkgbGltaXRzLnJpZ2h0ID0gcG9pbnQueFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgcHVzaExpbWl0cyhlbGVtZW50LnN0YXJ0cG9pbnQpXHJcbiAgICAgIHB1c2hMaW1pdHMoZWxlbWVudC5lbmRwb2ludClcclxuICAgIH0pXHJcblxyXG4gICAgLy8gd2UgbmVlZCB0byBrbm93IHRoZSBkaXN0YW5jZXMgdG8gdGhlIGVkZ2Ugb2YgdGhlIGNhbnZhc1xyXG4gICAgbGltaXRzLmRvd24gPSBjaGFydC5oIC0gbGltaXRzLmRvd25cclxuICAgIGxpbWl0cy5yaWdodCA9IGNoYXJ0LncgLSBsaW1pdHMucmlnaHRcclxuXHJcbiAgICAvLyB0aGUgZGlzdGFuY2VzIHNob3VsZCBiZSBlcXVhbCwgdGhlcmVmb3JlLCBzaGlmdCB0aGUgcG9pbnRzXHJcbiAgICAvLyBpZiBpdCBpcyBub3RcclxuICAgIHZhciBzaGlmdExlZnQgPSAobGltaXRzLmxlZnQgLSBsaW1pdHMucmlnaHQpIC8gMlxyXG4gICAgdmFyIHNoaWZ0VXAgPSAobGltaXRzLnVwIC0gbGltaXRzLmRvd24pIC8gMlxyXG4gICAgXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgZWxlbWVudC5zdGFydHBvaW50ID0ge1xyXG4gICAgICAgIHg6IGVsZW1lbnQuc3RhcnRwb2ludC54IC0gc2hpZnRMZWZ0LFxyXG4gICAgICAgIHk6IGVsZW1lbnQuc3RhcnRwb2ludC55IC0gc2hpZnRVcFxyXG4gICAgICB9XHJcbiAgICAgIGVsZW1lbnQuZW5kcG9pbnQgPSB7XHJcbiAgICAgICAgeDogZWxlbWVudC5lbmRwb2ludC54IC0gc2hpZnRMZWZ0LFxyXG4gICAgICAgIHk6IGVsZW1lbnQuZW5kcG9pbnQueSAtIHNoaWZ0VXBcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICByZXR1cm4gc2hhcGVcclxuICB9XHJcblxyXG4gICIsIi8qXHJcbipcclxuKiBTaGFwZSBtb2R1bGVcclxuKlxyXG4qL1xyXG5cclxudmFyIHNoYXBlcyA9IHJlcXVpcmUoJy4vc2hhcGVzJylcclxudmFyIGNhbGN1bGF0ZVNoYXBlID0gcmVxdWlyZSgnLi9jYWxjdWxhdGVTaGFwZScpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG4gIHZhciBjdXJyZW50U2hhcGVcclxuXHJcbiAgTmFwY2hhcnQub24oJ2luaXRpYWxpemUnLCBmdW5jdGlvbihjaGFydCkge1xyXG4gICAgICBzZXRTaGFwZShjaGFydCwgY2hhcnQuY29uZmlnLnNoYXBlKVxyXG4gICAgICAvLyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9nbycpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIC8vICAgY2hhbmdlU2hhcGUoY2hhcnQpXHJcbiAgICAgIC8vIH0pXHJcbiAgfSlcclxuXHJcbiAgTmFwY2hhcnQub24oJ3NldFNoYXBlJywgc2V0U2hhcGUpIFxyXG5cclxuICAvLyBhZGQgc29tZSBleHRyYSBoZWxwZXJzXHJcbiAgdmFyIHNoYXBlSGVscGVycyA9IHJlcXVpcmUoJy4vc2hhcGVIZWxwZXJzJykoTmFwY2hhcnQpXHJcblxyXG4gIGZ1bmN0aW9uIHNldFNoYXBlKGNoYXJ0LCBzaGFwZSkge1xyXG4gICAgaWYodHlwZW9mIHNoYXBlID09ICdzdHJpbmcnKXtcclxuICAgICAgY3VycmVudFNoYXBlID0gc2hhcGVcclxuICAgICAgc2hhcGUgPSBzaGFwZXNbc2hhcGVdXHJcbiAgICB9XHJcblxyXG4gICAgY2hhcnQuc2hhcGUgPSBjYWxjdWxhdGVTaGFwZShjaGFydCwgc2hhcGUpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGFuZ2VTaGFwZShjaGFydCkge1xyXG4gICAgLy8gaWYoY3VycmVudFNoYXBlID09PSAnc21pc2xlJyl7XHJcbiAgICAvLyAgIGNoYXJ0LmFuaW1hdGVTaGFwZShzaGFwZXNbJ2NpcmNsZSddKVxyXG4gICAgLy8gICBjdXJyZW50U2hhcGUgPSAnY2lyY2xlJ1xyXG4gICAgLy8gfVxyXG4gICAgLy8gY2hhcnQuYW5pbWF0ZVNoYXBlKHNoYXBlc1snaG9yaXpvbnRhbEVsbGlwc2UnXSlcclxuICAgIHZhciBuZXh0ID0gZmFsc2VcclxuICAgIGZvcihwcm9wIGluIHNoYXBlcyl7XHJcbiAgICAgIGlmKG5leHQpe1xyXG4gICAgICAgIGNoYXJ0LmFuaW1hdGVTaGFwZShzaGFwZXNbcHJvcF0pXHJcbiAgICAgICAgY3VycmVudFNoYXBlID0gcHJvcFxyXG4gICAgICAgIG5leHQgPSBmYWxzZVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIGlmKGN1cnJlbnRTaGFwZSA9PT0gcHJvcCl7XHJcbiAgICAgICAgbmV4dCA9IHRydWVcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYobmV4dCA9PT0gdHJ1ZSl7XHJcbiAgICAgIGNoYXJ0LmFuaW1hdGVTaGFwZShzaGFwZXNbJ2NpcmNsZSddKVxyXG4gICAgICBjdXJyZW50U2hhcGUgPSAnY2lyY2xlJ1xyXG4gICAgfVxyXG5cclxuICAgIGNoYXJ0LnJlZHJhdygpXHJcbiAgfVxyXG5cclxuXHJcbn1cclxuIiwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5hcGNoYXJ0KSB7XHJcbiAgXHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gIGhlbHBlcnMuWFl0b01pbnV0ZXMgPSBmdW5jdGlvbiAoY2hhcnQsIG1pbnV0ZXMsIHJhZGl1cyl7XHJcbiAgICBcclxuICAgIHZhciBzaGFwZSA9IGNoYXJ0LnNoYXBlXHJcblxyXG4gICAgcmV0dXJuIDIwMFxyXG4gIH1cclxuXHJcbiAgaGVscGVycy5taW51dGVzVG9YWSA9IGZ1bmN0aW9uIChjaGFydCwgbWludXRlcywgcmFkaXVzKXtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAgIHZhciBzaGFwZSA9IGNoYXJ0LnNoYXBlXHJcblxyXG4gICAgdmFyIG1pbnV0ZXMgPSBoZWxwZXJzLmxpbWl0KG1pbnV0ZXMpO1xyXG4gICAgLy8gRmluZCBvdXQgd2hpY2ggc2hhcGVFbGVtZW50IHdlIGZpbmQgb3VyIHBvaW50IGluXHJcbiAgICB2YXIgc2hhcGVFbGVtZW50ID0gc2hhcGUuZmluZChmdW5jdGlvbiAoZWxlbWVudCl7XHJcbiAgICAgIHJldHVybiAobWludXRlcyA+PSBlbGVtZW50LnN0YXJ0ICYmIG1pbnV0ZXMgPD0gZWxlbWVudC5lbmQpXHJcbiAgICB9KVxyXG4gICAgaWYodHlwZW9mIHNoYXBlRWxlbWVudCA9PSAndW5kZWZpbmVkJyl7XHJcbiAgICAgIGNvbnNvbGUubG9nKG1pbnV0ZXMpXHJcbiAgICAgIGNvbnNvbGUubG9nKHNoYXBlLmZpbmQoZnVuY3Rpb24gKGVsZW1lbnQpe1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGVsZW1lbnQpXHJcbiAgICAgICAgcmV0dXJuIChtaW51dGVzID49IGVsZW1lbnQuc3RhcnQgJiYgbWludXRlcyA8PSBlbGVtZW50LmVuZClcclxuICAgICAgfSkpXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIERlY2ltYWwgdXNlZCB0byBjYWxjdWxhdGUgd2hlcmUgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgc2hhcGVcclxuICAgIHZhciBwb3NpdGlvbkluU2hhcGUgPSAobWludXRlcyAtIHNoYXBlRWxlbWVudC5zdGFydCkgLyBzaGFwZUVsZW1lbnQubWludXRlc1xyXG5cclxuICAgIGlmKHNoYXBlRWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG5cclxuICAgICAgdmFyIGJhc2VQb2ludCA9IHtcclxuICAgICAgICB4OiBzaGFwZUVsZW1lbnQuc3RhcnRwb2ludC54ICsgTWF0aC5jb3Moc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUpICogcG9zaXRpb25JblNoYXBlICogc2hhcGVFbGVtZW50Lmxlbmd0aCxcclxuICAgICAgICB5OiBzaGFwZUVsZW1lbnQuc3RhcnRwb2ludC55ICsgTWF0aC5zaW4oc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUpICogcG9zaXRpb25JblNoYXBlICogc2hhcGVFbGVtZW50Lmxlbmd0aFxyXG4gICAgICB9XHJcbiAgICAgIHZhciBwb2ludCA9IHtcclxuICAgICAgICB4OiBiYXNlUG9pbnQueCArIE1hdGguY29zKHNoYXBlRWxlbWVudC5zdGFydEFuZ2xlLU1hdGguUEkvMikgKiByYWRpdXMsXHJcbiAgICAgICAgeTogYmFzZVBvaW50LnkgKyBNYXRoLnNpbihzaGFwZUVsZW1lbnQuc3RhcnRBbmdsZS1NYXRoLlBJLzIpICogcmFkaXVzXHJcbiAgICAgIH1cclxuXHJcbiAgICB9ZWxzZSBpZiAoc2hhcGVFbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuXHJcbiAgICAgIHZhciBjZW50ZXJPZkFyYyA9IHNoYXBlRWxlbWVudC5zdGFydHBvaW50O1xyXG4gICAgICB2YXIgYW5nbGUgPSBwb3NpdGlvbkluU2hhcGUgKiBzaGFwZUVsZW1lbnQucmFkaWFuc1xyXG4gICAgICB2YXIgcG9pbnQgPSB7XHJcbiAgICAgICAgeDogY2VudGVyT2ZBcmMueCArIE1hdGguY29zKHNoYXBlRWxlbWVudC5zdGFydEFuZ2xlICsgYW5nbGUgLU1hdGguUEkvMikgKiByYWRpdXMsXHJcbiAgICAgICAgeTogY2VudGVyT2ZBcmMueSArIE1hdGguc2luKHNoYXBlRWxlbWVudC5zdGFydEFuZ2xlICsgYW5nbGUgLU1hdGguUEkvMikgKiByYWRpdXNcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcG9pbnRcclxuICB9XHJcblxyXG4gIGhlbHBlcnMuY3JlYXRlQ3VydmUgPSBmdW5jdGlvbiBjcmVhdGVDdXJ2ZShjaGFydCwgc3RhcnQsIGVuZCwgcmFkaXVzLCBhbnRpY2xvY2t3aXNlKXtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuXHJcbiAgICBpZih0eXBlb2YgYW50aWNsb2Nrd2lzZSA9PSAndW5kZWZpbmVkJyl7XHJcbiAgICAgIHZhciBhbnRpY2xvY2t3aXNlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNoYXBlID0gY2hhcnQuc2hhcGUuc2xpY2UoKTtcclxuICAgIGlmKGFudGljbG9ja3dpc2Upe1xyXG4gICAgICBzaGFwZS5yZXZlcnNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmluZCBvdXQgd2hpY2ggc2hhcGVFbGVtZW50IGhhcyB0aGUgc3RhcnQgYW5kIGVuZFxyXG4gICAgdmFyIHN0YXJ0RWxlbWVudEluZGV4LCBlbmRFbGVtZW50SW5kZXhcclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaSkge1xyXG4gICAgICBpZihoZWxwZXJzLmlzSW5zaWRlKHN0YXJ0LCBlbGVtZW50LnN0YXJ0LCBlbGVtZW50LmVuZCkpe1xyXG4gICAgICAgIHN0YXJ0RWxlbWVudEluZGV4ID0gaVxyXG4gICAgICB9XHJcbiAgICAgIGlmKGhlbHBlcnMuaXNJbnNpZGUoZW5kLCBlbGVtZW50LnN0YXJ0LCBlbGVtZW50LmVuZCkpe1xyXG4gICAgICAgIGVuZEVsZW1lbnRJbmRleCA9IGk7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICBcclxuICAgIHZhciBzaGFwZUVsZW1lbnRzID0gW11cclxuICAgIC8vIGNyZWF0ZSBpdGVyYWJsZSB0YXNrIGFycmF5XHJcbiAgICB2YXIgdGFza0FycmF5ID0gW107XHJcbiAgICB2YXIgc2tpcEVuZENoZWNrID0gZmFsc2U7XHJcbiAgICB2YXIgZGVmYXVsdFRhc2s7XHJcbiAgICBpZihhbnRpY2xvY2t3aXNlKXtcclxuICAgICAgZGVmYXVsdFRhc2sgPSB7XHJcbiAgICAgICAgc3RhcnQ6IDEsXHJcbiAgICAgICAgZW5kOiAwXHJcbiAgICAgIH1cclxuICAgIH1lbHNle1xyXG4gICAgICBkZWZhdWx0VGFzayA9IHtcclxuICAgICAgICBzdGFydDogMCxcclxuICAgICAgICBlbmQ6IDFcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGkgPSBzdGFydEVsZW1lbnRJbmRleDsgaSA8IHNoYXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciB0YXNrID0ge1xyXG4gICAgICAgIHNoYXBlRWxlbWVudDogc2hhcGVbaV0sXHJcbiAgICAgICAgc3RhcnQ6IGRlZmF1bHRUYXNrLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogZGVmYXVsdFRhc2suZW5kXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKGkgPT0gc3RhcnRFbGVtZW50SW5kZXgpe1xyXG4gICAgICAgIHRhc2suc3RhcnQgPSBoZWxwZXJzLmdldFBvc2l0aW9uQmV0d2VlblR3b1ZhbHVlcyhzdGFydCxzaGFwZVtpXS5zdGFydCxzaGFwZVtpXS5lbmQpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKGkgPT0gZW5kRWxlbWVudEluZGV4KXtcclxuICAgICAgICB0YXNrLmVuZCA9IGhlbHBlcnMuZ2V0UG9zaXRpb25CZXR3ZWVuVHdvVmFsdWVzKGVuZCxzaGFwZVtpXS5zdGFydCxzaGFwZVtpXS5lbmQpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKGkgPT0gc3RhcnRFbGVtZW50SW5kZXggJiYgaSA9PSBlbmRFbGVtZW50SW5kZXggJiYgKHRhc2suZW5kID4gdGFzay5zdGFydCAmJiBhbnRpY2xvY2t3aXNlKSB8fCAodGFzay5lbmQgPCB0YXNrLnN0YXJ0ICYmICFhbnRpY2xvY2t3aXNlKSl7XHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoaW5ncyBhcmUgY29ycmVjdCB3aGVuIGVuZCBpcyBsZXNzIHRoYW4gc3RhcnRcclxuICAgICAgICBpZih0YXNrQXJyYXkubGVuZ3RoID09IDApe1xyXG4gICAgICAgICAgLy8gaXQgaXMgYmVnaW5uaW5nXHJcbiAgICAgICAgICB0YXNrLmVuZCA9IGRlZmF1bHRUYXNrLmVuZDtcclxuICAgICAgICAgIHNraXBFbmRDaGVjayA9IHRydWU7XHJcbiAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgLy8gaXQgaXMgZW5kXHJcbiAgICAgICAgICB0YXNrLnN0YXJ0ID0gZGVmYXVsdFRhc2suc3RhcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB0YXNrQXJyYXkucHVzaCh0YXNrKTtcclxuXHJcbiAgICAgIGlmKGkgPT0gZW5kRWxlbWVudEluZGV4KXtcclxuICAgICAgICBpZihza2lwRW5kQ2hlY2spe1xyXG4gICAgICAgICAgc2tpcEVuZENoZWNrID0gZmFsc2U7XHJcbiAgICAgICAgICAvLyBsZXQgaXQgcnVuIGEgcm91bmQgYW5kIGFkZCBhbGwgc2hhcGVzXHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAvLyBmaW5pc2hlZC4uIG5vdGhpbmcgbW9yZSB0byBkbyBoZXJlIVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpZiB3ZSByZWFjaGVkIGVuZCBvZiBhcnJheSB3aXRob3V0IGhhdmluZyBmb3VuZFxyXG4gICAgICAvLyB0aGUgZW5kIHBvaW50LCBpdCBtZWFucyB0aGF0IHdlIGhhdmUgdG8gZ28gdG9cclxuICAgICAgLy8gdGhlIGJlZ2lubmluZyBhZ2FpblxyXG4gICAgICAvLyBleC4gd2hlbiBzdGFydDo3MDAgZW5kOjMwMFxyXG4gICAgICBpZihpID09IHNoYXBlLmxlbmd0aC0xKXtcclxuICAgICAgICBpID0gLTE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRhc2tBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2ssIGkpIHtcclxuICAgICAgdmFyIHNoYXBlRWxlbWVudCA9IHRhc2suc2hhcGVFbGVtZW50O1xyXG4gICAgICBpZihzaGFwZUVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICAgIHZhciBzaGFwZVN0YXJ0ID0gc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUtKE1hdGguUEkvMik7XHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gc2hhcGVTdGFydCArICh0YXNrQXJyYXlbaV0uc3RhcnQgKiBzaGFwZUVsZW1lbnQucmFkaWFucyk7XHJcbiAgICAgICAgdmFyIGVuZCA9IHNoYXBlU3RhcnQgKyAodGFza0FycmF5W2ldLmVuZCAqIHNoYXBlRWxlbWVudC5yYWRpYW5zKTtcclxuICAgICAgICBjdHguYXJjKHNoYXBlRWxlbWVudC5zdGFydHBvaW50LngsIHNoYXBlRWxlbWVudC5zdGFydHBvaW50LnksIHJhZGl1cywgc3RhcnQsIGVuZCwgYW50aWNsb2Nrd2lzZSk7XHJcbiAgICAgIH1lbHNlIGlmKHNoYXBlRWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG4gICAgICAgIHZhciBzdGFydFBvaW50ID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCxzaGFwZUVsZW1lbnQuc3RhcnQgKyBzaGFwZUVsZW1lbnQubWludXRlcyAqIHRhc2suc3RhcnQsIHJhZGl1cylcclxuICAgICAgICB2YXIgZW5kUG9pbnQgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LHNoYXBlRWxlbWVudC5zdGFydCArIHNoYXBlRWxlbWVudC5taW51dGVzICogdGFzay5lbmQsIHJhZGl1cylcclxuICAgICAgICBjdHgubGluZVRvKHN0YXJ0UG9pbnQueCxzdGFydFBvaW50LnkpXHJcbiAgICAgICAgY3R4LmxpbmVUbyhlbmRQb2ludC54LGVuZFBvaW50LnkpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBoZWxwZXJzLmNyZWF0ZVNlZ21lbnQgPSBmdW5jdGlvbiAoY2hhcnQsIG91dGVyLCBpbm5lciwgc3RhcnQsIGVuZCkge1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBOYXBjaGFydC5oZWxwZXJzLmNyZWF0ZUN1cnZlKGNoYXJ0LCBzdGFydCwgZW5kLCBvdXRlcilcclxuICAgIE5hcGNoYXJ0LmhlbHBlcnMuY3JlYXRlQ3VydmUoY2hhcnQsIGVuZCwgc3RhcnQsIGlubmVyLCB0cnVlKVxyXG4gICAgY3R4LmNsb3NlUGF0aCgpXHJcbiAgfVxyXG5cclxufVxyXG4iLCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGNpcmNsZTogW1xyXG4gICAge1xyXG4gICAgICB0eXBlOiAnYXJjJyxcclxuICAgICAgdmFsdWU6IE1hdGguUEkqMlxyXG4gICAgfSxcclxuICBdLFxyXG4gIGxpbmU6IFtcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICB2YWx1ZTogMTAwXHJcbiAgICB9LFxyXG4gIF0sXHJcbiAgaG9yaXpvbnRhbEVsbGlwc2U6IFtcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2FyYycsXHJcbiAgICAgIHZhbHVlOiBNYXRoLlBJIC8gNFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICB2YWx1ZTogMjBcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdhcmMnLFxyXG4gICAgICB2YWx1ZTogTWF0aC5QSVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICB2YWx1ZTogMjBcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdhcmMnLFxyXG4gICAgICB2YWx1ZTogTWF0aC5QSSAqIDMgLyA0XHJcbiAgICB9XHJcbiAgXSxcclxuICAvLyBzbWlsZTogW1xyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnYXJjJyxcclxuICAvLyAgICAgdmFsdWU6IE1hdGguUElcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdsaW5lJyxcclxuICAvLyAgICAgdmFsdWU6IDE1MFxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2FyYycsXHJcbiAgLy8gICAgIHZhbHVlOiBNYXRoLlBJXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnbGluZScsXHJcbiAgLy8gICAgIHZhbHVlOiAxNTBcclxuICAvLyAgIH1cclxuICAvLyBdLFxyXG4gIC8vIHZlcnRpY2FsRWxsaXBzZTogW1xyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnYXJjJyxcclxuICAvLyAgICAgdmFsdWU6IE1hdGguUEkvMlxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2xpbmUnLFxyXG4gIC8vICAgICB2YWx1ZTogMTUwXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnYXJjJyxcclxuICAvLyAgICAgdmFsdWU6IE1hdGguUElcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdsaW5lJyxcclxuICAvLyAgICAgdmFsdWU6IDE1MFxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2FyYycsXHJcbiAgLy8gICAgIHZhbHVlOiBNYXRoLlBJLzJcclxuICAvLyAgIH1cclxuICAvLyBdLFxyXG4gIC8vIGZ1Y2tlZDogW1xyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnYXJjJyxcclxuICAvLyAgICAgdmFsdWU6IE1hdGguUEkvMiozXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnbGluZScsXHJcbiAgLy8gICAgIHZhbHVlOiAxMDBcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdhcmMnLFxyXG4gIC8vICAgICB2YWx1ZTogTWF0aC5QSS8yXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnbGluZScsXHJcbiAgLy8gICAgIHZhbHVlOiAxMDBcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdhcmMnLFxyXG4gIC8vICAgICB2YWx1ZTogTWF0aC5QSS8yXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnbGluZScsXHJcbiAgLy8gICAgIHZhbHVlOiA1MFxyXG4gIC8vICAgfSxcclxuICAvLyBdXHJcbn0iXX0=

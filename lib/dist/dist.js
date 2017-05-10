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
        setElementState: function(i, state) {
          this.removeElementStates()
          this.data.elements[i].state = state

          this.redraw()
        },
        removeElementStates: function() {
          this.data.elements.forEach(function(element) {
            delete element.state
          })
        },
        setSelected: function(i){
          this.data.selected[i] = this.data.elements[i]
          console.log(this)
        },
        deselect: function(i) {

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
      elements: [],
      selected: []
    }
    chart.types = {}


    scaleConfig(chart.config, chart.ratio)
    addDefaultTypes(chart)
    populateTypes(chart)

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

  function populateTypes(chart) {
    for(var typename in chart.types){
      var type = chart.types[typename]
      type.lane = chart.config.lanes[type.lane]
      type.style = Napchart.styles[type.style]
    }
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
  
  // fill

  data.elements.forEach(function(element) {
    var ctx = chart.ctx
    var type = element.type
    var lane = type.lane
    var style = type.style
    ctx.save()
    ctx.fillStyle = style.color

    switch(element.state){
      case 'active':
        ctx.globalAlpha = style.opacities.activeOpacity
        break
      case 'hover':
        ctx.globalAlpha = style.opacities.hoverOpacity
        break
      case 'selected':
        ctx.globalAlpha = 0.3
        break
      default:
        ctx.globalAlpha = style.opacities.opacity
    }

    helpers.createSegment(chart, lane.end, lane.start, element.start, element.end);

    ctx.fill()
    ctx.restore()
  })

  

  // stroke

  data.elements.forEach(function(element) {
    var ctx = chart.ctx
    var type = element.type
    var lane = type.lane
    var style = type.style

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
    Napchart.helpers.createCurve(chart, 1, 0, layers[i])
    ctx.stroke()
  }

  ctx.strokeStyle = chart.config.face.weakStrokeColor
  for (var i = layers.length - 3; i >= layers.length - 3; i--) {
  	ctx.beginPath()
    Napchart.helpers.createCurve(chart, 1, 0, layers[i])
    ctx.stroke()
  }
  
  ctx.beginPath()
  Napchart.helpers.createCurve(chart, 1, 0, 0)
  ctx.stroke()
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

  helpers.isInsideAngle = function (point, start, end) {
    // same as angle but it limits values to between 0 and 2*Math.PI
    return helpers.isInside(limit(point), limit(start), limit(end))

    function limit(angle) {
      angle %= Math.PI*2
      if(angle < 0){
        angle += Math.PI*2
      }
      return angle
    }
  }
  

  helpers.distance = function (x,y,a){
    var y = a.y-y;
    var x = a.x-x;
    return Math.sqrt(y*y+x*x);
  }

  helpers.angleBetweenTwoPoints = function (x,y,a){
    var distance = helpers.distance(x,y,a)
    var y = (a.y-y) / distance;
    var x = (a.x-x) / distance;

    var angle = Math.atan(y /x)
    if(x > 0){
      angle += Math.PI
    }
    angle += Math.PI/2
    return angle
  }
  // helpers.XYtoMinutes = function (x,y) {
  //   minutes = (Math.atan(y /x) / (Math.PI * 2)) * 1440 + 360;
  //   if (x < 0) {
  //       minutes += 720;
  //   }
  //   minutes = Math.round(minutes);

  //   return minutes;
  // };

  helpers.distanceFromPointToLine = function (x,y,a,b){

  var x1 = a.x
  var y1 = a.y
  var x2 = b.x
  var y2 = b.y

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
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
     * Calculate startPoints and endPoints
     * First point is center
     * The point only changes on line-segments
     */

    var center = {
      x:chart.w/2,
      y:chart.h/2
    }
    shape.forEach(function(element, i) {
      if(i === 0){
        element.startPoint = center
        element.endPoint = center
      }else if(element.type === 'arc'){
        element.startPoint = shape[i-1].endPoint
        element.endPoint = shape[i-1].endPoint
      }else if(element.type === 'line'){
        element.startPoint = shape[i-1].endPoint
      }
      if(element.type === 'line'){
        element.endPoint = {
          x: element.startPoint.x + Math.cos(element.startAngle) * element.length,
          y: element.startPoint.y + Math.sin(element.startAngle) * element.length
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
      pushLimits(element.startPoint)
      pushLimits(element.endPoint)
    })

    // we need to know the distances to the edge of the canvas
    limits.down = chart.h - limits.down
    limits.right = chart.w - limits.right

    // the distances should be equal, therefore, shift the points
    // if it is not
    var shiftLeft = (limits.left - limits.right) / 2
    var shiftUp = (limits.up - limits.down) / 2
    
    shape.forEach(function(element, i) {
      element.startPoint = {
        x: element.startPoint.x - shiftLeft,
        y: element.startPoint.y - shiftUp
      }
      element.endPoint = {
        x: element.endPoint.x - shiftLeft,
        y: element.endPoint.y - shiftUp
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

  helpers.XYtoInfo = function (chart, x, y){
    // will gather two things: minutes and distance from basepoint
    var minutes, distance
    var shape = chart.shape

    // which has in sector?
    var elementsInSector = []
    shape.forEach(function(element,i) {
      if(element.type === 'arc'){
        var angle = helpers.angleBetweenTwoPoints(x, y, element.startPoint)
        if(angle > element.startAngle && angle < element.endAngle){
          elementsInSector.push(element)
        }
      }else if(element.type === 'line'){
        var angle1 = helpers.angleBetweenTwoPoints(x, y, element.startPoint)
        var angle2 = helpers.angleBetweenTwoPoints(x, y, element.endPoint)

          if(i == 1){

          console.log(angle1, element.startAngle, element.startAngle + Math.PI/2)
          console.log(helpers.isInsideAngle(angle1, element.startAngle, element.startAngle + Math.PI/2))
          console.log(angle2, element.startAngle - Math.PI/2, element.startAngle)
          console.log(helpers.isInsideAngle(angle2, element.startAngle - Math.PI/2, element.startAngle))
          } 
        if(helpers.isInsideAngle(angle1, element.startAngle, element.startAngle + Math.PI/2) &&
          helpers.isInsideAngle(angle2, element.startAngle - Math.PI/2, element.startAngle)){
          elementsInSector.push(element)
        }
      }
    })

    // find the closest
    // this is only useful if the shape goes around itself (example: spiral)
    var shapeElement
    elementsInSector.forEach(function(element) {
      var thisDistance
      if(element.type === 'arc'){
        thisDistance = helpers.distance(x, y, element.startPoint)
      }else if(element.type === 'line'){
        thisDistance = helpers.distanceFromPointToLine(x, y, element.startPoint, element.endPoint)
      }
      if(typeof distance == 'undefined' || thisDistance < distance){
        distance = thisDistance
        shapeElement = element
      }
    })

    // calculate the relative position inside the element
    // and find minutes
    var positionInShapeElement

    if(shapeElement.type === 'arc'){
      var angle = helpers.angleBetweenTwoPoints(x, y, shapeElement.startPoint)
      positionInShapeElement = helpers.getProgressBetweenTwoValues(angle, shapeElement.startAngle, shapeElement.endAngle)
    }else if(shapeElement.type === 'line'){
      var a = helpers.distanceFromPointToLine(x, y, shapeElement.startPoint, shapeElement.endPoint)
      var b = helpers.distance(x, y, shapeElement.startPoint)
      var length = Math.sqrt(b*b - a*a)
      positionInShapeElement = length / shapeElement.length
    } 
    
    var minutes = helpers.range(shapeElement.start, shapeElement.end) * positionInShapeElement + shapeElement.start

    return {
      minutes: minutes,
      distance: distance,
    }
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
        x: shapeElement.startPoint.x + Math.cos(shapeElement.startAngle) * positionInShape * shapeElement.length,
        y: shapeElement.startPoint.y + Math.sin(shapeElement.startAngle) * positionInShape * shapeElement.length
      }
      var point = {
        x: basePoint.x + Math.cos(shapeElement.startAngle-Math.PI/2) * radius,
        y: basePoint.y + Math.sin(shapeElement.startAngle-Math.PI/2) * radius
      }

    }else if (shapeElement.type === 'arc'){

      var centerOfArc = shapeElement.startPoint;
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
        ctx.arc(shapeElement.startPoint.x, shapeElement.startPoint.y, radius, start, end, anticlockwise);
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
  smile: [
    {
      type: 'arc',
      value: Math.PI
    },
    {
      type: 'line',
      value: 150
    },
    {
      type: 'arc',
      value: Math.PI
    },
    {
      type: 'line',
      value: 150
    }
  ],
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY2hhcnQvY29uZmlnLmpzIiwibGliL2NoYXJ0L2NvcmUuanMiLCJsaWIvY2hhcnQvZHJhdy9jYW52YXNIZWxwZXJzLmpzIiwibGliL2NoYXJ0L2RyYXcvY2xlYXIuanMiLCJsaWIvY2hhcnQvZHJhdy9jb250ZW50L2JhcnMuanMiLCJsaWIvY2hhcnQvZHJhdy9kcmF3LmpzIiwibGliL2NoYXJ0L2RyYXcvZmFjZS9jaXJjbGVzLmpzIiwibGliL2NoYXJ0L2RyYXcvZmFjZS9saW5lcy5qcyIsImxpYi9jaGFydC9kcmF3L2ZhY2UvdGV4dC5qcyIsImxpYi9jaGFydC9kcmF3L3N0eWxlcy5qcyIsImxpYi9jaGFydC9mYW5jeW1vZHVsZS5qcyIsImxpYi9jaGFydC9oZWxwZXJzLmpzIiwibGliL2NoYXJ0L2luZGV4LmpzIiwibGliL2NoYXJ0L2ludGVyYWN0Q2FudmFzL2ludGVyYWN0Q2FudmFzLmpzIiwibGliL2NoYXJ0L3NoYXBlL2NhbGN1bGF0ZVNoYXBlLmpzIiwibGliL2NoYXJ0L3NoYXBlL3NoYXBlLmpzIiwibGliL2NoYXJ0L3NoYXBlL3NoYXBlSGVscGVycy5qcyIsImxpYi9jaGFydC9zaGFwZS9zaGFwZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5bENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIE5hcGNoYXJ0LmNvbmZpZyA9IHtcclxuICAgIGludGVyYWN0aW9uOiB0cnVlLFxyXG4gICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgYmFzZVJhZGl1czozMixcclxuICAgIGZvbnQ6J2hlbHZldGljYScsXHJcbiAgICBsYXllcnM6WzE2LCAyMCwgMjgsIDM0XSxcclxuICAgIGxhbmVzOltdLCAvLyB3aWxsIGJlIGdlbmVyYXRlZCBiYXNlZCBvbiB0aGUgbGF5ZXJzIGFycmF5XHJcbiAgICBmYWNlOiB7IC8vIGRlZmluZSBob3cgdGhlIGJhY2tncm91bmQgY2xvY2sgc2hvdWxkIGJlIGRyYXduXHJcbiAgICAgIHN0cm9rZTogMC4xNSxcclxuICAgICAgd2Vha1N0cm9rZUNvbG9yOiAnI2RkZGRkZCcsXHJcbiAgICAgIHN0cm9rZUNvbG9yOiAnIzc3Nzc3NycsXHJcbiAgICAgIGltcG9ydGFudFN0cm9rZUNvbG9yOiAnYmxhY2snLFxyXG5cdCAgaW1wb3J0YW50TGluZVdpZHRoOiAwLjMsXHJcbiAgICAgIG51bWJlcnM6IHtcclxuICAgICAgICByYWRpdXM6IDQwLFxyXG4gICAgICAgIGNvbG9yOiAnIzI2MjYyNicsXHJcbiAgICAgICAgc2l6ZTogMy4zXHJcbiAgICAgIH0sXHJcbiAgICAgIGZpdmVNaW51dGVTdHJva2VzTGVuZ3RoOiAwLFxyXG4gICAgICB0ZW5NaW51dGVTdHJva2VzTGVuZ3RoOiAwLjUsXHJcbiAgICAgIGhvdXJTdHJva2VzTGVuZ3RoOiAzLFxyXG4gICAgfSxcclxuICAgIGRlZmF1bHRUeXBlczoge1xyXG4gICAgICBzbGVlcDoge1xyXG4gICAgICAgIHN0eWxlOiAncmVkJyxcclxuICAgICAgICBub1NjYWxlOiB0cnVlLFxyXG4gICAgICAgIGxhbmU6IDJcclxuICAgICAgfSxcclxuICAgICAgYnVzeToge1xyXG4gICAgICAgIHN0eWxlOiAnYmxhY2snLFxyXG4gICAgICAgIG5vU2NhbGU6IHRydWUsXHJcbiAgICAgICAgbGFuZTogMSxcclxuICAgICAgfSxcclxuICAgIH1cclxuICB9XHJcbn0iLCIvKlxyXG4qICBDb3JlIG1vZHVsZSBvZiBOYXBjaGFydFxyXG4qXHJcbiovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG4gIHZhciBtb2R1bGVzID0gW11cclxuICB2YXIgaG9va3MgPSB7XHJcbiAgICAnaW5pdGlhbGl6ZSc6W10sXHJcbiAgICAnZGF0YUNoYW5nZSc6W10sXHJcbiAgICAnc2hhcGVDaGFuZ2UnOltdLFxyXG4gICAgJ2JlbmNobWFyayc6W10sXHJcbiAgICAnc2V0U2hhcGUnOltdLFxyXG4gICAgJ2FuaW1hdGVTaGFwZSc6W11cclxuICB9XHJcblxyXG4gIE5hcGNoYXJ0Lm9uID0gZnVuY3Rpb24oaG9vaywgZil7XHJcbiAgICBob29rc1tob29rXS5wdXNoKGYpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmlyZUhvb2soaG9vaykge1xyXG4gICAgdmFyIGFyZ3MgPSBbLi4uYXJndW1lbnRzXS5zbGljZSgxKVxyXG4gICAgLy8gY29uc29sZS5sb2coYXJncylcclxuICAgIGhvb2tzW2hvb2tdLmZvckVhY2goZnVuY3Rpb24oZil7XHJcbiAgICAgIGYoYXJnc1swXSwgYXJnc1sxXSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBOYXBjaGFydC5pbml0ID0gZnVuY3Rpb24gKGN0eCwgY29uZmlnKSB7XHJcbiAgICBcclxuICAgIHZhciBjaGFydCA9IChmdW5jdGlvbigpe1xyXG4gICAgICAvLyBwcml2YXRlXHJcbiAgICAgIC8vIHZhciBkYXRhID0ge307XHJcblxyXG4gICAgICAvLyBwdWJsaWNcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzZXRFbGVtZW50U3RhdGU6IGZ1bmN0aW9uKGksIHN0YXRlKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUVsZW1lbnRTdGF0ZXMoKVxyXG4gICAgICAgICAgdGhpcy5kYXRhLmVsZW1lbnRzW2ldLnN0YXRlID0gc3RhdGVcclxuXHJcbiAgICAgICAgICB0aGlzLnJlZHJhdygpXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVFbGVtZW50U3RhdGVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHRoaXMuZGF0YS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZGVsZXRlIGVsZW1lbnQuc3RhdGVcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRTZWxlY3RlZDogZnVuY3Rpb24oaSl7XHJcbiAgICAgICAgICB0aGlzLmRhdGEuc2VsZWN0ZWRbaV0gPSB0aGlzLmRhdGEuZWxlbWVudHNbaV1cclxuICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXNlbGVjdDogZnVuY3Rpb24oaSkge1xyXG5cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldEVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldFNoYXBlOiBmdW5jdGlvbihzaGFwZSkge1xyXG4gICAgICAgICAgZmlyZUhvb2soJ3NldFNoYXBlJywgdGhpcywgc2hhcGUpXHJcbiAgICAgICAgICBmaXJlSG9vaygnZGF0YUNoYW5nZScsIHRoaXMpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhbmltYXRlU2hhcGU6IGZ1bmN0aW9uKHNoYXBlKSB7XHJcbiAgICAgICAgICAvLyBmaXJlSG9vaygnc2V0U2hhcGUnLCB0aGlzLCBzaGFwZSlcclxuICAgICAgICAgIC8vIGZpcmVIb29rKCdkYXRhQ2hhbmdlJywgdGhpcylcclxuXHJcbiAgICAgICAgICBmaXJlSG9vaygnYW5pbWF0ZVNoYXBlJywgdGhpcywgc2hhcGUpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRFbGVtZW50czogZnVuY3Rpb24oZWxlbWVudHMpIHtcclxuICAgICAgICAgIHZhciBjaGFydCA9IHRoaXNcclxuICAgICAgICAgIGVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgICBlbGVtZW50LnR5cGUgPSBjaGFydC50eXBlc1tlbGVtZW50LnR5cGVdXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgdGhpcy5kYXRhLmVsZW1lbnRzID0gZWxlbWVudHM7XHJcbiAgICAgICAgICBmaXJlSG9vaygnZGF0YUNoYW5nZScsIHRoaXMpXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWRyYXc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgZmlyZUhvb2soJ2RhdGFDaGFuZ2UnLCB0aGlzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0RGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhXHJcbiAgICAgICAgfSxcclxuICAgICAgICBiZW5jaG1hcms6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgZmlyZUhvb2soJ2JlbmNobWFyaycsIHRoaXMpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRDb25maWc6IGZ1bmN0aW9uKGNvbmZpZykge1xyXG4gICAgICAgICAgLy8gTmFwY2hhcnQuY29uZmlnID0gY29uZmlnXHJcbiAgICAgICAgICBjaGFydC5jb25maWcgPSBjb25maWdcclxuICAgICAgICAgIHNjYWxlQ29uZmlnKGNoYXJ0LmNvbmZpZywgY2hhcnQucmF0aW8pXHJcbiAgICAgICAgICB0aGlzLnJlZHJhdygpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICB9XHJcblxyXG4gICAgfSgpKTtcclxuXHJcbiAgICAvLyBhbHNvIHB1YmxpY1xyXG4gICAgY2hhcnQuY3R4ID0gY3R4XHJcbiAgICBjaGFydC5jYW52YXMgPSBjdHguY2FudmFzXHJcbiAgICBjaGFydC53aWR0aCA9IGNoYXJ0LncgPSBjdHguY2FudmFzLndpZHRoXHJcbiAgICBjaGFydC5oZWlnaHQgPSBjaGFydC5oID0gY3R4LmNhbnZhcy5oZWlnaHRcclxuICAgIGNoYXJ0LnJhdGlvID0gY2hhcnQuaCAvIDEwMFxyXG4gICAgY2hhcnQuY29uZmlnID0gaW5pdENvbmZpZyhjb25maWcpXHJcbiAgICBjaGFydC5kYXRhID0ge1xyXG4gICAgICBlbGVtZW50czogW10sXHJcbiAgICAgIHNlbGVjdGVkOiBbXVxyXG4gICAgfVxyXG4gICAgY2hhcnQudHlwZXMgPSB7fVxyXG5cclxuXHJcbiAgICBzY2FsZUNvbmZpZyhjaGFydC5jb25maWcsIGNoYXJ0LnJhdGlvKVxyXG4gICAgYWRkRGVmYXVsdFR5cGVzKGNoYXJ0KVxyXG4gICAgcG9wdWxhdGVUeXBlcyhjaGFydClcclxuXHJcbiAgICBmaXJlSG9vaygnaW5pdGlhbGl6ZScsIGNoYXJ0KVxyXG5cclxuICAgIHJldHVybiBjaGFydFxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdENvbmZpZyAoY29uZmlnKSB7XHJcbiAgICBjb25maWcgPSBjb25maWcgfHwge31cclxuICAgIGNvbmZpZyA9IGhlbHBlcnMuZXh0ZW5kKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoTmFwY2hhcnQuY29uZmlnKSksIGNvbmZpZylcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBsYW5lc1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25maWcubGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmKGkgPT0gMCkgY29udGludWU7XHJcblxyXG4gICAgICBjb25maWcubGFuZXMucHVzaCh7XHJcbiAgICAgICAgc3RhcnQ6Y29uZmlnLmxheWVyc1tpLTFdLFxyXG4gICAgICAgIGVuZDpjb25maWcubGF5ZXJzW2ldXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvbmZpZ1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2NhbGVDb25maWcgKGNvbmZpZywgcmF0aW8pIHtcclxuICAgIGZ1bmN0aW9uIHNjYWxlRm4gKGJhc2UsIHZhbHVlLCBrZXkpIHtcclxuICAgICAgaWYoYmFzZS5ub1NjYWxlKXtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICh2YWx1ZSA+IDEgfHwgdmFsdWUgPCAxIHx8IHZhbHVlID09PSAxKSB7XHJcbiAgICAgICAgYmFzZVtrZXldID0gdmFsdWUgKiByYXRpb1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBoZWxwZXJzLmRlZXBFYWNoKGNvbmZpZywgc2NhbGVGbilcclxuICAgIHJldHVybiBjb25maWdcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZERlZmF1bHRUeXBlcyhjaGFydCkge1xyXG4gICAgY2hhcnQudHlwZXMgPSBjaGFydC5jb25maWcuZGVmYXVsdFR5cGVzXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwb3B1bGF0ZVR5cGVzKGNoYXJ0KSB7XHJcbiAgICBmb3IodmFyIHR5cGVuYW1lIGluIGNoYXJ0LnR5cGVzKXtcclxuICAgICAgdmFyIHR5cGUgPSBjaGFydC50eXBlc1t0eXBlbmFtZV1cclxuICAgICAgdHlwZS5sYW5lID0gY2hhcnQuY29uZmlnLmxhbmVzW3R5cGUubGFuZV1cclxuICAgICAgdHlwZS5zdHlsZSA9IE5hcGNoYXJ0LnN0eWxlc1t0eXBlLnN0eWxlXVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzO1xyXG5cclxuXHJcbiAgaGVscGVycy5zdHJva2VTZWdtZW50ID0gZnVuY3Rpb24oY2hhcnQsIHN0YXJ0LCBlbmQsIGNvbmZpZyl7XHJcbiAgXHR2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgXHRjdHguc2F2ZSgpXHJcbiAgXHRjdHguc3Ryb2tlU3R5bGUgPSBjb25maWcuY29sb3JcclxuICBcdGN0eC5saW5lV2lkdGggPSBjaGFydC5jb25maWcuYmFycy5nZW5lcmFsLnN0cm9rZS5saW5lV2lkdGhcclxuICBcdGN0eC5saW5lSm9pbiA9ICdtaXR0ZWwnXHJcblxyXG4gIFx0aGVscGVycy5jcmVhdGVTZWdtZW50KGNoYXJ0LCBjb25maWcub3V0ZXJSYWRpdXMsIGNvbmZpZy5pbm5lclJhZGl1cywgc3RhcnQsIGVuZCk7XHJcblxyXG4gIFx0Y3R4LnN0cm9rZSgpO1xyXG4gIFx0Y3R4LnJlc3RvcmUoKVxyXG4gIH1cclxuXHJcbiAgaGVscGVycy5jcmVhdGVGb250U3RyaW5nID0gZnVuY3Rpb24oY2hhcnQsIHNpemUpIHtcclxuICAgIHJldHVybiBzaXplICsgJ3B4ICcgKyBjaGFydC5jb25maWcuZm9udFxyXG4gIH1cclxuXHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFydCwgTmFwY2hhcnQpIHtcclxuICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgY3R4LmNsZWFyUmVjdCgwLDAsY2hhcnQudyxjaGFydC5oKVxyXG59IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2hhcnQsIE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gIHZhciBkYXRhID0gY2hhcnQuZGF0YVxyXG4gIHZhciBjYW52YXMgPSBjdHguY2FudmFzXHJcbiAgdmFyIGJhckNvbmZpZyA9IGNoYXJ0LmNvbmZpZy5iYXJzXHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcbiAgXHJcbiAgLy8gZmlsbFxyXG5cclxuICBkYXRhLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gICAgdmFyIHR5cGUgPSBlbGVtZW50LnR5cGVcclxuICAgIHZhciBsYW5lID0gdHlwZS5sYW5lXHJcbiAgICB2YXIgc3R5bGUgPSB0eXBlLnN0eWxlXHJcbiAgICBjdHguc2F2ZSgpXHJcbiAgICBjdHguZmlsbFN0eWxlID0gc3R5bGUuY29sb3JcclxuXHJcbiAgICBzd2l0Y2goZWxlbWVudC5zdGF0ZSl7XHJcbiAgICAgIGNhc2UgJ2FjdGl2ZSc6XHJcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gc3R5bGUub3BhY2l0aWVzLmFjdGl2ZU9wYWNpdHlcclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICdob3Zlcic6XHJcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gc3R5bGUub3BhY2l0aWVzLmhvdmVyT3BhY2l0eVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgJ3NlbGVjdGVkJzpcclxuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSAwLjNcclxuICAgICAgICBicmVha1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IHN0eWxlLm9wYWNpdGllcy5vcGFjaXR5XHJcbiAgICB9XHJcblxyXG4gICAgaGVscGVycy5jcmVhdGVTZWdtZW50KGNoYXJ0LCBsYW5lLmVuZCwgbGFuZS5zdGFydCwgZWxlbWVudC5zdGFydCwgZWxlbWVudC5lbmQpO1xyXG5cclxuICAgIGN0eC5maWxsKClcclxuICAgIGN0eC5yZXN0b3JlKClcclxuICB9KVxyXG5cclxuICBcclxuXHJcbiAgLy8gc3Ryb2tlXHJcblxyXG4gIGRhdGEuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgICB2YXIgdHlwZSA9IGVsZW1lbnQudHlwZVxyXG4gICAgdmFyIGxhbmUgPSB0eXBlLmxhbmVcclxuICAgIHZhciBzdHlsZSA9IHR5cGUuc3R5bGVcclxuXHJcbiAgICBjdHguc2F2ZSgpXHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBzdHlsZS5jb2xvclxyXG4gICAgY3R4LmxpbmVXaWR0aCA9IHN0eWxlLnN0cm9rZS5saW5lV2lkdGhcclxuICAgIGN0eC5saW5lSm9pbiA9ICdtaXR0ZWwnXHJcblxyXG4gICAgaGVscGVycy5jcmVhdGVTZWdtZW50KGNoYXJ0LCBsYW5lLmVuZCwgbGFuZS5zdGFydCwgZWxlbWVudC5zdGFydCwgZWxlbWVudC5lbmQpO1xyXG5cclxuICAgIGN0eC5zdHJva2UoKTtcclxuICAgIGN0eC5yZXN0b3JlKClcclxuICB9KTtcclxufVxyXG4iLCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcblxyXG4gIC8vIGltcG9ydCBzdHlsZXNcclxuICByZXF1aXJlKCcuL3N0eWxlcycpKE5hcGNoYXJ0KVxyXG5cclxuICBOYXBjaGFydC5vbignaW5pdGlhbGl6ZScsIGZ1bmN0aW9uKGluc3RhbmNlKSB7XHJcbiAgICBkcmF3KGluc3RhbmNlKTtcclxuICB9KVxyXG5cclxuICBOYXBjaGFydC5vbignZGF0YUNoYW5nZScsIGZ1bmN0aW9uKGluc3RhbmNlKSB7XHJcbiAgICBkcmF3KGluc3RhbmNlKVxyXG4gIH0pXHJcblxyXG4gIE5hcGNoYXJ0Lm9uKCdiZW5jaG1hcmsnLCBmdW5jdGlvbihpbnN0YW5jZSkge1xyXG4gICAgYmVuY2htYXJrKGluc3RhbmNlKVxyXG4gIH0pXHJcblxyXG4gIHZhciB0YXNrcyA9IHtcclxuICAgIC8vIGNsZWFyXHJcbiAgICBjbGVhcjogcmVxdWlyZSgnLi9jbGVhcicpLFxyXG5cclxuICAgIC8vIGZhY2VcclxuICAgIGNpcmNsZXM6IHJlcXVpcmUoJy4vZmFjZS9jaXJjbGVzJyksXHJcbiAgICBsaW5lczogcmVxdWlyZSgnLi9mYWNlL2xpbmVzJyksXHJcbiAgICB0ZXh0OiByZXF1aXJlKCcuL2ZhY2UvdGV4dCcpLFxyXG5cclxuICAgIC8vIGNvbnRlbnRcclxuICAgIGJhcnM6IHJlcXVpcmUoJy4vY29udGVudC9iYXJzJyksXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkcmF3KGNoYXJ0KSB7XHJcbiAgICBmb3IgKHRhc2sgaW4gdGFza3MpIHtcclxuICAgICAgdGFza3NbdGFza10oY2hhcnQsIE5hcGNoYXJ0KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYmVuY2htYXJrKGNoYXJ0KSB7XHJcbiAgICB2YXIgaXRlcmF0aW9ucyA9IDEwMDBcclxuICAgIGZvciAodGFzayBpbiB0YXNrcykge1xyXG4gICAgICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpXHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlcmF0aW9uczsgaSsrKSB7XHJcbiAgICAgICAgdGFza3NbdGFza10oY2hhcnQsIE5hcGNoYXJ0KVxyXG4gICAgICB9XHJcbiAgICAgIHZhciBlbmQgPSBEYXRlLm5vdygpXHJcbiAgICAgIGNvbnNvbGUubG9nKGAke3Rhc2t9IHggJHtpdGVyYXRpb25zfSBgICsgKGVuZC1zdGFydCkgKyAnIG1zJylcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2hhcnQsIE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGxheWVycyA9IGNoYXJ0LmNvbmZpZy5sYXllcnNcclxuICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgY3R4LmxpbmVXaWR0aCA9IGNoYXJ0LmNvbmZpZy5mYWNlLnN0cm9rZVxyXG5cclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjaGFydC5jb25maWcuZmFjZS5zdHJva2VDb2xvclxyXG4gIGZvciAodmFyIGkgPSBsYXllcnMubGVuZ3RoIC0gMTsgaSA+PSBsYXllcnMubGVuZ3RoIC0gMjsgaS0tKSB7XHJcbiAgXHRjdHguYmVnaW5QYXRoKClcclxuICAgIE5hcGNoYXJ0LmhlbHBlcnMuY3JlYXRlQ3VydmUoY2hhcnQsIDEsIDAsIGxheWVyc1tpXSlcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gIH1cclxuXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY2hhcnQuY29uZmlnLmZhY2Uud2Vha1N0cm9rZUNvbG9yXHJcbiAgZm9yICh2YXIgaSA9IGxheWVycy5sZW5ndGggLSAzOyBpID49IGxheWVycy5sZW5ndGggLSAzOyBpLS0pIHtcclxuICBcdGN0eC5iZWdpblBhdGgoKVxyXG4gICAgTmFwY2hhcnQuaGVscGVycy5jcmVhdGVDdXJ2ZShjaGFydCwgMSwgMCwgbGF5ZXJzW2ldKVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgfVxyXG4gIFxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIE5hcGNoYXJ0LmhlbHBlcnMuY3JlYXRlQ3VydmUoY2hhcnQsIDEsIDAsIDApXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2hhcnQsIE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gIHZhciBjdHggPSBjaGFydC5jdHhcclxuICB2YXIgY29uZmlnID0gY2hhcnQuY29uZmlnXHJcbiAgdmFyIGxhbmVzID0gY29uZmlnLmxhbmVzXHJcbiAgXHJcbiAgY3R4LmxpbmVXaWR0aCA9IGNvbmZpZy5mYWNlLnN0cm9rZVxyXG4gIGN0eC5zYXZlKClcclxuXHJcbiAgLy8gZXZlcnkgaG91ciBub3JtYWxcclxuXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY29uZmlnLmZhY2Uuc3Ryb2tlQ29sb3JcclxuICBjdHguYmVnaW5QYXRoKClcclxuXHJcbiAgZm9yKHZhciBpPTA7aTwyNDtpKyspe1xyXG4gIFx0dmFyIHMgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjYwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAxXS5zdGFydClcclxuICBcdHZhciBlID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSo2MCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMV0uZW5kICsgY29uZmlnLmZhY2UuaG91clN0cm9rZXNMZW5ndGgpXHJcbiAgICBjdHgubW92ZVRvKHMueCxzLnkpXHJcbiAgICBjdHgubGluZVRvKGUueCxlLnkpXHJcbiAgfVxyXG4gIGN0eC5zdHJva2UoKVxyXG5cclxuICAvLyBldmVyeSBob3VyIHdlYWtcclxuXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY29uZmlnLmZhY2Uud2Vha1N0cm9rZUNvbG9yXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcblxyXG4gIGZvcih2YXIgaT0wO2k8MjQ7aSsrKXtcclxuICAgIHZhciBzID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSo2MCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMl0uc3RhcnQpXHJcbiAgICB2YXIgZSA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqNjAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDJdLmVuZClcclxuICAgIGN0eC5tb3ZlVG8ocy54LHMueSlcclxuICAgIGN0eC5saW5lVG8oZS54LGUueSlcclxuICB9XHJcbiAgY3R4LnN0cm9rZSgpXHJcblxyXG5cclxuICAvLyBpbXBvcnRhbnQgaG91cnNcclxuXHJcbiAgY3R4LmxpbmVXaWR0aCA9IGNvbmZpZy5mYWNlLmltcG9ydGFudExpbmVXaWR0aFxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbmZpZy5mYWNlLmltcG9ydGFudFN0cm9rZUNvbG9yXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcblxyXG4gIGZvcih2YXIgaT0wO2k8MjQ7aSA9IGkrNCl7XHJcbiAgICB2YXIgcyA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqNjAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDFdLnN0YXJ0KVxyXG4gICAgdmFyIGUgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjYwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAxXS5lbmQgKyBjb25maWcuZmFjZS5ob3VyU3Ryb2tlc0xlbmd0aClcclxuICAgIGN0eC5tb3ZlVG8ocy54LHMueSlcclxuICAgIGN0eC5saW5lVG8oZS54LGUueSlcclxuICB9XHJcbiAgXHJcbiAgY3R4LnN0cm9rZSgpXHJcblxyXG4gIC8vIGV2ZXJ5IDEwIG1pbnV0ZXNcclxuXHJcbiAgLypcclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjb25maWcuZmFjZS5zdHJva2VDb2xvclxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG5cclxuXHJcbiAgZm9yKHZhciBpPTA7aTwxNDQwLzEwO2krKyl7XHJcbiAgICB2YXIgcyA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqMTAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDFdLmVuZClcclxuICAgIHZhciBlID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSoxMCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMV0uZW5kICsgY29uZmlnLmZhY2UudGVuTWludXRlU3Ryb2tlc0xlbmd0aClcclxuICAgIGN0eC5tb3ZlVG8ocy54LHMueSlcclxuICAgIGN0eC5saW5lVG8oZS54LGUueSlcclxuICB9XHJcbiAgY3R4LnN0cm9rZSgpXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgKi9cclxuXHJcblxyXG4gIC8vIGV2ZXJ5IDUgbWludXRlc1xyXG5cclxuICAvKlxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbmZpZy5mYWNlLnN0cm9rZUNvbG9yXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcblxyXG4gIGZvcih2YXIgaT0wLjU7aTwxNDQwLzEwO2krKyl7XHJcbiAgICB2YXIgcyA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqMTAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDFdLmVuZClcclxuICAgIHZhciBlID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSoxMCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMV0uZW5kICsgY29uZmlnLmZhY2UuZml2ZU1pbnV0ZVN0cm9rZXNMZW5ndGgpXHJcbiAgICBjdHgubW92ZVRvKHMueCxzLnkpXHJcbiAgICBjdHgubGluZVRvKGUueCxlLnkpXHJcbiAgfVxyXG5cclxuICBjdHguc3Ryb2tlKClcclxuICAqL1xyXG5cclxuXHJcbiAgXHJcbiAgXHJcbiAgY3R4LnJlc3RvcmUoKVxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYXJ0LCBOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG5cclxuICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgdmFyIGNvbmZpZyA9IGNoYXJ0LmNvbmZpZ1xyXG5cclxuICBjdHguc2F2ZSgpXHJcbiAgY3R4LmZvbnQgPSBoZWxwZXJzLmNyZWF0ZUZvbnRTdHJpbmcoY2hhcnQsIGNvbmZpZy5mYWNlLm51bWJlcnMuc2l6ZSlcclxuICBjdHguZmlsbFN0eWxlID0gY29uZmlnLmZhY2UubnVtYmVycy5jb2xvclxyXG4gIGN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJ1xyXG4gIGN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJ1xyXG5cclxuICBmb3IodmFyIGk9MDtpPDI0O2kgPSBpKzQpe1xyXG4gIFx0dmFyIHAgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjYwLCBjb25maWcuZmFjZS5udW1iZXJzLnJhZGl1cylcclxuICAgIGN0eC5maWxsVGV4dChpLCBwLngsIHAueSlcclxuICB9XHJcblxyXG4gIGN0eC5yZXN0b3JlKClcclxufVxyXG4iLCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcbiAgdmFyIHN0eWxlcyA9IE5hcGNoYXJ0LnN0eWxlcyA9IHtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgc3R5bGVzLmRlZmF1bHQgPSB7XHJcbiAgICB0ZXh0U2l6ZTogNCxcclxuICAgIGNvbG9yOiAnZ3JlZW4nLFxyXG4gICAgb3BhY2l0aWVzOiB7XHJcbiAgICAgIG5vU2NhbGU6dHJ1ZSxcclxuICAgICAgb3BhY2l0eTogMC42LFxyXG4gICAgICBob3Zlck9wYWNpdHk6IDAuNSxcclxuICAgICAgYWN0aXZlT3BhY2l0eTogMC41LFxyXG4gICAgfSxcclxuICAgIHN0cm9rZToge1xyXG4gICAgICBsaW5lV2lkdGg6NC41XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzdHlsZXMucmVkID0gaGVscGVycy5leHRlbmQoe30sIHN0eWxlcy5kZWZhdWx0LCB7XHJcbiAgICBjb2xvcjogJyNjNzBlMGUnLFxyXG4gICAgc2VsZWN0ZWQ6IHtcclxuICAgICAgc3Ryb2tlQ29sb3I6ICcjRkY2MzYzJyxcclxuICAgIH1cclxuICB9KSBcclxuXHJcbiAgc3R5bGVzLmJsYWNrID0gaGVscGVycy5leHRlbmQoe30sIHN0eWxlcy5kZWZhdWx0LCB7XHJcbiAgICBjb2xvcjogJyMxZjFmMWYnLFxyXG4gICAgc2VsZWN0ZWQ6IHtcclxuICAgICAgc3Ryb2tlQ29sb3I6ICcjRkY2MzYzJyxcclxuICAgIH1cclxuICB9KVxyXG5cclxuICBzdHlsZXMuYmx1ZSA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBzdHlsZXMuZGVmYXVsdCwge1xyXG4gICAgY29sb3I6ICdibHVlJ1xyXG4gIH0pXHJcbiAgXHJcbn0iLCIvKlxyXG4qICBGYW5jeSBtb2R1bGUgdGhhdCBkb2VzIHNoaXRcclxuKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGNoYXJ0O1xyXG5cclxuICBOYXBjaGFydC5vbignaW5pdGlhbGl6ZScsIGZ1bmN0aW9uKGluc3RhbmNlKSB7XHJcbiAgICBjaGFydCA9IGluc3RhbmNlXHJcbiAgICAvLyBjaGFydC5zZXREYXRhKClcclxuICB9KVxyXG59XHJcbiIsIi8qIGdsb2JhbCB3aW5kb3c6IGZhbHNlICovXG4vKiBnbG9iYWwgZG9jdW1lbnQ6IGZhbHNlICovXG4ndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQ2hhcnQpIHtcbiAgLy8gR2xvYmFsIENoYXJ0IGhlbHBlcnMgb2JqZWN0IGZvciB1dGlsaXR5IG1ldGhvZHMgYW5kIGNsYXNzZXNcbiAgdmFyIGhlbHBlcnMgPSBDaGFydC5oZWxwZXJzID0ge31cbiAgaGVscGVycy5yYW5nZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gICAgaWYgKGVuZCA8IHN0YXJ0KSB7XG4gICAgICByZXR1cm4gMTQ0MCAtIHN0YXJ0ICsgZW5kXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBlbmQgLSBzdGFydFxuICAgIH1cbiAgfVxuXG4gIGhlbHBlcnMuZ2V0UG9zaXRpb25CZXR3ZWVuVHdvVmFsdWVzID0gZnVuY3Rpb24ocG9zLCBzdGFydCwgZW5kKXtcbiAgICAgIHJldHVybiBoZWxwZXJzLnJhbmdlKHN0YXJ0LHBvcykgLyBoZWxwZXJzLnJhbmdlKHN0YXJ0LCBlbmQpXG4gIH1cblxuICBoZWxwZXJzLmxpbWl0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYodmFsdWUgPT0gMTQ0MCkgcmV0dXJuIDE0NDBcbiAgICByZXR1cm4gdmFsdWUgLSAxNDQwICogTWF0aC5mbG9vcih2YWx1ZS8xNDQwKVxuICB9XG4gIHdpbmRvdy5oZWxwZXJzID0gaGVscGVyc1xuICBoZWxwZXJzLnNob3J0ZXN0V2F5ID0gZnVuY3Rpb24oYSkge1xuICAgIC8vIGFsdGVybmF0aXZlPz9jb25zb2xlLmxvZyhhIC0gMTQ0MCAqIE1hdGguZmxvb3IoYS83MjApKVxuXG4gICAgLy8gMTQ0MC8yID0gNzIwXG4gICAgaWYoYSA+IDcyMCl7XG4gICAgICByZXR1cm4gYSAtIDE0NDBcbiAgICB9IGVsc2UgaWYoYSA8IC03MjApe1xuICAgICAgcmV0dXJuIGEgKyAxNDQwXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhXG4gICAgfVxuXG4gIH1cblxuICBoZWxwZXJzLmdldFByb2dyZXNzQmV0d2VlblR3b1ZhbHVlcyA9IGZ1bmN0aW9uIChwb3MsIHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gaGVscGVycy5yYW5nZShzdGFydCwgcG9zKSAvIGhlbHBlcnMucmFuZ2Uoc3RhcnQsIGVuZClcbiAgfVxuICBoZWxwZXJzLmlzSW5zaWRlID0gZnVuY3Rpb24gKHBvaW50LCBzdGFydCwgZW5kKSB7XG4gICAgaWYgKGVuZCA+IHN0YXJ0KSB7XG4gICAgICBpZiAocG9pbnQgPCBlbmQgJiYgcG9pbnQgPiBzdGFydCkgeyByZXR1cm4gdHJ1ZSB9XG4gICAgfSBlbHNlIGlmIChzdGFydCA+IGVuZCkge1xuICAgICAgaWYgKHBvaW50ID4gc3RhcnQgfHwgcG9pbnQgPCBlbmQpIHsgcmV0dXJuIHRydWUgfVxuICAgIH1cbiAgICBpZiAocG9pbnQgPT0gc3RhcnQgfHwgcG9pbnQgPT0gZW5kKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGhlbHBlcnMuaXNJbnNpZGVBbmdsZSA9IGZ1bmN0aW9uIChwb2ludCwgc3RhcnQsIGVuZCkge1xuICAgIC8vIHNhbWUgYXMgYW5nbGUgYnV0IGl0IGxpbWl0cyB2YWx1ZXMgdG8gYmV0d2VlbiAwIGFuZCAyKk1hdGguUElcbiAgICByZXR1cm4gaGVscGVycy5pc0luc2lkZShsaW1pdChwb2ludCksIGxpbWl0KHN0YXJ0KSwgbGltaXQoZW5kKSlcblxuICAgIGZ1bmN0aW9uIGxpbWl0KGFuZ2xlKSB7XG4gICAgICBhbmdsZSAlPSBNYXRoLlBJKjJcbiAgICAgIGlmKGFuZ2xlIDwgMCl7XG4gICAgICAgIGFuZ2xlICs9IE1hdGguUEkqMlxuICAgICAgfVxuICAgICAgcmV0dXJuIGFuZ2xlXG4gICAgfVxuICB9XG4gIFxuXG4gIGhlbHBlcnMuZGlzdGFuY2UgPSBmdW5jdGlvbiAoeCx5LGEpe1xuICAgIHZhciB5ID0gYS55LXk7XG4gICAgdmFyIHggPSBhLngteDtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHkqeSt4KngpO1xuICB9XG5cbiAgaGVscGVycy5hbmdsZUJldHdlZW5Ud29Qb2ludHMgPSBmdW5jdGlvbiAoeCx5LGEpe1xuICAgIHZhciBkaXN0YW5jZSA9IGhlbHBlcnMuZGlzdGFuY2UoeCx5LGEpXG4gICAgdmFyIHkgPSAoYS55LXkpIC8gZGlzdGFuY2U7XG4gICAgdmFyIHggPSAoYS54LXgpIC8gZGlzdGFuY2U7XG5cbiAgICB2YXIgYW5nbGUgPSBNYXRoLmF0YW4oeSAveClcbiAgICBpZih4ID4gMCl7XG4gICAgICBhbmdsZSArPSBNYXRoLlBJXG4gICAgfVxuICAgIGFuZ2xlICs9IE1hdGguUEkvMlxuICAgIHJldHVybiBhbmdsZVxuICB9XG4gIC8vIGhlbHBlcnMuWFl0b01pbnV0ZXMgPSBmdW5jdGlvbiAoeCx5KSB7XG4gIC8vICAgbWludXRlcyA9IChNYXRoLmF0YW4oeSAveCkgLyAoTWF0aC5QSSAqIDIpKSAqIDE0NDAgKyAzNjA7XG4gIC8vICAgaWYgKHggPCAwKSB7XG4gIC8vICAgICAgIG1pbnV0ZXMgKz0gNzIwO1xuICAvLyAgIH1cbiAgLy8gICBtaW51dGVzID0gTWF0aC5yb3VuZChtaW51dGVzKTtcblxuICAvLyAgIHJldHVybiBtaW51dGVzO1xuICAvLyB9O1xuXG4gIGhlbHBlcnMuZGlzdGFuY2VGcm9tUG9pbnRUb0xpbmUgPSBmdW5jdGlvbiAoeCx5LGEsYil7XG5cbiAgdmFyIHgxID0gYS54XG4gIHZhciB5MSA9IGEueVxuICB2YXIgeDIgPSBiLnhcbiAgdmFyIHkyID0gYi55XG5cbiAgdmFyIEEgPSB4IC0geDE7XG4gIHZhciBCID0geSAtIHkxO1xuICB2YXIgQyA9IHgyIC0geDE7XG4gIHZhciBEID0geTIgLSB5MTtcblxuICB2YXIgZG90ID0gQSAqIEMgKyBCICogRDtcbiAgdmFyIGxlbl9zcSA9IEMgKiBDICsgRCAqIEQ7XG4gIHZhciBwYXJhbSA9IC0xO1xuICBpZiAobGVuX3NxICE9IDApIC8vaW4gY2FzZSBvZiAwIGxlbmd0aCBsaW5lXG4gICAgICBwYXJhbSA9IGRvdCAvIGxlbl9zcTtcblxuICB2YXIgeHgsIHl5O1xuXG4gIGlmIChwYXJhbSA8IDApIHtcbiAgICB4eCA9IHgxO1xuICAgIHl5ID0geTE7XG4gIH1cbiAgZWxzZSBpZiAocGFyYW0gPiAxKSB7XG4gICAgeHggPSB4MjtcbiAgICB5eSA9IHkyO1xuICB9XG4gIGVsc2Uge1xuICAgIHh4ID0geDEgKyBwYXJhbSAqIEM7XG4gICAgeXkgPSB5MSArIHBhcmFtICogRDtcbiAgfVxuXG4gIHZhciBkeCA9IHggLSB4eDtcbiAgdmFyIGR5ID0geSAtIHl5O1xuICByZXR1cm4gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbn1cblxuICBoZWxwZXJzLmVhY2hFbGVtZW50ID0gZnVuY3Rpb24gKGNoYXJ0LCBjYWxsYmFjaykge1xuICAgIHZhciBkYXRhID0gY2hhcnQuZGF0YVxuICAgIHZhciBjb25maWdcblxuICAgIGZvciAodmFyIG5hbWUgaW4gZGF0YSkge1xuICAgICAgY29uZmlnID0gY2hhcnQuY29uZmlnLmJhcnNbbmFtZV1cbiAgICAgIFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhW25hbWVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNhbGxiYWNrKGRhdGFbbmFtZV1baV0sIGNvbmZpZylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoZWxwZXJzLmVhY2hFbGVtZW50WW8gPSBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIGRhdGEpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YVtuYW1lXS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjYWxsYmFjayhuYW1lLCBpKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhlbHBlcnMuZWFjaCA9IGZ1bmN0aW9uIChsb29wYWJsZSwgY2FsbGJhY2ssIHNlbGYsIHJldmVyc2UpIHtcbiAgICAvLyBDaGVjayB0byBzZWUgaWYgbnVsbCBvciB1bmRlZmluZWQgZmlyc3RseS5cbiAgICB2YXIgaSwgbGVuXG4gICAgaWYgKGhlbHBlcnMuaXNBcnJheShsb29wYWJsZSkpIHtcbiAgICAgIGxlbiA9IGxvb3BhYmxlLmxlbmd0aFxuICAgICAgaWYgKHJldmVyc2UpIHtcbiAgICAgICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGxvb3BhYmxlW2ldLCBpKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGxvb3BhYmxlW2ldLCBpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbG9vcGFibGUgPT09ICdvYmplY3QnKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGxvb3BhYmxlKVxuICAgICAgbGVuID0ga2V5cy5sZW5ndGhcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGxvb3BhYmxlW2tleXNbaV1dLCBrZXlzW2ldKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhlbHBlcnMuZGVlcEVhY2ggPSBmdW5jdGlvbiAobG9vcGFibGUsIGNhbGxiYWNrKSB7XG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIG51bGwgb3IgdW5kZWZpbmVkIGZpcnN0bHkuXG4gICAgdmFyIGksIGxlblxuICAgIGZ1bmN0aW9uIHNlYXJjaCAobG9vcGFibGUsIGNiKSB7XG4gICAgICBpZiAoaGVscGVycy5pc0FycmF5KGxvb3BhYmxlKSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvb3BhYmxlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2IobG9vcGFibGUsIGxvb3BhYmxlW2ldLCBpKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsb29wYWJsZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhsb29wYWJsZSlcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2IobG9vcGFibGUsIGxvb3BhYmxlW2tleXNbaV1dLCBrZXlzW2ldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm91bmQgKGJhc2UsIHZhbHVlLCBrZXkpIHtcbiAgICAgIGlmIChoZWxwZXJzLmlzQXJyYXkodmFsdWUpIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgc2VhcmNoKHZhbHVlLCBmb3VuZClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrKGJhc2UsIHZhbHVlLCBrZXkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VhcmNoKGxvb3BhYmxlLCBmb3VuZClcbiAgfVxuICBoZWxwZXJzLmNsb25lID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gIH1cbiAgaGVscGVycy5leHRlbmQgPSBmdW5jdGlvbiAoYmFzZSkge1xuICAgIHZhciBzZXRGbiA9IGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICBiYXNlW2tleV0gPSB2YWx1ZVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMSwgaWxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbGVuOyBpKyspIHtcbiAgICAgIGhlbHBlcnMuZWFjaChhcmd1bWVudHNbaV0sIHNldEZuKVxuICAgIH1cbiAgICByZXR1cm4gYmFzZVxuICB9XG4gIC8vIE5lZWQgYSBzcGVjaWFsIG1lcmdlIGZ1bmN0aW9uIHRvIGNoYXJ0IGNvbmZpZ3Mgc2luY2UgdGhleSBhcmUgbm93IGdyb3VwZWRcbiAgaGVscGVycy5jb25maWdNZXJnZSA9IGZ1bmN0aW9uIChfYmFzZSkge1xuICAgIHZhciBiYXNlID0gaGVscGVycy5jbG9uZShfYmFzZSlcbiAgICBoZWxwZXJzLmVhY2goQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgZnVuY3Rpb24gKGV4dGVuc2lvbikge1xuICAgICAgaGVscGVycy5lYWNoKGV4dGVuc2lvbiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgdmFyIGJhc2VIYXNQcm9wZXJ0eSA9IGJhc2UuaGFzT3duUHJvcGVydHkoa2V5KVxuICAgICAgICB2YXIgYmFzZVZhbCA9IGJhc2VIYXNQcm9wZXJ0eSA/IGJhc2Vba2V5XSA6IHt9XG5cbiAgICAgICAgaWYgKGtleSA9PT0gJ3NjYWxlcycpIHtcbiAgICAgICAgICAvLyBTY2FsZSBjb25maWcgbWVyZ2luZyBpcyBjb21wbGV4LiBBZGQgb3VyIG93biBmdW5jdGlvbiBoZXJlIGZvciB0aGF0XG4gICAgICAgICAgYmFzZVtrZXldID0gaGVscGVycy5zY2FsZU1lcmdlKGJhc2VWYWwsIHZhbHVlKVxuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3NjYWxlJykge1xuICAgICAgICAgIC8vIFVzZWQgaW4gcG9sYXIgYXJlYSAmIHJhZGFyIGNoYXJ0cyBzaW5jZSB0aGVyZSBpcyBvbmx5IG9uZSBzY2FsZVxuICAgICAgICAgIGJhc2Vba2V5XSA9IGhlbHBlcnMuY29uZmlnTWVyZ2UoYmFzZVZhbCwgQ2hhcnQuc2NhbGVTZXJ2aWNlLmdldFNjYWxlRGVmYXVsdHModmFsdWUudHlwZSksIHZhbHVlKVxuICAgICAgICB9IGVsc2UgaWYgKGJhc2VIYXNQcm9wZXJ0eSAmJlxuICAgICAgICAgIHR5cGVvZiBiYXNlVmFsID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICFoZWxwZXJzLmlzQXJyYXkoYmFzZVZhbCkgJiZcbiAgICAgICAgICBiYXNlVmFsICE9PSBudWxsICYmXG4gICAgICAgICAgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICFoZWxwZXJzLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgLy8gSWYgd2UgYXJlIG92ZXJ3cml0aW5nIGFuIG9iamVjdCB3aXRoIGFuIG9iamVjdCwgZG8gYSBtZXJnZSBvZiB0aGUgcHJvcGVydGllcy5cbiAgICAgICAgICBiYXNlW2tleV0gPSBoZWxwZXJzLmNvbmZpZ01lcmdlKGJhc2VWYWwsIHZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGNhbiBqdXN0IG92ZXJ3cml0ZSB0aGUgdmFsdWUgaW4gdGhpcyBjYXNlXG4gICAgICAgICAgYmFzZVtrZXldID0gdmFsdWVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIGJhc2VcbiAgfVxuICBoZWxwZXJzLnNjYWxlTWVyZ2UgPSBmdW5jdGlvbiAoX2Jhc2UsIGV4dGVuc2lvbikge1xuICAgIHZhciBiYXNlID0gaGVscGVycy5jbG9uZShfYmFzZSlcblxuICAgIGhlbHBlcnMuZWFjaChleHRlbnNpb24sIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICBpZiAoa2V5ID09PSAneEF4ZXMnIHx8IGtleSA9PT0gJ3lBeGVzJykge1xuICAgICAgICAvLyBUaGVzZSBwcm9wZXJ0aWVzIGFyZSBhcnJheXMgb2YgaXRlbXNcbiAgICAgICAgaWYgKGJhc2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIGhlbHBlcnMuZWFjaCh2YWx1ZSwgZnVuY3Rpb24gKHZhbHVlT2JqLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGF4aXNUeXBlID0gaGVscGVycy5nZXRWYWx1ZU9yRGVmYXVsdCh2YWx1ZU9iai50eXBlLCBrZXkgPT09ICd4QXhlcycgPyAnY2F0ZWdvcnknIDogJ2xpbmVhcicpXG4gICAgICAgICAgICB2YXIgYXhpc0RlZmF1bHRzID0gQ2hhcnQuc2NhbGVTZXJ2aWNlLmdldFNjYWxlRGVmYXVsdHMoYXhpc1R5cGUpXG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gYmFzZVtrZXldLmxlbmd0aCB8fCAhYmFzZVtrZXldW2luZGV4XS50eXBlKSB7XG4gICAgICAgICAgICAgIGJhc2Vba2V5XS5wdXNoKGhlbHBlcnMuY29uZmlnTWVyZ2UoYXhpc0RlZmF1bHRzLCB2YWx1ZU9iaikpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlT2JqLnR5cGUgJiYgdmFsdWVPYmoudHlwZSAhPT0gYmFzZVtrZXldW2luZGV4XS50eXBlKSB7XG4gICAgICAgICAgICAgIC8vIFR5cGUgY2hhbmdlZC4gQnJpbmcgaW4gdGhlIG5ldyBkZWZhdWx0cyBiZWZvcmUgd2UgYnJpbmcgaW4gdmFsdWVPYmogc28gdGhhdCB2YWx1ZU9iaiBjYW4gb3ZlcnJpZGUgdGhlIGNvcnJlY3Qgc2NhbGUgZGVmYXVsdHNcbiAgICAgICAgICAgICAgYmFzZVtrZXldW2luZGV4XSA9IGhlbHBlcnMuY29uZmlnTWVyZ2UoYmFzZVtrZXldW2luZGV4XSwgYXhpc0RlZmF1bHRzLCB2YWx1ZU9iailcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFR5cGUgaXMgdGhlIHNhbWVcbiAgICAgICAgICAgICAgYmFzZVtrZXldW2luZGV4XSA9IGhlbHBlcnMuY29uZmlnTWVyZ2UoYmFzZVtrZXldW2luZGV4XSwgdmFsdWVPYmopXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiYXNlW2tleV0gPSBbXVxuICAgICAgICAgIGhlbHBlcnMuZWFjaCh2YWx1ZSwgZnVuY3Rpb24gKHZhbHVlT2JqKSB7XG4gICAgICAgICAgICB2YXIgYXhpc1R5cGUgPSBoZWxwZXJzLmdldFZhbHVlT3JEZWZhdWx0KHZhbHVlT2JqLnR5cGUsIGtleSA9PT0gJ3hBeGVzJyA/ICdjYXRlZ29yeScgOiAnbGluZWFyJylcbiAgICAgICAgICAgIGJhc2Vba2V5XS5wdXNoKGhlbHBlcnMuY29uZmlnTWVyZ2UoQ2hhcnQuc2NhbGVTZXJ2aWNlLmdldFNjYWxlRGVmYXVsdHMoYXhpc1R5cGUpLCB2YWx1ZU9iaikpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChiYXNlLmhhc093blByb3BlcnR5KGtleSkgJiYgdHlwZW9mIGJhc2Vba2V5XSA9PT0gJ29iamVjdCcgJiYgYmFzZVtrZXldICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gSWYgd2UgYXJlIG92ZXJ3cml0aW5nIGFuIG9iamVjdCB3aXRoIGFuIG9iamVjdCwgZG8gYSBtZXJnZSBvZiB0aGUgcHJvcGVydGllcy5cbiAgICAgICAgYmFzZVtrZXldID0gaGVscGVycy5jb25maWdNZXJnZShiYXNlW2tleV0sIHZhbHVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2FuIGp1c3Qgb3ZlcndyaXRlIHRoZSB2YWx1ZSBpbiB0aGlzIGNhc2VcbiAgICAgICAgYmFzZVtrZXldID0gdmFsdWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGJhc2VcbiAgfVxuICBoZWxwZXJzLmdldFZhbHVlQXRJbmRleE9yRGVmYXVsdCA9IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGRlZmF1bHRWYWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gZGVmYXVsdFZhbHVlXG4gICAgfVxuXG4gICAgaWYgKGhlbHBlcnMuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBpbmRleCA8IHZhbHVlLmxlbmd0aCA/IHZhbHVlW2luZGV4XSA6IGRlZmF1bHRWYWx1ZVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZVxuICB9XG4gIGhlbHBlcnMuZ2V0VmFsdWVPckRlZmF1bHQgPSBmdW5jdGlvbiAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFZhbHVlIDogdmFsdWVcbiAgfVxuICBoZWxwZXJzLmluZGV4T2YgPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZlxuICAgID8gZnVuY3Rpb24gKGFycmF5LCBpdGVtKSB7XG4gICAgICByZXR1cm4gYXJyYXkuaW5kZXhPZihpdGVtKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIChhcnJheSwgaXRlbSkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGlsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBpbGVuOyArK2kpIHtcbiAgICAgICAgaWYgKGFycmF5W2ldID09PSBpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICBoZWxwZXJzLndoZXJlID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGZpbHRlckNhbGxiYWNrKSB7XG4gICAgaWYgKGhlbHBlcnMuaXNBcnJheShjb2xsZWN0aW9uKSAmJiBBcnJheS5wcm90b3R5cGUuZmlsdGVyKSB7XG4gICAgICByZXR1cm4gY29sbGVjdGlvbi5maWx0ZXIoZmlsdGVyQ2FsbGJhY2spXG4gICAgfVxuICAgIHZhciBmaWx0ZXJlZCA9IFtdXG5cbiAgICBoZWxwZXJzLmVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIGlmIChmaWx0ZXJDYWxsYmFjayhpdGVtKSkge1xuICAgICAgICBmaWx0ZXJlZC5wdXNoKGl0ZW0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBmaWx0ZXJlZFxuICB9XG4gIGhlbHBlcnMuZmluZEluZGV4ID0gQXJyYXkucHJvdG90eXBlLmZpbmRJbmRleFxuICAgID8gZnVuY3Rpb24gKGFycmF5LCBjYWxsYmFjaywgc2NvcGUpIHtcbiAgICAgIHJldHVybiBhcnJheS5maW5kSW5kZXgoY2FsbGJhY2ssIHNjb3BlKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIChhcnJheSwgY2FsbGJhY2ssIHNjb3BlKSB7XG4gICAgICBzY29wZSA9IHNjb3BlID09PSB1bmRlZmluZWQgPyBhcnJheSA6IHNjb3BlXG4gICAgICBmb3IgKHZhciBpID0gMCwgaWxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGlsZW47ICsraSkge1xuICAgICAgICBpZiAoY2FsbGJhY2suY2FsbChzY29wZSwgYXJyYXlbaV0sIGksIGFycmF5KSkge1xuICAgICAgICAgIHJldHVybiBpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgaGVscGVycy5maW5kTmV4dFdoZXJlID0gZnVuY3Rpb24gKGFycmF5VG9TZWFyY2gsIGZpbHRlckNhbGxiYWNrLCBzdGFydEluZGV4KSB7XG4gICAgLy8gRGVmYXVsdCB0byBzdGFydCBvZiB0aGUgYXJyYXlcbiAgICBpZiAoc3RhcnRJbmRleCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0SW5kZXggPT09IG51bGwpIHtcbiAgICAgIHN0YXJ0SW5kZXggPSAtMVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gc3RhcnRJbmRleCArIDE7IGkgPCBhcnJheVRvU2VhcmNoLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY3VycmVudEl0ZW0gPSBhcnJheVRvU2VhcmNoW2ldXG4gICAgICBpZiAoZmlsdGVyQ2FsbGJhY2soY3VycmVudEl0ZW0pKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50SXRlbVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLmZpbmRQcmV2aW91c1doZXJlID0gZnVuY3Rpb24gKGFycmF5VG9TZWFyY2gsIGZpbHRlckNhbGxiYWNrLCBzdGFydEluZGV4KSB7XG4gICAgLy8gRGVmYXVsdCB0byBlbmQgb2YgdGhlIGFycmF5XG4gICAgaWYgKHN0YXJ0SW5kZXggPT09IHVuZGVmaW5lZCB8fCBzdGFydEluZGV4ID09PSBudWxsKSB7XG4gICAgICBzdGFydEluZGV4ID0gYXJyYXlUb1NlYXJjaC5sZW5ndGhcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGN1cnJlbnRJdGVtID0gYXJyYXlUb1NlYXJjaFtpXVxuICAgICAgaWYgKGZpbHRlckNhbGxiYWNrKGN1cnJlbnRJdGVtKSkge1xuICAgICAgICByZXR1cm4gY3VycmVudEl0ZW1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaGVscGVycy5pbmhlcml0cyA9IGZ1bmN0aW9uIChleHRlbnNpb25zKSB7XG4gICAgLy8gQmFzaWMgamF2YXNjcmlwdCBpbmhlcml0YW5jZSBiYXNlZCBvbiB0aGUgbW9kZWwgY3JlYXRlZCBpbiBCYWNrYm9uZS5qc1xuICAgIHZhciBtZSA9IHRoaXNcbiAgICB2YXIgQ2hhcnRFbGVtZW50ID0gKGV4dGVuc2lvbnMgJiYgZXh0ZW5zaW9ucy5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSkgPyBleHRlbnNpb25zLmNvbnN0cnVjdG9yIDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9XG5cbiAgICB2YXIgU3Vycm9nYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jb25zdHJ1Y3RvciA9IENoYXJ0RWxlbWVudFxuICAgIH1cbiAgICBTdXJyb2dhdGUucHJvdG90eXBlID0gbWUucHJvdG90eXBlXG4gICAgQ2hhcnRFbGVtZW50LnByb3RvdHlwZSA9IG5ldyBTdXJyb2dhdGUoKVxuXG4gICAgQ2hhcnRFbGVtZW50LmV4dGVuZCA9IGhlbHBlcnMuaW5oZXJpdHNcblxuICAgIGlmIChleHRlbnNpb25zKSB7XG4gICAgICBoZWxwZXJzLmV4dGVuZChDaGFydEVsZW1lbnQucHJvdG90eXBlLCBleHRlbnNpb25zKVxuICAgIH1cblxuICAgIENoYXJ0RWxlbWVudC5fX3N1cGVyX18gPSBtZS5wcm90b3R5cGVcblxuICAgIHJldHVybiBDaGFydEVsZW1lbnRcbiAgfVxuICBoZWxwZXJzLm5vb3AgPSBmdW5jdGlvbiAoKSB7fVxuICBoZWxwZXJzLnVpZCA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGlkID0gMFxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaWQrK1xuICAgIH1cbiAgfSgpKVxuICAvLyAtLSBNYXRoIG1ldGhvZHNcbiAgaGVscGVycy5pc051bWJlciA9IGZ1bmN0aW9uIChuKSB7XG4gICAgcmV0dXJuICFpc05hTihwYXJzZUZsb2F0KG4pKSAmJiBpc0Zpbml0ZShuKVxuICB9XG4gIGhlbHBlcnMuYWxtb3N0RXF1YWxzID0gZnVuY3Rpb24gKHgsIHksIGVwc2lsb24pIHtcbiAgICByZXR1cm4gTWF0aC5hYnMoeCAtIHkpIDwgZXBzaWxvblxuICB9XG4gIGhlbHBlcnMuYWxtb3N0V2hvbGUgPSBmdW5jdGlvbiAoeCwgZXBzaWxvbikge1xuICAgIHZhciByb3VuZGVkID0gTWF0aC5yb3VuZCh4KVxuICAgIHJldHVybiAoKChyb3VuZGVkIC0gZXBzaWxvbikgPCB4KSAmJiAoKHJvdW5kZWQgKyBlcHNpbG9uKSA+IHgpKVxuICB9XG4gIGhlbHBlcnMubWF4ID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgcmV0dXJuIGFycmF5LnJlZHVjZShmdW5jdGlvbiAobWF4LCB2YWx1ZSkge1xuICAgICAgaWYgKCFpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KG1heCwgdmFsdWUpXG4gICAgICB9XG4gICAgICByZXR1cm4gbWF4XG4gICAgfSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKVxuICB9XG4gIGhlbHBlcnMubWluID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgcmV0dXJuIGFycmF5LnJlZHVjZShmdW5jdGlvbiAobWluLCB2YWx1ZSkge1xuICAgICAgaWYgKCFpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKG1pbiwgdmFsdWUpXG4gICAgICB9XG4gICAgICByZXR1cm4gbWluXG4gICAgfSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxuICB9XG4gIGhlbHBlcnMuc2lnbiA9IE1hdGguc2lnblxuICAgID8gZnVuY3Rpb24gKHgpIHtcbiAgICAgIHJldHVybiBNYXRoLnNpZ24oeClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiAoeCkge1xuICAgICAgeCA9ICt4IC8vIGNvbnZlcnQgdG8gYSBudW1iZXJcbiAgICAgIGlmICh4ID09PSAwIHx8IGlzTmFOKHgpKSB7XG4gICAgICAgIHJldHVybiB4XG4gICAgICB9XG4gICAgICByZXR1cm4geCA+IDAgPyAxIDogLTFcbiAgICB9XG4gIGhlbHBlcnMubG9nMTAgPSBNYXRoLmxvZzEwXG4gICAgPyBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIE1hdGgubG9nMTAoeClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIE1hdGgubG9nKHgpIC8gTWF0aC5MTjEwXG4gICAgfVxuICBoZWxwZXJzLnRvUmFkaWFucyA9IGZ1bmN0aW9uIChkZWdyZWVzKSB7XG4gICAgcmV0dXJuIGRlZ3JlZXMgKiAoTWF0aC5QSSAvIDE4MClcbiAgfVxuICBoZWxwZXJzLnRvRGVncmVlcyA9IGZ1bmN0aW9uIChyYWRpYW5zKSB7XG4gICAgcmV0dXJuIHJhZGlhbnMgKiAoMTgwIC8gTWF0aC5QSSlcbiAgfVxuICAvLyBHZXRzIHRoZSBhbmdsZSBmcm9tIHZlcnRpY2FsIHVwcmlnaHQgdG8gdGhlIHBvaW50IGFib3V0IGEgY2VudHJlLlxuICBoZWxwZXJzLmdldEFuZ2xlRnJvbVBvaW50ID0gZnVuY3Rpb24gKGNlbnRyZVBvaW50LCBhbmdsZVBvaW50KSB7XG4gICAgdmFyIGRpc3RhbmNlRnJvbVhDZW50ZXIgPSBhbmdsZVBvaW50LnggLSBjZW50cmVQb2ludC54LFxuICAgICAgZGlzdGFuY2VGcm9tWUNlbnRlciA9IGFuZ2xlUG9pbnQueSAtIGNlbnRyZVBvaW50LnksXG4gICAgICByYWRpYWxEaXN0YW5jZUZyb21DZW50ZXIgPSBNYXRoLnNxcnQoZGlzdGFuY2VGcm9tWENlbnRlciAqIGRpc3RhbmNlRnJvbVhDZW50ZXIgKyBkaXN0YW5jZUZyb21ZQ2VudGVyICogZGlzdGFuY2VGcm9tWUNlbnRlcilcblxuICAgIHZhciBhbmdsZSA9IE1hdGguYXRhbjIoZGlzdGFuY2VGcm9tWUNlbnRlciwgZGlzdGFuY2VGcm9tWENlbnRlcilcblxuICAgIGlmIChhbmdsZSA8ICgtMC41ICogTWF0aC5QSSkpIHtcbiAgICAgIGFuZ2xlICs9IDIuMCAqIE1hdGguUEkgLy8gbWFrZSBzdXJlIHRoZSByZXR1cm5lZCBhbmdsZSBpcyBpbiB0aGUgcmFuZ2Ugb2YgKC1QSS8yLCAzUEkvMl1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgYW5nbGU6IGFuZ2xlLFxuICAgICAgZGlzdGFuY2U6IHJhZGlhbERpc3RhbmNlRnJvbUNlbnRlclxuICAgIH1cbiAgfVxuICBoZWxwZXJzLmRpc3RhbmNlQmV0d2VlblBvaW50cyA9IGZ1bmN0aW9uIChwdDEsIHB0Mikge1xuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3cocHQyLnggLSBwdDEueCwgMikgKyBNYXRoLnBvdyhwdDIueSAtIHB0MS55LCAyKSlcbiAgfVxuICBoZWxwZXJzLmFsaWFzUGl4ZWwgPSBmdW5jdGlvbiAocGl4ZWxXaWR0aCkge1xuICAgIHJldHVybiAocGl4ZWxXaWR0aCAlIDIgPT09IDApID8gMCA6IDAuNVxuICB9XG4gIGhlbHBlcnMuc3BsaW5lQ3VydmUgPSBmdW5jdGlvbiAoZmlyc3RQb2ludCwgbWlkZGxlUG9pbnQsIGFmdGVyUG9pbnQsIHQpIHtcbiAgICAvLyBQcm9wcyB0byBSb2IgU3BlbmNlciBhdCBzY2FsZWQgaW5ub3ZhdGlvbiBmb3IgaGlzIHBvc3Qgb24gc3BsaW5pbmcgYmV0d2VlbiBwb2ludHNcbiAgICAvLyBodHRwOi8vc2NhbGVkaW5ub3ZhdGlvbi5jb20vYW5hbHl0aWNzL3NwbGluZXMvYWJvdXRTcGxpbmVzLmh0bWxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gbXVzdCBhbHNvIHJlc3BlY3QgXCJza2lwcGVkXCIgcG9pbnRzXG5cbiAgICB2YXIgcHJldmlvdXMgPSBmaXJzdFBvaW50LnNraXAgPyBtaWRkbGVQb2ludCA6IGZpcnN0UG9pbnQsXG4gICAgICBjdXJyZW50ID0gbWlkZGxlUG9pbnQsXG4gICAgICBuZXh0ID0gYWZ0ZXJQb2ludC5za2lwID8gbWlkZGxlUG9pbnQgOiBhZnRlclBvaW50XG5cbiAgICB2YXIgZDAxID0gTWF0aC5zcXJ0KE1hdGgucG93KGN1cnJlbnQueCAtIHByZXZpb3VzLngsIDIpICsgTWF0aC5wb3coY3VycmVudC55IC0gcHJldmlvdXMueSwgMikpXG4gICAgdmFyIGQxMiA9IE1hdGguc3FydChNYXRoLnBvdyhuZXh0LnggLSBjdXJyZW50LngsIDIpICsgTWF0aC5wb3cobmV4dC55IC0gY3VycmVudC55LCAyKSlcblxuICAgIHZhciBzMDEgPSBkMDEgLyAoZDAxICsgZDEyKVxuICAgIHZhciBzMTIgPSBkMTIgLyAoZDAxICsgZDEyKVxuXG4gICAgLy8gSWYgYWxsIHBvaW50cyBhcmUgdGhlIHNhbWUsIHMwMSAmIHMwMiB3aWxsIGJlIGluZlxuICAgIHMwMSA9IGlzTmFOKHMwMSkgPyAwIDogczAxXG4gICAgczEyID0gaXNOYU4oczEyKSA/IDAgOiBzMTJcblxuICAgIHZhciBmYSA9IHQgKiBzMDEgLy8gc2NhbGluZyBmYWN0b3IgZm9yIHRyaWFuZ2xlIFRhXG4gICAgdmFyIGZiID0gdCAqIHMxMlxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHByZXZpb3VzOiB7XG4gICAgICAgIHg6IGN1cnJlbnQueCAtIGZhICogKG5leHQueCAtIHByZXZpb3VzLngpLFxuICAgICAgICB5OiBjdXJyZW50LnkgLSBmYSAqIChuZXh0LnkgLSBwcmV2aW91cy55KVxuICAgICAgfSxcbiAgICAgIG5leHQ6IHtcbiAgICAgICAgeDogY3VycmVudC54ICsgZmIgKiAobmV4dC54IC0gcHJldmlvdXMueCksXG4gICAgICAgIHk6IGN1cnJlbnQueSArIGZiICogKG5leHQueSAtIHByZXZpb3VzLnkpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGhlbHBlcnMuRVBTSUxPTiA9IE51bWJlci5FUFNJTE9OIHx8IDFlLTE0XG4gIGhlbHBlcnMuc3BsaW5lQ3VydmVNb25vdG9uZSA9IGZ1bmN0aW9uIChwb2ludHMpIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGNhbGN1bGF0ZXMgQsOpemllciBjb250cm9sIHBvaW50cyBpbiBhIHNpbWlsYXIgd2F5IHRoYW4gfHNwbGluZUN1cnZlfCxcbiAgICAvLyBidXQgcHJlc2VydmVzIG1vbm90b25pY2l0eSBvZiB0aGUgcHJvdmlkZWQgZGF0YSBhbmQgZW5zdXJlcyBubyBsb2NhbCBleHRyZW11bXMgYXJlIGFkZGVkXG4gICAgLy8gYmV0d2VlbiB0aGUgZGF0YXNldCBkaXNjcmV0ZSBwb2ludHMgZHVlIHRvIHRoZSBpbnRlcnBvbGF0aW9uLlxuICAgIC8vIFNlZSA6IGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01vbm90b25lX2N1YmljX2ludGVycG9sYXRpb25cblxuICAgIHZhciBwb2ludHNXaXRoVGFuZ2VudHMgPSAocG9pbnRzIHx8IFtdKS5tYXAoZnVuY3Rpb24gKHBvaW50KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtb2RlbDogcG9pbnQuX21vZGVsLFxuICAgICAgICBkZWx0YUs6IDAsXG4gICAgICAgIG1LOiAwXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIENhbGN1bGF0ZSBzbG9wZXMgKGRlbHRhSykgYW5kIGluaXRpYWxpemUgdGFuZ2VudHMgKG1LKVxuICAgIHZhciBwb2ludHNMZW4gPSBwb2ludHNXaXRoVGFuZ2VudHMubGVuZ3RoXG4gICAgdmFyIGksIHBvaW50QmVmb3JlLCBwb2ludEN1cnJlbnQsIHBvaW50QWZ0ZXJcbiAgICBmb3IgKGkgPSAwOyBpIDwgcG9pbnRzTGVuOyArK2kpIHtcbiAgICAgIHBvaW50Q3VycmVudCA9IHBvaW50c1dpdGhUYW5nZW50c1tpXVxuICAgICAgaWYgKHBvaW50Q3VycmVudC5tb2RlbC5za2lwKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHBvaW50QmVmb3JlID0gaSA+IDAgPyBwb2ludHNXaXRoVGFuZ2VudHNbaSAtIDFdIDogbnVsbFxuICAgICAgcG9pbnRBZnRlciA9IGkgPCBwb2ludHNMZW4gLSAxID8gcG9pbnRzV2l0aFRhbmdlbnRzW2kgKyAxXSA6IG51bGxcbiAgICAgIGlmIChwb2ludEFmdGVyICYmICFwb2ludEFmdGVyLm1vZGVsLnNraXApIHtcbiAgICAgICAgdmFyIHNsb3BlRGVsdGFYID0gKHBvaW50QWZ0ZXIubW9kZWwueCAtIHBvaW50Q3VycmVudC5tb2RlbC54KVxuXG4gICAgICAgIC8vIEluIHRoZSBjYXNlIG9mIHR3byBwb2ludHMgdGhhdCBhcHBlYXIgYXQgdGhlIHNhbWUgeCBwaXhlbCwgc2xvcGVEZWx0YVggaXMgMFxuICAgICAgICBwb2ludEN1cnJlbnQuZGVsdGFLID0gc2xvcGVEZWx0YVggIT09IDAgPyAocG9pbnRBZnRlci5tb2RlbC55IC0gcG9pbnRDdXJyZW50Lm1vZGVsLnkpIC8gc2xvcGVEZWx0YVggOiAwXG4gICAgICB9XG5cbiAgICAgIGlmICghcG9pbnRCZWZvcmUgfHwgcG9pbnRCZWZvcmUubW9kZWwuc2tpcCkge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgICB9IGVsc2UgaWYgKCFwb2ludEFmdGVyIHx8IHBvaW50QWZ0ZXIubW9kZWwuc2tpcCkge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSBwb2ludEJlZm9yZS5kZWx0YUtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zaWduKHBvaW50QmVmb3JlLmRlbHRhSykgIT09IHRoaXMuc2lnbihwb2ludEN1cnJlbnQuZGVsdGFLKSkge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSAwXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSAocG9pbnRCZWZvcmUuZGVsdGFLICsgcG9pbnRDdXJyZW50LmRlbHRhSykgLyAyXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRqdXN0IHRhbmdlbnRzIHRvIGVuc3VyZSBtb25vdG9uaWMgcHJvcGVydGllc1xuICAgIHZhciBhbHBoYUssIGJldGFLLCB0YXVLLCBzcXVhcmVkTWFnbml0dWRlXG4gICAgZm9yIChpID0gMDsgaSA8IHBvaW50c0xlbiAtIDE7ICsraSkge1xuICAgICAgcG9pbnRDdXJyZW50ID0gcG9pbnRzV2l0aFRhbmdlbnRzW2ldXG4gICAgICBwb2ludEFmdGVyID0gcG9pbnRzV2l0aFRhbmdlbnRzW2kgKyAxXVxuICAgICAgaWYgKHBvaW50Q3VycmVudC5tb2RlbC5za2lwIHx8IHBvaW50QWZ0ZXIubW9kZWwuc2tpcCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAoaGVscGVycy5hbG1vc3RFcXVhbHMocG9pbnRDdXJyZW50LmRlbHRhSywgMCwgdGhpcy5FUFNJTE9OKSkge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSBwb2ludEFmdGVyLm1LID0gMFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBhbHBoYUsgPSBwb2ludEN1cnJlbnQubUsgLyBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgICBiZXRhSyA9IHBvaW50QWZ0ZXIubUsgLyBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgICBzcXVhcmVkTWFnbml0dWRlID0gTWF0aC5wb3coYWxwaGFLLCAyKSArIE1hdGgucG93KGJldGFLLCAyKVxuICAgICAgaWYgKHNxdWFyZWRNYWduaXR1ZGUgPD0gOSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB0YXVLID0gMyAvIE1hdGguc3FydChzcXVhcmVkTWFnbml0dWRlKVxuICAgICAgcG9pbnRDdXJyZW50Lm1LID0gYWxwaGFLICogdGF1SyAqIHBvaW50Q3VycmVudC5kZWx0YUtcbiAgICAgIHBvaW50QWZ0ZXIubUsgPSBiZXRhSyAqIHRhdUsgKiBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgfVxuXG4gICAgLy8gQ29tcHV0ZSBjb250cm9sIHBvaW50c1xuICAgIHZhciBkZWx0YVhcbiAgICBmb3IgKGkgPSAwOyBpIDwgcG9pbnRzTGVuOyArK2kpIHtcbiAgICAgIHBvaW50Q3VycmVudCA9IHBvaW50c1dpdGhUYW5nZW50c1tpXVxuICAgICAgaWYgKHBvaW50Q3VycmVudC5tb2RlbC5za2lwKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHBvaW50QmVmb3JlID0gaSA+IDAgPyBwb2ludHNXaXRoVGFuZ2VudHNbaSAtIDFdIDogbnVsbFxuICAgICAgcG9pbnRBZnRlciA9IGkgPCBwb2ludHNMZW4gLSAxID8gcG9pbnRzV2l0aFRhbmdlbnRzW2kgKyAxXSA6IG51bGxcbiAgICAgIGlmIChwb2ludEJlZm9yZSAmJiAhcG9pbnRCZWZvcmUubW9kZWwuc2tpcCkge1xuICAgICAgICBkZWx0YVggPSAocG9pbnRDdXJyZW50Lm1vZGVsLnggLSBwb2ludEJlZm9yZS5tb2RlbC54KSAvIDNcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1vZGVsLmNvbnRyb2xQb2ludFByZXZpb3VzWCA9IHBvaW50Q3VycmVudC5tb2RlbC54IC0gZGVsdGFYXG4gICAgICAgIHBvaW50Q3VycmVudC5tb2RlbC5jb250cm9sUG9pbnRQcmV2aW91c1kgPSBwb2ludEN1cnJlbnQubW9kZWwueSAtIGRlbHRhWCAqIHBvaW50Q3VycmVudC5tS1xuICAgICAgfVxuICAgICAgaWYgKHBvaW50QWZ0ZXIgJiYgIXBvaW50QWZ0ZXIubW9kZWwuc2tpcCkge1xuICAgICAgICBkZWx0YVggPSAocG9pbnRBZnRlci5tb2RlbC54IC0gcG9pbnRDdXJyZW50Lm1vZGVsLngpIC8gM1xuICAgICAgICBwb2ludEN1cnJlbnQubW9kZWwuY29udHJvbFBvaW50TmV4dFggPSBwb2ludEN1cnJlbnQubW9kZWwueCArIGRlbHRhWFxuICAgICAgICBwb2ludEN1cnJlbnQubW9kZWwuY29udHJvbFBvaW50TmV4dFkgPSBwb2ludEN1cnJlbnQubW9kZWwueSArIGRlbHRhWCAqIHBvaW50Q3VycmVudC5tS1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLm5leHRJdGVtID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGluZGV4LCBsb29wKSB7XG4gICAgaWYgKGxvb3ApIHtcbiAgICAgIHJldHVybiBpbmRleCA+PSBjb2xsZWN0aW9uLmxlbmd0aCAtIDEgPyBjb2xsZWN0aW9uWzBdIDogY29sbGVjdGlvbltpbmRleCArIDFdXG4gICAgfVxuICAgIHJldHVybiBpbmRleCA+PSBjb2xsZWN0aW9uLmxlbmd0aCAtIDEgPyBjb2xsZWN0aW9uW2NvbGxlY3Rpb24ubGVuZ3RoIC0gMV0gOiBjb2xsZWN0aW9uW2luZGV4ICsgMV1cbiAgfVxuICBoZWxwZXJzLnByZXZpb3VzSXRlbSA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBpbmRleCwgbG9vcCkge1xuICAgIGlmIChsb29wKSB7XG4gICAgICByZXR1cm4gaW5kZXggPD0gMCA/IGNvbGxlY3Rpb25bY29sbGVjdGlvbi5sZW5ndGggLSAxXSA6IGNvbGxlY3Rpb25baW5kZXggLSAxXVxuICAgIH1cbiAgICByZXR1cm4gaW5kZXggPD0gMCA/IGNvbGxlY3Rpb25bMF0gOiBjb2xsZWN0aW9uW2luZGV4IC0gMV1cbiAgfVxuICAvLyBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgbmljZSBudW1iZXIgYWxnb3JpdGhtIHVzZWQgaW4gZGV0ZXJtaW5pbmcgd2hlcmUgYXhpcyBsYWJlbHMgd2lsbCBnb1xuICBoZWxwZXJzLm5pY2VOdW0gPSBmdW5jdGlvbiAocmFuZ2UsIHJvdW5kKSB7XG4gICAgdmFyIGV4cG9uZW50ID0gTWF0aC5mbG9vcihoZWxwZXJzLmxvZzEwKHJhbmdlKSlcbiAgICB2YXIgZnJhY3Rpb24gPSByYW5nZSAvIE1hdGgucG93KDEwLCBleHBvbmVudClcbiAgICB2YXIgbmljZUZyYWN0aW9uXG5cbiAgICBpZiAocm91bmQpIHtcbiAgICAgIGlmIChmcmFjdGlvbiA8IDEuNSkge1xuICAgICAgICBuaWNlRnJhY3Rpb24gPSAxXG4gICAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDwgMykge1xuICAgICAgICBuaWNlRnJhY3Rpb24gPSAyXG4gICAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDwgNykge1xuICAgICAgICBuaWNlRnJhY3Rpb24gPSA1XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuaWNlRnJhY3Rpb24gPSAxMFxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPD0gMS4wKSB7XG4gICAgICBuaWNlRnJhY3Rpb24gPSAxXG4gICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8PSAyKSB7XG4gICAgICBuaWNlRnJhY3Rpb24gPSAyXG4gICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8PSA1KSB7XG4gICAgICBuaWNlRnJhY3Rpb24gPSA1XG4gICAgfSBlbHNlIHtcbiAgICAgIG5pY2VGcmFjdGlvbiA9IDEwXG4gICAgfVxuXG4gICAgcmV0dXJuIG5pY2VGcmFjdGlvbiAqIE1hdGgucG93KDEwLCBleHBvbmVudClcbiAgfVxuICAvLyBFYXNpbmcgZnVuY3Rpb25zIGFkYXB0ZWQgZnJvbSBSb2JlcnQgUGVubmVyJ3MgZWFzaW5nIGVxdWF0aW9uc1xuICAvLyBodHRwOi8vd3d3LnJvYmVydHBlbm5lci5jb20vZWFzaW5nL1xuICB2YXIgZWFzaW5nRWZmZWN0cyA9IGhlbHBlcnMuZWFzaW5nRWZmZWN0cyA9IHtcbiAgICBsaW5lYXI6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gdFxuICAgIH0sXG4gICAgZWFzZUluUXVhZDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiB0ICogdFxuICAgIH0sXG4gICAgZWFzZU91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gLTEgKiB0ICogKHQgLSAyKVxuICAgIH0sXG4gICAgZWFzZUluT3V0UXVhZDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqIHQgKiB0XG4gICAgICB9XG4gICAgICByZXR1cm4gLTEgLyAyICogKCgtLXQpICogKHQgLSAyKSAtIDEpXG4gICAgfSxcbiAgICBlYXNlSW5DdWJpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiB0ICogdCAqIHRcbiAgICB9LFxuICAgIGVhc2VPdXRDdWJpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxICogKCh0ID0gdCAvIDEgLSAxKSAqIHQgKiB0ICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dEN1YmljOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogdCAqIHQgKiB0XG4gICAgICB9XG4gICAgICByZXR1cm4gMSAvIDIgKiAoKHQgLT0gMikgKiB0ICogdCArIDIpXG4gICAgfSxcbiAgICBlYXNlSW5RdWFydDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiB0ICogdCAqIHQgKiB0XG4gICAgfSxcbiAgICBlYXNlT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gLTEgKiAoKHQgPSB0IC8gMSAtIDEpICogdCAqIHQgKiB0IC0gMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dFF1YXJ0OiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogdCAqIHQgKiB0ICogdFxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xIC8gMiAqICgodCAtPSAyKSAqIHQgKiB0ICogdCAtIDIpXG4gICAgfSxcbiAgICBlYXNlSW5RdWludDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxICogKHQgLz0gMSkgKiB0ICogdCAqIHQgKiB0XG4gICAgfSxcbiAgICBlYXNlT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gMSAqICgodCA9IHQgLyAxIC0gMSkgKiB0ICogdCAqIHQgKiB0ICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dFF1aW50OiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogdCAqIHQgKiB0ICogdCAqIHRcbiAgICAgIH1cbiAgICAgIHJldHVybiAxIC8gMiAqICgodCAtPSAyKSAqIHQgKiB0ICogdCAqIHQgKyAyKVxuICAgIH0sXG4gICAgZWFzZUluU2luZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAtMSAqIE1hdGguY29zKHQgLyAxICogKE1hdGguUEkgLyAyKSkgKyAxXG4gICAgfSxcbiAgICBlYXNlT3V0U2luZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxICogTWF0aC5zaW4odCAvIDEgKiAoTWF0aC5QSSAvIDIpKVxuICAgIH0sXG4gICAgZWFzZUluT3V0U2luZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAtMSAvIDIgKiAoTWF0aC5jb3MoTWF0aC5QSSAqIHQgLyAxKSAtIDEpXG4gICAgfSxcbiAgICBlYXNlSW5FeHBvOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuICh0ID09PSAwKSA/IDEgOiAxICogTWF0aC5wb3coMiwgMTAgKiAodCAvIDEgLSAxKSlcbiAgICB9LFxuICAgIGVhc2VPdXRFeHBvOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuICh0ID09PSAxKSA/IDEgOiAxICogKC1NYXRoLnBvdygyLCAtMTAgKiB0IC8gMSkgKyAxKVxuICAgIH0sXG4gICAgZWFzZUluT3V0RXhwbzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICh0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgICBpZiAodCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogTWF0aC5wb3coMiwgMTAgKiAodCAtIDEpKVxuICAgICAgfVxuICAgICAgcmV0dXJuIDEgLyAyICogKC1NYXRoLnBvdygyLCAtMTAgKiAtLXQpICsgMilcbiAgICB9LFxuICAgIGVhc2VJbkNpcmM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAodCA+PSAxKSB7XG4gICAgICAgIHJldHVybiB0XG4gICAgICB9XG4gICAgICByZXR1cm4gLTEgKiAoTWF0aC5zcXJ0KDEgLSAodCAvPSAxKSAqIHQpIC0gMSlcbiAgICB9LFxuICAgIGVhc2VPdXRDaXJjOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgKiBNYXRoLnNxcnQoMSAtICh0ID0gdCAvIDEgLSAxKSAqIHQpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRDaXJjOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIC0xIC8gMiAqIChNYXRoLnNxcnQoMSAtIHQgKiB0KSAtIDEpXG4gICAgICB9XG4gICAgICByZXR1cm4gMSAvIDIgKiAoTWF0aC5zcXJ0KDEgLSAodCAtPSAyKSAqIHQpICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbkVsYXN0aWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIHZhciBwID0gMFxuICAgICAgdmFyIGEgPSAxXG4gICAgICBpZiAodCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuICAgICAgaWYgKCh0IC89IDEpID09PSAxKSB7XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9XG4gICAgICBpZiAoIXApIHtcbiAgICAgICAgcCA9IDEgKiAwLjNcbiAgICAgIH1cbiAgICAgIGlmIChhIDwgTWF0aC5hYnMoMSkpIHtcbiAgICAgICAgYSA9IDFcbiAgICAgICAgcyA9IHAgLyA0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzID0gcCAvICgyICogTWF0aC5QSSkgKiBNYXRoLmFzaW4oMSAvIGEpXG4gICAgICB9XG4gICAgICByZXR1cm4gLShhICogTWF0aC5wb3coMiwgMTAgKiAodCAtPSAxKSkgKiBNYXRoLnNpbigodCAqIDEgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSlcbiAgICB9LFxuICAgIGVhc2VPdXRFbGFzdGljOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICB2YXIgcCA9IDBcbiAgICAgIHZhciBhID0gMVxuICAgICAgaWYgKHQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cbiAgICAgIGlmICgodCAvPSAxKSA9PT0gMSkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgaWYgKCFwKSB7XG4gICAgICAgIHAgPSAxICogMC4zXG4gICAgICB9XG4gICAgICBpZiAoYSA8IE1hdGguYWJzKDEpKSB7XG4gICAgICAgIGEgPSAxXG4gICAgICAgIHMgPSBwIC8gNFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcyA9IHAgLyAoMiAqIE1hdGguUEkpICogTWF0aC5hc2luKDEgLyBhKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGEgKiBNYXRoLnBvdygyLCAtMTAgKiB0KSAqIE1hdGguc2luKCh0ICogMSAtIHMpICogKDIgKiBNYXRoLlBJKSAvIHApICsgMVxuICAgIH0sXG4gICAgZWFzZUluT3V0RWxhc3RpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgdmFyIHAgPSAwXG4gICAgICB2YXIgYSA9IDFcbiAgICAgIGlmICh0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpID09PSAyKSB7XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9XG4gICAgICBpZiAoIXApIHtcbiAgICAgICAgcCA9IDEgKiAoMC4zICogMS41KVxuICAgICAgfVxuICAgICAgaWYgKGEgPCBNYXRoLmFicygxKSkge1xuICAgICAgICBhID0gMVxuICAgICAgICBzID0gcCAvIDRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMgPSBwIC8gKDIgKiBNYXRoLlBJKSAqIE1hdGguYXNpbigxIC8gYSlcbiAgICAgIH1cbiAgICAgIGlmICh0IDwgMSkge1xuICAgICAgICByZXR1cm4gLTAuNSAqIChhICogTWF0aC5wb3coMiwgMTAgKiAodCAtPSAxKSkgKiBNYXRoLnNpbigodCAqIDEgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBhICogTWF0aC5wb3coMiwgLTEwICogKHQgLT0gMSkpICogTWF0aC5zaW4oKHQgKiAxIC0gcykgKiAoMiAqIE1hdGguUEkpIC8gcCkgKiAwLjUgKyAxXG4gICAgfSxcbiAgICBlYXNlSW5CYWNrOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICByZXR1cm4gMSAqICh0IC89IDEpICogdCAqICgocyArIDEpICogdCAtIHMpXG4gICAgfSxcbiAgICBlYXNlT3V0QmFjazogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgcmV0dXJuIDEgKiAoKHQgPSB0IC8gMSAtIDEpICogdCAqICgocyArIDEpICogdCArIHMpICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dEJhY2s6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqICh0ICogdCAqICgoKHMgKj0gKDEuNTI1KSkgKyAxKSAqIHQgLSBzKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAxIC8gMiAqICgodCAtPSAyKSAqIHQgKiAoKChzICo9ICgxLjUyNSkpICsgMSkgKiB0ICsgcykgKyAyKVxuICAgIH0sXG4gICAgZWFzZUluQm91bmNlOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgLSBlYXNpbmdFZmZlY3RzLmVhc2VPdXRCb3VuY2UoMSAtIHQpXG4gICAgfSxcbiAgICBlYXNlT3V0Qm91bmNlOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEpIDwgKDEgLyAyLjc1KSkge1xuICAgICAgICByZXR1cm4gMSAqICg3LjU2MjUgKiB0ICogdClcbiAgICAgIH0gZWxzZSBpZiAodCA8ICgyIC8gMi43NSkpIHtcbiAgICAgICAgcmV0dXJuIDEgKiAoNy41NjI1ICogKHQgLT0gKDEuNSAvIDIuNzUpKSAqIHQgKyAwLjc1KVxuICAgICAgfSBlbHNlIGlmICh0IDwgKDIuNSAvIDIuNzUpKSB7XG4gICAgICAgIHJldHVybiAxICogKDcuNTYyNSAqICh0IC09ICgyLjI1IC8gMi43NSkpICogdCArIDAuOTM3NSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAxICogKDcuNTYyNSAqICh0IC09ICgyLjYyNSAvIDIuNzUpKSAqIHQgKyAwLjk4NDM3NSlcbiAgICB9LFxuICAgIGVhc2VJbk91dEJvdW5jZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICh0IDwgMSAvIDIpIHtcbiAgICAgICAgcmV0dXJuIGVhc2luZ0VmZmVjdHMuZWFzZUluQm91bmNlKHQgKiAyKSAqIDAuNVxuICAgICAgfVxuICAgICAgcmV0dXJuIGVhc2luZ0VmZmVjdHMuZWFzZU91dEJvdW5jZSh0ICogMiAtIDEpICogMC41ICsgMSAqIDAuNVxuICAgIH1cbiAgfVxuICBcbiAgLy8gLS0gRE9NIG1ldGhvZHNcbiAgaGVscGVycy5nZXRSZWxhdGl2ZVBvc2l0aW9uID0gZnVuY3Rpb24gKGV2dCwgY2hhcnQpIHtcbiAgICB2YXIgbW91c2VYLCBtb3VzZVlcbiAgICB2YXIgZSA9IGV2dC5vcmlnaW5hbEV2ZW50IHx8IGV2dCxcbiAgICAgIGNhbnZhcyA9IGV2dC5jdXJyZW50VGFyZ2V0IHx8IGV2dC5zcmNFbGVtZW50LFxuICAgICAgYm91bmRpbmdSZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cbiAgICB2YXIgdG91Y2hlcyA9IGUudG91Y2hlc1xuICAgIGlmICh0b3VjaGVzICYmIHRvdWNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgbW91c2VYID0gdG91Y2hlc1swXS5jbGllbnRYXG4gICAgICBtb3VzZVkgPSB0b3VjaGVzWzBdLmNsaWVudFlcbiAgICB9IGVsc2Uge1xuICAgICAgbW91c2VYID0gZS5jbGllbnRYXG4gICAgICBtb3VzZVkgPSBlLmNsaWVudFlcbiAgICB9XG5cbiAgICAvLyBTY2FsZSBtb3VzZSBjb29yZGluYXRlcyBpbnRvIGNhbnZhcyBjb29yZGluYXRlc1xuICAgIC8vIGJ5IGZvbGxvd2luZyB0aGUgcGF0dGVybiBsYWlkIG91dCBieSAnamVycnlqJyBpbiB0aGUgY29tbWVudHMgb2ZcbiAgICAvLyBodHRwOi8vd3d3Lmh0bWw1Y2FudmFzdHV0b3JpYWxzLmNvbS9hZHZhbmNlZC9odG1sNS1jYW52YXMtbW91c2UtY29vcmRpbmF0ZXMvXG4gICAgdmFyIHBhZGRpbmdMZWZ0ID0gcGFyc2VGbG9hdChoZWxwZXJzLmdldFN0eWxlKGNhbnZhcywgJ3BhZGRpbmctbGVmdCcpKVxuICAgIHZhciBwYWRkaW5nVG9wID0gcGFyc2VGbG9hdChoZWxwZXJzLmdldFN0eWxlKGNhbnZhcywgJ3BhZGRpbmctdG9wJykpXG4gICAgdmFyIHBhZGRpbmdSaWdodCA9IHBhcnNlRmxvYXQoaGVscGVycy5nZXRTdHlsZShjYW52YXMsICdwYWRkaW5nLXJpZ2h0JykpXG4gICAgdmFyIHBhZGRpbmdCb3R0b20gPSBwYXJzZUZsb2F0KGhlbHBlcnMuZ2V0U3R5bGUoY2FudmFzLCAncGFkZGluZy1ib3R0b20nKSlcbiAgICB2YXIgd2lkdGggPSBib3VuZGluZ1JlY3QucmlnaHQgLSBib3VuZGluZ1JlY3QubGVmdCAtIHBhZGRpbmdMZWZ0IC0gcGFkZGluZ1JpZ2h0XG4gICAgdmFyIGhlaWdodCA9IGJvdW5kaW5nUmVjdC5ib3R0b20gLSBib3VuZGluZ1JlY3QudG9wIC0gcGFkZGluZ1RvcCAtIHBhZGRpbmdCb3R0b21cblxuICAgIC8vIFdlIGRpdmlkZSBieSB0aGUgY3VycmVudCBkZXZpY2UgcGl4ZWwgcmF0aW8sIGJlY2F1c2UgdGhlIGNhbnZhcyBpcyBzY2FsZWQgdXAgYnkgdGhhdCBhbW91bnQgaW4gZWFjaCBkaXJlY3Rpb24uIEhvd2V2ZXJcbiAgICAvLyB0aGUgYmFja2VuZCBtb2RlbCBpcyBpbiB1bnNjYWxlZCBjb29yZGluYXRlcy4gU2luY2Ugd2UgYXJlIGdvaW5nIHRvIGRlYWwgd2l0aCBvdXIgbW9kZWwgY29vcmRpbmF0ZXMsIHdlIGdvIGJhY2sgaGVyZVxuICAgIG1vdXNlWCA9IE1hdGgucm91bmQoKG1vdXNlWCAtIGJvdW5kaW5nUmVjdC5sZWZ0IC0gcGFkZGluZ0xlZnQpIC8gKHdpZHRoKSAqIGNhbnZhcy53aWR0aCAvIGNoYXJ0LmN1cnJlbnREZXZpY2VQaXhlbFJhdGlvKVxuICAgIG1vdXNlWSA9IE1hdGgucm91bmQoKG1vdXNlWSAtIGJvdW5kaW5nUmVjdC50b3AgLSBwYWRkaW5nVG9wKSAvIChoZWlnaHQpICogY2FudmFzLmhlaWdodCAvIGNoYXJ0LmN1cnJlbnREZXZpY2VQaXhlbFJhdGlvKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IG1vdXNlWCxcbiAgICAgIHk6IG1vdXNlWVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLmFkZEV2ZW50ID0gZnVuY3Rpb24gKG5vZGUsIGV2ZW50VHlwZSwgbWV0aG9kKSB7XG4gICAgaWYgKG5vZGUuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgbWV0aG9kKVxuICAgIH0gZWxzZSBpZiAobm9kZS5hdHRhY2hFdmVudCkge1xuICAgICAgbm9kZS5hdHRhY2hFdmVudCgnb24nICsgZXZlbnRUeXBlLCBtZXRob2QpXG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGVbJ29uJyArIGV2ZW50VHlwZV0gPSBtZXRob2RcbiAgICB9XG4gIH1cbiAgaGVscGVycy5yZW1vdmVFdmVudCA9IGZ1bmN0aW9uIChub2RlLCBldmVudFR5cGUsIGhhbmRsZXIpIHtcbiAgICBpZiAobm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBoYW5kbGVyLCBmYWxzZSlcbiAgICB9IGVsc2UgaWYgKG5vZGUuZGV0YWNoRXZlbnQpIHtcbiAgICAgIG5vZGUuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgaGFuZGxlcilcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZVsnb24nICsgZXZlbnRUeXBlXSA9IGhlbHBlcnMubm9vcFxuICAgIH1cbiAgfVxuXG4gIC8vIFByaXZhdGUgaGVscGVyIGZ1bmN0aW9uIHRvIGNvbnZlcnQgbWF4LXdpZHRoL21heC1oZWlnaHQgdmFsdWVzIHRoYXQgbWF5IGJlIHBlcmNlbnRhZ2VzIGludG8gYSBudW1iZXJcbiAgZnVuY3Rpb24gcGFyc2VNYXhTdHlsZSAoc3R5bGVWYWx1ZSwgbm9kZSwgcGFyZW50UHJvcGVydHkpIHtcbiAgICB2YXIgdmFsdWVJblBpeGVsc1xuICAgIGlmICh0eXBlb2YgKHN0eWxlVmFsdWUpID09PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWVJblBpeGVscyA9IHBhcnNlSW50KHN0eWxlVmFsdWUsIDEwKVxuXG4gICAgICBpZiAoc3R5bGVWYWx1ZS5pbmRleE9mKCclJykgIT09IC0xKSB7XG4gICAgICAgIC8vIHBlcmNlbnRhZ2UgKiBzaXplIGluIGRpbWVuc2lvblxuICAgICAgICB2YWx1ZUluUGl4ZWxzID0gdmFsdWVJblBpeGVscyAvIDEwMCAqIG5vZGUucGFyZW50Tm9kZVtwYXJlbnRQcm9wZXJ0eV1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWVJblBpeGVscyA9IHN0eWxlVmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWVJblBpeGVsc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgdGhlIGdpdmVuIHZhbHVlIGNvbnRhaW5zIGFuIGVmZmVjdGl2ZSBjb25zdHJhaW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gaXNDb25zdHJhaW5lZFZhbHVlICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSAnbm9uZSdcbiAgfVxuXG4gIC8vIFByaXZhdGUgaGVscGVyIHRvIGdldCBhIGNvbnN0cmFpbnQgZGltZW5zaW9uXG4gIC8vIEBwYXJhbSBkb21Ob2RlIDogdGhlIG5vZGUgdG8gY2hlY2sgdGhlIGNvbnN0cmFpbnQgb25cbiAgLy8gQHBhcmFtIG1heFN0eWxlIDogdGhlIHN0eWxlIHRoYXQgZGVmaW5lcyB0aGUgbWF4aW11bSBmb3IgdGhlIGRpcmVjdGlvbiB3ZSBhcmUgdXNpbmcgKG1heFdpZHRoIC8gbWF4SGVpZ2h0KVxuICAvLyBAcGFyYW0gcGVyY2VudGFnZVByb3BlcnR5IDogcHJvcGVydHkgb2YgcGFyZW50IHRvIHVzZSB3aGVuIGNhbGN1bGF0aW5nIHdpZHRoIGFzIGEgcGVyY2VudGFnZVxuICAvLyBAc2VlIGh0dHA6Ly93d3cubmF0aGFuYWVsam9uZXMuY29tL2Jsb2cvMjAxMy9yZWFkaW5nLW1heC13aWR0aC1jcm9zcy1icm93c2VyXG4gIGZ1bmN0aW9uIGdldENvbnN0cmFpbnREaW1lbnNpb24gKGRvbU5vZGUsIG1heFN0eWxlLCBwZXJjZW50YWdlUHJvcGVydHkpIHtcbiAgICB2YXIgdmlldyA9IGRvY3VtZW50LmRlZmF1bHRWaWV3XG4gICAgdmFyIHBhcmVudE5vZGUgPSBkb21Ob2RlLnBhcmVudE5vZGVcbiAgICB2YXIgY29uc3RyYWluZWROb2RlID0gdmlldy5nZXRDb21wdXRlZFN0eWxlKGRvbU5vZGUpW21heFN0eWxlXVxuICAgIHZhciBjb25zdHJhaW5lZENvbnRhaW5lciA9IHZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShwYXJlbnROb2RlKVttYXhTdHlsZV1cbiAgICB2YXIgaGFzQ05vZGUgPSBpc0NvbnN0cmFpbmVkVmFsdWUoY29uc3RyYWluZWROb2RlKVxuICAgIHZhciBoYXNDQ29udGFpbmVyID0gaXNDb25zdHJhaW5lZFZhbHVlKGNvbnN0cmFpbmVkQ29udGFpbmVyKVxuICAgIHZhciBpbmZpbml0eSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuXG4gICAgaWYgKGhhc0NOb2RlIHx8IGhhc0NDb250YWluZXIpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbihcbiAgICAgICAgaGFzQ05vZGUgPyBwYXJzZU1heFN0eWxlKGNvbnN0cmFpbmVkTm9kZSwgZG9tTm9kZSwgcGVyY2VudGFnZVByb3BlcnR5KSA6IGluZmluaXR5LFxuICAgICAgICBoYXNDQ29udGFpbmVyID8gcGFyc2VNYXhTdHlsZShjb25zdHJhaW5lZENvbnRhaW5lciwgcGFyZW50Tm9kZSwgcGVyY2VudGFnZVByb3BlcnR5KSA6IGluZmluaXR5KVxuICAgIH1cblxuICAgIHJldHVybiAnbm9uZSdcbiAgfVxuICAvLyByZXR1cm5zIE51bWJlciBvciB1bmRlZmluZWQgaWYgbm8gY29uc3RyYWludFxuICBoZWxwZXJzLmdldENvbnN0cmFpbnRXaWR0aCA9IGZ1bmN0aW9uIChkb21Ob2RlKSB7XG4gICAgcmV0dXJuIGdldENvbnN0cmFpbnREaW1lbnNpb24oZG9tTm9kZSwgJ21heC13aWR0aCcsICdjbGllbnRXaWR0aCcpXG4gIH1cbiAgLy8gcmV0dXJucyBOdW1iZXIgb3IgdW5kZWZpbmVkIGlmIG5vIGNvbnN0cmFpbnRcbiAgaGVscGVycy5nZXRDb25zdHJhaW50SGVpZ2h0ID0gZnVuY3Rpb24gKGRvbU5vZGUpIHtcbiAgICByZXR1cm4gZ2V0Q29uc3RyYWludERpbWVuc2lvbihkb21Ob2RlLCAnbWF4LWhlaWdodCcsICdjbGllbnRIZWlnaHQnKVxuICB9XG4gIGhlbHBlcnMuZ2V0TWF4aW11bVdpZHRoID0gZnVuY3Rpb24gKGRvbU5vZGUpIHtcbiAgICB2YXIgY29udGFpbmVyID0gZG9tTm9kZS5wYXJlbnROb2RlXG4gICAgdmFyIHBhZGRpbmdMZWZ0ID0gcGFyc2VJbnQoaGVscGVycy5nZXRTdHlsZShjb250YWluZXIsICdwYWRkaW5nLWxlZnQnKSwgMTApXG4gICAgdmFyIHBhZGRpbmdSaWdodCA9IHBhcnNlSW50KGhlbHBlcnMuZ2V0U3R5bGUoY29udGFpbmVyLCAncGFkZGluZy1yaWdodCcpLCAxMClcbiAgICB2YXIgdyA9IGNvbnRhaW5lci5jbGllbnRXaWR0aCAtIHBhZGRpbmdMZWZ0IC0gcGFkZGluZ1JpZ2h0XG4gICAgdmFyIGN3ID0gaGVscGVycy5nZXRDb25zdHJhaW50V2lkdGgoZG9tTm9kZSlcbiAgICByZXR1cm4gaXNOYU4oY3cpID8gdyA6IE1hdGgubWluKHcsIGN3KVxuICB9XG4gIGhlbHBlcnMuZ2V0TWF4aW11bUhlaWdodCA9IGZ1bmN0aW9uIChkb21Ob2RlKSB7XG4gICAgdmFyIGNvbnRhaW5lciA9IGRvbU5vZGUucGFyZW50Tm9kZVxuICAgIHZhciBwYWRkaW5nVG9wID0gcGFyc2VJbnQoaGVscGVycy5nZXRTdHlsZShjb250YWluZXIsICdwYWRkaW5nLXRvcCcpLCAxMClcbiAgICB2YXIgcGFkZGluZ0JvdHRvbSA9IHBhcnNlSW50KGhlbHBlcnMuZ2V0U3R5bGUoY29udGFpbmVyLCAncGFkZGluZy1ib3R0b20nKSwgMTApXG4gICAgdmFyIGggPSBjb250YWluZXIuY2xpZW50SGVpZ2h0IC0gcGFkZGluZ1RvcCAtIHBhZGRpbmdCb3R0b21cbiAgICB2YXIgY2ggPSBoZWxwZXJzLmdldENvbnN0cmFpbnRIZWlnaHQoZG9tTm9kZSlcbiAgICByZXR1cm4gaXNOYU4oY2gpID8gaCA6IE1hdGgubWluKGgsIGNoKVxuICB9XG4gIGhlbHBlcnMuZ2V0U3R5bGUgPSBmdW5jdGlvbiAoZWwsIHByb3BlcnR5KSB7XG4gICAgcmV0dXJuIGVsLmN1cnJlbnRTdHlsZVxuICAgICAgPyBlbC5jdXJyZW50U3R5bGVbcHJvcGVydHldXG4gICAgICA6IGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpLmdldFByb3BlcnR5VmFsdWUocHJvcGVydHkpXG4gIH1cbiAgaGVscGVycy5yZXRpbmFTY2FsZSA9IGZ1bmN0aW9uIChjaGFydCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgeyByZXR1cm4gJ3RoaXMgaXMgc2VydmVyJyB9XG5cbiAgICB2YXIgcGl4ZWxSYXRpbyA9IGNoYXJ0LmN1cnJlbnREZXZpY2VQaXhlbFJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMVxuICAgIGlmIChwaXhlbFJhdGlvID09PSAxKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgY2FudmFzID0gY2hhcnQuY2FudmFzXG4gICAgdmFyIGhlaWdodCA9IGNoYXJ0LmhlaWdodFxuICAgIHZhciB3aWR0aCA9IGNoYXJ0LndpZHRoXG5cbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0ICogcGl4ZWxSYXRpb1xuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoICogcGl4ZWxSYXRpb1xuICAgIGNoYXJ0LmN0eC5zY2FsZShwaXhlbFJhdGlvLCBwaXhlbFJhdGlvKVxuXG4gICAgLy8gSWYgbm8gc3R5bGUgaGFzIGJlZW4gc2V0IG9uIHRoZSBjYW52YXMsIHRoZSByZW5kZXIgc2l6ZSBpcyB1c2VkIGFzIGRpc3BsYXkgc2l6ZSxcbiAgICAvLyBtYWtpbmcgdGhlIGNoYXJ0IHZpc3VhbGx5IGJpZ2dlciwgc28gbGV0J3MgZW5mb3JjZSBpdCB0byB0aGUgXCJjb3JyZWN0XCIgdmFsdWVzLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vY2hhcnRqcy9DaGFydC5qcy9pc3N1ZXMvMzU3NVxuICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnXG4gICAgY2FudmFzLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnXG4gIH1cbiAgLy8gLS0gQ2FudmFzIG1ldGhvZHNcbiAgaGVscGVycy5jbGVhciA9IGZ1bmN0aW9uIChjaGFydCkge1xuICAgIGNoYXJ0LmN0eC5jbGVhclJlY3QoMCwgMCwgY2hhcnQud2lkdGgsIGNoYXJ0LmhlaWdodClcbiAgfVxuICBoZWxwZXJzLmZvbnRTdHJpbmcgPSBmdW5jdGlvbiAocGl4ZWxTaXplLCBmb250U3R5bGUsIGZvbnRGYW1pbHkpIHtcbiAgICByZXR1cm4gZm9udFN0eWxlICsgJyAnICsgcGl4ZWxTaXplICsgJ3B4ICcgKyBmb250RmFtaWx5XG4gIH1cbiAgaGVscGVycy5sb25nZXN0VGV4dCA9IGZ1bmN0aW9uIChjdHgsIGZvbnQsIGFycmF5T2ZUaGluZ3MsIGNhY2hlKSB7XG4gICAgY2FjaGUgPSBjYWNoZSB8fCB7fVxuICAgIHZhciBkYXRhID0gY2FjaGUuZGF0YSA9IGNhY2hlLmRhdGEgfHwge31cbiAgICB2YXIgZ2MgPSBjYWNoZS5nYXJiYWdlQ29sbGVjdCA9IGNhY2hlLmdhcmJhZ2VDb2xsZWN0IHx8IFtdXG5cbiAgICBpZiAoY2FjaGUuZm9udCAhPT0gZm9udCkge1xuICAgICAgZGF0YSA9IGNhY2hlLmRhdGEgPSB7fVxuICAgICAgZ2MgPSBjYWNoZS5nYXJiYWdlQ29sbGVjdCA9IFtdXG4gICAgICBjYWNoZS5mb250ID0gZm9udFxuICAgIH1cblxuICAgIGN0eC5mb250ID0gZm9udFxuICAgIHZhciBsb25nZXN0ID0gMFxuICAgIGhlbHBlcnMuZWFjaChhcnJheU9mVGhpbmdzLCBmdW5jdGlvbiAodGhpbmcpIHtcbiAgICAgIC8vIFVuZGVmaW5lZCBzdHJpbmdzIGFuZCBhcnJheXMgc2hvdWxkIG5vdCBiZSBtZWFzdXJlZFxuICAgICAgaWYgKHRoaW5nICE9PSB1bmRlZmluZWQgJiYgdGhpbmcgIT09IG51bGwgJiYgaGVscGVycy5pc0FycmF5KHRoaW5nKSAhPT0gdHJ1ZSkge1xuICAgICAgICBsb25nZXN0ID0gaGVscGVycy5tZWFzdXJlVGV4dChjdHgsIGRhdGEsIGdjLCBsb25nZXN0LCB0aGluZylcbiAgICAgIH0gZWxzZSBpZiAoaGVscGVycy5pc0FycmF5KHRoaW5nKSkge1xuICAgICAgICAvLyBpZiBpdCBpcyBhbiBhcnJheSBsZXRzIG1lYXN1cmUgZWFjaCBlbGVtZW50XG4gICAgICAgIC8vIHRvIGRvIG1heWJlIHNpbXBsaWZ5IHRoaXMgZnVuY3Rpb24gYSBiaXQgc28gd2UgY2FuIGRvIHRoaXMgbW9yZSByZWN1cnNpdmVseT9cbiAgICAgICAgaGVscGVycy5lYWNoKHRoaW5nLCBmdW5jdGlvbiAobmVzdGVkVGhpbmcpIHtcbiAgICAgICAgICAvLyBVbmRlZmluZWQgc3RyaW5ncyBhbmQgYXJyYXlzIHNob3VsZCBub3QgYmUgbWVhc3VyZWRcbiAgICAgICAgICBpZiAobmVzdGVkVGhpbmcgIT09IHVuZGVmaW5lZCAmJiBuZXN0ZWRUaGluZyAhPT0gbnVsbCAmJiAhaGVscGVycy5pc0FycmF5KG5lc3RlZFRoaW5nKSkge1xuICAgICAgICAgICAgbG9uZ2VzdCA9IGhlbHBlcnMubWVhc3VyZVRleHQoY3R4LCBkYXRhLCBnYywgbG9uZ2VzdCwgbmVzdGVkVGhpbmcpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB2YXIgZ2NMZW4gPSBnYy5sZW5ndGggLyAyXG4gICAgaWYgKGdjTGVuID4gYXJyYXlPZlRoaW5ncy5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2NMZW47IGkrKykge1xuICAgICAgICBkZWxldGUgZGF0YVtnY1tpXV1cbiAgICAgIH1cbiAgICAgIGdjLnNwbGljZSgwLCBnY0xlbilcbiAgICB9XG4gICAgcmV0dXJuIGxvbmdlc3RcbiAgfVxuICBoZWxwZXJzLm1lYXN1cmVUZXh0ID0gZnVuY3Rpb24gKGN0eCwgZGF0YSwgZ2MsIGxvbmdlc3QsIHN0cmluZykge1xuICAgIHZhciB0ZXh0V2lkdGggPSBkYXRhW3N0cmluZ11cbiAgICBpZiAoIXRleHRXaWR0aCkge1xuICAgICAgdGV4dFdpZHRoID0gZGF0YVtzdHJpbmddID0gY3R4Lm1lYXN1cmVUZXh0KHN0cmluZykud2lkdGhcbiAgICAgIGdjLnB1c2goc3RyaW5nKVxuICAgIH1cbiAgICBpZiAodGV4dFdpZHRoID4gbG9uZ2VzdCkge1xuICAgICAgbG9uZ2VzdCA9IHRleHRXaWR0aFxuICAgIH1cbiAgICByZXR1cm4gbG9uZ2VzdFxuICB9XG4gIGhlbHBlcnMubnVtYmVyT2ZMYWJlbExpbmVzID0gZnVuY3Rpb24gKGFycmF5T2ZUaGluZ3MpIHtcbiAgICB2YXIgbnVtYmVyT2ZMaW5lcyA9IDFcbiAgICBoZWxwZXJzLmVhY2goYXJyYXlPZlRoaW5ncywgZnVuY3Rpb24gKHRoaW5nKSB7XG4gICAgICBpZiAoaGVscGVycy5pc0FycmF5KHRoaW5nKSkge1xuICAgICAgICBpZiAodGhpbmcubGVuZ3RoID4gbnVtYmVyT2ZMaW5lcykge1xuICAgICAgICAgIG51bWJlck9mTGluZXMgPSB0aGluZy5sZW5ndGhcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIG51bWJlck9mTGluZXNcbiAgfVxuICBoZWxwZXJzLmRyYXdSb3VuZGVkUmVjdGFuZ2xlID0gZnVuY3Rpb24gKGN0eCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgcmFkaXVzKSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgY3R4Lm1vdmVUbyh4ICsgcmFkaXVzLCB5KVxuICAgIGN0eC5saW5lVG8oeCArIHdpZHRoIC0gcmFkaXVzLCB5KVxuICAgIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKHggKyB3aWR0aCwgeSwgeCArIHdpZHRoLCB5ICsgcmFkaXVzKVxuICAgIGN0eC5saW5lVG8oeCArIHdpZHRoLCB5ICsgaGVpZ2h0IC0gcmFkaXVzKVxuICAgIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKHggKyB3aWR0aCwgeSArIGhlaWdodCwgeCArIHdpZHRoIC0gcmFkaXVzLCB5ICsgaGVpZ2h0KVxuICAgIGN0eC5saW5lVG8oeCArIHJhZGl1cywgeSArIGhlaWdodClcbiAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4LCB5ICsgaGVpZ2h0LCB4LCB5ICsgaGVpZ2h0IC0gcmFkaXVzKVxuICAgIGN0eC5saW5lVG8oeCwgeSArIHJhZGl1cylcbiAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4LCB5LCB4ICsgcmFkaXVzLCB5KVxuICAgIGN0eC5jbG9zZVBhdGgoKVxuICB9XG4gIGhlbHBlcnMuY29sb3IgPSBmdW5jdGlvbiAoYykge1xuICAgIGlmICghY29sb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvbG9yLmpzIG5vdCBmb3VuZCEnKVxuICAgICAgcmV0dXJuIGNcbiAgICB9XG5cbiAgICAvKiBnbG9iYWwgQ2FudmFzR3JhZGllbnQgKi9cbiAgICBpZiAoYyBpbnN0YW5jZW9mIENhbnZhc0dyYWRpZW50KSB7XG4gICAgICByZXR1cm4gY29sb3IoQ2hhcnQuZGVmYXVsdHMuZ2xvYmFsLmRlZmF1bHRDb2xvcilcbiAgICB9XG5cbiAgICByZXR1cm4gY29sb3IoYylcbiAgfVxuICBoZWxwZXJzLmlzQXJyYXkgPSBBcnJheS5pc0FycmF5XG4gICAgPyBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShvYmopXG4gICAgfVxuICAgIDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgfVxuICAvLyAhIEBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTQ4NTM5NzRcbiAgaGVscGVycy5hcnJheUVxdWFscyA9IGZ1bmN0aW9uIChhMCwgYTEpIHtcbiAgICB2YXIgaSwgaWxlbiwgdjAsIHYxXG5cbiAgICBpZiAoIWEwIHx8ICFhMSB8fCBhMC5sZW5ndGggIT09IGExLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgZm9yIChpID0gMCwgaWxlbiA9IGEwLmxlbmd0aDsgaSA8IGlsZW47ICsraSkge1xuICAgICAgdjAgPSBhMFtpXVxuICAgICAgdjEgPSBhMVtpXVxuXG4gICAgICBpZiAodjAgaW5zdGFuY2VvZiBBcnJheSAmJiB2MSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGlmICghaGVscGVycy5hcnJheUVxdWFscyh2MCwgdjEpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodjAgIT09IHYxKSB7XG4gICAgICAgIC8vIE5PVEU6IHR3byBkaWZmZXJlbnQgb2JqZWN0IGluc3RhbmNlcyB3aWxsIG5ldmVyIGJlIGVxdWFsOiB7eDoyMH0gIT0ge3g6MjB9XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgaGVscGVycy5jYWxsQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZm4sIGFyZ3MsIF90QXJnKSB7XG4gICAgaWYgKGZuICYmIHR5cGVvZiBmbi5jYWxsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmbi5hcHBseShfdEFyZywgYXJncylcbiAgICB9XG4gIH1cbiAgaGVscGVycy5nZXRIb3ZlckNvbG9yID0gZnVuY3Rpb24gKGNvbG9yVmFsdWUpIHtcbiAgICAvKiBnbG9iYWwgQ2FudmFzUGF0dGVybiAqL1xuICAgIHJldHVybiAoY29sb3JWYWx1ZSBpbnN0YW5jZW9mIENhbnZhc1BhdHRlcm4pXG4gICAgICA/IGNvbG9yVmFsdWVcbiAgICAgIDogaGVscGVycy5jb2xvcihjb2xvclZhbHVlKS5zYXR1cmF0ZSgwLjUpLmRhcmtlbigwLjEpLnJnYlN0cmluZygpXG4gIH1cbn1cbiIsIndpbmRvdy5OYXBjaGFydCA9IHt9XHJcblxyXG4vKiBoZWxwZXIgZnVuY3Rpb25zICovXHJcbnJlcXVpcmUoJy4vaGVscGVycycpKE5hcGNoYXJ0KVxyXG5yZXF1aXJlKCcuL2RyYXcvY2FudmFzSGVscGVycycpKE5hcGNoYXJ0KVxyXG5cclxuLyogY29uZmlnIGZpbGVzICovXHJcbnJlcXVpcmUoJy4vY29uZmlnJykoTmFwY2hhcnQpXHJcblxyXG4vKiByZWFsIHNoaXQgKi9cclxucmVxdWlyZSgnLi9jb3JlJykoTmFwY2hhcnQpXHJcblxyXG4vKiBkcmF3aW5nICovXHJcbnJlcXVpcmUoJy4vc2hhcGUvc2hhcGUnKShOYXBjaGFydClcclxucmVxdWlyZSgnLi9kcmF3L2RyYXcnKShOYXBjaGFydClcclxucmVxdWlyZSgnLi9pbnRlcmFjdENhbnZhcy9pbnRlcmFjdENhbnZhcycpKE5hcGNoYXJ0KVxyXG5cclxuLyogb3RoZXIgbW9kdWxlcyAqL1xyXG5yZXF1aXJlKCcuL2ZhbmN5bW9kdWxlJykoTmFwY2hhcnQpXHJcbi8vIHJlcXVpcmUoJy4vYW5pbWF0aW9uJykoTmFwY2hhcnQpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5OYXBjaGFydCIsIi8qXHJcbiogIGludGVyYWN0Q2FudmFzXHJcbipcclxuKiAgVGhpcyBtb2R1bGUgYWRkcyBzdXBwb3J0IGZvciBtb2RpZnlpbmcgYSBzY2hlZHVsZVxyXG4qICBkaXJlY3RseSBvbiB0aGUgY2FudmFzIHdpdGggbW91c2Ugb3IgdG91Y2hcclxuKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gIE5hcGNoYXJ0Lm9uKCdpbml0aWFsaXplJywgZnVuY3Rpb24gKGNoYXJ0KSB7XHJcbiAgICBpZighY2hhcnQuY29uZmlnLmludGVyYWN0aW9uKSByZXR1cm5cclxuXHJcbiAgICB2YXIgY2FudmFzID0gY2hhcnQuY2FudmFzXHJcblxyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaG92ZXIoZSwgY2hhcnQpXHJcbiAgICB9KVxyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgZG93bihlLCBjaGFydClcclxuICAgIH0pXHJcbiAgICAvLyBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGRvd24pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICB1cChlLCBjaGFydClcclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgdXAoZSwgY2hhcnQpXHJcbiAgICB9KVxyXG4gIC8vIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLGRlc2VsZWN0KVxyXG4gIH0pXHJcblxyXG4gIHZhciBtb3VzZUhvdmVyID0ge30sXHJcbiAgICBhY3RpdmVFbGVtZW50cyA9IFtdLFxyXG4gICAgaG92ZXJEaXN0YW5jZSA9IDYsXHJcbiAgICBzZWxlY3RlZE9wYWNpdHkgPSAxXHJcblxyXG4gIGZ1bmN0aW9uIGRvd24gKGUsIGNoYXJ0KSB7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcblxyXG4gICAgdmFyIGNhbnZhcyA9IGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudFxyXG4gICAgdmFyIGNvb3JkaW5hdGVzID0gZ2V0Q29vcmRpbmF0ZXMoZSwgY2hhcnQpXHJcbiAgICB2YXIgaGl0ID0ge31cclxuXHJcbiAgICBoaXQgPSBoaXREZXRlY3QoY2hhcnQsIGNvb3JkaW5hdGVzKVxyXG5cclxuICAgIC8vIHJldHVybiBvZiBubyBoaXRcclxuICAgIGlmIChPYmplY3Qua2V5cyhoaXQpLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgIGRlc2VsZWN0KGNoYXJ0KVxyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICAvLyBzZXQgaWRlbnRpZmllclxyXG4gICAgaWYgKHR5cGVvZiBlLmNoYW5nZWRUb3VjaGVzICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGhpdC5pZGVudGlmaWVyID0gZS5jaGFuZ2VkVG91Y2hlc1swXS5pZGVudGlmaWVyXHJcbiAgICB9ZWxzZSB7XHJcbiAgICAgIGhpdC5pZGVudGlmaWVyID0gJ21vdXNlJ1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGRlc2VsZWN0IG90aGVyIGVsZW1lbnRzIGlmIHRoZXkgYXJlIG5vdCBiZWluZyB0b3VjaGVkXHJcbiAgICBpZiAoYWN0aXZlRWxlbWVudHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGRlc2VsZWN0KGNoYXJ0KVxyXG4gICAgfVxyXG5cclxuICAgIGFjdGl2ZUVsZW1lbnRzLnB1c2goaGl0KVxyXG5cclxuICAgIGlmICh0eXBlb2YgZS5jaGFuZ2VkVG91Y2hlcyAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkcmFnKVxyXG4gICAgfWVsc2Uge1xyXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgZHJhZyhlLCBjaGFydClcclxuICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBzZWxlY3QoY2hhcnQsIGhpdC5jb3VudClcclxuXHJcbiAgICBkcmFnKGUsIGNoYXJ0KSAvLyB0byAgbWFrZSBzdXJlIHRoZSBoYW5kbGVzIHBvc2l0aW9ucyB0byB0aGUgY3Vyc29yIGV2ZW4gYmVmb3JlIG1vdmVtZW50XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRDb29yZGluYXRlcyAoZSwgY2hhcnQpIHtcclxuICAgIHZhciBtb3VzZVgsbW91c2VZXHJcbiAgICB2YXIgY2FudmFzID0gY2hhcnQuY2FudmFzXHJcbiAgICAvLyBvcmlnbyBpcyAoMCwwKVxyXG4gICAgdmFyIGJvdW5kaW5nUmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG5cclxuICAgIHZhciB3aWR0aCA9IGNhbnZhcy53aWR0aFxyXG4gICAgdmFyIGhlaWdodCA9IGNhbnZhcy5oZWlnaHRcclxuXHJcbiAgICBpZiAoZS5jaGFuZ2VkVG91Y2hlcykge1xyXG4gICAgICBtb3VzZVggPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggLSBib3VuZGluZ1JlY3QubGVmdFxyXG4gICAgICBtb3VzZVkgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wXHJcbiAgICB9ZWxzZSB7XHJcbiAgICAgIG1vdXNlWCA9IGUuY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0XHJcbiAgICAgIG1vdXNlWSA9IGUuY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3BcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiBtb3VzZVgsXHJcbiAgICAgIHk6IG1vdXNlWVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGl0RGV0ZWN0IChjaGFydCwgY29vcmRpbmF0ZXMpIHtcclxuICAgIHZhciBjYW52YXMgPSBjaGFydC5jYW52YXNcclxuICAgIHZhciBkYXRhID0gY2hhcnQuZGF0YVxyXG5cclxuICAgIC8vIHdpbGwgcmV0dXJuOlxyXG4gICAgLy8gbmFtZSAoY29yZSwgbmFwLCBidXN5KVxyXG4gICAgLy8gY291bnQgKDAsIDEsIDIgLi4pXHJcbiAgICAvLyB0eXBlIChzdGFydCwgZW5kLCBvciBtaWRkbGUpXHJcblxyXG4gICAgdmFyIGhpdCA9IGZhbHNlXHJcbiAgICB2YXIgdmFsdWUsIHBvaW50LCBpLCBkaXN0YW5jZVxyXG5cclxuICAgIC8vIGhpdCBkZXRlY3Rpb24gb2YgaGFuZGxlcyAod2lsbCBvdmVyd3JpdGUgY3VycmVudCBtb3VzZUhvdmVyIG9iamVjdFxyXG4gICAgLy8gZnJvbSBkcmF3IGlmIGhvdmVyaW5nIGEgaGFuZGxlKTpcclxuICAgIC8vIGZvciAodmFyIG5hbWUgaW4gZGF0YSkge1xyXG4gICAgLy8gICBpZiAodHlwZW9mIGJhckNvbmZpZ1tuYW1lXS5yYW5nZUhhbmRsZXMgPT0gJ3VuZGVmaW5lZCcgfHwgIWJhckNvbmZpZ1tuYW1lXS5yYW5nZUhhbmRsZXMpXHJcbiAgICAvLyAgICAgY29udGludWVcclxuXHJcbiAgICAvLyAgIGZvciAoaSA9IDA7IGkgPCBkYXRhW25hbWVdLmxlbmd0aDsgaSsrKSB7XHJcblxyXG4gICAgLy8gICAgIC8vIGlmIGVsZW1lbnQgaXMgbm90IHNlbGVjdGVkLCBjb250aW51ZVxyXG4gICAgLy8gICAgIGlmICghY2hhcnQuY2hlY2tFbGVtZW50U3RhdGUoJ3NlbGVjdGVkJywgbmFtZSwgaSkpXHJcbiAgICAvLyAgICAgICBjb250aW51ZVxyXG5cclxuICAgIC8vICAgICBmb3IgKHMgPSAwOyBzIDwgMjsgcysrKSB7XHJcbiAgICAvLyAgICAgICB2YWx1ZSA9IGRhdGFbbmFtZV1baV1bWydzdGFydCcsICdlbmQnXVtzXV1cclxuICAgIC8vICAgICAgIHBvaW50ID0gaGVscGVycy5taW51dGVzVG9YWSh2YWx1ZSwgYmFyQ29uZmlnW25hbWVdLm91dGVyUmFkaXVzICogZHJhdy5kcmF3UmF0aW8pXHJcblxyXG4gICAgLy8gICAgICAgZGlzdGFuY2UgPSBoZWxwZXJzLmRpc3RhbmNlKHBvaW50LngsIHBvaW50LnksIGNvb3JkaW5hdGVzLngsIGNvb3JkaW5hdGVzLnkpXHJcbiAgICAvLyAgICAgICBpZiAoZGlzdGFuY2UgPCBob3ZlckRpc3RhbmNlICogZHJhdy5kcmF3UmF0aW8pIHtcclxuICAgIC8vICAgICAgICAgaWYgKHR5cGVvZiBoaXQuZGlzdGFuY2UgPT0gJ3VuZGVmaW5lZCcgfHwgZGlzdGFuY2UgPCBoaXQuZGlzdGFuY2UpIHtcclxuICAgIC8vICAgICAgICAgICAvLyBvdmVyd3JpdGUgY3VycmVudCBoaXQgb2JqZWN0XHJcbiAgICAvLyAgICAgICAgICAgaGl0ID0ge1xyXG4gICAgLy8gICAgICAgICAgICAgbmFtZTogbmFtZSxcclxuICAgIC8vICAgICAgICAgICAgIGNvdW50OiBpLFxyXG4gICAgLy8gICAgICAgICAgICAgdHlwZTogWydzdGFydCcsICdlbmQnXVtzXSxcclxuICAgIC8vICAgICAgICAgICAgIGRpc3RhbmNlOiBkaXN0YW5jZVxyXG4gICAgLy8gICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgfVxyXG4gICAgLy8gICAgIH1cclxuICAgIC8vICAgfVxyXG4gICAgLy8gfVxyXG5cclxuICAgIC8vIGlmIG5vIGhhbmRsZSBpcyBoaXQsIGNoZWNrIGZvciBtaWRkbGUgaGl0XHJcblxyXG4gICAgaWYgKE9iamVjdC5rZXlzKGhpdCkubGVuZ3RoID09IDApIHtcclxuXHJcbiAgICAgIHZhciBpbmZvID0gaGVscGVycy5YWXRvSW5mbyhjaGFydCwgY29vcmRpbmF0ZXMueCwgY29vcmRpbmF0ZXMueSlcclxuXHJcbiAgICAgIC8vIGxvb3AgdGhyb3VnaCBlbGVtZW50c1xyXG4gICAgICBkYXRhLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaW5kZXgpIHtcclxuXHJcbiAgICAgICAgLy8gY2hlY2sgaWYgcG9pbnQgaXMgaW5zaWRlIGVsZW1lbnQgaG9yaXpvbnRhbGx5XHJcbiAgICAgICAgaWYgKGhlbHBlcnMuaXNJbnNpZGUoaW5mby5taW51dGVzLCBlbGVtZW50LnN0YXJ0LCBlbGVtZW50LmVuZCkpIHtcclxuXHJcbiAgICAgICAgICAvLyBjaGVjayBpZiBwb2ludCBpcyBpbnNpZGUgZWxlbWVudCB2ZXJ0aWNhbGx5XHJcbiAgICAgICAgICB2YXIgaW5uZXJSYWRpdXMgPSBlbGVtZW50LnR5cGUubGFuZS5zdGFydFxyXG4gICAgICAgICAgdmFyIG91dGVyUmFkaXVzID0gZWxlbWVudC50eXBlLmxhbmUuZW5kXHJcblxyXG4gICAgICAgICAgaWYgKGluZm8uZGlzdGFuY2UgPiBpbm5lclJhZGl1cyAmJiBpbmZvLmRpc3RhbmNlIDwgb3V0ZXJSYWRpdXMpIHtcclxuICAgICAgICAgICAgcG9zaXRpb25JbkVsZW1lbnQgPSBpbmZvLm1pbnV0ZXMtZWxlbWVudC5zdGFydFxyXG4gICAgICAgICAgICBoaXQgPSB7XHJcbiAgICAgICAgICAgICAgZWxlbWVudDogZWxlbWVudCxcclxuICAgICAgICAgICAgICBjb3VudDogaW5kZXgsXHJcbiAgICAgICAgICAgICAgdHlwZTogJ3dob2xlJyxcclxuICAgICAgICAgICAgICBwb3NpdGlvbkluRWxlbWVudDogcG9zaXRpb25JbkVsZW1lbnRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICAgXHJcbiAgICB9XHJcblxyXG5cclxuICAgIHJldHVybiBoaXRcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGhvdmVyIChlLCBjaGFydCkge1xyXG4gICAgdmFyIGNvb3JkaW5hdGVzID0gZ2V0Q29vcmRpbmF0ZXMoZSwgY2hhcnQpXHJcbiAgICB2YXIgaGl0ID0gaGl0RGV0ZWN0KGNoYXJ0LCBjb29yZGluYXRlcylcclxuXHJcbiAgICBpZihoaXQpe1xyXG4gICAgICBjaGFydC5zZXRFbGVtZW50U3RhdGUoaGl0LmNvdW50LCAnaG92ZXInKVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIGNoYXJ0LnJlbW92ZUVsZW1lbnRTdGF0ZXMoKVxyXG4gICAgfVxyXG5cclxuICAgIGNoYXJ0LnJlZHJhdygpXHJcbiAgfVxyXG5cclxuXHJcbiAgZnVuY3Rpb24gZHJhZyAoZSwgY2hhcnQpIHtcclxuICAgIHZhciBpZGVudGlmaWVyID0gZmluZElkZW50aWZpZXIoZSlcclxuXHJcbiAgICB2YXIgZHJhZ0VsZW1lbnQgPSBnZXRBY3RpdmVFbGVtZW50KGlkZW50aWZpZXIpXHJcblxyXG4gICAgaWYgKCFkcmFnRWxlbWVudCkge1xyXG4gICAgICByZXR1cm5cclxuICAgIH1cclxuXHJcbiAgICAvLyBleHBvc2UgbWludXRlcyB2YXJpYWJsZSB0byBnZXRNb3ZlVmFsdWVzKCkgZnVuY3Rpb25cclxuICAgIHZhciBjb29yZGluYXRlcyA9IGdldENvb3JkaW5hdGVzKGUsIGNoYXJ0KVxyXG4gICAgdmFyIG1pbnV0ZXMgPSBoZWxwZXJzLlhZdG9JbmZvKGNoYXJ0LCBjb29yZGluYXRlcy54LCBjb29yZGluYXRlcy55KS5taW51dGVzXHJcbiAgICB2YXIgZWxlbWVudCA9IGRyYWdFbGVtZW50LmVsZW1lbnRcclxuXHJcbiAgICB2YXIgcG9zaXRpb25JbkVsZW1lbnQgPSBkcmFnRWxlbWVudC5wb3NpdGlvbkluRWxlbWVudFxyXG4gICAgdmFyIGR1cmF0aW9uID0gaGVscGVycy5yYW5nZShlbGVtZW50LnN0YXJ0LCBlbGVtZW50LmVuZClcclxuXHJcbiAgICBlbGVtZW50LnN0YXJ0ID0gaGVscGVycy5saW1pdChtaW51dGVzIC0gcG9zaXRpb25JbkVsZW1lbnQpXHJcbiAgICBlbGVtZW50LmVuZCA9IGhlbHBlcnMubGltaXQoZWxlbWVudC5zdGFydCArIGR1cmF0aW9uKVxyXG5cclxuICAgIGNoYXJ0LnJlZHJhdygpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB1bmZvY3VzIChlKSB7XHJcbiAgICAvLyBjaGVja3MgaWYgY2xpY2sgaXMgb24gYSBwYXJ0IG9mIHRoZSBzaXRlIHRoYXQgc2hvdWxkIG1ha2UgdGhlXHJcbiAgICAvLyBjdXJyZW50IHNlbGVjdGVkIGVsZW1lbnRzIGJlIGRlc2VsZWN0ZWRcclxuXHJcbiAgICB2YXIgeCwgeVxyXG4gICAgdmFyIGRvbUVsZW1lbnRcclxuXHJcbiAgICB4ID0gZS5jbGllbnRYXHJcbiAgICB5ID0gZS5jbGllbnRZXHJcblxyXG4gICAgdmFyIGRvbUVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZWxlY3QgKGNoYXJ0LCBjb3VudCkge1xyXG4gICAgLy8gbm90aWZ5IGNvcmUgbW9kdWxlOlxyXG4gICAgY2hhcnQuc2V0U2VsZWN0ZWQoY291bnQpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkZXNlbGVjdCAoY2hhcnQsIGNvdW50KSB7XHJcbiAgICBpZiAodHlwZW9mIGNvdW50ID09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIC8vIGRlc2VsZWN0IGFsbFxyXG4gICAgICBjaGFydC5kZXNlbGVjdCgpXHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGRyYWcpXHJcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGRyYWcpXHJcbiAgICB9XHJcbiAgICAvLyBkZXNlbGVjdCBvbmVcclxuICAgIGNoYXJ0LmRlc2VsZWN0KGNvdW50KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmluZElkZW50aWZpZXIgKGUpIHtcclxuICAgIGlmIChlLnR5cGUuc2VhcmNoKCdtb3VzZScpID49IDApIHtcclxuICAgICAgcmV0dXJuICdtb3VzZSdcclxuICAgIH1lbHNlIHtcclxuICAgICAgcmV0dXJuIGUuY2hhbmdlZFRvdWNoZXNbMF0uaWRlbnRpZmllclxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0QWN0aXZlRWxlbWVudCAoaWRlbnRpZmllcikge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3RpdmVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoYWN0aXZlRWxlbWVudHNbaV0uaWRlbnRpZmllciA9PSBpZGVudGlmaWVyKSB7XHJcbiAgICAgICAgcmV0dXJuIGFjdGl2ZUVsZW1lbnRzW2ldXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVtb3ZlQWN0aXZlRWxlbWVudCAoaWRlbnRpZmllcikge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3RpdmVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoYWN0aXZlRWxlbWVudHNbaV0uaWRlbnRpZmllciA9PSBpZGVudGlmaWVyKSB7XHJcbiAgICAgICAgYWN0aXZlRWxlbWVudHMuc3BsaWNlKGksIDEpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVwIChlLCBjaGFydCkge1xyXG4gICAgdmFyIGlkZW50aWZpZXIgPSBmaW5kSWRlbnRpZmllcihlKVxyXG4gICAgdmFyIGVsZW1lbnQgPSBnZXRBY3RpdmVFbGVtZW50KGlkZW50aWZpZXIpXHJcblxyXG4gICAgaWYgKGFjdGl2ZUVsZW1lbnRzLmxlbmd0aCAhPSAwKSB7XHJcbiAgICAgIC8vIGNoYXJ0SGlzdG9yeS5hZGQobmFwY2hhcnRDb3JlLmdldFNjaGVkdWxlKCksICdtb3ZlZCAnICsgZWxlbWVudC5uYW1lICsgJyAnICsgKGVsZW1lbnQuY291bnQgKyAxKSlcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaW5kIHRoZSBzaGl0IHRvIHJlbW92ZVxyXG4gICAgcmVtb3ZlQWN0aXZlRWxlbWVudChpZGVudGlmaWVyKVxyXG5cclxuICAgIGNoYXJ0LnJlZHJhd1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc25hcCAoaW5wdXQpIHtcclxuICAgIHZhciBvdXRwdXQgPSBpbnB1dFxyXG5cclxuICAgIGlmIChzZXR0aW5ncy5nZXRWYWx1ZSgnc25hcDEwJykpIHtcclxuICAgICAgb3V0cHV0ID0gMTAgKiBNYXRoLnJvdW5kKGlucHV0IC8gMTApXHJcbiAgICB9ZWxzZSBpZiAoc2V0dGluZ3MuZ2V0VmFsdWUoJ3NuYXA1JykpIHtcclxuICAgICAgb3V0cHV0ID0gNSAqIE1hdGgucm91bmQoaW5wdXQgLyA1KVxyXG4gICAgfWVsc2Uge1xyXG5cclxuICAgICAgLy8gaG91clxyXG4gICAgICBpZiAoaW5wdXQgJSA2MCA8IDcpXHJcbiAgICAgICAgb3V0cHV0ID0gaW5wdXQgLSBpbnB1dCAlIDYwXHJcbiAgICAgIGVsc2UgaWYgKGlucHV0ICUgNjAgPiA1MylcclxuICAgICAgICBvdXRwdXQgPSBpbnB1dCArICg2MCAtIGlucHV0ICUgNjApXHJcblxyXG4gICAgICAvLyBoYWxmIGhvdXJzXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlucHV0ICs9IDMwXHJcblxyXG4gICAgICAgIGlmIChpbnB1dCAlIDYwIDwgNSlcclxuICAgICAgICAgIG91dHB1dCA9IGlucHV0IC0gaW5wdXQgJSA2MCAtIDMwXHJcbiAgICAgICAgZWxzZSBpZiAoaW5wdXQgJSA2MCA+IDU1KVxyXG4gICAgICAgICAgb3V0cHV0ID0gaW5wdXQgKyAoNjAgLSBpbnB1dCAlIDYwKSAtIDMwXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb3V0cHV0XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGVja1N0YXRlIChlbGVtZW50LCBuYW1lLCBjb3VudCwgdHlwZSkge1xyXG4gICAgLy8gY2hlY2tzIGlmXHJcbiAgICBmdW5jdGlvbiBjaGVjayAoZWxlbWVudCkge1xyXG4gICAgICBpZiAobmFtZSA9PSBlbGVtZW50Lm5hbWUgJiYgY291bnQgPT0gZWxlbWVudC5jb3VudCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgdHlwZSA9PSAndW5kZWZpbmVkJyB8fCB0eXBlID09IGVsZW1lbnQudHlwZSkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodHlwZW9mIGVsZW1lbnQuZWxlbWVudHMgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgLy8gdGhlcmUgYXJlIG1vcmUgdGhhbiBvbmUgZWxlbWVudFxyXG4gICAgICByZXR1cm4gZWxlbWVudC5lbGVtZW50cy5zb21lKGNoZWNrKVxyXG4gICAgfWVsc2Uge1xyXG4gICAgICAvLyBvbmUgZWxlbWVudFxyXG4gICAgICByZXR1cm4gY2hlY2soZWxlbWVudClcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiLyoqXHJcbiAqXHJcbiAqIGZ1bmN0aW9uIGNhbGN1bGF0ZVNoYXBlXHJcbiAqIFxyXG4gKiBUaGlzIGZ1bmN0aW9uIHRha2VzIGEgbm9ybWFsIHNoYXBlIGRlZmluaXRpb24gb2JqZWN0XHJcbiAqIGFuZCBjYWxjdWxhdGVzIHBvc2l0aW9ucyBhbmQgc2l6ZXNcclxuICpcclxuICogUmV0dXJucyBhIG1vcmUgZGV0YWlsZWQgc2hhcGUgb2JqZWN0IHRoYXQgaXMgbGF0ZXJcclxuICogYXNzaWduZWQgdG8gY2hhcnQuc2hhcGUgYW5kIHVzZWQgd2hlbiBkcmF3aW5nXHJcbiAqXHJcbiAqL1xyXG5cclxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNhbGN1bGF0ZVNoYXBlKGNoYXJ0LCBzaGFwZSl7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgcmFkaWFucyBvciBtaW51dGVzIHByb3BlcnRpZXNcclxuICAgICAqL1xyXG5cclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICBpZihlbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuICAgICAgICBlbGVtZW50Lmxlbmd0aCA9IGVsZW1lbnQudmFsdWVcclxuICAgICAgICBlbGVtZW50LnJhZGlhbnMgPSBlbGVtZW50LnZhbHVlXHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICBlbGVtZW50Lmxlbmd0aCA9IGVsZW1lbnQudmFsdWVcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgb3V0IHRvdGFsUmFkaWFuc1xyXG4gICAgICogVGhpcyBiZSAyICogUEkgaWYgdGhlIHNoYXBlIGlzIGNpcmN1bGFyXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgdG90YWxSYWRpYW5zID0gMFxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgIC8vIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICAgIHRvdGFsUmFkaWFucyArPSBlbGVtZW50LnZhbHVlXHJcbiAgICAgIC8vIH1cclxuICAgIH0pXHJcblxyXG5cclxuICAgIC8vICpcclxuICAgIC8vICAqIEZpbmQgdGhlIHN1bSBvZiBtaW51dGVzIGluIHRoZSBsaW5lIGVsZW1lbnRzXHJcbiAgICAvLyAgKiBBcmMgZWxlbWVudHMgZG9lcyBub3QgZGVmaW5lIG1pbnV0ZXMsIG9ubHkgcmFkaWFuc1xyXG4gICAgIFxyXG5cclxuICAgIC8vIHZhciB0b3RhbE1pbnV0ZXMgPSAwXHJcbiAgICAvLyBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIC8vICAgaWYoZWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG4gICAgLy8gICAgIHRvdGFsTWludXRlcyArPSBlbGVtZW50Lm1pbnV0ZXNcclxuICAgIC8vICAgfVxyXG4gICAgLy8gfSlcclxuXHJcbiAgICAvLyBpZih0b3RhbE1pbnV0ZXMgPiAxNDQwKXtcclxuICAgIC8vICAgdGhyb3cgbmV3IEVycignVG9vIG1hbnkgbWludXRlcyBpbiBsaW5lIHNlZ21lbnRzJylcclxuICAgIC8vIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgb3V0IGFuZ2xlIG9mIHNoYXBlc1xyXG4gICAgICovXHJcblxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpKSB7XHJcbiAgICAgIGlmKGkgPT09IDApIGVsZW1lbnQuc3RhcnRBbmdsZSA9IDAgXHJcbiAgICAgIGVsc2UgZWxlbWVudC5zdGFydEFuZ2xlID0gc2hhcGVbaS0xXS5lbmRBbmdsZVxyXG4gICAgICBcclxuICAgICAgaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgZWxlbWVudC5lbmRBbmdsZSA9IGVsZW1lbnQuc3RhcnRBbmdsZSArIGVsZW1lbnQucmFkaWFuc1xyXG4gICAgICB9ZWxzZSBpZihlbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAgICAgZWxlbWVudC5lbmRBbmdsZSA9IGVsZW1lbnQuc3RhcnRBbmdsZVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZCBvdXQgbGVuZ3RoIG9mIHRoZSBzaGFwZXNcclxuICAgICAqIFxyXG4gICAgICogUGVyaW1ldGVyIG9mIGNpcmNsZSA9IDIgKiByYWRpdXMgKiBQSVxyXG4gICAgICovXHJcblxyXG4gICAgLy8gdmFyIG1pbnV0ZUxlbmd0aFJhdGlvID0gMC40NVxyXG4gICAgLy8gdmFyIGZvdW5kQXJjID0gc2hhcGUuc29tZShmdW5jdGlvbihlbGVtZW50LCBpKSB7XHJcbiAgICAvLyAgIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgLy8gICAgIGVsZW1lbnQubGVuZ3RoID0gYmFzZVJhZGl1cyAqIGVsZW1lbnQucmFkaWFuc1xyXG4gICAgLy8gICAgIGlmKGVsZW1lbnQubWludXRlcyAhPSAwKVxyXG4gICAgLy8gICAgIG1pbnV0ZUxlbmd0aFJhdGlvID0gZWxlbWVudC5sZW5ndGggLyBlbGVtZW50Lm1pbnV0ZXNcclxuICAgIC8vICAgICBjb25zb2xlLmxvZyhlbGVtZW50Lmxlbmd0aCwgZWxlbWVudC5taW51dGVzKVxyXG4gICAgLy8gICAgIHJldHVybiB0cnVlXHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH0pXHJcblxyXG4gICAgdmFyIHRvdGFsTGVuZ3RoID0gMFxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpKSB7XHJcbiAgICAgIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICAgIGVsZW1lbnQubGVuZ3RoID0gZWxlbWVudC5sZW5ndGggKiBjaGFydC5jb25maWcuYmFzZVJhZGl1c1xyXG4gICAgICB9ZWxzZSBpZihlbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAgICAgZWxlbWVudC5sZW5ndGggPSBlbGVtZW50Lmxlbmd0aCAqIGNoYXJ0LnJhdGlvXHJcbiAgICAgIH1cclxuICAgICAgdG90YWxMZW5ndGggKz0gZWxlbWVudC5sZW5ndGhcclxuICAgIH0pXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgaG93IG1hbnkgbWludXRlcyBlYWNoIGFyYyBlbGVtZW50IHNob3VsZCBnZXRcclxuICAgICAqIGJhc2VkIG9uIGhvdyBtYW55IG1pbnV0ZXMgYXJlIGxlZnQgYWZ0ZXIgbGluZSBlbGVtZW50c1xyXG4gICAgICogZ2V0IHdoYXQgdGhleSBzaG91bGQgaGF2ZVxyXG4gICAgICovXHJcblxyXG4gICAgdmFyIG1pbnV0ZXNMZWZ0Rm9yQXJjcyA9IDE0NDAgXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgZWxlbWVudC5taW51dGVzID0gTWF0aC5jZWlsKChlbGVtZW50Lmxlbmd0aCAvIHRvdGFsTGVuZ3RoKSAqIDE0NDApXHJcbiAgICB9KVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogT2ssIHNvIHRvdGFsTWludXRlcyBpcyBub3cgMTQ0MFxyXG4gICAgICogTm93IHdlIG5lZWQgdG8gY3JlYXRlIGEgLnN0YXJ0IGFuZCAuZW5kIHBvaW50IG9uIGFsbFxyXG4gICAgICogdGhlIHNoYXBlIGVsZW1lbnRzXHJcbiAgICAgKi9cclxuXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgaWYoaSA9PT0gMCkgZWxlbWVudC5zdGFydCA9IDBcclxuICAgICAgZWxzZSBpZihpID4gMCkgZWxlbWVudC5zdGFydCA9IHNoYXBlW2ktMV0uZW5kXHJcbiAgICAgIGVsZW1lbnQuZW5kID0gZWxlbWVudC5zdGFydCArIGVsZW1lbnQubWludXRlc1xyXG4gICAgfSlcclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSBzdGFydFBvaW50cyBhbmQgZW5kUG9pbnRzXHJcbiAgICAgKiBGaXJzdCBwb2ludCBpcyBjZW50ZXJcclxuICAgICAqIFRoZSBwb2ludCBvbmx5IGNoYW5nZXMgb24gbGluZS1zZWdtZW50c1xyXG4gICAgICovXHJcblxyXG4gICAgdmFyIGNlbnRlciA9IHtcclxuICAgICAgeDpjaGFydC53LzIsXHJcbiAgICAgIHk6Y2hhcnQuaC8yXHJcbiAgICB9XHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgaWYoaSA9PT0gMCl7XHJcbiAgICAgICAgZWxlbWVudC5zdGFydFBvaW50ID0gY2VudGVyXHJcbiAgICAgICAgZWxlbWVudC5lbmRQb2ludCA9IGNlbnRlclxyXG4gICAgICB9ZWxzZSBpZihlbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuICAgICAgICBlbGVtZW50LnN0YXJ0UG9pbnQgPSBzaGFwZVtpLTFdLmVuZFBvaW50XHJcbiAgICAgICAgZWxlbWVudC5lbmRQb2ludCA9IHNoYXBlW2ktMV0uZW5kUG9pbnRcclxuICAgICAgfWVsc2UgaWYoZWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG4gICAgICAgIGVsZW1lbnQuc3RhcnRQb2ludCA9IHNoYXBlW2ktMV0uZW5kUG9pbnRcclxuICAgICAgfVxyXG4gICAgICBpZihlbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAgICAgZWxlbWVudC5lbmRQb2ludCA9IHtcclxuICAgICAgICAgIHg6IGVsZW1lbnQuc3RhcnRQb2ludC54ICsgTWF0aC5jb3MoZWxlbWVudC5zdGFydEFuZ2xlKSAqIGVsZW1lbnQubGVuZ3RoLFxyXG4gICAgICAgICAgeTogZWxlbWVudC5zdGFydFBvaW50LnkgKyBNYXRoLnNpbihlbGVtZW50LnN0YXJ0QW5nbGUpICogZWxlbWVudC5sZW5ndGhcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDZW50ZXIgdGhlIHNoYXBlXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgbGltaXRzID0ge31cclxuICAgIGZ1bmN0aW9uIHB1c2hMaW1pdHMocG9pbnQpe1xyXG4gICAgICBpZihPYmplY3Qua2V5cyhsaW1pdHMpLmxlbmd0aCA9PT0gMCl7XHJcbiAgICAgICAgbGltaXRzID0ge1xyXG4gICAgICAgICAgdXA6IHBvaW50LnksXHJcbiAgICAgICAgICBkb3duOiBwb2ludC55LFxyXG4gICAgICAgICAgbGVmdDogcG9pbnQueCxcclxuICAgICAgICAgIHJpZ2h0OiBwb2ludC54XHJcbiAgICAgICAgfVxyXG4gICAgICB9ZWxzZXtcclxuICAgICAgICBpZihwb2ludC55IDwgbGltaXRzLnVwKSBsaW1pdHMudXAgPSBwb2ludC55XHJcbiAgICAgICAgaWYocG9pbnQueSA+IGxpbWl0cy5kb3duKSBsaW1pdHMuZG93biA9IHBvaW50LnlcclxuICAgICAgICBpZihwb2ludC54IDwgbGltaXRzLmxlZnQpIGxpbWl0cy5sZWZ0ID0gcG9pbnQueFxyXG4gICAgICAgIGlmKHBvaW50LnggPiBsaW1pdHMucmlnaHQpIGxpbWl0cy5yaWdodCA9IHBvaW50LnhcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpKSB7XHJcbiAgICAgIHB1c2hMaW1pdHMoZWxlbWVudC5zdGFydFBvaW50KVxyXG4gICAgICBwdXNoTGltaXRzKGVsZW1lbnQuZW5kUG9pbnQpXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIHdlIG5lZWQgdG8ga25vdyB0aGUgZGlzdGFuY2VzIHRvIHRoZSBlZGdlIG9mIHRoZSBjYW52YXNcclxuICAgIGxpbWl0cy5kb3duID0gY2hhcnQuaCAtIGxpbWl0cy5kb3duXHJcbiAgICBsaW1pdHMucmlnaHQgPSBjaGFydC53IC0gbGltaXRzLnJpZ2h0XHJcblxyXG4gICAgLy8gdGhlIGRpc3RhbmNlcyBzaG91bGQgYmUgZXF1YWwsIHRoZXJlZm9yZSwgc2hpZnQgdGhlIHBvaW50c1xyXG4gICAgLy8gaWYgaXQgaXMgbm90XHJcbiAgICB2YXIgc2hpZnRMZWZ0ID0gKGxpbWl0cy5sZWZ0IC0gbGltaXRzLnJpZ2h0KSAvIDJcclxuICAgIHZhciBzaGlmdFVwID0gKGxpbWl0cy51cCAtIGxpbWl0cy5kb3duKSAvIDJcclxuICAgIFxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpKSB7XHJcbiAgICAgIGVsZW1lbnQuc3RhcnRQb2ludCA9IHtcclxuICAgICAgICB4OiBlbGVtZW50LnN0YXJ0UG9pbnQueCAtIHNoaWZ0TGVmdCxcclxuICAgICAgICB5OiBlbGVtZW50LnN0YXJ0UG9pbnQueSAtIHNoaWZ0VXBcclxuICAgICAgfVxyXG4gICAgICBlbGVtZW50LmVuZFBvaW50ID0ge1xyXG4gICAgICAgIHg6IGVsZW1lbnQuZW5kUG9pbnQueCAtIHNoaWZ0TGVmdCxcclxuICAgICAgICB5OiBlbGVtZW50LmVuZFBvaW50LnkgLSBzaGlmdFVwXHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgcmV0dXJuIHNoYXBlXHJcbiAgfVxyXG5cclxuICAiLCIvKlxyXG4qXHJcbiogU2hhcGUgbW9kdWxlXHJcbipcclxuKi9cclxuXHJcbnZhciBzaGFwZXMgPSByZXF1aXJlKCcuL3NoYXBlcycpXHJcbnZhciBjYWxjdWxhdGVTaGFwZSA9IHJlcXVpcmUoJy4vY2FsY3VsYXRlU2hhcGUnKVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTmFwY2hhcnQpIHtcclxuICB2YXIgaGVscGVycyA9IE5hcGNoYXJ0LmhlbHBlcnNcclxuICB2YXIgY3VycmVudFNoYXBlXHJcblxyXG4gIE5hcGNoYXJ0Lm9uKCdpbml0aWFsaXplJywgZnVuY3Rpb24oY2hhcnQpIHtcclxuICAgICAgc2V0U2hhcGUoY2hhcnQsIGNoYXJ0LmNvbmZpZy5zaGFwZSlcclxuICAgICAgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmxvZ28nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAvLyAgIGNoYW5nZVNoYXBlKGNoYXJ0KVxyXG4gICAgICAvLyB9KVxyXG4gIH0pXHJcblxyXG4gIE5hcGNoYXJ0Lm9uKCdzZXRTaGFwZScsIHNldFNoYXBlKSBcclxuXHJcbiAgLy8gYWRkIHNvbWUgZXh0cmEgaGVscGVyc1xyXG4gIHZhciBzaGFwZUhlbHBlcnMgPSByZXF1aXJlKCcuL3NoYXBlSGVscGVycycpKE5hcGNoYXJ0KVxyXG5cclxuICBmdW5jdGlvbiBzZXRTaGFwZShjaGFydCwgc2hhcGUpIHtcclxuICAgIGlmKHR5cGVvZiBzaGFwZSA9PSAnc3RyaW5nJyl7XHJcbiAgICAgIGN1cnJlbnRTaGFwZSA9IHNoYXBlXHJcbiAgICAgIHNoYXBlID0gc2hhcGVzW3NoYXBlXVxyXG4gICAgfVxyXG5cclxuICAgIGNoYXJ0LnNoYXBlID0gY2FsY3VsYXRlU2hhcGUoY2hhcnQsIHNoYXBlKVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2hhbmdlU2hhcGUoY2hhcnQpIHtcclxuICAgIC8vIGlmKGN1cnJlbnRTaGFwZSA9PT0gJ3NtaXNsZScpe1xyXG4gICAgLy8gICBjaGFydC5hbmltYXRlU2hhcGUoc2hhcGVzWydjaXJjbGUnXSlcclxuICAgIC8vICAgY3VycmVudFNoYXBlID0gJ2NpcmNsZSdcclxuICAgIC8vIH1cclxuICAgIC8vIGNoYXJ0LmFuaW1hdGVTaGFwZShzaGFwZXNbJ2hvcml6b250YWxFbGxpcHNlJ10pXHJcbiAgICB2YXIgbmV4dCA9IGZhbHNlXHJcbiAgICBmb3IocHJvcCBpbiBzaGFwZXMpe1xyXG4gICAgICBpZihuZXh0KXtcclxuICAgICAgICBjaGFydC5hbmltYXRlU2hhcGUoc2hhcGVzW3Byb3BdKVxyXG4gICAgICAgIGN1cnJlbnRTaGFwZSA9IHByb3BcclxuICAgICAgICBuZXh0ID0gZmFsc2VcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICBpZihjdXJyZW50U2hhcGUgPT09IHByb3Ape1xyXG4gICAgICAgIG5leHQgPSB0cnVlXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmKG5leHQgPT09IHRydWUpe1xyXG4gICAgICBjaGFydC5hbmltYXRlU2hhcGUoc2hhcGVzWydjaXJjbGUnXSlcclxuICAgICAgY3VycmVudFNoYXBlID0gJ2NpcmNsZSdcclxuICAgIH1cclxuXHJcbiAgICBjaGFydC5yZWRyYXcoKVxyXG4gIH1cclxuXHJcblxyXG59XHJcbiIsIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihOYXBjaGFydCkge1xyXG4gIFxyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG5cclxuICBoZWxwZXJzLlhZdG9JbmZvID0gZnVuY3Rpb24gKGNoYXJ0LCB4LCB5KXtcclxuICAgIC8vIHdpbGwgZ2F0aGVyIHR3byB0aGluZ3M6IG1pbnV0ZXMgYW5kIGRpc3RhbmNlIGZyb20gYmFzZXBvaW50XHJcbiAgICB2YXIgbWludXRlcywgZGlzdGFuY2VcclxuICAgIHZhciBzaGFwZSA9IGNoYXJ0LnNoYXBlXHJcblxyXG4gICAgLy8gd2hpY2ggaGFzIGluIHNlY3Rvcj9cclxuICAgIHZhciBlbGVtZW50c0luU2VjdG9yID0gW11cclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCxpKSB7XHJcbiAgICAgIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICAgIHZhciBhbmdsZSA9IGhlbHBlcnMuYW5nbGVCZXR3ZWVuVHdvUG9pbnRzKHgsIHksIGVsZW1lbnQuc3RhcnRQb2ludClcclxuICAgICAgICBpZihhbmdsZSA+IGVsZW1lbnQuc3RhcnRBbmdsZSAmJiBhbmdsZSA8IGVsZW1lbnQuZW5kQW5nbGUpe1xyXG4gICAgICAgICAgZWxlbWVudHNJblNlY3Rvci5wdXNoKGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICB9ZWxzZSBpZihlbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAgICAgdmFyIGFuZ2xlMSA9IGhlbHBlcnMuYW5nbGVCZXR3ZWVuVHdvUG9pbnRzKHgsIHksIGVsZW1lbnQuc3RhcnRQb2ludClcclxuICAgICAgICB2YXIgYW5nbGUyID0gaGVscGVycy5hbmdsZUJldHdlZW5Ud29Qb2ludHMoeCwgeSwgZWxlbWVudC5lbmRQb2ludClcclxuXHJcbiAgICAgICAgICBpZihpID09IDEpe1xyXG5cclxuICAgICAgICAgIGNvbnNvbGUubG9nKGFuZ2xlMSwgZWxlbWVudC5zdGFydEFuZ2xlLCBlbGVtZW50LnN0YXJ0QW5nbGUgKyBNYXRoLlBJLzIpXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhoZWxwZXJzLmlzSW5zaWRlQW5nbGUoYW5nbGUxLCBlbGVtZW50LnN0YXJ0QW5nbGUsIGVsZW1lbnQuc3RhcnRBbmdsZSArIE1hdGguUEkvMikpXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhhbmdsZTIsIGVsZW1lbnQuc3RhcnRBbmdsZSAtIE1hdGguUEkvMiwgZWxlbWVudC5zdGFydEFuZ2xlKVxyXG4gICAgICAgICAgY29uc29sZS5sb2coaGVscGVycy5pc0luc2lkZUFuZ2xlKGFuZ2xlMiwgZWxlbWVudC5zdGFydEFuZ2xlIC0gTWF0aC5QSS8yLCBlbGVtZW50LnN0YXJ0QW5nbGUpKVxyXG4gICAgICAgICAgfSBcclxuICAgICAgICBpZihoZWxwZXJzLmlzSW5zaWRlQW5nbGUoYW5nbGUxLCBlbGVtZW50LnN0YXJ0QW5nbGUsIGVsZW1lbnQuc3RhcnRBbmdsZSArIE1hdGguUEkvMikgJiZcclxuICAgICAgICAgIGhlbHBlcnMuaXNJbnNpZGVBbmdsZShhbmdsZTIsIGVsZW1lbnQuc3RhcnRBbmdsZSAtIE1hdGguUEkvMiwgZWxlbWVudC5zdGFydEFuZ2xlKSl7XHJcbiAgICAgICAgICBlbGVtZW50c0luU2VjdG9yLnB1c2goZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLy8gZmluZCB0aGUgY2xvc2VzdFxyXG4gICAgLy8gdGhpcyBpcyBvbmx5IHVzZWZ1bCBpZiB0aGUgc2hhcGUgZ29lcyBhcm91bmQgaXRzZWxmIChleGFtcGxlOiBzcGlyYWwpXHJcbiAgICB2YXIgc2hhcGVFbGVtZW50XHJcbiAgICBlbGVtZW50c0luU2VjdG9yLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICB2YXIgdGhpc0Rpc3RhbmNlXHJcbiAgICAgIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICAgIHRoaXNEaXN0YW5jZSA9IGhlbHBlcnMuZGlzdGFuY2UoeCwgeSwgZWxlbWVudC5zdGFydFBvaW50KVxyXG4gICAgICB9ZWxzZSBpZihlbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAgICAgdGhpc0Rpc3RhbmNlID0gaGVscGVycy5kaXN0YW5jZUZyb21Qb2ludFRvTGluZSh4LCB5LCBlbGVtZW50LnN0YXJ0UG9pbnQsIGVsZW1lbnQuZW5kUG9pbnQpXHJcbiAgICAgIH1cclxuICAgICAgaWYodHlwZW9mIGRpc3RhbmNlID09ICd1bmRlZmluZWQnIHx8IHRoaXNEaXN0YW5jZSA8IGRpc3RhbmNlKXtcclxuICAgICAgICBkaXN0YW5jZSA9IHRoaXNEaXN0YW5jZVxyXG4gICAgICAgIHNoYXBlRWxlbWVudCA9IGVsZW1lbnRcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBjYWxjdWxhdGUgdGhlIHJlbGF0aXZlIHBvc2l0aW9uIGluc2lkZSB0aGUgZWxlbWVudFxyXG4gICAgLy8gYW5kIGZpbmQgbWludXRlc1xyXG4gICAgdmFyIHBvc2l0aW9uSW5TaGFwZUVsZW1lbnRcclxuXHJcbiAgICBpZihzaGFwZUVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICB2YXIgYW5nbGUgPSBoZWxwZXJzLmFuZ2xlQmV0d2VlblR3b1BvaW50cyh4LCB5LCBzaGFwZUVsZW1lbnQuc3RhcnRQb2ludClcclxuICAgICAgcG9zaXRpb25JblNoYXBlRWxlbWVudCA9IGhlbHBlcnMuZ2V0UHJvZ3Jlc3NCZXR3ZWVuVHdvVmFsdWVzKGFuZ2xlLCBzaGFwZUVsZW1lbnQuc3RhcnRBbmdsZSwgc2hhcGVFbGVtZW50LmVuZEFuZ2xlKVxyXG4gICAgfWVsc2UgaWYoc2hhcGVFbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAgIHZhciBhID0gaGVscGVycy5kaXN0YW5jZUZyb21Qb2ludFRvTGluZSh4LCB5LCBzaGFwZUVsZW1lbnQuc3RhcnRQb2ludCwgc2hhcGVFbGVtZW50LmVuZFBvaW50KVxyXG4gICAgICB2YXIgYiA9IGhlbHBlcnMuZGlzdGFuY2UoeCwgeSwgc2hhcGVFbGVtZW50LnN0YXJ0UG9pbnQpXHJcbiAgICAgIHZhciBsZW5ndGggPSBNYXRoLnNxcnQoYipiIC0gYSphKVxyXG4gICAgICBwb3NpdGlvbkluU2hhcGVFbGVtZW50ID0gbGVuZ3RoIC8gc2hhcGVFbGVtZW50Lmxlbmd0aFxyXG4gICAgfSBcclxuICAgIFxyXG4gICAgdmFyIG1pbnV0ZXMgPSBoZWxwZXJzLnJhbmdlKHNoYXBlRWxlbWVudC5zdGFydCwgc2hhcGVFbGVtZW50LmVuZCkgKiBwb3NpdGlvbkluU2hhcGVFbGVtZW50ICsgc2hhcGVFbGVtZW50LnN0YXJ0XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgbWludXRlczogbWludXRlcyxcclxuICAgICAgZGlzdGFuY2U6IGRpc3RhbmNlLFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgaGVscGVycy5taW51dGVzVG9YWSA9IGZ1bmN0aW9uIChjaGFydCwgbWludXRlcywgcmFkaXVzKXtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAgIHZhciBzaGFwZSA9IGNoYXJ0LnNoYXBlXHJcblxyXG4gICAgdmFyIG1pbnV0ZXMgPSBoZWxwZXJzLmxpbWl0KG1pbnV0ZXMpO1xyXG4gICAgLy8gRmluZCBvdXQgd2hpY2ggc2hhcGVFbGVtZW50IHdlIGZpbmQgb3VyIHBvaW50IGluXHJcbiAgICB2YXIgc2hhcGVFbGVtZW50ID0gc2hhcGUuZmluZChmdW5jdGlvbiAoZWxlbWVudCl7XHJcbiAgICAgIHJldHVybiAobWludXRlcyA+PSBlbGVtZW50LnN0YXJ0ICYmIG1pbnV0ZXMgPD0gZWxlbWVudC5lbmQpXHJcbiAgICB9KVxyXG4gICAgaWYodHlwZW9mIHNoYXBlRWxlbWVudCA9PSAndW5kZWZpbmVkJyl7XHJcbiAgICAgIGNvbnNvbGUubG9nKG1pbnV0ZXMpXHJcbiAgICAgIGNvbnNvbGUubG9nKHNoYXBlLmZpbmQoZnVuY3Rpb24gKGVsZW1lbnQpe1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGVsZW1lbnQpXHJcbiAgICAgICAgcmV0dXJuIChtaW51dGVzID49IGVsZW1lbnQuc3RhcnQgJiYgbWludXRlcyA8PSBlbGVtZW50LmVuZClcclxuICAgICAgfSkpXHJcbiAgICB9XHJcbiAgICBcclxuICAgIC8vIERlY2ltYWwgdXNlZCB0byBjYWxjdWxhdGUgd2hlcmUgdGhlIHBvaW50IGlzIGluc2lkZSB0aGUgc2hhcGVcclxuICAgIHZhciBwb3NpdGlvbkluU2hhcGUgPSAobWludXRlcyAtIHNoYXBlRWxlbWVudC5zdGFydCkgLyBzaGFwZUVsZW1lbnQubWludXRlc1xyXG5cclxuICAgIGlmKHNoYXBlRWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG5cclxuICAgICAgdmFyIGJhc2VQb2ludCA9IHtcclxuICAgICAgICB4OiBzaGFwZUVsZW1lbnQuc3RhcnRQb2ludC54ICsgTWF0aC5jb3Moc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUpICogcG9zaXRpb25JblNoYXBlICogc2hhcGVFbGVtZW50Lmxlbmd0aCxcclxuICAgICAgICB5OiBzaGFwZUVsZW1lbnQuc3RhcnRQb2ludC55ICsgTWF0aC5zaW4oc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUpICogcG9zaXRpb25JblNoYXBlICogc2hhcGVFbGVtZW50Lmxlbmd0aFxyXG4gICAgICB9XHJcbiAgICAgIHZhciBwb2ludCA9IHtcclxuICAgICAgICB4OiBiYXNlUG9pbnQueCArIE1hdGguY29zKHNoYXBlRWxlbWVudC5zdGFydEFuZ2xlLU1hdGguUEkvMikgKiByYWRpdXMsXHJcbiAgICAgICAgeTogYmFzZVBvaW50LnkgKyBNYXRoLnNpbihzaGFwZUVsZW1lbnQuc3RhcnRBbmdsZS1NYXRoLlBJLzIpICogcmFkaXVzXHJcbiAgICAgIH1cclxuXHJcbiAgICB9ZWxzZSBpZiAoc2hhcGVFbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuXHJcbiAgICAgIHZhciBjZW50ZXJPZkFyYyA9IHNoYXBlRWxlbWVudC5zdGFydFBvaW50O1xyXG4gICAgICB2YXIgYW5nbGUgPSBwb3NpdGlvbkluU2hhcGUgKiBzaGFwZUVsZW1lbnQucmFkaWFuc1xyXG4gICAgICB2YXIgcG9pbnQgPSB7XHJcbiAgICAgICAgeDogY2VudGVyT2ZBcmMueCArIE1hdGguY29zKHNoYXBlRWxlbWVudC5zdGFydEFuZ2xlICsgYW5nbGUgLU1hdGguUEkvMikgKiByYWRpdXMsXHJcbiAgICAgICAgeTogY2VudGVyT2ZBcmMueSArIE1hdGguc2luKHNoYXBlRWxlbWVudC5zdGFydEFuZ2xlICsgYW5nbGUgLU1hdGguUEkvMikgKiByYWRpdXNcclxuICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcG9pbnRcclxuICB9XHJcblxyXG4gIGhlbHBlcnMuY3JlYXRlQ3VydmUgPSBmdW5jdGlvbiBjcmVhdGVDdXJ2ZShjaGFydCwgc3RhcnQsIGVuZCwgcmFkaXVzLCBhbnRpY2xvY2t3aXNlKXtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuXHJcbiAgICBpZih0eXBlb2YgYW50aWNsb2Nrd2lzZSA9PSAndW5kZWZpbmVkJyl7XHJcbiAgICAgIHZhciBhbnRpY2xvY2t3aXNlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNoYXBlID0gY2hhcnQuc2hhcGUuc2xpY2UoKTtcclxuICAgIGlmKGFudGljbG9ja3dpc2Upe1xyXG4gICAgICBzaGFwZS5yZXZlcnNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmluZCBvdXQgd2hpY2ggc2hhcGVFbGVtZW50IGhhcyB0aGUgc3RhcnQgYW5kIGVuZFxyXG4gICAgdmFyIHN0YXJ0RWxlbWVudEluZGV4LCBlbmRFbGVtZW50SW5kZXhcclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaSkge1xyXG4gICAgICBpZihoZWxwZXJzLmlzSW5zaWRlKHN0YXJ0LCBlbGVtZW50LnN0YXJ0LCBlbGVtZW50LmVuZCkpe1xyXG4gICAgICAgIHN0YXJ0RWxlbWVudEluZGV4ID0gaVxyXG4gICAgICB9XHJcbiAgICAgIGlmKGhlbHBlcnMuaXNJbnNpZGUoZW5kLCBlbGVtZW50LnN0YXJ0LCBlbGVtZW50LmVuZCkpe1xyXG4gICAgICAgIGVuZEVsZW1lbnRJbmRleCA9IGk7XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICBcclxuICAgIHZhciBzaGFwZUVsZW1lbnRzID0gW11cclxuICAgIC8vIGNyZWF0ZSBpdGVyYWJsZSB0YXNrIGFycmF5XHJcbiAgICB2YXIgdGFza0FycmF5ID0gW107XHJcbiAgICB2YXIgc2tpcEVuZENoZWNrID0gZmFsc2U7XHJcbiAgICB2YXIgZGVmYXVsdFRhc2s7XHJcbiAgICBpZihhbnRpY2xvY2t3aXNlKXtcclxuICAgICAgZGVmYXVsdFRhc2sgPSB7XHJcbiAgICAgICAgc3RhcnQ6IDEsXHJcbiAgICAgICAgZW5kOiAwXHJcbiAgICAgIH1cclxuICAgIH1lbHNle1xyXG4gICAgICBkZWZhdWx0VGFzayA9IHtcclxuICAgICAgICBzdGFydDogMCxcclxuICAgICAgICBlbmQ6IDFcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZvciAodmFyIGkgPSBzdGFydEVsZW1lbnRJbmRleDsgaSA8IHNoYXBlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIHZhciB0YXNrID0ge1xyXG4gICAgICAgIHNoYXBlRWxlbWVudDogc2hhcGVbaV0sXHJcbiAgICAgICAgc3RhcnQ6IGRlZmF1bHRUYXNrLnN0YXJ0LFxyXG4gICAgICAgIGVuZDogZGVmYXVsdFRhc2suZW5kXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmKGkgPT0gc3RhcnRFbGVtZW50SW5kZXgpe1xyXG4gICAgICAgIHRhc2suc3RhcnQgPSBoZWxwZXJzLmdldFBvc2l0aW9uQmV0d2VlblR3b1ZhbHVlcyhzdGFydCxzaGFwZVtpXS5zdGFydCxzaGFwZVtpXS5lbmQpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKGkgPT0gZW5kRWxlbWVudEluZGV4KXtcclxuICAgICAgICB0YXNrLmVuZCA9IGhlbHBlcnMuZ2V0UG9zaXRpb25CZXR3ZWVuVHdvVmFsdWVzKGVuZCxzaGFwZVtpXS5zdGFydCxzaGFwZVtpXS5lbmQpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmKGkgPT0gc3RhcnRFbGVtZW50SW5kZXggJiYgaSA9PSBlbmRFbGVtZW50SW5kZXggJiYgKHRhc2suZW5kID4gdGFzay5zdGFydCAmJiBhbnRpY2xvY2t3aXNlKSB8fCAodGFzay5lbmQgPCB0YXNrLnN0YXJ0ICYmICFhbnRpY2xvY2t3aXNlKSl7XHJcbiAgICAgICAgLy8gbWFrZSBzdXJlIHRoaW5ncyBhcmUgY29ycmVjdCB3aGVuIGVuZCBpcyBsZXNzIHRoYW4gc3RhcnRcclxuICAgICAgICBpZih0YXNrQXJyYXkubGVuZ3RoID09IDApe1xyXG4gICAgICAgICAgLy8gaXQgaXMgYmVnaW5uaW5nXHJcbiAgICAgICAgICB0YXNrLmVuZCA9IGRlZmF1bHRUYXNrLmVuZDtcclxuICAgICAgICAgIHNraXBFbmRDaGVjayA9IHRydWU7XHJcbiAgICAgICAgfWVsc2Uge1xyXG4gICAgICAgICAgLy8gaXQgaXMgZW5kXHJcbiAgICAgICAgICB0YXNrLnN0YXJ0ID0gZGVmYXVsdFRhc2suc3RhcnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB0YXNrQXJyYXkucHVzaCh0YXNrKTtcclxuXHJcbiAgICAgIGlmKGkgPT0gZW5kRWxlbWVudEluZGV4KXtcclxuICAgICAgICBpZihza2lwRW5kQ2hlY2spe1xyXG4gICAgICAgICAgc2tpcEVuZENoZWNrID0gZmFsc2U7XHJcbiAgICAgICAgICAvLyBsZXQgaXQgcnVuIGEgcm91bmQgYW5kIGFkZCBhbGwgc2hhcGVzXHJcbiAgICAgICAgfWVsc2V7XHJcbiAgICAgICAgICAvLyBmaW5pc2hlZC4uIG5vdGhpbmcgbW9yZSB0byBkbyBoZXJlIVxyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBpZiB3ZSByZWFjaGVkIGVuZCBvZiBhcnJheSB3aXRob3V0IGhhdmluZyBmb3VuZFxyXG4gICAgICAvLyB0aGUgZW5kIHBvaW50LCBpdCBtZWFucyB0aGF0IHdlIGhhdmUgdG8gZ28gdG9cclxuICAgICAgLy8gdGhlIGJlZ2lubmluZyBhZ2FpblxyXG4gICAgICAvLyBleC4gd2hlbiBzdGFydDo3MDAgZW5kOjMwMFxyXG4gICAgICBpZihpID09IHNoYXBlLmxlbmd0aC0xKXtcclxuICAgICAgICBpID0gLTE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRhc2tBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHRhc2ssIGkpIHtcclxuICAgICAgdmFyIHNoYXBlRWxlbWVudCA9IHRhc2suc2hhcGVFbGVtZW50O1xyXG4gICAgICBpZihzaGFwZUVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICAgIHZhciBzaGFwZVN0YXJ0ID0gc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUtKE1hdGguUEkvMik7XHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gc2hhcGVTdGFydCArICh0YXNrQXJyYXlbaV0uc3RhcnQgKiBzaGFwZUVsZW1lbnQucmFkaWFucyk7XHJcbiAgICAgICAgdmFyIGVuZCA9IHNoYXBlU3RhcnQgKyAodGFza0FycmF5W2ldLmVuZCAqIHNoYXBlRWxlbWVudC5yYWRpYW5zKTtcclxuICAgICAgICBjdHguYXJjKHNoYXBlRWxlbWVudC5zdGFydFBvaW50LngsIHNoYXBlRWxlbWVudC5zdGFydFBvaW50LnksIHJhZGl1cywgc3RhcnQsIGVuZCwgYW50aWNsb2Nrd2lzZSk7XHJcbiAgICAgIH1lbHNlIGlmKHNoYXBlRWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG4gICAgICAgIHZhciBzdGFydFBvaW50ID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCxzaGFwZUVsZW1lbnQuc3RhcnQgKyBzaGFwZUVsZW1lbnQubWludXRlcyAqIHRhc2suc3RhcnQsIHJhZGl1cylcclxuICAgICAgICB2YXIgZW5kUG9pbnQgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LHNoYXBlRWxlbWVudC5zdGFydCArIHNoYXBlRWxlbWVudC5taW51dGVzICogdGFzay5lbmQsIHJhZGl1cylcclxuICAgICAgICBjdHgubGluZVRvKHN0YXJ0UG9pbnQueCxzdGFydFBvaW50LnkpXHJcbiAgICAgICAgY3R4LmxpbmVUbyhlbmRQb2ludC54LGVuZFBvaW50LnkpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBoZWxwZXJzLmNyZWF0ZVNlZ21lbnQgPSBmdW5jdGlvbiAoY2hhcnQsIG91dGVyLCBpbm5lciwgc3RhcnQsIGVuZCkge1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBOYXBjaGFydC5oZWxwZXJzLmNyZWF0ZUN1cnZlKGNoYXJ0LCBzdGFydCwgZW5kLCBvdXRlcilcclxuICAgIE5hcGNoYXJ0LmhlbHBlcnMuY3JlYXRlQ3VydmUoY2hhcnQsIGVuZCwgc3RhcnQsIGlubmVyLCB0cnVlKVxyXG4gICAgY3R4LmNsb3NlUGF0aCgpXHJcbiAgfVxyXG5cclxufVxyXG4iLCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGNpcmNsZTogW1xyXG4gICAge1xyXG4gICAgICB0eXBlOiAnYXJjJyxcclxuICAgICAgdmFsdWU6IE1hdGguUEkqMlxyXG4gICAgfSxcclxuICBdLFxyXG4gIGxpbmU6IFtcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICB2YWx1ZTogMTAwXHJcbiAgICB9LFxyXG4gIF0sXHJcbiAgaG9yaXpvbnRhbEVsbGlwc2U6IFtcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2FyYycsXHJcbiAgICAgIHZhbHVlOiBNYXRoLlBJIC8gNFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICB2YWx1ZTogMjBcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdhcmMnLFxyXG4gICAgICB2YWx1ZTogTWF0aC5QSVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICB2YWx1ZTogMjBcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdhcmMnLFxyXG4gICAgICB2YWx1ZTogTWF0aC5QSSAqIDMgLyA0XHJcbiAgICB9XHJcbiAgXSxcclxuICBzbWlsZTogW1xyXG4gICAge1xyXG4gICAgICB0eXBlOiAnYXJjJyxcclxuICAgICAgdmFsdWU6IE1hdGguUElcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgdmFsdWU6IDE1MFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2FyYycsXHJcbiAgICAgIHZhbHVlOiBNYXRoLlBJXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgIHZhbHVlOiAxNTBcclxuICAgIH1cclxuICBdLFxyXG4gIC8vIHZlcnRpY2FsRWxsaXBzZTogW1xyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnYXJjJyxcclxuICAvLyAgICAgdmFsdWU6IE1hdGguUEkvMlxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2xpbmUnLFxyXG4gIC8vICAgICB2YWx1ZTogMTUwXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnYXJjJyxcclxuICAvLyAgICAgdmFsdWU6IE1hdGguUElcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdsaW5lJyxcclxuICAvLyAgICAgdmFsdWU6IDE1MFxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2FyYycsXHJcbiAgLy8gICAgIHZhbHVlOiBNYXRoLlBJLzJcclxuICAvLyAgIH1cclxuICAvLyBdLFxyXG4gIC8vIGZ1Y2tlZDogW1xyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnYXJjJyxcclxuICAvLyAgICAgdmFsdWU6IE1hdGguUEkvMiozXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnbGluZScsXHJcbiAgLy8gICAgIHZhbHVlOiAxMDBcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdhcmMnLFxyXG4gIC8vICAgICB2YWx1ZTogTWF0aC5QSS8yXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnbGluZScsXHJcbiAgLy8gICAgIHZhbHVlOiAxMDBcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdhcmMnLFxyXG4gIC8vICAgICB2YWx1ZTogTWF0aC5QSS8yXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnbGluZScsXHJcbiAgLy8gICAgIHZhbHVlOiA1MFxyXG4gIC8vICAgfSxcclxuICAvLyBdXHJcbn0iXX0=

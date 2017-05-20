(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

module.exports = function (Napchart) {
  Napchart.config = {
    interaction: true,
    shape: 'circle',
    baseRadius:32,
    font:'helvetica',
    layers:[16, 20, 28, 34, 38],
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
	handlesClickDistance: 5
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
    'animateShape':[],
    'interaction':[]
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
        setElementState: function(element, state) {
          this.removeElementStates()
          element.state = state

          this.redraw()
        },
        removeElementStates: function() {
          this.data.elements.forEach(function(element) {
            delete element.state
          })
        },
        setSelected: function(element){
          this.data.selected.push(element)
        },
        isSelected: function(element) {
          if(this.data.selected.indexOf(element) >= 0){
            return true
          }
          return false
        },
        deselect: function() {
          this.data.selected = []
          this.redraw()
        },
        addElement: function(typeString) {
          if(typeof typeString == 'undefined'){
            var typeString = 'default'
          }
          var defaultElement = {
            start:120,
            end:210,
            type:'default'
          }
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
          elements = elements.map(function(element) {
            return initElement(element, chart)
          })
          this.data.elements = elements;
          fireHook('dataChange', this)
        },
        updateElements: function(elements) {
          this.data.elements = elements;
          fireHook('dataChange', this)
        },
        redraw: function() {
          fireHook('dataChange', this)
        },
        dataChanged: function() {
          // fireHook('dataChange', this)
          fireHook('interaction', this)
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

  function initElement(element, chart) {

    // ** assign type based on typeString value

    if(typeof element.typeString == 'undefined'){
      element.typeString = 'default'
    }
    var type = chart.types[element.typeString]

    // check if type exists
    if(typeof type == 'undefined'){
      throw new Error(`Type ${element.typeString} does not exist`)
    }
    element.type = chart.types[element.typeString]

    // ** add id

    element.id = helpers.uid()

    return element
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

  helpers.circle = function(chart, point, radius){
    var ctx = chart.ctx
    ctx.beginPath()
    ctx.arc(point.x, point.y, radius, 0, Math.PI*2)
    ctx.closePath()
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
module.exports = function (chart, Napchart) {
  var ctx = chart.ctx
  var data = chart.data
  var canvas = ctx.canvas
  var helpers = Napchart.helpers

  data.selected.forEach(function(element) {
    var lane = element.type.lane
    var style = element.type.style

    ctx.save()

    var handle1 = helpers.minutesToXY(chart, element.start, lane.end)
    var handle2 = helpers.minutesToXY(chart, element.end, lane.end)
    
    ctx.fillStyle = style.color

    helpers.circle(chart, handle1, style.handleBig);
    ctx.fill()
    helpers.circle(chart, handle2, style.handleBig);
    ctx.fill()


    ctx.fillStyle = 'white'

    helpers.circle(chart, handle1, style.handleSmall);
    ctx.fill()
    helpers.circle(chart, handle2, style.handleSmall);
    ctx.fill()



    ctx.restore()
  })
}

},{}],7:[function(require,module,exports){


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
    handles: require('./content/handles'),
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

},{"./clear":4,"./content/bars":5,"./content/handles":6,"./face/circles":8,"./face/lines":9,"./face/text":10,"./styles":11}],8:[function(require,module,exports){
module.exports = function (chart, Napchart) {
  var layers = chart.config.layers
  var ctx = chart.ctx
  ctx.lineWidth = chart.config.face.stroke

  ctx.strokeStyle = chart.config.face.strokeColor
  for (var i = layers.length - 2; i >= layers.length - 3; i--) {
  	ctx.beginPath()
    Napchart.helpers.createCurve(chart, 1, 0, layers[i])
    ctx.stroke()
  }

  ctx.strokeStyle = chart.config.face.weakStrokeColor
  for (var i = layers.length - 4; i >= layers.length - 4; i--) {
  	ctx.beginPath()
    Napchart.helpers.createCurve(chart, 1, 0, layers[i])
    ctx.stroke()
  }
  
  ctx.beginPath()
  Napchart.helpers.createCurve(chart, 1, 0, 0)
  ctx.stroke()
}

},{}],9:[function(require,module,exports){
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
  	var s = helpers.minutesToXY(chart, i*60, lanes[lanes.length - 2].start)
  	var e = helpers.minutesToXY(chart, i*60, lanes[lanes.length - 2].end + config.face.hourStrokesLength)
    ctx.moveTo(s.x,s.y)
    ctx.lineTo(e.x,e.y)
  }
  ctx.stroke()

  // every hour weak

  ctx.strokeStyle = config.face.weakStrokeColor
  ctx.beginPath()

  for(var i=0;i<24;i++){
    var s = helpers.minutesToXY(chart, i*60, lanes[lanes.length - 3].start)
    var e = helpers.minutesToXY(chart, i*60, lanes[lanes.length - 3].end)
    ctx.moveTo(s.x,s.y)
    ctx.lineTo(e.x,e.y)
  }
  ctx.stroke()


  // important hours

  ctx.lineWidth = config.face.importantLineWidth
  ctx.strokeStyle = config.face.importantStrokeColor
  ctx.beginPath()

  for(var i=0;i<24;i = i+4){
    var s = helpers.minutesToXY(chart, i*60, lanes[lanes.length - 2].start)
    var e = helpers.minutesToXY(chart, i*60, lanes[lanes.length - 2].end + config.face.hourStrokesLength)
    ctx.moveTo(s.x,s.y)
    ctx.lineTo(e.x,e.y)
  }
  
  ctx.stroke()

  // every 10 minutes

  /*
  ctx.strokeStyle = config.face.strokeColor
  ctx.beginPath()


  for(var i=0;i<1440/10;i++){
    var s = helpers.minutesToXY(chart, i*10, lanes[lanes.length - 2].end)
    var e = helpers.minutesToXY(chart, i*10, lanes[lanes.length - 2].end + config.face.tenMinuteStrokesLength)
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
    var s = helpers.minutesToXY(chart, i*10, lanes[lanes.length - 2].end)
    var e = helpers.minutesToXY(chart, i*10, lanes[lanes.length - 2].end + config.face.fiveMinuteStrokesLength)
    ctx.moveTo(s.x,s.y)
    ctx.lineTo(e.x,e.y)
  }

  ctx.stroke()
  */


  
  
  ctx.restore()
}

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){


module.exports = function (Napchart) {
  var helpers = Napchart.helpers
  var styles = Napchart.styles = {
    
  }

  styles.default = {
    color: 'black',
    opacities: {
      noScale:true,
      opacity: 0.6,
      hoverOpacity: 0.5,
      activeOpacity: 0.5,
    },
    stroke: {
      lineWidth:3
    },
	handleBig:7,
	handleSmall:3
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
},{}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
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

},{}],14:[function(require,module,exports){
window.Napchart = {}

/* helper functions */
require('./helpers')(Napchart)
require('./draw/canvasHelpers')(Napchart)

/* config files */
require('./config')(Napchart)
require('./types')(Napchart)

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
},{"./config":1,"./core":2,"./draw/canvasHelpers":3,"./draw/draw":7,"./fancymodule":12,"./helpers":13,"./interactCanvas/interactCanvas":15,"./shape/shape":17,"./types":20}],15:[function(require,module,exports){
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

    select(chart, hit.origin)

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

      // if element is not selected, continue
      if (!chart.isSelected(element)){
        return
      }
      ['start', 'end'].forEach(function(startOrEnd) {
        var point = helpers.minutesToXY(chart, element[startOrEnd], element.type.lane.end)
        
        distance = helpers.distance(point.x, point.y, coordinates)
        if(distance < chart.config.handlesClickDistance){
          if (typeof hit.distance == 'undefined' || distance < hit.distance) {
            hit = {
              origin: element,
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

        // check if point is inside element horizontally
        if (helpers.isInside(info.minutes, element.start, element.end)) {

          // check if point is inside element vertically
          var innerRadius = element.type.lane.start
          var outerRadius = element.type.lane.end

          if (info.distance > innerRadius && info.distance < outerRadius) {
            positionInElement = info.minutes-element.start
            hit = {
              origin: element,
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
      // chart.setElementState(hit.count, 'hover')
    }else{
      // chart.removeElementStates()
    }

    // chart.redraw()
  }


  function drag (e, chart) {
    var identifier = findIdentifier(e)

    var dragElement = getActiveElement(identifier)

    if (!dragElement) {
      return
    }

    var coordinates = getCoordinates(e, chart)
    var minutes = helpers.XYtoInfo(chart, coordinates.x, coordinates.y).minutes
    var originElement = dragElement.origin

    if(dragElement.type == 'start' || dragElement.type == 'end'){
      originElement[dragElement.type] = snap(minutes)
    }
    else if(dragElement.type == 'whole'){
      var positionInElement = dragElement.positionInElement
      var duration = helpers.range(originElement.start, originElement.end)

      originElement.start = snap(helpers.limit(Math.round(minutes - positionInElement)))
      originElement.end = helpers.limit(Math.round(originElement.start + duration))
    }
    chart.dataChanged()

    function snap(input) {
      return 5 * Math.round(input / 5)
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

  function select (chart, element) {
    // notify core module:
    chart.setSelected(element)
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
}

},{}],16:[function(require,module,exports){
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

  
},{}],17:[function(require,module,exports){
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

},{"./calculateShape":16,"./shapeHelpers":18,"./shapes":19}],18:[function(require,module,exports){


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

},{}],19:[function(require,module,exports){


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
},{}],20:[function(require,module,exports){

module.exports = function (Napchart) {
  Napchart.config.defaultTypes= {
      sleep: {
        style: 'red',
        noScale: true,
        lane: 3
      },
      busy: {
        style: 'blue',
        noScale: true,
        lane: 1,
      },
      default: {
      	style: 'black',
      	noScale: true,
      	lane: 2
      }
  }
}
},{}]},{},[14])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY2hhcnQvY29uZmlnLmpzIiwibGliL2NoYXJ0L2NvcmUuanMiLCJsaWIvY2hhcnQvZHJhdy9jYW52YXNIZWxwZXJzLmpzIiwibGliL2NoYXJ0L2RyYXcvY2xlYXIuanMiLCJsaWIvY2hhcnQvZHJhdy9jb250ZW50L2JhcnMuanMiLCJsaWIvY2hhcnQvZHJhdy9jb250ZW50L2hhbmRsZXMuanMiLCJsaWIvY2hhcnQvZHJhdy9kcmF3LmpzIiwibGliL2NoYXJ0L2RyYXcvZmFjZS9jaXJjbGVzLmpzIiwibGliL2NoYXJ0L2RyYXcvZmFjZS9saW5lcy5qcyIsImxpYi9jaGFydC9kcmF3L2ZhY2UvdGV4dC5qcyIsImxpYi9jaGFydC9kcmF3L3N0eWxlcy5qcyIsImxpYi9jaGFydC9mYW5jeW1vZHVsZS5qcyIsImxpYi9jaGFydC9oZWxwZXJzLmpzIiwibGliL2NoYXJ0L2luZGV4LmpzIiwibGliL2NoYXJ0L2ludGVyYWN0Q2FudmFzL2ludGVyYWN0Q2FudmFzLmpzIiwibGliL2NoYXJ0L3NoYXBlL2NhbGN1bGF0ZVNoYXBlLmpzIiwibGliL2NoYXJ0L3NoYXBlL3NoYXBlLmpzIiwibGliL2NoYXJ0L3NoYXBlL3NoYXBlSGVscGVycy5qcyIsImxpYi9jaGFydC9zaGFwZS9zaGFwZXMuanMiLCJsaWIvY2hhcnQvdHlwZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgTmFwY2hhcnQuY29uZmlnID0ge1xyXG4gICAgaW50ZXJhY3Rpb246IHRydWUsXHJcbiAgICBzaGFwZTogJ2NpcmNsZScsXHJcbiAgICBiYXNlUmFkaXVzOjMyLFxyXG4gICAgZm9udDonaGVsdmV0aWNhJyxcclxuICAgIGxheWVyczpbMTYsIDIwLCAyOCwgMzQsIDM4XSxcclxuICAgIGxhbmVzOltdLCAvLyB3aWxsIGJlIGdlbmVyYXRlZCBiYXNlZCBvbiB0aGUgbGF5ZXJzIGFycmF5XHJcbiAgICBmYWNlOiB7IC8vIGRlZmluZSBob3cgdGhlIGJhY2tncm91bmQgY2xvY2sgc2hvdWxkIGJlIGRyYXduXHJcbiAgICAgIHN0cm9rZTogMC4xNSxcclxuICAgICAgd2Vha1N0cm9rZUNvbG9yOiAnI2RkZGRkZCcsXHJcbiAgICAgIHN0cm9rZUNvbG9yOiAnIzc3Nzc3NycsXHJcbiAgICAgIGltcG9ydGFudFN0cm9rZUNvbG9yOiAnYmxhY2snLFxyXG4gICAgICBpbXBvcnRhbnRMaW5lV2lkdGg6IDAuMyxcclxuICAgICAgbnVtYmVyczoge1xyXG4gICAgICAgIHJhZGl1czogNDAsXHJcbiAgICAgICAgY29sb3I6ICcjMjYyNjI2JyxcclxuICAgICAgICBzaXplOiAzLjNcclxuICAgICAgfSxcclxuICAgICAgZml2ZU1pbnV0ZVN0cm9rZXNMZW5ndGg6IDAsXHJcbiAgICAgIHRlbk1pbnV0ZVN0cm9rZXNMZW5ndGg6IDAuNSxcclxuICAgICAgaG91clN0cm9rZXNMZW5ndGg6IDMsXHJcbiAgICB9LFxyXG5cdGhhbmRsZXNDbGlja0Rpc3RhbmNlOiA1XHJcbiAgfVxyXG59IiwiLypcclxuKiAgQ29yZSBtb2R1bGUgb2YgTmFwY2hhcnRcclxuKlxyXG4qL1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTmFwY2hhcnQpIHtcclxuICB2YXIgaGVscGVycyA9IE5hcGNoYXJ0LmhlbHBlcnNcclxuICB2YXIgbW9kdWxlcyA9IFtdXHJcbiAgdmFyIGhvb2tzID0ge1xyXG4gICAgJ2luaXRpYWxpemUnOltdLFxyXG4gICAgJ2RhdGFDaGFuZ2UnOltdLFxyXG4gICAgJ3NoYXBlQ2hhbmdlJzpbXSxcclxuICAgICdiZW5jaG1hcmsnOltdLFxyXG4gICAgJ3NldFNoYXBlJzpbXSxcclxuICAgICdhbmltYXRlU2hhcGUnOltdLFxyXG4gICAgJ2ludGVyYWN0aW9uJzpbXVxyXG4gIH1cclxuXHJcbiAgTmFwY2hhcnQub24gPSBmdW5jdGlvbihob29rLCBmKXtcclxuICAgIGhvb2tzW2hvb2tdLnB1c2goZik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmaXJlSG9vayhob29rKSB7XHJcbiAgICB2YXIgYXJncyA9IFsuLi5hcmd1bWVudHNdLnNsaWNlKDEpXHJcbiAgICAvLyBjb25zb2xlLmxvZyhhcmdzKVxyXG4gICAgaG9va3NbaG9va10uZm9yRWFjaChmdW5jdGlvbihmKXtcclxuICAgICAgZihhcmdzWzBdLCBhcmdzWzFdKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIE5hcGNoYXJ0LmluaXQgPSBmdW5jdGlvbiAoY3R4LCBjb25maWcpIHtcclxuICAgIFxyXG4gICAgdmFyIGNoYXJ0ID0gKGZ1bmN0aW9uKCl7XHJcbiAgICAgIC8vIHByaXZhdGVcclxuICAgICAgLy8gdmFyIGRhdGEgPSB7fTtcclxuXHJcbiAgICAgIC8vIHB1YmxpY1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIHNldEVsZW1lbnRTdGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgc3RhdGUpIHtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlRWxlbWVudFN0YXRlcygpXHJcbiAgICAgICAgICBlbGVtZW50LnN0YXRlID0gc3RhdGVcclxuXHJcbiAgICAgICAgICB0aGlzLnJlZHJhdygpXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW1vdmVFbGVtZW50U3RhdGVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHRoaXMuZGF0YS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgZGVsZXRlIGVsZW1lbnQuc3RhdGVcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRTZWxlY3RlZDogZnVuY3Rpb24oZWxlbWVudCl7XHJcbiAgICAgICAgICB0aGlzLmRhdGEuc2VsZWN0ZWQucHVzaChlbGVtZW50KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNTZWxlY3RlZDogZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgaWYodGhpcy5kYXRhLnNlbGVjdGVkLmluZGV4T2YoZWxlbWVudCkgPj0gMCl7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRlc2VsZWN0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHRoaXMuZGF0YS5zZWxlY3RlZCA9IFtdXHJcbiAgICAgICAgICB0aGlzLnJlZHJhdygpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhZGRFbGVtZW50OiBmdW5jdGlvbih0eXBlU3RyaW5nKSB7XHJcbiAgICAgICAgICBpZih0eXBlb2YgdHlwZVN0cmluZyA9PSAndW5kZWZpbmVkJyl7XHJcbiAgICAgICAgICAgIHZhciB0eXBlU3RyaW5nID0gJ2RlZmF1bHQnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB2YXIgZGVmYXVsdEVsZW1lbnQgPSB7XHJcbiAgICAgICAgICAgIHN0YXJ0OjEyMCxcclxuICAgICAgICAgICAgZW5kOjIxMCxcclxuICAgICAgICAgICAgdHlwZTonZGVmYXVsdCdcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldEVsZW1lbnQ6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldFNoYXBlOiBmdW5jdGlvbihzaGFwZSkge1xyXG4gICAgICAgICAgZmlyZUhvb2soJ3NldFNoYXBlJywgdGhpcywgc2hhcGUpXHJcbiAgICAgICAgICBmaXJlSG9vaygnZGF0YUNoYW5nZScsIHRoaXMpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhbmltYXRlU2hhcGU6IGZ1bmN0aW9uKHNoYXBlKSB7XHJcbiAgICAgICAgICAvLyBmaXJlSG9vaygnc2V0U2hhcGUnLCB0aGlzLCBzaGFwZSlcclxuICAgICAgICAgIC8vIGZpcmVIb29rKCdkYXRhQ2hhbmdlJywgdGhpcylcclxuXHJcbiAgICAgICAgICBmaXJlSG9vaygnYW5pbWF0ZVNoYXBlJywgdGhpcywgc2hhcGUpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRFbGVtZW50czogZnVuY3Rpb24oZWxlbWVudHMpIHtcclxuICAgICAgICAgIHZhciBjaGFydCA9IHRoaXNcclxuICAgICAgICAgIGVsZW1lbnRzID0gZWxlbWVudHMubWFwKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGluaXRFbGVtZW50KGVsZW1lbnQsIGNoYXJ0KVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIHRoaXMuZGF0YS5lbGVtZW50cyA9IGVsZW1lbnRzO1xyXG4gICAgICAgICAgZmlyZUhvb2soJ2RhdGFDaGFuZ2UnLCB0aGlzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlRWxlbWVudHM6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICB0aGlzLmRhdGEuZWxlbWVudHMgPSBlbGVtZW50cztcclxuICAgICAgICAgIGZpcmVIb29rKCdkYXRhQ2hhbmdlJywgdGhpcylcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlZHJhdzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBmaXJlSG9vaygnZGF0YUNoYW5nZScsIHRoaXMpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkYXRhQ2hhbmdlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAvLyBmaXJlSG9vaygnZGF0YUNoYW5nZScsIHRoaXMpXHJcbiAgICAgICAgICBmaXJlSG9vaygnaW50ZXJhY3Rpb24nLCB0aGlzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0RGF0YTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4gdGhpcy5kYXRhXHJcbiAgICAgICAgfSxcclxuICAgICAgICBiZW5jaG1hcms6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgZmlyZUhvb2soJ2JlbmNobWFyaycsIHRoaXMpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRDb25maWc6IGZ1bmN0aW9uKGNvbmZpZykge1xyXG4gICAgICAgICAgLy8gTmFwY2hhcnQuY29uZmlnID0gY29uZmlnXHJcbiAgICAgICAgICBjaGFydC5jb25maWcgPSBjb25maWdcclxuICAgICAgICAgIHNjYWxlQ29uZmlnKGNoYXJ0LmNvbmZpZywgY2hhcnQucmF0aW8pXHJcbiAgICAgICAgICB0aGlzLnJlZHJhdygpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICB9XHJcblxyXG4gICAgfSgpKTtcclxuXHJcbiAgICAvLyBhbHNvIHB1YmxpY1xyXG4gICAgY2hhcnQuY3R4ID0gY3R4XHJcbiAgICBjaGFydC5jYW52YXMgPSBjdHguY2FudmFzXHJcbiAgICBjaGFydC53aWR0aCA9IGNoYXJ0LncgPSBjdHguY2FudmFzLndpZHRoXHJcbiAgICBjaGFydC5oZWlnaHQgPSBjaGFydC5oID0gY3R4LmNhbnZhcy5oZWlnaHRcclxuICAgIGNoYXJ0LnJhdGlvID0gY2hhcnQuaCAvIDEwMFxyXG4gICAgY2hhcnQuY29uZmlnID0gaW5pdENvbmZpZyhjb25maWcpXHJcbiAgICBjaGFydC5kYXRhID0ge1xyXG4gICAgICBlbGVtZW50czogW10sXHJcbiAgICAgIHNlbGVjdGVkOiBbXVxyXG4gICAgfVxyXG4gICAgY2hhcnQudHlwZXMgPSB7fVxyXG5cclxuXHJcbiAgICBzY2FsZUNvbmZpZyhjaGFydC5jb25maWcsIGNoYXJ0LnJhdGlvKVxyXG4gICAgYWRkRGVmYXVsdFR5cGVzKGNoYXJ0KVxyXG4gICAgcG9wdWxhdGVUeXBlcyhjaGFydClcclxuXHJcbiAgICBmaXJlSG9vaygnaW5pdGlhbGl6ZScsIGNoYXJ0KVxyXG5cclxuICAgIHJldHVybiBjaGFydFxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdENvbmZpZyAoY29uZmlnKSB7XHJcbiAgICBjb25maWcgPSBjb25maWcgfHwge31cclxuICAgIGNvbmZpZyA9IGhlbHBlcnMuZXh0ZW5kKEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoTmFwY2hhcnQuY29uZmlnKSksIGNvbmZpZylcclxuXHJcbiAgICAvLyBnZW5lcmF0ZSBsYW5lc1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb25maWcubGF5ZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmKGkgPT0gMCkgY29udGludWU7XHJcblxyXG4gICAgICBjb25maWcubGFuZXMucHVzaCh7XHJcbiAgICAgICAgc3RhcnQ6Y29uZmlnLmxheWVyc1tpLTFdLFxyXG4gICAgICAgIGVuZDpjb25maWcubGF5ZXJzW2ldXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNvbmZpZ1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaW5pdEVsZW1lbnQoZWxlbWVudCwgY2hhcnQpIHtcclxuXHJcbiAgICAvLyAqKiBhc3NpZ24gdHlwZSBiYXNlZCBvbiB0eXBlU3RyaW5nIHZhbHVlXHJcblxyXG4gICAgaWYodHlwZW9mIGVsZW1lbnQudHlwZVN0cmluZyA9PSAndW5kZWZpbmVkJyl7XHJcbiAgICAgIGVsZW1lbnQudHlwZVN0cmluZyA9ICdkZWZhdWx0J1xyXG4gICAgfVxyXG4gICAgdmFyIHR5cGUgPSBjaGFydC50eXBlc1tlbGVtZW50LnR5cGVTdHJpbmddXHJcblxyXG4gICAgLy8gY2hlY2sgaWYgdHlwZSBleGlzdHNcclxuICAgIGlmKHR5cGVvZiB0eXBlID09ICd1bmRlZmluZWQnKXtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUeXBlICR7ZWxlbWVudC50eXBlU3RyaW5nfSBkb2VzIG5vdCBleGlzdGApXHJcbiAgICB9XHJcbiAgICBlbGVtZW50LnR5cGUgPSBjaGFydC50eXBlc1tlbGVtZW50LnR5cGVTdHJpbmddXHJcblxyXG4gICAgLy8gKiogYWRkIGlkXHJcblxyXG4gICAgZWxlbWVudC5pZCA9IGhlbHBlcnMudWlkKClcclxuXHJcbiAgICByZXR1cm4gZWxlbWVudFxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2NhbGVDb25maWcgKGNvbmZpZywgcmF0aW8pIHtcclxuICAgIGZ1bmN0aW9uIHNjYWxlRm4gKGJhc2UsIHZhbHVlLCBrZXkpIHtcclxuICAgICAgaWYoYmFzZS5ub1NjYWxlKXtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmICh2YWx1ZSA+IDEgfHwgdmFsdWUgPCAxIHx8IHZhbHVlID09PSAxKSB7XHJcbiAgICAgICAgYmFzZVtrZXldID0gdmFsdWUgKiByYXRpb1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBoZWxwZXJzLmRlZXBFYWNoKGNvbmZpZywgc2NhbGVGbilcclxuICAgIHJldHVybiBjb25maWdcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGFkZERlZmF1bHRUeXBlcyhjaGFydCkge1xyXG4gICAgY2hhcnQudHlwZXMgPSBjaGFydC5jb25maWcuZGVmYXVsdFR5cGVzXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBwb3B1bGF0ZVR5cGVzKGNoYXJ0KSB7XHJcbiAgICBmb3IodmFyIHR5cGVuYW1lIGluIGNoYXJ0LnR5cGVzKXtcclxuICAgICAgdmFyIHR5cGUgPSBjaGFydC50eXBlc1t0eXBlbmFtZV1cclxuICAgICAgdHlwZS5sYW5lID0gY2hhcnQuY29uZmlnLmxhbmVzW3R5cGUubGFuZV1cclxuICAgICAgdHlwZS5zdHlsZSA9IE5hcGNoYXJ0LnN0eWxlc1t0eXBlLnN0eWxlXVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzO1xyXG5cclxuXHJcbiAgaGVscGVycy5zdHJva2VTZWdtZW50ID0gZnVuY3Rpb24oY2hhcnQsIHN0YXJ0LCBlbmQsIGNvbmZpZyl7XHJcbiAgXHR2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgXHRjdHguc2F2ZSgpXHJcbiAgXHRjdHguc3Ryb2tlU3R5bGUgPSBjb25maWcuY29sb3JcclxuICBcdGN0eC5saW5lV2lkdGggPSBjaGFydC5jb25maWcuYmFycy5nZW5lcmFsLnN0cm9rZS5saW5lV2lkdGhcclxuICBcdGN0eC5saW5lSm9pbiA9ICdtaXR0ZWwnXHJcblxyXG4gIFx0aGVscGVycy5jcmVhdGVTZWdtZW50KGNoYXJ0LCBjb25maWcub3V0ZXJSYWRpdXMsIGNvbmZpZy5pbm5lclJhZGl1cywgc3RhcnQsIGVuZCk7XHJcblxyXG4gIFx0Y3R4LnN0cm9rZSgpO1xyXG4gIFx0Y3R4LnJlc3RvcmUoKVxyXG4gIH1cclxuXHJcbiAgaGVscGVycy5jaXJjbGUgPSBmdW5jdGlvbihjaGFydCwgcG9pbnQsIHJhZGl1cyl7XHJcbiAgICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIGN0eC5hcmMocG9pbnQueCwgcG9pbnQueSwgcmFkaXVzLCAwLCBNYXRoLlBJKjIpXHJcbiAgICBjdHguY2xvc2VQYXRoKClcclxuICB9XHJcblxyXG4gIGhlbHBlcnMuY3JlYXRlRm9udFN0cmluZyA9IGZ1bmN0aW9uKGNoYXJ0LCBzaXplKSB7XHJcbiAgICByZXR1cm4gc2l6ZSArICdweCAnICsgY2hhcnQuY29uZmlnLmZvbnRcclxuICB9XHJcblxyXG59IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2hhcnQsIE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gIGN0eC5jbGVhclJlY3QoMCwwLGNoYXJ0LncsY2hhcnQuaClcclxufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYXJ0LCBOYXBjaGFydCkge1xyXG4gIHZhciBjdHggPSBjaGFydC5jdHhcclxuICB2YXIgZGF0YSA9IGNoYXJ0LmRhdGFcclxuICB2YXIgY2FudmFzID0gY3R4LmNhbnZhc1xyXG4gIHZhciBiYXJDb25maWcgPSBjaGFydC5jb25maWcuYmFyc1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG4gIFxyXG4gIC8vIGZpbGxcclxuXHJcbiAgZGF0YS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAgIHZhciB0eXBlID0gZWxlbWVudC50eXBlXHJcbiAgICB2YXIgbGFuZSA9IHR5cGUubGFuZVxyXG4gICAgdmFyIHN0eWxlID0gdHlwZS5zdHlsZVxyXG4gICAgY3R4LnNhdmUoKVxyXG4gICAgY3R4LmZpbGxTdHlsZSA9IHN0eWxlLmNvbG9yXHJcblxyXG4gICAgc3dpdGNoKGVsZW1lbnQuc3RhdGUpe1xyXG4gICAgICBjYXNlICdhY3RpdmUnOlxyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IHN0eWxlLm9wYWNpdGllcy5hY3RpdmVPcGFjaXR5XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAnaG92ZXInOlxyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IHN0eWxlLm9wYWNpdGllcy5ob3Zlck9wYWNpdHlcclxuICAgICAgICBicmVha1xyXG4gICAgICBjYXNlICdzZWxlY3RlZCc6XHJcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMC4zXHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgZGVmYXVsdDpcclxuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSBzdHlsZS5vcGFjaXRpZXMub3BhY2l0eVxyXG4gICAgfVxyXG5cclxuICAgIGhlbHBlcnMuY3JlYXRlU2VnbWVudChjaGFydCwgbGFuZS5lbmQsIGxhbmUuc3RhcnQsIGVsZW1lbnQuc3RhcnQsIGVsZW1lbnQuZW5kKTtcclxuXHJcbiAgICBjdHguZmlsbCgpXHJcbiAgICBjdHgucmVzdG9yZSgpXHJcbiAgfSlcclxuXHJcbiAgXHJcblxyXG4gIC8vIHN0cm9rZVxyXG5cclxuICBkYXRhLmVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gICAgdmFyIHR5cGUgPSBlbGVtZW50LnR5cGVcclxuICAgIHZhciBsYW5lID0gdHlwZS5sYW5lXHJcbiAgICB2YXIgc3R5bGUgPSB0eXBlLnN0eWxlXHJcblxyXG4gICAgY3R4LnNhdmUoKVxyXG4gICAgY3R4LnN0cm9rZVN0eWxlID0gc3R5bGUuY29sb3JcclxuICAgIGN0eC5saW5lV2lkdGggPSBzdHlsZS5zdHJva2UubGluZVdpZHRoXHJcbiAgICBjdHgubGluZUpvaW4gPSAnbWl0dGVsJ1xyXG5cclxuICAgIGhlbHBlcnMuY3JlYXRlU2VnbWVudChjaGFydCwgbGFuZS5lbmQsIGxhbmUuc3RhcnQsIGVsZW1lbnQuc3RhcnQsIGVsZW1lbnQuZW5kKTtcclxuXHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcbiAgICBjdHgucmVzdG9yZSgpXHJcbiAgfSk7XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2hhcnQsIE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gIHZhciBkYXRhID0gY2hhcnQuZGF0YVxyXG4gIHZhciBjYW52YXMgPSBjdHguY2FudmFzXHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gIGRhdGEuc2VsZWN0ZWQuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICB2YXIgbGFuZSA9IGVsZW1lbnQudHlwZS5sYW5lXHJcbiAgICB2YXIgc3R5bGUgPSBlbGVtZW50LnR5cGUuc3R5bGVcclxuXHJcbiAgICBjdHguc2F2ZSgpXHJcblxyXG4gICAgdmFyIGhhbmRsZTEgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBlbGVtZW50LnN0YXJ0LCBsYW5lLmVuZClcclxuICAgIHZhciBoYW5kbGUyID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgZWxlbWVudC5lbmQsIGxhbmUuZW5kKVxyXG4gICAgXHJcbiAgICBjdHguZmlsbFN0eWxlID0gc3R5bGUuY29sb3JcclxuXHJcbiAgICBoZWxwZXJzLmNpcmNsZShjaGFydCwgaGFuZGxlMSwgc3R5bGUuaGFuZGxlQmlnKTtcclxuICAgIGN0eC5maWxsKClcclxuICAgIGhlbHBlcnMuY2lyY2xlKGNoYXJ0LCBoYW5kbGUyLCBzdHlsZS5oYW5kbGVCaWcpO1xyXG4gICAgY3R4LmZpbGwoKVxyXG5cclxuXHJcbiAgICBjdHguZmlsbFN0eWxlID0gJ3doaXRlJ1xyXG5cclxuICAgIGhlbHBlcnMuY2lyY2xlKGNoYXJ0LCBoYW5kbGUxLCBzdHlsZS5oYW5kbGVTbWFsbCk7XHJcbiAgICBjdHguZmlsbCgpXHJcbiAgICBoZWxwZXJzLmNpcmNsZShjaGFydCwgaGFuZGxlMiwgc3R5bGUuaGFuZGxlU21hbGwpO1xyXG4gICAgY3R4LmZpbGwoKVxyXG5cclxuXHJcblxyXG4gICAgY3R4LnJlc3RvcmUoKVxyXG4gIH0pXHJcbn1cclxuIiwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG5cclxuICAvLyBpbXBvcnQgc3R5bGVzXHJcbiAgcmVxdWlyZSgnLi9zdHlsZXMnKShOYXBjaGFydClcclxuXHJcbiAgTmFwY2hhcnQub24oJ2luaXRpYWxpemUnLCBmdW5jdGlvbihpbnN0YW5jZSkge1xyXG4gICAgZHJhdyhpbnN0YW5jZSk7XHJcbiAgfSlcclxuXHJcbiAgTmFwY2hhcnQub24oJ2RhdGFDaGFuZ2UnLCBmdW5jdGlvbihpbnN0YW5jZSkge1xyXG4gICAgZHJhdyhpbnN0YW5jZSlcclxuICB9KVxyXG5cclxuICBOYXBjaGFydC5vbignYmVuY2htYXJrJywgZnVuY3Rpb24oaW5zdGFuY2UpIHtcclxuICAgIGJlbmNobWFyayhpbnN0YW5jZSlcclxuICB9KVxyXG5cclxuICB2YXIgdGFza3MgPSB7XHJcbiAgICAvLyBjbGVhclxyXG4gICAgY2xlYXI6IHJlcXVpcmUoJy4vY2xlYXInKSxcclxuXHJcbiAgICAvLyBmYWNlXHJcbiAgICBjaXJjbGVzOiByZXF1aXJlKCcuL2ZhY2UvY2lyY2xlcycpLFxyXG4gICAgbGluZXM6IHJlcXVpcmUoJy4vZmFjZS9saW5lcycpLFxyXG4gICAgdGV4dDogcmVxdWlyZSgnLi9mYWNlL3RleHQnKSxcclxuXHJcbiAgICAvLyBjb250ZW50XHJcbiAgICBiYXJzOiByZXF1aXJlKCcuL2NvbnRlbnQvYmFycycpLFxyXG4gICAgaGFuZGxlczogcmVxdWlyZSgnLi9jb250ZW50L2hhbmRsZXMnKSxcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRyYXcoY2hhcnQpIHtcclxuICAgIGZvciAodGFzayBpbiB0YXNrcykge1xyXG4gICAgICB0YXNrc1t0YXNrXShjaGFydCwgTmFwY2hhcnQpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBiZW5jaG1hcmsoY2hhcnQpIHtcclxuICAgIHZhciBpdGVyYXRpb25zID0gMTAwMFxyXG4gICAgZm9yICh0YXNrIGluIHRhc2tzKSB7XHJcbiAgICAgIHZhciBzdGFydCA9IERhdGUubm93KClcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpdGVyYXRpb25zOyBpKyspIHtcclxuICAgICAgICB0YXNrc1t0YXNrXShjaGFydCwgTmFwY2hhcnQpXHJcbiAgICAgIH1cclxuICAgICAgdmFyIGVuZCA9IERhdGUubm93KClcclxuICAgICAgY29uc29sZS5sb2coYCR7dGFza30geCAke2l0ZXJhdGlvbnN9IGAgKyAoZW5kLXN0YXJ0KSArICcgbXMnKVxyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFydCwgTmFwY2hhcnQpIHtcclxuICB2YXIgbGF5ZXJzID0gY2hhcnQuY29uZmlnLmxheWVyc1xyXG4gIHZhciBjdHggPSBjaGFydC5jdHhcclxuICBjdHgubGluZVdpZHRoID0gY2hhcnQuY29uZmlnLmZhY2Uuc3Ryb2tlXHJcblxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGNoYXJ0LmNvbmZpZy5mYWNlLnN0cm9rZUNvbG9yXHJcbiAgZm9yICh2YXIgaSA9IGxheWVycy5sZW5ndGggLSAyOyBpID49IGxheWVycy5sZW5ndGggLSAzOyBpLS0pIHtcclxuICBcdGN0eC5iZWdpblBhdGgoKVxyXG4gICAgTmFwY2hhcnQuaGVscGVycy5jcmVhdGVDdXJ2ZShjaGFydCwgMSwgMCwgbGF5ZXJzW2ldKVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgfVxyXG5cclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjaGFydC5jb25maWcuZmFjZS53ZWFrU3Ryb2tlQ29sb3JcclxuICBmb3IgKHZhciBpID0gbGF5ZXJzLmxlbmd0aCAtIDQ7IGkgPj0gbGF5ZXJzLmxlbmd0aCAtIDQ7IGktLSkge1xyXG4gIFx0Y3R4LmJlZ2luUGF0aCgpXHJcbiAgICBOYXBjaGFydC5oZWxwZXJzLmNyZWF0ZUN1cnZlKGNoYXJ0LCAxLCAwLCBsYXllcnNbaV0pXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICB9XHJcbiAgXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgTmFwY2hhcnQuaGVscGVycy5jcmVhdGVDdXJ2ZShjaGFydCwgMSwgMCwgMClcclxuICBjdHguc3Ryb2tlKClcclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFydCwgTmFwY2hhcnQpIHtcclxuICB2YXIgaGVscGVycyA9IE5hcGNoYXJ0LmhlbHBlcnNcclxuXHJcbiAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gIHZhciBjb25maWcgPSBjaGFydC5jb25maWdcclxuICB2YXIgbGFuZXMgPSBjb25maWcubGFuZXNcclxuICBcclxuICBjdHgubGluZVdpZHRoID0gY29uZmlnLmZhY2Uuc3Ryb2tlXHJcbiAgY3R4LnNhdmUoKVxyXG5cclxuICAvLyBldmVyeSBob3VyIG5vcm1hbFxyXG5cclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjb25maWcuZmFjZS5zdHJva2VDb2xvclxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG5cclxuICBmb3IodmFyIGk9MDtpPDI0O2krKyl7XHJcbiAgXHR2YXIgcyA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqNjAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDJdLnN0YXJ0KVxyXG4gIFx0dmFyIGUgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjYwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAyXS5lbmQgKyBjb25maWcuZmFjZS5ob3VyU3Ryb2tlc0xlbmd0aClcclxuICAgIGN0eC5tb3ZlVG8ocy54LHMueSlcclxuICAgIGN0eC5saW5lVG8oZS54LGUueSlcclxuICB9XHJcbiAgY3R4LnN0cm9rZSgpXHJcblxyXG4gIC8vIGV2ZXJ5IGhvdXIgd2Vha1xyXG5cclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjb25maWcuZmFjZS53ZWFrU3Ryb2tlQ29sb3JcclxuICBjdHguYmVnaW5QYXRoKClcclxuXHJcbiAgZm9yKHZhciBpPTA7aTwyNDtpKyspe1xyXG4gICAgdmFyIHMgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjYwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAzXS5zdGFydClcclxuICAgIHZhciBlID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSo2MCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gM10uZW5kKVxyXG4gICAgY3R4Lm1vdmVUbyhzLngscy55KVxyXG4gICAgY3R4LmxpbmVUbyhlLngsZS55KVxyXG4gIH1cclxuICBjdHguc3Ryb2tlKClcclxuXHJcblxyXG4gIC8vIGltcG9ydGFudCBob3Vyc1xyXG5cclxuICBjdHgubGluZVdpZHRoID0gY29uZmlnLmZhY2UuaW1wb3J0YW50TGluZVdpZHRoXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY29uZmlnLmZhY2UuaW1wb3J0YW50U3Ryb2tlQ29sb3JcclxuICBjdHguYmVnaW5QYXRoKClcclxuXHJcbiAgZm9yKHZhciBpPTA7aTwyNDtpID0gaSs0KXtcclxuICAgIHZhciBzID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSo2MCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMl0uc3RhcnQpXHJcbiAgICB2YXIgZSA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqNjAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDJdLmVuZCArIGNvbmZpZy5mYWNlLmhvdXJTdHJva2VzTGVuZ3RoKVxyXG4gICAgY3R4Lm1vdmVUbyhzLngscy55KVxyXG4gICAgY3R4LmxpbmVUbyhlLngsZS55KVxyXG4gIH1cclxuICBcclxuICBjdHguc3Ryb2tlKClcclxuXHJcbiAgLy8gZXZlcnkgMTAgbWludXRlc1xyXG5cclxuICAvKlxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbmZpZy5mYWNlLnN0cm9rZUNvbG9yXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcblxyXG5cclxuICBmb3IodmFyIGk9MDtpPDE0NDAvMTA7aSsrKXtcclxuICAgIHZhciBzID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSoxMCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMl0uZW5kKVxyXG4gICAgdmFyIGUgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjEwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAyXS5lbmQgKyBjb25maWcuZmFjZS50ZW5NaW51dGVTdHJva2VzTGVuZ3RoKVxyXG4gICAgY3R4Lm1vdmVUbyhzLngscy55KVxyXG4gICAgY3R4LmxpbmVUbyhlLngsZS55KVxyXG4gIH1cclxuICBjdHguc3Ryb2tlKClcclxuICBjdHguYmVnaW5QYXRoKClcclxuICAqL1xyXG5cclxuXHJcbiAgLy8gZXZlcnkgNSBtaW51dGVzXHJcblxyXG4gIC8qXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY29uZmlnLmZhY2Uuc3Ryb2tlQ29sb3JcclxuICBjdHguYmVnaW5QYXRoKClcclxuXHJcbiAgZm9yKHZhciBpPTAuNTtpPDE0NDAvMTA7aSsrKXtcclxuICAgIHZhciBzID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSoxMCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMl0uZW5kKVxyXG4gICAgdmFyIGUgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjEwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAyXS5lbmQgKyBjb25maWcuZmFjZS5maXZlTWludXRlU3Ryb2tlc0xlbmd0aClcclxuICAgIGN0eC5tb3ZlVG8ocy54LHMueSlcclxuICAgIGN0eC5saW5lVG8oZS54LGUueSlcclxuICB9XHJcblxyXG4gIGN0eC5zdHJva2UoKVxyXG4gICovXHJcblxyXG5cclxuICBcclxuICBcclxuICBjdHgucmVzdG9yZSgpXHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2hhcnQsIE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gIHZhciBjdHggPSBjaGFydC5jdHhcclxuICB2YXIgY29uZmlnID0gY2hhcnQuY29uZmlnXHJcblxyXG4gIGN0eC5zYXZlKClcclxuICBjdHguZm9udCA9IGhlbHBlcnMuY3JlYXRlRm9udFN0cmluZyhjaGFydCwgY29uZmlnLmZhY2UubnVtYmVycy5zaXplKVxyXG4gIGN0eC5maWxsU3R5bGUgPSBjb25maWcuZmFjZS5udW1iZXJzLmNvbG9yXHJcbiAgY3R4LnRleHRBbGlnbiA9ICdjZW50ZXInXHJcbiAgY3R4LnRleHRCYXNlbGluZSA9ICdtaWRkbGUnXHJcblxyXG4gIGZvcih2YXIgaT0wO2k8MjQ7aSA9IGkrNCl7XHJcbiAgXHR2YXIgcCA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqNjAsIGNvbmZpZy5mYWNlLm51bWJlcnMucmFkaXVzKVxyXG4gICAgY3R4LmZpbGxUZXh0KGksIHAueCwgcC55KVxyXG4gIH1cclxuXHJcbiAgY3R4LnJlc3RvcmUoKVxyXG59XHJcbiIsIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTmFwY2hhcnQpIHtcclxuICB2YXIgaGVscGVycyA9IE5hcGNoYXJ0LmhlbHBlcnNcclxuICB2YXIgc3R5bGVzID0gTmFwY2hhcnQuc3R5bGVzID0ge1xyXG4gICAgXHJcbiAgfVxyXG5cclxuICBzdHlsZXMuZGVmYXVsdCA9IHtcclxuICAgIGNvbG9yOiAnYmxhY2snLFxyXG4gICAgb3BhY2l0aWVzOiB7XHJcbiAgICAgIG5vU2NhbGU6dHJ1ZSxcclxuICAgICAgb3BhY2l0eTogMC42LFxyXG4gICAgICBob3Zlck9wYWNpdHk6IDAuNSxcclxuICAgICAgYWN0aXZlT3BhY2l0eTogMC41LFxyXG4gICAgfSxcclxuICAgIHN0cm9rZToge1xyXG4gICAgICBsaW5lV2lkdGg6M1xyXG4gICAgfSxcclxuXHRoYW5kbGVCaWc6NyxcclxuXHRoYW5kbGVTbWFsbDozXHJcbiAgfVxyXG5cclxuICBzdHlsZXMucmVkID0gaGVscGVycy5leHRlbmQoe30sIHN0eWxlcy5kZWZhdWx0LCB7XHJcbiAgICBjb2xvcjogJyNjNzBlMGUnLFxyXG4gICAgc2VsZWN0ZWQ6IHtcclxuICAgICAgc3Ryb2tlQ29sb3I6ICcjRkY2MzYzJyxcclxuICAgIH1cclxuICB9KSBcclxuXHJcbiAgc3R5bGVzLmJsYWNrID0gaGVscGVycy5leHRlbmQoe30sIHN0eWxlcy5kZWZhdWx0LCB7XHJcbiAgICBjb2xvcjogJyMxZjFmMWYnLFxyXG4gICAgc2VsZWN0ZWQ6IHtcclxuICAgICAgc3Ryb2tlQ29sb3I6ICcjRkY2MzYzJyxcclxuICAgIH1cclxuICB9KVxyXG5cclxuICBzdHlsZXMuYmx1ZSA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBzdHlsZXMuZGVmYXVsdCwge1xyXG4gICAgY29sb3I6ICdibHVlJ1xyXG4gIH0pXHJcbiAgXHJcbn0iLCIvKlxyXG4qICBGYW5jeSBtb2R1bGUgdGhhdCBkb2VzIHNoaXRcclxuKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGNoYXJ0O1xyXG5cclxuICBOYXBjaGFydC5vbignaW5pdGlhbGl6ZScsIGZ1bmN0aW9uKGluc3RhbmNlKSB7XHJcbiAgICBjaGFydCA9IGluc3RhbmNlXHJcbiAgICAvLyBjaGFydC5zZXREYXRhKClcclxuICB9KVxyXG59XHJcbiIsIi8qIGdsb2JhbCB3aW5kb3c6IGZhbHNlICovXG4vKiBnbG9iYWwgZG9jdW1lbnQ6IGZhbHNlICovXG4ndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQ2hhcnQpIHtcbiAgLy8gR2xvYmFsIENoYXJ0IGhlbHBlcnMgb2JqZWN0IGZvciB1dGlsaXR5IG1ldGhvZHMgYW5kIGNsYXNzZXNcbiAgdmFyIGhlbHBlcnMgPSBDaGFydC5oZWxwZXJzID0ge31cbiAgaGVscGVycy5yYW5nZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gICAgaWYgKGVuZCA8IHN0YXJ0KSB7XG4gICAgICByZXR1cm4gMTQ0MCAtIHN0YXJ0ICsgZW5kXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBlbmQgLSBzdGFydFxuICAgIH1cbiAgfVxuXG4gIGhlbHBlcnMuZ2V0UG9zaXRpb25CZXR3ZWVuVHdvVmFsdWVzID0gZnVuY3Rpb24ocG9zLCBzdGFydCwgZW5kKXtcbiAgICAgIHJldHVybiBoZWxwZXJzLnJhbmdlKHN0YXJ0LHBvcykgLyBoZWxwZXJzLnJhbmdlKHN0YXJ0LCBlbmQpXG4gIH1cblxuICBoZWxwZXJzLmxpbWl0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYodmFsdWUgPT0gMTQ0MCkgcmV0dXJuIDE0NDBcbiAgICByZXR1cm4gdmFsdWUgLSAxNDQwICogTWF0aC5mbG9vcih2YWx1ZS8xNDQwKVxuICB9XG4gIHdpbmRvdy5oZWxwZXJzID0gaGVscGVyc1xuICBoZWxwZXJzLnNob3J0ZXN0V2F5ID0gZnVuY3Rpb24oYSkge1xuICAgIC8vIGFsdGVybmF0aXZlPz9jb25zb2xlLmxvZyhhIC0gMTQ0MCAqIE1hdGguZmxvb3IoYS83MjApKVxuXG4gICAgLy8gMTQ0MC8yID0gNzIwXG4gICAgaWYoYSA+IDcyMCl7XG4gICAgICByZXR1cm4gYSAtIDE0NDBcbiAgICB9IGVsc2UgaWYoYSA8IC03MjApe1xuICAgICAgcmV0dXJuIGEgKyAxNDQwXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhXG4gICAgfVxuXG4gIH1cblxuICBoZWxwZXJzLmdldFByb2dyZXNzQmV0d2VlblR3b1ZhbHVlcyA9IGZ1bmN0aW9uIChwb3MsIHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gaGVscGVycy5yYW5nZShzdGFydCwgcG9zKSAvIGhlbHBlcnMucmFuZ2Uoc3RhcnQsIGVuZClcbiAgfVxuICBoZWxwZXJzLmlzSW5zaWRlID0gZnVuY3Rpb24gKHBvaW50LCBzdGFydCwgZW5kKSB7XG4gICAgaWYgKGVuZCA+IHN0YXJ0KSB7XG4gICAgICBpZiAocG9pbnQgPCBlbmQgJiYgcG9pbnQgPiBzdGFydCkgeyByZXR1cm4gdHJ1ZSB9XG4gICAgfSBlbHNlIGlmIChzdGFydCA+IGVuZCkge1xuICAgICAgaWYgKHBvaW50ID4gc3RhcnQgfHwgcG9pbnQgPCBlbmQpIHsgcmV0dXJuIHRydWUgfVxuICAgIH1cbiAgICBpZiAocG9pbnQgPT0gc3RhcnQgfHwgcG9pbnQgPT0gZW5kKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIGhlbHBlcnMuaXNJbnNpZGVBbmdsZSA9IGZ1bmN0aW9uIChwb2ludCwgc3RhcnQsIGVuZCkge1xuICAgIC8vIHNhbWUgYXMgYW5nbGUgYnV0IGl0IGxpbWl0cyB2YWx1ZXMgdG8gYmV0d2VlbiAwIGFuZCAyKk1hdGguUElcbiAgICByZXR1cm4gaGVscGVycy5pc0luc2lkZShsaW1pdChwb2ludCksIGxpbWl0KHN0YXJ0KSwgbGltaXQoZW5kKSlcblxuICAgIGZ1bmN0aW9uIGxpbWl0KGFuZ2xlKSB7XG4gICAgICBhbmdsZSAlPSBNYXRoLlBJKjJcbiAgICAgIGlmKGFuZ2xlIDwgMCl7XG4gICAgICAgIGFuZ2xlICs9IE1hdGguUEkqMlxuICAgICAgfVxuICAgICAgcmV0dXJuIGFuZ2xlXG4gICAgfVxuICB9XG4gIFxuXG4gIGhlbHBlcnMuZGlzdGFuY2UgPSBmdW5jdGlvbiAoeCx5LGEpe1xuICAgIHZhciB5ID0gYS55LXk7XG4gICAgdmFyIHggPSBhLngteDtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KHkqeSt4KngpO1xuICB9XG5cbiAgaGVscGVycy5hbmdsZUJldHdlZW5Ud29Qb2ludHMgPSBmdW5jdGlvbiAoeCx5LGEpe1xuICAgIHZhciBkaXN0YW5jZSA9IGhlbHBlcnMuZGlzdGFuY2UoeCx5LGEpXG4gICAgdmFyIHkgPSAoYS55LXkpIC8gZGlzdGFuY2U7XG4gICAgdmFyIHggPSAoYS54LXgpIC8gZGlzdGFuY2U7XG5cbiAgICB2YXIgYW5nbGUgPSBNYXRoLmF0YW4oeSAveClcbiAgICBpZih4ID4gMCl7XG4gICAgICBhbmdsZSArPSBNYXRoLlBJXG4gICAgfVxuICAgIGFuZ2xlICs9IE1hdGguUEkvMlxuICAgIHJldHVybiBhbmdsZVxuICB9XG4gIC8vIGhlbHBlcnMuWFl0b01pbnV0ZXMgPSBmdW5jdGlvbiAoeCx5KSB7XG4gIC8vICAgbWludXRlcyA9IChNYXRoLmF0YW4oeSAveCkgLyAoTWF0aC5QSSAqIDIpKSAqIDE0NDAgKyAzNjA7XG4gIC8vICAgaWYgKHggPCAwKSB7XG4gIC8vICAgICAgIG1pbnV0ZXMgKz0gNzIwO1xuICAvLyAgIH1cbiAgLy8gICBtaW51dGVzID0gTWF0aC5yb3VuZChtaW51dGVzKTtcblxuICAvLyAgIHJldHVybiBtaW51dGVzO1xuICAvLyB9O1xuXG4gIGhlbHBlcnMuZGlzdGFuY2VGcm9tUG9pbnRUb0xpbmUgPSBmdW5jdGlvbiAoeCx5LGEsYil7XG5cbiAgdmFyIHgxID0gYS54XG4gIHZhciB5MSA9IGEueVxuICB2YXIgeDIgPSBiLnhcbiAgdmFyIHkyID0gYi55XG5cbiAgdmFyIEEgPSB4IC0geDE7XG4gIHZhciBCID0geSAtIHkxO1xuICB2YXIgQyA9IHgyIC0geDE7XG4gIHZhciBEID0geTIgLSB5MTtcblxuICB2YXIgZG90ID0gQSAqIEMgKyBCICogRDtcbiAgdmFyIGxlbl9zcSA9IEMgKiBDICsgRCAqIEQ7XG4gIHZhciBwYXJhbSA9IC0xO1xuICBpZiAobGVuX3NxICE9IDApIC8vaW4gY2FzZSBvZiAwIGxlbmd0aCBsaW5lXG4gICAgICBwYXJhbSA9IGRvdCAvIGxlbl9zcTtcblxuICB2YXIgeHgsIHl5O1xuXG4gIGlmIChwYXJhbSA8IDApIHtcbiAgICB4eCA9IHgxO1xuICAgIHl5ID0geTE7XG4gIH1cbiAgZWxzZSBpZiAocGFyYW0gPiAxKSB7XG4gICAgeHggPSB4MjtcbiAgICB5eSA9IHkyO1xuICB9XG4gIGVsc2Uge1xuICAgIHh4ID0geDEgKyBwYXJhbSAqIEM7XG4gICAgeXkgPSB5MSArIHBhcmFtICogRDtcbiAgfVxuXG4gIHZhciBkeCA9IHggLSB4eDtcbiAgdmFyIGR5ID0geSAtIHl5O1xuICByZXR1cm4gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbn1cblxuICBoZWxwZXJzLmVhY2hFbGVtZW50ID0gZnVuY3Rpb24gKGNoYXJ0LCBjYWxsYmFjaykge1xuICAgIHZhciBkYXRhID0gY2hhcnQuZGF0YVxuICAgIHZhciBjb25maWdcblxuICAgIGZvciAodmFyIG5hbWUgaW4gZGF0YSkge1xuICAgICAgY29uZmlnID0gY2hhcnQuY29uZmlnLmJhcnNbbmFtZV1cbiAgICAgIFxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhW25hbWVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNhbGxiYWNrKGRhdGFbbmFtZV1baV0sIGNvbmZpZylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoZWxwZXJzLmVhY2hFbGVtZW50WW8gPSBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIGRhdGEpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YVtuYW1lXS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjYWxsYmFjayhuYW1lLCBpKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhlbHBlcnMuZWFjaCA9IGZ1bmN0aW9uIChsb29wYWJsZSwgY2FsbGJhY2ssIHNlbGYsIHJldmVyc2UpIHtcbiAgICAvLyBDaGVjayB0byBzZWUgaWYgbnVsbCBvciB1bmRlZmluZWQgZmlyc3RseS5cbiAgICB2YXIgaSwgbGVuXG4gICAgaWYgKGhlbHBlcnMuaXNBcnJheShsb29wYWJsZSkpIHtcbiAgICAgIGxlbiA9IGxvb3BhYmxlLmxlbmd0aFxuICAgICAgaWYgKHJldmVyc2UpIHtcbiAgICAgICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGxvb3BhYmxlW2ldLCBpKVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGxvb3BhYmxlW2ldLCBpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbG9vcGFibGUgPT09ICdvYmplY3QnKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGxvb3BhYmxlKVxuICAgICAgbGVuID0ga2V5cy5sZW5ndGhcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHNlbGYsIGxvb3BhYmxlW2tleXNbaV1dLCBrZXlzW2ldKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhlbHBlcnMuZGVlcEVhY2ggPSBmdW5jdGlvbiAobG9vcGFibGUsIGNhbGxiYWNrKSB7XG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIG51bGwgb3IgdW5kZWZpbmVkIGZpcnN0bHkuXG4gICAgdmFyIGksIGxlblxuICAgIGZ1bmN0aW9uIHNlYXJjaCAobG9vcGFibGUsIGNiKSB7XG4gICAgICBpZiAoaGVscGVycy5pc0FycmF5KGxvb3BhYmxlKSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvb3BhYmxlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2IobG9vcGFibGUsIGxvb3BhYmxlW2ldLCBpKVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBsb29wYWJsZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhsb29wYWJsZSlcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY2IobG9vcGFibGUsIGxvb3BhYmxlW2tleXNbaV1dLCBrZXlzW2ldKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZm91bmQgKGJhc2UsIHZhbHVlLCBrZXkpIHtcbiAgICAgIGlmIChoZWxwZXJzLmlzQXJyYXkodmFsdWUpIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgc2VhcmNoKHZhbHVlLCBmb3VuZClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrKGJhc2UsIHZhbHVlLCBrZXkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgc2VhcmNoKGxvb3BhYmxlLCBmb3VuZClcbiAgfVxuICBoZWxwZXJzLmNsb25lID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHJldHVybiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpXG4gIH1cbiAgaGVscGVycy5leHRlbmQgPSBmdW5jdGlvbiAoYmFzZSkge1xuICAgIHZhciBzZXRGbiA9IGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICBiYXNlW2tleV0gPSB2YWx1ZVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMSwgaWxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbGVuOyBpKyspIHtcbiAgICAgIGhlbHBlcnMuZWFjaChhcmd1bWVudHNbaV0sIHNldEZuKVxuICAgIH1cbiAgICByZXR1cm4gYmFzZVxuICB9XG4gIC8vIE5lZWQgYSBzcGVjaWFsIG1lcmdlIGZ1bmN0aW9uIHRvIGNoYXJ0IGNvbmZpZ3Mgc2luY2UgdGhleSBhcmUgbm93IGdyb3VwZWRcbiAgaGVscGVycy5jb25maWdNZXJnZSA9IGZ1bmN0aW9uIChfYmFzZSkge1xuICAgIHZhciBiYXNlID0gaGVscGVycy5jbG9uZShfYmFzZSlcbiAgICBoZWxwZXJzLmVhY2goQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSwgZnVuY3Rpb24gKGV4dGVuc2lvbikge1xuICAgICAgaGVscGVycy5lYWNoKGV4dGVuc2lvbiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgdmFyIGJhc2VIYXNQcm9wZXJ0eSA9IGJhc2UuaGFzT3duUHJvcGVydHkoa2V5KVxuICAgICAgICB2YXIgYmFzZVZhbCA9IGJhc2VIYXNQcm9wZXJ0eSA/IGJhc2Vba2V5XSA6IHt9XG5cbiAgICAgICAgaWYgKGtleSA9PT0gJ3NjYWxlcycpIHtcbiAgICAgICAgICAvLyBTY2FsZSBjb25maWcgbWVyZ2luZyBpcyBjb21wbGV4LiBBZGQgb3VyIG93biBmdW5jdGlvbiBoZXJlIGZvciB0aGF0XG4gICAgICAgICAgYmFzZVtrZXldID0gaGVscGVycy5zY2FsZU1lcmdlKGJhc2VWYWwsIHZhbHVlKVxuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3NjYWxlJykge1xuICAgICAgICAgIC8vIFVzZWQgaW4gcG9sYXIgYXJlYSAmIHJhZGFyIGNoYXJ0cyBzaW5jZSB0aGVyZSBpcyBvbmx5IG9uZSBzY2FsZVxuICAgICAgICAgIGJhc2Vba2V5XSA9IGhlbHBlcnMuY29uZmlnTWVyZ2UoYmFzZVZhbCwgQ2hhcnQuc2NhbGVTZXJ2aWNlLmdldFNjYWxlRGVmYXVsdHModmFsdWUudHlwZSksIHZhbHVlKVxuICAgICAgICB9IGVsc2UgaWYgKGJhc2VIYXNQcm9wZXJ0eSAmJlxuICAgICAgICAgIHR5cGVvZiBiYXNlVmFsID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICFoZWxwZXJzLmlzQXJyYXkoYmFzZVZhbCkgJiZcbiAgICAgICAgICBiYXNlVmFsICE9PSBudWxsICYmXG4gICAgICAgICAgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICFoZWxwZXJzLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgLy8gSWYgd2UgYXJlIG92ZXJ3cml0aW5nIGFuIG9iamVjdCB3aXRoIGFuIG9iamVjdCwgZG8gYSBtZXJnZSBvZiB0aGUgcHJvcGVydGllcy5cbiAgICAgICAgICBiYXNlW2tleV0gPSBoZWxwZXJzLmNvbmZpZ01lcmdlKGJhc2VWYWwsIHZhbHVlKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGNhbiBqdXN0IG92ZXJ3cml0ZSB0aGUgdmFsdWUgaW4gdGhpcyBjYXNlXG4gICAgICAgICAgYmFzZVtrZXldID0gdmFsdWVcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuXG4gICAgcmV0dXJuIGJhc2VcbiAgfVxuICBoZWxwZXJzLnNjYWxlTWVyZ2UgPSBmdW5jdGlvbiAoX2Jhc2UsIGV4dGVuc2lvbikge1xuICAgIHZhciBiYXNlID0gaGVscGVycy5jbG9uZShfYmFzZSlcblxuICAgIGhlbHBlcnMuZWFjaChleHRlbnNpb24sIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICBpZiAoa2V5ID09PSAneEF4ZXMnIHx8IGtleSA9PT0gJ3lBeGVzJykge1xuICAgICAgICAvLyBUaGVzZSBwcm9wZXJ0aWVzIGFyZSBhcnJheXMgb2YgaXRlbXNcbiAgICAgICAgaWYgKGJhc2UuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIGhlbHBlcnMuZWFjaCh2YWx1ZSwgZnVuY3Rpb24gKHZhbHVlT2JqLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGF4aXNUeXBlID0gaGVscGVycy5nZXRWYWx1ZU9yRGVmYXVsdCh2YWx1ZU9iai50eXBlLCBrZXkgPT09ICd4QXhlcycgPyAnY2F0ZWdvcnknIDogJ2xpbmVhcicpXG4gICAgICAgICAgICB2YXIgYXhpc0RlZmF1bHRzID0gQ2hhcnQuc2NhbGVTZXJ2aWNlLmdldFNjYWxlRGVmYXVsdHMoYXhpc1R5cGUpXG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gYmFzZVtrZXldLmxlbmd0aCB8fCAhYmFzZVtrZXldW2luZGV4XS50eXBlKSB7XG4gICAgICAgICAgICAgIGJhc2Vba2V5XS5wdXNoKGhlbHBlcnMuY29uZmlnTWVyZ2UoYXhpc0RlZmF1bHRzLCB2YWx1ZU9iaikpXG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlT2JqLnR5cGUgJiYgdmFsdWVPYmoudHlwZSAhPT0gYmFzZVtrZXldW2luZGV4XS50eXBlKSB7XG4gICAgICAgICAgICAgIC8vIFR5cGUgY2hhbmdlZC4gQnJpbmcgaW4gdGhlIG5ldyBkZWZhdWx0cyBiZWZvcmUgd2UgYnJpbmcgaW4gdmFsdWVPYmogc28gdGhhdCB2YWx1ZU9iaiBjYW4gb3ZlcnJpZGUgdGhlIGNvcnJlY3Qgc2NhbGUgZGVmYXVsdHNcbiAgICAgICAgICAgICAgYmFzZVtrZXldW2luZGV4XSA9IGhlbHBlcnMuY29uZmlnTWVyZ2UoYmFzZVtrZXldW2luZGV4XSwgYXhpc0RlZmF1bHRzLCB2YWx1ZU9iailcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIFR5cGUgaXMgdGhlIHNhbWVcbiAgICAgICAgICAgICAgYmFzZVtrZXldW2luZGV4XSA9IGhlbHBlcnMuY29uZmlnTWVyZ2UoYmFzZVtrZXldW2luZGV4XSwgdmFsdWVPYmopXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBiYXNlW2tleV0gPSBbXVxuICAgICAgICAgIGhlbHBlcnMuZWFjaCh2YWx1ZSwgZnVuY3Rpb24gKHZhbHVlT2JqKSB7XG4gICAgICAgICAgICB2YXIgYXhpc1R5cGUgPSBoZWxwZXJzLmdldFZhbHVlT3JEZWZhdWx0KHZhbHVlT2JqLnR5cGUsIGtleSA9PT0gJ3hBeGVzJyA/ICdjYXRlZ29yeScgOiAnbGluZWFyJylcbiAgICAgICAgICAgIGJhc2Vba2V5XS5wdXNoKGhlbHBlcnMuY29uZmlnTWVyZ2UoQ2hhcnQuc2NhbGVTZXJ2aWNlLmdldFNjYWxlRGVmYXVsdHMoYXhpc1R5cGUpLCB2YWx1ZU9iaikpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChiYXNlLmhhc093blByb3BlcnR5KGtleSkgJiYgdHlwZW9mIGJhc2Vba2V5XSA9PT0gJ29iamVjdCcgJiYgYmFzZVtrZXldICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgLy8gSWYgd2UgYXJlIG92ZXJ3cml0aW5nIGFuIG9iamVjdCB3aXRoIGFuIG9iamVjdCwgZG8gYSBtZXJnZSBvZiB0aGUgcHJvcGVydGllcy5cbiAgICAgICAgYmFzZVtrZXldID0gaGVscGVycy5jb25maWdNZXJnZShiYXNlW2tleV0sIHZhbHVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2FuIGp1c3Qgb3ZlcndyaXRlIHRoZSB2YWx1ZSBpbiB0aGlzIGNhc2VcbiAgICAgICAgYmFzZVtrZXldID0gdmFsdWVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGJhc2VcbiAgfVxuICBoZWxwZXJzLmdldFZhbHVlQXRJbmRleE9yRGVmYXVsdCA9IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGRlZmF1bHRWYWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gZGVmYXVsdFZhbHVlXG4gICAgfVxuXG4gICAgaWYgKGhlbHBlcnMuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBpbmRleCA8IHZhbHVlLmxlbmd0aCA/IHZhbHVlW2luZGV4XSA6IGRlZmF1bHRWYWx1ZVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZVxuICB9XG4gIGhlbHBlcnMuZ2V0VmFsdWVPckRlZmF1bHQgPSBmdW5jdGlvbiAodmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gZGVmYXVsdFZhbHVlIDogdmFsdWVcbiAgfVxuICBoZWxwZXJzLmluZGV4T2YgPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZlxuICAgID8gZnVuY3Rpb24gKGFycmF5LCBpdGVtKSB7XG4gICAgICByZXR1cm4gYXJyYXkuaW5kZXhPZihpdGVtKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIChhcnJheSwgaXRlbSkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGlsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBpbGVuOyArK2kpIHtcbiAgICAgICAgaWYgKGFycmF5W2ldID09PSBpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICBoZWxwZXJzLndoZXJlID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGZpbHRlckNhbGxiYWNrKSB7XG4gICAgaWYgKGhlbHBlcnMuaXNBcnJheShjb2xsZWN0aW9uKSAmJiBBcnJheS5wcm90b3R5cGUuZmlsdGVyKSB7XG4gICAgICByZXR1cm4gY29sbGVjdGlvbi5maWx0ZXIoZmlsdGVyQ2FsbGJhY2spXG4gICAgfVxuICAgIHZhciBmaWx0ZXJlZCA9IFtdXG5cbiAgICBoZWxwZXJzLmVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgIGlmIChmaWx0ZXJDYWxsYmFjayhpdGVtKSkge1xuICAgICAgICBmaWx0ZXJlZC5wdXNoKGl0ZW0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBmaWx0ZXJlZFxuICB9XG4gIGhlbHBlcnMuZmluZEluZGV4ID0gQXJyYXkucHJvdG90eXBlLmZpbmRJbmRleFxuICAgID8gZnVuY3Rpb24gKGFycmF5LCBjYWxsYmFjaywgc2NvcGUpIHtcbiAgICAgIHJldHVybiBhcnJheS5maW5kSW5kZXgoY2FsbGJhY2ssIHNjb3BlKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIChhcnJheSwgY2FsbGJhY2ssIHNjb3BlKSB7XG4gICAgICBzY29wZSA9IHNjb3BlID09PSB1bmRlZmluZWQgPyBhcnJheSA6IHNjb3BlXG4gICAgICBmb3IgKHZhciBpID0gMCwgaWxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGlsZW47ICsraSkge1xuICAgICAgICBpZiAoY2FsbGJhY2suY2FsbChzY29wZSwgYXJyYXlbaV0sIGksIGFycmF5KSkge1xuICAgICAgICAgIHJldHVybiBpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgaGVscGVycy5maW5kTmV4dFdoZXJlID0gZnVuY3Rpb24gKGFycmF5VG9TZWFyY2gsIGZpbHRlckNhbGxiYWNrLCBzdGFydEluZGV4KSB7XG4gICAgLy8gRGVmYXVsdCB0byBzdGFydCBvZiB0aGUgYXJyYXlcbiAgICBpZiAoc3RhcnRJbmRleCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0SW5kZXggPT09IG51bGwpIHtcbiAgICAgIHN0YXJ0SW5kZXggPSAtMVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gc3RhcnRJbmRleCArIDE7IGkgPCBhcnJheVRvU2VhcmNoLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgY3VycmVudEl0ZW0gPSBhcnJheVRvU2VhcmNoW2ldXG4gICAgICBpZiAoZmlsdGVyQ2FsbGJhY2soY3VycmVudEl0ZW0pKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50SXRlbVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLmZpbmRQcmV2aW91c1doZXJlID0gZnVuY3Rpb24gKGFycmF5VG9TZWFyY2gsIGZpbHRlckNhbGxiYWNrLCBzdGFydEluZGV4KSB7XG4gICAgLy8gRGVmYXVsdCB0byBlbmQgb2YgdGhlIGFycmF5XG4gICAgaWYgKHN0YXJ0SW5kZXggPT09IHVuZGVmaW5lZCB8fCBzdGFydEluZGV4ID09PSBudWxsKSB7XG4gICAgICBzdGFydEluZGV4ID0gYXJyYXlUb1NlYXJjaC5sZW5ndGhcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGN1cnJlbnRJdGVtID0gYXJyYXlUb1NlYXJjaFtpXVxuICAgICAgaWYgKGZpbHRlckNhbGxiYWNrKGN1cnJlbnRJdGVtKSkge1xuICAgICAgICByZXR1cm4gY3VycmVudEl0ZW1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaGVscGVycy5pbmhlcml0cyA9IGZ1bmN0aW9uIChleHRlbnNpb25zKSB7XG4gICAgLy8gQmFzaWMgamF2YXNjcmlwdCBpbmhlcml0YW5jZSBiYXNlZCBvbiB0aGUgbW9kZWwgY3JlYXRlZCBpbiBCYWNrYm9uZS5qc1xuICAgIHZhciBtZSA9IHRoaXNcbiAgICB2YXIgQ2hhcnRFbGVtZW50ID0gKGV4dGVuc2lvbnMgJiYgZXh0ZW5zaW9ucy5oYXNPd25Qcm9wZXJ0eSgnY29uc3RydWN0b3InKSkgPyBleHRlbnNpb25zLmNvbnN0cnVjdG9yIDogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIG1lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9XG5cbiAgICB2YXIgU3Vycm9nYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5jb25zdHJ1Y3RvciA9IENoYXJ0RWxlbWVudFxuICAgIH1cbiAgICBTdXJyb2dhdGUucHJvdG90eXBlID0gbWUucHJvdG90eXBlXG4gICAgQ2hhcnRFbGVtZW50LnByb3RvdHlwZSA9IG5ldyBTdXJyb2dhdGUoKVxuXG4gICAgQ2hhcnRFbGVtZW50LmV4dGVuZCA9IGhlbHBlcnMuaW5oZXJpdHNcblxuICAgIGlmIChleHRlbnNpb25zKSB7XG4gICAgICBoZWxwZXJzLmV4dGVuZChDaGFydEVsZW1lbnQucHJvdG90eXBlLCBleHRlbnNpb25zKVxuICAgIH1cblxuICAgIENoYXJ0RWxlbWVudC5fX3N1cGVyX18gPSBtZS5wcm90b3R5cGVcblxuICAgIHJldHVybiBDaGFydEVsZW1lbnRcbiAgfVxuICBcbiAgaGVscGVycy51aWQgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZCA9IDBcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGlkKytcbiAgICB9XG4gIH0oKSlcbiAgLy8gLS0gTWF0aCBtZXRob2RzXG4gIGhlbHBlcnMuaXNOdW1iZXIgPSBmdW5jdGlvbiAobikge1xuICAgIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdChuKSkgJiYgaXNGaW5pdGUobilcbiAgfVxuICBoZWxwZXJzLmFsbW9zdEVxdWFscyA9IGZ1bmN0aW9uICh4LCB5LCBlcHNpbG9uKSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKHggLSB5KSA8IGVwc2lsb25cbiAgfVxuICBoZWxwZXJzLmFsbW9zdFdob2xlID0gZnVuY3Rpb24gKHgsIGVwc2lsb24pIHtcbiAgICB2YXIgcm91bmRlZCA9IE1hdGgucm91bmQoeClcbiAgICByZXR1cm4gKCgocm91bmRlZCAtIGVwc2lsb24pIDwgeCkgJiYgKChyb3VuZGVkICsgZXBzaWxvbikgPiB4KSlcbiAgfVxuICBoZWxwZXJzLm1heCA9IGZ1bmN0aW9uIChhcnJheSkge1xuICAgIHJldHVybiBhcnJheS5yZWR1Y2UoZnVuY3Rpb24gKG1heCwgdmFsdWUpIHtcbiAgICAgIGlmICghaXNOYU4odmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1heChtYXgsIHZhbHVlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1heFxuICAgIH0sIE51bWJlci5ORUdBVElWRV9JTkZJTklUWSlcbiAgfVxuICBoZWxwZXJzLm1pbiA9IGZ1bmN0aW9uIChhcnJheSkge1xuICAgIHJldHVybiBhcnJheS5yZWR1Y2UoZnVuY3Rpb24gKG1pbiwgdmFsdWUpIHtcbiAgICAgIGlmICghaXNOYU4odmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBNYXRoLm1pbihtaW4sIHZhbHVlKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG1pblxuICAgIH0sIE51bWJlci5QT1NJVElWRV9JTkZJTklUWSlcbiAgfVxuICBoZWxwZXJzLnNpZ24gPSBNYXRoLnNpZ25cbiAgICA/IGZ1bmN0aW9uICh4KSB7XG4gICAgICByZXR1cm4gTWF0aC5zaWduKHgpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gKHgpIHtcbiAgICAgIHggPSAreCAvLyBjb252ZXJ0IHRvIGEgbnVtYmVyXG4gICAgICBpZiAoeCA9PT0gMCB8fCBpc05hTih4KSkge1xuICAgICAgICByZXR1cm4geFxuICAgICAgfVxuICAgICAgcmV0dXJuIHggPiAwID8gMSA6IC0xXG4gICAgfVxuICBoZWxwZXJzLmxvZzEwID0gTWF0aC5sb2cxMFxuICAgID8gZnVuY3Rpb24gKHgpIHtcbiAgICAgIHJldHVybiBNYXRoLmxvZzEwKHgpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gKHgpIHtcbiAgICAgIHJldHVybiBNYXRoLmxvZyh4KSAvIE1hdGguTE4xMFxuICAgIH1cbiAgaGVscGVycy50b1JhZGlhbnMgPSBmdW5jdGlvbiAoZGVncmVlcykge1xuICAgIHJldHVybiBkZWdyZWVzICogKE1hdGguUEkgLyAxODApXG4gIH1cbiAgaGVscGVycy50b0RlZ3JlZXMgPSBmdW5jdGlvbiAocmFkaWFucykge1xuICAgIHJldHVybiByYWRpYW5zICogKDE4MCAvIE1hdGguUEkpXG4gIH1cbiAgLy8gR2V0cyB0aGUgYW5nbGUgZnJvbSB2ZXJ0aWNhbCB1cHJpZ2h0IHRvIHRoZSBwb2ludCBhYm91dCBhIGNlbnRyZS5cbiAgaGVscGVycy5nZXRBbmdsZUZyb21Qb2ludCA9IGZ1bmN0aW9uIChjZW50cmVQb2ludCwgYW5nbGVQb2ludCkge1xuICAgIHZhciBkaXN0YW5jZUZyb21YQ2VudGVyID0gYW5nbGVQb2ludC54IC0gY2VudHJlUG9pbnQueCxcbiAgICAgIGRpc3RhbmNlRnJvbVlDZW50ZXIgPSBhbmdsZVBvaW50LnkgLSBjZW50cmVQb2ludC55LFxuICAgICAgcmFkaWFsRGlzdGFuY2VGcm9tQ2VudGVyID0gTWF0aC5zcXJ0KGRpc3RhbmNlRnJvbVhDZW50ZXIgKiBkaXN0YW5jZUZyb21YQ2VudGVyICsgZGlzdGFuY2VGcm9tWUNlbnRlciAqIGRpc3RhbmNlRnJvbVlDZW50ZXIpXG5cbiAgICB2YXIgYW5nbGUgPSBNYXRoLmF0YW4yKGRpc3RhbmNlRnJvbVlDZW50ZXIsIGRpc3RhbmNlRnJvbVhDZW50ZXIpXG5cbiAgICBpZiAoYW5nbGUgPCAoLTAuNSAqIE1hdGguUEkpKSB7XG4gICAgICBhbmdsZSArPSAyLjAgKiBNYXRoLlBJIC8vIG1ha2Ugc3VyZSB0aGUgcmV0dXJuZWQgYW5nbGUgaXMgaW4gdGhlIHJhbmdlIG9mICgtUEkvMiwgM1BJLzJdXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFuZ2xlOiBhbmdsZSxcbiAgICAgIGRpc3RhbmNlOiByYWRpYWxEaXN0YW5jZUZyb21DZW50ZXJcbiAgICB9XG4gIH1cbiAgaGVscGVycy5kaXN0YW5jZUJldHdlZW5Qb2ludHMgPSBmdW5jdGlvbiAocHQxLCBwdDIpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHB0Mi54IC0gcHQxLngsIDIpICsgTWF0aC5wb3cocHQyLnkgLSBwdDEueSwgMikpXG4gIH1cbiAgaGVscGVycy5hbGlhc1BpeGVsID0gZnVuY3Rpb24gKHBpeGVsV2lkdGgpIHtcbiAgICByZXR1cm4gKHBpeGVsV2lkdGggJSAyID09PSAwKSA/IDAgOiAwLjVcbiAgfVxuICBoZWxwZXJzLnNwbGluZUN1cnZlID0gZnVuY3Rpb24gKGZpcnN0UG9pbnQsIG1pZGRsZVBvaW50LCBhZnRlclBvaW50LCB0KSB7XG4gICAgLy8gUHJvcHMgdG8gUm9iIFNwZW5jZXIgYXQgc2NhbGVkIGlubm92YXRpb24gZm9yIGhpcyBwb3N0IG9uIHNwbGluaW5nIGJldHdlZW4gcG9pbnRzXG4gICAgLy8gaHR0cDovL3NjYWxlZGlubm92YXRpb24uY29tL2FuYWx5dGljcy9zcGxpbmVzL2Fib3V0U3BsaW5lcy5odG1sXG5cbiAgICAvLyBUaGlzIGZ1bmN0aW9uIG11c3QgYWxzbyByZXNwZWN0IFwic2tpcHBlZFwiIHBvaW50c1xuXG4gICAgdmFyIHByZXZpb3VzID0gZmlyc3RQb2ludC5za2lwID8gbWlkZGxlUG9pbnQgOiBmaXJzdFBvaW50LFxuICAgICAgY3VycmVudCA9IG1pZGRsZVBvaW50LFxuICAgICAgbmV4dCA9IGFmdGVyUG9pbnQuc2tpcCA/IG1pZGRsZVBvaW50IDogYWZ0ZXJQb2ludFxuXG4gICAgdmFyIGQwMSA9IE1hdGguc3FydChNYXRoLnBvdyhjdXJyZW50LnggLSBwcmV2aW91cy54LCAyKSArIE1hdGgucG93KGN1cnJlbnQueSAtIHByZXZpb3VzLnksIDIpKVxuICAgIHZhciBkMTIgPSBNYXRoLnNxcnQoTWF0aC5wb3cobmV4dC54IC0gY3VycmVudC54LCAyKSArIE1hdGgucG93KG5leHQueSAtIGN1cnJlbnQueSwgMikpXG5cbiAgICB2YXIgczAxID0gZDAxIC8gKGQwMSArIGQxMilcbiAgICB2YXIgczEyID0gZDEyIC8gKGQwMSArIGQxMilcblxuICAgIC8vIElmIGFsbCBwb2ludHMgYXJlIHRoZSBzYW1lLCBzMDEgJiBzMDIgd2lsbCBiZSBpbmZcbiAgICBzMDEgPSBpc05hTihzMDEpID8gMCA6IHMwMVxuICAgIHMxMiA9IGlzTmFOKHMxMikgPyAwIDogczEyXG5cbiAgICB2YXIgZmEgPSB0ICogczAxIC8vIHNjYWxpbmcgZmFjdG9yIGZvciB0cmlhbmdsZSBUYVxuICAgIHZhciBmYiA9IHQgKiBzMTJcblxuICAgIHJldHVybiB7XG4gICAgICBwcmV2aW91czoge1xuICAgICAgICB4OiBjdXJyZW50LnggLSBmYSAqIChuZXh0LnggLSBwcmV2aW91cy54KSxcbiAgICAgICAgeTogY3VycmVudC55IC0gZmEgKiAobmV4dC55IC0gcHJldmlvdXMueSlcbiAgICAgIH0sXG4gICAgICBuZXh0OiB7XG4gICAgICAgIHg6IGN1cnJlbnQueCArIGZiICogKG5leHQueCAtIHByZXZpb3VzLngpLFxuICAgICAgICB5OiBjdXJyZW50LnkgKyBmYiAqIChuZXh0LnkgLSBwcmV2aW91cy55KVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLkVQU0lMT04gPSBOdW1iZXIuRVBTSUxPTiB8fCAxZS0xNFxuICBoZWxwZXJzLnNwbGluZUN1cnZlTW9ub3RvbmUgPSBmdW5jdGlvbiAocG9pbnRzKSB7XG4gICAgLy8gVGhpcyBmdW5jdGlvbiBjYWxjdWxhdGVzIELDqXppZXIgY29udHJvbCBwb2ludHMgaW4gYSBzaW1pbGFyIHdheSB0aGFuIHxzcGxpbmVDdXJ2ZXwsXG4gICAgLy8gYnV0IHByZXNlcnZlcyBtb25vdG9uaWNpdHkgb2YgdGhlIHByb3ZpZGVkIGRhdGEgYW5kIGVuc3VyZXMgbm8gbG9jYWwgZXh0cmVtdW1zIGFyZSBhZGRlZFxuICAgIC8vIGJldHdlZW4gdGhlIGRhdGFzZXQgZGlzY3JldGUgcG9pbnRzIGR1ZSB0byB0aGUgaW50ZXJwb2xhdGlvbi5cbiAgICAvLyBTZWUgOiBodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Nb25vdG9uZV9jdWJpY19pbnRlcnBvbGF0aW9uXG5cbiAgICB2YXIgcG9pbnRzV2l0aFRhbmdlbnRzID0gKHBvaW50cyB8fCBbXSkubWFwKGZ1bmN0aW9uIChwb2ludCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbW9kZWw6IHBvaW50Ll9tb2RlbCxcbiAgICAgICAgZGVsdGFLOiAwLFxuICAgICAgICBtSzogMFxuICAgICAgfVxuICAgIH0pXG5cbiAgICAvLyBDYWxjdWxhdGUgc2xvcGVzIChkZWx0YUspIGFuZCBpbml0aWFsaXplIHRhbmdlbnRzIChtSylcbiAgICB2YXIgcG9pbnRzTGVuID0gcG9pbnRzV2l0aFRhbmdlbnRzLmxlbmd0aFxuICAgIHZhciBpLCBwb2ludEJlZm9yZSwgcG9pbnRDdXJyZW50LCBwb2ludEFmdGVyXG4gICAgZm9yIChpID0gMDsgaSA8IHBvaW50c0xlbjsgKytpKSB7XG4gICAgICBwb2ludEN1cnJlbnQgPSBwb2ludHNXaXRoVGFuZ2VudHNbaV1cbiAgICAgIGlmIChwb2ludEN1cnJlbnQubW9kZWwuc2tpcCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBwb2ludEJlZm9yZSA9IGkgPiAwID8gcG9pbnRzV2l0aFRhbmdlbnRzW2kgLSAxXSA6IG51bGxcbiAgICAgIHBvaW50QWZ0ZXIgPSBpIDwgcG9pbnRzTGVuIC0gMSA/IHBvaW50c1dpdGhUYW5nZW50c1tpICsgMV0gOiBudWxsXG4gICAgICBpZiAocG9pbnRBZnRlciAmJiAhcG9pbnRBZnRlci5tb2RlbC5za2lwKSB7XG4gICAgICAgIHZhciBzbG9wZURlbHRhWCA9IChwb2ludEFmdGVyLm1vZGVsLnggLSBwb2ludEN1cnJlbnQubW9kZWwueClcblxuICAgICAgICAvLyBJbiB0aGUgY2FzZSBvZiB0d28gcG9pbnRzIHRoYXQgYXBwZWFyIGF0IHRoZSBzYW1lIHggcGl4ZWwsIHNsb3BlRGVsdGFYIGlzIDBcbiAgICAgICAgcG9pbnRDdXJyZW50LmRlbHRhSyA9IHNsb3BlRGVsdGFYICE9PSAwID8gKHBvaW50QWZ0ZXIubW9kZWwueSAtIHBvaW50Q3VycmVudC5tb2RlbC55KSAvIHNsb3BlRGVsdGFYIDogMFxuICAgICAgfVxuXG4gICAgICBpZiAoIXBvaW50QmVmb3JlIHx8IHBvaW50QmVmb3JlLm1vZGVsLnNraXApIHtcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1LID0gcG9pbnRDdXJyZW50LmRlbHRhS1xuICAgICAgfSBlbHNlIGlmICghcG9pbnRBZnRlciB8fCBwb2ludEFmdGVyLm1vZGVsLnNraXApIHtcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1LID0gcG9pbnRCZWZvcmUuZGVsdGFLXG4gICAgICB9IGVsc2UgaWYgKHRoaXMuc2lnbihwb2ludEJlZm9yZS5kZWx0YUspICE9PSB0aGlzLnNpZ24ocG9pbnRDdXJyZW50LmRlbHRhSykpIHtcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1LID0gMFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1LID0gKHBvaW50QmVmb3JlLmRlbHRhSyArIHBvaW50Q3VycmVudC5kZWx0YUspIC8gMlxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFkanVzdCB0YW5nZW50cyB0byBlbnN1cmUgbW9ub3RvbmljIHByb3BlcnRpZXNcbiAgICB2YXIgYWxwaGFLLCBiZXRhSywgdGF1Sywgc3F1YXJlZE1hZ25pdHVkZVxuICAgIGZvciAoaSA9IDA7IGkgPCBwb2ludHNMZW4gLSAxOyArK2kpIHtcbiAgICAgIHBvaW50Q3VycmVudCA9IHBvaW50c1dpdGhUYW5nZW50c1tpXVxuICAgICAgcG9pbnRBZnRlciA9IHBvaW50c1dpdGhUYW5nZW50c1tpICsgMV1cbiAgICAgIGlmIChwb2ludEN1cnJlbnQubW9kZWwuc2tpcCB8fCBwb2ludEFmdGVyLm1vZGVsLnNraXApIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYgKGhlbHBlcnMuYWxtb3N0RXF1YWxzKHBvaW50Q3VycmVudC5kZWx0YUssIDAsIHRoaXMuRVBTSUxPTikpIHtcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1LID0gcG9pbnRBZnRlci5tSyA9IDBcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgYWxwaGFLID0gcG9pbnRDdXJyZW50Lm1LIC8gcG9pbnRDdXJyZW50LmRlbHRhS1xuICAgICAgYmV0YUsgPSBwb2ludEFmdGVyLm1LIC8gcG9pbnRDdXJyZW50LmRlbHRhS1xuICAgICAgc3F1YXJlZE1hZ25pdHVkZSA9IE1hdGgucG93KGFscGhhSywgMikgKyBNYXRoLnBvdyhiZXRhSywgMilcbiAgICAgIGlmIChzcXVhcmVkTWFnbml0dWRlIDw9IDkpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgdGF1SyA9IDMgLyBNYXRoLnNxcnQoc3F1YXJlZE1hZ25pdHVkZSlcbiAgICAgIHBvaW50Q3VycmVudC5tSyA9IGFscGhhSyAqIHRhdUsgKiBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgICBwb2ludEFmdGVyLm1LID0gYmV0YUsgKiB0YXVLICogcG9pbnRDdXJyZW50LmRlbHRhS1xuICAgIH1cblxuICAgIC8vIENvbXB1dGUgY29udHJvbCBwb2ludHNcbiAgICB2YXIgZGVsdGFYXG4gICAgZm9yIChpID0gMDsgaSA8IHBvaW50c0xlbjsgKytpKSB7XG4gICAgICBwb2ludEN1cnJlbnQgPSBwb2ludHNXaXRoVGFuZ2VudHNbaV1cbiAgICAgIGlmIChwb2ludEN1cnJlbnQubW9kZWwuc2tpcCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBwb2ludEJlZm9yZSA9IGkgPiAwID8gcG9pbnRzV2l0aFRhbmdlbnRzW2kgLSAxXSA6IG51bGxcbiAgICAgIHBvaW50QWZ0ZXIgPSBpIDwgcG9pbnRzTGVuIC0gMSA/IHBvaW50c1dpdGhUYW5nZW50c1tpICsgMV0gOiBudWxsXG4gICAgICBpZiAocG9pbnRCZWZvcmUgJiYgIXBvaW50QmVmb3JlLm1vZGVsLnNraXApIHtcbiAgICAgICAgZGVsdGFYID0gKHBvaW50Q3VycmVudC5tb2RlbC54IC0gcG9pbnRCZWZvcmUubW9kZWwueCkgLyAzXG4gICAgICAgIHBvaW50Q3VycmVudC5tb2RlbC5jb250cm9sUG9pbnRQcmV2aW91c1ggPSBwb2ludEN1cnJlbnQubW9kZWwueCAtIGRlbHRhWFxuICAgICAgICBwb2ludEN1cnJlbnQubW9kZWwuY29udHJvbFBvaW50UHJldmlvdXNZID0gcG9pbnRDdXJyZW50Lm1vZGVsLnkgLSBkZWx0YVggKiBwb2ludEN1cnJlbnQubUtcbiAgICAgIH1cbiAgICAgIGlmIChwb2ludEFmdGVyICYmICFwb2ludEFmdGVyLm1vZGVsLnNraXApIHtcbiAgICAgICAgZGVsdGFYID0gKHBvaW50QWZ0ZXIubW9kZWwueCAtIHBvaW50Q3VycmVudC5tb2RlbC54KSAvIDNcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1vZGVsLmNvbnRyb2xQb2ludE5leHRYID0gcG9pbnRDdXJyZW50Lm1vZGVsLnggKyBkZWx0YVhcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1vZGVsLmNvbnRyb2xQb2ludE5leHRZID0gcG9pbnRDdXJyZW50Lm1vZGVsLnkgKyBkZWx0YVggKiBwb2ludEN1cnJlbnQubUtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaGVscGVycy5uZXh0SXRlbSA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBpbmRleCwgbG9vcCkge1xuICAgIGlmIChsb29wKSB7XG4gICAgICByZXR1cm4gaW5kZXggPj0gY29sbGVjdGlvbi5sZW5ndGggLSAxID8gY29sbGVjdGlvblswXSA6IGNvbGxlY3Rpb25baW5kZXggKyAxXVxuICAgIH1cbiAgICByZXR1cm4gaW5kZXggPj0gY29sbGVjdGlvbi5sZW5ndGggLSAxID8gY29sbGVjdGlvbltjb2xsZWN0aW9uLmxlbmd0aCAtIDFdIDogY29sbGVjdGlvbltpbmRleCArIDFdXG4gIH1cbiAgaGVscGVycy5wcmV2aW91c0l0ZW0gPSBmdW5jdGlvbiAoY29sbGVjdGlvbiwgaW5kZXgsIGxvb3ApIHtcbiAgICBpZiAobG9vcCkge1xuICAgICAgcmV0dXJuIGluZGV4IDw9IDAgPyBjb2xsZWN0aW9uW2NvbGxlY3Rpb24ubGVuZ3RoIC0gMV0gOiBjb2xsZWN0aW9uW2luZGV4IC0gMV1cbiAgICB9XG4gICAgcmV0dXJuIGluZGV4IDw9IDAgPyBjb2xsZWN0aW9uWzBdIDogY29sbGVjdGlvbltpbmRleCAtIDFdXG4gIH1cbiAgLy8gSW1wbGVtZW50YXRpb24gb2YgdGhlIG5pY2UgbnVtYmVyIGFsZ29yaXRobSB1c2VkIGluIGRldGVybWluaW5nIHdoZXJlIGF4aXMgbGFiZWxzIHdpbGwgZ29cbiAgaGVscGVycy5uaWNlTnVtID0gZnVuY3Rpb24gKHJhbmdlLCByb3VuZCkge1xuICAgIHZhciBleHBvbmVudCA9IE1hdGguZmxvb3IoaGVscGVycy5sb2cxMChyYW5nZSkpXG4gICAgdmFyIGZyYWN0aW9uID0gcmFuZ2UgLyBNYXRoLnBvdygxMCwgZXhwb25lbnQpXG4gICAgdmFyIG5pY2VGcmFjdGlvblxuXG4gICAgaWYgKHJvdW5kKSB7XG4gICAgICBpZiAoZnJhY3Rpb24gPCAxLjUpIHtcbiAgICAgICAgbmljZUZyYWN0aW9uID0gMVxuICAgICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8IDMpIHtcbiAgICAgICAgbmljZUZyYWN0aW9uID0gMlxuICAgICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8IDcpIHtcbiAgICAgICAgbmljZUZyYWN0aW9uID0gNVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmljZUZyYWN0aW9uID0gMTBcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDw9IDEuMCkge1xuICAgICAgbmljZUZyYWN0aW9uID0gMVxuICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPD0gMikge1xuICAgICAgbmljZUZyYWN0aW9uID0gMlxuICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPD0gNSkge1xuICAgICAgbmljZUZyYWN0aW9uID0gNVxuICAgIH0gZWxzZSB7XG4gICAgICBuaWNlRnJhY3Rpb24gPSAxMFxuICAgIH1cblxuICAgIHJldHVybiBuaWNlRnJhY3Rpb24gKiBNYXRoLnBvdygxMCwgZXhwb25lbnQpXG4gIH1cbiAgLy8gRWFzaW5nIGZ1bmN0aW9ucyBhZGFwdGVkIGZyb20gUm9iZXJ0IFBlbm5lcidzIGVhc2luZyBlcXVhdGlvbnNcbiAgLy8gaHR0cDovL3d3dy5yb2JlcnRwZW5uZXIuY29tL2Vhc2luZy9cbiAgdmFyIGVhc2luZ0VmZmVjdHMgPSBoZWxwZXJzLmVhc2luZ0VmZmVjdHMgPSB7XG4gICAgbGluZWFyOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIHRcbiAgICB9LFxuICAgIGVhc2VJblF1YWQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gdCAqIHRcbiAgICB9LFxuICAgIGVhc2VPdXRRdWFkOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIC0xICogdCAqICh0IC0gMilcbiAgICB9LFxuICAgIGVhc2VJbk91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gMSAvIDIgKiB0ICogdFxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xIC8gMiAqICgoLS10KSAqICh0IC0gMikgLSAxKVxuICAgIH0sXG4gICAgZWFzZUluQ3ViaWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gdCAqIHQgKiB0XG4gICAgfSxcbiAgICBlYXNlT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gMSAqICgodCA9IHQgLyAxIC0gMSkgKiB0ICogdCArIDEpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRDdWJpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqIHQgKiB0ICogdFxuICAgICAgfVxuICAgICAgcmV0dXJuIDEgLyAyICogKCh0IC09IDIpICogdCAqIHQgKyAyKVxuICAgIH0sXG4gICAgZWFzZUluUXVhcnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gdCAqIHQgKiB0ICogdFxuICAgIH0sXG4gICAgZWFzZU91dFF1YXJ0OiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIC0xICogKCh0ID0gdCAvIDEgLSAxKSAqIHQgKiB0ICogdCAtIDEpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRRdWFydDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqIHQgKiB0ICogdCAqIHRcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMSAvIDIgKiAoKHQgLT0gMikgKiB0ICogdCAqIHQgLSAyKVxuICAgIH0sXG4gICAgZWFzZUluUXVpbnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gMSAqICh0IC89IDEpICogdCAqIHQgKiB0ICogdFxuICAgIH0sXG4gICAgZWFzZU91dFF1aW50OiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgKiAoKHQgPSB0IC8gMSAtIDEpICogdCAqIHQgKiB0ICogdCArIDEpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRRdWludDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqIHQgKiB0ICogdCAqIHQgKiB0XG4gICAgICB9XG4gICAgICByZXR1cm4gMSAvIDIgKiAoKHQgLT0gMikgKiB0ICogdCAqIHQgKiB0ICsgMilcbiAgICB9LFxuICAgIGVhc2VJblNpbmU6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gLTEgKiBNYXRoLmNvcyh0IC8gMSAqIChNYXRoLlBJIC8gMikpICsgMVxuICAgIH0sXG4gICAgZWFzZU91dFNpbmU6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gMSAqIE1hdGguc2luKHQgLyAxICogKE1hdGguUEkgLyAyKSlcbiAgICB9LFxuICAgIGVhc2VJbk91dFNpbmU6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gLTEgLyAyICogKE1hdGguY29zKE1hdGguUEkgKiB0IC8gMSkgLSAxKVxuICAgIH0sXG4gICAgZWFzZUluRXhwbzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAodCA9PT0gMCkgPyAxIDogMSAqIE1hdGgucG93KDIsIDEwICogKHQgLyAxIC0gMSkpXG4gICAgfSxcbiAgICBlYXNlT3V0RXhwbzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAodCA9PT0gMSkgPyAxIDogMSAqICgtTWF0aC5wb3coMiwgLTEwICogdCAvIDEpICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dEV4cG86IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAodCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuICAgICAgaWYgKHQgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIH1cbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqIE1hdGgucG93KDIsIDEwICogKHQgLSAxKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAxIC8gMiAqICgtTWF0aC5wb3coMiwgLTEwICogLS10KSArIDIpXG4gICAgfSxcbiAgICBlYXNlSW5DaXJjOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKHQgPj0gMSkge1xuICAgICAgICByZXR1cm4gdFxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xICogKE1hdGguc3FydCgxIC0gKHQgLz0gMSkgKiB0KSAtIDEpXG4gICAgfSxcbiAgICBlYXNlT3V0Q2lyYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxICogTWF0aC5zcXJ0KDEgLSAodCA9IHQgLyAxIC0gMSkgKiB0KVxuICAgIH0sXG4gICAgZWFzZUluT3V0Q2lyYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAtMSAvIDIgKiAoTWF0aC5zcXJ0KDEgLSB0ICogdCkgLSAxKVxuICAgICAgfVxuICAgICAgcmV0dXJuIDEgLyAyICogKE1hdGguc3FydCgxIC0gKHQgLT0gMikgKiB0KSArIDEpXG4gICAgfSxcbiAgICBlYXNlSW5FbGFzdGljOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICB2YXIgcCA9IDBcbiAgICAgIHZhciBhID0gMVxuICAgICAgaWYgKHQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cbiAgICAgIGlmICgodCAvPSAxKSA9PT0gMSkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgaWYgKCFwKSB7XG4gICAgICAgIHAgPSAxICogMC4zXG4gICAgICB9XG4gICAgICBpZiAoYSA8IE1hdGguYWJzKDEpKSB7XG4gICAgICAgIGEgPSAxXG4gICAgICAgIHMgPSBwIC8gNFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcyA9IHAgLyAoMiAqIE1hdGguUEkpICogTWF0aC5hc2luKDEgLyBhKVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0oYSAqIE1hdGgucG93KDIsIDEwICogKHQgLT0gMSkpICogTWF0aC5zaW4oKHQgKiAxIC0gcykgKiAoMiAqIE1hdGguUEkpIC8gcCkpXG4gICAgfSxcbiAgICBlYXNlT3V0RWxhc3RpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgdmFyIHAgPSAwXG4gICAgICB2YXIgYSA9IDFcbiAgICAgIGlmICh0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgICBpZiAoKHQgLz0gMSkgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIH1cbiAgICAgIGlmICghcCkge1xuICAgICAgICBwID0gMSAqIDAuM1xuICAgICAgfVxuICAgICAgaWYgKGEgPCBNYXRoLmFicygxKSkge1xuICAgICAgICBhID0gMVxuICAgICAgICBzID0gcCAvIDRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMgPSBwIC8gKDIgKiBNYXRoLlBJKSAqIE1hdGguYXNpbigxIC8gYSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBhICogTWF0aC5wb3coMiwgLTEwICogdCkgKiBNYXRoLnNpbigodCAqIDEgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSArIDFcbiAgICB9LFxuICAgIGVhc2VJbk91dEVsYXN0aWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIHZhciBwID0gMFxuICAgICAgdmFyIGEgPSAxXG4gICAgICBpZiAodCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuICAgICAgaWYgKCh0IC89IDEgLyAyKSA9PT0gMikge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgaWYgKCFwKSB7XG4gICAgICAgIHAgPSAxICogKDAuMyAqIDEuNSlcbiAgICAgIH1cbiAgICAgIGlmIChhIDwgTWF0aC5hYnMoMSkpIHtcbiAgICAgICAgYSA9IDFcbiAgICAgICAgcyA9IHAgLyA0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzID0gcCAvICgyICogTWF0aC5QSSkgKiBNYXRoLmFzaW4oMSAvIGEpXG4gICAgICB9XG4gICAgICBpZiAodCA8IDEpIHtcbiAgICAgICAgcmV0dXJuIC0wLjUgKiAoYSAqIE1hdGgucG93KDIsIDEwICogKHQgLT0gMSkpICogTWF0aC5zaW4oKHQgKiAxIC0gcykgKiAoMiAqIE1hdGguUEkpIC8gcCkpXG4gICAgICB9XG4gICAgICByZXR1cm4gYSAqIE1hdGgucG93KDIsIC0xMCAqICh0IC09IDEpKSAqIE1hdGguc2luKCh0ICogMSAtIHMpICogKDIgKiBNYXRoLlBJKSAvIHApICogMC41ICsgMVxuICAgIH0sXG4gICAgZWFzZUluQmFjazogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgcmV0dXJuIDEgKiAodCAvPSAxKSAqIHQgKiAoKHMgKyAxKSAqIHQgLSBzKVxuICAgIH0sXG4gICAgZWFzZU91dEJhY2s6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIHJldHVybiAxICogKCh0ID0gdCAvIDEgLSAxKSAqIHQgKiAoKHMgKyAxKSAqIHQgKyBzKSArIDEpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRCYWNrOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gMSAvIDIgKiAodCAqIHQgKiAoKChzICo9ICgxLjUyNSkpICsgMSkgKiB0IC0gcykpXG4gICAgICB9XG4gICAgICByZXR1cm4gMSAvIDIgKiAoKHQgLT0gMikgKiB0ICogKCgocyAqPSAoMS41MjUpKSArIDEpICogdCArIHMpICsgMilcbiAgICB9LFxuICAgIGVhc2VJbkJvdW5jZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxIC0gZWFzaW5nRWZmZWN0cy5lYXNlT3V0Qm91bmNlKDEgLSB0KVxuICAgIH0sXG4gICAgZWFzZU91dEJvdW5jZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICgodCAvPSAxKSA8ICgxIC8gMi43NSkpIHtcbiAgICAgICAgcmV0dXJuIDEgKiAoNy41NjI1ICogdCAqIHQpXG4gICAgICB9IGVsc2UgaWYgKHQgPCAoMiAvIDIuNzUpKSB7XG4gICAgICAgIHJldHVybiAxICogKDcuNTYyNSAqICh0IC09ICgxLjUgLyAyLjc1KSkgKiB0ICsgMC43NSlcbiAgICAgIH0gZWxzZSBpZiAodCA8ICgyLjUgLyAyLjc1KSkge1xuICAgICAgICByZXR1cm4gMSAqICg3LjU2MjUgKiAodCAtPSAoMi4yNSAvIDIuNzUpKSAqIHQgKyAwLjkzNzUpXG4gICAgICB9XG4gICAgICByZXR1cm4gMSAqICg3LjU2MjUgKiAodCAtPSAoMi42MjUgLyAyLjc1KSkgKiB0ICsgMC45ODQzNzUpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRCb3VuY2U6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAodCA8IDEgLyAyKSB7XG4gICAgICAgIHJldHVybiBlYXNpbmdFZmZlY3RzLmVhc2VJbkJvdW5jZSh0ICogMikgKiAwLjVcbiAgICAgIH1cbiAgICAgIHJldHVybiBlYXNpbmdFZmZlY3RzLmVhc2VPdXRCb3VuY2UodCAqIDIgLSAxKSAqIDAuNSArIDEgKiAwLjVcbiAgICB9XG4gIH1cbiAgXG4gIC8vIC0tIERPTSBtZXRob2RzXG4gIGhlbHBlcnMuZ2V0UmVsYXRpdmVQb3NpdGlvbiA9IGZ1bmN0aW9uIChldnQsIGNoYXJ0KSB7XG4gICAgdmFyIG1vdXNlWCwgbW91c2VZXG4gICAgdmFyIGUgPSBldnQub3JpZ2luYWxFdmVudCB8fCBldnQsXG4gICAgICBjYW52YXMgPSBldnQuY3VycmVudFRhcmdldCB8fCBldnQuc3JjRWxlbWVudCxcbiAgICAgIGJvdW5kaW5nUmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuXG4gICAgdmFyIHRvdWNoZXMgPSBlLnRvdWNoZXNcbiAgICBpZiAodG91Y2hlcyAmJiB0b3VjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIG1vdXNlWCA9IHRvdWNoZXNbMF0uY2xpZW50WFxuICAgICAgbW91c2VZID0gdG91Y2hlc1swXS5jbGllbnRZXG4gICAgfSBlbHNlIHtcbiAgICAgIG1vdXNlWCA9IGUuY2xpZW50WFxuICAgICAgbW91c2VZID0gZS5jbGllbnRZXG4gICAgfVxuXG4gICAgLy8gU2NhbGUgbW91c2UgY29vcmRpbmF0ZXMgaW50byBjYW52YXMgY29vcmRpbmF0ZXNcbiAgICAvLyBieSBmb2xsb3dpbmcgdGhlIHBhdHRlcm4gbGFpZCBvdXQgYnkgJ2plcnJ5aicgaW4gdGhlIGNvbW1lbnRzIG9mXG4gICAgLy8gaHR0cDovL3d3dy5odG1sNWNhbnZhc3R1dG9yaWFscy5jb20vYWR2YW5jZWQvaHRtbDUtY2FudmFzLW1vdXNlLWNvb3JkaW5hdGVzL1xuICAgIHZhciBwYWRkaW5nTGVmdCA9IHBhcnNlRmxvYXQoaGVscGVycy5nZXRTdHlsZShjYW52YXMsICdwYWRkaW5nLWxlZnQnKSlcbiAgICB2YXIgcGFkZGluZ1RvcCA9IHBhcnNlRmxvYXQoaGVscGVycy5nZXRTdHlsZShjYW52YXMsICdwYWRkaW5nLXRvcCcpKVxuICAgIHZhciBwYWRkaW5nUmlnaHQgPSBwYXJzZUZsb2F0KGhlbHBlcnMuZ2V0U3R5bGUoY2FudmFzLCAncGFkZGluZy1yaWdodCcpKVxuICAgIHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VGbG9hdChoZWxwZXJzLmdldFN0eWxlKGNhbnZhcywgJ3BhZGRpbmctYm90dG9tJykpXG4gICAgdmFyIHdpZHRoID0gYm91bmRpbmdSZWN0LnJpZ2h0IC0gYm91bmRpbmdSZWN0LmxlZnQgLSBwYWRkaW5nTGVmdCAtIHBhZGRpbmdSaWdodFxuICAgIHZhciBoZWlnaHQgPSBib3VuZGluZ1JlY3QuYm90dG9tIC0gYm91bmRpbmdSZWN0LnRvcCAtIHBhZGRpbmdUb3AgLSBwYWRkaW5nQm90dG9tXG5cbiAgICAvLyBXZSBkaXZpZGUgYnkgdGhlIGN1cnJlbnQgZGV2aWNlIHBpeGVsIHJhdGlvLCBiZWNhdXNlIHRoZSBjYW52YXMgaXMgc2NhbGVkIHVwIGJ5IHRoYXQgYW1vdW50IGluIGVhY2ggZGlyZWN0aW9uLiBIb3dldmVyXG4gICAgLy8gdGhlIGJhY2tlbmQgbW9kZWwgaXMgaW4gdW5zY2FsZWQgY29vcmRpbmF0ZXMuIFNpbmNlIHdlIGFyZSBnb2luZyB0byBkZWFsIHdpdGggb3VyIG1vZGVsIGNvb3JkaW5hdGVzLCB3ZSBnbyBiYWNrIGhlcmVcbiAgICBtb3VzZVggPSBNYXRoLnJvdW5kKChtb3VzZVggLSBib3VuZGluZ1JlY3QubGVmdCAtIHBhZGRpbmdMZWZ0KSAvICh3aWR0aCkgKiBjYW52YXMud2lkdGggLyBjaGFydC5jdXJyZW50RGV2aWNlUGl4ZWxSYXRpbylcbiAgICBtb3VzZVkgPSBNYXRoLnJvdW5kKChtb3VzZVkgLSBib3VuZGluZ1JlY3QudG9wIC0gcGFkZGluZ1RvcCkgLyAoaGVpZ2h0KSAqIGNhbnZhcy5oZWlnaHQgLyBjaGFydC5jdXJyZW50RGV2aWNlUGl4ZWxSYXRpbylcblxuICAgIHJldHVybiB7XG4gICAgICB4OiBtb3VzZVgsXG4gICAgICB5OiBtb3VzZVlcbiAgICB9XG4gIH1cbiAgaGVscGVycy5hZGRFdmVudCA9IGZ1bmN0aW9uIChub2RlLCBldmVudFR5cGUsIG1ldGhvZCkge1xuICAgIGlmIChub2RlLmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIG1ldGhvZClcbiAgICB9IGVsc2UgaWYgKG5vZGUuYXR0YWNoRXZlbnQpIHtcbiAgICAgIG5vZGUuYXR0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgbWV0aG9kKVxuICAgIH0gZWxzZSB7XG4gICAgICBub2RlWydvbicgKyBldmVudFR5cGVdID0gbWV0aG9kXG4gICAgfVxuICB9XG4gIGhlbHBlcnMucmVtb3ZlRXZlbnQgPSBmdW5jdGlvbiAobm9kZSwgZXZlbnRUeXBlLCBoYW5kbGVyKSB7XG4gICAgaWYgKG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xuICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgaGFuZGxlciwgZmFsc2UpXG4gICAgfSBlbHNlIGlmIChub2RlLmRldGFjaEV2ZW50KSB7XG4gICAgICBub2RlLmRldGFjaEV2ZW50KCdvbicgKyBldmVudFR5cGUsIGhhbmRsZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGVbJ29uJyArIGV2ZW50VHlwZV0gPSBoZWxwZXJzLm5vb3BcbiAgICB9XG4gIH1cblxuICAvLyBQcml2YXRlIGhlbHBlciBmdW5jdGlvbiB0byBjb252ZXJ0IG1heC13aWR0aC9tYXgtaGVpZ2h0IHZhbHVlcyB0aGF0IG1heSBiZSBwZXJjZW50YWdlcyBpbnRvIGEgbnVtYmVyXG4gIGZ1bmN0aW9uIHBhcnNlTWF4U3R5bGUgKHN0eWxlVmFsdWUsIG5vZGUsIHBhcmVudFByb3BlcnR5KSB7XG4gICAgdmFyIHZhbHVlSW5QaXhlbHNcbiAgICBpZiAodHlwZW9mIChzdHlsZVZhbHVlKSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlSW5QaXhlbHMgPSBwYXJzZUludChzdHlsZVZhbHVlLCAxMClcblxuICAgICAgaWYgKHN0eWxlVmFsdWUuaW5kZXhPZignJScpICE9PSAtMSkge1xuICAgICAgICAvLyBwZXJjZW50YWdlICogc2l6ZSBpbiBkaW1lbnNpb25cbiAgICAgICAgdmFsdWVJblBpeGVscyA9IHZhbHVlSW5QaXhlbHMgLyAxMDAgKiBub2RlLnBhcmVudE5vZGVbcGFyZW50UHJvcGVydHldXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlSW5QaXhlbHMgPSBzdHlsZVZhbHVlXG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlSW5QaXhlbHNcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGlmIHRoZSBnaXZlbiB2YWx1ZSBjb250YWlucyBhbiBlZmZlY3RpdmUgY29uc3RyYWludC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGZ1bmN0aW9uIGlzQ29uc3RyYWluZWRWYWx1ZSAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gJ25vbmUnXG4gIH1cblxuICAvLyBQcml2YXRlIGhlbHBlciB0byBnZXQgYSBjb25zdHJhaW50IGRpbWVuc2lvblxuICAvLyBAcGFyYW0gZG9tTm9kZSA6IHRoZSBub2RlIHRvIGNoZWNrIHRoZSBjb25zdHJhaW50IG9uXG4gIC8vIEBwYXJhbSBtYXhTdHlsZSA6IHRoZSBzdHlsZSB0aGF0IGRlZmluZXMgdGhlIG1heGltdW0gZm9yIHRoZSBkaXJlY3Rpb24gd2UgYXJlIHVzaW5nIChtYXhXaWR0aCAvIG1heEhlaWdodClcbiAgLy8gQHBhcmFtIHBlcmNlbnRhZ2VQcm9wZXJ0eSA6IHByb3BlcnR5IG9mIHBhcmVudCB0byB1c2Ugd2hlbiBjYWxjdWxhdGluZyB3aWR0aCBhcyBhIHBlcmNlbnRhZ2VcbiAgLy8gQHNlZSBodHRwOi8vd3d3Lm5hdGhhbmFlbGpvbmVzLmNvbS9ibG9nLzIwMTMvcmVhZGluZy1tYXgtd2lkdGgtY3Jvc3MtYnJvd3NlclxuICBmdW5jdGlvbiBnZXRDb25zdHJhaW50RGltZW5zaW9uIChkb21Ob2RlLCBtYXhTdHlsZSwgcGVyY2VudGFnZVByb3BlcnR5KSB7XG4gICAgdmFyIHZpZXcgPSBkb2N1bWVudC5kZWZhdWx0Vmlld1xuICAgIHZhciBwYXJlbnROb2RlID0gZG9tTm9kZS5wYXJlbnROb2RlXG4gICAgdmFyIGNvbnN0cmFpbmVkTm9kZSA9IHZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShkb21Ob2RlKVttYXhTdHlsZV1cbiAgICB2YXIgY29uc3RyYWluZWRDb250YWluZXIgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUocGFyZW50Tm9kZSlbbWF4U3R5bGVdXG4gICAgdmFyIGhhc0NOb2RlID0gaXNDb25zdHJhaW5lZFZhbHVlKGNvbnN0cmFpbmVkTm9kZSlcbiAgICB2YXIgaGFzQ0NvbnRhaW5lciA9IGlzQ29uc3RyYWluZWRWYWx1ZShjb25zdHJhaW5lZENvbnRhaW5lcilcbiAgICB2YXIgaW5maW5pdHkgPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFlcblxuICAgIGlmIChoYXNDTm9kZSB8fCBoYXNDQ29udGFpbmVyKSB7XG4gICAgICByZXR1cm4gTWF0aC5taW4oXG4gICAgICAgIGhhc0NOb2RlID8gcGFyc2VNYXhTdHlsZShjb25zdHJhaW5lZE5vZGUsIGRvbU5vZGUsIHBlcmNlbnRhZ2VQcm9wZXJ0eSkgOiBpbmZpbml0eSxcbiAgICAgICAgaGFzQ0NvbnRhaW5lciA/IHBhcnNlTWF4U3R5bGUoY29uc3RyYWluZWRDb250YWluZXIsIHBhcmVudE5vZGUsIHBlcmNlbnRhZ2VQcm9wZXJ0eSkgOiBpbmZpbml0eSlcbiAgICB9XG5cbiAgICByZXR1cm4gJ25vbmUnXG4gIH1cbiAgLy8gcmV0dXJucyBOdW1iZXIgb3IgdW5kZWZpbmVkIGlmIG5vIGNvbnN0cmFpbnRcbiAgaGVscGVycy5nZXRDb25zdHJhaW50V2lkdGggPSBmdW5jdGlvbiAoZG9tTm9kZSkge1xuICAgIHJldHVybiBnZXRDb25zdHJhaW50RGltZW5zaW9uKGRvbU5vZGUsICdtYXgtd2lkdGgnLCAnY2xpZW50V2lkdGgnKVxuICB9XG4gIC8vIHJldHVybnMgTnVtYmVyIG9yIHVuZGVmaW5lZCBpZiBubyBjb25zdHJhaW50XG4gIGhlbHBlcnMuZ2V0Q29uc3RyYWludEhlaWdodCA9IGZ1bmN0aW9uIChkb21Ob2RlKSB7XG4gICAgcmV0dXJuIGdldENvbnN0cmFpbnREaW1lbnNpb24oZG9tTm9kZSwgJ21heC1oZWlnaHQnLCAnY2xpZW50SGVpZ2h0JylcbiAgfVxuICBoZWxwZXJzLmdldE1heGltdW1XaWR0aCA9IGZ1bmN0aW9uIChkb21Ob2RlKSB7XG4gICAgdmFyIGNvbnRhaW5lciA9IGRvbU5vZGUucGFyZW50Tm9kZVxuICAgIHZhciBwYWRkaW5nTGVmdCA9IHBhcnNlSW50KGhlbHBlcnMuZ2V0U3R5bGUoY29udGFpbmVyLCAncGFkZGluZy1sZWZ0JyksIDEwKVxuICAgIHZhciBwYWRkaW5nUmlnaHQgPSBwYXJzZUludChoZWxwZXJzLmdldFN0eWxlKGNvbnRhaW5lciwgJ3BhZGRpbmctcmlnaHQnKSwgMTApXG4gICAgdmFyIHcgPSBjb250YWluZXIuY2xpZW50V2lkdGggLSBwYWRkaW5nTGVmdCAtIHBhZGRpbmdSaWdodFxuICAgIHZhciBjdyA9IGhlbHBlcnMuZ2V0Q29uc3RyYWludFdpZHRoKGRvbU5vZGUpXG4gICAgcmV0dXJuIGlzTmFOKGN3KSA/IHcgOiBNYXRoLm1pbih3LCBjdylcbiAgfVxuICBoZWxwZXJzLmdldE1heGltdW1IZWlnaHQgPSBmdW5jdGlvbiAoZG9tTm9kZSkge1xuICAgIHZhciBjb250YWluZXIgPSBkb21Ob2RlLnBhcmVudE5vZGVcbiAgICB2YXIgcGFkZGluZ1RvcCA9IHBhcnNlSW50KGhlbHBlcnMuZ2V0U3R5bGUoY29udGFpbmVyLCAncGFkZGluZy10b3AnKSwgMTApXG4gICAgdmFyIHBhZGRpbmdCb3R0b20gPSBwYXJzZUludChoZWxwZXJzLmdldFN0eWxlKGNvbnRhaW5lciwgJ3BhZGRpbmctYm90dG9tJyksIDEwKVxuICAgIHZhciBoID0gY29udGFpbmVyLmNsaWVudEhlaWdodCAtIHBhZGRpbmdUb3AgLSBwYWRkaW5nQm90dG9tXG4gICAgdmFyIGNoID0gaGVscGVycy5nZXRDb25zdHJhaW50SGVpZ2h0KGRvbU5vZGUpXG4gICAgcmV0dXJuIGlzTmFOKGNoKSA/IGggOiBNYXRoLm1pbihoLCBjaClcbiAgfVxuICBoZWxwZXJzLmdldFN0eWxlID0gZnVuY3Rpb24gKGVsLCBwcm9wZXJ0eSkge1xuICAgIHJldHVybiBlbC5jdXJyZW50U3R5bGVcbiAgICAgID8gZWwuY3VycmVudFN0eWxlW3Byb3BlcnR5XVxuICAgICAgOiBkb2N1bWVudC5kZWZhdWx0Vmlldy5nZXRDb21wdXRlZFN0eWxlKGVsLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKHByb3BlcnR5KVxuICB9XG4gIGhlbHBlcnMucmV0aW5hU2NhbGUgPSBmdW5jdGlvbiAoY2hhcnQpIHtcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcpIHsgcmV0dXJuICd0aGlzIGlzIHNlcnZlcicgfVxuXG4gICAgdmFyIHBpeGVsUmF0aW8gPSBjaGFydC5jdXJyZW50RGV2aWNlUGl4ZWxSYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDFcbiAgICBpZiAocGl4ZWxSYXRpbyA9PT0gMSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdmFyIGNhbnZhcyA9IGNoYXJ0LmNhbnZhc1xuICAgIHZhciBoZWlnaHQgPSBjaGFydC5oZWlnaHRcbiAgICB2YXIgd2lkdGggPSBjaGFydC53aWR0aFxuXG4gICAgY2FudmFzLmhlaWdodCA9IGhlaWdodCAqIHBpeGVsUmF0aW9cbiAgICBjYW52YXMud2lkdGggPSB3aWR0aCAqIHBpeGVsUmF0aW9cbiAgICBjaGFydC5jdHguc2NhbGUocGl4ZWxSYXRpbywgcGl4ZWxSYXRpbylcblxuICAgIC8vIElmIG5vIHN0eWxlIGhhcyBiZWVuIHNldCBvbiB0aGUgY2FudmFzLCB0aGUgcmVuZGVyIHNpemUgaXMgdXNlZCBhcyBkaXNwbGF5IHNpemUsXG4gICAgLy8gbWFraW5nIHRoZSBjaGFydCB2aXN1YWxseSBiaWdnZXIsIHNvIGxldCdzIGVuZm9yY2UgaXQgdG8gdGhlIFwiY29ycmVjdFwiIHZhbHVlcy5cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2NoYXJ0anMvQ2hhcnQuanMvaXNzdWVzLzM1NzVcbiAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gaGVpZ2h0ICsgJ3B4J1xuICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9IHdpZHRoICsgJ3B4J1xuICB9XG4gIC8vIC0tIENhbnZhcyBtZXRob2RzXG4gIGhlbHBlcnMuY2xlYXIgPSBmdW5jdGlvbiAoY2hhcnQpIHtcbiAgICBjaGFydC5jdHguY2xlYXJSZWN0KDAsIDAsIGNoYXJ0LndpZHRoLCBjaGFydC5oZWlnaHQpXG4gIH1cbiAgaGVscGVycy5mb250U3RyaW5nID0gZnVuY3Rpb24gKHBpeGVsU2l6ZSwgZm9udFN0eWxlLCBmb250RmFtaWx5KSB7XG4gICAgcmV0dXJuIGZvbnRTdHlsZSArICcgJyArIHBpeGVsU2l6ZSArICdweCAnICsgZm9udEZhbWlseVxuICB9XG4gIGhlbHBlcnMubG9uZ2VzdFRleHQgPSBmdW5jdGlvbiAoY3R4LCBmb250LCBhcnJheU9mVGhpbmdzLCBjYWNoZSkge1xuICAgIGNhY2hlID0gY2FjaGUgfHwge31cbiAgICB2YXIgZGF0YSA9IGNhY2hlLmRhdGEgPSBjYWNoZS5kYXRhIHx8IHt9XG4gICAgdmFyIGdjID0gY2FjaGUuZ2FyYmFnZUNvbGxlY3QgPSBjYWNoZS5nYXJiYWdlQ29sbGVjdCB8fCBbXVxuXG4gICAgaWYgKGNhY2hlLmZvbnQgIT09IGZvbnQpIHtcbiAgICAgIGRhdGEgPSBjYWNoZS5kYXRhID0ge31cbiAgICAgIGdjID0gY2FjaGUuZ2FyYmFnZUNvbGxlY3QgPSBbXVxuICAgICAgY2FjaGUuZm9udCA9IGZvbnRcbiAgICB9XG5cbiAgICBjdHguZm9udCA9IGZvbnRcbiAgICB2YXIgbG9uZ2VzdCA9IDBcbiAgICBoZWxwZXJzLmVhY2goYXJyYXlPZlRoaW5ncywgZnVuY3Rpb24gKHRoaW5nKSB7XG4gICAgICAvLyBVbmRlZmluZWQgc3RyaW5ncyBhbmQgYXJyYXlzIHNob3VsZCBub3QgYmUgbWVhc3VyZWRcbiAgICAgIGlmICh0aGluZyAhPT0gdW5kZWZpbmVkICYmIHRoaW5nICE9PSBudWxsICYmIGhlbHBlcnMuaXNBcnJheSh0aGluZykgIT09IHRydWUpIHtcbiAgICAgICAgbG9uZ2VzdCA9IGhlbHBlcnMubWVhc3VyZVRleHQoY3R4LCBkYXRhLCBnYywgbG9uZ2VzdCwgdGhpbmcpXG4gICAgICB9IGVsc2UgaWYgKGhlbHBlcnMuaXNBcnJheSh0aGluZykpIHtcbiAgICAgICAgLy8gaWYgaXQgaXMgYW4gYXJyYXkgbGV0cyBtZWFzdXJlIGVhY2ggZWxlbWVudFxuICAgICAgICAvLyB0byBkbyBtYXliZSBzaW1wbGlmeSB0aGlzIGZ1bmN0aW9uIGEgYml0IHNvIHdlIGNhbiBkbyB0aGlzIG1vcmUgcmVjdXJzaXZlbHk/XG4gICAgICAgIGhlbHBlcnMuZWFjaCh0aGluZywgZnVuY3Rpb24gKG5lc3RlZFRoaW5nKSB7XG4gICAgICAgICAgLy8gVW5kZWZpbmVkIHN0cmluZ3MgYW5kIGFycmF5cyBzaG91bGQgbm90IGJlIG1lYXN1cmVkXG4gICAgICAgICAgaWYgKG5lc3RlZFRoaW5nICE9PSB1bmRlZmluZWQgJiYgbmVzdGVkVGhpbmcgIT09IG51bGwgJiYgIWhlbHBlcnMuaXNBcnJheShuZXN0ZWRUaGluZykpIHtcbiAgICAgICAgICAgIGxvbmdlc3QgPSBoZWxwZXJzLm1lYXN1cmVUZXh0KGN0eCwgZGF0YSwgZ2MsIGxvbmdlc3QsIG5lc3RlZFRoaW5nKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgdmFyIGdjTGVuID0gZ2MubGVuZ3RoIC8gMlxuICAgIGlmIChnY0xlbiA+IGFycmF5T2ZUaGluZ3MubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdjTGVuOyBpKyspIHtcbiAgICAgICAgZGVsZXRlIGRhdGFbZ2NbaV1dXG4gICAgICB9XG4gICAgICBnYy5zcGxpY2UoMCwgZ2NMZW4pXG4gICAgfVxuICAgIHJldHVybiBsb25nZXN0XG4gIH1cbiAgaGVscGVycy5tZWFzdXJlVGV4dCA9IGZ1bmN0aW9uIChjdHgsIGRhdGEsIGdjLCBsb25nZXN0LCBzdHJpbmcpIHtcbiAgICB2YXIgdGV4dFdpZHRoID0gZGF0YVtzdHJpbmddXG4gICAgaWYgKCF0ZXh0V2lkdGgpIHtcbiAgICAgIHRleHRXaWR0aCA9IGRhdGFbc3RyaW5nXSA9IGN0eC5tZWFzdXJlVGV4dChzdHJpbmcpLndpZHRoXG4gICAgICBnYy5wdXNoKHN0cmluZylcbiAgICB9XG4gICAgaWYgKHRleHRXaWR0aCA+IGxvbmdlc3QpIHtcbiAgICAgIGxvbmdlc3QgPSB0ZXh0V2lkdGhcbiAgICB9XG4gICAgcmV0dXJuIGxvbmdlc3RcbiAgfVxuICBoZWxwZXJzLm51bWJlck9mTGFiZWxMaW5lcyA9IGZ1bmN0aW9uIChhcnJheU9mVGhpbmdzKSB7XG4gICAgdmFyIG51bWJlck9mTGluZXMgPSAxXG4gICAgaGVscGVycy5lYWNoKGFycmF5T2ZUaGluZ3MsIGZ1bmN0aW9uICh0aGluZykge1xuICAgICAgaWYgKGhlbHBlcnMuaXNBcnJheSh0aGluZykpIHtcbiAgICAgICAgaWYgKHRoaW5nLmxlbmd0aCA+IG51bWJlck9mTGluZXMpIHtcbiAgICAgICAgICBudW1iZXJPZkxpbmVzID0gdGhpbmcubGVuZ3RoXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBudW1iZXJPZkxpbmVzXG4gIH1cbiAgaGVscGVycy5kcmF3Um91bmRlZFJlY3RhbmdsZSA9IGZ1bmN0aW9uIChjdHgsIHgsIHksIHdpZHRoLCBoZWlnaHQsIHJhZGl1cykge1xuICAgIGN0eC5iZWdpblBhdGgoKVxuICAgIGN0eC5tb3ZlVG8oeCArIHJhZGl1cywgeSlcbiAgICBjdHgubGluZVRvKHggKyB3aWR0aCAtIHJhZGl1cywgeSlcbiAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4ICsgd2lkdGgsIHksIHggKyB3aWR0aCwgeSArIHJhZGl1cylcbiAgICBjdHgubGluZVRvKHggKyB3aWR0aCwgeSArIGhlaWdodCAtIHJhZGl1cylcbiAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4ICsgd2lkdGgsIHkgKyBoZWlnaHQsIHggKyB3aWR0aCAtIHJhZGl1cywgeSArIGhlaWdodClcbiAgICBjdHgubGluZVRvKHggKyByYWRpdXMsIHkgKyBoZWlnaHQpXG4gICAgY3R4LnF1YWRyYXRpY0N1cnZlVG8oeCwgeSArIGhlaWdodCwgeCwgeSArIGhlaWdodCAtIHJhZGl1cylcbiAgICBjdHgubGluZVRvKHgsIHkgKyByYWRpdXMpXG4gICAgY3R4LnF1YWRyYXRpY0N1cnZlVG8oeCwgeSwgeCArIHJhZGl1cywgeSlcbiAgICBjdHguY2xvc2VQYXRoKClcbiAgfVxuICBoZWxwZXJzLmNvbG9yID0gZnVuY3Rpb24gKGMpIHtcbiAgICBpZiAoIWNvbG9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdDb2xvci5qcyBub3QgZm91bmQhJylcbiAgICAgIHJldHVybiBjXG4gICAgfVxuXG4gICAgLyogZ2xvYmFsIENhbnZhc0dyYWRpZW50ICovXG4gICAgaWYgKGMgaW5zdGFuY2VvZiBDYW52YXNHcmFkaWVudCkge1xuICAgICAgcmV0dXJuIGNvbG9yKENoYXJ0LmRlZmF1bHRzLmdsb2JhbC5kZWZhdWx0Q29sb3IpXG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbG9yKGMpXG4gIH1cbiAgaGVscGVycy5pc0FycmF5ID0gQXJyYXkuaXNBcnJheVxuICAgID8gZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkob2JqKVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICAgIH1cbiAgLy8gISBAc2VlIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE0ODUzOTc0XG4gIGhlbHBlcnMuYXJyYXlFcXVhbHMgPSBmdW5jdGlvbiAoYTAsIGExKSB7XG4gICAgdmFyIGksIGlsZW4sIHYwLCB2MVxuXG4gICAgaWYgKCFhMCB8fCAhYTEgfHwgYTAubGVuZ3RoICE9PSBhMS5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGZvciAoaSA9IDAsIGlsZW4gPSBhMC5sZW5ndGg7IGkgPCBpbGVuOyArK2kpIHtcbiAgICAgIHYwID0gYTBbaV1cbiAgICAgIHYxID0gYTFbaV1cblxuICAgICAgaWYgKHYwIGluc3RhbmNlb2YgQXJyYXkgJiYgdjEgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICBpZiAoIWhlbHBlcnMuYXJyYXlFcXVhbHModjAsIHYxKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHYwICE9PSB2MSkge1xuICAgICAgICAvLyBOT1RFOiB0d28gZGlmZmVyZW50IG9iamVjdCBpbnN0YW5jZXMgd2lsbCBuZXZlciBiZSBlcXVhbDoge3g6MjB9ICE9IHt4OjIwfVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG4gIGhlbHBlcnMuY2FsbENhbGxiYWNrID0gZnVuY3Rpb24gKGZuLCBhcmdzLCBfdEFyZykge1xuICAgIGlmIChmbiAmJiB0eXBlb2YgZm4uY2FsbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZm4uYXBwbHkoX3RBcmcsIGFyZ3MpXG4gICAgfVxuICB9XG4gIGhlbHBlcnMuZ2V0SG92ZXJDb2xvciA9IGZ1bmN0aW9uIChjb2xvclZhbHVlKSB7XG4gICAgLyogZ2xvYmFsIENhbnZhc1BhdHRlcm4gKi9cbiAgICByZXR1cm4gKGNvbG9yVmFsdWUgaW5zdGFuY2VvZiBDYW52YXNQYXR0ZXJuKVxuICAgICAgPyBjb2xvclZhbHVlXG4gICAgICA6IGhlbHBlcnMuY29sb3IoY29sb3JWYWx1ZSkuc2F0dXJhdGUoMC41KS5kYXJrZW4oMC4xKS5yZ2JTdHJpbmcoKVxuICB9XG59XG4iLCJ3aW5kb3cuTmFwY2hhcnQgPSB7fVxyXG5cclxuLyogaGVscGVyIGZ1bmN0aW9ucyAqL1xyXG5yZXF1aXJlKCcuL2hlbHBlcnMnKShOYXBjaGFydClcclxucmVxdWlyZSgnLi9kcmF3L2NhbnZhc0hlbHBlcnMnKShOYXBjaGFydClcclxuXHJcbi8qIGNvbmZpZyBmaWxlcyAqL1xyXG5yZXF1aXJlKCcuL2NvbmZpZycpKE5hcGNoYXJ0KVxyXG5yZXF1aXJlKCcuL3R5cGVzJykoTmFwY2hhcnQpXHJcblxyXG4vKiByZWFsIHNoaXQgKi9cclxucmVxdWlyZSgnLi9jb3JlJykoTmFwY2hhcnQpXHJcblxyXG4vKiBkcmF3aW5nICovXHJcbnJlcXVpcmUoJy4vc2hhcGUvc2hhcGUnKShOYXBjaGFydClcclxucmVxdWlyZSgnLi9kcmF3L2RyYXcnKShOYXBjaGFydClcclxucmVxdWlyZSgnLi9pbnRlcmFjdENhbnZhcy9pbnRlcmFjdENhbnZhcycpKE5hcGNoYXJ0KVxyXG5cclxuLyogb3RoZXIgbW9kdWxlcyAqL1xyXG5yZXF1aXJlKCcuL2ZhbmN5bW9kdWxlJykoTmFwY2hhcnQpXHJcbi8vIHJlcXVpcmUoJy4vYW5pbWF0aW9uJykoTmFwY2hhcnQpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5OYXBjaGFydCIsIi8qXHJcbiogIGludGVyYWN0Q2FudmFzXHJcbipcclxuKiAgVGhpcyBtb2R1bGUgYWRkcyBzdXBwb3J0IGZvciBtb2RpZnlpbmcgYSBzY2hlZHVsZVxyXG4qICBkaXJlY3RseSBvbiB0aGUgY2FudmFzIHdpdGggbW91c2Ugb3IgdG91Y2hcclxuKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gIE5hcGNoYXJ0Lm9uKCdpbml0aWFsaXplJywgZnVuY3Rpb24gKGNoYXJ0KSB7XHJcbiAgICBpZighY2hhcnQuY29uZmlnLmludGVyYWN0aW9uKSByZXR1cm5cclxuXHJcbiAgICB2YXIgY2FudmFzID0gY2hhcnQuY2FudmFzXHJcblxyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaG92ZXIoZSwgY2hhcnQpXHJcbiAgICB9KVxyXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgZG93bihlLCBjaGFydClcclxuICAgIH0pXHJcbiAgICAvLyBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGRvd24pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICB1cChlLCBjaGFydClcclxuICAgIH0pXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgdXAoZSwgY2hhcnQpXHJcbiAgICB9KVxyXG4gIC8vIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLGRlc2VsZWN0KVxyXG4gIH0pXHJcblxyXG4gIHZhciBtb3VzZUhvdmVyID0ge30sXHJcbiAgICBhY3RpdmVFbGVtZW50cyA9IFtdLFxyXG4gICAgaG92ZXJEaXN0YW5jZSA9IDYsXHJcbiAgICBzZWxlY3RlZE9wYWNpdHkgPSAxXHJcblxyXG4gIGZ1bmN0aW9uIGRvd24gKGUsIGNoYXJ0KSB7XHJcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpXHJcbiAgICBlLnByZXZlbnREZWZhdWx0KClcclxuXHJcbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBnZXRDb29yZGluYXRlcyhlLCBjaGFydClcclxuXHJcbiAgICB2YXIgaGl0ID0gaGl0RGV0ZWN0KGNoYXJ0LCBjb29yZGluYXRlcylcclxuXHJcbiAgICAvLyByZXR1cm4gb2Ygbm8gaGl0XHJcbiAgICBpZiAoT2JqZWN0LmtleXMoaGl0KS5sZW5ndGggPT0gMCkge1xyXG4gICAgICBkZXNlbGVjdChjaGFydClcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgLy8gc2V0IGlkZW50aWZpZXJcclxuICAgIGlmICh0eXBlb2YgZS5jaGFuZ2VkVG91Y2hlcyAhPSAndW5kZWZpbmVkJykge1xyXG4gICAgICBoaXQuaWRlbnRpZmllciA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uaWRlbnRpZmllclxyXG4gICAgfWVsc2Uge1xyXG4gICAgICBoaXQuaWRlbnRpZmllciA9ICdtb3VzZSdcclxuICAgIH1cclxuXHJcbiAgICAvLyBkZXNlbGVjdCBvdGhlciBlbGVtZW50cyBpZiB0aGV5IGFyZSBub3QgYmVpbmcgdG91Y2hlZFxyXG4gICAgaWYgKGFjdGl2ZUVsZW1lbnRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICBkZXNlbGVjdChjaGFydClcclxuICAgIH1cclxuXHJcbiAgICBhY3RpdmVFbGVtZW50cy5wdXNoKGhpdClcclxuXHJcbiAgICBpZiAodHlwZW9mIGUuY2hhbmdlZFRvdWNoZXMgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZHJhZylcclxuICAgIH1lbHNlIHtcclxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGRyYWcoZSwgY2hhcnQpXHJcbiAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgc2VsZWN0KGNoYXJ0LCBoaXQub3JpZ2luKVxyXG5cclxuICAgIGRyYWcoZSwgY2hhcnQpIC8vIHRvICBtYWtlIHN1cmUgdGhlIGhhbmRsZXMgcG9zaXRpb25zIHRvIHRoZSBjdXJzb3IgZXZlbiBiZWZvcmUgbW92ZW1lbnRcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldENvb3JkaW5hdGVzIChlLCBjaGFydCkge1xyXG4gICAgdmFyIG1vdXNlWCxtb3VzZVlcclxuICAgIHZhciBjYW52YXMgPSBjaGFydC5jYW52YXNcclxuICAgIC8vIG9yaWdvIGlzICgwLDApXHJcbiAgICB2YXIgYm91bmRpbmdSZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXHJcblxyXG4gICAgdmFyIHdpZHRoID0gY2FudmFzLndpZHRoXHJcbiAgICB2YXIgaGVpZ2h0ID0gY2FudmFzLmhlaWdodFxyXG5cclxuICAgIGlmIChlLmNoYW5nZWRUb3VjaGVzKSB7XHJcbiAgICAgIG1vdXNlWCA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0XHJcbiAgICAgIG1vdXNlWSA9IGUuY2hhbmdlZFRvdWNoZXNbMF0uY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3BcclxuICAgIH1lbHNlIHtcclxuICAgICAgbW91c2VYID0gZS5jbGllbnRYIC0gYm91bmRpbmdSZWN0LmxlZnRcclxuICAgICAgbW91c2VZID0gZS5jbGllbnRZIC0gYm91bmRpbmdSZWN0LnRvcFxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIHg6IG1vdXNlWCxcclxuICAgICAgeTogbW91c2VZXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBoaXREZXRlY3QgKGNoYXJ0LCBjb29yZGluYXRlcykge1xyXG4gICAgdmFyIGNhbnZhcyA9IGNoYXJ0LmNhbnZhc1xyXG4gICAgdmFyIGRhdGEgPSBjaGFydC5kYXRhXHJcblxyXG4gICAgLy8gd2lsbCByZXR1cm46XHJcbiAgICAvLyBlbGVtZW50XHJcbiAgICAvLyB0eXBlIChzdGFydCwgZW5kLCBvciBtaWRkbGUpXHJcbiAgICAvLyBkaXN0YW5jZVxyXG5cclxuICAgIHZhciBoaXQgPSB7fVxyXG5cclxuICAgIC8vIGhpdCBkZXRlY3Rpb24gb2YgaGFuZGxlczpcclxuXHJcbiAgICB2YXIgZGlzdGFuY2U7XHJcblxyXG4gICAgZGF0YS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuXHJcbiAgICAgIC8vIGlmIGVsZW1lbnQgaXMgbm90IHNlbGVjdGVkLCBjb250aW51ZVxyXG4gICAgICBpZiAoIWNoYXJ0LmlzU2VsZWN0ZWQoZWxlbWVudCkpe1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIFsnc3RhcnQnLCAnZW5kJ10uZm9yRWFjaChmdW5jdGlvbihzdGFydE9yRW5kKSB7XHJcbiAgICAgICAgdmFyIHBvaW50ID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgZWxlbWVudFtzdGFydE9yRW5kXSwgZWxlbWVudC50eXBlLmxhbmUuZW5kKVxyXG4gICAgICAgIFxyXG4gICAgICAgIGRpc3RhbmNlID0gaGVscGVycy5kaXN0YW5jZShwb2ludC54LCBwb2ludC55LCBjb29yZGluYXRlcylcclxuICAgICAgICBpZihkaXN0YW5jZSA8IGNoYXJ0LmNvbmZpZy5oYW5kbGVzQ2xpY2tEaXN0YW5jZSl7XHJcbiAgICAgICAgICBpZiAodHlwZW9mIGhpdC5kaXN0YW5jZSA9PSAndW5kZWZpbmVkJyB8fCBkaXN0YW5jZSA8IGhpdC5kaXN0YW5jZSkge1xyXG4gICAgICAgICAgICBoaXQgPSB7XHJcbiAgICAgICAgICAgICAgb3JpZ2luOiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgIHR5cGU6IHN0YXJ0T3JFbmQsXHJcbiAgICAgICAgICAgICAgZGlzdGFuY2U6IGRpc3RhbmNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG5cclxuXHJcbiAgICAvLyBpZiBubyBoYW5kbGUgaXMgaGl0LCBjaGVjayBmb3IgbWlkZGxlIGhpdFxyXG5cclxuICAgIGlmIChPYmplY3Qua2V5cyhoaXQpLmxlbmd0aCA9PSAwKSB7XHJcblxyXG4gICAgICB2YXIgaW5mbyA9IGhlbHBlcnMuWFl0b0luZm8oY2hhcnQsIGNvb3JkaW5hdGVzLngsIGNvb3JkaW5hdGVzLnkpXHJcblxyXG4gICAgICAvLyBsb29wIHRocm91Z2ggZWxlbWVudHNcclxuICAgICAgZGF0YS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuXHJcbiAgICAgICAgLy8gY2hlY2sgaWYgcG9pbnQgaXMgaW5zaWRlIGVsZW1lbnQgaG9yaXpvbnRhbGx5XHJcbiAgICAgICAgaWYgKGhlbHBlcnMuaXNJbnNpZGUoaW5mby5taW51dGVzLCBlbGVtZW50LnN0YXJ0LCBlbGVtZW50LmVuZCkpIHtcclxuXHJcbiAgICAgICAgICAvLyBjaGVjayBpZiBwb2ludCBpcyBpbnNpZGUgZWxlbWVudCB2ZXJ0aWNhbGx5XHJcbiAgICAgICAgICB2YXIgaW5uZXJSYWRpdXMgPSBlbGVtZW50LnR5cGUubGFuZS5zdGFydFxyXG4gICAgICAgICAgdmFyIG91dGVyUmFkaXVzID0gZWxlbWVudC50eXBlLmxhbmUuZW5kXHJcblxyXG4gICAgICAgICAgaWYgKGluZm8uZGlzdGFuY2UgPiBpbm5lclJhZGl1cyAmJiBpbmZvLmRpc3RhbmNlIDwgb3V0ZXJSYWRpdXMpIHtcclxuICAgICAgICAgICAgcG9zaXRpb25JbkVsZW1lbnQgPSBpbmZvLm1pbnV0ZXMtZWxlbWVudC5zdGFydFxyXG4gICAgICAgICAgICBoaXQgPSB7XHJcbiAgICAgICAgICAgICAgb3JpZ2luOiBlbGVtZW50LFxyXG4gICAgICAgICAgICAgIHR5cGU6ICd3aG9sZScsXHJcbiAgICAgICAgICAgICAgcG9zaXRpb25JbkVsZW1lbnQ6IHBvc2l0aW9uSW5FbGVtZW50XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICAgIFxyXG4gICAgfVxyXG5cclxuXHJcbiAgICByZXR1cm4gaGl0XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBob3ZlciAoZSwgY2hhcnQpIHtcclxuICAgIHZhciBjb29yZGluYXRlcyA9IGdldENvb3JkaW5hdGVzKGUsIGNoYXJ0KVxyXG4gICAgdmFyIGhpdCA9IGhpdERldGVjdChjaGFydCwgY29vcmRpbmF0ZXMpXHJcblxyXG4gICAgaWYoaGl0KXtcclxuICAgICAgLy8gY2hhcnQuc2V0RWxlbWVudFN0YXRlKGhpdC5jb3VudCwgJ2hvdmVyJylcclxuICAgIH1lbHNle1xyXG4gICAgICAvLyBjaGFydC5yZW1vdmVFbGVtZW50U3RhdGVzKClcclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGFydC5yZWRyYXcoKVxyXG4gIH1cclxuXHJcblxyXG4gIGZ1bmN0aW9uIGRyYWcgKGUsIGNoYXJ0KSB7XHJcbiAgICB2YXIgaWRlbnRpZmllciA9IGZpbmRJZGVudGlmaWVyKGUpXHJcblxyXG4gICAgdmFyIGRyYWdFbGVtZW50ID0gZ2V0QWN0aXZlRWxlbWVudChpZGVudGlmaWVyKVxyXG5cclxuICAgIGlmICghZHJhZ0VsZW1lbnQpIHtcclxuICAgICAgcmV0dXJuXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGNvb3JkaW5hdGVzID0gZ2V0Q29vcmRpbmF0ZXMoZSwgY2hhcnQpXHJcbiAgICB2YXIgbWludXRlcyA9IGhlbHBlcnMuWFl0b0luZm8oY2hhcnQsIGNvb3JkaW5hdGVzLngsIGNvb3JkaW5hdGVzLnkpLm1pbnV0ZXNcclxuICAgIHZhciBvcmlnaW5FbGVtZW50ID0gZHJhZ0VsZW1lbnQub3JpZ2luXHJcblxyXG4gICAgaWYoZHJhZ0VsZW1lbnQudHlwZSA9PSAnc3RhcnQnIHx8IGRyYWdFbGVtZW50LnR5cGUgPT0gJ2VuZCcpe1xyXG4gICAgICBvcmlnaW5FbGVtZW50W2RyYWdFbGVtZW50LnR5cGVdID0gc25hcChtaW51dGVzKVxyXG4gICAgfVxyXG4gICAgZWxzZSBpZihkcmFnRWxlbWVudC50eXBlID09ICd3aG9sZScpe1xyXG4gICAgICB2YXIgcG9zaXRpb25JbkVsZW1lbnQgPSBkcmFnRWxlbWVudC5wb3NpdGlvbkluRWxlbWVudFxyXG4gICAgICB2YXIgZHVyYXRpb24gPSBoZWxwZXJzLnJhbmdlKG9yaWdpbkVsZW1lbnQuc3RhcnQsIG9yaWdpbkVsZW1lbnQuZW5kKVxyXG5cclxuICAgICAgb3JpZ2luRWxlbWVudC5zdGFydCA9IHNuYXAoaGVscGVycy5saW1pdChNYXRoLnJvdW5kKG1pbnV0ZXMgLSBwb3NpdGlvbkluRWxlbWVudCkpKVxyXG4gICAgICBvcmlnaW5FbGVtZW50LmVuZCA9IGhlbHBlcnMubGltaXQoTWF0aC5yb3VuZChvcmlnaW5FbGVtZW50LnN0YXJ0ICsgZHVyYXRpb24pKVxyXG4gICAgfVxyXG4gICAgY2hhcnQuZGF0YUNoYW5nZWQoKVxyXG5cclxuICAgIGZ1bmN0aW9uIHNuYXAoaW5wdXQpIHtcclxuICAgICAgcmV0dXJuIDUgKiBNYXRoLnJvdW5kKGlucHV0IC8gNSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVuZm9jdXMgKGUpIHtcclxuICAgIC8vIGNoZWNrcyBpZiBjbGljayBpcyBvbiBhIHBhcnQgb2YgdGhlIHNpdGUgdGhhdCBzaG91bGQgbWFrZSB0aGVcclxuICAgIC8vIGN1cnJlbnQgc2VsZWN0ZWQgZWxlbWVudHMgYmUgZGVzZWxlY3RlZFxyXG5cclxuICAgIHZhciB4LCB5XHJcbiAgICB2YXIgZG9tRWxlbWVudFxyXG5cclxuICAgIHggPSBlLmNsaWVudFhcclxuICAgIHkgPSBlLmNsaWVudFlcclxuXHJcbiAgICB2YXIgZG9tRWxlbWVudCA9IGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoeCwgeSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNlbGVjdCAoY2hhcnQsIGVsZW1lbnQpIHtcclxuICAgIC8vIG5vdGlmeSBjb3JlIG1vZHVsZTpcclxuICAgIGNoYXJ0LnNldFNlbGVjdGVkKGVsZW1lbnQpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkZXNlbGVjdCAoY2hhcnQsIGVsZW1lbnQpIHtcclxuICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAvLyBkZXNlbGVjdCBhbGxcclxuICAgICAgY2hhcnQuZGVzZWxlY3QoKVxyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBkcmFnKVxyXG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBkcmFnKVxyXG4gICAgfVxyXG4gICAgLy8gZGVzZWxlY3Qgb25lXHJcbiAgICBjaGFydC5kZXNlbGVjdChlbGVtZW50KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmluZElkZW50aWZpZXIgKGUpIHtcclxuICAgIGlmIChlLnR5cGUuc2VhcmNoKCdtb3VzZScpID49IDApIHtcclxuICAgICAgcmV0dXJuICdtb3VzZSdcclxuICAgIH1lbHNlIHtcclxuICAgICAgcmV0dXJuIGUuY2hhbmdlZFRvdWNoZXNbMF0uaWRlbnRpZmllclxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0QWN0aXZlRWxlbWVudCAoaWRlbnRpZmllcikge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3RpdmVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoYWN0aXZlRWxlbWVudHNbaV0uaWRlbnRpZmllciA9PSBpZGVudGlmaWVyKSB7XHJcbiAgICAgICAgcmV0dXJuIGFjdGl2ZUVsZW1lbnRzW2ldXHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcmVtb3ZlQWN0aXZlRWxlbWVudCAoaWRlbnRpZmllcikge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhY3RpdmVFbGVtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoYWN0aXZlRWxlbWVudHNbaV0uaWRlbnRpZmllciA9PSBpZGVudGlmaWVyKSB7XHJcbiAgICAgICAgYWN0aXZlRWxlbWVudHMuc3BsaWNlKGksIDEpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVwIChlLCBjaGFydCkge1xyXG4gICAgdmFyIGlkZW50aWZpZXIgPSBmaW5kSWRlbnRpZmllcihlKVxyXG4gICAgdmFyIGVsZW1lbnQgPSBnZXRBY3RpdmVFbGVtZW50KGlkZW50aWZpZXIpXHJcblxyXG4gICAgaWYgKGFjdGl2ZUVsZW1lbnRzLmxlbmd0aCAhPSAwKSB7XHJcbiAgICAgIC8vIGNoYXJ0SGlzdG9yeS5hZGQobmFwY2hhcnRDb3JlLmdldFNjaGVkdWxlKCksICdtb3ZlZCAnICsgZWxlbWVudC5uYW1lICsgJyAnICsgKGVsZW1lbnQuY291bnQgKyAxKSlcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaW5kIHRoZSBzaGl0IHRvIHJlbW92ZVxyXG4gICAgcmVtb3ZlQWN0aXZlRWxlbWVudChpZGVudGlmaWVyKVxyXG5cclxuICAgIGNoYXJ0LnJlZHJhd1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc25hcCAoaW5wdXQpIHtcclxuICAgIHZhciBvdXRwdXQgPSBpbnB1dFxyXG5cclxuICAgIGlmIChzZXR0aW5ncy5nZXRWYWx1ZSgnc25hcDEwJykpIHtcclxuICAgICAgb3V0cHV0ID0gMTAgKiBNYXRoLnJvdW5kKGlucHV0IC8gMTApXHJcbiAgICB9ZWxzZSBpZiAoc2V0dGluZ3MuZ2V0VmFsdWUoJ3NuYXA1JykpIHtcclxuICAgICAgb3V0cHV0ID0gNSAqIE1hdGgucm91bmQoaW5wdXQgLyA1KVxyXG4gICAgfWVsc2Uge1xyXG5cclxuICAgICAgLy8gaG91clxyXG4gICAgICBpZiAoaW5wdXQgJSA2MCA8IDcpXHJcbiAgICAgICAgb3V0cHV0ID0gaW5wdXQgLSBpbnB1dCAlIDYwXHJcbiAgICAgIGVsc2UgaWYgKGlucHV0ICUgNjAgPiA1MylcclxuICAgICAgICBvdXRwdXQgPSBpbnB1dCArICg2MCAtIGlucHV0ICUgNjApXHJcblxyXG4gICAgICAvLyBoYWxmIGhvdXJzXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIGlucHV0ICs9IDMwXHJcblxyXG4gICAgICAgIGlmIChpbnB1dCAlIDYwIDwgNSlcclxuICAgICAgICAgIG91dHB1dCA9IGlucHV0IC0gaW5wdXQgJSA2MCAtIDMwXHJcbiAgICAgICAgZWxzZSBpZiAoaW5wdXQgJSA2MCA+IDU1KVxyXG4gICAgICAgICAgb3V0cHV0ID0gaW5wdXQgKyAoNjAgLSBpbnB1dCAlIDYwKSAtIDMwXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb3V0cHV0XHJcbiAgfVxyXG59XHJcbiIsIi8qKlxyXG4gKlxyXG4gKiBmdW5jdGlvbiBjYWxjdWxhdGVTaGFwZVxyXG4gKiBcclxuICogVGhpcyBmdW5jdGlvbiB0YWtlcyBhIG5vcm1hbCBzaGFwZSBkZWZpbml0aW9uIG9iamVjdFxyXG4gKiBhbmQgY2FsY3VsYXRlcyBwb3NpdGlvbnMgYW5kIHNpemVzXHJcbiAqXHJcbiAqIFJldHVybnMgYSBtb3JlIGRldGFpbGVkIHNoYXBlIG9iamVjdCB0aGF0IGlzIGxhdGVyXHJcbiAqIGFzc2lnbmVkIHRvIGNoYXJ0LnNoYXBlIGFuZCB1c2VkIHdoZW4gZHJhd2luZ1xyXG4gKlxyXG4gKi9cclxuXHJcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjYWxjdWxhdGVTaGFwZShjaGFydCwgc2hhcGUpe1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWRkIHJhZGlhbnMgb3IgbWludXRlcyBwcm9wZXJ0aWVzXHJcbiAgICAgKi9cclxuXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgZWxlbWVudC5sZW5ndGggPSBlbGVtZW50LnZhbHVlXHJcbiAgICAgICAgZWxlbWVudC5yYWRpYW5zID0gZWxlbWVudC52YWx1ZVxyXG4gICAgICB9ZWxzZSBpZihlbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAgICAgZWxlbWVudC5sZW5ndGggPSBlbGVtZW50LnZhbHVlXHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIG91dCB0b3RhbFJhZGlhbnNcclxuICAgICAqIFRoaXMgYmUgMiAqIFBJIGlmIHRoZSBzaGFwZSBpcyBjaXJjdWxhclxyXG4gICAgICovXHJcblxyXG4gICAgdmFyIHRvdGFsUmFkaWFucyA9IDBcclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAvLyBpZihlbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuICAgICAgICB0b3RhbFJhZGlhbnMgKz0gZWxlbWVudC52YWx1ZVxyXG4gICAgICAvLyB9XHJcbiAgICB9KVxyXG5cclxuXHJcbiAgICAvLyAqXHJcbiAgICAvLyAgKiBGaW5kIHRoZSBzdW0gb2YgbWludXRlcyBpbiB0aGUgbGluZSBlbGVtZW50c1xyXG4gICAgLy8gICogQXJjIGVsZW1lbnRzIGRvZXMgbm90IGRlZmluZSBtaW51dGVzLCBvbmx5IHJhZGlhbnNcclxuICAgICBcclxuXHJcbiAgICAvLyB2YXIgdG90YWxNaW51dGVzID0gMFxyXG4gICAgLy8gc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAvLyAgIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgIC8vICAgICB0b3RhbE1pbnV0ZXMgKz0gZWxlbWVudC5taW51dGVzXHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH0pXHJcblxyXG4gICAgLy8gaWYodG90YWxNaW51dGVzID4gMTQ0MCl7XHJcbiAgICAvLyAgIHRocm93IG5ldyBFcnIoJ1RvbyBtYW55IG1pbnV0ZXMgaW4gbGluZSBzZWdtZW50cycpXHJcbiAgICAvLyB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIG91dCBhbmdsZSBvZiBzaGFwZXNcclxuICAgICAqL1xyXG5cclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaSkge1xyXG4gICAgICBpZihpID09PSAwKSBlbGVtZW50LnN0YXJ0QW5nbGUgPSAwIFxyXG4gICAgICBlbHNlIGVsZW1lbnQuc3RhcnRBbmdsZSA9IHNoYXBlW2ktMV0uZW5kQW5nbGVcclxuICAgICAgXHJcbiAgICAgIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICAgIGVsZW1lbnQuZW5kQW5nbGUgPSBlbGVtZW50LnN0YXJ0QW5nbGUgKyBlbGVtZW50LnJhZGlhbnNcclxuICAgICAgfWVsc2UgaWYoZWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG4gICAgICAgIGVsZW1lbnQuZW5kQW5nbGUgPSBlbGVtZW50LnN0YXJ0QW5nbGVcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICAvKipcclxuICAgICAqIEZpbmQgb3V0IGxlbmd0aCBvZiB0aGUgc2hhcGVzXHJcbiAgICAgKiBcclxuICAgICAqIFBlcmltZXRlciBvZiBjaXJjbGUgPSAyICogcmFkaXVzICogUElcclxuICAgICAqL1xyXG5cclxuICAgIC8vIHZhciBtaW51dGVMZW5ndGhSYXRpbyA9IDAuNDVcclxuICAgIC8vIHZhciBmb3VuZEFyYyA9IHNoYXBlLnNvbWUoZnVuY3Rpb24oZWxlbWVudCwgaSkge1xyXG4gICAgLy8gICBpZihlbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuICAgIC8vICAgICBlbGVtZW50Lmxlbmd0aCA9IGJhc2VSYWRpdXMgKiBlbGVtZW50LnJhZGlhbnNcclxuICAgIC8vICAgICBpZihlbGVtZW50Lm1pbnV0ZXMgIT0gMClcclxuICAgIC8vICAgICBtaW51dGVMZW5ndGhSYXRpbyA9IGVsZW1lbnQubGVuZ3RoIC8gZWxlbWVudC5taW51dGVzXHJcbiAgICAvLyAgICAgY29uc29sZS5sb2coZWxlbWVudC5sZW5ndGgsIGVsZW1lbnQubWludXRlcylcclxuICAgIC8vICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9KVxyXG5cclxuICAgIHZhciB0b3RhbExlbmd0aCA9IDBcclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaSkge1xyXG4gICAgICBpZihlbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuICAgICAgICBlbGVtZW50Lmxlbmd0aCA9IGVsZW1lbnQubGVuZ3RoICogY2hhcnQuY29uZmlnLmJhc2VSYWRpdXNcclxuICAgICAgfWVsc2UgaWYoZWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG4gICAgICAgIGVsZW1lbnQubGVuZ3RoID0gZWxlbWVudC5sZW5ndGggKiBjaGFydC5yYXRpb1xyXG4gICAgICB9XHJcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGVsZW1lbnQubGVuZ3RoXHJcbiAgICB9KVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIGhvdyBtYW55IG1pbnV0ZXMgZWFjaCBhcmMgZWxlbWVudCBzaG91bGQgZ2V0XHJcbiAgICAgKiBiYXNlZCBvbiBob3cgbWFueSBtaW51dGVzIGFyZSBsZWZ0IGFmdGVyIGxpbmUgZWxlbWVudHNcclxuICAgICAqIGdldCB3aGF0IHRoZXkgc2hvdWxkIGhhdmVcclxuICAgICAqL1xyXG5cclxuICAgIHZhciBtaW51dGVzTGVmdEZvckFyY3MgPSAxNDQwIFxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgIGVsZW1lbnQubWludXRlcyA9IE1hdGguY2VpbCgoZWxlbWVudC5sZW5ndGggLyB0b3RhbExlbmd0aCkgKiAxNDQwKVxyXG4gICAgfSlcclxuXHJcbiAgICAvKipcclxuICAgICAqIE9rLCBzbyB0b3RhbE1pbnV0ZXMgaXMgbm93IDE0NDBcclxuICAgICAqIE5vdyB3ZSBuZWVkIHRvIGNyZWF0ZSBhIC5zdGFydCBhbmQgLmVuZCBwb2ludCBvbiBhbGxcclxuICAgICAqIHRoZSBzaGFwZSBlbGVtZW50c1xyXG4gICAgICovXHJcblxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpKSB7XHJcbiAgICAgIGlmKGkgPT09IDApIGVsZW1lbnQuc3RhcnQgPSAwXHJcbiAgICAgIGVsc2UgaWYoaSA+IDApIGVsZW1lbnQuc3RhcnQgPSBzaGFwZVtpLTFdLmVuZFxyXG4gICAgICBlbGVtZW50LmVuZCA9IGVsZW1lbnQuc3RhcnQgKyBlbGVtZW50Lm1pbnV0ZXNcclxuICAgIH0pXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDYWxjdWxhdGUgc3RhcnRQb2ludHMgYW5kIGVuZFBvaW50c1xyXG4gICAgICogRmlyc3QgcG9pbnQgaXMgY2VudGVyXHJcbiAgICAgKiBUaGUgcG9pbnQgb25seSBjaGFuZ2VzIG9uIGxpbmUtc2VnbWVudHNcclxuICAgICAqL1xyXG5cclxuICAgIHZhciBjZW50ZXIgPSB7XHJcbiAgICAgIHg6Y2hhcnQudy8yLFxyXG4gICAgICB5OmNoYXJ0LmgvMlxyXG4gICAgfVxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpKSB7XHJcbiAgICAgIGlmKGkgPT09IDApe1xyXG4gICAgICAgIGVsZW1lbnQuc3RhcnRQb2ludCA9IGNlbnRlclxyXG4gICAgICAgIGVsZW1lbnQuZW5kUG9pbnQgPSBjZW50ZXJcclxuICAgICAgfWVsc2UgaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgZWxlbWVudC5zdGFydFBvaW50ID0gc2hhcGVbaS0xXS5lbmRQb2ludFxyXG4gICAgICAgIGVsZW1lbnQuZW5kUG9pbnQgPSBzaGFwZVtpLTFdLmVuZFBvaW50XHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICBlbGVtZW50LnN0YXJ0UG9pbnQgPSBzaGFwZVtpLTFdLmVuZFBvaW50XHJcbiAgICAgIH1cclxuICAgICAgaWYoZWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG4gICAgICAgIGVsZW1lbnQuZW5kUG9pbnQgPSB7XHJcbiAgICAgICAgICB4OiBlbGVtZW50LnN0YXJ0UG9pbnQueCArIE1hdGguY29zKGVsZW1lbnQuc3RhcnRBbmdsZSkgKiBlbGVtZW50Lmxlbmd0aCxcclxuICAgICAgICAgIHk6IGVsZW1lbnQuc3RhcnRQb2ludC55ICsgTWF0aC5zaW4oZWxlbWVudC5zdGFydEFuZ2xlKSAqIGVsZW1lbnQubGVuZ3RoXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2VudGVyIHRoZSBzaGFwZVxyXG4gICAgICovXHJcblxyXG4gICAgdmFyIGxpbWl0cyA9IHt9XHJcbiAgICBmdW5jdGlvbiBwdXNoTGltaXRzKHBvaW50KXtcclxuICAgICAgaWYoT2JqZWN0LmtleXMobGltaXRzKS5sZW5ndGggPT09IDApe1xyXG4gICAgICAgIGxpbWl0cyA9IHtcclxuICAgICAgICAgIHVwOiBwb2ludC55LFxyXG4gICAgICAgICAgZG93bjogcG9pbnQueSxcclxuICAgICAgICAgIGxlZnQ6IHBvaW50LngsXHJcbiAgICAgICAgICByaWdodDogcG9pbnQueFxyXG4gICAgICAgIH1cclxuICAgICAgfWVsc2V7XHJcbiAgICAgICAgaWYocG9pbnQueSA8IGxpbWl0cy51cCkgbGltaXRzLnVwID0gcG9pbnQueVxyXG4gICAgICAgIGlmKHBvaW50LnkgPiBsaW1pdHMuZG93bikgbGltaXRzLmRvd24gPSBwb2ludC55XHJcbiAgICAgICAgaWYocG9pbnQueCA8IGxpbWl0cy5sZWZ0KSBsaW1pdHMubGVmdCA9IHBvaW50LnhcclxuICAgICAgICBpZihwb2ludC54ID4gbGltaXRzLnJpZ2h0KSBsaW1pdHMucmlnaHQgPSBwb2ludC54XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaSkge1xyXG4gICAgICBwdXNoTGltaXRzKGVsZW1lbnQuc3RhcnRQb2ludClcclxuICAgICAgcHVzaExpbWl0cyhlbGVtZW50LmVuZFBvaW50KVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyB3ZSBuZWVkIHRvIGtub3cgdGhlIGRpc3RhbmNlcyB0byB0aGUgZWRnZSBvZiB0aGUgY2FudmFzXHJcbiAgICBsaW1pdHMuZG93biA9IGNoYXJ0LmggLSBsaW1pdHMuZG93blxyXG4gICAgbGltaXRzLnJpZ2h0ID0gY2hhcnQudyAtIGxpbWl0cy5yaWdodFxyXG5cclxuICAgIC8vIHRoZSBkaXN0YW5jZXMgc2hvdWxkIGJlIGVxdWFsLCB0aGVyZWZvcmUsIHNoaWZ0IHRoZSBwb2ludHNcclxuICAgIC8vIGlmIGl0IGlzIG5vdFxyXG4gICAgdmFyIHNoaWZ0TGVmdCA9IChsaW1pdHMubGVmdCAtIGxpbWl0cy5yaWdodCkgLyAyXHJcbiAgICB2YXIgc2hpZnRVcCA9IChsaW1pdHMudXAgLSBsaW1pdHMuZG93bikgLyAyXHJcbiAgICBcclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaSkge1xyXG4gICAgICBlbGVtZW50LnN0YXJ0UG9pbnQgPSB7XHJcbiAgICAgICAgeDogZWxlbWVudC5zdGFydFBvaW50LnggLSBzaGlmdExlZnQsXHJcbiAgICAgICAgeTogZWxlbWVudC5zdGFydFBvaW50LnkgLSBzaGlmdFVwXHJcbiAgICAgIH1cclxuICAgICAgZWxlbWVudC5lbmRQb2ludCA9IHtcclxuICAgICAgICB4OiBlbGVtZW50LmVuZFBvaW50LnggLSBzaGlmdExlZnQsXHJcbiAgICAgICAgeTogZWxlbWVudC5lbmRQb2ludC55IC0gc2hpZnRVcFxyXG4gICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIHJldHVybiBzaGFwZVxyXG4gIH1cclxuXHJcbiAgIiwiLypcclxuKlxyXG4qIFNoYXBlIG1vZHVsZVxyXG4qXHJcbiovXHJcblxyXG52YXIgc2hhcGVzID0gcmVxdWlyZSgnLi9zaGFwZXMnKVxyXG52YXIgY2FsY3VsYXRlU2hhcGUgPSByZXF1aXJlKCcuL2NhbGN1bGF0ZVNoYXBlJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcbiAgdmFyIGN1cnJlbnRTaGFwZVxyXG5cclxuICBOYXBjaGFydC5vbignaW5pdGlhbGl6ZScsIGZ1bmN0aW9uKGNoYXJ0KSB7XHJcbiAgICAgIHNldFNoYXBlKGNoYXJ0LCBjaGFydC5jb25maWcuc2hhcGUpXHJcbiAgICAgIC8vIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5sb2dvJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgLy8gICBjaGFuZ2VTaGFwZShjaGFydClcclxuICAgICAgLy8gfSlcclxuICB9KVxyXG5cclxuICBOYXBjaGFydC5vbignc2V0U2hhcGUnLCBzZXRTaGFwZSkgXHJcblxyXG4gIC8vIGFkZCBzb21lIGV4dHJhIGhlbHBlcnNcclxuICB2YXIgc2hhcGVIZWxwZXJzID0gcmVxdWlyZSgnLi9zaGFwZUhlbHBlcnMnKShOYXBjaGFydClcclxuXHJcbiAgZnVuY3Rpb24gc2V0U2hhcGUoY2hhcnQsIHNoYXBlKSB7XHJcbiAgICBpZih0eXBlb2Ygc2hhcGUgPT0gJ3N0cmluZycpe1xyXG4gICAgICBjdXJyZW50U2hhcGUgPSBzaGFwZVxyXG4gICAgICBzaGFwZSA9IHNoYXBlc1tzaGFwZV1cclxuICAgIH1cclxuXHJcbiAgICBjaGFydC5zaGFwZSA9IGNhbGN1bGF0ZVNoYXBlKGNoYXJ0LCBzaGFwZSlcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNoYW5nZVNoYXBlKGNoYXJ0KSB7XHJcbiAgICAvLyBpZihjdXJyZW50U2hhcGUgPT09ICdzbWlzbGUnKXtcclxuICAgIC8vICAgY2hhcnQuYW5pbWF0ZVNoYXBlKHNoYXBlc1snY2lyY2xlJ10pXHJcbiAgICAvLyAgIGN1cnJlbnRTaGFwZSA9ICdjaXJjbGUnXHJcbiAgICAvLyB9XHJcbiAgICAvLyBjaGFydC5hbmltYXRlU2hhcGUoc2hhcGVzWydob3Jpem9udGFsRWxsaXBzZSddKVxyXG4gICAgdmFyIG5leHQgPSBmYWxzZVxyXG4gICAgZm9yKHByb3AgaW4gc2hhcGVzKXtcclxuICAgICAgaWYobmV4dCl7XHJcbiAgICAgICAgY2hhcnQuYW5pbWF0ZVNoYXBlKHNoYXBlc1twcm9wXSlcclxuICAgICAgICBjdXJyZW50U2hhcGUgPSBwcm9wXHJcbiAgICAgICAgbmV4dCA9IGZhbHNlXHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgICAgaWYoY3VycmVudFNoYXBlID09PSBwcm9wKXtcclxuICAgICAgICBuZXh0ID0gdHJ1ZVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZihuZXh0ID09PSB0cnVlKXtcclxuICAgICAgY2hhcnQuYW5pbWF0ZVNoYXBlKHNoYXBlc1snY2lyY2xlJ10pXHJcbiAgICAgIGN1cnJlbnRTaGFwZSA9ICdjaXJjbGUnXHJcbiAgICB9XHJcblxyXG4gICAgY2hhcnQucmVkcmF3KClcclxuICB9XHJcblxyXG5cclxufVxyXG4iLCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oTmFwY2hhcnQpIHtcclxuICBcclxuICB2YXIgaGVscGVycyA9IE5hcGNoYXJ0LmhlbHBlcnNcclxuXHJcbiAgaGVscGVycy5YWXRvSW5mbyA9IGZ1bmN0aW9uIChjaGFydCwgeCwgeSl7XHJcbiAgICAvLyB3aWxsIGdhdGhlciB0d28gdGhpbmdzOiBtaW51dGVzIGFuZCBkaXN0YW5jZSBmcm9tIGJhc2Vwb2ludFxyXG4gICAgdmFyIG1pbnV0ZXMsIGRpc3RhbmNlXHJcbiAgICB2YXIgc2hhcGUgPSBjaGFydC5zaGFwZVxyXG5cclxuICAgIC8vIHdoaWNoIGhhcyBpbiBzZWN0b3I/XHJcbiAgICB2YXIgZWxlbWVudHNJblNlY3RvciA9IFtdXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsaSkge1xyXG4gICAgICBpZihlbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuICAgICAgICB2YXIgYW5nbGUgPSBoZWxwZXJzLmFuZ2xlQmV0d2VlblR3b1BvaW50cyh4LCB5LCBlbGVtZW50LnN0YXJ0UG9pbnQpXHJcbiAgICAgICAgaWYoYW5nbGUgPiBlbGVtZW50LnN0YXJ0QW5nbGUgJiYgYW5nbGUgPCBlbGVtZW50LmVuZEFuZ2xlKXtcclxuICAgICAgICAgIGVsZW1lbnRzSW5TZWN0b3IucHVzaChlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgfWVsc2UgaWYoZWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG4gICAgICAgIHZhciBhbmdsZTEgPSBoZWxwZXJzLmFuZ2xlQmV0d2VlblR3b1BvaW50cyh4LCB5LCBlbGVtZW50LnN0YXJ0UG9pbnQpXHJcbiAgICAgICAgdmFyIGFuZ2xlMiA9IGhlbHBlcnMuYW5nbGVCZXR3ZWVuVHdvUG9pbnRzKHgsIHksIGVsZW1lbnQuZW5kUG9pbnQpXHJcblxyXG4gICAgICAgICAgaWYoaSA9PSAxKXtcclxuXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhhbmdsZTEsIGVsZW1lbnQuc3RhcnRBbmdsZSwgZWxlbWVudC5zdGFydEFuZ2xlICsgTWF0aC5QSS8yKVxyXG4gICAgICAgICAgY29uc29sZS5sb2coaGVscGVycy5pc0luc2lkZUFuZ2xlKGFuZ2xlMSwgZWxlbWVudC5zdGFydEFuZ2xlLCBlbGVtZW50LnN0YXJ0QW5nbGUgKyBNYXRoLlBJLzIpKVxyXG4gICAgICAgICAgY29uc29sZS5sb2coYW5nbGUyLCBlbGVtZW50LnN0YXJ0QW5nbGUgLSBNYXRoLlBJLzIsIGVsZW1lbnQuc3RhcnRBbmdsZSlcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGhlbHBlcnMuaXNJbnNpZGVBbmdsZShhbmdsZTIsIGVsZW1lbnQuc3RhcnRBbmdsZSAtIE1hdGguUEkvMiwgZWxlbWVudC5zdGFydEFuZ2xlKSlcclxuICAgICAgICAgIH0gXHJcbiAgICAgICAgaWYoaGVscGVycy5pc0luc2lkZUFuZ2xlKGFuZ2xlMSwgZWxlbWVudC5zdGFydEFuZ2xlLCBlbGVtZW50LnN0YXJ0QW5nbGUgKyBNYXRoLlBJLzIpICYmXHJcbiAgICAgICAgICBoZWxwZXJzLmlzSW5zaWRlQW5nbGUoYW5nbGUyLCBlbGVtZW50LnN0YXJ0QW5nbGUgLSBNYXRoLlBJLzIsIGVsZW1lbnQuc3RhcnRBbmdsZSkpe1xyXG4gICAgICAgICAgZWxlbWVudHNJblNlY3Rvci5wdXNoKGVsZW1lbnQpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIC8vIGZpbmQgdGhlIGNsb3Nlc3RcclxuICAgIC8vIHRoaXMgaXMgb25seSB1c2VmdWwgaWYgdGhlIHNoYXBlIGdvZXMgYXJvdW5kIGl0c2VsZiAoZXhhbXBsZTogc3BpcmFsKVxyXG4gICAgdmFyIHNoYXBlRWxlbWVudFxyXG4gICAgZWxlbWVudHNJblNlY3Rvci5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgdmFyIHRoaXNEaXN0YW5jZVxyXG4gICAgICBpZihlbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuICAgICAgICB0aGlzRGlzdGFuY2UgPSBoZWxwZXJzLmRpc3RhbmNlKHgsIHksIGVsZW1lbnQuc3RhcnRQb2ludClcclxuICAgICAgfWVsc2UgaWYoZWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG4gICAgICAgIHRoaXNEaXN0YW5jZSA9IGhlbHBlcnMuZGlzdGFuY2VGcm9tUG9pbnRUb0xpbmUoeCwgeSwgZWxlbWVudC5zdGFydFBvaW50LCBlbGVtZW50LmVuZFBvaW50KVxyXG4gICAgICB9XHJcbiAgICAgIGlmKHR5cGVvZiBkaXN0YW5jZSA9PSAndW5kZWZpbmVkJyB8fCB0aGlzRGlzdGFuY2UgPCBkaXN0YW5jZSl7XHJcbiAgICAgICAgZGlzdGFuY2UgPSB0aGlzRGlzdGFuY2VcclxuICAgICAgICBzaGFwZUVsZW1lbnQgPSBlbGVtZW50XHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLy8gY2FsY3VsYXRlIHRoZSByZWxhdGl2ZSBwb3NpdGlvbiBpbnNpZGUgdGhlIGVsZW1lbnRcclxuICAgIC8vIGFuZCBmaW5kIG1pbnV0ZXNcclxuICAgIHZhciBwb3NpdGlvbkluU2hhcGVFbGVtZW50XHJcblxyXG4gICAgaWYoc2hhcGVFbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuICAgICAgdmFyIGFuZ2xlID0gaGVscGVycy5hbmdsZUJldHdlZW5Ud29Qb2ludHMoeCwgeSwgc2hhcGVFbGVtZW50LnN0YXJ0UG9pbnQpXHJcbiAgICAgIHBvc2l0aW9uSW5TaGFwZUVsZW1lbnQgPSBoZWxwZXJzLmdldFByb2dyZXNzQmV0d2VlblR3b1ZhbHVlcyhhbmdsZSwgc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUsIHNoYXBlRWxlbWVudC5lbmRBbmdsZSlcclxuICAgIH1lbHNlIGlmKHNoYXBlRWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG4gICAgICB2YXIgYSA9IGhlbHBlcnMuZGlzdGFuY2VGcm9tUG9pbnRUb0xpbmUoeCwgeSwgc2hhcGVFbGVtZW50LnN0YXJ0UG9pbnQsIHNoYXBlRWxlbWVudC5lbmRQb2ludClcclxuICAgICAgdmFyIGIgPSBoZWxwZXJzLmRpc3RhbmNlKHgsIHksIHNoYXBlRWxlbWVudC5zdGFydFBvaW50KVxyXG4gICAgICB2YXIgbGVuZ3RoID0gTWF0aC5zcXJ0KGIqYiAtIGEqYSlcclxuICAgICAgcG9zaXRpb25JblNoYXBlRWxlbWVudCA9IGxlbmd0aCAvIHNoYXBlRWxlbWVudC5sZW5ndGhcclxuICAgIH0gXHJcbiAgICBcclxuICAgIHZhciBtaW51dGVzID0gaGVscGVycy5yYW5nZShzaGFwZUVsZW1lbnQuc3RhcnQsIHNoYXBlRWxlbWVudC5lbmQpICogcG9zaXRpb25JblNoYXBlRWxlbWVudCArIHNoYXBlRWxlbWVudC5zdGFydFxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIG1pbnV0ZXM6IG1pbnV0ZXMsXHJcbiAgICAgIGRpc3RhbmNlOiBkaXN0YW5jZSxcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGhlbHBlcnMubWludXRlc1RvWFkgPSBmdW5jdGlvbiAoY2hhcnQsIG1pbnV0ZXMsIHJhZGl1cyl7XHJcbiAgICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgICB2YXIgc2hhcGUgPSBjaGFydC5zaGFwZVxyXG5cclxuICAgIHZhciBtaW51dGVzID0gaGVscGVycy5saW1pdChtaW51dGVzKTtcclxuICAgIC8vIEZpbmQgb3V0IHdoaWNoIHNoYXBlRWxlbWVudCB3ZSBmaW5kIG91ciBwb2ludCBpblxyXG4gICAgdmFyIHNoYXBlRWxlbWVudCA9IHNoYXBlLmZpbmQoZnVuY3Rpb24gKGVsZW1lbnQpe1xyXG4gICAgICByZXR1cm4gKG1pbnV0ZXMgPj0gZWxlbWVudC5zdGFydCAmJiBtaW51dGVzIDw9IGVsZW1lbnQuZW5kKVxyXG4gICAgfSlcclxuICAgIGlmKHR5cGVvZiBzaGFwZUVsZW1lbnQgPT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICBjb25zb2xlLmxvZyhtaW51dGVzKVxyXG4gICAgICBjb25zb2xlLmxvZyhzaGFwZS5maW5kKGZ1bmN0aW9uIChlbGVtZW50KXtcclxuICAgICAgICBjb25zb2xlLmxvZyhlbGVtZW50KVxyXG4gICAgICAgIHJldHVybiAobWludXRlcyA+PSBlbGVtZW50LnN0YXJ0ICYmIG1pbnV0ZXMgPD0gZWxlbWVudC5lbmQpXHJcbiAgICAgIH0pKVxyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvLyBEZWNpbWFsIHVzZWQgdG8gY2FsY3VsYXRlIHdoZXJlIHRoZSBwb2ludCBpcyBpbnNpZGUgdGhlIHNoYXBlXHJcbiAgICB2YXIgcG9zaXRpb25JblNoYXBlID0gKG1pbnV0ZXMgLSBzaGFwZUVsZW1lbnQuc3RhcnQpIC8gc2hhcGVFbGVtZW50Lm1pbnV0ZXNcclxuXHJcbiAgICBpZihzaGFwZUVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuXHJcbiAgICAgIHZhciBiYXNlUG9pbnQgPSB7XHJcbiAgICAgICAgeDogc2hhcGVFbGVtZW50LnN0YXJ0UG9pbnQueCArIE1hdGguY29zKHNoYXBlRWxlbWVudC5zdGFydEFuZ2xlKSAqIHBvc2l0aW9uSW5TaGFwZSAqIHNoYXBlRWxlbWVudC5sZW5ndGgsXHJcbiAgICAgICAgeTogc2hhcGVFbGVtZW50LnN0YXJ0UG9pbnQueSArIE1hdGguc2luKHNoYXBlRWxlbWVudC5zdGFydEFuZ2xlKSAqIHBvc2l0aW9uSW5TaGFwZSAqIHNoYXBlRWxlbWVudC5sZW5ndGhcclxuICAgICAgfVxyXG4gICAgICB2YXIgcG9pbnQgPSB7XHJcbiAgICAgICAgeDogYmFzZVBvaW50LnggKyBNYXRoLmNvcyhzaGFwZUVsZW1lbnQuc3RhcnRBbmdsZS1NYXRoLlBJLzIpICogcmFkaXVzLFxyXG4gICAgICAgIHk6IGJhc2VQb2ludC55ICsgTWF0aC5zaW4oc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUtTWF0aC5QSS8yKSAqIHJhZGl1c1xyXG4gICAgICB9XHJcblxyXG4gICAgfWVsc2UgaWYgKHNoYXBlRWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcblxyXG4gICAgICB2YXIgY2VudGVyT2ZBcmMgPSBzaGFwZUVsZW1lbnQuc3RhcnRQb2ludDtcclxuICAgICAgdmFyIGFuZ2xlID0gcG9zaXRpb25JblNoYXBlICogc2hhcGVFbGVtZW50LnJhZGlhbnNcclxuICAgICAgdmFyIHBvaW50ID0ge1xyXG4gICAgICAgIHg6IGNlbnRlck9mQXJjLnggKyBNYXRoLmNvcyhzaGFwZUVsZW1lbnQuc3RhcnRBbmdsZSArIGFuZ2xlIC1NYXRoLlBJLzIpICogcmFkaXVzLFxyXG4gICAgICAgIHk6IGNlbnRlck9mQXJjLnkgKyBNYXRoLnNpbihzaGFwZUVsZW1lbnQuc3RhcnRBbmdsZSArIGFuZ2xlIC1NYXRoLlBJLzIpICogcmFkaXVzXHJcbiAgICAgIH1cclxuXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBvaW50XHJcbiAgfVxyXG5cclxuICBoZWxwZXJzLmNyZWF0ZUN1cnZlID0gZnVuY3Rpb24gY3JlYXRlQ3VydmUoY2hhcnQsIHN0YXJ0LCBlbmQsIHJhZGl1cywgYW50aWNsb2Nrd2lzZSl7XHJcbiAgICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcblxyXG4gICAgaWYodHlwZW9mIGFudGljbG9ja3dpc2UgPT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICB2YXIgYW50aWNsb2Nrd2lzZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBzaGFwZSA9IGNoYXJ0LnNoYXBlLnNsaWNlKCk7XHJcbiAgICBpZihhbnRpY2xvY2t3aXNlKXtcclxuICAgICAgc2hhcGUucmV2ZXJzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGZpbmQgb3V0IHdoaWNoIHNoYXBlRWxlbWVudCBoYXMgdGhlIHN0YXJ0IGFuZCBlbmRcclxuICAgIHZhciBzdGFydEVsZW1lbnRJbmRleCwgZW5kRWxlbWVudEluZGV4XHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgaWYoaGVscGVycy5pc0luc2lkZShzdGFydCwgZWxlbWVudC5zdGFydCwgZWxlbWVudC5lbmQpKXtcclxuICAgICAgICBzdGFydEVsZW1lbnRJbmRleCA9IGlcclxuICAgICAgfVxyXG4gICAgICBpZihoZWxwZXJzLmlzSW5zaWRlKGVuZCwgZWxlbWVudC5zdGFydCwgZWxlbWVudC5lbmQpKXtcclxuICAgICAgICBlbmRFbGVtZW50SW5kZXggPSBpO1xyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgXHJcbiAgICB2YXIgc2hhcGVFbGVtZW50cyA9IFtdXHJcbiAgICAvLyBjcmVhdGUgaXRlcmFibGUgdGFzayBhcnJheVxyXG4gICAgdmFyIHRhc2tBcnJheSA9IFtdO1xyXG4gICAgdmFyIHNraXBFbmRDaGVjayA9IGZhbHNlO1xyXG4gICAgdmFyIGRlZmF1bHRUYXNrO1xyXG4gICAgaWYoYW50aWNsb2Nrd2lzZSl7XHJcbiAgICAgIGRlZmF1bHRUYXNrID0ge1xyXG4gICAgICAgIHN0YXJ0OiAxLFxyXG4gICAgICAgIGVuZDogMFxyXG4gICAgICB9XHJcbiAgICB9ZWxzZXtcclxuICAgICAgZGVmYXVsdFRhc2sgPSB7XHJcbiAgICAgICAgc3RhcnQ6IDAsXHJcbiAgICAgICAgZW5kOiAxXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmb3IgKHZhciBpID0gc3RhcnRFbGVtZW50SW5kZXg7IGkgPCBzaGFwZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgdGFzayA9IHtcclxuICAgICAgICBzaGFwZUVsZW1lbnQ6IHNoYXBlW2ldLFxyXG4gICAgICAgIHN0YXJ0OiBkZWZhdWx0VGFzay5zdGFydCxcclxuICAgICAgICBlbmQ6IGRlZmF1bHRUYXNrLmVuZFxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZihpID09IHN0YXJ0RWxlbWVudEluZGV4KXtcclxuICAgICAgICB0YXNrLnN0YXJ0ID0gaGVscGVycy5nZXRQb3NpdGlvbkJldHdlZW5Ud29WYWx1ZXMoc3RhcnQsc2hhcGVbaV0uc3RhcnQsc2hhcGVbaV0uZW5kKTtcclxuICAgICAgfVxyXG4gICAgICBpZihpID09IGVuZEVsZW1lbnRJbmRleCl7XHJcbiAgICAgICAgdGFzay5lbmQgPSBoZWxwZXJzLmdldFBvc2l0aW9uQmV0d2VlblR3b1ZhbHVlcyhlbmQsc2hhcGVbaV0uc3RhcnQsc2hhcGVbaV0uZW5kKTtcclxuICAgICAgfVxyXG4gICAgICBpZihpID09IHN0YXJ0RWxlbWVudEluZGV4ICYmIGkgPT0gZW5kRWxlbWVudEluZGV4ICYmICh0YXNrLmVuZCA+IHRhc2suc3RhcnQgJiYgYW50aWNsb2Nrd2lzZSkgfHwgKHRhc2suZW5kIDwgdGFzay5zdGFydCAmJiAhYW50aWNsb2Nrd2lzZSkpe1xyXG4gICAgICAgIC8vIG1ha2Ugc3VyZSB0aGluZ3MgYXJlIGNvcnJlY3Qgd2hlbiBlbmQgaXMgbGVzcyB0aGFuIHN0YXJ0XHJcbiAgICAgICAgaWYodGFza0FycmF5Lmxlbmd0aCA9PSAwKXtcclxuICAgICAgICAgIC8vIGl0IGlzIGJlZ2lubmluZ1xyXG4gICAgICAgICAgdGFzay5lbmQgPSBkZWZhdWx0VGFzay5lbmQ7XHJcbiAgICAgICAgICBza2lwRW5kQ2hlY2sgPSB0cnVlO1xyXG4gICAgICAgIH1lbHNlIHtcclxuICAgICAgICAgIC8vIGl0IGlzIGVuZFxyXG4gICAgICAgICAgdGFzay5zdGFydCA9IGRlZmF1bHRUYXNrLnN0YXJ0O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgdGFza0FycmF5LnB1c2godGFzayk7XHJcblxyXG4gICAgICBpZihpID09IGVuZEVsZW1lbnRJbmRleCl7XHJcbiAgICAgICAgaWYoc2tpcEVuZENoZWNrKXtcclxuICAgICAgICAgIHNraXBFbmRDaGVjayA9IGZhbHNlO1xyXG4gICAgICAgICAgLy8gbGV0IGl0IHJ1biBhIHJvdW5kIGFuZCBhZGQgYWxsIHNoYXBlc1xyXG4gICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgLy8gZmluaXNoZWQuLiBub3RoaW5nIG1vcmUgdG8gZG8gaGVyZSFcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgd2UgcmVhY2hlZCBlbmQgb2YgYXJyYXkgd2l0aG91dCBoYXZpbmcgZm91bmRcclxuICAgICAgLy8gdGhlIGVuZCBwb2ludCwgaXQgbWVhbnMgdGhhdCB3ZSBoYXZlIHRvIGdvIHRvXHJcbiAgICAgIC8vIHRoZSBiZWdpbm5pbmcgYWdhaW5cclxuICAgICAgLy8gZXguIHdoZW4gc3RhcnQ6NzAwIGVuZDozMDBcclxuICAgICAgaWYoaSA9PSBzaGFwZS5sZW5ndGgtMSl7XHJcbiAgICAgICAgaSA9IC0xO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0YXNrQXJyYXkuZm9yRWFjaChmdW5jdGlvbih0YXNrLCBpKSB7XHJcbiAgICAgIHZhciBzaGFwZUVsZW1lbnQgPSB0YXNrLnNoYXBlRWxlbWVudDtcclxuICAgICAgaWYoc2hhcGVFbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuICAgICAgICB2YXIgc2hhcGVTdGFydCA9IHNoYXBlRWxlbWVudC5zdGFydEFuZ2xlLShNYXRoLlBJLzIpO1xyXG4gICAgICAgIHZhciBzdGFydCA9IHNoYXBlU3RhcnQgKyAodGFza0FycmF5W2ldLnN0YXJ0ICogc2hhcGVFbGVtZW50LnJhZGlhbnMpO1xyXG4gICAgICAgIHZhciBlbmQgPSBzaGFwZVN0YXJ0ICsgKHRhc2tBcnJheVtpXS5lbmQgKiBzaGFwZUVsZW1lbnQucmFkaWFucyk7XHJcbiAgICAgICAgY3R4LmFyYyhzaGFwZUVsZW1lbnQuc3RhcnRQb2ludC54LCBzaGFwZUVsZW1lbnQuc3RhcnRQb2ludC55LCByYWRpdXMsIHN0YXJ0LCBlbmQsIGFudGljbG9ja3dpc2UpO1xyXG4gICAgICB9ZWxzZSBpZihzaGFwZUVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICB2YXIgc3RhcnRQb2ludCA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsc2hhcGVFbGVtZW50LnN0YXJ0ICsgc2hhcGVFbGVtZW50Lm1pbnV0ZXMgKiB0YXNrLnN0YXJ0LCByYWRpdXMpXHJcbiAgICAgICAgdmFyIGVuZFBvaW50ID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCxzaGFwZUVsZW1lbnQuc3RhcnQgKyBzaGFwZUVsZW1lbnQubWludXRlcyAqIHRhc2suZW5kLCByYWRpdXMpXHJcbiAgICAgICAgY3R4LmxpbmVUbyhzdGFydFBvaW50Lngsc3RhcnRQb2ludC55KVxyXG4gICAgICAgIGN0eC5saW5lVG8oZW5kUG9pbnQueCxlbmRQb2ludC55KVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgaGVscGVycy5jcmVhdGVTZWdtZW50ID0gZnVuY3Rpb24gKGNoYXJ0LCBvdXRlciwgaW5uZXIsIHN0YXJ0LCBlbmQpIHtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAgIGN0eC5iZWdpblBhdGgoKVxyXG4gICAgTmFwY2hhcnQuaGVscGVycy5jcmVhdGVDdXJ2ZShjaGFydCwgc3RhcnQsIGVuZCwgb3V0ZXIpXHJcbiAgICBOYXBjaGFydC5oZWxwZXJzLmNyZWF0ZUN1cnZlKGNoYXJ0LCBlbmQsIHN0YXJ0LCBpbm5lciwgdHJ1ZSlcclxuICAgIGN0eC5jbG9zZVBhdGgoKVxyXG4gIH1cclxuXHJcbn1cclxuIiwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBjaXJjbGU6IFtcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2FyYycsXHJcbiAgICAgIHZhbHVlOiBNYXRoLlBJKjJcclxuICAgIH0sXHJcbiAgXSxcclxuICBsaW5lOiBbXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgdmFsdWU6IDEwMFxyXG4gICAgfSxcclxuICBdLFxyXG4gIGhvcml6b250YWxFbGxpcHNlOiBbXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdhcmMnLFxyXG4gICAgICB2YWx1ZTogTWF0aC5QSSAvIDRcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgdmFsdWU6IDIwXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnYXJjJyxcclxuICAgICAgdmFsdWU6IE1hdGguUElcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgdmFsdWU6IDIwXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnYXJjJyxcclxuICAgICAgdmFsdWU6IE1hdGguUEkgKiAzIC8gNFxyXG4gICAgfVxyXG4gIF0sXHJcbiAgc21pbGU6IFtcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2FyYycsXHJcbiAgICAgIHZhbHVlOiBNYXRoLlBJXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgIHZhbHVlOiAxNTBcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdhcmMnLFxyXG4gICAgICB2YWx1ZTogTWF0aC5QSVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICB2YWx1ZTogMTUwXHJcbiAgICB9XHJcbiAgXSxcclxuICAvLyB2ZXJ0aWNhbEVsbGlwc2U6IFtcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2FyYycsXHJcbiAgLy8gICAgIHZhbHVlOiBNYXRoLlBJLzJcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdsaW5lJyxcclxuICAvLyAgICAgdmFsdWU6IDE1MFxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2FyYycsXHJcbiAgLy8gICAgIHZhbHVlOiBNYXRoLlBJXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnbGluZScsXHJcbiAgLy8gICAgIHZhbHVlOiAxNTBcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdhcmMnLFxyXG4gIC8vICAgICB2YWx1ZTogTWF0aC5QSS8yXHJcbiAgLy8gICB9XHJcbiAgLy8gXSxcclxuICAvLyBmdWNrZWQ6IFtcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2FyYycsXHJcbiAgLy8gICAgIHZhbHVlOiBNYXRoLlBJLzIqM1xyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2xpbmUnLFxyXG4gIC8vICAgICB2YWx1ZTogMTAwXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnYXJjJyxcclxuICAvLyAgICAgdmFsdWU6IE1hdGguUEkvMlxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2xpbmUnLFxyXG4gIC8vICAgICB2YWx1ZTogMTAwXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnYXJjJyxcclxuICAvLyAgICAgdmFsdWU6IE1hdGguUEkvMlxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2xpbmUnLFxyXG4gIC8vICAgICB2YWx1ZTogNTBcclxuICAvLyAgIH0sXHJcbiAgLy8gXVxyXG59IiwiXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgTmFwY2hhcnQuY29uZmlnLmRlZmF1bHRUeXBlcz0ge1xyXG4gICAgICBzbGVlcDoge1xyXG4gICAgICAgIHN0eWxlOiAncmVkJyxcclxuICAgICAgICBub1NjYWxlOiB0cnVlLFxyXG4gICAgICAgIGxhbmU6IDNcclxuICAgICAgfSxcclxuICAgICAgYnVzeToge1xyXG4gICAgICAgIHN0eWxlOiAnYmx1ZScsXHJcbiAgICAgICAgbm9TY2FsZTogdHJ1ZSxcclxuICAgICAgICBsYW5lOiAxLFxyXG4gICAgICB9LFxyXG4gICAgICBkZWZhdWx0OiB7XHJcbiAgICAgIFx0c3R5bGU6ICdibGFjaycsXHJcbiAgICAgIFx0bm9TY2FsZTogdHJ1ZSxcclxuICAgICAgXHRsYW5lOiAyXHJcbiAgICAgIH1cclxuICB9XHJcbn0iXX0=

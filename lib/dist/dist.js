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
          var defaultElement = {
            start:120,
            end:210,
            typeString:'default'
          }
          var newElement = initElement(defaultElement, this)
          this.data.elements.push(newElement)
          this.setSelected(newElement)
          fireHook('dataChange', this)

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
      lineWidth:2
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY2hhcnQvY29uZmlnLmpzIiwibGliL2NoYXJ0L2NvcmUuanMiLCJsaWIvY2hhcnQvZHJhdy9jYW52YXNIZWxwZXJzLmpzIiwibGliL2NoYXJ0L2RyYXcvY2xlYXIuanMiLCJsaWIvY2hhcnQvZHJhdy9jb250ZW50L2JhcnMuanMiLCJsaWIvY2hhcnQvZHJhdy9jb250ZW50L2hhbmRsZXMuanMiLCJsaWIvY2hhcnQvZHJhdy9kcmF3LmpzIiwibGliL2NoYXJ0L2RyYXcvZmFjZS9jaXJjbGVzLmpzIiwibGliL2NoYXJ0L2RyYXcvZmFjZS9saW5lcy5qcyIsImxpYi9jaGFydC9kcmF3L2ZhY2UvdGV4dC5qcyIsImxpYi9jaGFydC9kcmF3L3N0eWxlcy5qcyIsImxpYi9jaGFydC9mYW5jeW1vZHVsZS5qcyIsImxpYi9jaGFydC9oZWxwZXJzLmpzIiwibGliL2NoYXJ0L2luZGV4LmpzIiwibGliL2NoYXJ0L2ludGVyYWN0Q2FudmFzL2ludGVyYWN0Q2FudmFzLmpzIiwibGliL2NoYXJ0L3NoYXBlL2NhbGN1bGF0ZVNoYXBlLmpzIiwibGliL2NoYXJ0L3NoYXBlL3NoYXBlLmpzIiwibGliL2NoYXJ0L3NoYXBlL3NoYXBlSGVscGVycy5qcyIsImxpYi9jaGFydC9zaGFwZS9zaGFwZXMuanMiLCJsaWIvY2hhcnQvdHlwZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5bENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIE5hcGNoYXJ0LmNvbmZpZyA9IHtcclxuICAgIGludGVyYWN0aW9uOiB0cnVlLFxyXG4gICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgYmFzZVJhZGl1czozMixcclxuICAgIGZvbnQ6J2hlbHZldGljYScsXHJcbiAgICBsYXllcnM6WzE2LCAyMCwgMjgsIDM0LCAzOF0sXHJcbiAgICBsYW5lczpbXSwgLy8gd2lsbCBiZSBnZW5lcmF0ZWQgYmFzZWQgb24gdGhlIGxheWVycyBhcnJheVxyXG4gICAgZmFjZTogeyAvLyBkZWZpbmUgaG93IHRoZSBiYWNrZ3JvdW5kIGNsb2NrIHNob3VsZCBiZSBkcmF3blxyXG4gICAgICBzdHJva2U6IDAuMTUsXHJcbiAgICAgIHdlYWtTdHJva2VDb2xvcjogJyNkZGRkZGQnLFxyXG4gICAgICBzdHJva2VDb2xvcjogJyM3Nzc3NzcnLFxyXG4gICAgICBpbXBvcnRhbnRTdHJva2VDb2xvcjogJ2JsYWNrJyxcclxuICAgICAgaW1wb3J0YW50TGluZVdpZHRoOiAwLjMsXHJcbiAgICAgIG51bWJlcnM6IHtcclxuICAgICAgICByYWRpdXM6IDQwLFxyXG4gICAgICAgIGNvbG9yOiAnIzI2MjYyNicsXHJcbiAgICAgICAgc2l6ZTogMy4zXHJcbiAgICAgIH0sXHJcbiAgICAgIGZpdmVNaW51dGVTdHJva2VzTGVuZ3RoOiAwLFxyXG4gICAgICB0ZW5NaW51dGVTdHJva2VzTGVuZ3RoOiAwLjUsXHJcbiAgICAgIGhvdXJTdHJva2VzTGVuZ3RoOiAzLFxyXG4gICAgfSxcclxuXHRoYW5kbGVzQ2xpY2tEaXN0YW5jZTogNVxyXG4gIH1cclxufSIsIi8qXHJcbiogIENvcmUgbW9kdWxlIG9mIE5hcGNoYXJ0XHJcbipcclxuKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcbiAgdmFyIG1vZHVsZXMgPSBbXVxyXG4gIHZhciBob29rcyA9IHtcclxuICAgICdpbml0aWFsaXplJzpbXSxcclxuICAgICdkYXRhQ2hhbmdlJzpbXSxcclxuICAgICdzaGFwZUNoYW5nZSc6W10sXHJcbiAgICAnYmVuY2htYXJrJzpbXSxcclxuICAgICdzZXRTaGFwZSc6W10sXHJcbiAgICAnYW5pbWF0ZVNoYXBlJzpbXSxcclxuICAgICdpbnRlcmFjdGlvbic6W11cclxuICB9XHJcblxyXG4gIE5hcGNoYXJ0Lm9uID0gZnVuY3Rpb24oaG9vaywgZil7XHJcbiAgICBob29rc1tob29rXS5wdXNoKGYpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmlyZUhvb2soaG9vaykge1xyXG4gICAgdmFyIGFyZ3MgPSBbLi4uYXJndW1lbnRzXS5zbGljZSgxKVxyXG4gICAgLy8gY29uc29sZS5sb2coYXJncylcclxuICAgIGhvb2tzW2hvb2tdLmZvckVhY2goZnVuY3Rpb24oZil7XHJcbiAgICAgIGYoYXJnc1swXSwgYXJnc1sxXSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBOYXBjaGFydC5pbml0ID0gZnVuY3Rpb24gKGN0eCwgY29uZmlnKSB7XHJcbiAgICBcclxuICAgIHZhciBjaGFydCA9IChmdW5jdGlvbigpe1xyXG4gICAgICAvLyBwcml2YXRlXHJcbiAgICAgIC8vIHZhciBkYXRhID0ge307XHJcblxyXG4gICAgICAvLyBwdWJsaWNcclxuICAgICAgcmV0dXJuIHtcclxuICAgICAgICBzZXRFbGVtZW50U3RhdGU6IGZ1bmN0aW9uKGVsZW1lbnQsIHN0YXRlKSB7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUVsZW1lbnRTdGF0ZXMoKVxyXG4gICAgICAgICAgZWxlbWVudC5zdGF0ZSA9IHN0YXRlXHJcblxyXG4gICAgICAgICAgdGhpcy5yZWRyYXcoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVtb3ZlRWxlbWVudFN0YXRlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB0aGlzLmRhdGEuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBlbGVtZW50LnN0YXRlXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0U2VsZWN0ZWQ6IGZ1bmN0aW9uKGVsZW1lbnQpe1xyXG4gICAgICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkLnB1c2goZWxlbWVudClcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzU2VsZWN0ZWQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgICAgIGlmKHRoaXMuZGF0YS5zZWxlY3RlZC5pbmRleE9mKGVsZW1lbnQpID49IDApe1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXNlbGVjdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICB0aGlzLmRhdGEuc2VsZWN0ZWQgPSBbXVxyXG4gICAgICAgICAgdGhpcy5yZWRyYXcoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkRWxlbWVudDogZnVuY3Rpb24odHlwZVN0cmluZykge1xyXG4gICAgICAgICAgdmFyIGRlZmF1bHRFbGVtZW50ID0ge1xyXG4gICAgICAgICAgICBzdGFydDoxMjAsXHJcbiAgICAgICAgICAgIGVuZDoyMTAsXHJcbiAgICAgICAgICAgIHR5cGVTdHJpbmc6J2RlZmF1bHQnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB2YXIgbmV3RWxlbWVudCA9IGluaXRFbGVtZW50KGRlZmF1bHRFbGVtZW50LCB0aGlzKVxyXG4gICAgICAgICAgdGhpcy5kYXRhLmVsZW1lbnRzLnB1c2gobmV3RWxlbWVudClcclxuICAgICAgICAgIHRoaXMuc2V0U2VsZWN0ZWQobmV3RWxlbWVudClcclxuICAgICAgICAgIGZpcmVIb29rKCdkYXRhQ2hhbmdlJywgdGhpcylcclxuXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRFbGVtZW50OiBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRTaGFwZTogZnVuY3Rpb24oc2hhcGUpIHtcclxuICAgICAgICAgIGZpcmVIb29rKCdzZXRTaGFwZScsIHRoaXMsIHNoYXBlKVxyXG4gICAgICAgICAgZmlyZUhvb2soJ2RhdGFDaGFuZ2UnLCB0aGlzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYW5pbWF0ZVNoYXBlOiBmdW5jdGlvbihzaGFwZSkge1xyXG4gICAgICAgICAgLy8gZmlyZUhvb2soJ3NldFNoYXBlJywgdGhpcywgc2hhcGUpXHJcbiAgICAgICAgICAvLyBmaXJlSG9vaygnZGF0YUNoYW5nZScsIHRoaXMpXHJcblxyXG4gICAgICAgICAgZmlyZUhvb2soJ2FuaW1hdGVTaGFwZScsIHRoaXMsIHNoYXBlKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0RWxlbWVudHM6IGZ1bmN0aW9uKGVsZW1lbnRzKSB7XHJcbiAgICAgICAgICB2YXIgY2hhcnQgPSB0aGlzXHJcbiAgICAgICAgICBlbGVtZW50cyA9IGVsZW1lbnRzLm1hcChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbml0RWxlbWVudChlbGVtZW50LCBjaGFydClcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICB0aGlzLmRhdGEuZWxlbWVudHMgPSBlbGVtZW50cztcclxuICAgICAgICAgIGZpcmVIb29rKCdkYXRhQ2hhbmdlJywgdGhpcylcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZUVsZW1lbnRzOiBmdW5jdGlvbihlbGVtZW50cykge1xyXG4gICAgICAgICAgdGhpcy5kYXRhLmVsZW1lbnRzID0gZWxlbWVudHM7XHJcbiAgICAgICAgICBmaXJlSG9vaygnZGF0YUNoYW5nZScsIHRoaXMpXHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWRyYXc6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgZmlyZUhvb2soJ2RhdGFDaGFuZ2UnLCB0aGlzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGF0YUNoYW5nZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgLy8gZmlyZUhvb2soJ2RhdGFDaGFuZ2UnLCB0aGlzKVxyXG4gICAgICAgICAgZmlyZUhvb2soJ2ludGVyYWN0aW9uJywgdGhpcylcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldERhdGE6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmV0dXJuIHRoaXMuZGF0YVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYmVuY2htYXJrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGZpcmVIb29rKCdiZW5jaG1hcmsnLCB0aGlzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0Q29uZmlnOiBmdW5jdGlvbihjb25maWcpIHtcclxuICAgICAgICAgIC8vIE5hcGNoYXJ0LmNvbmZpZyA9IGNvbmZpZ1xyXG4gICAgICAgICAgY2hhcnQuY29uZmlnID0gY29uZmlnXHJcbiAgICAgICAgICBzY2FsZUNvbmZpZyhjaGFydC5jb25maWcsIGNoYXJ0LnJhdGlvKVxyXG4gICAgICAgICAgdGhpcy5yZWRyYXcoKVxyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgfVxyXG5cclxuICAgIH0oKSk7XHJcblxyXG4gICAgLy8gYWxzbyBwdWJsaWNcclxuICAgIGNoYXJ0LmN0eCA9IGN0eFxyXG4gICAgY2hhcnQuY2FudmFzID0gY3R4LmNhbnZhc1xyXG4gICAgY2hhcnQud2lkdGggPSBjaGFydC53ID0gY3R4LmNhbnZhcy53aWR0aFxyXG4gICAgY2hhcnQuaGVpZ2h0ID0gY2hhcnQuaCA9IGN0eC5jYW52YXMuaGVpZ2h0XHJcbiAgICBjaGFydC5yYXRpbyA9IGNoYXJ0LmggLyAxMDBcclxuICAgIGNoYXJ0LmNvbmZpZyA9IGluaXRDb25maWcoY29uZmlnKVxyXG4gICAgY2hhcnQuZGF0YSA9IHtcclxuICAgICAgZWxlbWVudHM6IFtdLFxyXG4gICAgICBzZWxlY3RlZDogW11cclxuICAgIH1cclxuICAgIGNoYXJ0LnR5cGVzID0ge31cclxuXHJcblxyXG4gICAgc2NhbGVDb25maWcoY2hhcnQuY29uZmlnLCBjaGFydC5yYXRpbylcclxuICAgIGFkZERlZmF1bHRUeXBlcyhjaGFydClcclxuICAgIHBvcHVsYXRlVHlwZXMoY2hhcnQpXHJcblxyXG4gICAgZmlyZUhvb2soJ2luaXRpYWxpemUnLCBjaGFydClcclxuXHJcbiAgICByZXR1cm4gY2hhcnRcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRDb25maWcgKGNvbmZpZykge1xyXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9XHJcbiAgICBjb25maWcgPSBoZWxwZXJzLmV4dGVuZChKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KE5hcGNoYXJ0LmNvbmZpZykpLCBjb25maWcpXHJcblxyXG4gICAgLy8gZ2VuZXJhdGUgbGFuZXNcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29uZmlnLmxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZihpID09IDApIGNvbnRpbnVlO1xyXG5cclxuICAgICAgY29uZmlnLmxhbmVzLnB1c2goe1xyXG4gICAgICAgIHN0YXJ0OmNvbmZpZy5sYXllcnNbaS0xXSxcclxuICAgICAgICBlbmQ6Y29uZmlnLmxheWVyc1tpXVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb25maWdcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRFbGVtZW50KGVsZW1lbnQsIGNoYXJ0KSB7XHJcblxyXG4gICAgLy8gKiogYXNzaWduIHR5cGUgYmFzZWQgb24gdHlwZVN0cmluZyB2YWx1ZVxyXG5cclxuICAgIGlmKHR5cGVvZiBlbGVtZW50LnR5cGVTdHJpbmcgPT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICBlbGVtZW50LnR5cGVTdHJpbmcgPSAnZGVmYXVsdCdcclxuICAgIH1cclxuICAgIHZhciB0eXBlID0gY2hhcnQudHlwZXNbZWxlbWVudC50eXBlU3RyaW5nXVxyXG5cclxuICAgIC8vIGNoZWNrIGlmIHR5cGUgZXhpc3RzXHJcbiAgICBpZih0eXBlb2YgdHlwZSA9PSAndW5kZWZpbmVkJyl7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVHlwZSAke2VsZW1lbnQudHlwZVN0cmluZ30gZG9lcyBub3QgZXhpc3RgKVxyXG4gICAgfVxyXG4gICAgZWxlbWVudC50eXBlID0gY2hhcnQudHlwZXNbZWxlbWVudC50eXBlU3RyaW5nXVxyXG5cclxuICAgIC8vICoqIGFkZCBpZFxyXG5cclxuICAgIGVsZW1lbnQuaWQgPSBoZWxwZXJzLnVpZCgpXHJcblxyXG4gICAgcmV0dXJuIGVsZW1lbnRcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNjYWxlQ29uZmlnIChjb25maWcsIHJhdGlvKSB7XHJcbiAgICBmdW5jdGlvbiBzY2FsZUZuIChiYXNlLCB2YWx1ZSwga2V5KSB7XHJcbiAgICAgIGlmKGJhc2Uubm9TY2FsZSl7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAodmFsdWUgPiAxIHx8IHZhbHVlIDwgMSB8fCB2YWx1ZSA9PT0gMSkge1xyXG4gICAgICAgIGJhc2Vba2V5XSA9IHZhbHVlICogcmF0aW9cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaGVscGVycy5kZWVwRWFjaChjb25maWcsIHNjYWxlRm4pXHJcbiAgICByZXR1cm4gY29uZmlnXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGREZWZhdWx0VHlwZXMoY2hhcnQpIHtcclxuICAgIGNoYXJ0LnR5cGVzID0gY2hhcnQuY29uZmlnLmRlZmF1bHRUeXBlc1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcG9wdWxhdGVUeXBlcyhjaGFydCkge1xyXG4gICAgZm9yKHZhciB0eXBlbmFtZSBpbiBjaGFydC50eXBlcyl7XHJcbiAgICAgIHZhciB0eXBlID0gY2hhcnQudHlwZXNbdHlwZW5hbWVdXHJcbiAgICAgIHR5cGUubGFuZSA9IGNoYXJ0LmNvbmZpZy5sYW5lc1t0eXBlLmxhbmVdXHJcbiAgICAgIHR5cGUuc3R5bGUgPSBOYXBjaGFydC5zdHlsZXNbdHlwZS5zdHlsZV1cclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVycztcclxuXHJcblxyXG4gIGhlbHBlcnMuc3Ryb2tlU2VnbWVudCA9IGZ1bmN0aW9uKGNoYXJ0LCBzdGFydCwgZW5kLCBjb25maWcpe1xyXG4gIFx0dmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gIFx0Y3R4LnNhdmUoKVxyXG4gIFx0Y3R4LnN0cm9rZVN0eWxlID0gY29uZmlnLmNvbG9yXHJcbiAgXHRjdHgubGluZVdpZHRoID0gY2hhcnQuY29uZmlnLmJhcnMuZ2VuZXJhbC5zdHJva2UubGluZVdpZHRoXHJcbiAgXHRjdHgubGluZUpvaW4gPSAnbWl0dGVsJ1xyXG5cclxuICBcdGhlbHBlcnMuY3JlYXRlU2VnbWVudChjaGFydCwgY29uZmlnLm91dGVyUmFkaXVzLCBjb25maWcuaW5uZXJSYWRpdXMsIHN0YXJ0LCBlbmQpO1xyXG5cclxuICBcdGN0eC5zdHJva2UoKTtcclxuICBcdGN0eC5yZXN0b3JlKClcclxuICB9XHJcblxyXG4gIGhlbHBlcnMuY2lyY2xlID0gZnVuY3Rpb24oY2hhcnQsIHBvaW50LCByYWRpdXMpe1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguYXJjKHBvaW50LngsIHBvaW50LnksIHJhZGl1cywgMCwgTWF0aC5QSSoyKVxyXG4gICAgY3R4LmNsb3NlUGF0aCgpXHJcbiAgfVxyXG5cclxuICBoZWxwZXJzLmNyZWF0ZUZvbnRTdHJpbmcgPSBmdW5jdGlvbihjaGFydCwgc2l6ZSkge1xyXG4gICAgcmV0dXJuIHNpemUgKyAncHggJyArIGNoYXJ0LmNvbmZpZy5mb250XHJcbiAgfVxyXG5cclxufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYXJ0LCBOYXBjaGFydCkge1xyXG4gIHZhciBjdHggPSBjaGFydC5jdHhcclxuICBjdHguY2xlYXJSZWN0KDAsMCxjaGFydC53LGNoYXJ0LmgpXHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFydCwgTmFwY2hhcnQpIHtcclxuICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgdmFyIGRhdGEgPSBjaGFydC5kYXRhXHJcbiAgdmFyIGNhbnZhcyA9IGN0eC5jYW52YXNcclxuICB2YXIgYmFyQ29uZmlnID0gY2hhcnQuY29uZmlnLmJhcnNcclxuICB2YXIgaGVscGVycyA9IE5hcGNoYXJ0LmhlbHBlcnNcclxuICBcclxuICAvLyBmaWxsXHJcblxyXG4gIGRhdGEuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgICB2YXIgdHlwZSA9IGVsZW1lbnQudHlwZVxyXG4gICAgdmFyIGxhbmUgPSB0eXBlLmxhbmVcclxuICAgIHZhciBzdHlsZSA9IHR5cGUuc3R5bGVcclxuICAgIGN0eC5zYXZlKClcclxuICAgIGN0eC5maWxsU3R5bGUgPSBzdHlsZS5jb2xvclxyXG5cclxuICAgIHN3aXRjaChlbGVtZW50LnN0YXRlKXtcclxuICAgICAgY2FzZSAnYWN0aXZlJzpcclxuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSBzdHlsZS5vcGFjaXRpZXMuYWN0aXZlT3BhY2l0eVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgJ2hvdmVyJzpcclxuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSBzdHlsZS5vcGFjaXRpZXMuaG92ZXJPcGFjaXR5XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAnc2VsZWN0ZWQnOlxyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDAuM1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gc3R5bGUub3BhY2l0aWVzLm9wYWNpdHlcclxuICAgIH1cclxuXHJcbiAgICBoZWxwZXJzLmNyZWF0ZVNlZ21lbnQoY2hhcnQsIGxhbmUuZW5kLCBsYW5lLnN0YXJ0LCBlbGVtZW50LnN0YXJ0LCBlbGVtZW50LmVuZCk7XHJcblxyXG4gICAgY3R4LmZpbGwoKVxyXG4gICAgY3R4LnJlc3RvcmUoKVxyXG4gIH0pXHJcblxyXG4gIFxyXG5cclxuICAvLyBzdHJva2VcclxuXHJcbiAgZGF0YS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAgIHZhciB0eXBlID0gZWxlbWVudC50eXBlXHJcbiAgICB2YXIgbGFuZSA9IHR5cGUubGFuZVxyXG4gICAgdmFyIHN0eWxlID0gdHlwZS5zdHlsZVxyXG5cclxuICAgIGN0eC5zYXZlKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IHN0eWxlLmNvbG9yXHJcbiAgICBjdHgubGluZVdpZHRoID0gc3R5bGUuc3Ryb2tlLmxpbmVXaWR0aFxyXG4gICAgY3R4LmxpbmVKb2luID0gJ21pdHRlbCdcclxuXHJcbiAgICBoZWxwZXJzLmNyZWF0ZVNlZ21lbnQoY2hhcnQsIGxhbmUuZW5kLCBsYW5lLnN0YXJ0LCBlbGVtZW50LnN0YXJ0LCBlbGVtZW50LmVuZCk7XHJcblxyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKVxyXG4gIH0pO1xyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYXJ0LCBOYXBjaGFydCkge1xyXG4gIHZhciBjdHggPSBjaGFydC5jdHhcclxuICB2YXIgZGF0YSA9IGNoYXJ0LmRhdGFcclxuICB2YXIgY2FudmFzID0gY3R4LmNhbnZhc1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG5cclxuICBkYXRhLnNlbGVjdGVkLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgdmFyIGxhbmUgPSBlbGVtZW50LnR5cGUubGFuZVxyXG4gICAgdmFyIHN0eWxlID0gZWxlbWVudC50eXBlLnN0eWxlXHJcblxyXG4gICAgY3R4LnNhdmUoKVxyXG5cclxuICAgIHZhciBoYW5kbGUxID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgZWxlbWVudC5zdGFydCwgbGFuZS5lbmQpXHJcbiAgICB2YXIgaGFuZGxlMiA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGVsZW1lbnQuZW5kLCBsYW5lLmVuZClcclxuICAgIFxyXG4gICAgY3R4LmZpbGxTdHlsZSA9IHN0eWxlLmNvbG9yXHJcblxyXG4gICAgaGVscGVycy5jaXJjbGUoY2hhcnQsIGhhbmRsZTEsIHN0eWxlLmhhbmRsZUJpZyk7XHJcbiAgICBjdHguZmlsbCgpXHJcbiAgICBoZWxwZXJzLmNpcmNsZShjaGFydCwgaGFuZGxlMiwgc3R5bGUuaGFuZGxlQmlnKTtcclxuICAgIGN0eC5maWxsKClcclxuXHJcblxyXG4gICAgY3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSdcclxuXHJcbiAgICBoZWxwZXJzLmNpcmNsZShjaGFydCwgaGFuZGxlMSwgc3R5bGUuaGFuZGxlU21hbGwpO1xyXG4gICAgY3R4LmZpbGwoKVxyXG4gICAgaGVscGVycy5jaXJjbGUoY2hhcnQsIGhhbmRsZTIsIHN0eWxlLmhhbmRsZVNtYWxsKTtcclxuICAgIGN0eC5maWxsKClcclxuXHJcblxyXG5cclxuICAgIGN0eC5yZXN0b3JlKClcclxuICB9KVxyXG59XHJcbiIsIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTmFwY2hhcnQpIHtcclxuXHJcbiAgLy8gaW1wb3J0IHN0eWxlc1xyXG4gIHJlcXVpcmUoJy4vc3R5bGVzJykoTmFwY2hhcnQpXHJcblxyXG4gIE5hcGNoYXJ0Lm9uKCdpbml0aWFsaXplJywgZnVuY3Rpb24oaW5zdGFuY2UpIHtcclxuICAgIGRyYXcoaW5zdGFuY2UpO1xyXG4gIH0pXHJcblxyXG4gIE5hcGNoYXJ0Lm9uKCdkYXRhQ2hhbmdlJywgZnVuY3Rpb24oaW5zdGFuY2UpIHtcclxuICAgIGRyYXcoaW5zdGFuY2UpXHJcbiAgfSlcclxuXHJcbiAgTmFwY2hhcnQub24oJ2JlbmNobWFyaycsIGZ1bmN0aW9uKGluc3RhbmNlKSB7XHJcbiAgICBiZW5jaG1hcmsoaW5zdGFuY2UpXHJcbiAgfSlcclxuXHJcbiAgdmFyIHRhc2tzID0ge1xyXG4gICAgLy8gY2xlYXJcclxuICAgIGNsZWFyOiByZXF1aXJlKCcuL2NsZWFyJyksXHJcblxyXG4gICAgLy8gZmFjZVxyXG4gICAgY2lyY2xlczogcmVxdWlyZSgnLi9mYWNlL2NpcmNsZXMnKSxcclxuICAgIGxpbmVzOiByZXF1aXJlKCcuL2ZhY2UvbGluZXMnKSxcclxuICAgIHRleHQ6IHJlcXVpcmUoJy4vZmFjZS90ZXh0JyksXHJcblxyXG4gICAgLy8gY29udGVudFxyXG4gICAgYmFyczogcmVxdWlyZSgnLi9jb250ZW50L2JhcnMnKSxcclxuICAgIGhhbmRsZXM6IHJlcXVpcmUoJy4vY29udGVudC9oYW5kbGVzJyksXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkcmF3KGNoYXJ0KSB7XHJcbiAgICBmb3IgKHRhc2sgaW4gdGFza3MpIHtcclxuICAgICAgdGFza3NbdGFza10oY2hhcnQsIE5hcGNoYXJ0KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gYmVuY2htYXJrKGNoYXJ0KSB7XHJcbiAgICB2YXIgaXRlcmF0aW9ucyA9IDEwMDBcclxuICAgIGZvciAodGFzayBpbiB0YXNrcykge1xyXG4gICAgICB2YXIgc3RhcnQgPSBEYXRlLm5vdygpXHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaXRlcmF0aW9uczsgaSsrKSB7XHJcbiAgICAgICAgdGFza3NbdGFza10oY2hhcnQsIE5hcGNoYXJ0KVxyXG4gICAgICB9XHJcbiAgICAgIHZhciBlbmQgPSBEYXRlLm5vdygpXHJcbiAgICAgIGNvbnNvbGUubG9nKGAke3Rhc2t9IHggJHtpdGVyYXRpb25zfSBgICsgKGVuZC1zdGFydCkgKyAnIG1zJylcclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2hhcnQsIE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGxheWVycyA9IGNoYXJ0LmNvbmZpZy5sYXllcnNcclxuICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgY3R4LmxpbmVXaWR0aCA9IGNoYXJ0LmNvbmZpZy5mYWNlLnN0cm9rZVxyXG5cclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjaGFydC5jb25maWcuZmFjZS5zdHJva2VDb2xvclxyXG4gIGZvciAodmFyIGkgPSBsYXllcnMubGVuZ3RoIC0gMjsgaSA+PSBsYXllcnMubGVuZ3RoIC0gMzsgaS0tKSB7XHJcbiAgXHRjdHguYmVnaW5QYXRoKClcclxuICAgIE5hcGNoYXJ0LmhlbHBlcnMuY3JlYXRlQ3VydmUoY2hhcnQsIDEsIDAsIGxheWVyc1tpXSlcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gIH1cclxuXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY2hhcnQuY29uZmlnLmZhY2Uud2Vha1N0cm9rZUNvbG9yXHJcbiAgZm9yICh2YXIgaSA9IGxheWVycy5sZW5ndGggLSA0OyBpID49IGxheWVycy5sZW5ndGggLSA0OyBpLS0pIHtcclxuICBcdGN0eC5iZWdpblBhdGgoKVxyXG4gICAgTmFwY2hhcnQuaGVscGVycy5jcmVhdGVDdXJ2ZShjaGFydCwgMSwgMCwgbGF5ZXJzW2ldKVxyXG4gICAgY3R4LnN0cm9rZSgpXHJcbiAgfVxyXG4gIFxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gIE5hcGNoYXJ0LmhlbHBlcnMuY3JlYXRlQ3VydmUoY2hhcnQsIDEsIDAsIDApXHJcbiAgY3R4LnN0cm9rZSgpXHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY2hhcnQsIE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gIHZhciBjdHggPSBjaGFydC5jdHhcclxuICB2YXIgY29uZmlnID0gY2hhcnQuY29uZmlnXHJcbiAgdmFyIGxhbmVzID0gY29uZmlnLmxhbmVzXHJcbiAgXHJcbiAgY3R4LmxpbmVXaWR0aCA9IGNvbmZpZy5mYWNlLnN0cm9rZVxyXG4gIGN0eC5zYXZlKClcclxuXHJcbiAgLy8gZXZlcnkgaG91ciBub3JtYWxcclxuXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY29uZmlnLmZhY2Uuc3Ryb2tlQ29sb3JcclxuICBjdHguYmVnaW5QYXRoKClcclxuXHJcbiAgZm9yKHZhciBpPTA7aTwyNDtpKyspe1xyXG4gIFx0dmFyIHMgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjYwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAyXS5zdGFydClcclxuICBcdHZhciBlID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSo2MCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMl0uZW5kICsgY29uZmlnLmZhY2UuaG91clN0cm9rZXNMZW5ndGgpXHJcbiAgICBjdHgubW92ZVRvKHMueCxzLnkpXHJcbiAgICBjdHgubGluZVRvKGUueCxlLnkpXHJcbiAgfVxyXG4gIGN0eC5zdHJva2UoKVxyXG5cclxuICAvLyBldmVyeSBob3VyIHdlYWtcclxuXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY29uZmlnLmZhY2Uud2Vha1N0cm9rZUNvbG9yXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcblxyXG4gIGZvcih2YXIgaT0wO2k8MjQ7aSsrKXtcclxuICAgIHZhciBzID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSo2MCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gM10uc3RhcnQpXHJcbiAgICB2YXIgZSA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqNjAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDNdLmVuZClcclxuICAgIGN0eC5tb3ZlVG8ocy54LHMueSlcclxuICAgIGN0eC5saW5lVG8oZS54LGUueSlcclxuICB9XHJcbiAgY3R4LnN0cm9rZSgpXHJcblxyXG5cclxuICAvLyBpbXBvcnRhbnQgaG91cnNcclxuXHJcbiAgY3R4LmxpbmVXaWR0aCA9IGNvbmZpZy5mYWNlLmltcG9ydGFudExpbmVXaWR0aFxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbmZpZy5mYWNlLmltcG9ydGFudFN0cm9rZUNvbG9yXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcblxyXG4gIGZvcih2YXIgaT0wO2k8MjQ7aSA9IGkrNCl7XHJcbiAgICB2YXIgcyA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqNjAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDJdLnN0YXJ0KVxyXG4gICAgdmFyIGUgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjYwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAyXS5lbmQgKyBjb25maWcuZmFjZS5ob3VyU3Ryb2tlc0xlbmd0aClcclxuICAgIGN0eC5tb3ZlVG8ocy54LHMueSlcclxuICAgIGN0eC5saW5lVG8oZS54LGUueSlcclxuICB9XHJcbiAgXHJcbiAgY3R4LnN0cm9rZSgpXHJcblxyXG4gIC8vIGV2ZXJ5IDEwIG1pbnV0ZXNcclxuXHJcbiAgLypcclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjb25maWcuZmFjZS5zdHJva2VDb2xvclxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG5cclxuXHJcbiAgZm9yKHZhciBpPTA7aTwxNDQwLzEwO2krKyl7XHJcbiAgICB2YXIgcyA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqMTAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDJdLmVuZClcclxuICAgIHZhciBlID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSoxMCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMl0uZW5kICsgY29uZmlnLmZhY2UudGVuTWludXRlU3Ryb2tlc0xlbmd0aClcclxuICAgIGN0eC5tb3ZlVG8ocy54LHMueSlcclxuICAgIGN0eC5saW5lVG8oZS54LGUueSlcclxuICB9XHJcbiAgY3R4LnN0cm9rZSgpXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgKi9cclxuXHJcblxyXG4gIC8vIGV2ZXJ5IDUgbWludXRlc1xyXG5cclxuICAvKlxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbmZpZy5mYWNlLnN0cm9rZUNvbG9yXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcblxyXG4gIGZvcih2YXIgaT0wLjU7aTwxNDQwLzEwO2krKyl7XHJcbiAgICB2YXIgcyA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqMTAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDJdLmVuZClcclxuICAgIHZhciBlID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSoxMCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMl0uZW5kICsgY29uZmlnLmZhY2UuZml2ZU1pbnV0ZVN0cm9rZXNMZW5ndGgpXHJcbiAgICBjdHgubW92ZVRvKHMueCxzLnkpXHJcbiAgICBjdHgubGluZVRvKGUueCxlLnkpXHJcbiAgfVxyXG5cclxuICBjdHguc3Ryb2tlKClcclxuICAqL1xyXG5cclxuXHJcbiAgXHJcbiAgXHJcbiAgY3R4LnJlc3RvcmUoKVxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYXJ0LCBOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG5cclxuICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgdmFyIGNvbmZpZyA9IGNoYXJ0LmNvbmZpZ1xyXG5cclxuICBjdHguc2F2ZSgpXHJcbiAgY3R4LmZvbnQgPSBoZWxwZXJzLmNyZWF0ZUZvbnRTdHJpbmcoY2hhcnQsIGNvbmZpZy5mYWNlLm51bWJlcnMuc2l6ZSlcclxuICBjdHguZmlsbFN0eWxlID0gY29uZmlnLmZhY2UubnVtYmVycy5jb2xvclxyXG4gIGN0eC50ZXh0QWxpZ24gPSAnY2VudGVyJ1xyXG4gIGN0eC50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJ1xyXG5cclxuICBmb3IodmFyIGk9MDtpPDI0O2kgPSBpKzQpe1xyXG4gIFx0dmFyIHAgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjYwLCBjb25maWcuZmFjZS5udW1iZXJzLnJhZGl1cylcclxuICAgIGN0eC5maWxsVGV4dChpLCBwLngsIHAueSlcclxuICB9XHJcblxyXG4gIGN0eC5yZXN0b3JlKClcclxufVxyXG4iLCJcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcbiAgdmFyIHN0eWxlcyA9IE5hcGNoYXJ0LnN0eWxlcyA9IHtcclxuICAgIFxyXG4gIH1cclxuXHJcbiAgc3R5bGVzLmRlZmF1bHQgPSB7XHJcbiAgICBjb2xvcjogJ2JsYWNrJyxcclxuICAgIG9wYWNpdGllczoge1xyXG4gICAgICBub1NjYWxlOnRydWUsXHJcbiAgICAgIG9wYWNpdHk6IDAuNixcclxuICAgICAgaG92ZXJPcGFjaXR5OiAwLjUsXHJcbiAgICAgIGFjdGl2ZU9wYWNpdHk6IDAuNSxcclxuICAgIH0sXHJcbiAgICBzdHJva2U6IHtcclxuICAgICAgbGluZVdpZHRoOjJcclxuICAgIH0sXHJcblx0aGFuZGxlQmlnOjcsXHJcblx0aGFuZGxlU21hbGw6M1xyXG4gIH1cclxuXHJcbiAgc3R5bGVzLnJlZCA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBzdHlsZXMuZGVmYXVsdCwge1xyXG4gICAgY29sb3I6ICcjYzcwZTBlJyxcclxuICAgIHNlbGVjdGVkOiB7XHJcbiAgICAgIHN0cm9rZUNvbG9yOiAnI0ZGNjM2MycsXHJcbiAgICB9XHJcbiAgfSkgXHJcblxyXG4gIHN0eWxlcy5ibGFjayA9IGhlbHBlcnMuZXh0ZW5kKHt9LCBzdHlsZXMuZGVmYXVsdCwge1xyXG4gICAgY29sb3I6ICcjMWYxZjFmJyxcclxuICAgIHNlbGVjdGVkOiB7XHJcbiAgICAgIHN0cm9rZUNvbG9yOiAnI0ZGNjM2MycsXHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbiAgc3R5bGVzLmJsdWUgPSBoZWxwZXJzLmV4dGVuZCh7fSwgc3R5bGVzLmRlZmF1bHQsIHtcclxuICAgIGNvbG9yOiAnYmx1ZSdcclxuICB9KVxyXG4gIFxyXG59IiwiLypcclxuKiAgRmFuY3kgbW9kdWxlIHRoYXQgZG9lcyBzaGl0XHJcbiovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBjaGFydDtcclxuXHJcbiAgTmFwY2hhcnQub24oJ2luaXRpYWxpemUnLCBmdW5jdGlvbihpbnN0YW5jZSkge1xyXG4gICAgY2hhcnQgPSBpbnN0YW5jZVxyXG4gICAgLy8gY2hhcnQuc2V0RGF0YSgpXHJcbiAgfSlcclxufVxyXG4iLCIvKiBnbG9iYWwgd2luZG93OiBmYWxzZSAqL1xuLyogZ2xvYmFsIGRvY3VtZW50OiBmYWxzZSAqL1xuJ3VzZSBzdHJpY3QnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKENoYXJ0KSB7XG4gIC8vIEdsb2JhbCBDaGFydCBoZWxwZXJzIG9iamVjdCBmb3IgdXRpbGl0eSBtZXRob2RzIGFuZCBjbGFzc2VzXG4gIHZhciBoZWxwZXJzID0gQ2hhcnQuaGVscGVycyA9IHt9XG4gIGhlbHBlcnMucmFuZ2UgPSBmdW5jdGlvbiAoc3RhcnQsIGVuZCkge1xuICAgIGlmIChlbmQgPCBzdGFydCkge1xuICAgICAgcmV0dXJuIDE0NDAgLSBzdGFydCArIGVuZFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZW5kIC0gc3RhcnRcbiAgICB9XG4gIH1cblxuICBoZWxwZXJzLmdldFBvc2l0aW9uQmV0d2VlblR3b1ZhbHVlcyA9IGZ1bmN0aW9uKHBvcywgc3RhcnQsIGVuZCl7XG4gICAgICByZXR1cm4gaGVscGVycy5yYW5nZShzdGFydCxwb3MpIC8gaGVscGVycy5yYW5nZShzdGFydCwgZW5kKVxuICB9XG5cbiAgaGVscGVycy5saW1pdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmKHZhbHVlID09IDE0NDApIHJldHVybiAxNDQwXG4gICAgcmV0dXJuIHZhbHVlIC0gMTQ0MCAqIE1hdGguZmxvb3IodmFsdWUvMTQ0MClcbiAgfVxuICB3aW5kb3cuaGVscGVycyA9IGhlbHBlcnNcbiAgaGVscGVycy5zaG9ydGVzdFdheSA9IGZ1bmN0aW9uKGEpIHtcbiAgICAvLyBhbHRlcm5hdGl2ZT8/Y29uc29sZS5sb2coYSAtIDE0NDAgKiBNYXRoLmZsb29yKGEvNzIwKSlcblxuICAgIC8vIDE0NDAvMiA9IDcyMFxuICAgIGlmKGEgPiA3MjApe1xuICAgICAgcmV0dXJuIGEgLSAxNDQwXG4gICAgfSBlbHNlIGlmKGEgPCAtNzIwKXtcbiAgICAgIHJldHVybiBhICsgMTQ0MFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYVxuICAgIH1cblxuICB9XG5cbiAgaGVscGVycy5nZXRQcm9ncmVzc0JldHdlZW5Ud29WYWx1ZXMgPSBmdW5jdGlvbiAocG9zLCBzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIGhlbHBlcnMucmFuZ2Uoc3RhcnQsIHBvcykgLyBoZWxwZXJzLnJhbmdlKHN0YXJ0LCBlbmQpXG4gIH1cbiAgaGVscGVycy5pc0luc2lkZSA9IGZ1bmN0aW9uIChwb2ludCwgc3RhcnQsIGVuZCkge1xuICAgIGlmIChlbmQgPiBzdGFydCkge1xuICAgICAgaWYgKHBvaW50IDwgZW5kICYmIHBvaW50ID4gc3RhcnQpIHsgcmV0dXJuIHRydWUgfVxuICAgIH0gZWxzZSBpZiAoc3RhcnQgPiBlbmQpIHtcbiAgICAgIGlmIChwb2ludCA+IHN0YXJ0IHx8IHBvaW50IDwgZW5kKSB7IHJldHVybiB0cnVlIH1cbiAgICB9XG4gICAgaWYgKHBvaW50ID09IHN0YXJ0IHx8IHBvaW50ID09IGVuZCkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICBoZWxwZXJzLmlzSW5zaWRlQW5nbGUgPSBmdW5jdGlvbiAocG9pbnQsIHN0YXJ0LCBlbmQpIHtcbiAgICAvLyBzYW1lIGFzIGFuZ2xlIGJ1dCBpdCBsaW1pdHMgdmFsdWVzIHRvIGJldHdlZW4gMCBhbmQgMipNYXRoLlBJXG4gICAgcmV0dXJuIGhlbHBlcnMuaXNJbnNpZGUobGltaXQocG9pbnQpLCBsaW1pdChzdGFydCksIGxpbWl0KGVuZCkpXG5cbiAgICBmdW5jdGlvbiBsaW1pdChhbmdsZSkge1xuICAgICAgYW5nbGUgJT0gTWF0aC5QSSoyXG4gICAgICBpZihhbmdsZSA8IDApe1xuICAgICAgICBhbmdsZSArPSBNYXRoLlBJKjJcbiAgICAgIH1cbiAgICAgIHJldHVybiBhbmdsZVxuICAgIH1cbiAgfVxuICBcblxuICBoZWxwZXJzLmRpc3RhbmNlID0gZnVuY3Rpb24gKHgseSxhKXtcbiAgICB2YXIgeSA9IGEueS15O1xuICAgIHZhciB4ID0gYS54LXg7XG4gICAgcmV0dXJuIE1hdGguc3FydCh5KnkreCp4KTtcbiAgfVxuXG4gIGhlbHBlcnMuYW5nbGVCZXR3ZWVuVHdvUG9pbnRzID0gZnVuY3Rpb24gKHgseSxhKXtcbiAgICB2YXIgZGlzdGFuY2UgPSBoZWxwZXJzLmRpc3RhbmNlKHgseSxhKVxuICAgIHZhciB5ID0gKGEueS15KSAvIGRpc3RhbmNlO1xuICAgIHZhciB4ID0gKGEueC14KSAvIGRpc3RhbmNlO1xuXG4gICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuKHkgL3gpXG4gICAgaWYoeCA+IDApe1xuICAgICAgYW5nbGUgKz0gTWF0aC5QSVxuICAgIH1cbiAgICBhbmdsZSArPSBNYXRoLlBJLzJcbiAgICByZXR1cm4gYW5nbGVcbiAgfVxuICAvLyBoZWxwZXJzLlhZdG9NaW51dGVzID0gZnVuY3Rpb24gKHgseSkge1xuICAvLyAgIG1pbnV0ZXMgPSAoTWF0aC5hdGFuKHkgL3gpIC8gKE1hdGguUEkgKiAyKSkgKiAxNDQwICsgMzYwO1xuICAvLyAgIGlmICh4IDwgMCkge1xuICAvLyAgICAgICBtaW51dGVzICs9IDcyMDtcbiAgLy8gICB9XG4gIC8vICAgbWludXRlcyA9IE1hdGgucm91bmQobWludXRlcyk7XG5cbiAgLy8gICByZXR1cm4gbWludXRlcztcbiAgLy8gfTtcblxuICBoZWxwZXJzLmRpc3RhbmNlRnJvbVBvaW50VG9MaW5lID0gZnVuY3Rpb24gKHgseSxhLGIpe1xuXG4gIHZhciB4MSA9IGEueFxuICB2YXIgeTEgPSBhLnlcbiAgdmFyIHgyID0gYi54XG4gIHZhciB5MiA9IGIueVxuXG4gIHZhciBBID0geCAtIHgxO1xuICB2YXIgQiA9IHkgLSB5MTtcbiAgdmFyIEMgPSB4MiAtIHgxO1xuICB2YXIgRCA9IHkyIC0geTE7XG5cbiAgdmFyIGRvdCA9IEEgKiBDICsgQiAqIEQ7XG4gIHZhciBsZW5fc3EgPSBDICogQyArIEQgKiBEO1xuICB2YXIgcGFyYW0gPSAtMTtcbiAgaWYgKGxlbl9zcSAhPSAwKSAvL2luIGNhc2Ugb2YgMCBsZW5ndGggbGluZVxuICAgICAgcGFyYW0gPSBkb3QgLyBsZW5fc3E7XG5cbiAgdmFyIHh4LCB5eTtcblxuICBpZiAocGFyYW0gPCAwKSB7XG4gICAgeHggPSB4MTtcbiAgICB5eSA9IHkxO1xuICB9XG4gIGVsc2UgaWYgKHBhcmFtID4gMSkge1xuICAgIHh4ID0geDI7XG4gICAgeXkgPSB5MjtcbiAgfVxuICBlbHNlIHtcbiAgICB4eCA9IHgxICsgcGFyYW0gKiBDO1xuICAgIHl5ID0geTEgKyBwYXJhbSAqIEQ7XG4gIH1cblxuICB2YXIgZHggPSB4IC0geHg7XG4gIHZhciBkeSA9IHkgLSB5eTtcbiAgcmV0dXJuIE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG59XG5cbiAgaGVscGVycy5lYWNoRWxlbWVudCA9IGZ1bmN0aW9uIChjaGFydCwgY2FsbGJhY2spIHtcbiAgICB2YXIgZGF0YSA9IGNoYXJ0LmRhdGFcbiAgICB2YXIgY29uZmlnXG5cbiAgICBmb3IgKHZhciBuYW1lIGluIGRhdGEpIHtcbiAgICAgIGNvbmZpZyA9IGNoYXJ0LmNvbmZpZy5iYXJzW25hbWVdXG4gICAgICBcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YVtuYW1lXS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjYWxsYmFjayhkYXRhW25hbWVdW2ldLCBjb25maWcpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGVscGVycy5lYWNoRWxlbWVudFlvID0gZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgZm9yICh2YXIgbmFtZSBpbiBkYXRhKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFbbmFtZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2FsbGJhY2sobmFtZSwgaSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoZWxwZXJzLmVhY2ggPSBmdW5jdGlvbiAobG9vcGFibGUsIGNhbGxiYWNrLCBzZWxmLCByZXZlcnNlKSB7XG4gICAgLy8gQ2hlY2sgdG8gc2VlIGlmIG51bGwgb3IgdW5kZWZpbmVkIGZpcnN0bHkuXG4gICAgdmFyIGksIGxlblxuICAgIGlmIChoZWxwZXJzLmlzQXJyYXkobG9vcGFibGUpKSB7XG4gICAgICBsZW4gPSBsb29wYWJsZS5sZW5ndGhcbiAgICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICAgIGZvciAoaSA9IGxlbiAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmLCBsb29wYWJsZVtpXSwgaSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmLCBsb29wYWJsZVtpXSwgaSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGxvb3BhYmxlID09PSAnb2JqZWN0Jykge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhsb29wYWJsZSlcbiAgICAgIGxlbiA9IGtleXMubGVuZ3RoXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbChzZWxmLCBsb29wYWJsZVtrZXlzW2ldXSwga2V5c1tpXSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBoZWxwZXJzLmRlZXBFYWNoID0gZnVuY3Rpb24gKGxvb3BhYmxlLCBjYWxsYmFjaykge1xuICAgIC8vIENoZWNrIHRvIHNlZSBpZiBudWxsIG9yIHVuZGVmaW5lZCBmaXJzdGx5LlxuICAgIHZhciBpLCBsZW5cbiAgICBmdW5jdGlvbiBzZWFyY2ggKGxvb3BhYmxlLCBjYikge1xuICAgICAgaWYgKGhlbHBlcnMuaXNBcnJheShsb29wYWJsZSkpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsb29wYWJsZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNiKGxvb3BhYmxlLCBsb29wYWJsZVtpXSwgaSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbG9vcGFibGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobG9vcGFibGUpXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNiKGxvb3BhYmxlLCBsb29wYWJsZVtrZXlzW2ldXSwga2V5c1tpXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvdW5kIChiYXNlLCB2YWx1ZSwga2V5KSB7XG4gICAgICBpZiAoaGVscGVycy5pc0FycmF5KHZhbHVlKSB8fCB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHNlYXJjaCh2YWx1ZSwgZm91bmQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayhiYXNlLCB2YWx1ZSwga2V5KVxuICAgICAgfVxuICAgIH1cblxuICAgIHNlYXJjaChsb29wYWJsZSwgZm91bmQpXG4gIH1cbiAgaGVscGVycy5jbG9uZSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICByZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKVxuICB9XG4gIGhlbHBlcnMuZXh0ZW5kID0gZnVuY3Rpb24gKGJhc2UpIHtcbiAgICB2YXIgc2V0Rm4gPSBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgYmFzZVtrZXldID0gdmFsdWVcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDEsIGlsZW4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgaWxlbjsgaSsrKSB7XG4gICAgICBoZWxwZXJzLmVhY2goYXJndW1lbnRzW2ldLCBzZXRGbilcbiAgICB9XG4gICAgcmV0dXJuIGJhc2VcbiAgfVxuICAvLyBOZWVkIGEgc3BlY2lhbCBtZXJnZSBmdW5jdGlvbiB0byBjaGFydCBjb25maWdzIHNpbmNlIHRoZXkgYXJlIG5vdyBncm91cGVkXG4gIGhlbHBlcnMuY29uZmlnTWVyZ2UgPSBmdW5jdGlvbiAoX2Jhc2UpIHtcbiAgICB2YXIgYmFzZSA9IGhlbHBlcnMuY2xvbmUoX2Jhc2UpXG4gICAgaGVscGVycy5lYWNoKEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksIGZ1bmN0aW9uIChleHRlbnNpb24pIHtcbiAgICAgIGhlbHBlcnMuZWFjaChleHRlbnNpb24sIGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgIHZhciBiYXNlSGFzUHJvcGVydHkgPSBiYXNlLmhhc093blByb3BlcnR5KGtleSlcbiAgICAgICAgdmFyIGJhc2VWYWwgPSBiYXNlSGFzUHJvcGVydHkgPyBiYXNlW2tleV0gOiB7fVxuXG4gICAgICAgIGlmIChrZXkgPT09ICdzY2FsZXMnKSB7XG4gICAgICAgICAgLy8gU2NhbGUgY29uZmlnIG1lcmdpbmcgaXMgY29tcGxleC4gQWRkIG91ciBvd24gZnVuY3Rpb24gaGVyZSBmb3IgdGhhdFxuICAgICAgICAgIGJhc2Vba2V5XSA9IGhlbHBlcnMuc2NhbGVNZXJnZShiYXNlVmFsLCB2YWx1ZSlcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdzY2FsZScpIHtcbiAgICAgICAgICAvLyBVc2VkIGluIHBvbGFyIGFyZWEgJiByYWRhciBjaGFydHMgc2luY2UgdGhlcmUgaXMgb25seSBvbmUgc2NhbGVcbiAgICAgICAgICBiYXNlW2tleV0gPSBoZWxwZXJzLmNvbmZpZ01lcmdlKGJhc2VWYWwsIENoYXJ0LnNjYWxlU2VydmljZS5nZXRTY2FsZURlZmF1bHRzKHZhbHVlLnR5cGUpLCB2YWx1ZSlcbiAgICAgICAgfSBlbHNlIGlmIChiYXNlSGFzUHJvcGVydHkgJiZcbiAgICAgICAgICB0eXBlb2YgYmFzZVZhbCA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAhaGVscGVycy5pc0FycmF5KGJhc2VWYWwpICYmXG4gICAgICAgICAgYmFzZVZhbCAhPT0gbnVsbCAmJlxuICAgICAgICAgIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiZcbiAgICAgICAgICAhaGVscGVycy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgIC8vIElmIHdlIGFyZSBvdmVyd3JpdGluZyBhbiBvYmplY3Qgd2l0aCBhbiBvYmplY3QsIGRvIGEgbWVyZ2Ugb2YgdGhlIHByb3BlcnRpZXMuXG4gICAgICAgICAgYmFzZVtrZXldID0gaGVscGVycy5jb25maWdNZXJnZShiYXNlVmFsLCB2YWx1ZSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBjYW4ganVzdCBvdmVyd3JpdGUgdGhlIHZhbHVlIGluIHRoaXMgY2FzZVxuICAgICAgICAgIGJhc2Vba2V5XSA9IHZhbHVlXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcblxuICAgIHJldHVybiBiYXNlXG4gIH1cbiAgaGVscGVycy5zY2FsZU1lcmdlID0gZnVuY3Rpb24gKF9iYXNlLCBleHRlbnNpb24pIHtcbiAgICB2YXIgYmFzZSA9IGhlbHBlcnMuY2xvbmUoX2Jhc2UpXG5cbiAgICBoZWxwZXJzLmVhY2goZXh0ZW5zaW9uLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgaWYgKGtleSA9PT0gJ3hBeGVzJyB8fCBrZXkgPT09ICd5QXhlcycpIHtcbiAgICAgICAgLy8gVGhlc2UgcHJvcGVydGllcyBhcmUgYXJyYXlzIG9mIGl0ZW1zXG4gICAgICAgIGlmIChiYXNlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICBoZWxwZXJzLmVhY2godmFsdWUsIGZ1bmN0aW9uICh2YWx1ZU9iaiwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBheGlzVHlwZSA9IGhlbHBlcnMuZ2V0VmFsdWVPckRlZmF1bHQodmFsdWVPYmoudHlwZSwga2V5ID09PSAneEF4ZXMnID8gJ2NhdGVnb3J5JyA6ICdsaW5lYXInKVxuICAgICAgICAgICAgdmFyIGF4aXNEZWZhdWx0cyA9IENoYXJ0LnNjYWxlU2VydmljZS5nZXRTY2FsZURlZmF1bHRzKGF4aXNUeXBlKVxuICAgICAgICAgICAgaWYgKGluZGV4ID49IGJhc2Vba2V5XS5sZW5ndGggfHwgIWJhc2Vba2V5XVtpbmRleF0udHlwZSkge1xuICAgICAgICAgICAgICBiYXNlW2tleV0ucHVzaChoZWxwZXJzLmNvbmZpZ01lcmdlKGF4aXNEZWZhdWx0cywgdmFsdWVPYmopKVxuICAgICAgICAgICAgfSBlbHNlIGlmICh2YWx1ZU9iai50eXBlICYmIHZhbHVlT2JqLnR5cGUgIT09IGJhc2Vba2V5XVtpbmRleF0udHlwZSkge1xuICAgICAgICAgICAgICAvLyBUeXBlIGNoYW5nZWQuIEJyaW5nIGluIHRoZSBuZXcgZGVmYXVsdHMgYmVmb3JlIHdlIGJyaW5nIGluIHZhbHVlT2JqIHNvIHRoYXQgdmFsdWVPYmogY2FuIG92ZXJyaWRlIHRoZSBjb3JyZWN0IHNjYWxlIGRlZmF1bHRzXG4gICAgICAgICAgICAgIGJhc2Vba2V5XVtpbmRleF0gPSBoZWxwZXJzLmNvbmZpZ01lcmdlKGJhc2Vba2V5XVtpbmRleF0sIGF4aXNEZWZhdWx0cywgdmFsdWVPYmopXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBUeXBlIGlzIHRoZSBzYW1lXG4gICAgICAgICAgICAgIGJhc2Vba2V5XVtpbmRleF0gPSBoZWxwZXJzLmNvbmZpZ01lcmdlKGJhc2Vba2V5XVtpbmRleF0sIHZhbHVlT2JqKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmFzZVtrZXldID0gW11cbiAgICAgICAgICBoZWxwZXJzLmVhY2godmFsdWUsIGZ1bmN0aW9uICh2YWx1ZU9iaikge1xuICAgICAgICAgICAgdmFyIGF4aXNUeXBlID0gaGVscGVycy5nZXRWYWx1ZU9yRGVmYXVsdCh2YWx1ZU9iai50eXBlLCBrZXkgPT09ICd4QXhlcycgPyAnY2F0ZWdvcnknIDogJ2xpbmVhcicpXG4gICAgICAgICAgICBiYXNlW2tleV0ucHVzaChoZWxwZXJzLmNvbmZpZ01lcmdlKENoYXJ0LnNjYWxlU2VydmljZS5nZXRTY2FsZURlZmF1bHRzKGF4aXNUeXBlKSwgdmFsdWVPYmopKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYmFzZS5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIHR5cGVvZiBiYXNlW2tleV0gPT09ICdvYmplY3QnICYmIGJhc2Vba2V5XSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIElmIHdlIGFyZSBvdmVyd3JpdGluZyBhbiBvYmplY3Qgd2l0aCBhbiBvYmplY3QsIGRvIGEgbWVyZ2Ugb2YgdGhlIHByb3BlcnRpZXMuXG4gICAgICAgIGJhc2Vba2V5XSA9IGhlbHBlcnMuY29uZmlnTWVyZ2UoYmFzZVtrZXldLCB2YWx1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNhbiBqdXN0IG92ZXJ3cml0ZSB0aGUgdmFsdWUgaW4gdGhpcyBjYXNlXG4gICAgICAgIGJhc2Vba2V5XSA9IHZhbHVlXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBiYXNlXG4gIH1cbiAgaGVscGVycy5nZXRWYWx1ZUF0SW5kZXhPckRlZmF1bHQgPSBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBkZWZhdWx0VmFsdWUpIHtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICAgIH1cblxuICAgIGlmIChoZWxwZXJzLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICByZXR1cm4gaW5kZXggPCB2YWx1ZS5sZW5ndGggPyB2YWx1ZVtpbmRleF0gOiBkZWZhdWx0VmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuICBoZWxwZXJzLmdldFZhbHVlT3JEZWZhdWx0ID0gZnVuY3Rpb24gKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCA/IGRlZmF1bHRWYWx1ZSA6IHZhbHVlXG4gIH1cbiAgaGVscGVycy5pbmRleE9mID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2ZcbiAgICA/IGZ1bmN0aW9uIChhcnJheSwgaXRlbSkge1xuICAgICAgcmV0dXJuIGFycmF5LmluZGV4T2YoaXRlbSlcbiAgICB9XG4gICAgOiBmdW5jdGlvbiAoYXJyYXksIGl0ZW0pIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBpbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgaWxlbjsgKytpKSB7XG4gICAgICAgIGlmIChhcnJheVtpXSA9PT0gaXRlbSkge1xuICAgICAgICAgIHJldHVybiBpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgaGVscGVycy53aGVyZSA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBmaWx0ZXJDYWxsYmFjaykge1xuICAgIGlmIChoZWxwZXJzLmlzQXJyYXkoY29sbGVjdGlvbikgJiYgQXJyYXkucHJvdG90eXBlLmZpbHRlcikge1xuICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uZmlsdGVyKGZpbHRlckNhbGxiYWNrKVxuICAgIH1cbiAgICB2YXIgZmlsdGVyZWQgPSBbXVxuXG4gICAgaGVscGVycy5lYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICBpZiAoZmlsdGVyQ2FsbGJhY2soaXRlbSkpIHtcbiAgICAgICAgZmlsdGVyZWQucHVzaChpdGVtKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gZmlsdGVyZWRcbiAgfVxuICBoZWxwZXJzLmZpbmRJbmRleCA9IEFycmF5LnByb3RvdHlwZS5maW5kSW5kZXhcbiAgICA/IGZ1bmN0aW9uIChhcnJheSwgY2FsbGJhY2ssIHNjb3BlKSB7XG4gICAgICByZXR1cm4gYXJyYXkuZmluZEluZGV4KGNhbGxiYWNrLCBzY29wZSlcbiAgICB9XG4gICAgOiBmdW5jdGlvbiAoYXJyYXksIGNhbGxiYWNrLCBzY29wZSkge1xuICAgICAgc2NvcGUgPSBzY29wZSA9PT0gdW5kZWZpbmVkID8gYXJyYXkgOiBzY29wZVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGlsZW4gPSBhcnJheS5sZW5ndGg7IGkgPCBpbGVuOyArK2kpIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrLmNhbGwoc2NvcGUsIGFycmF5W2ldLCBpLCBhcnJheSkpIHtcbiAgICAgICAgICByZXR1cm4gaVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gIGhlbHBlcnMuZmluZE5leHRXaGVyZSA9IGZ1bmN0aW9uIChhcnJheVRvU2VhcmNoLCBmaWx0ZXJDYWxsYmFjaywgc3RhcnRJbmRleCkge1xuICAgIC8vIERlZmF1bHQgdG8gc3RhcnQgb2YgdGhlIGFycmF5XG4gICAgaWYgKHN0YXJ0SW5kZXggPT09IHVuZGVmaW5lZCB8fCBzdGFydEluZGV4ID09PSBudWxsKSB7XG4gICAgICBzdGFydEluZGV4ID0gLTFcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXggKyAxOyBpIDwgYXJyYXlUb1NlYXJjaC5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGN1cnJlbnRJdGVtID0gYXJyYXlUb1NlYXJjaFtpXVxuICAgICAgaWYgKGZpbHRlckNhbGxiYWNrKGN1cnJlbnRJdGVtKSkge1xuICAgICAgICByZXR1cm4gY3VycmVudEl0ZW1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaGVscGVycy5maW5kUHJldmlvdXNXaGVyZSA9IGZ1bmN0aW9uIChhcnJheVRvU2VhcmNoLCBmaWx0ZXJDYWxsYmFjaywgc3RhcnRJbmRleCkge1xuICAgIC8vIERlZmF1bHQgdG8gZW5kIG9mIHRoZSBhcnJheVxuICAgIGlmIChzdGFydEluZGV4ID09PSB1bmRlZmluZWQgfHwgc3RhcnRJbmRleCA9PT0gbnVsbCkge1xuICAgICAgc3RhcnRJbmRleCA9IGFycmF5VG9TZWFyY2gubGVuZ3RoXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSBzdGFydEluZGV4IC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBjdXJyZW50SXRlbSA9IGFycmF5VG9TZWFyY2hbaV1cbiAgICAgIGlmIChmaWx0ZXJDYWxsYmFjayhjdXJyZW50SXRlbSkpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRJdGVtXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGhlbHBlcnMuaW5oZXJpdHMgPSBmdW5jdGlvbiAoZXh0ZW5zaW9ucykge1xuICAgIC8vIEJhc2ljIGphdmFzY3JpcHQgaW5oZXJpdGFuY2UgYmFzZWQgb24gdGhlIG1vZGVsIGNyZWF0ZWQgaW4gQmFja2JvbmUuanNcbiAgICB2YXIgbWUgPSB0aGlzXG4gICAgdmFyIENoYXJ0RWxlbWVudCA9IChleHRlbnNpb25zICYmIGV4dGVuc2lvbnMuaGFzT3duUHJvcGVydHkoJ2NvbnN0cnVjdG9yJykpID8gZXh0ZW5zaW9ucy5jb25zdHJ1Y3RvciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBtZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgfVxuXG4gICAgdmFyIFN1cnJvZ2F0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuY29uc3RydWN0b3IgPSBDaGFydEVsZW1lbnRcbiAgICB9XG4gICAgU3Vycm9nYXRlLnByb3RvdHlwZSA9IG1lLnByb3RvdHlwZVxuICAgIENoYXJ0RWxlbWVudC5wcm90b3R5cGUgPSBuZXcgU3Vycm9nYXRlKClcblxuICAgIENoYXJ0RWxlbWVudC5leHRlbmQgPSBoZWxwZXJzLmluaGVyaXRzXG5cbiAgICBpZiAoZXh0ZW5zaW9ucykge1xuICAgICAgaGVscGVycy5leHRlbmQoQ2hhcnRFbGVtZW50LnByb3RvdHlwZSwgZXh0ZW5zaW9ucylcbiAgICB9XG5cbiAgICBDaGFydEVsZW1lbnQuX19zdXBlcl9fID0gbWUucHJvdG90eXBlXG5cbiAgICByZXR1cm4gQ2hhcnRFbGVtZW50XG4gIH1cbiAgXG4gIGhlbHBlcnMudWlkID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaWQgPSAwXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBpZCsrXG4gICAgfVxuICB9KCkpXG4gIC8vIC0tIE1hdGggbWV0aG9kc1xuICBoZWxwZXJzLmlzTnVtYmVyID0gZnVuY3Rpb24gKG4pIHtcbiAgICByZXR1cm4gIWlzTmFOKHBhcnNlRmxvYXQobikpICYmIGlzRmluaXRlKG4pXG4gIH1cbiAgaGVscGVycy5hbG1vc3RFcXVhbHMgPSBmdW5jdGlvbiAoeCwgeSwgZXBzaWxvbikge1xuICAgIHJldHVybiBNYXRoLmFicyh4IC0geSkgPCBlcHNpbG9uXG4gIH1cbiAgaGVscGVycy5hbG1vc3RXaG9sZSA9IGZ1bmN0aW9uICh4LCBlcHNpbG9uKSB7XG4gICAgdmFyIHJvdW5kZWQgPSBNYXRoLnJvdW5kKHgpXG4gICAgcmV0dXJuICgoKHJvdW5kZWQgLSBlcHNpbG9uKSA8IHgpICYmICgocm91bmRlZCArIGVwc2lsb24pID4geCkpXG4gIH1cbiAgaGVscGVycy5tYXggPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICByZXR1cm4gYXJyYXkucmVkdWNlKGZ1bmN0aW9uIChtYXgsIHZhbHVlKSB7XG4gICAgICBpZiAoIWlzTmFOKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gTWF0aC5tYXgobWF4LCB2YWx1ZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXhcbiAgICB9LCBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpXG4gIH1cbiAgaGVscGVycy5taW4gPSBmdW5jdGlvbiAoYXJyYXkpIHtcbiAgICByZXR1cm4gYXJyYXkucmVkdWNlKGZ1bmN0aW9uIChtaW4sIHZhbHVlKSB7XG4gICAgICBpZiAoIWlzTmFOKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gTWF0aC5taW4obWluLCB2YWx1ZSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBtaW5cbiAgICB9LCBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkpXG4gIH1cbiAgaGVscGVycy5zaWduID0gTWF0aC5zaWduXG4gICAgPyBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIE1hdGguc2lnbih4KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uICh4KSB7XG4gICAgICB4ID0gK3ggLy8gY29udmVydCB0byBhIG51bWJlclxuICAgICAgaWYgKHggPT09IDAgfHwgaXNOYU4oeCkpIHtcbiAgICAgICAgcmV0dXJuIHhcbiAgICAgIH1cbiAgICAgIHJldHVybiB4ID4gMCA/IDEgOiAtMVxuICAgIH1cbiAgaGVscGVycy5sb2cxMCA9IE1hdGgubG9nMTBcbiAgICA/IGZ1bmN0aW9uICh4KSB7XG4gICAgICByZXR1cm4gTWF0aC5sb2cxMCh4KVxuICAgIH1cbiAgICA6IGZ1bmN0aW9uICh4KSB7XG4gICAgICByZXR1cm4gTWF0aC5sb2coeCkgLyBNYXRoLkxOMTBcbiAgICB9XG4gIGhlbHBlcnMudG9SYWRpYW5zID0gZnVuY3Rpb24gKGRlZ3JlZXMpIHtcbiAgICByZXR1cm4gZGVncmVlcyAqIChNYXRoLlBJIC8gMTgwKVxuICB9XG4gIGhlbHBlcnMudG9EZWdyZWVzID0gZnVuY3Rpb24gKHJhZGlhbnMpIHtcbiAgICByZXR1cm4gcmFkaWFucyAqICgxODAgLyBNYXRoLlBJKVxuICB9XG4gIC8vIEdldHMgdGhlIGFuZ2xlIGZyb20gdmVydGljYWwgdXByaWdodCB0byB0aGUgcG9pbnQgYWJvdXQgYSBjZW50cmUuXG4gIGhlbHBlcnMuZ2V0QW5nbGVGcm9tUG9pbnQgPSBmdW5jdGlvbiAoY2VudHJlUG9pbnQsIGFuZ2xlUG9pbnQpIHtcbiAgICB2YXIgZGlzdGFuY2VGcm9tWENlbnRlciA9IGFuZ2xlUG9pbnQueCAtIGNlbnRyZVBvaW50LngsXG4gICAgICBkaXN0YW5jZUZyb21ZQ2VudGVyID0gYW5nbGVQb2ludC55IC0gY2VudHJlUG9pbnQueSxcbiAgICAgIHJhZGlhbERpc3RhbmNlRnJvbUNlbnRlciA9IE1hdGguc3FydChkaXN0YW5jZUZyb21YQ2VudGVyICogZGlzdGFuY2VGcm9tWENlbnRlciArIGRpc3RhbmNlRnJvbVlDZW50ZXIgKiBkaXN0YW5jZUZyb21ZQ2VudGVyKVxuXG4gICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuMihkaXN0YW5jZUZyb21ZQ2VudGVyLCBkaXN0YW5jZUZyb21YQ2VudGVyKVxuXG4gICAgaWYgKGFuZ2xlIDwgKC0wLjUgKiBNYXRoLlBJKSkge1xuICAgICAgYW5nbGUgKz0gMi4wICogTWF0aC5QSSAvLyBtYWtlIHN1cmUgdGhlIHJldHVybmVkIGFuZ2xlIGlzIGluIHRoZSByYW5nZSBvZiAoLVBJLzIsIDNQSS8yXVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBhbmdsZTogYW5nbGUsXG4gICAgICBkaXN0YW5jZTogcmFkaWFsRGlzdGFuY2VGcm9tQ2VudGVyXG4gICAgfVxuICB9XG4gIGhlbHBlcnMuZGlzdGFuY2VCZXR3ZWVuUG9pbnRzID0gZnVuY3Rpb24gKHB0MSwgcHQyKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwdDIueCAtIHB0MS54LCAyKSArIE1hdGgucG93KHB0Mi55IC0gcHQxLnksIDIpKVxuICB9XG4gIGhlbHBlcnMuYWxpYXNQaXhlbCA9IGZ1bmN0aW9uIChwaXhlbFdpZHRoKSB7XG4gICAgcmV0dXJuIChwaXhlbFdpZHRoICUgMiA9PT0gMCkgPyAwIDogMC41XG4gIH1cbiAgaGVscGVycy5zcGxpbmVDdXJ2ZSA9IGZ1bmN0aW9uIChmaXJzdFBvaW50LCBtaWRkbGVQb2ludCwgYWZ0ZXJQb2ludCwgdCkge1xuICAgIC8vIFByb3BzIHRvIFJvYiBTcGVuY2VyIGF0IHNjYWxlZCBpbm5vdmF0aW9uIGZvciBoaXMgcG9zdCBvbiBzcGxpbmluZyBiZXR3ZWVuIHBvaW50c1xuICAgIC8vIGh0dHA6Ly9zY2FsZWRpbm5vdmF0aW9uLmNvbS9hbmFseXRpY3Mvc3BsaW5lcy9hYm91dFNwbGluZXMuaHRtbFxuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBtdXN0IGFsc28gcmVzcGVjdCBcInNraXBwZWRcIiBwb2ludHNcblxuICAgIHZhciBwcmV2aW91cyA9IGZpcnN0UG9pbnQuc2tpcCA/IG1pZGRsZVBvaW50IDogZmlyc3RQb2ludCxcbiAgICAgIGN1cnJlbnQgPSBtaWRkbGVQb2ludCxcbiAgICAgIG5leHQgPSBhZnRlclBvaW50LnNraXAgPyBtaWRkbGVQb2ludCA6IGFmdGVyUG9pbnRcblxuICAgIHZhciBkMDEgPSBNYXRoLnNxcnQoTWF0aC5wb3coY3VycmVudC54IC0gcHJldmlvdXMueCwgMikgKyBNYXRoLnBvdyhjdXJyZW50LnkgLSBwcmV2aW91cy55LCAyKSlcbiAgICB2YXIgZDEyID0gTWF0aC5zcXJ0KE1hdGgucG93KG5leHQueCAtIGN1cnJlbnQueCwgMikgKyBNYXRoLnBvdyhuZXh0LnkgLSBjdXJyZW50LnksIDIpKVxuXG4gICAgdmFyIHMwMSA9IGQwMSAvIChkMDEgKyBkMTIpXG4gICAgdmFyIHMxMiA9IGQxMiAvIChkMDEgKyBkMTIpXG5cbiAgICAvLyBJZiBhbGwgcG9pbnRzIGFyZSB0aGUgc2FtZSwgczAxICYgczAyIHdpbGwgYmUgaW5mXG4gICAgczAxID0gaXNOYU4oczAxKSA/IDAgOiBzMDFcbiAgICBzMTIgPSBpc05hTihzMTIpID8gMCA6IHMxMlxuXG4gICAgdmFyIGZhID0gdCAqIHMwMSAvLyBzY2FsaW5nIGZhY3RvciBmb3IgdHJpYW5nbGUgVGFcbiAgICB2YXIgZmIgPSB0ICogczEyXG5cbiAgICByZXR1cm4ge1xuICAgICAgcHJldmlvdXM6IHtcbiAgICAgICAgeDogY3VycmVudC54IC0gZmEgKiAobmV4dC54IC0gcHJldmlvdXMueCksXG4gICAgICAgIHk6IGN1cnJlbnQueSAtIGZhICogKG5leHQueSAtIHByZXZpb3VzLnkpXG4gICAgICB9LFxuICAgICAgbmV4dDoge1xuICAgICAgICB4OiBjdXJyZW50LnggKyBmYiAqIChuZXh0LnggLSBwcmV2aW91cy54KSxcbiAgICAgICAgeTogY3VycmVudC55ICsgZmIgKiAobmV4dC55IC0gcHJldmlvdXMueSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaGVscGVycy5FUFNJTE9OID0gTnVtYmVyLkVQU0lMT04gfHwgMWUtMTRcbiAgaGVscGVycy5zcGxpbmVDdXJ2ZU1vbm90b25lID0gZnVuY3Rpb24gKHBvaW50cykge1xuICAgIC8vIFRoaXMgZnVuY3Rpb24gY2FsY3VsYXRlcyBCw6l6aWVyIGNvbnRyb2wgcG9pbnRzIGluIGEgc2ltaWxhciB3YXkgdGhhbiB8c3BsaW5lQ3VydmV8LFxuICAgIC8vIGJ1dCBwcmVzZXJ2ZXMgbW9ub3RvbmljaXR5IG9mIHRoZSBwcm92aWRlZCBkYXRhIGFuZCBlbnN1cmVzIG5vIGxvY2FsIGV4dHJlbXVtcyBhcmUgYWRkZWRcbiAgICAvLyBiZXR3ZWVuIHRoZSBkYXRhc2V0IGRpc2NyZXRlIHBvaW50cyBkdWUgdG8gdGhlIGludGVycG9sYXRpb24uXG4gICAgLy8gU2VlIDogaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTW9ub3RvbmVfY3ViaWNfaW50ZXJwb2xhdGlvblxuXG4gICAgdmFyIHBvaW50c1dpdGhUYW5nZW50cyA9IChwb2ludHMgfHwgW10pLm1hcChmdW5jdGlvbiAocG9pbnQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1vZGVsOiBwb2ludC5fbW9kZWwsXG4gICAgICAgIGRlbHRhSzogMCxcbiAgICAgICAgbUs6IDBcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gQ2FsY3VsYXRlIHNsb3BlcyAoZGVsdGFLKSBhbmQgaW5pdGlhbGl6ZSB0YW5nZW50cyAobUspXG4gICAgdmFyIHBvaW50c0xlbiA9IHBvaW50c1dpdGhUYW5nZW50cy5sZW5ndGhcbiAgICB2YXIgaSwgcG9pbnRCZWZvcmUsIHBvaW50Q3VycmVudCwgcG9pbnRBZnRlclxuICAgIGZvciAoaSA9IDA7IGkgPCBwb2ludHNMZW47ICsraSkge1xuICAgICAgcG9pbnRDdXJyZW50ID0gcG9pbnRzV2l0aFRhbmdlbnRzW2ldXG4gICAgICBpZiAocG9pbnRDdXJyZW50Lm1vZGVsLnNraXApIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgcG9pbnRCZWZvcmUgPSBpID4gMCA/IHBvaW50c1dpdGhUYW5nZW50c1tpIC0gMV0gOiBudWxsXG4gICAgICBwb2ludEFmdGVyID0gaSA8IHBvaW50c0xlbiAtIDEgPyBwb2ludHNXaXRoVGFuZ2VudHNbaSArIDFdIDogbnVsbFxuICAgICAgaWYgKHBvaW50QWZ0ZXIgJiYgIXBvaW50QWZ0ZXIubW9kZWwuc2tpcCkge1xuICAgICAgICB2YXIgc2xvcGVEZWx0YVggPSAocG9pbnRBZnRlci5tb2RlbC54IC0gcG9pbnRDdXJyZW50Lm1vZGVsLngpXG5cbiAgICAgICAgLy8gSW4gdGhlIGNhc2Ugb2YgdHdvIHBvaW50cyB0aGF0IGFwcGVhciBhdCB0aGUgc2FtZSB4IHBpeGVsLCBzbG9wZURlbHRhWCBpcyAwXG4gICAgICAgIHBvaW50Q3VycmVudC5kZWx0YUsgPSBzbG9wZURlbHRhWCAhPT0gMCA/IChwb2ludEFmdGVyLm1vZGVsLnkgLSBwb2ludEN1cnJlbnQubW9kZWwueSkgLyBzbG9wZURlbHRhWCA6IDBcbiAgICAgIH1cblxuICAgICAgaWYgKCFwb2ludEJlZm9yZSB8fCBwb2ludEJlZm9yZS5tb2RlbC5za2lwKSB7XG4gICAgICAgIHBvaW50Q3VycmVudC5tSyA9IHBvaW50Q3VycmVudC5kZWx0YUtcbiAgICAgIH0gZWxzZSBpZiAoIXBvaW50QWZ0ZXIgfHwgcG9pbnRBZnRlci5tb2RlbC5za2lwKSB7XG4gICAgICAgIHBvaW50Q3VycmVudC5tSyA9IHBvaW50QmVmb3JlLmRlbHRhS1xuICAgICAgfSBlbHNlIGlmICh0aGlzLnNpZ24ocG9pbnRCZWZvcmUuZGVsdGFLKSAhPT0gdGhpcy5zaWduKHBvaW50Q3VycmVudC5kZWx0YUspKSB7XG4gICAgICAgIHBvaW50Q3VycmVudC5tSyA9IDBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBvaW50Q3VycmVudC5tSyA9IChwb2ludEJlZm9yZS5kZWx0YUsgKyBwb2ludEN1cnJlbnQuZGVsdGFLKSAvIDJcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBZGp1c3QgdGFuZ2VudHMgdG8gZW5zdXJlIG1vbm90b25pYyBwcm9wZXJ0aWVzXG4gICAgdmFyIGFscGhhSywgYmV0YUssIHRhdUssIHNxdWFyZWRNYWduaXR1ZGVcbiAgICBmb3IgKGkgPSAwOyBpIDwgcG9pbnRzTGVuIC0gMTsgKytpKSB7XG4gICAgICBwb2ludEN1cnJlbnQgPSBwb2ludHNXaXRoVGFuZ2VudHNbaV1cbiAgICAgIHBvaW50QWZ0ZXIgPSBwb2ludHNXaXRoVGFuZ2VudHNbaSArIDFdXG4gICAgICBpZiAocG9pbnRDdXJyZW50Lm1vZGVsLnNraXAgfHwgcG9pbnRBZnRlci5tb2RlbC5za2lwKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChoZWxwZXJzLmFsbW9zdEVxdWFscyhwb2ludEN1cnJlbnQuZGVsdGFLLCAwLCB0aGlzLkVQU0lMT04pKSB7XG4gICAgICAgIHBvaW50Q3VycmVudC5tSyA9IHBvaW50QWZ0ZXIubUsgPSAwXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGFscGhhSyA9IHBvaW50Q3VycmVudC5tSyAvIHBvaW50Q3VycmVudC5kZWx0YUtcbiAgICAgIGJldGFLID0gcG9pbnRBZnRlci5tSyAvIHBvaW50Q3VycmVudC5kZWx0YUtcbiAgICAgIHNxdWFyZWRNYWduaXR1ZGUgPSBNYXRoLnBvdyhhbHBoYUssIDIpICsgTWF0aC5wb3coYmV0YUssIDIpXG4gICAgICBpZiAoc3F1YXJlZE1hZ25pdHVkZSA8PSA5KSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHRhdUsgPSAzIC8gTWF0aC5zcXJ0KHNxdWFyZWRNYWduaXR1ZGUpXG4gICAgICBwb2ludEN1cnJlbnQubUsgPSBhbHBoYUsgKiB0YXVLICogcG9pbnRDdXJyZW50LmRlbHRhS1xuICAgICAgcG9pbnRBZnRlci5tSyA9IGJldGFLICogdGF1SyAqIHBvaW50Q3VycmVudC5kZWx0YUtcbiAgICB9XG5cbiAgICAvLyBDb21wdXRlIGNvbnRyb2wgcG9pbnRzXG4gICAgdmFyIGRlbHRhWFxuICAgIGZvciAoaSA9IDA7IGkgPCBwb2ludHNMZW47ICsraSkge1xuICAgICAgcG9pbnRDdXJyZW50ID0gcG9pbnRzV2l0aFRhbmdlbnRzW2ldXG4gICAgICBpZiAocG9pbnRDdXJyZW50Lm1vZGVsLnNraXApIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgcG9pbnRCZWZvcmUgPSBpID4gMCA/IHBvaW50c1dpdGhUYW5nZW50c1tpIC0gMV0gOiBudWxsXG4gICAgICBwb2ludEFmdGVyID0gaSA8IHBvaW50c0xlbiAtIDEgPyBwb2ludHNXaXRoVGFuZ2VudHNbaSArIDFdIDogbnVsbFxuICAgICAgaWYgKHBvaW50QmVmb3JlICYmICFwb2ludEJlZm9yZS5tb2RlbC5za2lwKSB7XG4gICAgICAgIGRlbHRhWCA9IChwb2ludEN1cnJlbnQubW9kZWwueCAtIHBvaW50QmVmb3JlLm1vZGVsLngpIC8gM1xuICAgICAgICBwb2ludEN1cnJlbnQubW9kZWwuY29udHJvbFBvaW50UHJldmlvdXNYID0gcG9pbnRDdXJyZW50Lm1vZGVsLnggLSBkZWx0YVhcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1vZGVsLmNvbnRyb2xQb2ludFByZXZpb3VzWSA9IHBvaW50Q3VycmVudC5tb2RlbC55IC0gZGVsdGFYICogcG9pbnRDdXJyZW50Lm1LXG4gICAgICB9XG4gICAgICBpZiAocG9pbnRBZnRlciAmJiAhcG9pbnRBZnRlci5tb2RlbC5za2lwKSB7XG4gICAgICAgIGRlbHRhWCA9IChwb2ludEFmdGVyLm1vZGVsLnggLSBwb2ludEN1cnJlbnQubW9kZWwueCkgLyAzXG4gICAgICAgIHBvaW50Q3VycmVudC5tb2RlbC5jb250cm9sUG9pbnROZXh0WCA9IHBvaW50Q3VycmVudC5tb2RlbC54ICsgZGVsdGFYXG4gICAgICAgIHBvaW50Q3VycmVudC5tb2RlbC5jb250cm9sUG9pbnROZXh0WSA9IHBvaW50Q3VycmVudC5tb2RlbC55ICsgZGVsdGFYICogcG9pbnRDdXJyZW50Lm1LXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGhlbHBlcnMubmV4dEl0ZW0gPSBmdW5jdGlvbiAoY29sbGVjdGlvbiwgaW5kZXgsIGxvb3ApIHtcbiAgICBpZiAobG9vcCkge1xuICAgICAgcmV0dXJuIGluZGV4ID49IGNvbGxlY3Rpb24ubGVuZ3RoIC0gMSA/IGNvbGxlY3Rpb25bMF0gOiBjb2xsZWN0aW9uW2luZGV4ICsgMV1cbiAgICB9XG4gICAgcmV0dXJuIGluZGV4ID49IGNvbGxlY3Rpb24ubGVuZ3RoIC0gMSA/IGNvbGxlY3Rpb25bY29sbGVjdGlvbi5sZW5ndGggLSAxXSA6IGNvbGxlY3Rpb25baW5kZXggKyAxXVxuICB9XG4gIGhlbHBlcnMucHJldmlvdXNJdGVtID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGluZGV4LCBsb29wKSB7XG4gICAgaWYgKGxvb3ApIHtcbiAgICAgIHJldHVybiBpbmRleCA8PSAwID8gY29sbGVjdGlvbltjb2xsZWN0aW9uLmxlbmd0aCAtIDFdIDogY29sbGVjdGlvbltpbmRleCAtIDFdXG4gICAgfVxuICAgIHJldHVybiBpbmRleCA8PSAwID8gY29sbGVjdGlvblswXSA6IGNvbGxlY3Rpb25baW5kZXggLSAxXVxuICB9XG4gIC8vIEltcGxlbWVudGF0aW9uIG9mIHRoZSBuaWNlIG51bWJlciBhbGdvcml0aG0gdXNlZCBpbiBkZXRlcm1pbmluZyB3aGVyZSBheGlzIGxhYmVscyB3aWxsIGdvXG4gIGhlbHBlcnMubmljZU51bSA9IGZ1bmN0aW9uIChyYW5nZSwgcm91bmQpIHtcbiAgICB2YXIgZXhwb25lbnQgPSBNYXRoLmZsb29yKGhlbHBlcnMubG9nMTAocmFuZ2UpKVxuICAgIHZhciBmcmFjdGlvbiA9IHJhbmdlIC8gTWF0aC5wb3coMTAsIGV4cG9uZW50KVxuICAgIHZhciBuaWNlRnJhY3Rpb25cblxuICAgIGlmIChyb3VuZCkge1xuICAgICAgaWYgKGZyYWN0aW9uIDwgMS41KSB7XG4gICAgICAgIG5pY2VGcmFjdGlvbiA9IDFcbiAgICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPCAzKSB7XG4gICAgICAgIG5pY2VGcmFjdGlvbiA9IDJcbiAgICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPCA3KSB7XG4gICAgICAgIG5pY2VGcmFjdGlvbiA9IDVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5pY2VGcmFjdGlvbiA9IDEwXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8PSAxLjApIHtcbiAgICAgIG5pY2VGcmFjdGlvbiA9IDFcbiAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDw9IDIpIHtcbiAgICAgIG5pY2VGcmFjdGlvbiA9IDJcbiAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDw9IDUpIHtcbiAgICAgIG5pY2VGcmFjdGlvbiA9IDVcbiAgICB9IGVsc2Uge1xuICAgICAgbmljZUZyYWN0aW9uID0gMTBcbiAgICB9XG5cbiAgICByZXR1cm4gbmljZUZyYWN0aW9uICogTWF0aC5wb3coMTAsIGV4cG9uZW50KVxuICB9XG4gIC8vIEVhc2luZyBmdW5jdGlvbnMgYWRhcHRlZCBmcm9tIFJvYmVydCBQZW5uZXIncyBlYXNpbmcgZXF1YXRpb25zXG4gIC8vIGh0dHA6Ly93d3cucm9iZXJ0cGVubmVyLmNvbS9lYXNpbmcvXG4gIHZhciBlYXNpbmdFZmZlY3RzID0gaGVscGVycy5lYXNpbmdFZmZlY3RzID0ge1xuICAgIGxpbmVhcjogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiB0XG4gICAgfSxcbiAgICBlYXNlSW5RdWFkOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIHQgKiB0XG4gICAgfSxcbiAgICBlYXNlT3V0UXVhZDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAtMSAqIHQgKiAodCAtIDIpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRRdWFkOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogdCAqIHRcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMSAvIDIgKiAoKC0tdCkgKiAodCAtIDIpIC0gMSlcbiAgICB9LFxuICAgIGVhc2VJbkN1YmljOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIHQgKiB0ICogdFxuICAgIH0sXG4gICAgZWFzZU91dEN1YmljOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgKiAoKHQgPSB0IC8gMSAtIDEpICogdCAqIHQgKyAxKVxuICAgIH0sXG4gICAgZWFzZUluT3V0Q3ViaWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gMSAvIDIgKiB0ICogdCAqIHRcbiAgICAgIH1cbiAgICAgIHJldHVybiAxIC8gMiAqICgodCAtPSAyKSAqIHQgKiB0ICsgMilcbiAgICB9LFxuICAgIGVhc2VJblF1YXJ0OiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIHQgKiB0ICogdCAqIHRcbiAgICB9LFxuICAgIGVhc2VPdXRRdWFydDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAtMSAqICgodCA9IHQgLyAxIC0gMSkgKiB0ICogdCAqIHQgLSAxKVxuICAgIH0sXG4gICAgZWFzZUluT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gMSAvIDIgKiB0ICogdCAqIHQgKiB0XG4gICAgICB9XG4gICAgICByZXR1cm4gLTEgLyAyICogKCh0IC09IDIpICogdCAqIHQgKiB0IC0gMilcbiAgICB9LFxuICAgIGVhc2VJblF1aW50OiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgKiAodCAvPSAxKSAqIHQgKiB0ICogdCAqIHRcbiAgICB9LFxuICAgIGVhc2VPdXRRdWludDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxICogKCh0ID0gdCAvIDEgLSAxKSAqIHQgKiB0ICogdCAqIHQgKyAxKVxuICAgIH0sXG4gICAgZWFzZUluT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gMSAvIDIgKiB0ICogdCAqIHQgKiB0ICogdFxuICAgICAgfVxuICAgICAgcmV0dXJuIDEgLyAyICogKCh0IC09IDIpICogdCAqIHQgKiB0ICogdCArIDIpXG4gICAgfSxcbiAgICBlYXNlSW5TaW5lOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIC0xICogTWF0aC5jb3ModCAvIDEgKiAoTWF0aC5QSSAvIDIpKSArIDFcbiAgICB9LFxuICAgIGVhc2VPdXRTaW5lOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgKiBNYXRoLnNpbih0IC8gMSAqIChNYXRoLlBJIC8gMikpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRTaW5lOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIC0xIC8gMiAqIChNYXRoLmNvcyhNYXRoLlBJICogdCAvIDEpIC0gMSlcbiAgICB9LFxuICAgIGVhc2VJbkV4cG86IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gKHQgPT09IDApID8gMSA6IDEgKiBNYXRoLnBvdygyLCAxMCAqICh0IC8gMSAtIDEpKVxuICAgIH0sXG4gICAgZWFzZU91dEV4cG86IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gKHQgPT09IDEpID8gMSA6IDEgKiAoLU1hdGgucG93KDIsIC0xMCAqIHQgLyAxKSArIDEpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRFeHBvOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKHQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cbiAgICAgIGlmICh0ID09PSAxKSB7XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gMSAvIDIgKiBNYXRoLnBvdygyLCAxMCAqICh0IC0gMSkpXG4gICAgICB9XG4gICAgICByZXR1cm4gMSAvIDIgKiAoLU1hdGgucG93KDIsIC0xMCAqIC0tdCkgKyAyKVxuICAgIH0sXG4gICAgZWFzZUluQ2lyYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICh0ID49IDEpIHtcbiAgICAgICAgcmV0dXJuIHRcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMSAqIChNYXRoLnNxcnQoMSAtICh0IC89IDEpICogdCkgLSAxKVxuICAgIH0sXG4gICAgZWFzZU91dENpcmM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gMSAqIE1hdGguc3FydCgxIC0gKHQgPSB0IC8gMSAtIDEpICogdClcbiAgICB9LFxuICAgIGVhc2VJbk91dENpcmM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpIDwgMSkge1xuICAgICAgICByZXR1cm4gLTEgLyAyICogKE1hdGguc3FydCgxIC0gdCAqIHQpIC0gMSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAxIC8gMiAqIChNYXRoLnNxcnQoMSAtICh0IC09IDIpICogdCkgKyAxKVxuICAgIH0sXG4gICAgZWFzZUluRWxhc3RpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgdmFyIHAgPSAwXG4gICAgICB2YXIgYSA9IDFcbiAgICAgIGlmICh0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgICBpZiAoKHQgLz0gMSkgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIH1cbiAgICAgIGlmICghcCkge1xuICAgICAgICBwID0gMSAqIDAuM1xuICAgICAgfVxuICAgICAgaWYgKGEgPCBNYXRoLmFicygxKSkge1xuICAgICAgICBhID0gMVxuICAgICAgICBzID0gcCAvIDRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMgPSBwIC8gKDIgKiBNYXRoLlBJKSAqIE1hdGguYXNpbigxIC8gYSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAtKGEgKiBNYXRoLnBvdygyLCAxMCAqICh0IC09IDEpKSAqIE1hdGguc2luKCh0ICogMSAtIHMpICogKDIgKiBNYXRoLlBJKSAvIHApKVxuICAgIH0sXG4gICAgZWFzZU91dEVsYXN0aWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIHZhciBwID0gMFxuICAgICAgdmFyIGEgPSAxXG4gICAgICBpZiAodCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuICAgICAgaWYgKCh0IC89IDEpID09PSAxKSB7XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9XG4gICAgICBpZiAoIXApIHtcbiAgICAgICAgcCA9IDEgKiAwLjNcbiAgICAgIH1cbiAgICAgIGlmIChhIDwgTWF0aC5hYnMoMSkpIHtcbiAgICAgICAgYSA9IDFcbiAgICAgICAgcyA9IHAgLyA0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzID0gcCAvICgyICogTWF0aC5QSSkgKiBNYXRoLmFzaW4oMSAvIGEpXG4gICAgICB9XG4gICAgICByZXR1cm4gYSAqIE1hdGgucG93KDIsIC0xMCAqIHQpICogTWF0aC5zaW4oKHQgKiAxIC0gcykgKiAoMiAqIE1hdGguUEkpIC8gcCkgKyAxXG4gICAgfSxcbiAgICBlYXNlSW5PdXRFbGFzdGljOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICB2YXIgcCA9IDBcbiAgICAgIHZhciBhID0gMVxuICAgICAgaWYgKHQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cbiAgICAgIGlmICgodCAvPSAxIC8gMikgPT09IDIpIHtcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIH1cbiAgICAgIGlmICghcCkge1xuICAgICAgICBwID0gMSAqICgwLjMgKiAxLjUpXG4gICAgICB9XG4gICAgICBpZiAoYSA8IE1hdGguYWJzKDEpKSB7XG4gICAgICAgIGEgPSAxXG4gICAgICAgIHMgPSBwIC8gNFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcyA9IHAgLyAoMiAqIE1hdGguUEkpICogTWF0aC5hc2luKDEgLyBhKVxuICAgICAgfVxuICAgICAgaWYgKHQgPCAxKSB7XG4gICAgICAgIHJldHVybiAtMC41ICogKGEgKiBNYXRoLnBvdygyLCAxMCAqICh0IC09IDEpKSAqIE1hdGguc2luKCh0ICogMSAtIHMpICogKDIgKiBNYXRoLlBJKSAvIHApKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGEgKiBNYXRoLnBvdygyLCAtMTAgKiAodCAtPSAxKSkgKiBNYXRoLnNpbigodCAqIDEgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSAqIDAuNSArIDFcbiAgICB9LFxuICAgIGVhc2VJbkJhY2s6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIHJldHVybiAxICogKHQgLz0gMSkgKiB0ICogKChzICsgMSkgKiB0IC0gcylcbiAgICB9LFxuICAgIGVhc2VPdXRCYWNrOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICByZXR1cm4gMSAqICgodCA9IHQgLyAxIC0gMSkgKiB0ICogKChzICsgMSkgKiB0ICsgcykgKyAxKVxuICAgIH0sXG4gICAgZWFzZUluT3V0QmFjazogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogKHQgKiB0ICogKCgocyAqPSAoMS41MjUpKSArIDEpICogdCAtIHMpKVxuICAgICAgfVxuICAgICAgcmV0dXJuIDEgLyAyICogKCh0IC09IDIpICogdCAqICgoKHMgKj0gKDEuNTI1KSkgKyAxKSAqIHQgKyBzKSArIDIpXG4gICAgfSxcbiAgICBlYXNlSW5Cb3VuY2U6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gMSAtIGVhc2luZ0VmZmVjdHMuZWFzZU91dEJvdW5jZSgxIC0gdClcbiAgICB9LFxuICAgIGVhc2VPdXRCb3VuY2U6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAoKHQgLz0gMSkgPCAoMSAvIDIuNzUpKSB7XG4gICAgICAgIHJldHVybiAxICogKDcuNTYyNSAqIHQgKiB0KVxuICAgICAgfSBlbHNlIGlmICh0IDwgKDIgLyAyLjc1KSkge1xuICAgICAgICByZXR1cm4gMSAqICg3LjU2MjUgKiAodCAtPSAoMS41IC8gMi43NSkpICogdCArIDAuNzUpXG4gICAgICB9IGVsc2UgaWYgKHQgPCAoMi41IC8gMi43NSkpIHtcbiAgICAgICAgcmV0dXJuIDEgKiAoNy41NjI1ICogKHQgLT0gKDIuMjUgLyAyLjc1KSkgKiB0ICsgMC45Mzc1KVxuICAgICAgfVxuICAgICAgcmV0dXJuIDEgKiAoNy41NjI1ICogKHQgLT0gKDIuNjI1IC8gMi43NSkpICogdCArIDAuOTg0Mzc1KVxuICAgIH0sXG4gICAgZWFzZUluT3V0Qm91bmNlOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKHQgPCAxIC8gMikge1xuICAgICAgICByZXR1cm4gZWFzaW5nRWZmZWN0cy5lYXNlSW5Cb3VuY2UodCAqIDIpICogMC41XG4gICAgICB9XG4gICAgICByZXR1cm4gZWFzaW5nRWZmZWN0cy5lYXNlT3V0Qm91bmNlKHQgKiAyIC0gMSkgKiAwLjUgKyAxICogMC41XG4gICAgfVxuICB9XG4gIFxuICAvLyAtLSBET00gbWV0aG9kc1xuICBoZWxwZXJzLmdldFJlbGF0aXZlUG9zaXRpb24gPSBmdW5jdGlvbiAoZXZ0LCBjaGFydCkge1xuICAgIHZhciBtb3VzZVgsIG1vdXNlWVxuICAgIHZhciBlID0gZXZ0Lm9yaWdpbmFsRXZlbnQgfHwgZXZ0LFxuICAgICAgY2FudmFzID0gZXZ0LmN1cnJlbnRUYXJnZXQgfHwgZXZ0LnNyY0VsZW1lbnQsXG4gICAgICBib3VuZGluZ1JlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcblxuICAgIHZhciB0b3VjaGVzID0gZS50b3VjaGVzXG4gICAgaWYgKHRvdWNoZXMgJiYgdG91Y2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICBtb3VzZVggPSB0b3VjaGVzWzBdLmNsaWVudFhcbiAgICAgIG1vdXNlWSA9IHRvdWNoZXNbMF0uY2xpZW50WVxuICAgIH0gZWxzZSB7XG4gICAgICBtb3VzZVggPSBlLmNsaWVudFhcbiAgICAgIG1vdXNlWSA9IGUuY2xpZW50WVxuICAgIH1cblxuICAgIC8vIFNjYWxlIG1vdXNlIGNvb3JkaW5hdGVzIGludG8gY2FudmFzIGNvb3JkaW5hdGVzXG4gICAgLy8gYnkgZm9sbG93aW5nIHRoZSBwYXR0ZXJuIGxhaWQgb3V0IGJ5ICdqZXJyeWonIGluIHRoZSBjb21tZW50cyBvZlxuICAgIC8vIGh0dHA6Ly93d3cuaHRtbDVjYW52YXN0dXRvcmlhbHMuY29tL2FkdmFuY2VkL2h0bWw1LWNhbnZhcy1tb3VzZS1jb29yZGluYXRlcy9cbiAgICB2YXIgcGFkZGluZ0xlZnQgPSBwYXJzZUZsb2F0KGhlbHBlcnMuZ2V0U3R5bGUoY2FudmFzLCAncGFkZGluZy1sZWZ0JykpXG4gICAgdmFyIHBhZGRpbmdUb3AgPSBwYXJzZUZsb2F0KGhlbHBlcnMuZ2V0U3R5bGUoY2FudmFzLCAncGFkZGluZy10b3AnKSlcbiAgICB2YXIgcGFkZGluZ1JpZ2h0ID0gcGFyc2VGbG9hdChoZWxwZXJzLmdldFN0eWxlKGNhbnZhcywgJ3BhZGRpbmctcmlnaHQnKSlcbiAgICB2YXIgcGFkZGluZ0JvdHRvbSA9IHBhcnNlRmxvYXQoaGVscGVycy5nZXRTdHlsZShjYW52YXMsICdwYWRkaW5nLWJvdHRvbScpKVxuICAgIHZhciB3aWR0aCA9IGJvdW5kaW5nUmVjdC5yaWdodCAtIGJvdW5kaW5nUmVjdC5sZWZ0IC0gcGFkZGluZ0xlZnQgLSBwYWRkaW5nUmlnaHRcbiAgICB2YXIgaGVpZ2h0ID0gYm91bmRpbmdSZWN0LmJvdHRvbSAtIGJvdW5kaW5nUmVjdC50b3AgLSBwYWRkaW5nVG9wIC0gcGFkZGluZ0JvdHRvbVxuXG4gICAgLy8gV2UgZGl2aWRlIGJ5IHRoZSBjdXJyZW50IGRldmljZSBwaXhlbCByYXRpbywgYmVjYXVzZSB0aGUgY2FudmFzIGlzIHNjYWxlZCB1cCBieSB0aGF0IGFtb3VudCBpbiBlYWNoIGRpcmVjdGlvbi4gSG93ZXZlclxuICAgIC8vIHRoZSBiYWNrZW5kIG1vZGVsIGlzIGluIHVuc2NhbGVkIGNvb3JkaW5hdGVzLiBTaW5jZSB3ZSBhcmUgZ29pbmcgdG8gZGVhbCB3aXRoIG91ciBtb2RlbCBjb29yZGluYXRlcywgd2UgZ28gYmFjayBoZXJlXG4gICAgbW91c2VYID0gTWF0aC5yb3VuZCgobW91c2VYIC0gYm91bmRpbmdSZWN0LmxlZnQgLSBwYWRkaW5nTGVmdCkgLyAod2lkdGgpICogY2FudmFzLndpZHRoIC8gY2hhcnQuY3VycmVudERldmljZVBpeGVsUmF0aW8pXG4gICAgbW91c2VZID0gTWF0aC5yb3VuZCgobW91c2VZIC0gYm91bmRpbmdSZWN0LnRvcCAtIHBhZGRpbmdUb3ApIC8gKGhlaWdodCkgKiBjYW52YXMuaGVpZ2h0IC8gY2hhcnQuY3VycmVudERldmljZVBpeGVsUmF0aW8pXG5cbiAgICByZXR1cm4ge1xuICAgICAgeDogbW91c2VYLFxuICAgICAgeTogbW91c2VZXG4gICAgfVxuICB9XG4gIGhlbHBlcnMuYWRkRXZlbnQgPSBmdW5jdGlvbiAobm9kZSwgZXZlbnRUeXBlLCBtZXRob2QpIHtcbiAgICBpZiAobm9kZS5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBtZXRob2QpXG4gICAgfSBlbHNlIGlmIChub2RlLmF0dGFjaEV2ZW50KSB7XG4gICAgICBub2RlLmF0dGFjaEV2ZW50KCdvbicgKyBldmVudFR5cGUsIG1ldGhvZClcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZVsnb24nICsgZXZlbnRUeXBlXSA9IG1ldGhvZFxuICAgIH1cbiAgfVxuICBoZWxwZXJzLnJlbW92ZUV2ZW50ID0gZnVuY3Rpb24gKG5vZGUsIGV2ZW50VHlwZSwgaGFuZGxlcikge1xuICAgIGlmIChub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIpIHtcbiAgICAgIG5vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGhhbmRsZXIsIGZhbHNlKVxuICAgIH0gZWxzZSBpZiAobm9kZS5kZXRhY2hFdmVudCkge1xuICAgICAgbm9kZS5kZXRhY2hFdmVudCgnb24nICsgZXZlbnRUeXBlLCBoYW5kbGVyKVxuICAgIH0gZWxzZSB7XG4gICAgICBub2RlWydvbicgKyBldmVudFR5cGVdID0gaGVscGVycy5ub29wXG4gICAgfVxuICB9XG5cbiAgLy8gUHJpdmF0ZSBoZWxwZXIgZnVuY3Rpb24gdG8gY29udmVydCBtYXgtd2lkdGgvbWF4LWhlaWdodCB2YWx1ZXMgdGhhdCBtYXkgYmUgcGVyY2VudGFnZXMgaW50byBhIG51bWJlclxuICBmdW5jdGlvbiBwYXJzZU1heFN0eWxlIChzdHlsZVZhbHVlLCBub2RlLCBwYXJlbnRQcm9wZXJ0eSkge1xuICAgIHZhciB2YWx1ZUluUGl4ZWxzXG4gICAgaWYgKHR5cGVvZiAoc3R5bGVWYWx1ZSkgPT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZUluUGl4ZWxzID0gcGFyc2VJbnQoc3R5bGVWYWx1ZSwgMTApXG5cbiAgICAgIGlmIChzdHlsZVZhbHVlLmluZGV4T2YoJyUnKSAhPT0gLTEpIHtcbiAgICAgICAgLy8gcGVyY2VudGFnZSAqIHNpemUgaW4gZGltZW5zaW9uXG4gICAgICAgIHZhbHVlSW5QaXhlbHMgPSB2YWx1ZUluUGl4ZWxzIC8gMTAwICogbm9kZS5wYXJlbnROb2RlW3BhcmVudFByb3BlcnR5XVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZUluUGl4ZWxzID0gc3R5bGVWYWx1ZVxuICAgIH1cblxuICAgIHJldHVybiB2YWx1ZUluUGl4ZWxzXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBpZiB0aGUgZ2l2ZW4gdmFsdWUgY29udGFpbnMgYW4gZWZmZWN0aXZlIGNvbnN0cmFpbnQuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBpc0NvbnN0cmFpbmVkVmFsdWUgKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwgJiYgdmFsdWUgIT09ICdub25lJ1xuICB9XG5cbiAgLy8gUHJpdmF0ZSBoZWxwZXIgdG8gZ2V0IGEgY29uc3RyYWludCBkaW1lbnNpb25cbiAgLy8gQHBhcmFtIGRvbU5vZGUgOiB0aGUgbm9kZSB0byBjaGVjayB0aGUgY29uc3RyYWludCBvblxuICAvLyBAcGFyYW0gbWF4U3R5bGUgOiB0aGUgc3R5bGUgdGhhdCBkZWZpbmVzIHRoZSBtYXhpbXVtIGZvciB0aGUgZGlyZWN0aW9uIHdlIGFyZSB1c2luZyAobWF4V2lkdGggLyBtYXhIZWlnaHQpXG4gIC8vIEBwYXJhbSBwZXJjZW50YWdlUHJvcGVydHkgOiBwcm9wZXJ0eSBvZiBwYXJlbnQgdG8gdXNlIHdoZW4gY2FsY3VsYXRpbmcgd2lkdGggYXMgYSBwZXJjZW50YWdlXG4gIC8vIEBzZWUgaHR0cDovL3d3dy5uYXRoYW5hZWxqb25lcy5jb20vYmxvZy8yMDEzL3JlYWRpbmctbWF4LXdpZHRoLWNyb3NzLWJyb3dzZXJcbiAgZnVuY3Rpb24gZ2V0Q29uc3RyYWludERpbWVuc2lvbiAoZG9tTm9kZSwgbWF4U3R5bGUsIHBlcmNlbnRhZ2VQcm9wZXJ0eSkge1xuICAgIHZhciB2aWV3ID0gZG9jdW1lbnQuZGVmYXVsdFZpZXdcbiAgICB2YXIgcGFyZW50Tm9kZSA9IGRvbU5vZGUucGFyZW50Tm9kZVxuICAgIHZhciBjb25zdHJhaW5lZE5vZGUgPSB2aWV3LmdldENvbXB1dGVkU3R5bGUoZG9tTm9kZSlbbWF4U3R5bGVdXG4gICAgdmFyIGNvbnN0cmFpbmVkQ29udGFpbmVyID0gdmlldy5nZXRDb21wdXRlZFN0eWxlKHBhcmVudE5vZGUpW21heFN0eWxlXVxuICAgIHZhciBoYXNDTm9kZSA9IGlzQ29uc3RyYWluZWRWYWx1ZShjb25zdHJhaW5lZE5vZGUpXG4gICAgdmFyIGhhc0NDb250YWluZXIgPSBpc0NvbnN0cmFpbmVkVmFsdWUoY29uc3RyYWluZWRDb250YWluZXIpXG4gICAgdmFyIGluZmluaXR5ID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZXG5cbiAgICBpZiAoaGFzQ05vZGUgfHwgaGFzQ0NvbnRhaW5lcikge1xuICAgICAgcmV0dXJuIE1hdGgubWluKFxuICAgICAgICBoYXNDTm9kZSA/IHBhcnNlTWF4U3R5bGUoY29uc3RyYWluZWROb2RlLCBkb21Ob2RlLCBwZXJjZW50YWdlUHJvcGVydHkpIDogaW5maW5pdHksXG4gICAgICAgIGhhc0NDb250YWluZXIgPyBwYXJzZU1heFN0eWxlKGNvbnN0cmFpbmVkQ29udGFpbmVyLCBwYXJlbnROb2RlLCBwZXJjZW50YWdlUHJvcGVydHkpIDogaW5maW5pdHkpXG4gICAgfVxuXG4gICAgcmV0dXJuICdub25lJ1xuICB9XG4gIC8vIHJldHVybnMgTnVtYmVyIG9yIHVuZGVmaW5lZCBpZiBubyBjb25zdHJhaW50XG4gIGhlbHBlcnMuZ2V0Q29uc3RyYWludFdpZHRoID0gZnVuY3Rpb24gKGRvbU5vZGUpIHtcbiAgICByZXR1cm4gZ2V0Q29uc3RyYWludERpbWVuc2lvbihkb21Ob2RlLCAnbWF4LXdpZHRoJywgJ2NsaWVudFdpZHRoJylcbiAgfVxuICAvLyByZXR1cm5zIE51bWJlciBvciB1bmRlZmluZWQgaWYgbm8gY29uc3RyYWludFxuICBoZWxwZXJzLmdldENvbnN0cmFpbnRIZWlnaHQgPSBmdW5jdGlvbiAoZG9tTm9kZSkge1xuICAgIHJldHVybiBnZXRDb25zdHJhaW50RGltZW5zaW9uKGRvbU5vZGUsICdtYXgtaGVpZ2h0JywgJ2NsaWVudEhlaWdodCcpXG4gIH1cbiAgaGVscGVycy5nZXRNYXhpbXVtV2lkdGggPSBmdW5jdGlvbiAoZG9tTm9kZSkge1xuICAgIHZhciBjb250YWluZXIgPSBkb21Ob2RlLnBhcmVudE5vZGVcbiAgICB2YXIgcGFkZGluZ0xlZnQgPSBwYXJzZUludChoZWxwZXJzLmdldFN0eWxlKGNvbnRhaW5lciwgJ3BhZGRpbmctbGVmdCcpLCAxMClcbiAgICB2YXIgcGFkZGluZ1JpZ2h0ID0gcGFyc2VJbnQoaGVscGVycy5nZXRTdHlsZShjb250YWluZXIsICdwYWRkaW5nLXJpZ2h0JyksIDEwKVxuICAgIHZhciB3ID0gY29udGFpbmVyLmNsaWVudFdpZHRoIC0gcGFkZGluZ0xlZnQgLSBwYWRkaW5nUmlnaHRcbiAgICB2YXIgY3cgPSBoZWxwZXJzLmdldENvbnN0cmFpbnRXaWR0aChkb21Ob2RlKVxuICAgIHJldHVybiBpc05hTihjdykgPyB3IDogTWF0aC5taW4odywgY3cpXG4gIH1cbiAgaGVscGVycy5nZXRNYXhpbXVtSGVpZ2h0ID0gZnVuY3Rpb24gKGRvbU5vZGUpIHtcbiAgICB2YXIgY29udGFpbmVyID0gZG9tTm9kZS5wYXJlbnROb2RlXG4gICAgdmFyIHBhZGRpbmdUb3AgPSBwYXJzZUludChoZWxwZXJzLmdldFN0eWxlKGNvbnRhaW5lciwgJ3BhZGRpbmctdG9wJyksIDEwKVxuICAgIHZhciBwYWRkaW5nQm90dG9tID0gcGFyc2VJbnQoaGVscGVycy5nZXRTdHlsZShjb250YWluZXIsICdwYWRkaW5nLWJvdHRvbScpLCAxMClcbiAgICB2YXIgaCA9IGNvbnRhaW5lci5jbGllbnRIZWlnaHQgLSBwYWRkaW5nVG9wIC0gcGFkZGluZ0JvdHRvbVxuICAgIHZhciBjaCA9IGhlbHBlcnMuZ2V0Q29uc3RyYWludEhlaWdodChkb21Ob2RlKVxuICAgIHJldHVybiBpc05hTihjaCkgPyBoIDogTWF0aC5taW4oaCwgY2gpXG4gIH1cbiAgaGVscGVycy5nZXRTdHlsZSA9IGZ1bmN0aW9uIChlbCwgcHJvcGVydHkpIHtcbiAgICByZXR1cm4gZWwuY3VycmVudFN0eWxlXG4gICAgICA/IGVsLmN1cnJlbnRTdHlsZVtwcm9wZXJ0eV1cbiAgICAgIDogZG9jdW1lbnQuZGVmYXVsdFZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShlbCwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShwcm9wZXJ0eSlcbiAgfVxuICBoZWxwZXJzLnJldGluYVNjYWxlID0gZnVuY3Rpb24gKGNoYXJ0KSB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7IHJldHVybiAndGhpcyBpcyBzZXJ2ZXInIH1cblxuICAgIHZhciBwaXhlbFJhdGlvID0gY2hhcnQuY3VycmVudERldmljZVBpeGVsUmF0aW8gPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyB8fCAxXG4gICAgaWYgKHBpeGVsUmF0aW8gPT09IDEpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHZhciBjYW52YXMgPSBjaGFydC5jYW52YXNcbiAgICB2YXIgaGVpZ2h0ID0gY2hhcnQuaGVpZ2h0XG4gICAgdmFyIHdpZHRoID0gY2hhcnQud2lkdGhcblxuICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQgKiBwaXhlbFJhdGlvXG4gICAgY2FudmFzLndpZHRoID0gd2lkdGggKiBwaXhlbFJhdGlvXG4gICAgY2hhcnQuY3R4LnNjYWxlKHBpeGVsUmF0aW8sIHBpeGVsUmF0aW8pXG5cbiAgICAvLyBJZiBubyBzdHlsZSBoYXMgYmVlbiBzZXQgb24gdGhlIGNhbnZhcywgdGhlIHJlbmRlciBzaXplIGlzIHVzZWQgYXMgZGlzcGxheSBzaXplLFxuICAgIC8vIG1ha2luZyB0aGUgY2hhcnQgdmlzdWFsbHkgYmlnZ2VyLCBzbyBsZXQncyBlbmZvcmNlIGl0IHRvIHRoZSBcImNvcnJlY3RcIiB2YWx1ZXMuXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGFydGpzL0NoYXJ0LmpzL2lzc3Vlcy8zNTc1XG4gICAgY2FudmFzLnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCdcbiAgICBjYW52YXMuc3R5bGUud2lkdGggPSB3aWR0aCArICdweCdcbiAgfVxuICAvLyAtLSBDYW52YXMgbWV0aG9kc1xuICBoZWxwZXJzLmNsZWFyID0gZnVuY3Rpb24gKGNoYXJ0KSB7XG4gICAgY2hhcnQuY3R4LmNsZWFyUmVjdCgwLCAwLCBjaGFydC53aWR0aCwgY2hhcnQuaGVpZ2h0KVxuICB9XG4gIGhlbHBlcnMuZm9udFN0cmluZyA9IGZ1bmN0aW9uIChwaXhlbFNpemUsIGZvbnRTdHlsZSwgZm9udEZhbWlseSkge1xuICAgIHJldHVybiBmb250U3R5bGUgKyAnICcgKyBwaXhlbFNpemUgKyAncHggJyArIGZvbnRGYW1pbHlcbiAgfVxuICBoZWxwZXJzLmxvbmdlc3RUZXh0ID0gZnVuY3Rpb24gKGN0eCwgZm9udCwgYXJyYXlPZlRoaW5ncywgY2FjaGUpIHtcbiAgICBjYWNoZSA9IGNhY2hlIHx8IHt9XG4gICAgdmFyIGRhdGEgPSBjYWNoZS5kYXRhID0gY2FjaGUuZGF0YSB8fCB7fVxuICAgIHZhciBnYyA9IGNhY2hlLmdhcmJhZ2VDb2xsZWN0ID0gY2FjaGUuZ2FyYmFnZUNvbGxlY3QgfHwgW11cblxuICAgIGlmIChjYWNoZS5mb250ICE9PSBmb250KSB7XG4gICAgICBkYXRhID0gY2FjaGUuZGF0YSA9IHt9XG4gICAgICBnYyA9IGNhY2hlLmdhcmJhZ2VDb2xsZWN0ID0gW11cbiAgICAgIGNhY2hlLmZvbnQgPSBmb250XG4gICAgfVxuXG4gICAgY3R4LmZvbnQgPSBmb250XG4gICAgdmFyIGxvbmdlc3QgPSAwXG4gICAgaGVscGVycy5lYWNoKGFycmF5T2ZUaGluZ3MsIGZ1bmN0aW9uICh0aGluZykge1xuICAgICAgLy8gVW5kZWZpbmVkIHN0cmluZ3MgYW5kIGFycmF5cyBzaG91bGQgbm90IGJlIG1lYXN1cmVkXG4gICAgICBpZiAodGhpbmcgIT09IHVuZGVmaW5lZCAmJiB0aGluZyAhPT0gbnVsbCAmJiBoZWxwZXJzLmlzQXJyYXkodGhpbmcpICE9PSB0cnVlKSB7XG4gICAgICAgIGxvbmdlc3QgPSBoZWxwZXJzLm1lYXN1cmVUZXh0KGN0eCwgZGF0YSwgZ2MsIGxvbmdlc3QsIHRoaW5nKVxuICAgICAgfSBlbHNlIGlmIChoZWxwZXJzLmlzQXJyYXkodGhpbmcpKSB7XG4gICAgICAgIC8vIGlmIGl0IGlzIGFuIGFycmF5IGxldHMgbWVhc3VyZSBlYWNoIGVsZW1lbnRcbiAgICAgICAgLy8gdG8gZG8gbWF5YmUgc2ltcGxpZnkgdGhpcyBmdW5jdGlvbiBhIGJpdCBzbyB3ZSBjYW4gZG8gdGhpcyBtb3JlIHJlY3Vyc2l2ZWx5P1xuICAgICAgICBoZWxwZXJzLmVhY2godGhpbmcsIGZ1bmN0aW9uIChuZXN0ZWRUaGluZykge1xuICAgICAgICAgIC8vIFVuZGVmaW5lZCBzdHJpbmdzIGFuZCBhcnJheXMgc2hvdWxkIG5vdCBiZSBtZWFzdXJlZFxuICAgICAgICAgIGlmIChuZXN0ZWRUaGluZyAhPT0gdW5kZWZpbmVkICYmIG5lc3RlZFRoaW5nICE9PSBudWxsICYmICFoZWxwZXJzLmlzQXJyYXkobmVzdGVkVGhpbmcpKSB7XG4gICAgICAgICAgICBsb25nZXN0ID0gaGVscGVycy5tZWFzdXJlVGV4dChjdHgsIGRhdGEsIGdjLCBsb25nZXN0LCBuZXN0ZWRUaGluZylcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHZhciBnY0xlbiA9IGdjLmxlbmd0aCAvIDJcbiAgICBpZiAoZ2NMZW4gPiBhcnJheU9mVGhpbmdzLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBnY0xlbjsgaSsrKSB7XG4gICAgICAgIGRlbGV0ZSBkYXRhW2djW2ldXVxuICAgICAgfVxuICAgICAgZ2Muc3BsaWNlKDAsIGdjTGVuKVxuICAgIH1cbiAgICByZXR1cm4gbG9uZ2VzdFxuICB9XG4gIGhlbHBlcnMubWVhc3VyZVRleHQgPSBmdW5jdGlvbiAoY3R4LCBkYXRhLCBnYywgbG9uZ2VzdCwgc3RyaW5nKSB7XG4gICAgdmFyIHRleHRXaWR0aCA9IGRhdGFbc3RyaW5nXVxuICAgIGlmICghdGV4dFdpZHRoKSB7XG4gICAgICB0ZXh0V2lkdGggPSBkYXRhW3N0cmluZ10gPSBjdHgubWVhc3VyZVRleHQoc3RyaW5nKS53aWR0aFxuICAgICAgZ2MucHVzaChzdHJpbmcpXG4gICAgfVxuICAgIGlmICh0ZXh0V2lkdGggPiBsb25nZXN0KSB7XG4gICAgICBsb25nZXN0ID0gdGV4dFdpZHRoXG4gICAgfVxuICAgIHJldHVybiBsb25nZXN0XG4gIH1cbiAgaGVscGVycy5udW1iZXJPZkxhYmVsTGluZXMgPSBmdW5jdGlvbiAoYXJyYXlPZlRoaW5ncykge1xuICAgIHZhciBudW1iZXJPZkxpbmVzID0gMVxuICAgIGhlbHBlcnMuZWFjaChhcnJheU9mVGhpbmdzLCBmdW5jdGlvbiAodGhpbmcpIHtcbiAgICAgIGlmIChoZWxwZXJzLmlzQXJyYXkodGhpbmcpKSB7XG4gICAgICAgIGlmICh0aGluZy5sZW5ndGggPiBudW1iZXJPZkxpbmVzKSB7XG4gICAgICAgICAgbnVtYmVyT2ZMaW5lcyA9IHRoaW5nLmxlbmd0aFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gbnVtYmVyT2ZMaW5lc1xuICB9XG4gIGhlbHBlcnMuZHJhd1JvdW5kZWRSZWN0YW5nbGUgPSBmdW5jdGlvbiAoY3R4LCB4LCB5LCB3aWR0aCwgaGVpZ2h0LCByYWRpdXMpIHtcbiAgICBjdHguYmVnaW5QYXRoKClcbiAgICBjdHgubW92ZVRvKHggKyByYWRpdXMsIHkpXG4gICAgY3R4LmxpbmVUbyh4ICsgd2lkdGggLSByYWRpdXMsIHkpXG4gICAgY3R4LnF1YWRyYXRpY0N1cnZlVG8oeCArIHdpZHRoLCB5LCB4ICsgd2lkdGgsIHkgKyByYWRpdXMpXG4gICAgY3R4LmxpbmVUbyh4ICsgd2lkdGgsIHkgKyBoZWlnaHQgLSByYWRpdXMpXG4gICAgY3R4LnF1YWRyYXRpY0N1cnZlVG8oeCArIHdpZHRoLCB5ICsgaGVpZ2h0LCB4ICsgd2lkdGggLSByYWRpdXMsIHkgKyBoZWlnaHQpXG4gICAgY3R4LmxpbmVUbyh4ICsgcmFkaXVzLCB5ICsgaGVpZ2h0KVxuICAgIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKHgsIHkgKyBoZWlnaHQsIHgsIHkgKyBoZWlnaHQgLSByYWRpdXMpXG4gICAgY3R4LmxpbmVUbyh4LCB5ICsgcmFkaXVzKVxuICAgIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKHgsIHksIHggKyByYWRpdXMsIHkpXG4gICAgY3R4LmNsb3NlUGF0aCgpXG4gIH1cbiAgaGVscGVycy5jb2xvciA9IGZ1bmN0aW9uIChjKSB7XG4gICAgaWYgKCFjb2xvcikge1xuICAgICAgY29uc29sZS5lcnJvcignQ29sb3IuanMgbm90IGZvdW5kIScpXG4gICAgICByZXR1cm4gY1xuICAgIH1cblxuICAgIC8qIGdsb2JhbCBDYW52YXNHcmFkaWVudCAqL1xuICAgIGlmIChjIGluc3RhbmNlb2YgQ2FudmFzR3JhZGllbnQpIHtcbiAgICAgIHJldHVybiBjb2xvcihDaGFydC5kZWZhdWx0cy5nbG9iYWwuZGVmYXVsdENvbG9yKVxuICAgIH1cblxuICAgIHJldHVybiBjb2xvcihjKVxuICB9XG4gIGhlbHBlcnMuaXNBcnJheSA9IEFycmF5LmlzQXJyYXlcbiAgICA/IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KG9iailcbiAgICB9XG4gICAgOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgICB9XG4gIC8vICEgQHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xNDg1Mzk3NFxuICBoZWxwZXJzLmFycmF5RXF1YWxzID0gZnVuY3Rpb24gKGEwLCBhMSkge1xuICAgIHZhciBpLCBpbGVuLCB2MCwgdjFcblxuICAgIGlmICghYTAgfHwgIWExIHx8IGEwLmxlbmd0aCAhPT0gYTEubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwLCBpbGVuID0gYTAubGVuZ3RoOyBpIDwgaWxlbjsgKytpKSB7XG4gICAgICB2MCA9IGEwW2ldXG4gICAgICB2MSA9IGExW2ldXG5cbiAgICAgIGlmICh2MCBpbnN0YW5jZW9mIEFycmF5ICYmIHYxIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgaWYgKCFoZWxwZXJzLmFycmF5RXF1YWxzKHYwLCB2MSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh2MCAhPT0gdjEpIHtcbiAgICAgICAgLy8gTk9URTogdHdvIGRpZmZlcmVudCBvYmplY3QgaW5zdGFuY2VzIHdpbGwgbmV2ZXIgYmUgZXF1YWw6IHt4OjIwfSAhPSB7eDoyMH1cbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuICBoZWxwZXJzLmNhbGxDYWxsYmFjayA9IGZ1bmN0aW9uIChmbiwgYXJncywgX3RBcmcpIHtcbiAgICBpZiAoZm4gJiYgdHlwZW9mIGZuLmNhbGwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZuLmFwcGx5KF90QXJnLCBhcmdzKVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLmdldEhvdmVyQ29sb3IgPSBmdW5jdGlvbiAoY29sb3JWYWx1ZSkge1xuICAgIC8qIGdsb2JhbCBDYW52YXNQYXR0ZXJuICovXG4gICAgcmV0dXJuIChjb2xvclZhbHVlIGluc3RhbmNlb2YgQ2FudmFzUGF0dGVybilcbiAgICAgID8gY29sb3JWYWx1ZVxuICAgICAgOiBoZWxwZXJzLmNvbG9yKGNvbG9yVmFsdWUpLnNhdHVyYXRlKDAuNSkuZGFya2VuKDAuMSkucmdiU3RyaW5nKClcbiAgfVxufVxuIiwid2luZG93Lk5hcGNoYXJ0ID0ge31cclxuXHJcbi8qIGhlbHBlciBmdW5jdGlvbnMgKi9cclxucmVxdWlyZSgnLi9oZWxwZXJzJykoTmFwY2hhcnQpXHJcbnJlcXVpcmUoJy4vZHJhdy9jYW52YXNIZWxwZXJzJykoTmFwY2hhcnQpXHJcblxyXG4vKiBjb25maWcgZmlsZXMgKi9cclxucmVxdWlyZSgnLi9jb25maWcnKShOYXBjaGFydClcclxucmVxdWlyZSgnLi90eXBlcycpKE5hcGNoYXJ0KVxyXG5cclxuLyogcmVhbCBzaGl0ICovXHJcbnJlcXVpcmUoJy4vY29yZScpKE5hcGNoYXJ0KVxyXG5cclxuLyogZHJhd2luZyAqL1xyXG5yZXF1aXJlKCcuL3NoYXBlL3NoYXBlJykoTmFwY2hhcnQpXHJcbnJlcXVpcmUoJy4vZHJhdy9kcmF3JykoTmFwY2hhcnQpXHJcbnJlcXVpcmUoJy4vaW50ZXJhY3RDYW52YXMvaW50ZXJhY3RDYW52YXMnKShOYXBjaGFydClcclxuXHJcbi8qIG90aGVyIG1vZHVsZXMgKi9cclxucmVxdWlyZSgnLi9mYW5jeW1vZHVsZScpKE5hcGNoYXJ0KVxyXG4vLyByZXF1aXJlKCcuL2FuaW1hdGlvbicpKE5hcGNoYXJ0KVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuTmFwY2hhcnQiLCIvKlxyXG4qICBpbnRlcmFjdENhbnZhc1xyXG4qXHJcbiogIFRoaXMgbW9kdWxlIGFkZHMgc3VwcG9ydCBmb3IgbW9kaWZ5aW5nIGEgc2NoZWR1bGVcclxuKiAgZGlyZWN0bHkgb24gdGhlIGNhbnZhcyB3aXRoIG1vdXNlIG9yIHRvdWNoXHJcbiovXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG5cclxuICBOYXBjaGFydC5vbignaW5pdGlhbGl6ZScsIGZ1bmN0aW9uIChjaGFydCkge1xyXG4gICAgaWYoIWNoYXJ0LmNvbmZpZy5pbnRlcmFjdGlvbikgcmV0dXJuXHJcblxyXG4gICAgdmFyIGNhbnZhcyA9IGNoYXJ0LmNhbnZhc1xyXG5cclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGhvdmVyKGUsIGNoYXJ0KVxyXG4gICAgfSlcclxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGRvd24oZSwgY2hhcnQpXHJcbiAgICB9KVxyXG4gICAgLy8gY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBkb3duKVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgdXAoZSwgY2hhcnQpXHJcbiAgICB9KVxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIHVwKGUsIGNoYXJ0KVxyXG4gICAgfSlcclxuICAvLyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JyxkZXNlbGVjdClcclxuICB9KVxyXG5cclxuICB2YXIgbW91c2VIb3ZlciA9IHt9LFxyXG4gICAgYWN0aXZlRWxlbWVudHMgPSBbXSxcclxuICAgIGhvdmVyRGlzdGFuY2UgPSA2LFxyXG4gICAgc2VsZWN0ZWRPcGFjaXR5ID0gMVxyXG5cclxuICBmdW5jdGlvbiBkb3duIChlLCBjaGFydCkge1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgdmFyIGNvb3JkaW5hdGVzID0gZ2V0Q29vcmRpbmF0ZXMoZSwgY2hhcnQpXHJcblxyXG4gICAgdmFyIGhpdCA9IGhpdERldGVjdChjaGFydCwgY29vcmRpbmF0ZXMpXHJcblxyXG4gICAgLy8gcmV0dXJuIG9mIG5vIGhpdFxyXG4gICAgaWYgKE9iamVjdC5rZXlzKGhpdCkubGVuZ3RoID09IDApIHtcclxuICAgICAgZGVzZWxlY3QoY2hhcnQpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNldCBpZGVudGlmaWVyXHJcbiAgICBpZiAodHlwZW9mIGUuY2hhbmdlZFRvdWNoZXMgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgaGl0LmlkZW50aWZpZXIgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmlkZW50aWZpZXJcclxuICAgIH1lbHNlIHtcclxuICAgICAgaGl0LmlkZW50aWZpZXIgPSAnbW91c2UnXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGVzZWxlY3Qgb3RoZXIgZWxlbWVudHMgaWYgdGhleSBhcmUgbm90IGJlaW5nIHRvdWNoZWRcclxuICAgIGlmIChhY3RpdmVFbGVtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgZGVzZWxlY3QoY2hhcnQpXHJcbiAgICB9XHJcblxyXG4gICAgYWN0aXZlRWxlbWVudHMucHVzaChoaXQpXHJcblxyXG4gICAgaWYgKHR5cGVvZiBlLmNoYW5nZWRUb3VjaGVzICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGRyYWcpXHJcbiAgICB9ZWxzZSB7XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBkcmFnKGUsIGNoYXJ0KVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdChjaGFydCwgaGl0Lm9yaWdpbilcclxuXHJcbiAgICBkcmFnKGUsIGNoYXJ0KSAvLyB0byAgbWFrZSBzdXJlIHRoZSBoYW5kbGVzIHBvc2l0aW9ucyB0byB0aGUgY3Vyc29yIGV2ZW4gYmVmb3JlIG1vdmVtZW50XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRDb29yZGluYXRlcyAoZSwgY2hhcnQpIHtcclxuICAgIHZhciBtb3VzZVgsbW91c2VZXHJcbiAgICB2YXIgY2FudmFzID0gY2hhcnQuY2FudmFzXHJcbiAgICAvLyBvcmlnbyBpcyAoMCwwKVxyXG4gICAgdmFyIGJvdW5kaW5nUmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG5cclxuICAgIHZhciB3aWR0aCA9IGNhbnZhcy53aWR0aFxyXG4gICAgdmFyIGhlaWdodCA9IGNhbnZhcy5oZWlnaHRcclxuXHJcbiAgICBpZiAoZS5jaGFuZ2VkVG91Y2hlcykge1xyXG4gICAgICBtb3VzZVggPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggLSBib3VuZGluZ1JlY3QubGVmdFxyXG4gICAgICBtb3VzZVkgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wXHJcbiAgICB9ZWxzZSB7XHJcbiAgICAgIG1vdXNlWCA9IGUuY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0XHJcbiAgICAgIG1vdXNlWSA9IGUuY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3BcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiBtb3VzZVgsXHJcbiAgICAgIHk6IG1vdXNlWVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGl0RGV0ZWN0IChjaGFydCwgY29vcmRpbmF0ZXMpIHtcclxuICAgIHZhciBjYW52YXMgPSBjaGFydC5jYW52YXNcclxuICAgIHZhciBkYXRhID0gY2hhcnQuZGF0YVxyXG5cclxuICAgIC8vIHdpbGwgcmV0dXJuOlxyXG4gICAgLy8gZWxlbWVudFxyXG4gICAgLy8gdHlwZSAoc3RhcnQsIGVuZCwgb3IgbWlkZGxlKVxyXG4gICAgLy8gZGlzdGFuY2VcclxuXHJcbiAgICB2YXIgaGl0ID0ge31cclxuXHJcbiAgICAvLyBoaXQgZGV0ZWN0aW9uIG9mIGhhbmRsZXM6XHJcblxyXG4gICAgdmFyIGRpc3RhbmNlO1xyXG5cclxuICAgIGRhdGEuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcblxyXG4gICAgICAvLyBpZiBlbGVtZW50IGlzIG5vdCBzZWxlY3RlZCwgY29udGludWVcclxuICAgICAgaWYgKCFjaGFydC5pc1NlbGVjdGVkKGVsZW1lbnQpKXtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICBbJ3N0YXJ0JywgJ2VuZCddLmZvckVhY2goZnVuY3Rpb24oc3RhcnRPckVuZCkge1xyXG4gICAgICAgIHZhciBwb2ludCA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGVsZW1lbnRbc3RhcnRPckVuZF0sIGVsZW1lbnQudHlwZS5sYW5lLmVuZClcclxuICAgICAgICBcclxuICAgICAgICBkaXN0YW5jZSA9IGhlbHBlcnMuZGlzdGFuY2UocG9pbnQueCwgcG9pbnQueSwgY29vcmRpbmF0ZXMpXHJcbiAgICAgICAgaWYoZGlzdGFuY2UgPCBjaGFydC5jb25maWcuaGFuZGxlc0NsaWNrRGlzdGFuY2Upe1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBoaXQuZGlzdGFuY2UgPT0gJ3VuZGVmaW5lZCcgfHwgZGlzdGFuY2UgPCBoaXQuZGlzdGFuY2UpIHtcclxuICAgICAgICAgICAgaGl0ID0ge1xyXG4gICAgICAgICAgICAgIG9yaWdpbjogZWxlbWVudCxcclxuICAgICAgICAgICAgICB0eXBlOiBzdGFydE9yRW5kLFxyXG4gICAgICAgICAgICAgIGRpc3RhbmNlOiBkaXN0YW5jZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuXHJcblxyXG4gICAgLy8gaWYgbm8gaGFuZGxlIGlzIGhpdCwgY2hlY2sgZm9yIG1pZGRsZSBoaXRcclxuXHJcbiAgICBpZiAoT2JqZWN0LmtleXMoaGl0KS5sZW5ndGggPT0gMCkge1xyXG5cclxuICAgICAgdmFyIGluZm8gPSBoZWxwZXJzLlhZdG9JbmZvKGNoYXJ0LCBjb29yZGluYXRlcy54LCBjb29yZGluYXRlcy55KVxyXG5cclxuICAgICAgLy8gbG9vcCB0aHJvdWdoIGVsZW1lbnRzXHJcbiAgICAgIGRhdGEuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGlmIHBvaW50IGlzIGluc2lkZSBlbGVtZW50IGhvcml6b250YWxseVxyXG4gICAgICAgIGlmIChoZWxwZXJzLmlzSW5zaWRlKGluZm8ubWludXRlcywgZWxlbWVudC5zdGFydCwgZWxlbWVudC5lbmQpKSB7XHJcblxyXG4gICAgICAgICAgLy8gY2hlY2sgaWYgcG9pbnQgaXMgaW5zaWRlIGVsZW1lbnQgdmVydGljYWxseVxyXG4gICAgICAgICAgdmFyIGlubmVyUmFkaXVzID0gZWxlbWVudC50eXBlLmxhbmUuc3RhcnRcclxuICAgICAgICAgIHZhciBvdXRlclJhZGl1cyA9IGVsZW1lbnQudHlwZS5sYW5lLmVuZFxyXG5cclxuICAgICAgICAgIGlmIChpbmZvLmRpc3RhbmNlID4gaW5uZXJSYWRpdXMgJiYgaW5mby5kaXN0YW5jZSA8IG91dGVyUmFkaXVzKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uSW5FbGVtZW50ID0gaW5mby5taW51dGVzLWVsZW1lbnQuc3RhcnRcclxuICAgICAgICAgICAgaGl0ID0ge1xyXG4gICAgICAgICAgICAgIG9yaWdpbjogZWxlbWVudCxcclxuICAgICAgICAgICAgICB0eXBlOiAnd2hvbGUnLFxyXG4gICAgICAgICAgICAgIHBvc2l0aW9uSW5FbGVtZW50OiBwb3NpdGlvbkluRWxlbWVudFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICBcclxuICAgIH1cclxuXHJcblxyXG4gICAgcmV0dXJuIGhpdFxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaG92ZXIgKGUsIGNoYXJ0KSB7XHJcbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBnZXRDb29yZGluYXRlcyhlLCBjaGFydClcclxuICAgIHZhciBoaXQgPSBoaXREZXRlY3QoY2hhcnQsIGNvb3JkaW5hdGVzKVxyXG5cclxuICAgIGlmKGhpdCl7XHJcbiAgICAgIC8vIGNoYXJ0LnNldEVsZW1lbnRTdGF0ZShoaXQuY291bnQsICdob3ZlcicpXHJcbiAgICB9ZWxzZXtcclxuICAgICAgLy8gY2hhcnQucmVtb3ZlRWxlbWVudFN0YXRlcygpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hhcnQucmVkcmF3KClcclxuICB9XHJcblxyXG5cclxuICBmdW5jdGlvbiBkcmFnIChlLCBjaGFydCkge1xyXG4gICAgdmFyIGlkZW50aWZpZXIgPSBmaW5kSWRlbnRpZmllcihlKVxyXG5cclxuICAgIHZhciBkcmFnRWxlbWVudCA9IGdldEFjdGl2ZUVsZW1lbnQoaWRlbnRpZmllcilcclxuXHJcbiAgICBpZiAoIWRyYWdFbGVtZW50KSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIHZhciBjb29yZGluYXRlcyA9IGdldENvb3JkaW5hdGVzKGUsIGNoYXJ0KVxyXG4gICAgdmFyIG1pbnV0ZXMgPSBoZWxwZXJzLlhZdG9JbmZvKGNoYXJ0LCBjb29yZGluYXRlcy54LCBjb29yZGluYXRlcy55KS5taW51dGVzXHJcbiAgICB2YXIgb3JpZ2luRWxlbWVudCA9IGRyYWdFbGVtZW50Lm9yaWdpblxyXG5cclxuICAgIGlmKGRyYWdFbGVtZW50LnR5cGUgPT0gJ3N0YXJ0JyB8fCBkcmFnRWxlbWVudC50eXBlID09ICdlbmQnKXtcclxuICAgICAgb3JpZ2luRWxlbWVudFtkcmFnRWxlbWVudC50eXBlXSA9IHNuYXAobWludXRlcylcclxuICAgIH1cclxuICAgIGVsc2UgaWYoZHJhZ0VsZW1lbnQudHlwZSA9PSAnd2hvbGUnKXtcclxuICAgICAgdmFyIHBvc2l0aW9uSW5FbGVtZW50ID0gZHJhZ0VsZW1lbnQucG9zaXRpb25JbkVsZW1lbnRcclxuICAgICAgdmFyIGR1cmF0aW9uID0gaGVscGVycy5yYW5nZShvcmlnaW5FbGVtZW50LnN0YXJ0LCBvcmlnaW5FbGVtZW50LmVuZClcclxuXHJcbiAgICAgIG9yaWdpbkVsZW1lbnQuc3RhcnQgPSBzbmFwKGhlbHBlcnMubGltaXQoTWF0aC5yb3VuZChtaW51dGVzIC0gcG9zaXRpb25JbkVsZW1lbnQpKSlcclxuICAgICAgb3JpZ2luRWxlbWVudC5lbmQgPSBoZWxwZXJzLmxpbWl0KE1hdGgucm91bmQob3JpZ2luRWxlbWVudC5zdGFydCArIGR1cmF0aW9uKSlcclxuICAgIH1cclxuICAgIGNoYXJ0LmRhdGFDaGFuZ2VkKClcclxuXHJcbiAgICBmdW5jdGlvbiBzbmFwKGlucHV0KSB7XHJcbiAgICAgIHJldHVybiA1ICogTWF0aC5yb3VuZChpbnB1dCAvIDUpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB1bmZvY3VzIChlKSB7XHJcbiAgICAvLyBjaGVja3MgaWYgY2xpY2sgaXMgb24gYSBwYXJ0IG9mIHRoZSBzaXRlIHRoYXQgc2hvdWxkIG1ha2UgdGhlXHJcbiAgICAvLyBjdXJyZW50IHNlbGVjdGVkIGVsZW1lbnRzIGJlIGRlc2VsZWN0ZWRcclxuXHJcbiAgICB2YXIgeCwgeVxyXG4gICAgdmFyIGRvbUVsZW1lbnRcclxuXHJcbiAgICB4ID0gZS5jbGllbnRYXHJcbiAgICB5ID0gZS5jbGllbnRZXHJcblxyXG4gICAgdmFyIGRvbUVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZWxlY3QgKGNoYXJ0LCBlbGVtZW50KSB7XHJcbiAgICAvLyBub3RpZnkgY29yZSBtb2R1bGU6XHJcbiAgICBjaGFydC5zZXRTZWxlY3RlZChlbGVtZW50KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZGVzZWxlY3QgKGNoYXJ0LCBlbGVtZW50KSB7XHJcbiAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgLy8gZGVzZWxlY3QgYWxsXHJcbiAgICAgIGNoYXJ0LmRlc2VsZWN0KClcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZHJhZylcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZHJhZylcclxuICAgIH1cclxuICAgIC8vIGRlc2VsZWN0IG9uZVxyXG4gICAgY2hhcnQuZGVzZWxlY3QoZWxlbWVudClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZpbmRJZGVudGlmaWVyIChlKSB7XHJcbiAgICBpZiAoZS50eXBlLnNlYXJjaCgnbW91c2UnKSA+PSAwKSB7XHJcbiAgICAgIHJldHVybiAnbW91c2UnXHJcbiAgICB9ZWxzZSB7XHJcbiAgICAgIHJldHVybiBlLmNoYW5nZWRUb3VjaGVzWzBdLmlkZW50aWZpZXJcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldEFjdGl2ZUVsZW1lbnQgKGlkZW50aWZpZXIpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWN0aXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGFjdGl2ZUVsZW1lbnRzW2ldLmlkZW50aWZpZXIgPT0gaWRlbnRpZmllcikge1xyXG4gICAgICAgIHJldHVybiBhY3RpdmVFbGVtZW50c1tpXVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbW92ZUFjdGl2ZUVsZW1lbnQgKGlkZW50aWZpZXIpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWN0aXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGFjdGl2ZUVsZW1lbnRzW2ldLmlkZW50aWZpZXIgPT0gaWRlbnRpZmllcikge1xyXG4gICAgICAgIGFjdGl2ZUVsZW1lbnRzLnNwbGljZShpLCAxKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB1cCAoZSwgY2hhcnQpIHtcclxuICAgIHZhciBpZGVudGlmaWVyID0gZmluZElkZW50aWZpZXIoZSlcclxuICAgIHZhciBlbGVtZW50ID0gZ2V0QWN0aXZlRWxlbWVudChpZGVudGlmaWVyKVxyXG5cclxuICAgIGlmIChhY3RpdmVFbGVtZW50cy5sZW5ndGggIT0gMCkge1xyXG4gICAgICAvLyBjaGFydEhpc3RvcnkuYWRkKG5hcGNoYXJ0Q29yZS5nZXRTY2hlZHVsZSgpLCAnbW92ZWQgJyArIGVsZW1lbnQubmFtZSArICcgJyArIChlbGVtZW50LmNvdW50ICsgMSkpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmluZCB0aGUgc2hpdCB0byByZW1vdmVcclxuICAgIHJlbW92ZUFjdGl2ZUVsZW1lbnQoaWRlbnRpZmllcilcclxuXHJcbiAgICBjaGFydC5yZWRyYXdcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNuYXAgKGlucHV0KSB7XHJcbiAgICB2YXIgb3V0cHV0ID0gaW5wdXRcclxuXHJcbiAgICBpZiAoc2V0dGluZ3MuZ2V0VmFsdWUoJ3NuYXAxMCcpKSB7XHJcbiAgICAgIG91dHB1dCA9IDEwICogTWF0aC5yb3VuZChpbnB1dCAvIDEwKVxyXG4gICAgfWVsc2UgaWYgKHNldHRpbmdzLmdldFZhbHVlKCdzbmFwNScpKSB7XHJcbiAgICAgIG91dHB1dCA9IDUgKiBNYXRoLnJvdW5kKGlucHV0IC8gNSlcclxuICAgIH1lbHNlIHtcclxuXHJcbiAgICAgIC8vIGhvdXJcclxuICAgICAgaWYgKGlucHV0ICUgNjAgPCA3KVxyXG4gICAgICAgIG91dHB1dCA9IGlucHV0IC0gaW5wdXQgJSA2MFxyXG4gICAgICBlbHNlIGlmIChpbnB1dCAlIDYwID4gNTMpXHJcbiAgICAgICAgb3V0cHV0ID0gaW5wdXQgKyAoNjAgLSBpbnB1dCAlIDYwKVxyXG5cclxuICAgICAgLy8gaGFsZiBob3Vyc1xyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBpbnB1dCArPSAzMFxyXG5cclxuICAgICAgICBpZiAoaW5wdXQgJSA2MCA8IDUpXHJcbiAgICAgICAgICBvdXRwdXQgPSBpbnB1dCAtIGlucHV0ICUgNjAgLSAzMFxyXG4gICAgICAgIGVsc2UgaWYgKGlucHV0ICUgNjAgPiA1NSlcclxuICAgICAgICAgIG91dHB1dCA9IGlucHV0ICsgKDYwIC0gaW5wdXQgJSA2MCkgLSAzMFxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG91dHB1dFxyXG4gIH1cclxufVxyXG4iLCIvKipcclxuICpcclxuICogZnVuY3Rpb24gY2FsY3VsYXRlU2hhcGVcclxuICogXHJcbiAqIFRoaXMgZnVuY3Rpb24gdGFrZXMgYSBub3JtYWwgc2hhcGUgZGVmaW5pdGlvbiBvYmplY3RcclxuICogYW5kIGNhbGN1bGF0ZXMgcG9zaXRpb25zIGFuZCBzaXplc1xyXG4gKlxyXG4gKiBSZXR1cm5zIGEgbW9yZSBkZXRhaWxlZCBzaGFwZSBvYmplY3QgdGhhdCBpcyBsYXRlclxyXG4gKiBhc3NpZ25lZCB0byBjaGFydC5zaGFwZSBhbmQgdXNlZCB3aGVuIGRyYXdpbmdcclxuICpcclxuICovXHJcblxyXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2FsY3VsYXRlU2hhcGUoY2hhcnQsIHNoYXBlKXtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCByYWRpYW5zIG9yIG1pbnV0ZXMgcHJvcGVydGllc1xyXG4gICAgICovXHJcblxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICAgIGVsZW1lbnQubGVuZ3RoID0gZWxlbWVudC52YWx1ZVxyXG4gICAgICAgIGVsZW1lbnQucmFkaWFucyA9IGVsZW1lbnQudmFsdWVcclxuICAgICAgfWVsc2UgaWYoZWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG4gICAgICAgIGVsZW1lbnQubGVuZ3RoID0gZWxlbWVudC52YWx1ZVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZCBvdXQgdG90YWxSYWRpYW5zXHJcbiAgICAgKiBUaGlzIGJlIDIgKiBQSSBpZiB0aGUgc2hhcGUgaXMgY2lyY3VsYXJcclxuICAgICAqL1xyXG5cclxuICAgIHZhciB0b3RhbFJhZGlhbnMgPSAwXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgLy8gaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgdG90YWxSYWRpYW5zICs9IGVsZW1lbnQudmFsdWVcclxuICAgICAgLy8gfVxyXG4gICAgfSlcclxuXHJcblxyXG4gICAgLy8gKlxyXG4gICAgLy8gICogRmluZCB0aGUgc3VtIG9mIG1pbnV0ZXMgaW4gdGhlIGxpbmUgZWxlbWVudHNcclxuICAgIC8vICAqIEFyYyBlbGVtZW50cyBkb2VzIG5vdCBkZWZpbmUgbWludXRlcywgb25seSByYWRpYW5zXHJcbiAgICAgXHJcblxyXG4gICAgLy8gdmFyIHRvdGFsTWludXRlcyA9IDBcclxuICAgIC8vIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgLy8gICBpZihlbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAvLyAgICAgdG90YWxNaW51dGVzICs9IGVsZW1lbnQubWludXRlc1xyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9KVxyXG5cclxuICAgIC8vIGlmKHRvdGFsTWludXRlcyA+IDE0NDApe1xyXG4gICAgLy8gICB0aHJvdyBuZXcgRXJyKCdUb28gbWFueSBtaW51dGVzIGluIGxpbmUgc2VnbWVudHMnKVxyXG4gICAgLy8gfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZCBvdXQgYW5nbGUgb2Ygc2hhcGVzXHJcbiAgICAgKi9cclxuXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgaWYoaSA9PT0gMCkgZWxlbWVudC5zdGFydEFuZ2xlID0gMCBcclxuICAgICAgZWxzZSBlbGVtZW50LnN0YXJ0QW5nbGUgPSBzaGFwZVtpLTFdLmVuZEFuZ2xlXHJcbiAgICAgIFxyXG4gICAgICBpZihlbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuICAgICAgICBlbGVtZW50LmVuZEFuZ2xlID0gZWxlbWVudC5zdGFydEFuZ2xlICsgZWxlbWVudC5yYWRpYW5zXHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICBlbGVtZW50LmVuZEFuZ2xlID0gZWxlbWVudC5zdGFydEFuZ2xlXHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIG91dCBsZW5ndGggb2YgdGhlIHNoYXBlc1xyXG4gICAgICogXHJcbiAgICAgKiBQZXJpbWV0ZXIgb2YgY2lyY2xlID0gMiAqIHJhZGl1cyAqIFBJXHJcbiAgICAgKi9cclxuXHJcbiAgICAvLyB2YXIgbWludXRlTGVuZ3RoUmF0aW8gPSAwLjQ1XHJcbiAgICAvLyB2YXIgZm91bmRBcmMgPSBzaGFwZS5zb21lKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgIC8vICAgaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAvLyAgICAgZWxlbWVudC5sZW5ndGggPSBiYXNlUmFkaXVzICogZWxlbWVudC5yYWRpYW5zXHJcbiAgICAvLyAgICAgaWYoZWxlbWVudC5taW51dGVzICE9IDApXHJcbiAgICAvLyAgICAgbWludXRlTGVuZ3RoUmF0aW8gPSBlbGVtZW50Lmxlbmd0aCAvIGVsZW1lbnQubWludXRlc1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKGVsZW1lbnQubGVuZ3RoLCBlbGVtZW50Lm1pbnV0ZXMpXHJcbiAgICAvLyAgICAgcmV0dXJuIHRydWVcclxuICAgIC8vICAgfVxyXG4gICAgLy8gfSlcclxuXHJcbiAgICB2YXIgdG90YWxMZW5ndGggPSAwXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgZWxlbWVudC5sZW5ndGggPSBlbGVtZW50Lmxlbmd0aCAqIGNoYXJ0LmNvbmZpZy5iYXNlUmFkaXVzXHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICBlbGVtZW50Lmxlbmd0aCA9IGVsZW1lbnQubGVuZ3RoICogY2hhcnQucmF0aW9cclxuICAgICAgfVxyXG4gICAgICB0b3RhbExlbmd0aCArPSBlbGVtZW50Lmxlbmd0aFxyXG4gICAgfSlcclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSBob3cgbWFueSBtaW51dGVzIGVhY2ggYXJjIGVsZW1lbnQgc2hvdWxkIGdldFxyXG4gICAgICogYmFzZWQgb24gaG93IG1hbnkgbWludXRlcyBhcmUgbGVmdCBhZnRlciBsaW5lIGVsZW1lbnRzXHJcbiAgICAgKiBnZXQgd2hhdCB0aGV5IHNob3VsZCBoYXZlXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgbWludXRlc0xlZnRGb3JBcmNzID0gMTQ0MCBcclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICBlbGVtZW50Lm1pbnV0ZXMgPSBNYXRoLmNlaWwoKGVsZW1lbnQubGVuZ3RoIC8gdG90YWxMZW5ndGgpICogMTQ0MClcclxuICAgIH0pXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPaywgc28gdG90YWxNaW51dGVzIGlzIG5vdyAxNDQwXHJcbiAgICAgKiBOb3cgd2UgbmVlZCB0byBjcmVhdGUgYSAuc3RhcnQgYW5kIC5lbmQgcG9pbnQgb24gYWxsXHJcbiAgICAgKiB0aGUgc2hhcGUgZWxlbWVudHNcclxuICAgICAqL1xyXG5cclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaSkge1xyXG4gICAgICBpZihpID09PSAwKSBlbGVtZW50LnN0YXJ0ID0gMFxyXG4gICAgICBlbHNlIGlmKGkgPiAwKSBlbGVtZW50LnN0YXJ0ID0gc2hhcGVbaS0xXS5lbmRcclxuICAgICAgZWxlbWVudC5lbmQgPSBlbGVtZW50LnN0YXJ0ICsgZWxlbWVudC5taW51dGVzXHJcbiAgICB9KVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIHN0YXJ0UG9pbnRzIGFuZCBlbmRQb2ludHNcclxuICAgICAqIEZpcnN0IHBvaW50IGlzIGNlbnRlclxyXG4gICAgICogVGhlIHBvaW50IG9ubHkgY2hhbmdlcyBvbiBsaW5lLXNlZ21lbnRzXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgY2VudGVyID0ge1xyXG4gICAgICB4OmNoYXJ0LncvMixcclxuICAgICAgeTpjaGFydC5oLzJcclxuICAgIH1cclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaSkge1xyXG4gICAgICBpZihpID09PSAwKXtcclxuICAgICAgICBlbGVtZW50LnN0YXJ0UG9pbnQgPSBjZW50ZXJcclxuICAgICAgICBlbGVtZW50LmVuZFBvaW50ID0gY2VudGVyXHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICAgIGVsZW1lbnQuc3RhcnRQb2ludCA9IHNoYXBlW2ktMV0uZW5kUG9pbnRcclxuICAgICAgICBlbGVtZW50LmVuZFBvaW50ID0gc2hhcGVbaS0xXS5lbmRQb2ludFxyXG4gICAgICB9ZWxzZSBpZihlbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAgICAgZWxlbWVudC5zdGFydFBvaW50ID0gc2hhcGVbaS0xXS5lbmRQb2ludFxyXG4gICAgICB9XHJcbiAgICAgIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICBlbGVtZW50LmVuZFBvaW50ID0ge1xyXG4gICAgICAgICAgeDogZWxlbWVudC5zdGFydFBvaW50LnggKyBNYXRoLmNvcyhlbGVtZW50LnN0YXJ0QW5nbGUpICogZWxlbWVudC5sZW5ndGgsXHJcbiAgICAgICAgICB5OiBlbGVtZW50LnN0YXJ0UG9pbnQueSArIE1hdGguc2luKGVsZW1lbnQuc3RhcnRBbmdsZSkgKiBlbGVtZW50Lmxlbmd0aFxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICAvKipcclxuICAgICAqIENlbnRlciB0aGUgc2hhcGVcclxuICAgICAqL1xyXG5cclxuICAgIHZhciBsaW1pdHMgPSB7fVxyXG4gICAgZnVuY3Rpb24gcHVzaExpbWl0cyhwb2ludCl7XHJcbiAgICAgIGlmKE9iamVjdC5rZXlzKGxpbWl0cykubGVuZ3RoID09PSAwKXtcclxuICAgICAgICBsaW1pdHMgPSB7XHJcbiAgICAgICAgICB1cDogcG9pbnQueSxcclxuICAgICAgICAgIGRvd246IHBvaW50LnksXHJcbiAgICAgICAgICBsZWZ0OiBwb2ludC54LFxyXG4gICAgICAgICAgcmlnaHQ6IHBvaW50LnhcclxuICAgICAgICB9XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIGlmKHBvaW50LnkgPCBsaW1pdHMudXApIGxpbWl0cy51cCA9IHBvaW50LnlcclxuICAgICAgICBpZihwb2ludC55ID4gbGltaXRzLmRvd24pIGxpbWl0cy5kb3duID0gcG9pbnQueVxyXG4gICAgICAgIGlmKHBvaW50LnggPCBsaW1pdHMubGVmdCkgbGltaXRzLmxlZnQgPSBwb2ludC54XHJcbiAgICAgICAgaWYocG9pbnQueCA+IGxpbWl0cy5yaWdodCkgbGltaXRzLnJpZ2h0ID0gcG9pbnQueFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgcHVzaExpbWl0cyhlbGVtZW50LnN0YXJ0UG9pbnQpXHJcbiAgICAgIHB1c2hMaW1pdHMoZWxlbWVudC5lbmRQb2ludClcclxuICAgIH0pXHJcblxyXG4gICAgLy8gd2UgbmVlZCB0byBrbm93IHRoZSBkaXN0YW5jZXMgdG8gdGhlIGVkZ2Ugb2YgdGhlIGNhbnZhc1xyXG4gICAgbGltaXRzLmRvd24gPSBjaGFydC5oIC0gbGltaXRzLmRvd25cclxuICAgIGxpbWl0cy5yaWdodCA9IGNoYXJ0LncgLSBsaW1pdHMucmlnaHRcclxuXHJcbiAgICAvLyB0aGUgZGlzdGFuY2VzIHNob3VsZCBiZSBlcXVhbCwgdGhlcmVmb3JlLCBzaGlmdCB0aGUgcG9pbnRzXHJcbiAgICAvLyBpZiBpdCBpcyBub3RcclxuICAgIHZhciBzaGlmdExlZnQgPSAobGltaXRzLmxlZnQgLSBsaW1pdHMucmlnaHQpIC8gMlxyXG4gICAgdmFyIHNoaWZ0VXAgPSAobGltaXRzLnVwIC0gbGltaXRzLmRvd24pIC8gMlxyXG4gICAgXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgZWxlbWVudC5zdGFydFBvaW50ID0ge1xyXG4gICAgICAgIHg6IGVsZW1lbnQuc3RhcnRQb2ludC54IC0gc2hpZnRMZWZ0LFxyXG4gICAgICAgIHk6IGVsZW1lbnQuc3RhcnRQb2ludC55IC0gc2hpZnRVcFxyXG4gICAgICB9XHJcbiAgICAgIGVsZW1lbnQuZW5kUG9pbnQgPSB7XHJcbiAgICAgICAgeDogZWxlbWVudC5lbmRQb2ludC54IC0gc2hpZnRMZWZ0LFxyXG4gICAgICAgIHk6IGVsZW1lbnQuZW5kUG9pbnQueSAtIHNoaWZ0VXBcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICByZXR1cm4gc2hhcGVcclxuICB9XHJcblxyXG4gICIsIi8qXHJcbipcclxuKiBTaGFwZSBtb2R1bGVcclxuKlxyXG4qL1xyXG5cclxudmFyIHNoYXBlcyA9IHJlcXVpcmUoJy4vc2hhcGVzJylcclxudmFyIGNhbGN1bGF0ZVNoYXBlID0gcmVxdWlyZSgnLi9jYWxjdWxhdGVTaGFwZScpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG4gIHZhciBjdXJyZW50U2hhcGVcclxuXHJcbiAgTmFwY2hhcnQub24oJ2luaXRpYWxpemUnLCBmdW5jdGlvbihjaGFydCkge1xyXG4gICAgICBzZXRTaGFwZShjaGFydCwgY2hhcnQuY29uZmlnLnNoYXBlKVxyXG4gICAgICAvLyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubG9nbycpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIC8vICAgY2hhbmdlU2hhcGUoY2hhcnQpXHJcbiAgICAgIC8vIH0pXHJcbiAgfSlcclxuXHJcbiAgTmFwY2hhcnQub24oJ3NldFNoYXBlJywgc2V0U2hhcGUpIFxyXG5cclxuICAvLyBhZGQgc29tZSBleHRyYSBoZWxwZXJzXHJcbiAgdmFyIHNoYXBlSGVscGVycyA9IHJlcXVpcmUoJy4vc2hhcGVIZWxwZXJzJykoTmFwY2hhcnQpXHJcblxyXG4gIGZ1bmN0aW9uIHNldFNoYXBlKGNoYXJ0LCBzaGFwZSkge1xyXG4gICAgaWYodHlwZW9mIHNoYXBlID09ICdzdHJpbmcnKXtcclxuICAgICAgY3VycmVudFNoYXBlID0gc2hhcGVcclxuICAgICAgc2hhcGUgPSBzaGFwZXNbc2hhcGVdXHJcbiAgICB9XHJcblxyXG4gICAgY2hhcnQuc2hhcGUgPSBjYWxjdWxhdGVTaGFwZShjaGFydCwgc2hhcGUpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGFuZ2VTaGFwZShjaGFydCkge1xyXG4gICAgLy8gaWYoY3VycmVudFNoYXBlID09PSAnc21pc2xlJyl7XHJcbiAgICAvLyAgIGNoYXJ0LmFuaW1hdGVTaGFwZShzaGFwZXNbJ2NpcmNsZSddKVxyXG4gICAgLy8gICBjdXJyZW50U2hhcGUgPSAnY2lyY2xlJ1xyXG4gICAgLy8gfVxyXG4gICAgLy8gY2hhcnQuYW5pbWF0ZVNoYXBlKHNoYXBlc1snaG9yaXpvbnRhbEVsbGlwc2UnXSlcclxuICAgIHZhciBuZXh0ID0gZmFsc2VcclxuICAgIGZvcihwcm9wIGluIHNoYXBlcyl7XHJcbiAgICAgIGlmKG5leHQpe1xyXG4gICAgICAgIGNoYXJ0LmFuaW1hdGVTaGFwZShzaGFwZXNbcHJvcF0pXHJcbiAgICAgICAgY3VycmVudFNoYXBlID0gcHJvcFxyXG4gICAgICAgIG5leHQgPSBmYWxzZVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIGlmKGN1cnJlbnRTaGFwZSA9PT0gcHJvcCl7XHJcbiAgICAgICAgbmV4dCA9IHRydWVcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYobmV4dCA9PT0gdHJ1ZSl7XHJcbiAgICAgIGNoYXJ0LmFuaW1hdGVTaGFwZShzaGFwZXNbJ2NpcmNsZSddKVxyXG4gICAgICBjdXJyZW50U2hhcGUgPSAnY2lyY2xlJ1xyXG4gICAgfVxyXG5cclxuICAgIGNoYXJ0LnJlZHJhdygpXHJcbiAgfVxyXG5cclxuXHJcbn1cclxuIiwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5hcGNoYXJ0KSB7XHJcbiAgXHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gIGhlbHBlcnMuWFl0b0luZm8gPSBmdW5jdGlvbiAoY2hhcnQsIHgsIHkpe1xyXG4gICAgLy8gd2lsbCBnYXRoZXIgdHdvIHRoaW5nczogbWludXRlcyBhbmQgZGlzdGFuY2UgZnJvbSBiYXNlcG9pbnRcclxuICAgIHZhciBtaW51dGVzLCBkaXN0YW5jZVxyXG4gICAgdmFyIHNoYXBlID0gY2hhcnQuc2hhcGVcclxuXHJcbiAgICAvLyB3aGljaCBoYXMgaW4gc2VjdG9yP1xyXG4gICAgdmFyIGVsZW1lbnRzSW5TZWN0b3IgPSBbXVxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LGkpIHtcclxuICAgICAgaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgdmFyIGFuZ2xlID0gaGVscGVycy5hbmdsZUJldHdlZW5Ud29Qb2ludHMoeCwgeSwgZWxlbWVudC5zdGFydFBvaW50KVxyXG4gICAgICAgIGlmKGFuZ2xlID4gZWxlbWVudC5zdGFydEFuZ2xlICYmIGFuZ2xlIDwgZWxlbWVudC5lbmRBbmdsZSl7XHJcbiAgICAgICAgICBlbGVtZW50c0luU2VjdG9yLnB1c2goZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICB2YXIgYW5nbGUxID0gaGVscGVycy5hbmdsZUJldHdlZW5Ud29Qb2ludHMoeCwgeSwgZWxlbWVudC5zdGFydFBvaW50KVxyXG4gICAgICAgIHZhciBhbmdsZTIgPSBoZWxwZXJzLmFuZ2xlQmV0d2VlblR3b1BvaW50cyh4LCB5LCBlbGVtZW50LmVuZFBvaW50KVxyXG5cclxuICAgICAgICAgIGlmKGkgPT0gMSl7XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2coYW5nbGUxLCBlbGVtZW50LnN0YXJ0QW5nbGUsIGVsZW1lbnQuc3RhcnRBbmdsZSArIE1hdGguUEkvMilcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGhlbHBlcnMuaXNJbnNpZGVBbmdsZShhbmdsZTEsIGVsZW1lbnQuc3RhcnRBbmdsZSwgZWxlbWVudC5zdGFydEFuZ2xlICsgTWF0aC5QSS8yKSlcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGFuZ2xlMiwgZWxlbWVudC5zdGFydEFuZ2xlIC0gTWF0aC5QSS8yLCBlbGVtZW50LnN0YXJ0QW5nbGUpXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhoZWxwZXJzLmlzSW5zaWRlQW5nbGUoYW5nbGUyLCBlbGVtZW50LnN0YXJ0QW5nbGUgLSBNYXRoLlBJLzIsIGVsZW1lbnQuc3RhcnRBbmdsZSkpXHJcbiAgICAgICAgICB9IFxyXG4gICAgICAgIGlmKGhlbHBlcnMuaXNJbnNpZGVBbmdsZShhbmdsZTEsIGVsZW1lbnQuc3RhcnRBbmdsZSwgZWxlbWVudC5zdGFydEFuZ2xlICsgTWF0aC5QSS8yKSAmJlxyXG4gICAgICAgICAgaGVscGVycy5pc0luc2lkZUFuZ2xlKGFuZ2xlMiwgZWxlbWVudC5zdGFydEFuZ2xlIC0gTWF0aC5QSS8yLCBlbGVtZW50LnN0YXJ0QW5nbGUpKXtcclxuICAgICAgICAgIGVsZW1lbnRzSW5TZWN0b3IucHVzaChlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBmaW5kIHRoZSBjbG9zZXN0XHJcbiAgICAvLyB0aGlzIGlzIG9ubHkgdXNlZnVsIGlmIHRoZSBzaGFwZSBnb2VzIGFyb3VuZCBpdHNlbGYgKGV4YW1wbGU6IHNwaXJhbClcclxuICAgIHZhciBzaGFwZUVsZW1lbnRcclxuICAgIGVsZW1lbnRzSW5TZWN0b3IuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgIHZhciB0aGlzRGlzdGFuY2VcclxuICAgICAgaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgdGhpc0Rpc3RhbmNlID0gaGVscGVycy5kaXN0YW5jZSh4LCB5LCBlbGVtZW50LnN0YXJ0UG9pbnQpXHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICB0aGlzRGlzdGFuY2UgPSBoZWxwZXJzLmRpc3RhbmNlRnJvbVBvaW50VG9MaW5lKHgsIHksIGVsZW1lbnQuc3RhcnRQb2ludCwgZWxlbWVudC5lbmRQb2ludClcclxuICAgICAgfVxyXG4gICAgICBpZih0eXBlb2YgZGlzdGFuY2UgPT0gJ3VuZGVmaW5lZCcgfHwgdGhpc0Rpc3RhbmNlIDwgZGlzdGFuY2Upe1xyXG4gICAgICAgIGRpc3RhbmNlID0gdGhpc0Rpc3RhbmNlXHJcbiAgICAgICAgc2hhcGVFbGVtZW50ID0gZWxlbWVudFxyXG4gICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgcmVsYXRpdmUgcG9zaXRpb24gaW5zaWRlIHRoZSBlbGVtZW50XHJcbiAgICAvLyBhbmQgZmluZCBtaW51dGVzXHJcbiAgICB2YXIgcG9zaXRpb25JblNoYXBlRWxlbWVudFxyXG5cclxuICAgIGlmKHNoYXBlRWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgIHZhciBhbmdsZSA9IGhlbHBlcnMuYW5nbGVCZXR3ZWVuVHdvUG9pbnRzKHgsIHksIHNoYXBlRWxlbWVudC5zdGFydFBvaW50KVxyXG4gICAgICBwb3NpdGlvbkluU2hhcGVFbGVtZW50ID0gaGVscGVycy5nZXRQcm9ncmVzc0JldHdlZW5Ud29WYWx1ZXMoYW5nbGUsIHNoYXBlRWxlbWVudC5zdGFydEFuZ2xlLCBzaGFwZUVsZW1lbnQuZW5kQW5nbGUpXHJcbiAgICB9ZWxzZSBpZihzaGFwZUVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgdmFyIGEgPSBoZWxwZXJzLmRpc3RhbmNlRnJvbVBvaW50VG9MaW5lKHgsIHksIHNoYXBlRWxlbWVudC5zdGFydFBvaW50LCBzaGFwZUVsZW1lbnQuZW5kUG9pbnQpXHJcbiAgICAgIHZhciBiID0gaGVscGVycy5kaXN0YW5jZSh4LCB5LCBzaGFwZUVsZW1lbnQuc3RhcnRQb2ludClcclxuICAgICAgdmFyIGxlbmd0aCA9IE1hdGguc3FydChiKmIgLSBhKmEpXHJcbiAgICAgIHBvc2l0aW9uSW5TaGFwZUVsZW1lbnQgPSBsZW5ndGggLyBzaGFwZUVsZW1lbnQubGVuZ3RoXHJcbiAgICB9IFxyXG4gICAgXHJcbiAgICB2YXIgbWludXRlcyA9IGhlbHBlcnMucmFuZ2Uoc2hhcGVFbGVtZW50LnN0YXJ0LCBzaGFwZUVsZW1lbnQuZW5kKSAqIHBvc2l0aW9uSW5TaGFwZUVsZW1lbnQgKyBzaGFwZUVsZW1lbnQuc3RhcnRcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBtaW51dGVzOiBtaW51dGVzLFxyXG4gICAgICBkaXN0YW5jZTogZGlzdGFuY2UsXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBoZWxwZXJzLm1pbnV0ZXNUb1hZID0gZnVuY3Rpb24gKGNoYXJ0LCBtaW51dGVzLCByYWRpdXMpe1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gICAgdmFyIHNoYXBlID0gY2hhcnQuc2hhcGVcclxuXHJcbiAgICB2YXIgbWludXRlcyA9IGhlbHBlcnMubGltaXQobWludXRlcyk7XHJcbiAgICAvLyBGaW5kIG91dCB3aGljaCBzaGFwZUVsZW1lbnQgd2UgZmluZCBvdXIgcG9pbnQgaW5cclxuICAgIHZhciBzaGFwZUVsZW1lbnQgPSBzaGFwZS5maW5kKGZ1bmN0aW9uIChlbGVtZW50KXtcclxuICAgICAgcmV0dXJuIChtaW51dGVzID49IGVsZW1lbnQuc3RhcnQgJiYgbWludXRlcyA8PSBlbGVtZW50LmVuZClcclxuICAgIH0pXHJcbiAgICBpZih0eXBlb2Ygc2hhcGVFbGVtZW50ID09ICd1bmRlZmluZWQnKXtcclxuICAgICAgY29uc29sZS5sb2cobWludXRlcylcclxuICAgICAgY29uc29sZS5sb2coc2hhcGUuZmluZChmdW5jdGlvbiAoZWxlbWVudCl7XHJcbiAgICAgICAgY29uc29sZS5sb2coZWxlbWVudClcclxuICAgICAgICByZXR1cm4gKG1pbnV0ZXMgPj0gZWxlbWVudC5zdGFydCAmJiBtaW51dGVzIDw9IGVsZW1lbnQuZW5kKVxyXG4gICAgICB9KSlcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gRGVjaW1hbCB1c2VkIHRvIGNhbGN1bGF0ZSB3aGVyZSB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSBzaGFwZVxyXG4gICAgdmFyIHBvc2l0aW9uSW5TaGFwZSA9IChtaW51dGVzIC0gc2hhcGVFbGVtZW50LnN0YXJ0KSAvIHNoYXBlRWxlbWVudC5taW51dGVzXHJcblxyXG4gICAgaWYoc2hhcGVFbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcblxyXG4gICAgICB2YXIgYmFzZVBvaW50ID0ge1xyXG4gICAgICAgIHg6IHNoYXBlRWxlbWVudC5zdGFydFBvaW50LnggKyBNYXRoLmNvcyhzaGFwZUVsZW1lbnQuc3RhcnRBbmdsZSkgKiBwb3NpdGlvbkluU2hhcGUgKiBzaGFwZUVsZW1lbnQubGVuZ3RoLFxyXG4gICAgICAgIHk6IHNoYXBlRWxlbWVudC5zdGFydFBvaW50LnkgKyBNYXRoLnNpbihzaGFwZUVsZW1lbnQuc3RhcnRBbmdsZSkgKiBwb3NpdGlvbkluU2hhcGUgKiBzaGFwZUVsZW1lbnQubGVuZ3RoXHJcbiAgICAgIH1cclxuICAgICAgdmFyIHBvaW50ID0ge1xyXG4gICAgICAgIHg6IGJhc2VQb2ludC54ICsgTWF0aC5jb3Moc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUtTWF0aC5QSS8yKSAqIHJhZGl1cyxcclxuICAgICAgICB5OiBiYXNlUG9pbnQueSArIE1hdGguc2luKHNoYXBlRWxlbWVudC5zdGFydEFuZ2xlLU1hdGguUEkvMikgKiByYWRpdXNcclxuICAgICAgfVxyXG5cclxuICAgIH1lbHNlIGlmIChzaGFwZUVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG5cclxuICAgICAgdmFyIGNlbnRlck9mQXJjID0gc2hhcGVFbGVtZW50LnN0YXJ0UG9pbnQ7XHJcbiAgICAgIHZhciBhbmdsZSA9IHBvc2l0aW9uSW5TaGFwZSAqIHNoYXBlRWxlbWVudC5yYWRpYW5zXHJcbiAgICAgIHZhciBwb2ludCA9IHtcclxuICAgICAgICB4OiBjZW50ZXJPZkFyYy54ICsgTWF0aC5jb3Moc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUgKyBhbmdsZSAtTWF0aC5QSS8yKSAqIHJhZGl1cyxcclxuICAgICAgICB5OiBjZW50ZXJPZkFyYy55ICsgTWF0aC5zaW4oc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUgKyBhbmdsZSAtTWF0aC5QSS8yKSAqIHJhZGl1c1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwb2ludFxyXG4gIH1cclxuXHJcbiAgaGVscGVycy5jcmVhdGVDdXJ2ZSA9IGZ1bmN0aW9uIGNyZWF0ZUN1cnZlKGNoYXJ0LCBzdGFydCwgZW5kLCByYWRpdXMsIGFudGljbG9ja3dpc2Upe1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG5cclxuICAgIGlmKHR5cGVvZiBhbnRpY2xvY2t3aXNlID09ICd1bmRlZmluZWQnKXtcclxuICAgICAgdmFyIGFudGljbG9ja3dpc2UgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2hhcGUgPSBjaGFydC5zaGFwZS5zbGljZSgpO1xyXG4gICAgaWYoYW50aWNsb2Nrd2lzZSl7XHJcbiAgICAgIHNoYXBlLnJldmVyc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaW5kIG91dCB3aGljaCBzaGFwZUVsZW1lbnQgaGFzIHRoZSBzdGFydCBhbmQgZW5kXHJcbiAgICB2YXIgc3RhcnRFbGVtZW50SW5kZXgsIGVuZEVsZW1lbnRJbmRleFxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpKSB7XHJcbiAgICAgIGlmKGhlbHBlcnMuaXNJbnNpZGUoc3RhcnQsIGVsZW1lbnQuc3RhcnQsIGVsZW1lbnQuZW5kKSl7XHJcbiAgICAgICAgc3RhcnRFbGVtZW50SW5kZXggPSBpXHJcbiAgICAgIH1cclxuICAgICAgaWYoaGVscGVycy5pc0luc2lkZShlbmQsIGVsZW1lbnQuc3RhcnQsIGVsZW1lbnQuZW5kKSl7XHJcbiAgICAgICAgZW5kRWxlbWVudEluZGV4ID0gaTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIFxyXG4gICAgdmFyIHNoYXBlRWxlbWVudHMgPSBbXVxyXG4gICAgLy8gY3JlYXRlIGl0ZXJhYmxlIHRhc2sgYXJyYXlcclxuICAgIHZhciB0YXNrQXJyYXkgPSBbXTtcclxuICAgIHZhciBza2lwRW5kQ2hlY2sgPSBmYWxzZTtcclxuICAgIHZhciBkZWZhdWx0VGFzaztcclxuICAgIGlmKGFudGljbG9ja3dpc2Upe1xyXG4gICAgICBkZWZhdWx0VGFzayA9IHtcclxuICAgICAgICBzdGFydDogMSxcclxuICAgICAgICBlbmQ6IDBcclxuICAgICAgfVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIGRlZmF1bHRUYXNrID0ge1xyXG4gICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgIGVuZDogMVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0RWxlbWVudEluZGV4OyBpIDwgc2hhcGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIHRhc2sgPSB7XHJcbiAgICAgICAgc2hhcGVFbGVtZW50OiBzaGFwZVtpXSxcclxuICAgICAgICBzdGFydDogZGVmYXVsdFRhc2suc3RhcnQsXHJcbiAgICAgICAgZW5kOiBkZWZhdWx0VGFzay5lbmRcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYoaSA9PSBzdGFydEVsZW1lbnRJbmRleCl7XHJcbiAgICAgICAgdGFzay5zdGFydCA9IGhlbHBlcnMuZ2V0UG9zaXRpb25CZXR3ZWVuVHdvVmFsdWVzKHN0YXJ0LHNoYXBlW2ldLnN0YXJ0LHNoYXBlW2ldLmVuZCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYoaSA9PSBlbmRFbGVtZW50SW5kZXgpe1xyXG4gICAgICAgIHRhc2suZW5kID0gaGVscGVycy5nZXRQb3NpdGlvbkJldHdlZW5Ud29WYWx1ZXMoZW5kLHNoYXBlW2ldLnN0YXJ0LHNoYXBlW2ldLmVuZCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYoaSA9PSBzdGFydEVsZW1lbnRJbmRleCAmJiBpID09IGVuZEVsZW1lbnRJbmRleCAmJiAodGFzay5lbmQgPiB0YXNrLnN0YXJ0ICYmIGFudGljbG9ja3dpc2UpIHx8ICh0YXNrLmVuZCA8IHRhc2suc3RhcnQgJiYgIWFudGljbG9ja3dpc2UpKXtcclxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhpbmdzIGFyZSBjb3JyZWN0IHdoZW4gZW5kIGlzIGxlc3MgdGhhbiBzdGFydFxyXG4gICAgICAgIGlmKHRhc2tBcnJheS5sZW5ndGggPT0gMCl7XHJcbiAgICAgICAgICAvLyBpdCBpcyBiZWdpbm5pbmdcclxuICAgICAgICAgIHRhc2suZW5kID0gZGVmYXVsdFRhc2suZW5kO1xyXG4gICAgICAgICAgc2tpcEVuZENoZWNrID0gdHJ1ZTtcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAvLyBpdCBpcyBlbmRcclxuICAgICAgICAgIHRhc2suc3RhcnQgPSBkZWZhdWx0VGFzay5zdGFydDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRhc2tBcnJheS5wdXNoKHRhc2spO1xyXG5cclxuICAgICAgaWYoaSA9PSBlbmRFbGVtZW50SW5kZXgpe1xyXG4gICAgICAgIGlmKHNraXBFbmRDaGVjayl7XHJcbiAgICAgICAgICBza2lwRW5kQ2hlY2sgPSBmYWxzZTtcclxuICAgICAgICAgIC8vIGxldCBpdCBydW4gYSByb3VuZCBhbmQgYWRkIGFsbCBzaGFwZXNcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgIC8vIGZpbmlzaGVkLi4gbm90aGluZyBtb3JlIHRvIGRvIGhlcmUhXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGlmIHdlIHJlYWNoZWQgZW5kIG9mIGFycmF5IHdpdGhvdXQgaGF2aW5nIGZvdW5kXHJcbiAgICAgIC8vIHRoZSBlbmQgcG9pbnQsIGl0IG1lYW5zIHRoYXQgd2UgaGF2ZSB0byBnbyB0b1xyXG4gICAgICAvLyB0aGUgYmVnaW5uaW5nIGFnYWluXHJcbiAgICAgIC8vIGV4LiB3aGVuIHN0YXJ0OjcwMCBlbmQ6MzAwXHJcbiAgICAgIGlmKGkgPT0gc2hhcGUubGVuZ3RoLTEpe1xyXG4gICAgICAgIGkgPSAtMTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGFza0FycmF5LmZvckVhY2goZnVuY3Rpb24odGFzaywgaSkge1xyXG4gICAgICB2YXIgc2hhcGVFbGVtZW50ID0gdGFzay5zaGFwZUVsZW1lbnQ7XHJcbiAgICAgIGlmKHNoYXBlRWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgdmFyIHNoYXBlU3RhcnQgPSBzaGFwZUVsZW1lbnQuc3RhcnRBbmdsZS0oTWF0aC5QSS8yKTtcclxuICAgICAgICB2YXIgc3RhcnQgPSBzaGFwZVN0YXJ0ICsgKHRhc2tBcnJheVtpXS5zdGFydCAqIHNoYXBlRWxlbWVudC5yYWRpYW5zKTtcclxuICAgICAgICB2YXIgZW5kID0gc2hhcGVTdGFydCArICh0YXNrQXJyYXlbaV0uZW5kICogc2hhcGVFbGVtZW50LnJhZGlhbnMpO1xyXG4gICAgICAgIGN0eC5hcmMoc2hhcGVFbGVtZW50LnN0YXJ0UG9pbnQueCwgc2hhcGVFbGVtZW50LnN0YXJ0UG9pbnQueSwgcmFkaXVzLCBzdGFydCwgZW5kLCBhbnRpY2xvY2t3aXNlKTtcclxuICAgICAgfWVsc2UgaWYoc2hhcGVFbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAgICAgdmFyIHN0YXJ0UG9pbnQgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LHNoYXBlRWxlbWVudC5zdGFydCArIHNoYXBlRWxlbWVudC5taW51dGVzICogdGFzay5zdGFydCwgcmFkaXVzKVxyXG4gICAgICAgIHZhciBlbmRQb2ludCA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsc2hhcGVFbGVtZW50LnN0YXJ0ICsgc2hhcGVFbGVtZW50Lm1pbnV0ZXMgKiB0YXNrLmVuZCwgcmFkaXVzKVxyXG4gICAgICAgIGN0eC5saW5lVG8oc3RhcnRQb2ludC54LHN0YXJ0UG9pbnQueSlcclxuICAgICAgICBjdHgubGluZVRvKGVuZFBvaW50LngsZW5kUG9pbnQueSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGhlbHBlcnMuY3JlYXRlU2VnbWVudCA9IGZ1bmN0aW9uIChjaGFydCwgb3V0ZXIsIGlubmVyLCBzdGFydCwgZW5kKSB7XHJcbiAgICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIE5hcGNoYXJ0LmhlbHBlcnMuY3JlYXRlQ3VydmUoY2hhcnQsIHN0YXJ0LCBlbmQsIG91dGVyKVxyXG4gICAgTmFwY2hhcnQuaGVscGVycy5jcmVhdGVDdXJ2ZShjaGFydCwgZW5kLCBzdGFydCwgaW5uZXIsIHRydWUpXHJcbiAgICBjdHguY2xvc2VQYXRoKClcclxuICB9XHJcblxyXG59XHJcbiIsIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgY2lyY2xlOiBbXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdhcmMnLFxyXG4gICAgICB2YWx1ZTogTWF0aC5QSSoyXHJcbiAgICB9LFxyXG4gIF0sXHJcbiAgbGluZTogW1xyXG4gICAge1xyXG4gICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgIHZhbHVlOiAxMDBcclxuICAgIH0sXHJcbiAgXSxcclxuICBob3Jpem9udGFsRWxsaXBzZTogW1xyXG4gICAge1xyXG4gICAgICB0eXBlOiAnYXJjJyxcclxuICAgICAgdmFsdWU6IE1hdGguUEkgLyA0XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgIHZhbHVlOiAyMFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2FyYycsXHJcbiAgICAgIHZhbHVlOiBNYXRoLlBJXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgIHZhbHVlOiAyMFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2FyYycsXHJcbiAgICAgIHZhbHVlOiBNYXRoLlBJICogMyAvIDRcclxuICAgIH1cclxuICBdLFxyXG4gIHNtaWxlOiBbXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdhcmMnLFxyXG4gICAgICB2YWx1ZTogTWF0aC5QSVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICB2YWx1ZTogMTUwXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnYXJjJyxcclxuICAgICAgdmFsdWU6IE1hdGguUElcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgdmFsdWU6IDE1MFxyXG4gICAgfVxyXG4gIF0sXHJcbiAgLy8gdmVydGljYWxFbGxpcHNlOiBbXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdhcmMnLFxyXG4gIC8vICAgICB2YWx1ZTogTWF0aC5QSS8yXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnbGluZScsXHJcbiAgLy8gICAgIHZhbHVlOiAxNTBcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdhcmMnLFxyXG4gIC8vICAgICB2YWx1ZTogTWF0aC5QSVxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2xpbmUnLFxyXG4gIC8vICAgICB2YWx1ZTogMTUwXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnYXJjJyxcclxuICAvLyAgICAgdmFsdWU6IE1hdGguUEkvMlxyXG4gIC8vICAgfVxyXG4gIC8vIF0sXHJcbiAgLy8gZnVja2VkOiBbXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdhcmMnLFxyXG4gIC8vICAgICB2YWx1ZTogTWF0aC5QSS8yKjNcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdsaW5lJyxcclxuICAvLyAgICAgdmFsdWU6IDEwMFxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2FyYycsXHJcbiAgLy8gICAgIHZhbHVlOiBNYXRoLlBJLzJcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdsaW5lJyxcclxuICAvLyAgICAgdmFsdWU6IDEwMFxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2FyYycsXHJcbiAgLy8gICAgIHZhbHVlOiBNYXRoLlBJLzJcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdsaW5lJyxcclxuICAvLyAgICAgdmFsdWU6IDUwXHJcbiAgLy8gICB9LFxyXG4gIC8vIF1cclxufSIsIlxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIE5hcGNoYXJ0LmNvbmZpZy5kZWZhdWx0VHlwZXM9IHtcclxuICAgICAgc2xlZXA6IHtcclxuICAgICAgICBzdHlsZTogJ3JlZCcsXHJcbiAgICAgICAgbm9TY2FsZTogdHJ1ZSxcclxuICAgICAgICBsYW5lOiAzXHJcbiAgICAgIH0sXHJcbiAgICAgIGJ1c3k6IHtcclxuICAgICAgICBzdHlsZTogJ2JsdWUnLFxyXG4gICAgICAgIG5vU2NhbGU6IHRydWUsXHJcbiAgICAgICAgbGFuZTogMSxcclxuICAgICAgfSxcclxuICAgICAgZGVmYXVsdDoge1xyXG4gICAgICBcdHN0eWxlOiAnYmxhY2snLFxyXG4gICAgICBcdG5vU2NhbGU6IHRydWUsXHJcbiAgICAgIFx0bGFuZTogMlxyXG4gICAgICB9XHJcbiAgfVxyXG59Il19
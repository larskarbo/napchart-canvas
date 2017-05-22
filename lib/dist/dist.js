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

  Napchart.init = function (ctx, config) {
    
    // methods of instance:

    var chart = {
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
        
        redraw(this)
      },

      setShape: function(shape) {
        // fireHook('setShape', this, shape)
        // fireHook('dataChange', this)
      },

      animateShape: function(shape) {
        // fireHook('setShape', this, shape)
        // fireHook('dataChange', this)

        // fireHook('animateShape', this, shape)
      },

      addElement: function(typeString) {
        var defaultElement = {
          start:120,
          end:210,
          typeString:'default'
        }
        var newElement = initElement(defaultElement, this)
        this.data.elements.push(newElement)
        this.deselect()
        this.setSelected(newElement)
        
        redraw(this)
      },

      setElements: function(elements) {
        var chart = this
        elements = elements.map(function(element) {
          return initElement(element, chart)
        })
        this.data.elements = elements;
        
        redraw(this)
      },

      updateElements: function(elements) {
        this.data.elements = elements;
        
        redraw(this)
      },

      updateElement:function(element) {
        // don't need to actually run this code because the element
        // is already changed lol we were too late...

        // var target = this.data.elements.find(function(el) {
        //   return (el.id == element.id)
        // })
        // target = element

        redraw(this)
      },

      benchmark: function() {
        fireHook('benchmark', this)
      },

      // setConfig: function(config) {
      //   // Napchart.config = config
      //   chart.config = config
      //   scaleConfig(chart.config, chart.ratio)
      //   this.redraw()
      // },

      // this function should only be used externally
      // by for example react to update it
      addListener: function(listener) {
        chart.listeners.push(listener)
      },

      // this function should only be used by a listener
      // to update napchart
      update: function(data) {
        chart.data = data
        redrawWithoutNotifying(chart)
      }
    };

    // properties of instance:

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
    chart.listeners = []


    scaleConfig(chart.config, chart.ratio)
    addDefaultTypes(chart)
    populateTypes(chart)

    // initialize:
    Napchart.shape.init(chart)
    Napchart.draw.init(chart)
    Napchart.interactCanvas.init(chart)

    return chart
  }

  // private

  function redraw(chart) {
    console.log('redraw')

    chart.listeners.forEach(function(listener) {
      listener(chart)
    })
  }

  function redrawWithoutNotifying(chart) {
    console.log('redrawFromreact')

    window.requestAnimationFrame(function() {
      Napchart.draw.drawFrame(chart)
    })
  }

  function initConfig(config) {
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

    // ** add text property if not exists

    if(typeof element.text == 'undefined'){
      element.text = ""
    }

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

  Napchart.draw = {
    init: draw,
    drawFrame: draw,
    benchmark: benchmark
  }

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
/* global window: false */
/* global document: false */
'use strict'

module.exports = function (Chart) {
  // Global Chart helpers object for utility methods and classes
  var helpers = Chart.helpers = {}

  helpers.requestAnimationFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

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

},{}],13:[function(require,module,exports){
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
// require('./animation')(Napchart)

module.exports = window.Napchart
},{"./config":1,"./core":2,"./draw/canvasHelpers":3,"./draw/draw":7,"./helpers":12,"./interactCanvas/interactCanvas":14,"./shape/shape":16,"./types":19}],14:[function(require,module,exports){
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
    }
  }

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

    
    chart.updateElement(originElement)

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

  Napchart.shape = {
    init: function(chart) {
        setShape(chart, chart.config.shape)
    },
    setShape: setShape
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
},{}],19:[function(require,module,exports){

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
},{}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvY2hhcnQvY29uZmlnLmpzIiwibGliL2NoYXJ0L2NvcmUuanMiLCJsaWIvY2hhcnQvZHJhdy9jYW52YXNIZWxwZXJzLmpzIiwibGliL2NoYXJ0L2RyYXcvY2xlYXIuanMiLCJsaWIvY2hhcnQvZHJhdy9jb250ZW50L2JhcnMuanMiLCJsaWIvY2hhcnQvZHJhdy9jb250ZW50L2hhbmRsZXMuanMiLCJsaWIvY2hhcnQvZHJhdy9kcmF3LmpzIiwibGliL2NoYXJ0L2RyYXcvZmFjZS9jaXJjbGVzLmpzIiwibGliL2NoYXJ0L2RyYXcvZmFjZS9saW5lcy5qcyIsImxpYi9jaGFydC9kcmF3L2ZhY2UvdGV4dC5qcyIsImxpYi9jaGFydC9kcmF3L3N0eWxlcy5qcyIsImxpYi9jaGFydC9oZWxwZXJzLmpzIiwibGliL2NoYXJ0L2luZGV4LmpzIiwibGliL2NoYXJ0L2ludGVyYWN0Q2FudmFzL2ludGVyYWN0Q2FudmFzLmpzIiwibGliL2NoYXJ0L3NoYXBlL2NhbGN1bGF0ZVNoYXBlLmpzIiwibGliL2NoYXJ0L3NoYXBlL3NoYXBlLmpzIiwibGliL2NoYXJ0L3NoYXBlL3NoYXBlSGVscGVycy5qcyIsImxpYi9jaGFydC9zaGFwZS9zaGFwZXMuanMiLCJsaWIvY2hhcnQvdHlwZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeG1DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1VEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIE5hcGNoYXJ0LmNvbmZpZyA9IHtcclxuICAgIGludGVyYWN0aW9uOiB0cnVlLFxyXG4gICAgc2hhcGU6ICdjaXJjbGUnLFxyXG4gICAgYmFzZVJhZGl1czozMixcclxuICAgIGZvbnQ6J2hlbHZldGljYScsXHJcbiAgICBsYXllcnM6WzE2LCAyMCwgMjgsIDM0LCAzOF0sXHJcbiAgICBsYW5lczpbXSwgLy8gd2lsbCBiZSBnZW5lcmF0ZWQgYmFzZWQgb24gdGhlIGxheWVycyBhcnJheVxyXG4gICAgZmFjZTogeyAvLyBkZWZpbmUgaG93IHRoZSBiYWNrZ3JvdW5kIGNsb2NrIHNob3VsZCBiZSBkcmF3blxyXG4gICAgICBzdHJva2U6IDAuMTUsXHJcbiAgICAgIHdlYWtTdHJva2VDb2xvcjogJyNkZGRkZGQnLFxyXG4gICAgICBzdHJva2VDb2xvcjogJyM3Nzc3NzcnLFxyXG4gICAgICBpbXBvcnRhbnRTdHJva2VDb2xvcjogJ2JsYWNrJyxcclxuICAgICAgaW1wb3J0YW50TGluZVdpZHRoOiAwLjMsXHJcbiAgICAgIG51bWJlcnM6IHtcclxuICAgICAgICByYWRpdXM6IDQwLFxyXG4gICAgICAgIGNvbG9yOiAnIzI2MjYyNicsXHJcbiAgICAgICAgc2l6ZTogMy4zXHJcbiAgICAgIH0sXHJcbiAgICAgIGZpdmVNaW51dGVTdHJva2VzTGVuZ3RoOiAwLFxyXG4gICAgICB0ZW5NaW51dGVTdHJva2VzTGVuZ3RoOiAwLjUsXHJcbiAgICAgIGhvdXJTdHJva2VzTGVuZ3RoOiAzLFxyXG4gICAgfSxcclxuXHRoYW5kbGVzQ2xpY2tEaXN0YW5jZTogNVxyXG4gIH1cclxufSIsIi8qXHJcbiogIENvcmUgbW9kdWxlIG9mIE5hcGNoYXJ0XHJcbipcclxuKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gIE5hcGNoYXJ0LmluaXQgPSBmdW5jdGlvbiAoY3R4LCBjb25maWcpIHtcclxuICAgIFxyXG4gICAgLy8gbWV0aG9kcyBvZiBpbnN0YW5jZTpcclxuXHJcbiAgICB2YXIgY2hhcnQgPSB7XHJcbiAgICAgIHNldEVsZW1lbnRTdGF0ZTogZnVuY3Rpb24oZWxlbWVudCwgc3RhdGUpIHtcclxuICAgICAgICB0aGlzLnJlbW92ZUVsZW1lbnRTdGF0ZXMoKVxyXG4gICAgICAgIGVsZW1lbnQuc3RhdGUgPSBzdGF0ZVxyXG5cclxuICAgICAgICB0aGlzLnJlZHJhdygpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICByZW1vdmVFbGVtZW50U3RhdGVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLmRhdGEuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgICAgICBkZWxldGUgZWxlbWVudC5zdGF0ZVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBzZXRTZWxlY3RlZDogZnVuY3Rpb24oZWxlbWVudCl7XHJcbiAgICAgICAgdGhpcy5kYXRhLnNlbGVjdGVkLnB1c2goZWxlbWVudClcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGlzU2VsZWN0ZWQ6IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgICBpZih0aGlzLmRhdGEuc2VsZWN0ZWQuaW5kZXhPZihlbGVtZW50KSA+PSAwKXtcclxuICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgZGVzZWxlY3Q6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZGF0YS5zZWxlY3RlZCA9IFtdXHJcbiAgICAgICAgXHJcbiAgICAgICAgcmVkcmF3KHRoaXMpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBzZXRTaGFwZTogZnVuY3Rpb24oc2hhcGUpIHtcclxuICAgICAgICAvLyBmaXJlSG9vaygnc2V0U2hhcGUnLCB0aGlzLCBzaGFwZSlcclxuICAgICAgICAvLyBmaXJlSG9vaygnZGF0YUNoYW5nZScsIHRoaXMpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBhbmltYXRlU2hhcGU6IGZ1bmN0aW9uKHNoYXBlKSB7XHJcbiAgICAgICAgLy8gZmlyZUhvb2soJ3NldFNoYXBlJywgdGhpcywgc2hhcGUpXHJcbiAgICAgICAgLy8gZmlyZUhvb2soJ2RhdGFDaGFuZ2UnLCB0aGlzKVxyXG5cclxuICAgICAgICAvLyBmaXJlSG9vaygnYW5pbWF0ZVNoYXBlJywgdGhpcywgc2hhcGUpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBhZGRFbGVtZW50OiBmdW5jdGlvbih0eXBlU3RyaW5nKSB7XHJcbiAgICAgICAgdmFyIGRlZmF1bHRFbGVtZW50ID0ge1xyXG4gICAgICAgICAgc3RhcnQ6MTIwLFxyXG4gICAgICAgICAgZW5kOjIxMCxcclxuICAgICAgICAgIHR5cGVTdHJpbmc6J2RlZmF1bHQnXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBuZXdFbGVtZW50ID0gaW5pdEVsZW1lbnQoZGVmYXVsdEVsZW1lbnQsIHRoaXMpXHJcbiAgICAgICAgdGhpcy5kYXRhLmVsZW1lbnRzLnB1c2gobmV3RWxlbWVudClcclxuICAgICAgICB0aGlzLmRlc2VsZWN0KClcclxuICAgICAgICB0aGlzLnNldFNlbGVjdGVkKG5ld0VsZW1lbnQpXHJcbiAgICAgICAgXHJcbiAgICAgICAgcmVkcmF3KHRoaXMpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICBzZXRFbGVtZW50czogZnVuY3Rpb24oZWxlbWVudHMpIHtcclxuICAgICAgICB2YXIgY2hhcnQgPSB0aGlzXHJcbiAgICAgICAgZWxlbWVudHMgPSBlbGVtZW50cy5tYXAoZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgICAgcmV0dXJuIGluaXRFbGVtZW50KGVsZW1lbnQsIGNoYXJ0KVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdGhpcy5kYXRhLmVsZW1lbnRzID0gZWxlbWVudHM7XHJcbiAgICAgICAgXHJcbiAgICAgICAgcmVkcmF3KHRoaXMpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICB1cGRhdGVFbGVtZW50czogZnVuY3Rpb24oZWxlbWVudHMpIHtcclxuICAgICAgICB0aGlzLmRhdGEuZWxlbWVudHMgPSBlbGVtZW50cztcclxuICAgICAgICBcclxuICAgICAgICByZWRyYXcodGhpcylcclxuICAgICAgfSxcclxuXHJcbiAgICAgIHVwZGF0ZUVsZW1lbnQ6ZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICAgIC8vIGRvbid0IG5lZWQgdG8gYWN0dWFsbHkgcnVuIHRoaXMgY29kZSBiZWNhdXNlIHRoZSBlbGVtZW50XHJcbiAgICAgICAgLy8gaXMgYWxyZWFkeSBjaGFuZ2VkIGxvbCB3ZSB3ZXJlIHRvbyBsYXRlLi4uXHJcblxyXG4gICAgICAgIC8vIHZhciB0YXJnZXQgPSB0aGlzLmRhdGEuZWxlbWVudHMuZmluZChmdW5jdGlvbihlbCkge1xyXG4gICAgICAgIC8vICAgcmV0dXJuIChlbC5pZCA9PSBlbGVtZW50LmlkKVxyXG4gICAgICAgIC8vIH0pXHJcbiAgICAgICAgLy8gdGFyZ2V0ID0gZWxlbWVudFxyXG5cclxuICAgICAgICByZWRyYXcodGhpcylcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGJlbmNobWFyazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgZmlyZUhvb2soJ2JlbmNobWFyaycsIHRoaXMpXHJcbiAgICAgIH0sXHJcblxyXG4gICAgICAvLyBzZXRDb25maWc6IGZ1bmN0aW9uKGNvbmZpZykge1xyXG4gICAgICAvLyAgIC8vIE5hcGNoYXJ0LmNvbmZpZyA9IGNvbmZpZ1xyXG4gICAgICAvLyAgIGNoYXJ0LmNvbmZpZyA9IGNvbmZpZ1xyXG4gICAgICAvLyAgIHNjYWxlQ29uZmlnKGNoYXJ0LmNvbmZpZywgY2hhcnQucmF0aW8pXHJcbiAgICAgIC8vICAgdGhpcy5yZWRyYXcoKVxyXG4gICAgICAvLyB9LFxyXG5cclxuICAgICAgLy8gdGhpcyBmdW5jdGlvbiBzaG91bGQgb25seSBiZSB1c2VkIGV4dGVybmFsbHlcclxuICAgICAgLy8gYnkgZm9yIGV4YW1wbGUgcmVhY3QgdG8gdXBkYXRlIGl0XHJcbiAgICAgIGFkZExpc3RlbmVyOiBmdW5jdGlvbihsaXN0ZW5lcikge1xyXG4gICAgICAgIGNoYXJ0Lmxpc3RlbmVycy5wdXNoKGxpc3RlbmVyKVxyXG4gICAgICB9LFxyXG5cclxuICAgICAgLy8gdGhpcyBmdW5jdGlvbiBzaG91bGQgb25seSBiZSB1c2VkIGJ5IGEgbGlzdGVuZXJcclxuICAgICAgLy8gdG8gdXBkYXRlIG5hcGNoYXJ0XHJcbiAgICAgIHVwZGF0ZTogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNoYXJ0LmRhdGEgPSBkYXRhXHJcbiAgICAgICAgcmVkcmF3V2l0aG91dE5vdGlmeWluZyhjaGFydClcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvLyBwcm9wZXJ0aWVzIG9mIGluc3RhbmNlOlxyXG5cclxuICAgIGNoYXJ0LmN0eCA9IGN0eFxyXG4gICAgY2hhcnQuY2FudmFzID0gY3R4LmNhbnZhc1xyXG4gICAgY2hhcnQud2lkdGggPSBjaGFydC53ID0gY3R4LmNhbnZhcy53aWR0aFxyXG4gICAgY2hhcnQuaGVpZ2h0ID0gY2hhcnQuaCA9IGN0eC5jYW52YXMuaGVpZ2h0XHJcbiAgICBjaGFydC5yYXRpbyA9IGNoYXJ0LmggLyAxMDBcclxuICAgIGNoYXJ0LmNvbmZpZyA9IGluaXRDb25maWcoY29uZmlnKVxyXG4gICAgY2hhcnQuZGF0YSA9IHtcclxuICAgICAgZWxlbWVudHM6IFtdLFxyXG4gICAgICBzZWxlY3RlZDogW11cclxuICAgIH1cclxuICAgIGNoYXJ0LnR5cGVzID0ge31cclxuICAgIGNoYXJ0Lmxpc3RlbmVycyA9IFtdXHJcblxyXG5cclxuICAgIHNjYWxlQ29uZmlnKGNoYXJ0LmNvbmZpZywgY2hhcnQucmF0aW8pXHJcbiAgICBhZGREZWZhdWx0VHlwZXMoY2hhcnQpXHJcbiAgICBwb3B1bGF0ZVR5cGVzKGNoYXJ0KVxyXG5cclxuICAgIC8vIGluaXRpYWxpemU6XHJcbiAgICBOYXBjaGFydC5zaGFwZS5pbml0KGNoYXJ0KVxyXG4gICAgTmFwY2hhcnQuZHJhdy5pbml0KGNoYXJ0KVxyXG4gICAgTmFwY2hhcnQuaW50ZXJhY3RDYW52YXMuaW5pdChjaGFydClcclxuXHJcbiAgICByZXR1cm4gY2hhcnRcclxuICB9XHJcblxyXG4gIC8vIHByaXZhdGVcclxuXHJcbiAgZnVuY3Rpb24gcmVkcmF3KGNoYXJ0KSB7XHJcbiAgICBjb25zb2xlLmxvZygncmVkcmF3JylcclxuXHJcbiAgICBjaGFydC5saXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbihsaXN0ZW5lcikge1xyXG4gICAgICBsaXN0ZW5lcihjaGFydClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZWRyYXdXaXRob3V0Tm90aWZ5aW5nKGNoYXJ0KSB7XHJcbiAgICBjb25zb2xlLmxvZygncmVkcmF3RnJvbXJlYWN0JylcclxuXHJcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uKCkge1xyXG4gICAgICBOYXBjaGFydC5kcmF3LmRyYXdGcmFtZShjaGFydClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBpbml0Q29uZmlnKGNvbmZpZykge1xyXG4gICAgY29uZmlnID0gY29uZmlnIHx8IHt9XHJcbiAgICBjb25maWcgPSBoZWxwZXJzLmV4dGVuZChKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KE5hcGNoYXJ0LmNvbmZpZykpLCBjb25maWcpXHJcblxyXG4gICAgLy8gZ2VuZXJhdGUgbGFuZXNcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29uZmlnLmxheWVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZihpID09IDApIGNvbnRpbnVlO1xyXG5cclxuICAgICAgY29uZmlnLmxhbmVzLnB1c2goe1xyXG4gICAgICAgIHN0YXJ0OmNvbmZpZy5sYXllcnNbaS0xXSxcclxuICAgICAgICBlbmQ6Y29uZmlnLmxheWVyc1tpXVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjb25maWdcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGluaXRFbGVtZW50KGVsZW1lbnQsIGNoYXJ0KSB7XHJcblxyXG4gICAgLy8gKiogYXNzaWduIHR5cGUgYmFzZWQgb24gdHlwZVN0cmluZyB2YWx1ZVxyXG5cclxuICAgIGlmKHR5cGVvZiBlbGVtZW50LnR5cGVTdHJpbmcgPT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICBlbGVtZW50LnR5cGVTdHJpbmcgPSAnZGVmYXVsdCdcclxuICAgIH1cclxuICAgIHZhciB0eXBlID0gY2hhcnQudHlwZXNbZWxlbWVudC50eXBlU3RyaW5nXVxyXG5cclxuICAgIC8vIGNoZWNrIGlmIHR5cGUgZXhpc3RzXHJcbiAgICBpZih0eXBlb2YgdHlwZSA9PSAndW5kZWZpbmVkJyl7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgVHlwZSAke2VsZW1lbnQudHlwZVN0cmluZ30gZG9lcyBub3QgZXhpc3RgKVxyXG4gICAgfVxyXG4gICAgZWxlbWVudC50eXBlID0gY2hhcnQudHlwZXNbZWxlbWVudC50eXBlU3RyaW5nXVxyXG5cclxuICAgIC8vICoqIGFkZCBpZFxyXG5cclxuICAgIGVsZW1lbnQuaWQgPSBoZWxwZXJzLnVpZCgpXHJcblxyXG4gICAgLy8gKiogYWRkIHRleHQgcHJvcGVydHkgaWYgbm90IGV4aXN0c1xyXG5cclxuICAgIGlmKHR5cGVvZiBlbGVtZW50LnRleHQgPT0gJ3VuZGVmaW5lZCcpe1xyXG4gICAgICBlbGVtZW50LnRleHQgPSBcIlwiXHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGVsZW1lbnRcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNjYWxlQ29uZmlnIChjb25maWcsIHJhdGlvKSB7XHJcbiAgICBmdW5jdGlvbiBzY2FsZUZuIChiYXNlLCB2YWx1ZSwga2V5KSB7XHJcbiAgICAgIGlmKGJhc2Uubm9TY2FsZSl7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZiAodmFsdWUgPiAxIHx8IHZhbHVlIDwgMSB8fCB2YWx1ZSA9PT0gMSkge1xyXG4gICAgICAgIGJhc2Vba2V5XSA9IHZhbHVlICogcmF0aW9cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaGVscGVycy5kZWVwRWFjaChjb25maWcsIHNjYWxlRm4pXHJcbiAgICByZXR1cm4gY29uZmlnXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBhZGREZWZhdWx0VHlwZXMoY2hhcnQpIHtcclxuICAgIGNoYXJ0LnR5cGVzID0gY2hhcnQuY29uZmlnLmRlZmF1bHRUeXBlc1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcG9wdWxhdGVUeXBlcyhjaGFydCkge1xyXG4gICAgZm9yKHZhciB0eXBlbmFtZSBpbiBjaGFydC50eXBlcyl7XHJcbiAgICAgIHZhciB0eXBlID0gY2hhcnQudHlwZXNbdHlwZW5hbWVdXHJcbiAgICAgIHR5cGUubGFuZSA9IGNoYXJ0LmNvbmZpZy5sYW5lc1t0eXBlLmxhbmVdXHJcbiAgICAgIHR5cGUuc3R5bGUgPSBOYXBjaGFydC5zdHlsZXNbdHlwZS5zdHlsZV1cclxuICAgIH1cclxuICB9XHJcbn1cclxuIiwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVycztcclxuXHJcblxyXG4gIGhlbHBlcnMuc3Ryb2tlU2VnbWVudCA9IGZ1bmN0aW9uKGNoYXJ0LCBzdGFydCwgZW5kLCBjb25maWcpe1xyXG4gIFx0dmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gIFx0Y3R4LnNhdmUoKVxyXG4gIFx0Y3R4LnN0cm9rZVN0eWxlID0gY29uZmlnLmNvbG9yXHJcbiAgXHRjdHgubGluZVdpZHRoID0gY2hhcnQuY29uZmlnLmJhcnMuZ2VuZXJhbC5zdHJva2UubGluZVdpZHRoXHJcbiAgXHRjdHgubGluZUpvaW4gPSAnbWl0dGVsJ1xyXG5cclxuICBcdGhlbHBlcnMuY3JlYXRlU2VnbWVudChjaGFydCwgY29uZmlnLm91dGVyUmFkaXVzLCBjb25maWcuaW5uZXJSYWRpdXMsIHN0YXJ0LCBlbmQpO1xyXG5cclxuICBcdGN0eC5zdHJva2UoKTtcclxuICBcdGN0eC5yZXN0b3JlKClcclxuICB9XHJcblxyXG4gIGhlbHBlcnMuY2lyY2xlID0gZnVuY3Rpb24oY2hhcnQsIHBvaW50LCByYWRpdXMpe1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gICAgY3R4LmJlZ2luUGF0aCgpXHJcbiAgICBjdHguYXJjKHBvaW50LngsIHBvaW50LnksIHJhZGl1cywgMCwgTWF0aC5QSSoyKVxyXG4gICAgY3R4LmNsb3NlUGF0aCgpXHJcbiAgfVxyXG5cclxuICBoZWxwZXJzLmNyZWF0ZUZvbnRTdHJpbmcgPSBmdW5jdGlvbihjaGFydCwgc2l6ZSkge1xyXG4gICAgcmV0dXJuIHNpemUgKyAncHggJyArIGNoYXJ0LmNvbmZpZy5mb250XHJcbiAgfVxyXG5cclxufSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYXJ0LCBOYXBjaGFydCkge1xyXG4gIHZhciBjdHggPSBjaGFydC5jdHhcclxuICBjdHguY2xlYXJSZWN0KDAsMCxjaGFydC53LGNoYXJ0LmgpXHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFydCwgTmFwY2hhcnQpIHtcclxuICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgdmFyIGRhdGEgPSBjaGFydC5kYXRhXHJcbiAgdmFyIGNhbnZhcyA9IGN0eC5jYW52YXNcclxuICB2YXIgYmFyQ29uZmlnID0gY2hhcnQuY29uZmlnLmJhcnNcclxuICB2YXIgaGVscGVycyA9IE5hcGNoYXJ0LmhlbHBlcnNcclxuICBcclxuICAvLyBmaWxsXHJcblxyXG4gIGRhdGEuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgICB2YXIgdHlwZSA9IGVsZW1lbnQudHlwZVxyXG4gICAgdmFyIGxhbmUgPSB0eXBlLmxhbmVcclxuICAgIHZhciBzdHlsZSA9IHR5cGUuc3R5bGVcclxuICAgIGN0eC5zYXZlKClcclxuICAgIGN0eC5maWxsU3R5bGUgPSBzdHlsZS5jb2xvclxyXG5cclxuICAgIHN3aXRjaChlbGVtZW50LnN0YXRlKXtcclxuICAgICAgY2FzZSAnYWN0aXZlJzpcclxuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSBzdHlsZS5vcGFjaXRpZXMuYWN0aXZlT3BhY2l0eVxyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGNhc2UgJ2hvdmVyJzpcclxuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSBzdHlsZS5vcGFjaXRpZXMuaG92ZXJPcGFjaXR5XHJcbiAgICAgICAgYnJlYWtcclxuICAgICAgY2FzZSAnc2VsZWN0ZWQnOlxyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDAuM1xyXG4gICAgICAgIGJyZWFrXHJcbiAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gc3R5bGUub3BhY2l0aWVzLm9wYWNpdHlcclxuICAgIH1cclxuXHJcbiAgICBoZWxwZXJzLmNyZWF0ZVNlZ21lbnQoY2hhcnQsIGxhbmUuZW5kLCBsYW5lLnN0YXJ0LCBlbGVtZW50LnN0YXJ0LCBlbGVtZW50LmVuZCk7XHJcblxyXG4gICAgY3R4LmZpbGwoKVxyXG4gICAgY3R4LnJlc3RvcmUoKVxyXG4gIH0pXHJcblxyXG4gIFxyXG5cclxuICAvLyBzdHJva2VcclxuXHJcbiAgZGF0YS5lbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgIHZhciBjdHggPSBjaGFydC5jdHhcclxuICAgIHZhciB0eXBlID0gZWxlbWVudC50eXBlXHJcbiAgICB2YXIgbGFuZSA9IHR5cGUubGFuZVxyXG4gICAgdmFyIHN0eWxlID0gdHlwZS5zdHlsZVxyXG5cclxuICAgIGN0eC5zYXZlKClcclxuICAgIGN0eC5zdHJva2VTdHlsZSA9IHN0eWxlLmNvbG9yXHJcbiAgICBjdHgubGluZVdpZHRoID0gc3R5bGUuc3Ryb2tlLmxpbmVXaWR0aFxyXG4gICAgY3R4LmxpbmVKb2luID0gJ21pdHRlbCdcclxuXHJcbiAgICBoZWxwZXJzLmNyZWF0ZVNlZ21lbnQoY2hhcnQsIGxhbmUuZW5kLCBsYW5lLnN0YXJ0LCBlbGVtZW50LnN0YXJ0LCBlbGVtZW50LmVuZCk7XHJcblxyXG4gICAgY3R4LnN0cm9rZSgpO1xyXG4gICAgY3R4LnJlc3RvcmUoKVxyXG4gIH0pO1xyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYXJ0LCBOYXBjaGFydCkge1xyXG4gIHZhciBjdHggPSBjaGFydC5jdHhcclxuICB2YXIgZGF0YSA9IGNoYXJ0LmRhdGFcclxuICB2YXIgY2FudmFzID0gY3R4LmNhbnZhc1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG5cclxuICBkYXRhLnNlbGVjdGVkLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgdmFyIGxhbmUgPSBlbGVtZW50LnR5cGUubGFuZVxyXG4gICAgdmFyIHN0eWxlID0gZWxlbWVudC50eXBlLnN0eWxlXHJcblxyXG4gICAgY3R4LnNhdmUoKVxyXG5cclxuICAgIHZhciBoYW5kbGUxID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgZWxlbWVudC5zdGFydCwgbGFuZS5lbmQpXHJcbiAgICB2YXIgaGFuZGxlMiA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGVsZW1lbnQuZW5kLCBsYW5lLmVuZClcclxuICAgIFxyXG4gICAgY3R4LmZpbGxTdHlsZSA9IHN0eWxlLmNvbG9yXHJcblxyXG4gICAgaGVscGVycy5jaXJjbGUoY2hhcnQsIGhhbmRsZTEsIHN0eWxlLmhhbmRsZUJpZyk7XHJcbiAgICBjdHguZmlsbCgpXHJcbiAgICBoZWxwZXJzLmNpcmNsZShjaGFydCwgaGFuZGxlMiwgc3R5bGUuaGFuZGxlQmlnKTtcclxuICAgIGN0eC5maWxsKClcclxuXHJcblxyXG4gICAgY3R4LmZpbGxTdHlsZSA9ICd3aGl0ZSdcclxuXHJcbiAgICBoZWxwZXJzLmNpcmNsZShjaGFydCwgaGFuZGxlMSwgc3R5bGUuaGFuZGxlU21hbGwpO1xyXG4gICAgY3R4LmZpbGwoKVxyXG4gICAgaGVscGVycy5jaXJjbGUoY2hhcnQsIGhhbmRsZTIsIHN0eWxlLmhhbmRsZVNtYWxsKTtcclxuICAgIGN0eC5maWxsKClcclxuXHJcblxyXG5cclxuICAgIGN0eC5yZXN0b3JlKClcclxuICB9KVxyXG59XHJcbiIsIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTmFwY2hhcnQpIHtcclxuXHJcbiAgLy8gaW1wb3J0IHN0eWxlc1xyXG4gIHJlcXVpcmUoJy4vc3R5bGVzJykoTmFwY2hhcnQpXHJcblxyXG4gIE5hcGNoYXJ0LmRyYXcgPSB7XHJcbiAgICBpbml0OiBkcmF3LFxyXG4gICAgZHJhd0ZyYW1lOiBkcmF3LFxyXG4gICAgYmVuY2htYXJrOiBiZW5jaG1hcmtcclxuICB9XHJcblxyXG4gIHZhciB0YXNrcyA9IHtcclxuICAgIC8vIGNsZWFyXHJcbiAgICBjbGVhcjogcmVxdWlyZSgnLi9jbGVhcicpLFxyXG5cclxuICAgIC8vIGZhY2VcclxuICAgIGNpcmNsZXM6IHJlcXVpcmUoJy4vZmFjZS9jaXJjbGVzJyksXHJcbiAgICBsaW5lczogcmVxdWlyZSgnLi9mYWNlL2xpbmVzJyksXHJcbiAgICB0ZXh0OiByZXF1aXJlKCcuL2ZhY2UvdGV4dCcpLFxyXG5cclxuICAgIC8vIGNvbnRlbnRcclxuICAgIGJhcnM6IHJlcXVpcmUoJy4vY29udGVudC9iYXJzJyksXHJcbiAgICBoYW5kbGVzOiByZXF1aXJlKCcuL2NvbnRlbnQvaGFuZGxlcycpLFxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZHJhdyhjaGFydCkge1xyXG4gICAgZm9yICh0YXNrIGluIHRhc2tzKSB7XHJcbiAgICAgIHRhc2tzW3Rhc2tdKGNoYXJ0LCBOYXBjaGFydClcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGJlbmNobWFyayhjaGFydCkge1xyXG4gICAgdmFyIGl0ZXJhdGlvbnMgPSAxMDAwXHJcbiAgICBmb3IgKHRhc2sgaW4gdGFza3MpIHtcclxuICAgICAgdmFyIHN0YXJ0ID0gRGF0ZS5ub3coKVxyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGl0ZXJhdGlvbnM7IGkrKykge1xyXG4gICAgICAgIHRhc2tzW3Rhc2tdKGNoYXJ0LCBOYXBjaGFydClcclxuICAgICAgfVxyXG4gICAgICB2YXIgZW5kID0gRGF0ZS5ub3coKVxyXG4gICAgICBjb25zb2xlLmxvZyhgJHt0YXNrfSB4ICR7aXRlcmF0aW9uc30gYCArIChlbmQtc3RhcnQpICsgJyBtcycpXHJcbiAgICB9XHJcbiAgfVxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYXJ0LCBOYXBjaGFydCkge1xyXG4gIHZhciBsYXllcnMgPSBjaGFydC5jb25maWcubGF5ZXJzXHJcbiAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gIGN0eC5saW5lV2lkdGggPSBjaGFydC5jb25maWcuZmFjZS5zdHJva2VcclxuXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY2hhcnQuY29uZmlnLmZhY2Uuc3Ryb2tlQ29sb3JcclxuICBmb3IgKHZhciBpID0gbGF5ZXJzLmxlbmd0aCAtIDI7IGkgPj0gbGF5ZXJzLmxlbmd0aCAtIDM7IGktLSkge1xyXG4gIFx0Y3R4LmJlZ2luUGF0aCgpXHJcbiAgICBOYXBjaGFydC5oZWxwZXJzLmNyZWF0ZUN1cnZlKGNoYXJ0LCAxLCAwLCBsYXllcnNbaV0pXHJcbiAgICBjdHguc3Ryb2tlKClcclxuICB9XHJcblxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGNoYXJ0LmNvbmZpZy5mYWNlLndlYWtTdHJva2VDb2xvclxyXG4gIGZvciAodmFyIGkgPSBsYXllcnMubGVuZ3RoIC0gNDsgaSA+PSBsYXllcnMubGVuZ3RoIC0gNDsgaS0tKSB7XHJcbiAgXHRjdHguYmVnaW5QYXRoKClcclxuICAgIE5hcGNoYXJ0LmhlbHBlcnMuY3JlYXRlQ3VydmUoY2hhcnQsIDEsIDAsIGxheWVyc1tpXSlcclxuICAgIGN0eC5zdHJva2UoKVxyXG4gIH1cclxuICBcclxuICBjdHguYmVnaW5QYXRoKClcclxuICBOYXBjaGFydC5oZWxwZXJzLmNyZWF0ZUN1cnZlKGNoYXJ0LCAxLCAwLCAwKVxyXG4gIGN0eC5zdHJva2UoKVxyXG59XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYXJ0LCBOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG5cclxuICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgdmFyIGNvbmZpZyA9IGNoYXJ0LmNvbmZpZ1xyXG4gIHZhciBsYW5lcyA9IGNvbmZpZy5sYW5lc1xyXG4gIFxyXG4gIGN0eC5saW5lV2lkdGggPSBjb25maWcuZmFjZS5zdHJva2VcclxuICBjdHguc2F2ZSgpXHJcblxyXG4gIC8vIGV2ZXJ5IGhvdXIgbm9ybWFsXHJcblxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbmZpZy5mYWNlLnN0cm9rZUNvbG9yXHJcbiAgY3R4LmJlZ2luUGF0aCgpXHJcblxyXG4gIGZvcih2YXIgaT0wO2k8MjQ7aSsrKXtcclxuICBcdHZhciBzID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSo2MCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMl0uc3RhcnQpXHJcbiAgXHR2YXIgZSA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqNjAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDJdLmVuZCArIGNvbmZpZy5mYWNlLmhvdXJTdHJva2VzTGVuZ3RoKVxyXG4gICAgY3R4Lm1vdmVUbyhzLngscy55KVxyXG4gICAgY3R4LmxpbmVUbyhlLngsZS55KVxyXG4gIH1cclxuICBjdHguc3Ryb2tlKClcclxuXHJcbiAgLy8gZXZlcnkgaG91ciB3ZWFrXHJcblxyXG4gIGN0eC5zdHJva2VTdHlsZSA9IGNvbmZpZy5mYWNlLndlYWtTdHJva2VDb2xvclxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG5cclxuICBmb3IodmFyIGk9MDtpPDI0O2krKyl7XHJcbiAgICB2YXIgcyA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqNjAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDNdLnN0YXJ0KVxyXG4gICAgdmFyIGUgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjYwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAzXS5lbmQpXHJcbiAgICBjdHgubW92ZVRvKHMueCxzLnkpXHJcbiAgICBjdHgubGluZVRvKGUueCxlLnkpXHJcbiAgfVxyXG4gIGN0eC5zdHJva2UoKVxyXG5cclxuXHJcbiAgLy8gaW1wb3J0YW50IGhvdXJzXHJcblxyXG4gIGN0eC5saW5lV2lkdGggPSBjb25maWcuZmFjZS5pbXBvcnRhbnRMaW5lV2lkdGhcclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjb25maWcuZmFjZS5pbXBvcnRhbnRTdHJva2VDb2xvclxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG5cclxuICBmb3IodmFyIGk9MDtpPDI0O2kgPSBpKzQpe1xyXG4gICAgdmFyIHMgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjYwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAyXS5zdGFydClcclxuICAgIHZhciBlID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSo2MCwgbGFuZXNbbGFuZXMubGVuZ3RoIC0gMl0uZW5kICsgY29uZmlnLmZhY2UuaG91clN0cm9rZXNMZW5ndGgpXHJcbiAgICBjdHgubW92ZVRvKHMueCxzLnkpXHJcbiAgICBjdHgubGluZVRvKGUueCxlLnkpXHJcbiAgfVxyXG4gIFxyXG4gIGN0eC5zdHJva2UoKVxyXG5cclxuICAvLyBldmVyeSAxMCBtaW51dGVzXHJcblxyXG4gIC8qXHJcbiAgY3R4LnN0cm9rZVN0eWxlID0gY29uZmlnLmZhY2Uuc3Ryb2tlQ29sb3JcclxuICBjdHguYmVnaW5QYXRoKClcclxuXHJcblxyXG4gIGZvcih2YXIgaT0wO2k8MTQ0MC8xMDtpKyspe1xyXG4gICAgdmFyIHMgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjEwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAyXS5lbmQpXHJcbiAgICB2YXIgZSA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqMTAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDJdLmVuZCArIGNvbmZpZy5mYWNlLnRlbk1pbnV0ZVN0cm9rZXNMZW5ndGgpXHJcbiAgICBjdHgubW92ZVRvKHMueCxzLnkpXHJcbiAgICBjdHgubGluZVRvKGUueCxlLnkpXHJcbiAgfVxyXG4gIGN0eC5zdHJva2UoKVxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG4gICovXHJcblxyXG5cclxuICAvLyBldmVyeSA1IG1pbnV0ZXNcclxuXHJcbiAgLypcclxuICBjdHguc3Ryb2tlU3R5bGUgPSBjb25maWcuZmFjZS5zdHJva2VDb2xvclxyXG4gIGN0eC5iZWdpblBhdGgoKVxyXG5cclxuICBmb3IodmFyIGk9MC41O2k8MTQ0MC8xMDtpKyspe1xyXG4gICAgdmFyIHMgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LCBpKjEwLCBsYW5lc1tsYW5lcy5sZW5ndGggLSAyXS5lbmQpXHJcbiAgICB2YXIgZSA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGkqMTAsIGxhbmVzW2xhbmVzLmxlbmd0aCAtIDJdLmVuZCArIGNvbmZpZy5mYWNlLmZpdmVNaW51dGVTdHJva2VzTGVuZ3RoKVxyXG4gICAgY3R4Lm1vdmVUbyhzLngscy55KVxyXG4gICAgY3R4LmxpbmVUbyhlLngsZS55KVxyXG4gIH1cclxuXHJcbiAgY3R4LnN0cm9rZSgpXHJcbiAgKi9cclxuXHJcblxyXG4gIFxyXG4gIFxyXG4gIGN0eC5yZXN0b3JlKClcclxufVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFydCwgTmFwY2hhcnQpIHtcclxuICB2YXIgaGVscGVycyA9IE5hcGNoYXJ0LmhlbHBlcnNcclxuXHJcbiAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gIHZhciBjb25maWcgPSBjaGFydC5jb25maWdcclxuXHJcbiAgY3R4LnNhdmUoKVxyXG4gIGN0eC5mb250ID0gaGVscGVycy5jcmVhdGVGb250U3RyaW5nKGNoYXJ0LCBjb25maWcuZmFjZS5udW1iZXJzLnNpemUpXHJcbiAgY3R4LmZpbGxTdHlsZSA9IGNvbmZpZy5mYWNlLm51bWJlcnMuY29sb3JcclxuICBjdHgudGV4dEFsaWduID0gJ2NlbnRlcidcclxuICBjdHgudGV4dEJhc2VsaW5lID0gJ21pZGRsZSdcclxuXHJcbiAgZm9yKHZhciBpPTA7aTwyNDtpID0gaSs0KXtcclxuICBcdHZhciBwID0gaGVscGVycy5taW51dGVzVG9YWShjaGFydCwgaSo2MCwgY29uZmlnLmZhY2UubnVtYmVycy5yYWRpdXMpXHJcbiAgICBjdHguZmlsbFRleHQoaSwgcC54LCBwLnkpXHJcbiAgfVxyXG5cclxuICBjdHgucmVzdG9yZSgpXHJcbn1cclxuIiwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG4gIHZhciBzdHlsZXMgPSBOYXBjaGFydC5zdHlsZXMgPSB7XHJcbiAgICBcclxuICB9XHJcblxyXG4gIHN0eWxlcy5kZWZhdWx0ID0ge1xyXG4gICAgY29sb3I6ICdibGFjaycsXHJcbiAgICBvcGFjaXRpZXM6IHtcclxuICAgICAgbm9TY2FsZTp0cnVlLFxyXG4gICAgICBvcGFjaXR5OiAwLjYsXHJcbiAgICAgIGhvdmVyT3BhY2l0eTogMC41LFxyXG4gICAgICBhY3RpdmVPcGFjaXR5OiAwLjUsXHJcbiAgICB9LFxyXG4gICAgc3Ryb2tlOiB7XHJcbiAgICAgIGxpbmVXaWR0aDoyXHJcbiAgICB9LFxyXG5cdGhhbmRsZUJpZzo3LFxyXG5cdGhhbmRsZVNtYWxsOjNcclxuICB9XHJcblxyXG4gIHN0eWxlcy5yZWQgPSBoZWxwZXJzLmV4dGVuZCh7fSwgc3R5bGVzLmRlZmF1bHQsIHtcclxuICAgIGNvbG9yOiAnI2M3MGUwZScsXHJcbiAgICBzZWxlY3RlZDoge1xyXG4gICAgICBzdHJva2VDb2xvcjogJyNGRjYzNjMnLFxyXG4gICAgfVxyXG4gIH0pIFxyXG5cclxuICBzdHlsZXMuYmxhY2sgPSBoZWxwZXJzLmV4dGVuZCh7fSwgc3R5bGVzLmRlZmF1bHQsIHtcclxuICAgIGNvbG9yOiAnIzFmMWYxZicsXHJcbiAgICBzZWxlY3RlZDoge1xyXG4gICAgICBzdHJva2VDb2xvcjogJyNGRjYzNjMnLFxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIHN0eWxlcy5ibHVlID0gaGVscGVycy5leHRlbmQoe30sIHN0eWxlcy5kZWZhdWx0LCB7XHJcbiAgICBjb2xvcjogJ2JsdWUnXHJcbiAgfSlcclxuICBcclxufSIsIi8qIGdsb2JhbCB3aW5kb3c6IGZhbHNlICovXG4vKiBnbG9iYWwgZG9jdW1lbnQ6IGZhbHNlICovXG4ndXNlIHN0cmljdCdcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoQ2hhcnQpIHtcbiAgLy8gR2xvYmFsIENoYXJ0IGhlbHBlcnMgb2JqZWN0IGZvciB1dGlsaXR5IG1ldGhvZHMgYW5kIGNsYXNzZXNcbiAgdmFyIGhlbHBlcnMgPSBDaGFydC5oZWxwZXJzID0ge31cblxuICBoZWxwZXJzLnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IChmdW5jdGlvbigpe1xuICAgIHJldHVybiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSAgICAgICB8fFxuICAgICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuICAgICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSAgICB8fFxuICAgICAgICAgICAgZnVuY3Rpb24oIGNhbGxiYWNrICl7XG4gICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGNhbGxiYWNrLCAxMDAwIC8gNjApO1xuICAgICAgICAgICAgfTtcbiAgfSkoKTtcblxuICBoZWxwZXJzLnJhbmdlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgICBpZiAoZW5kIDwgc3RhcnQpIHtcbiAgICAgIHJldHVybiAxNDQwIC0gc3RhcnQgKyBlbmRcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGVuZCAtIHN0YXJ0XG4gICAgfVxuICB9XG5cbiAgaGVscGVycy5nZXRQb3NpdGlvbkJldHdlZW5Ud29WYWx1ZXMgPSBmdW5jdGlvbihwb3MsIHN0YXJ0LCBlbmQpe1xuICAgICAgcmV0dXJuIGhlbHBlcnMucmFuZ2Uoc3RhcnQscG9zKSAvIGhlbHBlcnMucmFuZ2Uoc3RhcnQsIGVuZClcbiAgfVxuXG4gIGhlbHBlcnMubGltaXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZih2YWx1ZSA9PSAxNDQwKSByZXR1cm4gMTQ0MFxuICAgIHJldHVybiB2YWx1ZSAtIDE0NDAgKiBNYXRoLmZsb29yKHZhbHVlLzE0NDApXG4gIH1cbiAgd2luZG93LmhlbHBlcnMgPSBoZWxwZXJzXG4gIGhlbHBlcnMuc2hvcnRlc3RXYXkgPSBmdW5jdGlvbihhKSB7XG4gICAgLy8gYWx0ZXJuYXRpdmU/P2NvbnNvbGUubG9nKGEgLSAxNDQwICogTWF0aC5mbG9vcihhLzcyMCkpXG5cbiAgICAvLyAxNDQwLzIgPSA3MjBcbiAgICBpZihhID4gNzIwKXtcbiAgICAgIHJldHVybiBhIC0gMTQ0MFxuICAgIH0gZWxzZSBpZihhIDwgLTcyMCl7XG4gICAgICByZXR1cm4gYSArIDE0NDBcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGFcbiAgICB9XG5cbiAgfVxuXG4gIGhlbHBlcnMuZ2V0UHJvZ3Jlc3NCZXR3ZWVuVHdvVmFsdWVzID0gZnVuY3Rpb24gKHBvcywgc3RhcnQsIGVuZCkge1xuICAgIHJldHVybiBoZWxwZXJzLnJhbmdlKHN0YXJ0LCBwb3MpIC8gaGVscGVycy5yYW5nZShzdGFydCwgZW5kKVxuICB9XG4gIGhlbHBlcnMuaXNJbnNpZGUgPSBmdW5jdGlvbiAocG9pbnQsIHN0YXJ0LCBlbmQpIHtcbiAgICBpZiAoZW5kID4gc3RhcnQpIHtcbiAgICAgIGlmIChwb2ludCA8IGVuZCAmJiBwb2ludCA+IHN0YXJ0KSB7IHJldHVybiB0cnVlIH1cbiAgICB9IGVsc2UgaWYgKHN0YXJ0ID4gZW5kKSB7XG4gICAgICBpZiAocG9pbnQgPiBzdGFydCB8fCBwb2ludCA8IGVuZCkgeyByZXR1cm4gdHJ1ZSB9XG4gICAgfVxuICAgIGlmIChwb2ludCA9PSBzdGFydCB8fCBwb2ludCA9PSBlbmQpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaGVscGVycy5pc0luc2lkZUFuZ2xlID0gZnVuY3Rpb24gKHBvaW50LCBzdGFydCwgZW5kKSB7XG4gICAgLy8gc2FtZSBhcyBhbmdsZSBidXQgaXQgbGltaXRzIHZhbHVlcyB0byBiZXR3ZWVuIDAgYW5kIDIqTWF0aC5QSVxuICAgIHJldHVybiBoZWxwZXJzLmlzSW5zaWRlKGxpbWl0KHBvaW50KSwgbGltaXQoc3RhcnQpLCBsaW1pdChlbmQpKVxuXG4gICAgZnVuY3Rpb24gbGltaXQoYW5nbGUpIHtcbiAgICAgIGFuZ2xlICU9IE1hdGguUEkqMlxuICAgICAgaWYoYW5nbGUgPCAwKXtcbiAgICAgICAgYW5nbGUgKz0gTWF0aC5QSSoyXG4gICAgICB9XG4gICAgICByZXR1cm4gYW5nbGVcbiAgICB9XG4gIH1cbiAgXG5cbiAgaGVscGVycy5kaXN0YW5jZSA9IGZ1bmN0aW9uICh4LHksYSl7XG4gICAgdmFyIHkgPSBhLnkteTtcbiAgICB2YXIgeCA9IGEueC14O1xuICAgIHJldHVybiBNYXRoLnNxcnQoeSp5K3gqeCk7XG4gIH1cblxuICBoZWxwZXJzLmFuZ2xlQmV0d2VlblR3b1BvaW50cyA9IGZ1bmN0aW9uICh4LHksYSl7XG4gICAgdmFyIGRpc3RhbmNlID0gaGVscGVycy5kaXN0YW5jZSh4LHksYSlcbiAgICB2YXIgeSA9IChhLnkteSkgLyBkaXN0YW5jZTtcbiAgICB2YXIgeCA9IChhLngteCkgLyBkaXN0YW5jZTtcblxuICAgIHZhciBhbmdsZSA9IE1hdGguYXRhbih5IC94KVxuICAgIGlmKHggPiAwKXtcbiAgICAgIGFuZ2xlICs9IE1hdGguUElcbiAgICB9XG4gICAgYW5nbGUgKz0gTWF0aC5QSS8yXG4gICAgcmV0dXJuIGFuZ2xlXG4gIH1cbiAgLy8gaGVscGVycy5YWXRvTWludXRlcyA9IGZ1bmN0aW9uICh4LHkpIHtcbiAgLy8gICBtaW51dGVzID0gKE1hdGguYXRhbih5IC94KSAvIChNYXRoLlBJICogMikpICogMTQ0MCArIDM2MDtcbiAgLy8gICBpZiAoeCA8IDApIHtcbiAgLy8gICAgICAgbWludXRlcyArPSA3MjA7XG4gIC8vICAgfVxuICAvLyAgIG1pbnV0ZXMgPSBNYXRoLnJvdW5kKG1pbnV0ZXMpO1xuXG4gIC8vICAgcmV0dXJuIG1pbnV0ZXM7XG4gIC8vIH07XG5cbiAgaGVscGVycy5kaXN0YW5jZUZyb21Qb2ludFRvTGluZSA9IGZ1bmN0aW9uICh4LHksYSxiKXtcblxuICB2YXIgeDEgPSBhLnhcbiAgdmFyIHkxID0gYS55XG4gIHZhciB4MiA9IGIueFxuICB2YXIgeTIgPSBiLnlcblxuICB2YXIgQSA9IHggLSB4MTtcbiAgdmFyIEIgPSB5IC0geTE7XG4gIHZhciBDID0geDIgLSB4MTtcbiAgdmFyIEQgPSB5MiAtIHkxO1xuXG4gIHZhciBkb3QgPSBBICogQyArIEIgKiBEO1xuICB2YXIgbGVuX3NxID0gQyAqIEMgKyBEICogRDtcbiAgdmFyIHBhcmFtID0gLTE7XG4gIGlmIChsZW5fc3EgIT0gMCkgLy9pbiBjYXNlIG9mIDAgbGVuZ3RoIGxpbmVcbiAgICAgIHBhcmFtID0gZG90IC8gbGVuX3NxO1xuXG4gIHZhciB4eCwgeXk7XG5cbiAgaWYgKHBhcmFtIDwgMCkge1xuICAgIHh4ID0geDE7XG4gICAgeXkgPSB5MTtcbiAgfVxuICBlbHNlIGlmIChwYXJhbSA+IDEpIHtcbiAgICB4eCA9IHgyO1xuICAgIHl5ID0geTI7XG4gIH1cbiAgZWxzZSB7XG4gICAgeHggPSB4MSArIHBhcmFtICogQztcbiAgICB5eSA9IHkxICsgcGFyYW0gKiBEO1xuICB9XG5cbiAgdmFyIGR4ID0geCAtIHh4O1xuICB2YXIgZHkgPSB5IC0geXk7XG4gIHJldHVybiBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xufVxuXG4gIGhlbHBlcnMuZWFjaEVsZW1lbnQgPSBmdW5jdGlvbiAoY2hhcnQsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGRhdGEgPSBjaGFydC5kYXRhXG4gICAgdmFyIGNvbmZpZ1xuXG4gICAgZm9yICh2YXIgbmFtZSBpbiBkYXRhKSB7XG4gICAgICBjb25maWcgPSBjaGFydC5jb25maWcuYmFyc1tuYW1lXVxuICAgICAgXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFbbmFtZV0ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2FsbGJhY2soZGF0YVtuYW1lXVtpXSwgY29uZmlnKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhlbHBlcnMuZWFjaEVsZW1lbnRZbyA9IGZ1bmN0aW9uIChkYXRhLCBjYWxsYmFjaykge1xuICAgIGZvciAodmFyIG5hbWUgaW4gZGF0YSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhW25hbWVdLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNhbGxiYWNrKG5hbWUsIGkpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGVscGVycy5lYWNoID0gZnVuY3Rpb24gKGxvb3BhYmxlLCBjYWxsYmFjaywgc2VsZiwgcmV2ZXJzZSkge1xuICAgIC8vIENoZWNrIHRvIHNlZSBpZiBudWxsIG9yIHVuZGVmaW5lZCBmaXJzdGx5LlxuICAgIHZhciBpLCBsZW5cbiAgICBpZiAoaGVscGVycy5pc0FycmF5KGxvb3BhYmxlKSkge1xuICAgICAgbGVuID0gbG9vcGFibGUubGVuZ3RoXG4gICAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgICBmb3IgKGkgPSBsZW4gLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgbG9vcGFibGVbaV0sIGkpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgbG9vcGFibGVbaV0sIGkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBsb29wYWJsZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMobG9vcGFibGUpXG4gICAgICBsZW4gPSBrZXlzLmxlbmd0aFxuICAgICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwoc2VsZiwgbG9vcGFibGVba2V5c1tpXV0sIGtleXNbaV0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGVscGVycy5kZWVwRWFjaCA9IGZ1bmN0aW9uIChsb29wYWJsZSwgY2FsbGJhY2spIHtcbiAgICAvLyBDaGVjayB0byBzZWUgaWYgbnVsbCBvciB1bmRlZmluZWQgZmlyc3RseS5cbiAgICB2YXIgaSwgbGVuXG4gICAgZnVuY3Rpb24gc2VhcmNoIChsb29wYWJsZSwgY2IpIHtcbiAgICAgIGlmIChoZWxwZXJzLmlzQXJyYXkobG9vcGFibGUpKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9vcGFibGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjYihsb29wYWJsZSwgbG9vcGFibGVbaV0sIGkpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxvb3BhYmxlID09PSAnb2JqZWN0Jykge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGxvb3BhYmxlKVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjYihsb29wYWJsZSwgbG9vcGFibGVba2V5c1tpXV0sIGtleXNbaV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmb3VuZCAoYmFzZSwgdmFsdWUsIGtleSkge1xuICAgICAgaWYgKGhlbHBlcnMuaXNBcnJheSh2YWx1ZSkgfHwgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICBzZWFyY2godmFsdWUsIGZvdW5kKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2soYmFzZSwgdmFsdWUsIGtleSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZWFyY2gobG9vcGFibGUsIGZvdW5kKVxuICB9XG4gIGhlbHBlcnMuY2xvbmUgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSlcbiAgfVxuICBoZWxwZXJzLmV4dGVuZCA9IGZ1bmN0aW9uIChiYXNlKSB7XG4gICAgdmFyIHNldEZuID0gZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgIGJhc2Vba2V5XSA9IHZhbHVlXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAxLCBpbGVuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGlsZW47IGkrKykge1xuICAgICAgaGVscGVycy5lYWNoKGFyZ3VtZW50c1tpXSwgc2V0Rm4pXG4gICAgfVxuICAgIHJldHVybiBiYXNlXG4gIH1cbiAgLy8gTmVlZCBhIHNwZWNpYWwgbWVyZ2UgZnVuY3Rpb24gdG8gY2hhcnQgY29uZmlncyBzaW5jZSB0aGV5IGFyZSBub3cgZ3JvdXBlZFxuICBoZWxwZXJzLmNvbmZpZ01lcmdlID0gZnVuY3Rpb24gKF9iYXNlKSB7XG4gICAgdmFyIGJhc2UgPSBoZWxwZXJzLmNsb25lKF9iYXNlKVxuICAgIGhlbHBlcnMuZWFjaChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLCBmdW5jdGlvbiAoZXh0ZW5zaW9uKSB7XG4gICAgICBoZWxwZXJzLmVhY2goZXh0ZW5zaW9uLCBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICB2YXIgYmFzZUhhc1Byb3BlcnR5ID0gYmFzZS5oYXNPd25Qcm9wZXJ0eShrZXkpXG4gICAgICAgIHZhciBiYXNlVmFsID0gYmFzZUhhc1Byb3BlcnR5ID8gYmFzZVtrZXldIDoge31cblxuICAgICAgICBpZiAoa2V5ID09PSAnc2NhbGVzJykge1xuICAgICAgICAgIC8vIFNjYWxlIGNvbmZpZyBtZXJnaW5nIGlzIGNvbXBsZXguIEFkZCBvdXIgb3duIGZ1bmN0aW9uIGhlcmUgZm9yIHRoYXRcbiAgICAgICAgICBiYXNlW2tleV0gPSBoZWxwZXJzLnNjYWxlTWVyZ2UoYmFzZVZhbCwgdmFsdWUpXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnc2NhbGUnKSB7XG4gICAgICAgICAgLy8gVXNlZCBpbiBwb2xhciBhcmVhICYgcmFkYXIgY2hhcnRzIHNpbmNlIHRoZXJlIGlzIG9ubHkgb25lIHNjYWxlXG4gICAgICAgICAgYmFzZVtrZXldID0gaGVscGVycy5jb25maWdNZXJnZShiYXNlVmFsLCBDaGFydC5zY2FsZVNlcnZpY2UuZ2V0U2NhbGVEZWZhdWx0cyh2YWx1ZS50eXBlKSwgdmFsdWUpXG4gICAgICAgIH0gZWxzZSBpZiAoYmFzZUhhc1Byb3BlcnR5ICYmXG4gICAgICAgICAgdHlwZW9mIGJhc2VWYWwgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgIWhlbHBlcnMuaXNBcnJheShiYXNlVmFsKSAmJlxuICAgICAgICAgIGJhc2VWYWwgIT09IG51bGwgJiZcbiAgICAgICAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgIWhlbHBlcnMuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAvLyBJZiB3ZSBhcmUgb3ZlcndyaXRpbmcgYW4gb2JqZWN0IHdpdGggYW4gb2JqZWN0LCBkbyBhIG1lcmdlIG9mIHRoZSBwcm9wZXJ0aWVzLlxuICAgICAgICAgIGJhc2Vba2V5XSA9IGhlbHBlcnMuY29uZmlnTWVyZ2UoYmFzZVZhbCwgdmFsdWUpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gY2FuIGp1c3Qgb3ZlcndyaXRlIHRoZSB2YWx1ZSBpbiB0aGlzIGNhc2VcbiAgICAgICAgICBiYXNlW2tleV0gPSB2YWx1ZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG5cbiAgICByZXR1cm4gYmFzZVxuICB9XG4gIGhlbHBlcnMuc2NhbGVNZXJnZSA9IGZ1bmN0aW9uIChfYmFzZSwgZXh0ZW5zaW9uKSB7XG4gICAgdmFyIGJhc2UgPSBoZWxwZXJzLmNsb25lKF9iYXNlKVxuXG4gICAgaGVscGVycy5lYWNoKGV4dGVuc2lvbiwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgIGlmIChrZXkgPT09ICd4QXhlcycgfHwga2V5ID09PSAneUF4ZXMnKSB7XG4gICAgICAgIC8vIFRoZXNlIHByb3BlcnRpZXMgYXJlIGFycmF5cyBvZiBpdGVtc1xuICAgICAgICBpZiAoYmFzZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgaGVscGVycy5lYWNoKHZhbHVlLCBmdW5jdGlvbiAodmFsdWVPYmosIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgYXhpc1R5cGUgPSBoZWxwZXJzLmdldFZhbHVlT3JEZWZhdWx0KHZhbHVlT2JqLnR5cGUsIGtleSA9PT0gJ3hBeGVzJyA/ICdjYXRlZ29yeScgOiAnbGluZWFyJylcbiAgICAgICAgICAgIHZhciBheGlzRGVmYXVsdHMgPSBDaGFydC5zY2FsZVNlcnZpY2UuZ2V0U2NhbGVEZWZhdWx0cyhheGlzVHlwZSlcbiAgICAgICAgICAgIGlmIChpbmRleCA+PSBiYXNlW2tleV0ubGVuZ3RoIHx8ICFiYXNlW2tleV1baW5kZXhdLnR5cGUpIHtcbiAgICAgICAgICAgICAgYmFzZVtrZXldLnB1c2goaGVscGVycy5jb25maWdNZXJnZShheGlzRGVmYXVsdHMsIHZhbHVlT2JqKSlcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWVPYmoudHlwZSAmJiB2YWx1ZU9iai50eXBlICE9PSBiYXNlW2tleV1baW5kZXhdLnR5cGUpIHtcbiAgICAgICAgICAgICAgLy8gVHlwZSBjaGFuZ2VkLiBCcmluZyBpbiB0aGUgbmV3IGRlZmF1bHRzIGJlZm9yZSB3ZSBicmluZyBpbiB2YWx1ZU9iaiBzbyB0aGF0IHZhbHVlT2JqIGNhbiBvdmVycmlkZSB0aGUgY29ycmVjdCBzY2FsZSBkZWZhdWx0c1xuICAgICAgICAgICAgICBiYXNlW2tleV1baW5kZXhdID0gaGVscGVycy5jb25maWdNZXJnZShiYXNlW2tleV1baW5kZXhdLCBheGlzRGVmYXVsdHMsIHZhbHVlT2JqKVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVHlwZSBpcyB0aGUgc2FtZVxuICAgICAgICAgICAgICBiYXNlW2tleV1baW5kZXhdID0gaGVscGVycy5jb25maWdNZXJnZShiYXNlW2tleV1baW5kZXhdLCB2YWx1ZU9iailcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJhc2Vba2V5XSA9IFtdXG4gICAgICAgICAgaGVscGVycy5lYWNoKHZhbHVlLCBmdW5jdGlvbiAodmFsdWVPYmopIHtcbiAgICAgICAgICAgIHZhciBheGlzVHlwZSA9IGhlbHBlcnMuZ2V0VmFsdWVPckRlZmF1bHQodmFsdWVPYmoudHlwZSwga2V5ID09PSAneEF4ZXMnID8gJ2NhdGVnb3J5JyA6ICdsaW5lYXInKVxuICAgICAgICAgICAgYmFzZVtrZXldLnB1c2goaGVscGVycy5jb25maWdNZXJnZShDaGFydC5zY2FsZVNlcnZpY2UuZ2V0U2NhbGVEZWZhdWx0cyhheGlzVHlwZSksIHZhbHVlT2JqKSlcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGJhc2UuaGFzT3duUHJvcGVydHkoa2V5KSAmJiB0eXBlb2YgYmFzZVtrZXldID09PSAnb2JqZWN0JyAmJiBiYXNlW2tleV0gIT09IG51bGwgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBJZiB3ZSBhcmUgb3ZlcndyaXRpbmcgYW4gb2JqZWN0IHdpdGggYW4gb2JqZWN0LCBkbyBhIG1lcmdlIG9mIHRoZSBwcm9wZXJ0aWVzLlxuICAgICAgICBiYXNlW2tleV0gPSBoZWxwZXJzLmNvbmZpZ01lcmdlKGJhc2Vba2V5XSwgdmFsdWUpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjYW4ganVzdCBvdmVyd3JpdGUgdGhlIHZhbHVlIGluIHRoaXMgY2FzZVxuICAgICAgICBiYXNlW2tleV0gPSB2YWx1ZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gYmFzZVxuICB9XG4gIGhlbHBlcnMuZ2V0VmFsdWVBdEluZGV4T3JEZWZhdWx0ID0gZnVuY3Rpb24gKHZhbHVlLCBpbmRleCwgZGVmYXVsdFZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiBkZWZhdWx0VmFsdWVcbiAgICB9XG5cbiAgICBpZiAoaGVscGVycy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGluZGV4IDwgdmFsdWUubGVuZ3RoID8gdmFsdWVbaW5kZXhdIDogZGVmYXVsdFZhbHVlXG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cbiAgaGVscGVycy5nZXRWYWx1ZU9yRGVmYXVsdCA9IGZ1bmN0aW9uICh2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyBkZWZhdWx0VmFsdWUgOiB2YWx1ZVxuICB9XG4gIGhlbHBlcnMuaW5kZXhPZiA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mXG4gICAgPyBmdW5jdGlvbiAoYXJyYXksIGl0ZW0pIHtcbiAgICAgIHJldHVybiBhcnJheS5pbmRleE9mKGl0ZW0pXG4gICAgfVxuICAgIDogZnVuY3Rpb24gKGFycmF5LCBpdGVtKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgaWxlbiA9IGFycmF5Lmxlbmd0aDsgaSA8IGlsZW47ICsraSkge1xuICAgICAgICBpZiAoYXJyYXlbaV0gPT09IGl0ZW0pIHtcbiAgICAgICAgICByZXR1cm4gaVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gIGhlbHBlcnMud2hlcmUgPSBmdW5jdGlvbiAoY29sbGVjdGlvbiwgZmlsdGVyQ2FsbGJhY2spIHtcbiAgICBpZiAoaGVscGVycy5pc0FycmF5KGNvbGxlY3Rpb24pICYmIEFycmF5LnByb3RvdHlwZS5maWx0ZXIpIHtcbiAgICAgIHJldHVybiBjb2xsZWN0aW9uLmZpbHRlcihmaWx0ZXJDYWxsYmFjaylcbiAgICB9XG4gICAgdmFyIGZpbHRlcmVkID0gW11cblxuICAgIGhlbHBlcnMuZWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgaWYgKGZpbHRlckNhbGxiYWNrKGl0ZW0pKSB7XG4gICAgICAgIGZpbHRlcmVkLnB1c2goaXRlbSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGZpbHRlcmVkXG4gIH1cbiAgaGVscGVycy5maW5kSW5kZXggPSBBcnJheS5wcm90b3R5cGUuZmluZEluZGV4XG4gICAgPyBmdW5jdGlvbiAoYXJyYXksIGNhbGxiYWNrLCBzY29wZSkge1xuICAgICAgcmV0dXJuIGFycmF5LmZpbmRJbmRleChjYWxsYmFjaywgc2NvcGUpXG4gICAgfVxuICAgIDogZnVuY3Rpb24gKGFycmF5LCBjYWxsYmFjaywgc2NvcGUpIHtcbiAgICAgIHNjb3BlID0gc2NvcGUgPT09IHVuZGVmaW5lZCA/IGFycmF5IDogc2NvcGVcbiAgICAgIGZvciAodmFyIGkgPSAwLCBpbGVuID0gYXJyYXkubGVuZ3RoOyBpIDwgaWxlbjsgKytpKSB7XG4gICAgICAgIGlmIChjYWxsYmFjay5jYWxsKHNjb3BlLCBhcnJheVtpXSwgaSwgYXJyYXkpKSB7XG4gICAgICAgICAgcmV0dXJuIGlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICBoZWxwZXJzLmZpbmROZXh0V2hlcmUgPSBmdW5jdGlvbiAoYXJyYXlUb1NlYXJjaCwgZmlsdGVyQ2FsbGJhY2ssIHN0YXJ0SW5kZXgpIHtcbiAgICAvLyBEZWZhdWx0IHRvIHN0YXJ0IG9mIHRoZSBhcnJheVxuICAgIGlmIChzdGFydEluZGV4ID09PSB1bmRlZmluZWQgfHwgc3RhcnRJbmRleCA9PT0gbnVsbCkge1xuICAgICAgc3RhcnRJbmRleCA9IC0xXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSBzdGFydEluZGV4ICsgMTsgaSA8IGFycmF5VG9TZWFyY2gubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBjdXJyZW50SXRlbSA9IGFycmF5VG9TZWFyY2hbaV1cbiAgICAgIGlmIChmaWx0ZXJDYWxsYmFjayhjdXJyZW50SXRlbSkpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRJdGVtXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGhlbHBlcnMuZmluZFByZXZpb3VzV2hlcmUgPSBmdW5jdGlvbiAoYXJyYXlUb1NlYXJjaCwgZmlsdGVyQ2FsbGJhY2ssIHN0YXJ0SW5kZXgpIHtcbiAgICAvLyBEZWZhdWx0IHRvIGVuZCBvZiB0aGUgYXJyYXlcbiAgICBpZiAoc3RhcnRJbmRleCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0SW5kZXggPT09IG51bGwpIHtcbiAgICAgIHN0YXJ0SW5kZXggPSBhcnJheVRvU2VhcmNoLmxlbmd0aFxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gc3RhcnRJbmRleCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgY3VycmVudEl0ZW0gPSBhcnJheVRvU2VhcmNoW2ldXG4gICAgICBpZiAoZmlsdGVyQ2FsbGJhY2soY3VycmVudEl0ZW0pKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50SXRlbVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLmluaGVyaXRzID0gZnVuY3Rpb24gKGV4dGVuc2lvbnMpIHtcbiAgICAvLyBCYXNpYyBqYXZhc2NyaXB0IGluaGVyaXRhbmNlIGJhc2VkIG9uIHRoZSBtb2RlbCBjcmVhdGVkIGluIEJhY2tib25lLmpzXG4gICAgdmFyIG1lID0gdGhpc1xuICAgIHZhciBDaGFydEVsZW1lbnQgPSAoZXh0ZW5zaW9ucyAmJiBleHRlbnNpb25zLmhhc093blByb3BlcnR5KCdjb25zdHJ1Y3RvcicpKSA/IGV4dGVuc2lvbnMuY29uc3RydWN0b3IgOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gbWUuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIH1cblxuICAgIHZhciBTdXJyb2dhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLmNvbnN0cnVjdG9yID0gQ2hhcnRFbGVtZW50XG4gICAgfVxuICAgIFN1cnJvZ2F0ZS5wcm90b3R5cGUgPSBtZS5wcm90b3R5cGVcbiAgICBDaGFydEVsZW1lbnQucHJvdG90eXBlID0gbmV3IFN1cnJvZ2F0ZSgpXG5cbiAgICBDaGFydEVsZW1lbnQuZXh0ZW5kID0gaGVscGVycy5pbmhlcml0c1xuXG4gICAgaWYgKGV4dGVuc2lvbnMpIHtcbiAgICAgIGhlbHBlcnMuZXh0ZW5kKENoYXJ0RWxlbWVudC5wcm90b3R5cGUsIGV4dGVuc2lvbnMpXG4gICAgfVxuXG4gICAgQ2hhcnRFbGVtZW50Ll9fc3VwZXJfXyA9IG1lLnByb3RvdHlwZVxuXG4gICAgcmV0dXJuIENoYXJ0RWxlbWVudFxuICB9XG4gIFxuICBoZWxwZXJzLnVpZCA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGlkID0gMFxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaWQrK1xuICAgIH1cbiAgfSgpKVxuICAvLyAtLSBNYXRoIG1ldGhvZHNcbiAgaGVscGVycy5pc051bWJlciA9IGZ1bmN0aW9uIChuKSB7XG4gICAgcmV0dXJuICFpc05hTihwYXJzZUZsb2F0KG4pKSAmJiBpc0Zpbml0ZShuKVxuICB9XG4gIGhlbHBlcnMuYWxtb3N0RXF1YWxzID0gZnVuY3Rpb24gKHgsIHksIGVwc2lsb24pIHtcbiAgICByZXR1cm4gTWF0aC5hYnMoeCAtIHkpIDwgZXBzaWxvblxuICB9XG4gIGhlbHBlcnMuYWxtb3N0V2hvbGUgPSBmdW5jdGlvbiAoeCwgZXBzaWxvbikge1xuICAgIHZhciByb3VuZGVkID0gTWF0aC5yb3VuZCh4KVxuICAgIHJldHVybiAoKChyb3VuZGVkIC0gZXBzaWxvbikgPCB4KSAmJiAoKHJvdW5kZWQgKyBlcHNpbG9uKSA+IHgpKVxuICB9XG4gIGhlbHBlcnMubWF4ID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgcmV0dXJuIGFycmF5LnJlZHVjZShmdW5jdGlvbiAobWF4LCB2YWx1ZSkge1xuICAgICAgaWYgKCFpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWF4KG1heCwgdmFsdWUpXG4gICAgICB9XG4gICAgICByZXR1cm4gbWF4XG4gICAgfSwgTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZKVxuICB9XG4gIGhlbHBlcnMubWluID0gZnVuY3Rpb24gKGFycmF5KSB7XG4gICAgcmV0dXJuIGFycmF5LnJlZHVjZShmdW5jdGlvbiAobWluLCB2YWx1ZSkge1xuICAgICAgaWYgKCFpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIE1hdGgubWluKG1pbiwgdmFsdWUpXG4gICAgICB9XG4gICAgICByZXR1cm4gbWluXG4gICAgfSwgTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZKVxuICB9XG4gIGhlbHBlcnMuc2lnbiA9IE1hdGguc2lnblxuICAgID8gZnVuY3Rpb24gKHgpIHtcbiAgICAgIHJldHVybiBNYXRoLnNpZ24oeClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiAoeCkge1xuICAgICAgeCA9ICt4IC8vIGNvbnZlcnQgdG8gYSBudW1iZXJcbiAgICAgIGlmICh4ID09PSAwIHx8IGlzTmFOKHgpKSB7XG4gICAgICAgIHJldHVybiB4XG4gICAgICB9XG4gICAgICByZXR1cm4geCA+IDAgPyAxIDogLTFcbiAgICB9XG4gIGhlbHBlcnMubG9nMTAgPSBNYXRoLmxvZzEwXG4gICAgPyBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIE1hdGgubG9nMTAoeClcbiAgICB9XG4gICAgOiBmdW5jdGlvbiAoeCkge1xuICAgICAgcmV0dXJuIE1hdGgubG9nKHgpIC8gTWF0aC5MTjEwXG4gICAgfVxuICBoZWxwZXJzLnRvUmFkaWFucyA9IGZ1bmN0aW9uIChkZWdyZWVzKSB7XG4gICAgcmV0dXJuIGRlZ3JlZXMgKiAoTWF0aC5QSSAvIDE4MClcbiAgfVxuICBoZWxwZXJzLnRvRGVncmVlcyA9IGZ1bmN0aW9uIChyYWRpYW5zKSB7XG4gICAgcmV0dXJuIHJhZGlhbnMgKiAoMTgwIC8gTWF0aC5QSSlcbiAgfVxuICAvLyBHZXRzIHRoZSBhbmdsZSBmcm9tIHZlcnRpY2FsIHVwcmlnaHQgdG8gdGhlIHBvaW50IGFib3V0IGEgY2VudHJlLlxuICBoZWxwZXJzLmdldEFuZ2xlRnJvbVBvaW50ID0gZnVuY3Rpb24gKGNlbnRyZVBvaW50LCBhbmdsZVBvaW50KSB7XG4gICAgdmFyIGRpc3RhbmNlRnJvbVhDZW50ZXIgPSBhbmdsZVBvaW50LnggLSBjZW50cmVQb2ludC54LFxuICAgICAgZGlzdGFuY2VGcm9tWUNlbnRlciA9IGFuZ2xlUG9pbnQueSAtIGNlbnRyZVBvaW50LnksXG4gICAgICByYWRpYWxEaXN0YW5jZUZyb21DZW50ZXIgPSBNYXRoLnNxcnQoZGlzdGFuY2VGcm9tWENlbnRlciAqIGRpc3RhbmNlRnJvbVhDZW50ZXIgKyBkaXN0YW5jZUZyb21ZQ2VudGVyICogZGlzdGFuY2VGcm9tWUNlbnRlcilcblxuICAgIHZhciBhbmdsZSA9IE1hdGguYXRhbjIoZGlzdGFuY2VGcm9tWUNlbnRlciwgZGlzdGFuY2VGcm9tWENlbnRlcilcblxuICAgIGlmIChhbmdsZSA8ICgtMC41ICogTWF0aC5QSSkpIHtcbiAgICAgIGFuZ2xlICs9IDIuMCAqIE1hdGguUEkgLy8gbWFrZSBzdXJlIHRoZSByZXR1cm5lZCBhbmdsZSBpcyBpbiB0aGUgcmFuZ2Ugb2YgKC1QSS8yLCAzUEkvMl1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgYW5nbGU6IGFuZ2xlLFxuICAgICAgZGlzdGFuY2U6IHJhZGlhbERpc3RhbmNlRnJvbUNlbnRlclxuICAgIH1cbiAgfVxuICBoZWxwZXJzLmRpc3RhbmNlQmV0d2VlblBvaW50cyA9IGZ1bmN0aW9uIChwdDEsIHB0Mikge1xuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3cocHQyLnggLSBwdDEueCwgMikgKyBNYXRoLnBvdyhwdDIueSAtIHB0MS55LCAyKSlcbiAgfVxuICBoZWxwZXJzLmFsaWFzUGl4ZWwgPSBmdW5jdGlvbiAocGl4ZWxXaWR0aCkge1xuICAgIHJldHVybiAocGl4ZWxXaWR0aCAlIDIgPT09IDApID8gMCA6IDAuNVxuICB9XG4gIGhlbHBlcnMuc3BsaW5lQ3VydmUgPSBmdW5jdGlvbiAoZmlyc3RQb2ludCwgbWlkZGxlUG9pbnQsIGFmdGVyUG9pbnQsIHQpIHtcbiAgICAvLyBQcm9wcyB0byBSb2IgU3BlbmNlciBhdCBzY2FsZWQgaW5ub3ZhdGlvbiBmb3IgaGlzIHBvc3Qgb24gc3BsaW5pbmcgYmV0d2VlbiBwb2ludHNcbiAgICAvLyBodHRwOi8vc2NhbGVkaW5ub3ZhdGlvbi5jb20vYW5hbHl0aWNzL3NwbGluZXMvYWJvdXRTcGxpbmVzLmh0bWxcblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gbXVzdCBhbHNvIHJlc3BlY3QgXCJza2lwcGVkXCIgcG9pbnRzXG5cbiAgICB2YXIgcHJldmlvdXMgPSBmaXJzdFBvaW50LnNraXAgPyBtaWRkbGVQb2ludCA6IGZpcnN0UG9pbnQsXG4gICAgICBjdXJyZW50ID0gbWlkZGxlUG9pbnQsXG4gICAgICBuZXh0ID0gYWZ0ZXJQb2ludC5za2lwID8gbWlkZGxlUG9pbnQgOiBhZnRlclBvaW50XG5cbiAgICB2YXIgZDAxID0gTWF0aC5zcXJ0KE1hdGgucG93KGN1cnJlbnQueCAtIHByZXZpb3VzLngsIDIpICsgTWF0aC5wb3coY3VycmVudC55IC0gcHJldmlvdXMueSwgMikpXG4gICAgdmFyIGQxMiA9IE1hdGguc3FydChNYXRoLnBvdyhuZXh0LnggLSBjdXJyZW50LngsIDIpICsgTWF0aC5wb3cobmV4dC55IC0gY3VycmVudC55LCAyKSlcblxuICAgIHZhciBzMDEgPSBkMDEgLyAoZDAxICsgZDEyKVxuICAgIHZhciBzMTIgPSBkMTIgLyAoZDAxICsgZDEyKVxuXG4gICAgLy8gSWYgYWxsIHBvaW50cyBhcmUgdGhlIHNhbWUsIHMwMSAmIHMwMiB3aWxsIGJlIGluZlxuICAgIHMwMSA9IGlzTmFOKHMwMSkgPyAwIDogczAxXG4gICAgczEyID0gaXNOYU4oczEyKSA/IDAgOiBzMTJcblxuICAgIHZhciBmYSA9IHQgKiBzMDEgLy8gc2NhbGluZyBmYWN0b3IgZm9yIHRyaWFuZ2xlIFRhXG4gICAgdmFyIGZiID0gdCAqIHMxMlxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHByZXZpb3VzOiB7XG4gICAgICAgIHg6IGN1cnJlbnQueCAtIGZhICogKG5leHQueCAtIHByZXZpb3VzLngpLFxuICAgICAgICB5OiBjdXJyZW50LnkgLSBmYSAqIChuZXh0LnkgLSBwcmV2aW91cy55KVxuICAgICAgfSxcbiAgICAgIG5leHQ6IHtcbiAgICAgICAgeDogY3VycmVudC54ICsgZmIgKiAobmV4dC54IC0gcHJldmlvdXMueCksXG4gICAgICAgIHk6IGN1cnJlbnQueSArIGZiICogKG5leHQueSAtIHByZXZpb3VzLnkpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIGhlbHBlcnMuRVBTSUxPTiA9IE51bWJlci5FUFNJTE9OIHx8IDFlLTE0XG4gIGhlbHBlcnMuc3BsaW5lQ3VydmVNb25vdG9uZSA9IGZ1bmN0aW9uIChwb2ludHMpIHtcbiAgICAvLyBUaGlzIGZ1bmN0aW9uIGNhbGN1bGF0ZXMgQsOpemllciBjb250cm9sIHBvaW50cyBpbiBhIHNpbWlsYXIgd2F5IHRoYW4gfHNwbGluZUN1cnZlfCxcbiAgICAvLyBidXQgcHJlc2VydmVzIG1vbm90b25pY2l0eSBvZiB0aGUgcHJvdmlkZWQgZGF0YSBhbmQgZW5zdXJlcyBubyBsb2NhbCBleHRyZW11bXMgYXJlIGFkZGVkXG4gICAgLy8gYmV0d2VlbiB0aGUgZGF0YXNldCBkaXNjcmV0ZSBwb2ludHMgZHVlIHRvIHRoZSBpbnRlcnBvbGF0aW9uLlxuICAgIC8vIFNlZSA6IGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01vbm90b25lX2N1YmljX2ludGVycG9sYXRpb25cblxuICAgIHZhciBwb2ludHNXaXRoVGFuZ2VudHMgPSAocG9pbnRzIHx8IFtdKS5tYXAoZnVuY3Rpb24gKHBvaW50KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBtb2RlbDogcG9pbnQuX21vZGVsLFxuICAgICAgICBkZWx0YUs6IDAsXG4gICAgICAgIG1LOiAwXG4gICAgICB9XG4gICAgfSlcblxuICAgIC8vIENhbGN1bGF0ZSBzbG9wZXMgKGRlbHRhSykgYW5kIGluaXRpYWxpemUgdGFuZ2VudHMgKG1LKVxuICAgIHZhciBwb2ludHNMZW4gPSBwb2ludHNXaXRoVGFuZ2VudHMubGVuZ3RoXG4gICAgdmFyIGksIHBvaW50QmVmb3JlLCBwb2ludEN1cnJlbnQsIHBvaW50QWZ0ZXJcbiAgICBmb3IgKGkgPSAwOyBpIDwgcG9pbnRzTGVuOyArK2kpIHtcbiAgICAgIHBvaW50Q3VycmVudCA9IHBvaW50c1dpdGhUYW5nZW50c1tpXVxuICAgICAgaWYgKHBvaW50Q3VycmVudC5tb2RlbC5za2lwKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHBvaW50QmVmb3JlID0gaSA+IDAgPyBwb2ludHNXaXRoVGFuZ2VudHNbaSAtIDFdIDogbnVsbFxuICAgICAgcG9pbnRBZnRlciA9IGkgPCBwb2ludHNMZW4gLSAxID8gcG9pbnRzV2l0aFRhbmdlbnRzW2kgKyAxXSA6IG51bGxcbiAgICAgIGlmIChwb2ludEFmdGVyICYmICFwb2ludEFmdGVyLm1vZGVsLnNraXApIHtcbiAgICAgICAgdmFyIHNsb3BlRGVsdGFYID0gKHBvaW50QWZ0ZXIubW9kZWwueCAtIHBvaW50Q3VycmVudC5tb2RlbC54KVxuXG4gICAgICAgIC8vIEluIHRoZSBjYXNlIG9mIHR3byBwb2ludHMgdGhhdCBhcHBlYXIgYXQgdGhlIHNhbWUgeCBwaXhlbCwgc2xvcGVEZWx0YVggaXMgMFxuICAgICAgICBwb2ludEN1cnJlbnQuZGVsdGFLID0gc2xvcGVEZWx0YVggIT09IDAgPyAocG9pbnRBZnRlci5tb2RlbC55IC0gcG9pbnRDdXJyZW50Lm1vZGVsLnkpIC8gc2xvcGVEZWx0YVggOiAwXG4gICAgICB9XG5cbiAgICAgIGlmICghcG9pbnRCZWZvcmUgfHwgcG9pbnRCZWZvcmUubW9kZWwuc2tpcCkge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgICB9IGVsc2UgaWYgKCFwb2ludEFmdGVyIHx8IHBvaW50QWZ0ZXIubW9kZWwuc2tpcCkge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSBwb2ludEJlZm9yZS5kZWx0YUtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5zaWduKHBvaW50QmVmb3JlLmRlbHRhSykgIT09IHRoaXMuc2lnbihwb2ludEN1cnJlbnQuZGVsdGFLKSkge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSAwXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSAocG9pbnRCZWZvcmUuZGVsdGFLICsgcG9pbnRDdXJyZW50LmRlbHRhSykgLyAyXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQWRqdXN0IHRhbmdlbnRzIHRvIGVuc3VyZSBtb25vdG9uaWMgcHJvcGVydGllc1xuICAgIHZhciBhbHBoYUssIGJldGFLLCB0YXVLLCBzcXVhcmVkTWFnbml0dWRlXG4gICAgZm9yIChpID0gMDsgaSA8IHBvaW50c0xlbiAtIDE7ICsraSkge1xuICAgICAgcG9pbnRDdXJyZW50ID0gcG9pbnRzV2l0aFRhbmdlbnRzW2ldXG4gICAgICBwb2ludEFmdGVyID0gcG9pbnRzV2l0aFRhbmdlbnRzW2kgKyAxXVxuICAgICAgaWYgKHBvaW50Q3VycmVudC5tb2RlbC5za2lwIHx8IHBvaW50QWZ0ZXIubW9kZWwuc2tpcCkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZiAoaGVscGVycy5hbG1vc3RFcXVhbHMocG9pbnRDdXJyZW50LmRlbHRhSywgMCwgdGhpcy5FUFNJTE9OKSkge1xuICAgICAgICBwb2ludEN1cnJlbnQubUsgPSBwb2ludEFmdGVyLm1LID0gMFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBhbHBoYUsgPSBwb2ludEN1cnJlbnQubUsgLyBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgICBiZXRhSyA9IHBvaW50QWZ0ZXIubUsgLyBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgICBzcXVhcmVkTWFnbml0dWRlID0gTWF0aC5wb3coYWxwaGFLLCAyKSArIE1hdGgucG93KGJldGFLLCAyKVxuICAgICAgaWYgKHNxdWFyZWRNYWduaXR1ZGUgPD0gOSkge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICB0YXVLID0gMyAvIE1hdGguc3FydChzcXVhcmVkTWFnbml0dWRlKVxuICAgICAgcG9pbnRDdXJyZW50Lm1LID0gYWxwaGFLICogdGF1SyAqIHBvaW50Q3VycmVudC5kZWx0YUtcbiAgICAgIHBvaW50QWZ0ZXIubUsgPSBiZXRhSyAqIHRhdUsgKiBwb2ludEN1cnJlbnQuZGVsdGFLXG4gICAgfVxuXG4gICAgLy8gQ29tcHV0ZSBjb250cm9sIHBvaW50c1xuICAgIHZhciBkZWx0YVhcbiAgICBmb3IgKGkgPSAwOyBpIDwgcG9pbnRzTGVuOyArK2kpIHtcbiAgICAgIHBvaW50Q3VycmVudCA9IHBvaW50c1dpdGhUYW5nZW50c1tpXVxuICAgICAgaWYgKHBvaW50Q3VycmVudC5tb2RlbC5za2lwKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHBvaW50QmVmb3JlID0gaSA+IDAgPyBwb2ludHNXaXRoVGFuZ2VudHNbaSAtIDFdIDogbnVsbFxuICAgICAgcG9pbnRBZnRlciA9IGkgPCBwb2ludHNMZW4gLSAxID8gcG9pbnRzV2l0aFRhbmdlbnRzW2kgKyAxXSA6IG51bGxcbiAgICAgIGlmIChwb2ludEJlZm9yZSAmJiAhcG9pbnRCZWZvcmUubW9kZWwuc2tpcCkge1xuICAgICAgICBkZWx0YVggPSAocG9pbnRDdXJyZW50Lm1vZGVsLnggLSBwb2ludEJlZm9yZS5tb2RlbC54KSAvIDNcbiAgICAgICAgcG9pbnRDdXJyZW50Lm1vZGVsLmNvbnRyb2xQb2ludFByZXZpb3VzWCA9IHBvaW50Q3VycmVudC5tb2RlbC54IC0gZGVsdGFYXG4gICAgICAgIHBvaW50Q3VycmVudC5tb2RlbC5jb250cm9sUG9pbnRQcmV2aW91c1kgPSBwb2ludEN1cnJlbnQubW9kZWwueSAtIGRlbHRhWCAqIHBvaW50Q3VycmVudC5tS1xuICAgICAgfVxuICAgICAgaWYgKHBvaW50QWZ0ZXIgJiYgIXBvaW50QWZ0ZXIubW9kZWwuc2tpcCkge1xuICAgICAgICBkZWx0YVggPSAocG9pbnRBZnRlci5tb2RlbC54IC0gcG9pbnRDdXJyZW50Lm1vZGVsLngpIC8gM1xuICAgICAgICBwb2ludEN1cnJlbnQubW9kZWwuY29udHJvbFBvaW50TmV4dFggPSBwb2ludEN1cnJlbnQubW9kZWwueCArIGRlbHRhWFxuICAgICAgICBwb2ludEN1cnJlbnQubW9kZWwuY29udHJvbFBvaW50TmV4dFkgPSBwb2ludEN1cnJlbnQubW9kZWwueSArIGRlbHRhWCAqIHBvaW50Q3VycmVudC5tS1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLm5leHRJdGVtID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24sIGluZGV4LCBsb29wKSB7XG4gICAgaWYgKGxvb3ApIHtcbiAgICAgIHJldHVybiBpbmRleCA+PSBjb2xsZWN0aW9uLmxlbmd0aCAtIDEgPyBjb2xsZWN0aW9uWzBdIDogY29sbGVjdGlvbltpbmRleCArIDFdXG4gICAgfVxuICAgIHJldHVybiBpbmRleCA+PSBjb2xsZWN0aW9uLmxlbmd0aCAtIDEgPyBjb2xsZWN0aW9uW2NvbGxlY3Rpb24ubGVuZ3RoIC0gMV0gOiBjb2xsZWN0aW9uW2luZGV4ICsgMV1cbiAgfVxuICBoZWxwZXJzLnByZXZpb3VzSXRlbSA9IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBpbmRleCwgbG9vcCkge1xuICAgIGlmIChsb29wKSB7XG4gICAgICByZXR1cm4gaW5kZXggPD0gMCA/IGNvbGxlY3Rpb25bY29sbGVjdGlvbi5sZW5ndGggLSAxXSA6IGNvbGxlY3Rpb25baW5kZXggLSAxXVxuICAgIH1cbiAgICByZXR1cm4gaW5kZXggPD0gMCA/IGNvbGxlY3Rpb25bMF0gOiBjb2xsZWN0aW9uW2luZGV4IC0gMV1cbiAgfVxuICAvLyBJbXBsZW1lbnRhdGlvbiBvZiB0aGUgbmljZSBudW1iZXIgYWxnb3JpdGhtIHVzZWQgaW4gZGV0ZXJtaW5pbmcgd2hlcmUgYXhpcyBsYWJlbHMgd2lsbCBnb1xuICBoZWxwZXJzLm5pY2VOdW0gPSBmdW5jdGlvbiAocmFuZ2UsIHJvdW5kKSB7XG4gICAgdmFyIGV4cG9uZW50ID0gTWF0aC5mbG9vcihoZWxwZXJzLmxvZzEwKHJhbmdlKSlcbiAgICB2YXIgZnJhY3Rpb24gPSByYW5nZSAvIE1hdGgucG93KDEwLCBleHBvbmVudClcbiAgICB2YXIgbmljZUZyYWN0aW9uXG5cbiAgICBpZiAocm91bmQpIHtcbiAgICAgIGlmIChmcmFjdGlvbiA8IDEuNSkge1xuICAgICAgICBuaWNlRnJhY3Rpb24gPSAxXG4gICAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDwgMykge1xuICAgICAgICBuaWNlRnJhY3Rpb24gPSAyXG4gICAgICB9IGVsc2UgaWYgKGZyYWN0aW9uIDwgNykge1xuICAgICAgICBuaWNlRnJhY3Rpb24gPSA1XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuaWNlRnJhY3Rpb24gPSAxMFxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZnJhY3Rpb24gPD0gMS4wKSB7XG4gICAgICBuaWNlRnJhY3Rpb24gPSAxXG4gICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8PSAyKSB7XG4gICAgICBuaWNlRnJhY3Rpb24gPSAyXG4gICAgfSBlbHNlIGlmIChmcmFjdGlvbiA8PSA1KSB7XG4gICAgICBuaWNlRnJhY3Rpb24gPSA1XG4gICAgfSBlbHNlIHtcbiAgICAgIG5pY2VGcmFjdGlvbiA9IDEwXG4gICAgfVxuXG4gICAgcmV0dXJuIG5pY2VGcmFjdGlvbiAqIE1hdGgucG93KDEwLCBleHBvbmVudClcbiAgfVxuICAvLyBFYXNpbmcgZnVuY3Rpb25zIGFkYXB0ZWQgZnJvbSBSb2JlcnQgUGVubmVyJ3MgZWFzaW5nIGVxdWF0aW9uc1xuICAvLyBodHRwOi8vd3d3LnJvYmVydHBlbm5lci5jb20vZWFzaW5nL1xuICB2YXIgZWFzaW5nRWZmZWN0cyA9IGhlbHBlcnMuZWFzaW5nRWZmZWN0cyA9IHtcbiAgICBsaW5lYXI6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gdFxuICAgIH0sXG4gICAgZWFzZUluUXVhZDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiB0ICogdFxuICAgIH0sXG4gICAgZWFzZU91dFF1YWQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gLTEgKiB0ICogKHQgLSAyKVxuICAgIH0sXG4gICAgZWFzZUluT3V0UXVhZDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqIHQgKiB0XG4gICAgICB9XG4gICAgICByZXR1cm4gLTEgLyAyICogKCgtLXQpICogKHQgLSAyKSAtIDEpXG4gICAgfSxcbiAgICBlYXNlSW5DdWJpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiB0ICogdCAqIHRcbiAgICB9LFxuICAgIGVhc2VPdXRDdWJpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxICogKCh0ID0gdCAvIDEgLSAxKSAqIHQgKiB0ICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dEN1YmljOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogdCAqIHQgKiB0XG4gICAgICB9XG4gICAgICByZXR1cm4gMSAvIDIgKiAoKHQgLT0gMikgKiB0ICogdCArIDIpXG4gICAgfSxcbiAgICBlYXNlSW5RdWFydDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiB0ICogdCAqIHQgKiB0XG4gICAgfSxcbiAgICBlYXNlT3V0UXVhcnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gLTEgKiAoKHQgPSB0IC8gMSAtIDEpICogdCAqIHQgKiB0IC0gMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dFF1YXJ0OiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogdCAqIHQgKiB0ICogdFxuICAgICAgfVxuICAgICAgcmV0dXJuIC0xIC8gMiAqICgodCAtPSAyKSAqIHQgKiB0ICogdCAtIDIpXG4gICAgfSxcbiAgICBlYXNlSW5RdWludDogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxICogKHQgLz0gMSkgKiB0ICogdCAqIHQgKiB0XG4gICAgfSxcbiAgICBlYXNlT3V0UXVpbnQ6IGZ1bmN0aW9uICh0KSB7XG4gICAgICByZXR1cm4gMSAqICgodCA9IHQgLyAxIC0gMSkgKiB0ICogdCAqIHQgKiB0ICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dFF1aW50OiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogdCAqIHQgKiB0ICogdCAqIHRcbiAgICAgIH1cbiAgICAgIHJldHVybiAxIC8gMiAqICgodCAtPSAyKSAqIHQgKiB0ICogdCAqIHQgKyAyKVxuICAgIH0sXG4gICAgZWFzZUluU2luZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAtMSAqIE1hdGguY29zKHQgLyAxICogKE1hdGguUEkgLyAyKSkgKyAxXG4gICAgfSxcbiAgICBlYXNlT3V0U2luZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAxICogTWF0aC5zaW4odCAvIDEgKiAoTWF0aC5QSSAvIDIpKVxuICAgIH0sXG4gICAgZWFzZUluT3V0U2luZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHJldHVybiAtMSAvIDIgKiAoTWF0aC5jb3MoTWF0aC5QSSAqIHQgLyAxKSAtIDEpXG4gICAgfSxcbiAgICBlYXNlSW5FeHBvOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuICh0ID09PSAwKSA/IDEgOiAxICogTWF0aC5wb3coMiwgMTAgKiAodCAvIDEgLSAxKSlcbiAgICB9LFxuICAgIGVhc2VPdXRFeHBvOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuICh0ID09PSAxKSA/IDEgOiAxICogKC1NYXRoLnBvdygyLCAtMTAgKiB0IC8gMSkgKyAxKVxuICAgIH0sXG4gICAgZWFzZUluT3V0RXhwbzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICh0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgICBpZiAodCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIDEgLyAyICogTWF0aC5wb3coMiwgMTAgKiAodCAtIDEpKVxuICAgICAgfVxuICAgICAgcmV0dXJuIDEgLyAyICogKC1NYXRoLnBvdygyLCAtMTAgKiAtLXQpICsgMilcbiAgICB9LFxuICAgIGVhc2VJbkNpcmM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICBpZiAodCA+PSAxKSB7XG4gICAgICAgIHJldHVybiB0XG4gICAgICB9XG4gICAgICByZXR1cm4gLTEgKiAoTWF0aC5zcXJ0KDEgLSAodCAvPSAxKSAqIHQpIC0gMSlcbiAgICB9LFxuICAgIGVhc2VPdXRDaXJjOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgKiBNYXRoLnNxcnQoMSAtICh0ID0gdCAvIDEgLSAxKSAqIHQpXG4gICAgfSxcbiAgICBlYXNlSW5PdXRDaXJjOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEgLyAyKSA8IDEpIHtcbiAgICAgICAgcmV0dXJuIC0xIC8gMiAqIChNYXRoLnNxcnQoMSAtIHQgKiB0KSAtIDEpXG4gICAgICB9XG4gICAgICByZXR1cm4gMSAvIDIgKiAoTWF0aC5zcXJ0KDEgLSAodCAtPSAyKSAqIHQpICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbkVsYXN0aWM6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIHZhciBwID0gMFxuICAgICAgdmFyIGEgPSAxXG4gICAgICBpZiAodCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuICAgICAgaWYgKCh0IC89IDEpID09PSAxKSB7XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9XG4gICAgICBpZiAoIXApIHtcbiAgICAgICAgcCA9IDEgKiAwLjNcbiAgICAgIH1cbiAgICAgIGlmIChhIDwgTWF0aC5hYnMoMSkpIHtcbiAgICAgICAgYSA9IDFcbiAgICAgICAgcyA9IHAgLyA0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzID0gcCAvICgyICogTWF0aC5QSSkgKiBNYXRoLmFzaW4oMSAvIGEpXG4gICAgICB9XG4gICAgICByZXR1cm4gLShhICogTWF0aC5wb3coMiwgMTAgKiAodCAtPSAxKSkgKiBNYXRoLnNpbigodCAqIDEgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSlcbiAgICB9LFxuICAgIGVhc2VPdXRFbGFzdGljOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICB2YXIgcCA9IDBcbiAgICAgIHZhciBhID0gMVxuICAgICAgaWYgKHQgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH1cbiAgICAgIGlmICgodCAvPSAxKSA9PT0gMSkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfVxuICAgICAgaWYgKCFwKSB7XG4gICAgICAgIHAgPSAxICogMC4zXG4gICAgICB9XG4gICAgICBpZiAoYSA8IE1hdGguYWJzKDEpKSB7XG4gICAgICAgIGEgPSAxXG4gICAgICAgIHMgPSBwIC8gNFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcyA9IHAgLyAoMiAqIE1hdGguUEkpICogTWF0aC5hc2luKDEgLyBhKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGEgKiBNYXRoLnBvdygyLCAtMTAgKiB0KSAqIE1hdGguc2luKCh0ICogMSAtIHMpICogKDIgKiBNYXRoLlBJKSAvIHApICsgMVxuICAgIH0sXG4gICAgZWFzZUluT3V0RWxhc3RpYzogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgdmFyIHAgPSAwXG4gICAgICB2YXIgYSA9IDFcbiAgICAgIGlmICh0ID09PSAwKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9XG4gICAgICBpZiAoKHQgLz0gMSAvIDIpID09PSAyKSB7XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9XG4gICAgICBpZiAoIXApIHtcbiAgICAgICAgcCA9IDEgKiAoMC4zICogMS41KVxuICAgICAgfVxuICAgICAgaWYgKGEgPCBNYXRoLmFicygxKSkge1xuICAgICAgICBhID0gMVxuICAgICAgICBzID0gcCAvIDRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHMgPSBwIC8gKDIgKiBNYXRoLlBJKSAqIE1hdGguYXNpbigxIC8gYSlcbiAgICAgIH1cbiAgICAgIGlmICh0IDwgMSkge1xuICAgICAgICByZXR1cm4gLTAuNSAqIChhICogTWF0aC5wb3coMiwgMTAgKiAodCAtPSAxKSkgKiBNYXRoLnNpbigodCAqIDEgLSBzKSAqICgyICogTWF0aC5QSSkgLyBwKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiBhICogTWF0aC5wb3coMiwgLTEwICogKHQgLT0gMSkpICogTWF0aC5zaW4oKHQgKiAxIC0gcykgKiAoMiAqIE1hdGguUEkpIC8gcCkgKiAwLjUgKyAxXG4gICAgfSxcbiAgICBlYXNlSW5CYWNrOiBmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHMgPSAxLjcwMTU4XG4gICAgICByZXR1cm4gMSAqICh0IC89IDEpICogdCAqICgocyArIDEpICogdCAtIHMpXG4gICAgfSxcbiAgICBlYXNlT3V0QmFjazogZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciBzID0gMS43MDE1OFxuICAgICAgcmV0dXJuIDEgKiAoKHQgPSB0IC8gMSAtIDEpICogdCAqICgocyArIDEpICogdCArIHMpICsgMSlcbiAgICB9LFxuICAgIGVhc2VJbk91dEJhY2s6IGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgcyA9IDEuNzAxNThcbiAgICAgIGlmICgodCAvPSAxIC8gMikgPCAxKSB7XG4gICAgICAgIHJldHVybiAxIC8gMiAqICh0ICogdCAqICgoKHMgKj0gKDEuNTI1KSkgKyAxKSAqIHQgLSBzKSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAxIC8gMiAqICgodCAtPSAyKSAqIHQgKiAoKChzICo9ICgxLjUyNSkpICsgMSkgKiB0ICsgcykgKyAyKVxuICAgIH0sXG4gICAgZWFzZUluQm91bmNlOiBmdW5jdGlvbiAodCkge1xuICAgICAgcmV0dXJuIDEgLSBlYXNpbmdFZmZlY3RzLmVhc2VPdXRCb3VuY2UoMSAtIHQpXG4gICAgfSxcbiAgICBlYXNlT3V0Qm91bmNlOiBmdW5jdGlvbiAodCkge1xuICAgICAgaWYgKCh0IC89IDEpIDwgKDEgLyAyLjc1KSkge1xuICAgICAgICByZXR1cm4gMSAqICg3LjU2MjUgKiB0ICogdClcbiAgICAgIH0gZWxzZSBpZiAodCA8ICgyIC8gMi43NSkpIHtcbiAgICAgICAgcmV0dXJuIDEgKiAoNy41NjI1ICogKHQgLT0gKDEuNSAvIDIuNzUpKSAqIHQgKyAwLjc1KVxuICAgICAgfSBlbHNlIGlmICh0IDwgKDIuNSAvIDIuNzUpKSB7XG4gICAgICAgIHJldHVybiAxICogKDcuNTYyNSAqICh0IC09ICgyLjI1IC8gMi43NSkpICogdCArIDAuOTM3NSlcbiAgICAgIH1cbiAgICAgIHJldHVybiAxICogKDcuNTYyNSAqICh0IC09ICgyLjYyNSAvIDIuNzUpKSAqIHQgKyAwLjk4NDM3NSlcbiAgICB9LFxuICAgIGVhc2VJbk91dEJvdW5jZTogZnVuY3Rpb24gKHQpIHtcbiAgICAgIGlmICh0IDwgMSAvIDIpIHtcbiAgICAgICAgcmV0dXJuIGVhc2luZ0VmZmVjdHMuZWFzZUluQm91bmNlKHQgKiAyKSAqIDAuNVxuICAgICAgfVxuICAgICAgcmV0dXJuIGVhc2luZ0VmZmVjdHMuZWFzZU91dEJvdW5jZSh0ICogMiAtIDEpICogMC41ICsgMSAqIDAuNVxuICAgIH1cbiAgfVxuICBcbiAgLy8gLS0gRE9NIG1ldGhvZHNcbiAgaGVscGVycy5nZXRSZWxhdGl2ZVBvc2l0aW9uID0gZnVuY3Rpb24gKGV2dCwgY2hhcnQpIHtcbiAgICB2YXIgbW91c2VYLCBtb3VzZVlcbiAgICB2YXIgZSA9IGV2dC5vcmlnaW5hbEV2ZW50IHx8IGV2dCxcbiAgICAgIGNhbnZhcyA9IGV2dC5jdXJyZW50VGFyZ2V0IHx8IGV2dC5zcmNFbGVtZW50LFxuICAgICAgYm91bmRpbmdSZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG5cbiAgICB2YXIgdG91Y2hlcyA9IGUudG91Y2hlc1xuICAgIGlmICh0b3VjaGVzICYmIHRvdWNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgbW91c2VYID0gdG91Y2hlc1swXS5jbGllbnRYXG4gICAgICBtb3VzZVkgPSB0b3VjaGVzWzBdLmNsaWVudFlcbiAgICB9IGVsc2Uge1xuICAgICAgbW91c2VYID0gZS5jbGllbnRYXG4gICAgICBtb3VzZVkgPSBlLmNsaWVudFlcbiAgICB9XG5cbiAgICAvLyBTY2FsZSBtb3VzZSBjb29yZGluYXRlcyBpbnRvIGNhbnZhcyBjb29yZGluYXRlc1xuICAgIC8vIGJ5IGZvbGxvd2luZyB0aGUgcGF0dGVybiBsYWlkIG91dCBieSAnamVycnlqJyBpbiB0aGUgY29tbWVudHMgb2ZcbiAgICAvLyBodHRwOi8vd3d3Lmh0bWw1Y2FudmFzdHV0b3JpYWxzLmNvbS9hZHZhbmNlZC9odG1sNS1jYW52YXMtbW91c2UtY29vcmRpbmF0ZXMvXG4gICAgdmFyIHBhZGRpbmdMZWZ0ID0gcGFyc2VGbG9hdChoZWxwZXJzLmdldFN0eWxlKGNhbnZhcywgJ3BhZGRpbmctbGVmdCcpKVxuICAgIHZhciBwYWRkaW5nVG9wID0gcGFyc2VGbG9hdChoZWxwZXJzLmdldFN0eWxlKGNhbnZhcywgJ3BhZGRpbmctdG9wJykpXG4gICAgdmFyIHBhZGRpbmdSaWdodCA9IHBhcnNlRmxvYXQoaGVscGVycy5nZXRTdHlsZShjYW52YXMsICdwYWRkaW5nLXJpZ2h0JykpXG4gICAgdmFyIHBhZGRpbmdCb3R0b20gPSBwYXJzZUZsb2F0KGhlbHBlcnMuZ2V0U3R5bGUoY2FudmFzLCAncGFkZGluZy1ib3R0b20nKSlcbiAgICB2YXIgd2lkdGggPSBib3VuZGluZ1JlY3QucmlnaHQgLSBib3VuZGluZ1JlY3QubGVmdCAtIHBhZGRpbmdMZWZ0IC0gcGFkZGluZ1JpZ2h0XG4gICAgdmFyIGhlaWdodCA9IGJvdW5kaW5nUmVjdC5ib3R0b20gLSBib3VuZGluZ1JlY3QudG9wIC0gcGFkZGluZ1RvcCAtIHBhZGRpbmdCb3R0b21cblxuICAgIC8vIFdlIGRpdmlkZSBieSB0aGUgY3VycmVudCBkZXZpY2UgcGl4ZWwgcmF0aW8sIGJlY2F1c2UgdGhlIGNhbnZhcyBpcyBzY2FsZWQgdXAgYnkgdGhhdCBhbW91bnQgaW4gZWFjaCBkaXJlY3Rpb24uIEhvd2V2ZXJcbiAgICAvLyB0aGUgYmFja2VuZCBtb2RlbCBpcyBpbiB1bnNjYWxlZCBjb29yZGluYXRlcy4gU2luY2Ugd2UgYXJlIGdvaW5nIHRvIGRlYWwgd2l0aCBvdXIgbW9kZWwgY29vcmRpbmF0ZXMsIHdlIGdvIGJhY2sgaGVyZVxuICAgIG1vdXNlWCA9IE1hdGgucm91bmQoKG1vdXNlWCAtIGJvdW5kaW5nUmVjdC5sZWZ0IC0gcGFkZGluZ0xlZnQpIC8gKHdpZHRoKSAqIGNhbnZhcy53aWR0aCAvIGNoYXJ0LmN1cnJlbnREZXZpY2VQaXhlbFJhdGlvKVxuICAgIG1vdXNlWSA9IE1hdGgucm91bmQoKG1vdXNlWSAtIGJvdW5kaW5nUmVjdC50b3AgLSBwYWRkaW5nVG9wKSAvIChoZWlnaHQpICogY2FudmFzLmhlaWdodCAvIGNoYXJ0LmN1cnJlbnREZXZpY2VQaXhlbFJhdGlvKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHg6IG1vdXNlWCxcbiAgICAgIHk6IG1vdXNlWVxuICAgIH1cbiAgfVxuICBoZWxwZXJzLmFkZEV2ZW50ID0gZnVuY3Rpb24gKG5vZGUsIGV2ZW50VHlwZSwgbWV0aG9kKSB7XG4gICAgaWYgKG5vZGUuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgbWV0aG9kKVxuICAgIH0gZWxzZSBpZiAobm9kZS5hdHRhY2hFdmVudCkge1xuICAgICAgbm9kZS5hdHRhY2hFdmVudCgnb24nICsgZXZlbnRUeXBlLCBtZXRob2QpXG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGVbJ29uJyArIGV2ZW50VHlwZV0gPSBtZXRob2RcbiAgICB9XG4gIH1cbiAgaGVscGVycy5yZW1vdmVFdmVudCA9IGZ1bmN0aW9uIChub2RlLCBldmVudFR5cGUsIGhhbmRsZXIpIHtcbiAgICBpZiAobm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKSB7XG4gICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBoYW5kbGVyLCBmYWxzZSlcbiAgICB9IGVsc2UgaWYgKG5vZGUuZGV0YWNoRXZlbnQpIHtcbiAgICAgIG5vZGUuZGV0YWNoRXZlbnQoJ29uJyArIGV2ZW50VHlwZSwgaGFuZGxlcilcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZVsnb24nICsgZXZlbnRUeXBlXSA9IGhlbHBlcnMubm9vcFxuICAgIH1cbiAgfVxuXG4gIC8vIFByaXZhdGUgaGVscGVyIGZ1bmN0aW9uIHRvIGNvbnZlcnQgbWF4LXdpZHRoL21heC1oZWlnaHQgdmFsdWVzIHRoYXQgbWF5IGJlIHBlcmNlbnRhZ2VzIGludG8gYSBudW1iZXJcbiAgZnVuY3Rpb24gcGFyc2VNYXhTdHlsZSAoc3R5bGVWYWx1ZSwgbm9kZSwgcGFyZW50UHJvcGVydHkpIHtcbiAgICB2YXIgdmFsdWVJblBpeGVsc1xuICAgIGlmICh0eXBlb2YgKHN0eWxlVmFsdWUpID09PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWVJblBpeGVscyA9IHBhcnNlSW50KHN0eWxlVmFsdWUsIDEwKVxuXG4gICAgICBpZiAoc3R5bGVWYWx1ZS5pbmRleE9mKCclJykgIT09IC0xKSB7XG4gICAgICAgIC8vIHBlcmNlbnRhZ2UgKiBzaXplIGluIGRpbWVuc2lvblxuICAgICAgICB2YWx1ZUluUGl4ZWxzID0gdmFsdWVJblBpeGVscyAvIDEwMCAqIG5vZGUucGFyZW50Tm9kZVtwYXJlbnRQcm9wZXJ0eV1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWVJblBpeGVscyA9IHN0eWxlVmFsdWVcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWVJblBpeGVsc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgaWYgdGhlIGdpdmVuIHZhbHVlIGNvbnRhaW5zIGFuIGVmZmVjdGl2ZSBjb25zdHJhaW50LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZnVuY3Rpb24gaXNDb25zdHJhaW5lZFZhbHVlICh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSAnbm9uZSdcbiAgfVxuXG4gIC8vIFByaXZhdGUgaGVscGVyIHRvIGdldCBhIGNvbnN0cmFpbnQgZGltZW5zaW9uXG4gIC8vIEBwYXJhbSBkb21Ob2RlIDogdGhlIG5vZGUgdG8gY2hlY2sgdGhlIGNvbnN0cmFpbnQgb25cbiAgLy8gQHBhcmFtIG1heFN0eWxlIDogdGhlIHN0eWxlIHRoYXQgZGVmaW5lcyB0aGUgbWF4aW11bSBmb3IgdGhlIGRpcmVjdGlvbiB3ZSBhcmUgdXNpbmcgKG1heFdpZHRoIC8gbWF4SGVpZ2h0KVxuICAvLyBAcGFyYW0gcGVyY2VudGFnZVByb3BlcnR5IDogcHJvcGVydHkgb2YgcGFyZW50IHRvIHVzZSB3aGVuIGNhbGN1bGF0aW5nIHdpZHRoIGFzIGEgcGVyY2VudGFnZVxuICAvLyBAc2VlIGh0dHA6Ly93d3cubmF0aGFuYWVsam9uZXMuY29tL2Jsb2cvMjAxMy9yZWFkaW5nLW1heC13aWR0aC1jcm9zcy1icm93c2VyXG4gIGZ1bmN0aW9uIGdldENvbnN0cmFpbnREaW1lbnNpb24gKGRvbU5vZGUsIG1heFN0eWxlLCBwZXJjZW50YWdlUHJvcGVydHkpIHtcbiAgICB2YXIgdmlldyA9IGRvY3VtZW50LmRlZmF1bHRWaWV3XG4gICAgdmFyIHBhcmVudE5vZGUgPSBkb21Ob2RlLnBhcmVudE5vZGVcbiAgICB2YXIgY29uc3RyYWluZWROb2RlID0gdmlldy5nZXRDb21wdXRlZFN0eWxlKGRvbU5vZGUpW21heFN0eWxlXVxuICAgIHZhciBjb25zdHJhaW5lZENvbnRhaW5lciA9IHZpZXcuZ2V0Q29tcHV0ZWRTdHlsZShwYXJlbnROb2RlKVttYXhTdHlsZV1cbiAgICB2YXIgaGFzQ05vZGUgPSBpc0NvbnN0cmFpbmVkVmFsdWUoY29uc3RyYWluZWROb2RlKVxuICAgIHZhciBoYXNDQ29udGFpbmVyID0gaXNDb25zdHJhaW5lZFZhbHVlKGNvbnN0cmFpbmVkQ29udGFpbmVyKVxuICAgIHZhciBpbmZpbml0eSA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWVxuXG4gICAgaWYgKGhhc0NOb2RlIHx8IGhhc0NDb250YWluZXIpIHtcbiAgICAgIHJldHVybiBNYXRoLm1pbihcbiAgICAgICAgaGFzQ05vZGUgPyBwYXJzZU1heFN0eWxlKGNvbnN0cmFpbmVkTm9kZSwgZG9tTm9kZSwgcGVyY2VudGFnZVByb3BlcnR5KSA6IGluZmluaXR5LFxuICAgICAgICBoYXNDQ29udGFpbmVyID8gcGFyc2VNYXhTdHlsZShjb25zdHJhaW5lZENvbnRhaW5lciwgcGFyZW50Tm9kZSwgcGVyY2VudGFnZVByb3BlcnR5KSA6IGluZmluaXR5KVxuICAgIH1cblxuICAgIHJldHVybiAnbm9uZSdcbiAgfVxuICAvLyByZXR1cm5zIE51bWJlciBvciB1bmRlZmluZWQgaWYgbm8gY29uc3RyYWludFxuICBoZWxwZXJzLmdldENvbnN0cmFpbnRXaWR0aCA9IGZ1bmN0aW9uIChkb21Ob2RlKSB7XG4gICAgcmV0dXJuIGdldENvbnN0cmFpbnREaW1lbnNpb24oZG9tTm9kZSwgJ21heC13aWR0aCcsICdjbGllbnRXaWR0aCcpXG4gIH1cbiAgLy8gcmV0dXJucyBOdW1iZXIgb3IgdW5kZWZpbmVkIGlmIG5vIGNvbnN0cmFpbnRcbiAgaGVscGVycy5nZXRDb25zdHJhaW50SGVpZ2h0ID0gZnVuY3Rpb24gKGRvbU5vZGUpIHtcbiAgICByZXR1cm4gZ2V0Q29uc3RyYWludERpbWVuc2lvbihkb21Ob2RlLCAnbWF4LWhlaWdodCcsICdjbGllbnRIZWlnaHQnKVxuICB9XG4gIGhlbHBlcnMuZ2V0TWF4aW11bVdpZHRoID0gZnVuY3Rpb24gKGRvbU5vZGUpIHtcbiAgICB2YXIgY29udGFpbmVyID0gZG9tTm9kZS5wYXJlbnROb2RlXG4gICAgdmFyIHBhZGRpbmdMZWZ0ID0gcGFyc2VJbnQoaGVscGVycy5nZXRTdHlsZShjb250YWluZXIsICdwYWRkaW5nLWxlZnQnKSwgMTApXG4gICAgdmFyIHBhZGRpbmdSaWdodCA9IHBhcnNlSW50KGhlbHBlcnMuZ2V0U3R5bGUoY29udGFpbmVyLCAncGFkZGluZy1yaWdodCcpLCAxMClcbiAgICB2YXIgdyA9IGNvbnRhaW5lci5jbGllbnRXaWR0aCAtIHBhZGRpbmdMZWZ0IC0gcGFkZGluZ1JpZ2h0XG4gICAgdmFyIGN3ID0gaGVscGVycy5nZXRDb25zdHJhaW50V2lkdGgoZG9tTm9kZSlcbiAgICByZXR1cm4gaXNOYU4oY3cpID8gdyA6IE1hdGgubWluKHcsIGN3KVxuICB9XG4gIGhlbHBlcnMuZ2V0TWF4aW11bUhlaWdodCA9IGZ1bmN0aW9uIChkb21Ob2RlKSB7XG4gICAgdmFyIGNvbnRhaW5lciA9IGRvbU5vZGUucGFyZW50Tm9kZVxuICAgIHZhciBwYWRkaW5nVG9wID0gcGFyc2VJbnQoaGVscGVycy5nZXRTdHlsZShjb250YWluZXIsICdwYWRkaW5nLXRvcCcpLCAxMClcbiAgICB2YXIgcGFkZGluZ0JvdHRvbSA9IHBhcnNlSW50KGhlbHBlcnMuZ2V0U3R5bGUoY29udGFpbmVyLCAncGFkZGluZy1ib3R0b20nKSwgMTApXG4gICAgdmFyIGggPSBjb250YWluZXIuY2xpZW50SGVpZ2h0IC0gcGFkZGluZ1RvcCAtIHBhZGRpbmdCb3R0b21cbiAgICB2YXIgY2ggPSBoZWxwZXJzLmdldENvbnN0cmFpbnRIZWlnaHQoZG9tTm9kZSlcbiAgICByZXR1cm4gaXNOYU4oY2gpID8gaCA6IE1hdGgubWluKGgsIGNoKVxuICB9XG4gIGhlbHBlcnMuZ2V0U3R5bGUgPSBmdW5jdGlvbiAoZWwsIHByb3BlcnR5KSB7XG4gICAgcmV0dXJuIGVsLmN1cnJlbnRTdHlsZVxuICAgICAgPyBlbC5jdXJyZW50U3R5bGVbcHJvcGVydHldXG4gICAgICA6IGRvY3VtZW50LmRlZmF1bHRWaWV3LmdldENvbXB1dGVkU3R5bGUoZWwsIG51bGwpLmdldFByb3BlcnR5VmFsdWUocHJvcGVydHkpXG4gIH1cbiAgaGVscGVycy5yZXRpbmFTY2FsZSA9IGZ1bmN0aW9uIChjaGFydCkge1xuICAgIGlmICh0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJykgeyByZXR1cm4gJ3RoaXMgaXMgc2VydmVyJyB9XG5cbiAgICB2YXIgcGl4ZWxSYXRpbyA9IGNoYXJ0LmN1cnJlbnREZXZpY2VQaXhlbFJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMVxuICAgIGlmIChwaXhlbFJhdGlvID09PSAxKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB2YXIgY2FudmFzID0gY2hhcnQuY2FudmFzXG4gICAgdmFyIGhlaWdodCA9IGNoYXJ0LmhlaWdodFxuICAgIHZhciB3aWR0aCA9IGNoYXJ0LndpZHRoXG5cbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0ICogcGl4ZWxSYXRpb1xuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoICogcGl4ZWxSYXRpb1xuICAgIGNoYXJ0LmN0eC5zY2FsZShwaXhlbFJhdGlvLCBwaXhlbFJhdGlvKVxuXG4gICAgLy8gSWYgbm8gc3R5bGUgaGFzIGJlZW4gc2V0IG9uIHRoZSBjYW52YXMsIHRoZSByZW5kZXIgc2l6ZSBpcyB1c2VkIGFzIGRpc3BsYXkgc2l6ZSxcbiAgICAvLyBtYWtpbmcgdGhlIGNoYXJ0IHZpc3VhbGx5IGJpZ2dlciwgc28gbGV0J3MgZW5mb3JjZSBpdCB0byB0aGUgXCJjb3JyZWN0XCIgdmFsdWVzLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vY2hhcnRqcy9DaGFydC5qcy9pc3N1ZXMvMzU3NVxuICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnXG4gICAgY2FudmFzLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnXG4gIH1cbiAgLy8gLS0gQ2FudmFzIG1ldGhvZHNcbiAgaGVscGVycy5jbGVhciA9IGZ1bmN0aW9uIChjaGFydCkge1xuICAgIGNoYXJ0LmN0eC5jbGVhclJlY3QoMCwgMCwgY2hhcnQud2lkdGgsIGNoYXJ0LmhlaWdodClcbiAgfVxuICBoZWxwZXJzLmZvbnRTdHJpbmcgPSBmdW5jdGlvbiAocGl4ZWxTaXplLCBmb250U3R5bGUsIGZvbnRGYW1pbHkpIHtcbiAgICByZXR1cm4gZm9udFN0eWxlICsgJyAnICsgcGl4ZWxTaXplICsgJ3B4ICcgKyBmb250RmFtaWx5XG4gIH1cbiAgaGVscGVycy5sb25nZXN0VGV4dCA9IGZ1bmN0aW9uIChjdHgsIGZvbnQsIGFycmF5T2ZUaGluZ3MsIGNhY2hlKSB7XG4gICAgY2FjaGUgPSBjYWNoZSB8fCB7fVxuICAgIHZhciBkYXRhID0gY2FjaGUuZGF0YSA9IGNhY2hlLmRhdGEgfHwge31cbiAgICB2YXIgZ2MgPSBjYWNoZS5nYXJiYWdlQ29sbGVjdCA9IGNhY2hlLmdhcmJhZ2VDb2xsZWN0IHx8IFtdXG5cbiAgICBpZiAoY2FjaGUuZm9udCAhPT0gZm9udCkge1xuICAgICAgZGF0YSA9IGNhY2hlLmRhdGEgPSB7fVxuICAgICAgZ2MgPSBjYWNoZS5nYXJiYWdlQ29sbGVjdCA9IFtdXG4gICAgICBjYWNoZS5mb250ID0gZm9udFxuICAgIH1cblxuICAgIGN0eC5mb250ID0gZm9udFxuICAgIHZhciBsb25nZXN0ID0gMFxuICAgIGhlbHBlcnMuZWFjaChhcnJheU9mVGhpbmdzLCBmdW5jdGlvbiAodGhpbmcpIHtcbiAgICAgIC8vIFVuZGVmaW5lZCBzdHJpbmdzIGFuZCBhcnJheXMgc2hvdWxkIG5vdCBiZSBtZWFzdXJlZFxuICAgICAgaWYgKHRoaW5nICE9PSB1bmRlZmluZWQgJiYgdGhpbmcgIT09IG51bGwgJiYgaGVscGVycy5pc0FycmF5KHRoaW5nKSAhPT0gdHJ1ZSkge1xuICAgICAgICBsb25nZXN0ID0gaGVscGVycy5tZWFzdXJlVGV4dChjdHgsIGRhdGEsIGdjLCBsb25nZXN0LCB0aGluZylcbiAgICAgIH0gZWxzZSBpZiAoaGVscGVycy5pc0FycmF5KHRoaW5nKSkge1xuICAgICAgICAvLyBpZiBpdCBpcyBhbiBhcnJheSBsZXRzIG1lYXN1cmUgZWFjaCBlbGVtZW50XG4gICAgICAgIC8vIHRvIGRvIG1heWJlIHNpbXBsaWZ5IHRoaXMgZnVuY3Rpb24gYSBiaXQgc28gd2UgY2FuIGRvIHRoaXMgbW9yZSByZWN1cnNpdmVseT9cbiAgICAgICAgaGVscGVycy5lYWNoKHRoaW5nLCBmdW5jdGlvbiAobmVzdGVkVGhpbmcpIHtcbiAgICAgICAgICAvLyBVbmRlZmluZWQgc3RyaW5ncyBhbmQgYXJyYXlzIHNob3VsZCBub3QgYmUgbWVhc3VyZWRcbiAgICAgICAgICBpZiAobmVzdGVkVGhpbmcgIT09IHVuZGVmaW5lZCAmJiBuZXN0ZWRUaGluZyAhPT0gbnVsbCAmJiAhaGVscGVycy5pc0FycmF5KG5lc3RlZFRoaW5nKSkge1xuICAgICAgICAgICAgbG9uZ2VzdCA9IGhlbHBlcnMubWVhc3VyZVRleHQoY3R4LCBkYXRhLCBnYywgbG9uZ2VzdCwgbmVzdGVkVGhpbmcpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB2YXIgZ2NMZW4gPSBnYy5sZW5ndGggLyAyXG4gICAgaWYgKGdjTGVuID4gYXJyYXlPZlRoaW5ncy5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ2NMZW47IGkrKykge1xuICAgICAgICBkZWxldGUgZGF0YVtnY1tpXV1cbiAgICAgIH1cbiAgICAgIGdjLnNwbGljZSgwLCBnY0xlbilcbiAgICB9XG4gICAgcmV0dXJuIGxvbmdlc3RcbiAgfVxuICBoZWxwZXJzLm1lYXN1cmVUZXh0ID0gZnVuY3Rpb24gKGN0eCwgZGF0YSwgZ2MsIGxvbmdlc3QsIHN0cmluZykge1xuICAgIHZhciB0ZXh0V2lkdGggPSBkYXRhW3N0cmluZ11cbiAgICBpZiAoIXRleHRXaWR0aCkge1xuICAgICAgdGV4dFdpZHRoID0gZGF0YVtzdHJpbmddID0gY3R4Lm1lYXN1cmVUZXh0KHN0cmluZykud2lkdGhcbiAgICAgIGdjLnB1c2goc3RyaW5nKVxuICAgIH1cbiAgICBpZiAodGV4dFdpZHRoID4gbG9uZ2VzdCkge1xuICAgICAgbG9uZ2VzdCA9IHRleHRXaWR0aFxuICAgIH1cbiAgICByZXR1cm4gbG9uZ2VzdFxuICB9XG4gIGhlbHBlcnMubnVtYmVyT2ZMYWJlbExpbmVzID0gZnVuY3Rpb24gKGFycmF5T2ZUaGluZ3MpIHtcbiAgICB2YXIgbnVtYmVyT2ZMaW5lcyA9IDFcbiAgICBoZWxwZXJzLmVhY2goYXJyYXlPZlRoaW5ncywgZnVuY3Rpb24gKHRoaW5nKSB7XG4gICAgICBpZiAoaGVscGVycy5pc0FycmF5KHRoaW5nKSkge1xuICAgICAgICBpZiAodGhpbmcubGVuZ3RoID4gbnVtYmVyT2ZMaW5lcykge1xuICAgICAgICAgIG51bWJlck9mTGluZXMgPSB0aGluZy5sZW5ndGhcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIG51bWJlck9mTGluZXNcbiAgfVxuICBoZWxwZXJzLmRyYXdSb3VuZGVkUmVjdGFuZ2xlID0gZnVuY3Rpb24gKGN0eCwgeCwgeSwgd2lkdGgsIGhlaWdodCwgcmFkaXVzKSB7XG4gICAgY3R4LmJlZ2luUGF0aCgpXG4gICAgY3R4Lm1vdmVUbyh4ICsgcmFkaXVzLCB5KVxuICAgIGN0eC5saW5lVG8oeCArIHdpZHRoIC0gcmFkaXVzLCB5KVxuICAgIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKHggKyB3aWR0aCwgeSwgeCArIHdpZHRoLCB5ICsgcmFkaXVzKVxuICAgIGN0eC5saW5lVG8oeCArIHdpZHRoLCB5ICsgaGVpZ2h0IC0gcmFkaXVzKVxuICAgIGN0eC5xdWFkcmF0aWNDdXJ2ZVRvKHggKyB3aWR0aCwgeSArIGhlaWdodCwgeCArIHdpZHRoIC0gcmFkaXVzLCB5ICsgaGVpZ2h0KVxuICAgIGN0eC5saW5lVG8oeCArIHJhZGl1cywgeSArIGhlaWdodClcbiAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4LCB5ICsgaGVpZ2h0LCB4LCB5ICsgaGVpZ2h0IC0gcmFkaXVzKVxuICAgIGN0eC5saW5lVG8oeCwgeSArIHJhZGl1cylcbiAgICBjdHgucXVhZHJhdGljQ3VydmVUbyh4LCB5LCB4ICsgcmFkaXVzLCB5KVxuICAgIGN0eC5jbG9zZVBhdGgoKVxuICB9XG4gIGhlbHBlcnMuY29sb3IgPSBmdW5jdGlvbiAoYykge1xuICAgIGlmICghY29sb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0NvbG9yLmpzIG5vdCBmb3VuZCEnKVxuICAgICAgcmV0dXJuIGNcbiAgICB9XG5cbiAgICAvKiBnbG9iYWwgQ2FudmFzR3JhZGllbnQgKi9cbiAgICBpZiAoYyBpbnN0YW5jZW9mIENhbnZhc0dyYWRpZW50KSB7XG4gICAgICByZXR1cm4gY29sb3IoQ2hhcnQuZGVmYXVsdHMuZ2xvYmFsLmRlZmF1bHRDb2xvcilcbiAgICB9XG5cbiAgICByZXR1cm4gY29sb3IoYylcbiAgfVxuICBoZWxwZXJzLmlzQXJyYXkgPSBBcnJheS5pc0FycmF5XG4gICAgPyBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShvYmopXG4gICAgfVxuICAgIDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nXG4gICAgfVxuICAvLyAhIEBzZWUgaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTQ4NTM5NzRcbiAgaGVscGVycy5hcnJheUVxdWFscyA9IGZ1bmN0aW9uIChhMCwgYTEpIHtcbiAgICB2YXIgaSwgaWxlbiwgdjAsIHYxXG5cbiAgICBpZiAoIWEwIHx8ICFhMSB8fCBhMC5sZW5ndGggIT09IGExLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgZm9yIChpID0gMCwgaWxlbiA9IGEwLmxlbmd0aDsgaSA8IGlsZW47ICsraSkge1xuICAgICAgdjAgPSBhMFtpXVxuICAgICAgdjEgPSBhMVtpXVxuXG4gICAgICBpZiAodjAgaW5zdGFuY2VvZiBBcnJheSAmJiB2MSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGlmICghaGVscGVycy5hcnJheUVxdWFscyh2MCwgdjEpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodjAgIT09IHYxKSB7XG4gICAgICAgIC8vIE5PVEU6IHR3byBkaWZmZXJlbnQgb2JqZWN0IGluc3RhbmNlcyB3aWxsIG5ldmVyIGJlIGVxdWFsOiB7eDoyMH0gIT0ge3g6MjB9XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlXG4gIH1cbiAgaGVscGVycy5jYWxsQ2FsbGJhY2sgPSBmdW5jdGlvbiAoZm4sIGFyZ3MsIF90QXJnKSB7XG4gICAgaWYgKGZuICYmIHR5cGVvZiBmbi5jYWxsID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmbi5hcHBseShfdEFyZywgYXJncylcbiAgICB9XG4gIH1cbiAgaGVscGVycy5nZXRIb3ZlckNvbG9yID0gZnVuY3Rpb24gKGNvbG9yVmFsdWUpIHtcbiAgICAvKiBnbG9iYWwgQ2FudmFzUGF0dGVybiAqL1xuICAgIHJldHVybiAoY29sb3JWYWx1ZSBpbnN0YW5jZW9mIENhbnZhc1BhdHRlcm4pXG4gICAgICA/IGNvbG9yVmFsdWVcbiAgICAgIDogaGVscGVycy5jb2xvcihjb2xvclZhbHVlKS5zYXR1cmF0ZSgwLjUpLmRhcmtlbigwLjEpLnJnYlN0cmluZygpXG4gIH1cbn1cbiIsIndpbmRvdy5OYXBjaGFydCA9IHt9XHJcblxyXG4vKiBoZWxwZXIgZnVuY3Rpb25zICovXHJcbnJlcXVpcmUoJy4vaGVscGVycycpKE5hcGNoYXJ0KVxyXG5yZXF1aXJlKCcuL2RyYXcvY2FudmFzSGVscGVycycpKE5hcGNoYXJ0KVxyXG5cclxuLyogY29uZmlnIGZpbGVzICovXHJcbnJlcXVpcmUoJy4vY29uZmlnJykoTmFwY2hhcnQpXHJcbnJlcXVpcmUoJy4vdHlwZXMnKShOYXBjaGFydClcclxuXHJcbi8qIHJlYWwgc2hpdCAqL1xyXG5yZXF1aXJlKCcuL2NvcmUnKShOYXBjaGFydClcclxuXHJcbi8qIGRyYXdpbmcgKi9cclxucmVxdWlyZSgnLi9zaGFwZS9zaGFwZScpKE5hcGNoYXJ0KVxyXG5yZXF1aXJlKCcuL2RyYXcvZHJhdycpKE5hcGNoYXJ0KVxyXG5yZXF1aXJlKCcuL2ludGVyYWN0Q2FudmFzL2ludGVyYWN0Q2FudmFzJykoTmFwY2hhcnQpXHJcblxyXG4vKiBvdGhlciBtb2R1bGVzICovXHJcbi8vIHJlcXVpcmUoJy4vYW5pbWF0aW9uJykoTmFwY2hhcnQpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHdpbmRvdy5OYXBjaGFydCIsIi8qXHJcbiogIGludGVyYWN0Q2FudmFzXHJcbipcclxuKiAgVGhpcyBtb2R1bGUgYWRkcyBzdXBwb3J0IGZvciBtb2RpZnlpbmcgYSBzY2hlZHVsZVxyXG4qICBkaXJlY3RseSBvbiB0aGUgY2FudmFzIHdpdGggbW91c2Ugb3IgdG91Y2hcclxuKi9cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE5hcGNoYXJ0KSB7XHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gIE5hcGNoYXJ0LmludGVyYWN0Q2FudmFzID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24gKGNoYXJ0KSB7XHJcbiAgICAgIGlmKCFjaGFydC5jb25maWcuaW50ZXJhY3Rpb24pIHJldHVyblxyXG5cclxuICAgICAgdmFyIGNhbnZhcyA9IGNoYXJ0LmNhbnZhc1xyXG5cclxuICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBob3ZlcihlLCBjaGFydClcclxuICAgICAgfSlcclxuICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBkb3duKGUsIGNoYXJ0KVxyXG4gICAgICB9KVxyXG4gICAgICAvLyBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIGRvd24pXHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdXAoZSwgY2hhcnQpXHJcbiAgICAgIH0pXHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIHVwKGUsIGNoYXJ0KVxyXG4gICAgICB9KVxyXG4gICAgLy8gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsZGVzZWxlY3QpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB2YXIgbW91c2VIb3ZlciA9IHt9LFxyXG4gICAgYWN0aXZlRWxlbWVudHMgPSBbXSxcclxuICAgIGhvdmVyRGlzdGFuY2UgPSA2LFxyXG4gICAgc2VsZWN0ZWRPcGFjaXR5ID0gMVxyXG5cclxuICBmdW5jdGlvbiBkb3duIChlLCBjaGFydCkge1xyXG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKVxyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcblxyXG4gICAgdmFyIGNvb3JkaW5hdGVzID0gZ2V0Q29vcmRpbmF0ZXMoZSwgY2hhcnQpXHJcblxyXG4gICAgdmFyIGhpdCA9IGhpdERldGVjdChjaGFydCwgY29vcmRpbmF0ZXMpXHJcblxyXG4gICAgLy8gcmV0dXJuIG9mIG5vIGhpdFxyXG4gICAgaWYgKE9iamVjdC5rZXlzKGhpdCkubGVuZ3RoID09IDApIHtcclxuICAgICAgZGVzZWxlY3QoY2hhcnQpXHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNldCBpZGVudGlmaWVyXHJcbiAgICBpZiAodHlwZW9mIGUuY2hhbmdlZFRvdWNoZXMgIT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgaGl0LmlkZW50aWZpZXIgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmlkZW50aWZpZXJcclxuICAgIH1lbHNlIHtcclxuICAgICAgaGl0LmlkZW50aWZpZXIgPSAnbW91c2UnXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZGVzZWxlY3Qgb3RoZXIgZWxlbWVudHMgaWYgdGhleSBhcmUgbm90IGJlaW5nIHRvdWNoZWRcclxuICAgIGlmIChhY3RpdmVFbGVtZW50cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgZGVzZWxlY3QoY2hhcnQpXHJcbiAgICB9XHJcblxyXG4gICAgYWN0aXZlRWxlbWVudHMucHVzaChoaXQpXHJcblxyXG4gICAgaWYgKHR5cGVvZiBlLmNoYW5nZWRUb3VjaGVzICE9ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGRyYWcpXHJcbiAgICB9ZWxzZSB7XHJcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBkcmFnKGUsIGNoYXJ0KVxyXG4gICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHNlbGVjdChjaGFydCwgaGl0Lm9yaWdpbilcclxuXHJcbiAgICBkcmFnKGUsIGNoYXJ0KSAvLyB0byAgbWFrZSBzdXJlIHRoZSBoYW5kbGVzIHBvc2l0aW9ucyB0byB0aGUgY3Vyc29yIGV2ZW4gYmVmb3JlIG1vdmVtZW50XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRDb29yZGluYXRlcyAoZSwgY2hhcnQpIHtcclxuICAgIHZhciBtb3VzZVgsbW91c2VZXHJcbiAgICB2YXIgY2FudmFzID0gY2hhcnQuY2FudmFzXHJcbiAgICAvLyBvcmlnbyBpcyAoMCwwKVxyXG4gICAgdmFyIGJvdW5kaW5nUmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxyXG5cclxuICAgIHZhciB3aWR0aCA9IGNhbnZhcy53aWR0aFxyXG4gICAgdmFyIGhlaWdodCA9IGNhbnZhcy5oZWlnaHRcclxuXHJcbiAgICBpZiAoZS5jaGFuZ2VkVG91Y2hlcykge1xyXG4gICAgICBtb3VzZVggPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFggLSBib3VuZGluZ1JlY3QubGVmdFxyXG4gICAgICBtb3VzZVkgPSBlLmNoYW5nZWRUb3VjaGVzWzBdLmNsaWVudFkgLSBib3VuZGluZ1JlY3QudG9wXHJcbiAgICB9ZWxzZSB7XHJcbiAgICAgIG1vdXNlWCA9IGUuY2xpZW50WCAtIGJvdW5kaW5nUmVjdC5sZWZ0XHJcbiAgICAgIG1vdXNlWSA9IGUuY2xpZW50WSAtIGJvdW5kaW5nUmVjdC50b3BcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICB4OiBtb3VzZVgsXHJcbiAgICAgIHk6IG1vdXNlWVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGl0RGV0ZWN0IChjaGFydCwgY29vcmRpbmF0ZXMpIHtcclxuICAgIHZhciBjYW52YXMgPSBjaGFydC5jYW52YXNcclxuICAgIHZhciBkYXRhID0gY2hhcnQuZGF0YVxyXG5cclxuICAgIC8vIHdpbGwgcmV0dXJuOlxyXG4gICAgLy8gZWxlbWVudFxyXG4gICAgLy8gdHlwZSAoc3RhcnQsIGVuZCwgb3IgbWlkZGxlKVxyXG4gICAgLy8gZGlzdGFuY2VcclxuXHJcbiAgICB2YXIgaGl0ID0ge31cclxuXHJcbiAgICAvLyBoaXQgZGV0ZWN0aW9uIG9mIGhhbmRsZXM6XHJcblxyXG4gICAgdmFyIGRpc3RhbmNlO1xyXG5cclxuICAgIGRhdGEuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcblxyXG4gICAgICAvLyBpZiBlbGVtZW50IGlzIG5vdCBzZWxlY3RlZCwgY29udGludWVcclxuICAgICAgaWYgKCFjaGFydC5pc1NlbGVjdGVkKGVsZW1lbnQpKXtcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG4gICAgICBbJ3N0YXJ0JywgJ2VuZCddLmZvckVhY2goZnVuY3Rpb24oc3RhcnRPckVuZCkge1xyXG4gICAgICAgIHZhciBwb2ludCA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsIGVsZW1lbnRbc3RhcnRPckVuZF0sIGVsZW1lbnQudHlwZS5sYW5lLmVuZClcclxuICAgICAgICBcclxuICAgICAgICBkaXN0YW5jZSA9IGhlbHBlcnMuZGlzdGFuY2UocG9pbnQueCwgcG9pbnQueSwgY29vcmRpbmF0ZXMpXHJcbiAgICAgICAgaWYoZGlzdGFuY2UgPCBjaGFydC5jb25maWcuaGFuZGxlc0NsaWNrRGlzdGFuY2Upe1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBoaXQuZGlzdGFuY2UgPT0gJ3VuZGVmaW5lZCcgfHwgZGlzdGFuY2UgPCBoaXQuZGlzdGFuY2UpIHtcclxuICAgICAgICAgICAgaGl0ID0ge1xyXG4gICAgICAgICAgICAgIG9yaWdpbjogZWxlbWVudCxcclxuICAgICAgICAgICAgICB0eXBlOiBzdGFydE9yRW5kLFxyXG4gICAgICAgICAgICAgIGRpc3RhbmNlOiBkaXN0YW5jZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgfSlcclxuXHJcblxyXG4gICAgLy8gaWYgbm8gaGFuZGxlIGlzIGhpdCwgY2hlY2sgZm9yIG1pZGRsZSBoaXRcclxuXHJcbiAgICBpZiAoT2JqZWN0LmtleXMoaGl0KS5sZW5ndGggPT0gMCkge1xyXG5cclxuICAgICAgdmFyIGluZm8gPSBoZWxwZXJzLlhZdG9JbmZvKGNoYXJ0LCBjb29yZGluYXRlcy54LCBjb29yZGluYXRlcy55KVxyXG5cclxuICAgICAgLy8gbG9vcCB0aHJvdWdoIGVsZW1lbnRzXHJcbiAgICAgIGRhdGEuZWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcblxyXG4gICAgICAgIC8vIGNoZWNrIGlmIHBvaW50IGlzIGluc2lkZSBlbGVtZW50IGhvcml6b250YWxseVxyXG4gICAgICAgIGlmIChoZWxwZXJzLmlzSW5zaWRlKGluZm8ubWludXRlcywgZWxlbWVudC5zdGFydCwgZWxlbWVudC5lbmQpKSB7XHJcblxyXG4gICAgICAgICAgLy8gY2hlY2sgaWYgcG9pbnQgaXMgaW5zaWRlIGVsZW1lbnQgdmVydGljYWxseVxyXG4gICAgICAgICAgdmFyIGlubmVyUmFkaXVzID0gZWxlbWVudC50eXBlLmxhbmUuc3RhcnRcclxuICAgICAgICAgIHZhciBvdXRlclJhZGl1cyA9IGVsZW1lbnQudHlwZS5sYW5lLmVuZFxyXG5cclxuICAgICAgICAgIGlmIChpbmZvLmRpc3RhbmNlID4gaW5uZXJSYWRpdXMgJiYgaW5mby5kaXN0YW5jZSA8IG91dGVyUmFkaXVzKSB7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uSW5FbGVtZW50ID0gaW5mby5taW51dGVzLWVsZW1lbnQuc3RhcnRcclxuICAgICAgICAgICAgaGl0ID0ge1xyXG4gICAgICAgICAgICAgIG9yaWdpbjogZWxlbWVudCxcclxuICAgICAgICAgICAgICB0eXBlOiAnd2hvbGUnLFxyXG4gICAgICAgICAgICAgIHBvc2l0aW9uSW5FbGVtZW50OiBwb3NpdGlvbkluRWxlbWVudFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICBcclxuICAgIH1cclxuXHJcblxyXG4gICAgcmV0dXJuIGhpdFxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaG92ZXIgKGUsIGNoYXJ0KSB7XHJcbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBnZXRDb29yZGluYXRlcyhlLCBjaGFydClcclxuICAgIHZhciBoaXQgPSBoaXREZXRlY3QoY2hhcnQsIGNvb3JkaW5hdGVzKVxyXG5cclxuICAgIGlmKGhpdCl7XHJcbiAgICAgIC8vIGNoYXJ0LnNldEVsZW1lbnRTdGF0ZShoaXQuY291bnQsICdob3ZlcicpXHJcbiAgICB9ZWxzZXtcclxuICAgICAgLy8gY2hhcnQucmVtb3ZlRWxlbWVudFN0YXRlcygpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hhcnQucmVkcmF3KClcclxuICB9XHJcblxyXG5cclxuICBmdW5jdGlvbiBkcmFnIChlLCBjaGFydCkge1xyXG4gICAgdmFyIGlkZW50aWZpZXIgPSBmaW5kSWRlbnRpZmllcihlKVxyXG5cclxuICAgIHZhciBkcmFnRWxlbWVudCA9IGdldEFjdGl2ZUVsZW1lbnQoaWRlbnRpZmllcilcclxuXHJcbiAgICBpZiAoIWRyYWdFbGVtZW50KSB7XHJcbiAgICAgIHJldHVyblxyXG4gICAgfVxyXG5cclxuICAgIHZhciBjb29yZGluYXRlcyA9IGdldENvb3JkaW5hdGVzKGUsIGNoYXJ0KVxyXG4gICAgdmFyIG1pbnV0ZXMgPSBoZWxwZXJzLlhZdG9JbmZvKGNoYXJ0LCBjb29yZGluYXRlcy54LCBjb29yZGluYXRlcy55KS5taW51dGVzXHJcbiAgICB2YXIgb3JpZ2luRWxlbWVudCA9IGRyYWdFbGVtZW50Lm9yaWdpblxyXG5cclxuICAgIGlmKGRyYWdFbGVtZW50LnR5cGUgPT0gJ3N0YXJ0JyB8fCBkcmFnRWxlbWVudC50eXBlID09ICdlbmQnKXtcclxuICAgICAgb3JpZ2luRWxlbWVudFtkcmFnRWxlbWVudC50eXBlXSA9IHNuYXAobWludXRlcylcclxuICAgIH1cclxuICAgIGVsc2UgaWYoZHJhZ0VsZW1lbnQudHlwZSA9PSAnd2hvbGUnKXtcclxuICAgICAgdmFyIHBvc2l0aW9uSW5FbGVtZW50ID0gZHJhZ0VsZW1lbnQucG9zaXRpb25JbkVsZW1lbnRcclxuICAgICAgdmFyIGR1cmF0aW9uID0gaGVscGVycy5yYW5nZShvcmlnaW5FbGVtZW50LnN0YXJ0LCBvcmlnaW5FbGVtZW50LmVuZClcclxuXHJcbiAgICAgIG9yaWdpbkVsZW1lbnQuc3RhcnQgPSBzbmFwKGhlbHBlcnMubGltaXQoTWF0aC5yb3VuZChtaW51dGVzIC0gcG9zaXRpb25JbkVsZW1lbnQpKSlcclxuICAgICAgb3JpZ2luRWxlbWVudC5lbmQgPSBoZWxwZXJzLmxpbWl0KE1hdGgucm91bmQob3JpZ2luRWxlbWVudC5zdGFydCArIGR1cmF0aW9uKSlcclxuICAgIH1cclxuXHJcbiAgICBcclxuICAgIGNoYXJ0LnVwZGF0ZUVsZW1lbnQob3JpZ2luRWxlbWVudClcclxuXHJcbiAgICBmdW5jdGlvbiBzbmFwKGlucHV0KSB7XHJcbiAgICAgIHJldHVybiA1ICogTWF0aC5yb3VuZChpbnB1dCAvIDUpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB1bmZvY3VzIChlKSB7XHJcbiAgICAvLyBjaGVja3MgaWYgY2xpY2sgaXMgb24gYSBwYXJ0IG9mIHRoZSBzaXRlIHRoYXQgc2hvdWxkIG1ha2UgdGhlXHJcbiAgICAvLyBjdXJyZW50IHNlbGVjdGVkIGVsZW1lbnRzIGJlIGRlc2VsZWN0ZWRcclxuXHJcbiAgICB2YXIgeCwgeVxyXG4gICAgdmFyIGRvbUVsZW1lbnRcclxuXHJcbiAgICB4ID0gZS5jbGllbnRYXHJcbiAgICB5ID0gZS5jbGllbnRZXHJcblxyXG4gICAgdmFyIGRvbUVsZW1lbnQgPSBkb2N1bWVudC5lbGVtZW50RnJvbVBvaW50KHgsIHkpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzZWxlY3QgKGNoYXJ0LCBlbGVtZW50KSB7XHJcbiAgICAvLyBub3RpZnkgY29yZSBtb2R1bGU6XHJcbiAgICBjaGFydC5zZXRTZWxlY3RlZChlbGVtZW50KVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZGVzZWxlY3QgKGNoYXJ0LCBlbGVtZW50KSB7XHJcbiAgICBpZiAodHlwZW9mIGVsZW1lbnQgPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgLy8gZGVzZWxlY3QgYWxsXHJcbiAgICAgIGNoYXJ0LmRlc2VsZWN0KClcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZHJhZylcclxuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZHJhZylcclxuICAgIH1cclxuICAgIC8vIGRlc2VsZWN0IG9uZVxyXG4gICAgY2hhcnQuZGVzZWxlY3QoZWxlbWVudClcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGZpbmRJZGVudGlmaWVyIChlKSB7XHJcbiAgICBpZiAoZS50eXBlLnNlYXJjaCgnbW91c2UnKSA+PSAwKSB7XHJcbiAgICAgIHJldHVybiAnbW91c2UnXHJcbiAgICB9ZWxzZSB7XHJcbiAgICAgIHJldHVybiBlLmNoYW5nZWRUb3VjaGVzWzBdLmlkZW50aWZpZXJcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldEFjdGl2ZUVsZW1lbnQgKGlkZW50aWZpZXIpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWN0aXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGFjdGl2ZUVsZW1lbnRzW2ldLmlkZW50aWZpZXIgPT0gaWRlbnRpZmllcikge1xyXG4gICAgICAgIHJldHVybiBhY3RpdmVFbGVtZW50c1tpXVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2VcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHJlbW92ZUFjdGl2ZUVsZW1lbnQgKGlkZW50aWZpZXIpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYWN0aXZlRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGFjdGl2ZUVsZW1lbnRzW2ldLmlkZW50aWZpZXIgPT0gaWRlbnRpZmllcikge1xyXG4gICAgICAgIGFjdGl2ZUVsZW1lbnRzLnNwbGljZShpLCAxKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB1cCAoZSwgY2hhcnQpIHtcclxuICAgIHZhciBpZGVudGlmaWVyID0gZmluZElkZW50aWZpZXIoZSlcclxuICAgIHZhciBlbGVtZW50ID0gZ2V0QWN0aXZlRWxlbWVudChpZGVudGlmaWVyKVxyXG5cclxuICAgIGlmIChhY3RpdmVFbGVtZW50cy5sZW5ndGggIT0gMCkge1xyXG4gICAgICAvLyBjaGFydEhpc3RvcnkuYWRkKG5hcGNoYXJ0Q29yZS5nZXRTY2hlZHVsZSgpLCAnbW92ZWQgJyArIGVsZW1lbnQubmFtZSArICcgJyArIChlbGVtZW50LmNvdW50ICsgMSkpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmluZCB0aGUgc2hpdCB0byByZW1vdmVcclxuICAgIHJlbW92ZUFjdGl2ZUVsZW1lbnQoaWRlbnRpZmllcilcclxuXHJcbiAgICBjaGFydC5yZWRyYXdcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNuYXAgKGlucHV0KSB7XHJcbiAgICB2YXIgb3V0cHV0ID0gaW5wdXRcclxuXHJcbiAgICBpZiAoc2V0dGluZ3MuZ2V0VmFsdWUoJ3NuYXAxMCcpKSB7XHJcbiAgICAgIG91dHB1dCA9IDEwICogTWF0aC5yb3VuZChpbnB1dCAvIDEwKVxyXG4gICAgfWVsc2UgaWYgKHNldHRpbmdzLmdldFZhbHVlKCdzbmFwNScpKSB7XHJcbiAgICAgIG91dHB1dCA9IDUgKiBNYXRoLnJvdW5kKGlucHV0IC8gNSlcclxuICAgIH1lbHNlIHtcclxuXHJcbiAgICAgIC8vIGhvdXJcclxuICAgICAgaWYgKGlucHV0ICUgNjAgPCA3KVxyXG4gICAgICAgIG91dHB1dCA9IGlucHV0IC0gaW5wdXQgJSA2MFxyXG4gICAgICBlbHNlIGlmIChpbnB1dCAlIDYwID4gNTMpXHJcbiAgICAgICAgb3V0cHV0ID0gaW5wdXQgKyAoNjAgLSBpbnB1dCAlIDYwKVxyXG5cclxuICAgICAgLy8gaGFsZiBob3Vyc1xyXG4gICAgICBlbHNlIHtcclxuICAgICAgICBpbnB1dCArPSAzMFxyXG5cclxuICAgICAgICBpZiAoaW5wdXQgJSA2MCA8IDUpXHJcbiAgICAgICAgICBvdXRwdXQgPSBpbnB1dCAtIGlucHV0ICUgNjAgLSAzMFxyXG4gICAgICAgIGVsc2UgaWYgKGlucHV0ICUgNjAgPiA1NSlcclxuICAgICAgICAgIG91dHB1dCA9IGlucHV0ICsgKDYwIC0gaW5wdXQgJSA2MCkgLSAzMFxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG91dHB1dFxyXG4gIH1cclxufVxyXG4iLCIvKipcclxuICpcclxuICogZnVuY3Rpb24gY2FsY3VsYXRlU2hhcGVcclxuICogXHJcbiAqIFRoaXMgZnVuY3Rpb24gdGFrZXMgYSBub3JtYWwgc2hhcGUgZGVmaW5pdGlvbiBvYmplY3RcclxuICogYW5kIGNhbGN1bGF0ZXMgcG9zaXRpb25zIGFuZCBzaXplc1xyXG4gKlxyXG4gKiBSZXR1cm5zIGEgbW9yZSBkZXRhaWxlZCBzaGFwZSBvYmplY3QgdGhhdCBpcyBsYXRlclxyXG4gKiBhc3NpZ25lZCB0byBjaGFydC5zaGFwZSBhbmQgdXNlZCB3aGVuIGRyYXdpbmdcclxuICpcclxuICovXHJcblxyXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY2FsY3VsYXRlU2hhcGUoY2hhcnQsIHNoYXBlKXtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFkZCByYWRpYW5zIG9yIG1pbnV0ZXMgcHJvcGVydGllc1xyXG4gICAgICovXHJcblxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICAgIGVsZW1lbnQubGVuZ3RoID0gZWxlbWVudC52YWx1ZVxyXG4gICAgICAgIGVsZW1lbnQucmFkaWFucyA9IGVsZW1lbnQudmFsdWVcclxuICAgICAgfWVsc2UgaWYoZWxlbWVudC50eXBlID09PSAnbGluZScpe1xyXG4gICAgICAgIGVsZW1lbnQubGVuZ3RoID0gZWxlbWVudC52YWx1ZVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZCBvdXQgdG90YWxSYWRpYW5zXHJcbiAgICAgKiBUaGlzIGJlIDIgKiBQSSBpZiB0aGUgc2hhcGUgaXMgY2lyY3VsYXJcclxuICAgICAqL1xyXG5cclxuICAgIHZhciB0b3RhbFJhZGlhbnMgPSAwXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICAgICAgLy8gaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgdG90YWxSYWRpYW5zICs9IGVsZW1lbnQudmFsdWVcclxuICAgICAgLy8gfVxyXG4gICAgfSlcclxuXHJcblxyXG4gICAgLy8gKlxyXG4gICAgLy8gICogRmluZCB0aGUgc3VtIG9mIG1pbnV0ZXMgaW4gdGhlIGxpbmUgZWxlbWVudHNcclxuICAgIC8vICAqIEFyYyBlbGVtZW50cyBkb2VzIG5vdCBkZWZpbmUgbWludXRlcywgb25seSByYWRpYW5zXHJcbiAgICAgXHJcblxyXG4gICAgLy8gdmFyIHRvdGFsTWludXRlcyA9IDBcclxuICAgIC8vIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgLy8gICBpZihlbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAvLyAgICAgdG90YWxNaW51dGVzICs9IGVsZW1lbnQubWludXRlc1xyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9KVxyXG5cclxuICAgIC8vIGlmKHRvdGFsTWludXRlcyA+IDE0NDApe1xyXG4gICAgLy8gICB0aHJvdyBuZXcgRXJyKCdUb28gbWFueSBtaW51dGVzIGluIGxpbmUgc2VnbWVudHMnKVxyXG4gICAgLy8gfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRmluZCBvdXQgYW5nbGUgb2Ygc2hhcGVzXHJcbiAgICAgKi9cclxuXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgaWYoaSA9PT0gMCkgZWxlbWVudC5zdGFydEFuZ2xlID0gMCBcclxuICAgICAgZWxzZSBlbGVtZW50LnN0YXJ0QW5nbGUgPSBzaGFwZVtpLTFdLmVuZEFuZ2xlXHJcbiAgICAgIFxyXG4gICAgICBpZihlbGVtZW50LnR5cGUgPT09ICdhcmMnKXtcclxuICAgICAgICBlbGVtZW50LmVuZEFuZ2xlID0gZWxlbWVudC5zdGFydEFuZ2xlICsgZWxlbWVudC5yYWRpYW5zXHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICBlbGVtZW50LmVuZEFuZ2xlID0gZWxlbWVudC5zdGFydEFuZ2xlXHJcbiAgICAgIH1cclxuICAgIH0pXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaW5kIG91dCBsZW5ndGggb2YgdGhlIHNoYXBlc1xyXG4gICAgICogXHJcbiAgICAgKiBQZXJpbWV0ZXIgb2YgY2lyY2xlID0gMiAqIHJhZGl1cyAqIFBJXHJcbiAgICAgKi9cclxuXHJcbiAgICAvLyB2YXIgbWludXRlTGVuZ3RoUmF0aW8gPSAwLjQ1XHJcbiAgICAvLyB2YXIgZm91bmRBcmMgPSBzaGFwZS5zb21lKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgIC8vICAgaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAvLyAgICAgZWxlbWVudC5sZW5ndGggPSBiYXNlUmFkaXVzICogZWxlbWVudC5yYWRpYW5zXHJcbiAgICAvLyAgICAgaWYoZWxlbWVudC5taW51dGVzICE9IDApXHJcbiAgICAvLyAgICAgbWludXRlTGVuZ3RoUmF0aW8gPSBlbGVtZW50Lmxlbmd0aCAvIGVsZW1lbnQubWludXRlc1xyXG4gICAgLy8gICAgIGNvbnNvbGUubG9nKGVsZW1lbnQubGVuZ3RoLCBlbGVtZW50Lm1pbnV0ZXMpXHJcbiAgICAvLyAgICAgcmV0dXJuIHRydWVcclxuICAgIC8vICAgfVxyXG4gICAgLy8gfSlcclxuXHJcbiAgICB2YXIgdG90YWxMZW5ndGggPSAwXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgZWxlbWVudC5sZW5ndGggPSBlbGVtZW50Lmxlbmd0aCAqIGNoYXJ0LmNvbmZpZy5iYXNlUmFkaXVzXHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICBlbGVtZW50Lmxlbmd0aCA9IGVsZW1lbnQubGVuZ3RoICogY2hhcnQucmF0aW9cclxuICAgICAgfVxyXG4gICAgICB0b3RhbExlbmd0aCArPSBlbGVtZW50Lmxlbmd0aFxyXG4gICAgfSlcclxuXHJcbiAgICAvKipcclxuICAgICAqIENhbGN1bGF0ZSBob3cgbWFueSBtaW51dGVzIGVhY2ggYXJjIGVsZW1lbnQgc2hvdWxkIGdldFxyXG4gICAgICogYmFzZWQgb24gaG93IG1hbnkgbWludXRlcyBhcmUgbGVmdCBhZnRlciBsaW5lIGVsZW1lbnRzXHJcbiAgICAgKiBnZXQgd2hhdCB0aGV5IHNob3VsZCBoYXZlXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgbWludXRlc0xlZnRGb3JBcmNzID0gMTQ0MCBcclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xyXG4gICAgICBlbGVtZW50Lm1pbnV0ZXMgPSBNYXRoLmNlaWwoKGVsZW1lbnQubGVuZ3RoIC8gdG90YWxMZW5ndGgpICogMTQ0MClcclxuICAgIH0pXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPaywgc28gdG90YWxNaW51dGVzIGlzIG5vdyAxNDQwXHJcbiAgICAgKiBOb3cgd2UgbmVlZCB0byBjcmVhdGUgYSAuc3RhcnQgYW5kIC5lbmQgcG9pbnQgb24gYWxsXHJcbiAgICAgKiB0aGUgc2hhcGUgZWxlbWVudHNcclxuICAgICAqL1xyXG5cclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaSkge1xyXG4gICAgICBpZihpID09PSAwKSBlbGVtZW50LnN0YXJ0ID0gMFxyXG4gICAgICBlbHNlIGlmKGkgPiAwKSBlbGVtZW50LnN0YXJ0ID0gc2hhcGVbaS0xXS5lbmRcclxuICAgICAgZWxlbWVudC5lbmQgPSBlbGVtZW50LnN0YXJ0ICsgZWxlbWVudC5taW51dGVzXHJcbiAgICB9KVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQ2FsY3VsYXRlIHN0YXJ0UG9pbnRzIGFuZCBlbmRQb2ludHNcclxuICAgICAqIEZpcnN0IHBvaW50IGlzIGNlbnRlclxyXG4gICAgICogVGhlIHBvaW50IG9ubHkgY2hhbmdlcyBvbiBsaW5lLXNlZ21lbnRzXHJcbiAgICAgKi9cclxuXHJcbiAgICB2YXIgY2VudGVyID0ge1xyXG4gICAgICB4OmNoYXJ0LncvMixcclxuICAgICAgeTpjaGFydC5oLzJcclxuICAgIH1cclxuICAgIHNoYXBlLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCwgaSkge1xyXG4gICAgICBpZihpID09PSAwKXtcclxuICAgICAgICBlbGVtZW50LnN0YXJ0UG9pbnQgPSBjZW50ZXJcclxuICAgICAgICBlbGVtZW50LmVuZFBvaW50ID0gY2VudGVyXHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG4gICAgICAgIGVsZW1lbnQuc3RhcnRQb2ludCA9IHNoYXBlW2ktMV0uZW5kUG9pbnRcclxuICAgICAgICBlbGVtZW50LmVuZFBvaW50ID0gc2hhcGVbaS0xXS5lbmRQb2ludFxyXG4gICAgICB9ZWxzZSBpZihlbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAgICAgZWxlbWVudC5zdGFydFBvaW50ID0gc2hhcGVbaS0xXS5lbmRQb2ludFxyXG4gICAgICB9XHJcbiAgICAgIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICBlbGVtZW50LmVuZFBvaW50ID0ge1xyXG4gICAgICAgICAgeDogZWxlbWVudC5zdGFydFBvaW50LnggKyBNYXRoLmNvcyhlbGVtZW50LnN0YXJ0QW5nbGUpICogZWxlbWVudC5sZW5ndGgsXHJcbiAgICAgICAgICB5OiBlbGVtZW50LnN0YXJ0UG9pbnQueSArIE1hdGguc2luKGVsZW1lbnQuc3RhcnRBbmdsZSkgKiBlbGVtZW50Lmxlbmd0aFxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICAvKipcclxuICAgICAqIENlbnRlciB0aGUgc2hhcGVcclxuICAgICAqL1xyXG5cclxuICAgIHZhciBsaW1pdHMgPSB7fVxyXG4gICAgZnVuY3Rpb24gcHVzaExpbWl0cyhwb2ludCl7XHJcbiAgICAgIGlmKE9iamVjdC5rZXlzKGxpbWl0cykubGVuZ3RoID09PSAwKXtcclxuICAgICAgICBsaW1pdHMgPSB7XHJcbiAgICAgICAgICB1cDogcG9pbnQueSxcclxuICAgICAgICAgIGRvd246IHBvaW50LnksXHJcbiAgICAgICAgICBsZWZ0OiBwb2ludC54LFxyXG4gICAgICAgICAgcmlnaHQ6IHBvaW50LnhcclxuICAgICAgICB9XHJcbiAgICAgIH1lbHNle1xyXG4gICAgICAgIGlmKHBvaW50LnkgPCBsaW1pdHMudXApIGxpbWl0cy51cCA9IHBvaW50LnlcclxuICAgICAgICBpZihwb2ludC55ID4gbGltaXRzLmRvd24pIGxpbWl0cy5kb3duID0gcG9pbnQueVxyXG4gICAgICAgIGlmKHBvaW50LnggPCBsaW1pdHMubGVmdCkgbGltaXRzLmxlZnQgPSBwb2ludC54XHJcbiAgICAgICAgaWYocG9pbnQueCA+IGxpbWl0cy5yaWdodCkgbGltaXRzLnJpZ2h0ID0gcG9pbnQueFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgcHVzaExpbWl0cyhlbGVtZW50LnN0YXJ0UG9pbnQpXHJcbiAgICAgIHB1c2hMaW1pdHMoZWxlbWVudC5lbmRQb2ludClcclxuICAgIH0pXHJcblxyXG4gICAgLy8gd2UgbmVlZCB0byBrbm93IHRoZSBkaXN0YW5jZXMgdG8gdGhlIGVkZ2Ugb2YgdGhlIGNhbnZhc1xyXG4gICAgbGltaXRzLmRvd24gPSBjaGFydC5oIC0gbGltaXRzLmRvd25cclxuICAgIGxpbWl0cy5yaWdodCA9IGNoYXJ0LncgLSBsaW1pdHMucmlnaHRcclxuXHJcbiAgICAvLyB0aGUgZGlzdGFuY2VzIHNob3VsZCBiZSBlcXVhbCwgdGhlcmVmb3JlLCBzaGlmdCB0aGUgcG9pbnRzXHJcbiAgICAvLyBpZiBpdCBpcyBub3RcclxuICAgIHZhciBzaGlmdExlZnQgPSAobGltaXRzLmxlZnQgLSBsaW1pdHMucmlnaHQpIC8gMlxyXG4gICAgdmFyIHNoaWZ0VXAgPSAobGltaXRzLnVwIC0gbGltaXRzLmRvd24pIC8gMlxyXG4gICAgXHJcbiAgICBzaGFwZS5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQsIGkpIHtcclxuICAgICAgZWxlbWVudC5zdGFydFBvaW50ID0ge1xyXG4gICAgICAgIHg6IGVsZW1lbnQuc3RhcnRQb2ludC54IC0gc2hpZnRMZWZ0LFxyXG4gICAgICAgIHk6IGVsZW1lbnQuc3RhcnRQb2ludC55IC0gc2hpZnRVcFxyXG4gICAgICB9XHJcbiAgICAgIGVsZW1lbnQuZW5kUG9pbnQgPSB7XHJcbiAgICAgICAgeDogZWxlbWVudC5lbmRQb2ludC54IC0gc2hpZnRMZWZ0LFxyXG4gICAgICAgIHk6IGVsZW1lbnQuZW5kUG9pbnQueSAtIHNoaWZ0VXBcclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICByZXR1cm4gc2hhcGVcclxuICB9XHJcblxyXG4gICIsIi8qXHJcbipcclxuKiBTaGFwZSBtb2R1bGVcclxuKlxyXG4qL1xyXG5cclxudmFyIHNoYXBlcyA9IHJlcXVpcmUoJy4vc2hhcGVzJylcclxudmFyIGNhbGN1bGF0ZVNoYXBlID0gcmVxdWlyZSgnLi9jYWxjdWxhdGVTaGFwZScpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIHZhciBoZWxwZXJzID0gTmFwY2hhcnQuaGVscGVyc1xyXG4gIHZhciBjdXJyZW50U2hhcGVcclxuXHJcbiAgTmFwY2hhcnQuc2hhcGUgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbihjaGFydCkge1xyXG4gICAgICAgIHNldFNoYXBlKGNoYXJ0LCBjaGFydC5jb25maWcuc2hhcGUpXHJcbiAgICB9LFxyXG4gICAgc2V0U2hhcGU6IHNldFNoYXBlXHJcbiAgfVxyXG5cclxuICAvLyBhZGQgc29tZSBleHRyYSBoZWxwZXJzXHJcbiAgdmFyIHNoYXBlSGVscGVycyA9IHJlcXVpcmUoJy4vc2hhcGVIZWxwZXJzJykoTmFwY2hhcnQpXHJcblxyXG4gIGZ1bmN0aW9uIHNldFNoYXBlKGNoYXJ0LCBzaGFwZSkge1xyXG4gICAgaWYodHlwZW9mIHNoYXBlID09ICdzdHJpbmcnKXtcclxuICAgICAgY3VycmVudFNoYXBlID0gc2hhcGVcclxuICAgICAgc2hhcGUgPSBzaGFwZXNbc2hhcGVdXHJcbiAgICB9XHJcblxyXG4gICAgY2hhcnQuc2hhcGUgPSBjYWxjdWxhdGVTaGFwZShjaGFydCwgc2hhcGUpXHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGFuZ2VTaGFwZShjaGFydCkge1xyXG4gICAgLy8gaWYoY3VycmVudFNoYXBlID09PSAnc21pc2xlJyl7XHJcbiAgICAvLyAgIGNoYXJ0LmFuaW1hdGVTaGFwZShzaGFwZXNbJ2NpcmNsZSddKVxyXG4gICAgLy8gICBjdXJyZW50U2hhcGUgPSAnY2lyY2xlJ1xyXG4gICAgLy8gfVxyXG4gICAgLy8gY2hhcnQuYW5pbWF0ZVNoYXBlKHNoYXBlc1snaG9yaXpvbnRhbEVsbGlwc2UnXSlcclxuICAgIHZhciBuZXh0ID0gZmFsc2VcclxuICAgIGZvcihwcm9wIGluIHNoYXBlcyl7XHJcbiAgICAgIGlmKG5leHQpe1xyXG4gICAgICAgIGNoYXJ0LmFuaW1hdGVTaGFwZShzaGFwZXNbcHJvcF0pXHJcbiAgICAgICAgY3VycmVudFNoYXBlID0gcHJvcFxyXG4gICAgICAgIG5leHQgPSBmYWxzZVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcbiAgICAgIGlmKGN1cnJlbnRTaGFwZSA9PT0gcHJvcCl7XHJcbiAgICAgICAgbmV4dCA9IHRydWVcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYobmV4dCA9PT0gdHJ1ZSl7XHJcbiAgICAgIGNoYXJ0LmFuaW1hdGVTaGFwZShzaGFwZXNbJ2NpcmNsZSddKVxyXG4gICAgICBjdXJyZW50U2hhcGUgPSAnY2lyY2xlJ1xyXG4gICAgfVxyXG5cclxuICAgIGNoYXJ0LnJlZHJhdygpXHJcbiAgfVxyXG5cclxuXHJcbn1cclxuIiwiXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5hcGNoYXJ0KSB7XHJcbiAgXHJcbiAgdmFyIGhlbHBlcnMgPSBOYXBjaGFydC5oZWxwZXJzXHJcblxyXG4gIGhlbHBlcnMuWFl0b0luZm8gPSBmdW5jdGlvbiAoY2hhcnQsIHgsIHkpe1xyXG4gICAgLy8gd2lsbCBnYXRoZXIgdHdvIHRoaW5nczogbWludXRlcyBhbmQgZGlzdGFuY2UgZnJvbSBiYXNlcG9pbnRcclxuICAgIHZhciBtaW51dGVzLCBkaXN0YW5jZVxyXG4gICAgdmFyIHNoYXBlID0gY2hhcnQuc2hhcGVcclxuXHJcbiAgICAvLyB3aGljaCBoYXMgaW4gc2VjdG9yP1xyXG4gICAgdmFyIGVsZW1lbnRzSW5TZWN0b3IgPSBbXVxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LGkpIHtcclxuICAgICAgaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgdmFyIGFuZ2xlID0gaGVscGVycy5hbmdsZUJldHdlZW5Ud29Qb2ludHMoeCwgeSwgZWxlbWVudC5zdGFydFBvaW50KVxyXG4gICAgICAgIGlmKGFuZ2xlID4gZWxlbWVudC5zdGFydEFuZ2xlICYmIGFuZ2xlIDwgZWxlbWVudC5lbmRBbmdsZSl7XHJcbiAgICAgICAgICBlbGVtZW50c0luU2VjdG9yLnB1c2goZWxlbWVudClcclxuICAgICAgICB9XHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICB2YXIgYW5nbGUxID0gaGVscGVycy5hbmdsZUJldHdlZW5Ud29Qb2ludHMoeCwgeSwgZWxlbWVudC5zdGFydFBvaW50KVxyXG4gICAgICAgIHZhciBhbmdsZTIgPSBoZWxwZXJzLmFuZ2xlQmV0d2VlblR3b1BvaW50cyh4LCB5LCBlbGVtZW50LmVuZFBvaW50KVxyXG5cclxuICAgICAgICAgIGlmKGkgPT0gMSl7XHJcblxyXG4gICAgICAgICAgY29uc29sZS5sb2coYW5nbGUxLCBlbGVtZW50LnN0YXJ0QW5nbGUsIGVsZW1lbnQuc3RhcnRBbmdsZSArIE1hdGguUEkvMilcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGhlbHBlcnMuaXNJbnNpZGVBbmdsZShhbmdsZTEsIGVsZW1lbnQuc3RhcnRBbmdsZSwgZWxlbWVudC5zdGFydEFuZ2xlICsgTWF0aC5QSS8yKSlcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGFuZ2xlMiwgZWxlbWVudC5zdGFydEFuZ2xlIC0gTWF0aC5QSS8yLCBlbGVtZW50LnN0YXJ0QW5nbGUpXHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhoZWxwZXJzLmlzSW5zaWRlQW5nbGUoYW5nbGUyLCBlbGVtZW50LnN0YXJ0QW5nbGUgLSBNYXRoLlBJLzIsIGVsZW1lbnQuc3RhcnRBbmdsZSkpXHJcbiAgICAgICAgICB9IFxyXG4gICAgICAgIGlmKGhlbHBlcnMuaXNJbnNpZGVBbmdsZShhbmdsZTEsIGVsZW1lbnQuc3RhcnRBbmdsZSwgZWxlbWVudC5zdGFydEFuZ2xlICsgTWF0aC5QSS8yKSAmJlxyXG4gICAgICAgICAgaGVscGVycy5pc0luc2lkZUFuZ2xlKGFuZ2xlMiwgZWxlbWVudC5zdGFydEFuZ2xlIC0gTWF0aC5QSS8yLCBlbGVtZW50LnN0YXJ0QW5nbGUpKXtcclxuICAgICAgICAgIGVsZW1lbnRzSW5TZWN0b3IucHVzaChlbGVtZW50KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuXHJcbiAgICAvLyBmaW5kIHRoZSBjbG9zZXN0XHJcbiAgICAvLyB0aGlzIGlzIG9ubHkgdXNlZnVsIGlmIHRoZSBzaGFwZSBnb2VzIGFyb3VuZCBpdHNlbGYgKGV4YW1wbGU6IHNwaXJhbClcclxuICAgIHZhciBzaGFwZUVsZW1lbnRcclxuICAgIGVsZW1lbnRzSW5TZWN0b3IuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XHJcbiAgICAgIHZhciB0aGlzRGlzdGFuY2VcclxuICAgICAgaWYoZWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgdGhpc0Rpc3RhbmNlID0gaGVscGVycy5kaXN0YW5jZSh4LCB5LCBlbGVtZW50LnN0YXJ0UG9pbnQpXHJcbiAgICAgIH1lbHNlIGlmKGVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgICB0aGlzRGlzdGFuY2UgPSBoZWxwZXJzLmRpc3RhbmNlRnJvbVBvaW50VG9MaW5lKHgsIHksIGVsZW1lbnQuc3RhcnRQb2ludCwgZWxlbWVudC5lbmRQb2ludClcclxuICAgICAgfVxyXG4gICAgICBpZih0eXBlb2YgZGlzdGFuY2UgPT0gJ3VuZGVmaW5lZCcgfHwgdGhpc0Rpc3RhbmNlIDwgZGlzdGFuY2Upe1xyXG4gICAgICAgIGRpc3RhbmNlID0gdGhpc0Rpc3RhbmNlXHJcbiAgICAgICAgc2hhcGVFbGVtZW50ID0gZWxlbWVudFxyXG4gICAgICB9XHJcbiAgICB9KVxyXG5cclxuICAgIC8vIGNhbGN1bGF0ZSB0aGUgcmVsYXRpdmUgcG9zaXRpb24gaW5zaWRlIHRoZSBlbGVtZW50XHJcbiAgICAvLyBhbmQgZmluZCBtaW51dGVzXHJcbiAgICB2YXIgcG9zaXRpb25JblNoYXBlRWxlbWVudFxyXG5cclxuICAgIGlmKHNoYXBlRWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgIHZhciBhbmdsZSA9IGhlbHBlcnMuYW5nbGVCZXR3ZWVuVHdvUG9pbnRzKHgsIHksIHNoYXBlRWxlbWVudC5zdGFydFBvaW50KVxyXG4gICAgICBwb3NpdGlvbkluU2hhcGVFbGVtZW50ID0gaGVscGVycy5nZXRQcm9ncmVzc0JldHdlZW5Ud29WYWx1ZXMoYW5nbGUsIHNoYXBlRWxlbWVudC5zdGFydEFuZ2xlLCBzaGFwZUVsZW1lbnQuZW5kQW5nbGUpXHJcbiAgICB9ZWxzZSBpZihzaGFwZUVsZW1lbnQudHlwZSA9PT0gJ2xpbmUnKXtcclxuICAgICAgdmFyIGEgPSBoZWxwZXJzLmRpc3RhbmNlRnJvbVBvaW50VG9MaW5lKHgsIHksIHNoYXBlRWxlbWVudC5zdGFydFBvaW50LCBzaGFwZUVsZW1lbnQuZW5kUG9pbnQpXHJcbiAgICAgIHZhciBiID0gaGVscGVycy5kaXN0YW5jZSh4LCB5LCBzaGFwZUVsZW1lbnQuc3RhcnRQb2ludClcclxuICAgICAgdmFyIGxlbmd0aCA9IE1hdGguc3FydChiKmIgLSBhKmEpXHJcbiAgICAgIHBvc2l0aW9uSW5TaGFwZUVsZW1lbnQgPSBsZW5ndGggLyBzaGFwZUVsZW1lbnQubGVuZ3RoXHJcbiAgICB9IFxyXG4gICAgXHJcbiAgICB2YXIgbWludXRlcyA9IGhlbHBlcnMucmFuZ2Uoc2hhcGVFbGVtZW50LnN0YXJ0LCBzaGFwZUVsZW1lbnQuZW5kKSAqIHBvc2l0aW9uSW5TaGFwZUVsZW1lbnQgKyBzaGFwZUVsZW1lbnQuc3RhcnRcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBtaW51dGVzOiBtaW51dGVzLFxyXG4gICAgICBkaXN0YW5jZTogZGlzdGFuY2UsXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBoZWxwZXJzLm1pbnV0ZXNUb1hZID0gZnVuY3Rpb24gKGNoYXJ0LCBtaW51dGVzLCByYWRpdXMpe1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG4gICAgdmFyIHNoYXBlID0gY2hhcnQuc2hhcGVcclxuXHJcbiAgICB2YXIgbWludXRlcyA9IGhlbHBlcnMubGltaXQobWludXRlcyk7XHJcbiAgICAvLyBGaW5kIG91dCB3aGljaCBzaGFwZUVsZW1lbnQgd2UgZmluZCBvdXIgcG9pbnQgaW5cclxuICAgIHZhciBzaGFwZUVsZW1lbnQgPSBzaGFwZS5maW5kKGZ1bmN0aW9uIChlbGVtZW50KXtcclxuICAgICAgcmV0dXJuIChtaW51dGVzID49IGVsZW1lbnQuc3RhcnQgJiYgbWludXRlcyA8PSBlbGVtZW50LmVuZClcclxuICAgIH0pXHJcbiAgICBpZih0eXBlb2Ygc2hhcGVFbGVtZW50ID09ICd1bmRlZmluZWQnKXtcclxuICAgICAgY29uc29sZS5sb2cobWludXRlcylcclxuICAgICAgY29uc29sZS5sb2coc2hhcGUuZmluZChmdW5jdGlvbiAoZWxlbWVudCl7XHJcbiAgICAgICAgY29uc29sZS5sb2coZWxlbWVudClcclxuICAgICAgICByZXR1cm4gKG1pbnV0ZXMgPj0gZWxlbWVudC5zdGFydCAmJiBtaW51dGVzIDw9IGVsZW1lbnQuZW5kKVxyXG4gICAgICB9KSlcclxuICAgIH1cclxuICAgIFxyXG4gICAgLy8gRGVjaW1hbCB1c2VkIHRvIGNhbGN1bGF0ZSB3aGVyZSB0aGUgcG9pbnQgaXMgaW5zaWRlIHRoZSBzaGFwZVxyXG4gICAgdmFyIHBvc2l0aW9uSW5TaGFwZSA9IChtaW51dGVzIC0gc2hhcGVFbGVtZW50LnN0YXJ0KSAvIHNoYXBlRWxlbWVudC5taW51dGVzXHJcblxyXG4gICAgaWYoc2hhcGVFbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcblxyXG4gICAgICB2YXIgYmFzZVBvaW50ID0ge1xyXG4gICAgICAgIHg6IHNoYXBlRWxlbWVudC5zdGFydFBvaW50LnggKyBNYXRoLmNvcyhzaGFwZUVsZW1lbnQuc3RhcnRBbmdsZSkgKiBwb3NpdGlvbkluU2hhcGUgKiBzaGFwZUVsZW1lbnQubGVuZ3RoLFxyXG4gICAgICAgIHk6IHNoYXBlRWxlbWVudC5zdGFydFBvaW50LnkgKyBNYXRoLnNpbihzaGFwZUVsZW1lbnQuc3RhcnRBbmdsZSkgKiBwb3NpdGlvbkluU2hhcGUgKiBzaGFwZUVsZW1lbnQubGVuZ3RoXHJcbiAgICAgIH1cclxuICAgICAgdmFyIHBvaW50ID0ge1xyXG4gICAgICAgIHg6IGJhc2VQb2ludC54ICsgTWF0aC5jb3Moc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUtTWF0aC5QSS8yKSAqIHJhZGl1cyxcclxuICAgICAgICB5OiBiYXNlUG9pbnQueSArIE1hdGguc2luKHNoYXBlRWxlbWVudC5zdGFydEFuZ2xlLU1hdGguUEkvMikgKiByYWRpdXNcclxuICAgICAgfVxyXG5cclxuICAgIH1lbHNlIGlmIChzaGFwZUVsZW1lbnQudHlwZSA9PT0gJ2FyYycpe1xyXG5cclxuICAgICAgdmFyIGNlbnRlck9mQXJjID0gc2hhcGVFbGVtZW50LnN0YXJ0UG9pbnQ7XHJcbiAgICAgIHZhciBhbmdsZSA9IHBvc2l0aW9uSW5TaGFwZSAqIHNoYXBlRWxlbWVudC5yYWRpYW5zXHJcbiAgICAgIHZhciBwb2ludCA9IHtcclxuICAgICAgICB4OiBjZW50ZXJPZkFyYy54ICsgTWF0aC5jb3Moc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUgKyBhbmdsZSAtTWF0aC5QSS8yKSAqIHJhZGl1cyxcclxuICAgICAgICB5OiBjZW50ZXJPZkFyYy55ICsgTWF0aC5zaW4oc2hhcGVFbGVtZW50LnN0YXJ0QW5nbGUgKyBhbmdsZSAtTWF0aC5QSS8yKSAqIHJhZGl1c1xyXG4gICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwb2ludFxyXG4gIH1cclxuXHJcbiAgaGVscGVycy5jcmVhdGVDdXJ2ZSA9IGZ1bmN0aW9uIGNyZWF0ZUN1cnZlKGNoYXJ0LCBzdGFydCwgZW5kLCByYWRpdXMsIGFudGljbG9ja3dpc2Upe1xyXG4gICAgdmFyIGN0eCA9IGNoYXJ0LmN0eFxyXG5cclxuICAgIGlmKHR5cGVvZiBhbnRpY2xvY2t3aXNlID09ICd1bmRlZmluZWQnKXtcclxuICAgICAgdmFyIGFudGljbG9ja3dpc2UgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2hhcGUgPSBjaGFydC5zaGFwZS5zbGljZSgpO1xyXG4gICAgaWYoYW50aWNsb2Nrd2lzZSl7XHJcbiAgICAgIHNoYXBlLnJldmVyc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBmaW5kIG91dCB3aGljaCBzaGFwZUVsZW1lbnQgaGFzIHRoZSBzdGFydCBhbmQgZW5kXHJcbiAgICB2YXIgc3RhcnRFbGVtZW50SW5kZXgsIGVuZEVsZW1lbnRJbmRleFxyXG4gICAgc2hhcGUuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50LCBpKSB7XHJcbiAgICAgIGlmKGhlbHBlcnMuaXNJbnNpZGUoc3RhcnQsIGVsZW1lbnQuc3RhcnQsIGVsZW1lbnQuZW5kKSl7XHJcbiAgICAgICAgc3RhcnRFbGVtZW50SW5kZXggPSBpXHJcbiAgICAgIH1cclxuICAgICAgaWYoaGVscGVycy5pc0luc2lkZShlbmQsIGVsZW1lbnQuc3RhcnQsIGVsZW1lbnQuZW5kKSl7XHJcbiAgICAgICAgZW5kRWxlbWVudEluZGV4ID0gaTtcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIFxyXG4gICAgdmFyIHNoYXBlRWxlbWVudHMgPSBbXVxyXG4gICAgLy8gY3JlYXRlIGl0ZXJhYmxlIHRhc2sgYXJyYXlcclxuICAgIHZhciB0YXNrQXJyYXkgPSBbXTtcclxuICAgIHZhciBza2lwRW5kQ2hlY2sgPSBmYWxzZTtcclxuICAgIHZhciBkZWZhdWx0VGFzaztcclxuICAgIGlmKGFudGljbG9ja3dpc2Upe1xyXG4gICAgICBkZWZhdWx0VGFzayA9IHtcclxuICAgICAgICBzdGFydDogMSxcclxuICAgICAgICBlbmQ6IDBcclxuICAgICAgfVxyXG4gICAgfWVsc2V7XHJcbiAgICAgIGRlZmF1bHRUYXNrID0ge1xyXG4gICAgICAgIHN0YXJ0OiAwLFxyXG4gICAgICAgIGVuZDogMVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0RWxlbWVudEluZGV4OyBpIDwgc2hhcGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgdmFyIHRhc2sgPSB7XHJcbiAgICAgICAgc2hhcGVFbGVtZW50OiBzaGFwZVtpXSxcclxuICAgICAgICBzdGFydDogZGVmYXVsdFRhc2suc3RhcnQsXHJcbiAgICAgICAgZW5kOiBkZWZhdWx0VGFzay5lbmRcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYoaSA9PSBzdGFydEVsZW1lbnRJbmRleCl7XHJcbiAgICAgICAgdGFzay5zdGFydCA9IGhlbHBlcnMuZ2V0UG9zaXRpb25CZXR3ZWVuVHdvVmFsdWVzKHN0YXJ0LHNoYXBlW2ldLnN0YXJ0LHNoYXBlW2ldLmVuZCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYoaSA9PSBlbmRFbGVtZW50SW5kZXgpe1xyXG4gICAgICAgIHRhc2suZW5kID0gaGVscGVycy5nZXRQb3NpdGlvbkJldHdlZW5Ud29WYWx1ZXMoZW5kLHNoYXBlW2ldLnN0YXJ0LHNoYXBlW2ldLmVuZCk7XHJcbiAgICAgIH1cclxuICAgICAgaWYoaSA9PSBzdGFydEVsZW1lbnRJbmRleCAmJiBpID09IGVuZEVsZW1lbnRJbmRleCAmJiAodGFzay5lbmQgPiB0YXNrLnN0YXJ0ICYmIGFudGljbG9ja3dpc2UpIHx8ICh0YXNrLmVuZCA8IHRhc2suc3RhcnQgJiYgIWFudGljbG9ja3dpc2UpKXtcclxuICAgICAgICAvLyBtYWtlIHN1cmUgdGhpbmdzIGFyZSBjb3JyZWN0IHdoZW4gZW5kIGlzIGxlc3MgdGhhbiBzdGFydFxyXG4gICAgICAgIGlmKHRhc2tBcnJheS5sZW5ndGggPT0gMCl7XHJcbiAgICAgICAgICAvLyBpdCBpcyBiZWdpbm5pbmdcclxuICAgICAgICAgIHRhc2suZW5kID0gZGVmYXVsdFRhc2suZW5kO1xyXG4gICAgICAgICAgc2tpcEVuZENoZWNrID0gdHJ1ZTtcclxuICAgICAgICB9ZWxzZSB7XHJcbiAgICAgICAgICAvLyBpdCBpcyBlbmRcclxuICAgICAgICAgIHRhc2suc3RhcnQgPSBkZWZhdWx0VGFzay5zdGFydDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRhc2tBcnJheS5wdXNoKHRhc2spO1xyXG5cclxuICAgICAgaWYoaSA9PSBlbmRFbGVtZW50SW5kZXgpe1xyXG4gICAgICAgIGlmKHNraXBFbmRDaGVjayl7XHJcbiAgICAgICAgICBza2lwRW5kQ2hlY2sgPSBmYWxzZTtcclxuICAgICAgICAgIC8vIGxldCBpdCBydW4gYSByb3VuZCBhbmQgYWRkIGFsbCBzaGFwZXNcclxuICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgIC8vIGZpbmlzaGVkLi4gbm90aGluZyBtb3JlIHRvIGRvIGhlcmUhXHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGlmIHdlIHJlYWNoZWQgZW5kIG9mIGFycmF5IHdpdGhvdXQgaGF2aW5nIGZvdW5kXHJcbiAgICAgIC8vIHRoZSBlbmQgcG9pbnQsIGl0IG1lYW5zIHRoYXQgd2UgaGF2ZSB0byBnbyB0b1xyXG4gICAgICAvLyB0aGUgYmVnaW5uaW5nIGFnYWluXHJcbiAgICAgIC8vIGV4LiB3aGVuIHN0YXJ0OjcwMCBlbmQ6MzAwXHJcbiAgICAgIGlmKGkgPT0gc2hhcGUubGVuZ3RoLTEpe1xyXG4gICAgICAgIGkgPSAtMTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGFza0FycmF5LmZvckVhY2goZnVuY3Rpb24odGFzaywgaSkge1xyXG4gICAgICB2YXIgc2hhcGVFbGVtZW50ID0gdGFzay5zaGFwZUVsZW1lbnQ7XHJcbiAgICAgIGlmKHNoYXBlRWxlbWVudC50eXBlID09PSAnYXJjJyl7XHJcbiAgICAgICAgdmFyIHNoYXBlU3RhcnQgPSBzaGFwZUVsZW1lbnQuc3RhcnRBbmdsZS0oTWF0aC5QSS8yKTtcclxuICAgICAgICB2YXIgc3RhcnQgPSBzaGFwZVN0YXJ0ICsgKHRhc2tBcnJheVtpXS5zdGFydCAqIHNoYXBlRWxlbWVudC5yYWRpYW5zKTtcclxuICAgICAgICB2YXIgZW5kID0gc2hhcGVTdGFydCArICh0YXNrQXJyYXlbaV0uZW5kICogc2hhcGVFbGVtZW50LnJhZGlhbnMpO1xyXG4gICAgICAgIGN0eC5hcmMoc2hhcGVFbGVtZW50LnN0YXJ0UG9pbnQueCwgc2hhcGVFbGVtZW50LnN0YXJ0UG9pbnQueSwgcmFkaXVzLCBzdGFydCwgZW5kLCBhbnRpY2xvY2t3aXNlKTtcclxuICAgICAgfWVsc2UgaWYoc2hhcGVFbGVtZW50LnR5cGUgPT09ICdsaW5lJyl7XHJcbiAgICAgICAgdmFyIHN0YXJ0UG9pbnQgPSBoZWxwZXJzLm1pbnV0ZXNUb1hZKGNoYXJ0LHNoYXBlRWxlbWVudC5zdGFydCArIHNoYXBlRWxlbWVudC5taW51dGVzICogdGFzay5zdGFydCwgcmFkaXVzKVxyXG4gICAgICAgIHZhciBlbmRQb2ludCA9IGhlbHBlcnMubWludXRlc1RvWFkoY2hhcnQsc2hhcGVFbGVtZW50LnN0YXJ0ICsgc2hhcGVFbGVtZW50Lm1pbnV0ZXMgKiB0YXNrLmVuZCwgcmFkaXVzKVxyXG4gICAgICAgIGN0eC5saW5lVG8oc3RhcnRQb2ludC54LHN0YXJ0UG9pbnQueSlcclxuICAgICAgICBjdHgubGluZVRvKGVuZFBvaW50LngsZW5kUG9pbnQueSlcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGhlbHBlcnMuY3JlYXRlU2VnbWVudCA9IGZ1bmN0aW9uIChjaGFydCwgb3V0ZXIsIGlubmVyLCBzdGFydCwgZW5kKSB7XHJcbiAgICB2YXIgY3R4ID0gY2hhcnQuY3R4XHJcbiAgICBjdHguYmVnaW5QYXRoKClcclxuICAgIE5hcGNoYXJ0LmhlbHBlcnMuY3JlYXRlQ3VydmUoY2hhcnQsIHN0YXJ0LCBlbmQsIG91dGVyKVxyXG4gICAgTmFwY2hhcnQuaGVscGVycy5jcmVhdGVDdXJ2ZShjaGFydCwgZW5kLCBzdGFydCwgaW5uZXIsIHRydWUpXHJcbiAgICBjdHguY2xvc2VQYXRoKClcclxuICB9XHJcblxyXG59XHJcbiIsIlxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgY2lyY2xlOiBbXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdhcmMnLFxyXG4gICAgICB2YWx1ZTogTWF0aC5QSSoyXHJcbiAgICB9LFxyXG4gIF0sXHJcbiAgbGluZTogW1xyXG4gICAge1xyXG4gICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgIHZhbHVlOiAxMDBcclxuICAgIH0sXHJcbiAgXSxcclxuICBob3Jpem9udGFsRWxsaXBzZTogW1xyXG4gICAge1xyXG4gICAgICB0eXBlOiAnYXJjJyxcclxuICAgICAgdmFsdWU6IE1hdGguUEkgLyA0XHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgIHZhbHVlOiAyMFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2FyYycsXHJcbiAgICAgIHZhbHVlOiBNYXRoLlBJXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnbGluZScsXHJcbiAgICAgIHZhbHVlOiAyMFxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2FyYycsXHJcbiAgICAgIHZhbHVlOiBNYXRoLlBJICogMyAvIDRcclxuICAgIH1cclxuICBdLFxyXG4gIHNtaWxlOiBbXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdhcmMnLFxyXG4gICAgICB2YWx1ZTogTWF0aC5QSVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgdHlwZTogJ2xpbmUnLFxyXG4gICAgICB2YWx1ZTogMTUwXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICB0eXBlOiAnYXJjJyxcclxuICAgICAgdmFsdWU6IE1hdGguUElcclxuICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgdmFsdWU6IDE1MFxyXG4gICAgfVxyXG4gIF0sXHJcbiAgLy8gdmVydGljYWxFbGxpcHNlOiBbXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdhcmMnLFxyXG4gIC8vICAgICB2YWx1ZTogTWF0aC5QSS8yXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnbGluZScsXHJcbiAgLy8gICAgIHZhbHVlOiAxNTBcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdhcmMnLFxyXG4gIC8vICAgICB2YWx1ZTogTWF0aC5QSVxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2xpbmUnLFxyXG4gIC8vICAgICB2YWx1ZTogMTUwXHJcbiAgLy8gICB9LFxyXG4gIC8vICAge1xyXG4gIC8vICAgICB0eXBlOiAnYXJjJyxcclxuICAvLyAgICAgdmFsdWU6IE1hdGguUEkvMlxyXG4gIC8vICAgfVxyXG4gIC8vIF0sXHJcbiAgLy8gZnVja2VkOiBbXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdhcmMnLFxyXG4gIC8vICAgICB2YWx1ZTogTWF0aC5QSS8yKjNcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdsaW5lJyxcclxuICAvLyAgICAgdmFsdWU6IDEwMFxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2FyYycsXHJcbiAgLy8gICAgIHZhbHVlOiBNYXRoLlBJLzJcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdsaW5lJyxcclxuICAvLyAgICAgdmFsdWU6IDEwMFxyXG4gIC8vICAgfSxcclxuICAvLyAgIHtcclxuICAvLyAgICAgdHlwZTogJ2FyYycsXHJcbiAgLy8gICAgIHZhbHVlOiBNYXRoLlBJLzJcclxuICAvLyAgIH0sXHJcbiAgLy8gICB7XHJcbiAgLy8gICAgIHR5cGU6ICdsaW5lJyxcclxuICAvLyAgICAgdmFsdWU6IDUwXHJcbiAgLy8gICB9LFxyXG4gIC8vIF1cclxufSIsIlxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChOYXBjaGFydCkge1xyXG4gIE5hcGNoYXJ0LmNvbmZpZy5kZWZhdWx0VHlwZXM9IHtcclxuICAgICAgc2xlZXA6IHtcclxuICAgICAgICBzdHlsZTogJ3JlZCcsXHJcbiAgICAgICAgbm9TY2FsZTogdHJ1ZSxcclxuICAgICAgICBsYW5lOiAzXHJcbiAgICAgIH0sXHJcbiAgICAgIGJ1c3k6IHtcclxuICAgICAgICBzdHlsZTogJ2JsdWUnLFxyXG4gICAgICAgIG5vU2NhbGU6IHRydWUsXHJcbiAgICAgICAgbGFuZTogMSxcclxuICAgICAgfSxcclxuICAgICAgZGVmYXVsdDoge1xyXG4gICAgICBcdHN0eWxlOiAnYmxhY2snLFxyXG4gICAgICBcdG5vU2NhbGU6IHRydWUsXHJcbiAgICAgIFx0bGFuZTogMlxyXG4gICAgICB9XHJcbiAgfVxyXG59Il19

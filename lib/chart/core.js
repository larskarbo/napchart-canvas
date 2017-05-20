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

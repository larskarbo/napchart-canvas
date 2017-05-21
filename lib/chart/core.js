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
      // by for example react to update
      addListener: function(listener) {
        chart.listeners.push(listener)
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
    window.requestAnimationFrame(function() {
      console.log('drawing')
      Napchart.draw.drawFrame(chart)

      chart.listeners.forEach(function(listener) {
        listener(chart)
      })
    })
  }

  function loop(chart) {
    // body...
    window.requestAnimationFrame(function() {
      redraw(chart)
      loop(chart)
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

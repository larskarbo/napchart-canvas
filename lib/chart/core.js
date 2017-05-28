/*
*  Core module of Napchart
*
*/

module.exports = function (Napchart) {
  var helpers = Napchart.helpers

  Napchart.init = function (ctx, data, config) {
    
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
    var defaultData = {
      elements: [],
      selected: [],
      types: []
    }

    chart.ctx = ctx
    chart.canvas = ctx.canvas
    chart.width = chart.w = ctx.canvas.width
    chart.height = chart.h = ctx.canvas.height
    chart.ratio = chart.h / 100
    chart.config = initConfig(config)
    chart.data = helpers.extend(defaultData, data)
    chart.listeners = []

    scaleConfig(chart.config, chart.ratio)

    // initialize:
    chart.helpers = Napchart.helpers
    chart.styles = Napchart.styles
    Napchart.shape.init(chart)
    Napchart.draw.init(chart)
    Napchart.interactCanvas.init(chart)
    return chart
  }

  // private

  function redraw(chart) {

    chart.listeners.forEach(function(listener) {
      listener(chart)
    })
  }

  function redrawWithoutNotifying(chart) {

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

  function initElements(chart){
    var elements = chart.data.elements
    elements = elements.map(element => initElement(element, chart))
  }

  function initElement(element, chart) {

    // ** assign type based on typeString value

    if(typeof element.typeString == 'undefined'){
      element.typeString = 'default'
    }
    var type = chart.data.types.find(type => type.name == element.typeString)

    // check if type exists
    if(typeof type == 'undefined'){
      throw new Error(`Type ${element.typeString} does not exist`)
    }
    element.type = type

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

  // not in use right now
  // function populateTypes(chart) {
  //   chart.data.types.forEach(type => {
  //     if(typeof type.lane == 'number'){
  //       type.lane = chart.config.lanes[type.lane]
  //     }
  //     if(typeof type.style == 'string'){
  //       type.style = Napchart.styles[type.style]
  //     }
  //   })
  // }
}

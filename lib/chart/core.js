/*
*  Core module of Napchart
*
*/

module.exports = function (Napchart) {
  var helpers = Napchart.helpers

  Napchart.init = function (ctx, data, config) {
    
    // methods of instance:

    var chart = {
      setHover: function(id, type) {
        // hmm why is hoverElements an array?
        this.hoverElements = [{
          id,
          type
        }]
        redraw(this)
      },

      isHover: function(id, type) {
        var find = this.hoverElements.find(hoverElement => {
          return (hoverElement.id == id) && (hoverElement.type == type)
        })

        return find
      },

      isActive: function(id, type) {
        var activeElements = this.data.activeElements

        var find = activeElements.find(activeElement => {
          return (activeElement.elementId == id) && (activeElement.type == type)
        })

        return find
      },

      setActive: function(hit) {
        this.listeners.onSetActive.forEach(listener =>
          listener([...this.data.activeElements, hit])
        )
      },

      removeActive: function(identifier) {
        var activeElements = this.data.activeElements.filter(active => active.identifier != identifier)
        this.listeners.onSetActive.forEach(listener =>
          listener(activeElements)
        )
      },

      removeHovers: function() {
        this.hoverElements = []
        redraw(this)
      },

      setSelected: function(id){
        this.listeners.onSetSelected.forEach(function(listener) {
          listener(id)
        })
      },

      isSelected: function(id) {
        return this.data.selected.indexOf(id) >= 0
      },

      deselect: function() {
        this.listeners.onDeselect.forEach(function(listener) {
          listener()
        })
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

        this.listeners.onElementUpdate.forEach(function(listener) {
          listener(element)
        })

        // redraw(this)
      },

      draw: function() {
        draw(chart)
      },

      benchmark: function() {
        Napchart.draw.benchmark(this)
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
        // chart.listeners.push(listener)
      },

      onElementUpdate: function(callback) {
        chart.listeners.onElementUpdate.push(callback)
      },

      onSetSelected: function(callback) {
        chart.listeners.onSetSelected.push(callback)
      },

      onDeselect: function(callback) {
        chart.listeners.onDeselect.push(callback)
      },

      onSetActive: function(callback) {
        chart.listeners.onSetActive.push(callback)
      },

      // this function should only be used by a listener
      // to update napchart
      update: function(data) {
        chart.data = data
        if(data.shape != chart.oldShape){
          // wow! there is a new shape in the house!
          // we need to animate that shape
          Napchart.shape.changeShape(chart)
          chart.oldShape = data.shape
        }else{
          draw(chart)
        }
      },

      updateDimensions: function () {
        // probably because of resize
        
        chart.width = chart.w = ctx.canvas.width
        chart.height = chart.h = ctx.canvas.height
        chart.ratio = chart.h / 90
        chart.config = scaleConfig(chart.unScaledConfig, chart.ratio)
        chart.needFullRedraw = true
        Napchart.shape.initShape(chart)

        draw(this)
      }
    };

    // properties of instance:
    var defaultData = {
      elements: [],
      selected: [],
      types: [],
      activeElements: [],
      shape: '',
      title: '',
      description: ''
    }

    chart.ctx = ctx
    chart.canvas = ctx.canvas
    chart.unScaledConfig = initConfig(config)

    chart.width = chart.w = ctx.canvas.width
    chart.height = chart.h = ctx.canvas.height
    chart.ratio = chart.h / 90
    chart.config = scaleConfig(chart.unScaledConfig, chart.ratio)

    chart.data = helpers.extend(defaultData, data)
    chart.hoverElements = []
    chart.activeElements = []
    chart.listeners = {
      onElementUpdate: [],
      onSetSelected: [],
      onDeselect: [],
      onSetActive: []
    }
    chart.oldShape = chart.config.shape
    chart.needFullRedraw = true

    

    // initialize:
    chart.helpers = Napchart.helpers
    chart.styles = Napchart.styles
    
    Napchart.shape.initShape(chart)
    Napchart.interactCanvas.init(chart)
    draw(chart)
    return chart
  }

  // private

  function draw(chart) {
    // here we need to determine how much we should redraw
    function yeahBoy(){
      if(chart.needFullRedraw){
        Napchart.draw.fullDraw(chart)
        chart.needFullRedraw = false
      } else {
        Napchart.draw.drawFrame(chart)
      }
    }
    yeahBoy()
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

  function scaleConfig (config, ratio) {
    var scaledConfig = helpers.clone(config)
    function scaleFn (base, value, key) {
      if (value > 1 || value < 1 || value === 1) { // if value is a number
        base[key] = value * ratio
      }
    }
    helpers.deepEach(scaledConfig, scaleFn)
    return scaledConfig
  }
}

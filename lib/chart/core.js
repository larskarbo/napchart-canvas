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
        redraw(chart)
      }
    };

    // properties of instance:
    var defaultData = {
      elements: [],
      selected: [],
      types: [],
      activeElements: []
    }

    chart.ctx = ctx
    chart.canvas = ctx.canvas
    chart.width = chart.w = ctx.canvas.width
    chart.height = chart.h = ctx.canvas.height
    chart.ratio = chart.h / 100
    chart.config = initConfig(config)
    chart.data = helpers.extend(defaultData, data)
    chart.hoverElements = []
    chart.activeElements = []
    chart.listeners = {
      onElementUpdate: [],
      onSetSelected: [],
      onDeselect: [],
      onSetActive: []
    }

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
}

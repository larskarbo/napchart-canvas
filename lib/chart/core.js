/*
*  Core module of Napchart
*
*/

module.exports = function (Napchart) {
  var helpers = Napchart.helpers

  Napchart.init = function (ctx, data, config) {
    
    // methods of instance:

    var chart = {
      setHover: function(id) {
        // hmm why is hoverElements an array?
        this.hoverElements = [id]
        redraw(this)
      },

      isHover: function(id) {
        return this.hoverElements.indexOf(id) > -1
      },

      isActive: function(id) {
        if(typeof this.activeElements.find(element => element.origin.id == id) == 'undefined')
          return false
        console.log('yep true')
        return true
      },

      setActive: function(hit) {
        this.activeElements.push(hit)
        
        redraw(this)
      },

      removeActive: function(identifier) {
        for (var i = 0; i < this.activeElements.length; i++) {
          if (this.activeElements[i].identifier == identifier) {
            this.activeElements.splice(i, 1)
          }
        }
        redraw(this)
      },

      removeHovers: function() {
        this.hoverElements = []
        redraw(this)
      },

      setSelected: function(element){
        // todo: check active elements if more elements should be selected
        var selectedElements = [element.id]

        this.listeners.onSetSelected.forEach(function(listener) {
          listener(selectedElements)
        })
      },

      isSelected: function(id) {
        return this.data.selected.indexOf(id) >= 0
      },

      deselect: function() {
        this.listeners.onSetSelected.forEach(function(listener) {
          listener([])
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
        // don't need to actually run this code because the element
        // is already changed lol we were too late...

        // var target = this.data.elements.find(function(el) {
        //   return (el.id == element.id)
        // })
        // target = element

        this.listeners.onElementUpdate.forEach(function(listener) {
          listener(element)
        })

        // redraw(this)
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
        // chart.listeners.push(listener)
      },

      onElementUpdate: function(callback) {
        chart.listeners.onElementUpdate.push(callback)
      },

      onSetSelected: function(callback) {
        chart.listeners.onSetSelected.push(callback)
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
      types: []
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
      onSetSelected: []
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

  function initElements(chart){
    var elements = chart.data.elements
    elements = elements.map(element => initElement(element, chart))
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

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

      updateElement:function(changes) {
        // well, we find the type because the function on the outside
        // wants that to find out if type is locked
        var element = this.data.elements.find(element => element.id == changes.id)
        var type = this.data.types[element.typeId]
        this.listeners.onElementUpdate.forEach(listener => {
          listener(changes, type, this.data.elements)
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

        scale(chart)

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
    console.log('init')
    chart.ctx = ctx
    chart.canvas = ctx.canvas
    chart.unScaledConfig = initConfig(config)

    scale(chart)

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

  Napchart.destroy = function(id){

  }

  // private
  function scale(chart) {
    var canvas = chart.canvas
    retinaScale(canvas)
    chart.width = chart.w = canvas.width
    chart.height = chart.h = canvas.height
    chart.ratio = Math.min(chart.w / 90, chart.h / 90)
    chart.config = scaleConfig(chart.unScaledConfig, chart.ratio)
  }

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

  function retinaScale(canvas) {
    if(typeof window == 'undefined'){
      // we are in node
      return
    }
    var dpr = window.devicePixelRatio
    var _parent = canvas.parentNode

    var WIDTH = _parent.offsetWidth
    var HEIGHT = _parent.offsetHeight

    canvas.width = dpr * WIDTH
    canvas.height = dpr * HEIGHT

    canvas.style.width = '100%'
    canvas.style.height = '100%'
  }

  function initConfig(config) {
    config = config || {}
    config = helpers.extend(JSON.parse(JSON.stringify(Napchart.config)), config)

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

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
    'shapeChange':[]
  }

  Napchart.on = function(hook, f){
    hooks[hook].push(f);
  }

  function fireHook(hook, argument) {
    hooks[hook].forEach(function(f){
      f(argument)
    })
  }

  Napchart.init = function (ctx, config) {
    
    var instance = (function(){
      // private
      // var data = {};

      // public
      return {
        setElementState: function() {

        },
        setElement: function() {

        },
        setShape: function() {

        },
        setData: function(data) {
          this.data = data;
          fireHook('dataChange')
        },
        getData: function() {
          return data
        }
      }

    }());

    // also public
    instance.ctx = ctx
    instance.canvas = ctx.canvas
    instance.width = instance.w = ctx.canvas.width
    instance.height = instance.h = ctx.canvas.height
    instance.ratio = instance.h / 100
    instance.config = initConfig(config)
    instance.data = {}


    scaleConfig(instance.config, instance.ratio)
    Napchart.initShape(instance)

    fireHook('initialize', instance)

    // helpers.retinaScale(chart)
    // Napchart.draw(instance)
    // console.log(modules)
    // modules[0](chart)

    return instance
  }

  

  // Napchart.prototype.setData = function (data) {
  //   this.data = data
  //   console.log('setdata', this)
  //   Napchart.draw(this)
  // }

  // Napchart.addModule = function (f) {
  //   modules.push(f)
  //   console.log('setdata', this)
  // }

  /**
   * Initializes the given config with global and Napchart default values.
   */
  function initConfig (config) {
    config = config || {}

    config = helpers.extend(Napchart.config, config)

    return config
  }

  function scaleConfig (config, ratio) {
    function scaleFn (base, value, key) {
      // body...
      // console.log(value)
      if (value > 1) {
        // value = 199
        base[key] = value * ratio
      // console.log(key, value)
      }
    }
    helpers.deepEach(config, scaleFn)
    return config
  }
}

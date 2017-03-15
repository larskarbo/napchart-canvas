/*
*  Core module of Napchart
*
*/

module.exports = function (Napchart) {
  var helpers = Napchart.helpers
  var modules = []

  Napchart.prototype.initialize = function (ctx, config) {
    var chart = this

    chart.ctx = ctx
    chart.canvas = ctx.canvas
    chart.width = chart.w = ctx.canvas.width
    chart.height = chart.h = ctx.canvas.height
    chart.ratio = chart.h / 100
    chart.config = initConfig(config)
    chart.data = {}

    scaleConfig(chart.config, chart.ratio)
    Napchart.initShape(chart)
    helpers.retinaScale(chart)
    Napchart.draw(this)
    console.log(modules)
    modules[0](chart)
  }

  Napchart.prototype.setData = function (data) {
    this.data = data
    console.log('setdata', this)
    Napchart.draw(this)
  }

  Napchart.addModule = function (f) {
    modules.push(f)
    console.log('setdata', this)
  }

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

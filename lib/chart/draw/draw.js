

module.exports = function (Napchart) {

  // import styles
  require('./styles')(Napchart)

  Napchart.draw = {
    init: initDraw,
    drawFrame: draw,
    benchmark: benchmark
  }

  var tasks = [
    // clear
    require('./clear'),

    // - face

    // -- circles
    require('./face/circles'),
    // -- lines
    require('./face/lines'),
    // -- text
    require('./face/text'),

    // - content

    // -- bars
    require('./content/bars'),
    // -- handles
    require('./content/handles'),
    // -- handleTimes
    require('./content/handleTimes'),
    // -- text
    require('./content/text'),
  ]

  function initDraw(chart){
    var ctx = chart.ctx

    ctx.font = chart.config.fontSize + 'px ' + chart.config.font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    draw(chart)
  }

  function draw(chart) {
    tasks.forEach(function(task) {
      task(chart, Napchart)
    })
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

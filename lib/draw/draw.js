

module.exports = function (Napchart) {

  // import styles
  require('./styles')(Napchart)

  Napchart.draw = {
    fullDraw: fullDraw,
    drawFrame: draw,
    benchmark: benchmark
  }

  var clear = require('./clear')

  var tasks = [
    // // - face

    function(chart){
      if(typeof Napchart.draw.ocanvas != 'undefined'){
        chart.ctx.drawImage(Napchart.draw.ocanvas, 0, 0)
      }
    },

    // - content

    // -- bars
    require('./content/bars'),
    // -- handles
    require('./content/handles'),
    // -- handleTimes
    require('./content/handleTimes'),
    // -- text
    require('./content/text'),
    // -- distances
    require('./content/distances'),
    // -- metaText
    require('./content/metaText'),
  ]

  var faceTasks = [
    // -- circles
    require('./face/background'),
    // -- circles
    require('./face/circles'),
    // -- lines
    require('./face/lines'),
    // -- text
    require('./face/text'),
  ]

  function fullDraw(chart) {
    var ctx = chart.ctx
    ctx.font = chart.config.fontSize + 'px ' + chart.config.font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    clear(chart)

    if(typeof document == 'undefined'){
      // we are in a node environment
      // dont do the offscreen thing
      faceTasks.forEach(function(task) {
        task(chart, chart.ctx)
      })
      tasks.forEach(function(task) {
        task(chart, chart.ctx)
      })
    } else {
      Napchart.draw.ocanvas = document.createElement('canvas')
      Napchart.draw.ocanvas.width = chart.width
      Napchart.draw.ocanvas.height = chart.height
      var octx = Napchart.draw.ocanvas.getContext('2d')

      var fakeChartWithOCTXINSTEADOFCTXTHISISAGOODVARIABLENAME = Object.assign({}, chart, {ctx: octx})
      faceTasks.forEach(function(task) {
        task(fakeChartWithOCTXINSTEADOFCTXTHISISAGOODVARIABLENAME, octx)
      })
      
      draw(chart)
    }
    

  }

  function draw(chart) {
    clear(chart)

    tasks.forEach(function(task) {
      task(chart, Napchart)
    })
  }

  function benchmark(chart) {
    var iterations = 1000
    var bigstart = Date.now()
    for (task in tasks) {
      var start = Date.now()
      for (var i = 0; i < iterations; i++) {
        tasks[task](chart, Napchart)
      }
      var end = Date.now()
      console.log(`${task} x ${iterations} ` + (end-start) + ' ms')
    }
    var bigend = Date.now()
    console.log(`Total: ` + (bigend-bigstart) + ' ms')
    console.log(`One round: ` + ((bigend-bigstart)/iterations) + ' ms')
  }
}

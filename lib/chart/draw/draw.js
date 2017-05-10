

module.exports = function (Napchart) {

  // import styles
  require('./styles')(Napchart)

  Napchart.on('initialize', function(instance) {
    draw(instance);
  })

  Napchart.on('dataChange', function(instance) {
    draw(instance)
  })

  Napchart.on('benchmark', function(instance) {
    benchmark(instance)
  })

  var tasks = {
    // clear
    clear: require('./clear'),

    // face
    circles: require('./face/circles'),
    lines: require('./face/lines'),
    text: require('./face/text'),

    // content
    bars: require('./content/bars'),
    handles: require('./content/handles'),
  }

  function draw(chart) {
    for (task in tasks) {
      tasks[task](chart, Napchart)
    }
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

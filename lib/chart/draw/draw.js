module.exports = function (Napchart) {
  var chart;

  Napchart.on('initialize', function(instance) {
    chart = instance
    draw(chart);
  })

  Napchart.on('dataChange', function(instance) {
    draw(chart)
  })

  function draw(chart) {
    chart.circle = function (radius) {
      var ctx = chart.ctx
      ctx.strokeStyle = chart.config.face.strokeColor
      ctx.lineWidth = chart.config.face.stroke

      ctx.beginPath()
      Napchart.shape.createCurve(chart, radius, 0, 1440)
      ctx.stroke()
    }

    require('./face/circles')(chart)
    require('./face/lines')(chart)
    require('./elements/circle')(chart)

    require('./content/bars')(chart, Napchart)
  }
}

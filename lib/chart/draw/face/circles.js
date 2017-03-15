module.exports = function (chart) {
  var circles = chart.config.face.circles

  for (i = 0; i < circles.length; i++) {
    chart.circle(circles[i].radius)
  }

// for (var i = 0; i < 24; i++) {
// 	var minutes = i*1440/24
// 	Napchart.draw.elements.line(chart, minutes, 0, circles[0].radius)
// }
}

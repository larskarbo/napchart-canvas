/*
*  Fancy module that does shit
*/

module.exports = function (Napchart) {
  var chart;

  Napchart.on('initialize', function(instance) {
    chart = instance
    chart.canvas.onclick = function() {
    	chart.setData({
		  nap: [],
		  core: [{start: 1410, end: 480, state:'active'}, {start: 1000, end: 1020}],
		  busy: [{start: 700, end: 900}]
		})
    }
  })
}

/*
*  Fancy module that does shit
*/

module.exports = function (Napchart) {
	Napchart.addModule(function(chart) {

		document.getElementById("canvas").addEventListener("click", function() {
			// console.log(Napchart.prototype)
			chart.setData({
			  nap: [],
			  core: [{start: 1310, end: 180, state:'active'}, {start: 500, end: 1020}],
			  busy: [{start: 700, end: 900}]
			})
		});

	})
}
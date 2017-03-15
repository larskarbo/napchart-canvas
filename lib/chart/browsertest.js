var Napchart = require('./')

var mynapchart = new Napchart(document.getElementById('canvas').getContext('2d'))

mynapchart.setData({
  nap: [],
  core: [{start: 1410, end: 480, state:'active'}, {start: 1000, end: 1020}],
  busy: [{start: 700, end: 900}]
})

console.log(mynapchart)

window.lol = mynapchart
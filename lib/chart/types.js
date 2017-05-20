
module.exports = function (Napchart) {
  Napchart.config.defaultTypes= {
      sleep: {
        style: 'red',
        noScale: true,
        lane: 3
      },
      busy: {
        style: 'blue',
        noScale: true,
        lane: 1,
      },
      default: {
      	style: 'black',
      	noScale: true,
      	lane: 2
      }
  }
}
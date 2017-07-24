
module.exports = function (Napchart) {
  Napchart.config = {
    interaction: true,
    shape: 'circle',
    baseRadius:32,
    edgeRadius:42,
    font:'monospace',
    fontSize:2.1,
    background: 'transparent',
    face: { // define how the background clock should be drawn
      stroke: 0.15,
      weakStrokeColor: '#dddddd',
      strokeColor: '#777777',
      importantStrokeColor: 'black',
      importantLineWidth: 0.3,
      numbers: {
        radius: 40,
        color: '#262626',
        size: 3.3
      },
      fiveMinuteStrokesLength: 0,
      tenMinuteStrokesLength: 0.5,
      hourStrokesLength: 3,
      
    },
    content: {
      handleTimes: {
        distance: 2.5,
        fontSize: 1.75,
        color: 'grey'
      },
      handleTimesActive: {
        distance: 3.5,
        fontSize: 3.25,
        color: '#4e4e4e'
      },
      handles: 0.8,
      textDistance:5,
    },
    handlesClickDistance: 4
  }
}
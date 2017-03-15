module.exports = function (Napchart) {
  Napchart.config = {
    face: { // define how the background clock should be drawn
      circles: [
        {radius: 34},
        {radius: 24}
      ],
      clearCircle: 20,
      blurCircle: {
        radius: 29,
        opacity: 0.8
      },
      stroke: 1,
      strokeColor: '#777777',
      impStrokeColor: '#262626',
      clockNumbers: {
        radius: 44,
        color: '#262626'
      },
      between: {
        strokeColor: '#d2d2d2',
        textColor: 'black',
        opacity: 0.5
      },
      timeLocation: 4 // how far away from the bar the time indicators should be
    },
    bars: {
      core: {
        stack: 0,
        color: '#c70e0e',
        innerRadius: 29,
        outerRadius: 40,
        stroke: {
          lineWidth: 1
        },
        rangeHandles: true,
        opacity: 1,
        hoverOpacity: 0.5,
        activeOpacity: 0.5,
        selected: {
          strokeColor: '#FF6363',
          lineWidth: 1,
          expand: 0.5
        }
      },
      nap: {
        stack: 1,
        color: '#c70e0e',
        innerRadius: 29,
        outerRadius: 40,
        stroke: {
          lineWidth: 2
        },
        opacity: 0.6,
        hoverOpacity: 0.5,
        activeOpacity: 0.5,
        selected: {
          strokeColor: 'grey',
          lineWidth: 1,
          expand: 0.5
        }
      },
      busy: {
        stack: 2,
        color: '#1f1f1f',
        innerRadius: 29,
        outerRadius: 36,
        stroke: {
          lineWidth: 2
        },
        rangeHandles: true,
        opacity: 0.6,
        hoverOpacity: 0.5,
        activeOpacity: 0.5,
        selected: {
          strokeColor: '#FF6363',
          lineWidth: 1,
          expand: 0.5
        }
      },
      general: {
        textSize: 4,
        color: 'black'
      }
    }
  }
}
// var Config = {}
// Config.barConfig = {

// }

// 	Config.darkBarConfig = { //when darkmode is on
// 		core:{
// 			color:'#733134',
// 			opacity:0.7,
// 			hoverOpacity:0.7,
// 			activeOpacity:0.7,
// 			selected:{
// 				strokeColor:'#FF6363',
// 				lineWidth:1,
// 				expand:0.5
// 			}
// 		},
// 		nap:{
// 			color:'#c70e0e',
// 			opacity:0.7,
// 			hoverOpacity:0.7,
// 			activeOpacity:0.7,
// 			selected:{
// 				strokeColor:'#FF6363',
// 				lineWidth:1,
// 				expand:0.5
// 			}
// 		},
// 		busy:{
// 			color:'#9E9E9E',
// 			opacity:0.6,
// 			hoverOpacity:0.5,
// 			activeOpacity:0.5,
// 			selected:{
// 				strokeColor:'#FF6363',
// 				lineWidth:1,
// 				expand:0.5
// 			}
// 		},
// 		general:{
// 			color:'white'
// 		}
// 	}

// 	Config.darkClockConfig = {
// 		background:'#373737',
// 		circles:[
// 		{radius:36},
// 		{radius:29},
// 		{radius:20},
// 		{radius:2}
// 		],
// 		clearCircle: 20,
// 		blurCircle:{
// 			radius:29,
// 			opacity:0.5
// 		},
// 		stroke:0.32,
// 		strokeColor:'#525252',
// 		impStrokeColor:'EDEDED',
// 		clockNumbers:{
// 			radius:44,
// 			color:'#BFBFBF'
// 		},
// 		between:{
// 			strokeColor: '#A5A5A5',
// 			textColor: 'white',
// 			opacity: 0.9,
// 		},
// 		timeLocation:4, //how far away from the bar the time indicators should be
// 	}

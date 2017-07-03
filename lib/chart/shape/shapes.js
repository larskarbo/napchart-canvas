

module.exports = {
  circle: {
    elements: [
      {
        type: 'arc',
        radians: Math.PI
      },
      {
        type: 'line',
        percent: 0 // percent
      },
      {
        type: 'arc',
        radians: Math.PI
      },
      {
        type: 'line',
        percent: 0 // percent
      }
    ],
    shift: 0
  },
  line: {
    elements:[
      {
        type: 'line',
        percent: 100
      }
    ],
    shift: 0
  },
  compactLine: {
    elements:[
      {
        type: 'line',
        percent: 5
      }
    ],
    shift: 0
  },
  wide: {
    elements: [
      {
        type: 'arc',
        radians: Math.PI
      },
      {
        type: 'line',
        percent: 100 // percent
      },
      {
        type: 'arc',
        radians: Math.PI
      },
      {
        type: 'line',
        percent: 100 // percent
      }
    ],
    shift: 0
  },
  transitionShape: {
    elements: [
      {
        type: 'arc',
        radians: Math.PI/6
      },
    ],
    shift: 0
  },
  // smile: {
  //   elements: [
  //     {
  //       type: 'arc',
  //       radians: Math.PI/4
  //     },
  //   ],
  //   shift: 0
  // },
  // verticalEllipse: [
  //   {
  //     type: 'arc',
  //     value: Math.PI/2
  //   },
  //   {
  //     type: 'line',
  //     value: 150
  //   },
  //   {
  //     type: 'arc',
  //     value: Math.PI
  //   },
  //   {
  //     type: 'line',
  //     value: 150
  //   },
  //   {
  //     type: 'arc',
  //     value: Math.PI/2
  //   }
  // ],
  // fucked: [
  //   {
  //     type: 'arc',
  //     value: Math.PI/2*3
  //   },
  //   {
  //     type: 'line',
  //     value: 100
  //   },
  //   {
  //     type: 'arc',
  //     value: Math.PI/2
  //   },
  //   {
  //     type: 'line',
  //     value: 100
  //   },
  //   {
  //     type: 'arc',
  //     value: Math.PI/2
  //   },
  //   {
  //     type: 'line',
  //     value: 50
  //   },
  // ]
}


module.exports = {
  circle: {
    elements: [
      {
        type: 'arc',
        radians: Math.PI*2
      },
    ],
    shift: 0
  },
  line: [
    {
      type: 'line',
      percent: 100
    },
  ],
  horizontalEllipse: {
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
    shift: 600
  }
  ,
  // smile: [
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
  //     value: Math.PI
  //   },
  //   {
  //     type: 'line',
  //     value: 150
  //   }
  // ],
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


module.exports = function (Napchart) {
  var helpers = Napchart.helpers
  var styles = Napchart.styles = {
    
  }

  styles.default = {
    color: 'black',
    opacities: {
      noScale:true,
      opacity: 0.6,
      hoverOpacity: 0.5,
      activeOpacity: 0.6,
      selectedOpacity: 0.55,
    },
    stroke: {
      lineWidth:2
    },
  }

  styles.red = helpers.extend({}, styles.default, {
    color: '#c70e0e'
  }) 

  styles.white = helpers.extend({}, styles.default, {
    color: 'white'
  }) 

  styles.black = helpers.extend({}, styles.default, {
    color: '#1f1f1f'
  })

  styles.grey = helpers.extend({}, styles.default, {
    color: 'grey'
  })

  styles.blue = helpers.extend({}, styles.default, {
    color: 'blue',
    weakColor: '#adadff',
  })

  styles.green = helpers.extend({}, styles.default, {
    color: 'green',
    weakColor: '#7aba7a'
  })
  
}
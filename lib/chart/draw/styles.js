

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
      selectedOpacity: 0.35,
    },
    stroke: {
      lineWidth:2
    },
  }

  styles.red = helpers.extend({}, styles.default, {
    color: '#c70e0e',
    selected: {
      strokeColor: '#FF6363',
    }
  }) 

  styles.black = helpers.extend({}, styles.default, {
    color: '#1f1f1f',
    selected: {
      strokeColor: '#FF6363',
    }
  })

  styles.grey = helpers.extend({}, styles.default, {
    color: 'grey',
    selected: {
      strokeColor: '#FF6363',
    }
  })

  styles.blue = helpers.extend({}, styles.default, {
    color: 'blue'
  })

  styles.green = helpers.extend({}, styles.default, {
    color: 'green'
  })
  
}
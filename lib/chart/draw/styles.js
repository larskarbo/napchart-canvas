

module.exports = function (Napchart) {
  var helpers = Napchart.helpers
  var styles = Napchart.styles = {
    
  }

  styles.default = {
    color: 'black',
    opacities: {
      opacity: 0.6,
      hoverOpacity: 0.5,
      activeOpacity: 0.6,
      selectedOpacity: 0.55,
    },
    stroke: {
      lineWidth:2
    },
  }

  var colors = {
    red: '#B11111',
    blue: '#0A6A6A',
    brown: '#B15911',
    green: '#0D8D0D',
    gray: '#949494',
    yellow: '#D9CF27',
    purple: '#730B73',
    pink: '#CB497B'
  }

  for(var name in colors){
    styles[name] = helpers.extend({}, styles.default, {
      color: colors[name]
    })
  }
  
}
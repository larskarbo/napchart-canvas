/*
*  Animation module
*/

module.exports = function (Napchart) {
  var helpers = Napchart.helpers

  Napchart.animation = {
    animateShape: function(instance, targetShape) {
      animateShape(instance.shape, targetShape, function(shape) {
        instance.setShape(shape)
      })
      // animateShape(instance)
    }
  }

  function animate(chart) {
    var from = {
      nap: [],
      core: [{start: 1430, end: 20, state:'active'}, {start: 1000, end: 1020}],
      busy: [{start: 700, end: 900}]
    }
    var to = {
      nap: [],
      core: [{start: 2, end: 300, state:'active'}, {start: 1000, end: 1035}],
      busy: [{start: 800, end: 900}]
    }
    var timeShouldUse = 500;
    var startTime = Date.now();
    var endTime = startTime + timeShouldUse;

    helpers.eachElementYo(from, function(name, count) {
      from[name][count].originalStart = from[name][count].start
      from[name][count].originalEnd = from[name][count].end
      from[name][count].distanceStart = helpers.shortestWay(to[name][count].start - from[name][count].start)
      from[name][count].distanceEnd = helpers.shortestWay(to[name][count].end - from[name][count].end)
    })


    function every(){
      var nowTime = Date.now();
      var progress = Math.min(1, (nowTime - startTime) / timeShouldUse)

      progress = applyEasing(progress)
      addProgresses(from, progress)
      chart.setData(from)

      if(progress < 1){
        window.requestAnimationFrame(every)
      }
    }

    window.requestAnimationFrame(every)

    function addProgresses(data, progress) {
      helpers.eachElementYo(data, function(name, count) {
        data[name][count].start = helpers.limit(data[name][count].originalStart + data[name][count].distanceStart * progress)
        data[name][count].end = helpers.limit(data[name][count].originalEnd + data[name][count].distanceEnd * progress)
      })
    }

    function applyEasing(progress) {
      return helpers.easingEffects.easeInOutCubic(progress)
    }

  }

  
}

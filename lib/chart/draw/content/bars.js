module.exports = function (chart, Napchart) {
  var ctx = chart.ctx
  var data = chart.data
  var canvas = ctx.canvas
  var barConfig = chart.config.bars
  var helpers = Napchart.helpers

  helpers.eachElement(chart, function(element, config){
    var ctx = chart.ctx
    ctx.save()
    ctx.fillStyle = config.color
    
    switch(element.state){
      case 'active':
        ctx.globalAlpha = config.activeOpacity
        break
      case 'hover':
        ctx.globalAlpha = config.hoverOpacity
        break
      default:
        ctx.globalAlpha = config.opacity
    }

    Napchart.shape.createSegment(chart, config.outerRadius, config.innerRadius, element.start, element.end);

    ctx.fill()
    ctx.restore()
  })


  helpers.eachElement(chart, function(element, config){
    helpers.strokeSegment(chart, element.start, element.end, config)
  });

  // for (var name in data) {
  //   var opacity = barConfig[name].opacity,
  //     hoverOpacity = barConfig[name].hoverOpacity,
  //     activeOpacity = barConfig[name].activeOpacity

  //     // if(interactCanvas.isActive(name,count,'whole') || napchartCore.isSelected(name,count)){
  //     // 	ctx.globalAlpha = activeOpacity
  //     // }

  //     // else if(interactCanvas.isActive(name,count) || interactCanvas.isHover(name,count,'whole')){
  //     // 	ctx.globalAlpha=hoverOpacity
  //     // }

  //     // else{
  //     ctx.globalAlpha=opacity
  //     // }
  //   }
  // }
}


    // var pcanvas = document.createElement('canvas');
    // pcanvas.height = 40;
    // pcanvas.width = 20;
    // pctx = pcanvas.getContext('2d');
    // pctx.fillStyle = config.color;
    // pctx.arc(5, 5, 5, 0, Math.PI*2)
    // pctx.arc(15, 25, 5, 0, Math.PI*2)
    // pctx.fill();
    // var pattern = ctx.createPattern(pcanvas, 'repeat')
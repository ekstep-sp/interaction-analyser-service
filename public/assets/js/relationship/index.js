var relationshipModule = function () {
  // retrieve color codes
  var colorCodes = colorConfig.colorCodes;
  var varConfig = variablesConfig;

  this.arrowstatus = false;

  this.arrowHead = function (svg) {
    arrowstatus = true;
    svg
      .append('svg:defs')
      .append('svg:marker')
      .attr('id', 'triangle')
      .attr('refX', varConfig.RELATION.ARROWHEAD.REF_X)
      .attr('refY', varConfig.RELATION.ARROWHEAD.REF_Y)
      .attr('markerWidth', varConfig.RELATION.ARROWHEAD.MARKER.WIDTH)
      .attr('markerHeight', varConfig.RELATION.ARROWHEAD.MARKER.HEIGHT)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 12 6 0 12 3 6')
      .style('fill', colorCodes.arrowColor);
  };
  this.lineCreation = function (svg, data) {
    var weight = data.weight || varConfig.RELATION.DEFAULT_WEIGHT;

    //var x1 = data.x1 - 30;
    //var x2 = data.x2 - 30;
    //var y1 = data.y1 - 30;
    //var y2 = data.y2 - 30;
    var arrowheadLength = 8, // from markerWidth
      nodeRadius = 40;
    var x1 = data.x1,
      y1 = data.y1,
      x2 = data.x2,
      y2 = data.y2,
      angle = Math.atan2(y2 - y1, x2 - x1),
      angle2 = Math.atan2(y1 - y2, x1 - x2),
      dX = x2 - Math.cos(angle) * (nodeRadius + arrowheadLength),
      dY = y2 - Math.sin(angle) * (nodeRadius + arrowheadLength),
      sX = x1 - Math.cos(angle2) * (nodeRadius + arrowheadLength),
      sY = y1 - Math.sin(angle2) * (nodeRadius + arrowheadLength);
    svg
      .append('line')
      .attr('x1', sX)
      .attr('y1', sY)
      .attr('x2', dX)
      .attr('y2', dY)

      .attr('stroke-width', weight)
      .attr('stroke', colorCodes.lineColor)
      .attr('marker-end', 'url(#triangle)');
  };

  this.createRelation = function (data) {
    this.data = data;
    var source = this.data.source;
    var target = this.data.target;
    var svg = this.data.svgelem;
    if (!source && !target && !this.data.x1 && !this.data.y1 && !this.data.x2 && !this.data.y2) {
      var err = new Error('please proved source and target and coordinates');
      throw err;
    }

    arrowHead(svg);
    lineCreation(svg, this.data);
  };
  return this;
};

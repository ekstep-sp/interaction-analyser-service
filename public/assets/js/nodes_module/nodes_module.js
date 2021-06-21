var nodeModule = (function (d3) {
  // retrieve colors for nodes
  var colorCodes = colorConfig.colorCodes;
  // retrieve constants used in the app
  var varConfig = variablesConfig;

  var increaseRadius = function (hub, currentNode) {
    // no longer used now
    var temp = currentNode.cdoi;
    temp = temp / 150;

    console.log('sum', temp);
    let Circle = d3.select(`[id="${hub.pid}"]`);

    // limit to 80
    temp = temp > 60 ? 60 : temp;
    Circle.data()[0].original_radius = temp;
    Circle.data()[0].ci_graphdata = currentNode.ci_graph;

    Circle.attr('r', temp);
  };

  var _recursive_transitions = function (selection, selectionData) {
    if (selectionData.ia !== -1) {
      selection
        .transition()
        .duration(function (d) {
          //return 1000;
          return varConfig.TRANSITION.DURATION / parseInt(d.ci_graph) + varConfig.TRANSITION.DURATION_OFFSET;
        })
        .attr('stroke-width', 2)
        .attr('r', function (d) {
          return +d.original_radius > varConfig.TRANSITION.RADIUS.MAX
            ? varConfig.TRANSITION.RADIUS.MAX
            : d.original_radius;
        })
        .transition()
        .duration(function (d) {
          return varConfig.TRANSITION.DURATION / parseInt(d.ci_graph) + varConfig.TRANSITION.DURATION_OFFSET;
        })
        .attr('stroke-width', 3)
        .attr('r', function (d) {
          //return (d.original_radius > varConfig.TRANSITION.RADIUS.MAX ? varConfig.TRANSITION.RADIUS.MAX+varConfig.TRANSITION.RADIUS.OFFSET : +d.original_radius + varConfig.TRANSITION.RADIUS.OFFSET);

          if (d.ptype.toLowerCase() == 'hub') {
            return d.original_radius > varConfig.TRANSITION.RADIUS.MAX
              ? varConfig.TRANSITION.RADIUS.MAX + varConfig.TRANSITION.RADIUS.OFFSET
              : +d.original_radius + varConfig.TRANSITION.RADIUS.OFFSET;
          } else {
            if (d.interactioCount == null) {
              d.interactioCount = 0;
            } else {
              d.interactioCount = d.interactioCount + 1;
            }
            //console.error("InitData:"+ JSON.stringify(d));
            //console.error("InitData:"+ d.original_radius +" " + d.interactioCount);
            // if(d.pname == "Speaker_1"){}
            if (+d.original_radius > varConfig.TRANSITION.RADIUS.MAX) {
              console.error('InitData: IF:');
              return d.original_radius;
              //d.original_radius =
              //varConfig.TRANSITION.RADIUS.MAX+varConfig.TRANSITION.RADIUS.OFFSET
            } else {
              //console.error("InitData: ELSE:");
              d.original_radius = +d.original_radius + varConfig.TRANSITION.RADIUS.OFFSET;
              //console.error("InitData:"+ JSON.stringify(d));
              return d.original_radius;
            }
            //return (d.original_radius > varConfig.TRANSITION.RADIUS.MAX ? varConfig.TRANSITION.RADIUS.MAX+varConfig.TRANSITION.RADIUS.OFFSET : +d.original_radius + varConfig.TRANSITION.RADIUS.OFFSET);
          }
        })
        .on('end', _recursive_transitions.bind(null, selection, selectionData));
    }
  };

  function _startFlicker(circle, miniCircle, data) {
    // preserve the original radius
    // increase the mini circle position as per the circle's radius

    _recursive_transitions(circle, data);
  }

  function _calcNewPosition(positionFor, data) {
    if (data.ia !== -1) {
      if (positionFor == 'x') {
        let cdoi = +data.cdoi / 150;
        cdoi = cdoi > 60 ? 60 : cdoi;
        return data.x + cdoi + 20;
      } else if (positionFor == 'y') {
        return data.y - 20 - data.cdoi / 100;
      }
    } else {
      // for all nodes who never communicated
      if (positionFor == 'x') {
        return data.x + 9;
      } else if (positionFor == 'y') {
        return data.y - 13;
      }
    }
  }

  var _renderToGraph = function (
    circle,
    activeCircle,
    miniCircle,
    miniCircleImg,
    miniCircleImg2,
    miniCircleImg3,
    nodeDetails
  ) {
    circle
      .data([nodeDetails])
      .attr('cx', nodeDetails.x)
      .attr('cy', nodeDetails.y)
      .attr('class', nodeDetails.ptype.toLowerCase())
      .attr('r', function (d) {
        return !d.cdoi || d.cdoi / 100 < varConfig.NODE_SIZE.MIN
          ? varConfig.NODE_SIZE.MIN
          : d.cdoi >= varConfig.NODE_SIZE.MAX
          ? varConfig.NODE_SIZE.MAX
          : d.cdoi / 100;
      })
      .attr('fill', '#42428B')
      .attr('fill1', function (d) {
        if (d.ptype.toLowerCase() == varConfig.SPOKE) {
          return colorCodes.spokeColor;
        } else if (d.ptype.toLowerCase() == varConfig.SUBSPOKE) {
          // assign a random color to this new subspoke and store it in its meta data
          d['assigned_color'] = colorConfig.getRandomColor();
          return d.assigned_color;
        } else {
          return colorCodes.hubColor;
        }
      })
      .on('mouseover', function (d) {
        toolTipp.html(_tooltipTemplate(d));
        console.log(d3.event);
        d3.select('#tooltipContainer')
          .style('position', 'absolute')
          .style('left', d3.event.pageX - varConfig.TOOLTIP.X_OFFSET + 'px')
          .style('top', d3.event.pageY - varConfig.TOOLTIP.Y_OFFSET + 'px')
          .transition()
          .duration(varConfig.TOOLTIP.DURATION)
          .style('display', 'block')
          .style('z-index', 10);
      })
      .on('mouseout', function (d) {
        d3.select('#tooltipContainer').transition().duration(varConfig.TOOLTIP.DURATION).style('display', 'none');
      })
      .append('circle');

    console.log(circle);

    // The mini circle which store the video status

    /* activeCircle.attr('cx', nodeDetails.x)
            .attr('cy', nodeDetails.y)
            .attr('r', varConfig.ACTIVE_CIRCLE.RADIUS)
            .attr('fill', colorCodes.activeColor);*/

    miniCircle
      .attr('cx', function (d) {
        return nodeDetails.x + varConfig.MINI_CIRCLE.X_OFFSET;
      })
      .attr('cy', function (d) {
        return nodeDetails.y - varConfig.MINI_CIRCLE.Y_OFFSET;
      })
      .attr('r', varConfig.MINI_CIRCLE.RADIUS)

      //.attr("cx", "100")
      //.attr("cy", "100")
      .attr('fill', nodeDetails.vs ? colorCodes.videoStatusOnColor : colorCodes.videoStatusOffColor);

    miniCircleImg
      .attr('xlink:href', './assets/img/interaction/active_user.svg')
      .attr('class', 'active_user')
      .attr('x', function (d) {
        return nodeDetails.x - 12;
      })
      .attr('y', function (d) {
        return nodeDetails.y - 25;
      })
      .attr('width', 30)
      .attr('height', 30);

    miniCircleImg3
      .attr(
        'xlink:href',
        nodeDetails.vs
          ? './assets/img/interaction/video_on_active.svg'
          : './assets/img/interaction/video_off_active.svg'
      )
      .attr('class', 'active_vid')
      .attr('x', function (d) {
        return nodeDetails.x - 20;
      })
      .attr('y', function (d) {
        return nodeDetails.y + 8;
      })
      .attr('width', 20)
      .attr('height', 20);

    miniCircleImg2
      .attr('xlink:href', './assets/img/interaction/mic_on_active.svg')
      .attr('class', 'active_mic')
      .attr('x', function (d) {
        return nodeDetails.x + 3;
      })
      .attr('y', function (d) {
        return nodeDetails.y + 8;
      })
      .attr('width', 20)
      .attr('height', 20);
    circle.data()[0]['original_radius'] = circle.attr('r');

    _startFlicker(circle, miniCircle, nodeDetails);
  };

  function _setActiveCircle(svg, groupToUse) {
    if (svg.select(`[class="activenode"]`)._groups[0][0] !== undefined) {
      svg.select(`[class="activenode"]`)._groups[0][0].remove();
    }
    return groupToUse.append('circle').attr('class', 'activenode');
  }

  var _handleGroupCreation = function (nodeDetails, svgContainer, defs) {
    // there is no existing hub in the graph, proceed as usual
    // check if the node is already present and update it , else create a new group
    var group = svgContainer.select(`[id="${nodeDetails.pid}_group"]`);

    var activeCircle;
    // check if a new group is needed
    if (group._groups[0][0] == undefined) {
      // it is a new group, create it
      group = svgContainer
        .append('g')
        .attr('id', nodeDetails.pid + '_group')
        .attr('transform', function (d, i) {
          return 'translate(0,0)';
        })
        .attr('class', 'node');
    }

    group.selectAll('circle').style('fill', '#42428B');
    d3.selectAll('.active_user').attr('xlink:href', './assets/img/interaction/user.svg').attr('class', null);
    d3.selectAll('.active_mic').attr('xlink:href', './assets/img/interaction/mic_on_inactive.svg').attr('class', null);
    d3.selectAll('.active_vid')
      .attr('xlink:href', './assets/img/interaction/video_off_inactive.svg')
      .attr('class', null);
    group
      .select(`[id="${nodeDetails.pid}_miniImg"]`)
      .attr('xlink:href', './assets/img/interaction/active_user.svg')
      .attr('class', 'active_user');
    group
      .select(`[id="${nodeDetails.pid}_miniImg2"]`)
      .attr('xlink:href', './assets/img/interaction/mic_on_active.svg')
      .attr('class', 'active_mic');
    group
      .select(`[id="${nodeDetails.pid}_miniImg3"]`)
      .attr(
        'xlink:href',
        nodeDetails.vs
          ? './assets/img/interaction/video_on_active.svg'
          : './assets/img/interaction/video_off_active.svg'
      )
      .attr('class', 'active_vid');

    //check if a new circle is needed
    var circle =
      group.select(`[id="${nodeDetails.pid}"]`)._groups[0][0] !== undefined
        ? group.select(`[id="${nodeDetails.pid}"]`)
        : group.append('circle').attr('id', nodeDetails.pid);
    // check if a minicircle is needed
    var miniCircle =
      group.select(`[id="${nodeDetails.pid}_mini"]`)._groups[0][0] !== undefined
        ? group.select(`[id="${nodeDetails.pid}_mini"]`)
        : group.append('circle').attr('id', nodeDetails.pid + '_mini');
    var miniCircleImage =
      group.select(`[id="${nodeDetails.pid}_miniImg"]`)._groups[0][0] !== undefined
        ? group.select(`[id="${nodeDetails.pid}_miniImg"]`)
        : group
            .append('image')
            .attr('id', nodeDetails.pid + '_miniImg')
            .attr('class', 'active_user')
            .attr('xlink:href', './assets/img/interaction/active_user.svg')
            .attr('width', 25)
            .attr('height', 25);
    var miniCircleImage2 =
      group.select(`[id="${nodeDetails.pid}_miniImg2"]`)._groups[0][0] !== undefined
        ? group.select(`[id="${nodeDetails.pid}_miniImg2"]`)
        : group
            .append('image')
            .attr('id', nodeDetails.pid + '_miniImg2')
            .attr('class', 'active_mic')
            .attr('xlink:href', './assets/img/interaction/mic_on_active.svg')
            .attr('width', 25)
            .attr('height', 25);
    var miniCircleImage3 =
      group.select(`[id="${nodeDetails.pid}_miniImg3"]`)._groups[0][0] !== undefined
        ? group.select(`[id="${nodeDetails.pid}_miniImg3"]`)
        : group
            .append('image')
            .attr('id', nodeDetails.pid + '_miniImg3')
            .attr('class', 'active_vid')
            .attr(
              'xlink:href',
              nodeDetails.vs
                ? './assets/img/interaction/video_on_active.svg'
                : '/assets/img/interaction/video_off_active.svg'
            )
            .attr('width', 25)
            .attr('height', 25);

    // Set the active color on the current group
    activeCircle = _setActiveCircle(svgContainer, group);

    _renderToGraph(circle, activeCircle, miniCircle, miniCircleImage, miniCircleImage2, miniCircleImage3, nodeDetails);
  };

  var _handleHubBehaviour = function (currentNodeData, svgContainer, defs) {
    console.log('handle hub behaviour called', currentNodeData);

    /* if more than one hubs are present, 
         show only one hub in the center but display each hub's corresponding value in the participant details section.

         steps : look if there is already a hub (only one hub should be visible in the graph) present
                    if yes, then don't create a new hub, just display the details in the left section
                    if no, create the hub as usual
         rest of the spoke creation will work as usual
            */
    var uniqueHub = svgContainer.select(`.hub`)._groups[0][0] !== undefined ? svgContainer.select(`.hub`) : undefined;
    // if unique hub is already present, simply show active behaviour on the unique hub else go as usual
    if (uniqueHub) {
      var activeHubCircle;

      let hubGroup = svgContainer.select(`[id="${uniqueHub.data()[0].pid}_group"]`);
      let hubCircle = hubGroup.select(`[id="${uniqueHub.data()[0].pid}"]`);
      let hubMiniCircle = hubGroup.select(`[id="${uniqueHub.data()[0].pid}_mini"]`);
      // make sure you redirect the links of new hub into the already existing hub
      // example if hub b spoke after node 3 then originally the link was from hub b to node 3
      // now this should be changed to a link from hub a to node 3 but the details on the left will
      // be of the new hub b.
      hubGroup.selectAll('circle').style('fill', '#42428B');
      d3.selectAll('.active_user').attr('xlink:href', './assets/img/interaction/user.svg').attr('class', null);
      d3.selectAll('.active_mic')
        .attr('xlink:href', './assets/img/interaction/mic_on_inactive.svg')
        .attr('class', null);
      d3.selectAll('.active_vid')
        .attr('xlink:href', './assets/img/interaction/video_off_inactive.svg')
        .attr('class', null);
      hubGroup
        .select(`[id="${currentNodeData.pid}_miniImg"]`)
        .attr('xlink:href', './assets/img/interaction/active_user.svg')
        .attr('class', 'active_user');
      hubGroup
        .select(`[id="${currentNodeData.pid}_miniImg2"]`)
        .attr('xlink:href', './assets/img/interaction/mic_on_active.svg')
        .attr('class', 'active_mic');
      hubGroup
        .select(`[id="${currentNodeData.pid}_miniImg3"]`)
        .attr(
          'xlink:href',
          currentNodeData.vs
            ? './assets/img/interaction/video_on_active.svg'
            : './assets/img/interaction/video_off_active.svg'
        )
        .attr('class', 'active_vid');
      // Set the active color on the current group
      activeHubCircle = _setActiveCircle(svgContainer, hubGroup);

      activeHubCircle.attr('cx', uniqueHub.data()[0].x).attr('cy', uniqueHub.data()[0].y);
      //.attr('r', varConfig.ACTIVE_CIRCLE.RADIUS)
      //.attr('fill', colorCodes.activeColor);
      hubCircle.data()[0]['original_radius'] =
        !currentNodeData.cdoi || currentNodeData.cdoi / 100 < varConfig.NODE_SIZE.MIN
          ? varConfig.NODE_SIZE.MIN
          : currentNodeData.cdoi >= varConfig.NODE_SIZE.MAX
          ? varConfig.NODE_SIZE.MAX
          : currentNodeData.cdoi / 100;
      hubCircle.data()[0]['ci_graph'] = currentNodeData.ci_graph;
      hubCircle.data()[0]['cdoi'] = currentNodeData.cdoi;

      // increase the minicircle position for the hub
      hubMiniCircle
        .attr('cx', function (d) {
          return currentNodeData.x + varConfig.MINI_CIRCLE.X_OFFSET;
        })
        .attr('cy', function (d) {
          return currentNodeData.y - varConfig.MINI_CIRCLE.Y_OFFSET;
        });

      _startFlicker(hubCircle, hubMiniCircle, currentNodeData);
    } else {
      _handleGroupCreation(currentNodeData, svgContainer, defs);
    }
  };

  var toolTipp = d3
    .select('#graphContainer')
    .append('div')
    .attr('id', 'tooltipContainer')
    .style('display', 'none')
    .classed('toolTip', true)
    .append('div')
    .attr('id', 'tooltip');

  var _tooltipTemplate = function (data) {
    return `<div class="container">
                    <div class="row">
                        <p class="rowValue badge badge-success">Name :${data.pname}</p>
                    </div>
                    <div class="row">
                        <p class="rowName">Type</p>
                        <p class="rowValue">${data.ptype}</p>
                    </div>
                    <div class="row">
                        <p class="rowName">Gender</p>
                        <p class="rowValue">${data.gender}</p>
                    </div>
                    <div class="row">
                        <p class="rowName">Tone</p>
                        <p class="rowValue">${data.tone}</p>
                    </div>
                </div>`;
  };

  var _createNode = function (nodeDetails, svg, defs) {
    var svgContainer = svg;

    d3.selectAll('circle').style('fill', '#C6BCB8');
    d3.select('g').select('g').attr('transform', 'translate(100, 100)');

    if (nodeDetails.ptype.toLowerCase() == varConfig.HUB) {
      console.log('handle hub creation');
      console.log(nodeDetails);
      console.log(svgContainer);
      _handleHubBehaviour(nodeDetails, svgContainer, defs);
    } else {
      console.log('handle group creation');
      console.log(nodeDetails);
      console.log(svgContainer);
      _handleGroupCreation(nodeDetails, svgContainer, defs);
    }
  };

  return {
    createNode: _createNode,
    increaseRadius: increaseRadius,
  };
})(d3);

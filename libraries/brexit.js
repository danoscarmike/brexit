//main function to be called on load of index.html <body>
function dataViz() {

  //set common variables
  var widthUK = parseInt(d3.select("#blurb").style("width"));
  var heightUK = parseInt(d3.select('#blurb').style("height"));

  var active = d3.select(null);

  //initiate projection for United Kingdom
  var projection = d3.geoAlbers()
                      .rotate([4.4, 0, 0])
                      .parallels([50, 60]);

  //d3.v4 zoom object, set scale extent to 50
  var zoom = d3.zoom()
    .scaleExtent([1,50])
    .on("zoom", zoomed);

  var pathUK = d3.geoPath().projection(projection);

  var svgUK = d3.select("#map")
              .style("position","relative")
              .append("svg")
              .attr("width",widthUK)
              .attr("height",heightUK)
              .on("clicked",stopped,true);

  svgUK.append("rect")
    .attr("class", "background")
    .attr("width", "100%")
    .attr("height", "100%")
    .on("click", reset);

  var g = svgUK.append("g").style("stroke-width", "0.5px")

  svgUK.call(zoom);

  var nameTip = d3.select("#map")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  var statPanel = d3.select("#map")
    .append("div")
    .attr("class", "dataPanel")
    .attr("id", "statPanel")
    .style("opacity", 0);

  //create a div for the modal dialog box which will contain the area's results
  d3.text("resources/modal.html", function(data) {
    statPanel.html(data);
  });

  //import the topojson file for UK geography and referendum results
  d3.json("resources/UKtopo.json", function(error, uk) {
    if (error) throw error;

    projection
      .scale(1)
      .translate([0,0]);

    var bounds = pathUK.bounds(topojson.feature(uk, uk.objects.UK)),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = 0.95 / Math.max(dx / widthUK, dy / heightUK),
      tx = widthUK / 2 - scale * x
      ty = heightUK / 2 - scale * y;

    projection
      .scale(scale)
      .translate([tx,ty]);

    g.selectAll("path")
      .data(topojson.feature(uk, uk.objects.UK).features)
      .enter().append("path")
      .attr("d", pathUK)
      .attr("class",voteToggle)
      .attr("locked", "open")
      .on("mouseover", tooltipName)
      .on('mousemove', tooltipName)
      .on('mouseout', tooltipHide)
      .on("click",clicked);

    g.append("path")
      .datum(topojson.mesh(uk, uk.objects.UK, function(a, b) {
        return a !== b; }))
      .attr("class", "mesh")
      .attr("d", pathUK);
  });

  //instantiate mouseover/mousemove listener
  function tooltipName(d) {
    if(d3.select(this).attr("locked") === "open") {
      nameTip.transition()
            .duration(200)
            .style("opacity", 0.75);
      nameTip.html(d.properties.NAME)
          .style('left', d3.mouse(this)[0] + 'px')
          .style('top', d3.mouse(this)[1] - 35 + 'px');
    }
  }

  //instatiate mouseout listener
  function tooltipHide() {
    nameTip.transition()
        .duration(100)
        .style("opacity", 0)
  }

  //instantiate clicked listener
  function clicked(d) {
    //turn off visibility of tooltip
    nameTip.style('opacity', 0)

    //check if already active, reset path class and attributes if yes
    if (active.node() === this) {
      return reset();
    }
    //reset current active
    active.classed("active", false);
    //remove text from statPanel HTML (most recent data)
    statPanel.selectAll("text").text("");
    //set new active as the current path
    active = d3.select(this).classed("active", true);
    //lock out mouseover and mousemove listeners
    d3.selectAll("path").attr("locked","locked");

    //transition in the statPanel
    statPanel.transition()
      .duration(750)
      .style("opacity", 0.8)
      .style("left",0)
      .style("top",heightUK/2 + 'px')
      .style("height", heightUK/2 + 'px');

    statPanel.select("#area").append("text").text(d.properties.NAME);
    statPanel.select("#region").append("text").text("    ("+d.properties.Region+")");
    statPanel.select("#remain").append("text").text(d.properties.Remain);
    statPanel.select("#pct-remain").append("text").text(d.properties.Pct_Remain + "%");
    statPanel.select("#leave").append("text").text(d.properties.Leave);
    statPanel.select("#pct-leave").append("text").text(d.properties.Pct_Leave + "%");
    statPanel.select("#rejected").append("text").text(d.properties.Rejected_B);
    statPanel.select("#pct-rejected").append("text").text(d.properties.Pct_Reject + "%");
    statPanel.select("#total").append("text").text(d.properties.Votes_Cast);

    var bounds = pathUK.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      //scale and translate to fit in top half of svg
      scale = 0.45 / Math.max(dx / widthUK, dy / heightUK),
      tx = widthUK / 2 - scale * x
      ty = heightUK / 4 - scale * y;

    svgUK.transition()
      .duration(750)
      .style("stroke-width", 0.5/scale+"px")
      .call(zoom.transform,d3.zoomTransform(this).translate(tx,ty).scale(scale));
  }

  function reset() {
    //remove active class
    active.classed("active", false);

    //point active variable to NULL
    active = d3.select(null);

    //reopen path elements for mouseover/mousemove listener function
    d3.selectAll("path").attr("locked","open");

    //reset map to full extent
    svgUK.transition()
      .duration(750)
      .style("stroke-width", "0.5px")
      .call(zoom.transform,d3.zoomIdentity);

    //make statPanel tranparent
    statPanel.style('opacity', 0);
    //remove text from statPanel HTML
    statPanel.selectAll("text").text("");
  }

  function zoomed() {
    g.style("stroke-width", 0.5 / d3.event.transform.k + "px");
    g.attr("transform", d3.zoomTransform(this).toString());
  }

  // If the drag behavior prevents the default click,
  // also stop propagation so we don’t click-to-zoom.
  function stopped() {
    if (d3.event.defaultPrevented) {
      d3.event.stopPropagation();
    }
  }

  //Helper function to determine whether area voted to remain or
  //leave the EU.  Result is applied as the class of the area's path
  function voteToggle(d) {
    if (parseFloat(d.properties.Pct_Remain) > 50) {
      return "remain"
    } else {
      return "leave"
    }
  }
}

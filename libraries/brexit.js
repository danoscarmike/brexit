//main function to be called on load of index.html <body>
function dataViz() {

  //set common variables
  var widthUK = 500;
  var heightUK = 500;
  var active = d3.select(null);

  //initiate projection for United Kingdom
  var projection = d3.geoAlbers()
                      .center([-3.2, 55.4])
                      .rotate([4.4, 0])
                      .parallels([50, 60])
                      .scale(2500)
                      .translate([widthUK / 4, heightUK / 2]);

  var projectionGI = d3.geoAlbers()
                      .center([-5.3,36.1])
                      .rotate([4.4, 0])
                      .parallels([30, 40])
                      .scale(5000)
                      .translate([widthUK / 4, heightUK / 2]);

  //d3.v4 zoom object, set scale extent to 50
  var zoom = d3.zoom()
    .translateExtent([0,0],[widthUK,heightUK])
    .scaleExtent([1,50])
    .on("zoom", zoomed);

  var pathUK = d3.geoPath().projection(projection);
  var pathGI = d3.geoPath().projection(projectionGI);

  var svgUK = d3.select("body").append("svg")
              .attr("width",widthUK)
              .attr("height",heightUK)
              .on("clicked",stopped,true);

  svgUK.append("rect")
    .attr("class", "background")
    .attr("width", widthUK)
    .attr("height", heightUK)
    .on("click", reset);

  var g = svgUK.append("g").style("stroke-width", "0.5px");
  var g2 = svgUK.append("g").style("stroke-width", "0.5px");

  svgUK.call(zoom);

  //import the topojson file for UK geography and referendum results
  d3.json("resources/UKtopo.json", function(error, uk) {
    if (error) throw error;

    g.selectAll("path")
      .data(topojson.feature(uk, uk.objects.UK).features)
      .enter().append("path")
      .attr("d", pathUK)
      .attr("class",voteToggle)
      .on("click",clicked);

    g.append("path")
      .datum(topojson.mesh(uk, uk.objects.UK, function(a, b) {
        return a !== b; }))
      .attr("class", "mesh")
      .attr("d", pathUK);
  });

  //import the topojson file for Gibraltar geography and referendum results
  // d3.json("resources/GItopo.json", function(error, gi) {
  //   if (error) throw error;
  //
  //   g.selectAll("path")
  //     .data(topojson.feature(gi, gi.objects.GI).features)
  //     .enter().append("path")
  //     .attr("d", pathGI)
  //     .attr("class",voteToggle)
  //     .on("click",clicked);
  //
  //   g.append("path")
  //     .datum(topojson.mesh(gi, gi.objects.GI, function(a, b) {
  //       return a !== b; }))
  //     .attr("class", "mesh")
  //     .attr("d", pathGI);
  // });

  //create a div for the modal dialog box which will contain the area's results
  d3.text("resources/modal.html", function(data) {
    d3.select("body").append("div").attr("id", "modal").html(data);
  });

  function clicked(d) {
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    var bounds = pathUK.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = 0.9 / Math.max(dx / widthUK, dy / heightUK),
      tx = widthUK / 2 - scale * x
      ty = heightUK / 2 - scale * y;

    svgUK.transition()
      .duration(750)
      .style("stroke-width", 0.5/scale+"px")
      .call(zoom.transform,d3.zoomTransform(this).translate(tx,ty).scale(scale));

    var name = d.properties.NAME,
        region = d.properties.Region,
        remain = d.properties.Remain,
        pctr = d.properties.Pct_Remain,
        leave = d.properties.Leave,
        pctl = d.properties.Pct_Leave,
        rejected = d.properties.Rejected_B,
        pctj = d.properties.Pct_Reject,
        total = d.properties.Votes_Cast;

		return document.getElementById('stat1').innerHTML="Remain",
            document.getElementById('stat2').innerHTML="Leave",
            document.getElementById('stat3').innerHTML="Rejected",
            document.getElementById('stat4').innerHTML="Total",
            document.getElementById('area').innerHTML=name,
            document.getElementById('region').innerHTML="("+region+")",
            document.getElementById('remain').innerHTML=parseFloat(remain),
            document.getElementById('pctr').innerHTML=parseFloat(pctr)+"%",
            document.getElementById('leave').innerHTML=parseFloat(leave),
            document.getElementById('pctl').innerHTML=parseFloat(pctl)+"%",
            document.getElementById('rejected').innerHTML=parseFloat(rejected),
            document.getElementById('pctj').innerHTML=parseFloat(pctj)+"%",
            document.getElementById('total').innerHTML=parseFloat(total);
  }

  function reset() {
    active.classed("active", false);
    active = d3.select(null);

    svgUK.transition()
      .duration(750)
      .style("stroke-width", "0.5px")
      .call(zoom.transform,d3.zoomIdentity);

    return document.getElementById('stat1').innerHTML="",
            document.getElementById('stat2').innerHTML="",
            document.getElementById('stat3').innerHTML="",
            document.getElementById('stat4').innerHTML="",
            document.getElementById('area').innerHTML="",
            document.getElementById('region').innerHTML="",
            document.getElementById('remain').innerHTML="",
            document.getElementById('pctr').innerHTML="",
            document.getElementById('leave').innerHTML="",
            document.getElementById('pctl').innerHTML="",
            document.getElementById('rejected').innerHTML="",
            document.getElementById('pctj').innerHTML="",
            document.getElementById('total').innerHTML="";
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

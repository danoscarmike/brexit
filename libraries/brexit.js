//main function to be called 'on load' of index.html <body>
function dataViz() {
  //d3.csv("data/EU-referendum-result-data.csv", function(data) {
    createViz();
  //})
}

function createViz() {
  var width = 460;
  var height = 560;
  var active = d3.select(null);

  var zoom = d3.zoom()
    .translateBy()
    .scaleBy(this,1)
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

  var projection = d3.geoAlbers()
                      .center([-3.0, 55.4])
                      .rotate([4.4, 0])
                      .parallels([50, 60])
                      .scale(2500)
                      .translate([width / 4, height / 2]);

  var path = d3.geoPath().projection(projection);

  var svg = d3.select("div").append("svg")
              .attr("width",width)
              .attr("height",height);

  svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

  var g = svg.append("g")
      .style("stroke-width", "1.5px");

  svg
    .call(zoom.on("zoom", zoomed)) // delete this line to disable free zooming
    .call(zoom.event);

  d3.json("resources/UKdataTopo2b.json", function(error, uk) {
    if (error) return console.error(error);

    g.selectAll("path")
      .data(topojson.feature(uk, uk.objects.UKdata2).features)
      .enter().append("path")
      .attr("d", path)
      .attr("class","feature")
      .attr("class",voteToggle);

    g.selectAll("path").on("click",clicked);

    g.append("path")
      .datum(topojson.mesh(uk, uk.objects.UKdata2, function(a, b) {
        return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);
  });

  //create a div for modal dialog box for results
  d3.text("resources/modal.html", function(data) {
    d3.select("body").append("div").attr("id", "modal").html(data);
  });

  function voteToggle(d) {
    if (parseFloat(d.properties.pctr) > 50) {
      return "remain"
    } else {
      return "leave"
    }
  }

  function clicked(d) {
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);
    console.log(parseFloat(d.properties.pctr));

    var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = 0.9 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

    g.transition()
      .duration(750)
      .style("stroke-width", "0.5px")
      // .attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

    // svg.transition()
    //   .duration(750)
    //   .call(zoom.on("zoom", zoomed));

    var name = d.properties.name,
        region = d.properties.region,
        remain = d.properties.remain,
        pctr = d.properties.pctr,
        leave = d.properties.leave,
        pctl = d.properties.pctl,
        rejected = d.properties.rejected,
        pctj = d.properties.pctj,
        total = d.properties.total;

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

    g.transition()
      .duration(750)
      .style("stroke-width", "0.5px")
      .attr("transform", "");

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
  g.style("stroke-width", 1.5 / d3.event.scale + "px");
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

// If the drag behavior prevents the default click,
// also stop propagation so we don’t click-to-zoom.
function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

}

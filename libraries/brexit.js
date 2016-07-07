//main function to be called 'on load' of index.html <body>
function dataViz() {
  d3.csv("data/EU-referendum-result-data.csv", function(data) {
    createViz(d3.map().set(data.Area, data.Pct_Remain));
  })
}

function createViz(incomingData) {
  var width = 460;
  var height = 560;
  var active = d3.select(null);

  var projection = d3.geoAlbers()
                      .center([0, 55.4])
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

  d3.json("resources/UKdataTopo2b.json", function(error, uk) {
    if (error) return console.error(error);

    g.selectAll("path")
      .data(topojson.feature(uk, uk.objects.UKdata2).features)
      .enter().append("path")
      .attr("d", path)
      .attr("class","feature")
      .on("click",clicked);

    g.append("path")
      .datum(topojson.mesh(uk, uk.objects.UKdata2, function(a, b) {
        return a !== b; }))
      .attr("class", "mesh")
      .attr("d", path);

    // g.selectAll("path")
    //   .data(incomingData)
    //   .enter()
    //   .append("path")
    //   .attr("id", function(d) { return d.Area_Code });
  });

  //create a div for modal dialog box for results
  d3.text("resources/modal.html", function(data) {
    d3.select("body").append("div").attr("id", "modal").html(data);
  });

  // //add a click listener to populate results
  // g.on("click", )

  function clicked(d) {
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);
    d3.select("table").attr("visibility","visible")

    var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .5 / Math.max(dx / width, dy / height),
      translate = [width / 2 - scale * x, height / 2 - scale * y];

    g.transition()
      .duration(750)
      .style("stroke-width", "1.5px")
      .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

    var name = d.properties.name,
        region = d.properties.region,
        remain = d.properties.remain,
        pctr = d.properties.pctr,
        leave = d.properties.leave,
        pctl = d.properties.pctl,
        rejected = d.properties.rejected,
        pctj = d.properties.pctj,
        total = d.properties.total;

		return document.getElementById('area').innerHTML=name,
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

    return document.getElementById('area').innerHTML="",
            document.getElementById('region').innerHTML="",
            document.getElementById('remain').innerHTML="",
            document.getElementById('pctr').innerHTML="",
            document.getElementById('leave').innerHTML="",
            document.getElementById('pctl').innerHTML="",
            document.getElementById('rejected').innerHTML="",
            document.getElementById('pctj').innerHTML="",
            document.getElementById('total').innerHTML="";

  }

}

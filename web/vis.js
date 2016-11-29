$(function() {
  $.getJSON("res/medals.json")
   .done(function (data) { visualize(data); })
   .fail(function() { alert("Failed to load the JSON file!\n(Did your Python run?)"); });
});

var visualize = function(data) {
  // boilerplate
  var margin = { top: 0, right: 0, bottom: 0, left: 0 },
     width = 960 - margin.left - margin.right,
     height = 960 - margin.top - margin.bottom,
     scale0 = (width - 1) / 2 / Math.PI;

  var svg = d3.select("#map")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .style("width", width + margin.left + margin.right)
              .style("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  // color
  var max = _.maxBy(data, "medals")["medals"];
  var color = d3.scaleLinear()
                .domain( [1, max] )
                .range( ["rgb(46, 73, 123)", "rgb(71, 187, 94)"] );

  // projection
  var projection = d3.geoAzimuthalEquidistant()
                     .scale( width / 2 / Math.PI )
                     .translate([width / 2, height / 2]);

  var path = d3.geoPath()
               .projection(projection);

  // mouseover
  var tip = d3.tip().direction("s").attr('class', 'd3-tip').html(function(d) {
    var cur_country = d.properties.name;
    var e = _.find(data, {"country": cur_country});

    var medals = 0;
    if (e) { medals = e["medals"]; }

    return "Country: " + d.properties.name + "<br>" +
           "Medals: " + medals;
  });
  svg.call(tip);

  d3.json("web/worldmap.topo.json", function(err, world) {
    if (err) { alert("Failed to load topojson. :("); throw err; }

    var countries = topojson.feature(world, world.objects.countries).features;

    svg.selectAll(".country")
       .data(countries)
       .enter()
       .insert("path")
       .attr("class", "country")
       .attr("d", path)
       .attr("title", function(d,i) {
         return d.properties.name;
       })
       .attr("fill", function(d, i) {
         // cur_country is the current country that needs to be colored
         var cur_country = d.properties.name;

         // e is the element in our data where ["country"] == cur_country
         // ...using _.find(...): https://lodash.com/docs/4.16.6#find
         var e = _.find(data, {"country": cur_country});

         // Check if the country is in our data, if so return a color;
         //                                ...otherwise, return black
         if (e) { return color(e["medals"]); }
         else   { return "black"; }
       })
       .on("mouseover", tip.show)
       .on("mouseout", tip.hide);

  });

  // Legend (d3.legend)
  var legend = d3.legendColor()
                 .orient("horizontal")
                 .shapeWidth(50)
                 .scale(color);

  d3.select("#legend")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "50")
    .append("g")
    .call(legend);
};

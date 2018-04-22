var svg = d3.select("#d3div").append("svg")
    .attr("width", 740)
    .attr("height", 500),
// var svg = d3.select("svg"),
margin = {top: 20, right: 40, bottom: 120, left: 40},
width = +svg.attr("width") - margin.left - margin.right,
height = +svg.attr("height") - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
y = d3.scaleLinear().rangeRound([height, 0]);

var g = svg.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var subset = [];
var dataset

var level = 'borough'
var loc, nestdata, parent

d3.csv("../../../../scripts/Air_Quality.csv", function(d) {
  d.data_valuemessage = +d.data_valuemessage;
  d.year = +d.year;
  d.correct_geo_id = +d.correct_geo_id;
  d.indicator_id = +d.indicator_id;
  d.parent_id = +d.parent_id;
  d.name = d.name.trim();
  return d;

}, function(error, data) {

  dataset = data

  if (error) throw error;

  var measures = d3.map(data, function(d){return d.name;}).keys()

  var select = d3.select('select')
  // .append('select')
  .attr('class','select')
  .on('change',onchange)

  var options = select
  .selectAll('option')
  .data(measures).enter()
  .append('option')
  .text(function (d) { return d });

  function onchange() {
    var selectValue = d3.select('select').property('value')
    
    parent = d3.selectAll(".bar").data()[0].value.parent
  

    if(parent == 0){
      subset = dataset.filter(function(d){return d.name == selectValue && d.correct_geo_id <100 && d.correct_geo_id >0})

    } else {

      subset = dataset.filter(function(d){return d.name == selectValue && d.parent_id == parent && d.correct_geo_id >=100 })
    }



    nestdata = d3.nest().key(function(d) {return d.geo_entity_name}).rollup(function(leaves) {return {"total": d3.mean(leaves,function(d) {return d.data_valuemessage}), 
    "parent":d3.mean(leaves, function(d) {return d.parent_id}),
    "loc": d3.mean(leaves, function(d){return d.correct_geo_id})}}).entries(subset)


    x.domain(nestdata.map(function(d) { return d.key; }));
    y.domain([0, d3.max(nestdata, function(d) { return d.value.total; })]);

    g.selectAll(".axis--y").transition().call(d3.axisLeft(y))
    g.selectAll(".axis--x").transition().call(d3.axisBottom(x))
    .selectAll("text")
  .attr("transform","rotate(35)").attr("y", 12)
    .attr("x", 4)
    .attr("dy", ".35em")
    .style("text-anchor", "start");

    g.selectAll(".bar")
    .data(nestdata)
    .transition()
    .attr("x", function(d) { return x(d.key); })
    .attr("y", function(d) { return y(d.value.total); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.value.total); });
  };

  var selectValue = d3.select('select').property('value')

  subset = data.filter(function(d){return d.name == selectValue && d.correct_geo_id <100 && d.correct_geo_id >0})

  nestdata = d3.nest().key(function(d) {return d.geo_entity_name}).rollup(function(leaves) {return {"total": d3.mean(leaves,function(d) {return d.data_valuemessage}), 
    "parent":d3.mean(leaves, function(d) {return d.parent_id}),
    "loc": d3.mean(leaves, function(d){return d.correct_geo_id})}}).entries(subset)

  x.domain(nestdata.map(function(d) { return d.key; }));
    y.domain([0, d3.max(nestdata, function(d) { return d.value.total; })]);

  g.append("g")
  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
  .attr("transform","rotate(35)").attr("y", 12)
    .attr("x", 4)
    .attr("dy", ".35em")
    .style("text-anchor", "start");;

  g.append("g")
  .attr("class", "axis axis--y")
  .call(d3.axisLeft(y).ticks(10))
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 6)
  .attr("dy", "0.71em")
  .attr("text-anchor", "end")
  .text("Frequency");

  g.selectAll(".bar")
  .data(nestdata)
  .enter().append("rect")
  .attr("class", "bar")
  .attr("x", function(d) { return x(d.key); })
  .attr("y", function(d) { return y(d.value.total); })
  .attr("width", x.bandwidth())
  .attr("height", function(d) { return height - y(d.value.total); })
  .on("click",clickfunction);
});

function clickfunction() {
  var selectValue = d3.select('select').property('value')
  loc = this.__data__.value.loc.toString()

  if(loc < 100){  
    subset = dataset.filter(function(d){return d.name == selectValue && d.correct_geo_id.toString()[0] == loc && d.correct_geo_id >=100 })

  } else {
    subset = dataset.filter(function(d){return d.name == selectValue && d.correct_geo_id <100 && d.correct_geo_id >0})
  }

  nestdata = d3.nest().key(function(d) {return d.geo_entity_name}).rollup(function(leaves) {return {"total": d3.mean(leaves,function(d) {return d.data_valuemessage}), 
    "parent":d3.mean(leaves, function(d) {return d.parent_id}),
    "loc": d3.mean(leaves, function(d){return d.correct_geo_id})}}).entries(subset)

  x.domain(nestdata.map(function(d) { return d.key; }));
    y.domain([0, d3.max(nestdata, function(d) { return d.value.total; })]);

  g.selectAll(".axis--y").transition().call(d3.axisLeft(y))
  g.selectAll(".axis--x").transition().call(d3.axisBottom(x)).selectAll("text")
  .attr("transform","rotate(35)").attr("y", 12)
    .attr("x", 4)
    .attr("dy", ".35em")
    .style("text-anchor", "start");

  g.selectAll(".bar").remove().exit()
  .data(nestdata).enter().append("rect").attr("class","bar")
    // .transition()
    .attr("x", function(d) { return x(d.key); })
    .attr("y", function(d) { return y(d.value.total); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.value.total); })
    .on("click",clickfunction);
  }
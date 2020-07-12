const educationData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const countyData = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
d3.queue()
 .defer(d3.json, educationData)
  .defer(d3.json, countyData)
  .await(ready);
function ready(error,education,county){
   if (error) throw error;
  const w = 960;
  const h = 600;
  const colors = d3.schemeReds[9];
  const svg = d3.select("body")
                 .append("svg")
                 .attr("width", w)
                 .attr("height", h);
 const path = d3.geoPath(); 
  const eduBach = education.map(a => a.bachelorsOrHigher);
  const min = d3.min(eduBach);
  const max = d3.max(eduBach);
  const legendScale = d3.scaleLinear()
              .domain([min,max])
              .rangeRound([30, 270]);
  const color = d3.scaleThreshold()
  .domain(d3.range(min, max, (max-min) / 8 ))
                      .range(colors);
   const tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
   .style("opacity","0.8")
    .style("width", "130px")
   .style("font-family", "Arial")
    .style("font-size", "13px")
    .style("background-color", "#b9b8b8")
   .style("border-radius","5px")
   .style("text-align","center")
   .style("position","absolute")
  .style("visibility", "hidden");
  //legend
  const legendAxis = d3.axisBottom(legendScale)
     .tickSize(20,5)
     .tickValues(color.domain())
     .tickFormat(d=> Math.round(d) + "%")
     
 const legend =  svg.selectAll("legend")
     .data(colors)
     .enter()
     .append("g")
     .attr("class", "legend")
     .attr("transform", "translate(" +  (w / 2 + 160) + ",10)");
    legend.append("rect")
      .attr("class", "rectLegend")
      .attr("x", (d, i) => 30 * i)
      .attr("y", 0)
      .attr("width", 30)
      .attr("height", 20)
      .style("fill", (d) => d); 
  
 legend.append("g")
      .call(legendAxis);
  
  //map  
  svg.append("g")
 .attr("class","county")
 .selectAll("path")  .data(topojson.feature(county,county.objects.counties).features)
 .enter()
  .append("path")
.attr("fill",function(d) {
   const match = education.find(obj => obj.fips === d.id);
      d3.select(this).attr("data-education", match.bachelorsOrHigher)
                     .attr("data-fips", match.fips)
              
      return color(match.bachelorsOrHigher);
    })
    .attr("d", path)
.on("mouseover", (d) =>{  
tooltip.style("visibility","visible")
      .html(function(){
    const match = education.find(obj => obj.fips === d.id);
  return match.area_name + ", " + match.state + "<br>" + match.bachelorsOrHigher + "%";
})
          .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY + 10) + "px")
      })
  
     
  .on("mouseout",(d, i)=>{
    tooltip.style("visibility","hidden");
  });
 svg.append("path")
       .datum(topojson.mesh(county, county.objects.states, (a, b) => a !== b))
       .attr("class", "states")
       .attr("d", path);
};
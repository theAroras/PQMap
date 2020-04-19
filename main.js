var width = window.innerWidth, height = window.innerHeight

var svg = d3.select("#map")
    .attr("width", width)
    .attr("height", height)
    .style("background", "#eee")
var g = svg.append("g")
    .style("background", "white")

var projection = d3.geoOrthographic()
    .scale(350)
    .translate([width / 2, height / 2])

var path = d3.geoPath()
    .projection(projection)

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)

var c = null
function load(world, map) {
    topo = topojson.feature(world, world.objects.land).features

    // fix negative area polygons
    for (var d in map.features) {
        for (var x in map.features[d].geometry.coordinates) {
            if (d3.polygonArea(map.features[d].geometry.coordinates[x][0]) < 0) {
                map.features[d].geometry.coordinates[x][0].reverse()
            }
        }
    }

    var scale = 1
    function zoomed() {
        projection.rotate([d3.event.transform.x / 5, -d3.event.transform.y / 5, 0])
        path.projection(projection)
        update()
    }
    function unzoomed() {
        svg.transition().duration(1000).call(
            zoom.transform,
            d3.zoomIdentity,
            d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        )
    }
    var zoom = d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 12])
        .on("zoom", zoomed)
    svg.call(zoom)
    svg.on("click", unzoomed)

    update()

    function update() {
        // console.log(world)
        g.selectAll("*").remove()
        var graticule = d3.geoGraticule10();
        var gg = g.append("path")
            .attr("class", "grid")
            .datum(graticule)
            .attr("d", function(d) {
                return path(d)
            })
            .attr("stroke", "grey")
            .attr("stroke-width", "0.5px")
            .attr("fill", "none")
        g.selectAll("path")
            .data(map.features)
            .enter()
            .append("path")
                .attr("class", "map")
                .attr("d", function(d) {
                    console.log(d)
                    return path(d)
                })
                .attr("stroke-width", "0px")
                .attr("stroke", "red")
                .attr("fill", "black")
                .on("mouseover", function(d) {
                    g.selectAll(".map")
                        .style("opacity", 0.2)
                    d3.select(this)
                        .style("opacity", 1)
    
                    tooltip
                        .style("opacity", 1)
                    tooltip.html(
                            "<p>" + d.properties.name + "</p>")
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                })
                .on("mousemove", function (d) {
                    tooltip
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                })
                .on("mouseout", function (d) {
                    g.selectAll(".map")
                        .transition()
                        .duration(250)
                        .style("opacity", 1)
    
                    tooltip.transition()
                        .duration(250)
                        .style("opacity", 0)
                })
    }
}

Promise.all([
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json"),
    d3.json("output.json"),
]).then(function (files) {
    load(files[0], files[1])
})
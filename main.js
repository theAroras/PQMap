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

var stringToColour = function(str) {
    var hash = 0
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    var colour = '#'
    for (var i = 0; i < 3; i++) {
        var value = (hash >> (i * 8)) & 0xFF
        colour += ('00' + value.toString(16)).substr(-2)
    }
    return colour
}

function load(world, map) {
    topo = topojson.feature(world, world.objects.land).features

    // fix negative area polygons
    for (var d in map.land.features) {
        for (var x in map.land.features[d].geometry.coordinates) {
            if (d3.polygonArea(map.land.features[d].geometry.coordinates[x][0]) < 0) {
                map.land.features[d].geometry.coordinates[x][0].reverse()
            }
        }
    }

    function getVisibility(d) {
        const visible = path(
            {type: 'Point', coordinates: d.coordinates});
        
        return visible ? 'visible' : 'hidden';
    }

    var scale = 1
    function zoomed() {
        projection.rotate([d3.event.transform.x / 5, -d3.event.transform.y / 5])
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

        // for (var i = 0; i < 36; i++) {
        //     for (var j = 0; j < 18; j++) {
        //         var x1 = i * 10 - 180, y1 = -(j * 10 - 90)
        //         var x2 = i * 10 + 10 - 180, y2 = -(j * 10 + 10 - 90)
        //         var proj1 = projection([x1, y1]),
        //             proj2 = projection([x2, y2])
        //         g.append("image")
        //             .attr("xlink:href", "images/zones/IMG-" + j + "," + i + ".jpg")
        //             .attr("x", proj1[0])
        //             .attr("y", proj1[1])
        //             .style("transform", "scale(" + (Math.abs(proj1[0] - proj2[0])) / 80 + "," + (Math.abs(proj1[1] - proj2[1])) / 80 + ")")
        //     }
        // }

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
            .data(map.land.features)
            .enter()
            .append("path")
                .attr("class", "map")
                .attr("d", path)
                .attr("stroke-width", "0px")
                .attr("stroke", "red")
                .attr("fill", "grey")
        
        
        g.selectAll("circle")
            .data(map.cities.features)
            .enter()
            .append("circle")
                .attr("cx", function(d) {
                    return projection(d.coordinates)[0]
                })
                .attr("cy", function(d) {  
                    return projection(d.coordinates)[1]
                })
                .attr("r", function(d) {
                    if (d.type == "capital") return 5
                    return 3
                })
                .attr("fill", function (d) {
                    return stringToColour(d.country)
                })
                .attr('visibility', getVisibility)
                .attr("stroke", "black")
                .attr("stroke-width", "2px")
                .on("mouseover", function(d) {
                    d3.select(this)
                        .attr("r", function(d) {
                            if (d.type == "capital") return 10
                            return 6
                        })
    
                    tooltip
                        .style("opacity", 1)
                    tooltip.html(
                            "<p><strong>" + d.name + "</strong><br>" + (d.province ? (d.province + ", ") : "") + d.country + "</p>")
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                })
                .on("mousemove", function (d) {
                    tooltip
                        .style("left", (d3.event.pageX + 15) + "px")
                        .style("top", (d3.event.pageY - 28) + "px")
                })
                .on("mouseout", function (d) {
                    d3.select(this)
                        .attr("r", function(d) {
                            if (d.type == "capital") return 5
                            return 3
                        })
    
                    tooltip
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
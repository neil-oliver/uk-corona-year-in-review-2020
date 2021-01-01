let areachart = d3.select('#areachart')
    .append('svg')
    .attr('height', svgHeight-145)
    .attr('width', svgWidth)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function areaUpdate(data, xScale){

    let keys = areas
    let values = Array.from(d3.rollup(data, ([d]) => d[selection], d => d.startDate, d => d.areaName))

    let yScale = d3.scaleLinear()
        .range([height,0])
        .domain(d3.extent(values.map(d => d3.sum(d[1].values()))))

    let colorScale = d3.scaleBand()
        .domain(areas)
        .range([0,1])
      
    let series = d3.stack()
        .keys(keys)
        .value(([, values], key) => values.get(key))
        .order(d3.stackOrderNone)
        (values)

    let area = d3.area()
        .x(d => xScale(new Date(d.data[0])))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveBasis)

    let ageArea = areachart
        .selectAll("path")
        .data(series)
        .join("path")
            .attr("fill", ({key}) => d3.interpolateViridis(colorScale(key)))
            .attr('stroke', 'white')
            .attr("stroke-dasharray", "2")
            .attr("d", area)
            .on("mouseover", function(event, d){

                const e = ageArea.nodes();
                const i = e.indexOf(this);
                tooltip.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                tooltip.html('Date: <strong>' + dateOutputFormat(d[i].data[0]) + '</strong><br>Area: <strong>' + d.key  + `</strong><br>${metrics[selection]}: <strong>` + d[i].data[1].get(d.key).toLocaleString() + '</strong>')	
                    .style("left", (event.pageX) + "px")		
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(){
                tooltip.transition()		
                    .duration(500)		
                    .style("opacity", 0);
            })

    labels(areachart, xScale, 'grey')

    areachart.append("g")
    .attr("id", "areachart-y-axis")

    let yAxis = d3.axisLeft(yScale)

    d3.select('#areachart-y-axis')
        .call(yAxis)

    // add the Y gridlines
    areachart.append("g")			
        .attr("class", "areachart-grid")
        .attr("color", "grey")
        .attr("opacity", 0.1)
        .call(yAxis
            .tickSize(-width)
            .tickFormat("")
        )
        .lower()

    areachart.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("id", "areachart-x-axis")

    let xAxis = d3.axisBottom(xScale)
        .tickFormat("")
        .ticks(sumBy)

    d3.select('#areachart-x-axis')
        .call(xAxis)

}
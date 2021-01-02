let heatmap = d3.select('#heatmap')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + 5 + ")");

// load in data
function heatmapUpdate(data, xScale){

    // scales
    let yScale = d3.scaleBand()
        .domain(d3.map(data, d => d.areaName))
        .range([height,0])
        .paddingInner(0.01)
        .paddingOuter(0.01)

    let colorScale = d3.scaleSequential()
        .domain(d3.extent(data, d => d[selection]))
        .interpolator(d3.interpolateViridis)

    heatmap.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('y', d => yScale(d.areaName))
        .attr('height', yScale.bandwidth())
        .attr('x', d => xScale(d.startDate))
        .attr('width', d => xScale(d.endDate) - xScale(d.startDate))
        .attr("fill", d => colorScale(d[selection]))
        .attr('fill-opacity', d => areaSelection.includes(d.areaName) ? 1 : 0.9)
        .on("mouseover", function(event, d){
            tooltip.transition()		
                .duration(200)		
                .style("opacity", .9);		
            tooltip.html('Date: <strong>' + dateOutputFormat(d.startDate) + '</strong><br>Area: <strong>' + d.areaName + `</strong><br>${metrics[selection]}: <strong>` + d[selection].toLocaleString() + '</strong>')	
                .style("left", (event.pageX) + "px")		
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(){
            tooltip.transition()		
                .duration(500)		
                .style("opacity", 0);
        })

    labels(heatmap, xScale, 'white', false)

    // swatches({
    //     color: d3.scaleOrdinal(["blueberries", "oranges", "apples"], d3.schemeCategory10)
    // })

    // legend({
    //     color: d3.scaleSequential(d3.extent(data, d => d[selection]), d3.interpolateViridis),
    //     title: "Covid Cases"
    // })

    //add svg group to append axis
    heatmap.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("id", "x-axis")

    heatmap.append("g")
        .attr("id", "y-axis")


    //append axis
    d3.select('#x-axis')
        .transition()
        .call(d3.axisBottom(xScale).ticks(sumBy))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    d3.select('#y-axis')
        .call(d3.axisLeft(yScale))

};
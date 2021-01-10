let heatmap = d3.select('#heatmap')
    .append('svg')
    .attr('height', heatmapSvgHeight)
    .attr('width', svgWidth)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + heatmapMargin.top + ")");

//add svg group to append axis
let heatmapXAxisGroup = heatmap.append("g")
    .attr("transform", `translate(0,${heatmapHeight})`)
    .attr("id", "x-axis")

let heatmapYAxisGroup = heatmap.append("g")
    .attr("id", "y-axis")

let heatmapLegendGroup = heatmap.append("g")
    .attr("transform", `translate(${(width / 5) * 4},${heatmapHeight+120})`)
    .attr("id", "legend-x-axis")

// load in data
function heatmapUpdate(data, xScale, initial=false){

    // scales
    let yScale = d3.scaleBand()
        .domain(d3.map(data, d => d.areaName))
        .range([heatmapHeight,0])
        // .paddingInner(0.01)
        // .paddingOuter(0.01)

    // Log Scale
    const logScale = d3.scaleSymlog().domain(d3.extent(data, d => d[selection]))
    let colorScale;

    let log = false

    if (log == true){
        colorScale = d3.scaleSequential(d => d3.interpolateViridis(logScale(d)))
    } else {
        colorScale = d3.scaleSequential()
            .domain(d3.extent(data, d => d[selection]))
            .interpolator(d3.interpolateViridis)
    }

    heatmap.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('y', d => yScale(d.areaName))
        .attr('height', yScale.bandwidth())
        .attr('x', d => xScale(d.startDate))
        .attr('width', d => xScale(d.endDate) - xScale(d.startDate))
        .attr("fill", d => colorScale(d[selection]))
        .attr("stroke", d => colorScale(d[selection]))
        .attr("stroke-opacity", 0.9)
        .attr("stroke-width", 0)
        .attr('fill-opacity', d => areaHover.includes(d.areaName) ? 1 : 0.9)
        .on("mouseover", function(event, d){      
            areaHover = [d.areaName]
            areaUpdate(wrangledData, xScale)
            heatmapUpdate(wrangledData, xScale)

            d3.select(this).attr("stroke-width", 1)
            .attr('y', d => yScale(d.areaName) + 1)
            .attr('height', yScale.bandwidth() - 2)
            .attr('x', d => xScale(d.startDate) + 1)
            .attr('width', d => xScale(d.endDate) - xScale(d.startDate) - 2)


            tooltip.transition()		
                .duration(200)		
                .style("opacity", .9);		
            tooltip.html('Date: <strong>' + dateOutputFormat(d.startDate) + '</strong><br>Area: <strong>' + d.areaName + `</strong><br>${metrics[selection]}: <strong>` + d[selection].toLocaleString() + '</strong>')	
                .style("left", (event.pageX) + "px")		
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(){
            areaHover = areas
            areaUpdate(wrangledData, xScale)
            heatmapUpdate(wrangledData, xScale)

            d3.select(this).attr("stroke-width", 0)

            tooltip.transition()		
                .duration(500)		
                .style("opacity", 0);
        })

    labels(heatmap, xScale, 'white', heatmapHeight, false)


    // legend
    let legendSize = width / 5
    let legendData = new Array(Math.floor(legendSize)).fill(1)
    let legendXstart = (width / 5) * 4
    let legendYstart = heatmapHeight
    let legendHeight = 30

    let legendScale = d3.scaleLinear()
        .domain([0,legendSize])
        .range(d3.extent(data, d => d[selection]))

        heatmapLegendGroup.selectAll('.colorlegend')
        .data(legendData)
        .join('line')
        .attr('y1', -legendHeight)
        .attr('y2', 0)
        .attr('x1', (d,i) => i)
        .attr('x2', (d,i) => i)
        .attr("stroke", (d,i) => colorScale(legendScale(i)))
        .attr("class", "colorlegend")

    let legendAxisScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[selection]))
        .range([0,legendSize])

    heatmapLegendGroup.call(d3.axisBottom(legendAxisScale).ticks(5))

    //append axis
    heatmapXAxisGroup
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    heatmapYAxisGroup
        .call(d3.axisLeft(yScale))

};
/////////////////////////////////////
//////////// Setup SVG //////////////
/////////////////////////////////////
const heatmap = d3.select('#heatmap')
    .append('svg')
    .attr('height', heatmapSvgHeight)
    .attr('width', svgWidth)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + heatmapMargin.top + ")");


/////////////////////////////////////
//////////// Add Groups /////////////
/////////////////////////////////////
const heatmapXAxisGroup = heatmap.append("g")
    .attr("transform", `translate(0,${heatmapHeight})`)
    .attr("id", "x-axis")

const heatmapYAxisGroup = heatmap.append("g")
    .attr("id", "y-axis")

const heatmapLegendGroup = heatmap.append("g")
    .attr("transform", `translate(${(width / 5) * 4},${heatmapHeight+120})`)
    .attr("id", "legend-x-axis")


/////////////////////////////////////
///////// Update Function ///////////
/////////////////////////////////////
function heatmapUpdate(data){

    const legendSize = width / 5

    /////////////////////////////////////
    ////////////// Scales ///////////////
    /////////////////////////////////////
    const yScale = d3.scaleBand().domain(d3.map(rawData, d => d.areaName)).range([heatmapHeight,0])
    const step = d3.scaleLinear().domain([0, 9]).range(d3.extent(data, d => d[selection]));
    const colors = ['rgba(0,0,0,0)', ...d3.schemeYlOrRd[9]]
    const colorDomain = colors.map((d,i) => step(i))
    const colorScale = d3.scaleLinear().domain(colorDomain).range(colors)
    const legendScale = d3.scaleLinear().domain([0,legendSize]).range(d3.extent(data, d => d[selection]))

    /////////////////////////////////////
    //////////// Add Squares ////////////
    /////////////////////////////////////
    heatmap.selectAll('rect')
        .data(data)
        .join('rect')
        .attr('y', d => yScale(d.areaName))
        .attr('height', yScale.bandwidth())
        .attr('x', d => xScale(d.startDate))
        .attr('width', d => xScale(d.endDate) - xScale(d.startDate))
        .attr("fill", d => d.startDate < new Date(filter_date) ? colorScale(d[selection]) : 'rgba(0,0,0,0)')
        .attr("stroke", d => colorScale(d[selection]))
        .attr("stroke-opacity", 0.9)
        .attr("stroke-width", 0)
        .attr('fill-opacity', d => areaHover.includes(d.areaName) ? 1 : 0.9)
        .on("mouseover", function(event, d){  
            // update hover opacity    
            areaHover = [d.areaName]
            areaUpdate(data, xScale)
            heatmapUpdate(data, xScale)

            //adjust size of squares to show stroke correctly
            d3.select(this).attr("stroke-width", 1)
                .attr('y', d => yScale(d.areaName) + 1)
                .attr('height', yScale.bandwidth() - 2)
                .attr('x', d => xScale(d.startDate) + 1)
                .attr('width', d => xScale(d.endDate) - xScale(d.startDate) - 2)

            // show and add information to tooltip
            tooltip.transition()		
                .duration(200)		
                .style("opacity", .9);		
            tooltip.html('Date: <strong>' + dateOutputFormat(d.startDate) + '</strong><br>Area: <strong>' + d.areaName + `</strong><br>${metrics[selection]}: <strong>` + d[selection].toLocaleString() + '</strong>')	
                .style("left", (event.pageX) + "px")		
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(){
            // update hover opacity    
            areaHover = areas
            areaUpdate(data, xScale)
            heatmapUpdate(data, xScale)

            // reset stroke width
            d3.select(this).attr("stroke-width", 0)

            // hide tooltip
            tooltip.transition()		
                .duration(500)		
                .style("opacity", 0);
        })


    /////////////////////////////////////
    ////////////// Labels ///////////////
    /////////////////////////////////////
    labels(heatmap, xScale, 'white', heatmapHeight, false)


    /////////////////////////////////////
    ////////////// Legend ///////////////
    /////////////////////////////////////
    const legendData = new Array(Math.floor(legendSize)).fill(1)

    heatmapLegendGroup.selectAll('.colorlegend')
        .data(legendData)
        .join('line')
        .attr('y1', -30) // legend height
        .attr('y2', 0)
        .attr('x1', (d,i) => i)
        .attr('x2', (d,i) => i)
        .attr("stroke", (d,i) => colorScale(legendScale(i)))
        .attr("class", "colorlegend")

    const legendAxisScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d[selection]))
        .range([0,legendSize])

    heatmapLegendGroup.call(d3.axisBottom(legendAxisScale).ticks(5))

    /////////////////////////////////////
    //////////////// Axis ///////////////
    /////////////////////////////////////   
    heatmapXAxisGroup
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    heatmapYAxisGroup.call(d3.axisLeft(yScale))

};
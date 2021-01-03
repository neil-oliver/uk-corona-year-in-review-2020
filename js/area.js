let areachart = d3.select('#areachart')
    .append('svg')
    .attr('height', svgHeight-145)
    .attr('width', svgWidth)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

function areaUpdate(data, xScale, initial=false){

    let values = d3.group(data, d => d.startDate, d => d.areaName)
    let objValues = Object.fromEntries(values)

    let yScale = d3.scaleLinear()
        .range([height,0])
        .domain(d3.extent(Array.from(values).map(d => d3.sum(Array.from(d[1]), j => j[1][0][selection]))))

    let colorScale = d3.scaleBand()
        .domain(areas)
        .range([0,1])
      
    let series = d3.stack()
        .keys(areas)
        .value((d,key) => areaSelection.includes(key) ? d[1].get(key)[0][selection] : 0)
        .order(d3.stackOrderNone)
        (values)

    let area = d3.area()
        .x(d => xScale(new Date(d.data[0])))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveBasis)

    let mouseEventRect = areachart
        .selectAll("rect")
        .data([1])
        .join("rect")
        .attr('x', 0)
        .attr("y", 0)
        .attr("height", height)
        .attr("width", width)
        .attr("fill", "rgb(0,0,0,0)")
        .on("click", function(event, d){
            areaSelection = areas
            areaUpdate(wrangledData, xScale)
            heatmapUpdate(wrangledData, xScale)
        })

    let ageArea = areachart
        .selectAll("path")
        .data(series)
        .join("path")
            .attr("fill", ({key}) => d3.interpolateViridis(colorScale(key)))
            .attr('stroke', 'white')
            .attr("stroke-dasharray", "2")
            .attr("d", area)
            .on("mouseover", function(event, d){
                areaSelection = [d.key]
                heatmapUpdate(wrangledData, xScale)

                let hoverDate = sumBy.round(xScale.invert(event.layerX - margin.left))

                areachart
                    .selectAll("path")
                    .data(series)
                    .join("path")
                    .attr("fill-opacity", 0.8)

                d3.select(this).attr("fill-opacity", 1)

                const e = ageArea.nodes();
                const i = e.indexOf(this);

                tooltip.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                tooltip.html('Date: <strong>' + dateOutputFormat(hoverDate) + '</strong><br>Area: <strong>' + d.key  + `</strong><br>${metrics[selection]}: <strong>` + objValues[hoverDate].get(d.key)[0][selection].toLocaleString() + '</strong>')	
                    .style("left", (event.pageX) + "px")		
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(){

                areaSelection = areas
                heatmapUpdate(wrangledData, xScale)

                areachart
                    .selectAll("path")
                    .data(series)
                    .join("path")
                    .attr("fill-opacity", 1)

                tooltip.transition()		
                    .duration(500)		
                    .style("opacity", 0);
            })
            .on ("click", function(event, d) {
                areaSelection = [d.key]
                areaUpdate(wrangledData, xScale)
            })

    if (initial == true){

        labels(areachart, xScale, 'grey')

        areachart.append("g")
            .attr("id", "areachart-y-axis")

        let yAxis = d3.axisLeft(yScale)

        d3.select('#areachart-y-axis')
            .call(yAxis)

        areachart.append("g")			
            .attr("id", "areachart-grid")
            .attr("color", "grey")
            .attr("opacity", 0.1)
            .call(yAxis
                .tickSize(-width)
                .tickFormat("")
            )

        areachart.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr("id", "areachart-x-axis")

        let xAxis = d3.axisBottom(xScale)
            .tickFormat("")
            .ticks(sumBy)

        d3.select('#areachart-x-axis')
            .call(xAxis)

    }

}
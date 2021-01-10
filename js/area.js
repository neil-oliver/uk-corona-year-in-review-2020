let areachart = d3.select('#areachart')
    .append('svg')
    .attr('height', areaSvgHeight-145)
    .attr('width', svgWidth)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + areaMargin.top + ")")

let mouseEventGroup = areachart.append("g")

let ageAreaGroup = areachart.append("g")

let highPointGroup = areachart.append("g")

let legendGroup = areachart.append("g")

let labelsGroup = areachart.append("g")

let areaYAxisGroup = areachart.append("g")
    .attr("id", "areachart-y-axis")

let areaXAxisGroup = areachart.append("g")
    .attr("transform", `translate(0,${areaHeight})`)
    .attr("id", "areachart-x-axis")

function areaUpdate(data, xScale, initial=false){

    let values = d3.group(data, d => d.startDate, d => d.areaName)
    let objValues = Object.fromEntries(values)

    let yMax = d3.max(Array.from(values).map(d => d3.sum(Array.from(d[1]), j => j[1][0][selection])))
    let yExtent = [0, yMax*1.1] // give headspace
    let yScale = d3.scaleLinear()
        .range([areaHeight,0])
        .domain(yExtent)

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
        .curve(d3.curveMonotoneX)

    let mouseEventRect = mouseEventGroup
        .selectAll("rect")
        .data([1])
        .join("rect")
        .attr('x', 0)
        .attr("y", 0)
        .attr("height", areaHeight)
        .attr("width", width)
        .attr("fill", "rgb(0,0,0,0)")
        .on("click", function(event, d){
            areaSelection = [...areas]

            areaUpdate(wrangledData, xScale)
            heatmapUpdate(wrangledData, xScale)
        })

    let ageArea = ageAreaGroup
        .selectAll(".areapath")
        .data(series)
        .join("path")
            .attr("fill", ({key}) => d3.interpolateViridis(colorScale(key)))
            .attr("class", "areapath")
            .attr("fill-opacity", d => areaHover.includes(d.key) ? 1 : 0.8)
            .on("mouseover", function(event, d){
                areaHover = [d.key]
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
                tooltip.html('Date: <strong>' + dateOutputFormat(hoverDate) + '</strong><br>Area: <strong>' + d.key  + `</strong><br>${metrics[selection]} ${selection != 'newDeaths28DaysByPublishDate' && selection != 'cumDeaths28DaysByPublishDate' ? `(Per ${sumByKey})` : ``}: <strong>` + objValues[hoverDate].get(d.key)[0][selection].toLocaleString() + '</strong>')	
                    .style("left", (event.pageX) + "px")		
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(){

                areaHover = [...areas]

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
            .attr("d", area)

    // high point label
    let totals = Array.from(d3.rollup(data, v => d3.sum(v, j => areaSelection.includes(j.areaName) ? j[selection] : 0), d => d.startDate))
    let max = d3.maxIndex(totals, d => d[1])
    
    highPointGroup.selectAll('.highline')
        .data([1])
        .join('line')
        .attr('y1', yScale(totals[max][1]))
        .attr('y2', yScale(totals[max][1]))
        .attr('x1', xScale(totals[max][0]) - (width / 20))
        .attr('x2', xScale(totals[max][0]) - 10)
        .attr("stroke", 'black')
        .attr("class", "highline")

    highPointGroup.selectAll('text')
        .data([1])
        .join('text')
        .text(`Peak: ${dateOutputFormat(totals[max][0])} - ` + totals[max][1].toLocaleString())
        .attr("font-family", "sans-serif")               
        .attr("font-size", "10px")
        .attr('fill', 'black')
        .attr('x', xScale(totals[max][0]) - (width / 20) - 10)
        .attr('y', yScale(totals[max][1])+3)
        .style("text-anchor", "end")

    //band scale
    const legend = d3.scaleBand()
        .range([0,width/2])
        .domain(areas)

    // append colour square
    const rect = legendGroup
        .selectAll("rect")
        .data(areas)
        .join("rect")
        .attr("fill", d => d3.interpolateViridis(colorScale(d)))
        .attr("fill-opacity", d => areaSelection.includes(d) ? 1 : 0.5)
        .attr('x', d =>  legend(d)+20)
        .attr('y', 10)
        .attr("height", 10)
        .attr("width", 10)
        .on ("click", function(event, d) {

            if (areaSelection.indexOf(d) != -1){
                areaSelection.splice(areaSelection.indexOf(d), 1)
            } else {
                areaSelection.push(d)
            }

            areaUpdate(wrangledData, xScale)
        })

    // append text label
    const text = legendGroup
        .selectAll("text")
        .data(areas)
        .join("text")
        .attr("fill", 'black')
        .attr('x', d =>  legend(d) + 35)
        .attr('y', 19)
        .attr('font-size', 10)
        .text(d => d)

    labels(labelsGroup, xScale, 'grey', areaHeight)

    areaYAxisGroup.call(d3.axisLeft(yScale))

    areaXAxisGroup.call(
        d3.axisBottom(xScale)
            .tickFormat("")
            .ticks(sumBy)
    )

}
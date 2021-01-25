/////////////////////////////////////
//////////// Setup SVG //////////////
/////////////////////////////////////
const areachart = d3.select('#areachart')
    .append('svg')
    .attr('height', areaSvgHeight-145)
    .attr('width', svgWidth)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + areaMargin.top + ")")


/////////////////////////////////////
//////////// Add Groups /////////////
/////////////////////////////////////
const mouseEventGroup = areachart.append("g")

const ageAreaGroup = areachart.append("g")

const highPointGroup = areachart.append("g")

const legendGroup = areachart.append("g")

const labelsGroup = areachart.append("g")

const areaYAxisGroup = areachart.append("g")
    .attr("id", "areachart-y-axis")

const areaXAxisGroup = areachart.append("g")
    .attr("transform", `translate(0,${areaHeight})`)
    .attr("id", "areachart-x-axis")


/////////////////////////////////////
///////// Update Function ///////////
/////////////////////////////////////
function areaUpdate(data){

    // group data
    const values = d3.group(data, d => d.startDate, d => d.areaName)


    /////////////////////////////////////
    ////////////// Scales ///////////////
    /////////////////////////////////////
    const yMax = d3.max(Array.from(values).map(d => d3.sum(Array.from(d[1]), j => j[1][0][selection])))

    const yScale = d3.scaleLinear().range([areaHeight, 0]).domain([0, yMax * 1.1])

    const colorScale = d3.scaleBand().domain(areas).range([0,1])

    const legendScale = d3.scaleBand().range([0,width/2]).domain(areas)
    
    /////////////////////////////////////
    //////// Add Background Rect ////////
    /////////////////////////////////////

    // background rect for use with click events (as reset)
    mouseEventGroup
        .selectAll("rect")
        .append("rect")
        .attr('x', 0)
        .attr("y", 0)
        .attr("height", areaHeight)
        .attr("width", width)
        .attr("fill", "rgb(0,0,0,0)")
        .on("click", function(event, d){
            areaSelection = [...areas]
            areaUpdate(data)
            heatmapUpdate(data)
        })
    

    /////////////////////////////////////
    ///////// Add Stacked Area //////////
    /////////////////////////////////////

    // area generator
    const area = d3.area()
        .x(d => xScale(new Date(d.data[0])))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveMonotoneX)
    
    // stack data
    const series = d3.stack()
        .keys(areas)
        .value((d,key) => areaSelection.includes(key) ? d[1].get(key)[0][selection] : 0)
        .order(d3.stackOrderNone)
        (new Map(
            [...values]
            .filter(([d, key]) => d <= new Date(filter_date) )
        ))

    console.log(values)
    
    // add areas
    ageAreaGroup
        .selectAll(".areapath")
        .data(series)
        .join("path")
            .attr("fill", ({key}) => d3.interpolateViridis(colorScale(key)))
            .attr("class", "areapath")
            .attr("fill-opacity", d => areaHover.includes(d.key) ? 1 : 0.8)
            .on("mouseover", function(event, d){
                // update hover opacity
                areaHover = [d.key]
                heatmapUpdate(data)
                areaUpdate(data)

                // calculate hover date (not available in area data)
                let hoverDate = sumBy.round(xScale.invert(event.layerX - margin.left))

                // show and add information to tooltip
                tooltip.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                tooltip.html(
                    'Date: <strong>' + dateOutputFormat(hoverDate) + 
                    '</strong><br>Area: <strong>' + d.key  + 
                    `</strong><br>${metrics[selection]} ${selection != 'newDeaths28DaysByPublishDate' && selection != 'cumDeaths28DaysByPublishDate' ? `(Per ${sumByKey})` : ``}: <strong>` + 
                    Object.fromEntries(values)[hoverDate].get(d.key)[0][selection].toLocaleString() + '</strong>'
                )	
                .style("left", (event.pageX) + "px")		
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(){
                // update hover opacity
                areaHover = [...areas] // create a copy so not to alter the original list by reference
                heatmapUpdate(data)
                areaUpdate(data)

                // hide tooltip
                tooltip.transition()		
                    .duration(500)		
                    .style("opacity", 0);
            })
            .on ("click", function(event, d) {
                areaSelection = [d.key]
                areaUpdate(data)
            })
            .attr("d", area)


    /////////////////////////////////////
    ///////// Peak Point Marker /////////
    /////////////////////////////////////

    const totals = Array.from(d3.rollup(data, v => d3.sum(v, j => areaSelection.includes(j.areaName) ? j[selection] : 0), d => d.startDate))
    const max = d3.maxIndex(totals, d => d[1])

    // append a horizonal line at the peak point
    highPointGroup.selectAll('.highline')
        .append('line')
        .attr('y1', yScale(totals[max][1]))
        .attr('y2', yScale(totals[max][1]))
        .attr('x1', xScale(totals[max][0]) - (width / 20))
        .attr('x2', xScale(totals[max][0]) - 10)
        .attr("stroke", 'black')
        .attr("class", "highline")

    // append text label for peak point
    highPointGroup.selectAll('text')
        .append('text')
        .text(`Peak: ${dateOutputFormat(totals[max][0])} - ` + totals[max][1].toLocaleString())
        .attr("font-family", "sans-serif")               
        .attr("font-size", "10px")
        .attr('fill', 'black')
        .attr('x', xScale(totals[max][0]) - (width / 20) - 10)
        .attr('y', yScale(totals[max][1])+3)
        .style("text-anchor", "end")


    /////////////////////////////////////
    ////////////// Legend ///////////////
    /////////////////////////////////////

    // append colour square for legend
    legendGroup
        .selectAll("rect")
        .data(areas)
        .join("rect")
        .attr("fill", d => d3.interpolateViridis(colorScale(d)))
        .attr("fill-opacity", d => areaSelection.includes(d) ? 1 : 0.5)
        .attr('x', d =>  legendScale(d)+20)
        .attr('y', 10)
        .attr("height", 10)
        .attr("width", 10)
        .on ("click", function(event, d) {

            if (areaSelection.indexOf(d) != -1){
                areaSelection.splice(areaSelection.indexOf(d), 1)
            } else {
                areaSelection.push(d)
            }

            areaUpdate(data)
        })

    // append text label for legend
    legendGroup
        .selectAll("text")
        .data(areas)
        .join("text")
        .attr("fill", 'black')
        .attr('x', d =>  legendScale(d) + 35)
        .attr('y', 19)
        .attr('font-size', 10)
        .text(d => d)

    
    /////////////////////////////////////
    ////////////// Labels ///////////////
    /////////////////////////////////////
    labels(labelsGroup, xScale, 'grey', areaHeight)
    
    /////////////////////////////////////
    //////////////// Axis ///////////////
    /////////////////////////////////////    
    areaYAxisGroup.call(d3.axisLeft(yScale))
    areaXAxisGroup.call(d3.axisBottom(xScale).tickFormat("").ticks(sumBy))

}
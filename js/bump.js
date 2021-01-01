let bumpchart = d3.select('#bumpchart')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function bumpUpdate(data, xScale){

    let sumData = []

    for(let x of d3.map(data, d => d.startDate)){
        let temp = data.filter(d => d.startDate == x)
        temp.sort((a,b) => a[selection] > b[selection] ? 1 : -1)
        temp.forEach((d,i) => d.rank = i+1)
        sumData = sumData.concat(temp)
    }

    let yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.rank))
        .range([height,0])

    let colorScale = d3.scaleOrdinal().domain(d3.map(sumData, d => d.areaName))
        .range(d3.schemeSet3);

    var sumStat = d3.groups(sumData, d => d.areaName)

    bumpchart.selectAll(".line")
        .data(sumStat)
        .join("path")
        .attr("fill", "none")
        .attr("stroke",  d => colorScale(d[0]))
        .attr("stroke-width", 3)
        .attr("d", function(d){
            return d3.line()
            .x(d => xScale(d.startDate))
            .y(d => yScale(d.rank))
            (d[1].sort((a,b) => a.startDate > b.startDate ? 1 : -1))
        })

    bumpchart.selectAll('circle')
        .data(sumData)
        .join('circle')
        .attr('cx', d => xScale(d.startDate))
        .attr('cy', d => yScale(d.rank))
        .attr('r', 5)
        .attr("fill", d => colorScale(d.areaName))
        .on("mouseover", function(event, d){
            tooltip.transition()		
                .duration(200)		
                .style("opacity", .9);		
            tooltip.html(d.startDate + '<br>' + d.areaName + `<br>${metrics[selection]}: ` + d[selection].toLocaleString())	
                .style("left", (event.pageX) + "px")		
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(){
            tooltip.transition()		
                .duration(500)		
                .style("opacity", 0);
        })


    //add svg group to append axis
    bumpchart.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("id", "x-axis-2")

    bumpchart.append("g")
        .attr("id", "y-axis-2")

    bumpchart.append("g")
        .attr("id", "y-axis-3")

    let RankScale = d3.scalePoint()
        .range([height,0])

    //append axis
    d3.select('#x-axis-2')
        .transition()
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");


    let left = sumStat.map(d => {return {areaName: d[1][0].areaName, rank:d[1][0].rank}}).sort((a,b) => a.rank > b.rank ? 1 : -1).map(d => d.areaName)
    let right = sumStat.map(d => {return {areaName: d[1][d[1].length-1].areaName, rank:d[1][d[1].length-1].rank}}).sort((a,b) => a.rank > b.rank ? 1 : -1).map(d => d.areaName)

    d3.select('#y-axis-2')
        .call(d3.axisLeft(RankScale.domain(left)))

    d3.select('#y-axis-3')
        .attr("transform", `translate(${width},0)`)
        .call(d3.axisRight(RankScale.domain(right)))
    
}
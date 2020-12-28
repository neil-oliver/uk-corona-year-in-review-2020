//global variables
let svgWidth = 1800
let svgHeight = svgWidth * 0.6

let margin = {
    left:100,
    right:100,
    top:200,
    bottom:150
}

//inner width & height 
let height = svgHeight - margin.top - margin.bottom
let width = svgWidth - margin.left - margin.right

// setup svg & add group
let svg = d3.select('#vis')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let svg2 = d3.select('#vis2')
    .append('svg')
    .attr('height', svgHeight)
    .attr('width', svgWidth)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);


d3.json('./js/uk_coronavirus_data_region.json').then(data => {
    run(data)
})

let sumBy = d3.timeWeek
let colorSelection = "newCasesBySpecimenDate"

// load in data
function run(data){

    console.log(data)

    data.forEach(d => d.date = new Date(d.date))
    // data = data.filter(d => d.date > new Date('03/21/2020'))

    data = data.filter(d => d.areaName != undefined)

    // scales
    let yScale = d3.scaleBand()
        .domain(d3.map(data, d => d.areaName))
        .range([height,0])
        .paddingInner(0.01)
        .paddingOuter(0.01)
    
    let xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date))
        .range([0,width])

    var histogram = d3.bin()
        .value(function(d) { return d.date; })
        .domain(xScale.domain())
        .thresholds(xScale.ticks(sumBy));
    
    let sumData = []

    for (let x of yScale.domain()){
        let temp = data.filter(d => d.areaName == x)
        let summed = histogram(temp)
        let newObj = summed.map(d => {
            return {
                areaName:x, 
                startDate:d.x0, 
                endDate:d.x1, 
                newCasesBySpecimenDate:d3.sum(d, j => j.newCasesBySpecimenDate), 
                cumCasesBySpecimenDate:d3.max(d, j => j.cumCasesBySpecimenDate), 
                newDeaths28DaysByPublishDate:d3.sum(d, j => j.newDeaths28DaysByPublishDate),
                cumDeaths28DaysByPublishDate:d3.max(d, j => j.cumDeaths28DaysByPublishDate) 
            }
        })
        sumData = sumData.concat(newObj)
    }

    bump(sumData)

    let colorScale = d3.scaleSequential()
        .domain(d3.extent(sumData, d => d[colorSelection]))
        .interpolator(d3.interpolateViridis)

    
    svg.selectAll('rect')
        .data(sumData)
        .join('rect')
        .attr('y', d => yScale(d.areaName))
        .attr('height', yScale.bandwidth())
        .attr('x', d => xScale(d.startDate))
        .attr('width', d => xScale(d.endDate) - xScale(d.startDate))
        .attr("fill", d => colorScale(d[colorSelection]))
        .on("mouseover", function(event, d){
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div.html(d.startDate + '<br>' + d.areaName + '<br>New Cases: ' + d.newCasesBySpecimenDate)	
                .style("left", (event.pageX) + "px")		
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(){
            div.transition()		
                .duration(500)		
                .style("opacity", 0);
        })

    let markers_data = [
        {label:'National Lockdown', date:'03/23/2020', desc:''},
        {label:'Easing Measures Announced', date:'05/28/2020', desc:''},
        {label:'Measures Updated', date:'06/01/2020', desc:'People from different households are able to meet in groups of six in gardens and outdoor spaces.'},
        {label:'Measures Updated', date:'06/15/2020', desc:'Non-essential shops including toys, furniture, charity, betting and clothes are allowed to open.'},
        {label:'Measures Updated', date:'07/15/2020', desc:'Masks are compulsory on public transport and in indoor settings such as shops'},
        {label:'Tier System Announced', date:'10/12/2020', desc:''},
        {label:'Tier System', date:'10/14/2020', desc:''},
        {label:'Second National Lockdown Announced', date:'10/31/2020', desc:''},
        {label:'Second National Lockdown', date:'11/05/2020', desc:''},
        {label:'Tier System Reintroduced', date:'12/02/2020', desc:''},
        {label:'Tier System Update Announced', date:'12/19/2020', desc:''},
        {label:'Tier Update', date:'12/20/2020', desc:''},
        {label:'Christmas Restrictions Announced', date:'11/24/2020', desc:''},
        {label:'Tier System Update Announced', date:'12/23/2020', desc:''},
        {label:'Tier Update', date:'12/26/2020', desc:''},
    ]

    svg.selectAll('line')
        .data(markers_data)
        .join('line')
        .attr('y1', 0)
        .attr('y2', height)
        .attr('x1', d => xScale(new Date(d.date)))
        .attr('x2', d => xScale(new Date(d.date)))
        .attr("stroke-dasharray", "4")
        .attr("stroke", 'white')

    svg.selectAll('text')
        .data(markers_data)
        .join('text')
        .text(d => d.label)
        .attr("font-family", "sans-serif")               
        .attr("font-size", "10px")
        .attr('fill', 'black')
        .attr('transform', (d,i)=>{
            return 'translate( ' + xScale(new Date(d.date)) + ' , ' + '-5' + '),'+ 'rotate(90)'
        })
        .attr('x', 0)
        .attr('y', 0)
        .style("text-anchor", "end")
        .on("mouseover", function(event, d){
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div.html(d.desc)	
                .style("left", (event.pageX) + "px")		
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(){
            div.transition()		
                .duration(500)		
                .style("opacity", 0);
        })

    //add svg group to append axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("id", "x-axis")

    svg.append("g")
        .attr("id", "y-axis")


    //append axis
    d3.select('#x-axis')
        .transition()
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", ".35em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

    d3.select('#y-axis')
        .call(d3.axisLeft(yScale).ticks(sumBy))

};

function bump(data){

    let xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d.startDate))
    .range([0,width])

    let sumData = []

    for(let x of d3.map(data, d => d.startDate)){
        let temp = data.filter(d => d.startDate == x)
        temp.sort((a,b) => a[colorSelection] > b[colorSelection] ? 1 : -1)
        temp.forEach((d,i) => d.rank = i+1)
        sumData = sumData.concat(temp)
    }

    let yScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.rank))
        .range([height,0])

    let colorScale = d3.scaleOrdinal().domain(d3.map(sumData, d => d.areaName))
        .range(d3.schemeSet3);

    console.log(sumData)

    var sumStat = d3.groups(sumData, d => d.areaName)
    console.log(sumStat)

    svg2.selectAll(".line")
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

    svg2.selectAll('circle')
        .data(sumData)
        .join('circle')
        .attr('cx', d => xScale(d.startDate))
        .attr('cy', d => yScale(d.rank))
        .attr('r', 5)
        .attr("fill", d => colorScale(d.areaName))
        .on("mouseover", function(event, d){
            div.transition()		
                .duration(200)		
                .style("opacity", .9);		
            div.html(d.startDate + '<br>' + d.areaName + '<br>New Cases: ' + d.newCasesBySpecimenDate)	
                .style("left", (event.pageX) + "px")		
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(){
            div.transition()		
                .duration(500)		
                .style("opacity", 0);
        })


    //add svg group to append axis
    svg2.append("g")
        .attr("transform", `translate(0,${height})`)
        .attr("id", "x-axis-2")

    svg2.append("g")
        .attr("id", "y-axis-2")

    svg2.append("g")
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





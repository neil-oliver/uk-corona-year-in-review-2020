// summarize data by time period (day / week / month - selectable).
function wrangleData(data) {

    // histrogram to group data by time period 
    var histogram = d3.bin()
        .value(function(d) { return d.date; })
        .domain(xScale.domain())
        .thresholds(xScale.ticks(sumBy));

    let sumData = []

    for (let x of areas){
        // break data into each area before summarizing
        let filteredByArea = data.filter(d => d.areaName == x)

        let newObj = histogram(filteredByArea).map(d => {
            return {
                areaName: x, 
                startDate: d.x0, 
                endDate: d.x1, 
                newCasesBySpecimenDate: d3.sum(d, j => j.newCasesBySpecimenDate ? j.newCasesBySpecimenDate : 0) != undefined ? d3.sum(d, j => j.newCasesBySpecimenDate ? j.newCasesBySpecimenDate : 0) : 0, 
                cumCasesBySpecimenDate: d3.max(d, j => j.cumCasesBySpecimenDate ? j.cumCasesBySpecimenDate : 0) != undefined ? d3.max(d, j => j.cumCasesBySpecimenDate ? j.cumCasesBySpecimenDate : 0) : 0, 
                newDeaths28DaysByPublishDate: d3.sum(d, j => j.newDeaths28DaysByPublishDate ? j.newDeaths28DaysByPublishDate : 0) != undefined ? d3.sum(d, j => j.newDeaths28DaysByPublishDate ? j.newDeaths28DaysByPublishDate : 0) : 0,
                cumDeaths28DaysByPublishDate: d3.max(d, j => j.cumDeaths28DaysByPublishDate ? j.cumDeaths28DaysByPublishDate : 0) != undefined ? d3.max(d, j => j.cumDeaths28DaysByPublishDate ? j.cumDeaths28DaysByPublishDate : 0) : 0,
                // age demongraphic information, not currently used. Only available for regional data (not local authority).
                newCasesBySpecimenDateAgeDemographics: keys.map((j,i) => d3.sum(d, k => k.newCasesBySpecimenDateAgeDemographics[i] ? k.newCasesBySpecimenDateAgeDemographics[i].cases : 0))
            }
        })
        // concat all area summaries into a single file
        sumData = sumData.concat(newObj)
    }

    // return summarised data
    return sumData
}

// load data
d3.json('./js/uk_coronavirus_data_region.json').then(d => {

    rawData = d

    rawData.sort((a,b) => a.startDate > b.startDate ? 1 : -1)

    rawData.forEach(d => d.date = new Date(d.date))

    rawData = rawData.filter(d => d.areaName != undefined)

    areas = [...new Set(rawData.map(d => d.areaName))]
    areaSelection = [...areas]
    areaHover = [...areas]

    let colorScale = d3.scaleBand()
        .domain(areas)
        .range([0,1])

    xScale.domain(d3.extent(rawData, d => d.date))

    data = wrangleData(rawData)

    console.log('RAW DATA')
    console.log(rawData)

    console.log('WRANGLED DATA')
    console.log(data)

    areaUpdate(data, xScale, true)
    heatmapUpdate(data, xScale, true)

})

// Handler for dropdown value change
var metricDropdownChange = function() {
    selection = d3.select(this).property('value'),

    areaUpdate(data, xScale)
    heatmapUpdate(data, xScale)
};

var metricDropdown = d3.select("#metric-dropdown-container")
    .insert("select", "svg")
    .on("change", metricDropdownChange);

metricDropdown.selectAll("option")
    .data(Object.keys(metrics))
    .enter().append("option")
    .attr("value", function (d) { return d; })
    .text(function (d) {
        return metrics[d]
    });

var periodDropdownChange = function() {
    sumByKey = d3.select(this).property('value')
    sumBy = sumByLookup[sumByKey]
    console.log('updating sum by to ' + sumBy)

    data = wrangleData(rawData)
    areaUpdate(data, xScale)
    heatmapUpdate(data, xScale)
};

var periodDropdown = d3.select("#period-dropdown-container")
    .insert("select", "svg")
    .on("change", periodDropdownChange);

periodDropdown.selectAll("option")
    .data(Object.keys(sumByLookup))
    .enter().append("option")
    .attr("value", function (d) { return d; })
    .text(function (d) {
        return d.charAt(0).toUpperCase() + d.slice(1)
    });


window.addEventListener('resize', _.debounce(resize));

function resize(){
    console.log('resizing')
    svgWidth = parseInt(d3.select('#vis-container').style('width'), 10)
    areaSvgHeight = svgWidth * 0.5

    d3.selectAll('svg').attr("width", svgWidth)

    d3.selectAll('#areachart').attr("height", areaSvgHeight)

    width = svgWidth - margin.left - margin.right

    d3.selectAll('#legend-x-axis').attr("transform", `translate(${(width / 5) * 4},${heatmapHeight+120})`)

    xScale.range([0, width])

    areaUpdate(data, xScale)
    heatmapUpdate(data, xScale)
}



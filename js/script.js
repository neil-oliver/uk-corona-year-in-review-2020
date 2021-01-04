function wrangleData(data, xScale) {

    var histogram = d3.bin()
        .value(function(d) { return d.date; })
        .domain(xScale.domain())
        .thresholds(xScale.ticks(sumBy));

    let sumData = []

    for (let x of areas){
        let temp = data.filter(d => d.areaName == x)

        let newObj = histogram(temp).map(d => {
            return {
                areaName: x, 
                startDate: d.x0, 
                endDate: d.x1, 
                newCasesBySpecimenDate: d3.sum(d, j => j.newCasesBySpecimenDate ? j.newCasesBySpecimenDate : 0) != undefined ? d3.sum(d, j => j.newCasesBySpecimenDate ? j.newCasesBySpecimenDate : 0) : 0, 
                cumCasesBySpecimenDate: d3.max(d, j => j.cumCasesBySpecimenDate ? j.cumCasesBySpecimenDate : 0) != undefined ? d3.max(d, j => j.cumCasesBySpecimenDate ? j.cumCasesBySpecimenDate : 0) : 0, 
                newDeaths28DaysByPublishDate: d3.sum(d, j => j.newDeaths28DaysByPublishDate ? j.newDeaths28DaysByPublishDate : 0) != undefined ? d3.sum(d, j => j.newDeaths28DaysByPublishDate ? j.newDeaths28DaysByPublishDate : 0) : 0,
                cumDeaths28DaysByPublishDate: d3.max(d, j => j.cumDeaths28DaysByPublishDate ? j.cumDeaths28DaysByPublishDate : 0) != undefined ? d3.max(d, j => j.cumDeaths28DaysByPublishDate ? j.cumDeaths28DaysByPublishDate : 0) : 0,
                newCasesBySpecimenDateAgeDemographics: keys.map((j,i) => d3.sum(d, k => k.newCasesBySpecimenDateAgeDemographics[i] ? k.newCasesBySpecimenDateAgeDemographics[i].cases : 0))
            }
        })
        sumData = sumData.concat(newObj)
    }

    return sumData
}

let xScale = d3.scaleUtc()
    .range([0, width])

let data = []
let wrangledData = []
let areas = []
let areaSelection = []

d3.json('./js/uk_coronavirus_data_region.json').then(d => {

    data = d

    data.sort((a,b) => a.startDate > b.startDate ? 1 : -1)

    data.forEach(d => d.date = new Date(d.date))

    data = data.filter(d => d.areaName != undefined)

    areas = [...new Set(data.map(d => d.areaName))]
    areaSelection = areas

    var areaSelectChange = function(event) {

        var checkedValues = document.querySelectorAll('.areaCheckbox:checked');
        let checkedAreas = []
        checkedValues.forEach(d => {
            checkedAreas.push(d.value)
        });
        areaSelection = checkedAreas

        areaUpdate(wrangledData, xScale)
        heatmapUpdate(wrangledData, xScale)
    };

    areaSelect = d3.select("#area-select-container")
        .on("change", areaSelectChange);

    let colorScale = d3.scaleBand()
        .domain(areas)
        .range([0,1])

    areaSelect.selectAll("input")
        .data(areas)
        .enter()
        .append('label')
            .text(function(d) { return d; })
            .style('color', d => d3.interpolateViridis(colorScale(d)))
        .append("input")
            .attr("checked", d => areaSelection.includes(d) ? true : false)
            .attr("type", "checkbox")
            .attr("value", d => d)
            .attr("id", function(d,i) { return i; })
            .attr("class", "areaCheckbox")

    xScale.domain(d3.extent(data, d => d.date))

    wrangledData = wrangleData(data, xScale)

    console.log(data)
    console.log(wrangledData)

    areaUpdate(wrangledData, xScale, true)
    heatmapUpdate(wrangledData, xScale, true)

})

// Handler for dropdown value change
var metricDropdownChange = function() {
    selection = d3.select(this).property('value'),

    areaUpdate(wrangledData, xScale)
    heatmapUpdate(wrangledData, xScale)
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

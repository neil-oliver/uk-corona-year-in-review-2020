//global variables
let svgWidth = parseInt(d3.select('#vis-container').style('width'), 10)

// let svgWidth = 1800
let svgHeight = 800

let margin = {
    left:100,
    right:100,
    top:200,
    bottom:150
}

//inner width & height 
let height = svgHeight - margin.top - margin.bottom
let width = svgWidth - margin.left - margin.right

let sumByLookup = {
    'Week' : d3.utcWeek,
    'Day' : d3.utcDay,
    'Month' : d3.utcMonth
}

let sumBy = d3.utcWeek
let sumByKey = 'Week'


var dateOutputFormat = d3.timeFormat("%d %B %Y");

var metrics = {
    'newCasesBySpecimenDate' : 'New Cases', 
    'cumCasesBySpecimenDate' : 'Cumulative Cases', 
    'newDeaths28DaysByPublishDate' : 'New Deaths (Past 28 Days)', 
    'cumDeaths28DaysByPublishDate' : 'Cumulative Deaths (Past 28 Days)'
}

let selection = 'newCasesBySpecimenDate'

let keys = ['00_04','05_09','10_14','15_19','20_24','25_29','30_34','35_39','40_44','45_49','50_54','55_59','60+','60_64','65_69','70_74','75_79','80_84','85_89','90+']

// Define the div for the tooltip
var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

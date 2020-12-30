let baseUrl = "https://coronavirus.data.gov.uk/api/"

function loadData(url, data=[]){
    fetch(baseUrl + url).then(res => res.json()).then(d =>{
        console.log(d)
        if(d.pagination && d.pagination.next){
            console.log(d)
            data = data.concat(d.data)
            loadData(d.pagination.next, data)
        } else {
            data = data.concat(d)
            console.log(JSON.stringify(data))
        }
    })
}

let startUrl = `v1/data?
    filters=areaType=region&structure=
    %7B%22areaType%22:%22areaType%22,
    %22areaName%22:%22areaName%22,
    %22areaCode%22:%22areaCode%22,
    %22date%22:%22date%22,
    %22cumCasesBySpecimenDate%22:%22cumCasesBySpecimenDate%22,
    %22newCasesBySpecimenDate%22:%22newCasesBySpecimenDate%22,
    %22cumDeaths28DaysByPublishDate%22:%22cumDeaths28DaysByPublishDate%22,
    %22newDeaths28DaysByPublishDate%22:%22newDeaths28DaysByPublishDate%22,
    %22newCasesBySpecimenDateAgeDemographics%22:%22newCasesBySpecimenDateAgeDemographics%22
    %7D&format=json`

loadData(startUrl)

//
let test_call = 
`https://coronavirus.data.gov.uk/api/v1/data?
filters=areaType=utla;areaName=Bath%2520and%2520North%2520East%2520Somerset&structure=
%7B%22areaType%22:%22areaType%22,
%22areaName%22:%22areaName%22,
%22areaCode%22:%22areaCode%22,
%22date%22:%22date%22,
%22newCasesBySpecimenDateAgeDemographics%22:%22newCasesBySpecimenDateAgeDemographics%22
%7D&format=json`
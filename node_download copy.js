const fs = require('fs');
const fetch = require('node-fetch');

//not working

let baseUrl = "https://coronavirus.data.gov.uk/api/"

function loadData(url, data=[]){

    fetch(baseUrl + url).then(res => res.json()).then(d => {
        console.log(d)
        if(d.pagination && d.pagination.next){
            console.log(d)
            data = data.concat(d.data)
            loadData(d.pagination.next, data)
        } else {
            data = data.concat(d)
            fs.writeFileSync('uk_coronavirus_data.json', JSON.stringify(data));
        }
    })
}

let startUrl = `v1/data?
    filters=areaType=utla&structure=
    %7B%22areaType%22:%22areaType%22,
    %22areaName%22:%22areaName%22,
    %22areaCode%22:%22areaCode%22,
    %22date%22:%22date%22,
    %22newCasesByPublishDate%22:%22newCasesByPublishDate%22,
    %22cumCasesByPublishDate%22:%22cumCasesByPublishDate%22
    %7D&format=json`

loadData(startUrl)
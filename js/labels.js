function labels(group, xScale, lineColor='white', labels=true){

    let markers_data = [
        {label:'National Lockdown', date:'03/23/2020', desc:'All non-essential businesses & education closed for in person work.'},
        {label:'Measures Updated', date:'06/01/2020', desc:'People from different households are able to meet in groups of six in gardens and outdoor spaces.'},
        {label:'Measures Updated', date:'06/15/2020', desc:'Non-essential shops including toys, furniture, charity, betting and clothes are allowed to open.'},
        {label:'Measures Updated', date:'07/15/2020', desc:'Masks are compulsory on public transport and in indoor settings such as shops'},
        {label:'Tier System Introduced', date:'10/14/2020', desc:'3 Tier System'},
        {label:'Second National Lockdown', date:'11/05/2020', desc:'Non essential Buisinesses closed, Education remains open.'},
        {label:'Tier System Reintroduced', date:'12/02/2020', desc:'3 Tier System'},
        {label:'Tier Update', date:'12/20/2020', desc:'Changes in which areas are in which Tier. Many areas move to a higher Tier.'},
        {label:'Tier System Update', date:'12/23/2020', desc:'4 Tier System, Christmas Restrictions reduced to 1 day.'},
        {label:'Tier Update', date:'12/26/2020', desc:'4 Tier System'},
    ]

    group.selectAll('.dashline')
        .data(markers_data)
        .join('line')
        .attr('y1', 0)
        .attr('y2', height)
        .attr('x1', d => xScale(new Date(d.date)))
        .attr('x2', d => xScale(new Date(d.date)))
        .attr("stroke-dasharray", "4")
        .attr("stroke", lineColor)
        .attr("class", "dashline")

    if (labels){
        group.selectAll('text')
            .data(markers_data)
            .join('text')
            .text(d => 'ⓘ ' + d.label)
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
                tooltip.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                tooltip.html(d.desc)	
                    .style("left", (event.pageX + 12) + "px")		
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(){
                tooltip.transition()		
                    .duration(500)		
                    .style("opacity", 0);
            })
        }

}
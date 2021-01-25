function labels(group, xScale, lineColor='white', Height, labels=true){

    group.selectAll('.dashline')
        .data(markers_data.filter(d => new Date(d.date) <= new Date(filter_date)))
        .join('line')
        .attr('y1', 0)
        .attr('y2', Height)
        .attr('x1', d => xScale(new Date(d.date)))
        .attr('x2', d => xScale(new Date(d.date)))
        .attr("stroke-dasharray", "4")
        .attr("stroke", lineColor)
        .attr("class", "dashline")

    if (labels){
        group.selectAll('text')
            .data(markers_data.filter(d => new Date(d.date) <= new Date(filter_date)))
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
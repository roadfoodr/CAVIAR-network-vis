const outerHeight = 800;
const outerWidth = 1000;
const fixedRadius = 11;

console.log(dataset);

const svg = d3.select("#visualization_canvas").append("svg")
            .attr("viewBox", [-outerWidth / 2, -outerHeight / 2, outerWidth, outerHeight])
            .style("border", "1px solid black");

const margin = {top:30, right:30, left:20, bottom:30}
const innerHeight = outerHeight - margin.top - margin.bottom;
const innerWidth = outerWidth - margin.left - margin.right;

var tooltip = d3.select("#visualization_canvas").append("div")	
    .attr("class", "tooltip")
    .style("opacity", 0);

colorScale = d3.scaleOrdinal(d3.schemeTableau10)

const simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody().strength(-5))
        .force("link", d3.forceLink().id(d => d.id))
        .force("center", d3.forceCenter().strength(.05))
        .force("collision", d3.forceCollide().radius(fixedRadius+3))
        .on("tick", ticked);

let link = svg.append("g")
      .attr("stroke", "#000")
      .attr("stroke-width", 1.25)
    .selectAll("line");

// node 2nd, so it goes on top of link
let node = svg.append("g")
    .selectAll(".circleGroup");

function ticked() {
    // transform instead of cy, because the node is a 'g'
    // (containing both the node and its label)
    // ###TODO: constrain within margins
    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })

    link.attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    }

function update({nodes, links}) {
    // cribbed from https://observablehq.com/@d3/modifying-a-force-directed-graph
    
    // Make a shallow copy to protect against mutation, while
    // recycling old nodes to preserve position and velocity.
    const old = new Map(node.data().map(d => [d.id, d]));
    nodes = nodes.map(d => Object.assign(old.get(d.id) || {}, d));
    links = links.map(d => Object.assign({}, d));

//    console.log(nodes)
//    console.log(node)
    link = link
        .data(links, d => [d.source, d.target])
        .join("line");

    node = node
        .data(nodes, d => d.id)
        .join(enter => enter.append("g")
        .attr("class", "circleGroup"));
              
    node.append("circle")
        .attr("r", fixedRadius)
        .attr("fill", d => colorScale(d.color))
        .attr("stroke", "white")
        .attr("stroke-width", "1.25px")
        .attr('opacity', 0.95)
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)
        .call(drag(simulation));
//    console.log(node)
    
    node.append("text")
        .attr("class", "circleText")
        .text(d => d.full_name)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")

      simulation.nodes(nodes);
      simulation.force("link").links(links);
      simulation.alpha(1).restart();
    }


const button = document.querySelector("button");
draw_index = 0;
draw_funcs = [draw1, draw2];
button.addEventListener("click", () => advance_draw());

function advance_draw()
    {
        draw_funcs[draw_index % draw_funcs.length]();
        draw_index++;
        return draw_index;
    }

function draw1(){
    update(dataset);
}

function draw2(){
        update(dataset2);
}


function mouseOver(event, d){
//    console.log(event);
//    console.log(d);
    tooltip.transition()		
                .duration(200)		
                .style("opacity", .95);
    tooltip.html(
            "<strong>" + d.full_name + "</strong><br>")
                .style('top', event.pageY - 12 + 'px')
                .style('left', (event.pageX + 20 > innerWidth - 100 ?
                                innerWidth - 100 : event.pageX + 20) + 'px')
        };

function mouseOut(d){
    tooltip.transition()		
        .duration(200)
        .style("opacity", 0);
}
    




const outerHeight = 800;
const outerWidth = 900;
const fixedRadius = 12;
const linkWidthFactor = 1.25;
var color_metric = 'degree_cent';   
var highlightStrokeColor = 'white';
var marked_nodes = new Set();

datasets = [phase1, phase2, phase3, phase4, phase5,
            phase6, phase7, phase8, phase9, phase10, phase11];

const svg = d3.select("#vis-canvas").append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", [-outerWidth / 2, -outerHeight / 2, outerWidth, outerHeight])
            .classed("svg-content", true);
            
const margin = {top:30, right:30, left:20, bottom:30}
const innerHeight = outerHeight - margin.top - margin.bottom;
const innerWidth = outerWidth - margin.left - margin.right;

//var tooltip = d3.select("#vis-canvas").append("div")	
var tooltip = d3.select("body").append("div")	
    .attr("class", "tooltip")
    .style("opacity", 0);

// ### would forceX and forceY be better than center?
const simulation = d3.forceSimulation()
        .force("charge", d3.forceManyBody()
               .strength(-250)
               .distanceMax(200))
        .force("link", d3.forceLink().id(d => d.id)
            .distance(d => 30 + 42/d.weight))
        .force("center", d3.forceCenter().strength(.05))
        .force("collision", d3.forceCollide().radius(fixedRadius+3))
// slow down?  ref https://stackoverflow.com/questions/52194044/d3-force-make-nodes-move-slower-on-position-update
//            .alphaDecay(.001)
//            .velocityDecay(0.8)
        .on("tick", ticked);

let link = svg.append("g")
      .attr("stroke", "#3d3d3d")
      .attr("stroke-width", 1.25)
    .selectAll("line");

// node group is specified second, so it goes on top of link
let node = svg.append("g")
    .selectAll(".circleGroup");


function ticked() {
    // transform instead of cy, because the node is a 'g'
    // (containing both the node and its label)
    node.attr("transform", function(d) { 
        xConstrained = (d.x < -outerWidth/2 + fixedRadius) ? 
            -outerWidth/2 + fixedRadius : d.x;
        xConstrained = (xConstrained > outerWidth/2 - fixedRadius) ?
            outerWidth/2 - fixedRadius : xConstrained;
        yConstrained = (d.y < -outerHeight/2 + fixedRadius) ? 
            -outerHeight/2 + fixedRadius : d.y;
        yConstrained = (yConstrained > outerHeight/2 - fixedRadius) ?
            outerHeight/2 - fixedRadius : yConstrained;
        return `translate(${xConstrained}, ${yConstrained})`; })

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

    // ###TODO: link labels?
    link = link
        .data(links, d => [d.source, d.target])
        .join("line")
        .attr("stroke-width", d => `${Math.sqrt(d.weight) * linkWidthFactor}px`);

    node = node
        .data(nodes, d => d.id)
        .join(enter => enter.append("g")
        .attr("class", "circleGroup"));

    node.append("circle")
        .attr("r", fixedRadius)
        .attr('opacity', 0.95)
        .on('mouseover', mouseOver)
        .on('mouseout', mouseOut)
        .on('contextmenu', nodeRightClick)
        .call(drag(simulation));
    
    updateNodeColor();
    updateNodeStrokes();

    node.append("text")
        .attr("class", "circleText")
        .text(d => d.id)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")

      simulation.nodes(nodes);
      simulation.force("link").links(links);
      simulation.alpha(1).restart();
    }


// ** Control Elements

d3.select("#colorButton").on("click", () => updateNodeColor());
d3.select("#outlineBox").on("click", () => updateNodeStrokes());


function updateNodeColor()
    {
        // ref https://stackoverflow.com/questions/29325040/get-value-of-checked-radio-button-using-d3-js
        color_metric = d3.select('input[name="optionsRadios"]:checked').node().value;
        // this should actually be computed from all phases, instead of phase-by-phase
        color_min = d3.min(datasets[phase_index].nodes, d => d[color_metric]);
        color_max = d3.max(datasets[phase_index].nodes, d => d[color_metric]);
        
        colorScale = d3.scaleLinear()
            .domain([color_min, color_max]); // default range is already [0,1]

        // ref https://github.com/d3/d3-scale-chromatic
        d3.selectAll("circle")
//            .attr("fill", d => d3.interpolateSpectral(1 - colorScale(d[color_metric])))
            .attr("fill", d => d3.interpolateRdYlBu(1 - colorScale(d[color_metric])))
    }

function updateHighlighted()
    {
        if (d3.select('input#highlight-on:checked').node())
            {
             d3.selectAll('circle')
                .filter(d => d.key_player)
                .attr("stroke", "red")
                .attr("stroke-width", "1.25px");               
            }
   }

function updateMarked()
    {
        d3.selectAll('circle')
            .filter(d => marked_nodes.has(d.id))
            .attr("stroke", "LimeGreen")
            .attr("stroke-width", "4px");
    }

function updateNodeStrokes()
    {
        d3.selectAll('circle')
            .attr("stroke", "white")
            .attr("stroke-width", "1.25px");
        updateHighlighted();
        updateMarked();
    }


phase_index = -1;
phase_max = datasets.length;

// ### TODO : how to pass parameters directly from listener (in order to consolidate these)?
d3.select("#prev").on("click", () => advance_minus());
d3.select("#next").on("click", () => advance_plus());

function advance_plus() { advance_draw(1) }
function advance_minus() { advance_draw(-1) }

const textPhase1 = "(Hover over key players for information.  Drag nodes to reposition.  Right-click to mark/unmark nodes to track through phases.)"

function advance_draw(amt)
    {
        if ((phase_index + amt < 0) || (phase_index + amt > phase_max-1)) return;
        phase_index += amt;
        update(datasets[phase_index]);
        
        d3.select('#text-content h1')
            .text(`Phase ${phase_index+1}`)
        d3.select('#text-content #text-copy')
            .text(phase_index == 0 ? textPhase1 : '')
        
        d3.select('#prev')
            .style("opacity", phase_index < 1 ? 0 : 100)
        d3.select('#next')
            .style("opacity", phase_index >= phase_max-1 ? 0 : 100)
        
        d3.select('#controls')
            .style("visibility", phase_index < 0 ? 'initial' : 'visible')

        return phase_index;
    }


function mouseOver(event, d){
//    console.log(event);
//    console.log(d);
    
    tooltip.transition()		
                .duration(200)		
                .style("opacity", d.key_player ? .95 : 0);
//        console.log((event.pageY + 1 ) + 'px')

    tooltip.html(
            `<strong>${d.full_name}</strong><br><br>`+
            `<strong>${d.description}</strong>`)
                // ### TODO: these offset computations aren't working with the resizable SVG 
                // ### TODO: also need to constrain y when close to bottom
                .style('top', (event.pageY + .75*fixedRadius) + 'px')
                .style('left', (event.pageX + .75*fixedRadius > innerWidth - 62 ?
                                innerWidth - 62 : event.pageX + .75*fixedRadius) + 'px')
        };

function mouseOut(event, d){
    tooltip.transition()		
        .duration(200)
        .style("opacity", 0);
}

function nodeRightClick(event, d) {
    event.preventDefault();
    
    marked_nodes.has(d.id) ? marked_nodes.delete(d.id) : marked_nodes.add(d.id);
    updateNodeStrokes();
    }



// global variables
const WIDTH = 1000;
const HEIGHT = 600;
const MARGIN = { top: 40, right: 40, bottom: 40, left: 40 };
const SVGID = "#plot";

// helper functions
function getSVG() {
  // create an SVG element with the specified width and height
  const svg = d3.select(SVGID)
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
    .style("overflow", "hidden");

  // clear the SVG element
  svg.selectAll("*").remove();

  // add a clip path to prevent data points from overflowing the plot area
  svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("x", MARGIN.left)
      .attr("y", MARGIN.top)
      .attr("width", WIDTH - MARGIN.left - MARGIN.right)
      .attr("height", HEIGHT - MARGIN.top - MARGIN.bottom);

  // add a background rectangle to the SVG element
  svg.append("rect")
    .attr("x", MARGIN.left)
    .attr("y", MARGIN.top)
    .attr("width", WIDTH - MARGIN.left - MARGIN.right)
    .attr("height", HEIGHT - MARGIN.top - MARGIN.bottom)
    .attr("fill", "#f0f0f0");
  
  return svg;
}

// data MDS plot function
function dataMDSPlot() {
  Promise.all([
    d3.json("/api/data/mds"),
  ]).then(([data]) => {
    // check if data is returned
    if (!data) {
      throw new Error("No data returned from API.");
    }

    // get the SVG element
    const svg = getSVG();

    // add axis labels
    svg.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${WIDTH / 2}, ${HEIGHT - 10})`)
      .text("2D MDS-X");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(10, ${HEIGHT / 2}) rotate(-90)`)
      .text("2D MDS-Y");

    // add title
    svg.append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${WIDTH / 2}, ${MARGIN.top / 2})`)
      .text("MDS Plot");

    // create scales
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x))
      .range([MARGIN.left, WIDTH - MARGIN.right])
      .nice();
    
    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.y))
      .range([HEIGHT - MARGIN.bottom, MARGIN.top])
      .nice();
    
    // create color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // add axis
    const gX = svg.append("g")
      .attr("transform", `translate(0, ${HEIGHT - MARGIN.bottom})`)
      .call(d3.axisBottom(x).tickSize(-HEIGHT + MARGIN.top + MARGIN.bottom).tickFormat(''));

    const gY = svg.append("g")
      .attr("transform", `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(y).tickSize(-WIDTH + MARGIN.left + MARGIN.right).tickFormat(''));

    // add grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0, ${HEIGHT - MARGIN.bottom})`)
      .call(d3.axisBottom(x)
        .tickSize(-HEIGHT + MARGIN.top + MARGIN.bottom)
        .tickFormat(''))
      .selectAll("line")
        .style("stroke-dasharray", "3,3");

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(y)
        .tickSize(-WIDTH + MARGIN.left + MARGIN.right)
        .tickFormat(''))
      .selectAll("line")
        .style("stroke-dasharray", "3,3");

    // add data points
    const circles = svg.append("g")
      .attr("clip-path", "url(#clip)")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.x))
      .attr("cy", d => y(d.y))
      .attr("r", 3)
      .attr("fill", d => color(d.cluster))
      .on("mouseover", function(_, d) {
        d3.select(this).attr("r", 6); // increase the radius of the circle on hover
        svg.append("text")
          .attr("id", "tooltip")
          .attr("x", x(d.x))
          .attr("y", y(d.y) - 10) // position the text slightly above the circle
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("fill", "black")
          .text(`(${d.x.toFixed(2)}, ${d.y.toFixed(2)})`);
      })
      .on("mouseout", function() {
        d3.select(this).attr("r", 3); // reset the radius of the circle
        d3.select("#tooltip").remove(); // remove the tooltip text
      });

    // zoom function
    function zoomed(event) {
      const transform = event.transform;
      const newX = transform.rescaleX(x);
      const newY = transform.rescaleY(y);

      gX.call(d3.axisBottom(newX));
      gY.call(d3.axisLeft(newY));

      circles
        .attr("cx", d => newX(d.x))
        .attr("cy", d => newY(d.y));

      d3.selectAll("#tooltip")
        .attr("x", d => newX(d.x))
        .attr("y", d => newY(d.y) - 10);
    }

    // apply zoom
    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .extent([[0, 0], [WIDTH, HEIGHT]])
      .on("zoom", zoomed);

    svg.call(zoom);

    // explicitly call the axis rendering functions to ensure they are displayed initially
    gX.call(d3.axisBottom(x));
    gY.call(d3.axisLeft(y));
  }).catch(_ => {
    showAlert("Failed to draw MDS plot.", "danger");
  });
}

// variables MDS plot function
function variablesDMSPlot() {
  Promise.all([
    d3.json("/api/data/mds/variables"),
  ]).then(([data]) => {
    // check if data is returned
    if (!data) {
      throw new Error("No data returned from API.");
    }

    // get the SVG element
    const svg = getSVG();

    // add axis labels
    svg.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${WIDTH / 2}, ${HEIGHT - 10})`)
      .text("MDS-1");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(10, ${HEIGHT / 2}) rotate(-90)`)
      .text("MDS-2");

    // add title
    svg.append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${WIDTH / 2}, ${MARGIN.top / 2})`)
      .text("Variables MDS Plot");

    // create scales
    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => d.MDS1))
      .range([MARGIN.left, WIDTH - MARGIN.right])
      .nice();
    
    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => d.MDS2))
      .range([HEIGHT - MARGIN.bottom, MARGIN.top])
      .nice();
    
    // create color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // add axis
    const gX = svg.append("g")
      .attr("transform", `translate(0, ${HEIGHT - MARGIN.bottom})`)
      .call(d3.axisBottom(x).tickSize(-HEIGHT + MARGIN.top + MARGIN.bottom).tickFormat(''));

    const gY = svg.append("g")
      .attr("transform", `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(y).tickSize(-WIDTH + MARGIN.left + MARGIN.right).tickFormat(''));

    // add grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0, ${HEIGHT - MARGIN.bottom})`)
      .call(d3.axisBottom(x)
        .tickSize(-HEIGHT + MARGIN.top + MARGIN.bottom)
        .tickFormat(''))
      .selectAll("line")
        .style("stroke-dasharray", "3,3");

    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${MARGIN.left}, 0)`)
      .call(d3.axisLeft(y)
        .tickSize(-WIDTH + MARGIN.left + MARGIN.right)
        .tickFormat(''))
      .selectAll("line")
        .style("stroke-dasharray", "3,3");

    // add data points
    const circles = svg.append("g")
      .attr("clip-path", "url(#clip)")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.MDS1))
      .attr("cy", d => y(d.MDS2))
      .attr("r", 10)
      .attr("fill", d => color(d.variable));

    // append text elements separately
    const labels = svg.append("g")
      .attr("clip-path", "url(#clip)")
      .selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .attr("x", d => x(d.MDS1))
      .attr("y", d => y(d.MDS2) - 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .attr("fill", "black")
      .text(d => `${d.variable}: (${d.MDS1.toFixed(2)}, ${d.MDS2.toFixed(2)})`);

    // zoom function
    function zoomed(event) {
      const transform = event.transform;
      const newX = transform.rescaleX(x);
      const newY = transform.rescaleY(y);

      gX.call(d3.axisBottom(newX));
      gY.call(d3.axisLeft(newY));

      circles
        .attr("cx", d => newX(d.MDS1))
        .attr("cy", d => newY(d.MDS2));

      labels
        .attr("x", d => newX(d.MDS1))
        .attr("y", d => newY(d.MDS2) - 20);

      d3.selectAll("#tooltip")
        .attr("x", d => newX(d.MDS1))
        .attr("y", d => newY(d.MDS2) - 10);
    }

    // apply zoom
    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .extent([[0, 0], [WIDTH, HEIGHT]])
      .on("zoom", zoomed);

    svg.call(zoom);

    // explicitly call the axis rendering functions to ensure they are displayed initially
    gX.call(d3.axisBottom(x));
    gY.call(d3.axisLeft(y));
  }).catch(e => {
    console.error(e);
    showAlert("Failed to draw variables MDS plot.", "danger");
  });
}

// parallel coordinates plot variables
var orderBy = [];

// parallel coordinates plot function
function pcpPlot(orderType='original') {
  Promise.all([
    d3.json("/api/data"),
    d3.json(`/api/data/columns?order_type=${orderType}&order_by=${orderBy}`),
  ]).then(([data, columns]) => {
    // check if data is returned
    if (!data || !columns) {
      throw new Error("No data returned from API.");
    }

    // empty the orderByList
    orderBy = [];

    // create an SVG element with the specified width and height
    const svg = getSVG();

    // set dimensions and margins for the plot
    const margin = MARGIN;
    const width = WIDTH - margin.left - margin.right;
    const height = HEIGHT - margin.top - margin.bottom;

    // create a color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // extract the list of dimensions and create a scale for each
    const dimensions = columns.filter(d => d !== "cluster");
    const y = {};
    for (const dim of dimensions) {
      if (typeof data[0][dim] === 'number') {
        y[dim] = d3.scaleLinear()
          .domain(d3.extent(data, d => +d[dim]))
          .range([height, 0]);
      } else {
        y[dim] = d3.scalePoint()
          .domain(data.map(d => d[dim]).filter((v, i, a) => a.indexOf(v) === i))
          .range([height, 0]);
      }
    }

    // create an x scale for the dimensions
    const x = d3.scalePoint()
      .range([0, width])
      .padding(1)
      .domain(dimensions);

    // add the polylines for each data point
    svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .selectAll("path")
      .data(data)
      .enter().append("path")
      .attr("d", d => {
        return d3.line()(dimensions.map(p => {
          if (y[p] && d !== undefined && d[p] !== undefined) {
            return [x(p), y[p](d[p])];
          }
          return [x(p), null];
        }));
      })
      .style("fill", "none")
      .style("stroke", d => color(d.cluster))
      .style("opacity", 0.5);

    // add an axis and title for each dimension
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .selectAll(".dimension")
      .data(dimensions)
      .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", d => `translate(${x(d)})`)

    // add an axis and title for each dimension
    g.each(function(d) {
      d3.select(this).call(d3.axisLeft(y[d]));
    })
    .append("text")
      .style("text-anchor", "middle")
      .style("cursor", "pointer")
      .attr("y", (_, i) => i % 2 === 0 ? -20 : height + 20)
      .text(d => d.length > 10 ? d.slice(0, 10) + '..' : d)
      .style("fill", "black")
      .on("click", function(_, d) {
        if (!orderBy.includes(d)) {
          orderBy.push(d);
        } else {
          orderBy = orderBy.filter(item => item !== d);
        }

        d3.selectAll(".dimension text")
          .text(d => {
            let placeholder = d.length > 10 ? d.slice(0, 10) + '..' : d;
            return orderBy.includes(d) ? `${placeholder} (${orderBy.indexOf(d) + 1})` : placeholder; 
          })
          .style("fill", function(dim) {
            return orderBy.includes(dim) ? "red" : "black";
          });
      });
  }).catch(_ => {
    showAlert("Failed to draw parallel coordinates plot.", "danger");
  });
}

// creating a map variable to reference the plot functions
var plots = {
  'data-mds': dataMDSPlot,
  'variables-mds': variablesDMSPlot,
  'pcp': pcpPlot
};

// plot function that takes a name and calls a plot function based on the name
function plot(name) {
  document.getElementById('pcp-setting').style.display = name === 'pcp' ? 'block' : 'none';
  document.querySelectorAll('.pcp-settings').forEach(el => {
    el.style.display = name === 'pcp' ? 'block' : 'none';
  });
  plots[name]();
}

// add an event listener to the plot type dropdown to call the plot function
document.getElementById('plot-type').addEventListener('change', function() {
  plot(this.value);
});

// initial plot call
plot(document.getElementById('plot-type').value);

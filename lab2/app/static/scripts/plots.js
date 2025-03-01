// Set up the dimensions and margins of the plot
const width = 800;
const height = 600;
const margin = { top: 40, right: 40, bottom: 60, left: 60 };

// Set up global variables
let scaleLevel = 0.5;
let selectedPCAs = [];
let selectedComponents = [];

let currentPCAs = [];
let loadings = null;
let principalComponents = null;

// --- Helper Functions ---
/**
 * Increase the scale level of the PCA biplot.
 */
function incScale() {
  scaleLevel += 0.5;
  plotPCA(currentPCAs);
}

/**
 * Decrease the scale level of the PCA biplot.
 */
function decScale() {
  if (scaleLevel <= 0.5) return;
  scaleLevel -= 0.5;
  plotPCA(currentPCAs);
}

/**
 * Return the SVG element by Id.
 * @param {String} id 
 * @returns svg element
 */
function getSVG(id) {
  const svg = d3.select(id);
  svg.selectAll("*").remove();
  svg.attr("width", width).attr("height", height).style("overflow", "hidden");

  return svg
}

/**
 * Get the index of the item in the list.
 * @param {Array} list 
 * @param {Number} item 
 * @returns index of the item in the list
 */
function getIndex(list, item) {
  return list.findIndex(d => parseFloat(d.toFixed(2)) === parseFloat(item.toFixed(2)));
}

/**
 * Add or remove the selected component from the list.
 * @param {Number} component
 */
function addToSelectedComponents(component) {
  if (selectedComponents.includes(component)) {
    selectedComponents = selectedComponents.filter(c => c !== component);
  } else {
    selectedComponents.push(component);
  }
}

/**
 * Fetch the loadings and principal components for the selected components.
 * @param {Array} components
 */
async function fetchLoadings(components) {
  loadings = await d3.json(`/api/loadings?components=${components.join(",")}`);
  principalComponents = await d3.json(`/api/principalcomponents?components=${components.join(",")}`);
}

/**
 * Get the loadings and principal components for the selected components.
 */
async function getComponents() {
  let components = [];
  if (selectedComponents.length >= 2) {
    components = selectedComponents.sort((a, b) => a - b).slice(0, 2);
  } else if (selectedComponents.length === 1) {
    components = [1, selectedComponents[0]];
  } else {
    components = [1, 2];
  }

  // convert them to PC{i}
  components = components.map(c => `PC${c}`);
  currentPCAs = components;

  // fetch the loadings and principal components
  await fetchLoadings(components);

  return components;
}

// --- Plot Functions ---
/**
 * Plots the eigenvalues of our sampled dataset.
 */
async function plotEigenvalues() {
  Promise.all([
    d3.json('/api/eigenvectors'),
    d3.json('/api/elbowindex')
  ]).then(([eigenvectors, ei]) => {
    // extract eigenvalues from the response
    const eigenvalues = eigenvectors.eigenvalues;
    const elbowIndex = ei.elbow_index;
    
    // get the SVG element and set its dimensions
    const svg = getSVG("#plot");
    
    // create a group element for the chart content and apply margin transformation
    const chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // define scales
    const xScale = d3.scaleLinear()
      .domain([0, eigenvalues.length - 1])
      .range([0, width - margin.left - margin.right]);
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(eigenvalues) * 1.1])
      .range([height - margin.top - margin.bottom, 0])
      .nice();
    
    // define axes
    const xAxis = d3.axisBottom(xScale).ticks(eigenvalues.length).tickFormat(d => `λ${d + 1}`);
    const yAxis = d3.axisLeft(yScale);

    // append and position x-axis label
    chartGroup.append("text")
      .attr("transform", `translate(${(width - margin.left - margin.right) / 2}, ${height - margin.bottom})`)
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .text("Intrinsic Dimensionality Index");
      
    // append and position y-axis label
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .text("Eigenvalue");
    
    // add grid lines
    chartGroup.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat("")
        .ticks(10)
      );
    
    // add grid lines for x-axis
    chartGroup.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height + margin.top + margin.bottom)
        .tickFormat("")
        .ticks(eigenvalues.length)
      );
    
    // add title
    chartGroup.append("text")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("class", "title")
      .text("Eigenvalues of the Sampled Dataset");
    
    // append and position x-axis
    chartGroup.append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(xAxis);
    
    // append and position y-axis
    chartGroup.append("g")
      .call(yAxis);
    
    // define line generator
    const line = d3.line()
      .x((_, i) => xScale(i))
      .y(d => yScale(d))
      .curve(d3.curveMonotoneX);
    
    // add line path
    chartGroup.append("path")
      .datum(eigenvalues)
      .attr("fill", "none")
      .attr("class", "line")
      .attr("stroke", "#006de1")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // add circles for data points
    chartGroup.selectAll(".eigen-circle")
      .data(eigenvalues)
      .enter()
      .append("circle")
      .attr("class", "eigen-circle")
      .attr("cx", (_, i) => xScale(i))
      .attr("cy", d => yScale(d))
      .attr("r", 8)
      .attr("fill", "#006de1")
      .style("cursor", "pointer")
      .on("click", (_, i) => onSelectedAction(i));

    // add data labels
    chartGroup.selectAll(".data-label")
      .data(eigenvalues)
      .enter()
      .append("text")
      .attr("class", "data-label")
      .attr("x", (_, i) => xScale(i))
      .attr("y", d => yScale(d) + 2)  // position below points
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .attr("font-size", "6px")
      .style("cursor", "pointer")
      .text((d, _) => `${d.toFixed(2)}`)
      .on("click", (_, i) => onSelectedAction(i));
    
    // add a group element for the vertical lines
    const verticalLinesGroup = chartGroup.append("g").attr("class", "vertical-lines");
    
    // function to handle click on data points
    function onSelectedAction(i) {
      selectedIndex = i;

      // loop over the selectedPCAs, if the index is there delete it, else add the selected item
      if (selectedPCAs.includes(i)) {
        selectedPCAs = selectedPCAs.filter(index => index !== i);
      } else {
        if (selectedPCAs.length == 2) { return; }
        selectedPCAs.push(i);
      }

      // update selected components
      addToSelectedComponents(getIndex(eigenvalues, i)+1);

      // update vertical lines
      const lines = verticalLinesGroup.selectAll("line").data(selectedPCAs, d => d);

      // remove old lines
      lines.exit().remove();

      // add new lines
      lines.enter()
        .append("line")
        .attr("class", "line")
        .attr("x1", d => xScale(getIndex(eigenvalues, d)))
        .attr("y1", d => yScale(d) + 11)
        .attr("x2", d => xScale(getIndex(eigenvalues, d)))
        .attr("y2", yScale(0))
        .attr("stroke", "#006de1")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

      // highlight selected point and reset others
      d3.selectAll(".eigen-circle").attr("fill", (d, _) => (selectedPCAs.includes(d) ? "#a12500" : "#006de1"));
      d3.selectAll(".eigen-circle").attr("r", (d, _) => (selectedPCAs.includes(d) ? 12 : 8));
      d3.selectAll(".data-label").attr("font-size", (d, _) => (selectedPCAs.includes(d) ? "10px" : "6px"));

      // call plotPCA
      getComponents().then((c) => plotPCA(c));
    }

    // call onSelectedAction with the elbow index
    onSelectedAction(eigenvalues[elbowIndex]);
  }).catch(error => {
    console.error("Error fetching eigenvalues:", error);
    showAlert("Failed to fetch eigenvalues.", "danger")}
  );
}

/**
 * Plots the PCA biplot of our sampled dataset.
 * @param {Array} components
 */
async function plotPCA(components) {
  const eigenvectors = loadings.loadings;
  const dataPoints = principalComponents.principal_components;

  // get the SVG element and set its dimensions
  const tmp = getSVG("#biplot");
  tmp.append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", margin.left)
    .attr("y", margin.top)
    .attr("width", width - margin.left - margin.right)
    .attr("height", height - margin.top - margin.bottom);
  
  const svg = tmp.append("g")
    .attr("clip-path", "url(#clip)");

  // calculate the domain based on the data points
  const xExtent = d3.extent(dataPoints, d => d[1] * scaleLevel);
  const yExtent = d3.extent(dataPoints, d => d[2] * scaleLevel);

  // ensure the center is at (0, 0)
  const xDomain = [Math.min(xExtent[0], -xExtent[1]), Math.max(xExtent[1], -xExtent[0])];
  const yDomain = [Math.min(yExtent[0], -yExtent[1]), Math.max(yExtent[1], -yExtent[0])];

  const xScale = d3.scaleLinear().domain(xDomain).range([margin.left, width - margin.right]).nice();
  const yScale = d3.scaleLinear().domain(yDomain).range([height - margin.bottom, margin.top]).nice();
  
  // axes
  tmp.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale));
  tmp.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale));

  // add grid lines
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale)
      .tickSize(-width + margin.left + margin.right)
      .tickFormat("")
      .ticks(20)
    );
  
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale)
      .tickSize(-height + margin.top + margin.bottom)
      .tickFormat("")
      .ticks(20)
    );

  // add title
  tmp.append("text")
    .attr("x", (width / 2))
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("class", "title")
    .text("PCA Biplot of the Sampled Dataset");

  // add axis labels
  tmp.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom / 4)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text(components[0]);
  
  tmp.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", margin.left / 4)
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text(components[1]);

  // plot data points
  svg.selectAll(".pca-point")
    .data(dataPoints)
    .enter()
    .append("circle")
    .attr("class", "pca-point")
    .attr("cx", d => xScale(d[1]))
    .attr("cy", d => yScale(d[2]))
    .attr("r", 4)
    .style("fill", "steelblue")
    .style("opacity", 0.6)
    .on("mouseover", function(_, d) {
      // append a group to hold the tooltip elements
      let tooltip = svg.append("g")
        .attr("class", "popup");

      // append a rectangle for background
      tooltip.append("rect")
        .attr("x", xScale(d[1]) - 15)
        .attr("y", yScale(d[2]) - 15)
        .attr("width", 60)
        .attr("height", 15)
        .attr("fill", "#222")
        .attr("stroke", "#ccc")
        .attr("rx", 5) // rounded corners
        .attr("ry", 5)
        .style("pointer-events", "none"); // prevent blocking mouse events

      // append text inside the rectangle
      tooltip.append("text")
        .attr("x", xScale(d[1]) + 15)
        .attr("y", yScale(d[2]) - 5)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("fill", "#fff")
        .text(`(${d[1].toFixed(2)}, ${d[2].toFixed(2)})`);
    })
    .on("mouseout", function() {
      svg.selectAll(".popup").remove();
    });
  
  // define arrowhead marker
  svg.append("defs")
    .append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "-0 -5 10 10")
    .attr("refX", 5)
    .attr("refY", 0)
    .attr("orient", "auto")
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .append("path")
    .attr("id", "arrowhead-path")
    .attr("d", "M0,-5L10,0L0,5")
    .style("fill", "red");

  // plot eigenvector arrows
  svg.selectAll(".arrow")
    .data(eigenvectors)
    .enter()
    .append("line")
    .attr("class", "arrow")
    .attr("x1", xScale(0))
    .attr("y1", yScale(0))
    .attr("x2", d => xScale(d[1] * 10))
    .attr("y2", d => yScale(d[2] * 10))
    .style("stroke", "red")
    .style("stroke-width", 2)
    .attr("marker-end", "url(#arrowhead)");

  // add feature labels
  svg.selectAll(".label")
    .data(eigenvectors)
    .enter().append("text")
    .attr("class", "label")
    .attr("x", d => xScale(d[1] * 10) + 10)
    .attr("y", d => yScale(d[2] * 10) - 10)
    .text(d => `${d[0]} (${(d[1] * 10).toFixed(2)}, ${(d[2] * 10).toFixed(2)})`)
    .style("font-size", "8px")
    .style("text-anchor", "middle");
}

/**
 * Plots the scatter matrix of our sampled dataset using 4 top PCA attributes.
 */
async function plotScatterMatrix() {
  Promise.all([
    d3.json('/api/pcaattributesdata')
  ]).then(([atr]) => {
    const data = atr.data;

    // initialize subplot dimensions
    const size = 150; // subplot size
    const padding = 20;
    const columns = data[0].length;

    // get the SVG element and set its dimensions
    const svg = getSVG("#scatter");

    // create scales for each attribute
    const xScales = Array.from({ length: columns }, (_, i) =>
      d3.scaleLinear()
        .domain(d3.extent(data, d => d[i]))
        .range([padding, size - padding])
        .nice()
    );
    
    const yScales = xScales;

    // color scale for points (optional grouping by category)
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // create a group for all scatterplots
    const cellGroup = svg.append("g");

    // store all points globally for brushing
    const allPoints = [];

    // create scatter plots in a grid
    for (let colX = 0; colX < columns; colX++) {
      for (let colY = 0; colY < columns; colY++) {
        const g = cellGroup.append("g")
          .attr("transform", `translate(${colX * size}, ${colY * size})`);

        // Add scatterplot points
        const points = g.selectAll(".pca-point")
          .data(data)
          .enter()
          .append("circle")
          .attr("class", "pca-point")
          .attr("cx", d => xScales[colX](d[colX]))
          .attr("cy", d => yScales[colY](d[colY]))
          .attr("r", 4) // Adjust point size
          .attr("fill", d => colorScale(d.group || colX)) // Optional color coding by group
          .attr("fill-opacity", 0.7); // Transparency for overlapping points

        allPoints.push(points);

        // Add brushing functionality
        const brush = d3.brush()
          .extent([[0, 0], [size, size]])
          .on("start brush end", brushed);

        g.append("g")
          .attr("class", "brush")
          .call(brush);

        function brushed(event) {
          if (!event.selection) {
            allPoints.forEach(selection => selection.classed("hidden", false));
            return;
          }

          const [[x0, y0], [x1, y1]] = event.selection;

          allPoints.forEach(selection =>
            selection.classed("hidden", d =>
              xScales[colX](d[colX]) < x0 || xScales[colX](d[colX]) > x1 ||
              yScales[colY](d[colY]) < y0 || yScales[colY](d[colY]) > y1
            )
          );
        }

        // Add axes
        g.append("g")
          .attr("transform", `translate(0,${size - padding})`)
          .call(d3.axisBottom(xScales[colX]).ticks(5));

        g.append("g")
          .attr("transform", `translate(${padding},0)`)
          .call(d3.axisLeft(yScales[colY]).ticks(5));

        // Add axis labels on the diagonal plots
        if (colX === colY) {
          g.append("text")
            .attr("class", "axis-label")
            .attr("x", size / 2)
            .attr("y", size / 2)
            .text(`Attr ${colX + 1}`);
        }
      }
    }
  }).catch(error => {
    console.error("Error fetching scatter matrix:", error);
    showAlert("Failed to fetch scatter matrix.", "danger");
  });
}

// --- Initialization ---
plotEigenvalues();
getComponents().then((c) => plotPCA(c));
plotScatterMatrix();

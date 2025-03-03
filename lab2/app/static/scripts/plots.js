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
let dimensionality_index = 3;

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
  loadings = await d3.json(`/api/pca/loadings?components=${components.join(",")}`);
  principalComponents = await d3.json(`/api/pca?components=${components.join(",")}`);
}

/**
 * Get the loadings and principal components for the selected components.
 */
async function getComponents() {
  let components = [];
  if (selectedComponents.length >= 2) {
    components = selectedComponents.sort((a, b) => a - b).slice(0, 2);
  } else if (selectedComponents.length === 1) {
    if (selectedComponents[0] === 1) {
      components = [1, 2];
    } else {
      components = [1, selectedComponents[0]];
    }
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
    d3.json('/api/pca/eigenvectors'),
    d3.json('/api/pca/elbow')
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
      // check if the change-di checkbox is checked
      const changeDiCheckbox = document.getElementById("change-di");
      if (changeDiCheckbox.checked) {
        // change the color of dimensionality index to orange
        d3.selectAll(".eigen-circle").attr("fill", (d, _) => (d === i ? "orange" : "#006de1"));
        d3.selectAll(".eigen-circle").attr("r", (d, _) => (d === i ? 12 : 8));
        d3.selectAll(".data-label").attr("font-size", (d, _) => (d === i ? "10px" : "6px"));

        // change the intrinsic dimensionality index
        dimensionality_index = getIndex(eigenvalues, i);
        plotTable();
        plotScatterMatrix();

        return;
      }

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
    dimensionality_index = elbowIndex;
    
    // change the color of dimensionality index to orange
    d3.selectAll(".eigen-circle").attr("fill", (d, _) => (d === eigenvalues[elbowIndex] ? "orange" : "#006de1"));
    d3.selectAll(".eigen-circle").attr("r", (d, _) => (d === eigenvalues[elbowIndex] ? 12 : 8));
    d3.selectAll(".data-label").attr("font-size", (d, _) => (d === eigenvalues[elbowIndex] ? "10px" : "6px"));
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
 * Plots the table of PCA attributes.
 */
async function plotTable() {
  // fetch the PCA attributes
  const response = await fetchDataFromAPI(`/api/pca/attributes?dimensionality_index=${dimensionality_index+1}`);
  if (!response) {
    showAlert("Failed to fetch PCA attributes.", "danger");
    return
  }

  const attributes = response.attributes;
  const table = document.getElementById("attributes");

  // clear the table rows but keep the heaeders
  table.querySelectorAll("tr").forEach((row, i) => {
    if (i !== 0) {
      row.remove();
    }
  });

  // insert attributes into the table with attribute[0] as first cell and attribute[1] as second cell
  attributes.forEach(attribute => {
    const row = table.insertRow();
    const cell1 = row.insertCell(0);
    const cell2 = row.insertCell(1);
    cell1.innerHTML = attribute[0];
    cell2.innerHTML = attribute[1];
  });
}

async function plotScatterMatrix() {
  try {
    // Fetch data from API endpoints
    const [atr, vars] = await Promise.all([
      d3.json(`/api/pca/attributes/data?dimensionality_index=${dimensionality_index+1}`),
      d3.json(`/api/pca/attributes?dimensionality_index=${dimensionality_index+1}`)
  ]);

  const data = atr.data;
  const attributes = vars.attributes;

  // Transform data into object format
  const observations = data.map((d, i) => {
      const observation = {};
      attributes.forEach((attr, j) => {
          observation[attr] = d[j];
      });
      return observation;
  });

  // Visualization parameters
  const size = 150; // Increased size for better visibility
  const margin = { top: 100, right: 40, bottom: 40, left: 60 };
  const width = size - 20;
  const height = size - 20;

  // Clear the matrix element
  d3.select("#matrix").selectAll("*").remove();

  // Create SVG container
  const svg = d3.select("#matrix").append("svg")
      .attr("width", size * attributes.length + margin.left + margin.right)
      .attr("height", size * attributes.length + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Add SVG title
  svg.append("text")
      .attr("x", (size * attributes.length) / 2)
      .attr("y", -80)
      .attr("text-anchor", "middle")
      .attr("class", "title")
      .text("Scatter Matrix of PCA Attributes");

  // Define variables and scales
  const variables = attributes;
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);  // Use D3's color scheme for distinct colors

  const xScales = {};
  const yScales = {};

  variables.forEach((v) => {
      const values = observations.map(d => d[v]);
      const min = d3.min(values);
      const max = d3.max(values);

      xScales[v] = d3.scaleLinear()
          .domain([min, max])
          .range([0, width])
          .nice();

      yScales[v] = d3.scaleLinear()
          .domain([min, max])
          .range([height, 0])
          .nice();
  });

  // Create grid cells
  const cell = svg.selectAll(".cell")
      .data(d3.cross(variables, variables))
      .enter().append("g")
      .attr("class", "cell")
      .attr("transform", d => `translate(${variables.indexOf(d[0]) * size},${variables.indexOf(d[1]) * size})`);

  // Add grid lines
  cell.each(function ([xVar, yVar]) {
      const cellGroup = d3.select(this);

      // X-axis grid
      cellGroup.append("g")
          .attr("class", "grid")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(xScales[xVar]).ticks(4).tickSize(-height).tickFormat(""));

      // Y-axis grid
      cellGroup.append("g")
          .attr("class", "grid")
          .call(d3.axisLeft(yScales[yVar]).ticks(4).tickSize(-width).tickFormat(""));
  });

  // Add axes
  cell.each(function ([xVar, yVar]) {
      const idxX = variables.indexOf(xVar);
      const idxY = variables.indexOf(yVar);

      // X-axis (top row)
      if (idxY === 0 && idxX % 2 === 0) {
          d3.select(this).append("g")
              .call(d3.axisTop(xScales[xVar]).ticks(4));
      }

      // X-axis (bottom row)
      if (idxY === variables.length - 1 && idxX % 2 === 1) {
          d3.select(this).append("g")
              .attr("transform", `translate(0,${height})`)
              .call(d3.axisBottom(xScales[xVar]).ticks(4));
      }

      // Y-axis (first column)
      if (idxX === 0 && idxY % 2 === 0) {
          d3.select(this).append("g")
              .call(d3.axisLeft(yScales[yVar]).ticks(4));
      }

      // Y-axis (second column)
      if (idxX === variables.length - 1 && idxY % 2 === 1) {
          d3.select(this).append("g")
              .attr("transform", `translate(${width},0)`)
              .call(d3.axisRight(yScales[yVar]).ticks(4));
      }
  });

  // Add points with different colors for variables
  cell.each(function ([xVar, yVar]) {
      d3.select(this).selectAll(".point")
          .data(observations)
          .enter().append("circle")
          .attr("class", "point")
          .attr("cx", d => xScales[xVar](d[xVar]))
          .attr("cy", d => yScales[yVar](d[yVar]))
          .attr("r", 3)
          .style("fill", colorScale(xVar+yVar)); // Assign color based on index
  });

  // Define the brush
  const brush = d3.brush()
      .extent([[0, 0], [width, height]])
      .on("start brush", brushed)
      .on("end", brushended);

  // Add the brush to each cell
  cell.call(brush);

  // Brush event handler
  function brushed(event) {
      if (event.selection === null) return;

      const [[x0, y0], [x1, y1]] = event.selection;

      cell.selectAll(".point")
          .style("opacity", function(d) {
              const cx = xScales[d3.select(this.parentNode).datum()[0]](d[d3.select(this.parentNode).datum()[0]]);
              const cy = yScales[d3.select(this.parentNode).datum()[1]](d[d3.select(this.parentNode).datum()[1]]);
              return (x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1) ? 1 : 0.1;
          });
  }

  // Brush end event handler
  function brushended(event) {
      if (event.selection === null) {
          cell.selectAll(".point").style("opacity", 1);
      }
  }

  // Add titles for each column and row
  variables.forEach((v, i) => {
      svg.append("text")
          .attr("class", "axis-label")
          .attr("text-anchor", "middle")
          .attr("x", i * size + width / 2)
          .attr("y", -40) // Above the top row
          .text(v[0]);

      svg.append("text")
          .attr("class", "axis-label")
          .attr("text-anchor", "middle")
          .attr("transform", `translate(-40,${i * size + height / 2}) rotate(-90)`) // Rotate for row titles
          .text(v[0]);
  });
  } catch (error) {
    console.error("Error:", error);
    showAlert("Failed to load scatter matrix.", "danger");
  }
}

let kmean_index = null;

/**
 * Plots the MSE of clusters.
 */
async function plotMSE() {
  try {
    const response = await d3.json('/api/kmeans/mse');
    const mseData = response.mse;

    const response2 = await d3.json('/api/kmeans/bestk');
    const bestK = response2.best_k;

    // get the SVG element and set its dimensions
    const svg = getSVG("#kmse");

    // create a group element for the chart content and apply margin transformation
    const chartGroup = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // define scales
    const xScale = d3.scaleBand()
      .domain(mseData.map(d => d[0]))
      .range([0, width - margin.left - margin.right])
      .padding(0.1);
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(mseData, d => d[1])])
      .range([height - margin.top - margin.bottom, 0])
      .nice();

    // define axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d => `k=${d}`);
    const yAxis = d3.axisLeft(yScale);

    // append and position x-axis
    chartGroup.append("g")
      .attr("transform", `translate(0,${height - margin.top - margin.bottom})`)
      .call(xAxis);

    // append and position y-axis
    chartGroup.append("g")
      .call(yAxis);

    // add grid lines
    chartGroup.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat("")
        .ticks(10)
      );

    // append title
    chartGroup.append("text")
      .attr("x", (width - margin.left - margin.right) / 2)
      .attr("y", -20)
      .attr("text-anchor", "middle")
      .attr("class", "title")
      .text("Mean Squared Error of Clusters");

    // append and position x-axis label
    chartGroup.append("text")
      .attr("transform", `translate(${(width - margin.left - margin.right) / 2}, ${height - margin.bottom})`)
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .text("k-means");

    // append and position y-axis label
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .text("MSE");

    // add bars
    chartGroup.selectAll(".bar")
      .data(mseData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d[0]))
      .attr("y", d => yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - margin.top - margin.bottom - yScale(d[1]))
      .attr("fill", "#006de1")
      .style("cursor", "pointer")
      .on("click", (_, d) => onSelectedBar(d[0]));

    // function to handle click on bars
    function onSelectedBar(cluster) {
      kmean_index = cluster;

      // highlight selected bar and reset others
      d3.selectAll(".bar").attr("fill", d => (d[0] === cluster ? "orange" : "#006de1"));

      // call plotClusters
      plotClusters(cluster);
    }

    // call onSelectedBar with the best K
    kmean_index = bestK;
    onSelectedBar(bestK);
  } catch (error) {
    console.error("Error fetching MSE data:", error);
    showAlert("Failed to fetch MSE data.", "danger");
  }
}

async function plotClusters(k) {
  try {
    // Fetch data from API endpoints
    const [kmeansResults, clusterCentersRsp] = await Promise.all([
      d3.json(`/api/kmeans/results?k=${k}`),
      d3.json(`/api/kmeans/centers?k=${k}`)
    ]);

    const dataPoints = kmeansResults.map(d => ({
      coordinates: JSON.parse(d.coordinates),
      cluster_id: d.cluster_id
    }));

    const centers = clusterCentersRsp.centers.map(d => ({
      coordinates: d.coordinates,
      cluster_id: d.cluster_id,
      radius: d.radius
    }));

    // Get the SVG element and set its dimensions
    const tmp = getSVG("#clusters");
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

    // Calculate the domain based on the data points
    const xExtent = d3.extent(dataPoints, d => d.coordinates[0]);
    const yExtent = d3.extent(dataPoints, d => d.coordinates[1]);

    // Ensure the center is at (0, 0)
    const xDomain = [Math.min(xExtent[0], -xExtent[1]) * 2, Math.max(xExtent[1], -xExtent[0]) * 2];
    const yDomain = [Math.min(yExtent[0], -yExtent[1]) * 2, Math.max(yExtent[1], -yExtent[0]) * 2];

    const xScale = d3.scaleLinear().domain(xDomain).range([margin.left, width - margin.right]).nice();
    const yScale = d3.scaleLinear().domain(yDomain).range([height - margin.bottom, margin.top]).nice();

    // Define the zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 10])
      .translateExtent([[0, 0], [width, height]])
      .on("zoom", zoomed);

    // Apply the zoom behavior to the SVG element
    tmp.call(zoom);

    // Axes
    const xAxis = tmp.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
    const yAxis = tmp.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Add grid lines
    const gridX = svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat("")
        .ticks(20)
      );

    const gridY = svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height + margin.top + margin.bottom)
        .tickFormat("")
        .ticks(20)
      );

    // Add x-axis label
    tmp.append("text")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom / 4)
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("X");

    // Add y-axis label
    tmp.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", margin.left / 4)
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("Y");

    // Add title
    tmp.append("text")
      .attr("x", (width / 2))
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("class", "title")
      .text("K-Means Clusters Biplot");

    // Plot cluster centers with lower opacity
    const clusterCenters = svg.selectAll(".cluster-center")
      .data(centers)
      .enter()
      .append("circle")
      .attr("class", "cluster-center")
      .attr("cx", d => xScale(d.coordinates[0]))
      .attr("cy", d => yScale(d.coordinates[1]))
      .attr("r", d => d.radius * Math.min(xScale(3) - xScale(0), yScale(0) - yScale(3)))
      .style("fill", d => d3.schemeCategory10[d.cluster_id])
      .style("opacity", 0.7);

    // Plot data points
    const clusterPoints = svg.selectAll(".cluster-point")
      .data(dataPoints)
      .enter()
      .append("circle")
      .attr("class", "cluster-point")
      .attr("cx", d => xScale(d.coordinates[0]))
      .attr("cy", d => yScale(d.coordinates[1]))
      .attr("r", 3)
      .style("fill", d => d3.schemeCategory10[d.cluster_id]);

    // Zoom function
    function zoomed(event) {
      const transform = event.transform;
      const newXScale = transform.rescaleX(xScale);
      const newYScale = transform.rescaleY(yScale);

      xAxis.call(d3.axisBottom(newXScale));
      yAxis.call(d3.axisLeft(newYScale));

      gridX.call(d3.axisLeft(newYScale)
        .tickSize(-width + margin.left + margin.right)
        .tickFormat("")
        .ticks(20)
      );

      gridY.call(d3.axisBottom(newXScale)
        .tickSize(-height + margin.top + margin.bottom)
        .tickFormat("")
        .ticks(20)
      );

      clusterCenters
        .attr("cx", d => newXScale(d.coordinates[0]))
        .attr("cy", d => newYScale(d.coordinates[1]))
        .attr("r", d => d.radius * Math.min(newXScale(3) - newXScale(0), newYScale(0) - newYScale(3)));

      clusterPoints
        .attr("cx", d => newXScale(d.coordinates[0]))
        .attr("cy", d => newYScale(d.coordinates[1]));
    }

  } catch (error) {
    console.error("Error fetching cluster data:", error);
    showAlert("Failed to fetch cluster data.", "danger");
  }
}

// --- Initialization ---
plotEigenvalues();
getComponents().then((c) => plotPCA(c));
plotTable();
plotScatterMatrix();
plotMSE().then(() => plotClusters(kmean_index));

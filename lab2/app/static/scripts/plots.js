// Set up the dimensions and margins of the plot
const width = 800;
const height = 600;
const margin = { top: 40, right: 40, bottom: 60, left: 60 };

/**
 * Plots the eigenvalues of our sampled dataset.
 */
async function plotEigenvalues() {
  Promise.all([
    d3.json('/api/eigenvectors'),
  ]).then(([eigenvectors]) => {
    // extract eigenvalues from the response
    const eigenvalues = eigenvectors.eigenvalues;
    
    // get the SVG element and set its dimensions
    const svg = d3.select('#chart');
    svg.selectAll('*').remove();
    svg.attr("width", width).attr("height", height);
    
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
      .attr("stroke", "#006de1")
      .attr("stroke-width", 2)
      .attr("d", line);
    
    // add circles for data points
    chartGroup.selectAll("circle")
      .data(eigenvalues)
      .enter()
      .append("circle")
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
      .attr("y", d => yScale(d) + 2)  // Position below points
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .attr("font-size", "6px")
      .style("cursor", "pointer")
      .text((d, _) => `${d.toFixed(2)}`)
      .on("click", (_, i) => onSelectedAction(i));
    
    // function to handle click on data points
    function onSelectedAction(i) {
      // highlight selected point and reset others
      selectedIndex = i;
      d3.selectAll("circle").attr("fill", (d, _) => (d === selectedIndex ? "#a12500" : "#006de1"));
      d3.selectAll("circle").attr("r", (d, _) => (d === selectedIndex ? 12 : 8));
      d3.selectAll(".data-label").attr("font-size", (d, _) => (d === selectedIndex ? "10px" : "6px"));

      // show alert with eigenvalue
      showAlert(`Intrinsic Dimensionality Index: ${i + 1}`, "warning");
    }
  }).catch(error => {
    console.error("Error fetching eigenvalues:", error);
    showAlert("Failed to fetch eigenvalues.", "danger")}
  );
}

/**
 * Plots the PCA biplot of our sampled dataset.
 */
async function plotPCA() {
  Promise.all([
    d3.json('/api/principalcomponents'),
    d3.json('/api/eigenvectors'),
    d3.json('/api/headers')
  ]).then(([pc, eigenvectorData, headers]) => {
    const pc1 = pc.principal_components.map(d => d[0]);
    const pc2 = pc.principal_components.map(d => d[1]);
    const loadings = eigenvectorData.eigenvectors.slice(0, 2);
    const features = headers;

    const margin = {top: 40, right: 40, bottom: 60, left: 60};
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const svg = d3.select('#chart');
    svg.selectAll('*').remove();
    svg.attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales for principal components
    const xScale = d3.scaleLinear()
      .domain([d3.min(pc1), d3.max(pc1)])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([d3.min(pc2), d3.max(pc2)])
      .range([height, 0]);

    // Draw data points
    svg.selectAll(".point")
      .data(pc.principal_components)
      .enter()
      .append("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d[0]))
      .attr("cy", d => yScale(d[1]))
      .attr("r", 2)
      .attr("fill", "#999");

    // Scaling factor for loadings
    const loadingScale = d3.scaleLinear()
      .domain([-1, 1])
      .range([-100, 100]);

    // Draw variable loadings
    features.forEach((feature, i) => {
      const x = loadingScale(loadings[0][i]);
      const y = loadingScale(loadings[1][i]);
        
      svg.append("line")
        .attr("class", "arrow")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", x)
        .attr("y2", -y)
        .attr("transform", `translate(${width/2},${height/2})`)
        .attr("marker-end", "url(#arrowhead)");

      svg.append("text")
        .attr("class", "label")
        .attr("x", width/2 + x*1.1)
        .attr("y", height/2 - y*1.1)
        .text(feature);
    });

    // Add arrowhead marker
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 8)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#e41a1c");

    // Calculate total variance
    const totalVariance = eigenvectorData.eigenvalues.reduce((a,b) => a+b, 0);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height/2})`)
      .call(d3.axisBottom(xScale)
          .tickSizeOuter(0))
      .append("text")
      .attr("y", 40)
      .attr("x", width/2)
      .text(`PC1 (${(eigenvectorData.eigenvalues[0]/totalVariance*100).toFixed(1)}%)`);

    svg.append("g")
      .attr("transform", `translate(${width/2},0)`)
      .call(d3.axisLeft(yScale)
          .tickSizeOuter(0))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -40)
      .attr("x", -height/2)
      .text(`PC2 (${(eigenvectorData.eigenvalues[1]/totalVariance*100).toFixed(1)}%)`);
  }).catch(error => {
    console.error("Error fetching PCA data:", error);
    showAlert("Failed to fetch PCA data.", "danger")}
  );
}

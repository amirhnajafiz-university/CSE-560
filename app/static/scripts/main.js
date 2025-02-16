// Global variables
const WIDTH = 1000;
const HEIGHT = 600;
const MARGIN = { top: 50, right: 70, bottom: 50, left: 150 };
let isSideways = false;
let isTwoSelected = false;

// --- Utility Functions ---
/**
 * Handles errors from fetch requests.
 * @param {Response} response - The response object from a fetch request.
 * @returns {Response} - The response object if the request was successful.
 * @throws {Error} - If the response status is not ok.
 */
async function handleFetchErrors(response) {
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`);
  }
  return response;
}

/**
 * Fetches JSON data from a given endpoint.
 * @param {string} endpoint - The API endpoint to fetch data from.
 * @returns {Promise<any>} - A promise that resolves with the JSON data.
 */
async function fetchDataFromAPI(endpoint) {
  try {
    const response = await fetch(endpoint);
    const handledResponse = await handleFetchErrors(response);
    return await handledResponse.json();
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    return null;
  }
}

// --- Data Fetching Functions ---
/**
 * Fetches mapping data for a given variable.
 * @param {string} variable - The variable to fetch mapping data for.
 * @returns {Promise<object|null>} - A promise that resolves with the mapping data or null on error.
 */
async function fetchMapping(variable) {
  return fetchDataFromAPI(`/data/mapping/${variable}`);
}

/**
 * Fetches data for a given variable and determines the chart type to draw.
 * @param {string} variable - The variable to fetch data for.
 * @param {boolean} isSideways - Whether to draw the chart sideways.
 */
async function fetchDataAndDrawChart(variable, isSideways = false) {
  isTwoSelected = false;

  try {
    const data = await fetchDataFromAPI(`/data/${variable}`);
    if (!data) return;

    const typeData = await fetchDataFromAPI(`/data/type/${variable}`);
    if (!typeData) return;

    switch (typeData.type) {
      case "categorical":
        isSideways ? drawBarchartSideways(variable, data) : drawBarchart(variable, data);
        break;
      case "numerical":
        isSideways ? drawHistogramSideways(variable, data) : drawHistogram(variable, data);
        break;
      default:
        console.error('Unknown variable type:', typeData.type);
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// --- D3.js Chart Drawing Functions ---
/**
 * Draws a scatterplot with the given data.
 * @param {string} variableX - The variable for the x-axis.
 * @param {string} variableY - The variable for the y-axis.
 * @param {Array<object>} data - The data to plot.
 */
async function drawScatterplot(variableX, variableY, data) {
  const svg = d3.select('#chart');
  svg.selectAll('*').remove();
  svg.attr('width', WIDTH).attr('height', HEIGHT);

  // Create scales for x and y axes
  const x = d3.scaleLinear()
    .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
    .range([MARGIN.left, WIDTH - MARGIN.right]);

  const y = d3.scaleLinear()
    .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
    .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

  // Append circles for each data point
  svg.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("cx", d => x(d.x))
    .attr("cy", d => y(d.y))
    .attr("r", 5)
    .on("mouseover", function(event, d) {
      // Append a group to hold the tooltip elements
      let tooltip = svg.append("g")
        .attr("class", "popup");

      // Append a rectangle for background
      tooltip.append("rect")
        .attr("x", x(d.x) - 30)
        .attr("y", y(d.y) - 30)
        .attr("width", 60)
        .attr("height", 20)
        .attr("fill", "#222")
        .attr("stroke", "#ccc")
        .attr("rx", 5) // Rounded corners
        .attr("ry", 5)
        .style("pointer-events", "none"); // Prevent blocking mouse events

      // Append text inside the rectangle
      tooltip.append("text")
        .attr("x", x(d.x))
        .attr("y", y(d.y) - 15)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#fff")
        .text(`(${d.x}, ${d.y})`);
    })
    .on("mouseout", function() {
      svg.selectAll(".popup").remove();
    });

  // Add x-axis
  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${HEIGHT - MARGIN.bottom})`)
    .call(d3.axisBottom(x));

  // Add y-axis
  const yAxis = svg.append("g")
    .attr("transform", `translate(${MARGIN.left},0)`)
    .call(d3.axisLeft(y));

  // Add x-axis grid lines
  xAxis.selectAll("g.tick")
    .append("line")
    .attr("class", "grid-line")
    .attr("y1", -HEIGHT + MARGIN.top + MARGIN.bottom)
    .attr("y2", 0)
    .attr("stroke", "#ccc")
    .attr("stroke-dasharray", "2,2");
  
  // Add y-axis grid lines
  yAxis.selectAll("g.tick")
    .append("line")
    .attr("class", "grid-line")
    .attr("x1", WIDTH - MARGIN.left - MARGIN.right)
    .attr("x2", 0)
    .attr("stroke", "#ccc")
    .attr("stroke-dasharray", "2,2");

  // Add x-axis label
  svg.append("text")
    .attr("transform", `translate(${WIDTH / 2},${HEIGHT - MARGIN.bottom + 40})`)
    .style("text-anchor", "middle")
    .text(variableX);

  // Add y-axis label
  svg.append("text")
    .attr("transform", `translate(${MARGIN.left - 100},${HEIGHT / 2}) rotate(-90)`)
    .style("text-anchor", "middle")
    .text(variableY);

  // Add title
  svg.append("text")
    .attr("x", WIDTH / 2)
    .attr("y", MARGIN.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text(`Scatterplot of ${variableX} vs ${variableY}`);
}

/**
 * Draws a sideways barchart with the given data.
 * @param {string} variable - The variable to visualize.
 * @param {Array<any>} data - The data to use.
 */
async function drawBarchartSideways(variable, data) {
  const svg = d3.select('#chart');
  svg.selectAll('*').remove();
  svg.attr('width', WIDTH).attr('height', HEIGHT);

  // Fetch mapping data
  const mapping = await fetchMapping(variable);
  if (!mapping) return;

  // Group data by value and count occurrences
  const groupedData = d3.rollup(data, v => v.length, d => d);
  const groupedArray = Array.from(groupedData, ([key, value]) => ({ key, value }));

  // Replace keys with mapped values
  groupedArray.forEach(d => {
    d.key = mapping[d.key] || d.key;
  });

  // Sort the array by value in descending order
  groupedArray.sort((a, b) => b.value - a.value);

  // Get the top 10 values and group the rest as "others"
  const top10 = groupedArray.slice(0, 10);
  const others = groupedArray.slice(10).reduce((acc, curr) => acc + curr.value, 0);
  if (others > 0) {
    top10.push({ key: 'Others', value: others });
  }

  // Create scales for x and y axes
  const y = d3.scaleBand()
    .domain(top10.map(d => d.key))
    .range([MARGIN.top, HEIGHT - MARGIN.bottom])
    .padding(0.2);

  const x = d3.scaleLinear()
    .domain([0, d3.max(top10, d => d.value)])
    .range([MARGIN.left, WIDTH - MARGIN.right]);

  // Append bars
  svg.selectAll("rect")
    .data(top10)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(0))
    .attr("y", d => y(d.key))
    .attr("width", d => x(d.value) - x(0))
    .attr("height", y.bandwidth())
    .on("mouseover", function(event, d) {
      svg.append("text")
        .attr("class", "popup")
        .attr("x", x(d.value) + 10)
        .attr("y", y(d.key) + y.bandwidth() / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("background", "#fff")
        .attr("border", "1px solid #ccc")
        .text(d.value);
    })
    .on("mouseout", function() {
      svg.selectAll(".popup").remove();
    });

  // Add y-axis
  svg.append("g")
    .attr("transform", `translate(${MARGIN.left},0)`)
    .call(d3.axisLeft(y));

  // Add x-axis
  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${HEIGHT - MARGIN.bottom})`)
    .call(d3.axisBottom(x));
  
  // Add x-axis grid lines
  xAxis.selectAll("g.tick")
    .append("line")
    .attr("class", "grid-line")
    .attr("y1", -HEIGHT + MARGIN.top + MARGIN.bottom)
    .attr("y2", 0)
    .attr("stroke", "#ccc")
    .attr("stroke-dasharray", "2,2");

  // Add x-axis label
  svg.append("text")
    .attr("transform", `translate(${WIDTH / 2},${HEIGHT - MARGIN.bottom + 40})`)
    .style("text-anchor", "middle")
    .text("Count");

  // Add y-axis label
  svg.append("text")
    .attr("transform", `translate(${MARGIN.left - 100},${HEIGHT / 2}) rotate(-90)`)
    .style("text-anchor", "middle")
    .text(variable);

  // Add title
  svg.append("text")
    .attr("x", WIDTH / 2)
    .attr("y", MARGIN.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text(`Barchart of ${variable}`);
}

/**
 * Draws a barchart with the given data.
 * @param {string} variable - The variable to visualize.
 * @param {Array<any>} data - The data to use.
 */
async function drawBarchart(variable, data) {
  const svg = d3.select('#chart');
  svg.selectAll('*').remove();
  svg.attr('width', WIDTH).attr('height', HEIGHT);

  // Fetch mapping data
  const mapping = await fetchMapping(variable);
  if (!mapping) return;

  // Group data by value and count occurrences
  const groupedData = d3.rollup(data, v => v.length, d => d);
  const groupedArray = Array.from(groupedData, ([key, value]) => ({ key, value }));

  // Replace keys with mapped values
  groupedArray.forEach(d => {
    d.key = mapping[d.key] || d.key;
  });

  // Sort the array by value in descending order
  groupedArray.sort((a, b) => b.value - a.value);

  // Get the top 10 values and group the rest as "others"
  const top10 = groupedArray.slice(0, 10);
  const others = groupedArray.slice(10).reduce((acc, curr) => acc + curr.value, 0);
  if (others > 0) {
    top10.push({ key: 'Others', value: others });
  }

  // Create scales for x and y axes
  const x = d3.scaleBand()
    .domain(top10.map(d => d.key))
    .range([MARGIN.left, WIDTH - MARGIN.right])
    .padding(0.2);

  const y = d3.scaleLinear()
    .domain([0, d3.max(top10, d => d.value)])
    .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

  // Append bars
  svg.selectAll("rect")
    .data(top10)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.key))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => HEIGHT - MARGIN.bottom - y(d.value))
    .on("mouseover", function(event, d) {
      svg.append("text")
        .attr("class", "popup")
        .attr("x", x(d.key) + x.bandwidth() / 2)
        .attr("y", y(d.value) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("background", "#fff")
        .attr("border", "1px solid #ccc")
        .text(d.value);
    })
    .on("mouseout", function() {
      svg.selectAll(".popup").remove();
    });

  // Add x-axis
  svg.append("g")
    .attr("transform", `translate(0,${HEIGHT - MARGIN.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .style("text-anchor", "middle");

  // Add y-axis
  const yAxis = svg.append("g")
    .attr("transform", `translate(${MARGIN.left},0)`)
    .call(d3.axisLeft(y));
  
  // Add y-axis grid lines
  yAxis.selectAll("g.tick")
    .append("line")
    .attr("class", "grid-line")
    .attr("x1", WIDTH - MARGIN.left - MARGIN.right)
    .attr("x2", 0)
    .attr("stroke", "#ccc")
    .attr("stroke-dasharray", "2,2");
  
  // Add x-axis label
  svg.append("text")
    .attr("transform", `translate(${WIDTH / 2},${HEIGHT - MARGIN.bottom + 40})`)
    .style("text-anchor", "middle")
    .text(variable);

  // Add y-axis label
  svg.append("text")
    .attr("transform", `translate(${MARGIN.left - 100},${HEIGHT / 2}) rotate(-90)`)
    .style("text-anchor", "middle")
    .text("Count");

  // Add title
  svg.append("text")
    .attr("x", WIDTH / 2)
    .attr("y", MARGIN.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text(`Barchart of ${variable}`);
}

/**
 * Draws a sideways histogram with the given data.
 * @param {string} variable - The variable to visualize.
 * @param {Array<number>} data - The data to use.
 */
function drawHistogramSideways(variable, data) {
  const svg = d3.select('#chart');
  svg.selectAll('*').remove();
  svg.attr('width', WIDTH).attr('height', HEIGHT);

  // Create a scale for the y-axis (originally x-axis)
  const y = d3.scaleLinear()
    .domain([d3.min(data), d3.max(data)])
    .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

  // Create a histogram generator
  const histogram = d3.histogram()
    .domain(y.domain())
    .thresholds(y.ticks(10));

  // Generate bins
  const bins = histogram(data);

  // Create a scale for the x-axis (originally y-axis)
  const x = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .range([MARGIN.left, WIDTH - MARGIN.right]);

  // Append bars to the histogram
  svg.selectAll("rect")
    .data(bins)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => MARGIN.left)
    .attr("y", d => y(d.x1))
    .attr("width", d => x(d.length) - MARGIN.left)
    .attr("height", d => Math.abs(y(d.x1) - y(d.x0)))
    .on("mouseover", function(event, d) {
      svg.append("text")
        .attr("class", "popup")
        .attr("x", x(d.length) + 10)
        .attr("y", y(d.x1) - (y(d.x1) - y(d.x0)) / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("background", "#fff")
        .attr("border", "1px solid #ccc")
        .text(d.length);
    })
    .on("mouseout", function() {
      svg.selectAll(".popup").remove();
    });

  // Add y-axis (originally x-axis)
  svg.append("g")
    .attr("transform", `translate(${MARGIN.left},0)`)
    .call(d3.axisLeft(y));

  // Add x-axis (originally y-axis)
  const xAxis = svg.append("g")
    .attr("transform", `translate(0,${HEIGHT - MARGIN.bottom})`)
    .call(d3.axisBottom(x));
  
  // Add x-axis grid lines
  xAxis.selectAll("g.tick")
    .append("line")
    .attr("class", "grid-line")
    .attr("y1", -HEIGHT + MARGIN.top + MARGIN.bottom)
    .attr("y2", 0)
    .attr("stroke", "#ccc")
    .attr("stroke-dasharray", "2,2");

  // Add y-axis label (originally x-axis label)
  svg.append("text")
    .attr("transform", `translate(${MARGIN.left - 40},${HEIGHT / 2}) rotate(-90)`)
    .style("text-anchor", "middle")
    .text(variable);

  // Add x-axis label (originally y-axis label)
  svg.append("text")
    .attr("transform", `translate(${WIDTH / 2},${HEIGHT - MARGIN.bottom + 40})`)
    .style("text-anchor", "middle")
    .text("Count");
  
  // Add title
  svg.append("text")
    .attr("x", WIDTH / 2)
    .attr("y", MARGIN.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text(`Histogram of ${variable}`);
}

/**
 * Draws a histogram with the given data.
 * @param {string} variable - The variable to visualize.
 * @param {Array<number>} data - The data to use.
 */
function drawHistogram(variable, data) {
  const svg = d3.select('#chart');
  svg.selectAll('*').remove();
  svg.attr('width', WIDTH).attr('height', HEIGHT);

  // Create a scale for the x-axis
  const x = d3.scaleLinear()
    .domain([d3.min(data), d3.max(data)])
    .range([MARGIN.left, WIDTH - MARGIN.right]);

  // Create a histogram generator
  const histogram = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(10));

  // Generate bins
  const bins = histogram(data);

  // Create a scale for the y-axis
  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .range([HEIGHT - MARGIN.bottom, MARGIN.top]);

  // Append bars to the histogram
  svg.selectAll("rect")
    .data(bins)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.x0))
    .attr("y", d => y(d.length))
    .attr("width", d => x(d.x1) - x(d.x0) - 1)
    .attr("height", d => HEIGHT - MARGIN.bottom - y(d.length))
    .on("mouseover", function(event, d) {
      svg.append("text")
        .attr("class", "popup")
        .attr("x", x(d.x0) + (x(d.x1) - x(d.x0)) / 2)
        .attr("y", y(d.length) - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("background", "#fff")
        .attr("border", "1px solid #ccc")
        .text(d.length);
    })
    .on("mouseout", function() {
      svg.selectAll(".popup").remove();
    });

  // Add x-axis
  svg.append("g")
    .attr("transform", `translate(0,${HEIGHT - MARGIN.bottom})`)
    .call(d3.axisBottom(x));

  // Add y-axis
  const yAxis = svg.append("g")
    .attr("transform", `translate(${MARGIN.left},0)`)
    .call(d3.axisLeft(y));
  
  // Add y-axis grid lines
  yAxis.selectAll("g.tick")
    .append("line")
    .attr("class", "grid-line")
    .attr("x1", WIDTH - MARGIN.left - MARGIN.right)
    .attr("x2", 0)
    .attr("stroke", "#ccc")
    .attr("stroke-dasharray", "2,2");

  // Add x-axis label
  svg.append("text")
    .attr("transform", `translate(${WIDTH / 2},${HEIGHT - MARGIN.bottom + 40})`)
    .style("text-anchor", "middle")
    .text(variable);

  // Add y-axis label
  svg.append("text")
    .attr("transform", `translate(${MARGIN.left - 40},${HEIGHT / 2}) rotate(-90)`)
    .style("text-anchor", "middle")
    .text("Count");
  
  // Add title
  svg.append("text")
    .attr("x", WIDTH / 2)
    .attr("y", MARGIN.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text(`Histogram of ${variable}`);
}

// --- UI Population Functions ---
/**
 * Fetches variables and populates the select elements.
 */
async function fetchAndPopulateVariables() {
  try {
    const variables = await fetchDataFromAPI('/headers');
    if (!variables) return;

    populateSelectElement('variables', variables, false, (selectedVariable) => {
      if (isTwoSelected) {
        const selectedVariableY = document.querySelector('input[name="variables-y"]:checked').value;
        if (selectedVariableY && selectedVariableY !== 'none') {
          Promise.all([
            fetchDataFromAPI(`/data/${selectedVariable}`),
            fetchDataFromAPI(`/data/${selectedVariableY}`)
          ])
            .then(([dataX, dataY]) => {
              if (dataX && dataY) {
                const combinedData = dataX.map((x, index) => ({ x, y: dataY[index] }));
                drawScatterplot(selectedVariable, selectedVariableY, combinedData);
              }
            })
            .catch(error => {
              console.error('Error fetching data:', error);
            });
          return;
        }
      } else {
        fetchDataAndDrawChart(selectedVariable, false);
      }
    });
    populateRadioGroup('variables-y', variables, true);

    // Initial data fetch
    if (variables.length > 0) {
      document.getElementById('variables').value = variables[0];
      fetchDataAndDrawChart(variables[0], false);
    }
  } catch (error) {
    console.error('Error fetching or populating variables:', error);
  }
}

/**
 * Populates a select element with the given variables.
 * @param {string} selectElementId - The ID of the select element.
 * @param {Array<string>} variables - The variables to populate the select element with.
 * @param {function} onChange - An optional callback function to be called when the select element changes.
 * @param {boolean} empty - Whether to include an empty option.
 */
function populateSelectElement(selectElementId, variables, empty, onChange) {
  const selectElement = document.getElementById(selectElementId);
  selectElement.innerHTML = '';

  if (empty) {
    const emptyOption = document.createElement('option');
    emptyOption.value = 'none';
    emptyOption.text = 'None';
    selectElement.appendChild(emptyOption);
  }

  variables.forEach(variable => {
    const option = document.createElement('option');
    option.value = variable;
    option.text = variable;
    selectElement.appendChild(option);
  });

  if (onChange) {
    selectElement.addEventListener('change', () => {
      onChange(selectElement.value);
    });
  }
}

/**
 * Populates a radio button group with the given variables.
 * @param {string} radioGroupId - The ID of the radio button group container.
 * @param {Array<string>} variables - The variables to populate the radio button group with.
 * @param {function} onChange - An optional callback function to be called when a radio button changes.
 * @param {boolean} empty - Whether to include an empty option.
 */
function populateRadioGroup(radioGroupId, variables, empty, onChange) {
  const radioGroup = document.getElementById(radioGroupId);
  radioGroup.innerHTML = '';

  if (empty) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'form-check';
    emptyDiv.classList.add('form-check-inline');
    const emptyInput = document.createElement('input');
    emptyInput.className = 'form-check-input';
    emptyInput.type = 'radio';
    emptyInput.name = 'variables-y';
    emptyInput.id = 'variable-y-none';
    emptyInput.value = 'none';
    emptyInput.checked = true;
    const emptyLabel = document.createElement('label');
    emptyLabel.className = 'form-check-label';
    emptyLabel.htmlFor = 'variable-y-none';
    emptyLabel.textContent = 'None';
    emptyDiv.appendChild(emptyInput);
    emptyDiv.appendChild(emptyLabel);
    radioGroup.appendChild(emptyDiv);
  }

  variables.forEach(variable => {
    const div = document.createElement('div');
    div.className = 'form-check';
    div.classList.add('form-check-inline');
    const input = document.createElement('input');
    input.className = 'form-check-input';
    input.type = 'radio';
    input.name = 'variables-y';
    input.id = `variable-y-${variable}`;
    input.value = variable;
    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.htmlFor = `variable-y-${variable}`;
    label.textContent = variable;
    div.appendChild(input);
    div.appendChild(label);
    radioGroup.appendChild(div);
  });

  if (onChange) {
    radioGroup.addEventListener('change', (event) => {
      if (event.target.name === 'variables-y') {
        onChange(event.target.value);
      }
    });
  }
}

// --- Event Listeners ---
/**
 * Event listener for the variables-y select element.
 */
document.getElementById('variables-y').addEventListener('change', function (event) {
  if (event.target.name !== 'variables-y') return;

  const selectedVariableX = document.getElementById('variables').value;
  const selectedVariableY = event.target.value;

  // if value of selectedVariableY is 'none', do not fetch data run fetch data for selectedVariableX
  if (selectedVariableY === 'none') {
    fetchDataAndDrawChart(selectedVariableX, isSideways);
    return;
  }

  isTwoSelected = true;

  if (selectedVariableX && selectedVariableY) {
    Promise.all([
      fetchDataFromAPI(`/data/${selectedVariableX}`),
      fetchDataFromAPI(`/data/${selectedVariableY}`)
    ])
      .then(([dataX, dataY]) => {
        if (dataX && dataY) {
          const combinedData = dataX.map((x, index) => ({ x, y: dataY[index] }));
          drawScatterplot(selectedVariableX, selectedVariableY, combinedData);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }
});

/**
 * Event listener for the sideway button.
 */
document.getElementById('sideway').addEventListener('click', function () {
  if (isTwoSelected) {
    return;
  }

  isSideways = !isSideways;
  const selectedVariable = document.getElementById('variables').value;
  if (selectedVariable) {
    fetchDataAndDrawChart(selectedVariable, isSideways);
  }
});
document.getElementById('reset').addEventListener('click', function () {
  location.reload();
});

// --- Initialization ---
/**
 * Initializes the script.
 */
function init() {
  fetchAndPopulateVariables();
}

// Call the init function to start the process
init();

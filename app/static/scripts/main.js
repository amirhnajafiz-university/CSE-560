async function fetchMapping(variable) {
    try {
        const response = await fetch(`/data/mapping/${variable}`);
        if (!response.ok) {
            throw new Error(`response status: ${response.status}`);
        }
        const mapping = await response.json();
        return mapping;
    } catch (error) {
        console.error('error fetching mapping:', error);
        return null;
    }
}

async function drawBarchartSideways(variable, data) {
    const width = 1000, height = 600, margin = { top: 50, right: 70, bottom: 50, left: 150 };
    const svg = d3.select('#chart');
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    // Fetch mapping data
    const mapping = await fetchMapping(variable);
    if (!mapping) {
        return;
    }

    // Group data by value and count occurrences
    const groupedData = d3.rollup(data, v => v.length, d => d);
    const groupedArray = Array.from(groupedData, ([key, value]) => ({ key, value }));

    // Replace keys with mapped values
    groupedArray.forEach(d => {
        d.key = mapping[d.key] || d.key;
    });

    // Sort the array by value in descending order
    groupedArray.sort((a, b) => b.value - a.value);

    // Get the top 10 values and group the rest as "Others"
    const top10 = groupedArray.slice(0, 10);
    const others = groupedArray.slice(10).reduce((acc, curr) => acc + curr.value, 0);
    if (others > 0) {
        top10.push({ key: 'Others', value: others });
    }

    // Create scales for x and y axes
    const y = d3.scaleBand()
        .domain(top10.map(d => d.key)) // Use mapped value as category
        .range([margin.top, height - margin.bottom])
        .padding(0.2); // Space between bars

    const x = d3.scaleLinear()
        .domain([0, d3.max(top10, d => d.value)]) // Set max width of bars
        .range([margin.left, width - margin.right]);

    // Append bars
    svg.selectAll("rect")
        .data(top10)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(0))
        .attr("y", d => y(d.key))
        .attr("width", d => x(d.value) - x(0)) // Bar width
        .attr("height", y.bandwidth()); // Bar height

    // Add y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

     // Add x-axis label
    svg.append("text")
        .attr("transform", `translate(${width / 2},${height - margin.bottom + 40})`)
        .style("text-anchor", "middle")
        .text("Count");

    // Add y-axis label
    svg.append("text")
        .attr("transform", `translate(${margin.left - 100},${height / 2}) rotate(-90)`)
        .style("text-anchor", "middle")
        .text(variable);
}

async function drawBarchart(variable, data) {
    const width = 1000, height = 600, margin = { top: 50, right: 50, bottom: 70, left: 70 };
    const svg = d3.select('#chart');
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    // Fetch mapping data
    const mapping = await fetchMapping(variable);
    if (!mapping) {
        return;
    }

    // Group data by value and count occurrences
    const groupedData = d3.rollup(data, v => v.length, d => d);
    const groupedArray = Array.from(groupedData, ([key, value]) => ({ key, value }));

    // Replace keys with mapped values
    groupedArray.forEach(d => {
        d.key = mapping[d.key] || d.key;
    });

    // Sort the array by value in descending order
    groupedArray.sort((a, b) => b.value - a.value);

    // Get the top 10 values and group the rest as "Others"
    const top10 = groupedArray.slice(0, 10);
    const others = groupedArray.slice(10).reduce((acc, curr) => acc + curr.value, 0);
    if (others > 0) {
        top10.push({ key: 'Others', value: others });
    }

    // Create scales for x and y axes
    const x = d3.scaleBand()
        .domain(top10.map(d => d.key)) // Use mapped value as category
        .range([margin.left, width - margin.right])
        .padding(0.2); // Space between bars

    const y = d3.scaleLinear()
        .domain([0, d3.max(top10, d => d.value)]) // Set max height of bars
        .range([height - margin.bottom, margin.top]);

    // Append bars
    svg.selectAll("rect")
        .data(top10)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x.bandwidth()) // Bar width
        .attr("height", d => height - margin.bottom - y(d.value));

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "middle");

    // Add y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
}

function drawHistogramSideways(variable, data) {
    const width = 600, height = 600, margin = { top: 50, right: 70, bottom: 50, left: 70 };
    const svg = d3.select('#chart');

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    // Create a scale for the y-axis (originally x-axis)
    const y = d3.scaleLinear()
        .domain([d3.min(data), d3.max(data)]) // Input domain
        .range([height - margin.bottom, margin.top]); // Output range

    // Create a histogram generator
    const histogram = d3.histogram()
        .domain(y.domain()) // Input domain
        .thresholds(y.ticks(10)); // Number of bins

    // Generate bins
    const bins = histogram(data);

    // Create a scale for the x-axis (originally y-axis)
    const x = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)]) // Max count in bins
        .range([margin.left, width - margin.right]);

    // Append bars to the histogram
    svg.selectAll("rect")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => margin.left) // Start position
        .attr("y", d => y(d.x1)) // Bin end position
        .attr("width", d => x(d.length) - margin.left) // Bar width
        .attr("height", d => Math.abs(y(d.x1) - y(d.x0))); // Bin height

    // Add y-axis (originally x-axis)
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Add x-axis (originally y-axis)
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    // Add y-axis label (originally x-axis label)
    svg.append("text")
        .attr("transform", `translate(${margin.left - 40},${height / 2}) rotate(-90)`)
        .style("text-anchor", "middle")
        .text(variable);

    // Add x-axis label (originally y-axis label)
    svg.append("text")
        .attr("transform", `translate(${width / 2},${height - margin.bottom + 40})`)
        .style("text-anchor", "middle")
        .text("Count");
}

// drawHistogram function to fetch data and draw the histogram
function drawHistogram(variable, data) {
    const width = 600, height = 600, margin = { top: 50, right: 50, bottom: 70, left: 70 };
    const svg = d3.select('#chart');

    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    // Create a scale for the x-axis
    const x = d3.scaleLinear()
        .domain([d3.min(data), d3.max(data)]) // Input domain
        .range([margin.left, width - margin.right]); // Output range

    // Create a histogram generator
    const histogram = d3.histogram()
        .domain(x.domain()) // Input domain
        .thresholds(x.ticks(10)); // Number of bins

    // Generate bins
    const bins = histogram(data);

    // Create a scale for the y-axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)]) // Max count in bins
        .range([height - margin.bottom, margin.top]);

    // Append bars to the histogram
    svg.selectAll("rect")
        .data(bins)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.x0)) // Bin start position
        .attr("y", d => y(d.length)) // Bar height
        .attr("width", d => x(d.x1) - x(d.x0) - 1) // Bin width
        .attr("height", d => height - margin.bottom - y(d.length));

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    // Add y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
    
    // Add x-axis label
    svg.append("text")
        .attr("transform", `translate(${width / 2},${height - margin.bottom + 40})`) // Increased space
        .style("text-anchor", "middle")
        .text(variable);
    
    // Add y-axis label
    svg.append("text")
        .attr("transform", `translate(${margin.left - 40},${height / 2}) rotate(-90)`) // Increased space
        .style("text-anchor", "middle")
        .text("Count");
}

// function to fetch data from the server and draw the histogram
async function fetchData(variable, isSideways = false) {
    try {
        // make a GET request to /histogram with the selected variable
        const response = await fetch(`/data/${variable}`);

        // check if the response is OK
        if (!response.ok) {
            throw new Error(`response status: ${response.status}`);
        }

        // assuming the response is JSON
        const data = await response.json();

        // make a call to /data/type/variable to get the type of the variable
        const typeResponse = await fetch(`/data/type/${variable}`);
        if (!typeResponse.ok) {
            throw new Error(`response status: ${typeResponse.status}`);
        }
        const typeData = await typeResponse.json();

        if (typeData.type === "categorical") {
            // call drawHistogram with the fetched data
            if (isSideways) {
                drawBarchartSideways(variable, data);
            } else {
                drawBarchart(variable, data);
            }
        } else if (typeData.type === "numerical") {
            // call drawHistogram with the fetched data
            if (isSideways) {
                drawHistogramSideways(variable, data);
            } else {
                drawHistogram(variable, data);
            }
        } else {
            console.error('Unknown variable type:', typeData.type);
        }
    } catch (error) {
        console.error('error fetching data:', error);
    }
}

// function to fetch variables and populate the select element
async function fetchAndPopulateVariables() {
    try {
        // make a GET request to /headers to get the list of variables
        const response = await fetch('/headers');

        // check if the response is OK
        if (!response.ok) {
            throw new Error(`response status: ${response.status}`);
        }

        // assuming the response is JSON
        const variables = await response.json();

        // get the select element by its ID
        const selectElement = document.getElementById('variables');

        // clear any existing options in the select element
        selectElement.innerHTML = '';

        // populate the select element with the variables
        variables.forEach(variable => {
            const option = document.createElement('option');
            option.value = variable;
            option.text = variable;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('error fetching or populating variables:', error);
    }
}

// event listener to call drawHistogram when a variable is selected
document.getElementById('variables').addEventListener('change', function() {
    const selectedVariable = this.value;
    if (selectedVariable) {
        fetchData(selectedVariable, false);
    }
});

is_sideways = false;

// event listener to call drawHistogram or drawHistogramSideways when the button is clicked, id is sideway
document.getElementById('sideway').addEventListener('click', function() {
    is_sideways = !is_sideways;
    const selectedVariable = document.getElementById('variables').value;
    if (selectedVariable) {
        fetchData(selectedVariable, is_sideways);
    }
});

// initialize the script
function init() {
    fetchAndPopulateVariables();
}

// call the init function to start the process
init();

// Function to fetch and display data
async function fetchDataAndDisplay() {
    try {
        // Fetch the JSON data from the server
        const response = await fetch('/data');
        const data = await response.json();

        // Select the div with id="chart"
        const chartDiv = d3.select('#chart');

        // Create a table to display the data
        const table = chartDiv.append('table');
        const thead = table.append('thead');
        const tbody = table.append('tbody');

        // Extract column names from the data
        const columns = Object.keys(data[0]);

        // Append the header row
        thead.append('tr')
            .selectAll('th')
            .data(columns)
            .enter()
            .append('th')
            .text(d => d);

        // Create a row for each object in the data
        const rows = tbody.selectAll('tr')
            .data(data)
            .enter()
            .append('tr');

        // Create a cell in each row for each column
        rows.selectAll('td')
            .data(row => columns.map(column => row[column]))
            .enter()
            .append('td')
            .text(d => d);
    } catch (error) {
        console.error('Error fetching or displaying data:', error);
    }
}

// Call the function to fetch and display data
fetchDataAndDisplay();
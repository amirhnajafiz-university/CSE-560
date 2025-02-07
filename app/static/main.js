// add an event listener to the select element with id 'variables'
document.getElementById('variables').addEventListener('change', async function(event) {
    const selectedVariable = event.target.value;
    try {
        const response = await fetch(`/data/${selectedVariable}`);
        const data = await response.json();
        
        const chartElement = document.getElementById('chart');
        chartElement.innerHTML = JSON.stringify(data, null, 2); // display the response data in the chart div
    } catch (error) {
        console.error('error fetching or displaying data:', error);
    }
});

// init function to fetch the data and populate the select element
async function init() {
    try {
        // fetch the JSON data from the server
        const response = await fetch('/headers');
        const data = await response.json();

        // set the data items as options of a select element named 'variables'
        const variablesElement = document.getElementById('variables');
        data.forEach((item) => {
            const option = document.createElement('option');
            option.value = item;
            option.text = item;
            variablesElement.appendChild(option);
        });

        // fetch the default data
        const defaultSelectedVariable = data[0];
        const defaultResponse = await fetch(`/data/${defaultSelectedVariable}`);
        const defaultData = await defaultResponse.json();
        const chartElement = document.getElementById('chart');
        chartElement.innerHTML = JSON.stringify(defaultData, null, 2);
    } catch (error) {
        console.error('error fetching or displaying data:', error);
    }
}

// call the init function when the page loads
init();

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

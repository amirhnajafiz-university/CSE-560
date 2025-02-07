// function to fetch and display data
async function fetchDataAndDisplay() {
    try {
        // fetch the JSON data from the server
        const response = await fetch('/data');
        const data = await response.json();

        // display the data in the HTML
        const dataElement = document.getElementById('chart');
        dataElement.innerHTML = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('error fetching or displaying data:', error);
    }
}

// call the function to fetch and display data
// when the page is loaded
fetchDataAndDisplay();

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

// initialize the script
function init() {
    fetchAndPopulateVariables();
}

// call the init function to start the process
init();

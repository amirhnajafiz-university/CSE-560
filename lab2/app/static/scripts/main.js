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

/**
 * Call /api/sample in order to generate dataset. 
 */
async function sampleData() {
  const numberOfSamples = document.getElementById("sample-number").value;
  const response = await fetchDataFromAPI(`/api/sample/${numberOfSamples}`);
  if (response) {
    alert("Sampled data successfully!");
  }
}

/**
 * Set the default value of the sample number input.
 */
function resetData() {
  document.getElementById("sample-number").value = 500;
  updateRangeValue();
}

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
  const dropNone = document.getElementById("drop-none").checked;
  const dropCategorical = document.getElementById("drop-categorical").checked;
  const response = await fetchDataFromAPI(`/api/sample/${numberOfSamples}?drop_none=${dropNone}&drop_categorical=${dropCategorical}`);
  if (response) {
    alert("Sampled data successfully!");
  }
}

/**
 * Call /api/headers in order to get headers and display them.
 */
async function displayHeaders() {
  const response = await fetchDataFromAPI("/api/headers");
  if (response) {
    const headersList = document.getElementById("variables-holder");
    headersList.innerHTML = ""; // clear previous headers
    response.forEach(header => {
      // display each header item as a badge
      const badge = document.createElement("span");
      badge.className = "badge bg-primary text-white m-1 p-1";
      badge.textContent = header;
      headersList.appendChild(badge);
    });
  }
}

/**
 * Call /api/eigendecomposition in order to perform PCA.
 */
async function performPCA() {
  const response = await fetchDataFromAPI("/api/eigendecomposition");
  if (response) {
    alert("Performed PCA successfully!");
  } else {
    alert("Failed to perform PCA.");
  }
}

// --- Event Handlers ---
/**
 * Change the value of the range input by a given delta.
 */
async function updateData() {
  sampleData();
  displayHeaders();
  performPCA();
}

/**
 * Set the default value of the sample number input.
 */
function resetData() {
  document.getElementById("sample-number").value = 500;
  document.getElementById("drop-none").checked = true;
  document.getElementById("drop-categorical").checked = true;
  updateRangeValue();
}

// --- Initialization ---
displayHeaders();

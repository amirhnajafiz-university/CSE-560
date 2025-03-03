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
 * Displays a custom alert div at the top of the page.
 * @param {string} message - The message to display in the alert.
 * @param {string} type - The type of alert (e.g., "success", "error").
 */
function showAlert(message, type) {
  const alertContainer = document.getElementById("alert-container");
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type} alert-dismissible fade show d-flex align-items-center`;
  alertDiv.role = "alert";
  alertDiv.style.marginBottom = "10px"; // Add margin to create space between alerts
  alertDiv.innerHTML = `
    <span>${message}</span>
  `;
  alertContainer.appendChild(alertDiv);

  // Trigger reflow to ensure the transition starts
  alertDiv.offsetHeight;
  alertDiv.classList.add("show");

  setTimeout(() => {
    alertDiv.classList.remove("show");
    alertDiv.classList.add("hide");
    setTimeout(() => alertDiv.remove(), 500); // Wait for transition to complete
  }, 4000);
}

/**
 * Call /api/data/sample in order to generate dataset. 
 */
async function sampleData() {
  const numberOfSamples = document.getElementById("sample-number").value;
  const dropNone = document.getElementById("drop-none").checked;
  const dropCategorical = document.getElementById("drop-categorical").checked;

  const response = await fetchDataFromAPI(`/api/data/sample/${numberOfSamples}?drop_none=${dropNone}&drop_categorical=${dropCategorical}`);
  if (response) {
    showAlert("Sampled data successfully!", "success");
  } else {
    showAlert("Failed to sample data.", "danger");
  }
}

/**
 * Call /api/pca/create in order to perform PCA.
 */
async function performPCA() {
  const standardize = document.getElementById("standardize").checked;
  
  const response = await fetchDataFromAPI(`/api/pca/create?standardize=${standardize}`);
  if (response) {
    showAlert("Performed PCA successfully!", "success");
  } else {
    showAlert("Failed to perform PCA.", "danger");
  }
}

/**
 * Call /api/clustering in order to perform clustering.
 */
async function performClustering() {
  const response = await fetchDataFromAPI(`/api/kmeans`);
  if (response) {
    showAlert("Performed clustering successfully!", "success");
  } else {
    showAlert("Failed to perform clustering.", "danger");
  }
}

/**
 * Change the value of the range input by a given delta.
 */
async function updateData() {
  // check the sample option
  const doSample = document.getElementById("resample").checked;
  if (doSample) {
    showAlert("Resampling data...", "warning");
    sampleData();
  }

  // perform PCA
  showAlert("Performing PCA...", "warning");
  performPCA().then(() => {
    // perform clustering
    showAlert("Performing clustering...", "warning");
    performClustering();
  });
}

/**
 * Set the default value of the sample number input.
 */
function resetData() {
  document.getElementById("sample-number").value = 500;
  document.getElementById("drop-none").checked = true;
  document.getElementById("drop-categorical").checked = true;
  document.getElementById("standardize").checked = true;
  document.getElementById("resample").checked = false;
  updateRangeValue();
}

/*
    API Functions
*/

/**
 * Loads the OSM data into the backend so that it can be rendered by map.html.
 * 
 * @param {JSON Array} data - The OSM data from the cache
 */
function loadMapData(data) {
  // State that the request for data was successful
  console.log("Cache loading successful.");
  // Sets the parameters for the POST request
  let url = "/api/post/load_map_data";
  // Create a JSON object containing the data to return to the backend
  let json = {
    "nodes" : data.Nodes,
    "ways" : data.Ways,
    "rels" : data.Rels,
    "quick_ways" : data.Quick_Ways,
    "named_nodes" : data.Named_Nodes,
    "from_store" : true
  };
  let success = function (data) {
    // State that the request was successful
    console.log("Map loading successful.");
    // Redirects to map.html
    location.href = "/map";
  };
  // Sends the POST request
  sendPOSTRequest(url, json, success);
}

/*
    Table Functions
*/

/**
 * Adds a series of cells to a given row.
 * 
 * @param {HTML <tr> Element} row - The row to add the cells to
 * @param {int} start_index - The index of the first cell to be added
 * @param {String[]} values - The values to be added to the row (one cell each)
 */
function addCells(row, start_index, values) {
  // Iterates through the given values to place into the row
  for (let value of values) {
    // Creates a new cell (starting at a given index)
    let cell = row.insertCell(start_index);
    // Fills in the cell with a given value
    cell.innerHTML = value;
    // Moves the pointer to the next cell along
    start_index++;
  }
}

/**
 * Inserts a row containing information about a data store into the table.
 * 
 * @param {String} name - The name of the data store
 * @param {String} description - The description of the data store
 */
function insertDataStore(name, description) {
  // Locates the table body
  let tbody = $("#store_table")[0];
  // Inserts a new row
  let row = tbody.insertRow();
  // Fills in some basic data
  addCells(row, 0, [name, description]);
  // Adds a button to the row that will load the data from the data store into the backend
  let load_button = row.insertCell(2);
  load_button.innerHTML = '<button class="table_button"><img class="button_icon" src="' + load_icon_source + '" /> Load</button>';
  load_button.addEventListener("click", function () {
    loadFromName(name);
  })
  // Adds a button to the row that will delete the data store
  let delete_button = row.insertCell(3);
  delete_button.innerHTML = '<button class="table_button"><img class="button_icon" src="' + delete_icon_source + '" /> Delete</button>';
  delete_button.addEventListener("click", function () {
    deleteStore(name, row);
  })
}

/**
 * Loads all of the data stores into the table.
 */
function loadTable() {
  // Retrieves all the data from the database
  retrieveData(database, function (data) {
    // Inserts the data from each store into the table
    for (let store of data) {
      insertDataStore(store.Name, store.Description);
    }
    // Adds the filler row, if necessary
    addFillerRow();
    // Hides the loading screen
    hideLoadingScreen();
  });
}

/**
 * If the store table is empty, place a filler
 * row into it (that states that no maps have
 * been saved).
 */
function addFillerRow() {
  // If there are no rows in the store table,
  if ($("#store_table")[0].rows.length == 0) {
    // Locates the table body
    let tbody = $("#store_table")[0];
    // Inserts a new row
    let row = tbody.insertRow();
    // Creates a new cell
    let cell = row.insertCell(0);
    // Makes the cell span all columns
    cell.colSpan = 100;
    // Fills in the cell with the message
    cell.innerHTML = "No maps saved.";
  }
}

/*
    Database Functions
*/

/**
 * Loads the contents of a data store by its name.
 * 
 * @param {String} name - The name of the data store
 */
function loadFromName(name) {
  // Shows a loading screen
  showLoadingScreen();
  // Gets the stored data
  retrieveData(database, function (data) {
    // Load the stored data into the backend, and redirect to map.html
    loadMapData(data["Data"]);
  }, name);
}

/**
 * Deletes a store of data by its name (and the row representing it).
 * 
 * @param {String} name - The name of the data store
 * @param {HTML <tr> Element} row - The row representing the data store
 */
function deleteStore(name, row) {
  // Deletes the stored data
  deleteData(database, function () {
    alert("Map deleted successfully.");
    // Removes the row for that data store
    $("#store_table")[0].deleteRow(row.rowIndex-1);
    // Adds the filler row, if necessary
    addFillerRow();
  }, name);
}

/**
 * Wipes all data from the database.
 * 
 * @param {String} name - The name of the data store
 */
function wipeData() {
  // Deletes the stored data
  deleteData(database, function () {
    alert("All maps have been deleted successfully.");
    // Removes all the rows from the table
    $("#store_table tr").remove();
    // Adds the filler row
    addFillerRow();
  });
}

/*
    Misc.
*/
/**
 * Shows a loading message.
 */
function showLoadingScreen() {
  $(".overlay")[0].style.display = "block";
}

/**
 * Hides a loading message.
 */
function hideLoadingScreen() {
  $(".overlay")[0].style.display = "none";
}

// Once the document has been loaded,
$(document).ready(function () {
  // Show a loading screen
  showLoadingScreen()
  // Attempt to load the data stores into the table
  try {
    loadTable();
  }
  // If loadTable() is called before openDB() has finished opening the database,
  catch(error) {
    // Reload the page
    location.reload();
  }
});

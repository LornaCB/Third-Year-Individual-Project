// Locate the version of indexedDB used on the user's browser
const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;

/*
    Database Functions
*/

/**
 * Opens a connection to the database.
 */
function openDB() {
  // Makes a request to open the "data_cache" database
  let openRequest = indexedDB.open("data_cache", 14);
  // If an error occurs, print it to the console
  openRequest.onerror = function(event) {
    console.error("An error occurred when trying to open the database.");
    console.error(event);
  };
  let wipe_data = false;
  // If the data cache table is not up to date,
  openRequest.onupgradeneeded = function(event) {
    let db = openRequest.result;
    switch(event.oldVersion) {
      // If the database has never been initialised,
      case 0:
        // Creates an object store to hold the map data caches
        db.createObjectStore("Cached Data", {keyPath: "Name"});
        break;
      default:
        wipe_data = true;
    }
  };
  // If the request is successful,
  openRequest.onsuccess = function () {
    let db = openRequest.result;
    if (wipe_data) {
      deleteData(db, function() {
        alert("Due to updates in the way map data is stored, we've had to delete your old data. \n Apologies for any inconvenience this has caused.");
      });
    }
    console.log("Database is up to date.");
    // Allow the database to be accessed via a global variable
    database = db;
  }
}

/**
 * Stores the current map data into the database.
 * 
 * @param {IDBDatabase} db - The database to store the data into
 * @param {String} name - The name given to this data store
 * @param {String} description - The description for this data store
 * @param {JSON Array} nodes - The OSM data for the nodes
 * @param {JSON Array} ways - The OSM data for the ways
 * @param {JSON Array} rels - The OSM data for the relations
 * @param {JSON Array} quick_ways - The OSM data for the ways, but only the data needed for rendering
 * @param {JSON Array} named_nodes - The OSM data for the nodes that have names (the only ones worth rendering)
 * @param {function} callback - The function to run when the data has been stored successfully
 */
function storeData(db, name, description, nodes, ways, rels, quick_ways, named_nodes, callback) {
  // Begin a read-write transaction to the "Cached Data" object store
  let transaction = db.transaction("Cached Data","readwrite");
  let store = transaction.objectStore("Cached Data");
  // Create a JSON object containing all the map data
  let data = {
    Name: name,
    Description: description,
    Data: {
      Nodes: nodes,
      Ways: ways,
      Rels: rels,
      Quick_Ways: quick_ways,
      Named_Nodes: named_nodes
    }
  };
  // Put the data into the database
  let request = store.put(data);
  // When the transaction is complete, announce it
  transaction.oncomplete = function(event) {
    console.log("Data stored successfully.");
    callback();
  };
  // If an error occurs, announce it and print the error to the console
  transaction.onerror = function (event) {
    console.error("An error occurred when trying to store the data.");
    console.error(event);
  };
}

/**
 * Retrieves data stored in the database.
 * 
 * @param {IDBDatabase} db - The database to retrieve the data from
 * @param {function} callback - The function to run when the data has been retrieved successfully
 * @param {String} name - The name of the data store to retrieve
 */
function retrieveData(db, callback, name = "") {
  // Begin a read-only transaction to the "Cached Data" object store
  let transaction = db.transaction("Cached Data","readonly");
  let store = transaction.objectStore("Cached Data");
  // Make a request to retrieve data
  let request;
  // If no name is provided, get all the data
  if (name == "") {
    request = store.getAll();
  }
  // Otherwise, retrieve only that data store
  else {
    request = store.get(name);
  }
  // If an error occurs, announce it and print the error to the console
  request.onerror = function(event) {
    console.log("An error occurred when trying to retrieve the stored data.");
    console.log(event);
  }
  request.onsuccess = function() {
    // Retrieve the data from the object store
    console.log("Data retrieved successfully.");
    callback(request.result);
  }
}

/**
 * Deletes data stored in the database.
 * 
 * @param {IDBDatabase} db - The database to delete the data from
 * @param {function} callback - The function to run when the data has been retrieved successfully
 * @param {String} name - The name of the data store to delete
 */
function deleteData(db, callback, name = "") {
  // Begin a read-write transaction to the "Cached Data" object store
  let transaction = db.transaction("Cached Data","readwrite");
  let store = transaction.objectStore("Cached Data");
  // Make a request to delete data
  let request;
  // If no name is provided, delete all the data
  if (name == "") {
    request = store.clear();
  }
  // Otherwise, delete only that data store
  else {
    request = store.delete(name);
  }
  // If an error occurs, announce it and print the error to the console
  request.onerror = function(event) {
    console.log("An error occurred when trying to delete the stored data.");
    console.log(event);
  }
  request.onsuccess = function() {
    // Retrieve the data from the object store
    console.log("Data deleted successfully.");
    callback();
  }
}

// Holds a reference to the database after it has been opened
var database;

// Opens the "data_cache" database
// (Attempts to do this before any data-retrieval functions are run)
// (I'm not nesting even more functions into these functions)
openDB();

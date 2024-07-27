/*
    Sending requests to the API
*/

/**
 * Sends a query to the backend as a POST request.
 * 
 * @param {String} query - Query to send to backend
 */
function sendQuery(query) {
  // Sets the parameters for the POST request
  let url = "/api/post/get_map_data";
  let json = {query: query};
  let success = loadMapData;
  // Shows a loading message to the user
  showLoadingScreen();
  // Sends the POST request
  sendPOSTRequest(url, json, success);
}

/**
 * Gets a map from a set of coordinates.
 * 
 * @param {float[]} coordinates - The coordinates to send to backend
 */
function sendCoordinates(coordinates) {
  // Sets the parameters for the POST request
  let url = "/api/post/get_coordinates_map";
  let json = {coordinates: coordinates};
  let success = loadMapData;
  // Shows a loading message to the user
  showLoadingScreen();
  // Sends the POST request
  sendPOSTRequest(url, json, success);
}

/**
 * Gets a map from a postal code.
 * 
 * @param {String} postcode - The postal code to send to backend
 * @param {String} country - The country the postal code is for
 */
function sendPostcode(postcode, country) {
  // Sets the parameters for the POST request
  let url = "/api/post/get_postcode_map";
  let json = {postcode: postcode, country: country};
  let success = loadMapData;
  // Shows a loading message to the user
  showLoadingScreen();
  // Sends the POST request
  sendPOSTRequest(url, json, success);
}

/**
 * Gets test data when my wifi decides to be shit.
 */
function fuckingWifi() {
  // Sets the parameters for the POST request
  let url = "/api/post/get_test_data"
  let json = {};
  let success = loadMapData;
  // Shows a loading message to the user
  showLoadingScreen();
  // Sends the POST request
  sendPOSTRequest(url, json, success);
}

/*
    Processing OSM data
*/

/**
 * Converts OSM JSON data into a useful format.
 * 
 * @param {JSON Array} data - The OSM data from the backend
 */
function formatOSMJSON(data) {
  // Initialises three empty arrays
  let nodes = [];
  let ways = [];
  let rels = [];
  // Iterates through the OSM JSON data, looking at each element
  for (let element of data["elements"]) {
    // If the element is a node,
    if (element['type'] == 'node') {
      // Put it into the "nodes" array
      nodes.push(element);
    }
    // If the element is a way,
    else if (element['type'] == 'way') {
      // Put it into the "ways" array
      ways.push(element);
    }
    // If the element is something else,
    else {
      // Put it into the "rels" array (for relations)
      rels.push(element);
    }
  }
  // Return the three arrays
  return [nodes, ways, rels];
}

/**
 * Loads the received OSM data into the backend so that it can be rendered by map.html.
 * 
 * @param {JSON Array} data - The OSM data from the backend
 */
function loadMapData(data) {
  // State that the request for data was successful
  console.log("Request successful.");
  // Format response's OSM data
  let formatted = formatOSMJSON(data);
  let nodes = formatted[0];
  let ways = formatted[1];
  let rels = formatted[2];
  // Sets the parameters for the POST request
  let url = "/api/post/load_map_data";
  // Create a JSON object containing the data to return to the backend
  let json = {
    "nodes" : nodes,
    "ways" : ways,
    "rels" : rels,
    "quick_ways" : [],
    "named_nodes" : {},
    "from_store" : false
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
    Processing user inputs
*/

/**
 * Process data from the form side.
 */
function processForm() {
  // Gets data from the user
  let county = $("#county")[0].value;
  let town = $("#town")[0].value;
  // Adds the data to a list, from the smallest region to the largest region
  let regions = [town, county];
  // Initialises the query as an empty string
  let query = "";
  // Initialises the part of the query that will hold the search parameters as an empty string
  let part = "";
  // Holds names for the Overpass QL variables
  let overpass_variables = ["town","county"];
  // Holds a single region
  let region;
  // Holds the name of the Overpass QL variable for one part of the query
  let variable_name;
  // Goes through each piece of data
  for (let i = 0; i < regions.length; i++) {
    region = regions[i];
    // If a piece of data has been entered for that region,
    if (!($.trim(region).length === 0)) {
      // If the region is not capitalised,
      if (!(region.charAt(0) === region.charAt(0).toUpperCase())) {
        // Make it capitalised and use the capitalised version instead
        region = capitaliseName(region);
      }
      variable_name = overpass_variables[i];
      // Integrate it into the query
      // If the region has a hyphen in its name, search for everything like it
      if (region.includes("-")) {
        query += `area["name"~"${region}", i]->.${variable_name}; \n`;
      }
      // If the region does not, search for the exact name
      else {
        query += `area["name"="${region}"]->.${variable_name}; \n`;
      }
      part += `(area.${variable_name})`;
    }
  }
  // Checks if anything has been integrated into the query,
  if (!($.trim(query).length === 0)) {
    // If so, finishes off the query
    /* Should be in the format:
      (
      way(area);
      >;
      node(area);
      );
      to retrieve all nodes and ways. The newlines are for the purposes of readability
    */
    // ( way(area);
    query += ("(\n way" + part + ";\n");
    // >;
    query += (" >;\n");
    // node(area); );
    query += (" node" + part + ";\n);\n");
    // Logs the query to the console
    console.log(query);
    // and sends it to the backend
    sendQuery(query);
  }
  else {
    // If not, ask the user to fill in at least one field
    alert("Please fill in at least one field.");
  }
}

/**
 * Checks whether a given postcode is in a valid format.
 * 
 * @param {String} postcode - The postal code to validate
 * @return {boolean} - Whether the postcode is valid or not
 */
function validatePostcode(postcode) {
  // Postcode is assumed to be valid
  let valid = true;
  // Checks if a postcode has been entered
  if ($.trim(postcode).length === 0) {
    // If not, declare as invalid
    valid = false;
    alert("Please enter a postal code.");
  }
  return valid;
}

/**
 * Searches for a node with a particular postcode
 * and makes a map of the area around it.
 */
function postcodeSearch() {
  // Gets the postcode from the user
  let postcode = $("#postcode")[0].value;
  // Gets the country from the user
  let country = $("#country")[0].value;
  // Checks if the postcode is valid
  let valid = validatePostcode(postcode, country);
  // If the postcode is valid,
  if (valid) {
    // Sends the postcode to the backend
    // (So that a map can be made out of it)
    sendPostcode(postcode, country);
  }
}

/**
 * Checks whether a given set of coordinates is valid.
 * 
 * @param {String[]} coordinates - The coordinates to validate
 * @return {boolean} - Whether the coordinates are valid or not
 */
function validateCoordinates(coordinates) {
  // Holds whether the coordinates are valid or not
  let valid;
  // Check that coordinates have been provided
  if (coordinates[0] != "" && coordinates[1] != "") {
    // Check that the coordinates are numbers
    if (!isNaN(coordinates[0]) && !isNaN(coordinates[1])) {
      let lon = parseFloat(coordinates[0]);
      let lat = parseFloat(coordinates[1]);
      // Check that each coordinate is in the correct range
      // Check latitude
      if (-90 <= lat <= 90) {
        // Check longitude
        if (-180 <= lon <= 180) {
          valid = true;
        }
        else {
          alert("Longitude must be within the range -180 to 180.");
          valid = false;
        }
      }
      else {
        alert("Latitude must be within the range -90 to 90.");
        valid = false;
      }
    }
    else {
      alert("Coordinates must be numbers.");
      valid = false;
    }
  }
  else {
    alert("You must enter both a latitude and longitude coordinate.");
    valid = false;
  }
  // Return whether the coordinates are valid or not
  return valid;
}

/**
 * Generates a map of an area from a set of
 * coordinates. (Its centre point.)
 */
function coordinatesSearch() {
  // Retrieve the coordinates from user input
  let lon = $("#longitude")[0].value;
  let lat = $("#latitude")[0].value;
  // Validate coordinates
  let valid = validateCoordinates([lon, lat]);
  // If valid, create a bounding box query using them as the centre point
  if (valid) {
    // Convert the coordinates to floats
    lon = parseFloat(lon);
    lat = parseFloat(lat);
    // Sends the coordinates to the backend
    // (So that a map can be made out of them)
    sendCoordinates([lon, lat]);
  }
}

/*
    Misc.
*/
/**
 * Shows a loading message and disables the search buttons.
 */
function showLoadingScreen() {
  $(".overlay")[0].style.display = "block";
  for (let button of $(".search_button")) {
    button.disabled = true;
  }
}

/**
 * Takes a name and capitalises the first letter of each part of it.
 * 
 * @param {String} name - The region name to be capitalised
 * @return {String} - The word, but capitalised
 */
function capitaliseName(name) {
  if (name.length > 1) {
    let parts = name.split(" ");
    for (let i = 0; i < parts.length; i++) {
      parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
    }
    return parts.join(" ");
  }
  else {
    return name.charAt(0).toUpperCase();
  }
}

/**
 * Returns the user to the index page.
 */
function kickIfOffline() {
  alert("This page cannot be used without an internet connection.");
  location.href = "/";
}

/**
 * Fills the "country" drop-down menu with the available countries.
 */
function fillCountries() {
  // Locates the "country" drop-down menu
  let drop_down = $("#country")[0];
  // Option to be added to the drop-down menu
  let option;
  // Goes through each available country
  for(let country in countries) {
    // Creates a new option for the drop-down menu
    option = document.createElement("option");
    // Displays the full name of that country
    option.text = country;
    // Returns the code for that country
    option.value = countries[country];
    // Selects United Kingdom by default (because we're British)
    if (countries[country] == "GB") {
      option.selected = true;
    }
    // Adds the option to the drop-down menu
    drop_down.options.add(option);
  }
}

/**
 * Checks if the ENTER key has been pressed, and,
 * if so, executes a given function.
 * 
 * @param {KeyboardEvent} event - The keydown event
 * @param {Function} func - The function to run when the ENTER key is pressed
 */
function enterKeyShortcut(event, func) {
  // Checks if the ENTER key has been pressed
  if (event.key === "Enter") {
    // Cancels the default response to pressing the ENTER key
    event.preventDefault();
    // Executes the given function instead
    func();
  }
}

/**
 * Allows the user to submit a form using
 * the ENTER key.
 */
function addShortcut() {
  // Adds shortcut to the Map Of City form
  $("#town")[0].addEventListener("keydown", (event) => {
    enterKeyShortcut(event, processForm);
  });
  $("#county")[0].addEventListener("keydown", (event) => {
    enterKeyShortcut(event, processForm);
  });
  // Adds shortcut to the postal code search form
  $("#postcode")[0].addEventListener("keydown", (event) => {
    enterKeyShortcut(event, postcodeSearch);
  });
  // Adds shortcut to the coordinates search form
  $("#latitude")[0].addEventListener("keydown", (event) => {
    enterKeyShortcut(event, coordinatesSearch);
  });
  $("#longitude")[0].addEventListener("keydown", (event) => {
    enterKeyShortcut(event, coordinatesSearch);
  });
}

/*
    Constants
*/

/* Contains all of the countries that can have a postal-code-search performed
 * on them, along with their respective codes.
 */
var countries = {
  "Åland Islands" : "AX",
  "Algeria" : "DZ",
  "American Samoa" : "AS",
  "Andorra" : "AD",
  "Argentina" : "AR",
  "Austria" : "AT",
  "Australia" : "AU",
  "Azerbaijan" : "AZ",
  "Bangladesh" : "BD",
  "Belarus" : "BY",
  "Belguim" : "BE",
  "Bermuda" : "BM",
  "Brazil" : "BR",
  "Bulgaria" : "BG",
  "Canada" : "CA",
  "Chile" : "CL",
  "Colombia" : "CO",
  "Costa Rica" : "CR",
  "Croatia" : "HR",
  "Cyprus" : "CY",
  "Czechia" : "CZ",
  "Denmark" : "DK",
  "Dominican Republic" : "DO",
  "Estonia" : "EE",
  "Faroe Islands" : "FO",
  "Federated States of Micronesia" : "FM",
  "Finland" : "FI",
  "France" : "FR",
  "French Guiana" : "GF",
  "Germany" : "DE",
  "Greenland" : "GL",
  "Guadeloupe" : "GP",
  "Guam" : "GU",
  "Guatemala" : "GT",
  "Guernsey" : "GG",
  "Haiti" : "HT",
  "Holy See" : "VA",
  "Hungary" : "HU",
  "Iceland" : "IS",
  "India" : "IN",
  "Ireland" : "IE",
  "Isle of Man" : "IM",
  "Italy" : "IT",
  "Japan" : "JP",
  "Jersey" : "JE",
  "Latvia" : "LV",
  "Liechtenstein" : "LI",
  "Lithuania" : "LT",
  "Luxembourg" : "LU",
  "Malawi" : "MW",
  "Malaysia" : "MY",
  "Malta" : "MT",
  "Marshall Islands" : "MH",
  "Martinique" : "MQ",
  "Mayotte" : "YT",
  "Mexico" : "MX",
  "Monaco" : "MC",
  "Netherlands" : "NL",
  "New Caledonia" : "NC",
  "New Zealand" : "NZ",
  "Northern Mariana Islands" : "MP",
  "Norway" : "NO",
  "Pakistan" : "PK",
  "Palau" : "PW",
  "Peru" : "PE",
  "Philippines" : "PH",
  "Poland" : "PL",
  "Portugal" : "PT",
  "Puerto Rico" : "PR",
  "Republic of North Macedonia" : "MK",
  "Republic of Moldova" : "MD",
  "Republic of Korea" : "KR",
  "Réunion" : "RE",
  "Romania" : "RO",
  "Russian Federation" : "RU",
  "Saint Pierre and Miquelon" : "PM",
  "San Marino" : "SM",
  "Serbia" : "RS",
  "Singapore" : "SG",
  "Slovakia" : "SK",
  "Slovenia" : "SI",
  "South Africa" : "ZA",
  "Spain" : "ES",
  "Sri Lanka" : "LK",
  "Svalbard and Jan Mayen Islands" : "SJ",
  "Sweden" : "SE",
  "Switzerland" : "CH",
  "Thailand" : "TH",
  "Turkey" : "TR",
  "Ukraine" : "UA",
  "United Kingdom" : "GB",
  "United States of America" : "US",
  "United States Virgin Islands" : "VI",
  "Uruguay" : "UY",
  "Wallis and Futuna Islands" : "WF"
}

/*
    Sequence
*/

/**
 * Kicks the user to the index page if a drop in internet connection is detected
 */
window.addEventListener("offline", function() {
  kickIfOffline();
})

// Once the document has been loaded,
$(document).ready(function () {
  // If no internet connection is detected,
  if (!navigator.onLine) {
    // Kick the user back to the index page
    kickIfOffline();
  }
  else {
    // Otherwise, fill in the "country" drop-down menu with all available countries
    fillCountries();
    // and add a shortcut for submitting a form (via the ENTER key)
    addShortcut();
  }
});

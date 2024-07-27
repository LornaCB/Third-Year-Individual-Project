/*
 *  Functions
 */

/**
 * Returns the user to the index page.
 */
function goHome() { 
    location.href = "/"; 
}

/**
 * Adds an option to an accessibility drop-down menu.
 * 
 * @param {HTML select element} drop_down - The accessibility drop-down to add the choice to
 * @param {String} value - A choice of accessbility setting
 * @param {String} id - String to use as this option's ID
 */
function addOption(drop_down, value, id) {
    // Creates a new option for the drop-down menu
    let option = document.createElement("option");
    // Displays the name of the choice
    option.text = value;
    // Returns the reference for that choice
    option.value = value;
    // Creates a reference to this option
    option.id = id;
    // Adds the option to the drop-down menu
    drop_down.options.add(option);
}

/**
 * Sets the website to a specific colour scheme and text size.
 * 
 * @param {String} colour_identifier - The identifier for the colour scheme to be set
 * @param {String} text_identifier - The identifier for the text size to be set
 */
function setOptions(colour_identifier, text_identifier) {
    // If the given identifier is not a valid identifier for a colour scheme,
    if (!(Object.keys(all_colour_schemes).includes(colour_identifier))) {
        // Set it to the default colour scheme
        colour_identifier = "Default";
    }
    // If the given identifier is not a valid identifier for a text size,
    if (!(Object.keys(all_text_sizes).includes(text_identifier))) {
        // Set it to the default text size
        text_identifier = "Default";
    }
    // Sets the root to the correct classes
    document.documentElement.className = (all_text_sizes[text_identifier] + " " + all_colour_schemes[colour_identifier]);
    // Records the current colour scheme and text size
    current_colour_scheme = colour_identifier;
    current_text_size = text_identifier;
}

/**
 * Loads the correct stylesheets based on the user's accessibility
 * preferences.
 */
function loadStyle() {
    // Gets the user's chosen text size from localStorage
    let size_choice = localStorage.getItem("text_size_choice");
    // Gets the user's chosen colour scheme from localStorage
    let colour_choice = localStorage.getItem("colour_scheme_choice");
    // Sets the website to the correct text size and colour scheme
    setOptions(colour_choice, size_choice);
    // If the user is on map.html,
    if (location.pathname == "/map") {
        // If the default colour scheme has not been selected,
        if (colour_choice != "Default") {
            // Switch to the correct colour scheme
            switchColourScheme(colour_choice);
        }
    }
}

/**
 * Loads the accessibility options into the text size
 * and colour scheme drop-down menus.
 */
function loadChoices() {
    // Load text size choices
    let text_size_options = document.getElementById("text_size_select");
    let text_id = "_text_option"
    for(let choice in all_text_sizes) {
        addOption(text_size_options, choice, (choice + text_id));
    }
    // Gets the user's chosen text size from localStorage
    let size_choice = localStorage.getItem("text_size_choice");
    // If no choice was stored, select the default one
    if (size_choice == null) {
        size_choice = "Default";
    }
    size_choice += text_id;
    // Selects the user's chosen option
    document.getElementById(size_choice).selected = true;

    // Load colour scheme choices
    let colour_scheme_options = document.getElementById("colour_scheme_select");
    let colour_id = "_colour_option";
    for(let choice in all_colour_schemes) {
        addOption(colour_scheme_options, choice, (all_colour_schemes[choice] + colour_id));
    }
    // Gets the user's chosen colour scheme from localStorage
    let colour_choice = localStorage.getItem("colour_scheme_choice");
    // If no choice was stored, select the default one
    if (colour_choice == null) {
        colour_choice = "Default";
    }
    colour_choice = (all_colour_schemes[colour_choice] + colour_id);
    // Selects the user's chosen option
    document.getElementById(colour_choice).selected = true;
}

/**
 * Changes the text_size CSS file being used (and thus 
 * the size of the text) in response to user selection.
 */
function changeTextSize() {
    // Gets the desired text size from the drop-down menu
    let desired = document.getElementById("text_size_select").value;
    // Sets the desired text size
    setOptions(current_colour_scheme, desired);
    // Stores the user's choice in the browser
    localStorage.setItem("text_size_choice", desired);
}

/**
 * Changes the colour scheme to be used
 * throughout the application.
 */
function changeColourScheme() {
    // Gets the desired colour scheme from the drop-down menu
    let desired = document.getElementById("colour_scheme_select").value;
    // Sets the root to the right colour scheme
    setOptions(desired, current_text_size);
    // Stores the user's choice in the browser
    localStorage.setItem("colour_scheme_choice", desired);
    // If the user is on map.html,
    if (location.pathname == "/map") {
        // Switch to the correct colour scheme
        switchColourScheme(desired);
    }
}

/*
 *  Variables and Constants
 */

// All available colour schemes
// (Identifier : Class Name)
var all_colour_schemes = {
    "Default" : "default",
    "Dark Mode" : "dark",
    "Coffee Cream" : "cream",
    "Red-Blind Default" : "protanomaly",
    "Red-Blind Dark" : "protanomaly-dark",
    "Green-Blind Default" : "deuteranomaly",
    "Green-Blind Dark" : "deuteranomaly-dark",
    "Blue-Blind Default" : "tritanomaly",
    "Blue-Blind Dark" : "tritanomaly-dark",
    "Greyscale" : "greyscale"
};

// All available text sizes
var all_text_sizes = {
    "Default" : "default_size",
    "125%" : "bigger_size",
    "150%" : "larger_size",
    "175%" : "greater_size",
    "200%" : "largest_size",
};

// Records which text size and colour scheme is currently being chosen
var current_text_size;
var current_colour_scheme;

/*
 *  Sequence
 */

// Before the page loads, switch to the correct style choices
loadStyle();

// When the page is loaded, load the accessibility choices
document.addEventListener('DOMContentLoaded', loadChoices);
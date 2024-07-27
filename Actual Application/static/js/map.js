/*
    This file is quite large, so I'd recommend using CTRL+F with the title of one
    of these sections if you want to find something specific.

    Contents:
      - Canvas Drawing Subroutines
      - Mathematical Translation Subroutines
      - Map Drawing Subroutines
      - Map Manipulation Subroutines
      - Button Functions
      - Initialisation Subroutines
      - Data Storage Functions
      - Map Key Subroutines
      - Search/Highlight Subroutines
      - Misc. Subroutines
      - Global Variables/Constants
        - Constants
        - Variables for drawing the map
        - Variables for panning the map
        - Other Variables
      - Sequence
*/

/*
    Canvas Drawing Subroutines
*/

/**
 * Draws a circle onto a canvas.
 * 
 * @param {int} id - ID of the HTML canvas element to draw the circle onto
 * @param {int} x - the x coordinate of the centre of the circle
 * @param {int} y - the y coordinate of the centre of the circle
 * @param {int} radius - the radius of the circle
 * @param {String} colour - the colour of the circle
 */
function drawCircle(id, x, y, radius, colour)  {
  // Locates the canvas by its ID
  let canvas = $("#" + id)[0];
  // Gets the context of the canvas with the perspective of it being a 2D plain
  let context = canvas.getContext("2d");
  // Sets the colour that the context will use when filling a shape
  context.fillStyle = colour;
  // Sets the colour and width of the border
  context.strokeStyle = "rgb(0,0,0)";
  context.lineWidth = radius / 8;
  // Starts to draw a path
  context.beginPath();
  // Draws an arc (x,y,radius,starting angle, ending angle, anti-clockwise?)
  context.arc(x,y,radius,0,Math.PI * 2,true);
  // Closes the path
  context.closePath();
  // Fills in the circle
  context.fill();
  // and gives it a border
  context.stroke();
}

/**
 * Draws a rectangle onto a canvas.
 * 
 * @param {int} id - ID of the HTML canvas element to draw the rectangle onto
 * @param {int} x - the x coordinate of the centre of the rectangle
 * @param {int} y - the y coordinate of the centre of the rectangle
 * @param {int} width - the width of the rectangle
 * @param {int} height - the height of the rectangle
 * @param {String} colour - the colour of the rectangle
 */
function drawRectangle(id, x, y, width, height, colour){
  // Locates the canvas by its ID
  let canvas = $("#" + id)[0];
  // Gets the context of the canvas with the perspective of it being a 2D plain
  let context = canvas.getContext("2d");
  // Sets the colour to fill in the rectangle with
  context.fillStyle = colour;
  // Draws and fills in a rectangle, using the given dimensions and centre coordinates
  context.fillRect((x - (width / 2)), (y - (height / 2)), width, height);
}

/**
 * Draws a line onto a canvas.
 * 
 * @param {int} id - ID of the HTML canvas element to draw the line onto
 * @param {int[][]} coords - the coordinates the line must pass through
 * @param {int} width - the width of the line
 * @param {String} colour - the colour of the line
 * @param {boolean} fill - whether to fill in the line or not
 */
function drawLine(id, coords, width, colour, fill) {
  // Locates the canvas by its ID
  let canvas = $("#" + id)[0];
  // Gets the context of the canvas with the perspective of it being a 2D plain
  let context = canvas.getContext("2d");
  // Cosmetics
  context.lineWidth = width;
  // Moves to the starting coordinates
  context.moveTo(coords[0][0], coords[0][1]);
  // Starts to draw a path
  context.beginPath();
  for(let i = 0; i < coords.length; i++) {
    // Draws a line to the next coordinate
    context.lineTo(coords[i][0], coords[i][1]);
  }
  // If the resulting polygon should be filled in,
  if (fill) {
    context.fillStyle = colour;
    // Fill it in
    context.fill();
  }
  // If not,
  else {
    context.strokeStyle = colour;
    // Traces over the path
    context.stroke();
  }
}

/**
 * Draws a line of text onto a canvas. Ability to draw text at an angle was
 * adapted from this answer to a StackOverflow question:
 * https://stackoverflow.com/questions/3167928/drawing-rotated-text-on-a-html5-canvas/5400970#5400970
 * 
 * @param {String} id - The ID of the canvas element to draw on
 * @param {String} text - The text to draw onto the canvas
 * @param {int} x - The x-coordinate of the centre of the text
 * @param {int} y - The y-coordinate of the centre of the text
 * @param {int} angle - The angle of the text (in degrees)
 * @param {int} size - The font size of the text
 * @param {String} colour - The colour of the text
 * @param {boolean} outline - Whether the text should be given an outline or not
 * @param {String} align - How to align the text
 */
function drawText(id, text, x, y, angle, size, colour, outline, align) {
  // Locates the canvas by its ID
  let canvas = $("#" + id)[0];
  // Gets the context of the canvas with the perspective of it being a 2D plain
  let context = canvas.getContext("2d");
  // Gets the necessary font family (should be same as paragraph's)
  let font_family = $("p").css("font-family");
  // Cosmetics
  context.fillStyle = colour;
  context.textAlign = align;
  context.font = size.toString() + "px " + font_family;
  // Makes note of the current positioning of the canvas
  context.save();
  // Translates the canvas so that its 0,0 is the text's x,y
  context.translate(x, y);
  // Rotates the canvas so that the text may be drawn at an angle
  context.rotate(angle * (Math.PI / 180));
  // If a border needs to be added
  if (outline) {
    context.strokeStyle = "rgb(0,0,0)";
    context.lineWidth = size / 5;
    context.miterLimit = 2;
    context.lineJoin = "round";
    // Draws the outline
    context.strokeText(text, 0, 0);
  }
  // Draws the text
  context.fillText(text, 0, 0);
  // Returns the canvas to its origin positioning
  context.restore();
}

/*
    Mathematical Translation Subroutines
*/

/**
 * Translates a set of coordinates into their correct position on the HTML5 canvas, based on scale and relative point.
 * 
 * @param {int[]} coords - a set of x,y coordinates
 * @return {int[]} - translated x,y coordinates
 */
function translateCoords(coords) {
  // Get the centre point of the map
  let centre = [map_width/2, map_height/2];
  // Calculates the x-coordinate of the node
  /*
  - data["lon"] - relative_point[0] is the x-coordinate relative to the x-coordinate of the relative point
  - (The relative point is the point that should be at the centre of the map.)
  - (data["lon"] - relative_point[0])*scale is the relative x-coordinate when the map has been scaled
  - (data["lon"] - relative_point[0])*scale + centre[0] translates this relative x-coordinate onto the HTML5 canvas
  */
  let x = ((coords[0] - relative_point[0])*scale) + centre[0];
  // Calculates the y-coordinate of the node
  /*
  - [Same logic as above]
  - The multiplication by -1 is done to account for the fact that HTML5 canvas uses an upside-down y-axis
  */
  let y = ((coords[1] - relative_point[1])*scale)*-1 + centre[1];
  // Return the translated coordinates
  return [x,y];
}

/**
 * Translates the coordinates of a node.
 * 
 * @param {JSON Object} data - data for a single node
 * @return {int[]} - translated x,y coordinates for that node
 */
function translateNode(data) {
  return translateCoords([data.lon, data.lat]);
}

/**
 * Gets the angle between two sets of coordinates.
 * 
 * @param {int[]} coords_1 - First set of coordinates
 * @param {int[]} coords_2 - Second set of coordinates
 * @return {int} - Angle between those coordinates in degrees
 */
function angleBetweenTwoCoordinates(coords_1, coords_2) {
  let delta_y = coords_2[1] - coords_1[1];
  let delta_x = coords_2[0] - coords_1[0];
  let angle_in_radians = Math.atan(delta_y / delta_x);
  return (angle_in_radians * (180 / Math.PI));
}

/*
    Finding Related Data
*/

/**
 * Performs a binary search (for an item).
 * 
 * @param {int} goal - ID of the desired item
 * @param {JSON Array} array - array of items
 * @return {JSON Object} - the data for the desired item
 */
function binarySearch(goal, array) {
  // The starting index of the array/sub-array to search through
  let start = 0;
  // The ending index of the array/sub-array to search through
  let end = array.length - 1;
  // The index of the item in the middle of the array/sub-array
  let mid;
  // The ID of the item in the middle
  let mid_id;
  // While there is still an array/sub-array to search through,
  while (start <= end) {
    // Get the item in the middle of the array/sub-array and its ID
    mid = Math.floor((start + end) / 2);
    mid_id = array[mid].id;
    // If its ID is the same as the goal item,
    if (mid_id === goal) {
      // Return the middle item
      return array[mid];
    }
    // If the goal ID is more than its ID,
    else if (goal > mid_id) {
      // Create a sub-array that starts with the item after the middle item
      start = mid + 1;
    }
    // If the goal ID is less than its ID,
    else {
      // Create a sub-array that ends with the item before the middle item
      end = mid - 1;
    }
  }
  // If the desired item is not located within the array, throw an error
  throw "The binary search has gone wrong, or data is missing";
}

/**
 * Finds a node based on its ID.
 * 
 * @param {int} id - the ID of the node to be found
 * @return {JSON Object} - the data for the desired node
 */
function findNode(id) {
  // Performs a binary search to locate the node
  return binarySearch(id, nodes);
}

/*
    Map Drawing Subroutines
*/

/**
 * Sets the size of the map based on the dimensions of the user's browser.
 */
function setMapSize() {
  // Get the width and height of the window
  let width = window.innerWidth;
  let height = window.innerHeight;
  // Generate a width and height for the map
  map_width = width * 0.35;
  map_height = height * 0.6;
  // Give the HTML canvas the new dimensions
  let map = $("#map")[0];
  map.width = map_width;
  map.height = map_height;
  // Draw the map again
  drawMap();
}

/**
 * Wipes the map clean.
 */
function clearMap() {
  // Locates the canvas by its ID
  let canvas = $("#map")[0];
  // Gets the context of the canvas with the perspective of it being a 2D plain
  let context = canvas.getContext("2d");
  // Clears the canvas
  context.clearRect(0, 0, map_width, map_height);
}

/**
 * Draws a label onto a way.
 * 
 * @param {int[]} node_coords - Coordinates of the nodes that make up the way
 * @param {String} name - The name of the way
 * @param {int} line_width - The thickness of the line that makes up the way
 * @param {int} font_size - Sets the font size of the text
 */
function labelWay(node_coords, name, line_width, font_size) {
  // If a name has been is given,
  if (name != "") {
    // Get the centre two nodes
    let centre_index = Math.floor(node_coords.length / 2);
    let centre_node_1 = node_coords[centre_index - 1];
    let centre_node_2 = node_coords[centre_index];
    // Get the angle between them
    let angle = angleBetweenTwoCoordinates(centre_node_1, centre_node_2);
    // Gets the coordinates of midway between those two nodes
    let x = (centre_node_1[0] + centre_node_2[0]) / 2;
    // (Move y down based on the width of the line)
    let y = ((centre_node_1[1] + centre_node_2[1]) / 2) + (line_width / 2);
    // Draws the label
    drawText("map", name, x, y, angle, font_size, "rgb(255,255,255)", true, "center");
  }
}

/**
 * Determines the correct colour group for a way.
 * 
 * @param {JSON Object} way - The way to determine the colour group of
 * @return {String} - The colour group to use for that way
 */
function getWayColour(way) {
  // Set the colour_group to the default way colour
  let colour_group = "default way";
  // Holds the value of the tag being examined
  let value;
  // Different colour groups for highways
  let highway_groups = [
    ["motorway", "motorway_link", "trunk", "trunk_link", "primary",
        "primary_link", "secondary", "secondary_link", "tertiary",
        "tertiary_link", "unclassified"],
    ["residential", "living_street"],
    ["service", "busway"],
    ["pedestrian", "footway", "bridleway", "steps", "cycleway", "path", "track"]
  ];
  // Different colour groups for landuses
  let landuse_groups = [
    ["aquaculture"],
    ["allotments", "farmland", "farmyard", "vineyard"],
    ["forest", "orchard"],
    ["recreation_ground", "village_green", "flowerbed", "plant_nursery",
        "grass", "meadow", "conservation"],
    ["brownfield"],
    ["cemetery"],
    ["retail"]
  ];
  // Different colour groups for natural features
  let natural_groups = [
    ["water", "bay", "strait"],
    ["heath", "scrub", "tree_row", "wood"],
    ["grassland", "shrubbery", "tundra", "valley"],
    ["beach", "sand"],
    ["glacier"],
    ["mud", "wetland"],
    ["bare_rock", "scree", "cliff", "arete", "ridge"]
  ];
  // Different colour groups for leisure features
  let leisure_groups = [
    ["bathing_place", "fishing", "marina"],
    ["swimming_pool"],
    ["golf_course", "miniature_golf", "pitch", "track", "stadium",
        "recreation_ground"],
    ["park", "dog_park", "garden", "nature_reserve", "horse_riding",
        "playground", "common"],
    ["beach_resort"],
    ["ice_rink"],
    ["outdoor_seating"],
    ["sports_centre"]
  ];
  // Different colour groups for amenities
  let amenity_groups = [
    ["car_park", "parking", "parking_space", "motorcycle_parking"],
    ["restaurant", "university", "school", "place_of_worship",
        "social_facility", "fire_station", "fast_food", "college", "pub"],
    ["bench"],
    ["fountain"],
    ["grave_yard"]
  ];
  // Different colour groups for barriers
  let barrier_groups = [
    ["hedge", "field_boundary"],
    ["fence", "kerb", "gate", "bollard", "guard_rail", "chain"],
    ["wall", "retaining_wall", "city_wall"]
  ];
  // Determine the correct colour_group, if one exists
  // Checks if the way has tags,
  if (way.hasOwnProperty("tags")) {
    // Checks if the way is a waterway,
    if (way.tags.hasOwnProperty("waterway")) {
      // If so, give it the colour group "water"
      colour_group = "water";
    }
    // Checks if the way is a building (or a shop),
    else if (way.tags.hasOwnProperty("building") || way.tags.hasOwnProperty("shop") || way.tags.hasOwnProperty("building:part")) {
      // If so, give it the colour group "building"
      colour_group = "buildings";
    }
    // Checks if the way is an amenity,
    else if (way.tags.hasOwnProperty("amenity")) {
      // If so, extracts and examines the tag's value
      value = way.tags.amenity;
      // Checks each amenity group for an instance of the value
      for(let i = 0; i < amenity_groups.length; i++) {
        if (amenity_groups[i].includes(value)) {
          // If the value is found, assign the way to the correct colour group
          switch(i) {
            case 0:
              colour_group = "car parks";
              break;
            case 1:
              colour_group = "buildings";
              break;
            case 2:
              colour_group = "seating";
              break;
            case 3:
              colour_group = "commercial water";
              break;
            default:
              colour_group = "burial grounds";
          }
          break;
        }
      }
    }
    // Checks if the way is a railway,
    else if (way.tags.hasOwnProperty("railway")) {
      // If so, give it the colour group "railway"
      colour_group = "railways";
    }
    // Checks if the way is a highway
    else if (way.tags.hasOwnProperty("highway")) {
      // Checks if the way is a private access road,
      if (way.tags.hasOwnProperty("access")) {
        if (way.tags.access == "private" || way.tags.access == "no") {
          // If so, state that it is a restricted access road
          return "restricted access roads";
        }
      }
      // If not, extracts and examines the highway tag's value
      value = way.tags.highway;
      // Checks each highway group for an instance of the value
      for(let i = 0; i < highway_groups.length; i++) {
        if (highway_groups[i].includes(value)) {
          // If the value is found, assign the way to the correct colour group
          switch(i) {
            case 0:
              colour_group = "main roads";
              break;
            case 1:
              colour_group = "residential roads";
              break;
            case 2:
              colour_group = "restricted access roads";
              break;
            default:
              colour_group = "pedestrian roads";
          }
          break;
        }
      }
    }
    // Checks if the way is a piece of land with a specific use
    else if (way.tags.hasOwnProperty("landuse")) {
      // If so, extracts and examines the tag's value
      value = way.tags.landuse;
      // Checks each landuse group for an instance of the value
      for(let i = 0; i < landuse_groups.length; i++) {
        if (landuse_groups[i].includes(value)) {
          // If the value is found, assign the way to the correct colour group
          switch(i) {
            // Commercial water
            case 0:
              colour_group = "commercial water";
              break;
            // Vegetation
            case 1:
              colour_group = "commercial vegetation";
              break;
            case 2:
              colour_group = "heavy vegetation";
              break;
            case 3:
              colour_group = "light vegetation";
              break;
            // Other
            case 4:
              colour_group = "mud";
              break;
            case 5:
              colour_group = "burial grounds";
              break;
            default:
              colour_group = "buildings";
          }
          break;
        }
      }
    }
    // Checks if the way is a natural feature
    else if (way.tags.hasOwnProperty("natural")) {
      // If so, extracts and examines the tag's value
      value = way.tags.natural;
      // Checks each nature group for an instance of the value
      for(let i = 0; i < natural_groups.length; i++) {
        if (natural_groups[i].includes(value)) {
          // If the value is found, assign the way to the correct colour group
          switch(i) {
            // Natural water
            case 0:
              colour_group = "natural water";
              break;
            // Vegetation
            case 1:
              colour_group = "heavy vegetation";
              break;
            case 2:
              colour_group = "light vegetation";
              break;
            // Other
            case 3:
              colour_group = "sand";
              break;
            case 4:
              colour_group = "ice";
              break;
            case 5:
              colour_group = "mud";
              break;
            default:
              colour_group = "rock";
          }
          break;
        }
      }
    }
    // Checks if the way is a leisure feature
    else if (way.tags.hasOwnProperty("leisure")) {
      // If so, extracts and examines the tag's value
      value = way.tags.leisure;
      // Checks each leisure group for an instance of the value
      for(let i = 0; i < leisure_groups.length; i++) {
        if (leisure_groups[i].includes(value)) {
          // If the value is found, assign the way to the correct colour group
          switch(i) {
            // Water
            case 0:
              colour_group = "natural water";
              break;
            // Commerical water
            case 1:
              colour_group = "commercial water";
              break;
            // Commerical vegetation
            case 2:
              colour_group = "commercial vegetation";
              break;
            // Light vegetation
            case 3:
              colour_group = "light vegetation";
              break;
            // Sand
            case 4:
              colour_group = "sand";
              break;
            // Ice
            case 5:
              colour_group = "ice";
              break;
            // Outdoor Seating
            case 6:
              colour_group = "seating";
              break;
            // Buildings
            default:
              colour_group = "buildings";
          }
          break;
        }
      }
    }
    // Checks if the way is a barrier
    else if (way.tags.hasOwnProperty("barrier")) {
      // If so, extracts and examines the tag's value
      value = way.tags.barrier;
      // Checks each barrier group for an instance of the value
      for(let i = 0; i < barrier_groups.length; i++) {
        if (barrier_groups[i].includes(value)) {
          // If the value is found, assign the way to the correct colour group
          switch(i) {
            case 0:
              colour_group = "natural barrier";
              break;
            case 1:
              colour_group = "low barrier";
              break;
            default:
              colour_group = "high barrier";
          }
          break;
        }
      }
    }
    // Logs the tags of a way that has not been given a colour
    // (This is so I can identify tags that need categorising.)
    if (colour_group == "default way") {
      console.log(way.tags);
    }
  }
  // If the way does not have any tags, then keep it as the default colour
  return colour_group;
}

/**
 * Creates a node out of a way and adds it to named_nodes.
 * 
 * @param {JSON Object} way - Data for the way (as a quick way)
 * @param {JSON Array} tags - Tags for the way
 * @param {String} colour_group - Colour group the node should belong to
 */
function makeNodeForWay(way, tags, colour_group) {
  // Gets the length of the way's coordinate list
  let len = way.raw_coords.length;
  // Gets the first, middle and last nodes of the way's coordinates
  let first = way.raw_coords[0];
  let middle = way.raw_coords[Math.floor((len - 1) / 2)];
  let last = way.raw_coords[len - 1];
  // Calculates the coordinates of the centroid of the triangle formed by connecting these nodes
  // (The idea is that the centroid will fall within the bounds of the way)
  let x_median = (first[0] + middle[0] + last[0]) / 3;
  let y_median = (first[1] + middle[1] + last[1]) / 3;
  // Creates a node using these coordinates and the way's tags
  let node = {
    lon : x_median,
    lat : y_median,
    tags : tags
  };
  // Check if an array for that colour has already been created
  if (!named_nodes.hasOwnProperty(colour_group)) {
    // If not, creates one
    named_nodes[colour_group] = [];
  }
  // Adds the node to the correct collection of named nodes
  named_nodes[colour_group].push(node);
}

/**
 * Converts all the ways in the "ways" array to quick ways.
 */
function convertWays() {
  // Holds the current node to be processed
  let temp;
  // Holds the raw coordinates from each node
  let raw_coords;
  // Holds the name of the way currently being processed, if it has one
  let name;
  // Holds the colour group of the way currently being processed
  let colour_group;
  // Holds what kind of node to make for the way
  let make_node;
  // Holds the current quick way being processed
  let quick_way;
  // Holds all the ways that aren't areas so that they can be drawn over areas
  let non_areas = [];
  // Goes through each way in the array
  for (let way of ways) {
    // Reset the value of make_node
    make_node = null;
    // Empties the raw_coords array
    raw_coords = [];
    // Sets the name to null by default
    name = "";
    // By default, a way will be included in the map
    leave_out = false;
    // Check the way's tags
    if (way.hasOwnProperty("tags")) {
      // If the way has a name,
      if (way.tags.hasOwnProperty("name")) {
        // Get its name
        name = way.tags.name;
        // If the way represents a building or a shop,
        if (way.tags.hasOwnProperty("building") || way.tags.hasOwnProperty("shop")) {
          // Declare that a building node should be made for it
          make_node = "building nodes";
        }
        // If the way represents an amenity,
        else if (way.tags.hasOwnProperty("amenity")) {
          // If the way represents a car park,
          if (way.tags.amenity == "car_park" || way.tags.amenity == "parking") {
            // Declare that a car park node should be made for it
            make_node = "car park nodes";
          }
          // If not,
          else {
            // Declare that an amenity node should be made for it
            make_node = "amenity nodes";
          }
        }
      }
      // Excludes pipes and power lines from the map
      // (I do not deem these necessary to draw and they congest the map.)
      if (way.tags.hasOwnProperty("man_made")) {
        if (way.tags.man_made == "pipeline") {
          leave_out = true;
        }
      }
      else if (way.tags.hasOwnProperty("power")) {
        leave_out = true;
      }
    }
    // If the way is to be included in the map,
    if (!leave_out) {
      // Goes through the way's nodes
      for (let id of way.nodes) {
        // Locates the node by its ID
        temp = findNode(id);
        // Collects and records the coordinates of that node
        raw_coords.push([temp.lon, temp.lat]);
      }
      // Determine what colour to make the way
      colour_group = getWayColour(way);
      // Creates a quick way
      quick_way = {
        id: way.id,
        raw_coords: raw_coords,
        name: name,
        colour_group: colour_group,
        has_node : (make_node != null)
      };
      // If the way is an area,
      if (colour_scheme[colour_group].fill) {
        // Adds the converted way directly into the quick_ways array
        quick_ways.push(quick_way);
      }
      else {
        // If not, adds it to the non_areas array
        non_areas.push(quick_way);
      }
      // If the way should have a node created for it,
      if (make_node != null) {
        // Generate a node for it
        makeNodeForWay(quick_way, way.tags, make_node);
      }
    }
  }
  // Combines the quick_ways and non_areas arrays
  quick_ways = quick_ways.concat(non_areas);
}

/**
 * Draws all available (quick) ways.
 */
function drawWays() {
  // Holds the translated coordinates
  let translated_coords;
  // Holds the current, translated way
  let translated_way;
  // Holds all the translated ways
  let translated_ways = [];
  // Goes through each quick way
  for(let way of quick_ways) {
    // Empties the translated_coords array
    translated_coords = [];
    // For each pair of coordinates
    for (let pair of way.raw_coords) {
      /*
       Translate the coordinates and add them to an array
      of translated coordinates.
      */
      translated_coords.push(translateCoords(pair));
    }
    /*
     Create a JSON object containing the information
     that is needed to render the way. (E.g. Its
     name, the coordinates of the points on the
     canvas that it must pass through, etc.)
    */
    translated_way = {
      name : way.name,
      coordinates : translated_coords,
      colour_group : way.colour_group,
      has_node : way.has_node
    };
    /*
     Add the JSON object to the list of translated
     ways that will be used to render all the ways
     onto the canvas.
    */
    translated_ways.push(translated_way);
  }
  // Holds the line width for the way
  let line_width;
  // A reference to the colour group of the way
  let colour_group;
  // Draws the ways onto the canvas
  for(let way of translated_ways) {
    // Gets the reference to the colour group of the way
    colour_group = colour_scheme[way.colour_group];
    // Calculates the line width for the way
    line_width = map_proportions.line_width * scale;
    // If the colour group denotes a specific line width,
    if (colour_group.hasOwnProperty("width")) {
      // Calculate the specific line width
      line_width *= colour_group.width;
    }
    // Draws the way onto the map
    drawLine("map", way.coordinates, line_width, colour_group.colour, colour_group.fill);
  }
  // Sets the size of the text
  let font_size = (map_proportions.line_width / map_proportions.font_size) * scale;
  // If the text would be large enough to read,
  if (font_size >= map_proportions.smallest_font_size) {
    // Go through each way
    for(let way of translated_ways) {
      // If the way does not have a node to represent it,
      if (!way.has_node) {
        // Calculates the line width for the way
        line_width = map_proportions.line_width * scale;
        // If the colour group denotes a specific line width,
        if (colour_group.hasOwnProperty("width")) {
          // Calculate the specific line width
          line_width *= colour_group.width;
        }
        // Label the way with its name
        labelWay(way.coordinates, way.name, line_width, font_size);
      }
    }
  }
}

/**
 * Finds all the nodes that have names, and adds them
 * to a JSON Object called named_nodes.
 */
function collectNamedNodes() {
  // Holds the node currently being processed
  let current_node;
  // Holds the colour of the node currently being processed
  //let colour;
  // (For now, all regular named nodes are the same colour)
  let colour_group = "default nodes";
  // Go through all the nodes
  for(let node of nodes) {
    // If the node has a name,
    if (node.hasOwnProperty("tags")) {
      if (node.tags.hasOwnProperty("name")) {
        // Determine its colour
        // colour = ....
        // Check if an array for that colour has already been created
        if (!named_nodes.hasOwnProperty(colour_group)) {
          named_nodes[colour_group] = [];
        }
        // Add it to the collection of named nodes
        named_nodes[colour_group].push(node);
      }
    }
    /*
     If a node doesn't have a name, then it's probably
     just used to make up a way and isn't worth drawing
    */
  }
}

/**
 * Draws a node onto the map.
 * 
 * @param {JSON Object} data - Data describing how the node should be drawn
 * @param {String} colour_group - The colour group that the node belongs to
 */
function drawNode(node, colour_group) {
  // Translates the coordinates of the node
  let coords = translateNode(node);
  // Gets the colour of the node's colour group
  let colour = colour_scheme[colour_group].colour;
  // Gets the radius multiplier of the node's colour group
  // (Default is x1)
  let radius_multiplier = 1;
  if (colour_scheme[colour_group].hasOwnProperty("width")) {
    radius_multiplier = colour_scheme[colour_group].width;
  }
  // Calculates what the radius of the node should be
  let radius = (map_proportions.radius * scale) * radius_multiplier;
  // Draws the node onto the map
  drawCircle("map", coords[0], coords[1], radius, colour);
}

/**
 * Draws all the (named) nodes.
 */
function drawNodes() {
  // Holds the node array currently being processed
  let node_array;
  // Goes through each key of named_nodes
  for(let key in named_nodes) {
    // Gets the node array for that key
    node_array = named_nodes[key];
    // Goes through each node of that node array
    for(let node of node_array) {
      // Draws the node, using the key as its colour
      drawNode(node, key);
      // Checks if the search criteria has already been loaded,
      if (!criteria_loaded) {
        // If not, add the node's tags to the search criteria
        searchable_tags = new Set([...searchable_tags, ...Object.keys(node.tags)]);
        // If the node has the "amenity" tag,
        if (node.tags.hasOwnProperty("amenity")) {
          // Add the value of the tag to the search criteria
          amenity_tag_values.add(node.tags.amenity);
        }
      }
    }
  }
  // If the search criteria hasn't already been loaded,
  if (!criteria_loaded) {
    // Load it
    loadSearchCriteria();
    // and record that it has been loaded
    criteria_loaded = true;
  }
}

/**
 * Draws a map based on given data.
 */
function drawMap() {
  // Wipes the canvas so that an updated map can be drawn
  clearMap();
  // If the named nodes have not been collected,
  if (jQuery.isEmptyObject(named_nodes)) {
    // If not, collect them
    collectNamedNodes();
  }
  // Checks if quick ways have been made,
  if (quick_ways.length == 0) {
    // If not, convert the ways to quick ways
    convertWays();
  }
  // Draw the (quick) ways
  drawWays();
  // Draw the named nodes
  drawNodes();
  // Highlights any search results
  showResults();
}

/*
    Map Manipulation Subroutines
*/

/**
 * Updates the UI to reflect a change in scale.
 */
function updateScale() {
  // Ensure that the scale is never negative (or zero)
  if (scale < 1) {
    scale = 1;
  }
  // Redraws the map, using the new scale
  drawMap();
}


/**
 * Pans the map based on a given mouse event.
 * 
 * @param {Mouse.Event} event - the mouse event
 */
function panEvent(event) {
  // Calculates how much to pan the map based on the scale
  // (This is so that the map pans at a consistent speed)
  // (The speed at which to pan the map was judged by how it feels)
  let moveConstant = map_proportions.mouse_pan_constant / scale;
  // Calculates the difference in position of the mouse from when it started panning
  let differenceX = (event.clientX - mousePanX);
  let differenceY = (event.clientY - mousePanY);
  // Moves the relative point, thus panning the map
  relative_point[0] -= (moveConstant * differenceX);
  // (The y-axis of the world map has double the range of the x-axis.)
  relative_point[1] += ((moveConstant * 2) * differenceY);
  // Redraws the map to show the effect of the panning
  drawMap();
  // Re-records the position of the mouse
  mousePanX = event.clientX;
  mousePanY = event.clientY;
}

/**
 * Stops panning the map based on a given mouse event.
 * 
 * @param {Mouse.Event} event - the mouse event
 */
function stopPanning(event) {
  // If the map is being panned,
  if (isPanning) {
    // Perform one last pan
    panEvent(event);
    // Record that the pan should no longer be being panned
    isPanning = false;
  }
}

/*
    Button Functions
*/

/**
 * Zooms the map in.
 */
function zoomIn() {
  scale = scale + (map_proportions.button_zoom_constant * (scale * 0.00005));
  updateScale();
}

/**
 * Zooms the map out.
 */
function zoomOut() {
  scale = scale - (map_proportions.button_zoom_constant * (scale * 0.00005));
  updateScale();
}

/**
 * Moves the map up.
 */
function moveUp() {
  relative_point[1] += (map_proportions.button_pan_constant * 2);
  drawMap();
}

/**
 * Moves the map down.
 */
function moveDown() {
  relative_point[1] -= (map_proportions.button_pan_constant * 2);
  drawMap();
}

/**
 * Moves the map left.
 */
function moveLeft() {
  relative_point[0] -= map_proportions.button_pan_constant;
  drawMap();
}

/**
 * Moves the map right.
 */
function moveRight() {
  relative_point[0] += map_proportions.button_pan_constant;
  drawMap();
}

/**
 * Resets the relative point to its default position.
 */
function resetPosition() {
  let first_node = nodes[0];
  relative_point = [first_node.lon, first_node.lat];
  drawMap()
}

/**
 * Resets the scale of the map to its default.
 */
function resetScale() {
  scale = 6000;
  drawMap();
}

/*
    Initialisation Subroutines
*/

/**
 * Make the map zoomable using the mouse wheel.
 */
function makeCanvasZoomable() {
  // Makes the map scalable
  $("#map")[0].addEventListener("wheel", (event) => {
    // Calculates the amount of zoom needed
    let zoom_amount = (50 * event.deltaY) * (scale * 0.00005);
    // Updates the scale of the map
    scale = scale + zoom_amount;
    updateScale();
  })
  /**
   * Prevents the user from being able the scroll
   * the page itself up and down when their mouse
   * is hovering over the map. (It is jarring to
   * have the page be scrolling up and down while
   * you're trying to scale the map.)
   */
  map.addEventListener('mouseenter', (event) => {
    // Disables page scrolling
    disableScroll(event);
  });
}

/**
 * Makes the map pannable using click and drag.
 */
function makeCanvasPannable() {
  // Locates the map/canvas
  let map = $("#map")[0];
  // In the case of a mouse-down,
  map.addEventListener('mousedown', (event) => {
    // Records the coordinates of the mouse when it begins to pan
    mousePanX = event.clientX;
    mousePanY = event.clientY;
    // States that the mouse is panning the map
    isPanning = true;
  });
  // In the case of a mouse-move,
  map.addEventListener('mousemove', (event) => {
    // If the map is being panned,
    if (isPanning) {
      // Pan the map based on the map event
      panEvent(event);
    }
  });
  // In the case of a mouse-up or mouse-leave, stop panning the map
  map.addEventListener('mouseup', (event) => {
    stopPanning(event);
  });
  map.addEventListener('mouseleave', (event) => {
    stopPanning(event);
    // Also, re-enables page scrolling
    enableScroll();
  });
}

/**
 * Allows the user to view information about a node
 * by clicking on it.
 */
function makeNodesViewable() {
  $("#map")[0].addEventListener('click', (event) => {
    // Gets the coordinates of the click relative to the canvas
    let click_x = event.offsetX;
    let click_y = event.offsetY;
    // Gets the canvas context
    let context = $("#map")[0].getContext("2d");
    // Gets the pixel underneath the mouse-click
    let pixel = context.getImageData(click_x, click_y, 1, 1).data;
    // Gets and formats the colour of the pixel
    let colour = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
    // The collection of nodes to search through
    let collection = null;
    // Colour group radius multiplier
    let radius_multiplier = 1;
    // If there is a collection of named nodes of that colour,
    for(let colour_group in named_nodes) {
      if (colour_scheme[colour_group].colour == colour) {
        // Set that collection as the collection to search through
        collection = named_nodes[colour_group];
        // Gets the radius mulitplier for that colour group
        if (colour_scheme[colour_group].hasOwnProperty("width")) {
          radius_multiplier = colour_scheme[colour_group].width;
        }
      }
    }
    // If the colour is the same as a search result's,
    if (colour_scheme["search results"].colour == colour) {
      // Search through the collection of search results
      collection = search_results;
      // Gets the radius mulitplier for search results
      radius_multiplier = colour_scheme["search results"].width;
    }
    // If the collection is not empty,
    if (collection != null) {
      // Calculates the radius of a node for this scale and colour group
      let radius = (map_proportions.radius * scale) * radius_multiplier;
      // Go through that collection of named nodes
      for(let node of collection) {
        // Gets the centre of the node
        let node_coords = [node.lon, node.lat];
        node_coords = translateCoords(node_coords);
        // Get the difference between the click and centre point
        let difference = Math.sqrt(Math.pow(click_x - node_coords[0], 2) + Math.pow(click_y - node_coords[1], 2));
        // Check if the click falls within the bounds of the node
        if (difference <= radius) {
          // If so, load the information about that node
          loadNodeInfo(node);
          // and break the loops
          return;
        }
      }
    }
  });
}

/**
 * Allows the map to resize itself in response to a change in the size
 * of the user's browser window without breaking any calculations.
 */
function makeTheMapResizeable() {
  addEventListener("resize", (event) => {
    setMapSize();
  });
}

/**
 * Initialises the values of the global variables.
 */
function initialiseGlobalVariables() {
  // Gets the dimensions of the map
  let map = $("#map")[0];
  map_width = map.width;
  map_height = map.height;
  // Set the default scale of the map
  scale = 6000;
  // Get a relative point to draw the map around
  let first_node = nodes[0];
  relative_point = [first_node.lon, first_node.lat];
  // Sets the panning variables to their defaults
  isPanning = false;
  mousePanX = 0;
  mousePanY = 0;
}

/*
    Data Storage Functions
*/

/**
 * Disables the button for storing data.
 */
function nukeTheStoreButton() {
  // Prevent the user from storing the data
  $("#store_button")[0].disabled = true;
}

/**
 * Shows the data storage form.
 */
function showStorageForm() {
  $(".overlay")[0].style.display = "block";
}

/**
 * Hides the data storage form.
 */
function hideStorageForm() {
  $(".overlay")[0].style.display = "none";
}

/**
 * Stores the data in a data cache.
 */
function storeIt() {
  // Gets the name and description from the user
  let name = $("#cache_name")[0].value;
  let description = $("#description")[0].value;
  // Gets the user's choice of what to prioritise
  let choice = $("#priority")[0].value;
  // Stores the quick ways or not, depending on the user's choice
  let qws;
  // Stores the named nodes or not, depending on the user's choice
  let nn;
  // Holds the nodes to store in the database. Will not store the named nodes if they have been stored separately.
  let nodes_to_store
  // If the user has chosen to prioritise quicker loading speeds,
  if (choice == "quick") {
    // Store the quick ways and the named nodes
    qws = quick_ways;
    nn = named_nodes;
    // and remove the named nodes from the list of nodes so that less data is repeated
    for (let key in named_nodes) {
      nodes_to_store = nodes.filter(x => !named_nodes[key].includes(x));
    }
  }
  // Otherwise, if the user has chosen to prioritise less memory usage,
  else {
    // Don't store the quick ways or named nodes
    qws = [];
    nn = {};
    // and store all the nodes in a single array
    nodes_to_store = nodes;
  }
  // If a name has been entered,
  if (!($.trim(name).length === 0)) {
    // Store the data into the database
    storeData(database, name, description, nodes, ways, rels, qws, nn, function () {
      // Alert the user
      alert("Map saved successfully!");
      // Disable the storage button
      nukeTheStoreButton();
      // and hide the storage form
      hideStorageForm();
    });
  }
  else {
    alert("You must enter a name for the map.");
  }
}

/*
    Map Key Subroutines
*/

/**
* Draws the map key onto the canvas in the
* the map key pop-up.
*/
function renderMapKey() {
  // Locates the map element table
  let map_elements = $("#map_elements")[0];
  // Holds the symbol to use for the element
  let symbol;
  // Holds the colour of the element
  let element_colour;
  // Removes any rows already in the map element table
  $("#map_elements tr").remove();
  // Goes through each colour group in colour_scheme
  for(let group in colour_scheme) {
    switch(colour_scheme[group].for) {
      // If it's for nodes, use a circle
      case "nodes" :
        symbol = "circle";
        break;
      // If it's for ways, use a line
      case "ways" :
        symbol = "line";
        break;
      // If it's for areas, use a square
      default:
        symbol = "square";
    }
    // Gets the colour of the colour group
    element_colour = colour_scheme[group].colour;
    // Creates a new row
    let row = map_elements.insertRow();
    // Creates a cell for the symbol
    let symbol_cell = row.insertCell(0);
    // Class determines the shape of the symbol, background-color determines the colour
    symbol_cell.innerHTML = `<div class="${symbol}" style="background-color:${element_colour}">&nbsp;</div>`;
    // Creates a cell for the element name
    let name_cell = row.insertCell(1);
    // Ensures that the element name displayed is properly capitalised
    name_cell.innerHTML = capitaliseString(group);
  }
}

/**
 * Makes the map key visible on the screen.
 */
function showKey() {
  // Closes the node info pop-up to make room for the key
  closeNodePopUp();
  /*
   The key only needs to be adjusted when the size of the
   window changes, so it does not need to be remade every
   time it is shown, unlike with the node info pop-up.
  */
  // Show the key
  $("#map_key")[0].style.display = "block";
}

/**
 * Hides the map key.
 */
function hideKey() {
  $("#map_key")[0].style.display = "none";
}

/*
    Search/Highlight Subroutines
*/

/**
 * Loads all available search criteria into the drop-down menus of the
 * node searching widget. This includes all the different tags one can
 * search for the precense of, and all the different values of the "amenity"
 * tag that one can use to highlight specific nodes.
 *
 * (More search criteria can be added in the future.)
 */
function loadSearchCriteria() {
  // Alphabeticise each set of search criteria
  searchable_tags = (Array.from(searchable_tags)).sort();
  amenity_tag_values = (Array.from(amenity_tag_values)).sort();
  // Locates the drop-down menu for node tags
  let tag_drop_down = $("#tag_search")[0];
  // Locates the drop-down menu for amenity tag values
  let amenity_drop_down = $("#amenity_search")[0];
  // Option to be added to the drop-down menu
  let option;
  // Goes through each tag
  for(let tag of searchable_tags) {
    // and adds it to the drop-down menu
    addOptionToDropDown(tag_drop_down, capitaliseString(tag), tag);
  }
  // Does the same for the values of the amenity tag
  for(let value of amenity_tag_values) {
    addOptionToDropDown(amenity_drop_down, capitaliseString(value), value);
  }
}

/**
 * Highlights the search results on the map.
 */
function showResults() {
  // Goes through the list of search results
  for(let node of search_results) {
    // Draws a node for that search result
    drawNode(node, "search results");
  }
  /**
   * Note: Search results should be larger than most nodes and be drawn
   * on top of the original nodes to make them stand out
   */
}

/**
 * Makes the search window visible so that the user can search for
 * interesting features.
 */
function showSearchWindow() {
  $("#search_window")[0].style.display = "block";
}

/**
 * Hides the search window.
 */
function hideSearchWindow() {
  $("#search_window")[0].style.display = "none";
}

/**
 * Informs the user of what result is currently being showcased.
 */
function updateCurrentResult() {
  $("#result_increment")[0].innerHTML = "Showing result "
    + result_at.toString()+ " of " + search_results.length.toString() + ".";
}

/**
 * Informs the user of how many results have been found.
 */
function loadResults() {
  // First, updates the result string
  let result_string = $("#result_string")[0];
  let num_of_results = search_results.length;
  result_string.innerHTML = num_of_results.toString() + " results found.";
  // If there are no results,
  if (num_of_results == 0) {
    // The user should not be able to scroll through the results
    $("#left_arrow")[0].disabled = true;
    $("#right_arrow")[0].disabled = true;
  }
  else {
    // Allow the user to scroll through the results
    $("#left_arrow")[0].disabled = false;
    $("#right_arrow")[0].disabled = false;
  }
  // By default, does not showcase any of the results
  result_at = 0;
  updateCurrentResult();
}

/**
 * Informs the user of how many results have been found.
 * @param {JSON Object} node - The node to show off to the user
 */
function showcaseResult(node) {
  // Shows information about that node
  loadNodeInfo(node);
  // Places that node at the centre of the map
  relative_point = [node.lon, node.lat];
  drawMap();
}

/**
 * Showcases the next result in the list of results.
 */
function showNextResult() {
  // If the user is being shown the final result,
  if (result_at >= search_results.length) {
    // Show the user the first result
    result_at = 1;
  }
  else {
    // Show them the next result
    result_at += 1;
  }
  showcaseResult(search_results[result_at - 1]);
  updateCurrentResult();
}

/**
 * Showcases the previous result in the list of results.
 */
function showPreviousResult() {
  // If the user is being shown the first result,
  if (result_at <= 1) {
    // Show the user the final result
    result_at = search_results.length;
  }
  else {
    // Show them the previous result
    result_at -= 1;
  }
  showcaseResult(search_results[result_at - 1]);
  updateCurrentResult();
}

/**
 * Clears the array of search results and
 * unhighlights said results from the map
 */
function clearResults() {
  search_results = [];
  drawMap();
  loadResults();
}

/**
 * Resets the search criteria to their defaults.
 */
function resetCriteria() {
  // Clears name search criteria
  $("#query_name")[0].value = "";
  // Resets the drop-down menus to their default values
  $("#unspecified_tag")[0].selected = true;
  $("#unspecified_amenity")[0].selected = true;
}

/**
 * Compares the nodes of named_nodes with the given search criteria in order to
 * generate a list of search results based on said criteria.
 */
function queryNodes() {
  // Clears search results
  search_results = [];
  // Gets the search criteria
  // Gets the Name to compare with the node's name (not exact match)
  let node_name = $("#query_name")[0].value;
  // Gets the lowest percentage similarity to be considered "similar"
  let lowest_percentage_similarity = parseFloat($("#name_similarity")[0].value);
  // Gets the tag to check for the precense of
  let search_tag = $("#tag_search")[0].value;
  // Gets the type of amenity to search for
  let amenity_type = $("#amenity_search")[0].value;
  // If no search criteria is provided,
  if (($.trim(node_name).length === 0) && (search_tag == "n/a") && (amenity_type == "n/a")) {
    alert("No search criteria provided.");
  }
  // Otherwise,
  else {
    // Records whether the node is a valid search result or not
    let valid_result;
    // Goes through each group of named nodes
    for (let group in named_nodes) {
      // Goes through each node of each group
      for (let node of named_nodes[group]) {
        // Assumes that the node will be a valid search result
        valid_result = true;
        // If a name has been given as search criteria,
        if ($.trim(node_name).length != 0) {
          // If the node's name is not similar enough to the search criteria,
          if (!areSimilar(node_name, node.tags.name, lowest_percentage_similarity)) {
            // Mark it as an invalid result
            valid_result = false;
          }
        }
        // If a tag has been given as search criteria and the node is still seen as a valid result,
        if (search_tag != "n/a" && valid_result) {
          // If the node lacks that tag,
          if (!node.tags.hasOwnProperty(search_tag)) {
            // Mark it as an invalid result
            valid_result = false;
          }
        }
        // If an amenity type has been given as search criteria and the node is still seen as a valid result,
        if (amenity_type != "n/a" && valid_result) {
          // If the node does not have the amenity tag,
          if (!node.tags.hasOwnProperty("amenity")) {
            // Mark it as an invalid result
            valid_result = false;
          }
          else {
            // If the node does have the tag, but it's not of the desired type,
            if (node.tags.amenity != amenity_type) {
              // Mark it as an invalid result
              valid_result = false;
            }
          }
        }
        // If the node is still considered to be a valid search result,
        if (valid_result) {
          // Add it to the search results
          search_results.push(node);
        }
      }
    }
    // Loads the search results onto the map
    drawMap();
    loadResults();
  }
}

/*
    Misc. Subroutines
*/

/**
 * Prints the raw OSM data to the console.
 */
function printRawOSM() {
  // Prints data
  console.log("Nodes: ");
  console.log(nodes);
  console.log("\n \n Ways: ");
  console.log(ways);
  console.log("\n \n Rels: ");
  console.log(rels);
}

/**
 * Stops the page from scrolling when a mouse-scroll event is triggered.
 */
function disableScroll(event) {
  $('body').addClass('stop-scrolling');
}

/**
 * Re-enables page scrolling.
 */
function enableScroll() {
  $('body').removeClass('stop-scrolling');
}

/**
 * Loads the information about a node into
 * the node info pop-up.
 * 
 * @param {JSON Object} node - Data about a node
 */
function loadNodeInfo(node) {
  // Gets the node's tags
  let tags = node.tags;
  // Gets the node's name
  let name = node.tags.name;
  // Sets the name
  $("#node_name")[0].innerHTML = name;
  // Removes any rows already in the tag table
  $("#node_tags tr").remove();
  // Locates the table body
  let tbody = $("#node_tags")[0];
  // Goes through the node's tags
  for (let tag in tags) {
    // Add the tags to the table, if the tag has a value
    if (tags.hasOwnProperty(tag) && tag != "name") {
      // Creates a new row
      let row = tbody.insertRow();
      // Creates a cell for the tag name
      let name_cell = row.insertCell(0);
      name_cell.innerHTML = tag;
      // Creates a cell for the tag value
      let value_cell = row.insertCell(1);
      value_cell.innerHTML = tags[tag];
    }
  }
  // Hides the map key to make room for the pop-up
  hideKey();
  // Shows the pop-up
  $("#node_info")[0].style.display = "block";
}

/**
 * Closes the node info pop-up.
 */
function closeNodePopUp() {
  $("#node_info")[0].style.display = "none";
}

/**
 * Takes a string and capitalises the first letter of each part of it.
 * 
 * @param {String} name - The string to be capitalised
 * @return {String} - The string, but capitalised
 */
function capitaliseString(string) {
  try {
    if (string.length > 1) {
      let parts = string.split(" ");
      for (let i = 0; i < parts.length; i++) {
        parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
      }
      return parts.join(" ");
    }
    else {
      return string.charAt(0).toUpperCase();
    }
  }
  catch {
    console.log(string);
    throw new Error("Check above output.");
  }
}

/**
 * Compares the similarity of two strings using string-similarity. Takes in
 * the lowest percentage similarity to be considered similar, and returns
 * whether or not the strings would be considered "similar".
 * 
 * @param {String} string_1 - The first string
 * @param {String} string_2 - The second string
 * @param {float} acceptance_percentage - The lowest acceptance percentage similarity
 * @return {boolean} - True if similar enough, false if too different
 */
function areSimilar(string_1, string_2, acceptance_percentage) {
  // Gets the similarity of the two strings as a decimal percentage
  let similarity = stringSimilarity.compareTwoStrings(string_1, string_2);
  return (similarity >= acceptance_percentage);
}

/**
 * Adds an option to a drop-down menu.
 * 
 * @param {HTML select element} drop_down - The drop-down menu
 * @param {String} text - The displayed text for the option
 * @param {String} value - The value produced when the option is selected
 */
function addOptionToDropDown(drop_down, text, value) {
  // Creates a new option for the drop-down menu
  let option = document.createElement("option");
  // Displays the full name of that country
  option.text = text;
  // Returns the code for that country
  option.value = value;
  // Adds the option to the drop-down menu
  drop_down.options.add(option);
}

/**
 * Adds a number of shortcuts to the page, including:
 * - CTRL+S to open the storage form.
 * - CTRL+F to open the node search form.
 * - CTRL+K to open the map key.
 * - CTRL+Z to reset the position and scale of the map.
 * - Arrow keys to pan the map.
 * - + (plus) and - (minus) to zoom in and out of the map.
 * - ArrowLeft and ArrowRight to scroll through search results, if there are any.
 * - ENTER to submit a node search.
 */
function addShortcuts() {
  // Adds shortcuts to the window itself
  document.addEventListener('keydown', (event) => {
    // -- CTRL+CHAR shortcuts --
    // Checks if the CTRL (or Mac's COMMAND) key is being pressed
    if (event.ctrlKey || event.metaKey) {
      // Checks if the S key is being pressed
      if (event.key === 's') {
        // If the store button has not been disabled,
        if (!($("#store_button")[0].disabled)) {
          // Cancels the default response to CTRL+S
          event.preventDefault();
          // Shows the map data storage form
          showStorageForm();
        }
      }
      else if (event.key === 'f') {
        // Cancels the default response to CTRL+F
        event.preventDefault();
        // Shows the node search pop-up
        showSearchWindow();
      }
      else if (event.key === 'k') {
        // Cancels the default response to CTRL+K
        event.preventDefault();
        // Shows the map key
        showKey();
      }
      else if (event.key === 'z') {
        // Cancels the default response to CTRL+Z
        event.preventDefault();
        // Resets the map's position and scale
        resetPosition();
        resetScale();
      }
    }
    else {
      // -- Arrow-key shortcuts --
      // Checks if the right arrow has been clicked,
      if (event.key == "ArrowRight") {
        // If so, cancels the default response to ArrowRight
        event.preventDefault();
        // Checks if the user is able to scroll through (next) results,
        if (!($("#right_arrow")[0].disabled)) {
          // Shows the next result
          showNextResult();
        }
        else {
          // Pans the map to the right
          moveRight();
        }
      }
      // Checks if the left arrow has been clicked,
      else if (event.key == "ArrowLeft") {
        // If so, cancels the default response to ArrowLeft
        event.preventDefault();
        // Checks if the user is able to scroll through (previous) results,
        if (!($("#left_arrow")[0].disabled)) {
          // Shows the previous result
          showPreviousResult();
        }
        else {
          // Pans the map to the left
          moveLeft();
        }
      }
      // Checks if the up arrow has been clicked,
      else if (event.key == "ArrowUp") {
        // If so, cancels the default response to ArrowUp
        event.preventDefault();
        // Pans the map upwards
        moveUp();
      }
      // Checks if the down arrow has been clicked,
      else if (event.key == "ArrowDown") {
        // If so, cancels the default response to ArrowDown
        event.preventDefault();
        // Pans the map downwards
        moveDown();
      }
      // -- Plus and Minus Shortcuts --
      // Checks if plus has been clicked,
      else if (event.key == "+") {
        // If so, cancels the default response to +
        event.preventDefault();
        // Zooms the map in
        zoomIn();
      }
      // Checks if minus has been clicked,
      else if (event.key == "-") {
        // If so, cancels the default response to -
        event.preventDefault();
        // Zooms the map out
        zoomOut();
      }
    }
  });
  // Adds the ENTER key shortcut to the node search pop-up
  $("#query_name")[0].addEventListener("keydown", (event) => {
    // Checks if the ENTER key has been pressed
    if (event.key === "Enter") {
      // Cancels the default response to pressing the ENTER key
      event.preventDefault();
      // Performs a search instead
      queryNodes();
    }
  });
}

/**
 * Sets the colours for each colour group of colour_scheme to that of a new colour scheme.
 * 
 * @param {JSON Object} json - The colours for each colour group in this new colour scheme
 */
function setColourScheme(json) {
  for(let group in json) {
    colour_scheme[group].colour = json[group];
  }
  // Re-render the map key
  renderMapKey();
  // Re-draw the map
  drawMap();
}

/**
 * Switches from the current map colour scheme to another, given one.
 * 
 * @param {String} scheme - Identifier for the colour scheme to switch to
 */
function switchColourScheme(scheme) {
  // Fetches the associated JSON file for that colour scheme
  let json_file = colour_schemes[scheme];
  // (Via Fetch API)
  fetch(json_file)
    .then((response) => response.json())
    .then((data) => setColourScheme(data));
}

/*
    Global Variables/Constants
*/
/*
      Constants
*/
// Holds the constants that determine the proportions of different map features
const map_proportions = {
  // For the radius of the circles that represent the nodes
  radius : (2 / 75000),
  // For the width of the lines that represent the ways
  line_width : (2 / 50000),
  // For the size of the way labels (should be slightly smaller than the line width)
  font_size : 1.0125,
  // For the amount panned across when using the panning buttons
  button_pan_constant : 0.0018,
  // For the amount panned across when panning via mouse-click-and-drag
  mouse_pan_constant : 0.75,
  // The amount of zoom when using the zooming buttons
  button_zoom_constant : 3000,
  // The smallest font size that will be rendered
  smallest_font_size : 5,
  // The spacing between each item in the key
  key_spacing : 50,
  // The width of the map key
  key_width : 450
}

// The colour scheme for the map
/*
 * "colour" = colour to use for that feature
 * "fill" = Boolean value to determine whether to fill in that area or not
 * "width" = (Not always present) The fraction of the base line width that should be used as its line width
 * "for" = What element the colour group is for
 */
var colour_scheme = {
  // Nodes
  "default nodes" : {
    "colour" : "rgb(67,0,99)",
    "fill" : true,
    "for" : "nodes"
  },
  "building nodes" : {
    "colour" : "rgb(202,89,255)",
    "fill" : true,
    "for" : "nodes"
  },
  "amenity nodes" : {
    "colour" : "rgb(150,75,153)",
    "fill" : true,
    "for" : "nodes"
  },
  "car park nodes" : {
    "colour" : "rgb(211,217,242)",
    "fill" : true,
    "for" : "nodes"
  },
  "search results" : {
    "colour" : "rgb(255,251,0)",
    "fill" : true,
    "for" : "nodes",
    "width" : 1.3
  },
  // Ways
  "default way" : {
    "colour" : "rgb(187,187,187)",
    "width" : 0.6,
    "fill" : false,
    "for" : "ways"
  },
  "main roads" : {
    "colour" : "rgb(255,0,0)",
    "fill" : false,
    "width" : 1.4,
    "for" : "ways"
  },
  "residential roads" : {
    "colour" : "rgb(255,135,0)",
    "fill" : false,
    "for" : "ways"
  },
  "restricted access roads" : {
    "colour" : "rgb(160,0,0)",
    "fill" : false,
    "width" : 0.8,
    "for" : "ways"
  },
  "pedestrian roads" : {
    "colour" : "rgb(185,131,105)",
    "fill" : false,
    "width" : 0.6,
    "for" : "ways"
  },
  "railways" : {
    "colour" : "rgb(255,0,146)",
    "fill" : false,
    "for" : "ways"
  },
  "water" : {
    "colour" : "rgb(92,250,255)",
    "fill" : false,
    "for" : "ways"
  },
  "natural barrier" : {
    "colour" : "rgb(33,70,40)",
    "fill" : false,
    "width" : 0.3,
    "for" : "ways"
  },
  "high barrier" : {
    "colour" : "rgb(37,24,18)",
    "fill" : false,
    "width" : 0.3,
    "for" : "ways"
  },
  "low barrier" : {
    "colour" : "rgb(73,46,34)",
    "fill" : false,
    "width" : 0.3,
    "for" : "ways"
  },
  "seating" : {
    "colour" : "rgb(147,87,55)",
    "fill" : false,
    "width" : 0.3,
    "for" : "ways"
  },
  // Areas
  "commercial water" : {
    "colour" : "rgb(26,43,214)",
    "fill" : true,
    "for" : "areas"
  },
  "natural water" : {
    "colour" : "rgb(92,250,255)",
    "fill" : true,
    "for" : "areas"
  },
  "commercial vegetation" : {
    "colour" : "rgb(15,131,12)",
    "fill" : true,
    "for" : "areas"
  },
  "heavy vegetation" : {
    "colour" : "rgb(88,228,83)",
    "fill" : true,
    "for" : "areas"
  },
  "light vegetation" : {
    "colour" : "rgb(155,255,152)",
    "fill" : true,
    "for" : "areas"
  },
  "sand" : {
    "colour" : "rgb(245,249,139)",
    "fill" : true,
    "for" : "areas"
  },
  "ice" : {
    "colour" : "rgb(153,249,242)",
    "fill" : true,
    "for" : "areas"
  },
  "mud" : {
    "colour" : "rgb(99,44,0)",
    "fill" : true,
    "for" : "areas"
  },
  "rock" : {
    "colour" : "rgb(149,125,135)",
    "fill" : true,
    "for" : "areas"
  },
  "buildings" : {
    "colour" : "rgb(101,101,101)",
    "fill" : true,
    "for" : "areas"
  },
  "burial grounds" : {
    "colour" : "rgb(190,190,190)",
    "fill" : true,
    "for" : "areas"
  },
  "car parks" : {
    "colour" : "rgb(80,98,171)",
    "fill" : true,
    "for" : "areas"
  }
}

/*
      Variables for drawing the map
*/
// Canvas dimensions
var map_width;
var map_height;
// Scale of the map
var scale;
// The point to draw the map around
var relative_point;

/*
      Variables for panning the map
*/
// Records whether the map is being panned or not
var isPanning;
// Records the x, y position of the mouse at the start of the pan
var mousePanX;
var mousePanY;

/*
      Other Variables
*/

// Tags (to check the precense of) to use as search criteria
var searchable_tags = new Set();
// Values of a node's amenity tag to use as search criteria
var amenity_tag_values = new Set();
// Records whether the search criteria has been loaded (into the drop-down menus)
var criteria_loaded = false;
// Holds the results of a search
var search_results = [];
// Holds the index of the result currently being showcased
var result_at = 0;

/*
    Sequence
*/

// Once the document has been loaded,
$(document).ready(function () {
  // If the data is from a data store,
  if (from_store) {
    nukeTheStoreButton();
  }
  // Add shortcuts for saving map data and searching for nodes
  addShortcuts();
  // Prints the raw OSM data to the console
  printRawOSM();
  // Checks if there is any map data to draw
  // (No map can be drawn without nodes)
  if (nodes.length != 0) {
    // If so, initialises the global variables that will be needed to render the map,
    initialiseGlobalVariables();
    // Sets the size of the map
    setMapSize();
    // makes the map resizeable,
    makeTheMapResizeable()
    // makes the canvas zoomable via the use of a mouse's scrollwheel,
    makeCanvasZoomable();
    // makes the canvas pannable using click and drag,
    makeCanvasPannable();
    // makes information about a node available on click,
    makeNodesViewable();
    // and renders the map key
    renderMapKey();
  }
  else {
    // If not, alerts the user
    alert("No map data! Map cannot be drawn.");
    // and sends them back to get_data.html
    location.href = "/get";
  }
});


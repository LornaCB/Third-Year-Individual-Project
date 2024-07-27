# - Modules -
import json
import requests
import pgeocode
import numpy
from flask import Flask, render_template, request


# Initialises Flask application
app = Flask(__name__)


# - Functions and Procedures -
def get_OSM_JSON(url, query):
    """
    Gets OSM data via the Overpass API using an Overpass QL query.
    (In JSON form.)


    @param url: The URL of the Overpass endpoint
    @param query: The Overpass QL query
    @return: The OSM data retrieved (as a JSON object) and the status
        code of the request
    """
    try:
        # Sends the query to the Overpass endpoint
        response = requests.get(url,
                                params={'data': query})
        # Raises an HTTP error if unsuccessful
        response.raise_for_status()
        # Returns the data from the response
        return response.json(), response.status_code
    # If there was an issue with the request,
    except requests.exceptions.HTTPError as err:
        # Print the error to the console
        print(err)
        # Inform the frontend that there was an error
        return {}, response.status_code


def format_OSM_query(mid_query):
    """
    Completes an Overpass QL query from the middle part of such a query
    that was retrieved from the frontend (based on user input).


    @param mid_query: The mid section of an Overpass QL query
    @return: A complete Overpass QL query
    """
    # Sets the settings for the query
    query = "[out:json]; \n"
    # Adds the middle part of the query (from user input)
    query += mid_query
    # Marks the end of the query
    query += "out body;"
    # Returns the query
    return query


def OSM_from_coordinates(coordinates):
    """
    Creates an Overpass QL query from a set of geo-coordinates
    and uses it to retrieve OSM data via the Overpass API.


    @param coordinates: The geo-coordinates to use in the query
    @return: The data retrieved from the request and its status code
    """
    # Gets the lat and lon coordinates
    lon = coordinates[0]
    lat = coordinates[1]
    # The distance around the point to get a map of
    distance = 0.015
    # Define the south-west and north-east corners of the bounding box
    south = lat - distance
    west = lon - distance
    north = lat + distance
    east = lon + distance
    # Forms a bounding box query
    query = f"[bbox:{south},{west},{north},{east}][out:json];(way;>;node;);"
    query += "out;"
    # Queries the Overpass API
    query_response, status_code = get_OSM_JSON(OVERPASS_URL, query)
    # Prints the status code
    print("Status : " + str(status_code))
    # Returns the data from the query and the status code
    return query_response, status_code


def OSM_from_postcode(postcode, country):
    """
    Uses pgeocode and the GeoNames database to convert a postal code into
    a set of geo-coordinates, which can be combined with the function above
    to retrieve OSM data via the Overpass API. If the postal code is for the
    UK, then use the postcodes.io API instead - as it's more accurate.


    @param postcode: The postal code to convert into geo-coordinates
    @param country: The code for the country the postal code is for
    @return: The data retrieved from the request and its status code
    """
    # If the postal code is not for the United Kingdom,
    if not (country == "GB"):
        # Retrieves data for that postal code from the GeoNames database
        nomi = pgeocode.Nominatim(country)
        result = nomi.query_postal_code(postcode)
        # Gets the coordinates from that data
        latitude = result.loc["latitude"]
        longitude = result.loc["longitude"]
        # Checks if the coordinates are numbers
        if (numpy.isnan(latitude) or numpy.isnan(longitude)):
            # If they are not, then the postal code was invalid
            print("Invalid postal code.")
            # So, return an error
            return {}, 404
        # Otherwise,
        else:
            # Gets OSM data from those coordinates
            return OSM_from_coordinates([longitude, latitude])
    # If the postal code is for the United Kingdom,
    else:
        # Use the postcodes.io API to get the coordinates instead
        url = "https://api.postcodes.io/postcodes/" + postcode
        # Attempts to retrieve the desired data
        try:
            response = requests.get(url)
            # Raises an HTTP error if unsuccessful
            response.raise_for_status()
            # If the request was successful,
            if (response.status_code == 200):
                # Gets the data from the response
                data = response.json()["result"]
                # Gets the coordinates from that data
                latitude = data["latitude"]
                longitude = data["longitude"]
                # Gets OSM data from those coordinates
                return OSM_from_coordinates([longitude, latitude])
            # If the request was unsuccessful, return no data
            else:
                return {}, response.status_code
        # If there was an issue with the request,
        except requests.exceptions.HTTPError as err:
            # Print the error to the console
            print(err)
            # Inform the frontend that there was an error
            return {}, response.status_code



# - Variables and Constants -
# Url of the Overpass API endpoint to be used
OVERPASS_URL = "https://lz4.overpass-api.de/api/interpreter"
# Three arrays for storing the OSM data that will be displayed by map.html
nodes, ways, rels = [], [], []
# Holds whether or not the data is from a data store
from_store = False
# Holds the ways, but in a fashion that will make them quicker to draw
quick_ways = []
# Holds the nodes that have names (i.e. the only ones worth drawing)
named_nodes = {}


# - Routes -
# -- Page Routes --
# Route to the index page
@app.route("/", methods=["GET"])
def index():
    # If the request is a GET request,
    if request.method == "GET":
        # Render the web page
        return render_template("index.html")


# Route to the get_data page
@app.route("/get", methods=["GET"])
def get_data():
    # If the request is a GET request,
    if request.method == "GET":
        # Render the web page
        return render_template("get_data.html")


# Route to the load_cache page
@app.route("/load", methods=["GET"])
def load_data():
    # If the request is a GET request,
    if request.method == "GET":
        # Render the web page
        return render_template("load_cache.html")


# Route to the map page
@app.route("/map", methods=["GET"])
def map():
    # If the request is a GET request,
    if request.method == "GET":
        # Use the values of nodes, ways, and rels from the global space
        global nodes, ways, rels, from_store, quick_ways, named_nodes
        # Renders the map.html web page and provides it with formatted OSM data
        return render_template("map.html", from_store=from_store,
                               node_array=nodes, way_array=ways,
                               rel_array=rels, quick_ways=quick_ways,
                               named_nodes=named_nodes)


# -- API Calls --
# --- POST Routes ---
@app.route("/api/post/get_map_data", methods=["POST"])
def get_map_data():
    """Route for getting map data from a user-entered query."""
    # If the request is a POST request,
    if request.method == "POST":
        # Gets the user input from the request's JSON data
        user_input = request.json["query"]
        # Inserts the user input into a proper query
        query = format_OSM_query(user_input)
        # Queries the Overpass API
        query_response, status_code = get_OSM_JSON(OVERPASS_URL, query)
        # Prints the status code
        print("Status : " + str(status_code))
        # Returns the data from the query and the status code
        return query_response, status_code


@app.route("/api/post/get_coordinates_map", methods=["POST"])
def get_map_from_coordinates():
    """Route for getting a map from a set of coordinates."""
    # If the request is a POST request,
    if request.method == "POST":
        # Gets the coordinates from the request's JSON data
        coordinates = request.json["coordinates"]
        # Gets and returns the OSM data
        return OSM_from_coordinates(coordinates)


@app.route("/api/post/get_postcode_map", methods=["POST"])
def get_map_from_postcode():
    """Route for getting a map from a postcode"""
    # If the request is a POST request,
    if request.method == "POST":
        # Gets the postal code and country from the request's JSON data
        postcode = request.json["postcode"]
        country = request.json["country"]
        # Gets and returns the OSM data
        return OSM_from_postcode(postcode, country)


@app.route("/api/post/get_test_data", methods=["POST"])
def get_test_data():
    """Route for getting map data from a user-entered query."""
    # If the request is a POST request,
    if request.method == "POST":
        # Gets the test data
        file = open("test_data.json")
        data = json.load(file)
        file.close()
        # Returns the test data and a status code
        return data, 200


@app.route("/api/post/load_map_data", methods=["POST"])
def load_map_data():
    """Route of setting the data to be rendered on map.html."""
    # If the request is a POST request,
    if request.method == "POST":
        # Gets the global variables
        global nodes, ways, rels, from_store, quick_ways, named_nodes
        # Get the JSON data from the request
        to_load = request.json
        # Gets the nodes, ways and rels from the JSON data
        nodes = to_load["nodes"]
        ways = to_load["ways"]
        rels = to_load["rels"]
        # Gets the quick ways, if there are any
        quick_ways = to_load["quick_ways"]
        # Gets the named nodes, if there are any
        named_nodes = to_load["named_nodes"]
        # Gets whether the data is from a data store or not
        from_store = to_load["from_store"]
        # Returns a success code
        return {}, 200


# - Sequence -
# If this is the main Python file (and not an import),
if __name__ == "__main__":
    # Run the application
    app.run()

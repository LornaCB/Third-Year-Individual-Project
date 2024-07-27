# Full Unit Project - Offline HTML5 Map Application

Originally a private GitLab repository. Uploading it here for archival purposes/future ego boosts when I look back at it and realise how much I've improved since. Note: I did not handle OSM Relations correctly in this project, and only realised a year after I had submitted it, so some map features will not load correctly.

## Installation Instructions

To run this application, you will need to download a number of components:
- A browser that can process HTML5 (e.g. Google Chrome, Firefox, or any other modern browser)
- Python 3, with the following external libraries:
    - [Flask](https://flask.palletsprojects.com/en/2.2.x/installation/)
    - [requests](https://pypi.org/project/requests/)
    - [pgeocode](https://pypi.org/project/pgeocode/)
(Note: pgeocode will download a series of other modules, including numpy and pandas.)

Once these components have been installed, you can then clone the "main" branch of this repository to acquire the most up-to-date version of the application.

## Running the Application

The files for the Offline HTML5 Map Application can be found under the "Actual Application" directory of this repository. This directory contains a Python file called "actual_app.py", and two further directories named "static" and "templates". "templates" contains the HTML files used by the application, and "static" holds the JavaScript files inside the "js" directory, the CSS files inside the "css" directory, and so on. In total, there should be:
- 1 .py file
- 6 .html files
- 6 .css files
- 9 .js files
- 8 .json files
- 15 .png files

If you are missing any of these files, you will need to re-clone the directory.

To start hosting the application, simply run the actual_app.py file with Python 3. This will allow you to access the application on your browser with the URL `http://127.0.0.1:5000` (A.K.A. `http://localhost:5000`), and you can interact with the application in the same way you would any other website. If you already hosting an application at this address, you will encounter an error, so please shut that application down beforehand.

To stop hosting the application, simply kill the Python program. You can usually do this by entering CTRL+C into the terminal you used to run the program.

## Browser Compatibility

Although this is a browser-based application, it is not able to run on every browser for one reason or another. If a browser is not listed below, then that just means that I have not tested the application on that browser. I should also note that the application will struggle to run (if at all) when the browser is in private browsing mode. All browsers were tested on their current version.

### Compatible Browsers:

- Brave
- DuckDuckGo (if you turn off protections)
- Google Chrome
- Microsoft Edge
- Opera
- Safari

### Incompatible Browsers:

- Firefox (current version, earlier versions worked fine)
- Tor

## Known Issues

The application in its current state has a few issues that have not yet been dealt with. They are listed here, as a forewarning:
- For map.html:
    - BUG: The user is able to store the same lot of data more than once if the page is refreshed.
    - BUG: Runs incredibly slowly on the current version of Firefox.
- For get_data.html:
    - FLAW: Postal code searches for countries other than the UK only take the outcode into account, and are thus less accurate.

## Versions

### Version 0.5 (Current)

Have released version 0.5 of the actual application. This version focused on improving the user interface and experience of the application, with a specific focus on consistency, accessibility, and usability. The following improvements have been made:
- Easier to use with smaller screens. (I.e. No more elements vanishing off of the page.)
- Compatible with a wider range of browsers.
- More consistency between browsers/screen sizes.
- Range of text sizes to choose from. (Up to 200% of the default.)
- Range of colour schemes to choose from, including colourblind options and a dark mode.
- Text size and colour choices are stored on the browser and don't need to be reselected every session.
- Keyboard shortcuts for a variety of actions, including "ENTER" for submitting data.
- Symbols to accompany certain buttons/actions to make their function even more clear.

### Version 0.4 (Old)

Have released version 0.4 of the actual application. It contains every feature from version 0.35, but adds the ability to search for and highlight nodes. Nodes can be searched for using the following criteria:
- Name (exact or partial matches)
- Has tag
- Amenity type (i.e. value of the node's "amenity" tag)

More search criteria can be added in the future, but this should be sufficient for now. (At the very least, as a proof of concept.) This version also slightly improves the accuracy of postal code searches for the UK.

### Version 0.35 (Old)

Have released intermediary version 0.35 of the actual application. It contains every feature from version 0.3, apart from the query search feature of get_data.html. Instead, it adds the following features:
- Generate a map of an area via a postal code (valid for 83 different countries, powered by GeoNames and pgeocode, as well as OSM)
- Generate a map of an area via raw geo-coordinates (OSM-only)

"Form search" has been reworked to no longer include the "country" field - as this would slow down loading times dramatically when a value was provided - and to prioritise use of the "city/town" field alone (except for cases in which it's absolutely necessary to specify a county/state). There have also been a few minor improvements made to the map itself.

### Version 0.3 (Old)

Have released version 0.3 of the actual application. It contains all the features of version 0.2, but now with:
- Labelled ways (i.e. can now see road names on the map)
- Faster initial map rendering times
- The ability to pan the map around
- Improved map zooming
- The map itself being colour-coded, with an accompanying key
- The ability to view information about areas of interest (by clicking on the nodes representing them)
- A new and improved map.html UI

All this with too many of QOL improvements to list.

Note: In the "Version Planning" document, it lists "Relations are represented in some way" as one of version 0.3's success criteria, but I was getting relations confused with areas when I wrote that requirement, so this version does not do that, but it does represent areas and every other noteable map feature instead.

### Version 0.2 (Old)

Have released version 0.2 of the actual application. It contains all the features from version 0.1, but now also has:
- Offline/Online-only functionality
- The ability to store/retrieve OSM data on the browser
- The ability to give a name and description to stored OSM data
- The ability to delete stored OSM data

There have also been some additions to the UI that allow for easier navigation around the applcation, and efforts to speed-up the operation of the program. The quality of map rendering has remained unchanged - as that is the focus of the next version.

### Version 0.1 (Old)

Have released version 0.1 of the actual application. In its current state, the application can retrieve OSM data via two types of user input, render nodes and ways onto an HTML5 canvas (the "map"), and permit the zooming/scaling of the map. The two types of user input are:
- Via a simplified form
- Via writing an OSM query directly

The application can not yet store data offline, but it is capable of rendering data from an offline source. Relations are not yet rendered, but they can be retrieved.

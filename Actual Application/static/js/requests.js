/*
    Templates for sending requests
*/

/**
 * Sends a POST request.
 * 
 * @param {String} url - The target of the request
 * @param {JSON Object} json - The data to send with the request
 * @param {function} success_function - The function to run when the request is successful
 */
function sendPOSTRequest(url, json, success_function) {
  // jQuery function for sending a request
  $.ajax ({
    // URL of request
    url: url,
    // Type of request
    type: "POST",
    // JSON data to send with the request (as a string)
    data: JSON.stringify(json),
    // Type of data being sent with the request
    dataType: "json",
    // Type of data being sent with the request, again
    contentType: "application/json; charset=utf-8",
    // Function to run when the request is successful
    // data = the JSON data returned with the response
    success: function(data){
      success_function(data);
    },
    // Function to run when the request is unsuccessful
    error: function(data) {
      // Alerts the user that an error has occurred
      alert("There was an error with your request. Please check that your inputs are spelt and formatted correctly.");
      // Reloads the page (usually, to remove a loading screen)
      location.reload();
    }
  });
}

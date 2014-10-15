cgi-node
========

CGI-Node is complete module to replace all HTTP features of PHP running under web servers such as Apache.

CGI-Node provides the ability to run JavaScript on any web server just like PHP in CGI mode using Node.js. 

Features
--------

* Complete and easy access to the HTTP Request:
  * url: The node.js URL object.
  * method: GET | POST | ...
  * headers: {name: value, ...}
  * cookies: {name: value, ...}
  * query/forms: {fieldName: fieldValue, ....}
  * POST data such as forms and files 
* Complete and simple HTTP Response interface:
  * headers: get/set/remove response header fields.
  * cookies: full cookies support between client and server (@see sessions)
* Full server-side session management
  * Store cookies on the server.
  * Store any data that persists between every request.
* Automatic error handling and global exception handler with HTML output to browser.



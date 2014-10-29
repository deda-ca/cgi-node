cgi-node
========

CGI-Node is designed to replace PHP on any shared web hosting site.

CGI-Node provides the ability to run JavaScript on any web server just like PHP as a CGI using Node.js. 

Essentially allowing developers to use a single programming language, JavaScript, for both client and server. You can even run the same code (libraries) on the client or server, reducing development time and code base.

CGI-Node run on shared hosting sites running Apache. It can run along side PHP.

<h2>Features</h2>

<ul>
  <li>Complete and easy access to the HTTP Request:
    <ul>
      <li>url: The node.js URL object.</li>
      <li>method: GET | POST | ...</li>
      <li>headers: {name: value, ...}</li>
      <li>cookies: {name: value, ...}</li>
      <li>query/forms: {fieldName: fieldValue, ....}</li>
      <li>POST data such as forms and files</li>
    </ul>
  </li>
  <li>Complete and simple HTTP Response interface:
    <ul>
      <li>headers: get/set/remove response header fields.</li>
      <li>cookies: full cookies support between client and server (@see sessions)</li>
    </ul>
  </li>
  <li>Full server-side <b>Session</b> management:
    <ul>
      <li>Store cookies on the server.</li>
      <li>Store any data that persists between every request.</li>
    </ul>
  </li>
  <li>Automatic error handling and global exception handler with HTML output to browser.</li>
</ul>

<h2>Easy Setup</h2>

<ul>
  <li>Download the appropriate Node.js binary from <a href="http://nodejs.org/download/">here</a> and copy it to your bin folder on your site.</li>
  <li>Download cgi-node.js from <a href="http://www.cgi-node.org/downloads">here</a> and copy it to your cgi-bin folder on your site.
  <li>Update the first line within cgi-node.js to point to the location of the node executable you uploaded earlier. For example:
    <pre>#!/home/mysite/bin/node</pre>
  </li>
  <li>Ensure you have .htaccess file that contains the following information:
   <pre>
   Action cgi-node /cgi-bin/cgi-node.js 
   AddHandler cgi-node .jss</pre>
  </li>
</ul>

That's it!

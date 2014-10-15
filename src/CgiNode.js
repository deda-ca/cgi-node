/*
The MIT License (MIT)

Copyright (c) 2014 UeiRicho

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

@Author: Uei Richo
@Email: Uei.Richo@gmail.com
*/

// Add the required modules.
var VM = require('vm');
var FS = require('fs');
var URL = require('url');
var Path = require('path');
var Crypto = require('crypto');
var QueryString = require('querystring');

// The NodeCGI context.
var cgiNodeContext = null;

/*
 The first thing we are going to do is set up a way to catch any global 
 exceptions and send them to the client. This is extremely helpful when developing code.
*/
process.on('uncaughtException', function(error)
{
	// Build the HTML error.
	var htmlError = '<br/><div style="color:red"><b>EXCEPTION</b>: ' + error.message + '<i><pre>' + error.stack + '</pre></i></div></br>';

	// If the CGI context has been created then use the response to send the error
	if (cgiNodeContext !== null) cgiNodeContext.response.write( htmlError );

	// Otherwise send an HTTP header followed by the error.
	else process.stdout.write("Content-type: text/html; charset=iso-8859-1\n\n" + htmlError);
});

/*
 When the process exists make sure to save any session data back to the file.
*/
process.on('exit', function(code)
{
	// Save the session back to the file.
	cgiNodeContext.session.save();
	
	// Clean up any sessions that have expired.
	cgiNodeContext.session.cleanUp();
});

// Create the CGI context and execute the requested file.
cgiNodeContext = new CgiHttpContext();

// Create a callback function that will get called when everything is loaded and ready to go. This will execute the script.
var onReady = function() { cgiNodeContext.include(process.env.PATH_TRANSLATED); };

// TODO: remove this when the POST parser is done.
cgiNodeContext.request.method = 'GET';

// If the HTTP method is a 'POST' then read the post data. Otherwise process is ready.
if (cgiNodeContext.request.method != 'POST') onReady();
else cgiNodeContext.request.readPost(onReady);

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

 The HTTP response is an object that contains response header and content methods to 
 return valid HTTP response to the client.
*/
function CgiHttpResponse() 
{
	var self = this;
	
	/*
	 This is the session object, it is set by the session when it is created.
	 This is used to write the cookies to the client when the header is sent.
	*/
	this.session = null;

	/*
	 Defines if the HTTP headers have already been sent or not. The user can choose to send the 
	 headers manually by calling sendHeaders, or it is done automatically the first time the 'write' method
	 is called.
	*/
	this.isHeaderSent = false;

	/*
	 This object defines the list of name/value header of the HTTP headers. These can be manipulated directly
	 by the caller. Set, get, remove methods are not required send the caller can access the header object directly.

	 For reference purposes, here are the headers operations:
	 Set: response.headers[ '<name>' ] = <value>;
	 Get: response.headers[ '<name>' ];
	 Remove: delete response.headers[ '<name>' ]
	*/
	this.headers = { 'content-type': 'text/html; charset=iso-8859-1' };

	/*
	 Sends the current response.headers to the client if it has not yet been sent.
	 After the header is sent it will not be sent again even if the method is called explicitly. 
	 Headers changed within response.headers after the headers have been sent will not be sent.
	*/
	this.sendHeaders = function()
	{
		// If the response has already been send then return;
		if (self.isHeaderSent) return;

		// Set the header as sent and send it.
		self.isHeaderSent = true; 

		// Traverse the headers and output them 
		for (var name in self.headers) process.stdout.write( name + ':' + self.headers[name] + '\r\n');
		
		// Traverse the session cookies and send any cookies that has not yet been sent or that has been updated.
		for (var name in self.session.cookies)
		{
			var cookie = self.session.cookies[name];
			if (cookie.notSent === true)
			{			
				delete(cookie.notSent);
				process.stdout.write( 'Set-Cookie:' + CgiParser.serializeCookie(cookie) + '\r\n' );
			}
		}

		// Write the final new line.
		process.stdout.write('\r\n');
	};

	/*
	 Writes the given string directly to the response output stream.
	 If the headers have not yet been sent to the client, then sends them.
	*/
	this.write = function(string)
	{
		// Send the headers if they not have been sent.
		self.sendHeaders();

		// Send the string to the client.
		process.stdout.write(string.toString());
	};

	/*
	 Sends any headers if not sent yet and exists the process.
	*/
	this.end = function()
	{
		// If the header was not yet sent then send it.
		self.sendHeaders();

		// End the process.
		process.exit();
	};
}

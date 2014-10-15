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

 This static object provides methods to facilitate parse data for the CGI process.
*/
var CgiParser =
{
	/*
	 Splits the given file content into the content sections and the source code sections.

	 NOTE: This expects a 'response.write' method to exist within the context of the executed code
	 and it should have access to '__scripts[id].<script>' array. The caller must place the returned
	 content within the __scripts array under the given id. 

	 id: is used to identify specific content for a specific script. This provides the ability
	 to cash already processed scripts and reuse them without the need to recompile.

	 Content: is the string content of the file.

	 Returns: an object with the following format: { id: <INTEGER>, path: <STRING>, code: <STRING>, content: [<STRING>] } 
	 Where the id is the specified integer id.
	 Content is an ordered array of the different content sections of the file that is
	 referred to by the source code to be written to the output stream at specific points to
	 maintain the flow of the code.
	*/
	script : function(id, path, content)
	{
		// Set the optional parameters to the default values.
		// TODO: get these from the configuration object.
		var openTag = '<?';
		var closeTag = '?>';
		var writePrefix = 'response.write( __scripts[' + id + '].content[';
		var writeSuffix = ']);';

		// Create the 
		var script = {id: id, path: path, code: '', content: []};
		var endIndex = 0;
		var startIndex = 0;

		// Read through all the given content looking for for <? ... ?> or <?= ... ?> sections.
		while (endIndex < content.length)
		{
			// Find the next index of the start tag.
			var endIndex = content.indexOf(openTag, startIndex);

			// If found code section then find the end of it and append it to the blocks.
			if (endIndex >= 0)
			{
				// If there was content before the start tag then read them first.
				if (endIndex > startIndex)
				{
					// Append a read command to the source code referencing the current content array location.
					script.code += writePrefix + script.content.length + writeSuffix;
					
					// Next get the section of data from the section and add to the the content array in the expected location.
					script.content.push( content.slice(startIndex, endIndex) );
				}

				// Skip the open tag.
				startIndex = endIndex + openTag.length;
				
				// If the next character is = then the source code is to be outputted to the stream.
				var writeSection = (content[startIndex] == '=' ? startIndex++ : -1);

				// Find the close tag.
				endIndex = content.indexOf(closeTag, startIndex);

				// If end tag exists then capture the block of code and append it to the source.
				if (endIndex >= 0)
				{
					// If the code block was preceded by '<?=' then encapsulate it with a 'write' call so the result can be written to the output stream.
					if (writeSection > 0) script.code += 'response.write( ' + content.slice(startIndex, endIndex) + ' ); ';

					// Otherwise place the code as is. Ensure there is ';' at the end.
					else script.code += content.slice(startIndex, endIndex) + ';';

					// Move the start index forward past the close tag.
					startIndex = endIndex + closeTag.length;
				}
				// If the close tag was not found then throw exception. TODO: get the line number of start tag for more detailed error reporting.
				else throw new Error('Missing close tag ?>'); 				
			}			
			// If a start tag <? was not found then the rest fo the file is just text content.
			else
			{
				// Move the end tag to the end of the stream.
				endIndex = content.length;
				
				// Add a write call to the source code referencing the content array.
				script.code += writePrefix + script.content.length + writeSuffix;
				script.content.push( content.slice(startIndex, endIndex) );
			}
		}

		// Finally return script object that contains the source and sections.
		return script;
	},


	/*
	 This method traverse the provided environment variables and splits them into the HTTP headers
	 and the server environment variables. All variables names will be converted to lower-case.
	 
	 server: is an output object that will contain the server variables
	 headers: is an output object that will contain the HTTP headers.
	*/
	enviromentVarialbesAndHeaders: function(envVariables, server, headers)
	{
		// Traverse the variables and parse them out into server or HTTP header variables.
		for (var name in envVariables)
		{
			// Get the value and convert the name into lower case to start.
			var value = envVariables[name];
			name = name.toLowerCase();

			// If starts with http then remove 'http_' and add it to the http header array, otherwise add it to the server array.
			if (name.indexOf('http_') === 0) headers[ name.substring('http_'.length) ] = value;
			else server[name] = value;
		}
	},
	
	
	multiPart: function(postData, post)
	{
		if (post === undefined) post = {form: {}, files: {}, parts: []};

		var dataLength = postData.length;
		var endIndex = 0;
		var startIndex = 0;
		
		// Read the first line until \n, this will be the boundary.
		endIndex = postData.indexOf("\n");
		var boundary = postData.substring(startIndex, endIndex-1);
		startIndex = endIndex + 1;		

		// Split the multi parts into single parts.
		post.parts = postData.split(boundary);

		// Traverse the parts and parse them as if they where a single HTTP header and body.
		for (var index = 0; index < post.parts.length; index++)
		{
		}

		// Return the parsed post object.
		return post;
	},
	
	serializeCookie: function(cookie)
	{
		// Add the name = value to the cookie.
		var pairs = [cookie.name + '=' + encodeURIComponent(cookie.value)];
		
		// Add any other fields to the cookie that have been set.
		if (cookie.domain) pairs.push('Domain=' + cookie.domain);
		if (cookie.path) pairs.push('Path=' + cookie.path);
		if (cookie.expires) pairs.push('Expires=' + cookie.expires.toUTCString());
		if (cookie.httpOnly) pairs.push('HttpOnly');

		// Finally return the joint cookie properties.
		return pairs.join('; ');
	},
	
	cookies: function(string)
	{
		var pairs = string.split(';');
		var cookies = {};
	
		for (var index = 0; index < pairs.length; index++)
		{
			// Get the next pair from the array.
			var pair = pairs[index]; 
			
			// Find the first index of '='.
			var indexOfEqual = pair.indexOf('='); 
			
			// If there is no key=value then skip it.
			if (indexOfEqual < 0) continue;
			
			// Parse out the key and the value.
			var key = pair.substr(0, indexOfEqual).trim();
			var value = pair.substr(indexOfEqual + 1, pair.length).trim();
			
			// If the value starts with quotes then remove them.
			if (value[0] == '"') value = value.slice(1, -1);
			
			// Try to decode the value, if exception then just set it. NOTE: if key already exists it will be overwritten.
			try{
				cookies[key] = decodeURIComponent(value);
			} catch(exception) {
				cookies[key] = value;
			}		
		}

		// Finally return the cookie object.
		return cookies;	
	}

};

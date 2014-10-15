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

 The build class is responsible for concatenating all the source code into one file and optimizing it if specified.
 This will help greatly reduce the file size and optimize performance.
*/
function CgiNodeBuilder()
{
	var self = this;

	/*
	 Gets the content for all the given files, concatenates them and returns them.
	 NOTE: The order of the files does matter, make sure they are in the right order.
	*/
	this.getSourceCode = function(files)
	{
		var code = '';
		self.progress('Reading file content...');

		// Loop through the files and get the content.
		for (var index = 0; index < files.length; index++)
		{
			self.progress('Reading: ' + files[index]);
			code += '\n\n' + FS.readFileSync( files[index] );
		}
		
		// Finally return the code for all the files.
		return code;
	};
	
	/*
	 Uses Closure Tools to optimize the JavaScript code.
	 See: https://developers.google.com/closure/compiler/docs/api-ref for more details.
	*/	
	this.optimize = function(code, onFinished)
	{
		self.progress('Optimizing Code');
	
		// Create the post body object.
		var postObject =
		{
			'compilation_level' : 'SIMPLE_OPTIMIZATIONS',
			'output_format': 'text',
			'output_info': 'compiled_code',
			'warning_level' : 'VERBOSE', //'QUIET',
			'js_code' : code
		};
		
		// Convert the object into HTTP post body.
		var postBody = QueryString.stringify( postObject );
		
		// Create the post options, see: http://nodejs.org/api/http.html#http_http_request_options_callback for more details.
		var postOptions = 
		{
			host: 'closure-compiler.appspot.com',
			port: '80',
			path: '/compile',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': postBody.length
			}
		};
		
		// Create the HTTP request and read the response data when it comes through.
		var optimizedCode = '';
		var httpRequest = HTTP.request(postOptions, function(response)
		{
			response.setEncoding('ASCII');
			response.on('data', function(data){ optimizedCode += data; });
			response.on('end', function() { onFinished(optimizedCode); });
		});

		// Write the post body to the request, close the stream and wait for the response.
		httpRequest.write(postBody);
		httpRequest.end();
	};

	/*
	 Outputs the given code to the specified path.
	*/
	this.output = function(code, outputPath, nodeExecPath)
	{
		self.progress('Writing output file: ' + outputPath);
	
		// Add header to optimized code.
		if (nodeExecPath !== undefined) code = '#!' + nodeExecPath + '\n\n' + code;
		
		// Write the file to the destination location.
		FS.writeFileSync(outputPath, code, {encoding: 'ASCII', flag: 'w'});
	};
	
	/*
	 Runs the build on the given files and saves the output to the given output path.
	*/
	this.run = function(files, outputPath, nodeExecPath)
	{
		self.progress('Starting build...');

		// Get the code from the files.
		var code = self.getSourceCode(files);
		
		// Write the standard, non-compressed/optimized code to file.
		self.output(code, outputPath + '.js', nodeExecPath);

		// Optimize the code then write it to file.
		self.optimize(code, function(optimizedCode) { self.output(optimizedCode, outputPath + '.min.js', nodeExecPath); });
	};
	
	/*
	 Formats the given progress message to HTML and writes it to the output stream.
	*/
	this.progress = function(message)
	{
		process.stdout.write(message + '\n');
	};
}

// Add the required modules.
var FS = require('fs');
var HTTP = require('http');
var QueryString = require('querystring');

// Specifies the path to where node executable exists. NOTE: windows machines require the double quotes.
var nodeExecPathLinux = '/usr/bin/nodejs'
var nodeExecPathWindows = '"D:/Programs/nodejs/node.exe"';

// The list of files to build in the correct order.
var files = ['CgiNodeConfig.js', 'CgiNodeContext.js', 'CgiNodeSession.js', 'CgiNodeResponse.js', 'CgiNodeRequest.js', 'CgiNodeParser.js', 'CgiNode.js'];

// The output path and file name.
var output = '../cgi-bin/cgi-node';

// Create the build class and run it.
var build = new CgiNodeBuilder();
build.run(files, output, nodeExecPathWindows);

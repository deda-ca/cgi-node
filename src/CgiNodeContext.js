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

 This is the VM context that will be used to run the requested scripts. 
 The CGI Context defines the global methods and variables that will be available for the executing scripts.
*/
function CgiHttpContext(onFinished)
{
	var self = this;

	/*
	 This array contains all the scripts that have been included within the session.
	 The script structure is: {id: <integer>, path: <string>, code: <string>, content: [<string>]};
	*/
	this.__scripts = [];
	
	/*
	 This is the VM context/sandbox used for every included script.
	*/
	this.__vmContext = null;

	/*
	 This object is created before the requested script is executed. It represents the HTTP request
	 and contains all the request information. This includes the headers, URL, query string, post data
	 and server information.
	 
	 See CgiHttpRequest for more details.
	*/
	this.request = new CgiHttpRequest(onFinished);

	/*
	 This object is created by the initially that implements header and write methods to send data back to the 
	 client.
	 
	 See CgiHttpResponse for more details.
	*/
	this.response = new CgiHttpResponse();

	/*
	 This is the current user session object. It is automatically saved and loaded for each request.
	 The session is sent through Cookies to the client which is automatically sent back and forth for every request.
	 
	 NOTE: this must be created after the request has been parsed.
	*/
	this.session = new CgiHttpSession(this.request, this.response);

	/*
	 This is an alias to the response.write method.
	 Can be used directly within CGI script, example: write('Hello World')
	*/
	this.write = this.response.write;

	/*
	 The node process object is made available to the scripts for any additional information they may require.
	 See http://nodejs.org/documentation/api/ under "process" for more information.
	*/
	this.process = process;
	this.require = require;

	/*
	 Resolve the file path relative to the root of the website as defined within the configuration,
	 or if not specified then the base script path.
	*/
	this.mapPath = function(path)
	{
		var root = Path.dirname(self.request.server.path_translated)
		return Path.resolve(root, path);
	};

	/*
	 Executes the given file within the current context. 
	 If the given file path is is a '.js' file, it is executed as is, otherwise it is assumed to be an ASP page and is parsed first.
	*/
	this.include = function(filePath, options)
	{
		// If options is not defined then assume UTF8 as including.
		if (options === undefined) options = {encoding: 'utf8'};
	
		// Resolve the script path.
		var path = self.mapPath(filePath);

		// Get the script file content.
		var content = FS.readFileSync(path, options);

		// If the file extension is not '.js' then parse out the different code and content sections.
		// TODO: use the configuration object to check if it is a script file or not.
		if (Path.extname(filePath) != '.js') script = CgiParser.script(self.__scripts.length, path, content.toString());

		// Otherwise just create a new script object
		else script = {id: self.__scripts.length, path: path, script: null, code: content, content: []};

		// Push the script onto the global script array.
		self.__scripts.push(script);

		// If the VM context has not yet been created then create it.
		if (self.__vmContext === null) self.__vmContext = VM.createContext(self);

		// Execute the script within the context.
		VM.runInContext(script.code, self.__vmContext, script.path);
	};
	
	/*
	 This method is similar to PhpInfo(). It outputs all the HTTP request and server information and variables
	 to the stream in HTML format.
	*/
	this.cgiNodeInfo = function()
	{
		var drawObject = function(title, object)
		{
			self.response.write('<tr><th colspan="2">' + title + '</th></tr>');
			for (var name in object)
			{
				var value = object[name];
				if (typeof(value) === 'function') continue;
				else if (typeof(value) === 'object')
				{
					var htmlValue = '<table class="NodeASPTable" border="0" style="margin: 0px">'
					for (var subName in value) htmlValue += '<tr><td>' + subName +'</td><td>' + value[subName] +'</td></tr>';
					value = htmlValue + '</table>';
				}

				process.stdout.write('<tr><td>' + name +'</td><td>' + value +'</td></tr>');
			}
		};

		self.response.write('<style>.Logo{ text-align: left; font-size: 36px !important; } .NodeASPTable{ font-family: arial; font-size: 12px; margin: auto; border-collapse: collapse; width: 600px} .NodeASPTable TH{ background-color: #303030; color: white; font-size: 14px; padding: 10px} .NodeASPTable TD{ padding: 5px; } .NodeASPTable TR TD:nth-child(1){ background: #d9ebb3; }</style>');
		self.response.write('<table class="NodeASPTable" border="1">');
		self.response.write('<tr><th colspan="2" class="Logo">CGI-NODE v' + CgiNodeConfig.Version + '</th></tr>');
		
		var session = {id: self.session.id, path: self.session.path, ipAddress: self.session.ipAddress};

		drawObject('Node Versions', process.versions);
		drawObject('CGI Command Line Arguments', process.argv);
		drawObject('Server Variables', self.request.server);
		drawObject('HTTP Request Headers', self.request.headers);
		drawObject('HTTP Request Cookies', self.request.cookies);
		drawObject('Session', session);
		drawObject('Session Cookies', self.session.cookies);
		drawObject('Session Data', self.session.data);
		drawObject('URL Query String', self.request.query);
		drawObject('Post Form', self.request.post.form);
		drawObject('Post Files', self.request.post.files);
		drawObject('Post Parts', self.request.post.parts);

		self.response.write('</table>');
	};
}
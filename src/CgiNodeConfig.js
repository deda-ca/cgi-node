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

 This is the global configuration object for CgiNode. 
 
 NOTE: It is not in a JSON file because we want to compile it directly within the final cig-node.js file to optimize load time.
*/
var CgiNodeConfig = 
{
	Version: '0.2',

	StartTag: '<?',	// Not being used yet.
	EndTag: '<?', // Not being used yet.

	ScriptExtensions: ['.js'], // Not being used yet.

	EmbededScriptExtensions: ['.jss'], // Not being used yet.

	SessionCookie: 'CGI-NODE-SESSIONID',
	SessionTimeOut: 15*60, // 15 minutes
	SessionPath: 'D:/Programs/nodejs/sessions/'
};

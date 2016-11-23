/*
NodeJS Static Http Server - http://github.com/thedigitalself/node-static-http-server/
By James Wanga - The Digital Self
Licensed under a Creative Commons Attribution 3.0 Unported License.

A simple, nodeJS, http development server that trivializes serving static files.

This server is HEAVILY based on work done by Ryan Florence(https://github.com/rpflorence) (https://gist.github.com/701407). I merged this code with suggestions on handling varied MIME types found at Stackoverflow (http://stackoverflow.com/questions/7268033/basic-static-file-server-in-nodejs).

To run the server simply place the server.js file in the root of your web application and issue the command
$ node server.js
or
$ node server.js 1234
with "1234" being a custom port number"

Your web application will be served at http://localhost:8888 by default or http://localhost:1234 with "1234" being the custom port you passed.

Mime Types:
You can add to the mimeTypes has to serve more file types.

Virtual Directories:
Add to the virtualDirectories hash if you have resources that are not children of the root directory

*/

dsfsdgd
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 1111;


var mimeTypes = {
    "htm":  "text/html",
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg":  "image/jpeg",
    "png":  "image/png",
    "gif":  "image/gif",
    "svg":  "image/svg+xml",
    "js":   "text/javascript",
    "css":  "text/css",
    "eot":  "application/vnd.ms-fontobject",
    "otf":  "application/octet-stream",
    "ttf":  "application/octet-stream",
    "woff": "application/x-font-woff",
    "ogg":  "video/ogg",
    "ogv":  "video/ogg",
    "mp4":  "video/mp4",
    "webm": "video/webm",
    "json": "application/json",
    "xml":  "application/xml"
};


var virtualDirectories = {
    "x": "app/build/"
  };




http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri)
    , root = uri.split("/")[1]
    , virtualDirectory;
  
  virtualDirectory = virtualDirectories[root];
  if(virtualDirectory){
    uri = uri.slice(root.length + 1, uri.length);
    filename = path.join(virtualDirectory ,uri);
  }

  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      console.error('404: ' + filename);
      return;
    }

	if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {


      if(err) {
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        console.error('500: ' + filename);
        return;
      }


      var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
      var range = request.headers.range;

      if(!range){


        response.writeHead(200, {"Content-Type": mimeType});
        response.write(file, "binary");
        response.end();
        console.log('200: ' + filename + ' as ' + mimeType);

      }
      else{
          
        var total = file.length;

        var parts = range.replace(/bytes=/, "").split("-");
        var partialstart = parts[0];
        var partialend = parts[1];

        var start = parseInt(partialstart, 10);
        var end = partialend ? parseInt(partialend, 10) : total-1;

        var chunksize = (end-start)+1;

        response.writeHead(206, { "Content-Range": "bytes " + start + "-" + end + "/" + total, "Accept-Ranges": "bytes", "Content-Length": chunksize, "Content-Type": mimeType });
        response.write(file, "binary");
        response.end();

      }





    });

  });

}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

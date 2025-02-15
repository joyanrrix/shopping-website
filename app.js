var http = require('http');
http.createServer(function (req, res) { // add to the 'request' event.
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Hello World</h1>');
}).listen(80, "0.0.0.0");
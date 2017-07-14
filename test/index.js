var path = require('path');
var Express = require('express');

var app = Express();
var server;

//const PATH_STYLES = path.resolve(__dirname, '../client/styles');
const PATH_DIST = path.resolve(__dirname, '../dist');
const PATH_DATA = path.resolve(__dirname, '../test-data');

//app.use('/styles', Express.static(PATH_STYLES));
app.use('/data', Express.static(PATH_DATA));
app.use(Express.static(PATH_DIST));

app.get(['/','/*'], function(req, res) {
  res.sendFile(path.resolve(__dirname, '../src/client/index.html'));
});

server = app.listen(process.env.PORT || 3000, function() {
  var port = server.address().port;
  console.log('Server is listening at %s', port);
});

var http = require('http');
var express = require('express');
var fs=require("fs");
var path = require('path')
var app = express();

app.get('/', function (req, res, next) {
  res.sendfile('./views/index.html');
});

app.get('/getRootFile', function (req, res, next) {
  fs.readdir('./root', function(err, data){
   console.log(data);
   res.write(data.toString());
   res.end();
  });
});


app.get('/download/*', function (req, res, next) {
 
　//第一种方式
  //var f="F:/ftproot/NW.js.docx";
  //var f="f:/ftproot/我是中文的语言.txt"
  ////var f = req.params[0];
  //f = path.resolve(f);
  //console.log('Download file: %s', f);
  //res.download(f);
 
  //第二种方式
  var path="D:/nodejsDemo/Express.js";
  var f = fs.createReadStream(path);
  res.writeHead(200, {
    'Content-Type': 'application/force-download',
    'Content-Disposition': 'attachment; filename=Express.js'
  });
  f.pipe(res);
});
 
http.createServer(app).listen(8888);
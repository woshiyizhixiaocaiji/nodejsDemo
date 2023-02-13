var express = require('express') 
var app = express() 
 
// 定义中间件功能
function logger(req, res, next) { 
   console.log(new Date(), req.url) 
   next() 
 } 
 
// 在每个请求-响应周期中调用logger：middleware
app.use(logger) 
 
// 为路径“ /”执行的路由
app.get('/', function (req, res) { 
   res.send('This is a basic Example for Express.js by nhooo') 
 }) 
 
// 启动服务器
var server = app.listen(8000, function(){ 
    console.log('Listening on port 8000...') 
 })
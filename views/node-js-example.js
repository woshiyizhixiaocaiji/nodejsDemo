var http = require('http');
var fs = require('fs'); 
http.createServer(function(req,res){
	console.log("Hello World");
	res.writeHead(200,{'Content-Type':'application/x-www-form-urlencoded'});
	// 读取文件sample.html
	fs.readFile('C:/Users/Administrator/Desktop/常用账号密码.txt', 
    // 读取文件完成时调用的回调函数
	function(err, data) {  
        if (err) throw err; 
        // 数据是包含文件内容的缓冲区
       res.write(data.toString('utf8'));
	   console.log(data.toString('utf8'));
	   res.end();
 });
}).listen(8087);
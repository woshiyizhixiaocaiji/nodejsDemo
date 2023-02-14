var http = require('http');
var express = require('express');
var multiparty = require('multiparty')
var fs = require("fs");
var app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'nodejsDemo'
});
connection.connect();
var checked = false;

app.get('/', function (req, res, next) {
  res.sendfile('./views/index.html');
});

app.post('/signin', function (req, res, next) {
  connection.query("SELECT * FROM user WHERE username = '" + req.body.username + "' AND password = '" + req.body.password + "'", function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    if (result.length <= 0) {
      res.writeHead(200, { 'content-type': 'text/plain;charset=utf-8' });
      res.write("账号或密码错误！！！");
      res.end();
    } else {
      checked = true;
      res.sendfile('./views/root.html');
    }
  });


});

app.post('/register', function (req, res, next) {
  connection.query("SELECT * FROM user WHERE username = '" + req.body.username + "'", function (err, result) {
    if (err) {
      console.log('[SELECT ERROR] - ', err.message);
      return;
    }
    if (result.length > 0) {
      res.writeHead(200, { 'content-type': 'text/plain;charset=utf-8' });
      res.write("username重复！！！");
      res.end();
    } else {
      var addSql = 'INSERT INTO user(username,password) VALUES(?,?)';
      var addSqlParams = [req.body.username, req.body.password];
      connection.query(addSql, addSqlParams, function (err, result) {
        if (err) {
          console.log('[INSERT ERROR] - ', err.message);
          res.sendfile('./views/index.html');
          return;
        }
        checked = true;
        console.log('--------------------------INSERT----------------------------');
        //console.log('INSERT ID:',result.insertId);        
        console.log('INSERT ID:', result);
        console.log('-----------------------------------------------------------------\n\n');
        res.sendfile('./views/root.html');
      });
    }
    console.log('--------------------------SELECT----------------------------');
    console.log(result);
    console.log('------------------------------------------------------------\n\n');
  });


});


app.get('/view', function (req, res, next) {
  if (!checked) {
    res.sendfile('./views/index.html');
    return;
  }
  var filename = req.query.filename;
  res.sendfile('./views/' + filename);
});

app.get('/video', function (req, res, next) {
  if (!checked) {
    res.sendfile('./views/index.html');
    return;
  }
  var filePath = req.query.filePath;
  res.sendfile(filePath);
});


app.get('/getRootFile', function (req, res, next) {
  if (!checked) {
    res.sendfile('./views/index.html');
    return;
  }
  var path = req.query.value;
  var index = path.indexOf('./root');
  if (index < 0) return;
  fs.readdir(path, function (err, data) {
    data.forEach(e => {
      res.write(path + "/" + e.toString() + ",");
    });
    res.end();
  });
});

app.post('/makeDir', function (req, res, next) {
  if (!checked) {
    res.sendfile('./views/index.html');
    return;
  }
  var path = req.body.filepath;
  var index = path.indexOf('./root');
  if (index < 0) return;
  fs.mkdir(path, { recursive: true }, (err) => {
    if (err) console.log(err);
    else {
      res.writeHead(200, { 'content-type': 'text/plain;charset=utf-8' });
      res.write("创建文件夹成功！！！");
      res.end();
    };
  });
});


app.post('/upload', function (req, res) {
  if (!checked) {
    res.sendfile('./views/index.html');
    return;
  }
  //生成multiparty对象，并配置上传目标路径
  var form = new multiparty.Form();
  //设置编辑
  form.encoding = 'utf-8';
  //设置文件存储路径
  form.uploadDir = decodeURI(req.headers.filepath) + "/";
  //上传完成后处理
  form.parse(req, function (err, fields, files) {
    var filesTmp = JSON.stringify(files, null, 2);
    if (err) {
      console.log('parse error: ' + err);
    } else {
      console.log('parse files: ' + filesTmp);
      var inputFile = files['file'][0];
      //重命名为真实文件名
      fs.renameSync(inputFile.path, decodeURI(form.uploadDir + inputFile.originalFilename), function (err) {
        if (err) {
          console.log('rename error: ' + err);
        } else {
          console.log('rename ok');
        }
      });
    }
    res.writeHead(200, { 'content-type': 'text/plain;charset=utf-8' });
    res.write('received upload:\n\n');
    res.end();
  });
});

app.post('/download', function (req, res) {
  if (!checked) {
    res.sendfile('./views/index.html');
    return;
  }
  var path = decodeURI(req.body.path);
  try {
    fs.stat(path, function (err, stat) {
      console.log("path=" + path);
      var type = stat.isDirectory();
      var fileType = 0;
      if (type) { fileType = 1; }
      if (type == 0) {
        res.writeHeader(200, {
          "Content-Type": 'application/force-download',
          "Content-Disposition": 'attachment',
          "filename": encodeURI(path.slice(path.lastIndexOf("/") + 1, path.length)),
          "Content-Length": stat.size
        });
        var fReadStream = fs.createReadStream(path);
        fReadStream.on('data', function (chunk) {
          if (!res.write(chunk)) {
            fReadStream.pause();
          }
        });
        fReadStream.on('end', function () {
          res.end();
        });
        res.on("drain", function () {
          fReadStream.resume();
        });
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/force-download',
          'filetype': fileType,
          'path': encodeURI(path),
        });
        res.end();
      }
    });
  } catch (error) {
    console.error(err);
  }
});

http.createServer(app).listen(8888);
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser')
// var cors = require('cors')
// 引入配置文件
const myConfig = require('./config')

// 引入路由
// (通过配置/routes/routes.js文件来遍历注册路由，就不用一个一个引入了)
const { registerRoutes } = require('./routes')
// var indexRouter = require('./routes/home');
// var usersRouter = require('./routes/users');


var app = express();
// 改写
var http = require('http');
var server = http.createServer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// 注册第三方包
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// 静态资源处理
app.use(express.static(path.join(__dirname, 'static')));
// 获取post请求的参数
app.use(bodyParser.urlencoded({ extended: true }))
// 跨域
// app.use(cors())
// 手写跨域配置
app.all('*',function(req,res,next){
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
  next()
})


// 注册路由
// (通过配置/routes/routes.js文件来注册路由，就不用一个一个引入了)
registerRoutes(app)


// 404
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// 错误
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 启动服务器
server.listen(myConfig.server.port, () => {
  const { host, port } = myConfig.server
  console.log(`http://${host}:${port}`);
})
// module.exports = app;

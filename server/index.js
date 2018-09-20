(function () {
  'use strict'

  var express = require('express')
  var bodyParser = require('body-parser')
  var winston = require('winston')
  var path = require('path')
  var expressWinston = require('express-winston')
  var logs = require('./logger')
  var api = require('./api')
  var settings = require('./setting')

  var app = express()

// root参数指定静态文件的根目录
  app.use(express.static(path.join(__dirname, 'public')))
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  app.use(bodyParser.raw())

//解决跨域
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS")
    res.header("Content-Type", "application/json;charset=utf-8")
    next()
  })

// 正常请求的日志
  app.use(expressWinston.logger({
    transports: [
      new (winston.transports.Console)({
        json: true,
        colorize: true
      }),
      new winston.transports.File({
        filename: './logs/success.log'
      })
    ]
  }))

// API路由
  app.use('/api', api)

// 错误请求的日志
  app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      }),
      new winston.transports.File({
        filename: './logs/error.log'
      })
    ]
  }))

// catch 404 and forward to error handler
  app.use(function (req, res, next) {
    var err = new Error('Not Found')
    err.status = 404;
    next(err); // 如果使用了 next(error)，则会返回错误而不会传递到下一个中间件;
  })

// error handler
// 处理所有error请求,并加载error页面，显示错误信息
  app.use(function (err, req, res, next) {
    res.send(err)
  })

//启动后台服务
  var server = app.listen(settings.server.port, function () {
    logs.logger.log('info', '本地后台服务器启动，正在监听端口<' + server.address().port + '>...')
  })

  module.exports = app

}());
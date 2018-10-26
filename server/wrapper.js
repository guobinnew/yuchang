
(function () {
    'use strict'

    var express = require('express')
    var path = require('path')
    var favicon = require('serve-favicon')

    var app = express()
    var port = 3000

    // root参数指定静态文件的根目录
    var rootDir = path.resolve(__dirname, '../client/dist')
    app.use('/', express.static(rootDir))
    app.use(favicon(path.join(rootDir,'favicon.ico')))

    var server = app.listen(port, function () {
        console.log('info', '本地前台服务器启动，正在监听端口<' + port + '>...' )
    })
    
    module.exports = {
        server: server,
        url: 'http://localhost:' + port + '/index.html'
    }

}());
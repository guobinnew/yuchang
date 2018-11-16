const CopyWebpackPlugin = require("copy-webpack-plugin")
const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path')
const fs = require('fs')

const distPath = path.join(__dirname, '../dist')
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath)
}

module.exports = {
  target: 'node',
  mode: 'production',
  entry: path.join(__dirname, '../index.js'),
  output: {
    path: distPath,
    filename: 'yuchg.js'
  },
  devtool: 'none',
  module: {
    rules: [{
      test: /(\.jsx|\.js)$/,
      use: {
        loader: "babel-loader"
      },
      exclude: /node_modules/
    }]
  },
  plugins: [
    new CleanWebpackPlugin(["dist"], {
      root: path.join(__dirname, '..'),
      verbose: true, //开启在控制台输出信息
      dry: false,
    }),
    new CopyWebpackPlugin([
    {
      from: path.join(__dirname, '../blockDefs'),
      to: path.join(distPath, 'blockDefs')
    }])
  ]
}
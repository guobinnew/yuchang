var express = require('express')
var logs = require('../../logger')
var apitestv1 = require('./test')

const router = express.Router()

router.use('/test', apitestv1)

module.exports = router

var express = require('express')
var logs = require('../logger')
var apiv1 = require('./v1')

const router = express.Router()

router.use('/v1', apiv1)

module.exports = router
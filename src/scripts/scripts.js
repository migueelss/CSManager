const openGUI = require('./openGUI')
const pullCommand = require('./pull')
const pushCommand = require('./push')
const submitCommand = require('./submit')
const checkConfiguration = require('./checkConfiguration')
const configuration = require('./configuration')

module.exports = {
    openGUI,
    pullCommand,
    pushCommand,
    checkConfiguration,
    configuration
}
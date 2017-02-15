const restify = require('restify')

require('sugar')

const app = module.exports = restify.createServer()

app.use(restify.bodyParser({ mapParams: true }))
app.use(restify.queryParser())

require('./resources/url')(app)

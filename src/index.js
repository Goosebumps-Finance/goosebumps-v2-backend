// make bluebird default Promise
const { port, env } = require("./config/vars");
const fs = require('fs')
const https = require('https')
const logger = require("./config/logger");
const app = require("./config/express");

////////////////////////////////////////////

/**
 * Create HTTPS server.
 */

// const server = https.createServer({
//     key: fs.readFileSync('/certs/private.key'),
//     cert: fs.readFileSync('/certs/certificate.crt'),
// }, app)

// // listen to requests
// server.listen(port, () => logger.info(`server started on port ${port} (${env})`));

// /**
//  * Exports express
//  * @public
//  */
// module.exports = server;

////////////////////////////////////////////

/**
 * Create HTTP server.
 */

// listen to requests
app.listen(port, () => logger.info(`server started on port ${port} (${env})`));

/**
 * Exports express
 * @public
 */
module.exports = app;

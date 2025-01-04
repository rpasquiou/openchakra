const path = require('path')
const https = require('https')
const fs = require('fs')
const myEnv = require('dotenv').config({path: path.resolve(__dirname, '../../../.env')})
const dotenvExpand = require('dotenv-expand')
dotenvExpand.expand(myEnv)
const axios = require('axios')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const express = require('express')
const next = require('next')
const bodyParser = require('body-parser')
const passport = require('passport')
const glob = require('glob')
const cors = require('cors')
const autoIncrement = require('mongoose-auto-increment')
const {
  RANDOM_ID,
  checkConfig,
  getDatabaseUri,
  getHostUrl,
  getPort,
  isProduction,
  isValidation,
  isDevelopment,
  isDevelopment_nossl,
  config,
  getDataModel,
  isMaster,
  setMasterStatus,
} = require('../config/config')
const {HTTP_CODES, parseError} = require('./utils/errors')
// TODO: if not explicit require, chapter is not found in mongoose
require('./models/Chapter')

// Backend private
require('./models/PageTag_')

// Project mdels
const {MONGOOSE_OPTIONS} = require('./utils/database')

require('console-stamp')(console, '[dd/mm/yy HH:MM:ss.l]')

const dev = process.env.NODE_DEV !== 'production' // true false
const prod = process.env.NODE_DEV === 'production' // true false
const nextApp =
  isProduction() || isValidation() ? next({prod}) : next({dev})
const routes = require('./routes')
const routerHandler = routes.getRequestHandler(nextApp)
const studio = require('./routes/api/studio')
const withings = getDataModel()=='dekuple' ? require('./routes/api/withings') : null
const app = express()
const {serverContextFromRequest} = require('./utils/serverContext')
const { delayedPromise } = require('../utils/promise')
let custom_router=null
try {
  custom_router=require(`./plugins/${getDataModel()}/routes`).router
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') { throw err }
  console.warn(`No custom routes for ${getDataModel()}`)
}

let db_update_fn=null
try {
  db_update_fn=require(`./plugins/${getDataModel()}/database_update`)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') { throw err }
  console.warn(`No database updates required for ${getDataModel()}`)
}

// Import all data models
const modelsPath=path.join(__dirname, 'models')
fs.readdirSync(modelsPath).forEach(file => {
  if (file.endsWith('.js')) {
    const modelName = path.basename(file, '.js')
    require(path.join(modelsPath, file))
  }
})


// TODO Terminer les notifications
// throw new Error(`\n${'*'.repeat(30)}\n  TERMINER LES NOTIFICATIONS\n${'*'.repeat(30)}`)
// checkConfig
checkConfig()
  .then(() => !isDevelopment() && delayedPromise(5000, setMasterStatus))
  .then(() => {
    return mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
      .then(conn => autoIncrement.initialize(conn))
      .then(() => isMaster() && db_update_fn && db_update_fn())
  })
  // Connect to MongoDB
  .then(() => {
    console.log(`MongoDB connecté: ${getDatabaseUri()}`)
    return nextApp.prepare()
  })
  .then(() => {
    // Body parser middleware
    app.use(bodyParser.urlencoded({extended: true, limit: '5mb'}))
    app.use(bodyParser.json({limit: '5mb'}))

    app.use(passport.initialize())

    app.use(cookieParser())
    // Passport config
    /* eslint-disable global-require */
    require('./config/passport')
    /* eslint-enable global-require */

    // Context handling
    app.use((req, res, next) => {
      // console.log(`REQUEST:${req.method}, ${req.originalUrl}, ${JSON.stringify(req.body)}`)
      serverContextFromRequest(req)
        .then(context => {
          req.context = context
          return next()
        })
        .catch(err => {
          console.error(err)
          return res.status(500).json(err)
        })
    })

    // Hide test pages
    app.use((req, res, next) => {
      if (isProduction() && req.url.match(/^\/test\//)) {
        return res.sendStatus(HTTP_CODES.NOT_FOUND)
      }
      return next()
    })

    app.use(cors())

    // Check hostname is valid
    app.use('/myAlfred/api/studio', studio)
    !!withings && app.use('/myAlfred/api/withings', withings)
    !!custom_router && app.use(`/myAlfred/api/${getDataModel()}`, custom_router)

    // const port = process.env.PORT || 5000;
    const rootPath = path.join(__dirname, '/..')
    glob.sync(`${rootPath}/server/api/*.js`).forEach(controllerPath => {
      if (!controllerPath.includes('.test.js')) {
        /* eslint-disable global-require */
        require(controllerPath)(app)
        /* eslint-enable global-require */
      }
    })

    if (!isDevelopment_nossl() && !isDevelopment()) {
      app.use((req, res, next) => {
        if (!req.secure) {
          console.log(`'Redirecting to ${JSON.stringify(req.originalUrl)}`)
          res.redirect(302, `https://${req.hostname}${req.originalUrl}`)
        }
        next()
      })
    }
    app.get('*', routerHandler)

    // Single error handler.YEAAAAAHHHHHH !!!
    app.use((err, req, res, next) => {
      console.error(err)
      const {status, body}=parseError(err)
      return res.status(status).json(body)
    })

    // HTTP only handling redirect to HTTPS
    // http.createServer((req, res) => {
    //   res.writeHead(301, {'Location': `https://${ req.headers.host }${req.url}`})
    //   res.end()
    // }).listen(80)
    // console.log('Created server on port 80')

    // HTTPS server using certificates
    const httpsServer = https.createServer(
      {
        cert: fs.readFileSync(`${process.env.HOME}/.ssh/fullchain.pem`),
        key: fs.readFileSync(`${process.env.HOME}/.ssh/privkey.pem`),
      },
      app,
    )

    httpsServer.listen(getPort(), () => {
      console.log(`${config.appName} running on ${getHostUrl()}`)
      console.log(`Server started OK`)
    })
  })
  .catch(err => {
    console.error(`**** Démarrage impossible:${err}`)
    process.exit(1)
  })

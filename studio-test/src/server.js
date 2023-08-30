const path=require('path')
const myEnv = require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
const dotenvExpand = require('dotenv-expand')
dotenvExpand.expand(myEnv)
const { createServer } = require('https')
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const prod = ['production', 'validation'].includes(process.env.MODE)
const dev = !prod
const port = parseInt(process.env.STUDIO_TEST_PORT, 10) || 3001;
const next = require('next')
const bodyParser = require('body-parser')
const nextApp = prod ? next({prod}) : next({dev})
const routes = require('./routes')
const routerHandler = routes.getRequestHandler(nextApp)
const glob = require('glob')
const cors = require('cors')
const fs = require('fs')
const app = express()

const API_PATH = '/myAlfred/api'
const isSecure = process.env.MODE === 'production'

console.log(`Starting as ${process.env.MODE}; production next server is ${prod}`)
nextApp.prepare().then(() => {

  app.use(
    API_PATH,
    createProxyMiddleware({
      target: `https://localhost:${process.env.BACKEND_PORT || '443'}`,
      changeOrigin: true,
      pathFilter: API_PATH,
      secure: isSecure
    })
  );

  // Body parser middleware
  app.use(bodyParser.urlencoded({extended: false}))
  app.use(bodyParser.json())

  app.use(cors())

  const rootPath = path.join(__dirname, '/..')
  glob.sync(`${rootPath}/server/api/*.js`).forEach(controllerPath => {
    if (!controllerPath.includes('.test.js')) {
      /* eslint-disable global-require */
      require(controllerPath)(app)
      /* eslint-enable global-require */
    }
  })
  app.use(express.static('static'))

  app.get('*', routerHandler)

  // HTTPS server using certificates
  const httpsServer = createServer({
    cert: fs.readFileSync(`${process.env.HOME}/.ssh/fullchain.pem`),
    key: fs.readFileSync(`${process.env.HOME}/.ssh/privkey.pem`),
  },
  app)

  httpsServer.listen(port, () => console.log(`running on https://localhost:${port}/`))

})
.catch(err => console.error(err))

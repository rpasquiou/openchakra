const path=require('path')
const myEnv = require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
const dotenvExpand = require('dotenv-expand')
dotenvExpand.expand(myEnv)
const { createServer } = require('https')
const request = require('request')
const { createProxyMiddleware } = require('http-proxy-middleware');
const express = require('express');
const prod = ['production', 'validation'].includes(process.env.MODE)
const dev = !prod
const next = require('next')
const bodyParser = require('body-parser')
const nextApp = prod ? next({prod}) : next({dev})
const routes = require('./routes')
const routerHandler = routes.getRequestHandler(nextApp)
const AWS = require('aws-sdk')
const glob = require('glob')
const cors = require('cors')
const fs = require('fs')
const app = express()
const {checkConfig}=require('./config')


const API_PATH = '/myAlfred/api'

console.log(`Starting as ${process.env.MODE}; production next server is ${prod}`)
checkConfig()
  .then(() => nextApp.prepare())
  .then(() => {
  const isSecure = process.env.MODE === 'production'
  app.use(
    API_PATH,
    createProxyMiddleware({
      target: `https://localhost:${process.env.BACKEND_PORT}`,
      changeOrigin: true,
      pathFilter: API_PATH,
      secure: isSecure
    })
  );
  
  // TODO Move this proxy in backend ?
  AWS.config.update({
    accessKeyId: process.env.S3_ID,
    secretAccessKey: process.env.S3_SECRET,
    region: process.env.S3_REGION,
  })
  
  const S3 = new AWS.S3()

  app.use('/SCORM', 
    createProxyMiddleware({
      target: `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`,
      changeOrigin: true,
      secure: isSecure,
      onProxyReq: async (proxyReq, req, res) => {
        const s3Params = {Bucket: 'my-alfred-data-test',Key: decodeURI(proxyReq.path).replace(/^\/SCORM\//, '').replace(/\?v=.*$/, '')}
        const url=S3.getSignedUrl('getObject', s3Params)
        proxyReq.path=url
      },
      onProxyRes: (proxyRes) => {
        // console.log('After:', proxyRes)
          proxyRes.headers['Content-Security-Policy'] = "frame-ancestors 'self' https://localhost";
          proxyRes.headers['X-Frame-Options'] = "ALLOW-FROM https://localhost";
      }
    })
  )

  // Body parser middleware
  app.use(bodyParser.urlencoded({extended: false}))
  app.use(bodyParser.json())

  app.use(cors())

  // Proxy for S3 files
  app.get('/proxy', (req, res) => {
    console.log('Proxying', req.query.url)
    const url = req.query.url;
    if (!url) return res.status(400).send('URL is required');
    request(url).pipe(res);
  })

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

  const port = parseInt(process.env.FRONTEND_APP_PORT, 10)

  httpsServer.listen(port, () => console.log(`running on https://localhost:${port}/`))

})
.catch(err => console.error(err))

const express = require('express')
const passport = require('passport')
const router = express.Router()

router.get('/', (req, res) => {
  res.json('ok')
})

router.get('/setup', passport.authenticate('cookie', {session: false}), (req, res) => {
  console.log(`redirect to setup for ${req.user.email}, token is ${req.user.csrf_token}`)
  return Promise.resolve(res
    .cookie('access_token', req.user.access_token, {
      domain: '.withings.com',
      secure: true,
      maxAge: 10800,
    })
    .redirect(`https://inappviews.withings.com/sdk/setup?csrf_token=${req.user.csrf_token}`),
  )
})

router.get('/settings', passport.authenticate('cookie', {session: false}), (req, res) => {
  console.log(`redirect to settings for ${req.user.email}, token is ${req.user.csrf_token}`)
  return Promise.resolve(res
    .cookie('access_token', req.user.access_token, {
      domain: '.withings.com',
      secure: true,
      maxAge: 10800,
    })
    .redirect(`https://inappviews.withings.com/sdk/settings?csrf_token=${req.user.csrf_token}`),
  )
})

let MEASURES_CALLBACK = p => console.warn(`Implement callback ${JSON.stringify(p)}`)

const getMeasuresCallback = data => MEASURES_CALLBACK(data)

const setMeasuresCallback = fn => MEASURES_CALLBACK=fn

router.head('/measures', (req, res) => {
  return res.status(200).send("ok")
})

router.post('/measures', (req, res) => {
  const data=req.body
  console.log(`Withings called /measures with ${JSON.stringify(data)}`)
  getMeasuresCallback(data)
    .then(console.log)
    .catch(console.error)
  return res.status(200).send("ok")
})


module.exports = {
  router,
  setMeasuresCallback,
}

const jwt = require('jsonwebtoken')
const passport = require('passport')
const CookieStrategy = require('passport-cookie').Strategy
const AnonymousStrategy = require('passport-anonymous').Strategy
const BasicStrategy = require('passport-http').BasicStrategy
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const keys = require('./keys')

// Requires connection
const cookieStrategy = new CookieStrategy((token, done) => {
  try {
    const user = jwt.verify(token, keys.JWT.secretOrKey)
    User.findById(user.id)
      .then((user) => {
        if (user) {
          return done(null, user)
        }
        return done(null, false, { message: 'Vous devez être connecté' })
      })
      .catch((err) => console.error(err))
  } catch (err) {
    return done(null, false, { message: 'Token expired or invalid' })
  }
})
passport.use(cookieStrategy)

// Allows non-connected (i.e. for unconnected search)
passport.use(new AnonymousStrategy())

const sendCookie = (user, res) => {
  const options = {}
  if (keys.JWT.expiresIn) {
    options.expiresIn = keys.JWT.expiresIn
  }

  const token = jwt.sign({ id: user.id }, keys.JWT.secretOrKey, options)
  return res.cookie('token', token, {
    httpOnly: false,
    secure: true,
    sameSite: true,
  })
}

passport.use(new BasicStrategy(
  (username, password, done) => {
    User.findOne({email: username})
      .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
          return done(null, user)
        }
        return done(null, false, {message: 'Vous devez être connecté'})
      })
      .catch(err => console.error(err))
    }
))

passport.serializeUser(function(user, done) {
  done(null, user._id);
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  })
})

module.exports={sendCookie}

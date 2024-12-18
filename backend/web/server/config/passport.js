const jwt = require('jsonwebtoken')
const passport = require('passport')
const CookieStrategy = require('passport-cookie').Strategy
const AnonymousStrategy = require('passport-anonymous').Strategy
const BasicStrategy = require('passport-http').BasicStrategy
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const OIDCStrategy = require("passport-azure-ad").OIDCStrategy;

// Requires connection
const cookieStrategy=new CookieStrategy(
  (token, done) => {
    const user=jwt.decode(token)
    User.findById(user.id)
      .then(user => {
        if (user) {
          return done(null, user)
        }
        return done(null, false, {message: 'Vous devez être connecté'})
      })
      .catch(err => console.error(err))
  },
)
passport.use(cookieStrategy)

// Allows non-connected (i.e. for unconnected search)
passport.use(new AnonymousStrategy())

const sendCookie = (user, res) => {
  const token=jwt.sign({id: user.id}, 'secret')
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

const initAzureSSO = async () => {

  console.log('Azure SSO client ID', process.env.SSO_CLIENTID)
  console.log('Azure SSO metadata', process.env.SSO_METADATA_URL)
  console.log('Azure SSO callback', process.env.SSO_CALLBACK_URL)
  
    const SSOStrategy = new OIDCStrategy(
    {
      identityMetadata: process.env.SSO_METADATA_URL,
      clientID: process.env.SSO_CLIENTID,
      responseType: "code",
      responseMode: "query",
      redirectUrl: process.env.SSO_CALLBACK_URL,
      clientSecret: process.env.SSO_CLIENT_SECRET,
      validateIssuer: true,
      passReqToCallback: false,
      scope: ["openid", "profile", "email"],
    },
    async (iss, sub, profile, accessToken, refreshToken, done) => {
      // The user profile returned by Azure AD
      if (!profile) {
        return done(new Error("No profile found"));
      }
      const rawProfile=profile._json
      const email=rawProfile.email
      const user=await User.findOne({email})
      if (user) {
        return done(null, user)
      }
      const firstname=rawProfile.firstname
      const lastname=rawProfile.lastname
      // TODO Discriminate role
      const role='ROLE_MEMBER'
    
      try {
        user=await User.create({email, firstname, lastname, role, password: 'PASSWD'})
        return done(null, user)
      }
      catch(err) {
        return done(err)
      }
    }
  )

  passport.use(SSOStrategy)
}

initAzureSSO()

passport.serializeUser(function(user, done) {
  done(null, user._id);
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  })
})

module.exports={sendCookie}

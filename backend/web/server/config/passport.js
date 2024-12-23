const jwt = require('jsonwebtoken')
const passport = require('passport')
const CookieStrategy = require('passport-cookie').Strategy
const AnonymousStrategy = require('passport-anonymous').Strategy
const BasicStrategy = require('passport-http').BasicStrategy
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const { getDataModel } = require('../../config/config')
let pluginFunctions=require(`../plugins/${getDataModel()}/functions`)
const OIDCStrategy = require("passport-azure-ad").OIDCStrategy;

const init = async () => {
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
    
    if (!!process.env.SSO_PLUGIN) {
      console.log(`SSO plugin : ${process.env.SSO_PLUGIN}`)
    }

    if (process.env.SSO_PLUGIN=='azure') {
      
      console.log('SSO starting azure configuration')
      const initAzureSSO = async () => {
        
      const required=['SSO_CLIENTID', 'SSO_CLIENT_SECRET', 'SSO_METADATA_URL', 'SSO_CALLBACK_URL']

      required.map(r => {
        if (!process.env[r]) {
          console.log(`Environment ${r} is missing`)
          throw new Error(`Environment ${r} is missing`)
        }
      })

      if (!pluginFunctions.ssoProfileCallback)     {
        throw new Error('SSO: missing ssoProfileCallback')
      }
      if (!pluginFunctions.ssoLoginCallback)     {
        throw new Error('SSO: missing ssoLoginCallback')
      }
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
        (iss, sub, profile, accessToken, refreshToken, done) => {
          return pluginFunctions.ssoProfileCallback(iss, sub, profile, accessToken, refreshToken)
            .then(user => done(null, user))
            .catch(done)
        }
      )

      passport.use(SSOStrategy)
    }

    await initAzureSSO()
  }

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  })

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    })
  })

}

const sendCookie = (user, res) => {
  const token=jwt.sign({id: user.id}, 'secret')
  return res.cookie('token', token, {
    httpOnly: false,
    secure: true,
    sameSite: true,
  })
}


module.exports={sendCookie, init}

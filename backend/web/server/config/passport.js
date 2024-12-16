const jwt = require('jsonwebtoken')
const passport = require('passport')
const CookieStrategy = require('passport-cookie').Strategy
const AnonymousStrategy = require('passport-anonymous').Strategy
const BasicStrategy = require('passport-http').BasicStrategy
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const OAuth2Strategy = require('passport-oauth2');

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

console.log('SSO client ID', process.env.SSO_CLIENTID)
console.log('SSO issuer', process.env.SSO_ENTRYPOINT)
console.log('SSO callback', process.env.SSO_CALLBACK_URL)


const getAzureAttribute = (azureAnswer, attribute) => {
 const azureAttribute=`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/${attribute}`
 return azureAnswer[azureAttribute]
}


const SSOStrategy = new OAuth2Strategy(
  {
    authorizationURL: `${process.env.SSO_ENTRYPOINT.replace('/v2.0/.well-known/openid-configuration','')}/oauth2/v2.0/authorize`,
    tokenURL: `${process.env.SSO_ENTRYPOINT.replace('/v2.0/.well-known/openid-configuration','')}/oauth2/v2.0/token`,
    clientID: process.env.SSO_CLIENTID,
    clientSecret: process.env.SSO_CLIENT_SECRET,
    callbackURL: process.env.SSO_CALLBACK_URL,
    scope: ['openid'],
  },
  async (accessToken, refreshToken, profile, done) => {
    // The callback receives the tokens and can fetch user info or save session
    console.log('Access Token:', accessToken);
    console.log('Refresh Token:', refreshToken);
    console.log('In SSO cb:got', profile)
    const email=getAzureAttribute(profile, 'emailaddress')
    const user=await User.findOne({email})
    if (user) {
      console.log('I found a user', user)
    }
    else {
      const firstname=getAzureAttribute(profile, 'givenname')
      const lastname=getAzureAttribute(profile, 'surname')
      const role=getAzureAttribute(profile, 'jobtitle')=='FORMATEUR' ? 'FORMATEUR' : 'GESTIONNAIRE',
      
      user=await User.create({
        email, firstname, lastname, role, password: 'PASSWD',
      })
      console.log('I created a user', user)
    }
  return done(null, { accessToken, refreshToken })
  return done(null, user)
 }
)


passport.use(SSOStrategy)

passport.serializeUser(function(user, done) {
  done(null, user._id);
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  })
})

module.exports={sendCookie}

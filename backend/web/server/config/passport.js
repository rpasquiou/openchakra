const jwt = require('jsonwebtoken')
const passport = require('passport')
const CookieStrategy = require('passport-cookie').Strategy
const AnonymousStrategy = require('passport-anonymous').Strategy
const BasicStrategy = require('passport-http').BasicStrategy
const SamlStrategy = require('passport-saml').Strategy
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const fs=require('fs')

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

console.log('SSO entry point', process.env.SSO_ENTRYPOINT)
console.log('SSO issuer', process.env.SSO_ISSUER)
console.log('SSO callback', process.env.SSO_CALLBACK_URL)
console.log('SSO certificate', `${process.env.HOME}/.ssh/aftral.pem`)

const getSamlAttribute = (samlAnswer, attribute) => {
  const samlAttribute=`http://schemas.xmlsoap.org/ws/2005/05/identity/claims/${attribute}`
  return samlAnswer[samlAttribute]
}

const SSOStrategy = new SamlStrategy(
  {
    entryPoint: process.env.SSO_ENTRYPOINT,
    issuer: process.env.SSO_ISSUER,
    path: process.env.SSO_CALLBACK_URL,
    protocol: 'https://',
    cert: fs.readFileSync(`${process.env.HOME}/.ssh/aftral.pem`, 'utf8'),
  },
  async (profile, done) => {
    console.log('In SAML cb:got', profile)
    const email=getSamlAttribute(profile, 'emailaddress')
    const user=await User.findOne({email})
    if (!user) {
      const firstname=getSamlAttribute(profile, 'givenname')
      const lastname=getSamlAttribute(profile, 'surname')
      const role=getSamlAttribute(profile, 'jobtitle')=='FORMATEUR'
      user=await User.create({
        email, firstname, lastname, role, password: 'PASSWD',
      })
    }
    return done(null, user)
  }
);

passport.use(SSOStrategy)

passport.serializeUser(function(user, done) {
  console.log('serialize user', user)
  done(null, user._id);
})

passport.deserializeUser(function(id, done) {
  console.log('serialize user', id)
  User.findById(id, function(err, user) {
    done(err, user);
  })
})


module.exports={sendCookie}

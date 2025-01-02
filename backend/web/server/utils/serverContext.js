const jwt = require('jsonwebtoken')
const {isPlatform} = require('../../config/config')
const MarketplacePayment = require('../plugins/payment/marketplacePayment')
// const PlatformPayment = require('../plugins/payment/platformPayment')
const User=require('../models/User')
const keys = require('../config/keys')

const get_token = req => {
  const auth = req.headers.authorization
  if (!auth) {
    return null
  }
  const data = auth.split(' ')[1]
  try {
    const decoded = jwt.verify(data, keys.JWT.secretOrKey)
    return decoded
  } catch (err) {
    console.log('Token verification failed:', err.message)
    return null
  }
}

const get_logged_id = req => {
  const token = get_token(req)
  if (token) {
    return token.id
  }
  return null
}

const getRole = req => {
  const token = get_token(req)
  if (token) {
    return token.role
  }
  return null
}

const getRoles = req => {
  const token = get_token(req)
  if (token) {
    return token.roles
  }
  return null
}

// Create JWT cookie with user credentials
const send_cookie = (user, res, logged_as=null) => {
  const payload = {
    id: user.id,
    name: user.name,
    firstname: user.firstname,
    is_admin: user.is_admin,
    is_alfred: user.is_alfred,
    is_alfred_pro: user.shop && user.shop.length==1 && !user.shop[0].is_particular,
    is_registered: user.is_registered,
    is_super_admin: user.is_admin && user.email.match(/@my-alfred\.io$/),
    logged_as: logged_as,
  } // Create JWT payload

  const options = {}
  if (keys.JWT.expiresIn) {
    options.expiresIn = keys.JWT.expiresIn
  }

  jwt.sign(payload, keys.JWT.secretOrKey, options, (err, token) => {
    if (err) {
      return console.error(`Token signing error:${err}`)
    }
    res.cookie('token', `Bearer ${token}`, {
      httpOnly: false,
      secure: true,
      sameSite: true,
    }).status(201).json()
  })
}

class RequestServerContext {
  constructor(request) {
    this.request=request
    this.user=null
    this.payment=new MarketplacePayment()
  }

  init = () => {
    this.payment=isPlatform() ? new PlatformPayment() : new MarketplacePayment()
    return new Promise((resolve, reject) => {
      const user_id=get_logged_id(this.request)
      if (!user_id) {
        return resolve(null)
      }
      User.findById(user_id)
        .then(user => {
          this.user=user
          return resolve(null)
        })
        .catch(err => {
          console.error(err)
          return reject(err)
        })
    })
  }

  isAdmin = () => {
    return get_token(this.request) && get_token(this.request).is_admin
  }

  getLoggedAs = () => {
    const token=get_token(this.request)
    return token && token.logged_as
  }

}

const serverContextFromRequest = req => {
  return new Promise((resolve, reject) => {
    ctx=new RequestServerContext(req)
    ctx.init()
      .then(() => {
        resolve(ctx)
      })
      .catch(err => {
        reject(err)
      })
  })
}

module.exports = {get_logged_id, getRole, getRoles,
  send_cookie, get_token, serverContextFromRequest,
}

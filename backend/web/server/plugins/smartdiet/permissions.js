const { VERB_GET, VERB_PUT, VERB_POST, VERB_DELETE } = require("../../../utils/consts")
const Coaching = require("../../models/Coaching")
const User = require("../../models/User")
const { idEqual } = require("../../utils/database")
const { NotLoggedError, ForbiddenError } = require("../../utils/errors")
const { ROLE_CUSTOMER, ROLE_EXTERNAL_DIET, ROLE_RH, ROLE_SUPER_ADMIN, ROLE_ADMIN } = require("./consts")

const checkPermission = async ({verb, model, id, user, referrer}) => {
  // if (!referrer) {
  //   throw new NotLoggedError('Unauthorized')
  // }
  console.log('Checking permission', verb, model, id, !!user)
  // Allow anonymous recommandation GET and PUT for one item
  if (!user) {
    if (model=='recommandation' && [VERB_GET, VERB_PUT].includes(verb) && !!id) {
      return
    }
    if (model=='contact' && [VERB_POST].includes(verb) && !!id) {
      return
    }
    throw new NotLoggedError('Unauthorized')
  }
  // All access to loggedUser
  if (['current-user','loggedUser'].includes(model)) {
    return
  }
  console.log('Check ids, logged',user._id, id)
  if (idEqual(id, user._id)) {
    return
  }
  // User: get only his information
  if (user.role==ROLE_CUSTOMER) {
    console.log(verb, model, id)
    if (verb==VERB_GET && model!='user') {
      return
    }
  }
  if (user.role==ROLE_EXTERNAL_DIET) {
    console.log(verb, model, id)
    if (verb==VERB_PUT && (['patient', 'user']).includes(model)) {
      console.log(id)
      console.log(await getDietUsers(user))
      if (!(await getDietUsers(user)).includes(id.toString())) {
        throw new NotLoggedError('Unauthorized')
      }
    }
    return
  }
  if (user.role==ROLE_RH) {
    if ([VERB_POST, VERB_PUT, VERB_DELETE].includes(verb)) {
      if (['webinar', 'event'].includes(model)) {
        return
      }
    }
    if (verb==VERB_GET && model!='user') {
      return
    }
  }
  if (user.role==ROLE_ADMIN || user.role==ROLE_SUPER_ADMIN) {
    return true
  }
  throw new ForbiddenError('Unauthorized')
}

const getDietUsers = async diet => {
  const coachings=await Coaching.find({diet})
  return coachings.map(c => c.user._id.toString())
}

module.exports={
  checkPermission, getDietUsers,
}
const { VERB_GET, VERB_PUT, VERB_POST } = require("../../../utils/consts")
const { NotLoggedError } = require("../../utils/errors")

const checkPermission = async ({verb, model, id, user}) => {
  console.log('Checking permission', verb, model, id, !!user)
  // Allow anonymous recommandation GET and PUT for one item
  if (!user) {
    if (model=='recommandation' && [VERB_GET, VERB_PUT].includes(verb) && !!id) {
      return
    }
    if (model=='contact' && verb==VERB_POST) {
      return
    }
    throw new NotLoggedError('Unauthorized')
  }
}

module.exports={
  checkPermission,
}
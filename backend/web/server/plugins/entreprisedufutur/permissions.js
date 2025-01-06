const { VERB_GET } = require("../../../utils/consts")
const { NotLoggedError } = require("../../utils/errors")
const { ANONYMOUS_ALLOWED_MODELS } = require("./consts")

const checkPermission = async ({verb, model, id, user}) => {
  console.log('Checking permission', verb, model, id, !!user)
  if (!user) {
    if (Object.keys(ANONYMOUS_ALLOWED_MODELS).includes(model) && [VERB_GET].includes(verb)) {
      return
    }
    throw new NotLoggedError('Unauthorized')
  }
}

module.exports={
  checkPermission,
}
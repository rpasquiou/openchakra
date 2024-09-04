const Resource = require("../../models/Resource")
const Session = require("../../models/Session")
const User = require("../../models/User")
const { loadFromDb } = require("../../utils/database")
const { getBlockResources } = require("./resources")

const getEvalResources = async (userId, params, data, fields) => {
  const resourceIds = await getBlockResources(data._id)
  const newParams = {
    [`filter._id`]: {$in: resourceIds},
  }
  const user = await User.findById(userId)

  let resources = await loadFromDb({
    model: `resource`,
    user,
    fields: [...fields, `note`, `scale`, `homework_mode`],
    params: newParams
  })

  resources = resources.filter(r => 
    r.homework_mode == true || (r.note !== undefined && r.note !== null) || (r.scale !== undefined && r.scale !== null)
  )

  return resources.map(r => new Resource(r))
}

module.exports = {
  getEvalResources
}
const User = require('../../models/User')
const lodash = require('lodash')
const { loadFromDb } = require('../../utils/database')

const getLooking = async function () {
  const looking = await loadFromDb({model: 'user', fields: ['looking_for_opportunities']})

  
  const ids = lodash.filter(looking, (u) => u.looking_for_opportunities ).map((u) => u._id)

  return ids
}

module.exports = { getLooking }
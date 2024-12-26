const lodash = require('lodash')
const { loadFromDb } = require('../../utils/database')
const { extractData } = require('../../../utils/import')
const { BadRequestError, parseError } = require('../../utils/errors')
const User = require('../../models/User')
const { parse } = require('dotenv')

const getLooking = async function () {
  const looking = await loadFromDb({model: 'user', fields: ['looking_for_opportunities']})

  
  const ids = lodash.filter(looking, (u) => u.looking_for_opportunities ).map((u) => u._id)

  return ids
}

const inviteUsers =  async (data, user) => {
  const REQUIRED_FIELDS=['firstname', 'lastname', 'email']
  console.log('Importing', data)
  const formatted=await extractData(data)
  const missing=lodash(REQUIRED_FIELDS).difference(formatted.headers)
  if (!missing.isEmpty()) {
    return([`Champs manquants:${missing}`])
  }
  const {records}=formatted
  const importResult=await Promise.allSettled(records.map(async record => {
    // Essayer d'enregistrer le user
    if (Object.values(record).every(l => !l.trim())) {
      return `Ligne vide`
    }
    await User.findOneAndUpdate(
      {email: record.email},
      {email: record.email, firstname: record.firstname, lastname: record.lastname},
      {upsert: true, new: true, runValidators: true},
    )
    return `${record.email} importé`
  }))
  console.log('Import result', JSON.stringify(importResult, null, 2))
  const result=lodash.zip(importResult, records)
    .map(([r, record], idx) => {
      // console.log(r.status, record, r.status=='rejected' ? parseError(r.reason): r.value)
      if (r.status=='fulfilled') {
        return `Ligne ${idx+1}: ${r.value}`
      }
      console.log(parseError(r.reason))
      console.log(parseError(r.reason)?.body)
      return `Ligne ${idx+1}: ${parseError(r.reason)?.body || r.reason}`
    })
  console.log(JSON.stringify(result, null, 2))
  return result
}

module.exports = { getLooking, inviteUsers }
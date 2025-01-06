const lodash = require('lodash')
const { loadFromDb, setImportDataFunction, setImportDataTemplateFunction } = require('../../utils/database')
const { extractData } = require('../../../utils/import')
const { BadRequestError, parseError } = require('../../utils/errors')
const User = require('../../models/User')
const { parse } = require('dotenv')
const { CompleteMultipartUploadRequestFilterSensitiveLog } = require('@aws-sdk/client-s3')
const { createAccount } = require('./invitation')
const { sendInvitation } = require('./mailing')

const getLooking = async function () {
  const looking = await loadFromDb({model: 'user', fields: ['looking_for_opportunities']})

  
  const ids = lodash.filter(looking, (u) => u.looking_for_opportunities ).map((u) => u._id)

  return ids
}

const inviteUsers =  async (data, user) => {
  const REQUIRED_FIELDS=['firstname', 'lastname', 'email']
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
    // TODO: check constraints (i.e. attributes can not be modified)
    console.log('UPserting user', record)
    const userExists=await User.exists({email: record.email})
    const user=await User.findOneAndUpdate(
      {email: record.email},
      {email: record.email, firstname: record.firstname, lastname: record.lastname},
      {upsert: true, new: true, runValidators: true},
    )
    // User did not exists => send visiativ invitation
    if (!userExists) {
      await createAccount(user)
        .then(async response => {
          await User.findOneAndUpdate({email: user.email}, {guid: response.guid })
          console.log('Response', response)
          sendInvitation({user, url: response.magicLink})
        })
        .catch(err => console.error(`Err à l'invitation:${JSON.stringify(err)}`))
    }
    return `${record.email} ${userExists ? 'mis à jour' : 'créé'}`
  }))
  const result=lodash.zip(importResult, records)
    .map(([r, record], idx) => {
      // console.log(r.status, record, r.status=='rejected' ? parseError(r.reason): r.value)
      if (r.status=='fulfilled') {
        return `Ligne ${idx+1}: ${r.value}`
      }
      return `Ligne ${idx+1}: ${parseError(r.reason)?.body || r.reason}`
    })
  return result
}

const getUserImportTemplate = (model, user) => {
  return {
    mimeType: 'text/csv',
    filename: 'Modèle invitations.csv',
    data: [`firstname;lastname;email`,`Gérard;Moulins;unknown@unknown.com`].join('\n')
  }
}

setImportDataFunction({model: 'user', fn: inviteUsers})
setImportDataTemplateFunction({model: 'user', fn: getUserImportTemplate})

module.exports = { getLooking }
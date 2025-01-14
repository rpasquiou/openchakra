const lodash = require('lodash')
const { loadFromDb, setImportDataFunction, setImportDataTemplateFunction } = require('../../utils/database')
const { extractData } = require('../../../utils/import')
const { BadRequestError, parseError } = require('../../utils/errors')
const User = require('../../models/User')
const { parse } = require('dotenv')
const { CompleteMultipartUploadRequestFilterSensitiveLog } = require('@aws-sdk/client-s3')
const { createAccount } = require('./invitation')
const { sendInvitation } = require('./mailing')
const Company = require('../../models/Company')
const { ERR_IMPORT_DENIED, STATUT_MEMBER, ROLE_PARTNER, ROLE_MEMBER } = require('./consts')

const getLooking = async function () {
  const looking = await loadFromDb({model: 'user', fields: ['looking_for_opportunities']})

  
  const ids = lodash.filter(looking, (u) => u.looking_for_opportunities ).map((u) => u._id)

  return ids
}

const inviteUsers =  async (data, user) => {
  const company=await Company.findById(user.company)
  if (!company?.customer_id) {
    return [ERR_IMPORT_DENIED]
  }
  const REQUIRED_FIELDS=['firstname', 'lastname', 'email']
  const formatted=await extractData(data)
  const missing=lodash(REQUIRED_FIELDS).difference(formatted.headers)
  if (!missing.isEmpty()) {
    return([`Champs manquants:${missing}`])
  }
  const {records}=formatted
  const importResult=await Promise.allSettled(records.map(async record => {
    // Skip existing users
    const userExists=await User.exists({email: record.email})
    if (userExists) {
      return `Compte ${record.email} déjà existant`
    }
    if (!record.email?.trim() || !record.firstname?.trim() || !record.lastname?.trim()) {
      return `Email, prénom et nom sont obligatoires`
    }
    const isInternal=record.member=='1'
    const isSponsored=record.sponsored=='1'
    if (!(isInternal != isSponsored)) {
      return `le compte doit être un collaborateur ou être sponsorisé`
    }
    // I'm a partner if
    const role=isInternal && company.statut!=STATUT_MEMBER ? ROLE_PARTNER : ROLE_MEMBER
    const account=await User.insert({
        email: record.email, firstname: record.firstname, lastname: record.lastname,
        company: isInternal ? company : undefined, company_sponsorship: company,
        role,
    })
    const invitation=await createAccount(account, company.customer_id)
    account.guid=invitation.guid
    await account.save()
    await sendInvitation({user, url: response.magicLink})
  }))
  const result=lodash.zip(importResult, records)
    .map(([r, record], idx) => {
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
    data: [
      `firstname;lastname;email;member;sponsored`,
      `Gérard;Moulins;gerard.moulins@unknown.com;1;0`,
      `François;Martin;f.martin@unknown.com;0;1`,
    ].join('\n')
  }
}

setImportDataFunction({model: 'user', fn: inviteUsers})
setImportDataTemplateFunction({model: 'user', fn: getUserImportTemplate})

module.exports = { getLooking }
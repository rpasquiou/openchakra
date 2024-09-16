const { bufferToString, guessDelimiter } = require('../../../utils/text')
const Company = require('../../models/Company')
const User = require('../../models/User')
const Lead = require('../../models/Lead')
const { extractData, guessFileType } = require('../../../utils/import')
const lodash=require('lodash')
const { ROLE_ADMIN, CALL_DIRECTION_IN_CALL, CALL_DIRECTION_OUT_CALL, CALL_STATUS_TO_CALL, ROLE_SUPER_ADMIN } = require('./consts')
const { runPromisesWithDelay } = require('../../utils/concurrency')

const VALID_CALLS={'Entrant': CALL_DIRECTION_IN_CALL, 'Sortant': CALL_DIRECTION_OUT_CALL}
const VALID_CONSENT={'Oui': true, 'Non': false}

const MAPPING={
  'Prénom': 'firstname',
  'Nom': 'lastname',
  'Email': 'email',
  'ID': 'identifier',
  'Code entreprise': 'company_code',
  'Source': 'source',
  'Téléphone': 'phone',
  'Campagne': 'campain',
  'Appel entrant/sortant': {
    attribute: 'call_direction', 
    validate: v => !v || Object.keys(VALID_CALLS).includes(v?.trim()),
    convert: v => v ? VALID_CALLS[v?.trim()] : v,
  },
  'Consentement': {
    attribute: 'consent', 
    validate: v => !v || Object.keys(VALID_CONSENT).includes(v?.trim()),
    convert: v => v ? VALID_CALLS[v?.trim()] : v,
  },

}

// TODO mandatory for in/out calls
//const MANDATORY_COLUMNS=Object.keys(MAPPING)
// TODO mandatory for simple leads
const MANDATORY_COLUMNS=['Téléphone', 'Email']

const VALID = () => true
const IDENTITY = v => lodash.isEmpty(v) ? null : v

const mapData = (input, mapping)  => {
  let output={}
  try {
  Object.entries(mapping).forEach(([src, dst])=> {
    const validate = dst.validate || VALID
    const convert=dst.convert || IDENTITY
    const attribute=dst.attribute || dst
    
    const value=input[src]
    if (!validate(value)) {
      throw new Error(`Valeur ${src} '${value}' invalide`)
    }
    let converted=convert(value)

    // console.log(src, '=>', attribute, converted)

    output[attribute]=lodash.isEmpty(converted) ? null : converted
  })
  // console.log(input, "=>", output)
  // console.log('return')
  return Promise.resolve(output)
  }
  catch(error){
    return Promise.reject(error)
  }
}

const importLead = async (leadData, user) => {
  console.log(`Handling ${JSON.stringify(leadData)}`)
  const company_code_re=new RegExp(`^${leadData.company_code}$`, 'i')
  const companyExists=await Company.exists({code: company_code_re})
  // console.log('exists', exists)
  if (!companyExists) {
    return Promise.reject(`Aucune compagnie avec le code ${leadData.company_code}`)
  }
  if (!leadData.email && !leadData.phone) {
    return Promise.reject(`Un email ou un numéro de téléphone attendu`)
  }
  leadData=lodash.omitBy(leadData, v => lodash.isEmpty(v))
  let criterion={}
  if (!!leadData.phone) {
    criterion.phone=leadData.phone
  }
  else {
    criterion.email=leadData.email
  }
  return Lead.updateOne(
    criterion,
    {
      $set: {...leadData},
      $setOnInsert: {call_status: CALL_STATUS_TO_CALL},
    },
    {upsert: true, runValidators: true}
  )
}

const importLeads= async (buffer, user) => {
  console.log(`Import leads, user is`, user)
  const [type, delim]=await Promise.all([guessFileType(buffer), guessDelimiter(bufferToString(buffer))])
  const data=await extractData(buffer, {format: type, delimiter:delim})
  const missingColumns=lodash.intersection(MANDATORY_COLUMNS, data.headers)
  if (lodash.isEmpty(missingColumns)) {
    return [`Indiquez au moins une des colonnes ${MANDATORY_COLUMNS.join(', ')}`]
  }
  const result=await runPromisesWithDelay(data.records.map(input => async() => {
    const mappedData=await mapData(input, MAPPING)
    return importLead(mappedData, user)
  }))
  return result.map((r, index) => {
    if (!r.status) {return r}
    const msg=r.status=='rejected' ? `Erreur:${r.reason}` :
      r.value.upserted ? `Prospect ajouté`: `Prospect mis à jour`
      return `Ligne ${index+2}: ${msg}`
  })
}

const getCompanyLeads = async (userId, params, data, fields) => {
  const userRole=(await User.findById(userId))?.role
  params=lodash.mapKeys(params, (v, k) => k.replace('.leads', ''))
  let filter=lodash(params)
    .pickBy((v, k) => /filter\./.test(k))
    .mapKeys((v, k) => k.replace(/filter\./, ''))
    .value()
  if (![ROLE_ADMIN, ROLE_SUPER_ADMIN].includes(userRole)) {
    filter={$and: [
      filter,
      {$or: [{call_status: CALL_STATUS_TO_CALL}, {operator: userId}]}
    ]}
  }
  const sort=lodash(params)
    .pickBy((v, k) => /sort\./.test(k))
    .mapKeys((v, k) => k.replace(/sort\./, ''))
    .value()
  let query=Lead.find(filter).sort(sort)
  if (params.page) {
    query=query.skip(parseInt(params.page)*parseInt(params.limit))
  }
  if (params.limit) {
    query=query.limit(parseInt(params.limit)+1)
  }
  query.sort({update_date: 'asc'})
  return query
}

module.exports={
  importLeads, getCompanyLeads,
}

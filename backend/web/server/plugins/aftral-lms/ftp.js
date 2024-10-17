const fs=require('fs')
const path=require('path')
const moment=require('moment')
const lodash=require('lodash')
const {getExchangeDirectory, isValidation} = require('../../../config/config')
const { runPromisesWithDelay } = require('../../utils/concurrency')
const storage = require('../../utils/storage')
const { importTrainers, importSessions, importTrainees } = require('./import')
const User = require('../../models/User')
const { ROLE_ADMINISTRATEUR } = require('./consts')
const { sendImportError } = require('./mailing')

const pollNewFiles = async () => {
  const store=storage.namespace('exchange')
  const folder=getExchangeDirectory()
  if (!folder) {
    throw new Error(`EXCHANGE_DIRECTORY must be defined in .env`)
  }

  const TRAINEES_PARAMS=['latest-trainees-filedate', /Apprenant.*\.csv$/, importTrainees, 'Import apprenant']
  const TRAINERS_PARAMS=['latest-trainers-filedate', /Session_Formateur.*\.csv$/, importTrainers, 'Import formateurs']
  const SESSION_PARAMS=['latest-session-filedate', /Session_Formateur.*\.csv$/, importSessions, 'Import sessions']

  const STEPS=[TRAINERS_PARAMS, TRAINEES_PARAMS, SESSION_PARAMS]
  const allFiles=await fs.readdirSync(folder)
  let errors=[]
  let res=await runPromisesWithDelay(STEPS.map(([key, filePattern, importFn, topicName]) => async () => {
    const latest_date=store.get(key) ? moment(store.get(key)) : null
    console.log('Getting latest files after', latest_date)
    const latestFile=lodash(allFiles)
      .map(f => path.join(folder, f))
      .filter(f => filePattern.test(f) && fs.statSync(f).mtime > latest_date )
      .maxBy(f => fs.statSync(f).mtime)
    if (latestFile) {
      console.log('Handling', latestFile, fs.statSync(latestFile).mtime.toString())
      store.set(key, fs.statSync(latestFile).mtime)
      return importFn(latestFile, path.join(getExchangeDirectory(), 'Apprenant.csv'))
        .then(res => {
          console.log(res)
          errors=[...errors, res.filter(r => r.status=='rejected').map(r => `${topicName}:${r.reason}`).filter(v => !lodash.isEmpty(v))]
          return res
        })
    }
  }))
  if (!lodash.isEmpty(errors.join('\n'))) {
    const admins=await User.find({role: ROLE_ADMINISTRATEUR})
    let message=isValidation() ? 'En validation:\n': ''
    message = message+errors.filter(v => !lodash.isEmpty(v)).join('\n')
    await Promise.all(admins.map(admin => sendImportError({admin, date: moment(), message: message})))
  }
  return res
}

module.exports={
  pollNewFiles,
}
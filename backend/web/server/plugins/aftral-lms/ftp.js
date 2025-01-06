const fs=require('fs')
const path=require('path')
const moment=require('moment')
const lodash=require('lodash')
const {getExchangeDirectory, isValidation, getBackupDirectory} = require('../../../config/config')
const { runPromisesWithDelay } = require('../../utils/concurrency')
const storage = require('../../utils/storage')
const { importTrainers, importSessions, importTrainees } = require('./import')
const User = require('../../models/User')
const { ROLE_ADMINISTRATEUR, BACKUP_DURATION } = require('./consts')
const { sendImportError } = require('./mailing')

getExchangeDirectory()
getBackupDirectory()

const pollNewFiles = async () => {
  const store=storage.namespace('exchange')
  const folder=getExchangeDirectory()
  if (!folder) {
    throw new Error(`EXCHANGE_DIRECTORY must be defined in .env`)
  }

  const TRAINEES_PARAMS=['latest-trainees-filedate', /Apprenant\.csv$/, importTrainees, 'Import apprenant']
  const TRAINERS_PARAMS=['latest-trainers-filedate', /Session_Formateur\.csv$/, importTrainers, 'Import formateurs']
  const SESSION_PARAMS=['latest-session-filedate', /Session_Formateur\.csv$/, importSessions, 'Import sessions']

  const STEPS=[TRAINERS_PARAMS, TRAINEES_PARAMS, SESSION_PARAMS]
  const allFiles=await fs.readdirSync(folder)
  let errors=[]
  let res=await runPromisesWithDelay(STEPS.map(([key, filePattern, importFn, topicName]) => async () => {
    const latest_date=store.get(key) ? moment(store.get(key)) : null
    console.log('FTP IMPORT:Getting latest files after', latest_date)
    const latestFile=lodash(allFiles)
      .map(f => path.join(folder, f))
      .filter(f => filePattern.test(f) && fs.statSync(f).mtime > latest_date )
      .maxBy(f => fs.statSync(f).mtime)
    if (latestFile) {
      const fileTime=moment(fs.statSync(latestFile).mtime)
      console.log('FTP IMPORT:Handling', latestFile, fileTime)
      const baseName=path.basename(latestFile)
      const backupName=path.join(getBackupDirectory(), baseName.replace(/\.csv$/, '')+fileTime.format('_YYMMDD_HHmmss')+'.csv')
      fs.copyFileSync(latestFile, backupName)
      store.set(key, fs.statSync(latestFile).mtime)
      return importFn(latestFile, path.join(getExchangeDirectory(), 'Apprenant.csv'))
        .then(res => {
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

const cleanBackupFiles = async () => {
  const folder=getBackupDirectory()
  const limitMoment=moment().add(-BACKUP_DURATION, 'days')
  const oldFiles=lodash(fs.readdirSync(folder))
    .map(f => path.join(folder, f))
    .filter(f => moment(fs.statSync(f).mtime).isBefore(limitMoment))
    .value()
  console.log('Removing', oldFiles, 'from backup')
  oldFiles.forEach(filepath => fs.unlinkSync(filepath))
}

module.exports={
  pollNewFiles, cleanBackupFiles,
}

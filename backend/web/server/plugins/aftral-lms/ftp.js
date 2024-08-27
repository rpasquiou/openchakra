const fs=require('fs')
const path=require('path')
const lodash=require('lodash')
const {getExchangeDirectory} = require('../../../config/config')
const { runPromisesWithDelay } = require('../../utils/concurrency')
const storage = require('../../utils/storage')
const { extractData, guessFileType } = require('../../../utils/import')
const { TEXT_TYPE } = require('../../../utils/consts')
const { importTrainers, importSessions } = require('./import')

const loadSession = async filename => {
  const data=await extractData(fs.readFileSync(filename), {format:TEXT_TYPE, delimiter: ';'})
  await importTrainers(filename)
  await importSessions(filename)
}

const loadTrainees = async filename => {
  await importTrainers(filename)
}

const pollNewFiles = async () => {
  const store=storage.namespace('exchange')
  const folder=getExchangeDirectory()
  if (!folder) {
    throw new Error(`EXCHANGE_DIRECTORY must be defined in .env`)
  }

  const SESSION_PARAMS=['latest-session-filedate', /Session_Formateur.*\.csv$/, loadSession]
  const TRAINEES_PARAMS=['latest-trainees-filedate', /Apprenant.*\.csv$/, loadTrainees]

  const allFiles=await fs.readdirSync(folder)
  const res=await runPromisesWithDelay([SESSION_PARAMS, TRAINEES_PARAMS].map(([key, filePattern, importFn]) => async () => {
    const latest_date=store.get('key') ? moment(store.get(key)) : null
    const latestFile=lodash(allFiles)
      .map(f => path.join(folder, f))
      .filter(f => filePattern.test(f) && fs.statSync(f).mtime > latest_date )
      .maxBy(f => fs.statSync(f).mtime)
    console.log(`Found ${latestFile}`)
    if (latestFile) {
      console.log('Handling', latestFile)
      await importFn(latestFile)
    }
  }))
  console.log(res)
}

module.exports={
  pollNewFiles,
}
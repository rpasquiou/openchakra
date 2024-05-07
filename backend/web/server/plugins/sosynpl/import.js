const fs=require('fs')
const lodash=require('lodash')
const {importData, extractData, displayCache}=require('../../../utils/import')
const {XL_TYPE } = require('../../../utils/consts')
require('../../../server/models/JobFile')
require('../../../server/models/JobFileFeature')
require('../../../server/models/Job')
require('../../../server/models/Sector')
const { normalize } = require('../../../utils/text')

const loadRecords = async (path, tab_name, from_line) =>  {
  const msg=`Loading records from ${path}`
  console.time(msg)
  const contents=fs.readFileSync(path)
  const {records} = await extractData(contents, {format: XL_TYPE, tab: tab_name, from_line})
  console.timeEnd(msg)
  return records
}

const JOB_MAPPING={
  name: `Métiers : à étendre avec France compténces pour avoir "IA", "Intelligence articifielle"`,
  job_file: ({record, cache}) => cache('jobFile', record['code Fiche Métiers']),
}

const JOB_KEY='name'
const JOB_MIGRATION_KEY='name'

const JOB_FILE_MAPPING={
  name: `Fiche Métiers`,
  code: 'code Fiche Métiers',
}

const JOB_FILE_KEY='code'
const JOB_FILE_MIGRATION_KEY='code'

const JOB_FILE_FEATURE_MAPPING={
  job_file: ({record, cache}) => cache('jobFile', record['code Fiche Métiers']),
  description: `Missions principales`,
}

const JOB_FILE_FEATURE_KEY='description'
const JOB_FILE_FEATURE_MIGRATION_KEY='description'

const SECTOR_MAPPING={
  name: `Secteurs`,
}

const SECTOR_KEY='name'
const SECTOR_MIGRATION_KEY='name'

const importJobFiles = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  records=records.filter(r => !lodash.isEmpty(r['SO SYNPL à garder']))
  records=lodash.orderBy(records, r => normalize(r[JOB_MAPPING.name]))
  return importData({model: 'jobFile', data:records, mapping:JOB_FILE_MAPPING, identityKey: JOB_FILE_KEY, 
      migrationKey: JOB_FILE_MIGRATION_KEY})
}

const importJobs = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  records=records.filter(r => !lodash.isEmpty(r['SO SYNPL à garder']))
  records=lodash.orderBy(records, r => normalize(r[JOB_MAPPING.name]))
  return importData({model: 'job', data:records, mapping:JOB_MAPPING, identityKey: JOB_KEY, 
      migrationKey: JOB_MIGRATION_KEY})
}

const importJobFileFeatures = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  records=lodash.orderBy(records, r => normalize(r[JOB_MAPPING.name]))
  return importData({model: 'jobFileFeature', data:records, mapping:JOB_FILE_FEATURE_MAPPING, identityKey: JOB_FILE_FEATURE_KEY, 
      migrationKey: JOB_FILE_FEATURE_MIGRATION_KEY})
}

const importSectors = async (input_file, tab_name) => {
  let records=await loadRecords(input_file, tab_name)
  records=lodash.orderBy(records, r => {
    const name=r[SECTOR_MAPPING.name]
    // Force 'Tout secteur' first
    if (/tout.*secte/i.test(name)) {
      return ''
    }
    return name
  })
  console.log(records.slice(0, 10))
  return importData({model: 'sector', data:records, mapping:SECTOR_MAPPING, identityKey: SECTOR_KEY, 
      migrationKey: SECTOR_MIGRATION_KEY})
}

module.exports={
  importJobFiles, importJobs, importSectors, importJobFileFeatures,
}


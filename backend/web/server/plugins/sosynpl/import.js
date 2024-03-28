const fs=require('fs')
const lodash=require('lodash')
const {importData, extractData}=require('../../../utils/import')
const {XL_TYPE } = require('../../../utils/consts')
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
  code: 'code Fiche Métiers',
}

const JOB_KEY='name'
const JOB_MIGRATION_KEY='name'

const SECTOR_MAPPING={
  name: `Secteurs`,
}

const SECTOR_KEY='name'
const SECTOR_MIGRATION_KEY='name'

const importJobs = async (input_file) => {
  let records=await loadRecords(input_file, `1 - Métiers`, 2)
  records=records.filter(r => !lodash.isEmpty(r['SO SYNPL à garder']))
  records=lodash.orderBy(records, r => normalize(r[JOB_MAPPING.name]))
  return importData({model: 'job', data:records, mapping:JOB_MAPPING, identityKey: JOB_KEY, 
      migrationKey: JOB_MIGRATION_KEY})
}

const importSectors = async (input_file) => {
  let records=await loadRecords(input_file, `Secteurs`)
  records=lodash.orderBy(records, r => {
    const name=r[SECTOR_MAPPING.name]
    // Force 'Tout secteur' first
    if (/tout.*secte/i.test(name)) {
      console.log('found')
      return ''
    }
    return name
  })
  console.log(records.slice(0, 10))
  return importData({model: 'sector', data:records, mapping:SECTOR_MAPPING, identityKey: SECTOR_KEY, 
      migrationKey: SECTOR_MIGRATION_KEY})
}

module.exports={
  importJobs, importSectors
}


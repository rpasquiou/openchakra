const fs=require('fs')
const lodash=require('lodash')
const path = require('path')
const {importData, extractData, guessFileType}=require('../../../utils/import')
const {XL_TYPE, TEXT_TYPE } = require('../../../utils/consts')
require('../../../server/models/JobFile')
require('../../../server/models/JobFileFeature')
require('../../../server/models/Job')
require('../../../server/models/Sector')
require('../../../server/models/HardSkill')
require('../../../server/models/HardSkillCategory')
require('../../../server/models/Expertise')
const { normalize, guessDelimiter } = require('../../../utils/text')
const NodeCache=require('node-cache')

const filesCache=new NodeCache()

const getFileParams = async path => {
  let params=filesCache.get(path)
  if (!params) {
    params={}
    params.contents=fs.readFileSync(path)
    params.type=await guessFileType(params.contents)
    if (params.type==TEXT_TYPE) {
      params.delimiter=await guessDelimiter(params.contents.toString())
    }
    filesCache.set(path, params)
  }
  return params
}

const loadRecords = async (path, tab_name, from_line) =>  {
  const msg=`Loading records from ${path}`
  console.time(msg)
  const options={tab: tab_name, from_line}
  const params=await getFileParams(path)
  return extractData(params.contents, {format: params.type, ...params, ...options})
    .then(({records}) => {
      console.timeEnd(msg)
      return records
    })
}

const JOB_FILE_MAPPING={
  name: `Fiche Métiers`,
  code: 'code Fiche Métiers',
}

const JOB_FILE_KEY='code'
const JOB_FILE_MIGRATION_KEY='code'

const importJobFiles = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  records=lodash.orderBy(records, r => normalize(r[JOB_MAPPING.name]))
  return importData({model: 'jobFile', data:records, mapping:JOB_FILE_MAPPING, identityKey: JOB_FILE_KEY, migrationKey: JOB_FILE_MIGRATION_KEY})
}

const JOB_MAPPING={
  name: `Métiers`,
  job_file: ({record, cache}) => cache('jobFile', record['code Fiche Métiers']),
  key: ({record}) => record['code Fiche Métiers']+record['Métiers']
}

const JOB_KEY='name'
const JOB_MIGRATION_KEY='key'

const importJobs = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  records=lodash.orderBy(records, r => normalize(r[JOB_MAPPING.name]))
  return importData({model: 'job', data:records, mapping:JOB_MAPPING, identityKey: JOB_KEY, migrationKey: JOB_MIGRATION_KEY})
}

const JOB_FEATURE_MAPPING={
  job_file: ({record, cache}) => cache('jobFile', record['code Fiche Métiers']),
  description: `Missions principales`,
  key: ({record}) => record['code Fiche Métiers']+record['Missions principales']
}

const JOB_FEATURE_KEY=['job_file', 'description']
const JOB_FEATURE_MIGRATION_KEY='key'

const importJobFileFeatures = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  return importData({model: 'jobFileFeature', data:records, mapping:JOB_FEATURE_MAPPING, identityKey: JOB_FEATURE_KEY, migrationKey: JOB_FEATURE_MIGRATION_KEY})
}

const SECTOR_MAPPING={
  name: `Secteurs`,
}

const SECTOR_KEY='name'


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
  return importData({model: 'sector', data:records, mapping:SECTOR_MAPPING, identityKey: SECTOR_KEY, migrationKey: SECTOR_KEY})
}

// 1st level categories
const CATEGORY_1_MAPPING={
  name: `Catégorie savoir-faire`,
}

const CATEGORY_1_KEY='name'
const CATEGORY_1_MIGRATION_KEY='name'

const importCategories1 = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  return importData({model: 'hardSkillCategory', data:records, mapping:CATEGORY_1_MAPPING, identityKey: CATEGORY_1_KEY, migrationKey: CATEGORY_1_MIGRATION_KEY})
}

// 2nd level categories ; we know name is unique
const CATEGORY_2_MAPPING={
  name: `Sous-catégorie savoir-faire`,
  parent: ({record, cache}) => cache('hardSkillCategory', record['Catégorie savoir-faire']),
  key: ({record}) => record['Catégorie savoir-faire']+record['Sous-catégorie savoir-faire'],
}

const CATEGORY_2_KEY=['name', 'parent']
const CATEGORY_2_MIGRATION_KEY='key'

const importCategories2 = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  return importData({model: 'hardSkillCategory', data:records, mapping:CATEGORY_2_MAPPING, 
    identityKey: CATEGORY_2_KEY, migrationKey: CATEGORY_2_MIGRATION_KEY})
}

const HARD_SKILL_MAPPING={
  job_file: ({record, cache}) => cache('jobFile', record['code Fiche Métiers']),
  name: `Libellé savoir-faire`,
  code: `Code savoir-faire`,
  category: ({record, cache}) => cache('hardSkillCategory', record['Catégorie savoir-faire']+record['Sous-catégorie savoir-faire']),
  key: ({record, cache}) => record['code Fiche Métiers']+record[`Code savoir-faire`],
}

const HARD_SKILL_KEY=['job_file', 'code']
const HARD_SKILL_MIGRATION_KEY='key'

const importHardSkills = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  return importData({model: 'hardSkill', data:records, mapping:HARD_SKILL_MAPPING, identityKey: HARD_SKILL_KEY, migrationKey: HARD_SKILL_MIGRATION_KEY})
}

// expertise categories
const EXP_CATEGORY_MAPPING={
  name: `Catégorie Savoir`,
}

const EXP_CATEGORY_KEY='name'

const importExpCategories = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  return importData({model: 'expertiseCategory', data:records, mapping:EXP_CATEGORY_MAPPING, 
    identityKey: EXP_CATEGORY_KEY})
}

const EXPERTISE_MAPPING={
  name: `Compétences`,
}

const EXPERTISE_KEY='name'
const EXPERTISE_MIGRATION_KEY='name'

const importExpertises = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  return importData({model: 'expertise', data:records, mapping:EXPERTISE_MAPPING, 
    identityKey: EXPERTISE_KEY, migrationKey: EXPERTISE_MIGRATION_KEY})
}

module.exports={
  importJobFiles, importJobs, importSectors, importJobFileFeatures, importHardSkills,
  importCategories1, importCategories2, importExpCategories, importExpertises,
}  


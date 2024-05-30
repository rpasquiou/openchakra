const fs=require('fs')
const lodash=require('lodash')
const path = require('path')
const {importData, extractData, displayCache, guessFileType}=require('../../../utils/import')
const {XL_TYPE, TEXT_TYPE } = require('../../../utils/consts')
require('../../../server/models/JobFile')
require('../../../server/models/JobFileFeature')
require('../../../server/models/Job')
require('../../../server/models/Sector')
require('../../../server/models/HardSkill')
require('../../../server/models/HardSkillCategory')
require('../../../server/models/ExpertiseCategory')
require('../../../server/models/Expertise')
const { normalize, guessDelimiter } = require('../../../utils/text')
const { isNewerThan } = require('../../utils/filesystem')
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

const saveRecords = async (path, keys, data) =>  {
  const msg=`Saving records to ${path}`
  console.time(msg)
  const header=keys.join(';')
  const contents=data.map(d => keys.map(k => d[k]).join(';'))
  const fullContents=header+'\n'+contents.join('\n')
  return fs.writeFileSync(path, fullContents)
}

const fixHardSkills = async directory => {
  const INPUT=path.join(directory, 'Champs So SynpL v2.xlsx')
  const OUTPUT=path.join(directory, 'wapp_hardskills.csv')
  if (isNewerThan(OUTPUT, INPUT)) {
    return
  }
  
  const jobs=await loadRecords(INPUT, 'Lien Fiche Métiers Compétences', 3)
  const hardSkills=await loadRecords(INPUT, '4 - Compétences savoir faire', 2)
  const fullHardSkills=hardSkills.map(hs => ({
    ...lodash.omit(hs, ['Type compétences (1=savoir faire, 3=savoir)', 'SO SYNPL à garder']),
    'code Fiche Métiers': jobs.find(j => j['Code compétences']==hs['Code compétences Savoir faire'])?.['code Fiche Métiers']
  }))
  await saveRecords(OUTPUT, Object.keys(fullHardSkills[0]), fullHardSkills)
}

const fixExpertises = async directory => {
  const INPUT=path.join(directory, 'Champs So SynpL v2.xlsx')
  const OUTPUT=path.join(directory, 'wapp_expertises.csv')
  if (isNewerThan(OUTPUT, INPUT)) {
    return
  }
  
  const jobs=await loadRecords(INPUT, 'Lien Fiche Métiers Compétences', 3)
  const hardSkills=await loadRecords(INPUT, '5 - Compétences savoir', 2)
  const fullHardSkills=hardSkills.map(hs => ({
    ...lodash.omit(hs, ['Type compétences (1=savoir faire, 3=savoir)', 'SO SYNPL à garder']),
    'code Fiche Métiers': jobs.find(j => j['Code compétences']==hs['Code compétences Savoir'])?.['code Fiche Métiers']
  }))
  await saveRecords(OUTPUT, Object.keys(fullHardSkills[0]), fullHardSkills)
}

const fixFiles = async directory => {
  console.log('Fixing files')
  await fixHardSkills(directory)
  await fixExpertises(directory)
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
  return importData({model: 'sector', data:records, mapping:SECTOR_MAPPING, identityKey: SECTOR_KEY, 
      migrationKey: SECTOR_MIGRATION_KEY})
}

// 1st level categories
const CATEGORY_1_MAPPING={
  name: `Catégorie Savoir faire`,
}

const CATEGORY_1_KEY='name'
const CATEGORY_1_MIGRATION_KEY='name'

const importCategories1 = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  return importData({model: 'hardSkillCategory', data:records, mapping:CATEGORY_1_MAPPING, 
    identityKey: CATEGORY_1_KEY, migrationKey: CATEGORY_1_MIGRATION_KEY})
}

// 2nd level categories ; we know name is unique
const CATEGORY_2_MAPPING={
  name: `Sous-Catégorie Savoir faire`,
  parent: ({record, cache}) => cache('hardSkillCategory', record['Catégorie Savoir faire'])
}

const CATEGORY_2_KEY='name'
const CATEGORY_2_MIGRATION_KEY='name'

const importCategories2 = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  return importData({model: 'hardSkillCategory', data:records, mapping:CATEGORY_2_MAPPING, 
    identityKey: CATEGORY_2_KEY, migrationKey: CATEGORY_2_MIGRATION_KEY})
}

const HARD_SKILL_MAPPING={
  job_file: ({record, cache}) => cache('jobFile', record['code Fiche Métiers']),
  name: `Libellé Savoir faire`,
  code: `Code compétences Savoir faire`,
  category: ({record, cache}) => cache('hardSkillCategory', record['Sous-Catégorie Savoir faire']),
}

const HARD_SKILL_KEY='code'
const HARD_SKILL_MIGRATION_KEY='code'

const importHardSkills = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  records=records.filter(r => !lodash.isEmpty(r['Libellé Savoir faire']?.trim()))
  return importData({model: 'hardSkill', data:records, mapping:HARD_SKILL_MAPPING, 
    identityKey: HARD_SKILL_KEY, migrationKey: HARD_SKILL_MIGRATION_KEY})
}

// expertise categories
const EXP_CATEGORY_MAPPING={
  name: `Catégorie Savoir`,
}

const EXP_CATEGORY_KEY='name'
const EXP_CATEGORY_MIGRATION_KEY='name'

const importExpCategories = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  return importData({model: 'expertiseCategory', data:records, mapping:EXP_CATEGORY_MAPPING, 
    identityKey: EXP_CATEGORY_KEY, migrationKey: EXP_CATEGORY_MIGRATION_KEY})
}

const EXPERTISE_MAPPING={
  job_file: ({record, cache}) => cache('jobFile', record['code Fiche Métiers']),
  name: `Libellé Savoir`,
  code: `Code compétences Savoir`,
  category: ({record, cache}) => cache('expertiseCategory', record['Catégorie Savoir']),
}

const EXPERTISE_KEY='code'
const EXPERTISE_MIGRATION_KEY='code'

const importExpertises = async (input_file, tab_name, from_line) => {
  let records=await loadRecords(input_file, tab_name, from_line)
  records=records.filter(r => !lodash.isEmpty(r['Libellé Savoir']?.trim()))
  return importData({model: 'expertise', data:records, mapping:EXPERTISE_MAPPING, 
    identityKey: EXPERTISE_KEY, migrationKey: EXPERTISE_MIGRATION_KEY})
}

module.exports={
  importJobFiles, importJobs, importSectors, importJobFileFeatures, importHardSkills, fixFiles,
  importCategories1, importCategories2, importExpCategories, importExpertises,
}  


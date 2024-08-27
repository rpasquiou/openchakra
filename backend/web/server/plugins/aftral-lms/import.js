const fs=require('fs')
const moment=require('moment')
const lodash=require('lodash')
const path=require('path')
const file=require('file')
const { splitRemaining, guessDelimiter } = require('../../../utils/text')
const { importData, guessFileType, extractData } = require('../../../utils/import')
const { RESOURCE_TYPE_EXCEL, RESOURCE_TYPE_PDF, RESOURCE_TYPE_PPT, RESOURCE_TYPE_VIDEO, RESOURCE_TYPE_WORD, ROLE_CONCEPTEUR, ROLE_FORMATEUR, ROLE_ADMINISTRATEUR } = require('./consts')
const { sendFileToAWS } = require('../../middlewares/aws')
const User = require('../../models/User')
const Program = require('../../models/Program')
const Chapter = require('../../models/Chapter')
const Module = require('../../models/Module')
const Sequence = require('../../models/Sequence')
const Resource = require('../../models/Resource')
const ProductCode = require('../../models/ProductCode')
require('../../models/Certification')
require('../../models/PermissionGroup')
require('../../models/Permission')
require('../../models/Feed')
const NodeCache = require('node-cache')
const { TEXT_TYPE } = require('../../../utils/consts')
const { runPromisesWithDelay } = require('../../utils/concurrency')
const { addChildAction } = require('./actions')
const Block = require('../../models/Block')
require('../../models/Resource')

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

const RESOURCE_MAPPING= userId => ({
  name: `name`,
  code: `code`,
  url:  async ({record}) => (await sendFileToAWS(record.filepath, 'resource'))?.Location,
  filepath: 'filepath',
  resource_type: 'resource_type',
  creator: () => userId,
})

const RESOURCE_KEY='code'

const importResources = async (root_path, recursive) => {
  const getResourceType = filepath => {
    const extensionMapping={
      xls: RESOURCE_TYPE_EXCEL,
      xlsx: RESOURCE_TYPE_EXCEL,
      pdf: RESOURCE_TYPE_PDF,
      pps: RESOURCE_TYPE_PPT,
      pptx: RESOURCE_TYPE_PPT,
      ppsx: RESOURCE_TYPE_PPT,
      mp4: RESOURCE_TYPE_VIDEO,
      doc: RESOURCE_TYPE_WORD,
      docx: RESOURCE_TYPE_WORD,
    }
    const ext=path.extname(filepath).split('.')[1]
    const resource_type=extensionMapping[ext]
    if (!resource_type && !!filepath) {
      throw new Error(`${Object.keys(extensionMapping)} No type for ${ext} ${filepath}:${resource_type}`)
    }
    return resource_type
  }
  const splitCodeName = filepath => {
    const basename=path.basename(filepath)
    return splitRemaining(basename, ' ')
  }
  let filepaths=[]
  const cb = async (directory,subdirectories, paths) => {
    filepaths.push(...paths.map(p => [path.join(directory, p), ...splitCodeName(p), getResourceType(p)]))
  }
  const files=await file.walkSync(root_path, cb)
  const records=filepaths.filter(t => !!t[2]).map(t => ({
    filepath: t[0],
    code: t[1],
    name: t[2],
    resource_type: t[3]
  }))
  const userId=(await User.findOne({role: ROLE_CONCEPTEUR}))?._id
  return importData({model: 'resource', data: records, mapping: RESOURCE_MAPPING(userId), identityKey: RESOURCE_KEY, migrationKey: RESOURCE_KEY})
}

const BLOCK_MODELS=[Program, Chapter, Module, Sequence, Resource]

const getName = level => BLOCK_MODELS[level].modelName

const BlocksCache = new NodeCache()

const getBlock = async (level, name) => {
  const key=`${level}-${name}`
  if (BlocksCache.has(key)) {
    return BlocksCache.get(key)
  }
  const filter=getName(level)=='resource' ? {code: name.split(' ')[0]} : 
  {name}
  return BLOCK_MODELS[level].findOne(filter)
}

const inspected=[]
const importBlock = async ({record, level, creator, programCodes}) => {
  const model=BLOCK_MODELS[level]
  let name=Object.values(record)[level]
  console.log(model.modelName, name)
  let codes=null
  if (level==0 && !inspected.includes(name)) {
    // console.log('Program',name)
    inspected.push(name)
  }
  let block=await getBlock(level, name)
  if (!block) {
    if (model.modelName=='resource') {
      throw new Error(`Resource ${name} not found`)
    }
    if (model.modelName=='program') {
      const codesStr=programCodes[name]
      codes=await ProductCode.find({code: {$in: codesStr}})
      console.log(`Getting codes for ${name}:${codes.map(c => c._id)}`)
    }
    block=await model.create({name, creator, codes})
    if (level==0) {
      console.log(getName(level), name, 'created', block._id)
    }
  }
  if (model.modelName!='resource') {
    console.group()
    let child
    try {
      // Maybe chapter is empty
      if (level==0 && lodash.isEmpty(Object.values(record)[level+1])) {
        console.log(`Record ${JSON.stringify(record)} maybe no chapter ; seeking for module`)
        child=await importBlock({record, level: level+2, creator})
      }
      else {
        child=await importBlock({record, level: level+1, creator})
      }
    }
    finally {
      console.groupEnd()
    }
    if (child) {
      const linkexists=await BLOCK_MODELS[level+1].exists({origin: child._id, parent: block._id})
      if (!linkexists) {
        await addChildAction({parent: block._id, child: child._id}, creator)
      }
      else {
        // console.log(`Child`, child.name, 'of', name, 'already exists')
      }
    }
  }
  return block
}

const importPrograms= async (filename, tabName, fromLine, codesFilePath, codesTabName, codesFromLine) => {
  const PROGRAM_NAME_HEADER='Nom du programme avec lien pour le modifier'
  const CODE_HEADER='Code produit'
  // First remove all programs/chapters/modules/sequences
  await Block.remove({type: {$in: ['program', 'chapter', 'sequence', 'module', 'session']}})
  await Block.remove({origin: {$ne: null}})
  const creator=await User.findOne({role: ROLE_CONCEPTEUR})
  const data=await loadRecords(filename, tabName, fromLine)
  console.log(`Loading ${data.length} lines fror program import`)
  const codes=await loadRecords(codesFilePath, codesTabName, codesFromLine)
  const groupedCodes=lodash(codes).groupBy(PROGRAM_NAME_HEADER).mapValues(v => v.map(c => c[CODE_HEADER])).value()
  const START=0
  const LENGTH=50000
  const res=await runPromisesWithDelay(data.slice(START, START+LENGTH).map(record => () => {
    return importBlock({record, level:0, creator, programCodes: groupedCodes})
  }))
  res.forEach((r, idx) => {
    if (r.status=='rejected') {
      console.error(`Record ${JSON.stringify(data[idx])}:${r.reason}`)
    }
  })
}

const importCodes= async (filename, tabName, fromLine=0) => {
  const data=await loadRecords(filename, tabName, fromLine)
  const res=await runPromisesWithDelay(data.map(record =>() => {
    const code=record['Code produit']
    return ProductCode.findOneAndUpdate(
      {code},
      {code},
      {upsert: true,}
    )
  }))
  if (!res.some(r => r.status=='rejected')) {
    console.log('IMPORT OK')
  }
  res.forEach((r, idx) => {
    if (r.status=='rejected') {
      console.error(`Record ${JSON.stringify(data[idx])}:${r.reason}`)
    }
  })
}

const TRAINER_MAPPING = {
  email: 'EMAIL_FORMATEUR',
  firstname: 'PRENOM_FORMATEUR',
  lastname: 'NOM_FORMATEUR',
  role: () => ROLE_FORMATEUR,
  aftral_id: 'FORMATEUR_ID',
  password: () => 'Password1;'
}

const TRAINER_KEY='aftral_id'

const importTrainers = async (filename) => {
  const records=await loadRecords(filename)
  const uniqueTrainers=lodash.uniqBy(records, 'FORMATEUR_ID')
  console.log(records.length, uniqueTrainers.length)
  const progressCb=(index, total) => console.log(index, '/', total)
  return importData({model: 'user', data: uniqueTrainers, 
    mapping: TRAINER_MAPPING, 
    identityKey: TRAINER_KEY, 
    migrationKey: TRAINER_KEY,
    progressCb
  })
}

const SESSION_MAPPING = admin => ({
  creator: () => admin,
  aftral_id: 'SESSION_ID',
  start_date: ({record}) => moment(record.DATE_DEBUT_SESSION, 'DD-MM-YYYY').startOf('day'),
  end_date: ({record}) => moment(record.DATE_FIN_SESSION, 'DD-MM-YYYY').endOf('day'),
  name: async ({record}) =>  {
    const code=await ProductCode.findOne({code: record.CODE_PRODUIT})
    const program=code ? await Program.findOne({codes: code}) : null
    return program?.name
  },
  code: 'CODE_SESSION',
})

const SESSION_KEY='code'

const importSessions = async (filename) => {
  const records=await loadRecords(filename)
  const uniqueSessions=lodash.uniqBy(records, 'CODE_SESSION')
  console.log(records.length, uniqueSessions.length)
  const progressCb=(index, total) => console.log(index, '/', total)
  const oneAdmin=await User.findOne({role: ROLE_ADMINISTRATEUR})
  return importData({model: 'session', data: uniqueSessions, 
    mapping: SESSION_MAPPING(oneAdmin), 
    identityKey: SESSION_KEY, 
    migrationKey: SESSION_KEY,
    progressCb
  })
}

module.exports={
  importResources, importPrograms, importCodes, importTrainers, importSessions,
}  


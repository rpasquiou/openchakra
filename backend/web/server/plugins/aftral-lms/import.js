const fs=require('fs')
const mongoose=require('mongoose')
const moment=require('moment')
const lodash=require('lodash')
const path=require('path')
const file=require('file')
const { splitRemaining, guessDelimiter } = require('../../../utils/text')
const { importData, guessFileType, extractData } = require('../../../utils/import')
const { RESOURCE_TYPE_EXCEL, RESOURCE_TYPE_PDF, RESOURCE_TYPE_PPT, RESOURCE_TYPE_VIDEO, RESOURCE_TYPE_WORD, ROLE_CONCEPTEUR, ROLE_FORMATEUR, ROLE_ADMINISTRATEUR, ROLE_APPRENANT, AVAILABLE_ACHIEVEMENT_RULES, RESOURCE_TYPE_SCORM, RESOURCE_TYPE_FOLDER, RESOURCE_TYPE_LINK, isExternalTrainer } = require('./consts')
const { sendFileToAWS, sendFilesToAWS } = require('../../middlewares/aws')
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
const Session = require('../../models/Session')
const { cloneTree, lockSession, setSessionInitialStatus } = require('./block')
const { isScorm } = require('../../utils/filesystem')
const { getDataModel } = require('../../../config/config')
const { sendInitTrainee, sendInitTrainer } = require('./mailing')
const { generatePassword } = require('../../../utils/passwords')
require('../../models/Resource')

const TRAINER_AFTRAL_ID='FORMATEUR_ID'
const TRAINEE_AFTRAL_ID='REF_STAGIAIRE' // === Default password
const SESSION_AFTRAL_ID='CODE_SESSION'

const getFileParams = async filename => {
  const params={}
  params.contents=fs.readFileSync(filename)
  params.type=await guessFileType(params.contents)
  if (params.type==TEXT_TYPE) {
    params.delimiter=await guessDelimiter(params.contents.toString())
  }
  params.date=fs.statSync(filename).mtimeMs
  return params
}

const loadRecords = async (filename, tab_name, from_line) =>  {
  const msg=`Loading records from ${filename}`
  console.time(msg)
  const options={tab: tab_name, from_line}
  const params=await getFileParams(filename)
  return extractData(params.contents, {format: params.type, ...params, ...options})
    .then(({records}) => {
      console.timeEnd(msg)
      return records
    })
}

const RESOURCE_MAPPING= userId => ({
  name: `name`,
  code: `code`,
  url:  async ({record}) => {
    console.log('Sending', record.filepath, record.resource_type)
    const req={
      body: {
        documents:[{
          buffer: fs.readFileSync(record.filepath),
          filename: path.join(getDataModel(), 'prod', 'resource', path.basename(record.filepath)),
        }]
      }
    }
    await sendFilesToAWS(req, null, lodash.identity)
    const location=req.body.result[0].Location
    console.log('Sent', record.filepath, record.resource_type, 'to', location)
    return location
  },
  filepath: 'filepath',
  resource_type: 'resource_type',
  achievement_rule: 'achievement_rule',
  creator: () => userId,
})

const RESOURCE_KEY='code'

const importResources = async (root_path, recursive) => {
  const getResourceType =  async filepath => {
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
    
    let resource_type=extensionMapping[ext]
    // Maybe scorm or folder    
    if (ext=='zip') {
      console.log('Checking SCORM for', filepath, parseInt(fs.statSync(filepath).size/1024/1024), 'Mb')
      const scorm=await isScorm({buffer: fs.readFileSync(filepath)})
      resource_type=scorm ? RESOURCE_TYPE_SCORM : RESOURCE_TYPE_FOLDER
    }
    if (!resource_type && !!filepath) {
      console.error(`${Object.keys(extensionMapping)} No type for ${ext} ${filepath}:${resource_type}`)
      return null
    }
    return resource_type
  }
  const splitCodeName = filepath => {
    const basename=path.basename(filepath)
    return splitRemaining(basename, ' ')
  }
  let filepaths=[]
  const cb = async (directory,subdirectories, paths) => {
    filepaths.push(...paths.map(p => path.join(directory, p)))
  }
  file.walkSync(root_path, cb)
  const STEP=0
  const LENGTH=25
  const START=STEP*LENGTH
  filepaths=filepaths.slice(START, START+LENGTH)
  console.log('sending from', START, 'to', START+LENGTH, filepaths)
  filepaths=await Promise.all(filepaths.map(async p => {
    const resType=await getResourceType(p)
    const achievement_rule=AVAILABLE_ACHIEVEMENT_RULES[resType]?.[0]
    return [p, ...splitCodeName(p), resType, achievement_rule]
  }))
  const records=filepaths.filter(t => !!t[2] && !!t[3]).map(t => ({
    filepath: t[0],
    code: t[1],
    name: t[2],
    resource_type: t[3],
    achievement_rule: t[4],
  }))
  const userId=(await User.findOne({role: ROLE_CONCEPTEUR}))?._id
  return importData({model: 'resource', data: records, 
    mapping: RESOURCE_MAPPING(userId), 
    identityKey: RESOURCE_KEY, 
    migrationKey: RESOURCE_KEY
  })
}

const URL_RESOURCE_MAPPING = creator => ({
  name: ({record}) => splitRemaining(record.CodeNom, ' ')[1],
  code: ({record}) => record.CodeNom.split(' ')[0],
  creator: () => creator,
  resource_type: () => RESOURCE_TYPE_LINK,
  url : 'URL',
  achievement_rule: () => AVAILABLE_ACHIEVEMENT_RULES[RESOURCE_TYPE_LINK][0],
})

const URL_RESOURCE_KEY='code'

const importURLResources = async filepath => {
  const records=await loadRecords(filepath, 'Feuil1')
  console.log(records.length)
  const creator=await User.findOne({role: ROLE_CONCEPTEUR})
  return importData({
    model: 'resource', data: records, mapping: URL_RESOURCE_MAPPING(creator),
    identityKey: URL_RESOURCE_KEY, migrationKey: URL_RESOURCE_KEY,
  })
}

const MODELS=['program', 'chapter', 'module', 'sequence', 'resource']

const importBlock = async ({blockRecord, level, creator}) => {
  const modelName=MODELS[level]
  const model=mongoose.models[modelName]
  const name=blockRecord[modelName]

  modelName=='program' && console.log('*'.repeat(level*2), 'Import', level, modelName, name)

  const emptyChapter=modelName=='chapter' && name.trim().length==0

  const filter={origin: null}
  if (modelName=='resource') {
    const code=extractResourceCode(name)
    filter.code=code
    console.log('Searching', code, 'for resource', name)
  }
  else {
    filter.name=name
  }
  let loaded=await model.findOne(filter)
  if (!loaded && !emptyChapter) {
    if (modelName=='resource') {
      console.error(`Ressource ${name}  ${level} ${model.modelName} introuvable dans ${JSON.stringify({...blockRecord, children: undefined})}`)
      return null
    }
    const attributes={name, creator, origin: null}
    loaded=await model.create(attributes)
  }
  if (level<MODELS.length-1) {
    const res=await runPromisesWithDelay(blockRecord.children.map(c => () => {
      return importBlock({blockRecord:c, level:level+1, creator})
    }))
    const errors=res.filter(r => r.status=='rejected').map(r => r.reason)
    if (errors.length>0) {
      throw new Error(modelName+errors.join('\n'))
    }
    let dbChildren=res.map(r => r.value).filter(v => !!v)
    dbChildren=lodash.flatten(dbChildren)
    if (emptyChapter) {
      return dbChildren
    }
    else {
      await runPromisesWithDelay(dbChildren.map(c => async () => {
        const childExists=await mongoose.models.block.exists({parent: loaded._id, origin: c._id})
        return !childExists && addChildAction({parent: loaded._id, child: c._id}, creator)
    }))
    }

  }
  return loaded
}

const generateTree = (data, hierarchy) => {
  if (!hierarchy.length) {
    return data;
  }

  const [currentLevel, ...restHierarchy] = hierarchy;

  const grouped = lodash.groupBy(data, currentLevel);

  return lodash.map(grouped, (groupItems, key) => ({
    [currentLevel]: key,
    children: generateTree(groupItems, restHierarchy)
  }))
}

const removeResourceCode = title => {
  const PATTERN=/^ *\w+_\w+_\w+ /
  return title.replace(PATTERN, '')
}

const extractResourceCode = filename => {
  const PATTERN=/^ *[a-zA-Z0-9]+_[a-zA-Z0-9]+_[a-zA-Z0-9]+/
  return filename.match(PATTERN)?.[0]
}

const importPrograms= async (filename, tabName, fromLine) => {
  // First remove all programs/chapters/modules/sequences
  await Block.deleteMany({type: {$ne: 'resource'}})
  await Block.deleteMany({origin: {$ne: null}})
  const creator=await User.findOne({role: ROLE_CONCEPTEUR})
  console.log(creator)
  let data=await loadRecords(filename, tabName, fromLine)
  const types=Object.keys(data[0]).slice(0, 5)
  const keyMapping=Object.fromEntries(lodash.zip(types, MODELS))
  data=data.map(d => lodash(d).mapKeys((v, k) => keyMapping[k]).pick(MODELS).value())
  // data=data.map(d => ({...d, resource: removeResourceCode(d.resource)}))
  const tree=generateTree(data, MODELS)
  const res=await runPromisesWithDelay(tree.map(program => () => {
    return importBlock({blockRecord:program, level:0, creator})
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

const passwordCache= new NodeCache()

const getPassword = email => {
  let password=passwordCache.get(email)
  if (!password) {
    password=generatePassword()
    passwordCache.set(email, password)
  }
  return password
}

const hasPassword = async email => {
  const user=await User.findOne({email: email})
  return !lodash.isEmpty(user?.password)
}

const ensureNumber = value => {
  if (!parseInt(value)) {
    throw new Error(`${value}: entier attendu`)
  }
  return value
}

const TRAINER_MAPPING = {
  email: 'EMAIL_FORMATEUR',
  firstname: 'PRENOM_FORMATEUR',
  lastname: 'NOM_FORMATEUR',
  role: () => ROLE_FORMATEUR,
  aftral_id: ({record}) => ensureNumber(record[TRAINER_AFTRAL_ID]),
  password: async ({record}) =>  (await hasPassword(record.EMAIL_FORMATEUR)) ? undefined : isExternalTrainer(record.EMAIL_FORMATEUR) ? getPassword(record.EMAIL_FORMATEUR) : 'Password1;',
  plain_password: async ({record}) => (await hasPassword(record.EMAIL_FORMATEUR)) ? undefined : isExternalTrainer(record.EMAIL_FORMATEUR) ? getPassword(record.EMAIL_FORMATEUR) : 'Password1;',
}

const TRAINER_KEY='aftral_id'

const importTrainers = async (filename) => {
  const previousTrainers=await getAftralTrainers()
  const records=await loadRecords(filename)
  const uniqueTrainers=lodash.uniqBy(records, TRAINER_AFTRAL_ID)
  const res=await importData({model: 'user', data: uniqueTrainers, 
    mapping: TRAINER_MAPPING, 
    identityKey: TRAINER_KEY, 
    migrationKey: TRAINER_KEY,
  })
  // Mail new traines
  const newTrainers=await User.find({role: ROLE_FORMATEUR, aftral_id: {$ne: null, $nin: previousTrainers}})
  console.log(`Sending init to trainers`, newTrainers.map(t => t.email))
  await Promise.allSettled(newTrainers.map(trainer => sendInitTrainer({trainer})))
  return res
}

const TRAINEE_MAPPING = {
  role: () => ROLE_APPRENANT,
  firstname: 'PRENOM_STAGIAIRE',
  lastname: 'NOM_STAGIAIRE',
  email: 'EMAIL_STAGIAIRE',
  aftral_id: ({record}) => ensureNumber(record[TRAINEE_AFTRAL_ID]),
  password: TRAINEE_AFTRAL_ID,
  plain_password: TRAINEE_AFTRAL_ID,
}

const TRAINEE_KEY='aftral_id'

const importTrainees = async (filename) => {
  let res=[]
  const records=await loadRecords(filename)
  let uniqueTrainees=lodash.uniqBy(records, TRAINEE_AFTRAL_ID)
  const duplicates=lodash(uniqueTrainees)
    .countBy('EMAIL_STAGIAIRE')
    .pickBy(v => v>1)
    .keys()
    .value()
  if (!lodash.isEmpty(duplicates)) {
    res=[...res, {status: 'rejected', reason: {message: `Les email(s) non unique(s) ${duplicates.join(',')} ne seront pas importés`}}]
    uniqueTrainees=uniqueTrainees.filter(t => !duplicates.includes(t.EMAIL_STAGIAIRE))
  }
  if (lodash.isEmpty(uniqueTrainees)) {
    return res
  }
  const importRes=await importData({model: 'user', data: uniqueTrainees, 
    mapping: TRAINEE_MAPPING, 
    identityKey: TRAINEE_KEY, 
    migrationKey: TRAINEE_KEY,
  })
  return [...res, ...importRes]
}

const SESSION_MAPPING = admin => ({
  creator: () => admin,
  start_date: ({record}) => record.DATE_DEBUT_SESSION && moment(record.DATE_DEBUT_SESSION, 'DD-MM-YYYY').startOf('day') || record.DATE_DEBUT_SESSION,
  end_date: ({record}) => record.DATE_FIN_SESSION && moment(record.DATE_FIN_SESSION, 'DD-MM-YYYY').endOf('day') || record.DATE_FIN_SESSION,
  name: async ({record}) =>  {
    const code=await ProductCode.findOne({code: record.CODE_PRODUIT})
    const program=code ? await Program.findOne({codes: code}) : null
    if (!program) {
      throw new Error(`Session ${record[SESSION_AFTRAL_ID]} : programme de code ${record.CODE_PRODUIT} introuvable`)
    }
    return program?.name
  },
  session_product_code: 'CODE_PRODUIT',
  code: 'CODE_SESSION',
  aftral_id: ({record}) => ensureNumber(record[SESSION_AFTRAL_ID]),
  trainers: async ({record}) => {
    const session=await Session.findOne({aftral_id: record[SESSION_AFTRAL_ID]}).populate('trainers')
    const previousTrainers=session?.trainers.map(t => t.aftral_id) || []
    const importTrainers=record.TRAINERS.map(t => ensureNumber(t[TRAINER_AFTRAL_ID]))
    const trainersIds=lodash.uniq([...previousTrainers, ...importTrainers])
    const trainers=await User.find({aftral_id: {$in: trainersIds}})
    return trainers
  },
  trainees: async ({record}) => {
    const session=await Session.findOne({aftral_id: record[SESSION_AFTRAL_ID]}).populate('trainees')
    const previousTrainees=session?.trainees.map(t => t.aftral_id) || []
    const importTrainees=record.TRAINEES.map(t => parseInt(t[TRAINEE_AFTRAL_ID]))
    let traineesIds=lodash.uniq([...previousTrainees, ...importTrainees])
    // Remove unregistered trainees
    const unregisterd=record.TRAINEES.filter(t => !parseInt(t.FLAG)).map(t => parseInt(t[TRAINEE_AFTRAL_ID]))
    traineesIds=lodash.difference(traineesIds, unregisterd)
    const trainees=await User.find({aftral_id: {$in: traineesIds}})
    return trainees
  },
  location: 'NOM_CENTRE',
})

const SESSION_KEY='aftral_id'

const getSessionsStates = async sessions_ids => {
  const sessions=await Session.find({aftral_id: {$in: sessions_ids}}).populate(['trainers', 'trainees'])
  return Object.fromEntries(sessions.map(s => 
    [
      s.aftral_id, 
      {trainees: s.trainees.map(t => t.aftral_id)}
    ]
  ))
}

const getAftralTrainers = async () => {
  const trainers=await User.find({role: ROLE_FORMATEUR, aftral_id: {$ne: null}})
  return trainers.map(t => t.aftral_id)
}

const importSessions = async (trainersFilename, traineesFilename) => {
  // Get previous sessions state
  let result=[]
  const trainees=await loadRecords(traineesFilename)
  const trainers=await loadRecords(trainersFilename)
  let sessions=lodash(trainers)
    .uniqBy(SESSION_AFTRAL_ID)
    .map(s => {
      const sess_trainers=trainers.filter(t => t[SESSION_AFTRAL_ID]==s[SESSION_AFTRAL_ID])
      const sess_trainees=trainees.filter(t => t[SESSION_AFTRAL_ID]==s[SESSION_AFTRAL_ID])
      return {
        [SESSION_AFTRAL_ID]: s[SESSION_AFTRAL_ID],
        CODE_PRODUIT: s.CODE_PRODUIT,
        TRAINERS: sess_trainers,
        TRAINEES: sess_trainees,
        DATE_DEBUT_SESSION:sess_trainees[0]?.DATE_DEBUT_SESSION,
        DATE_FIN_SESSION:sess_trainees[0]?.DATE_FIN_SESSION,
        NOM_CENTRE:sess_trainees[0]?.NOM_CENTRE,
    }
    })
    .value()
  const previousSessions=await getSessionsStates(sessions.map(s => s[SESSION_AFTRAL_ID]))
  const progressCb=(index, total) => index%10==0 && console.log(index, '/', total)
  const oneAdmin=await User.findOne({role: ROLE_ADMINISTRATEUR})
  const importResult=await importData({model: 'session', data: sessions, 
    mapping: SESSION_MAPPING(oneAdmin), 
    identityKey: SESSION_KEY, 
    migrationKey: SESSION_KEY,
    progressCb
  })
  result=[...importResult]

  // Set programs
  const programsResult=await runPromisesWithDelay(sessions.map(record => async () => {
    const session=await Session.findOne({aftral_id: record[SESSION_AFTRAL_ID]}).populate(['trainers', 'trainees', 'children'])
    if (!session) {
      return
    }
    const code=await ProductCode.findOne({code: record.CODE_PRODUIT})
    const program=await Program.findOne({codes: code, origin: null, _locked: false})
    if (!program) {
      return Promise.reject(`Session ${record.CODE_SESSION} programme de code ${record.CODE_PRODUIT} introuvable`)
    }
    if (lodash.isEmpty(session.children)) {
      console.log('Program for', record[SESSION_AFTRAL_ID], !!session, !!program)
      const clonedProgram=await cloneTree(program._id, session._id, oneAdmin).catch(console.Error)
      console.log('Cloned program', clonedProgram._id)
      await Program.findByIdAndUpdate(clonedProgram._id, {parent: session._id})
      await lockSession(session._id)
    }
    await setSessionInitialStatus(session._id)
    // Mailing to new trainees
    const previousSession=previousSessions[session.aftral_id]
    const newTrainees=lodash.differenceBy(session.trainees, previousSession?.trainees || [], t => t.aftral_id || t)
    if (!lodash.isEmpty(newTrainees)) {
      console.log(`Sending session`, session.name, session.code, `init to trainees`, newTrainees.map(t => t.email))
      await Promise.allSettled(newTrainees.map(trainee => sendInitTrainee({trainee, session})))
    }
  }))
  result=[...result, ...programsResult]
  return result
}

module.exports={
  importResources, importPrograms, importCodes, importTrainers, importTrainees, importSessions, 
  removeResourceCode, loadRecords, extractResourceCode, importURLResources,
}  


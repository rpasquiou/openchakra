const fs=require('fs')
const siret = require('siret')
const lodash=require('lodash')
const moment=require('moment')
const path=require('path')
const crypto = require('crypto')
const {extractData, guessFileType, importData, cache, setCache}=require('../../../utils/import')
const { guessDelimiter, normalize, getNearestWord } = require('../../../utils/text')
const Company=require('../../models/Company')
const User=require('../../models/User')
const AppointmentType=require('../../models/AppointmentType')
const {
  ROLE_EXTERNAL_DIET, ROLE_CUSTOMER, DIET_REGISTRATION_STATUS_ACTIVE, COMPANY_ACTIVITY_OTHER, QUIZZ_TYPE_PATIENT, 
  QUIZZ_QUESTION_TYPE_ENUM_SINGLE, QUIZZ_TYPE_PROGRESS, COACHING_QUESTION_STATUS, COACHING_QUESTION_STATUS_NOT_ADDRESSED, 
  COACHING_QUESTION_STATUS_NOT_ACQUIRED, COACHING_QUESTION_STATUS_IN_PROGRESS, COACHING_QUESTION_STATUS_ACQUIRED, 
  GENDER_MALE, GENDER_FEMALE, COACHING_STATUS_NOT_STARTED, QUIZZ_TYPE_ASSESSMENT, DIET_REGISTRATION_STATUS_REFUSED, 
  FOOD_DOCUMENT_TYPE_NUTRITION, GENDER, DIET_REGISTRATION_STATUS_VALID, DIET_REGISTRATION_STATUS_PENDING, COACHING_CONVERSION_CANCELLED, CALL_STATUS_TO_CALL, CALL_STATUS_CALL_1, CALL_STATUS_CALL_2, CALL_STATUS_UNREACHABLE, CALL_STATUS_CONVERTI_COA, CALL_STATUS_NOT_INTERESTED, CALL_STATUS_RECALL, CALL_STATUS_CONVERTI_CN, CALL_STATUS_CONVERTI_COA_CN, CALL_STATUS_WRONG_NUMBER, CALL_DIRECTION_OUT_CALL 
} = require('./consts')
const { CREATED_AT_ATTRIBUTE, TEXT_TYPE } = require('../../../utils/consts')
require('../../models/Key')
const QuizzQuestion = require('../../models/QuizzQuestion')
require('../../models/UserQuizz')
require('../../models/UserQuizzQuestion')
require('../../models/Conversation')
require('../../models/Message')
require('../../models/Target')
require('../../models/FoodDocument')
require('../../models/NutritionAdvice')
require('../../models/Network')
require('../../models/Diploma')
require('../../models/Lead')
require('../../models/Job')
const Quizz = require('../../models/Quizz')
const Coaching = require('../../models/Coaching')
const { idEqual } = require('../../utils/database')
const Appointment = require('../../models/Appointment')
const UserSurvey = require('../../models/UserSurvey')
const { runPromisesWithDelay } = require('../../utils/concurrency')
const NodeCache = require('node-cache')
require('../../models/Offer')
const { updateCoachingStatus } = require('./coaching')
const { isPhoneOk } = require('../../../utils/sms')
const UserQuizzQuestion = require('../../models/UserQuizzQuestion')
const { sendFileToAWS } = require('../../middlewares/aws')
const UserQuizz = require('../../models/UserQuizz')
const { isNewerThan } = require('../../utils/filesystem')
const pairing =require('@progstream/cantor-pairing')
const FoodDocument = require('../../models/FoodDocument')
const Offer = require('../../models/Offer')
require('../../models/JoinReason')
require('../../models/DeclineReason')
require('../../models/Interest')
const DEFAULT_PASSWORD='DEFAULT'

const ASS_PRESTATION_DURATION=45
const ASS_PRESTATION_NAME=`Bilan générique ${ASS_PRESTATION_DURATION} minutes`
const ASS_PRESTATION_SMARTAGENDA_ID=-1

const FOLLOWUP_PRESTATION_DURATION=15
const FOLLOWUP_PRESTATION_NAME=`Suivi générique ${FOLLOWUP_PRESTATION_DURATION} minutes`
const FOLLOWUP_PRESTATION_SMARTAGENDA_ID=-2

const QUIZZ_FACTOR=100

const NUT_JOB={
  0: '',
  1: 'Administratif',
  2: 'Chauffeur longue distance',
  3: 'Chauffeur moyenne distance',
  4: 'Manutention',
  5: 'Opérationnel',
  6: 'Logistique',
  7: 'Acheteur',
  8: 'Apprenti',
  9: 'Sans activité',
  10: 'Handicapé',
  11: 'Retraité(e)',
  12: 'Accident du travail',
  13: 'Pas de réponse',
}

const NUT_SUBJECT={
  1: `Equilibre alimentaire`,
  2: `Problématiques organisationnelles sur le terrain (achats de denrées, stockage, ...)`,
  3: `Problématiques organisationnelles à la maison (menu, liste de course..)`,
  4: `Comportements alimentaires`,
  5: `Perte/Prise de poids`,
  6: `Pathologies`,
  7: `Autre`,
}

const NUT_REASON={
  0: `Aucune`,
  1: `Déjà suivi sur cette thématique`,
  2: `Hors cible`,
  3: `Je n'ai pas le temps`,
  4: `Je ne souhaite pas échanger avec une diététicienne`,
  5: `Le format ne me convient pas`,
  6: `Autre motif/sans réponse`,
  7: `N'a pas besoin - tout est clair`,
}


const normalizePhone = tel => {
  let newTel=tel?.replace(/ /g, '')
  if (newTel?.length==9) {
    newTel=`0${newTel}`
  }
  if (!isPhoneOk(newTel)) {
    newTel=null
  }
  return newTel
}

const replaceInFile = (path, replaces) => {
  const contents=fs.readFileSync(path).toString()
  let fixed=contents
  replaces.forEach(([search, replace]) => fixed=fixed.replace(search, replace))
  if (fixed!=contents) {
    console.log('Updated', path)
    fs.writeFileSync(path, fixed)
  }
}

const createCantorKey = (value1, value2) => {
  const values=[parseInt(value1), parseInt(value2)].sort()
  return pairing.pair(...values)
}


const fixQuizz = directory => {
  const REPLACES=[
    [/.quilibre/g, 'Equilibre'], [/\/ Vegan/g, '/Vegan'], [/Apéro \!/g, 'Apéro'], [/Fr.quences/g, 'Fréquences'],
    [/.quivalences/g, 'Equivalences'],
  ]
  replaceInFile(path.join(directory, 'smart_quiz.csv'), REPLACES)
}

const fixSpecs = directory => {
  const REPLACES=[
    ['Allergies et intolérances alim', 'Gluten'],
    ['Autres troubles de santé (pathologies)','Hypertension Artérielle (HTA)'],
    [ 'Maternité', 'Grossesse' ],
    [ 'Perte de poids', 'Perdre du poids' ],
    [ 'Prise de poids', 'Prendre du poids' ],
    [ 'Rééquilibrage alimentaire', 'Rééquilibrage alimentaire' ],
    [ 'Sportifs', 'Compétition' ],
    [ 'TCA / Comportemental', 'Compulsion alimentaire' ],
    [ 'Troubles digestifs', 'Syndrome de l’intestin irritable (SII)' ],
    [ 'Troubles hormonaux', 'Hyperthyroïdie' ],
    [ 'Végétariens et végétaliens', 'Végétarisme' ]
  ]
  replaceInFile(path.join(directory, 'smart_spec.csv'), REPLACES)
}

const loadRecords = async path =>  {
  const msg=`Loading records from ${path}`
  console.time(msg)
  const contents=fs.readFileSync(path)
  const {records} = await extractData(contents, {format: TEXT_TYPE, delimiter: ';'})
  console.timeEnd(msg)
  return records
}

const saveRecords = async (path, keys, data) =>  {
  const msg=`Saving records to ${path}`
  console.time(msg)
  const header=keys.join(';')
  const contents=data.map(d => keys.map(k => d[k]).join(';'))
  const fullContents=header+'\n'+contents.join('\n')
  return fs.writeFileSync(path, fullContents)
}

const generateMessages = async directory =>{
  const THREADS=path.join(directory, 'smart_thread.csv')
  const MESSAGES=path.join(directory, 'smart_message.csv')

  const CONVERSATIONS_OUTPUT=path.join(directory, 'wapp_conversations.csv')
  const MESSAGES_OUTPUT=path.join(directory, 'wapp_messages.csv')

  if (isNewerThan(CONVERSATIONS_OUTPUT, THREADS) 
      && isNewerThan(CONVERSATIONS_OUTPUT, MESSAGES)
      && isNewerThan(MESSAGES_OUTPUT, THREADS)
      && isNewerThan(MESSAGES_OUTPUT, MESSAGES)
  ) {
    console.log('No need to generate', CONVERSATIONS_OUTPUT, 'or', MESSAGES_OUTPUT)
    return
  }

  console.log('Generating', CONVERSATIONS_OUTPUT, 'and', MESSAGES_OUTPUT)

  const sd_messages=await loadRecords(MESSAGES)
  const threads=await loadRecords(THREADS)

  const conversations=lodash([...sd_messages, ...threads])
    .map(({SDTHREADID, SDCREATORID, SDSENDERID}) => ({SDTHREADID, USERID: SDCREATORID || SDSENDERID}))
    .groupBy('SDTHREADID')
    .mapValues(users => lodash.uniq(users.map(r => parseInt(r.USERID))))
    .pickBy(v => v.length==2)
    .entries()
    .map((([SDTHREADID, [USER1, USER2]]) => ({SDTHREADID, USER1, USER2, CONVID: createCantorKey(USER1, USER2)})))
    .groupBy('CONVID')
    .mapValues(threads => ({...threads[0], SDTHREADID: undefined, SDTHREADIDS: threads.map(t => t.SDTHREADID)}))
  
  console.log(conversations.value())
  const conversationKeys=['CONVID','USER1','USER2']
  saveRecords(CONVERSATIONS_OUTPUT, conversationKeys, conversations)

  const getConvId = threadId => {
    const conv=conversations.values().find(e => e.SDTHREADIDS.includes(threadId))
    return parseInt(conv?.CONVID)
  }

  const getReceiver = (convId, sender) => {
    const conv=conversations.values().find(conv => conv.CONVID==convId)
    const receiver=conv.USER1==sender ? conv.USER2 : conv.USER1
    return receiver
  }

  const messages=lodash(sd_messages)
    // Compute convid
    .map(r => ({...r, CONVID: getConvId(r.SDTHREADID)}))
    // Remove no CONVID entries (i.e. thread with one people only)
    .filter(v => !!v.CONVID)
    .map(msg => ({...msg, SENDER: msg.SDSENDERID, RECEIVER: getReceiver(msg.CONVID, msg.SDSENDERID), message: `"${msg.message}"`}))
    .value()

  const messagesKeys=['CONVID', 'SENDER', 'RECEIVER', 'message', 'datetime']
  saveRecords(MESSAGES_OUTPUT, messagesKeys, messages)
}

const fixFoodDocuments = async directory => {
  const mappingRecords=await loadRecords(path.join(directory, 'mapping_fiche.csv'))
  // Check existence of mapped names in DB
  const missingDbDocuments=(await Promise.all(
    mappingRecords
      .filter(r => !!r.wapp_name)
      .map(r => FoodDocument.exists({name: r.wapp_name})
        .then(exists => exists ? '': `No document ${r.wapp_name} in DB`)
      )
  )).filter(v => !!v)
  if (!lodash.isEmpty(missingDbDocuments)) {
    throw new Error(`Not found in DB: ${missingDbDocuments}`)  
  }
}

const computeQuestionId = (quizz_id, question_order) => {
  return parseInt(+quizz_id)*QUIZZ_FACTOR+(+question_order)
}

const computeAnswerId = (quizz_id, question_order, answer_order) => {
  return computeQuestionId(quizz_id, question_order)*QUIZZ_FACTOR+(+answer_order)
}

const generateQuizz = async directory => {
  const quizz=await loadRecords(path.join(directory, 'smart_quiz.csv'))
  const questions=await loadRecords(path.join(directory, 'smart_question.csv'))
  
  // Mapp quizz names
  const dbQuizz=await Quizz.find({type: QUIZZ_TYPE_PATIENT}, {name:1}).populate('questions')
  const mappedQuizzs=quizz.map(q => ({
      ...q,
      name: getNearestWord(q.name, dbQuizz.map(d => d.name), 15) || q.name
    }))
  await saveRecords(path.join(directory, 'wapp_quiz.csv'), Object.keys(mappedQuizzs[0]), mappedQuizzs)

  // Mapp quizz question titles
  const dbQuestions=lodash(dbQuizz).map(q => q.questions).flatten()
  const mappedQuestions=questions.map(q => ({
      SDQUESTIONID: computeQuestionId(q.SDQUIZID, q.position), 
      SQQUIZID: q.SDQUIZID,
      question: getNearestWord(q.question, dbQuestions.map(d => d.title), 6) || q.question,
      correct_answer: computeAnswerId(q.SDQUIZID, q.position, +q.firstanswergood==1 ? 0 : 1),
      comments: `"${q.comments}"`,
    })
  )
  await saveRecords(path.join(directory, 'wapp_questions.csv'), Object.keys(mappedQuestions[0]), mappedQuestions)

  const mappedAnswers=lodash(questions)
    .map(q => ([
      {SDANSWERID: computeAnswerId(q.SDQUIZID, q.position, 0), SDQUESTIONID: computeQuestionId(q.SDQUIZID, q.position),text: q.firstanswer},
      {SDANSWERID: computeAnswerId(q.SDQUIZID, q.position, 1), SDQUESTIONID: computeQuestionId(q.SDQUIZID, q.position),text: q.secondanswer},
    ]))
    .flatten()
    .value()
  await saveRecords(path.join(directory, 'wapp_answers.csv'), Object.keys(mappedAnswers[0]), mappedAnswers)
  
}


const generateFoodPrograms = async directory => {
  const INPUT=path.join(directory, 'smart_consultation.csv')
  const OUTPUT=path.join(directory, 'wapp_foodprograms.csv')
  if (isNewerThan(OUTPUT, INPUT)) {
    return
  }

  const consultations=await loadRecords(INPUT)
  const foodprograms=lodash(consultations)
    .filter(c => !lodash.isEmpty(c.foodprogram))
    .map(c => ({SDPROGRAMID: c.SDPROGRAMID, foodprogram: c.foodprogram, date: c.date}))
    .value()

  await saveRecords(OUTPUT, Object.keys(foodprograms[0]), foodprograms)
}

const fixFiles = async directory => {
  console.log('Fixing files')
  await fixQuizz(directory)
  await generateMessages(directory)
  await fixSpecs(directory)
  console.warn('*'.repeat(40), 'HERE HAVE TO GENERATE QUIZZ JUST BEFORE IMPORT', '*'.repeat(40),)
  // await generateQuizz(directory)
  await generateFoodPrograms(directory)
  console.log('Fixed files')
}

const computePseudo = record => {
  const letters=[record.firstname?.trim()?.slice(0, 1), record.lastname?.trim()?.slice(0, 2)].filter(v => !!v)
  return letters.join('').toUpperCase() || 'FAK'
}

const COMPANY_MAPPING= (assTypeId, followTypeId) => ({
  name: 'name',
  size: () => 1,
  activity: () => COMPANY_ACTIVITY_OTHER,
  assessment_appointment_type: () => assTypeId,
  followup_appointment_type: () => followTypeId,
  migration_id: 'SDPROJECTID',
})

const COMPANY_KEY='name'
const COMPANY_MIGRATION_KEY='migration_id'

const SMART_OFFER_MAPPING= {
  1 : {name: 'Offre bilan', coaching_credit: 1, duration: 1*30},
  2 : {name: 'Offre un mois', coaching_credit: 2, duration: 1*30},
  3:  {name: 'Offre 3 mois', coaching_credit: 4, duration: 3*30},
  4:  {name: 'Offre 6 mois', coaching_credit: 7, duration: 6*30},
  10: {name: 'Offre illimitée', coaching_credit: 99, duration: 99*30},
}

const OFFER_MAPPING= {
  name: async ({cache, record}) => {
    const user=await User.findById(cache('user', record.SDPATIENTID)).populate('company')
    return `${SMART_OFFER_MAPPING[record.SDPROGRAMTYPE]?.name} pour ${user?.company?.name} `
  },
  price: () => 1,
  groups_credit: () => 0,
  nutrition_credit: () => 3,
  duration: ({record}) => SMART_OFFER_MAPPING[record.SDPROGRAMTYPE]?.duration,
  coaching_credit: ({record}) => SMART_OFFER_MAPPING[record.SDPROGRAMTYPE]?.coaching_credit,
  infographies_unlimited: () => true,
  infographies_unlimited: () => true,
  articles_unlimited: () => true,
  podcasts_unlimited: () => true,
  video_unlimited: () => true,
  webinars_credit: () => 4,
  company: async ({cache, record}) => {
    const user=await User.findById(cache('user', record.SDPATIENTID))
    return user?.company
  },
  validity_start: () => '01/01/2019',
  assessment_quizz: async () => await Quizz.findOne({type: QUIZZ_TYPE_ASSESSMENT}),
  // migration_id: company smart id * 1000 + smart program type
  migration_id: async ({cache, record}) => {
    const user=await User.findById(cache('user', record.SDPATIENTID)).populate('company')
    const mig_id=user?.company?.migration_id*1000+(+record.SDPROGRAMTYPE)
    return mig_id
  },
}

const OFFER_KEY='name'
const OFFER_MIGRATION_KEY='migration_id'

const GENDER_MAPPING={
  M: GENDER_MALE,
  F: GENDER_FEMALE,
}

const PATIENT_MAPPING={
  role: () => ROLE_CUSTOMER,
  email: 'emailCanonical',
  firstname: ({record}) => record.firstname || 'inconnu',
  lastname: ({record}) => record.lastname || 'inconnu',
  address: 'address',
  zip_code: ({record}) => (record.cp || '').trim().slice(-5).padStart(5, '0'),
  city: 'city',
  dataTreatmentAccepted: () => true,
  cguAccepted: () => true,
  password: () => DEFAULT_PASSWORD,
  company: ({cache, record}) => cache('company', record.SDPROJECTID),
  pseudo: ({record}) => computePseudo(record),
  gender: ({record}) => GENDER_MAPPING[record.gender],
  birthday: ({record}) => lodash.isEmpty(record.birthdate) ? null:  moment(record.birthdate),
  phone: ({record}) => normalizePhone(record.phone),
  diet_comment: 'comments',
  [CREATED_AT_ATTRIBUTE]: ({record}) => moment(record.created_at),
  migration_id: 'SDPATIENTID',
  source: () => 'import',
}

const PATIENT_KEY='email'
const PATIENT_MIGRATION_KEY='migration_id'

const HEIGHT_MAPPING={
  migration_id: 'SDPATIENTID',
  _id: ({cache, record}) => cache('user', record.SDPATIENTID),
  height: 'height',
}

const HEIGHT_KEY='_id'
const HEIGHT_MIGRATION_KEY='migration_id'

const WEIGHT_MAPPING={
  // Weight from summary
  migration_id: ({record}) => -record.SDPATIENTID,
  weight: 'weight',
  user: ({cache, record}) => cache('user', record.SDPATIENTID),
  date: 'updated',
}

const WEIGHT_KEY='migration_id'
const WEIGHT_MIGRATION_KEY='migration_id'



const DIET_STATUS_MAPPING={
  0: DIET_REGISTRATION_STATUS_PENDING,
  1: DIET_REGISTRATION_STATUS_PENDING,
  2: DIET_REGISTRATION_STATUS_ACTIVE,
  3: DIET_REGISTRATION_STATUS_REFUSED,
  4: DIET_REGISTRATION_STATUS_VALID,
}
const companyOffersCache=new NodeCache()

const getUserOffer = async (user, date) => {
  if (!user) {
    console.warn(`User not found`)
    return null
  }
  const key=user.company._id.toString()
  let offers=companyOffersCache.get(key)
  if (!offers) {
    offers=await Offer.find({company: user.company})
      .populate({path: 'assessment_quizz', populate: 'questions'})
      .populate({path: 'impact_quizz', populate: 'questions'})
      .sort({validity_start: -1})
      // .lean()
    companyOffersCache.set(key, offers)
  }
  const offer=lodash.dropWhile(offers, o => moment(o.validity_start).isAfter(moment(date))).pop()
  return offer
}

const COACHING_MAPPING={
  [CREATED_AT_ATTRIBUTE]: ({record}) => moment(record.orderdate),
  user: ({cache, record}) => cache('user', record.SDPATIENTID),
  offer: async ({cache, record}) => {
    const user=await User.findById(cache('user', record.SDPATIENTID))
    return getUserOffer(user, record.orderdate)
  },
  migration_id: 'SDPROGRAMID',
  diet: ({cache, record}) => cache('user', record.SDDIETID),
  smartdiet_patient_id: 'SDPATIENTID',
}

const COACHING_KEY=['user', CREATED_AT_ATTRIBUTE]
const COACHING_MIGRATION_KEY='migration_id'

// APPT status : 1 : new, 2: done, 3: paid

const EXPORT_DATE=moment('2024-06-18')

const APPOINTMENT_MAPPING= (assessment_id, followup_id, progressTemplate) => ({
  coaching: ({cache, record}) => cache('coaching', record.SDPROGRAMID),
  start_date: 'date',
  end_date: ({record}) => moment(record.date).add(45, 'minutes'),
  note: 'comments',
  appointment_type: ({record}) => !!record.assessment ? assessment_id : followup_id,
  migration_id: 'SDCONSULTID',
  diet: async ({cache, record}) => {
    let diet=null
    if (!!record.SDDIETID) {
      diet=cache('user', record.SDDIETID)
    }
    if (!diet) {
      const coaching = await Coaching.findById(cache('coaching', record.SDPROGRAMID))
      diet=coaching?.diet
    }
    if (!diet) { console.error('No diet found for', record.SDPROGRAMID)}
    return diet
  },
  user: async ({cache, record}) => (await Coaching.findById(cache('coaching', record.SDPROGRAMID), {user:1}))?.user,
  progress: async ({cache, record}) => {
    let progress=await UserQuizz.findOne({migration_id: record.SDCONSULTID}, {_id:1})
    if (!progress) {
      progress=await progressTemplate.cloneAsUserQuizz().catch(console.error)
      progress.migration_id=record.SDCONSULTID
      await progress.save()
    }
    return progress._id
  },
  validated: ({record}) => +record.status>1 || EXPORT_DATE.isBefore(record.date),
})


const APPOINTMENT_KEY=['coaching', 'start_date']
const APPOINTMENT_MIGRATION_KEY='migration_id'

const MEASURE_MAPPING={
  migration_id: 'SDCONSULTID',
  date: async ({cache, record}) => (await Appointment.findById(cache('appointment', record.SDCONSULTID), {start_date:1}))?.start_date,
  chest: 'chest',
  waist: 'waist',
  hips: 'pelvis',
  thighs: ({record}) => lodash.mean([parseInt(record.leftthigh), parseInt(record.rightthigh)].filter(v => !!v)) || undefined,
  arms: () => undefined,
  weight: 'weight',
  user: async ({cache, record}) => 
    (await Appointment.findById(cache('appointment', record.SDCONSULTID), {user:1}))?.user,
}

const MEASURE_MAPPING_KEY='migration_id'
const MEASURE_MAPPING_MIGRATION__KEY='migration_id'

const QUIZZ_MAPPING={
  migration_id: 'SDQUIZID',
  name: 'name',
  type: () => QUIZZ_TYPE_PATIENT,
}

const QUIZZ_KEY='name'
const QUIZZ_MIGRATION_KEY='migration_id'

const hashCache = new NodeCache()
const hashStringToDecimal = inputString => {
  let res=hashCache.get(inputString)
  if (!res) {
    console.error('Not found', inputString)
    const hash = crypto.createHash('sha256')
    hash.update(inputString)
    const hashedString = hash.digest('hex')
    const decimalNumber = BigInt('0x' + hashedString)
    res=parseInt(decimalNumber%BigInt(1000000000))
    hashCache.set(inputString, res)
  }
  else {
    console.log('Found', inputString)
  }
  return res
}

const SMART_POINT_MAPPING={
  0: `Pas de clé`,
  1: `Je bouge`,
  2: `Je dors`,
  3: `Je gère`,
  4: `J'équilibre`,
  5: `Je m'organise`,
  6: `J'achète`,
  7: `Je ressens`,
}


const KEY_MAPPING={
  migration_id: ({record}) => Object.entries(SMART_POINT_MAPPING).find(([k, text]) => text==record.smartpoint) [0],
  name: 'smartpoint',
}

const KEY_KEY='name'
const KEY_MIGRATION_KEY='migration_id'


const ASSESSMENT_MAPPING={
  migration_id: ({record, cache}) => cache('usercoaching', record.SDPATIENTID),
  smartdiet_assessment_id: 'SDSUMMARYID',
}

const ASSESSMENT_KEY='smartdiet_assessment_id'
const ASSESSMENT_MIGRATION_KEY='migration_id'

const IMPACT_MAPPING={
  migration_id: ({record, cache}) => cache('usercoaching', record.SDPATIENTID),
  smartdiet_impact_id: 'SDSECONDSUMMARYID',
}

const IMPACT_KEY='smartdiet_impact_id'
const IMPACT_MIGRATION_KEY='migration_id'

const CONVERSATION_MAPPING={
  migration_id: 'CONVID',
  users: ({cache, record}) => [cache('user', record.USER1), cache('user', record.USER2)],
}

const CONVERSATION_KEY='migration_id'
const CONVERSATION_MIGRATION_KEY='migration_id'

const getMessageId = (dateTime, senderId) => {
  return createCantorKey(moment(dateTime).unix(), senderId)
}

const MESSAGE_MAPPING={
  migration_id: ({record}) => moment(record.datetime).unix(),
  conversation: ({cache, record}) => cache('conversation', record.CONVID),
  receiver: ({cache, record}) => cache('user', record.RECEIVER),
  sender: ({cache, record}) => cache('user', record.SENDER),
  content: 'message',
  [CREATED_AT_ATTRIBUTE]: 'datetime',
}

const MESSAGE_KEY='migration_id'
const MESSAGE_MIGRATION_KEY='migration_id'

const SPEC_MAPPING={
  migration_id: 'SPECID',
  name: 'name',
}

const SPEC_KEY='name'
const SPEC_MIGRATION_KEY='migration_id'

const FOOD_DOCUMENT_MAPPING= mapping => ({
  migration_id: 'IDFICHESD',
  name: ({record}) => mapping[record.name] || record.name,
  description: 'description',
  type: () => FOOD_DOCUMENT_TYPE_NUTRITION,
  key: ({record, cache}) => {
    // If no key => J'équilibre
    const keyId=cache('key', +record.smartpoint || 4)
    return keyId
  },
  document: async ({record, foodDocumentDirectory}) => {
    const url=await getS3FileForFoodDocument(foodDocumentDirectory, record.IDFICHESD, 'food')
      .catch(err => console.error(record, err))
    return url
  },
})

const FOOD_DOCUMENT_KEY='name'
const FODD_DOCUMENT_MIGRATION_KEY='migration_id'

const getGender = gender => +gender==1 ? GENDER_MALE : +gender==2 ? GENDER_FEMALE : undefined

const NUTADVICE_MAPPING={
  migration_id: ({record}) => parseInt(`${record.SDDIETID}${moment(record.date).unix()}`),
  [CREATED_AT_ATTRIBUTE]: 'date',
  start_date: 'date',
  diet: ({cache, record}) => cache('user', record.SDDIETID),
  patient_email: 'email',
  gender: ({record}) => getGender(record.gender),
  age: ({record}) => (+record.age && +record.age>=18) ? +record.age : null,
  job: ({record}) => NUT_JOB[+record.job_type],
  comment: ({record}) => NUT_SUBJECT[record.subject],
  reason: ({record}) => NUT_REASON[record.reason],
  led_to_coaching: ({record}) => +record.coaching>0,
}

const NUTADVICE_KEY='migration_id'
const NUTADVICE_MIGRATION_KEY='migration_id'

const NETWORK_MAPPING={
  migration_id: 'SDNETWORKID',
  name: 'name',
}

const NETWORK_KEY='name'
const NETWORK_MIGRATION_KEY='migration_id'

const GRADE_MAPPING={
  0: 'BTS',
  1: 'DUT',
}

const DIPLOMA_MAPPING={
  migration_id: 'SDID',
  name: ({record}) => GRADE_MAPPING[+record.grade],
  date: 'diplomedate',
  user: ({cache, record}) => cache('user', record.SDID),
  picture: async ({record, diplomaDirectory}) => {
    const url=await getS3FileForDiet(diplomaDirectory, record.firstname, record.lastname, 'diploma')
      .catch(err => console.error(record, err))
    return url
  },
}

const DIPLOMA_KEY='migration_id'
const DIPLOMA_MIGRATION_KEY='migration_id'


const OTHER_DIPLOMA_MAPPING={
  migration_id: ({record}) => (+record.SDID)*10,
  name: 'othergrade',
  user: ({cache, record}) => cache('user', record.SDID),
}

const OTHER_DIPLOMA_KEY='migration_id'
const OTHER_DIPLOMA_MIGRATION_KEY='migration_id'


const progressCb = step => (index, total)=> {
  step=step||Math.floor(total/10)
  if (step && index%step==0) {
    console.log(`${index}/${total}`)
  }
}

const updateImportedCoachingStatus = async () => {
  console.log('**** Update coaching status')
  console.time('Update coaching status')
  const coachings=await Coaching.find({migration_id: {$ne: null}}, {_id:1})
  const step=Math.floor(coachings.length/10)
  await runPromisesWithDelay(coachings.map((coaching, idx) => () => {
    if (idx%step==0) {
      console.log(idx, '/', coachings.length, '(', Math.ceil(idx/coachings.length*100),'%)')
    }
    return updateCoachingStatus(coaching._id)
      //.catch(err => console.error(`Coaching ${coaching._id}:${err}`))
  }))
  console.timeEnd('Update coaching status')
  console.log('******************** Updated coaching status')
}

const updateDietCompanies = async () => {
  const diets=await User.find({role: ROLE_EXTERNAL_DIET, source: 'import'})
  console.log('Updating', diets.length, 'diets companies')
  const res=await runPromisesWithDelay(diets.map(diet => async () => {
    const appts=await Appointment.find({diet}).populate('user')
    const coachings=await Coaching.find({diet}).populate('user')
    const companies=lodash([...appts, ...coachings]).map(appt => appt.user.company._id).uniq()
    await User.findByIdAndUpdate(diet, {$addToSet: {customer_companies: companies.value()}})
  }))
}

const importCompanies = async input_file => {
  // Usert default assessment & followup assesment type
  await AppointmentType.updateOne(
    {title: ASS_PRESTATION_NAME},
    {title: ASS_PRESTATION_NAME, duration: ASS_PRESTATION_DURATION, smartagenda_id: ASS_PRESTATION_SMARTAGENDA_ID},
    {upsert: true}
  )
  await AppointmentType.updateOne(
    {title: FOLLOWUP_PRESTATION_NAME},
    {title: FOLLOWUP_PRESTATION_NAME, duration: FOLLOWUP_PRESTATION_DURATION, smartagenda_id: FOLLOWUP_PRESTATION_SMARTAGENDA_ID},
    {upsert: true}
  )
  const assAppType=await AppointmentType.findOne({title: ASS_PRESTATION_NAME})
  const followAppType=await AppointmentType.findOne({title: FOLLOWUP_PRESTATION_NAME})
  const mapping=COMPANY_MAPPING(assAppType._id, followAppType._id)
  return loadRecords(input_file)
    .then(records => 
      importData({model: 'company', data:records, mapping, identityKey: COMPANY_KEY, 
        migrationKey: COMPANY_MIGRATION_KEY, progressCb: progressCb()}))
}

const importOffers = async input_file => {
  return loadRecords(input_file)
    .then(records => {
      return importData({model: 'offer', data:records, mapping:OFFER_MAPPING, identityKey: OFFER_KEY, 
        migrationKey: OFFER_MIGRATION_KEY, progressCb: progressCb()})
    })
}


const importPatients = async input_file => {
  // Deactivate password encryption
  const schema=User.schema
  schema.paths.password.setters=[]
  // End deactivate password encryption
  return loadRecords(input_file)
    .then(records => 
      importData({model: 'user', data:records, mapping:PATIENT_MAPPING, identityKey: PATIENT_KEY, 
        migrationKey: PATIENT_MIGRATION_KEY, progressCb: progressCb()})
    )
}

const DIET_MAPPING={
  role: () => ROLE_EXTERNAL_DIET,
  password: () => DEFAULT_PASSWORD,
  firstname: 'firstname',
  lastname: 'lastname',
  email: 'email',
  address: 'address',
  zip_code: ({record}) => (record.cp || '').trim().slice(-5).padStart(5, '0'),
  city: 'city',
  phone: ({record}) => normalizePhone(record.phone),
  adeli: 'adelinumber',
  siret: ({record}) => siret.isSIRET(record.siret)||siret.isSIREN(record.siret) ? record.siret : null,
  birthday: 'birthdate',
  [CREATED_AT_ATTRIBUTE]: ({record}) => moment(record['created_at']),
  registration_status: ({record}) => DIET_STATUS_MAPPING[+record.status],
  diet_coaching_enabled: ({record}) => +record.hasteleconsultation==1,
  diet_visio_enabled: ({record}) => +record.easewithconfs==1,
  diet_site_enabled: ({record}) => +record.hasatelier==1,
  diet_admin_comment: 'comments',
  description: 'annonce',
  // picture: async ({record, picturesDirectory}) => {return await getS3FileForDiet(picturesDirectory, record.firstname, record.lastname, 'profil')},
  // rib: async ({record, ribDirectory}) => {return await getS3FileForDiet(ribDirectory, record.firstname, record.lastname, 'rib')},
  source: () => 'import',
  migration_id: 'SDID',
}

const DIET_KEY='email'
const DIET_MIGRATION_KEY='migration_id'

const importDiets = async (input_file, pictures_directory, rib_directory) => {
  // End deactivate password encryption
  return loadRecords(input_file)
    .then(records =>  importData({
      model: 'user', data:records, mapping:DIET_MAPPING, identityKey: DIET_KEY, migrationKey: DIET_MIGRATION_KEY, 
      picturesDirectory: pictures_directory, ribDirectory: rib_directory, progressCb: progressCb()
    }))
}

const ensureProgress = (coaching, progressTmpl) => {
  if (coaching.progress) {
    return Promise.resolve(coaching)
  }
  return progressTmpl.cloneAsUserQuizz()
    .then(prg => {
      coaching.progress=prg
      return coaching.save()
    })
}

const ensureSurvey = coaching => {
  return UserSurvey.updateOne(
    {user: coaching.user},
    {user: coaching.user},
    {upsert: true}
  )
}


const importCoachings = async input_file => {
  // Cache company offers
  const companies=await Company.find()
    .populate({path: 'offers', sort: {validity_start: -1}})
    .lean()
  companies.forEach(company => companyOffersCache.set(company._id.toString(), company.offers))
  console.log(`Cached ${companies.length} companies`)
  return loadRecords(input_file)
    .then(records => {
      // Map SM patient to its SM coaching
      records.forEach(record => setCache('usercoaching', record.SDPATIENTID, record.SDPROGRAMID))
      return importData({model: 'coaching', data:records, mapping:COACHING_MAPPING, 
      identityKey: COACHING_KEY, migrationKey: COACHING_MIGRATION_KEY, progressCb: progressCb()})
    })
    .then(() => Coaching.find({migration_id: {$ne: null}}, {user:1}))
    .then(coachings => Promise.all(coachings.map(ensureSurvey)))
}

const removeEoAndMis = async (appts_path, mis_path, eo_path) => {
  let records = await loadRecords(appts_path)
  console.log('Generating appts')
  // Remove MIS appointments
  const mis = (await loadRecords(mis_path)).map(record => record.SDCONSULTID)
  records = records.filter(r => !mis.includes(r.SDCONSULTID))

  // Remove EO appointments
  const eo = (await loadRecords(eo_path)).map(record => record.SDCONSULTID)
  records = records.filter(r => !eo.includes(r.SDCONSULTID))
  return records
}

const fixAppointments = async (appts_path, eo_path, mis_path) => {
  let records = await removeEoAndMis(appts_path, mis_path, eo_path)
  
  const firstAppointments=lodash(records).groupBy('SDPROGRAMID')
    .mapValues(consults => lodash.minBy(consults, c => moment(c.date)).SDCONSULTID)
    .value()
  const ASS_HEADER='assessment'
  records=records.map(r => ({
    ...r,
    assessment: firstAppointments[r.SDPROGRAMID]==r.SDCONSULTID ? true : false
  }))
  return records
}


const importAppointments = async (input_file, eos_path, mis_path) => {

  let assessmentType=await AppointmentType.findOne({title: ASS_PRESTATION_NAME})
  if (!assessmentType) {
    assessmentType=await AppointmentType.create({title: ASS_PRESTATION_NAME, duration: ASS_PRESTATION_DURATION, 
      smartagenda_id: ASS_PRESTATION_SMARTAGENDA_ID})
  }

  let followupType=await AppointmentType.findOne({title: FOLLOWUP_PRESTATION_NAME})
  if (!followupType) {
    followupType=await AppointmentType.create({title: FOLLOWUP_PRESTATION_NAME, duration: FOLLOWUP_PRESTATION_DURATION, 
      smartagenda_id: FOLLOWUP_PRESTATION_SMARTAGENDA_ID})
  }

  const records=await fixAppointments(input_file, eos_path, mis_path)

  const progressQuizz=await Quizz.findOne({ type: QUIZZ_TYPE_PROGRESS }).populate('questions')
  const mapping=APPOINTMENT_MAPPING(assessmentType._id, followupType._id, progressQuizz)
  return importData({
    model: 'appointment', data:records, mapping, identityKey: APPOINTMENT_KEY, 
    migrationKey: APPOINTMENT_MIGRATION_KEY, progressCb: progressCb()
  })
}

const importMeasures = async (measures_path, mis_path, eo_path) => {
  const records=await removeEoAndMis(measures_path, mis_path, eo_path)
  return importData({
    model: 'measure', data:records, mapping:MEASURE_MAPPING, identityKey: MEASURE_MAPPING_KEY, 
    migrationKey: MEASURE_MAPPING_MIGRATION__KEY, progressCb: progressCb()
  })
}

const importQuizz = async input_file => {
  return loadRecords(input_file)
    .then(records =>  importData({model: 'quizz', data:records, mapping:QUIZZ_MAPPING, 
      identityKey: QUIZZ_KEY, migrationKey: QUIZZ_MIGRATION_KEY, progressCb: progressCb()}))
}
  
const QUIZZQUESTION_MAPPING={
  migration_id: 'SDQUESTIONID',
  title: ({record}) => record.question,
  success_message: ({record}) => `Bravo! ${record.comments}`,
  error_message: ({record}) => `Dommage! ${record.comments}`,
  type: () => QUIZZ_QUESTION_TYPE_ENUM_SINGLE,
}

const QUIZZQUESTION_KEY='title'
const QUIZZQUESTION_MIGRATION_KEY='migration_id'

const QUIZZQUESTIONORDER_MAPPING={
  migration_id: 'SDQUIZZID',
  questions: ({record, cache}) => record.QUESTIONS.map(id => cache('quizzQuestion', id)),
}

const QUIZZQUESTIONORDER_KEY='migration_id'
const QUIZZQUESTIONORDER_MIGRATION_KEY='migration_id'

const importQuizzQuestions = async input_file => {
  return loadRecords(input_file)
    .then(records => importData({model: 'quizzQuestion', data:records, mapping:QUIZZQUESTION_MAPPING, 
      identityKey: QUIZZQUESTION_KEY, migrationKey: QUIZZQUESTION_MIGRATION_KEY, progressCb: progressCb()})
      .then(() => records)
  )
  // Attach questions to quizz
  .then(records => {
    const quizzQuestions=lodash(records).groupBy('SQQUIZID')
      .mapValues(questions => lodash.map(questions, q => +q.SDQUESTIONID).sort())
      .entries().map(([quizzId, questionIds])=> ({SDQUIZZID: quizzId, QUESTIONS: questionIds}))
    return importData({model: 'quizz', data: quizzQuestions, mapping: QUIZZQUESTIONORDER_MAPPING,
      identityKey: QUIZZQUESTIONORDER_KEY, migrationKey: QUIZZQUESTIONORDER_MIGRATION_KEY, progressCb: progressCb()})
      .then(() => records)
  })
}

const QUIZZANSWER_MAPPING={
  migration_id: 'SDANSWERID',
  quizzQuestion: ({record, cache}) => cache('quizzQuestion', record.SDQUESTIONID),
  text: 'text',
}

const QUIZZANSWER_KEY=['text', 'quizzQuestion']
const QUIZZANSWER_MIGRATION_KEY='migration_id'

const QUIZZQUESTIONANSWER_MAPPING={
  migration_id: 'SDQUESTIONID',
  correct_answer: ({record, cache}) => cache('item', +record.correct_answer),
}

const QUIZZQUESTIONANSWER_KEY='migration_id'
const QUIZZQUESTIONANSWER_MIGRATION_KEY='migration_id'


const importQuizzQuestionAnswer = async (answers_file, questions_file) => {
  return loadRecords(answers_file)
    .then(records => importData({model: 'item', data:records, mapping:QUIZZANSWER_MAPPING, 
          identityKey: QUIZZANSWER_KEY, migrationKey: QUIZZANSWER_MIGRATION_KEY, progressCb: progressCb()}),
    )
    .then(() => loadRecords(questions_file))
    .then(records => importData({model: 'quizzQuestion', data:records, mapping:QUIZZQUESTIONANSWER_MAPPING,
        identityKey: QUIZZQUESTIONANSWER_KEY, migrationKey: QUIZZQUESTIONANSWER_MIGRATION_KEY, progressCb: progressCb()})
          .then(console.log)
)
}

const ORDERS=['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth']

const quizzAnswersCache=new NodeCache()

const getQuestionAnswerId = async (quizzQuestionId, answer) => {
  answer=+answer
  const key=`${quizzQuestionId}/${+answer}`
  let answerId=quizzAnswersCache.get(key)
  if (!answerId) {
    const question=await QuizzQuestion.findById(quizzQuestionId).populate('available_answers')
    const question_migration_id=question.migration_id*QUIZZ_FACTOR+(answer==1 ? 0 : 1)
    answerId=question.available_answers.find(a => a.migration_id==question_migration_id)._id
    quizzAnswersCache.set(key, answerId)
  }
  return answerId
}

const importUserQuizz = async input_file => {
  await Coaching.updateMany({migration_id: {$ne: null}}, {quizz_templates: [], quizz: []}).then(console.log)
  let coaching=null
  let prevKey=null
  return loadRecords(input_file)
    .then(records => runPromisesWithDelay(records.map((record, idx) => async() => {
      const key=`${record.SDPATIENTID}/${record.obtentiondate}`
      const log=idx%500 ? () => {} : console.log
      log(idx, '/', records.length)
      const userId=cache('user', record.SDPATIENTID)
      const quizzId=cache('quizz', record.SDQUIZID)
      if (key!=prevKey) {
        coaching=await Coaching.findOne({user: userId, [CREATED_AT_ATTRIBUTE]: {$lt: moment(record.obtentiondate).add(1, 'day')}})
          .sort({ [CREATED_AT_ATTRIBUTE]: -1 })
          .limit(1)
          .populate('quizz_templates')
          .populate('quizz')
        prevKey=key
      }
      if (!coaching) {
        return Promise.reject(`No coaching for user ${record.SDPATIENTID}/${userId}`)
      }
      // Check if template exists
      const hasTemplate=coaching.quizz_templates.find(q => idEqual(q._id, quizzId))
      if (!hasTemplate) {
        coaching.quizz_templates.push(quizzId)
        const quizz=await Quizz.findById(quizzId).populate({path: 'questions'})
        const cloned=await quizz.cloneAsUserQuizz()
        cloned[CREATED_AT_ATTRIBUTE]=moment(record.obtentiondate)
        await cloned.save()
        coaching.quizz.push(cloned._id)
        await coaching.save()
        return Promise.all(ORDERS.map(async (attribute, index) => {
          const answer=parseInt(record[attribute])
          const quizzQuestion=quizz.questions[index]
          const userQuestion=cloned.questions[index]
          if (!!quizzQuestion && !lodash.isNaN(answer)) {
            const item_id=await getQuestionAnswerId(quizzQuestion._id, answer)
            userQuestion.single_enum_answer=item_id
            return userQuestion.save()
          }
          else {
            return true
          }
        }))
      }
      else {
        return Promise.resolve(true)
      }
    })))
}

const importKeys = async input_file => {
  const contents=fs.readFileSync(input_file)
  return loadRecords(input_file)
    .then(records => importData({model: 'key', data:records, mapping:KEY_MAPPING, 
        identityKey: KEY_KEY, migrationKey: KEY_MIGRATION_KEY, progressCb: progressCb()})
    )
}

const importProgressQuizz = async input_file => {
  return Promise.all([
    loadRecords(input_file), 
    Quizz.findOne({type: QUIZZ_TYPE_PROGRESS}).populate('questions')
  ])
    .then(([records, progressQuizz]) => Promise.allSettled(records.map(record => {
        const question=progressQuizz.questions.find(q => q.title==record.name)
        if (!question) {
          throw new Error(`Missing question:${record.name}`)
        }
        question.migration_id=record.SDCRITERIAID
        setCache('quizzQuestion', record.SDCRITERIAID, question._id)
        return question.save()
          // Update all user quesitons based on this one
          .then(q => UserQuizzQuestion.updateMany({quizz_question: q}, {migration_id: q.migration_id}))
      }))
    )
}

const getCriterionAnswer = async (criterion_id, status) => {

  const STATUS_MAPPING={
    0: COACHING_QUESTION_STATUS_NOT_ADDRESSED,
    1: COACHING_QUESTION_STATUS_NOT_ACQUIRED,
    2: COACHING_QUESTION_STATUS_IN_PROGRESS,
    3: COACHING_QUESTION_STATUS_ACQUIRED,
  }

  const model=`progress_answer`
  const key=`${criterion_id}-${status}`
  let result=cache(model, key)
  if (result) {
    return result
  }
  const quizz=await Quizz.findOne({type: QUIZZ_TYPE_PROGRESS}).populate({path: 'questions', populate: 'available_answers'})
  const answer_id=quizz.questions.find(q => q.migration_id==criterion_id)
    .available_answers.find(a => a.text==COACHING_QUESTION_STATUS[STATUS_MAPPING[status]])._id
  setCache(model, key, answer_id)
  return answer_id
}

const importUserProgressQuizz = async (input_file) => {
  let records=(await loadRecords(input_file))
  records=lodash.groupBy(records, 'CONSULTID')
  console.log(Object.keys(records).length)
  const res=await runPromisesWithDelay(Object.entries(records).map(([consultid, consultRecords], idx) => async () => {
    if (idx%500==0) {
      console.log(idx,'/', Object.keys(records).length)
    }
    const progress=await UserQuizz.findOne({migration_id: consultid}).populate({path: 'questions', select: 'migration_id' })
    if (!progress) {
      return console.error(`No progress found for consultation ${consultid}`)
    }
    return Promise.all(consultRecords.map(async record => {
      const question=progress.questions.find(q => q.migration_id==record.SDCRITERIAID)
      if (!question) {
        return console.error(`No question found for consultation ${consultid} criterion ${record.SDCRITERIAID}`)
      }
      const answer_id=await getCriterionAnswer(record.SDCRITERIAID, record.status)
      return UserQuizzQuestion.findByIdAndUpdate(question._id, {single_enum_answer: answer_id})
    }))
  }))
  console.log(res.filter(r => r.status=='rejected').map(r => r.reason))
  return res
}

const importUserObjectives = async input_file => {
  return loadRecords(input_file)
    .then(records => runPromisesWithDelay(records.map((record, idx) => async () => {
      if (idx%1000==0) {
        console.log(idx, '/', records.length)
      }
      const dt=moment(record.date)
      const userId=cache('user', record.SDPATIENTID)
      if (!userId) {
        throw new Error('no user for', record.SDPATIENTID)
      }
      const appointments=await Appointment.find({user: userId}, {start_date:1}).catch(console.error)
      const nearestAppt=lodash.minBy(appointments, app => Math.abs(dt.diff(app.start_date, 'minute')))
      if (!nearestAppt) {
        throw new Error('no nearest appt for', record.SDPATIENTID)
      }
      let question=await QuizzQuestion.findOne({title: record.objective})
      if (!question) {
        question=await QuizzQuestion.create({title: record.objective, type: QUIZZ_QUESTION_TYPE_ENUM_SINGLE})
      }
      const userQuestion=await question.cloneAsUserQuestion()
      return Appointment.findByIdAndUpdate(nearestAppt._id, {$addToSet: {objectives: question, user_objectives: userQuestion}})
        .then(() => null)
    })))
}

const importUserAssessmentId = async input_file => {
  const records=await loadRecords(input_file)
  return importData({
    model: 'coaching', data:records, mapping:ASSESSMENT_MAPPING, 
    identityKey: ASSESSMENT_KEY, migrationKey: ASSESSMENT_MIGRATION_KEY, progressCb: progressCb()
  })
}

const importUserImpactId = async input_file => {
  const records=await loadRecords(input_file)
  return importData({
    model: 'coaching', data:records, mapping:IMPACT_MAPPING, 
    identityKey: IMPACT_KEY, migrationKey: IMPACT_MIGRATION_KEY, progressCb: progressCb()
  })
}

const importConversations = async input_file => {
  return loadRecords(input_file)
    .then(records => importData({model: 'conversation', data:records, mapping:CONVERSATION_MAPPING, 
      identityKey: CONVERSATION_KEY, migrationKey: CONVERSATION_MIGRATION_KEY, progressCb: progressCb()}))
}

const importMessages = async input_file => {
  return loadRecords(input_file)
    .then(records => importData({model: 'message', data:records, mapping:MESSAGE_MAPPING, 
    identityKey: MESSAGE_KEY, migrationKey: MESSAGE_MIGRATION_KEY, progressCb: progressCb()}))
}

const importSpecs = async input_file => {
  const contents=fs.readFileSync(input_file)
  return Promise.all([guessFileType(contents), guessDelimiter(contents)])
    .then(([format, delimiter]) => extractData(contents, {format, delimiter}))
    .then(({records}) => importData({model: 'target', data:records, mapping:SPEC_MAPPING, 
    identityKey: SPEC_KEY, migrationKey: SPEC_MIGRATION_KEY, progressCb: progressCb()})
  )
}

const importDietSpecs = async input_file => {
  const contents=fs.readFileSync(input_file)
  const records=await loadRecords(input_file)
  return runPromisesWithDelay(records.map(record => async () => {
    const diet_id=cache('user', record.DIETID)
    const target_id=cache('target', record.SPECID)
    if (!diet_id) {
      throw new Error(`No diet id ${record.DIETID}`)
    }
    if (!target_id) {
      throw new Error(`No spec id ${record.SPECID}`)
    }
    return User.findByIdAndUpdate(diet_id, {$addToSet: {objective_targets: target_id}})
  }))
  .then(res =>  {
    const errors=res.filter(r => r.status=='rejected').map(r => r.reason)
    if (!lodash.isEmpty(errors)) {
      throw new Error(errors)
    }
    return res.map(r => r.value)
  })
}

const importPatientHeight = async input_file => {
  return loadRecords(input_file)
    .then(records => importData({model: 'user', data:records, mapping:HEIGHT_MAPPING, 
    identityKey: HEIGHT_KEY, migrationKey: HEIGHT_MIGRATION_KEY, updateOnly: true, progressCb: progressCb()})
  )
}

const importPatientWeight = async input_file => {
  return loadRecords(input_file)
    .then(records => importData({model: 'measure', data:records, mapping:WEIGHT_MAPPING, 
    identityKey: WEIGHT_KEY, migrationKey: WEIGHT_MIGRATION_KEY, progressCb: progressCb()})
  )
}

const importFoodDocuments = async (input_file, mapping_file, documents_directory) => {
  let mapping=(await loadRecords(mapping_file))
    .filter(record => !lodash.isEmpty(record.wapp_name))
    .map(record => [record.smart_name, record.wapp_name])
  mapping = Object.fromEntries(mapping)
  return loadRecords(input_file)
    .then(records => importData({model: 'foodDocument', data:records, mapping:FOOD_DOCUMENT_MAPPING(mapping), 
      identityKey: FOOD_DOCUMENT_KEY, migrationKey: FODD_DOCUMENT_MIGRATION_KEY, progressCb: progressCb(),
      foodDocumentDirectory: documents_directory
    })
  )
}

const importUserFoodDocuments = async input_file => {
  const coachingCache=new NodeCache()
  // Maps SD ID to WAPP coaching id
  const getCoaching = async sdpatientid => {
    let res=coachingCache.get(sdpatientid)
    if (!res) {
      const userId=cache('user', sdpatientid)
      res=(await Coaching.findOne({user: userId}).sort({[CREATED_AT_ATTRIBUTE]: -1}).limit(1))?._id
      coachingCache.set(sdpatientid, res)
    }
    return res
  }
  return loadRecords(input_file)
    .then(records => runPromisesWithDelay(records.map((record, idx) => async () => {
      idx%1000==0 && console.log(idx, '/', records.length)
      const ficheId=cache('foodDocument', record.SDFICHEID)
      const coachingId=await getCoaching(record.SDPATIENTID)
      return Coaching.findByIdAndUpdate(coachingId, {$addToSet: {food_documents: ficheId}})
    })))
}

const importNutAdvices = async input_file => {
  return loadRecords(input_file)
    .then(records => importData({model: 'nutritionAdvice', data:records, mapping:NUTADVICE_MAPPING, 
      identityKey: NUTADVICE_KEY, migrationKey: NUTADVICE_MIGRATION_KEY, progressCb: progressCb()}
    )
  )
}

const filesCache=new NodeCache()

const getDirectoryFiles= directory => {
  let files=filesCache.get(directory)
  if (!files) {
    const fileNames=fs.readdirSync(directory)
    files=Object.fromEntries(fileNames.map(filename => [normalize(filename).replace(/[\s-]/g, '').split('.')[0], filename]))
    filesCache.set(directory, files)
  }
  return files
}

const findFileForDiet = async (directory, firstname, lastname) => {
  const normalizedDietName=normalize([firstname, lastname].join(' ')).replace(/[\s-]/g, '')
  const files=getDirectoryFiles(directory)
  const found=files[normalizedDietName]
  // !!found && console.log('Found file', found, 'for', firstname, lastname)
  return !!found ? path.join(directory, found) : null
}

const getS3FileForDiet = async (directory, firstname, lastname, type) => {
  const fullpath=await findFileForDiet(directory, firstname, lastname)
  if (fullpath) {
    const s3File=await sendFileToAWS(fullpath, type)
      .catch(err => console.error('err on', fullpath))
    // console.log('in S3 got', firstname, lastname, s3File.Location)
    return s3File?.Location
  }
}

const findFileForFoodDocument = async (directory, documentId) => {
  const normalizedDietName=normalize(`fiche${documentId}`)
  const files=getDirectoryFiles(directory)
  const found=files[normalizedDietName]
  // !!found && console.log('Found file', found, 'for', firstname, lastname)
  return !!found ? path.join(directory, found) : null
}

const getS3FileForFoodDocument = async (directory, documentId, type) => {
  const fullpath=await findFileForFoodDocument(directory, documentId)
  if (fullpath) {
    const s3File=await sendFileToAWS(fullpath, type)
      .catch(err => console.error('err on', fullpath))
    // console.log('in S3 got', firstname, lastname, s3File.Location)
    return s3File?.Location
  }
}

const importNetworks = async input_file => {
  return loadRecords(input_file)
    .then(records => importData({model: 'network', data:records, mapping: NETWORK_MAPPING, 
      identityKey: NETWORK_KEY, migrationKey: NETWORK_MIGRATION_KEY, progressCb: progressCb()}
    )
  )
}

const importDietNetworks = async input_file => {
  let notfound=0
  return loadRecords(input_file)
    .then(records => runPromisesWithDelay(records.map(record => async () => {
      const dietId=cache('user', record.SDDIETID)
      const networkId=cache('network', record.SDNETWORKID)
      !dietId && notfound++
      return User.findByIdAndUpdate(dietId, {$addToSet: {networks: networkId}})
    }))
    .then(() => console.log(notfound))
  )
}

const importDiploma = async (input_file, diploma_directory) => {
  return loadRecords(input_file)
    .then(records => importData({model: 'diploma', data:records, mapping: DIPLOMA_MAPPING, 
      identityKey: DIPLOMA_KEY, migrationKey: DIPLOMA_MIGRATION_KEY, progressCb: progressCb(), diplomaDirectory: diploma_directory}
    )
    .then(console.log)
  )
}

const importOtherDiploma = async (input_file) => {
  let records=await loadRecords(input_file)
  records=records.filter(r => !!r.othergrade)
  return importData({
    model: 'diploma', data:records, mapping: OTHER_DIPLOMA_MAPPING, 
    identityKey: OTHER_DIPLOMA_KEY, migrationKey: OTHER_DIPLOMA_MIGRATION_KEY, progressCb: progressCb()
  })
}

const FOODPROGRAM_MAPPING={
  migration_id: 'SDPROGRAMID',
  food_program: async ({record, programsDirectory}) => {
    const fullpath=path.join(programsDirectory, record.foodprogram)
    console.log(`Sending`, fullpath)
    const s3File=await sendFileToAWS(fullpath, 'foodprogram')
    console.log(`Sent`, fullpath)
    return s3File?.Location
  },
}

const FOODPROGRAM_KEY='migration_id'
const FOODPROGRAM_MIGRATION_KEY='migration_id'

const importFoodPrograms = async (input_file, programs_directory) => {
  return loadRecords(input_file)
  .then(records => importData({model: 'coaching', data:records, mapping: FOODPROGRAM_MAPPING, 
    identityKey: FOODPROGRAM_KEY, migrationKey: FOODPROGRAM_MIGRATION_KEY, progressCb: progressCb(), programsDirectory: programs_directory})
  )
}

const TELEOP_MAPPING={
  role: () => ROLE_EXTERNAL_DIET,
  password: () => DEFAULT_PASSWORD,
  firstname: 'username',
  lastname: 'username',
  email: 'email',
  diet_calls_enabled: () => true,
  registration_status: () => DIET_REGISTRATION_STATUS_ACTIVE,
  source: () => 'import',
  migration_id: 'OPERATORID',
}

const TELEOP_KEY='email'
const TELEOP_MIGRATION_KEY='migration_id'

const importOperators = async (input_file) => {
  let records=await loadRecords(input_file)
  return importData({
    model: 'user', data:records, mapping:TELEOP_MAPPING, identityKey: TELEOP_KEY, 
    migrationKey: TELEOP_MIGRATION_KEY, progressCb: progressCb()
  })
}

const VALID_HEALTH=1
const VALID_DIET=2
const VALID_POINTS=3
const VALID_OTHER=4

const VALIDATION_REASON={
  [VALID_HEALTH] : 'Santé',
  [VALID_DIET] : 'Diet',
  [VALID_POINTS] : 'Système de points',
  [VALID_OTHER] : 'Autre'
}

const REFUSE_NO_NEED=1
const REFUSE_ALREADY_PATIENT=2
const REFUSE_OUT_TARGET=3
const REFUSE_NOTIME=4
const REFUSE_OTHER=6

const REFUSE_REASON={
  [REFUSE_NO_NEED]:`Pas besoin`,
  [REFUSE_ALREADY_PATIENT]:`Déjà suivi`,
  [REFUSE_OUT_TARGET]:`Hors cible`,
  [REFUSE_NOTIME]:`Pas le temps`,
  [REFUSE_OTHER]:`Autres`,
}

const CALL_STATUS_MAPPING={
  0: CALL_STATUS_TO_CALL,
  1: CALL_STATUS_CALL_1,
  2: CALL_STATUS_CALL_2,
  4 : CALL_STATUS_UNREACHABLE,
  5: CALL_STATUS_RECALL,
  6: CALL_STATUS_CONVERTI_CN,
  7: CALL_STATUS_CONVERTI_COA_CN,
  8: CALL_STATUS_NOT_INTERESTED,
  9: CALL_STATUS_WRONG_NUMBER,
}

const INTEREST_SPORT=1
const INTEREST_STRESS=2
const INTEREST_TABAC=3
const INTEREST_SOMMEIL=4
const INTEREST_MCV=5

const INTEREST={
  [INTEREST_SPORT]:`Sport`,
  [INTEREST_STRESS]:`Stress`,
  [INTEREST_TABAC]:`Tabac`,
  [INTEREST_SOMMEIL]:`Sommeil`,
  [INTEREST_MCV]:`MCV`,
}

const JOB_ADMINISTRATIF=1
const JOB_CONDUCTEUR_MOYENNE_DISTANCE=2
const JOB_CONDUCTEUR_LONGUE_DISTANCE=3
const JOB_MANUT=4
const JOB_CFA=5
const JOB_AUTRE=6
const JOB_LONGUE_MALADIE=7
const JOB_AGENT_IMMO=8
const JOB_ADMIN_DE_BIENS=9
const JOB_SYNDIC=10
const JOB_SALARIE_TOURISME=11
const JOB_SALARIE_FONCIER=12
const JOB_RETRAITE=13
const JOB_ACTIF=14
// Hors cible if job is 8 and branch=0
const JOB_HORS_CIBLE=100

const LEAD_JOB={
  [JOB_ADMINISTRATIF]:`Administratif`,
  [JOB_CONDUCTEUR_MOYENNE_DISTANCE]:`Conducteur moyenne distance`,
  [JOB_CONDUCTEUR_LONGUE_DISTANCE]:`Conducteur longue distance`,
  [JOB_MANUT]:`Manutention/logistique/déménagement`,
  [JOB_CFA]:`CFA`,
  [JOB_AUTRE]:`Autre`,
  [JOB_LONGUE_MALADIE]:`Longue maladie`,
  [JOB_AGENT_IMMO]:`Agent immo`,
  [JOB_ADMIN_DE_BIENS]:`Admin de biens`,
  [JOB_SYNDIC]:`Syndic de copropriété`,
  [JOB_SALARIE_TOURISME]:`Salarié en résidence de tourisme`,
  [JOB_SALARIE_FONCIER]:`Salarié sociétés immo et foncières`,
  [JOB_RETRAITE]:`Retraité`,
  [JOB_ACTIF]:`Actif`,
  [JOB_HORS_CIBLE]:`Hors cible`,
}

const SOURCE_FICHIER_DE_BASE=0
const SOURCE_FORMULAIRE_DE_CONTACT=1
const SOURCE_APPEL_ENTRANT=2
const SOURCE_STAND=3
const SOURCE_INTERVENTION=4
const SOURCE_PARTENAIRE=5
const SOURCE_FICHIERS_SPECIFIQUES=6

const SOURCE={
  [SOURCE_FICHIER_DE_BASE]:`Fichier de base (Mensuel)`,
  [SOURCE_FORMULAIRE_DE_CONTACT]:`Formulaire de Contact`,
  [SOURCE_APPEL_ENTRANT]:`Appel Entrant (ne provient donc pas d'un fichier)`,
  [SOURCE_STAND]:`Stand`,
  [SOURCE_INTERVENTION]:`Intervention`,
  [SOURCE_PARTENAIRE]:`Partenaire (ex: medialane)`,
  [SOURCE_FICHIERS_SPECIFIQUES]:`Fichiers Spécifiques`,
}

const COMPANY_ECR=0
const COMPANY_IMMO=1

const COMPANY={
  [COMPANY_ECR]: 'TVBNUT',
  [COMPANY_IMMO]: 'IPNUT',
}

const LEAD_MAPPING={
  firstname: 'firstname',
  lastname: 'lastname',
  createdAt: 'created',
  email: ({record}) => record.email?.trim(),
  join_reason: ({record, cache}) => cache('joinReason', record.validationreason),
  decline_reason: ({record, cache}) => cache('declineReason', record.rejectreason),
  interested_in: ({record, cache}) => {
    const interest=cache('interest', record.medialaneprogramtype)
    return interest ? [interest]: []
  },
  operator: ({record, cache}) => cache('user', record.SDOPERATORID),
  job: ({record, cache}) => {
    let jobId=(+record.carceptjob)==8 && (+record.branch)==0 ? JOB_HORS_CIBLE : record.carceptjob
    return cache('job', jobId)
  },
  comment: 'comments',
  call_status: ({record}) => CALL_STATUS_MAPPING[record.status],
  call_direction: () => CALL_DIRECTION_OUT_CALL,
  phone: 'tel',
  company_code: ({record}) => COMPANY[+record.branch],
  source: ({record}) => SOURCE[record.listtype],
  migration_id: 'SDPROSPECTID',
}

const importLeads = async (input_file) => {
  const NAME_MAPPING={
    name: 'name',
    migration_id: 'migration_id',
  }

  // Ensure accept/decline reasons, interests, jobs
  const joinData=Object.entries(VALIDATION_REASON).map(([migration_id, name]) => ({name, migration_id: parseInt(migration_id)}))
  await importData({model: 'joinReason', data: joinData, mapping: NAME_MAPPING, identityKey: 'name', migrationKey: 'migration_id'})

  const refuseData=Object.entries(REFUSE_REASON).map(([migration_id, name]) => ({name, migration_id: parseInt(migration_id)}))
  await importData({model: 'declineReason', data: refuseData, mapping: NAME_MAPPING, identityKey: 'name', migrationKey: 'migration_id'})

  const interestData=Object.entries(INTEREST).map(([migration_id, name]) => ({name, migration_id: parseInt(migration_id)}))
  await importData({model: 'interest', data: interestData, mapping: NAME_MAPPING, identityKey: 'name', migrationKey: 'migration_id'})

  const jobData=Object.entries(LEAD_JOB).map(([migration_id, name]) => ({name, migration_id: parseInt(migration_id)}))
  await importData({model: 'job', data: jobData, mapping: NAME_MAPPING, identityKey: 'name', migrationKey: 'migration_id'})

  const records=await loadRecords(input_file)
  
  return importData({
    model: 'lead', data: records, mapping: LEAD_MAPPING, identityKey: 'email',
    migrationKey: 'migration_id', progressCb: progressCb(500),
  })
}

const C1_PROSPECT_ID_BASE=1000000

const computeProspectC1Id = id => {
  if (isNaN(parseInt(id))) {
    throw new Error(`Invalid ID ${id}`)
  }
  return C1_PROSPECT_ID_BASE+parseInt(id)
}

const PROSPECT_C1_MAPPING= {
  // role: () => ROLE_CUSTOMER,
  dataTreatmentAccepted: () => true,
  cguAccepted: () => true,
  email: ({record}) => record.email?.trim() || `${record.SDPROSPECTID}@prospect.com`,
  firstname: 'firstname',
  lastname: 'lastname',
  pseudo: ({record}) => computePseudo(record),
  company: ({record}) => record.company?._id,
  phone: 'tel',
  password: () => DEFAULT_PASSWORD,
  migration_id: ({record}) => computeProspectC1Id(record.SDPROSPECTID),
}

const PROSPECT_C1_COACHING_MAPPING = {
  user: ({record, cache}) => cache('user', computeProspectC1Id(record.SDPROSPECTID)),
  offer: async ({cache, record}) => {
    const user=await User.findById(cache('user', computeProspectC1Id(record.SDPROSPECTID)))
    return getUserOffer(user, record.orderdate)?._id
  },
  assessment_quizz: async ({cache, record}) => {
    const user=await User.findById(cache('user', computeProspectC1Id(record.SDPROSPECTID)))
    const offer=await getUserOffer(user, record.orderdate)
    return offer.assessment_quizz.cloneAsUserQuizz()
  },
  impact_quizz: async ({cache, record}) => {
    const user=await User.findById(cache('user', computeProspectC1Id(record.SDPROSPECTID)))
    const offer=await getUserOffer(user, record.orderdate)
    return offer.assessment_quizz?.cloneAsUserQuizz()
  },
  diet: ({record, cache}) => cache('user', record.SDDIETID),
  migration_id: ({record}) => computeProspectC1Id(record.SDPROSPECTID),
}

const PROSPECT_C1_APPOINTMENT_MAPPING = progress_quizz => ({
  coaching: ({record, cache}) => cache('coaching', computeProspectC1Id(record.SDPROSPECTID)),
  diet: ({record, cache}) => cache('user', record.SDDIETID),
  user: ({record, cache}) => cache('user', computeProspectC1Id(record.SDPROSPECTID)),
  appointment_type: ({record, cache}) =>record.company?.assessment_appointment_type?._id,
  start_date: 'rendezvous',
  end_date: ({record}) => moment(record.rendezvous).add(record.company.assessment_appointment_type.duration, 'minutes'),
  progress: async () => {
    const copy=await progress_quizz.cloneAsUserQuizz()
    return copy._id
  },
  migration_id: ({record}) => computeProspectC1Id(record.SDPROSPECTID),
})

const getProspectPatientUserId = record => {
  return cache('user', record.SDPATIENTID)
}

const PROSPECT_PATIENT_C1_COACHING_MAPPING = {
  user: async ({record}) => getProspectPatientUserId(record),
  offer: async ({record}) => {
    const user=await User.findById(getProspectPatientUserId(record))
    if (!user) {
      console.warn(record.SDPROSPECTID, 'No user with SDPATIENTID', record.SDPATIENTID)
    }
    return getUserOffer(user, record.orderdate)?._id
  },
  assessment_quizz: async ({record}) => {
    const user=await User.findById(getProspectPatientUserId(record))
    if (!user) {
      console.warn(record.SDPROSPECTID, 'No user with SDPATIENTID', record.SDPATIENTID)
    }
    const offer=await getUserOffer(user, record.rendezvous)
    if (!offer) {
      console.warn(record.SDPROSPECTID, 'No offer for patient', record.SDPATIENTID)
    }
    if (!offer.assessment_quizz) {
      console.error('No ass quizz for offer', offer)
    }
    return offer.assessment_quizz.cloneAsUserQuizz()
  },
  impact_quizz: async ({record}) => {
    const user=await User.findById(getProspectPatientUserId(record))
    if (!user) {
      console.warn(record.SDPROSPECTID, 'No user with SDPATIENTID', record.SDPATIENTID)
    }
    const offer=await getUserOffer(user, record.rendezvous)
    return offer.assessment_quizz?.cloneAsUserQuizz()
  },
  diet: ({record, cache}) => cache('user', record.SDDIETID),
  migration_id: ({record}) => getProspectPatientUserId(record),
}

const PROSPECT_PATIENT_C1_APPOINTMENT_MAPPING = progress_quizz => ({
  coaching: ({record, cache}) => cache('coaching', computeProspectC1Id(record.SDPROSPECTID)),
  diet: ({record, cache}) => cache('user', record.SDDIETID),
  user: ({record}) => getProspectPatientUserId(record),
  appointment_type: ({record}) =>record.company?.assessment_appointment_type?._id,
  start_date: 'rendezvous',
  end_date: ({record}) => moment(record.rendezvous).add(record.company.assessment_appointment_type.duration, 'minutes'),
  progress: async () => {
    const copy=await progress_quizz.cloneAsUserQuizz()
    return copy._id
  },
  migration_id: ({record}) => getProspectPatientUserId(record),
})

const importProspectsC1 = async (input_file) => {
  const records=await loadRecords(input_file)
  const companies=await Company.find({}, {code:1}).populate('assessment_appointment_type')
  const progressQuizz=await Quizz.findOne({type: QUIZZ_TYPE_PROGRESS}).populate('questions')

  const prospectsC1=records
    .filter(r => !r.SDPATIENTID?.trim())
    .filter(r => !!r.rendezvous?.trim())
    .filter(r => parseInt(r.status)==7) // COACHING
    .filter(r => !!r.SDDIETID?.trim())
    .map(r => {
      const company_code=COMPANY[r.branch]
      const company=companies.find(c => c.code==company_code)
      return {...r, company}
    })

  await importData({
    model: 'user', data: prospectsC1, mapping: PROSPECT_C1_MAPPING, 
    identityKey: 'email', migrationKey: 'migration_id',
  })

  await importData({
    model: 'coaching', data: prospectsC1, mapping: PROSPECT_C1_COACHING_MAPPING,
    identityKey: 'migration_id', migrationKey: 'migration_id',
  })

  await importData({
    model: 'appointment', data: prospectsC1, mapping: PROSPECT_C1_APPOINTMENT_MAPPING(progressQuizz),
    identityKey: 'migration_id', migrationKey: 'migration_id',
  })
}

const importPatientsNoCoachingC1 = async (input_file) => {
  const records=await loadRecords(input_file)
  const companies=await Company.find({}, {code:1}).populate('assessment_appointment_type')
  const progressQuizz=await Quizz.findOne({type: QUIZZ_TYPE_PROGRESS}).populate('questions')

  const emailsWithCoachings=(await Coaching.find().populate('user')).map(c => c.user.email)

  const prospectsC1=records
    .filter(r => !!r.SDPATIENTID?.trim())
    .filter(r => !!r.rendezvous?.trim())
    .filter(r => parseInt(r.status)==7) // COACHING
    .filter(r => !!r.SDDIETID?.trim())
    .filter(r => !emailsWithCoachings.includes(r.email))
    .map(r => {
      const company_code=COMPANY[r.branch]
      const company=companies.find(c => c.code==company_code)
      return {...r, company}
    })
  
  console.log('Candidates are', prospectsC1.map(p => [p.SDPATIENTID, p.email]))

  await importData({
    model: 'coaching', data: prospectsC1, mapping: PROSPECT_PATIENT_C1_COACHING_MAPPING,
    identityKey: 'migration_id', migrationKey: 'migration_id',
  })

  await importData({
    model: 'appointment', data: prospectsC1, mapping: PROSPECT_PATIENT_C1_APPOINTMENT_MAPPING(progressQuizz),
    identityKey: 'migration_id', migrationKey: 'migration_id',
  })
}

module.exports={
  loadRecords, saveRecords,
  importCompanies,
  importOffers,
  importPatients,
  importDiets,
  importCoachings,
  importAppointments,
  importMeasures,
  fixFiles,
  importQuizz,
  importQuizzQuestions,
  importQuizzQuestionAnswer,
  importUserQuizz,
  importKeys,
  importProgressQuizz,
  importUserProgressQuizz,
  importUserObjectives,
  importUserAssessmentId,
  importUserImpactId,
  importConversations,
  importMessages,
  updateImportedCoachingStatus,
  updateDietCompanies,
  importSpecs, importDietSpecs, importPatientHeight, importPatientWeight,
  importFoodDocuments,
  importUserFoodDocuments,
  importNutAdvices,
  importNetworks, importDietNetworks, importDiploma,
  importOtherDiploma,
  generateMessages,
  fixFoodDocuments,
  generateQuizz,
  importFoodPrograms,
  importLeads,
  importOperators,
  importProspectsC1,
  importPatientsNoCoachingC1,
}



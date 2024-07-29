const mongoose = require('mongoose')
const moment = require('moment')
const lodash = require('lodash')
const path = require('path')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { forceDataModelSmartdiet } = require('../utils')
forceDataModelSmartdiet()
const User = require('../../server/models/User')
const Quizz = require('../../server/models/Quizz')
require('../../server/models/QuizzQuestion')
const Company = require('../../server/models/Company')
require('../../server/models/Content')
require('../../server/models/Comment')
const Appointment=require('../../server/models/Appointment')
const { 
  ROLE_EXTERNAL_DIET, ROLE_CUSTOMER, GENDER_MALE, QUIZZ_TYPE_PROGRESS, DIET_REGISTRATION_STATUS_ACTIVE, COACHING_STATUS_NOT_STARTED, 
} = require('../../server/plugins/smartdiet/consts')
const bcrypt = require('bcryptjs')
const Coaching = require('../../server/models/Coaching')
const { importDiets, importCoachings, importAppointments, importCompanies, importMeasures, fixFiles, importQuizz, importQuizzQuestions, importQuizzQuestionAnswer, importUserQuizz, importKeys, importProgressQuizz, importUserProgressQuizz, importOffers, importUserObjectives, importUserAssessmentId, importUserImpactId, importConversations, importMessages, updateImportedCoachingStatus, updateDietCompanies, importSpecs, importDietSpecs, importPatients, importPatientHeight, generateProgress, fixAppointments, importFoodDocuments, importUserFoodDocuments, importNutAdvices, importNetworks, importDietNetworks, importDiploma, importOtherDiploma, importPatientWeight,loadRecords, generateQuizz, importFoodPrograms, fixFoodDocuments } = require('../../server/plugins/smartdiet/import')
const { getCacheKeys, displayCache, loadCache, saveCache } = require('../../utils/import')
const Measure = require('../../server/models/Measure')
const QuizzQuestion = require('../../server/models/QuizzQuestion')
const Key = require('../../server/models/Key')
const Offer = require('../../server/models/Offer')
const { isDevelopment } = require('../../config/config')
const { CREATED_AT_ATTRIBUTE } = require('../../utils/consts')
const { updateCoachingStatus } = require('../../server/plugins/smartdiet/coaching')
const { runPromisesWithDelay } = require('../../server/utils/concurrency')
const UserQuizz = require('../../server/models/UserQuizz')
const Item = require('../../server/models/Item')
require('../../server/models/Item')

const ORIGINAL_DB=true
const DBNAME=ORIGINAL_DB ? 'smartdiet' : `test${moment().unix()}`
const DROP=!ORIGINAL_DB

// const ROOT = path.join(__dirname, './data/migration-tiny')
const ROOT = path.join(__dirname, './data/migration')
// const ROOT = path.join(__dirname, './data/migration-aye-26358')

jest.setTimeout(60000000)

const forcePasswords = () => {
  if (isDevelopment()) {
    const password=bcrypt.hashSync('Password1;')
    return User.updateMany({}, {$set: {password}})
  }
}

const PATIENT_EMAIL = 'lonza85@live.fr'
const DIET_EMAIL = 'raphaelleh.smartdiet@gmail.com'
const QUIZZ_NAME = 'Saisons'
const QUIZZ_ID = 17
describe('Test imports', () => {

  beforeAll(async () => {
    console.log('Before opening database', DBNAME)
    await mongoose.connect(`mongodb://localhost/${DBNAME}`, MONGOOSE_OPTIONS)
    console.log('Opened database', DBNAME)
    await loadCache()
    await fixFiles(ROOT)
  })

  afterEach(async () => {
    return saveCache()
  })

  afterAll(async () => {
    await updateImportedCoachingStatus()
    await updateDietCompanies()
    await saveCache()
    if (DROP) {
      await mongoose.connection.dropDatabase()
    }
    await mongoose.connection.close()
  })

  it('must import companies', async () => {
    await importCompanies(path.join(ROOT, 'smart_project.csv'))
    const companies=await Company.find()
    expect(companies.length).toEqual(15)
  })

  it('must import patients', async () => {
    const res = await importPatients(path.join(ROOT, 'smart_patient.csv')).catch(console.error)
    await forcePasswords()
    const users=await User.find({source: 'import'})
    expect(users.filter(u => !lodash.isEmpty(u.phone)).length).toBeGreaterThan(8000)
    expect(users.filter(u => !lodash.isEmpty(u.diet_comment)).length).toBeGreaterThan(5000)
    const user=users.find(u => u.role==ROLE_CUSTOMER && u.email==PATIENT_EMAIL)
    expect(user).toBeTruthy()
    expect(user.gender).toEqual(GENDER_MALE)
    expect(moment(user.birthday).format('LL')).toBe(moment('1980-11-13').format('LL'))
  })

  it('must import patients heights', async () => {
    await importPatientHeight(path.join(ROOT, 'smart_summary.csv')).catch(console.error)
  })

  it('must import patients first weights', async () => {
    return importPatientWeight(path.join(ROOT, 'smart_summary.csv')).catch(console.error)
  })

  it('must import one offer per imported company', async () => {
    const res = await importOffers(path.join(ROOT, 'smart_coaching.csv'))
    const offersCount=await Offer.countDocuments({migration_id: {$ne:null}})
    const migratedCompanyCount=await Company.countDocuments({migration_id: {$ne: null}})
    expect(offersCount).toEqual(migratedCompanyCount)
  })

  it('must import diets', async () => {
    let res = await importDiets(
      path.join(ROOT, 'smart_diets.csv'), 
      path.join(ROOT, 'pictures', 'diets', 'dietpics'),
      path.join(ROOT, 'pictures', 'diets', 'dietribs'),
    )
    await forcePasswords()
    const diets=await User.find({role: ROLE_EXTERNAL_DIET})
    expect(diets.filter(d => !!d.phone).length).toBeGreaterThan(diets.length/2)
    expect(diets.filter(d => !!d.adeli).length).toBeGreaterThan(diets.length/4)
    expect(diets.filter(d => !!d.siret).length).toBeGreaterThan(diets.length/4)
    expect(diets.filter(d => !!d.city).length).toBeGreaterThan(diets.length/2)
    expect(diets.filter(d => !!d.birthday).length).toBeGreaterThan(diets.length/2)
    expect(diets.filter(d => !!d[CREATED_AT_ATTRIBUTE]).length).toBeGreaterThan(diets.length/2)
    expect(diets.filter(d => d.registration_status==DIET_REGISTRATION_STATUS_ACTIVE).length).toBeGreaterThan(diets.length/10)
    expect(diets.filter(d => !!d.diet_visio_enabled).length).toBeGreaterThan(200)
    expect(diets.filter(d => !!d.diet_coaching_enabled).length).toBeGreaterThan(10)
    expect(diets.filter(d => !!d.diet_site_enabled).length).toBeGreaterThan(200)
    const dietsTest=await User.find({role:ROLE_EXTERNAL_DIET, lastname: /bertrand/i, firstname: /charlotte/i})
    expect(dietsTest).toHaveLength(1)
    expect(dietsTest[0].registration_status).toEqual(DIET_REGISTRATION_STATUS_ACTIVE)
  })

  it('must upsert coachings', async () => {
    let res = await importCoachings(path.join(ROOT, 'smart_coaching.csv'))
    const user=await User.findOne({email: PATIENT_EMAIL})
    const coachings=await Coaching.find({user}).populate('progress')
    expect(coachings).toHaveLength(1)
    expect(coachings[0].progress).toBeTruthy()
    expect(coachings[0].progress.type).toEqual(QUIZZ_TYPE_PROGRESS)
  })

  it('must upsert appointments', async () => {
    await importAppointments(path.join(ROOT, 'wapp_consultation.csv'))
    const user=await User.findOne({email: PATIENT_EMAIL})
    const coachings=await Coaching.find({user})
    const appts=await Appointment.find({coaching: coachings})
    expect(appts).toHaveLength(2)
    expect(appts.some(a => /pas regardé ce que/.test(a.note))).toBeTruthy()
  })

  it('must upsert measures', async () => {
    let res = await importMeasures(path.join(ROOT, 'smart_measure.csv'))
    const user=await User.findOne({email: PATIENT_EMAIL})
    const measures=await Measure.find({user})
    expect(measures.length).toEqual(2)
    console.log(measures)
  })

  it('must upsert quizz', async () => {
    const before=await Quizz.countDocuments()
    let res = await importQuizz(path.join(ROOT, 'wapp_quiz.csv'))
    const quizz=await Quizz.findOne({migration_id: QUIZZ_ID})
    expect(quizz.name).toEqual(QUIZZ_NAME)
  })

  it('must import quizz questions', async () => {
    let res = await importQuizzQuestions(path.join(ROOT, 'wapp_questions.csv'))
    const questions=await QuizzQuestion.find({migration_id: {$ne:null}})
    expect(questions.length).toEqual(243)
    const quizz=await Quizz.findOne({name: QUIZZ_NAME}).populate('questions')
    expect(quizz.questions.length).toEqual(8)
  })

  it('must upsert quizz questions answers', async () => {
    let res = await importQuizzQuestionAnswer(path.join(ROOT, 'wapp_answers.csv'), path.join(ROOT, 'wapp_questions.csv'))
    const migratedItems=await Item.find({migration_id: {$ne:null}})
    expect(migratedItems.length).not.toBeLessThan(436)
  })

  it('must upsert keys', async () => {
    let res = await importKeys(path.join(ROOT, 'smart_criteria.csv'))
    const keys=await Key.find({migration_id: {$ne: null}})
    expect(keys.length).toEqual(7)
  })

  it('must upsert progress quizz', async () => {
    let res = await importProgressQuizz(path.join(ROOT, 'smart_criteria.csv'))
    const quizz=await Quizz.findOne({type: QUIZZ_TYPE_PROGRESS}).populate('questions')
    expect(quizz.questions.every(q => !!q.migration_id)).toBeTruthy
  })

  it('must attach progress quizz to its coaching', async () => {
    const quizzs=await UserQuizz.find({type: QUIZZ_TYPE_PROGRESS})
    let found=0
    await runPromisesWithDelay(quizzs.map((q, idx) => async () => {
      idx%500==0 && console.log(idx, '/', quizzs.length)
      coaching=await Coaching.findOne({progress: q._id}, {_id:1})
      if (!!coaching  && !q.coaching) {
        found+=1
        console.log('add')
        q.coaching=coaching ._id
        await q.save()
      }
      if (!coaching  && !!q.coaching) {
        console.log('remove')
        await q.delete()
      }
    }))
    console.log('found', found, '/', quizzs.length)
  })

  it('must upsert user progress quizz', async () => {
    return importUserProgressQuizz(path.join(ROOT, 'wapp_progress.csv'))
  })

  it('must upsert patients quizzs', async () => {
    await importUserQuizz(path.join(ROOT, 'smart_patient_quiz.csv'))
    const user=await User.findOne({email: 'lylycordo@laposte.net'})
      .populate({path: 'coachings', populate: {path: 'quizz', populate: {path: 'questions', populate: ['quizz_question', 'single_enum_answer']}}})
    const quizz=lodash(user.coachings).map(c => c.quizz).flatten().find(q => q.name=='Fréquences alimentaires')
    expect(quizz).toBeTruthy()
    const imported=[...quizz.questions.map(q => q.single_enum_answer.text)]
    const EXPECTED=['Vrai','Vrai','Faux','Faux','Vrai', 'Faux','Faux','Faux']
    expect(imported).toEqual(EXPECTED)
  })

  it('must upsert patients objectives', async () => {
    return await importUserObjectives(path.join(ROOT, 'smart_objective.csv'))
  })

  it('must upsert patients assessment and impact ids', async () => {
    await importUserAssessmentId(path.join(ROOT, 'smart_summary_reference.csv'))
    await importUserImpactId(path.join(ROOT, 'smart_second_summary_reference.csv'))
    return
  })

  it('must upsert conversation', async () => {
    await importConversations(path.join(ROOT, 'wapp_conversations.csv'))
    await importMessages(path.join(ROOT, 'wapp_messages.csv'))
    return
  })

  it('must upsert specs', async () => {
    return importSpecs(path.join(ROOT, 'smart_spec.csv'))
  })

  it('must upsert diet specs', async () => {
    return importDietSpecs(path.join(ROOT, 'smart_diets_specs.csv'))
  })

  it('must upsert food documents', async () => {
    await fixFoodDocuments(ROOT)
    return importFoodDocuments(
      path.join(ROOT, 'smart_fiche.csv'), 
      path.join(ROOT, 'mapping_fiche.csv'),
      path.join(ROOT, 'fiches')
    )
  })

  it('must upsert user food documents', async () => {
    return importUserFoodDocuments(path.join(ROOT, 'smart_patient_fiches.csv'))
  })

  it('must upsert user food programs', async () => {
    return importFoodPrograms(path.join(ROOT, 'wapp_foodprograms.csv'), path.join(ROOT, 'foodprograms'))
  })

  it('must upsert nut advices', async () => {
    return importNutAdvices(path.join(ROOT, 'smart_nutadvice.csv'))
  })

  it('must import networks', async () => {
    return importNetworks(path.join(ROOT, 'smart_networks.csv'))
  })

  it('must import diet networks', async () => {
    return importDietNetworks(path.join(ROOT, 'smart_diets_networks.csv'))
  })

  it('must upsert diploma', async () => {
    return importDiploma(
      path.join(ROOT, 'smart_diets.csv'), 
      path.join(ROOT, 'pictures', 'diets', 'dietdiplomes')
    )
  })

  it('must upsert other diploma', async () => {
    return importOtherDiploma(path.join(ROOT, 'smart_diets.csv'))
  })

})


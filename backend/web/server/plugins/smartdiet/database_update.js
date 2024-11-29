const lodash=require('lodash')
const mongoose=require('mongoose')
const moment=require('moment')
const { PHONE_REGEX, isPhoneOk, formatPhone, ALL_PHONES } = require("../../../utils/sms")
const User = require("../../models/User")
const Lead = require("../../models/Lead")
const { QUIZZ_TYPE_ASSESSMENT, PARTICULAR_COMPANY_NAME, COACHING_STATUS_NOT_STARTED, QUIZZ_TYPE_PROGRESS } = require('./consts')
const Appointment = require('../../models/Appointment')
const AppointmentType = require('../../models/AppointmentType')
const Company = require('../../models/Company')
const CoachingLogbook = require('../../models/CoachingLogbook')
const Coaching = require('../../models/Coaching')
const Message = require('../../models/Message')
const Conversation = require('../../models/Conversation')
const NutritionAdvice = require('../../models/NutritionAdvice')
const { idEqual } = require('../../utils/database')
const Offer = require('../../models/Offer')
const Quizz = require('../../models/Quizz')
const { updateApptsOrder } = require('./coaching')
const { runPromisesWithDelay } = require('../../utils/concurrency')
const NodeCache = require('node-cache')
const { copyProgressAnswers } = require('./quizz')
const { UPDATED_AT_ATTRIBUTE } = require('../../../utils/consts')

const log = (...params) => {
  return console.log('DB Update', ...params)
}

const error = (...params) => {
  return console.error('DB Update', ...params)
}

const normalizePhones = async () => {

  log('normalizing phone numbers')
  const normalizePhone = user => {
    const changedPhone=formatPhone(user.phone)
    if (!isPhoneOk(changedPhone, true)) {
      return null
    }
    if (changedPhone!=user.phone) {
      return { 
        updateOne: {
          filter: {_id: user._id},
          update: {$set: {phone: changedPhone}}
        }
      }
    }
  }

  const PHONE_FILTER = { phone: { $regex: /./, $not: ALL_PHONES} }
  // Normalize user phones
  const users=await User.find(PHONE_FILTER)
  const userUpdates=users.map(u => normalizePhone(u)).filter(Boolean)
  await User.bulkWrite(userUpdates).then(res => log(`Updated users phones ${users.length}:${JSON.stringify(res)}`))

  // Normalize leads phones
  const leads=await Lead.find(PHONE_FILTER)
  const leadUpdates=leads.map(u => normalizePhone(u)).filter(Boolean)
  await Lead.bulkWrite(leadUpdates).then(res => log(`Updated leads phones ${leads.length}:${JSON.stringify(res)}`))
}

const renameHealthQuizzTypes = async () => {
  log('Quizz HEALTH => ASSESSMENT')
  /** Rename quizzs types HEALTH to ASSESSMENT */
  await mongoose.connection.collection('quizzs')
  .updateMany({type: 'QUIZZ_TYPE_HEALTH'}, {$set: {type: QUIZZ_TYPE_ASSESSMENT}})
    .then(({matchedCount, modifiedCount}) => log(`quizz type HEALTH=>ASSESSMENT modified`, modifiedCount, '/', matchedCount))
    .catch(err => error(`quizz type HEALTH=>ASSESSMENT`, err))

  /** Rename userquizzs types HEALTH to ASSESSMENT */
  await mongoose.connection.collection('userquizzs')
    .updateMany({type: 'QUIZZ_TYPE_HEALTH'}, {$set: {type: QUIZZ_TYPE_ASSESSMENT}})
    .then(({matchedCount, modifiedCount}) => log(`userquizz type HEALTH=>ASSESSMENT modified`, modifiedCount, '/', matchedCount))
    .catch(err => error(`userquizz type HEALTH=>ASSESSMENT`, err))
}

const setAppointmentsDietAndUser = async () => {
  // Set user & diet on appointments
  return Appointment.deleteMany({coaching: null})
    .then(() => Appointment.find({$or: [{diet: null},{user: null}]}).populate('coaching'))
    .then(appts => {
      return Promise.all(appts.map(app => {
        log(app.coaching.user, app.coaching.diet)
        app.user=app.coaching.user
        app.diet=app.coaching.diet
        return app.save()
      }))
    })
    .then(() => log(`Update appointments with user & diet OK`))
    .catch(err => error(`Update appointments with user & diet`, err))
}

const moveLogbooksToUsers = async () => {
  return CoachingLogbook.distinct('coaching')
    .then(coachingIds => Coaching.find({_id: coachingIds}, {user:1}))
    // Link logbooks to user instead of coaching
    .then(coachings => {
      log('starting move', coachings.length,'logbooks from coaching to user')
      return Promise.all(coachings.map(coaching => {
        log('move logbooks to user for coaching', coaching._id)
        return CoachingLogbook.updateMany({coaching: coaching._id}, {$set: {user: coaching.user}, $unset: {coaching: 1}})
      }))
    })
}

const upgradeMessage = async () => {
  log('syncing messages')
// Remove messages linked to other than users :-|
  const conversationFilter={group:null}
  Message.find(conversationFilter).populate(['sender', 'receiver'])
    .then(messages => {
      // Remove messages having no sender or no receiver
      const wrongMessages=messages.filter(m => (!m.sender || !m.receiver) || idEqual(m.sender._id, m.receiver._id))
      log(wrongMessages.length, 'invalid messages to remove')
      return Promise.all(wrongMessages.map(m => m.delete()))
    })
    .then(() => Message.find({...conversationFilter, conversation: null}, {sender:1, receiver:1}))
    .then(messages => {
      messages=messages.filter(m => m.sender._id != m.receiver._id)
      const grouped=lodash.groupBy(messages, message => {
        const sorted = [message.sender._id.toString(), message.receiver._id.toString()].sort();
        return sorted.join('-');
      })
      // Create conversations for each unordered (sender, receiver) pair
      return Promise.all(Object.keys(grouped).map(key => {
        const [user1, user2]=key.split('-')
        return Conversation.getFromUsers(user1, user2)
      }))
      // Update messages with their conversations
      .then(conversations => Promise.all(conversations.map(conv => {
        const filter={$or: [{sender: conv.users[0], receiver: conv.users[1]}, {sender: conv.users[1], receiver: conv.users[0]}]}
        return Message.updateMany(filter, {conversation: conv})
      })))
    })
    .then(res => log(lodash.sumBy(res, 'nModified'), 'messages updated'))
}

const DEFAULT_OFFER_START = moment('2019-01-01')
const DEFAULT_OFFER_END = moment('2030-12-31')

const upgradeParticularCompanyOffer = async () => {
  const company=await Company.findOne({name: PARTICULAR_COMPANY_NAME}).populate('offers')
  if (lodash.isEmpty(company.offers)) {
    const assQuizz=await Quizz.findOne({type: QUIZZ_TYPE_ASSESSMENT})
    if (!assQuizz) {
      throw new Error('No assessment quizz')
    }
    //const offer=await Offer.create({company, assessment_quizz: assQuizz, validity_start: DEFAULT_OFFER_START, validity_end: DEFAULT_OFFER_END})
    const offer=await Offer.create({company, assessment_quizz: assQuizz, 
        validity_start: DEFAULT_OFFER_START, validity_end: DEFAULT_OFFER_END,
        price:0, duration:0, name: `Offre pour ${PARTICULAR_COMPANY_NAME}`,
    })
  }
}

const upgradeOffers = async () => {
  const assQuizz=await Quizz.findOne({type: QUIZZ_TYPE_ASSESSMENT})
  if (!assQuizz) {
    throw new Error('No assessment quizz')
  }
  let offers=await Offer.find()
  offers=offers.map(offer => {
    offer.assessment_quizz=offer.assessment_quizz || assQuizz
    offer.validity_start=offer.validity_start || DEFAULT_OFFER_START
    offer.validity_end=offer.validity_end || DEFAULT_OFFER_END
    return offer
  })
  await Promise.all(offers.map(o => o.save()))
}

const upgradeCompanyOffers = async () => {
  const companies=await Company.find().populate('offers')
  const noOffersCompanies=companies.filter(c => lodash.isEmpty(c.offers))
  if (!lodash.isEmpty(noOffersCompanies)) {
    // throw new Error(`Companies without offer ${noOffersCompanies.map(c => c.name)}`)
    console.error(`Companies without offer ${noOffersCompanies.map(c => c.name)}`)
  }
}

const setCoachingAssQuizz = async () => {
  /** Extract HEALTH QUIZZ from coachings quizz, set it to assessment_quizz
   * use collection because Coaching.quizz attribute was removed from schema
   * */
  return Coaching.find()
    .populate({path: 'quizz'})
    .then(coachings => {
      const withAssessmentQuizz=coachings.filter(c => c.quizz?.some(q => q.type==QUIZZ_TYPE_ASSESSMENT))
      log('moving health quizz for', withAssessmentQuizz.length, 'coachings')
      return Promise.all(withAssessmentQuizz.map(c => {
        const healthQuizz=c.quizz.find(q => q.type==QUIZZ_TYPE_ASSESSMENT)._id
        return Coaching.findOneAndUpdate({_id: c._id}, {$set: {assessment_quizz: healthQuizz}, $pull: {quizz: healthQuizz}}, {runValidators: true})
      }))
    })
}

const setOffersOnCoachings = () => {
  log('set offers on coachings')
/** Set offers on coachings */
  return Coaching.find({offer: null})
    .populate({path: 'user', populate: {path: 'company', populate: 'current_offer'}})
    .then(coachings => Promise.all(coachings.map(coaching => {
      // Remove coachings with deleted users
      if (!coaching.user) {
        return coaching.delete()
      }
      coaching.offer=coaching.user?.company.current_offer
      coaching.status=COACHING_STATUS_NOT_STARTED
      if (!coaching.offer) {
        error('coaching without offer', coaching)
      }
      else {
        log('saved coaching', coaching._id, 'offer', coaching.offer._id)
        coaching.save()
      }
    })))
    // .then(() => {
    //   return Coaching.find({status: COACHING_STATUS_NOT_STARTED}, {_id:1})
    //     .then(coachings => {
    //       log('Updating', coachings.length, 'coaching status')
    //       return runPromisesWithDelay(coachings.map(coaching => () => updateCoachingStatus(coaching._id)
    //         .catch(err => console.error(`Coaching ${coaching._id}:${err}`))))
    //       })
    //   })
}

const updateAppointmentsOrder = async () => {
  const apptsToUpdate=await Appointment.exists({order: null})
  if (apptsToUpdate) {
    const appts=await Appointment.find({order: null}, {coaching:1})
    const coachingIds=lodash.uniq(appts.map(app => app.coaching._id.toString()))
    log('Update', coachingIds.length, 'coaching appointments orders')
    return Promise.all(coachingIds.map(id => updateApptsOrder(id)))
  }
  else {
    log('Update no coaching appointments orders')    
  }
}

const setAppointmentsProgress = async () => {
  const progressTemplate=await Quizz.findOne({ type: QUIZZ_TYPE_PROGRESS }).populate('questions')
  const coachingProgress=new NodeCache()

  // Cache coaching progress quizz
  const getCoachingProgress = async coaching_id => {
    const key=coaching_id.toString()
    let progress=coachingProgress.get(key)
    if (progress===undefined) {
      const coaching=await Coaching.findById(coaching_id).populate({path: 'progress', populate: 'questions'})
      progress=coaching.progress
      coachingProgress.set(key, progress)
    }
    return progress
  }

  const appts=await Appointment.find({progress: null}).sort({coaching:1})
  log('Appts with no progress', appts.length)
  const res=await runPromisesWithDelay(appts.map((appt, idx) => async () => {
    log(idx, '/', appts.length)
    const progressUser = await progressTemplate.cloneAsUserQuizz()
    const progress=await getCoachingProgress(appt.coaching)
    if (progress) {
      await copyProgressAnswers({sourceQuizz: progress, destinationQuizz: progressUser})
    }
    appt.progress=progressUser
    return appt.save()
  }))
  console.error(res.filter(r => r.status=='rejected'))
}

const setLeadCallDate = async () => {
  return Lead.updateMany(
    {}, // Update all documents
    [
      {
        $set: {
          call_date: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$_call_status_history", []] } }, 0] },
              then: {
                $max: "$_call_status_history.date", // Newest date in _call_status_history
              },
              else: `$${UPDATED_AT_ATTRIBUTE}`, // Fallback to updated_at
            },
          },
        },
      },
    ]
  )
    .then((result) => {
      console.log(`Updated ${result.modifiedCount} leads successfully.`);
    })
    .catch((err) => {
      console.error("Error updating leads:", err);
    });
}

const databaseUpdate = async () => {
  console.log('************ UPDATING DATABASE')
  await normalizePhones()
  await renameHealthQuizzTypes()
  await setAppointmentsDietAndUser()
  await moveLogbooksToUsers()
  await upgradeMessage()
  await upgradeOffers()
  await upgradeParticularCompanyOffer()
  await upgradeCompanyOffers()
  //await setOffersOnCoachings() NOOOO
  await setCoachingAssQuizz()
  await updateAppointmentsOrder()
  await setAppointmentsProgress()
  await setLeadCallDate()
}

module.exports=databaseUpdate
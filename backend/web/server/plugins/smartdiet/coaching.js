const moment=require('moment')
const mongoose=require('mongoose')
const lodash=require('lodash')
const Coaching = require("../../models/Coaching")
require("../../models/Appointment")
const Company = require("../../models/Company")
const Quizz = require("../../models/Quizz")
const { COACHING_STATUS_NOT_STARTED, COACHING_STATUS_STARTED, COACHING_STATUS_FINISHED, COACHING_END_DELAY, COACHING_STATUS_DROPPED, 
  COACHING_STATUS_STOPPED, QUIZZ_TYPE_PROGRESS, AVAILABILITIES_RANGE_DAYS, ROLE_EXTERNAL_DIET
} = require("./consts")
const { getAvailabilities } = require('../agenda/smartagenda')
const Availability = require('../../models/Availability')
const Range = require('../../models/Range')
const { runPromisesWithDelay } = require('../../utils/concurrency')
const User = require('../../models/User')

let progressTemplate=null
let assessmentTemplate=null

const updateCoachingStatus = async coaching_id => {

  const coaching=await Coaching.findById(coaching_id).populate(['_last_appointment', 'appointments', 'offer', 'spent_credits'])

  if (!coaching._last_appointment) {
    coaching.status=COACHING_STATUS_NOT_STARTED
  }
  // Started it 1 appointment
  if (coaching._last_appointment) {
    coaching.status=COACHING_STATUS_STARTED
    // Set progress quizz
    if (!coaching.progress) {
      if (!progressTemplate) {
        progressTemplate=await Quizz.findOne({ type: QUIZZ_TYPE_PROGRESS }).populate('questions')
      }
      if (!progressTemplate) {
        throw new Error('No progress template')
      }
      const progressUser = await progressTemplate.cloneAsUserQuizz()
     coaching.progress = progressUser._id
    }
    // TODO coaching set assessment quizz
    if (!coaching.assessment_quizz) {
      if (!assessmentTemplate) {
        assessmentTemplate=await Quizz.findById(coaching.offer.assessment_quizz).populate('questions')
      }
      const assessmentUser=await assessmentTemplate.cloneAsUserQuizz()
      coaching.assessment_quizz = assessmentUser._id
    }
    // Set offer
    if (!coaching.offer) {
      const company=await Company.findById(coaching.user.company).populate('offers')
      coaching.offer=company.offers?.[0]
    }
  }

  const last_appointment=coaching._last_appointment
  if (last_appointment) {
    const creditsRemain=coaching.remaining_credits>0
    const afterDelay=moment().diff(last_appointment?.end_date, 'month')>=COACHING_END_DELAY
    const lastValidated=last_appointment.validated==true

    if (!lastValidated && (afterDelay || !creditsRemain)) {
      coaching.status=COACHING_STATUS_DROPPED
    }
    if (lastValidated && afterDelay && creditsRemain) {
      coaching.status=COACHING_STATUS_STOPPED
    }
    if (!creditsRemain) {
      coaching.status=COACHING_STATUS_FINISHED
    }
  }

  const res=coaching.save()
  return res
}

const getAvailableDiets = async (userId, params, data) => {
  console.log('Getting available diets for', userId, 'coaching', data._all_diets.length, 'company', data.user.company.name)
  let diets=data._all_diets
  diets=diets.filter(d => !!parseInt(d.smartagenda_id))
  diets=diets.filter(d => d.diet_coaching_enabled)
  diets=diets.filter(d => d.customer_companies.map(c => c._id.toString()).includes(data.user.company._id.toString()))
  const hasAvailabilities = async diet_smartagenda_id => {
    const availabilities=await getAvailabilities({
      diet_id: diet_smartagenda_id, 
      from:moment(), 
      to:moment().add(AVAILABILITIES_RANGE_DAYS, 'day'), 
      appointment_type: data.appointment_type.smartagenda_id
    })
    return !lodash.isEmpty(availabilities)
  }
  dietsAvail=await runPromisesWithDelay(diets.map(diet => async () => {
    const hasAvail=await hasAvailabilities(diet.smartagenda_id)
    return hasAvail ? diet : null
  }))
  diets=dietsAvail.map(d => d.value).filter(d => !!d)
  return diets
}

const getDietAvailabilities = async (userId, params, data) => {
  // If no diet, return availabilities for all diets of the company
  let availabilities=[]
  if (!data.diet) {
    let diets=await User.find({
      role: ROLE_EXTERNAL_DIET, smartagenda_id: {$exists: true}, smartagenda_id: {$ne: null},
      diet_coaching_enabled: true, customer_companies: data.user.company,
    })
    console.log('diets:', diets.map(d => [d.email, d.smartagenda_id]))
    console.log('appt type', data.appointment_type)
    console.log('company', data.user.company.name)
    await runPromisesWithDelay(diets.map(d => async () => {
      const currentAvails= await getAvailabilities({
        diet_id: d.smartagenda_id,
        from: moment(),
        to: moment().add(AVAILABILITIES_RANGE_DAYS, 'day'),
        appointment_type: data.appointment_type.smartagenda_id
      })
      availabilites=[...availabilities, ...currentAvails]
    }))
  }
  else {
    availabilities = await getAvailabilities({
      diet_id: data.diet.smartagenda_id,
      from: moment(),
      to: moment().add(AVAILABILITIES_RANGE_DAYS, 'day'),
      appointment_type: data.appointment_type.smartagenda_id
    })
  }
  console.log('Availabilities', availabilities)
  const res = lodash(availabilities)
    .groupBy(avail => moment(avail.start_date).startOf('day'))
    .entries()
    .map(([date, day_availabilities]) => (new Availability({
      date: moment(date),
      ranges: day_availabilities.map(day_availability => (new Range({
        start_date: moment(day_availability.start_date),
        appointment_type: data.appointment_type,
      })))
    })))
    .value()
  return res
}

const updateApptsOrder= async coachingId => {
  // console.log('updating appt order for coaching', coachingId?._id)
  const appointments=await mongoose.models.appointment.find({coaching: coachingId}).sort({start_date:1})
  const promises=appointments.map((appointment, idx) => {
    const newOrder=idx+1
    if (newOrder!=appointment.order) {
      return mongoose.models.appointment.findByIdAndUpdate(appointment._id, {order: idx+1})
    }
    return Promise.resolve()
  })
  return Promise.all(promises)
}


module.exports={
  updateCoachingStatus, getAvailableDiets, getDietAvailabilities, updateApptsOrder,
}
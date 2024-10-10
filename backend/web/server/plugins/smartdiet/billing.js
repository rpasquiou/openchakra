const lodash=require('lodash')
const moment=require('moment')
const NodeCache=require('node-cache')
const { ForbiddenError } = require("../../utils/errors")
const { ROLE_EXTERNAL_DIET, APPOINTMENT_TYPE, APPOINTMENT_TYPE_ASSESSMENT, APPOINTMENT_TYPE_FOLLOWUP, APPOINTMENT_TYPE_NUTRITION, ROLE_ADMIN, ROLE_SUPER_ADMIN } = require("./consts")
const Appointment = require("../../models/Appointment")
const Coaching = require("../../models/Coaching")
const NutritionAdvice = require("../../models/NutritionAdvice")
const PriceList = require("../../models/PriceList")
const { getDateFilter, getMonthFilter } = require('../../utils/database')
const Company = require('../../models/Company')
const User = require('../../models/User')
const mongoose = require('mongoose')

// Keep app types for 30 seconds only to manage company changes
const appTypes=new NodeCache({stdTTL: 60})

const getAppointmentType = async ({appointmentType}) => {
  const key=appointmentType.toString()
  let result=appTypes.get(key)
  if (result) {
    return result
  }
  const assessment=await Company.exists({assessment_appointment_type: appointmentType})
  result=assessment ? APPOINTMENT_TYPE_ASSESSMENT : APPOINTMENT_TYPE_FOLLOWUP
  appTypes.set(key, result)
  return result
}

const getPrices = async (diet) => {
  diet = await User.findById(diet)
    .populate({
      path: 'company',
      populate:({
        path: 'current_offer'
      })
    })
  return diet.company.current_offer || await PriceList.find().sort({date: 1})
}

const PRICES_MAPPING={
  [APPOINTMENT_TYPE_ASSESSMENT]: 'assessment_price',
  [APPOINTMENT_TYPE_FOLLOWUP]: 'followup_price',
  [APPOINTMENT_TYPE_NUTRITION]: 'nutrition_price',
}

const getAppointmentPrice = (currentOffer, type) => {
  const priceField = PRICES_MAPPING[type]
  return currentOffer?.[priceField] || 0
}

// Computes blliing for the logged user
// If diet is provided, return only this diet's billings
const computeBilling = async ({ user, diet, fields, params }) => {
  let data
  if (user.role === ROLE_ADMIN || user.role === ROLE_SUPER_ADMIN) {
    if (diet) {
      const validDiet = await User.findById(diet)
      if (validDiet) {
        data = await computeDietBilling(diet, fields, params, validDiet)
      } else {
        data = await computeAllDietBillings(fields, params)
      }
    } else {
      data = await computeAllDietBillings(fields, params)
    }
  } else if (user.role === ROLE_EXTERNAL_DIET) {
    data = await computeDietBilling(user._id, fields, params)
  } else {
    throw new ForbiddenError(`La facturation n'est accessible qu'aux diets`)
  }

  return { model: 'billing', data }
}

// diet : loggedUser, validDiet: diet id to filter on
const computeDietBilling = async (diet, fields, params, validDiet) => {
  const company = params['filter.company']
  const prices = await getPrices(diet)
  const companyFilter = company
  ? [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $match: {
          'user.company': mongoose.Types.ObjectId(company)
        }
      }
    ]
  : []

  const appointments = await Appointment.aggregate([
    {
      $match: {
        diet: diet
      }
    },
    ...companyFilter,
    {
      $project: {start_date:1}
    }
  ])

  const nutAdvices = company ?
    await NutritionAdvice.aggregate([
      {
        $match:{
          diet:diet
        }
      },
      {
        $lookup:{
          from:'users',
          localField:'patient_email',
          foreignField:'email',
          as:'user'
        }
      },
      {
        $unwind:'$user'
      },
      {
        $match:{
          'user.company':mongoose.Types.ObjectId(company)
        }
      },
    ])
    : await NutritionAdvice.find({ diet }, { start_date: 1 })

  const startDate = params['filter.start_date'] ?
    moment(params['filter.start_date'])
    :
    lodash.minBy([...appointments, ...nutAdvices], obj => obj.start_date)?.start_date

  const endDate = params['filter.end_date'] ? moment(params['filter.end_date']) : moment()

  const months = []
  let current = moment(startDate)
  while (current.isSameOrBefore(endDate, 'month')) {
    months.push(current.clone())
    current.add(1, 'month')
  }
  if (params['sort.month']=='desc') {
    months.reverse()
  }

  let data = []
  for (const month of months) {
    const monthFilter = getMonthFilter({ attribute: 'start_date', month })
    const appts = await Appointment.find({ ...monthFilter, validated: true, diet }, { appointment_type: 1, start_date: 1 })
    const types = await Promise.all(appts.map(a => getAppointmentType({ appointmentType: a.appointment_type })))
    let typedAppts = appts.map((a, idx) => ({ ...a.toObject(), type: types[idx] }))
    const nutAdvices = await NutritionAdvice.find({ diet, ...monthFilter })
    typedAppts = [
      ...typedAppts,
      ...nutAdvices.map(n => ({
        ...n.toObject(),
        type: APPOINTMENT_TYPE_NUTRITION,
        price: getAppointmentPrice(prices, APPOINTMENT_TYPE_NUTRITION),
      }))
    ]

    typedAppts = typedAppts.map(appt => ({
      ...appt,
      price: getAppointmentPrice(prices, appt.type)
    }))

    const grouped = lodash.groupBy(typedAppts, 'type')
    const currentData = {
      month: month.format('YYYY-MM'),
      assessment_count: grouped[APPOINTMENT_TYPE_ASSESSMENT]?.length || 0,
      assessment_total: lodash(grouped[APPOINTMENT_TYPE_ASSESSMENT] || []).sumBy('price') || 0,
      followup_count: grouped[APPOINTMENT_TYPE_FOLLOWUP]?.length || 0,
      followup_total: lodash(grouped[APPOINTMENT_TYPE_FOLLOWUP] || []).sumBy('price') || 0,
      nutrition_count: grouped[APPOINTMENT_TYPE_NUTRITION]?.length || 0,
      nutrition_total: lodash(grouped[APPOINTMENT_TYPE_NUTRITION] || []).sumBy('price') || 0,
      impact_count: 0,
      impact_total: 0,
      total: 0,
    }
    currentData.total = currentData.assessment_total + currentData.followup_total + currentData.nutrition_total + currentData.impact_total
    data.push(currentData)
  }

  if (validDiet) {
    const billings = {
      total: 0,
      assessment_count: 0,
      assessment_total: 0,
      followup_count: 0,
      followup_total: 0,
      nutrition_count: 0,
      nutrition_total: 0,
    }

    const dietDetails = {
      fullname: `${validDiet.firstname} ${validDiet.lastname}`,
      email: validDiet.email
    }

    const coachings = await Coaching.countDocuments({ diet: validDiet._id })
    const appointments = await Appointment.countDocuments({ diet: validDiet._id, validated: true})

    billings.moy_appointments_coachings = coachings !== 0 ? Number(appointments / coachings).toFixed(2) : 0

    data.forEach(monthlyBill => {
      billings.assessment_count += monthlyBill.assessment_count
      billings.assessment_total += monthlyBill.assessment_total
      billings.followup_count += monthlyBill.followup_count
      billings.followup_total += monthlyBill.followup_total
      billings.nutrition_count += monthlyBill.nutrition_count
      billings.nutrition_total += monthlyBill.nutrition_total
    })

    billings.total = billings.assessment_total + billings.followup_total + billings.nutrition_total

    return [{
      total: billings.total,
      assessment_count: billings.assessment_count,
      assessment_total: billings.assessment_total,
      followup_count: billings.followup_count,
      followup_total: billings.followup_total,
      nutrition_count: billings.nutrition_count,
      nutrition_total: billings.nutrition_total,
      moy_appointments_coachings: billings.moy_appointments_coachings,
      fullname: dietDetails.fullname,
      email: dietDetails.email
    }]
  }

  if (params.limit) {
    const limit=parseInt(params.limit)
    let start=0
    if (params.page) {
      start=parseInt(params.page)*limit
    }
    data=data.slice(start, start+params.limit+1)
  }
  return data
}

const computeAllDietBillings = async (fields, params) => {
  const diets = await User.aggregate([
    {
      $match: {
        role: ROLE_EXTERNAL_DIET,
        diet_coaching_enabled: true,
      },
    },
    {
      $lookup: {
        from: 'coachings',
        localField: '_id',
        foreignField: 'diet',
        as: 'coachings',
      },
    },
    {
      $match: {
        'coachings.0': { $exists: true },
      },
    },
  ])

  let totalBillings = 0
  const data = await Promise.all(
    diets.map(async (diet) => {
      const billings = {
        total: 0,
        assessment_count: 0,
        assessment_total: 0,
        followup_count: 0,
        followup_total: 0,
        nutrition_count: 0,
        nutrition_total: 0,
      }

      const details = await computeDietBilling(diet._id, fields, params)
      const monthlyBillings = details

      const dietDetails = {
        fullname: `${diet.firstname} ${diet.lastname}`,
        email: diet.email,
      }

      const coachings = await Coaching.countDocuments({ diet: diet._id })
      const appointments = await Appointment.countDocuments({ diet: diet._id, validated:true })

      billings.moy_appointments_coachings = coachings !== 0 ? Number(appointments / coachings).toFixed(2) : 0

      monthlyBillings.forEach(monthlyBill => {
        billings.assessment_count += monthlyBill.assessment_count
        billings.assessment_total += monthlyBill.assessment_total
        billings.followup_count += monthlyBill.followup_count
        billings.followup_total += monthlyBill.followup_total
        billings.nutrition_count += monthlyBill.nutrition_count
        billings.nutrition_total += monthlyBill.nutrition_total
      })

      billings.total = billings.assessment_total + billings.followup_total + billings.nutrition_total
      totalBillings += billings.total

      return {
        total: billings.total,
        assessment_count: billings.assessment_count,
        assessment_total: billings.assessment_total,
        followup_count: billings.followup_count,
        followup_total: billings.followup_total,
        nutrition_count: billings.nutrition_count,
        nutrition_total: billings.nutrition_total,
        moy_appointments_coachings: billings.moy_appointments_coachings,
        fullname: dietDetails.fullname,
        email: dietDetails.email
      }
    })
  )

  data.total = totalBillings
  return data
}

module.exports = {
  computeBilling,
}

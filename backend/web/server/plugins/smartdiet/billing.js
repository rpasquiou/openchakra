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

const getPrices = async () => {
  return await PriceList.find().sort({date: 1})
}

const PRICES_MAPPING={
  [APPOINTMENT_TYPE_ASSESSMENT]: 'assessment',
  [APPOINTMENT_TYPE_FOLLOWUP]: 'followup',
  [APPOINTMENT_TYPE_NUTRITION]: 'nutrition',
}

const getAppointmentPrice = ({pricesList, appointment}) => {
  if (appointment.type==APPOINTMENT_TYPE_NUTRITION) {
    return 15
  }
  return appointment.offer[appointment.type==APPOINTMENT_TYPE_ASSESSMENT ? 'assessment_price' : 'followup_price'] || 0
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
  const prices = await getPrices()

  const dateFilter = {}
  // Add conditions based on the presence of start_date and end_date
  if (!!params['filter.start_date']) {
    dateFilter.start_date = { $gte: params['filter.start_date']}
  }
  if (!!params['filter.end_date']) {
    dateFilter.start_date = { ...dateFilter.start_date, $lte: params['filter.end_date'] }
  }
  
  const appointments = company ?
    await Appointment.aggregate([
      {
        $match:{
          diet:diet,
          ...dateFilter,
        }
      },
      {
        $lookup:{
          from:'users',
          localField:'user',
          foreignField:'_id',
          as:'user'
        }
      },
      {
        $lookup:{
          from:'coachings',
          localField:'coaching',
          foreignField:'_id',
          as:'coaching'
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
      {
        $unwind: '$coaching' // Assuming one-to-one relationship with coaching
      },
      {
        $lookup: {
          from: 'offers', // The name of the offers collection
          localField: 'coaching.offer', // Field in coaching that references offer
          foreignField: '_id', // _id in offers collection
          as: 'offer'
        }
      },
      {
        $unwind: '$offer' // Assuming one-to-one relationship with offer
      },
      {
        $project: {
          diet: 1,
          user: 1,
          // coaching: 1,
          order: 1,
          start_date:1 ,
          // Select specific fields from the offer
          // 'offer._id': 1,
          'offer.assessment_price': 1,
          'offer.followup_price': 1,
          'offer.nutrition_price': 1,
        }
      }    ])
    : await Appointment.find({ diet }).populate({path: 'coaching', populate: 'offer'})

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

  const monthFormat='YYYY-MM'
  const groupedAppts=lodash.groupBy(appointments, a => moment(a.start_date).format(monthFormat))
  const groupNuts=lodash.groupBy(nutAdvices, n => moment(n.start_date).format(monthFormat))

  let data = []
  for (const month of months) {
    const monthYear=month.format(monthFormat)
    const appts = (groupedAppts[monthYear] ||[]).map(a => ({ offer: a.offer || a.coaching.offer, type: a.order==1 ? APPOINTMENT_TYPE_ASSESSMENT : APPOINTMENT_TYPE_FOLLOWUP }))
    const nuts=(groupNuts[monthYear] || []).map(n => ({ ...n, type: APPOINTMENT_TYPE_NUTRITION }))
    const typedAppts = ([...appts,...nuts]).map(appt => ({ type: appt.type, price: getAppointmentPrice({ pricesList: prices, appointment: appt }) }))

    const grouped = lodash.groupBy(typedAppts, 'type')
    const currentData = {
      month: month.format(monthFormat),
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
  let start=0
  let limit=1000000
  if (params.limit) {
    limit=parseInt(params.limit)+1
    start=parseInt(params.page)*parseInt(params.limit) || 0
  }

  let diets = await User.aggregate([
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
    {
      $sort: { lastname: 1}
    },
    {
      $skip: start
    },
    {
      $limit: limit
    }
  ])


  let totalBillings = 0

  // Remove limit && page for each diet request
  const detailsParams=lodash.omitBy(params, (v, k) => /^limit/.test(k) || /^page/.test(k))

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

      const details = await computeDietBilling(diet._id, fields, detailsParams)
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

const mongoose = require('mongoose')
const lodash = require('lodash')
const moment = require('moment')
const Group = require('../../models/Group')
const { APPOINTMENT_TO_COME, APPOINTMENT_VALID, CALL_DIRECTION_IN_CALL, COACHING_STATUS_STARTED, COACHING_STATUS_STOPPED, COACHING_STATUS_NOT_STARTED, COACHING_STATUS_DROPPED, COACHING_STATUS_FINISHED, APPOINTMENT_STATUS, APPOINTMENT_CURRENT, GENDER_FEMALE, GENDER_MALE, GENDER_NON_BINARY, EVENT_WEBINAR, ROLE_CUSTOMER, COMPANY_ACTIVITY_OTHER, CALL_DIRECTION_OUT_CALL, CALL_STATUS_NOT_INTERESTED, CALL_STATUS_UNREACHABLE, APPOINTMENT_VALIDATION_PENDING, APPOINTMENT_RABBIT, ROLE_EXTERNAL_DIET, GENDER, DIET_REGISTRATION_STATUS_PENDING, DIET_REGISTRATION_STATUS_VALID, DIET_REGISTRATION_STATUS_ACTIVE, DIET_REGISTRATION_STATUS_REFUSED } = require('./consts')
const User = require('../../models/User')
const Lead = require('../../models/Lead')
const Coaching = require('../../models/Coaching')
const Appointment = require('../../models/Appointment')
const Job = require('../../models/Job')
const JoinReason = require('../../models/JoinReason')
const DeclineReason = require('../../models/DeclineReason')
const NutritionAdvice = require('../../models/NutritionAdvice')
const Webinar = require('../../models/Webinar')
const Company = require('../../models/Company')

const groups_count = async ({ companyFilter }) => {
    return await Group.countDocuments({ companies: companyFilter })
}

const messages_count = async ({ companyFilter }) => {
    return lodash(await Group.find({companies: companyFilter}).populate('messages')).flatten().size() 
}

const users_count = async ({ companyFilter }) => {
    return await User.countDocuments({ company: companyFilter})
}

const user_women_count = async ({ companyFilter }) => {
    return await User.countDocuments({company: companyFilter, gender: GENDER_FEMALE})
}
   
const users_men_count = async ({ companyFilter }) => {
    return await User.countDocuments({company: companyFilter, gender: GENDER_MALE})
}
   
const users_no_gender_count = async ({ companyFilter }) => {
    return await User.countDocuments({company: companyFilter, gender: GENDER_NON_BINARY})
}
   
const webinars_count = async ({ companyFilter }) => {
    return await Webinar.countDocuments({companies: companyFilter})
}

const webinars_replayed_count = async ({ companyFilter }) => {
    return await User.aggregate([
        {$match: { company: companyFilter }},
        {$unwind: '$replayed_events'},
        {$match: { 'replayed_events.__t': EVENT_WEBINAR }},
        {$group: {_id: '$_id', webinarCount: { $sum: 1 }}}
      ])[0]?.webinarCount||0
}

const average_webinar_registar = async ({ companyFilter }) => {
    const webinars_registered=(await User.aggregate([
        {$match: { company: companyFilter }},
        {$unwind: '$registered_events'},
        {$match: { 'registered_events.__t': EVENT_WEBINAR }},
        {$group: {_id: '$_id', webinarCount: { $sum: 1 }}}
      ]))[0]?.webinarCount||0
    const webinarsCount = webinars_count(companyFilter)
    return webinarsCount ? webinars_registered*1.0/webinarsCount : 0
}

const started_coachings = async ({ companyFilter }) => {
    const usersWithStartedCoaching = await User.aggregate([
        {
          $match: { company: companyFilter }
        },
        {
          $lookup: {
            from: 'coachings',
            localField: '_id',
            foreignField: 'user',
            as: 'coachings'
          }
        },
        {
          $unwind: '$coachings'
        },
        {
          $match: { 'coachings.status': { $ne: COACHING_STATUS_NOT_STARTED } }
        },
        {
          $group: { _id: '$_id' }
        },
        {
          $count: 'count'
        }
      ])
      return usersWithStartedCoaching[0] ? usersWithStartedCoaching[0].count : 0
}

const leads_count = async ({ companyFilter }) => {
  const companies=await Company.find({_id: companyFilter})
    return await Lead.countDocuments({company_code: companies.map(c => c.code)})
}

const specificities_users = async ({ companyFilter }) => {
  const specificities_count=await User.aggregate([
    { $match: { role: ROLE_CUSTOMER, company: companyFilter}},
    { $unwind: "$specificity_targets" },
    { $group: { _id: "$specificity_targets", count: { $sum: 1 }}},
    { $lookup: {
        from: "targets", 
        localField: "_id",
        foreignField: "_id",
        as: "target"
      }
    },
    { $unwind: "$target"},
    { $project: {
        _id: 0,
        name: "$target.name",
        count: 1
      }
    },
    { $sort: { count: 1 } } 
  ])
  const specificities_users=specificities_count.map(({count, name})=> ({x:name, y:count}))
  return specificities_users
}

const reasons_users = async ({ companyFilter }) => {
    let userMatch={$match: {_id: {$exists: true}}}
    if (companyFilter) {
        const companyUsers=(await User.find({company: companyFilter}, {_id:1})).map(({_id}) => _id)
        userMatch={$match: {user: {$in: companyUsers}}}
    }
    const reasons_count=await Coaching.aggregate([
        userMatch,
        { $unwind: "$reasons" },
        { $group: { _id: "$reasons", count: { $sum: 1 }}},
        { $lookup: {
            from: "targets",
            localField: "_id",
            foreignField: "_id",
            as: "target"
            }
        },
        { $unwind: "$target"},
        { $project: {
            _id: 0,
            name: "$target.name",
            count: 1
            }
        },
        { $sort: { count: 1 } }
    ])
    return reasons_count.map(({count, name})=> ({x:name, y:count}))
}

const jobs_ = async (companyFilter) => {
    const leads = await Lead.find()
    const jobs = await Job.find()
    const jobDict = lodash.keyBy(jobs, 'id')
    const jobsFound = leads.reduce((acc, lead) => {
      const jobName = jobDict[lead.job]?.name
      if (jobName) {
        acc[jobName] = (acc[jobName] || 0) + 1
      }
      return acc
    }, {})

    const jobsTotal = Object.values(jobsFound).reduce((sum, count) => sum + count, 0)
    const jobsArray = Object.entries(jobsFound).map(([name, value]) => {
      const percent = Number(((value / jobsTotal) * 100).toFixed(2))
      return { name, value, percent }
    }).sort((a, b) => b.value - a.value)
  return {
    jobs_total: jobsTotal,
    jobs_details: jobsArray
  }
}

const join_reasons_ = async (companyFilter) => {
    const leads = await Lead.find({ id: companyFilter })
    const joinReasons = await JoinReason.find()
    const joinReasonsDict = joinReasons.reduce((acc, jR) => {
      acc[jR.id] = jR
      return acc
    }, {})
  
    let joinReasonsFound = {}
    let joinReasonsTotal = 0
  
    leads.forEach(lead => {
      if (joinReasonsDict[lead.join_reason]) {
        joinReasonsTotal += 1
        const reasonName = joinReasonsDict[lead.join_reason].name
        joinReasonsFound[reasonName] = (joinReasonsFound[reasonName] || 0) + 1
      }
    })
  
    delete joinReasonsFound.undefined
  
    joinReasonsFound = Object.entries(joinReasonsFound)
    joinReasonsFound.sort((a, b) => b[1] - a[1])
  
    const joinReasonsArray = joinReasonsFound.map(([name, value]) => {
      const percent = Number(((value / joinReasonsTotal) * 100).toFixed(2))
      return { name, value, percent }
    })
  
    return {
      join_reasons_total: joinReasonsTotal,
      join_reasons_details: joinReasonsArray
    }
}

const decline_reasons_ = async (companyFilter) => {
    const leads = await Lead.find({ id: companyFilter })

    const declineReasons = await DeclineReason.find()
    const declineReasonsDict = declineReasons.reduce((acc, dR) => {
        acc[dR.id] = dR
        return acc
    }, {})

    let declineReasonsFound = {}
    let declineReasonsTotal = 0

    leads.forEach(lead => {
        if (declineReasonsDict[lead.decline_reason]) {
            declineReasonsTotal += 1
            const reasonName = declineReasonsDict[lead.decline_reason].name
            declineReasonsFound[reasonName] = (declineReasonsFound[reasonName] || 0) + 1
        }
    })

    delete declineReasonsFound.undefined

    declineReasonsFound = Object.entries(declineReasonsFound)
    declineReasonsFound.sort((a, b) => b[1] - a[1])

    const declineReasonsArray = declineReasonsFound.map(([name, value]) => {
        const percent = Number(((value / declineReasonsTotal) * 100).toFixed(2))
        return { name, value, percent }
    })

    return {
        decline_reasons_total: declineReasonsTotal,
        decline_reasons_details: declineReasonsArray
    }
}

const leads_by_campain = async (companyFilter) => {
    const leads=await Lead.find()
    const leadsTotal=leads.length
    const leadsByCampain=[]
    const groupedLeadsByCampain=lodash.groupBy(leads, 'campain')
    for(let campain in groupedLeadsByCampain){
      const campainName= campain!='undefined' && campain!='null' ? campain : 'unknown'
      leadsByCampain[campainName]=(leadsByCampain[campainName] || 0) + groupedLeadsByCampain[campain].length 
    }
    const leads_by_campain=[]
    for(let campain in leadsByCampain){
      const value = leadsByCampain[campain]
      const percent = Number(((value/leadsTotal)*100).toFixed(2))
      leads_by_campain.push({
        'name': campain,
        'value': value,
        'percent': percent,
      })
    }
    return(leads_by_campain)
}

const webinars_by_company_ = async () => {
    const pipeline = [
      { $unwind: '$companies' },
      { 
        $group: { 
            _id: '$companies', 
            webinars: { $sum: 1 } 
        } 
      },
      {
        $lookup: {
            from: 'companies',
            localField: '_id',
            foreignField: '_id',
            as: 'company_info'
        }
      },
      { $unwind: '$company_info' },
      { 
        $project: { 
            _id: 0, 
            company: '$company_info.name', 
            webinars: 1 
        } 
      }
    ]
    const result = await Webinar.aggregate(pipeline)
    const webinarsCount = result.reduce((acc, curr) => acc + curr.webinars, 0)
    return {
        webinars_by_company_total: webinarsCount,
        webinars_by_company_details: result
    }
}

const getOperatorName = async (operatorId) => {
  const user = await User.findById(operatorId)
  return user ? user.fullname : "unknown"
}


const calls_stats = async ({ companyFilter, company }) => {
  let userEmailFilter ={}
  if (company) {
    const users = await User.find({ company: company }).select('email').lean()
    const userEmails = users.map(user => user.email)
    userEmailFilter = { email: { $in: userEmails } }
  }
  const incallsTotal = await Lead.countDocuments({ operator:companyFilter, ...userEmailFilter, call_direction: CALL_DIRECTION_IN_CALL })
  const outcallsTotal = await Lead.countDocuments({ operator:companyFilter, ...userEmailFilter, call_direction: CALL_DIRECTION_OUT_CALL })
  const callsTotal = await Lead.countDocuments({ operator:companyFilter, ...userEmailFilter, call_direction: { $in: [CALL_DIRECTION_IN_CALL, CALL_DIRECTION_OUT_CALL] } })
  const nutAdvicesTotal = await Lead.countDocuments({ operator:companyFilter, ...userEmailFilter, nutrition_converted: true })
  const coachingsTotal = await Lead.countDocuments({ operator:companyFilter, ...userEmailFilter, coaching_converted: true })
  const declinedTotal = await Lead.countDocuments({ operator:companyFilter, ...userEmailFilter, call_status: CALL_STATUS_NOT_INTERESTED })
  const unreachablesTotal = await Lead.countDocuments({ operator:companyFilter, ...userEmailFilter, call_status: CALL_STATUS_UNREACHABLE })
  const usefulContactsTotal = await Lead.countDocuments({
    $or: [
      { operator:companyFilter, ...userEmailFilter, nutrition_converted: true },
      { operator:companyFilter, ...userEmailFilter, coaching_converted: true },
      { operator:companyFilter, ...userEmailFilter, call_status: CALL_STATUS_NOT_INTERESTED }
    ]
  })

  const stats = await Lead.find({operator:companyFilter, ...userEmailFilter})
  const groupedStats = lodash.groupBy(stats, (lead) =>
    mongoose.Types.ObjectId.isValid(lead.operator) ? lead.operator : 'unknown'
  )

  let renewedCoachingsTotal = 0
  let coaCuTransformationTotal = 0
  let cnCuTransformationTotal = 0

  await Promise.all(
    Object.keys(groupedStats).map(async (operatorId) => {
      const operatorDetails = groupedStats[operatorId]

      const renewedCoachings = operatorDetails.reduce((acc, lead) => {
        if (lead.coaching_converted) {
          acc[lead.email] = (acc[lead.email] || 0) + 1
        }
        return acc
      }, {})
      const renewedCoachingsTotalForOperator = Object.values(renewedCoachings).reduce((sum, count) => sum + count, 0)
      renewedCoachingsTotal += renewedCoachingsTotalForOperator

      const coa = operatorDetails.filter((lead) => lead.coaching_converted).length
      const usefulContactsForCoa = operatorDetails.filter(
        (lead) => lead.nutrition_converted || lead.coaching_converted || lead.call_status === CALL_STATUS_NOT_INTERESTED
      ).length
      const coaCuTransformation = usefulContactsForCoa !== 0 ? Number((coa / usefulContactsForCoa * 100).toFixed(2)) : 0
      coaCuTransformationTotal += coaCuTransformation

      const nutAdvicesForCn = operatorDetails.filter((lead) => lead.nutrition_converted).length
      const usefulContactsForCn = operatorDetails.filter(
        (lead) => lead.nutrition_converted || lead.coaching_converted || lead.call_status === CALL_STATUS_NOT_INTERESTED
      ).length
      const cnCuTransformation = usefulContactsForCn !== 0 ? Number((nutAdvicesForCn / usefulContactsForCn * 100).toFixed(2)) : 0
      cnCuTransformationTotal += cnCuTransformation
    })
  )

  return {
    totals: [
      { name: "Appels Entrants", value: incallsTotal },
      { name: "Appels Sortants", value: outcallsTotal },
      { name: "Total Appels", value: callsTotal },
      { name: "Conseils Nut", value: nutAdvicesTotal },
      { name: "Coachings", value: coachingsTotal },
      { name: "Refusés", value: declinedTotal },
      { name: "Injoignables", value: unreachablesTotal },
      { name: "Contacts utiles", value: usefulContactsTotal },
      { name: "Coachings Renouvelés", value: renewedCoachingsTotal },
      { name: "Transformation COA/CU", value: coaCuTransformationTotal },
      { name: "Transformation CN/CU", value: cnCuTransformationTotal },
    ],
  }
}

const diet_coaching_enabled = async () => {
  return await User.countDocuments({diet_coaching_enabled:true})
}

const diet_site_enabled = async () => {
  return await User.countDocuments({diet_site_enabled:true})
}

const diet_visio_enabled = async () => {
  return await User.countDocuments({diet_visio_enabled:true})
}

const diet_recruiting = async () => {
  return await User.countDocuments({registration_status:{$in:[DIET_REGISTRATION_STATUS_PENDING, DIET_REGISTRATION_STATUS_VALID, DIET_REGISTRATION_STATUS_ACTIVE]}})
}

const diet_refused = async () => {
  return await User.countDocuments({registration_status:DIET_REGISTRATION_STATUS_REFUSED})
}

const diet_activated = async () => {
  return await User.countDocuments({active:true, role:ROLE_EXTERNAL_DIET})
}

const coachings_by_gender_ = async ({ companyFilter, start_date, end_date, diet }) => {
  const coachingConditions={status: { $in: [COACHING_STATUS_DROPPED, COACHING_STATUS_FINISHED, COACHING_STATUS_STOPPED] }}
  if (start_date) {
    coachingConditions.start_date={$gte: moment(start_date).startOf('day').toDate()}
  }
  if (end_date) {
    coachingConditions.end_date={$lte: moment(start_date).endOf('day').toDate()}
  }
  if (diet) {
    coachingConditions.diet=mongoose.Types.ObjectId(diet)
  }
  
  let genders = await Coaching.aggregate([
    {
      $match: coachingConditions,
    },
    {
      $lookup: {
        from: 'users',            
        localField: 'user',       
        foreignField: '_id',      
        as: 'user'         
      }
    },
    {
      $match:{'user.company':companyFilter }
    },
    { $unwind: '$user' }, 
    {
      $project:{
        _id:1,
        "user.gender":1,
      }
    },
    {
      $group: {
        _id: '$user.gender', 
        count: { $sum: 1 }          
      }
    },
    {
      $project: {
        _id: 0,                    
        gender: '$_id',            
        count: 1                   
      }
    }
  ])
  const MAPPING={
    [GENDER_MALE]: 'male',
    [GENDER_FEMALE]: 'female',
    [GENDER_NON_BINARY]: 'non_binary',
    [null]: 'unknown',
    [undefined]: 'unknown',
  }
  let genders2=Object.fromEntries(Object.keys(GENDER).map(g => [MAPPING[g], 0]))
  genders2={...genders2, ...Object.fromEntries(genders.map(({count, gender}) => [MAPPING[gender], count]))}
  if (!genders2.hasOwnProperty('unknown')) {
    genders2['unknown'] = 0
  }
  return genders2
}

const nut_advices = async ({ companyFilter, company, diet, start_date, end_date }) => {
  const matchConditions = {}
  if (diet) {
    matchConditions.diet=diet
  }
  if (start_date || end_date) {
    matchConditions.start_date={}
    start_date ? matchConditions.start_date['$gt']=start_date : null
    end_date ? matchConditions.start_date['$lt']=end_date : null
  }

  const users=company ? await User.find({company}, {email:1}) : null
  const usersCondition=users ? {patient_email: {$in: users.map(u => u.email)}} : {}
  return NutritionAdvice.countDocuments({...matchConditions, ...usersCondition})
}
const coachings_renewed = async ({ company, diet, start_date, end_date }) => {
  const dateFilter = end_date ? { start_date: { $lt: new Date(end_date) } } : {}
  const dietFilter = diet ? { diet: mongoose.Types.ObjectId(diet) } : {}

  const companyFilter = company ? [
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    { $match: { 'user.company': mongoose.Types.ObjectId(company) } }
  ] : []

  const result = await Appointment.aggregate([
    {
      $match: {
        ...dateFilter,
        ...dietFilter,
      }
    },
    ...companyFilter,
    {
      $group: {
        _id: '$coaching',
        user: { $first: '$user' }
      }
    },
    {
      $group: {
        _id: '$user',
        coachingCount: { $sum: 1 }
      }
    },
    {
      $addFields: {
        adjustedCoachingCount: { $subtract: ['$coachingCount', 1] }
      }
    },
    {
      $match: {
        adjustedCoachingCount: { $gt: 0 }
      }
    },
    {
      $group: {
        _id: null,
        totalAdjustedCount: { $sum: '$adjustedCoachingCount' }
      }
    },
    {
      $project: {
        _id: 0,
        totalAdjustedCount: 1
      }
    }
  ])
  const totalAdjustedCount = result.length > 0 ? result[0].totalAdjustedCount : 0
  return totalAdjustedCount
}

const ratio_stopped_started = async ({companyFilter, diet, start_date, end_date}) => {
  const coachingsStopped= await coachings_stopped({companyFilter, diet, start_date, end_date})
  const coachingsStarted= await coachings_started({companyFilter, diet, start_date, end_date})
  return coachingsStarted!=0 ? Number((coachingsStopped / coachingsStarted * 100).toFixed(2)) : 0
}

const ratio_dropped_started = async ({companyFilter, diet, start_date, end_date}) => {
const coachingsDropped= await coachings_dropped({companyFilter, diet, start_date, end_date})
const coachingsStarted= await coachings_started({companyFilter, diet, start_date, end_date})
  return coachingsStarted!=0 ? Number((coachingsDropped / coachingsStarted * 100).toFixed(2)) : 0
}

const coachings_started = async ({ company, diet, start_date, end_date }) => {
  const companyFilter = company ? [
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    { $match: { 'user.company': mongoose.Types.ObjectId(company) } }
  ] : []

  const result = await Appointment.aggregate([
    {
      $match:{
        ...diet ? { diet: mongoose.Types.ObjectId(diet) } : {},
        ...start_date ? { start_date: { $gte: moment(start_date).startOf('day').toDate() } } : {},
        ...end_date ? { end_date: { $lte: moment(end_date).endOf('day').toDate() } } : {},
        order: 1,
        validated:true,
      }
    },
    ...companyFilter,
    {
      $group: {
        _id: '$coaching'
      }
    },
    {
      $count: 'totalCoachings'
    }
  ])
  return result.length > 0 ? result[0].totalCoachings : 0
}

const coachings_stopped = async ({ company, diet, start_date, end_date }) => {
    const status = COACHING_STATUS_STOPPED
    return await coachings_calc({company, diet, start_date, end_date, status})
}

const coachings_dropped = async ({ company, diet, start_date, end_date }) => {
  const status = COACHING_STATUS_DROPPED
  return await coachings_calc({company, diet, start_date, end_date, status})
}

const coachings_ongoing = async ({ company, diet, start_date, end_date }) => {
  const status = COACHING_STATUS_STARTED
  return await coachings_calc({company, diet, start_date, end_date, status})
}

const coachings_finished = async ({ company, diet, start_date, end_date }) => {
  const status = COACHING_STATUS_FINISHED
  return await coachings_calc({company, diet, start_date, end_date, status})
}

const coachings_calc = async ({company, start_date, end_date, diet, status}) => {
  const companyFilter = company ? [
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    { $match: { 'user.company': mongoose.Types.ObjectId(company) } }
  ] : []

  const dietFilter = diet ? { diet: mongoose.Types.ObjectId(diet) } : {}

  const result = await Coaching.aggregate([
    {
      $match: {
        status: status,
        ...dietFilter
      }
    },
    {
      $lookup: {
        from: 'appointments',
        localField: '_id',
        foreignField: 'coaching',
        as: 'appointments'
      }
    },
    { $unwind: '$appointments' },
    {
      $match: {
        'appointments.validated':true,
        'appointments.order':1,
        ...start_date ? { 'appointments.start_date': { $gte: moment(start_date).toDate() } } : {},
        ...end_date ? { 'appointments.end_date': { $lte: moment(end_date).toDate() } } : {}
      }
    },
    ...companyFilter,
    {
      $group: {
        _id: '$_id'
      }
    },
    {
      $count: 'totalCoachings'
    }
  ])
  return result.length > 0 ? result[0].totalCoachings : 0
}

const validated_appts = async ({company, start_date, end_date, diet}) => {
  if(!company){
    return await Appointment.countDocuments({
      ...start_date ? {start_date: {$gte: moment(start_date).startOf('day')} } : {},
      ...end_date ? {end_date: {$lte: moment(end_date).endOf('day')}} : {},
      ...diet ? {diet: mongoose.Types.ObjectId(diet)} : {}
    })
  }
  const appointmentFilter = (start_date || end_date || diet) ? 
  [
    {
      $match:{
        ...start_date ? {start_date: {$gte: moment(start_date).startOf('day')} } : {},
        ...end_date ? {end_date: {$lte: moment(end_date).endOf('day')}} : {},
        ...diet ? {diet: mongoose.Types.ObjectId(diet)} : {}
      }
    }
  ]
  : []

  const res = await User.aggregate([
    {
      $match:{
        company:mongoose.Types.ObjectId(company)
      }
    },
    {
      $project:{
        _id:1
      }
    },
    {
      $lookup:{
        from:"appointments",
        localField:"_id",
        foreignField: "user",
        as:"appointments"
      }
    },
    {
      $unwind:"$appointments"
    },
    {
      $project:{
        "appointments._id":1,
        "appointments.diet":1,
        "appointments.start_date":1,
        "appointments.end_date":1,
      }
    },
    ...appointmentFilter,
    {
      $project:{
        "appointments._id":1,
      }
    },
    {
      $group:{
        _id:"$appointments"
      }
    }
  ])
  
  return res.length > 0 ? res.length : 0
}

const coachings_stats = async ({ company, start_date, end_date, diet }) => {
  const startDate = start_date ? new Date(start_date) : null
  const endDate = end_date ? new Date(end_date) : new Date()
  const upcomingStartDate = start_date ? new Date(start_date) : new Date()

  const dateFilter = {}
  if (startDate) dateFilter.start_date = { $gte: startDate }
  if (end_date) dateFilter.end_date = { $lte: endDate }

  const companyFilter = company ? [{ $match: { 'user.company': mongoose.Types.ObjectId(company) } }] : []

  const dietFilter = diet ? { diet: mongoose.Types.ObjectId(diet) } : {}

  const AGE_RANGES = [
    { min: 18, max: 24 },
    { min: 25, max: 29 },
    { min: 30, max: 34 },
    { min: 35, max: 39 },
    { min: 40, max: 44 },
    { min: 45, max: 49 },
    { min: 50, max: 54 },
    { min: 55, max: 59 },
    { min: 60, max: 64 },
    { min: 65, max: 69 },
    { min: 70, max: 74 },
    { min: null, max: null },
  ].map(obj => ({...obj, name: !obj.min ? 'Unknown' : `${obj.min}-${obj.max}`}))

  const YEAR = 365 * 24 * 60 * 60 * 1000

  const createPipeline = () => [
    { $match: { ...dateFilter, ...dietFilter } },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    ...companyFilter,
    {
      $project: {
        _id: 1,
        coaching: 1,
        start_date: 1,
        end_date: 1,
        validated: 1,
        'user._id': 1,
        'user.birthday': 1,
        order:1
      },
    },
    {
      $addFields: {
        age: {
          $floor: {
            $divide: [{ $subtract: [new Date(), '$user.birthday'] }, YEAR],
          },
        },
      },
    },
    {
      $addFields: {
        ageRange: {
          $switch: {
            branches: AGE_RANGES.map(({ name, min, max }) => ({
              case: min !== null && max !== null
                ? { $and: [{ $gte: ['$age', min] }, { $lte: ['$age', max] }] }
                : { $eq: [true, true] },
              then: name,
            })),
          },
        },
        coachingId: '$coaching',
      },
    },
    { $sort: { start_date: 1 } },
    {
      $group: {
        _id: '$coachingId',
        appointments: {
          $push: {
            _id: '$_id',
            start_date: '$start_date',
            end_date: '$end_date',
            ageRange: '$ageRange',
            validated: '$validated',
            order: '$order'
          },
        },
      },
    },
    {
      $addFields: {
        appointments: {
          $map: {
            input: '$appointments',
            as: 'appointment',
            in: {
              $mergeObjects: [
                '$$appointment',
                {
                  status: {
                    $switch: {
                      branches: [
                        { case: { $eq: ['$$appointment.validated', true] }, then: APPOINTMENT_STATUS[APPOINTMENT_VALID] },
                        {
                          case: {
                            $and: [
                              { $gte: ['$$appointment.start_date', upcomingStartDate] },
                              { $ne: ['$$appointment.validated', true] },
                            ],
                          },
                          then: APPOINTMENT_STATUS[APPOINTMENT_TO_COME],
                        },
                        {
                          case: {
                            $and: [
                              { $lte: ['$$appointment.end_date', endDate] },
                              { $eq: ['$$appointment.validated', false] },
                            ],
                          },
                          then: APPOINTMENT_STATUS[APPOINTMENT_RABBIT],
                        },
                      ],
                      default: 'Unknown',
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    { $unwind: '$appointments' },
    {
      $group: {
        _id: { status: '$appointments.status', order: '$appointments.order' },
        total: { $sum: 1 }, 
        ranges: {
          $push: {
            ageRange: '$appointments.ageRange',
          },
        },
      },
    },
    {
      $addFields: {
        ranges: {
          $map: {
            input: AGE_RANGES,
            as: 'range',
            in: {
              name: '$$range.name',
              total: {
                $size: {
                  $filter: {
                    input: '$ranges',
                    as: 'r',
                    cond: { $eq: ['$$r.ageRange', '$$range.name'] },
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $addFields: {
        ranges: {
          $map: {
            input: '$ranges',
            as: 'range',
            in: {
              name: '$$range.name',
              total: '$$range.total',
              percent: { $round: [{ $multiply: [{ $divide: ['$$range.total', '$total'] }, 100] }, 2] },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: '$_id.status',
        total: { $sum: '$total' },
        appointments: {
          $push: {
            order: '$_id.order',
            total: '$total',
            ranges: '$ranges',
          },
        },
        overallRanges: { $push: '$ranges' }, 
      },
    },
    {
      $addFields: {
        overallRanges: {
          $reduce: {
            input: '$overallRanges',
            initialValue: AGE_RANGES.map(({ name }) => ({ name, total: 0 })),
            in: {
              $map: {
                input: '$$value',
                as: 'range',
                in: {
                  name: '$$range.name',
                  total: {
                    $sum: [
                      '$$range.total',
                      {
                        $let: {
                          vars: {
                            matchedRange: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: '$$this',
                                    as: 'thisRange',
                                    cond: { $eq: ['$$thisRange.name', '$$range.name'] },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                          in: { $ifNull: ['$$matchedRange.total', 0] },
                        },
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        total: 1,
        appointments: 1,
        ranges: {
          $map: {
            input: '$overallRanges',
            as: 'range',
            in: {
              name: '$$range.name',
              total: '$$range.total',
              percent: {$round: [{ $multiply: [{ $divide: ['$$range.total', '$total'] }, 100] }, 2] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        ranges: {
          $map: {
            input: AGE_RANGES,
            as: 'range',
            in: {
              name: '$$range.name',
              total: {
                $let: {
                  vars: {
                    matchedRange: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$ranges',
                            as: 'existingRange',
                            cond: { $eq: ['$$existingRange.name', '$$range.name'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: { $ifNull: ['$$matchedRange.total', 0] },
                },
              },
              percent: {
                $let: {
                  vars: {
                    matchedRange: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$ranges',
                            as: 'existingRange',
                            cond: { $eq: ['$$existingRange.name', '$$range.name'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: { $multiply: [{ $divide: [{ $ifNull: ['$$matchedRange.total', 0] }, '$total'] }, 100]
                  },
                },
              },
            },
          },
        },
      },
    },
    
    {
      $addFields: {
        appointments: {
          $map: {
            input: { $range: [1, 17] },
            as: 'order',
            in: {
              order: '$$order',
              total: {
                $let: {
                  vars: {
                    matchedAppointment: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$appointments',
                            as: 'appointment',
                            cond: { $eq: ['$$appointment.order', '$$order'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: { $ifNull: ['$$matchedAppointment.total', 0] },
                },
              },
              ranges: {
                $let: {
                  vars: {
                    matchedAppointment: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: '$appointments',
                            as: 'appointment',
                            cond: { $eq: ['$$appointment.order', '$$order'] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: { $ifNull: ['$$matchedAppointment.ranges', AGE_RANGES.map(({ name }) => ({ name, total: 0, percent: '0' }))] },
                },
              },
            },
          },
        },
      },
    },
  ]
  
  const initializeAgeRanges= () => AGE_RANGES.map(obj => ({...obj, total:0, percent:0, min: undefined, max: undefined}))

  const initializeResult = () => ({
    total: 0,
    ranges: initializeAgeRanges(),
    appointments: Array.from({ length: 16 }, (_, i) => ({
      order: i + 1,
      total: 0,
      ranges: initializeAgeRanges(),
    })),
  })
  
  const getResultByName = (result, name) => {
    const found = result.find(item => item.name === name)
    return found || { name, ...initializeResult() }
  }
  const result = await Appointment.aggregate(createPipeline())
  const valid = getResultByName(result, APPOINTMENT_STATUS[APPOINTMENT_VALID])
  const tocome = getResultByName(result, APPOINTMENT_STATUS[APPOINTMENT_TO_COME])
  const rabbit = getResultByName(result, APPOINTMENT_STATUS[APPOINTMENT_RABBIT])

  return [valid, tocome, rabbit]
}

module.exports={
  average_webinar_registar, calls_stats, coachings_by_gender_, coachings_calc, coachings_dropped, coachings_finished,
  coachings_ongoing, coachings_renewed, coachings_started, coachings_stats, coachings_stopped, decline_reasons_, diet_activated, 
  diet_coaching_enabled, diet_recruiting, diet_refused, diet_site_enabled, diet_visio_enabled, groups_count, jobs_, join_reasons_, leads_by_campain,
  leads_count, messages_count, nut_advices, ratio_dropped_started, ratio_stopped_started, reasons_users, specificities_users, started_coachings, 
  user_women_count, users_count, users_men_count, users_no_gender_count, validated_appts, webinars_by_company_, webinars_count, webinars_replayed_count,
}

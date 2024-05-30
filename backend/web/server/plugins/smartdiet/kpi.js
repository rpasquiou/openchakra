const mongoose = require('mongoose')
const lodash = require('lodash')
const moment = require('moment')
const Group = require('../../models/Group')
const { APPOINTMENT_TO_COME, APPOINTMENT_VALID, CALL_DIRECTION_IN_CALL, COACHING_STATUS_STARTED, COACHING_STATUS_STOPPED, COACHING_STATUS_NOT_STARTED, COACHING_STATUS_DROPPED, COACHING_STATUS_FINISHED, APPOINTMENT_STATUS, APPOINTMENT_CURRENT, GENDER_FEMALE, GENDER_MALE, GENDER_NON_BINARY, EVENT_WEBINAR, ROLE_CUSTOMER, COMPANY_ACTIVITY_OTHER, CALL_DIRECTION_OUT_CALL, CALL_STATUS_NOT_INTERESTED, CALL_STATUS_UNREACHABLE, APPOINTMENT_VALIDATION_PENDING, APPOINTMENT_RABBIT, ROLE_EXTERNAL_DIET } = require('./consts')
const User = require('../../models/User')
const Lead = require('../../models/Lead')
const Coaching = require('../../models/Coaching')
const Appointment = require('../../models/Appointment')
const Job = require('../../models/Job')
const JoinReason = require('../../models/JoinReason')
const DeclineReason = require('../../models/DeclineReason')
const Webinar = require('../../models/Webinar')
const Company = require('../../models/Company')

const groups_count = async ({ idFilter }) => {
    return await Group.countDocuments({ companies: idFilter })
}
exports.groups_count = groups_count

const messages_count = async ({ idFilter }) => {
    return lodash(await Group.find({companies: idFilter}).populate('messages')).flatten().size() 
}
exports.messages_count = messages_count

const users_count = async ({ idFilter }) => {
    return await User.countDocuments({ company: idFilter})
}
exports.users_count = users_count

const user_women_count = async ({ idFilter }) => {
    return await User.countDocuments({company: idFilter, gender: GENDER_FEMALE})
}
exports.user_women_count = user_women_count
   
const users_men_count = async ({ idFilter }) => {
    return await User.countDocuments({company: idFilter, gender: GENDER_MALE})
}
exports.users_men_count = users_men_count
   
const users_no_gender_count = async ({ idFilter }) => {
    return await User.countDocuments({company: idFilter, gender: GENDER_NON_BINARY})
}
exports.users_no_gender_count = users_no_gender_count
   
const webinars_count = async ({ idFilter }) => {
    return await Webinar.countDocuments({companies: idFilter})
}
exports.webinars_count = webinars_count

const webinars_replayed_count = async ({ idFilter }) => {
    return await User.aggregate([
        {$match: { company: idFilter }},
        {$unwind: '$replayed_events'},
        {$match: { 'replayed_events.__t': EVENT_WEBINAR }},
        {$group: {_id: '$_id', webinarCount: { $sum: 1 }}}
      ])[0]?.webinarCount||0
}
exports.webinars_replayed_count = webinars_replayed_count

const average_webinar_registar = async ({ idFilter }) => {
    const webinars_registered=(await User.aggregate([
        {$match: { company: idFilter }},
        {$unwind: '$registered_events'},
        {$match: { 'registered_events.__t': EVENT_WEBINAR }},
        {$group: {_id: '$_id', webinarCount: { $sum: 1 }}}
      ]))[0]?.webinarCount||0
    const webinarsCount = webinars_count(idFilter)
    return webinarsCount ? webinars_registered*1.0/webinarsCount : 0
}
exports.average_webinar_registar = average_webinar_registar

const started_coachings = async ({ idFilter }) => {
    const usersWithStartedCoaching = await User.aggregate([
        {
          $match: { company: idFilter }
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
exports.started_coachings = started_coachings

const leads_count = async ({ idFilter }) => {
  const companies=await Company.find({_id: idFilter})
    return await Lead.countDocuments({company_code: companies.map(c => c.code)})
}
exports.leads_count = leads_count

exports.specificities_users = async ({ idFilter }) => {
  const specificities_count=await User.aggregate([
    { $match: { role: ROLE_CUSTOMER, company: idFilter}},
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

const reasons_users = async ({ idFilter }) => {
    let userMatch={$match: {_id: {$exists: true}}}
    if (idFilter) {
        const companyUsers=(await User.find({company: idFilter}, {_id:1})).map(({_id}) => _id)
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
exports.reasons_users = reasons_users


const coachingPipeLine = ({ diet, start_date, end_date }) => {
  const matchCondition = {}

  if (start_date) {
    matchCondition.start_date = { $gte: new Date(start_date) }
  }

  if (end_date) {
    matchCondition.end_date = { $lte: new Date(end_date) }
  }

  if (diet) {
    matchCondition.diet = diet
  }

  return matchCondition
}

const initializeAgeRanges = () => {
  const AGE_RANGES = ['18-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65-69', '70-74', 'Unknown']
  return AGE_RANGES.reduce((acc, range) => {
    acc[range] = { count: 0, percent: 0 }
    return acc
  }, {})
}

const formatAgeRanges = (ranges, total) => {
  return Object.keys(ranges).map(key => ({
    name: key,
    value: ranges[key].count,
    percent: total ? ((ranges[key].count / total) * 100).toFixed(2) : '0.00',
  }))
}

const getAppointments = async (matchCondition, basePipeline) => {
  const pipeline = [
    ...basePipeline,
    { $match: matchCondition },
    { $sort: { 'start_date': 1 } },
    {
      $group: {
        _id: '$coaching._id',
        appointments: { $push: '$$ROOT' },
        count: { $sum: 1 },
      },
    },
  ]
  return await Appointment.aggregate(pipeline).allowDiskUse(true).exec()
}

const processStats = (appointments) => {
  const total = appointments.reduce((sum, group) => sum + group.count, 0)
  const counts = Array(16).fill(0)
  const ranges = initializeAgeRanges()
  const rangesPerOrder = Array(16).fill().map(initializeAgeRanges)

  appointments.forEach(group => {
    group.appointments.forEach((appointment, index) => {
      const ageRange = appointment.ageRange
      counts[index] += 1
      ranges[ageRange].count += 1
      rangesPerOrder[index][ageRange].count += 1
    })
  })

  Object.keys(ranges).forEach(key => {
    ranges[key].percent = total ? ((ranges[key].count / total) * 100).toFixed(2) : '0.00'
  })

  rangesPerOrder.forEach(orderRange => {
    const orderTotal = Object.values(orderRange).reduce((sum, range) => sum + range.count, 0)
    Object.keys(orderRange).forEach(key => {
      orderRange[key].percent = orderTotal ? ((orderRange[key].count / orderTotal) * 100).toFixed(2) : '0.00'
    })
  })

  const countsObject = counts.map((count, order) => ({
    order: order + 1,
    total: count,
    ranges: formatAgeRanges(rangesPerOrder[order], count),
  }))

  return { total, ranges, countsObject }
}

const coachings_stats = async ({ id, diet, start_date, end_date }) => {
  const pip = coachingPipeLine({ diet, start_date, end_date })

  const basePipeline = [
    { $match: pip },
    {
      $lookup: {
        from: 'coachings',
        localField: 'coaching',
        foreignField: '_id',
        as: 'coaching',
      },
    },
    { $unwind: '$coaching' },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    {
      $addFields: {
        age: {
          $divide: [
            { $subtract: [new Date(), '$user.birthday'] },
            365 * 24 * 60 * 60 * 1000
          ],
        },
        isUpcoming: { $lt: [new Date(), '$start_date'] },
        isRabbit: { $and: [{ $gt: [new Date(), '$end_date'] }, { $eq: ['$validated', false] }] },
        isValid: { $eq: ['$validated', true] },
        companyMatch: id ? { $eq: ['$user.company', mongoose.Types.ObjectId(id)] } : true,
      },
    },
    {
      $addFields: {
        ageRange: {
          $switch: {
            branches: [
              { case: { $and: [{ $gte: ['$age', 18] }, { $lte: ['$age', 24] }] }, then: '18-24' },
              { case: { $and: [{ $gte: ['$age', 25] }, { $lte: ['$age', 29] }] }, then: '25-29' },
              { case: { $and: [{ $gte: ['$age', 30] }, { $lte: ['$age', 34] }] }, then: '30-34' },
              { case: { $and: [{ $gte: ['$age', 35] }, { $lte: ['$age', 39] }] }, then: '35-39' },
              { case: { $and: [{ $gte: ['$age', 40] }, { $lte: ['$age', 44] }] }, then: '40-44' },
              { case: { $and: [{ $gte: ['$age', 45] }, { $lte: ['$age', 49] }] }, then: '45-49' },
              { case: { $and: [{ $gte: ['$age', 50] }, { $lte: ['$age', 54] }] }, then: '50-54' },
              { case: { $and: [{ $gte: ['$age', 55] }, { $lte: ['$age', 59] }] }, then: '55-59' },
              { case: { $and: [{ $gte: ['$age', 60] }, { $lte: ['$age', 64] }] }, then: '60-64' },
              { case: { $and: [{ $gte: ['$age', 65] }, { $lte: ['$age', 69] }] }, then: '65-69' },
              { case: { $and: [{ $gte: ['$age', 70] }, { $lte: ['$age', 74] }] }, then: '70-74' },
            ],
            default: 'Unknown',
          },
        },
      },
    },
    { $match: { companyMatch: true } },
  ]

  const matchConditions = [
    { isValid: true },
    { isRabbit: true },
    { isUpcoming: true },
  ]

  const appointmentResults = await Promise.all(matchConditions.map(matchCondition => getAppointments(matchCondition, basePipeline)))

  const [validAppointments, rabbitAppointments, upcomingAppointments] = appointmentResults

  const validStats = processStats(validAppointments)
  const rabbitStats = processStats(rabbitAppointments)
  const upcomingStats = processStats(upcomingAppointments)

  const createStatsObject = (name, stats) => ({
    name,
    total: stats.total,
    ranges: formatAgeRanges(stats.ranges, stats.total),
    appointments: stats.countsObject,
  })

  return [
    createStatsObject(APPOINTMENT_STATUS[APPOINTMENT_TO_COME], upcomingStats),
    createStatsObject(APPOINTMENT_STATUS[APPOINTMENT_VALID], validStats),
    createStatsObject(APPOINTMENT_STATUS[APPOINTMENT_RABBIT], rabbitStats),
  ]
}

exports.coachings_stats = coachings_stats


const coachings_by_gender_ = async ({ idFilter, start_date, end_date, diet }) => {

  console.time('Mapping')
  const matchConditions = {
    'coachings.status': {
      $in: [COACHING_STATUS_DROPPED, COACHING_STATUS_FINISHED, COACHING_STATUS_STOPPED],
    },
  }

  if (idFilter) {
    matchConditions._id = idFilter
  }

  const dateConditions = {}
  if (start_date) {
    dateConditions.start_date = { $gte: new Date(start_date) }
  }
  if (end_date) {
    dateConditions.end_date = { ...dateConditions.end_date, $lte: new Date(end_date) }
  }

  const aggregationPipeline = [
    { $match: { _id: idFilter } },
    {
      $lookup: {
        from: 'coachings',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$user', '$$userId'] },
              ...dateConditions,
              ...(diet && { diet: mongoose.Types.ObjectId(diet) }),
            },
          },
        ],
        as: 'coachings',
      },
    },
    { $unwind: '$coachings' },
    { $match: matchConditions },
    {
      $group: {
        _id: '$gender',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        gender: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ]

  

  const result = await User.aggregate(aggregationPipeline).exec()

  const formattedGenderCount = {
    male: 0,
    female: 0,
    non_binary: 0,
    unknown: 0,
  }

  result.forEach(({ gender, count }) => {
    if (gender === 'MALE') {
      formattedGenderCount.male = count
    } else if (gender === 'FEMALE') {
      formattedGenderCount.female = count
    } else if (gender === 'NON_BINARY') {
      formattedGenderCount.non_binary = count
    } else {
      formattedGenderCount.unknown = count
    }
  })
  console.timeEnd('Mapping')

  return formattedGenderCount
}

exports.coachings_by_gender_ = coachings_by_gender_

const nut_advices = async ({ idFilter, diet, start_date, end_date }) => {
  const matchConditions = {
    company: idFilter,
  }

  if (start_date || end_date || diet) {
    const pipeline = [
      { $match: matchConditions },
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'user',
          as: 'appointments',
        },
      },
      { $unwind: '$appointments' },
    ]

    if (start_date) {
      pipeline.push({
        $match: {
          'appointments.start_date': { $gte: new Date(start_date) },
        },
      })
    }

    if (end_date) {
      pipeline.push({
        $match: {
          'appointments.start_date': { $lte: new Date(end_date) },
        },
      })
    }

    if (diet) {
      pipeline.push({
        $match: {
          'appointments.diet': mongoose.Types.ObjectId(diet),
        },
      })
    }

    const usersWithNutAdvices = await User.aggregate(pipeline)
      .group({ _id: '$_id' })
      .exec()

    return usersWithNutAdvices.length
  } else {
    return await User.countDocuments(matchConditions).lean()
  }
}

exports.nut_advices = nut_advices

const coachings_renewed = async ({ idFilter, diet, start_date, end_date }) => {
  const dietFilter = diet ? { diet: mongoose.Types.ObjectId(diet) } : {}
  const dateMatch = {}
  if (start_date!='undefined') {
    dateMatch.$match = {'firstAppointment.start_date':{$gte:new Date(start_date)}}
  }
  else if (end_date!='undefined') {
    dateMatch.$match = {'firstAppointment.start_date':{$lte:new Date(end_date)}}
  }
  else if(end_date!='undefined' && start_date!='undefined'){
    dateMatch.$match = {'firstAppointment.start_date':{$gte:new Date(start_date), $lte:new Date(end_date)}}
  }
  const result = await Coaching.aggregate([
    {
      $match: dietFilter
    },

    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'userDetails'
      }
    },
    {
      $unwind: '$userDetails'
    },
    {
      $match: {
        'userDetails.company': idFilter
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
    
    {
      $unwind: '$appointments'
    },
    {
      $match: {
        'appointments.validated': true
      }
    },
    
    {
      $sort: { 'appointments.start_date': 1 }
    },
    
    {
      $group: {
        _id: '$_id',
        user: { $first: '$user' },
        firstAppointment: { $first: '$appointments' }
      }
    },
    
    {...dateMatch},
    {
      $group: {
        _id: '$user',
        coachingCount: { $sum: 1 }
      }
    },
    
    {
      $addFields: {
        adjustedCount: { $max: [{ $subtract: ['$coachingCount', 1] }, 0] }
      }
    },
    
    {
      $group: {
        _id: null,
        totalRenewed: { $sum: '$adjustedCount' }
      }
    },
    {
      $project: {
        _id: 0,
        totalRenewed: 1
      }
    }
  ]).exec()

  return result.length > 0 ? result[0].totalRenewed : 0
}
exports.coachings_renewed = coachings_renewed

const jobs_ = async (idFilter) => {
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
exports.jobs_ = jobs_

const join_reasons_ = async (idFilter) => {
    const leads = await Lead.find({ id: idFilter })
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
exports.join_reasons_ = join_reasons_
  
const decline_reasons_ = async (idFilter) => {
    const leads = await Lead.find({ id: idFilter })

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
exports.decline_reasons_ = decline_reasons_

const ratio_stopped_started = async ({idFilter, diet, start_date, end_date}) => {
    const coachingsStopped= await coachings_stopped({idFilter, diet, start_date, end_date})
    const coachingsStarted= await coachings_started({idFilter, diet, start_date, end_date})
    return coachingsStarted!=0 ? Number((coachingsStopped / coachingsStarted * 100).toFixed(2)) : 0
}
exports.ratio_stopped_started = ratio_stopped_started

const ratio_dropped_started = async ({idFilter, diet, start_date, end_date}) => {
  const coachingsDropped= await coachings_dropped({idFilter, diet, start_date, end_date})
  const coachingsStarted= await coachings_started({idFilter, diet, start_date, end_date})
    return coachingsStarted!=0 ? Number((coachingsDropped / coachingsStarted * 100).toFixed(2)) : 0
}
exports.ratio_dropped_started = ratio_dropped_started

const leads_by_campain = async (idFilter) => {
    const leads=await Lead.find()
    const leadsTotal=leads.length
    const leadsByCampain=[]
    const groupedLeadsByCampain=lodash.groupBy(leads, 'campain')
    for(let campain in groupedLeadsByCampain){
      const campainName= campain!='undefined' && campain!='null' ? campain : 'unknown'
      leadsByCampain[campainName]=(leadsByCampain[campainName] || 0) + groupedLeadsByCampain[campain].length; 
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
exports.leads_by_campain = leads_by_campain

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
exports.webinars_by_company_ = webinars_by_company_

const getOperatorName = async (operatorId) => {
  const user = await User.findById(operatorId)
  return user ? user.fullname : "unknown"
}


const calls_stats = async ({ idFilter, company }) => {
  let userEmailFilter ={}
  if (company) {
    const users = await User.find({ company: company }).select('email').lean()
    const userEmails = users.map(user => user.email)
    userEmailFilter = { email: { $in: userEmails } }
  }
  const incallsTotal = await Lead.countDocuments({ operator:idFilter, ...userEmailFilter, call_direction: CALL_DIRECTION_IN_CALL })
  const outcallsTotal = await Lead.countDocuments({ operator:idFilter, ...userEmailFilter, call_direction: CALL_DIRECTION_OUT_CALL })
  const callsTotal = await Lead.countDocuments({ operator:idFilter, ...userEmailFilter, call_direction: { $in: [CALL_DIRECTION_IN_CALL, CALL_DIRECTION_OUT_CALL] } })
  const nutAdvicesTotal = await Lead.countDocuments({ operator:idFilter, ...userEmailFilter, nutrition_converted: true })
  const coachingsTotal = await Lead.countDocuments({ operator:idFilter, ...userEmailFilter, coaching_converted: true })
  const declinedTotal = await Lead.countDocuments({ operator:idFilter, ...userEmailFilter, call_status: CALL_STATUS_NOT_INTERESTED })
  const unreachablesTotal = await Lead.countDocuments({ operator:idFilter, ...userEmailFilter, call_status: CALL_STATUS_UNREACHABLE })
  const usefulContactsTotal = await Lead.countDocuments({
    $or: [
      { operator:idFilter, ...userEmailFilter, nutrition_converted: true },
      { operator:idFilter, ...userEmailFilter, coaching_converted: true },
      { operator:idFilter, ...userEmailFilter, call_status: CALL_STATUS_NOT_INTERESTED }
    ]
  })

  const stats = await Lead.find({operator:idFilter, ...userEmailFilter})
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

exports.calls_stats = calls_stats

const buildMatchCondition = async ({ idFilter, diet, start_date, end_date, status }) => {
  const matchCondition = { status }

  if (start_date || end_date) {
    matchCondition['appointments.start_date'] = {}
    if (start_date) {
      matchCondition['appointments.start_date'].$gte = new Date(start_date)
    }
    if (end_date) {
      matchCondition['appointments.start_date'].$lte = new Date(end_date)
    }
  }

  if (diet && mongoose.Types.ObjectId.isValid(diet)) {
    matchCondition['appointments.diet'] = mongoose.Types.ObjectId(diet)
  }

  if (idFilter && mongoose.Types.ObjectId.isValid(idFilter)) {
    const users = await User.find({ company: idFilter }).select('_id').lean()
    const userIds = users.map(user => user._id)
    matchCondition['user'] = { $in: userIds }
  }

  return matchCondition
}

const createAggregationPipeline = (matchCondition) => [
  { $match: matchCondition },
  {
    $lookup: {
      from: 'appointments',
      let: { coachingId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: { $eq: ['$$coachingId', '$coaching'] },
            ...(matchCondition['appointments.start_date'] && { start_date: matchCondition['appointments.start_date'] }),
            ...(matchCondition['appointments.diet'] && { diet: matchCondition['appointments.diet'] }),
          },
        },
      ],
      as: 'appointments',
    },
  },
  { $match: { 'appointments.0': { $exists: true } } },
  { $group: { _id: null, count: { $sum: 1 } } },
]


const coachings_started = async ({ idFilter, diet, start_date, end_date }) => {
    if (diet == undefined && idFilter.$ne != 'null' && start_date == undefined && end_date == undefined) {
      return await Coaching.countDocuments({ status: { $ne: COACHING_STATUS_NOT_STARTED } })
    }

    const matchCondition = await buildMatchCondition({ idFilter, diet, start_date, end_date, status: { $ne: COACHING_STATUS_NOT_STARTED } })

    if (!start_date && !end_date && !idFilter && !diet) {
      return await Coaching.countDocuments(matchCondition)
    }

    const aggregationPipeline = createAggregationPipeline(matchCondition)
    const result = await Coaching.aggregate(aggregationPipeline).exec()
    return result.length > 0 ? result[0].count : 0
}

exports.coachings_started = coachings_started

const coachings_stopped = async ({ idFilter, diet, start_date, end_date }) => {
    if (diet == undefined && idFilter.$ne != 'null' && start_date == undefined && end_date == undefined) {
      return await Coaching.countDocuments({ status: COACHING_STATUS_STOPPED })
    }
    const matchCondition = await buildMatchCondition({ idFilter, diet, start_date, end_date, status: COACHING_STATUS_STOPPED })
    const aggregationPipeline = createAggregationPipeline(matchCondition)
    const result = await Coaching.aggregate(aggregationPipeline).exec()
    return result.length > 0 ? result[0].count : 0
}

exports.coachings_stopped = coachings_stopped

const coachings_dropped = async ({ idFilter, diet, start_date, end_date }) => {
    if (diet == undefined && idFilter.$ne != 'null' && start_date == undefined && end_date == undefined) {
      return await Coaching.countDocuments({ status: COACHING_STATUS_DROPPED })
    }
    const matchCondition = await buildMatchCondition({ idFilter, diet, start_date, end_date, status: COACHING_STATUS_DROPPED })
    const aggregationPipeline = createAggregationPipeline(matchCondition)
    const result = await Coaching.aggregate(aggregationPipeline).exec()
    return result.length > 0 ? result[0].count : 0
}

exports.coachings_dropped = coachings_dropped

const coachings_ongoing = async ({ idFilter, diet, start_date, end_date }) => {
    if (diet == undefined && idFilter.$ne != 'null' && start_date == undefined && end_date == undefined) {
      return await Coaching.countDocuments({ status: COACHING_STATUS_STARTED })
    }
    const matchCondition = await buildMatchCondition({ idFilter, diet, start_date, end_date, status: COACHING_STATUS_STARTED })
    const aggregationPipeline = createAggregationPipeline(matchCondition)
    const result = await Coaching.aggregate(aggregationPipeline).exec()
    return result.length > 0 ? result[0].count : 0
}

exports.coachings_ongoing = coachings_ongoing

const coachings_finished = async ({ idFilter, diet, start_date, end_date }) => {
    if (diet == undefined && idFilter.$ne != 'null' && start_date == undefined && end_date == undefined) {
      return await Coaching.countDocuments({ status: COACHING_STATUS_FINISHED })
    }
    const matchCondition = await buildMatchCondition({ idFilter, diet, start_date, end_date, status: COACHING_STATUS_FINISHED })
    const aggregationPipeline = createAggregationPipeline(matchCondition)
    const result = await Coaching.aggregate(aggregationPipeline).exec()
    return result.length > 0 ? result[0].count : 0
}

exports.coachings_finished = coachings_finished

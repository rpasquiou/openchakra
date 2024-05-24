const mongoose = require('mongoose')
const lodash = require('lodash')
const moment = require('moment')
const Group = require('../../models/Group')
const { APPOINTMENT_TO_COME, APPOINTMENT_VALID, CALL_DIRECTION_IN_CALL, COACHING_STATUS_STARTED, COACHING_STATUS_STOPPED, COACHING_STATUS_NOT_STARTED, COACHING_STATUS_DROPPED, COACHING_STATUS_FINISHED, APPOINTMENT_STATUS, APPOINTMENT_CURRENT, GENDER_FEMALE, GENDER_MALE, GENDER_NON_BINARY, EVENT_WEBINAR, ROLE_CUSTOMER, COMPANY_ACTIVITY_OTHER, CALL_DIRECTION_OUT_CALL, CALL_STATUS_NOT_INTERESTED, CALL_STATUS_UNREACHABLE } = require('./consts')
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
   

const coachings_started = async ({ idFilter, diet, startDate, endDate }) => {
  const matchCondition = { status: { $ne: COACHING_STATUS_NOT_STARTED } }

  // Build match condition for the date range
  if (startDate || endDate) {
    matchCondition['appointments.start_date'] = {}
    if (startDate) {
      matchCondition['appointments.start_date'].$gte = new Date(startDate)
    }
    if (endDate) {
      matchCondition['appointments.start_date'].$lte = new Date(endDate)
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

  if (!startDate && !endDate && !idFilter && !diet) {
    return await Coaching.countDocuments({ status: { $ne: COACHING_STATUS_NOT_STARTED } })
  }

  const aggregationPipeline = [
    { $match: matchCondition },
    { 
      $lookup: { 
        from: 'appointments', 
        localField: '_id', 
        foreignField: 'coaching', 
        as: 'appointments' 
      } 
    },
    { $unwind: '$appointments' },
    { $match: matchCondition },
    { 
      $lookup: { 
        from: 'users', 
        localField: 'user', 
        foreignField: '_id', 
        as: 'user' 
      } 
    },
    { $unwind: '$user' },
    { $group: { _id: '$_id' } },
    { $count: 'count' }
  ]

  // Execute the aggregation pipeline
  const result = await Coaching.aggregate(aggregationPipeline).exec()
  return result.length > 0 ? result[0].count : 0
}

exports.coachings_started = coachings_started

   
const coachings_stopped = async ({ idFilter, diet, startDate, endDate }) => {
  const matchCondition = { status: COACHING_STATUS_STOPPED }

  if (startDate || endDate) {
    matchCondition['appointments.end_date'] = {}
    if (startDate) {
      matchCondition['appointments.end_date'].$gte = new Date(startDate)
    }
    if (endDate) {
      matchCondition['appointments.end_date'].$lte = new Date(endDate)
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

  const aggregationPipeline = [
    { $match: matchCondition },
    { $lookup: { from: 'appointments', localField: '_id', foreignField: 'coaching', as: 'appointments' } },
    { $unwind: '$appointments' },
    { $match: matchCondition },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $group: { _id: '$_id' } },
    { $count: 'count' }
  ]

  const result = await Coaching.aggregate(aggregationPipeline).exec()
  return result.length > 0 ? result[0].count : 0
}

exports.coachings_stopped = coachings_stopped
   
const coachings_dropped = async ({ idFilter, diet, startDate, endDate }) => {
  const matchCondition = { status: COACHING_STATUS_DROPPED }

  if (startDate || endDate) {
    matchCondition['appointments.end_date'] = {}
    if (startDate) {
      matchCondition['appointments.end_date'].$gte = new Date(startDate)
    }
    if (endDate) {
      matchCondition['appointments.end_date'].$lte = new Date(endDate)
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

  const aggregationPipeline = [
    { $match: matchCondition },
    { $lookup: { from: 'appointments', localField: '_id', foreignField: 'coaching', as: 'appointments' } },
    { $unwind: '$appointments' },
    { $match: matchCondition },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $group: { _id: '$_id' } },
    { $count: 'count' }
  ]

  const result = await Coaching.aggregate(aggregationPipeline).exec()
  return result.length > 0 ? result[0].count : 0
}

exports.coachings_dropped = coachings_dropped
   
const coachings_ongoing = async ({ idFilter, diet, startDate, endDate }) => {
  const matchCondition = { status: COACHING_STATUS_STARTED }

  if (startDate || endDate) {
    matchCondition['appointments.start_date'] = {}
    if (startDate) {
      matchCondition['appointments.start_date'].$gte = new Date(startDate)
    }
    if (endDate) {
      matchCondition['appointments.start_date'].$lte = new Date(endDate)
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

  const aggregationPipeline = [
    { $match: matchCondition },
    { $lookup: { from: 'appointments', localField: '_id', foreignField: 'coaching', as: 'appointments' } },
    { $unwind: '$appointments' },
    { $match: matchCondition },
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $group: { _id: '$_id' } },
    { $count: 'count' }
  ]

  const result = await Coaching.aggregate(aggregationPipeline).exec()
  return result.length > 0 ? result[0].count : 0
}

exports.coachings_ongoing = coachings_ongoing

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
        from: "targets", // Target collection
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
    { $sort: { count: 1 } } // Sort by count in descending order
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


const coachingPipeLine = ({ idFilter, startDate, endDate }) => {
  const matchCondition = {}

  if (startDate) {
    matchCondition.start_date = { $gte: new Date(startDate) }
  }

  if (endDate) {
    matchCondition.end_date = { $lte: new Date(endDate) }
  }

  const pip = { diet: idFilter, ...matchCondition }
  return pip
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
    percent: total ? ((ranges[key].count / total) * 100).toFixed(2) : '0.00'
  }))
}

const coachings_stats = async ({ idFilter, company, startDate, endDate }) => {
  const pip = coachingPipeLine({ idFilter, startDate, endDate })
  const basePipeline = [
    { $match: pip },
    {
      $lookup: {
        from: 'coachings',
        localField: 'coaching',
        foreignField: '_id',
        as: 'coaching'
      }
    },
    { $unwind: '$coaching' },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $addFields: {
        validated: { $eq: ['$validated', true] },
        isUpcoming: { $lt: [new Date(), '$start_date'] },
        companyMatch: company ? { $eq: ['$user.company', mongoose.Types.ObjectId(company)] } : true,
        order: {
          $reduce: {
            input: '$appointments',
            initialValue: 0,
            in: {
              $cond: {
                if: { $lt: ['$$this.start_date', '$start_date'] },
                then: { $add: ['$$value', 1] },
                else: '$$value'
              }
            }
          }
        },
        age: {
          $dateDiff: {
            startDate: "$user.birthday",
            endDate: "$$NOW",
            unit: "year"
          }
        }
      }
    },
    {
      $addFields: {
        ageRange: {
          $switch: {
            branches: [
              { case: { $and: [{ $gte: ["$age", 18] }, { $lte: ["$age", 24] }] }, then: "18-24" },
              { case: { $and: [{ $gte: ["$age", 25] }, { $lte: ["$age", 29] }] }, then: "25-29" },
              { case: { $and: [{ $gte: ["$age", 30] }, { $lte: ["$age", 34] }] }, then: "30-34" },
              { case: { $and: [{ $gte: ["$age", 35] }, { $lte: ["$age", 39] }] }, then: "35-39" },
              { case: { $and: [{ $gte: ["$age", 40] }, { $lte: ["$age", 44] }] }, then: "40-44" },
              { case: { $and: [{ $gte: ["$age", 45] }, { $lte: ["$age", 49] }] }, then: "45-49" },
              { case: { $and: [{ $gte: ["$age", 50] }, { $lte: ["$age", 54] }] }, then: "50-54" },
              { case: { $and: [{ $gte: ["$age", 55] }, { $lte: ["$age", 59] }] }, then: "55-59" },
              { case: { $and: [{ $gte: ["$age", 60] }, { $lte: ["$age", 64] }] }, then: "60-64" },
              { case: { $and: [{ $gte: ["$age", 65] }, { $lte: ["$age", 69] }] }, then: "65-69" },
              { case: { $and: [{ $gte: ["$age", 70] }, { $lte: ["$age", 74] }] }, then: "70-74" },
            ],
            default: "Unknown"
          }
        }
      }
    },
    { $match: { companyMatch: true } }
  ]

  const validPipeline = [
    ...basePipeline,
    { $match: { validated: true } },
    { $sort: { 'start_date': 1 } },
    {
      $group: {
        _id: '$coaching._id',
        appointments: { $push: '$$ROOT' },
        count: { $sum: 1 }
      }
    }
  ]

  const upcomingPipeline = [
    ...basePipeline,
    { $match: { isUpcoming: true } },
    { $sort: { 'start_date': 1 } },
    {
      $group: {
        _id: '$coaching._id',
        appointments: { $push: '$$ROOT' },
        count: { $sum: 1 }
      }
    }
  ]

  const [validAppointments, upcomingAppointments] = await Promise.all([
    Appointment.aggregate(validPipeline).allowDiskUse(true).exec(),
    Appointment.aggregate(upcomingPipeline).allowDiskUse(true).exec()
  ])

  const totalValid = validAppointments.reduce((sum, group) => sum + group.count, 0)
  const totalUpcoming = upcomingAppointments.reduce((sum, group) => sum + group.count, 0)

  const validCounts = Array(16).fill(0)
  const upcomingCounts = Array(16).fill(0)

  const validRanges = initializeAgeRanges()
  const upcomingRanges = initializeAgeRanges()

  const validRangesPerOrder = Array(16).fill().map(initializeAgeRanges)
  const upcomingRangesPerOrder = Array(16).fill().map(initializeAgeRanges)

  validAppointments.forEach(group => {
    group.appointments.forEach((appointment, index) => {
      const ageRange = appointment.ageRange
      validCounts[index] += 1
      validRanges[ageRange].count += 1
      validRangesPerOrder[index][ageRange].count += 1
    })
  })

  upcomingAppointments.forEach(group => {
    group.appointments.forEach((appointment, index) => {
      const ageRange = appointment.ageRange
      upcomingCounts[index] += 1
      upcomingRanges[ageRange].count += 1
      upcomingRangesPerOrder[index][ageRange].count += 1
    })
  })

  Object.keys(validRanges).forEach(key => {
    validRanges[key].percent = totalValid ? ((validRanges[key].count / totalValid) * 100).toFixed(2) : '0.00'
  })

  Object.keys(upcomingRanges).forEach(key => {
    upcomingRanges[key].percent = totalUpcoming ? ((upcomingRanges[key].count / totalUpcoming) * 100).toFixed(2) : '0.00'
  })

  validRangesPerOrder.forEach(orderRange => {
    const orderTotal = Object.values(orderRange).reduce((sum, range) => sum + range.count, 0)
    Object.keys(orderRange).forEach(key => {
      orderRange[key].percent = orderTotal ? ((orderRange[key].count / orderTotal) * 100).toFixed(2) : '0.00'
    })
  })

  upcomingRangesPerOrder.forEach(orderRange => {
    const orderTotal = Object.values(orderRange).reduce((sum, range) => sum + range.count, 0)
    Object.keys(orderRange).forEach(key => {
      orderRange[key].percent = orderTotal ? ((orderRange[key].count / orderTotal) * 100).toFixed(2) : '0.00'
    })
  })

  const validCountsObject = validCounts.map((count, order) => ({
    order: order + 1,
    total: count,
    ranges: formatAgeRanges(validRangesPerOrder[order], count)
  }))

  const upcomingCountsObject = upcomingCounts.map((count, order) => ({
    order: order + 1,
    total: count,
    ranges: formatAgeRanges(upcomingRangesPerOrder[order], count)
  }))

  const coachingsValidApp = {
    name: APPOINTMENT_STATUS[APPOINTMENT_VALID],
    total: totalValid,
    ranges: formatAgeRanges(validRanges, totalValid),
    appointments: validCountsObject
  }

  const coachingsUpcomingApp = {
    name: APPOINTMENT_STATUS[APPOINTMENT_TO_COME],
    total: totalUpcoming,
    ranges: formatAgeRanges(upcomingRanges, totalUpcoming),
    appointments: upcomingCountsObject
  }
  return [coachingsUpcomingApp, coachingsValidApp]
}

exports.coachings_stats = coachings_stats

const coachings_gender_ = async ({ idFilter }) => {
  const usersWithCoachingsByGender = await User.aggregate([
    { $match: { _id: idFilter } },
    {
      $lookup: {
        from: 'coachings',
        localField: '_id',
        foreignField: 'user',
        as: 'coachings'
      }
    },
    { $unwind: '$coachings' },
    {
      $match: {
        'coachings.status': {
          $in: [COACHING_STATUS_DROPPED, COACHING_STATUS_FINISHED, COACHING_STATUS_STOPPED]
        }
      }
    },
    {
      $group: {
        _id: '$gender',
        count: { $sum: 1 }
      }
    }
  ])

  const formattedGenderCount = {
    male: 0,
    female: 0,
    non_binary: 0,
    unknown: 0
  }

  usersWithCoachingsByGender.forEach(({ _id, count }) => {
    if (_id === 'MALE') {
      formattedGenderCount.male += count
    } else if (_id === 'FEMALE') {
      formattedGenderCount.female += count
    } else if (_id === 'NON_BINARY') {
      formattedGenderCount.non_binary += count
    } else {
      formattedGenderCount.unknown += count
    }
  })
  
  return formattedGenderCount
}
exports.coachings_gender_ = coachings_gender_

const nut_advices = async ({ idFilter }) => {
  const nutAdvices=await User.aggregate([
    {
      $match:
      {
        company: idFilter,
      },
    },
  ])
  return nutAdvices.length 
}
exports.nut_advices = nut_advices

const coachings_renewed = async ({ idFilter }) => {
  const currentYear = moment().year()
  const previousYear = currentYear - 1
  const currentMonth = moment().month()

  const users = await User.find({ company: idFilter }).select('_id').lean()
  const userIds = users.map(user => user._id)

  const pipeline = [
    { $match: { user: { $in: userIds } } },
    { $lookup: { from: 'appointments', localField: '_id', foreignField: 'coaching', as: 'appointments' } },
    { $unwind: '$appointments' },
    {
      $project: {
        user: 1,
        startDate: '$appointments.start_date',
        year: { $year: '$appointments.start_date' },
        month: { $month: '$appointments.start_date' }
      }
    },
    {
      $group: {
        _id: '$user',
        coachingsThisYear: {
          $sum: {
            $cond: [{ $eq: ['$year', currentYear] }, 1, 0]
          }
        },
        coachingsLastYearOrAfter: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $eq: ['$year', previousYear] },
                  { $and: [{ $eq: ['$year', currentYear] }, { $lte: ['$month', currentMonth] }] }
                ]
              },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $match: {
        coachingsThisYear: { $gt: 0 },
        coachingsLastYearOrAfter: { $gt: 0 }
      }
    },
    { $count: 'renewedCount' }
  ]

  const result = await Coaching.aggregate(pipeline).exec()
  return result.length > 0 ? result[0].renewedCount : 0
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

const ratio_stopped_started = async ({idFilter, diet, startDate, endDate}) => {
    const coachingsStopped= await coachings_stopped({idFilter, diet, startDate, endDate})
    const coachingsStarted= await coachings_started({idFilter, diet, startDate, endDate})
    return Number((coachingsStopped / coachingsStarted * 100).toFixed(2))
}
exports.ratio_stopped_started = ratio_stopped_started

const ratio_dropped_started = async ({idFilter, diet, startDate, endDate}) => {
  const coachingsDropped= await coachings_dropped({idFilter, diet, startDate, endDate})
  const coachingsStarted= await coachings_started({idFilter, diet, startDate, endDate})
    return Number((coachingsDropped / coachingsStarted * 100).toFixed(2))
}
exports.ratio_dropped_started = ratio_dropped_started



const incalls_per_operator_ = async (idFilter) => {
    const matchCondition = { call_direction: CALL_DIRECTION_IN_CALL }
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition)
    return {
        incalls_per_operator_total: total,
        incalls_per_operator_details: details
    }
}
exports.incalls_per_operator_ = incalls_per_operator_

const outcalls_per_operator_ = async (idFilter) => {
    const matchCondition = { call_direction: CALL_DIRECTION_OUT_CALL }
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition)
    return {
        outcalls_per_operator_total: total,
        outcalls_per_operator_details: details
    }
}
exports.outcalls_per_operator_ = outcalls_per_operator_

const nut_advices_per_operator_ = async (idFilter) => {
    const matchCondition = { nutrition_converted: true }
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition)
    return {
        nut_advices_per_operator_total: total,
        nut_advices_per_operator_details: details
    }
}
exports.nut_advices_per_operator_ = nut_advices_per_operator_

const coachings_per_operator_ = async (idFilter) => {
    const matchCondition = { coaching_converted: true }
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition)
    return {
        coachings_per_operator_total: total,
        coachings_per_operator_details: details
    }
}
exports.coachings_per_operator_ = coachings_per_operator_

const declined_per_operator_ = async (idFilter) => {
    const matchCondition = { call_status: 'CALL_STATUS_NOT_INTERESTED' }
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition)
    return {
        declined_per_operator_total: total,
        declined_per_operator_details: details
    }
}
exports.declined_per_operator_ = declined_per_operator_

const unreachables_per_operator_ = async (idFilter) => {
    const matchCondition = { call_status: 'CALL_STATUS_UNREACHABLE' }
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition)
    return {
        unreachables_per_operator_total: total,
        unreachables_per_operator_details: details
    }
}
exports.unreachables_per_operator_ = unreachables_per_operator_

const useful_contacts_per_operator_ = async (idFilter) => {
    const matchCondition = {
      $or: [
        { nutrition_converted: true },
        { coaching_converted: true },
        { call_status: 'CALL_STATUS_NOT_INTERESTED' }
      ]
    }
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition)
    return {
      useful_contacts_per_operator_total: total,
      useful_contacts_per_operator_details: details
    }
}
exports.useful_contacts_per_operator_ = useful_contacts_per_operator_

const renewed_coachings_per_operator_ = async (idFilter) => {
    const leads = await Lead.find({ id: idFilter })
  
    const groupedLeadsByOp = lodash.groupBy(leads, 'operator')
    let renewedCoachingsPerOperatorTotal = 0
    const renewedCoachingsPerOperator = []
  
    for (const operator in groupedLeadsByOp) {
      const leadByOp = groupedLeadsByOp[operator]
      const renewedCoachings = {}
  
      leadByOp.forEach(lead => {
        if (lead.coaching_converted) {
          renewedCoachings[lead.email] = (renewedCoachings[lead.email] || 0) + 1
        }
      })
  
      const operatorName = operator !== 'undefined' ? await getOperatorName(operator) : 'unknown'
      const renewedCoachingsTotal = Object.values(renewedCoachings).reduce((sum, count) => sum + count, 0)
      renewedCoachingsPerOperator.push({ name: operatorName, value: renewedCoachingsTotal })
      renewedCoachingsPerOperatorTotal += renewedCoachingsTotal
    }
  
    return {
      renewed_coachings_per_operator_total: renewedCoachingsPerOperatorTotal,
      renewed_coachings_per_operator_details: renewedCoachingsPerOperator
    }
  }
exports.renewed_coachings_per_operator_ = renewed_coachings_per_operator_
  
const coa_cu_transformation_per_operator_ = async (idFilter) => {
    const leads = await Lead.find({ id: idFilter })
  
    const groupedLeadsByOp = lodash.groupBy(leads, 'operator')
    let coaCuTransformationPerOperatorTotal = 0
    const coaCuTransformationPerOperator = []
  
    for (const operator in groupedLeadsByOp) {
      const leadByOp = groupedLeadsByOp[operator]
      let coa = 0
      let usefulContacts = 0
  
      leadByOp.forEach(lead => {
        if (lead.coaching_converted) {
          coa += 1
        }
        if (lead.nutrition_converted || lead.coaching_converted || lead.call_status === 'CALL_STATUS_NOT_INTERESTED') {
          usefulContacts += 1
        }
      })
  
      const operatorName = operator !== 'undefined' ? await getOperatorName(operator) : 'unknown'
      const coaCuTransformation = usefulContacts !== 0 ? Number((coa / usefulContacts * 100).toFixed(2)) : 0
      coaCuTransformationPerOperator.push({ name: operatorName, value: coaCuTransformation })
      coaCuTransformationPerOperatorTotal += coaCuTransformation
    }
  
    return {
      coa_cu_transformation_per_operator_total: coaCuTransformationPerOperatorTotal,
      coa_cu_transformation_per_operator_details: coaCuTransformationPerOperator
    }
  }
exports.coa_cu_transformation_per_operator_ = coa_cu_transformation_per_operator_
  
const cn_cu_transformation_per_operator_ = async (idFilter) => {
    const leads = await Lead.find({ id: idFilter })
  
    const groupedLeadsByOp = lodash.groupBy(leads, 'operator')
    let cnCuTransformationPerOperatorTotal = 0
    const cnCuTransformationPerOperator = []
  
    for (const operator in groupedLeadsByOp) {
      const leadByOp = groupedLeadsByOp[operator]
      let nutAdvices = 0
      let usefulContacts = 0
  
      leadByOp.forEach(lead => {
        if (lead.nutrition_converted) {
          nutAdvices += 1
        }
        if (lead.nutrition_converted || lead.coaching_converted || lead.call_status === 'CALL_STATUS_NOT_INTERESTED') {
          usefulContacts += 1
        }
      })
  
      const operatorName = operator !== 'undefined' ? await getOperatorName(operator) : 'unknown'
      const cnCuTransformation = usefulContacts !== 0 ? Number((nutAdvices / usefulContacts * 100).toFixed(2)) : 0
      cnCuTransformationPerOperator.push({ name: operatorName, value: cnCuTransformation })
      cnCuTransformationPerOperatorTotal += cnCuTransformation
    }
  
    return {
      cn_cu_transformation_per_operator_total: cnCuTransformationPerOperatorTotal,
      cn_cu_transformation_per_operator_details: cnCuTransformationPerOperator
    }
}
exports.cn_cu_transformation_per_operator_ = cn_cu_transformation_per_operator_

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

const pipeline = (idFilter, matchCondition) => ([
  { $match: { ...matchCondition } },
  { $group: { _id: '$operator', count: { $sum: 1 } } }
])

const getOperatorName = async (operatorId) => {
  const user = await User.findById(operatorId)
  return user ? user.fullname : "unknown"
}

const aggregateLeadsByField = async (idFilter, matchCondition) => {
  const pip = pipeline(idFilter, matchCondition)
  const result = await Lead.aggregate(pip)
  let total = 0
  const details = await Promise.all(result.map(async (item) => {
      const operatorId = item._id
      const count = item.count
      total += count
      const operatorName = operatorId ? await getOperatorName(operatorId) : "unknown"
      return { name: operatorName, value: count }
  }))
  return { total, details }
}

const calls_stats = async({idFilter}) =>{
  const incallsTotal = await Lead.countDocuments({call_direction:CALL_DIRECTION_IN_CALL})
  const oucallsTotal = await Lead.countDocuments({call_direction:CALL_DIRECTION_OUT_CALL})
  const callsTotal = await Lead.countDocuments({call_direction:{$in:[CALL_DIRECTION_IN_CALL, CALL_DIRECTION_OUT_CALL]}})
  const nutAdvicesTotal = await Lead.countDocuments({nutrition_converted:true})
  const coachingsTotal = await Lead.countDocuments({coaching_converted:true})
  const declinedTotal = await Lead.countDocuments({call_status:CALL_STATUS_NOT_INTERESTED})
  const unreachablesTotal = await Lead.countDocuments({call_status:CALL_STATUS_UNREACHABLE})
  const usefulContactsTotal = await Lead.countDocuments({$or: [
    { nutrition_converted: true },
    { coaching_converted: true },
    { call_status: CALL_STATUS_NOT_INTERESTED }
  ]})

  const inCallsDetails = {}

  let stats = await Lead.find()
  stats = lodash.groupBy(stats, 'operator')
  for(let operatorId in stats){
    const operatorDetails = stats[operatorId]
    const operatorName = await User.find({_id: operatorId})
  }

  return({incallsTotal,oucallsTotal,callsTotal,nutAdvicesTotal,coachingsTotal,declinedTotal,unreachablesTotal,usefulContactsTotal,})
}
exports.calls_stats = calls_stats
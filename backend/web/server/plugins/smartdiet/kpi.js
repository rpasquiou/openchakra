const mongoose = require('mongoose');
const lodash = require('lodash');
const moment = require('moment');
const Group = require('../../models/Group');
const { APPOINTMENT_TO_COME, APPOINTMENT_VALID, CALL_DIRECTION_IN_CALL, COACHING_STATUS_STARTED, COACHING_STATUS_STOPPED, COACHING_STATUS_NOT_STARTED, COACHING_STATUS_DROPPED } = require('./consts');
const User = require('../../models/User');
const Lead = require('../../models/Lead');
const Coaching = require('../../models/Coaching');
const Appointment = require('../../models/Appointment');

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
   
const coachings_started = async ({ idFilter }) => {
    return await Coaching.countDocuments({status:{$ne:COACHING_STATUS_NOT_STARTED}})
}
exports.coachings_started = coachings_started
   
const coachings_stopped = async ({ idFilter }) => {
    return await Coaching.countDocuments({status:{$eq:COACHING_STATUS_STOPPED}})
}
exports.coachings_stopped = coachings_stopped
   
const coachings_dropped = async ({ idFilter }) => {
    return await Coaching.countDocuments({status:{$eq:COACHING_STATUS_DROPPED}})
}
exports.coachings_dropped = coachings_dropped
   
const coachings_ongoing = async ({ idFilter }) => {
    return await Coaching.countDocuments({status:{$eq:COACHING_STATUS_STARTED}})
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
    return await Lead.countDocuments({company_code: companies.map(c => c.code)})
}
exports.leads_count = leads_count

const specificities_count = async ({ idFilter }) => {
    const specsCount = await User.aggregate([
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
  return specsCount.map(({count, name})=> ({x:name, y:count}))
}
exports.specificities_count = specificities_count

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

const cs_done = async ({ idFilter }) => {
    const result = await Appointment.aggregate([
      {
        $match: {
          _id: idFilter,
          status: APPOINTMENT_VALID
        }
      },
      {
        $group: {
          _id: "$order",
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" }
        }
      }
    ])
    return result[0] ? result[0].total : 0
}
exports.cs_done = cs_done

const cs_upcoming = async ({ idFilter }) => {
  const appointments = await Appointment.aggregate([
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
          $match: {
              _id: idFilter,
              status: APPOINTMENT_TO_COME
          }
      },
      {
          $group: {
              _id: null,
              total: { $sum: 1 }
          }
      }
  ]);

  return appointments[0] 
};

exports.cs_upcoming = cs_upcoming;



const cs_done_c = async ({ idFilter }) => {
    const appointments = await Appointment.aggregate([
        { $match: { _id:  idFilter  } },
        {
            $lookup: {
                from: 'coachings',
                localField: 'coaching',
                foreignField: '_id',
                as: 'coaching'
            }
        },
        { $unwind: '$coaching' },
        { $unwind: '$coaching.appointments' },
        {
            $match: { status: 'APPOINTMENT_VALID' }
        },
        {
            $group: {
                _id: '$coaching.order',
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    const result = Array(16).fill(0);
    appointments.forEach(appointment => {
        if (appointment._id >= 1 && appointment._id <= 16) {
            result[appointment._id - 1] = appointment.count;
        }
    });

    return result;
}
exports.cs_done_c = cs_done_c

const cs_upcoming_c = async ({ idFilter }) => {
  const appointments = await Appointment.aggregate([
      { $match: { 'coaching.appointments.status': 'APPOINTMENT_TO_COME' } },
      {
          $unwind: '$coaching'
      },
      {
          $unwind: '$coaching.appointments'
      },
      {
          $match: { 'coaching.appointments.status': 'APPOINTMENT_TO_COME' }
      },
      {
          $group: {
              _id: '$coaching.order',
              count: { $sum: 1 }
          }
      },
      {
          $sort: { _id: 1 }
      }
  ]);

  const result = Array(16).fill(0);
  appointments.forEach(appointment => {
      if (appointment._id >= 1 && appointment._id <= 16) {
          result[appointment._id - 1] = appointment.count;
      }
  });

  return result;
}
exports.cs_upcoming_c = cs_upcoming_c;


const started_coachings_ = async ({ idFilter }) => {
  const allUsersWithStartedCoaching = await User.find({ company: idFilter }).populate({
    path: 'coachings',
    match: { status: COACHING_STATUS_STARTED }
  });
  
  let ageCounts = {};
  let startedCoachingsNoBirthday = 0;

  allUsersWithStartedCoaching.forEach(user => {
    if (user.birthday) {
      const age = moment().diff(moment(user.birthday, 'YYYY-MM-DD'), 'years');
      ageCounts[age] = (ageCounts[age] || 0) + user.coachings.length;
    } else {
      startedCoachingsNoBirthday += user.coachings.length;
    }
  });

  const result = { started_coaching_no_birthday: startedCoachingsNoBirthday };
  let ageRanges = {};
  let start = 25;
  let end = 29;

  for (let age = 0; age < 75; age++) {
    if (age > end) {
      start += 5;
      end += 5;
    }
    if (age >= 18 && age <= 24) {
      ageRanges['started_coachings_18_24'] = (ageRanges['started_coachings_18_24'] || 0) + (ageCounts[age] || 0);
    } else if (age >= start && age <= end) {
      ageRanges[`started_coachings_${start}_${end}`] = (ageRanges[`started_coachings_${start}_${end}`] || 0) + (ageCounts[age] || 0);
    }
  }

  for (const [key, value] of Object.entries(ageRanges)) {
    result[key] = value;
    result[`${key}_percent`] = Number((value / allUsersWithStartedCoaching.length * 100).toFixed(2));
  }

    return result;
};
exports.started_coachings_ = started_coachings_;


const coachings_gender_ = async ({ idFilter }) => {
  const usersWithCoachingsByGender = await User.aggregate([
    { $match: { _id: { $in: idFilter } } },
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
  ]);

  const formattedGenderCount = {
    male: 0,
    female: 0,
    non_binary: 0,
    unknown: 0
  };

  usersWithCoachingsByGender.forEach(({ _id, count }) => {
    if (_id === 'MALE') {
      formattedGenderCount.male += count;
    } else if (_id === 'FEMALE') {
      formattedGenderCount.female += count;
    } else if (_id === 'NON_BINARY') {
      formattedGenderCount.non_binary += count;
    } else {
      formattedGenderCount.unknown += count;
    }
  });

  return formattedGenderCount;
};
exports.coachings_gender_ = coachings_gender_;

const nut_advices = async ({ idFilter }) => {
    const nutAdvices = await User.find({company : idFilter})
    return nutAdvices
}
exports.nut_advices = nut_advices

const coachings_renewed = async ({ idFilter }) => {
    const currentYear = moment().year();
  
    const usersWithRenewedCoachings = await User.aggregate([
      { $match: { company: idFilter } },
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
          $or: [
            { 'coachings.creation_date': { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) } },
            { 'coachings.creation_date': { $gte: new Date(`${currentYear - 1}-01-01`), $lte: new Date(`${currentYear - 1}-12-31`) } }
          ]
        }
      },
      {
        $group: {
          _id: '$_id',
          coachings: { $push: '$coachings' }
        }
      }
    ]);
  
    const filteredUsers = usersWithRenewedCoachings.filter(user => {
      const thisYearCoachings = user.coachings.filter(coaching =>
        moment(coaching.creation_date).isSame(moment(), 'year')
      );
      const renewedCoachings = thisYearCoachings.some(coaching =>
        moment(coaching.creation_date).add(1, 'years').isSame(moment(), 'year')
      );
      return renewedCoachings;
    });
  
    return filteredUsers.length;
  };
exports.coachings_renewed = coachings_renewed

const jobs_ = async (idFilter) => {
    const leads = await Lead.find({ id: idFilter });
    const jobIds = leads.map(lead => lead.job).filter(id => id);
    const jobsAggregation = await Job.aggregate([
    { $match: { company: idFilter, _id: { $in: jobIds.map(id => mongoose.Types.ObjectId(id)) } } },
    { $project: { name: 1 } }
  ]);
    const jobDict = lodash.keyBy(jobsAggregation, '_id');
    const jobsFound = leads.reduce((acc, lead) => {
        const jobName = jobDict[lead.job]?.name;
        if (jobName) {
        acc[jobName] = (acc[jobName] || 0) + 1;
        }
        return acc;
    }, {});
    const jobsTotal = Object.values(jobsFound).reduce((sum, count) => sum + count, 0);
    const jobsArray = Object.entries(jobsFound).map(([name, value]) => {
    const percent = Number(((value / jobsTotal) * 100).toFixed(2));
    return { name, value, percent };
  }).sort((a, b) => b.value - a.value);
  return {
    jobs_total: jobsTotal,
    jobs_details: jobsArray
  };
};
exports.jobs_ = jobs_

const join_reasons_ = async (idFilter) => {
    const leads = await Lead.find({ id: idFilter })
    const joinReasons = await JoinReason.find();
    const joinReasonsDict = joinReasons.reduce((acc, jR) => {
      acc[jR.id] = jR;
      return acc;
    }, {});
  
    let joinReasonsFound = {};
    let joinReasonsTotal = 0;
  
    leads.forEach(lead => {
      if (joinReasonsDict[lead.join_reason]) {
        joinReasonsTotal += 1;
        const reasonName = joinReasonsDict[lead.join_reason].name;
        joinReasonsFound[reasonName] = (joinReasonsFound[reasonName] || 0) + 1;
      }
    });
  
    delete joinReasonsFound.undefined;
  
    joinReasonsFound = Object.entries(joinReasonsFound);
    joinReasonsFound.sort((a, b) => b[1] - a[1]);
  
    const joinReasonsArray = joinReasonsFound.map(([name, value]) => {
      const percent = Number(((value / joinReasonsTotal) * 100).toFixed(2));
      return { name, value, percent };
    });
  
    return {
      join_reasons_total: joinReasonsTotal,
      join_reasons_details: joinReasonsArray
    };
};
exports.join_reasons_ = join_reasons_
  
const decline_reasons_ = async (idFilter) => {
    const leads = await Lead.find({ id: idFilter });

    const declineReasons = await DeclineReason.find();
    const declineReasonsDict = declineReasons.reduce((acc, dR) => {
        acc[dR.id] = dR;
        return acc;
    }, {});

    let declineReasonsFound = {};
    let declineReasonsTotal = 0;

    leads.forEach(lead => {
        if (declineReasonsDict[lead.decline_reason]) {
            declineReasonsTotal += 1;
            const reasonName = declineReasonsDict[lead.decline_reason].name;
            declineReasonsFound[reasonName] = (declineReasonsFound[reasonName] || 0) + 1;
        }
    });

    delete declineReasonsFound.undefined;

    declineReasonsFound = Object.entries(declineReasonsFound);
    declineReasonsFound.sort((a, b) => b[1] - a[1]);

    const declineReasonsArray = declineReasonsFound.map(([name, value]) => {
        const percent = Number(((value / declineReasonsTotal) * 100).toFixed(2));
        return { name, value, percent };
    });

    return {
        decline_reasons_total: declineReasonsTotal,
        decline_reasons_details: declineReasonsArray
    };
};
exports.decline_reasons_ = decline_reasons_

const ratio_stopped_started = async (idFilter) => {
    const coachingsStopped=Number(coachings_stopped(idFilter))
    const coachingsStarted=Number(coachings_started(idFilter))
    return Number((coachingsStopped / coachingsStarted * 100).toFixed(2))
}
exports.ratio_stopped_started = ratio_stopped_started

const ratio_dropped_started = async (idFilter) => {
    const coachingsDropped=coachings_dropped(idFilter)
    const coachingsStarted=coachings_started(idFilter)
    return Number((coachingsDropped / coachingsStarted * 100).toFixed(2))
}
exports.ratio_dropped_started = ratio_dropped_started

const pipeline = (idFilter, matchCondition) => ([
    { $match: { ...matchCondition } },
    { $group: { _id: '$operator', count: { $sum: 1 } } }
  ]);
  
const getOperatorName = async (operatorId) => {
    const user = await User.findById(operatorId);
    return user ? user.fullname : "unknown";
};

const aggregateLeadsByField = async (idFilter, matchCondition) => {
    const pip = pipeline(idFilter, matchCondition);
    const result = await Lead.aggregate(pip);
    let total = 0;
    const details = await Promise.all(result.map(async (item) => {
        const operatorId = item._id;
        const count = item.count;
        total += count;
        const operatorName = operatorId ? await getOperatorName(operatorId) : "unknown";
        return { name: operatorName, value: count };
    }));
    return { total, details };
};

const incalls_per_operator_ = async (idFilter) => {
    const matchCondition = { call_direction: CALL_DIRECTION_IN_CALL };
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition);
    return {
        incalls_per_operator_total: total,
        incalls_per_operator_details: details
    };
};
exports.incalls_per_operator_ = incalls_per_operator_

const outcalls_per_operator_ = async (idFilter) => {
    const matchCondition = { call_direction: 'CALL_DIRECTION_OUT_CALL' };
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition);
    return {
        outcalls_per_operator_total: total,
        outcalls_per_operator_details: details
    };
}
exports.outcalls_per_operator_ = outcalls_per_operator_

const nut_advices_per_operator_ = async (idFilter) => {
    const matchCondition = { nutrition_converted: true };
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition);
    return {
        nut_advices_per_operator_total: total,
        nut_advices_per_operator_details: details
    };
};
exports.nut_advices_per_operator_ = nut_advices_per_operator_

const coa_per_operator_ = async (idFilter) => {
    const matchCondition = { coaching_converted: true };
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition);
    return {
        coachings_per_operator_total: total,
        coachings_per_operator_details: details
    };
};
exports.coa_per_operator_ = coa_per_operator_

const declined_per_operator_ = async (idFilter) => {
    const matchCondition = { call_status: 'CALL_STATUS_NOT_INTERESTED' };
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition);
    return {
        declined_per_operator_total: total,
        declined_per_operator_details: details
    };
};
exports.declined_per_operator_ = declined_per_operator_

const unreachables_per_operator_ = async (idFilter) => {
    const matchCondition = { call_status: 'CALL_STATUS_UNREACHABLE' };
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition);
    return {
        unreachables_per_operator_total: total,
        unreachables_per_operator_details: details
    };
};
exports.unreachables_per_operator_ = unreachables_per_operator_

const useful_contacts_per_operator_ = async (idFilter) => {
    const matchCondition = {
      $or: [
        { nutrition_converted: true },
        { coaching_converted: true },
        { call_status: 'CALL_STATUS_NOT_INTERESTED' }
      ]
    };
    const { total, details } = await aggregateLeadsByField(idFilter, matchCondition);
    return {
      useful_contacts_per_operator_total: total,
      useful_contacts_per_operator_details: details
    };
};
exports.useful_contacts_per_operator_ = useful_contacts_per_operator_

const renewed_coachings_per_operator_ = async (idFilter) => {
    const leads = await Lead.find({ id: idFilter });
  
    const groupedLeadsByOp = lodash.groupBy(leads, 'operator');
    let renewedCoachingsPerOperatorTotal = 0;
    const renewedCoachingsPerOperator = [];
  
    for (const operator in groupedLeadsByOp) {
      const leadByOp = groupedLeadsByOp[operator];
      const renewedCoachings = {};
  
      leadByOp.forEach(lead => {
        if (lead.coaching_converted) {
          renewedCoachings[lead.email] = (renewedCoachings[lead.email] || 0) + 1;
        }
      });
  
      const operatorName = operator !== 'undefined' ? await getOperatorName(operator) : 'unknown';
      const renewedCoachingsTotal = Object.values(renewedCoachings).reduce((sum, count) => sum + count, 0);
      renewedCoachingsPerOperator.push({ name: operatorName, value: renewedCoachingsTotal });
      renewedCoachingsPerOperatorTotal += renewedCoachingsTotal;
    }
  
    return {
      renewed_coachings_per_operator_total: renewedCoachingsPerOperatorTotal,
      renewed_coachings_per_operator_details: renewedCoachingsPerOperator
    };
  };
exports.renewed_coachings_per_operator_ = renewed_coachings_per_operator_
  
const coa_cu_transformation_per_operator_ = async (idFilter) => {
    const leads = await Lead.find({ id: idFilter });
  
    const groupedLeadsByOp = lodash.groupBy(leads, 'operator');
    let coaCuTransformationPerOperatorTotal = 0;
    const coaCuTransformationPerOperator = [];
  
    for (const operator in groupedLeadsByOp) {
      const leadByOp = groupedLeadsByOp[operator];
      let coa = 0;
      let usefulContacts = 0;
  
      leadByOp.forEach(lead => {
        if (lead.coaching_converted) {
          coa += 1;
        }
        if (lead.nutrition_converted || lead.coaching_converted || lead.call_status === 'CALL_STATUS_NOT_INTERESTED') {
          usefulContacts += 1;
        }
      });
  
      const operatorName = operator !== 'undefined' ? await getOperatorName(operator) : 'unknown';
      const coaCuTransformation = usefulContacts !== 0 ? Number((coa / usefulContacts * 100).toFixed(2)) : 0;
      coaCuTransformationPerOperator.push({ name: operatorName, value: coaCuTransformation });
      coaCuTransformationPerOperatorTotal += coaCuTransformation;
    }
  
    return {
      coa_cu_transformation_per_operator_total: coaCuTransformationPerOperatorTotal,
      coa_cu_transformation_per_operator_details: coaCuTransformationPerOperator
    };
  };
exports.coa_cu_transformation_per_operator_ = coa_cu_transformation_per_operator_
  
const cn_cu_transformation_per_operator_ = async (idFilter) => {
    const leads = await Lead.find({ id: idFilter });
  
    const groupedLeadsByOp = lodash.groupBy(leads, 'operator');
    let cnCuTransformationPerOperatorTotal = 0;
    const cnCuTransformationPerOperator = [];
  
    for (const operator in groupedLeadsByOp) {
      const leadByOp = groupedLeadsByOp[operator];
      let nutAdvices = 0;
      let usefulContacts = 0;
  
      leadByOp.forEach(lead => {
        if (lead.nutrition_converted) {
          nutAdvices += 1;
        }
        if (lead.nutrition_converted || lead.coaching_converted || lead.call_status === 'CALL_STATUS_NOT_INTERESTED') {
          usefulContacts += 1;
        }
      });
  
      const operatorName = operator !== 'undefined' ? await getOperatorName(operator) : 'unknown';
      const cnCuTransformation = usefulContacts !== 0 ? Number((nutAdvices / usefulContacts * 100).toFixed(2)) : 0;
      cnCuTransformationPerOperator.push({ name: operatorName, value: cnCuTransformation });
      cnCuTransformationPerOperatorTotal += cnCuTransformation;
    }
  
    return {
      cn_cu_transformation_per_operator_total: cnCuTransformationPerOperatorTotal,
      cn_cu_transformation_per_operator_details: cnCuTransformationPerOperator
    };
};
exports.cn_cu_transformation_per_operator_ = cn_cu_transformation_per_operator_

const leads_by_campain = async (idFilter) => {
    const pipeline = [
      { $match: { id: idFilter } },
      { 
        $group: { 
            _id: { $ifNull: ['$campain', 'unknown'] }, 
            count: { $sum: 1 } 
        } 
      },
      { 
        $group: { 
            _id: null, 
            total: { $sum: '$count' },
            campaigns: { $push: { name: '$_id', value: '$count' } }
        } 
      }
    ];
    const result = await Lead.aggregate(pipeline);
    if (result.length === 0) {
      return { leads_by_campain: [] };
    }
    const { total, campains } = result[0];
    const leads_by_campain = campains.map(campain => ({
        name: campain.name,
        value: campain.value,
        percent: Number(((campain.value / total) * 100).toFixed(2))
    }));
    return { leads_by_campain };
};
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
    ];
    const result = await Webinar.aggregate(pipeline);
    const webinarsCount = result.reduce((acc, curr) => acc + curr.webinars, 0);
    return {
        webinars_by_company_total: webinarsCount,
        webinars_by_company_details: result
    };
};
exports.webinars_by_company = webinars_by_company_
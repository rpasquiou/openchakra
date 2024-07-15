const mongoose = require('mongoose')
const Announce = require('../../models/Announce')
const Evaluation = require('../../models/Evaluation')
const { ROLE_FREELANCE, ROLE_CUSTOMER } = require('./consts')

const getApplications = async (user) => {
  console.log(user)
  const applications = await Announce.aggregate([
    { $match: { user: mongoose.Types.ObjectId(user.id) } },
    {
      $lookup: {
        from: 'applications',
        localField: '_id',
        foreignField: 'announce',
        as: 'applications',
      }
    },
    { $unwind: '$applications' },
    {
      $group: {
        _id: null,
        applications: { $push: '$applications' }
      }
    },
    {
      $project: {
        _id: 0,
        applications: 1
      }
    },
    { $unwind: '$applications' },
    {
      $replaceRoot: { newRoot: '$applications' }
    }
  ])

  return applications
}

const computeNotes = async (user, role) => {
  const rolePrefix = `${role.toLowerCase()}_`
  const evals = user[`${rolePrefix}evaluations`]

  const NOTES = evals.reduce((notes, eval) => {
    Object.keys(eval).forEach(key => {
      if (key.startsWith(rolePrefix) && !key.includes('average')) {
        notes.push(eval[key]);
      }
    });
    return notes
  }, [])

  const validNotes = lodash.filter(NOTES, note => !lodash.isNil(note))
  return lodash.mean(validNotes)
}


module.exports = {getApplications, computeNotes}
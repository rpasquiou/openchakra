const mongoose = require('mongoose')
const Announce = require('../../models/Announce')
const lodash=require('lodash')

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

const freelance_attr = ['quality', 'deadline', 'team', 'reporting']
const customer_attr = ['interest', 'organisation', 'integration', 'communication']

const computeNotes = (user, role) => {
  if (!user) return null
  const rolePrefix = `${role.toLowerCase()}_`
  const evals = user[`${rolePrefix}evaluations`]
  if (!evals) return null

  const NOTES = Object.keys(evals).reduce((notes, e) => {
    const evaluation = evals[e]
    const attributes = role === 'freelance' ? freelance_attr : customer_attr
    attributes.forEach(attr => {
      const key = `${rolePrefix}note_${attr}`
      notes.push(evaluation[key])
    })
    return notes
  }, [])

  const validNotes = lodash.filter(NOTES, note => !lodash.isNil(note))
  return lodash.mean(validNotes)
}

module.exports = {getApplications, computeNotes}
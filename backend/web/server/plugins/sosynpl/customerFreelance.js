const mongoose = require('mongoose')
const Announce = require('../../models/Announce')

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

module.exports = {getApplications}

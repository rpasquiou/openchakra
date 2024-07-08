const mongoose = require('mongoose');
const Customer = require("../../models/Customer");
const User = require('../../models/User');

const applications = async (user) => {
  const applications = await User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(user.id) } },
    {
      $lookup: {
        from: 'announces',
        localField: '_id',
        foreignField: 'user',
        as: 'announces',
      }
    },
    { $unwind: '$announces' },
    {
      $lookup: {
        from: 'applications',
        localField: 'announces._id',
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
  ]);

  return applications;
};

module.exports = applications;

const { loadFromDb } = require('../../utils/database')

const getTraineeResources = async (userId, params, data) => {
  let sessions = await loadFromDb({model: 'session', fields:[
    'trainees',
    'children.children.children.children.spent_time_str',
    'children.children.children.children.name',
    'children.children.children.children.resource_type',
    'children.children.children.children.achievement_status',
    'children.children.children.children.children.spent_time_str',
    'children.children.children.children.children.name',
    'children.children.children.children.children.resource_type',
    'children.children.children.children.children.achievement_status',
  ], user:data})

  sessions = sessions.filter(s => s.trainees.some(t => t._id.toString() === data._id.toString()))

  const resources = sessions.flatMap(session =>
    session.children.flatMap(program =>
      program.children.flatMap(child => {
        if (child.type === 'chapter') {
          return child.children.flatMap(modulee =>
            modulee.children.flatMap(sequence =>
              sequence.children
            )
          )
        } else {
          return child.children.flatMap(sequence =>
            sequence.children
          )
        }
      })
    )
  )

  console.log(resources)
  return resources
}


module.exports = {
  getTraineeResources
}
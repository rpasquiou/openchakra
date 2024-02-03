const Session = require("../../models/Session")
const { runPromisesWithDelay } = require("../../utils/concurrency")
const { loadFromDb } = require("../../utils/database")
const lodash=require('lodash')
const { BLOCK_STATUS, RESOURCE_TYPE } = require("./consts")
const { formatDuration } = require("../../../utils/text")

const fillSession = session => {
  console.group('Filling session', session._id)
  const programId = session.actual_children[0]
  return Promise.all(session.trainees.map(trainee => {
    return loadFromDb({model: 'program', id: programId, fields: ['name'], user: trainee})
      .then(prog => {
        return trainee.statistics=prog
      })
  }))
  .then(() => session)
}

const computeStatistics = ({model, fields, id, user, params}) => {
  console.log(params)
  return Session.find({name:/programme/i, $or: [{trainees: user}, {trainers: user}]})
    .populate({path: 'trainees'}).lean()
    // .then(sessions => Promise.all(sessions.map(s => fillSession(s))))
    .then(sessions => Promise.all(sessions.map(s => Promise.all(s.trainees.map(u => loadFromDb({model: 'user', fields: ['firstname'], id: u._id, user: u._id}))))))
    .then(sessions => ([{sessions}]))
}
  
const getRandomInt = max => {
  return Math.floor(Math.random() * (max + 1))
}

const getRandomEnum = obj => {
  return Object.keys(obj)[getRandomInt(Object.keys(obj).length)]
}

const getRndBool = () => {
  return getRandomInt(10)%2 ? true : false
}

const createBlocks = types => {
  if (types.length==0) {
    return undefined
  }
  
  const stdOptions=() => ({
    'achievement_status': getRandomEnum(BLOCK_STATUS),
    'annotation': 'annotation',
    'closed': getRndBool(),
    'code': 'code',
    'duration_str' : formatDuration(getRandomInt(3600)),
    'evaluation': getRandomInt(10)%2 ? true : false,
    'finished_resources_count': getRandomInt(6),
    'masked': getRndBool(),
    'optional': getRndBool(),
    'resource_type': getRandomEnum(RESOURCE_TYPE),
    'resources_count': getRandomInt(12),
    'resources_progress': Math.random(),
    'spent_time_str': formatDuration(getRandomInt(1200)),
    'url': 'https://images.ctfassets.net/63bmaubptoky/4kg3HnPTXf2nNRtcPeHeX7_NSpSySwVxtc-FWUJpKYI/be40d928319bc71df63fae3e0f842cac/Capterra-creation-cours-en-ligne.png?w=1000',
    })
  const [type, count, options, children_name]=types[0]
  const res=lodash.range(count).map(idx => {
    return {
      type,
      ...stdOptions(),
      ...lodash.mapValues(options, v => `${v}-${idx}`),
      [children_name || 'children']: createBlocks(types.slice(1))
    }
  })
  if (type=='program') {
    return res[0]
  }
  return res
}

const computeFakeStatistics = ({model, fields, id, user, params}) => {
  const types=[
    ['session', 2, {name: 'session'}, 'trainees'], 
    ['user', 3, {firstname: 'John', lastname: 'Doe'}, 'statistics'], 
    ['program', 1, {name: 'Program'}],
    ['module', 3, {name: 'Module'}], 
    ['sequence', 3, {name: 'Sequence'}], 
    ['resource', 4, {name: 'Ressource'}],
]
  const sessions= createBlocks(types)
  return Promise.resolve([{sessions}])
}

 module.exports={
  computeStatistics: computeFakeStatistics,
 }
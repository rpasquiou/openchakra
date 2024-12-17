const { loadFromDb, getModel } = require("../../utils/database")
const lodash=require('lodash')
const { BLOCK_STATUS, RESOURCE_TYPE } = require("./consts")
const { formatDuration } = require("../../../utils/text")
const Program = require("../../models/Program")
const User = require("../../models/User")
const Group = require("../../models/Group")

const fillSession = async (session, trainee, f) => {
  console.log('Filling for', trainee, f)
  fields=lodash(f)
    .filter(f => /^trainees.statistics\./.test(f))
    .map(f => f.replace(/^trainees.statistics\./, ''))
    .value()
  session.trainees = trainee ? [trainee] : session.trainees
  const program = await Program.findOne({parent: session._id}).populate('children')
  const programId = program._id
  return Promise.all(session.trainees.map(trainee => {
    return loadFromDb({model: 'program', id: programId, fields, user: trainee, skipRetain: true})
      .then(prog => {
        console.log('Load program for user', trainee._id, fields)
        trainee.statistics=new Program(prog[0])
        console.log(JSON.stringify(trainee.statistics, null, 2))
        return trainee
      })
  }))
  .then(() => session)
}

const computeStatistics = async ({fields, id, user, params}) => {
  let sessionId = {}
  let trainee
  const sessionPrefix=/^sessions\./
  fields=fields.filter(f => sessionPrefix.test(f)).map(f => f.replace(sessionPrefix, ''))
  if(!!id) {
    const ids=id.split('-').filter(v => !!v)
    console.log('id is', id, typeof id, 'ids are', JSON.stringify(ids))
    await Promise.all(ids.map(async localId => {
      const model=await getModel(localId, ['user', 'session', 'group'])
      if (model=='session') {
        sessionId.id = localId
      }
      else if (model=='group') {
        const group=await Group.findById(localId)
        sessionId.params={'filter._id':{$in: group.sessions}}
      }
      // Else must be a user
      else {
        trainee = await User.findById(localId)
      }
    }))
  }
  fields=[...fields, 'start_date', 'end_date', 'trainees']
  const loaded=await loadFromDb({model: 'session', user, fields, skipRetain: true, ...sessionId})
  return Promise.resolve(loaded)
    .then(sessions => Promise.all(sessions.map(s => fillSession(s, trainee, fields))))
    .then(sessions => ([{_id: id, sessions}]))
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
      ...lodash.mapValues(options, v => `${v}-${idx+1}`),
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
  // computeStatistics: computeFakeStatistics,
  computeStatistics,
 }

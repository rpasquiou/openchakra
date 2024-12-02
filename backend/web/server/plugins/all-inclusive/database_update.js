const Mission=require('../../models/Mission')
const migrateVisibility = require('./migrations/2024_12_02_update_visbility_attribute_role_ti')

const setTIOnMissions = async () => {
  const orphanMissions=(await Mission.find({ti: null}).populate('job')).filter(m => !!m.job?.user)
  console.log(`Got ${orphanMissions.length} orphaan missions`)
  await Promise.all(orphanMissions.map(mission=> {
    mission.ti=mission.job.user
    return mission.save()
  }))
}

const databaseUpdate = async () => {
  console.log('************ UPDATING DATABASE')
  await setTIOnMissions()
  await migrateVisibility()
}

module.exports=databaseUpdate
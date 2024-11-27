const mongoose = require('mongoose')

async function migrateWorkMode() {
  try {
    const initialCount = await mongoose.connection
      .collection('users')
      .countDocuments({ work_mode: { $exists: true } })
    console.log(`📊 Nombre initial de documents à migrer : ${initialCount}`)

    const remoteResult = await mongoose.connection
      .collection('users')
      .updateMany(
        { work_mode: 'WORK_MODE_REMOTE' },
        {
          $set: {
            work_mode_remote: true,
            work_mode_site: false,
          },
          $unset: { work_mode: '' },
        }
      )
    console.log(`✅ WORK_MODE_REMOTE migrés : ${remoteResult.modifiedCount} documents`)

    const siteResult = await mongoose.connection.collection('users').updateMany(
      { work_mode: 'WORK_MODE_SITE' },
      {
        $set: {
          work_mode_remote: false,
          work_mode_site: true,
        },
        $unset: { work_mode: '' },
      }
    )
    console.log(`✅ WORK_MODE_SITE migrés : ${siteResult.modifiedCount} documents`)

    const hybridResult = await mongoose.connection
      .collection('users')
      .updateMany(
        { work_mode: 'WORK_MODE_REMOTE_SITE' },
        {
          $set: {
            work_mode_remote: true,
            work_mode_site: true,
          },
          $unset: { work_mode: '' },
        }
      )
    console.log(`✅ WORK_MODE_REMOTE_SITE migrés : ${hybridResult.modifiedCount} documents`)

    const remainingCount = await mongoose.connection
      .collection('users')
      .countDocuments({ work_mode: { $exists: true } })
    console.log(`📊 Documents restants avec work_mode : ${remainingCount}`)

    const remoteOnlyCount = await mongoose.connection
      .collection('users')
      .countDocuments({ work_mode_remote: true, work_mode_site: false })
    const siteOnlyCount = await mongoose.connection
      .collection('users')
      .countDocuments({ work_mode_remote: false, work_mode_site: true })
    const hybridCount = await mongoose.connection
      .collection('users')
      .countDocuments({ work_mode_remote: true, work_mode_site: true })

    console.log('\n📊 Statistiques finales :')
    console.log(`- Remote uniquement : ${remoteOnlyCount}`)
    console.log(`- Sur site uniquement : ${siteOnlyCount}`)
    console.log(`- Hybride : ${hybridCount}`)

    console.log('\n✨ Migration terminée avec succès !')
  } catch (error) {
    console.error('❌ Erreur pendant la migration :', error)
    throw error
  }
}

module.exports = migrateWorkMode

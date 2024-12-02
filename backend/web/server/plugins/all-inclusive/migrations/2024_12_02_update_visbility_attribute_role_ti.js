const mongoose = require('mongoose')
const { ROLE_TI, PROFILE_VISIBLE } = require('../consts')

async function migrateVisibility() {
  console.log('=== 🚀 Starting migration: 2024_12_02_update_visbility_attribute_role_ti ===')
  try {
    const initialCount = await mongoose.connection
      .collection('users')
      .countDocuments({ role: ROLE_TI, visibility: { $exists: false } })
    console.log(`📊 Initial documents to migrate: ${initialCount}`)

    const result = await mongoose.connection
      .collection('users')
      .updateMany({ role: ROLE_TI }, { $set: { visibility: PROFILE_VISIBLE } })

    console.log(`✅ Updated documents: ${result.modifiedCount}`)
    console.log('✨ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

module.exports = migrateVisibility

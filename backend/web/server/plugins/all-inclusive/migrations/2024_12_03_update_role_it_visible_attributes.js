const mongoose = require('mongoose')

const PROFILE_VISIBLE = 'PROFILE_VISIBLE'
const PROFILE_HIDDEN = 'PROFILE_HIDDEN'

async function migrateVisibility() {
  console.log('=== 🚀 Starting migration of visibility attributes ===')
  try {
    const initialCount = await mongoose.connection
      .collection('users')
      .countDocuments({
        $or: [{ hidden: { $exists: true } }, { visibility: { $exists: true } }],
      })
    console.log(`📊 Initial number of documents to migrate: ${initialCount}`)

    const hiddenTrueResult = await mongoose.connection
      .collection('users')
      .updateMany(
        { hidden: true },
        {
          $set: {
            admin_visible: false,
            ti_visible: true,
          },
        }
      )
    console.log(
      `✅ Users hidden=true migrated: ${hiddenTrueResult.modifiedCount} documents`
    )

    const hiddenFalseResult = await mongoose.connection
      .collection('users')
      .updateMany(
        { hidden: false },
        {
          $set: {
            admin_visible: true,
            ti_visible: true,
          },
        }
      )
    console.log(
      `✅ Users hidden=false migrated: ${hiddenFalseResult.modifiedCount} documents`
    )

    const visibilityHiddenResult = await mongoose.connection
      .collection('users')
      .updateMany(
        { visibility: PROFILE_HIDDEN },
        {
          $set: {
            ti_visible: false,
          },
        }
      )
    console.log(
      `✅ Users visibility=PROFILE_HIDDEN migrated: ${visibilityHiddenResult.modifiedCount} documents`
    )

    const visibilityVisibleResult = await mongoose.connection
      .collection('users')
      .updateMany(
        { visibility: PROFILE_VISIBLE },
        {
          $set: {
            ti_visible: true,
          },
        }
      )
    console.log(
      `✅ Users visibility=PROFILE_VISIBLE migrated: ${visibilityVisibleResult.modifiedCount} documents`
    )

    const cleanupResult = await mongoose.connection
      .collection('users')
      .updateMany(
        {
          $or: [
            { hidden: { $exists: true } },
            { visibility: { $exists: true } },
          ],
        },
        {
          $unset: {
            hidden: '',
            visibility: '',
          },
        }
      )
    console.log(
      `✅ Cleanup of hidden and visibility attributes: ${cleanupResult.modifiedCount} documents`
    )

    const remainingCount = await mongoose.connection
      .collection('users')
      .countDocuments({
        $or: [{ hidden: { $exists: true } }, { visibility: { $exists: true } }],
      })
    console.log(
      `📊 Remaining number of documents to migrate: ${remainingCount}`
    )

    const fullyVisibleCount = await mongoose.connection
      .collection('users')
      .countDocuments({
        ti_visible: true,
        admin_visible: true,
      })
    const adminHiddenCount = await mongoose.connection
      .collection('users')
      .countDocuments({
        admin_visible: false,
      })
    const tiHiddenCount = await mongoose.connection
      .collection('users')
      .countDocuments({
        ti_visible: false,
      })

    console.log('📊 Final statistics:')
    console.log(`👀 Fully visible users: ${fullyVisibleCount}`)
    console.log(`👑 Admin hidden users: ${adminHiddenCount}`)
    console.log(`🔎 TI hidden users: ${tiHiddenCount}`)

    console.log('✨ Migration of visibility attributes completed')

    console.log('=== 🛑 Stopping migration of visibility attributes ===')
  } catch (error) {
    console.error('❌ Error during migration:', error)
    throw error
  }
}

module.exports = migrateVisibility

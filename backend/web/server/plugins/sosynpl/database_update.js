const updateDeactivationReason = require('./migrations/2024_11_05_suppression_reason_not_freelance')
const updateWorkMode = require('./migrations/2024_11_26_update_work_mode_new_attributes')


const database_update = async function () {
    await updateDeactivationReason()
    await updateWorkMode()
}

module.exports = database_update
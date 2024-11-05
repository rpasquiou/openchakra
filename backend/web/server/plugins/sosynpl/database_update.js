const updateDeactivationReason = require('./migrations/2024_11_05_suppression_reason_not_freelance')

const database_update = async function () {
    await updateDeactivationReason()
}

module.exports = database_update
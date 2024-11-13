const { REASON_OTHER } = require('../consts.js')
const CustomerFreelance = require('../../../models/CustomerFreelance')

const updateDeactivationReason = async function () {
    try {
        const users = await CustomerFreelance.updateMany(
            { deactivation_reason: 'REASON_NOT_FREELANCE' },
            { deactivation_reason: REASON_OTHER }
        )
    } catch (error) {
        throw error
    }
}

module.exports = updateDeactivationReason
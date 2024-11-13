jest.mock('../../server/models/CustomerFreelance', function () {
  return {
    updateMany: jest.fn()
  }
})

const { jest, expect } = require('@jest/globals')
const { REASON_OTHER } = require('../../server/plugins/sosynpl/consts')
const updateDeactivationReason = require('../../server/plugins/sosynpl/migrations/2024_11_05_suppression_reason_not_freelance')
const CustomerFreelance = require('../../server/models/CustomerFreelance')

describe('updateDeactivationReason', function () {
  beforeEach(function () {
    console.log('🔄 Resetting mocks...')
    jest.clearAllMocks()
  })

  it('should update deactivation reason for users with REASON_NOT_FREELANCE', async function () {
    console.log('🏁 Starting test...')

  CustomerFreelance.updateMany.mockResolvedValue({ nModified: 2 })

    console.log('🚀 Migration executed...')
    await updateDeactivationReason()

    console.log('✅ Checking results...')
    expect(CustomerFreelance.updateMany).toHaveBeenCalledWith(
      { deactivation_reason: 'REASON_NOT_FREELANCE' },
      { deactivation_reason: REASON_OTHER }
    )
  })
})

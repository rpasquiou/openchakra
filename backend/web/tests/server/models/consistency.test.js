const { checkConsistency } = require('../../../scripts/database/consistency')
const mongoose = require('mongoose')
const moment=require('moment')

jest.setTimeout(60000)

describe('Test DB consistency on missing references', () => {

  beforeAll(async() => {
  })

  afterAll(async() => {
  })

  it('should check for missing references', async() => {
    return checkConsistency()
  })


})

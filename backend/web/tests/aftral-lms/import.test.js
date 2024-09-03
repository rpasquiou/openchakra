const mongoose = require('mongoose')
const fs = require('fs')
const moment = require('moment')
const path = require('path')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { importResources, importPrograms, importCodes, loadRecords, removeResourceCode } = require('../../server/plugins/aftral-lms/import')

// const ROOT = path.join(__dirname, './data/Ressources')

jest.setTimeout(2*60*60*1000)

const ROOT=path.join(__dirname, 'data')

const RESOURCES_ROOT='/home/seb/Téléchargements/resources/Current'
const PROGRAMS_PATH=path.join(ROOT, 'Aftral Programmes détails.xlsx')
// const PROGRAMS_PATH=path.join(ROOT, 'Aftral un seul programme.xlsx')
const CODES_PATH=path.join(ROOT, 'Code produit à jour 20062024.xlsx')

const RESOURCES_CODES_PATH=path.join(ROOT, 'resourcesCodes.txt')

describe('Test imports', () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
    console.log('Opened database')
  })
  
  afterAll(async () => {
    await mongoose.connection.close()
  })

  it.skip('must import resources', async () => {
    return importResources(RESOURCES_ROOT, true)
  })

  it('must import product codes', async () => {
    return importCodes(CODES_PATH, 'Code produit à jour', 1)
  })

  it('must import programs', async () => {
    return importPrograms(PROGRAMS_PATH, 'Final', 1, CODES_PATH, 'Code produit à jour', 1)
  })

  it('Must remove resource code', async () => {
    const res=removeResourceCode('S_15637_16 E ADR Emballages des matières dangereuses')
    expect(res).toEqual('E ADR Emballages des matières dangereuses')
    console.log(RESOURCES_CODES_PATH)
    const data=fs.readFileSync(RESOURCES_CODES_PATH).toString().split('\n')
    console.log(data.map(removeResourceCode))
  })


})


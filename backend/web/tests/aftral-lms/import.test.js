const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { importResources, importPrograms, importCodes, extractResourceCode, importURLResources } = require('../../server/plugins/aftral-lms/import')


const ROOT=path.join(__dirname, 'data')

/**
SCORMs partagés
*/
const RESOURCES_ROOT='/home/aftral/sessions/Ressources/SCORMs partagés'
const URL_RESOURCES_PATH=path.join(ROOT, 'Ressources URL Virginie.xlsx')
const PROGRAMS_PATH=path.join(ROOT, 'Aftral Programmes détails.xlsx')
const CODES_PATH=path.join(ROOT, 'Code produit à jour 20062024.xlsx')
const RESOURCES_NAMES_FILES=path.join(ROOT, 'resources_filenames.txt')
const RESOURCES_CODES_FILE=path.join(ROOT, 'resources_codes.txt')

jest.setTimeout(2*60*60*1000)

describe('Test imports', () => {

  beforeAll(async () => {
    await mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
    console.log('Opened database')
  })
  
  afterAll(async () => {
    await mongoose.connection.close()
  })

  it('must import resources', async () => {
    return importResources(RESOURCES_ROOT, true)
  })

  it('must import URL resources', async () => {
    return importURLResources(URL_RESOURCES_PATH)
  })

  it('must import product codes', async () => {
    return importCodes(CODES_PATH, 'Code produit à jour', 1)
  })

  it('must import programs', async () => {
    return importPrograms(PROGRAMS_PATH, 'Final', 1)
  })

  it('must extract codes from resources', async () => {
    const filenames=fs.readFileSync(RESOURCES_NAMES_FILES).toString().split('\n').filter(v => !!v)
    const codes=fs.readFileSync(RESOURCES_CODES_FILE).toString().split('\n').filter(v => !!v)
    // const filenames=["AD_16819_11CA_Annexe_complémentaire_Liaison_CFA_Entreprise.docx","AD_16819_11CA_Annexe_compl","AD_16923_20A0_Guide_Modalités_VCVAT.pdf", 'CD_17217_10A4 Organiser laction de formation.pdf']
    // const codes=["AD_16819_11CA","AD_16819_11CA","AD_16923_20A0", 'CD_17217_10A4']
 
    const extracted=filenames.map(extractResourceCode)
    expect(extracted).toEqual(codes)
  })

})


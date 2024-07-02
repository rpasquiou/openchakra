const path=require('path')
const mongoose = require('mongoose')
const { logFormFields, fillForm, savePDFFile } = require('../../utils/fillForm')

const ROOT = path.join(__dirname, './../data/pdf')
const FILEPATH = path.join(ROOT, 'attestation_bilan_carcept.pdf')
describe('Fill form test', () => {

  beforeAll(async() => {
  })

  afterAll(async() => {
  })

  it('must retrieve PDF fields', async() => {
    const fields=await logFormFields(FILEPATH)
    console.log(fields)
  })

  it('must fill PDF fields', async() => {
    const data={lastname: 'Auvray', firstname: 'Seb', identifier: 'WCVB12'}
    const data2=Object.values(data)
    const pdf=await fillForm(FILEPATH, data2)
    console.log(Buffer.from(await pdf.save()))
    // savePDFFile(pdf, '/home/seb/test.pdf')
  })

})

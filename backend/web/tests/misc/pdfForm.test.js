const path=require('path')
const mongoose = require('mongoose')
const { exec } = require('child_process')    
const { logFormFields, fillForm, savePDFFile } = require('../../utils/fillForm')
const { default: axios } = require('axios')

const ROOT = path.join(__dirname, './../data/pdf')
const FILEPATH = path.join(ROOT, 'attestation_bilan_carcept.pdf')
const URL=`https://my-alfred-data-test.s3.eu-west-3.amazonaws.com/smartdiet/prod/27152ef8-2c53-45b6-8db7-111be754c48a_attestation_conseil_nutrition_carcept_complete.pdf`

describe('Fill form test', () => {

  beforeAll(async() => {
  })

  afterAll(async() => {
  })

  it('must retrieve PDF fields', async() => {
    const fields=await logFormFields(FILEPATH)
    console.log(fields)
  })

  it('must fill PDF fields from filename', async() => {
    const data={lastname: 'Auvray', firstname: 'Seb', identifier: 'WCVB12'}
    const pdf=await fillForm(FILEPATH, data)
    console.log(pdf)
    await savePDFFile(pdf, '/home/seb/test.pdf')
    const res=await exec(`xdg-open /home/seb/test.pdf`)
    console.log(res)
  })

  it('must fill PDF fields from URL', async() => {
    const data={lastname: 'Auvray', firstname: 'Seb', identifier: 'WCVB12'}
    const pdf=await fillForm(URL, data)
    console.log(pdf)
    await savePDFFile(pdf, '/home/seb/test.pdf')
    const res=await exec(`xdg-open /home/seb/test.pdf`)
    console.log(res)
  })

})

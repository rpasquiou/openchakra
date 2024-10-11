const path = require("path")
const fs = require("fs")
const { logFormFields, fillForm, savePDFFile } = require("../../utils/fillForm")

const DATA_PATH=path.join(__dirname, '..', 'data', 'misc')
const TEMPLATE_PDF_PATH=path.join(DATA_PATH, 'template justificatif de formation.pdf')

describe('Misc text tests', () => {

  it('Must extract markers', async () => {
    console.log(TEMPLATE_PDF_PATH)
    const fieldsDefinition=await logFormFields(TEMPLATE_PDF_PATH)
    console.log(Object.keys(fieldsDefinition))
    const EXPECTED_FIELDS=['code', 'creation_date', 'end_date', 'level_1_resource_progress'].sort()
    expect(Object.keys(fieldsDefinition).sort()).toEqual(expect.arrayContaining(EXPECTED_FIELDS))
    const generated=await fillForm(TEMPLATE_PDF_PATH, {code: 15, location: 'Rouen', start_date: '10/10/2024', end_date: '15/10/2024',
    trainee_fullname: 'Apprenant 15'})
    await savePDFFile(generated, '/home/seb/generated.pdf')
    
  })

})

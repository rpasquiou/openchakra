const path = require("path")
const fs = require("fs")
const lodash = require("lodash")
const { logFormFields, fillForm, savePDFFile, fillForm2, getPDFBytes } = require("../../utils/fillForm")

const DATA_PATH=path.join(__dirname, '..', 'data', 'misc')
const TEMPLATE_PDF_PATH=path.join(DATA_PATH, 'template justificatif de formation.pdf')

describe('Misc text tests', () => {

  it('Must extract markers', async () => {
    console.log(TEMPLATE_PDF_PATH)
    const fieldsDefinition=await logFormFields(TEMPLATE_PDF_PATH)
    console.log('Found fields', Object.keys(fieldsDefinition))
    const EXPECTED_FIELDS=['session_code', 'creation_date', 'end_date', 'level_1.resources_progress'].sort()
    expect(Object.keys(fieldsDefinition).sort()).toEqual(expect.arrayContaining(EXPECTED_FIELDS))
    const data={
      location: 'Rouen',
      session_code: 'PSWAHJKDGHJK75',
      session_code: 'PS109',
      session_name: 'PSWAHJKDGHJK75 - PAWW01 Sesion matières dangereuses',
      start_date: '10/10/2024', end_date: '15/10/2024',
      trainee_fullname: 'Jean-Robert', first_connection: '10/15/2024',
      spent_time_str: '12h15',
      resources_progress: '20%',
      creation_date: '15/10/2024',
      achievement_status: 'En cours',
      level_1: [{
        name: 'Module 1', resources_progress: '15%', spent_time_str: '1h12',
        level_2: [
          {name: 'Séquence 1.1'},
          {name: 'Séquence 1.2'},
        ]
      },
      {
        name: 'Module 2', resources_progress: '15%', spent_time_str: '15h13',
        level_2: [
          {name: 'Séquence 2.1'},
          {name: 'Séquence 2.2'},
        ]
      },
      {
        name: 'Module 3', resources_progress: '15%', spent_time_str: '1h12',
        level_2: [
          {name: 'Séquence 3.1'},
          {name: 'Séquence 3.2'},
        ]
      }
    ],
    }
    const generated=await fillForm2(TEMPLATE_PDF_PATH, data)
    await savePDFFile(generated, '/home/seb/generated.pdf')
    
  })

})

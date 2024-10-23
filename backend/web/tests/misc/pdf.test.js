const path = require("path")
const os = require("os")
const glob = require("glob")
const mongoose = require("mongoose")
const { getFormFields, savePDFFile, fillForm2 } = require("../../utils/fillForm")
const { getDatabaseUri } = require("../../config/config")
const { MONGOOSE_OPTIONS } = require("../../server/utils/database")
const Ceeertificate = require("../../server/models/Certification")
const Certification = require("../../server/models/Certification")
const { runPromisesWithDelay } = require("../../server/utils/concurrency")

const DATA_PATH=path.join(__dirname, '..', 'data', 'misc')
const TEMPLATE_PDF_PATH=path.join(DATA_PATH, 'template justificatif de formation.pdf')

describe('Misc text tests', () => {

  it('Must extract markers', async () => {
    console.log(TEMPLATE_PDF_PATH)
    const fieldsDefinition=await getFormFields(TEMPLATE_PDF_PATH)
    console.log('Found fields', Object.keys(fieldsDefinition))
    const EXPECTED_FIELDS=['session_code', 'creation_date', 'end_date', 'level_1.resources_progress'].sort()
    expect(Object.keys(fieldsDefinition).sort()).toEqual(expect.arrayContaining(EXPECTED_FIELDS))
    const data={
      location: 'Rouen',
      session_code: 'PSWAHJKDGHJK75',
      session_code: 'PS109',
      session_name: 'PSWAHJKDGHJK75 - PAWW01 Sesion matières dangereuses',
      start_date: '10/10/2024', end_date: '15/10/2024',
      trainee_fullname: 'Jean-Gérard', first_connection: '15/10/2024',
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

    // data.level_1=[]
    
    const generated=await fillForm2(TEMPLATE_PDF_PATH, data)
    await savePDFFile(generated, path.join(os.homedir(),  'generated.pdf'))
    
  })

  it.only('Must get certificates fields', async () => {
    await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
    const certificates=await Certification.find()
    await runPromisesWithDelay(certificates.map(certif => async () => {
      const fields=await getFormFields(certif.url)
      console.log(certif.name, Object.keys(fields))
    }))

    glob(path.join(os.homedir(), '*.pdf'), (err, files) => {
      if (err) {
          console.error('Error occurred:', err);
          return;
      }
  
      // Output all the files found
      return runPromisesWithDelay(files.map(f => async () => {
        const fields=await getFormFields(f)
        console.log(f, Object.keys(fields))
      }))
  });
  })

})

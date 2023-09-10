import { generatePage, generateProject } from '../../utils/generatePage'
import fs from 'fs/promises'

import modelsAftral from '../data/dataModel.json'


// @ts-ignore
describe('Page generation', () => {

  const MODELS=[{
    name: "user",
    attributes: {
      firstname: {
        type: "String",
        multiple: false,
        ref: false
      },
      birthday: {
        type: "Date",
        multiple: false,
        ref: false
      },
      lastname: {
        type: "String",
        multiple: false,
        ref: false,
      },
    },
  },
  {
    name: "company",
    attributes: {
      name: {
        type: "String",
        multiple: false,
        ref: false
      },
    },
  }]

  test('Generate  basic page', () => {
    const page=generatePage('user', 1, MODELS)
    const project=generateProject([page])
    console.log(JSON.stringify(project, null, 2))
    const fileName=`/Users/seb/project.json`
    return fs.writeFile(fileName, JSON.stringify(project, null, 2))
      .then(() => console.log(`Generated in ${fileName}`))
      .catch(console.error)
  })

})

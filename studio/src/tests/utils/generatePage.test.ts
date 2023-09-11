import { generatePage, generateProject } from '../../utils/generatePage'
import fs from 'fs/promises'

import modelsSmartdiet from '../data/smartdiet_model.json'

// @ts-ignore
describe('Page generation', () => {

  test('Generate  basic page', () => {
    const page=generatePage('user', 1, Object.values(modelsSmartdiet))
    const project=generateProject([page])
    console.log(JSON.stringify(project, null, 2))
    const fileName=`/Users/seb/project.json`
    return fs.writeFile(fileName, JSON.stringify(project, null, 2))
      .then(() => console.log(`Generated in ${fileName}`))
      .catch(console.error)
  })

})

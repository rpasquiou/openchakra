const mongoose=require('mongoose')
const path=require('path')
const fs=require('fs')
const { getDatabaseUri } = require('../../config/config')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const { isScorm } = require('../../server/utils/filesystem')
const { osName } = require('react-device-detect')

const ROOT='/home/seb/Téléchargements/scorms'

describe('Test scorm', () => {

  beforeAll(async () => {
    await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  })

  const files=fs.readdirSync(ROOT).map(f => path.join(ROOT, f))
  console.log(files)

  test.each(files)('Should load Scorms', async filepath => {
    const contents=fs.readFileSync(filepath)
    const res=await isScorm({buffer: contents})
    console.log(res.version, res.entrypoint)
    try {
      expect(res).toBeTruthy()
    }
    catch(error) {
      throw new Error(`${filepath} must be a Scorm`)
    }
  })

})

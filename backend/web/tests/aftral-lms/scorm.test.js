const fs=require('fs')
const { isScorm } = require('../../server/utils/filesystem')

describe('Test scorm', () => {

  it.only('must test scorm', async () => {
    const buffer=await fs.readFileSync('/home/seb/Téléchargements/scorm.zip')
    const res=await isScorm(buffer)
    expect(res).toBe("1.0")
    const buffer2=await fs.readFileSync('/home/seb/Téléchargements/adlcp_rootv1p2.xsd')
    const res2=await isScorm(buffer2)
    expect(res2).toBe(false)
    const buffer3=await fs.readFileSync('/home/seb/Téléchargements/noscorm.zip')
    const res3=await isScorm(buffer3)
    expect(res3).toBe(false)
  })

})

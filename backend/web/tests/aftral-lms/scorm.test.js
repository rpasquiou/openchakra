const fs=require('fs')
const { isScorm } = require('../../server/utils/scorm')

describe('Test scorm', () => {

  it.only('must test scorm', async () => {
    const buffer=fs.readFileSync('/home/seb/Téléchargements/INTRO-C1.zip')
    const res=await isScorm({buffer})
    expect(res.length).toBeGreaterThan(0)
    const buffer2=fs.readFileSync('/home/seb/Téléchargements/feurst-db.zip')
    const res2=await isScorm({buffer: buffer2})
    expect(res2).toBeFalsy()
    const buffer3=fs.readFileSync('/home/seb/Téléchargements/test.pdf')
    const res3=await isScorm({buffer: buffer3})
    expect(res3.length).toBeFalsy()
  })

})

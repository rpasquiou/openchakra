const path=require('path')
const fs=require('fs')
const { extractData } = require('../../utils/import')
const { TEXT_TYPE } = require('../../utils/consts')

const XL_PATH=path.join(__dirname, '../data/test.csv')

describe('XL loading tests', () => {

  test('Must load csv', async() => {
    const contents=fs.readFileSync(XL_PATH)
    const res=await extractData(contents, {format: TEXT_TYPE, delimiter: ';'})
    console.log(res.records)
  })

})

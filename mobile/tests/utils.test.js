const fs=require('fs')
const dotenv=require('dotenv')
const {setJsonValue, setEnvValue}=require('../scripts/utils')
describe('Test virtual single ref', () => {

  const BEFORE='./test/before/it/starts'
  const AFTER='./test/after/it/ends'

  beforeAll(async() => {
  })

  afterAll(async() => {
  })

  it('must set JSON key', () => {
    const before={a:1}
    fs.writeFileSync('./test.json', JSON.stringify(before))
    setJsonValue('./test.json', 'b', 15)
    const contents=JSON.parse(fs.readFileSync('./test.json'))
    expect(contents).toEqual({a:1, b:15})
  })

  it('must set env value', () => {
    const before='a=1'
    fs.writeFileSync('./test.env', before)
    setEnvValue('./test.env', 'b', 15)
    const contents=fs.readFileSync('./test.env').toString()
    expect(contents).toEqual(`a=1\nb=15`)
  })

})

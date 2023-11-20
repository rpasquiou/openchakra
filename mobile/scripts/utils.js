const fs=require('fs')
const path=require('path')
const dotenv=require('dotenv')

const setJsonValue = (filename, key, value) => {
  const contents=fs.readFileSync(filename)
  const data=JSON.parse(contents)
  data[key]=value
  fs.writeFileSync(filename, JSON.stringify(data, null, 2))
}

const getJsonValue = (filename, key) => {
  const contents=fs.readFileSync(filename)
  const data=JSON.parse(contents)
  return data[key]
}

const setEnvValue = (filename, key, value) => {
  const contents=dotenv.parse(fs.readFileSync(filename))
  contents[key]=value
  const stringContents=Object.entries(contents)
      .map(([k, v])=> `${k}=${v}`)
      .join('\n')
  fs.writeFileSync(filename, stringContents)
}

const getEnvValue = (filename, key) => {
  const contents=dotenv.parse(fs.readFileSync(filename))
  return contents[key]
}

module.exports={
  setJsonValue,
  getJsonValue,
  setEnvValue,
  getEnvValue,
}

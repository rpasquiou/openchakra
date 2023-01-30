import zlib from 'zlib'
import config from '../../env.json'
import axios from 'axios'

export const copyFile = ({ contents, filePath, native }) => {
  const zippedContents=zlib.deflateSync(contents).toString('base64')
  const projName=native ? config.nativeProjectName : config.projectName
  const body = { contents:zippedContents, projectName: projName, filePath }
  const url=`${config.targetDomain}/myAlfred/api/studio/${native ? 'native/file': 'file'}`
  return axios.post(url, body)
}

export const copyNativeNavigation = ({ contents}) => {
  const zippedContents=zlib.deflateSync(contents).toString('base64')
  const body = { contents:zippedContents, projectName: config.nativeProjectName}
  const url=`${config.targetDomain}/myAlfred/api/studio/native/native-navigation`
  return axios.post(url, body)
}

export const install = () => {
  const body = { projectName: config.projectName }
  return axios.post(`${config.targetDomain}/myAlfred/api/studio/install`, body)
}

export const build = () => {
  const body = { projectName: config.projectName }
  return axios.post(`${config.targetDomain}/myAlfred/api/studio/build`, body)
}

export const start = () => {
  const body = { projectName: config.projectName }
  return axios.post(`${config.targetDomain}/myAlfred/api/studio/start`, body)
}

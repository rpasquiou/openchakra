const fs=require('fs')
const path=require('path')
const file=require('file')
const { splitRemaining } = require('../../../utils/text')
const { importData } = require('../../../utils/import')
const { RESOURCE_TYPE_EXCEL, RESOURCE_TYPE_PDF, RESOURCE_TYPE_PPT, RESOURCE_TYPE_VIDEO, RESOURCE_TYPE_WORD, ROLE_CONCEPTEUR, RESOURCE_TYPE_SCORM } = require('./consts')
const { sendFilesToAWS } = require('../../middlewares/aws')
const User = require('../../models/User')
const { removeExtension } = require('../../utils/filesystem')
require('../../models/Resource')

const RESOURCE_MAPPING= userId => ({
  name: `name`,
  code: `code`,
  url:  async ({record}) => {
    const s3filename=path.join(process.env.S3_PROD_ROOTPATH, path.basename(record.filepath))
    const req={
      body: {
        documents: [{
          filename: s3filename,
          buffer: fs.readFileSync(record.filepath)
        }],
      } 
    }
    await sendFilesToAWS(req, null, () => {})
    return req.body.result [0].Location
  },
  filepath: 'filepath',
  resource_type: 'resource_type',
  creator: () => userId,
})

const RESOURCE_KEY='code'

const importResources = async (root_path) => {
  const getResourceType = filepath => {
    const extensionMapping={
      xls: RESOURCE_TYPE_EXCEL,
      xlsx: RESOURCE_TYPE_EXCEL,
      pdf: RESOURCE_TYPE_PDF,
      pps: RESOURCE_TYPE_PPT,
      pptx: RESOURCE_TYPE_PPT,
      ppsx: RESOURCE_TYPE_PPT,
      mp4: RESOURCE_TYPE_VIDEO,
      doc: RESOURCE_TYPE_WORD,
      docx: RESOURCE_TYPE_WORD,
      zip: RESOURCE_TYPE_SCORM,
    }
    const ext=path.extname(filepath).split('.')[1]
    const resource_type=extensionMapping[ext]
    if (!resource_type && !!filepath) {
      throw new Error(`${Object.keys(extensionMapping)} No type for ${ext} ${filepath}:${resource_type}`)
    }
    return resource_type
  }
  const splitCodeName = filepath => {
    const basename=path.basename(filepath)
    return splitRemaining(basename, ' ')
  }
  let filepaths=[]
  const cb = async (directory,subdirectories, paths) => {
    filepaths.push(...paths.map(p => [path.join(directory, p), ...splitCodeName(p), getResourceType(p)]))
  }
  console.log('filepaths', filepaths)
  const files=await file.walkSync(root_path, cb)
  const records=filepaths.filter(t => !!t[2]).map(t => ({
    filepath: t[0],
    code: t[1],
    name: removeExtension(t[2]),
    resource_type: t[3]
  }))
  const userId=(await User.findOne({role: ROLE_CONCEPTEUR}))?._id
  console.log('importing', records.length, 'resources')
  return importData({model: 'resource', data: records, mapping: RESOURCE_MAPPING(userId), identityKey: RESOURCE_KEY, migrationKey: RESOURCE_KEY})
}


module.exports={
  importResources,
}  


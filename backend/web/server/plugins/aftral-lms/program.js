const mime=require('mime-types')
const Program=require('../../models/Program')
const { getResourcesProgress, getBlockResources } = require('./resources')
const { fillForm2 } = require('../../../utils/fillForm')
const { loadFromDb } = require('../../utils/database')
const Resource = require('../../models/Resource')
const { BLOCK_TYPE_SESSION } = require('./consts')
const { formatDateTime } = require('../../../utils/text')
const { sendBufferToAWS } = require('../../middlewares/aws')
const AdmZip = require('adm-zip')

const PROGRAM_CERTIFICATE_ATTRIBUTES = [
  `name`,
  `_certificate`,
  `parent`,
  `children.name`,
  `children.resources_progress`,
  `children.children.name`,
  `children.children.resources_progress`,
  `parent.resources_progress`
]

async function getModulesData(userId, params, children) {
  return Promise.all(children.map(async child => ({
    module_name: child.name,
    module_progress: await getResourcesProgress(userId, params, child),
  })))
}

async function getChapterData(userId, params, data) {
  return Promise.all(data.children.map(async child => ({
    chapter_name: child.name,
    chapter_progress: await getResourcesProgress(userId, params, child),
    modules_data: await getModulesData(userId, params, child.children),
  })))
}

// trainee_fullname,end_date,location
const getSessionCertificate = async (userId, params, data) => {
  if (data.type!=BLOCK_TYPE_SESSION) {
    return null
  }

  let template=(await Program.findOne(data.children[0]._id).populate('template'))?.template

  if (!template) {
    console.warn(`Getting certificate in the program`)
    template=(await Program.findOne({name: data.children[0].name, origin: null}))?.template
  }

  if (!template) {
    console.error(`No template for session ${data._id}, program ${data.children[0].name}`)
    return null
  }

  const locations=await Promise.all(data.trainees.map(async trainee => {
    const pdfData = {
      trainee_fullname: trainee.fullname,
      end_date: formatDateTime(data.end_date),
      location: data.location,
      level_1:[],
    }
  
    const pdfPath=template.url
    const pdf=await fillForm2(pdfPath, pdfData).catch(console.error)
    const buffer=await pdf.save()
    const filename=`${data.code}-${trainee.fullname}.pdf`
    await sendBufferToAWS({filename, buffer, type: 'certificate', mimeType: mime.lookup(filename)}).catch(console.error)
    return {filename: filename, buffer}
  }))

  // Generate a zip
  const zip=new AdmZip()
  locations.map(({filename, buffer}) => {
    zip.addFile(filename, buffer)
  })
  const buffer=zip.toBuffer()
  const filename=`Certificats-${data.code}.zip`
  const {Location}=await sendBufferToAWS({filename, buffer, type: 'certificates', mimeType: mime.lookup(filename)}).catch(console.error)
  return Location
}

const getEvalResources = async (userId, params, data, fields, actualLogged) => {
  const resourceIds = await getBlockResources({blockId: data._id, userId: actualLogged, allResources: true})

  params={...params, [`filter._id`]: {$in: resourceIds}}
  let resources = await loadFromDb({
    model: `resource`,
    user: actualLogged,
    fields: [...fields, 'evaluation'],
    params: params,
  })
  
  resources = resources.filter(r => !!r.evaluation
  )

  return resources.map(r => new Resource(r))
}

module.exports={
  getSessionCertificate, PROGRAM_CERTIFICATE_ATTRIBUTES, getEvalResources
}
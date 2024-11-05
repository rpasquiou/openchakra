const mime=require('mime-types')
const lodash=require('lodash')
const Program=require('../../models/Program')
const { getResourcesProgress, getBlockResources } = require('./resources')
const { fillForm2, getFormFields } = require('../../../utils/fillForm')
const { loadFromDb, idEqual } = require('../../utils/database')
const Resource = require('../../models/Resource')
const { BLOCK_TYPE_SESSION, BLOCK_STATUS } = require('./consts')
const { formatDateTime, formatPercent, formatDate } = require('../../../utils/text')
const { sendBufferToAWS } = require('../../middlewares/aws')
const AdmZip = require('adm-zip')
const { isDevelopment } = require('../../../config/config')

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
    console.warn(`Getting certificate in the program`, data.children[0].name)
    template=(await Program.findOne({name: data.children[0].name, origin: null, _locked: {$ne: true}}).populate('template'))?.template
  }

  if (!template) {
    console.error(`No template for session ${data._id}, program ${data.children[0].name}`)
    return null
  }

  const documents=await Promise.all(data.trainees.map(async trainee => {

    const sessionFields=[
      'name', 'start_date', 'end_date', 'resources_progress', 'location', 'code', 'achievement_status', '_trainees_connections', 'spent_time_str',
      'children.name', 'children.resources_progress', 'children.spent_time_str', 'children.order',
      'children.children.name', 'children.children.resources_progress', 'children.children.spent_time_str', 'children.children.order', 
      'children.children.children.name', 'children.children.children.resources_progress', 'children.children.children.spent_time_str', 'children.children.children.order', 
      
    ]

    const [session]=await loadFromDb({model: 'session', id: data._id, fields: sessionFields, user: trainee._id})

    const firstConnection=session._trainees_connections.find(tc => idEqual(tc.trainee._id, trainee.id))?.date

    const pdfData = {
      session_name: session.name, session_code: session.code,
      first_connection: firstConnection ? formatDate(firstConnection, true) : undefined,
      achievement_status:  BLOCK_STATUS[session.achievement_status],
      trainee_fullname: trainee.fullname,
      start_date: 'Le '+formatDate(session.start_date, true), end_date: 'Le '+formatDate(session.end_date, true),
      location: 'À '+session.location,
      total_resources_progress: formatPercent(session.resources_progress),
      level_1:session.children.map(child => ({
        name: child.name, resources_progress: formatPercent(child.resources_progress), spent_time_str: child.spent_time_str, order: child.order,
        level_2:child.children.map(child2 => ({
          name: child2.name, resources_progress: formatPercent(child2.resources_progress), spent_time_str: child2.spent_time_str, order: child2.order,
          level_3:child2.children.map(child3 => ({
            name: child3.name, resources_progress: formatPercent(child3.resources_progress), spent_time_str: child3.spent_time_str, order: child3.order,
          }))
          }))
      }))
    }
  
    const pdfPath=template.url
    const pdf=await fillForm2(pdfPath, pdfData).catch(console.error)
    const buffer=await pdf.save()
    const filename=`${data.code}-certif-${trainee.fullname}.pdf`
    await sendBufferToAWS({filename, buffer, type: 'certificate', mimeType: mime.lookup(filename)}).catch(console.error)
    return {filename: filename, buffer}
  }))

  // Generate a zip
  const zip=new AdmZip()
  documents.map(({filename, buffer}) => {
    zip.addFile(filename, buffer)
  })
  const buffer=zip.toBuffer()
  const filename=`Certificats-${data.code}.zip`
  const {Location}=await sendBufferToAWS({filename, buffer, type: 'certificates', mimeType: mime.lookup(filename)}).catch(console.error)
  return Location
}

const getEvalResources = async (userId, params, data, fields, actualLogged) => {
  const resourceIds = await getBlockResources({blockId: data._id, userId: actualLogged, allResources: true})

  params=lodash(params)
    .omitBy((_, k) => ['filter', 'limit'].includes(k))
    .mapKeys((_, k) => k.replace('.evaluation_resources', ''))
    .value()
  params={...params, [`filter._id`]: {$in: resourceIds}, ['filter.evaluation']: true}

  let resources = await loadFromDb({
    model: `resource`,
    user: userId,
    fields: [...fields, 'evaluation'],
    params: params,
  })
  
  return resources.map(r => new Resource(r))
}

module.exports={
  getSessionCertificate, PROGRAM_CERTIFICATE_ATTRIBUTES, getEvalResources
}
const mime=require('mime-types')
const moment=require('moment')
const lodash=require('lodash')
const Program=require('../../models/Program')
const { getResourcesProgress, getBlockResources } = require('./resources')
const { fillForm2, getFormFields } = require('../../../utils/fillForm')
const { loadFromDb, idEqual } = require('../../utils/database')
const Resource = require('../../models/Resource')
const { BLOCK_TYPE_SESSION, BLOCK_STATUS, ROLE_APPRENANT } = require('./consts')
const { formatDateTime, formatPercent, formatDate, formatDateEnglish } = require('../../../utils/text')
const { sendBufferToAWS } = require('../../middlewares/aws')
const AdmZip = require('adm-zip')
const { isDevelopment } = require('../../../config/config')
const User = require('../../models/User')
const { ForbiddenError, NotFoundError } = require('../../utils/errors')
const { getCertificateName } = require('./utils')
const axios = require('axios')
const Progress = require('../../models/Progress')

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

  if (moment().endOf('day').isBefore(data.end_date)) {
    throw new Error(`La session ${data.name} n'est pas terminée`)
  }
  const role=(await User.findById(userId)).role
  if (role==ROLE_APPRENANT) {
    if (!data.trainees.some(t => idEqual(t._id, userId))) {
      throw new ForbiddenError(`Vous n'êtes pas enregistré sur cette session`)
    }
    data.trainees=data.trainees.filter(t => idEqual(t._id, userId))
  }

  if (data.type!=BLOCK_TYPE_SESSION) {
    return null
  }

  let template=(await Program.findOne(data.children[0]._id).populate('template'))?.template

  if (!template) {
    console.warn(`Getting certificate in the program`, data.children[0].name)
    template=(await Program.findOne({name: data.children[0].name, origin: null, _locked: {$ne: true}}).populate('template'))?.template
  }

  if (!template) {
    throw new NotFoundError(`Session ${data.name} : modèle de certificat non défini`)
  }

  const documents=await Promise.all(data.trainees.map(async trainee => {

    const filename= await getCertificateName(data._id, trainee._id)
    let buffer=null
    let location=(await Progress.findOne({block: data._id, user: trainee._id}))?.certificate_url
    
    console.log(data.name, trainee.email, location ? 'Certificat déjà généré' : 'Certificat non encore généré')
    // Certificate was already generated ?
    if (location) {
      buffer=(await axios.get(location, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/pdf'
        }})).data
    }
    else {
      const sessionFields=[
        'name', 'start_date', 'end_date', 'resources_progress', 'location', 'code', 'achievement_status', '_trainees_connections', 'spent_time_str',
        'children.name', 'children.resources_progress', 'children.spent_time_str', 'children.order',
        'children.children.name', 'children.children.resources_progress', 'children.children.spent_time_str', 'children.children.order', 
        'children.children.children.name', 'children.children.children.resources_progress', 'children.children.children.spent_time_str', 'children.children.children.order', 
        
      ]

      const [session]=await loadFromDb({model: 'session', id: data._id, fields: sessionFields, user: trainee._id})

      const firstConnection=session._trainees_connections.find(tc => idEqual(tc.trainee._id, trainee.id))?.date

      const sessionLocation=`${!!template.english ? 'Place : ': 'À '}${session.location}`
      const start_date=!!template.english ? `Date : ${formatDateEnglish(session.start_date, true)}` : `Le ${formatDate(session.start_date, true)}`
      const end_date=!!template.english ? `Date : ${formatDateEnglish(session.end_date, true)}` : `Le ${formatDate(session.end_date, true)}`
      const pdfData = {
        session_name: session.name, session_code: session.code,
        first_connection: firstConnection ? formatDate(firstConnection, true) : undefined,
        achievement_status:  BLOCK_STATUS[session.achievement_status],
        trainee_fullname: trainee.fullname,
        start_date, end_date, location: sessionLocation,
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
      buffer=await pdf.save()
      location = (await sendBufferToAWS({filename, buffer, type: 'certificate', mimeType: mime.lookup(filename)}))?.Location
      await Progress.findOneAndUpdate(
        {block: data._id, user: trainee._id},
        {block: data._id, user: trainee._id, certificate_url: location},
        {upsert: true,}
      )
    }
    return {location,filename, buffer}
  }))

  if (role==ROLE_APPRENANT) {
    return documents[0].location
  }
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
  const resourceIds = await getBlockResources({blockId: data._id, userId: actualLogged, includeUnavailable: true, includeOptional: true})

  params=lodash(params)
    .omitBy((_, k) => ['filter', 'limit'].includes(k) || !/evaluation_resources\./.test(k))
    .mapKeys((_, k) => k.replace(/^(limit|sort).*\.evaluation_resources(.*)$/, '$1$2'))
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

const getHomeworkResources = async (userId, params, data, fields, actualLogged) => {
  const resourceIds = await getBlockResources({blockId: data._id, userId: actualLogged, includeUnavailable: true, includeOptional: true})

  params=lodash(params)
    .omitBy((_, k) => ['filter', 'limit'].includes(k) || !/homework_resources\./.test(k))
    .mapKeys((_, k) => k.replace(/^(limit|sort).*\.homework_resources(.*)$/, '$1$2'))
    .value()
  params={...params, [`filter._id`]: {$in: resourceIds}, ['filter.homework_mode']: true}

  let resources = await loadFromDb({
    model: `resource`,
    user: userId,
    fields: [...fields, 'homeworks'],
    params: params,
  })
  
  return resources.map(r => new Resource(r))
}

module.exports={
  getSessionCertificate, getEvalResources, getHomeworkResources,
}

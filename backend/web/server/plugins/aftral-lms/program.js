const ProductCode=require('../../models/ProductCode')
const Program=require('../../models/Program')
const lodash=require('lodash')
const User = require('../../models/User')
const { getResourcesProgress, getBlockResources } = require('./resources')
const { generateDocument } = require('../../../utils/fillForm')
const path = require('path')
const { loadFromDb } = require('../../utils/database')
const Resource = require('../../models/Resource')
const Homework = require('../../models/Homework')
const ROOT = path.join(__dirname, `../../../static/assets/aftral_templates`)
const TEMPLATE_NAME = 'template1'

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

const getCertificate = async (userId, params, data) => {
  if (data._certificate) {
    return data._certificate
  }

  const user = await User.findById(userId)
  const fillData = {
    _id: data._id,
    trainee_fullname: `${user.firstname} ${user.lastname}`,
    resources_progress: await getResourcesProgress(userId, params, data.parent),
    program_name: data.name,
    session_name: data.parent.name,
    end_date: data.parent.end_date,
    chapter_data: await getChapterData(userId, params, data),
  }

  // console.log(JSON.stringify(fillData, null, 2))

  const TEMPLATE_PATH = `${path.join(ROOT, TEMPLATE_NAME)}.pdf`
  const result = await generateDocument('certificate', 'certificate', '_certificate', TEMPLATE_PATH, TEMPLATE_NAME, fillData)
  return result
}

const getEvalResources = async (userId, params, data, fields) => {
  const resourceIds = await getBlockResources(data._id)
  
  const newParams = {
    [`filter._id`]: {$in: resourceIds},
  }
  const user = await User.findById(userId)

  let resources = await loadFromDb({
    model: `resource`,
    user,
    fields: [...fields, `note`, `scale`, `homework_mode`, `resource_type`, `name`, `success_note_max`, `max_attempts`, `homeworks`],
    params: newParams
  })

  resources = resources.filter(r => 
    r.homework_mode == true || (r.note !== undefined && r.note !== null) || (r.scale !== undefined && r.scale !== null)
  )
  const res = resources.map(r => {
    const resource = new Resource(r)
    resource.homeworks = r.homeworks
    return resource
  })
  // console.log(res)
  return resources
}

module.exports={
  getCertificate, PROGRAM_CERTIFICATE_ATTRIBUTES, getEvalResources
}
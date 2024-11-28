const lodash=require('lodash')
const HardSkillCategory = require("../../models/HardSkillCategory")
const HardSkill = require("../../models/HardSkill")
const { idEqual } = require("../../utils/database")
const User = require('../../models/User')
const Announce = require('../../models/Announce')

// Returns HS categories tree for user job & extra skills
const computeUserHardSkillsCategories = async (userId, params, data) => {
  const categories=await HardSkillCategory.find({parent: null})
    .populate(['skills', {path: 'children', populate: ['children', 'skills']}])
  // Get user main job's skills
  const skills=data.main_job.job_file.hard_skills

  // Keep only categories containing hard skills linked to the main job's jobfile
  const keep_category= (category) => {
    // Has skill: keep only if contains user skills
    if (category.skills.length>0) {
      return category.skills.some(s => idEqual(s.job_file._id, data.main_job.job_file._id))
    }
    return category.children?.some(c => keep_category(c))
  }
  const map_category = category => {
    return new HardSkillCategory({
      ...category.toObject(),
      children: category.children.filter(child => keep_category(child)).map(child => map_category(child)),
      skills: category.skills.filter(s => skills.some(us => idEqual(us._id, s._id)))
    })
  }
  const filtered_categories=categories
    .filter(c => keep_category(c))
    .map(c => map_category(c))
  await Promise.all(filtered_categories.map(async c => c.progress=await computeHSCategoryProgress(data._id, null, c)))
  return filtered_categories
}

// COmpute for toplevel only
const computeHSCategoryProgress = async (id, params, data) => {
  if (!!data.parent) return 0
  
  const category = await HardSkillCategory.findById(data._id)
    .populate(['skills', {path: 'children', populate: 'skills'}])

  const categorySkills = lodash.flattenDeep([
    ...category.skills, 
    ...category.children.map(child => child.skills)
  ]).map(s => s._id)

  const isUser = await User.exists({ _id: id })
  const isAnnounce = !isUser

  let jobSkills
  if (isUser) {
    const user = await User.findById(id)
      .populate({path: 'main_job', populate: {path: 'job_file', populate: 'hard_skills'}})
    jobSkills = user.main_job.job_file.hard_skills
  } else {
    const announce = await Announce.findById(id)
      .populate({path: 'job', populate: {path: 'job_file', populate: 'hard_skills'}}) 
    jobSkills = announce.job.job_file.hard_skills
  }

  const jobCategorySkills = lodash.intersectionBy(categorySkills, jobSkills, id => id._id.toString())
  return jobCategorySkills.length/jobSkills.length
}

//TODO Refactorise this function to generalize function !
const computeAnnounceHardSkillsCategories = async (announceId, params, data) => {

  // Retrieve all root hard skill categories
  const categories = await HardSkillCategory.find({ parent: null }).populate([
    'skills',
    { path: 'children', populate: ['children', 'skills'] },
  ])

  // Extract hard skills from the job file
  const skills = data.job?.job_file?.hard_skills
  if (!skills) return []

  // Determine if a category should be kept
  const keep_category = (category) => {
    if (category.skills.length > 0) {
      return category.skills.some((s) =>
        idEqual(s.job_file._id, data.job.job_file._id)
      )
    }
    return category.children?.some((c) => keep_category(c))
  }

  // Map and filter categories with the relevant skills
  const map_category = (category) => {
    return new HardSkillCategory({
      ...category.toObject(),
      children: category.children
        .filter((child) => keep_category(child))
        .map((child) => map_category(child)),
      skills: category.skills.filter((s) =>
        skills.some((js) => idEqual(js._id, s._id))
      ),
    })
  }

  // Filter and map categories and compute progress
  const filtered_categories=categories
    .filter(c => keep_category(c))
    .map(c => map_category(c))
    await Promise.all(filtered_categories.map(async c => c.progress=await computeHSCategoryProgress(data._id, null, c)))
  return filtered_categories
}

module.exports={
  computeUserHardSkillsCategories, computeHSCategoryProgress, computeAnnounceHardSkillsCategories
}
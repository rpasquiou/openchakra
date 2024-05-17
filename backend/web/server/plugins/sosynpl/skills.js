const lodash=require('lodash')
const HardSkillCategory = require("../../models/HardSkillCategory")
const HardSkill = require("../../models/HardSkill")
const { idEqual } = require("../../utils/database")
const User = require('../../models/User')

// Returns HS categories tree for user job & extra skills
const computeUserHardSkillsCategories = async (userId, params, data) => {
  const categories=await HardSkillCategory.find({parent: null})
    .populate(['skills', {path: 'children', populate: ['children', 'skills']}])
  const skills=[...(data.hard_skills_job || []), ...(data.hard_skills_extra || [])].map(s => s._id)
  // Keep only categories containing user skills
  const keep_category= (category) => {
    // Has skill: keep only if contains user skills
    if (category.skills.length>0) {
      return category.skills.some(s => skills.some(us => idEqual(us, s._id)))
    }
    return category.children?.some(c => keep_category(c))
  }
  const map_category = category => {
    return new HardSkillCategory({
      ...category.toObject(),
      children: category.children.filter(child => keep_category(child)).map(child => map_category(child)),
      skills: category.skills.filter(s => skills.some(us => idEqual(us, s._id)))
    })
  }
  const filtered_categories=categories
    .filter(c => keep_category(c))
    .map(c => map_category(c))
  await Promise.all(filtered_categories.map(async c => c.progress=await computeHSCategoryProgress(userId, null, c)))
  return filtered_categories
}

// COmpute for toplevel only
const computeHSCategoryProgress = async (userId, params, data) => {
  if (!!data.parent) {
    return 0
  }
  const user=(await User.findById(userId))
  const userSkills=[...(user.hard_skills_job||[]), ...(user.hard_skills_extra||[])]
  const category=await HardSkillCategory.findById(data._id).populate({path: 'children', populate: 'skills' })
  const categorySkills=lodash.flatten(category.children.map(child => child.skills), 2).map(s => s._id)
  const commonSkills=lodash.intersectionBy(userSkills, categorySkills, id => id._id.toString())
  return commonSkills.length/categorySkills.length
}

// Returns HS categories tree for main_job only
const computeUserHardSkillsJobCategories = async (userId, params, data) => {
  const categories=await HardSkillCategory.find({parent: null})
    .populate(['skills', {path: 'children', populate: ['children', 'skills']}])
  const skills=data.main_job.job_file.hard_skills.map(s => s._id)
  // Keep only categories containing user skills
  const keep_category= (category) => {
    // Has skill: keep only if contains user skills
    if (category.skills.length>0) {
      return category.skills.some(s => skills.some(us => idEqual(us, s._id)))
    }
    return category.children?.some(c => keep_category(c))
  }
  const map_category = category => {
    return new HardSkillCategory({
      ...category.toObject(),
      children: category.children.filter(child => keep_category(child)).map(child => map_category(child)),
      skills: category.skills.filter(s => skills.some(us => idEqual(us, s._id)))
    })
  }
  const filtered_categories=categories
    .filter(c => keep_category(c))
    .map(c => map_category(c))
  await Promise.all(filtered_categories.map(async c => c.progress=await computeHSCategoryProgress(userId, null, c)))
  return filtered_categories
}

module.exports={
  computeUserHardSkillsCategories, computeHSCategoryProgress, computeUserHardSkillsJobCategories
}
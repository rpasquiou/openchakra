const lodash=require('lodash')
const HardSkillCategory = require("../../models/HardSkillCategory")
const HardSkill = require("../../models/HardSkill")
const { idEqual } = require("../../utils/database")
const User = require('../../models/User')

// Returns HS categories tree for user job & extra skills
const computeUserHardSkillsCategories = async (userId, params, data) => {
  const categories=await HardSkillCategory.find({parent: null})
    .populate(['skills', {path: 'children', populate: ['children', 'skills']}])
  const skills=[]
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
      skills: category.skills.filter(s => skills.some(us => idEqual(us, s._id)))
    })
  }
  const filtered_categories=categories
    .filter(c => keep_category(c))
    .map(c => map_category(c))
  await Promise.all(filtered_categories.map(async c => c.progress=await computeHSCategoryProgress(data._id, null, c)))
  return filtered_categories
}

// COmpute for toplevel only
const computeHSCategoryProgress = async (userId, params, data) => {
  // Don't compute progress for children HS categories
  if (!!data.parent) {
    return 0
  }

  const user=await User.findById(userId).populate({path: 'main_job', populate: {path: 'job_file', populate: 'hard_skills'}})
  const mainJobSkills=user.main_job.job_file.hard_skills
  
  const category=await HardSkillCategory.findById(data._id)
    .populate(['skills', {path: 'children', populate: 'skills' }])
  const categorySkills=lodash.flattenDeep([...category.skills, ...category.children.map(child => child.skills)]).map(s => s._id)
  const jobCategorySkills=lodash.intersectionBy(categorySkills, mainJobSkills, id => id._id.toString())
  return jobCategorySkills.length/mainJobSkills.length
}

module.exports={
  computeUserHardSkillsCategories, computeHSCategoryProgress,
}
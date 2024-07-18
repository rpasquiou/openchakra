/*TODO:
- See with client how he wants completion, in older version, it never reaches 100%
*/

const { CF_MAX_GOLD_SOFT_SKILLS, CF_MAX_SILVER_SOFT_SKILLS, CF_MAX_BRONZE_SOFT_SKILLS } = require("./consts")

const REQUIRED_ATTRIBUTES = ['firstname', 'lastname', 'main_job', 'work_duration', 'position', 'experience', 'main_experience']
const SOFT_SKILLS_ATTR = ['gold_soft_skills', 'silver_soft_skills', 'bronze_soft_skills']
const MANDATORY_ATTRIBUTES = ['picture', 'company_size', 'work_mode', 'mobility', 'work_sector', 'expertises', 'experiences', 'trainings', 'description', 'rate']

const profileCompletion = (user) => {
  if (!user['missing_attributes'] || user['missing_attributes'].length === 0) return 1
  const missing = user['missing_attributes']
  let result = 0
  const requiredMissing = REQUIRED_ATTRIBUTES.filter(attr => missing.includes(attr)).length
  if (requiredMissing === 0) result += 40
  else result += 5 * (REQUIRED_ATTRIBUTES.length - requiredMissing)

  const mandatoryMissing = MANDATORY_ATTRIBUTES.filter(attr => missing.includes(attr)).length
  const mandatoryPenalty = Math.floor((60 / MANDATORY_ATTRIBUTES.length) * mandatoryMissing)
  
  result += 60 - mandatoryPenalty

  return result/100
};

const missingAttributes = (user) => {
  let missingAttr = [];
  let i=0;
  [...REQUIRED_ATTRIBUTES, ...MANDATORY_ATTRIBUTES].forEach(attr => {
    if (!user[attr]) missingAttr = [...missingAttr, attr]
  })
  if (
    !user['gold_soft_skills'] && !user['gold_soft_skills'].length === CF_MAX_GOLD_SOFT_SKILLS &&
    !user['silver_soft_skills'] && !user['silver_soft_skills'].length === CF_MAX_SILVER_SOFT_SKILLS &&
    !user['bronze_soft_skills'] && !user['bronze_soft_skills'].length === CF_MAX_BRONZE_SOFT_SKILLS
  ) missingAttr= [...missingAttr, 'Soft_Skills']
  return missingAttr
}

module.exports = { missingAttributes, profileCompletion, REQUIRED_ATTRIBUTES, SOFT_SKILLS_ATTR, MANDATORY_ATTRIBUTES }

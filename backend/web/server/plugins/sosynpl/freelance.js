/*TODO:
- See with client how he wants completion, in older version, it never reaches 100%
*/

const { CF_MAX_GOLD_SOFT_SKILLS, CF_MAX_SILVER_SOFT_SKILLS, CF_MAX_BRONZE_SOFT_SKILLS } = require("./consts")

const REQUIRED_ATTRIBUTES = ['firstname', 'lastname', 'main_job', 'work_duration', 'position', 'experience', 'main_experience']
const SOFT_SKILLS_ATTR = ['gold_soft_skills', 'silver_soft_skills', 'bronze_soft_skills']
const MANDATORY_ATTRIBUTES = ['picture', 'company_size', 'work_mode', 'mobility', 'work_sector', 'expertises', 'experiences', 'trainings', 'description', 'rate']

const profileCompletion = (user) => {
  const totalAttr = REQUIRED_ATTRIBUTES.length + MANDATORY_ATTRIBUTES.length + 1; // +1 for the soft skills
  let validated = 0
  if(user['missing_attributes']) validated = totalAttr - user['missing_attributes'].length
  return validated / totalAttr
}

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

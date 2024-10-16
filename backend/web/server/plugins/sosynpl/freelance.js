const { CF_MAX_GOLD_SOFT_SKILLS, CF_MAX_SILVER_SOFT_SKILLS, CF_MAX_BRONZE_SOFT_SKILLS, FREELANCE_REQUIRED_ATTRIBUTES, FREELANCE_MANDATORY_ATTRIBUTES, FREELANCE_OUTPUT_ATTRIBUTES, SOFT_SKILLS_ATTR } = require("./consts")

const freelanceProfileCompletion = (user) => {
  const missing = user['freelance_missing_attributes'].split(` - `).map(attribute => attribute.trim())
  let result = 0
  const requiredMissing = FREELANCE_REQUIRED_ATTRIBUTES.filter(attr => missing.includes(attr)).length
  if (requiredMissing > 0) {
    return 0
  }

  result += 40
  
  const mandatoryMissing = FREELANCE_MANDATORY_ATTRIBUTES.filter(attr => missing.includes(FREELANCE_OUTPUT_ATTRIBUTES[attr])).length
  const softSkillsMissing = SOFT_SKILLS_ATTR.filter(skillAttr => missing.includes(FREELANCE_OUTPUT_ATTRIBUTES[skillAttr])).length
  const totalMandatoryMissing = mandatoryMissing + softSkillsMissing
  const mandatoryPenalty = Math.floor((60 / (FREELANCE_MANDATORY_ATTRIBUTES.length + SOFT_SKILLS_ATTR.length)) * totalMandatoryMissing)

  result += 60 - mandatoryPenalty

  if (!user['expertises'] || user['expertises'].length < 3) {
    result -= 5
  }

  return result / 100
}

const freelanceMissingAttributes = (user) => {
  let missingAttr = []
  const allAttributes = [...FREELANCE_REQUIRED_ATTRIBUTES, ...FREELANCE_MANDATORY_ATTRIBUTES]
  allAttributes.forEach((attr) => {
    if (!user[attr] || (Array.isArray(user[attr]) && user[attr].length === 0)) {
      const attributeString = `${FREELANCE_OUTPUT_ATTRIBUTES[attr]} `
      missingAttr = [...missingAttr, attributeString]
    }
  })
  

  if (!user['bronze_soft_skills'] || user['bronze_soft_skills'].length === 0) {
    const skillString = 'soft skills'
    missingAttr = [...missingAttr, skillString]
  }


  if (!user['expertises'] || user['expertises'].length < 3) {
    missingAttr = [...missingAttr, 'au moins 3 compétences']
  }
  missingAttr = missingAttr.join(` - `)
  return missingAttr.charAt(0).toUpperCase() + missingAttr.slice(1)
}

module.exports = { freelanceMissingAttributes, freelanceProfileCompletion }

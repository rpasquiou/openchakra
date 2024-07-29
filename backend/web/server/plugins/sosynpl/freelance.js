const { CF_MAX_GOLD_SOFT_SKILLS, CF_MAX_SILVER_SOFT_SKILLS, CF_MAX_BRONZE_SOFT_SKILLS, FREELANCE_REQUIRED_ATTRIBUTES, FREELANCE_MANDATORY_ATTRIBUTES, FREELANCE_OUTPUT_ATTRIBUTES } = require("./consts")

const freelanceProfileCompletion = (user) => {
  if (!user['freelance_missing_attributes'] || user['freelance_missing_attributes'].length === 0) return 1
  const missing = user['freelance_missing_attributes'].map(attribute => attribute.trim())
  let result = 0
  const requiredMissing = FREELANCE_REQUIRED_ATTRIBUTES.filter(attr => missing.includes(attr)).length
  if (requiredMissing === 0) result += 40
  else result += 5 * (FREELANCE_REQUIRED_ATTRIBUTES.length - requiredMissing)
  const mandatoryMissing = FREELANCE_MANDATORY_ATTRIBUTES.filter(attr => missing.includes(FREELANCE_OUTPUT_ATTRIBUTES[attr])).length
  const mandatoryPenalty = Math.floor((60 / FREELANCE_MANDATORY_ATTRIBUTES.length) * mandatoryMissing)
  
  result += 60 - mandatoryPenalty
  return result/100
}

const freelanceMissingAttributes = (user) => {
  let missingAttr = []
  const allAttributes = [...FREELANCE_REQUIRED_ATTRIBUTES, ...FREELANCE_MANDATORY_ATTRIBUTES]
  allAttributes.forEach((attr, index) => {
    if (!user[attr]) {
      const attributeString = `${FREELANCE_OUTPUT_ATTRIBUTES[attr]} `
      missingAttr = [...missingAttr, attributeString]
    }
  })
  if (
    (!user['gold_soft_skills'] || user['gold_soft_skills'].length !== CF_MAX_GOLD_SOFT_SKILLS) ||
    (!user['silver_soft_skills'] || user['silver_soft_skills'].length !== CF_MAX_SILVER_SOFT_SKILLS) ||
    (!user['bronze_soft_skills'] || user['bronze_soft_skills'].length !== CF_MAX_BRONZE_SOFT_SKILLS)
  ) {
    missingAttr = [...missingAttr, `${FREELANCE_OUTPUT_ATTRIBUTES['soft_skills']}`]
  } else {
    missingAttr[missingAttr.length - 1] = missingAttr[missingAttr.length - 1].trim()
  }
  return missingAttr
}

module.exports = { freelanceMissingAttributes, freelanceProfileCompletion }

const { FREELANCE_REQUIRED_ATTRIBUTES, FREELANCE_MANDATORY_ATTRIBUTES, FREELANCE_OUTPUT_ATTRIBUTES, SOFT_SKILLS_ATTR } = require("./consts")

/**
 * Utility function that returns the list of missing attribute names
 * @param {Object} user - User object to check
 * @returns {Array} - List of missing attribute names
 */
const getFreelanceMissingAttributesNames = (user) => {
  let missingAttributes = []
  // -- Combine required and madatory attributes
  const allAttributes = [...FREELANCE_REQUIRED_ATTRIBUTES, ...FREELANCE_MANDATORY_ATTRIBUTES]

  // -- Check each attribute
  allAttributes.forEach((attr) => {
    if (!user[attr] || (Array.isArray(user[attr]) && user[attr].length === 0)) {
      missingAttributes.push(attr)
    }
  })

  // -- Specifically check bronze soft skills
  if (!user['bronze_soft_skills'] || user['bronze_soft_skills'].length === 0) {
    missingAttributes.push('bronze_soft_skills')
  }

  // -- Check if there are at least 3 expertises
  if (!user['expertises'] || user['expertises'].length < 3) {
    missingAttributes.push('expertises')
  }

  return missingAttributes
}

/**
 * Calculate the completion percentage of the freelance profile
 * @param {Object} user - User object to evaluate
 * @returns {Number} - Completion percentage (between 0 and 1)
 */
const freelanceProfileCompletion = (user) => {
  const missingAttributes = getFreelanceMissingAttributesNames(user)
  let result = 0

  // -- Check required attributes
  const requiredMissing = FREELANCE_REQUIRED_ATTRIBUTES.filter(attr => missingAttributes.includes(attr)).length

  // -- If any required attribute is missing return 0
  if (requiredMissing > 0) {
    return 0
  }

  // -- Award 40% for having all required attributes
  result += 40

  // -- Calculate penalties for missing mandatory attributes
  const mandatoryMissing = FREELANCE_MANDATORY_ATTRIBUTES.filter(attr => missingAttributes.includes(attr)).length

  // -- Calculate penalties for missing soft skills
  const softSkillMissing = SOFT_SKILLS_ATTR.filter(skillAttr => missingAttributes.includes(skillAttr)).length

  // -- Calculate total penalty on the remaining 60%
  const totalMandatoryPenalty = mandatoryMissing + softSkillMissing
  const mandatoryPenalty = Math.floor((60 / (FREELANCE_MANDATORY_ATTRIBUTES.length + SOFT_SKILLS_ATTR.length)) * totalMandatoryPenalty)

  result += 60 - mandatoryPenalty

  // -- 5% penalty if less than expertises
  if (missingAttributes.includes('expertises')) {
    result -= 5
  }

  // -- Return result as a percentage
  return result / 100
}

/**
 * Returns the formatted list of missing attributes for display
 * @param {Object} user - User object to check
 * @returns {String} - Formatted list of missing attributes for display
 */
const freelanceMissingAttributes = (user) => {
  // -- Get list of missing attributes names
  const missingAttributes = getFreelanceMissingAttributesNames(user)

  // -- Convert attribute names to display labels
  const labels = missingAttributes.map(attr => {
    if (attr === 'bronze_soft_skills') return 'soft skills'
    if (attr === 'expertises') return 'au moins 3 compétences'
    return FREELANCE_OUTPUT_ATTRIBUTES[attr]
  })

  // -- Join labels with dashes and capitalize first letter
  const result = labels.join(' - ')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

module.exports = { freelanceMissingAttributes, freelanceProfileCompletion }

const { FREELANCE_REQUIRED_ATTRIBUTES, FREELANCE_MANDATORY_ATTRIBUTES, FREELANCE_OUTPUT_ATTRIBUTES, SOFT_SKILLS_ATTR, MIN_EXPERTISES, MIN_PINNED_EXPERTISES } = require("./consts")

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
    if (attr === 'pinned_expertises' && (!user[attr] || user[attr].length < MIN_PINNED_EXPERTISES)) {
      missingAttributes.push(attr)
    }
    else if (attr === 'expertises' && (!user[attr] || user[attr].length < MIN_EXPERTISES)) {
      missingAttributes.push(attr)
    }
    else if (!user[attr] || (Array.isArray(user[attr]) && user[attr].length === 0)) {
      missingAttributes.push(attr)
    }
  })

  // -- Check if any soft skills level is missing
  const hasMissingSoftSkills = SOFT_SKILLS_ATTR.some(skillAttr => 
    !user[skillAttr] || user[skillAttr].length === 0
  )
  if (hasMissingSoftSkills) {
    missingAttributes.push('soft_skills')
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
  const requiredMissing = FREELANCE_REQUIRED_ATTRIBUTES.filter(attr => 
    missingAttributes.includes(attr)
  ).length

  // -- If any required attribute is missing return 0
  if (requiredMissing > 0) {
    return 0
  }

  // -- Award 40% for having all required attributes
  result += 40

  // -- Calculate penalties for missing mandatory attributes
  const mandatoryMissing = FREELANCE_MANDATORY_ATTRIBUTES.filter(attr => 
    missingAttributes.includes(attr)
  ).length

  // -- Check if soft skills are missing
  const hasMissingSoftSkills = missingAttributes.includes('soft_skills')

  // -- Calculate total number of potential mandatory items
  const totalMandatoryItems = FREELANCE_MANDATORY_ATTRIBUTES.length + 1 // 1 for soft skills
  
  // -- Calculate penalty on the remaining 60%
  const totalMissingItems = mandatoryMissing + (hasMissingSoftSkills ? 1 : 0)
  const penaltyPerMissing = 60 / totalMandatoryItems
  const totalPenalty = Math.floor(penaltyPerMissing * totalMissingItems)

  result += 60 - totalPenalty

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
    if (attr === 'soft_skills') return 'soft skills'
    return FREELANCE_OUTPUT_ATTRIBUTES[attr]
  })

  // -- Join labels with dashes and capitalize first letter
  const result = labels.join(' - ')
  return result.charAt(0).toUpperCase() + result.slice(1)
}

module.exports = { freelanceMissingAttributes, freelanceProfileCompletion }

const User = require("../../models/User");
const { declareVirtualField, declareEnumField, callPostCreateData, setPostCreateData, setPreprocessGet, setPreCreateData, declareFieldDependencies, declareComputedField, setFilterDataUser, idEqual } = require("../../utils/database");
const { addAction } = require("../../utils/studio/actions");
const { WORK_MODE, SOURCE, EXPERIENCE, ROLES, ROLE_CUSTOMER, ROLE_FREELANCE, WORK_DURATION, COMPANY_SIZE, LEGAL_STATUS, DEACTIVATION_REASON, SUSPEND_REASON, ACTIVITY_STATE, MOBILITY, AVAILABILITY, SOFT_SKILLS, SS_PILAR, DURATION_UNIT, ANNOUNCE_MOBILITY, ANNOUNCE_STATUS, APPLICATION_STATUS } = require("./consts")
const Customer=require('../../models/Customer')
const Freelance=require('../../models/Freelance')
const HardSkillCategory=require('../../models/HardSkillCategory')
const { validatePassword } = require("../../../utils/passwords")
const { sendCustomerConfirmEmail, sendFreelanceConfirmEmail } = require("./mailing")
const { ROLE_ADMIN} = require("../smartdiet/consts")
const { NATIONALITIES, PURCHASE_STATUS, LANGUAGES, LANGUAGE_LEVEL, REGIONS } = require("../../../utils/consts")
const {computeUserHardSkillsCategories, computeHSCategoryProgress, computeUserHardSkillsJobCategories } = require("./hard_skills");
const SoftSkill = require("../../models/SoftSkill");
const { computeAvailableGoldSoftSkills, computeAvailableSilverSoftSkills,computeAvailableBronzeSoftSkills } = require("./soft_skills");
const { keys } = require("lodash");

// TODO move in DB migration
// Ensure softSkills
const ensureSoftSkills = () => {
  const promises=Object.entries(SOFT_SKILLS).map(([value, name]) => {
    return SoftSkill.findOneAndUpdate(
      {value},
      {name, value},
      {upsert: true, new: true}
    )
  })
  return Promise.all(promises)
}

ensureSoftSkills()

const MODELS=['loggedUser', 'user', 'customer', 'freelance', 'admin', 'genericUser']
MODELS.forEach(model => {
  declareVirtualField({model, field: 'password2', type: 'String'})
  declareVirtualField({model, field: 'fullname', type: 'String', requires: 'firstname,lastname'})
  declareVirtualField({model, field: 'shortname', type: 'String', requires: 'firstname,lastname'})
  declareEnumField({model, field: 'role', enumValues: ROLES})
  declareEnumField({model, field: 'nationality', enumValues: NATIONALITIES})
  declareVirtualField({
    model, field: 'pinned_missions', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'mission' }
    },
  })
  declareVirtualField({
    model, field: 'pinned_freelances', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'mission' }
    },
  })
  declareVirtualField({
    model, field: 'customer_missions', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'mission' }
    },
  })
  declareEnumField({model, field: 'company_size', enumValues: COMPANY_SIZE})
  declareEnumField({model, field: 'legal_status', enumValues: LEGAL_STATUS})
  declareEnumField({model, field: 'deactivation_reason', enumValues: DEACTIVATION_REASON})
  declareEnumField({model, field: 'activity_status', enumValues: ACTIVITY_STATE})
  declareEnumField({model, field: 'suspended_reason', enumValues: SUSPEND_REASON})
  declareEnumField({model, field: 'legal_representant_nationality', enumValues: NATIONALITIES})

  // Legal representant
  declareFieldDependencies({model, field: 'legal_representant_firstname', requires: `legal_representant_self,firstname`})
  declareFieldDependencies({model, field: 'legal_representant_lastname', requires: `legal_representant_self,lastname`})
  declareFieldDependencies({model, field: 'legal_representant_birthdate', requires: `legal_representant_self,birthdate`})
  declareFieldDependencies({model, field: 'legal_representant_email', requires: `legal_representant_self,email`})
  declareFieldDependencies({model, field: 'legal_representant_phone', requires: `legal_representant_self,phone`})
  declareFieldDependencies({model, field: 'legal_representant_address', requires: `legal_representant_self,address`})
  declareFieldDependencies({model, field: 'legal_representant_nationality', requires: `legal_representant_self,nationality`})


  // Billing contact
  declareFieldDependencies({model, field: 'billing_contact_firstname', requires: `billing_contact_self,firstname`})
  declareFieldDependencies({model, field: 'billing_contact_lastname', requires: `billing_contact_self,lastname`})
  declareFieldDependencies({model, field: 'billing_contact_email', requires: `billing_contact_self,email`})
  declareFieldDependencies({model, field: 'billing_contact_address', requires: `billing_contact_self,address`})

  declareVirtualField({
    model, field: 'languages', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'languageLevel' }
    },
  })

})

const FREELANCE_MODELS=['freelance', 'loggedUser', 'genericUser']
FREELANCE_MODELS.forEach(model => {
  declareVirtualField({model, field: 'freelance_missions', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'mission' }
    },
  })
  declareVirtualField({model, field: 'recommandations', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'recommandation' }
    },
  })
  declareVirtualField({model, field: 'communications', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'communication' }
    },
  })
  declareVirtualField({model, field: 'search_visible', instance: 'Boolean'})
  declareEnumField({model, field: 'work_mode', enumValues: WORK_MODE})
  declareEnumField({model, field: 'source', enumValues: SOURCE})
  declareEnumField({model, field: 'main_experience', enumValues: EXPERIENCE})
  declareEnumField({model, field: 'second_experience', enumValues: EXPERIENCE})
  declareEnumField({model, field: 'third_experience', enumValues: EXPERIENCE})
  declareEnumField({model, field: 'work_duration', enumValues: WORK_DURATION})
  declareEnumField({model, field: 'work_company_size', enumValues: COMPANY_SIZE})
  declareVirtualField({model, field: 'experiences', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'experience' }
    },
  })
  declareVirtualField({model, field: 'certifications', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'certification' }
    },
  })
  declareVirtualField({model, field: 'trainings', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'training' }
    },
  })
  declareComputedField({model, field: 'hard_skills_categories', requires: 'hard_skills_job,hard_skills_extra', getterFn: computeUserHardSkillsCategories})
  declareComputedField({model, field: 'available_hard_skills_categories', requires: 'main_job.job_file.hard_skills', getterFn: computeUserHardSkillsJobCategories})
  declareEnumField( {model, field: 'mobility', enumValues: MOBILITY})
  declareEnumField( {model, field: 'mobility_regions', enumValues: REGIONS})
  declareVirtualField({model, field: 'mobility_str', instance: 'String', requires: 'mobility,mobility_regions,mobility_city,mobility_city_distance'})
  declareVirtualField({model, field: 'softwares', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'software' }
    },
  })
  declareEnumField( {model, field: 'availability', enumValues: AVAILABILITY})
  declareVirtualField({model, field: 'availability_str', instance: 'String', requires: 'availability,available_days_per_week,available_from'})
  declareEnumField( {model, field: 'gold_soft_skills', enumValues: SOFT_SKILLS})
  declareEnumField( {model, field: 'silver_soft_skills', enumValues: SOFT_SKILLS})
  declareEnumField( {model, field: 'bronze_soft_skills', enumValues: SOFT_SKILLS})
  declareComputedField({model, field: 'available_gold_soft_skills', getterFn: computeAvailableGoldSoftSkills})
  declareComputedField({model, field: 'available_silver_soft_skills', requires: 'gold_soft_skills', getterFn: computeAvailableSilverSoftSkills})
  declareComputedField({model, field: 'available_bronze_soft_skills', requires: 'gold_soft_skills,silver_soft_skills', getterFn: computeAvailableBronzeSoftSkills})
  // Declare virtuals for each pilar
  Object.keys(SS_PILAR).forEach(pilar => {
    const virtualName=pilar.replace(/^SS_/, '').toLowerCase()
    declareVirtualField({model, field: virtualName, instance: 'Number', requires: 'gold_soft_skills,silver_soft_skills,bronze_soft_skills'})  
  })
})

declareEnumField( {model: 'purchase', field: 'status', enumValues: PURCHASE_STATUS})

/** JobFile start */
declareVirtualField({model: 'jobFile', field: 'jobs', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'job' }
},
})
declareVirtualField({model: 'jobFile', field: 'features', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'jobFileFeature' }
},
})
declareVirtualField({model: 'jobFile', field: 'hard_skills', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'hardSkill' }
},
})
/** JobFIle end */

/** Job start */
declareEnumField({model: 'languageLevel', field: 'language', enumValues: LANGUAGES})
declareEnumField({model: 'languageLevel', field: 'level', enumValues: LANGUAGE_LEVEL})
/** Job end */

/** HS Category start */
declareVirtualField({model: 'hardSkillCategory', field: 'children', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'hardSkillCategory' }
},
})
declareVirtualField({model: 'hardSkillCategory', field: 'skills', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'hardSkill' }
},
})
declareComputedField({model: 'hardSkillCategory', field: 'progress', instance: 'Number', getterFn: computeHSCategoryProgress})
/** HS Category end */

/** Expertise category start */
declareVirtualField({model: 'expertiseCategory', field: 'children', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'expertiseCategory' }
},})

declareVirtualField({model: 'expertiseCategory', field: 'expertises', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'expertise' }
},})
/** Expertise category end */

/** Soft skills start */
declareEnumField({model: 'softSkill', field: 'value', enumValues: SOFT_SKILLS})
/** Soft skills end */

/** Announce start */
declareVirtualField({model: 'announce', field: 'total_budget', instance: 'Number', requires: 'budget'})
declareVirtualField({model: 'announce', field: 'suggested_freelances', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'freelance' }
},})
declareEnumField({model: 'announce', field: 'duration_unit', enumValues: DURATION_UNIT})
declareEnumField({model: 'announce', field: 'mobility', enumValues: ANNOUNCE_MOBILITY})
declareEnumField({model: 'announce', field: 'soft_skills', enumValues: SS_PILAR})
declareVirtualField({model: 'announce', field: 'status', enumValues: ANNOUNCE_STATUS})
declareVirtualField({model: 'announce', field: 'applications', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'application' }
},})
declareVirtualField({model: 'announce', field: 'applications_count', instance: 'Number'})
/** Announce end */


/** Application start */
declareEnumField({model: 'application', field: 'status', enumValues: APPLICATION_STATUS})
/** Application end */

const soSynplRegister = props => {
  console.log(`Register with ${JSON.stringify(props)}`)
  if (![ROLE_CUSTOMER, ROLE_FREELANCE].includes(props.role)) {
    throw new Error(`Le role ${props.role || 'vide'} est invalide pour l'inscription`)
  }
  const model=props.role==ROLE_FREELANCE ? Freelance : Customer
  const modelName=props.role==ROLE_FREELANCE ? 'freelance' : 'customer'
  return User.exists({email: props.email})
    .then(exists => {
      if (exists) {
        return Promise.reject(`Un compte avec le mail ${props.email} existe déjà`)
      }

      let promise
      if (props.password) {
        promise=validatePassword({...props})
      }
      else {
        //props.password=generatePassword()
        promise=Promise.resolve()
      }

      return promise
        .then(()=> {
          console.log(`DB create with ${JSON.stringify(props)}`)
          return model.create({...props})
        })
        .then(user => callPostCreateData({model: modelName, data:user}))
  })
}

addAction('register', soSynplRegister)

const ROLE_MODEL_MAPPING={
  [ROLE_CUSTOMER]: 'customer',
  [ROLE_FREELANCE]: 'freelance',
  [ROLE_ADMIN]: 'admin',
}

const preprocessGet = async ({ model, fields, id, user, params }) => {
  if (model=='loggedUser') {
    const modelName=ROLE_MODEL_MAPPING[user.role]
    return({model: modelName, fields, id: user._id, user, params})
  }
  return { model, fields, id, user, params }
}

setPreprocessGet(preprocessGet)

const preCreate = ({model, params, user}) => {
  if (['experience', 'communication', 'certification', 'training', 'software'].includes(model) && !params.user) {
    params.user=user
  }
  if (model=='languageLevel') {
    params.user=params.parent
  }

  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)

const postCreate = async ({model, params, data}) => {
  if (data.role==ROLE_CUSTOMER) {
    await sendCustomerConfirmEmail({user: data})
  }
  if (data.role==ROLE_FREELANCE) {
    await sendFreelanceConfirmEmail({user: data})
  }
  return Promise.resolve(data)
}

setPostCreateData(postCreate)

const filterDataUser = async ({ model, data, id, user }) => {
  if (model=='hardSkillCategory' && !id) {
    const top_level=await HardSkillCategory.find({parent: null}, {_id:1})
    data=data.filter(d => top_level.some(t => idEqual(t._id, d._id)))
  }
  return data
}

setFilterDataUser(filterDataUser)



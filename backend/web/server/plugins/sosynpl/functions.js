const User = require("../../models/User");
const { declareVirtualField, declareEnumField, callPostCreateData, setPostCreateData, setPreprocessGet, setPreCreateData, declareFieldDependencies } = require("../../utils/database");
const { addAction } = require("../../utils/studio/actions");
const { WORK_MODE, SOURCE, EXPERIENCE, ROLES, ROLE_CUSTOMER, ROLE_FREELANCE, WORK_DURATION, COMPANY_SIZE, DISC_ADMIN, DISC_CUSTOMER, DISC_FREELANCE, LEGAL_STATUS, DEACTIVATION_REASON, SUSPEND_REASON, ACTIVITY_STATE } = require("./consts")
const Customer=require('../../models/Customer')
const Freelance=require('../../models/Freelance');
const { validatePassword } = require("../../../utils/passwords");
const { sendCustomerConfirmEmail, sendFreelanceConfirmEmail } = require("./mailing");
const { ROLE_ADMIN } = require("../smartdiet/consts");
const { NATIONALITIES, PURCHASE_STATUS, LANGUAGES, LANGUAGE_LEVEL } = require("../../../utils/consts");
const { BadRequestError } = require("../../utils/errors");

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
/** JobFIle end */

/** Job start */
declareEnumField({model: 'languageLevel', field: 'language', enumValues: LANGUAGES})
declareEnumField({model: 'languageLevel', field: 'level', enumValues: LANGUAGE_LEVEL})
/** Job end */

/** Category start */
declareVirtualField({model: 'category', field: 'children', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'category' }
},
})
declareVirtualField({model: 'category', field: 'skills', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'skill' }
},
})
/** Category end */

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
  return({model, fields, id, user, params})
}

setPreprocessGet(preprocessGet)

const preCreate = ({model, params, user}) => {
  if (['experience', 'communication', 'certification', 'training'].includes(model) && !params.user) {
    params.user=user
  }
  if (model=='languageLevel' && !params.parent) {
    throw new BadRequestError(`Le freelance (parent) est obligatoire`)
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
  if (model=='languageLevel') {
    await User.findByIdAndUpdate(params.parent, {$push: {languages: data}})
  }
  return Promise.resolve(data)
}

setPostCreateData(postCreate)



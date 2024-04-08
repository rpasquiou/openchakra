const User = require("../../models/User");
const { declareVirtualField, declareEnumField, callPostCreateData, setPostCreateData, setPreprocessGet, getModel } = require("../../utils/database");
const { addAction } = require("../../utils/studio/actions");
const { NATIONALITIES, WORK_MODE, SOURCE, EXPERIENCE, ROLES, ROLE_CUSTOMER, ROLE_FREELANCE, WORK_DURATION, COMPANY_SIZE, DISC_ADMIN, DISC_CUSTOMER, DISC_FREELANCE } = require("./consts")
const Customer=require('../../models/Customer')
const Freelance=require('../../models/Freelance');
const { validatePassword } = require("../../../utils/passwords");
const { sendCustomerConfirmEmail, sendFreelanceConfirmEmail } = require("./mailing");
const { ROLE_ADMIN } = require("../smartdiet/consts");

const MODELS=['loggedUser', 'user', 'customer', 'freelance', 'admin']
MODELS.forEach(model => {
  declareVirtualField({model, field: 'password2', type: 'String'})
  declareVirtualField({model, field: 'fullname', type: 'String'})
  declareVirtualField({model, field: 'shortname', type: 'String'})
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
})

const FREELANCE_MODELS=['freelance', 'loggedUser']
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
  declareEnumField({model, field: 'company_size', enumValues: COMPANY_SIZE})
})

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



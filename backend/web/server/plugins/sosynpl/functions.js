const User = require("../../models/User");
const { declareVirtualField, declareEnumField, callPostCreateData } = require("../../utils/database");
const { addAction } = require("../../utils/studio/actions");
const { NATIONALITIES, WORK_MODE, SOURCE, EXPERIENCE, ROLES, ROLE_CUSTOMER, ROLE_FREELANCE } = require("./consts")
const Customer=require('../../models/Customer')
const Freelance=require('../../models/Freelance');
const { validatePassword } = require("../../../utils/passwords");

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

declareVirtualField({model: 'freelance', field: 'freelance_missions', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'mission' }
  },
})
declareVirtualField({model: 'freelance', field: 'recommandations', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'recommandation' }
  },
})
declareVirtualField({model: 'freelance', field: 'communications', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'communication' }
  },
})
declareVirtualField({model: 'freelance', field: 'search_visible', instance: 'Boolean'})
declareEnumField({model: 'freelance', field: 'work_mode', enumValues: WORK_MODE})
declareEnumField({model: 'freelance', field: 'source', enumValues: SOURCE})
declareEnumField({model: 'freelance', field: 'main_experience', enumValues: EXPERIENCE})
declareEnumField({model: 'freelance', field: 'second_experience', enumValues: EXPERIENCE})
declareEnumField({model: 'freelance', field: 'third_experience', enumValues: EXPERIENCE})

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


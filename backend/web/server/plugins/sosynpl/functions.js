const { declareVirtualField, declareEnumField } = require("../../utils/database");
const { NATIONALITIES, WORK_MODE, SOURCE } = require("./consts");

const MODELS=['loggedUser', 'user', 'customer', 'freelance', 'admin']
MODELS.forEach(model => {
  declareVirtualField({model, field: 'password2', type: 'String'})
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


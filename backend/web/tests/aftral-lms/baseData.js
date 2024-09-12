const { RESOURCE_TYPE_LINK, ACHIEVEMENT_RULE_CONSULT, ROLE_CONCEPTEUR } = require("../../server/plugins/aftral-lms/consts")

const BaseUser={
  firstname: 'Firstname',
  lastname: 'Lastname',
  password: 'Password1;'
}

const BaseBuilder={
  ...BaseUser,
  role: ROLE_CONCEPTEUR,
  email: 'hello+concepteur@wappizy.com',
}

const BaseResource={
  name: 'Resource test',
  resource_type: RESOURCE_TYPE_LINK,
  achievement_rule: ACHIEVEMENT_RULE_CONSULT,
  url: 'tagada',
}

const BaseModule={
  name: 'Module test',
}

const BaseSequence={
  name: 'Séquence test',
}

module.exports={
  BaseResource, BaseBuilder, BaseModule, BaseSequence,
}
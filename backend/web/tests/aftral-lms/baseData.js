const moment=require('moment')
const { RESOURCE_TYPE_LINK, ACHIEVEMENT_RULE_CONSULT, ROLE_CONCEPTEUR, ROLE_APPRENANT } = require("../../server/plugins/aftral-lms/consts")

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

const BaseTrainee={
  ...BaseUser,
  role: ROLE_APPRENANT,
  email: 'hello+apprenant@wappizy.com',
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

const BaseProgram={
  name: 'Programme test',
}

const BaseSession={
  name: 'Session test',
  start_date: moment().add(-2, 'month'),
  end_date: moment().add(2, 'month'),
  code: 'TestCode'
}


module.exports={
  BaseResource, BaseBuilder,BaseTrainee, BaseModule, BaseSequence, BaseTrainee, BaseProgram, BaseSession,
}
const {
  CONTENT_TYPE,
  QUESTION_TYPE,
  QUESTION_TYPE_ENUM_MULTIPLE,
  QUESTION_TYPE_ENUM_SINGLE,
  SEASON
} = require('./consts')
const lodash=require('lodash')
const {NotLoggedError} = require('../../utils/errors')
const {
  declareEnumField,
  declareVirtualField,
  setCustomCheckRequest,
  setPreCreateData,
  setPreprocessGet,
  declareComputedField,
} = require('../../utils/database')

const preprocessGet = ({model, fields, id, user /** params */}) => {
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }
  return Promise.resolve({model, fields, id})
}

setPreprocessGet(preprocessGet)

const preCreate = ({model, params, user}) => {
  if (model=='content') {
    model=params.type
    params.type=undefined
  }
  if (['article', 'quizz', 'module', 'bestPractices', 'emergency', 'tip'].includes(model)) {
    params.creator=user
  }
  if (model=='question') {
    params.quizz=params.parent
  }
  if (model=='step') {
    params.container=params.parent
  }
  if (model=='answer') {
    params.question=params.parent
  }
  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)

const klesiaCheckRequest = ({verb, model, id, user}) => {
  const allowed=!!user || !['loggedUser', 'user'].includes(model)
  if (!allowed) {
    throw new NotLoggedError(`Accès au modèle ${model} interdit en non-connecté`)
  }
  return Promise.resolve()
}

setCustomCheckRequest(klesiaCheckRequest)

const USER_ALIASES=['user', 'loggedUser']
USER_ALIASES.forEach(alias => {
  declareVirtualField({model: alias, field: 'fullname', instance: 'String'})
  declareVirtualField({model: alias, field: 'password2', instance: 'String'})
})

const CONTENT_ALIASES=['content', 'module', 'article', 'bestPractices', 'emergency', 'tip', 'quizz']
CONTENT_ALIASES.forEach(alias => {
  declareVirtualField({model: alias, field: 'media', instance: 'String',
    requires: 'internal_media,external_media',
  })
  declareVirtualField({model: alias, field: 'thumbnail', instance: 'String',
    requires: 'internal_thumbnail,external_thumbnail',
  })
  declareVirtualField({model: alias, field: 'type', instance: 'String', enumValues: CONTENT_TYPE})
  declareEnumField({model: alias, field: 'season', instance: 'String', enumValues: SEASON})
  declareVirtualField({model: alias, field: 'extra_info', instance: 'String'})
  // TODO Ugly but required to allow Content to return the steps
  declareVirtualField({model: alias, field: 'steps',
    instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'step'}},
  })

})

declareVirtualField({model: 'question', field: 'available_answers',
  instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'answer'}},
})
declareEnumField({model: 'question', field: 'type', enumValues: QUESTION_TYPE})
declareVirtualField({model: 'question', field: 'user_choice_answers',
  instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'answer'}},
})
declareVirtualField({model: 'question', field: 'user_text_answer', instance: 'String'})
declareVirtualField({model: 'question', field: 'user_numeric_answer', instance: 'Number'})
declareVirtualField({model: 'question', field: 'percent_success', instance: 'Boolean', requires: 'user_choice_answers,user_text_answer,user_numeric_answer,type,correct_answers'})
declareVirtualField({model: 'question', field: 'message', instance: 'String', requires: 'percent_success,success_message,error_message,user_choice_answers,user_text_answer,user_numeric_answer,type,correct_answers'})

const getUserAnswers = ({model, attribute, defValue}) => (user, params, data, session) => {
  const value=lodash.get(session.models, `${model}.${data._id}.${attribute}`) || defValue
  return Promise.resolve(value)
}

declareComputedField('question', 'user_choice_answers', getUserAnswers({model: 'question', attribute:'user_choice_answers', defValue:[]}))
declareComputedField('question', 'user_numeric_answer', getUserAnswers({model: 'question', attribute:'user_numeric_answer', defValue:null}))
declareComputedField('question', 'user_text_answer', getUserAnswers({model: 'question', attribute:'user_text_answer', defValue:null}))

const getQuestionPercentSuccess = (user, params, data, session) => {
  let user_answer=null
  let correct_answer=null
  switch(data.type) {
    case QUESTION_TYPE_ENUM_SINGLE:
      // Algo to map null, undefined, value or [value] to simple type
      user_answer=[lodash([data.user_choice_answers]).flatten().filter(v => !lodash.isEmpty(v)).pop()].filter(v => !!v)
      correct_answer=[data.correct_answers?.pop()?._id?.toString()].filter(v => !lodash.isEmpty(v))
      break
    case QUESTION_TYPE_ENUM_MULTIPLE:
      user_answer=lodash([data.user_choice_answers]).flatten().filter(v => !lodash.isEmpty(v)).value()
      correct_answer=data.correct_answers?.map(a => a._id.toString()) || []
      break
    default:
      throw new Error(`question type ${data.type} correctness is not implemented`)
  }

  // No answer => return null
  if (lodash.isEmpty(user_answer)) {
    return Promise.resolve(null)
  }
  const correct_answers=lodash.intersection(user_answer, correct_answer).length
  const total_answers=correct_answer.length
  const percent=correct_answers*1.0/total_answers
  return Promise.resolve(percent)
}

declareComputedField('question', 'percent_success', getQuestionPercentSuccess)

const getQuestionMessage = (user, params, data, session) => {
  const msg=lodash.isNil(data.percent_success) ? null
    : data.percent_success==1.0 ? data.success_message
    : data.error_message
  return Promise.resolve(msg)
}

declareComputedField('question', 'message', getQuestionMessage)

/**
user_text_answer
user_numeric_answer
*/
declareVirtualField({model: 'quizz', field: 'questions',
  instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'question'}},
})
declareVirtualField({model: 'quizz', field: 'percent_success', instance: 'Number', requires: 'questions.percent_success'})
declareVirtualField({model: 'quizz', field: 'percent_message', instance: 'String', requires: 'percent_success,message_under_33,message_under_66,message_under_100,message_100'})

const setSuccess = (user, params, data, session) => {
  const average=lodash(data.questions).meanBy('percent_success')
  return Promise.resolve(average)
}

declareComputedField('quizz', 'percent_success', setSuccess)

const setSuccessMessage = (user, params, data, session) => {
  const percent_success=data.percent_success
  if (percent_success<0.33) {
    return Promise.resolve(data.message_under_33)
  }
  if (percent_success<0.66) {
    return Promise.resolve(data.message_under_66)
  }
  if (percent_success<1) {
    return Promise.resolve(data.message_under_100)
  }
  return Promise.resolve(data.message_100)
}

declareComputedField('quizz', 'percent_message', setSuccessMessage)

declareVirtualField({model: 'category', field: 'children',
  instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'category'}},
})
declareVirtualField({model: 'category', field: 'contents',
  instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'content'}},
})
declareVirtualField({model: 'category', field: 'media', instance: 'String',
  requires: 'internal_media,external_media',
})


declareVirtualField({model: 'module', field: 'contents_count',
  instance: 'Number', requires: 'contents'})

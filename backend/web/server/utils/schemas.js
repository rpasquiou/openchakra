const {
  CREATED_AT_ATTRIBUTE,
  UPDATED_AT_ATTRIBUTE
} = require('../../utils/consts')
const lodash=require('lodash')
const { runPromisesWithDelay } = require('./concurrency')

const schemaOptions={
  toJSON: {virtuals: true, getters: true},
  toObject: {virtuals: true, getters: true},
  timestamps: {createdAt: CREATED_AT_ATTRIBUTE, updatedAt: UPDATED_AT_ATTRIBUTE},
}

const PRESAVE_CALLBACKS=[]

const registerPreSave = fn => {
  PRESAVE_CALLBACKS.push(fn)
}
const callPreSave = (model, data) => {
  const modified=Object.fromEntries(data.modifiedPaths().map(p => [p, this[p]]))
  // TODO Can't runPromisesWithDelay with empty array ?
  if (lodash.isEmpty(PRESAVE_CALLBACKS)) {
    return
  }
  return runPromisesWithDelay(PRESAVE_CALLBACKS.map(fn => async () => {
    return fn(model, data._id, modified)
  }))
  .then(res => {
    const grouped=lodash.groupBy(res, 'status')
    const streams=[['fulfilled', console.log], ['rejected', console.error]]
    streams.forEach(([attribute, displayFn]) => {
      const results=grouped[attribute]?.map(r => r.value).filter(v => !!v)
      if (results?.length>0) {
        displayFn(results.join('\n')  )
      }
    })
  })
  .catch(console.error)
}

module.exports={
  schemaOptions, registerPreSave, callPreSave,
}

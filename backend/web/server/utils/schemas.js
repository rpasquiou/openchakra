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
const callPreSave = (model, id, values) => {
  return runPromisesWithDelay(PRESAVE_CALLBACKS.map(fn => async () => {
    return fn(model, id, values)
  }))
  .then(res => {
    const grouped=lodash.groupBy(res, 'status')
    if (grouped.fulfilled?.length>0) {
      console.log(grouped.fulfilled.map(r => r.value))  
    }
    if (grouped.rejected?.length>0) {
      console.error(grouped.rejected.map(r => r.reason))  
    }
  })
  .catch()
}

module.exports={
  schemaOptions, registerPreSave, callPreSave,
}

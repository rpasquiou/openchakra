const { isValidPhoneNumber } = require('libphonenumber-js')
const Validator = require('validator')
const lodash=require('lodash')

const PARAM_RE = RegExp('{{\\s*params.([^\\s]+)\\s*}}')

const fillSms = (pattern, values) => {
  let match=null
  while (match = pattern.match(PARAM_RE)) {
    const param = match[1]
    let replaceValue=values[param]
    if (lodash.isNil(replaceValue)) {
      console.warn(`SMS:Missing param ${param} in '${pattern}'`)
      replaceValue=`<${param}>`
    }
    pattern = pattern.replace(PARAM_RE, replaceValue)
  }
  return pattern
}

const PHONE_REGEX=/(^0[67]\d{8}$)|(^\+33[67]\d{8}$)/
const HOMEPHONE_REGEX=/(^0[1234589]\d{8}$)|(^\+33[1234589]\d{8}$)/

const isPhoneOk = (value, acceptHomePhone) => {
  if (!value) {
    return false
  }
  const corrected=value.replace(/ /g, '')?.replace(/\u00A0/g, '')
  const mobileOk=PHONE_REGEX.test(corrected)
  const homePḧoneOk=HOMEPHONE_REGEX.test(corrected)
  return mobileOk || (acceptHomePhone && homePḧoneOk)
}

const isInternationalPhoneOK = value => {
  if (!value) {
    return false
  }
  return isValidPhoneNumber(value)
}

const isEmailOk = value => {
  return Validator.isEmail(value)
}

module.exports = {fillSms, isPhoneOk, isEmailOk, isInternationalPhoneOK, PHONE_REGEX}

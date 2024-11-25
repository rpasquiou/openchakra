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

const PHONE_REGEX=/^\+33[67]\d{8}$/
const HOMEPHONE_REGEX=/^\+33[01234589]\d{8}$/

const isPhoneOk = (value, acceptHomePhone=false) => {
  if (!value) {
    return false
  }
  const corrected=value.replace(/\s*/g, '')?.replace(/\u00A0/g, '')
  const mobileOk=PHONE_REGEX.test(corrected)
  const homePhoneOk=HOMEPHONE_REGEX.test(corrected)
  const res=mobileOk || (acceptHomePhone && homePhoneOk)
  return res
}

/**
 * Format phone number is possible
 * @param {*} number 9 digits OR '0'+9 digits OR +33 + 9 digits
 * @returns Formatted to +33 + 9 digits if possible
 */
const formatPhone = number => {
  if (!number) {
    return number
  }
  number=number.replace(/\s*/g, '')
  if (number.length==9) {
    number=`0${number}`
  }
  number=number.replace(/^0/, '+33')
  return number
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

module.exports = {fillSms, isPhoneOk, isEmailOk, isInternationalPhoneOK, PHONE_REGEX, formatPhone}

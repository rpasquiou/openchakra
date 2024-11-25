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
const ALL_PHONES=/^\+33\d{9}$/

const isPhoneOk = (value, acceptHomePhone=false) => {
  if (!value) {
    return false
  }
  const phoneOk=(acceptHomePhone ? ALL_PHONES : PHONE_REGEX).test(value)
  const res=phoneOk
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
  number=number.replace(/\s*/g, '').replace(/\./g, '')
    .replace(/^\+3307/, '+337')
    .replace(/^\+3302/, '+332')
    .replace(/^\+3309/, '+339')
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

module.exports = {fillSms, isPhoneOk, isEmailOk, isInternationalPhoneOK, PHONE_REGEX, HOMEPHONE_REGEX, formatPhone, ALL_PHONES}

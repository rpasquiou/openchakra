const PHONE_REGEX=/^\+33[67]\d{8}$/
const HOMEPHONE_REGEX=/^\+33[01234589]\d{8}$/

const isPhoneOk = (value, acceptHomePhone=false) => {
  if (!value) {
    return false
  }
  const corrected=value.toString().replace(/\s*/g, '')?.replace(/\u00A0/g, '')
  const mobileOk=PHONE_REGEX.test(corrected)
  const homePhoneOk=HOMEPHONE_REGEX.test(corrected)
  const res=mobileOk || (acceptHomePhone && homePhoneOk)
  return res
}

const formatDisplay = value => {
  if (!isPhoneOk(value, true)) {
    return value
  }
  return value.replace(/(\+33)(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6')
}

export {
  isPhoneOk,
  formatDisplay,
}
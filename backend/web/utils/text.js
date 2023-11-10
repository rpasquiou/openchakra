const ced = require('ced')
const csv_string = require('csv-string')
const stripBom = require('strip-bom')
const moment=require('moment')
const lodash=require('lodash')

const ARTICLES = 'le la les un une de des d l à'.split(/ /g)
const SIREN_LENGTH=9
const SIRET_LENGTH=14

const normalize = str => {
  str = str ? str.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : ''
  return str
}

// Escapes special characters for regex
const escapeText = txt => {
  return txt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const createRegExp = str => {
  str = escapeText(normalize(str)).split(/ |'/g)
  // Remove articles
  str = str.filter(s => !ARTICLES.includes(s))
  const regexp = new RegExp(str.join('|'), 'i')
  return regexp
}

const createRegExpAND = str => {
  str = escapeText(normalize(str)).split(/ |'/g)
  // Remove articles
  str = str.filter(s => !ARTICLES.includes(s))
  const regexp = new RegExp(str.map(s => `(?=.*${s})`).join(''), 'i')
  return regexp
}

const createRegExpOR = str => {
  str = escapeText(normalize(str)).split(/ |'/g)
  // Remove articles
  str = str.filter(s => !ARTICLES.includes(s))
  const regexp = new RegExp(str.map(s => `\\b${s}\\b`).join('|'), 'i')
  return regexp
}

const matches = (str, keywords) => {
  const regexps = createRegExp(keywords)
  const ok = regexps.test(str)
  return ok
}

const bufferToString = buff => {
  const encoding=ced(buff)
  let text = buff.toString(encoding)
  // For MAC files
  text = stripBom(text)
  return text
}

const ILLEGAL_REGEX = /(O|0|\+33)[O\d \.,-]+\d|\S+@\S+|@\S+/

const hideIllegal = text => {
  if (text) {
    while (text.match(ILLEGAL_REGEX)) {
      text = text.replace(ILLEGAL_REGEX, '[Masqué]')
    }
  }
  return text
}

const compact = string => {
  const result = string.replace(/ /g, '')
  return result
}

const to_siren = siretOrSiret => {
  siretOrSiret = compact(siretOrSiret)
  if (siretOrSiret.length==SIREN_LENGTH) {
    return siretOrSiret
  }
  if (siretOrSiret.length==SIRET_LENGTH) {
    return siretOrSiret.slice(0, 9)
  }
  return ''
}

const computeVatNumber = siren => {
  if (!siren) {
    return ''
  }
  const siren_formatted = to_siren(siren)
  const siren_compact = compact(siren_formatted.toString())
  if (siren_compact.length!=9) {
    return ''
  }
  const siren_int = parseInt(`${siren_compact}12`)
  if (isNaN(siren_int)) {
    return ''
  }
  const siren_modulo = siren_int%97
  const result = `FR${siren_modulo.toString().padStart(2, '0')}${siren_compact}`
  return result
}

const capitalize = text => {
  return text ? text[0].toUpperCase()+text.slice(1).toLowerCase() : text
}

const guessDelimiter = text => {
  const delimiter=csv_string.detect(text)
  return delimiter
}

const splitRemaining = (pattern, delimiter) => {
  if (lodash.isEmpty(pattern)) {
    return string
  }
  const [first, ...rest]=pattern.split(delimiter)
  return [first, rest.join(delimiter)]
}

const formatDateTime = datetime => {
  return moment(datetime).format(`[le] DD/MM/YY [à] HH:mm`)
}

module.exports = {
  normalize,
  matches,
  createRegExpOR,
  createRegExpAND,
  bufferToString,
  hideIllegal,
  compact,
  computeVatNumber,
  capitalize,
  guessDelimiter,
  splitRemaining,
  formatDateTime,
}

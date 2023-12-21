const crypto=require('crypto')

const sanitizeFilename = name => {
  return name.toLowerCase()
    .replace(/ /gi, '-')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

const generateUUID = () => {
  return crypto.randomUUID()
}

module.exports = {
  sanitizeFilename, generateUUID,
}

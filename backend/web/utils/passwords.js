const crypto=require('crypto')
const {getDataModel}=require('../config/config')
const { BadRequestError } = require('../server/utils/errors')

const DEFAULT_PASSWORD_PATTERN=/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/
const DEFAULT_PASSWORD_PATTERN_STR='8 caractères minimum dont une majuscule, une minuscule, un chiffre et un caractère spécial'

let PASSWORD_PATTERN
let PASSWORD_PATTERN_STR

// Get project custom password pattern if present
try {
  PASSWORD_PATTERN=require(`../server/plugins/${getDataModel()}/consts`).PASSWORD_PATTERN
  PASSWORD_PATTERN_STR=require(`../server/plugins/${getDataModel()}/consts`).PASSWORD_PATTERN_STR
  if (!!PASSWORD_PATTERN != !!PASSWORD_PATTERN_STR) {
    console.error(`Password and password str are inconsistent:${PASSWORD_PATTERN} ${PASSWORD_PATTERN_STR}`)
    process.exit(0)
  }
  if (!PASSWORD_PATTERN && !PASSWORD_PATTERN_STR) {
    PASSWORD_PATTERN = DEFAULT_PASSWORD_PATTERN 
    PASSWORD_PATTERN_STR = DEFAULT_PASSWORD_PATTERN_STR
  }
}
catch(err) {
  console.error(err)
  process.exit(0)
}

const validatePassword = async ({password, password2}) => {
  console.log('validate', password, password2, 'with', PASSWORD_PATTERN)
  if (!PASSWORD_PATTERN.test(password)) {
    console.log('not ok')
    throw new BadRequestError(`Mot de passe incorrect:${PASSWORD_PATTERN_STR}`)
  }
  if (password!=password2) {
    throw new BadRequestError(`Les mots de passe saisis ne correspondent pas`)
  }
}

const generatePassword = () => {
  const length=8
  const wishlist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$'
  return Array.from(crypto.randomFillSync(new Uint32Array(length)))
    .map((x) => wishlist[x % wishlist.length])
    .join('')
}

module.exports = {
  validatePassword,
  generatePassword,
}

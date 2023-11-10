const crypto = require('crypto')

const API_PATH = '/myAlfred/api'

const NEEDED_VAR = [
  'MODE',
  'BACKEND_PORT',
  'FRONTEND_APP_PORT',
  'NEXT_PUBLIC_PROJECT_TARGETDOMAIN',
  'NEXT_PUBLIC_PROJECT_FOLDERNAME',
  // 'S3_ID',
  // 'S3_SECRET',
  // 'S3_REGION',
  // 'S3_BUCKET',
]

const ALL_SERVICES = ['Tous les services', null]

const generate_id = () => {
  return crypto.randomBytes(20).toString('hex')
}

const IMAGE_EXTENSIONS='.png .jpg .gif .jpeg .pdf .svg'.toLowerCase().split(' ')
const TEXT_EXTENSIONS='.csv .txt'.toLowerCase().split(' ')
const XL_EXTENSIONS='.xlsx .csv .txt'.toLowerCase().split(' ')
const PDF_EXTENSIONS='.pdf'.toLowerCase().split(' ')

const XL_TYPE='XL'
const TEXT_TYPE='TEXT'
const JSON_TYPE='JSON'

const CREATED_AT_ATTRIBUTE='creation_date'
const UPDATED_AT_ATTRIBUTE='update_date'

const MODEL_ATTRIBUTES_DEPTH=4

const IMAGES_WIDTHS_FOR_RESIZE = [2000, 1000, 500]
const IMAGE_SIZE_MARKER = '_srcset:'
const THUMBNAILS_DIR = 'thumbnails'

module.exports = {
  ALL_SERVICES,
  generate_id,
  NEEDED_VAR,
  IMAGE_EXTENSIONS, TEXT_EXTENSIONS,
  XL_EXTENSIONS, API_PATH,
  PDF_EXTENSIONS,
  XL_TYPE, TEXT_TYPE, JSON_TYPE,
  CREATED_AT_ATTRIBUTE, UPDATED_AT_ATTRIBUTE,
  MODEL_ATTRIBUTES_DEPTH,
  IMAGES_WIDTHS_FOR_RESIZE,
  IMAGE_SIZE_MARKER,
  THUMBNAILS_DIR,
}

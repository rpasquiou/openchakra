const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const multer = require('multer')
const {IMAGE_EXTENSIONS, TEXT_EXTENSIONS, XL_EXTENSIONS, PDF_EXTENSIONS} = require('../../utils/consts')
const AdmZip = require('adm-zip')
const { xml2js } = require('xml-js')

const ensureDirectoryExists = dirName => {
  const rootDir = path.join(path.dirname(require.main.filename), '..')
  const fullDirName = path.join(rootDir, dirName)
  if (!fs.existsSync(fullDirName)) {
    console.log(`Creating nonexistent directory ${fullDirName}`)
    fs.mkdirSync(fullDirName, {recursive: true})
  }
}

const IMAGE_FILTER = {
  filter: filename => {
    const ext = path.extname(filename).toLowerCase()
    return IMAGE_EXTENSIONS.includes(ext)
  },
  message: `Image attendue (${IMAGE_EXTENSIONS.join(',')})`,
}

const TEXT_FILTER = {
  filter: filename => {
    const ext = path.extname(filename).toLowerCase()
    return TEXT_EXTENSIONS.includes(ext)
  },
  message: `Texte attendu (${TEXT_EXTENSIONS.join(',')})`,
}

const XL_FILTER = {
  filter: filename => {
    const ext = path.extname(filename).toLowerCase()
    return XL_EXTENSIONS.includes(ext)
  },
  message: `Fichier Excel attendu (${XL_EXTENSIONS.join(',')})`,
}

const PDF_FILTER = {
  filter: filename => {
    const ext = path.extname(filename).toLowerCase()
    return PDF_EXTENSIONS.includes(ext)
  },
  message: `Fichier PDF attendu (${PDF_EXTENSIONS.join(',')})`,
}

const createDiskMulter = (directory, fileFilter, absoluteName) => {
  ensureDirectoryExists(directory)
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, directory)
    },
    filename: (req, file, cb) => {
      if (absoluteName) {
        cb(null, absoluteName)
      }
      else {
        let datetimestamp = Date.now()
        let key = crypto.randomBytes(5).toString('hex')
        cb(null, `${datetimestamp}_${key}_${file.originalname}`)
      }
    },
  })
  const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
      if (fileFilter && !fileFilter.filter(file.originalname)) {
        // TODO Remonter l'erreur en JSON plutôt qu'en page HTML erreur
        return callback(new Error(fileFilter.message))
      }
      callback(null, true)
    },
  })
  return upload
}

const createMemoryMulter = fileFilter => {
  const storage = multer.memoryStorage()
  const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
      if (fileFilter && !fileFilter.filter(file.originalname)) {
        // TODO Remonter l'erreur en JSON plutôt qu'en page HTML erreur
        return callback(new Error(fileFilter.message))
      }
      callback(null, true)
    },
  })
  return upload
}

const isScorm = async ({buffer}) => {
  let zip=null
  try { zip=new AdmZip(buffer)} catch { return false }
  const entry=zip.getEntries().find(e => e.entryName=='imsmanifest.xml')
  if (!entry) { return false}
  const contents=entry.getData().toString('utf-8')
  const imsmanifest = xml2js(contents, { compact: true })
  // #221: Manage h5p scorms
  const scormVersion = imsmanifest?.manifest?._attributes?.version || imsmanifest?.manifest?.metadata?.schemaversion?._text
  // Funny: if resources contains only one resource, it is returned as object instead of array
  let resources = imsmanifest?.manifest?.resources?.resource
  const mainResource=(Array.isArray(resources) ? resources.find(r => r._attributes['adlcp:scormType']=='sco') : resources)._attributes.href
  // Sosynpl #183 scorm version may exist but be empty 
  if (scormVersion!==undefined && mainResource) {
    // Check if declared entrypoint exists in zip entries
    if (!zip.getEntries().find(e => e.entryName==mainResource)) {
      throw new Error(`Invalid Scorm: declared ${mainResource} not found`)
    }
    return ({version: scormVersion, entrypoint: mainResource, entries: zip.getEntries()})
  }
  return false
}

const removeExtension = fullpath => {
  const pathInfo=path.parse(fullpath)
  return path.join(pathInfo.dir, pathInfo.name)
}

// Check if first exists and is newer than second (dependencies)
const isNewerThan= (first, second) => {
  return fs.existsSync(first) && fs.existsSync(second) && fs.statSync(first).mtimeMs>fs.statSync(second).mtimeMs
}

module.exports = {
  createDiskMulter,
  createMemoryMulter,
  IMAGE_FILTER,
  TEXT_FILTER,
  XL_FILTER,
  PDF_FILTER,
  isScorm,
  removeExtension,
  isNewerThan,
}

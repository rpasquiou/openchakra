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

// Returns a copy of array with idx1 and idx2 items swapped
const swapArray = (array, idx1, idx2) => {
  const [v1, v2]=[array[idx1], array[idx2]]
  const newArray=[...array]
  newArray[idx1]=v2
  newArray[idx2]=v1
  return newArray
}

module.exports = {
  sanitizeFilename, generateUUID, swapArray
}

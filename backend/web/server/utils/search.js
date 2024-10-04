const { SEARCH_FIELD_ATTRIBUTE } = require("../../utils/consts")
const { normalize, createRegExpAND, createRegExpOR } = require("../../utils/text")
const { loadFromDb } = require("./database")


const search = async ({ model, fields, search_field = SEARCH_FIELD_ATTRIBUTE, search_value, user, filter = {} }) => {
  const loadFields = [...fields, search_field]
  const data = await loadFromDb({ model, fields: loadFields, user, params: filter })

  const normalizedSearchValue = normalize(search_value)

  // D'abord, on tente avec createRegExpAND pour des correspondances exactes
  const regExpAND = createRegExpAND(normalizedSearchValue)
  let filteredData = data.filter((item) => {
    const normalizedSearchField = normalize(item[SEARCH_FIELD_ATTRIBUTE])
    return regExpAND.test(normalizedSearchField)
  })

  // Si aucune correspondance exacte n'est trouvée, on passe à createRegExpOR
  if (filteredData.length === 0) {
    const regExpOR = createRegExpOR(normalizedSearchValue)
    filteredData = data.filter((item) => {
      const normalizedSearchField = normalize(item[search_field])
      return regExpOR.test(normalizedSearchField)
    })
  }

  return filteredData
}

module.exports = search
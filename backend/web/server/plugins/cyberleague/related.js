const lodash = require('lodash')
const { loadFromDb, idEqual } = require("../../utils/database")

const compareCompanies = (company, expertises) => {
  return lodash.intersectionBy([expertises, company.expertise_set?.expertises], 
    (e1,e2) => idEqual(e1?._id, e2?._id)).length
}

const getRelated = (model) => {
  if (model == `company`) {
   return async (userId, params, data) => {
    const companies = await loadFromDb({model: `company`, fields: [`expertise_set.expertises`]})
    return lodash.orderBy(lodash.filter(companies, (c) => !idEqual(data._id,c._id)), (c) => compareCompanies(c, data.expertise_set?.expertises), `desc`).slice(0, 10)
   } 
  }
}

module.exports = { getRelated }
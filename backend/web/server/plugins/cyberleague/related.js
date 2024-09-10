const lodash = require('lodash')
const { loadFromDb, idEqual } = require("../../utils/database")

const getRelated = (model) => {
  if (model == `company`) {
   return async (userId, params, data) => {
    
    const compareCompanies = (company) => {
      return lodash.intersectionBy([data.expertise_set?.expertises, company.expertise_set?.expertises], 
        (e1,e2) => idEqual(e1?._id, e2?._id)).length
    }

    const companies = await loadFromDb({model: `company`, fields: [`expertise_set.expertises`]})    
    return lodash.orderBy(lodash.filter(companies, (c) => !idEqual(data._id,c._id)), (c) => compareCompanies(c), `desc`).slice(0, 10)
   } 
  }
}

module.exports = { getRelated }
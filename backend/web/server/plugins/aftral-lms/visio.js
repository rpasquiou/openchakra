const mongoose=require('mongoose')
const moment=require('moment')
const lodash=require('lodash')
const { loadFromDb } = require('../../utils/database')

const getVisiosDays = async (userId, params, data, fields, actualLogged) => {
  const VISIOS_FILTER = /visios\./
  const VISIOS_FILTER2 = /\.visios/
  fields=fields.filter(f => VISIOS_FILTER.test(f)).map(f => f.replace(VISIOS_FILTER, ''))
  params=lodash(params)
    .pickBy((_, f) => VISIOS_FILTER2.test(f))
    .mapKeys((_, f) => f.replace(VISIOS_FILTER2, ''))
    .value()
  params={'filter._owner': data._id}
  const visios=await loadFromDb({model: 'visio', fields, user: userId, params, skipRetain: true})
  const grouped=lodash(visios)
    .groupBy(v => !!v.start_date ? moment(v.start_date).startOf('day') : null)
    .entries()
    .map(([day, visios]) => new mongoose.models.visioDay({day, visios:visios.map(v => new mongoose.models.visio(v))}))
    .value()
  return grouped
}

module.exports={
  getVisiosDays
}
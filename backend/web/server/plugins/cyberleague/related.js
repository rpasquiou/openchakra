const lodash = require('lodash')
const moment=require('moment')
const { loadFromDb, idEqual } = require('../../utils/database')
const User = require('../../models/User')

const compareCompanies = (company, expertises) => {
  return lodash.intersectionBy([expertises, company.expertise_set?.expertises], 
    (e1,e2) => idEqual(e1?._id, e2?._id)).length
}

const getRelated = (model) => {
  if (model == 'event') {
    return async (userId, params, data) => {
      const events = await loadFromDb({model: `event`, fields: [`start_date`, `name`, `picture`, `end_date`,`company.name`, `expertise_set.expertises`]})
      return lodash.orderBy(lodash.filter(events, (e) => !idEqual(data._id,e._id) && moment(e.start_date).isAfter(moment())), (e) => e.start_date).slice(0, 10)
     }
  }

  if (model == `company`) {
   return async (userId, params, data) => {
    const companies = await loadFromDb({model: `company`, fields: [`expertise_set.expertises`, `name`, `picture`, `baseline`]})
    return lodash.orderBy(lodash.filter(companies, (c) => !idEqual(data._id,c._id)), (c) => compareCompanies(c, data.expertise_set?.expertises), `desc`).slice(0, 10)
   }
  }

  if (model == `user`) {
    return async (userId,params,data) => {

      const loadedUsers = await loadFromDb({model: `user`, fields: [`function`, `company.size`,`company.sector`,`shortname`,`picture`,`job`,`firstname`,`lastname`]})
      let users = lodash.filter(loadedUsers, (u) => !idEqual(data._id,u._id))

      let res = []

      const sameUserFunction = lodash.groupBy(users, (u) => u.function)[data.function]
      const sameFunLength = sameUserFunction?.length || 0

      //if not enough related with same function, need to add users with same company size
      if (sameFunLength <10) {
        res = sameFunLength == 0 ? [] : sameUserFunction
        
        users = lodash.xor(users, sameUserFunction)
        const sameUserSize = lodash.groupBy(users, (u) => u.company?.size)[data.company?.size]
        const sameSizeLength = sameUserSize?.length || 0

        //still not enough related users, need to add users with same company sector
        if (sameFunLength + sameSizeLength <10) {
          res = sameSizeLength == 0 ? res : lodash.concat(res, sameUserSize)
          users = lodash.xor(users, sameUserSize)
          const sameUserSector = lodash.groupBy(users, (u) => u.company?.sector)[data.company?.sector]

          //we keep up to 10 related users
          res = sameUserSector?.length == 0 ? res : lodash.concat(res, lodash.slice(sameUserSector, 0, 10-(sameFunLength + sameSizeLength )))

        //too many related users with same company size, need to filter users to keep those with same company sector
        } else {
          if (sameFunLength + sameSizeLength > 10) {
            const sameUserSizeSector = lodash.groupBy(sameUserSize, (u) => u.company?.sector)[data.company?.sector]
            const sameSizeSectLength = sameUserSizeSector?.length || 0

            //not enough users with same company size
            if (sameFunLength + sameSizeSectLength < 10) {
              res = sameSizeSectLength == 0 ? res : lodash.concat(res, sameUserSizeSector)

              //we complete res with users with same size to have 10 related users
              res = lodash.concat(res, lodash.xor(sameUserSize, sameUserSizeSector).slice(0, 10-(sameFunLength + sameSizeSectLength)))

            //too many users with same company size and company sector : we keep only 10 related users
            } else {
              res = lodash.concat(res, lodash.slice(sameUserSizeSector, 0 , 10-sameFunLength))
            }

          //if sameFunLength + sameSizeLength == 10 
          } else {
            res = lodash.concat(res, sameUserSize)
          }
        }

      //too many related users  with same function, need to filter users to keep those with same company size
      } else {
        if (sameFunLength > 10) {
          const sameUserFunSize = lodash.groupBy(sameUserFunction, (u) => u.company?.size)[data.company?.size]
          const sameFunSizeLength = sameUserFunSize?.length || 0

          //not enough users with same function and company size
          if (sameFunSizeLength < 10) {
            res = sameFunSizeLength == 0 ? [] : sameUserFunSize

            // we complete res with users with same function to have 10 related users
            res = lodash.concat(res, lodash.xor(sameUserFunction, sameUserFunSize).slice(0, 10-sameFunSizeLength))

          //too many users with same function and company size, need to filter users to keep those with same company sector
          } else {
            if (sameFunSizeLength > 10) {
              const sameUserAll = lodash.groupBy(sameUserFunSize, (u) => u.company?.sector)[data.company?.sector]
              const sameAllLength = sameUserAll?.length || 0

              //not enough users with same function, company size and company sector
              if (sameAllLength < 10) {
                res = sameAllLength == 0 ? res : sameUserAll

                //we complete res with users with same function and company size to have 10 related users
                res = lodash.concat(res, lodash.xor(sameUserAll, sameUserFunSize).slice(0, 10-sameAllLength))
                
              //we have 10 or more user with same function, company size and company sector : we only keep 10
              } else {
                res = lodash.slice(sameUserAll, 0, 10)
              }

            //we have exactly 10 users with same function and company size
            } else {
              res = sameUserFunSize
            }
          }

        //we have exactly 10 users with same function
        } else {
          res = sameUserFunction
        }
      }
      return res.map(user => {return new User(user)})
    }
  }
}

module.exports = { getRelated }
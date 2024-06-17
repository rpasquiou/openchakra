const lodash=require('lodash')
const { createRegExpOR, createRegExpAND } = require("../../../utils/text")
const Block = require("../../models/Block")
const User = require("../../models/User")

const generateFilter = ({attributes, pattern, or}) => {
  const regex=(or ? createRegExpOR:createRegExpAND)(pattern)
  return {$or: attributes.map(att => ({[att]: regex}))}
}
const searchUsers = async (userId, params, data) => {
  const limit=parseInt(params?.['limit.user']) || undefined
  const page=parseInt(params?.['page.users']) || undefined
  const orFilter = generateFilter({attributes: ['email', 'firstname', 'lastname'], pattern: data.pattern, or: true})
  const andFilter = generateFilter({attributes: ['email', 'firstname', 'lastname'], pattern: data.pattern, or: false})
  let query=User.find(andFilter)
  if (page) {
    query=query.skip(page*limit)
  }
  if (limit) {
    query=query.limit(limit+1)
  }
  let res=await query
  if (lodash.isEmpty(res)) {
    query=User.find(orFilter)
    if (page) {
      query=query.skip(page*limit)
    }
    if (limit) {
      query=query.limit(limit+1)
    }
    res=await query
  }
  return res
}

const searchBlocks = async (userId, params, data) => {
  const limit=parseInt(params?.['limit.blocks']) || undefined
  const page=parseInt(params?.['page.blocks']) || undefined
  const orFilter = generateFilter({attributes: ['name', 'code'], pattern: data.pattern, or: true})
  const andFilter = generateFilter({attributes: ['name', 'code'], pattern: data.pattern, or: false})
  let query=Block.find(andFilter).sort({type:1})
  if (page) {
    query=query.skip(page*limit)
  }
  if (limit) {
    query=query.limit(limit+1)
  }
  let res=await query
  console.log('searched', andFilter, 'found', res.length)
  if (lodash.isEmpty(res)) {
    query=Block.find(orFilter).sort({type:1})
    if (page) {
      query=query.skip(page*limit)
    }
    if (limit) {
      query=query.limit(limit+1)
    }
    res=await query
    console.log('searched', orFilter, 'found', res.length)
  }
  return res
}

module.exports={
  searchUsers, searchBlocks,
}
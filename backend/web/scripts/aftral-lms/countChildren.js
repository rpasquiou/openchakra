const mongoose=require('mongoose')
const lodash=require('lodash')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const Block = require('../../server/models/Block')

const rootId=process.argv[2]

if (!rootId) {
  console.error('expected rootId parameter')
}

const countChildren = async blockId => {
  const childrenIds=await Block.find({parent: blockId}, {_id:1})
  console.log()
  const subChildrenCount=await Promise.all(childrenIds.map(c => countChildren(c)))
  return lodash.sum([childrenIds.length, ...subChildrenCount])
}

mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  .then(() => countChildren(rootId))
  .then(count => console.log(`Block ${rootId} has ${count} children`))
  .catch(console.error)
  .finally(() => process.exit(0))


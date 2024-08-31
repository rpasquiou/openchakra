const mongoose=require('mongoose')
const lodash=require('lodash')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const Block = require('../../server/models/Block')

const rootId=process.argv[2]

if (!rootId) {
  console.error('expected rootId parameter')
}

const displayBlock = async blockId => {
  const block=await Block.findById(blockId)
  console.log(lodash.pick(block.toObject(), ['name', 'type']))
}

const countChildren = async blockId => {
  const result = await Block.aggregate([
    {$match: { _id: mongoose.Types.ObjectId(blockId) }},
    {
        $graphLookup: {
            from: "blocks",            
            startWith: "$_id",         
            connectFromField: "_id",   
            connectToField: "parent",  
            as: "descendants"          
        }
    },
    {
        $project: {
            _id: 0,
            descendantsCount: { $size: "$descendants" }  // Count the number of descendants
        }
    }
  ])

  return result.length > 0 ? result[0].descendantsCount : 0
}

mongoose.connect(`mongodb://localhost/aftral-lms`, MONGOOSE_OPTIONS)
  .then(() => displayBlock(rootId))
  .then(() => countChildren(rootId))
  .then(count => console.log(`Block ${rootId} has ${count} children`))
  .catch(console.error)
  .finally(() => process.exit(0))


const Block = require("../../models/Block")

const getAscendantPaths = async blockId => {
  const parents=await Block.find({$or: [{origin: blockId}, {actual_children: blockId}]})
  // console.group(parents.map(p => [p._id, p.type, p.name]))
  console.group(parents.map(p => [p.type, p.name]))
  const ascendants=await Promise.all(parents.map(p => getAscendantPaths(p._id)))
  console.groupEnd()
}

module.exports= {
  getAscendantPaths,
}
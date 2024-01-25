const Block = require('../../models/Block')

const attributes={
  'name': b => b.name,
  'type': b => b['type'],
  'closed': b => b.closed ? 'FERME' : 'OUVERT',
  // 'masked': b => b.masked ? 'MASQUE': 'VISIBLE',
  // 'optional': b => b.optional ? 'OPTIONEL': 'OBLIGATOIRE',
}

const displayTree = async rootId => {
  const block=await Block.findById(rootId).lean()
  console.log(Object.entries(attributes).map(([att, f]) => f(block)).join(','))
  console.log()
  console.group()
  console.group()
  await Promise.all(block.actual_children.map(child => displayTree(child._id)))
  console.groupEnd()
  console.groupEnd()
}

module.exports={
  displayTree,
}
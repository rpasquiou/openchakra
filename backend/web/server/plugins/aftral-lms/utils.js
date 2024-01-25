const Block = require('../../models/Block')
const { runPromisesWithDelay } = require('../../utils/concurrency')

const attributes={
  'type': b => b['type'],
  'name': b => b.name,
  'closed': b => b.closed ? 'FERME' : 'OUVERT',
  // 'masked': b => b.masked ? 'MASQUE': 'VISIBLE',
  // 'optional': b => b.optional ? 'OPTIONEL': 'OBLIGATOIRE',
}

const displayTree = async rootId => {
  const block=await Block.findById(rootId).lean()
  console.log('\n'+Object.entries(attributes).map(([att, f]) => f(block)).join(','))
  console.group()
  await runPromisesWithDelay(block.actual_children.map(child => () => displayTree(child._id)))
  console.groupEnd()
}

module.exports={
  displayTree,
}
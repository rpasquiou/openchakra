const { runPromisesWithDelay } = require('../../utils/concurrency')
const { loadFromDb } = require('../../utils/database')
require('../../models/Chapter')
require('./functions')

const attributes={
  'type': b => b.type,
  'name': b => b.name,
  'code': b => b.code,
  // 'masked': b => b.masked ? 'MASQUE': 'VISIBLE',
  // 'optional': b => b.optional ? 'OPTIONEL': 'OBLIGATOIRE',
}

let required=[]

for (let index = 0; index < 12; index++) {
  required.push(...Object.keys(attributes).map(f => `${'children.'.repeat(index)}${f}`))
}

const displayTree = async rootId => {
  const [block]=await loadFromDb({
    model: 'block', id: rootId, 
    fields:required,
  })
  console.log('\n'+Object.entries(attributes).map(([att, f]) => f(block)).join(','))
  console.group()
  await runPromisesWithDelay(block.children.map(child => () => displayTree(child._id)))
  console.groupEnd()
}

const ensureObjectIdOrString = data => {
  if (!(['String', 'ObjectID'].includes(data?.constructor?.name))) {
    console.trace(`Expecting string or ObjectID, got ${data}(${typeof data})`)
    throw new Error(`Expecting string or ObjectID, got ${data}(${typeof data})`)
  }
}
module.exports={
  displayTree, ensureObjectIdOrString,
}
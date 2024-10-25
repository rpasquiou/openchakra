const lodash=require('lodash')
const traversal=require('tree-traversal')

const treeOptions = {

  subnodesAccessor: node => {
    if (node.split('.').length-1==1) { return [] }
    return lodash.range(3).map(i => `${node}.${i}`)
  },

  userdataAccessor: (node, userdata) => {
    userdata.visited.push(node)
    return userdata
  },

  userdata: {visited: []},
}


describe('Tree traversal tests', () => {

  it('first traversal', async() => {
    const res=traversal.depth('1', treeOptions)
    console.log(treeOptions)
  })

})

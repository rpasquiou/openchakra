const Block = require('../../models/Block')
const {addAction}=require('../../utils/studio/actions')

const addChildAction = ({parent, child}, user) => {
  console.log('received', parent, child)
  // TODO Check if child allowed under parent
  return Block.findByIdAndUpdate(parent, {$addToSet: {children: child}})
}

addAction('addChild', addChildAction)


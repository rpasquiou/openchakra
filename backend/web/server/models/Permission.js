const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let PermissionSchema=null

try {
  PermissionSchema=require(`../plugins/${getDataModel()}/schemas/PermissionSchema`)
  PermissionSchema.plugin(require('mongoose-lean-virtuals'))
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = PermissionSchema ? mongoose.model('permission', PermissionSchema) : null

const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')

let CommissionSchema=null

try {
  CommissionSchema=require(`../plugins/${getDataModel()}/schemas/CommissionSchema`)
  customizeSchema(CommissionSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = CommissionSchema ? mongoose.model('commission', CommissionSchema) : null

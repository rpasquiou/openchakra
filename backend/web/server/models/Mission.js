const mongoose = require('mongoose')
const {getDataModel} = require('../../config/config')
const {customizeSchema}=require('../../server/utils/database')

let MissionSchema=null

try {
  MissionSchema=require(`../plugins/${getDataModel()}/schemas/MissionSchema`)
  customizeSchema(MissionSchema)
}
catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err
  }
}

module.exports = MissionSchema ? mongoose.model('mission', MissionSchema) : null

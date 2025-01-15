const lodash = require('lodash')
const mongoose = require('mongoose')
const moment=require('moment')
const formatDuration = require('format-duration')
const {splitRemaining} = require('../../utils/text')
const {UPDATED_AT_ATTRIBUTE, CREATED_AT_ATTRIBUTE, MODEL_ATTRIBUTES_DEPTH} = require('../../utils/consts')
const UserSessionData = require('../models/UserSessionData')
const Booking = require('../models/Booking')
const {CURRENT, FINISHED} = require('../plugins/fumoir/consts')
const {BadRequestError, NotFoundError} = require('./errors')
const NodeCache=require('node-cache')
const AddressSchema = require('../models/AddressSchema')

let preLogin=null

const setpreLogin = fn => {
  preLogin=fn
}

const callPreLogin = async p => {
  if (preLogin) {
    return preLogin(p)
  }
}

let preRegister=null

const setPreRegister = fn => {
  preRegister=fn
}

const callPreRegister = async p => {
  if (preRegister) {
    return preRegister(p)
  } else {
    return p
  }
}

const LEAN_DATA=false

const MONGOOSE_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}

const COLLATION={ locale: 'fr', strength: 2 }
// Utilities
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

/**
Retourne true si field (model.attribute) contient id
req fournit le contexte permettant de trouver le modèle dans la bonne BD
TODO Use mongoose.models instead
*/
const hasRefs = (req, field, id) => {
  const modelName = field.split('.')[0]
  /* eslint-disable global-require */
  const model = require(`../models/${modelName}`)
  /* eslint-enable global-require */
  const attribute = field
    .split('.')
    .slice(1)
    .join('.')
  return model.exists({[attribute]: id})
}


/**
 * QUERY FILTERS
 */

/** Extracts filters parameters from query params */
const extractFilters = params => {
  const FILTER_PATTERN = /^filter\./
  let filters = lodash(params)
    .pickBy((_, key) => FILTER_PATTERN.test(key))
    .mapKeys((_, key) => key.replace(FILTER_PATTERN, ''))
    .mapValues(v => lodash.isString(v) ? new RegExp(v, 'i') : v)
  return filters.value()
}

const getCurrentFilter = (filters, modelName) => {
  return _mapSortOrFilters(filters, modelName, 'dbFilter')
}

const getCurrentSort = (filters, modelName) => {
  return _mapSortOrFilters(filters, modelName, 'dbSort')
}

/**
 * Build filters from attributues name and values
 * Return filter on:
 *  - 1st level attributes only (next levels will be handled in subsequent buildPopulates)
 *  - not virtual or computed attributes
 * Return sundefind if no filter
 */
const _mapSortOrFilters = (filters, modelName, attribute) => {
  filters = lodash(filters)
    // Use 1st level filters
    .pickBy((_, key) => !/\./.test(key))
    // Filter by non virtual && non computed attributes
    .entries()
    .map(([key, value]) => {
      const modelAtt = `${modelName}.${key}`
      const virtualOrComputed=lodash.get(DECLARED_VIRTUALS, modelAtt) || lodash.get(COMPUTED_FIELDS_GETTERS, modelAtt)
      if (virtualOrComputed) {
        const dbFilter=virtualOrComputed[attribute]
        if (dbFilter) {
          return dbFilter(value)
        }
        console.warn(`No ${attribute} on virtual or computed ${modelAtt}`)
      }
      return {[key]: value}
    })
  const result=filters.size()==0 ?undefined : filters.size()==1 ? filters.value()[0] : {$and: filters.value()}
  return result
}

const getSubFilters = (filters, attributeName) => {
  const ATTRIBUTE_PATTERN = new RegExp(`^${attributeName}(\.|$)`)
  filters = lodash(filters)
    // Use 1st level filters
    .pickBy((_, key) => ATTRIBUTE_PATTERN.test(key))
    .mapKeys((_, key) => key.replace(ATTRIBUTE_PATTERN, ''))
  return filters.value()
}

/** Extracts filters parameters from query params */
const extractLimits = params => {
  const LIMIT_PATTERN = /^limit(\.|$)/
  let filters = lodash(params)
    .pickBy((_, key) => LIMIT_PATTERN.test(key))
    .mapKeys((_, key) => key.replace(LIMIT_PATTERN, ''))
    .mapValues(v =>parseInt(v))
  return filters.value()
}

/** Extracts filters parameters from query params */
const extractSorts = params => {
  const SORT_PATTERN = /^sort(\.|$)/
  let sorts = lodash(params)
    .pickBy((_, key) => SORT_PATTERN.test(key))
    .mapKeys((_, key) => key.replace(SORT_PATTERN, ''))
  return sorts.value()
}

/** Extracts filters parameters from query params */
const getCurrentLimit = limits => {
  return limits['']
}

/**
 * Build limits from attributues name and values
 * Return filter on:
 *  - 1st level attributes only (next levels will be handled in subsequent buildPopulates)
 *  - not virtual or computed attributes
 */
const getSubLimits = (limits, attributeName) => {
  const ATTRIBUTE_PATTERN = new RegExp(`^${attributeName}(\.|$)`)
  limits = lodash(limits)
    // Use 1st level filters
    .pickBy((_, key) => ATTRIBUTE_PATTERN.test(key))
    .mapKeys((_, key) => key.replace(ATTRIBUTE_PATTERN, ''))
  return limits.value()
}

/**
 * END QUERY FILTERS
 */

/**
Compares attributes recursively :
- 1st level attributes are sorted lexicographically
- 2nd level attributes are greater than 1st level ones, then lexicographically sorted
*/
const attributesComparator = (att1, att2) => {
  if (att1.includes('.') == att2.includes('.')) {
    return att1.localeCompare(att2)
  }
  return att1.includes('.') ? 1 : -1
}

let COMPUTED_FIELDS_GETTERS = {}
let COMPUTED_FIELDS_SETTERS = {}

let DECLARED_ENUMS = {}

let DECLARED_VIRTUALS = {}

// MOdel => field => requires
let DEPENDENCIES = {}

const getVirtualCharacteristics = (modelName, attName) => {
  if (
    !(modelName in DECLARED_VIRTUALS) ||
    !(attName in DECLARED_VIRTUALS[modelName])
  ) {
    throw new Error(`Missing virtual declaration for ${modelName}.${attName}`)
  }
  return DECLARED_VIRTUALS[modelName][attName]
}

const isSchema = (attribute, schemaType) => {
  return !!attribute.schema?.obj && JSON.stringify(Object.keys(attribute.schema?.obj))==JSON.stringify(Object.keys(schemaType?.obj))
}

const getAttributeCaracteristics = (modelName, att) => {
  const multiple = att.instance == 'Array'
  const suggestions = att.options?.suggestions
  const baseData = att.caster || att
  // TODO: fix type ObjectID => Object
  const type =
    baseData.instance == 'ObjectID' ? baseData.options.ref 
      : isSchema(att, AddressSchema) ? 'Address'
      : baseData.instance
  const ref = baseData.instance == 'ObjectID'

  // Include caster enum values (i.e. array of enums)
  let enumValues
  if (!lodash.isEmpty(att.enumValues) || !lodash.isEmpty(att.caster?.enumValues)) {
    enumValues=att.enumValues || att.caster?.enumValues
  }
  if (!lodash.isEmpty(att.options?.enum)) {
    enumValues=att.options.enum.filter(v => v !==null)
  }
  if (enumValues) {
    const enumObject=DECLARED_ENUMS[modelName]?.[att.path]
    if (!enumObject) {
      throw new Error(`${modelName}.${att.path}:no declared enum`)
    }
    const enumObjectKeys=Object.keys(enumObject)
    // Allow null in enums if attribute is not required
    if (!att.options?.required) {
      enumObjectKeys.push(null)
    }
    if (lodash.intersection(enumObjectKeys, enumValues).length!=enumValues.length) {
      throw new Error(`${modelName}.${att.path}:inconsistent enum:${JSON.stringify(enumValues)}/${JSON.stringify(enumObjectKeys)}`)
    }
    enumValues=enumObject
  }
  return {
    type,
    multiple,
    ref,
    enumValues,
    suggestions,
  }
}

const getBaseModelAttributes = modelName => {
  const schema = mongoose.model(modelName).schema
  const schema_atts = Object.values(schema.paths).filter(
    att => !['__v', '_id'].includes(att.path) //!att.path.startsWith('_'),
  )
  const virtuals_atts = Object.keys(schema.virtuals)
    .filter(c => c != 'id')
    .map(att => getVirtualCharacteristics(modelName, att))
  const attributes = [...schema_atts, ...virtuals_atts]
  return attributes
}

const getSimpleModelAttributes = modelName => {
  const atts = getBaseModelAttributes(modelName).map(att => [
    att.path,
    getAttributeCaracteristics(modelName, att),
  ])
  return [...atts, ['_id', {type: 'ObjectId', multiple: false, ref: false}] ]
}

const getReferencedModelAttributes = (modelName, level) => {
  const res = getBaseModelAttributes(modelName)
    .filter(att => att.instance == 'ObjectID')
    // Check that refPath attributes are hidden (path ^_.*)
    .map(att => {
      if (!!att.options.refPath && !/^_/.test(att.path)) {
        throw new Error(`${modelName}.${att.path}:refPath atribute must be hidden (i.e. start with _')`)
      }
      return att
    })
    .filter(att => !att.options.refPath)
    .map(att =>
      // getSimpleModelAttributes(att.options.ref).map(([attName, instance]) => [
      getModelAttributes(att.options.ref, level-1).map(([attName, instance]) => [
        `${att.path}.${attName}`,
        instance,
      ]),
    )
  return res
}

const getModelAttributes = (modelName, level=MODEL_ATTRIBUTES_DEPTH) => {

  if (level==0) {
    return []
  }

  const attrs = [
    ...getSimpleModelAttributes(modelName),
    ...lodash.flatten(getReferencedModelAttributes(modelName, level)),
  ]

  // Auto-create _count attribute for all multiple attributes
  const multipleAttrs=[] //attrs.filter(att => !att[0].includes('.') && att[1].multiple===true).map(att => att[0])
  const multiple_name=name => `${name}_count`
  multipleAttrs.forEach(name => {
    const multName=multiple_name(name)
    // Create virtual on the fly
    mongoose.models[modelName].schema.virtual(multName).get(function() {
      return this?.[name]?.length || 0
    })
    // TODO: UGLY. Properly handle aliases
    if (modelName=='user') {
      mongoose.models.loggedUser.schema.virtual(multName).get(function() {
        return this?.[name]?.length || 0
      })
    }
    // Declare virtual on the fly
    declareVirtualField({model: modelName, field: multName, instance: 'Number', requires: name})
    if (modelName=='user') {
      declareVirtualField({model: 'loggedUser', field: multName, instance: 'Number', requires: name})
    }
  })

  const attrsWithCounts=[...attrs, ...multipleAttrs.map(name => [multiple_name(name), {type: Number, multiple: false, ref: false}])]
  attrsWithCounts.sort((att1, att2) => attributesComparator(att1[0], att2[0]))
  return attrsWithCounts
}

const getModels = () => {
  const modelNames = lodash.sortBy(mongoose.modelNames())
  const result = {}
  modelNames.forEach(name => {
    const attrs = getModelAttributes(name)
    result[name]={name, attributes: Object.fromEntries(attrs)}
  })
  return result
}

/**
Returns only models & attributes visible for studio users (i.e. not IdentityCounter && not suffixed with an '_')
*/
const getExposedModels = () => {
  const isHidddenAttributeName = (modelName, attName) => {
    return attName.startsWith('_')
  }

  const models=lodash(getModels())
    .omitBy((v, k) => k=='IdentityCounter' || /_$/.test(k))
    .mapValues((v, modelName) => ({
      ...v,
      attributes: lodash(v.attributes).omitBy((v, k) => isHidddenAttributeName(modelName, k)),
    }))

  return models.value()
}

function handleReliesOn(directAttribute, relies_on, requiredFields) {
  const search = new RegExp(`^${directAttribute}([\.|$])`)
  const replace = (match, group1) => `${relies_on}${group1 == '.' ? '.' : ''}`
  requiredFields = requiredFields.map(f => f.replace(search, replace))
  return requiredFields
}

// TODO query.populates accepts an array of populates !!!!
const buildPopulates = ({modelName, fields, filters, limits, sorts, parentField, params}) => {
  // Retain all ref fields
  const model=getModels()[modelName]
  if (!model) {
    // console.warn(`Can not populate model ${modelName}`)
    return undefined
  }
  const attributes=model.attributes
  let requiredFields = getRequiredFields({model: modelName, fields})

  // TODO passs filters and limits as object parameters in buildPopulates
  // TODO filter populates
  // TODO: re-add filters on UI

  // Retain ref attributes only
  const groupedAttributes=lodash(requiredFields)
    .groupBy(att => att.split('.')[0])
    .pickBy((_, attName) => { 
      if (!attributes[attName]) { 
        throw new Error(`Attribute ${modelName}.${attName} unknown`)
      } 
      const key=`${modelName}.${attName}`
      return attributes[attName].ref===true || !!lodash.get(DECLARED_VIRTUALS, key)
    })
    .mapValues(attributes => attributes.map(att => att.split('.').slice(1).join('.')).filter(v => !lodash.isEmpty(v)))

  // / Build populate using att and subpopulation

  // const select=Object.fromEntries(requiredFields.map(f => f.split('.')[0]).map(f => [f, 1]))
  // console.log('Populates select is ', modelName, select)

  const pops=groupedAttributes.entries().map(([attributeName, fields]) => {
    const attType=attributes[attributeName].type
    const subLimits=getSubLimits(limits, attributeName)
    const subFilters=getSubFilters(filters, attributeName)
    const subSorts=getSubFilters(sorts, attributeName)
    const limit=getCurrentLimit(subLimits)
    const match=getCurrentFilter(subFilters, attType) 
    const sort=getCurrentSort(subSorts, attType)
    const subPopulate=buildPopulates({
      modelName: attType, fields, parentField: `${parentField ? parentField+'.' : ''}${attributeName}`,
      filters:subFilters, sorts:subSorts, limits:subLimits, params,
    })
    // TODO Fix page number
    const pageParamName = `page.${parentField? parentField+'.' : ''}${attributeName}`
    const page=params?.[pageParamName] ? parseInt(params[pageParamName]) : 0
    const skip=page*limit
    return {
      path: attributeName, 
      // select,
      match,
      options: {limit: limit ? limit+1 :undefined, skip, sort},
      collation: COLLATION, 
      populate: lodash.isEmpty(subPopulate)?undefined:subPopulate
    }
  })
  return pops.value()
}


// Returns mongoose models ordered using child classes first (using discriminators)
const getMongooseModels = () => {
  const conn=mongoose.connection
  const models=conn.modelNames().map(name => conn.models[name])
  // Model with discriminator is a base model => set latest
  return lodash(models)
    .sortBy(model => `${model.discriminators ? '1':'0'}:${model.modelName}`)
    .value()
}
/**
 Returns model from database id
 expectedModel is a string or an array of string.
 If defined and non empty, getModel returns exception if model is found and
 is neither the expectedModel (String type) or included in expectedModel (array type)
*/
const getModel = (id, expectedModel) => {
  return Promise.all(getMongooseModels()
    .map(model => model.exists({_id: id})
        .then(exists => (exists ? model.modelName : false)),
    )
  )
    .then(res => {
      const model=res.find(v => !!v)
      if (!model) {
        throw new Error(`Model not found for ${id}`)
      }
      if (expectedModel && !lodash.isEmpty(expectedModel)) {
        if ((lodash.isString(expectedModel) && expectedModel!=model)
      || (lodash.isArray(expectedModel) && !lodash.includes(expectedModel, model))) { throw new Error(`Found model ${model} for ${id}, ${JSON.stringify(expectedModel)} was expected`) }
      }
      return model
    })
}

const buildSort = params => {
  return {}
}

const buildQuery = (model, id, fields, params) => {
  const modelAttributes = Object.keys(getModels()[model].attributes)

  let criterion = id ? {_id: id} : {}
  const filters=extractFilters(params)
  const limits=extractLimits(params)
  const sorts=extractSorts(params)

  // Add filter fields
  fields=getRequiredFields({model, fields:lodash.uniq([...fields, ...Object.keys(filters), ...Object.keys(sorts)])})

  const selectedAttr=['_id', 'id', CREATED_AT_ATTRIBUTE, UPDATED_AT_ATTRIBUTE, 'type', '__t', ...lodash.uniq(fields.map(f => f.split('.')[0]))]
  const firstLevelAttr = getFirstLevelFields(modelAttributes)
  const rejectedAttr = lodash.difference(firstLevelAttr, selectedAttr)
  const projection = {}

  lodash.forEach(rejectedAttr, attr => {
    projection[attr] = 0
  })

  const currentFilter=getCurrentFilter(filters, model)
  const currentSort=getCurrentSort(sorts, model)
  criterion={...criterion, ...currentFilter}
  //console.log('Query', model, fields, ': filter', JSON.stringify(currentFilter, null,2), 'criterion', Object.keys(criterion), 'limits', limits, 'sort', currentSort)
  let query = mongoose.connection.models[model].find(criterion, projection)
  query = query.collation(COLLATION)
  if (currentSort) {
    query=query.sort(currentSort)
  }
  const currentLimit=getCurrentLimit(limits)
  if (currentLimit) {
    query=query.skip((params.page || 0)*currentLimit)
    query=query.limit(currentLimit+1)
  }
  const populates=buildPopulates({modelName: model, fields:[...fields], filters, limits, params, sorts})
  // console.log(`Populates for ${model}/${fields} is ${JSON.stringify(populates,null,2)}`)
  query = query.populate(populates).sort(buildSort(params))
  // If id is required, fail if no result
  if (!!id) {
    query=query.orFail(new Error(`Can't find model '${model}' id ${id}`))
  }
  return query
}

const simpleCloneModel = data => {
  return lodash.omit(data.toObject(), ['_id', 'id'])
}

const cloneModel = ({data, withOrigin, forceData = {}}) => {
  let model = null
  let clone = null
  return getModel(data)
    .then(res => {
      model = res
      clone = {
        ...lodash.omit(data.toObject(), ['_id', 'id']),
        origin: withOrigin ? data._id : undefined,
        ...forceData,
      }
      const childrenToClone = getModelAttributes(model)
        .filter(
          ([name, properties]) =>
            !name.includes('.') && properties.ref && properties.multiple,
        )
        .map(([name]) => name)
        // Don(t clone ref attributes if present in extraData
        .filter(name => !Object.keys(forceData).includes(name))
      return Promise.all(
        childrenToClone.map(att => {
          return Promise.all(
            data[att].map(v => cloneModel({data: v, withOrigin})),
          ).then(cloned => (clone[att] = cloned))
        }),
      )
    })
    .then(() => {
      return mongoose.connection.models[model].create(clone)
    })
    .catch(err => {
      console.trace(`${err}:${data}`)
    })
}

const cloneArray = ({data, withOrigin, forceData = {}}) => {
  if (!lodash.isArray(data)) {
    throw new Error(`Expected array, got ${data}`)
  }
  return Promise.all(
    data.map(d => cloneModel({data: d, withOrigin, forceData})),
  )
}

const firstLevelFieldsCache=new NodeCache()

const getFirstLevelFields = fields => {
  const key=fields.join('/')
  if (firstLevelFieldsCache.has(key)) {
    return firstLevelFieldsCache.get(key)
  }
  const result= [
    'id',
    '_id',
    ...lodash(fields)
      .map(f => f.split('.')[0])
      .uniq()
      .value(),
  ]
  firstLevelFieldsCache.set(key, result)
  return result
}

const nextLevelFieldsCache=new NodeCache()

const getNextLevelFields = fields => {
  const key=fields.join('/')
  if (nextLevelFieldsCache.has(key)) {
    return nextLevelFieldsCache.get(key)
  }
  const result=lodash.uniq(fields
    .filter(f => f.includes('.'))
    .map(f => f.split('.')[0])
  )
  nextLevelFieldsCache.set(key, result)
  return result
}

// TODO this causes bug bugChildrenTrainersTraineesCHioldren. Why ?
const secondLevelFieldsCache=new NodeCache()

function getRequiredFields({model, fields}) {
  let requiredFields = [...fields]
  // Add declared required fields for virtuals
  let added = true
  while (added) {
    added = false
    lodash(requiredFields).groupBy(f => f.split('.')[0]).keys().forEach(directAttribute => {
      let virtualRequired = lodash.get(DECLARED_VIRTUALS, `${model}.${directAttribute}.requires`) || null
      let dependenciesRequired= lodash.get(DEPENDENCIES, `${model}.${directAttribute}.requires`) || null
      let required=[virtualRequired, dependenciesRequired].filter(v => !lodash.isEmpty(v)).join(',')
      if (required) {
        required = required.split(',')
        if (lodash.difference(required, requiredFields).length > 0) {
          requiredFields = lodash.uniq([...requiredFields, ...required])
          added = true
        }
      }
      let relies_on = lodash.get(DECLARED_VIRTUALS, `${model}.${directAttribute}.relies_on`) || null
      if (relies_on) {
        requiredFields = handleReliesOn(directAttribute, relies_on, requiredFields)
      }
    })
  }
  return requiredFields
}

function getSecondLevelFields(fields, f) {
  const key=[...fields, f].join('/')
  let result = secondLevelFieldsCache.get(key)
  if (!result) {
    const regEx=new RegExp(`^${f}\\.`)
    result=fields
      .filter(f2 => regEx.test(f2))
      .map(f2 => f2.replace(regEx, ''))
  
    secondLevelFieldsCache.set(key, result)
  }
  return result
}


/**
mongoose returns virtuals even if they are not present in select clause
=> keep only require fields in data hierarchy
*/
const retainRequiredFields = ({data, fields}) => {
  if (lodash.isArray(data)) {
    return data.map(d => retainRequiredFields({data: d, fields}))
  }
  if (!lodash.isObject(data)) {
    return data
  }

  const thisLevelFields = getFirstLevelFields(fields)
  const pickedData = lodash.pick(data, thisLevelFields)
  const nextLevelFields = getNextLevelFields(fields)
  nextLevelFields.forEach(f => {
    pickedData[f] = retainRequiredFields({
      data: data[f],
      fields: getSecondLevelFields(fields, f),
    })
  })
  return pickedData
}

const refAttributesCache=new NodeCache()

const getRefAttributes = model => {
  if (refAttributesCache.has(model)) {
    return refAttributesCache.get(model)
  }
  const result=getModelAttributes(model).filter(
    ([attName, attParams]) => !attName.includes('.') && attParams.ref,
  )
  refAttributesCache.set(model, result)
  return result
}

const getRequiredSubFields = (fields, attName) => {
  const result=fields
    .filter(f => f.startsWith(`${attName}.`))
    .map(f => splitRemaining(f, '.')[1])
  return result
}

const fieldsToComputeCache=new NodeCache()

/**
 * For a given model name anex fields, returns the array of fields and descendant fields
 * that noeeds to be computed
 */
const getFieldsToCompute = ({model, fields}) => {
  const key=`${model}/${fields}`
  let result=fieldsToComputeCache.get(key)
  if (result) {
    return result
  }
  result=[]
  const modelDef=getModels()[model]
  const thisLevelFields=getFirstLevelFields(fields)
  const nextLevelFields=getNextLevelFields(fields)
  const thisLevelCompute=thisLevelFields.filter(f => !!lodash.get(COMPUTED_FIELDS_GETTERS, `${model}.${f}`))
  result.push(...thisLevelCompute)
  nextLevelFields.forEach(field => {
    if (!modelDef.attributes[field]) {
      throw new BadRequestError(`No type for ${key} ${field}`)
    }
    const subModel=modelDef.attributes[field].type
    const nextFields=getSecondLevelFields(fields, field)
    result.push(...getFieldsToCompute({model: subModel, fields:nextFields}).map(f => `${field}.${f}`))
  })
  fieldsToComputeCache.set(key, result)
  return result
}

const addComputedFields = (
  originalFields,
  userId,
  queryParams,
  data,
  model,
) => {
  let fields=getFieldsToCompute({model, fields: originalFields})
  if (lodash.isEmpty(fields)) {
    return data
  }

  return Promise.resolve(model=='user' ? data._id : userId)
    .then(newUserId => {
      // Compute direct attributes
      // Handle references => sub
      const refAttributes = getRefAttributes(model)
      return Promise.all(refAttributes.map(([attName, attParams]) => {
        const requiredSubFields=getRequiredSubFields(originalFields, attName)
        const children = lodash.flatten([data[attName]]).filter(v => !!v)
        return Promise.all(
          children.map(child =>
            addComputedFields(
              requiredSubFields,
              newUserId,
              queryParams,
              child,
              attParams.type,
            ),
          ),
        )
      }))
      .then(() => {
        const compFields = COMPUTED_FIELDS_GETTERS[model] || {}
        const presentCompFields = lodash(originalFields).map(f => f.split('.')[0]).filter(v => !!v).uniq().value()
        const requiredCompFields = lodash.pick(compFields, presentCompFields)
        return Promise.all(
          Object.keys(requiredCompFields).map(f => {
            const displayFields=getRequiredSubFields(originalFields, f)
            return requiredCompFields[f](newUserId, queryParams, data, displayFields)
              .then(res => {
                data[f] = res
                return data
              })
            }
          ),
      )})
      .then(() => data)
  })
}

const formatTime = timeMillis => {
  return formatDuration(timeMillis ? timeMillis / 60 : 0, {leading: true})
}

const declareComputedField = ({model, field, getterFn, setterFn, ...rest}) => {
  if (!model || !field || !(getterFn || setterFn)) {
    throw new Error(`${model}.${field} compute declaration requires model, field and at least getter or setter`)
  }
  if (!LEAN_DATA && lodash.get(DECLARED_VIRTUALS, `${model}.${field}`)) {
    throw new Error(`Virtual ${model}.${field} can not be computed because data are not leaned, declare it as plain attribute`)
  }
  if (getterFn) {
    lodash.set(COMPUTED_FIELDS_GETTERS, `${model}.${field}`, getterFn)
  }
  if (setterFn) {
    lodash.set(COMPUTED_FIELDS_SETTERS, `${model}.${field}`, setterFn)
  }
  if (rest.requires) {
    declareFieldDependencies({model, field, requires: rest.requires})
  }
}

const declareVirtualField=({model, field, ...rest}) => {
  if (!LEAN_DATA && lodash.get(COMPUTED_FIELDS_GETTERS, `${model}.${field}`)) {
    throw new Error(`Virtual ${model}.${field} can not be computed because data are not leaned, declare it as plain attribute`)
  }
  const enumValues=rest.enumValues ? Object.keys(rest.enumValues) : undefined
  lodash.set(DECLARED_VIRTUALS, `${model}.${field}`, {path: field, ...rest, enumValues})
  if (!lodash.isEmpty(rest.enumValues)) {
    declareEnumField({model, field, enumValues: rest.enumValues})
  }
}

const declareEnumField = ({model, field, enumValues}) => {
  lodash.set(DECLARED_ENUMS, `${model}.${field}`, enumValues)
}

const declareFieldDependencies = ({model, field, requires}) => {
  lodash.set(DEPENDENCIES, `${model}.${field}`, {requires})
}


// Default filter
let filterDataUser = ({model, data, id, user}) => data

const setFilterDataUser = fn => {
  filterDataUser = fn
}

const callFilterDataUser = data => {
  return filterDataUser(data)
}

// Pre proceses model, fields, id before querying
// If preprocessGet returns attribute data, it is returned instead of actual query
let preprocessGet = data => Promise.resolve(data)

const setPreprocessGet = fn => {
  preprocessGet = fn
}

const callPreprocessGet = data => {
  return preprocessGet(data)
}

// If preDeleteData returns a null attribute data, no delete is done by actual query
let preDeleteData = data => Promise.resolve(data)

const setPreDeleteData = fn => {
  preDeleteData = fn
}

const callPreDeleteData = data => {
  return preDeleteData(data)
}

// Pre create data, allows to insert extra fields, etc..
let preCreateData = data => Promise.resolve(data)

const setPreCreateData = fn => {
  preCreateData = fn
}

const callPreCreateData = data => {
  return preCreateData(data)
}

// Pre create data, allows to insert extra fields, etc..
let prePutData = data => Promise.resolve(data)

const setPrePutData = fn => {
  prePutData = fn
}

const callPrePutData = data => {
  return prePutData(data)
}

// Post create data, allows to create extra data, etc, etc
let postCreateData = data => Promise.resolve(data.data)

const setPostCreateData = fn => {
  postCreateData = fn
}

const callPostCreateData = data => {
  return postCreateData(data)
}

// Post put data
let postPutData = data => Promise.resolve(data)

const setPostPutData = fn => {
  postPutData = fn
}

const callPostPutData = data => {
  return postPutData(data)
}

// Post delete data
let postDeleteData = data => Promise.resolve(data)

const setPostDeleteData = fn => {
  postDeleteData = fn
}

const callPostDeleteData = data => {
  return postDeleteData(data)
}

const putAttribute = async (input_params) => {
  let res=await getModel(input_params.id)
      let preParams={[input_params.attribute]: input_params.value}
      let {model, id, params, user, skip_validation} = await callPrePutData({...input_params, model: res, params: preParams})
      const [attribute, value]=Object.entries(params)[0]
      const setter=lodash.get(COMPUTED_FIELDS_SETTERS, `${model}.${input_params.attribute}`)
      if (setter) {
        callPostPutData({model, id, attribute, value, user})
        return setter({id, attribute, value, user})
      }
      const mongooseModel = mongoose.connection.models[model]

      if (attribute.split('.').length==1) {
        // Simple attribute => simple method
        return mongooseModel.findById(id)
          .then(object => {
            object[attribute]=value
            const validation=!!skip_validation ? {validateBeforeSave: false} : {runValidators: true}
            return object.save({...validation})
              .then(obj => {
                const postParams={[attribute]: value}
                return callPostPutData({model, id, attribute, value, params:postParams, user, data: obj})
                  .then(() => obj)
              })
          })
      }
      const populates=buildPopulates({modelName: model, fields:[attribute]})

      let query=mongooseModel.find({$or: [{_id: id}, {origin: id}]})
      query = populates.reduce((q, key) => q.populate(key), query)
      const allModels=getModels()
      return query
        .then(objects => {
          return Promise.all(objects.map(object => {
            let paths=attribute.split('.')
            let obj=paths.length>1 ? lodash.get(object, paths.slice(0, paths.length-1)) : object
            lodash.set(obj, paths.slice(-1)[0], value)
            return obj.save({runValidators: true})
              .then(obj => {
                let subModel=model
                paths.slice(0, -1).forEach(att => {
                  const params=allModels[subModel].attributes[att]
                  if (params.ref) {
                    subModel=params.type
                  }
                })
                const subData=lodash.get(object, paths.slice(0, -1).join('.'))
                const subId=subData._id.toString()
                const subAttr=paths.slice(-1)
                callPostPutData({model:subModel, id: subId, attribute:subAttr, value,
                  params:{[subAttr]:value},
                  user, data: subData})
                return obj
              })
          }))
        })

}

const removeData = async ({id, user}) => {
  let model= await getModel(id)
  const oldData = await mongoose.models[model].findById(id)
  return callPreDeleteData({model,data: oldData,user,id})
    .then(async ({model,data,user,id, params}) => {
      data && await data.delete()
      await callPostDeleteData({model, data: oldData, user, id, params})
    })
}

// Compares ObjecTID/string with ObjectId/string
const idEqual = (id1, id2) => {
  return !!id1 && !!id2 && id1.toString()==id2.toString()
}

// Returns intersection betwenn two sets of _id
const differenceSet = (ids1, ids2) => {
  return lodash.differenceBy(ids1, ids2, v => JSON.stringify(v._id || v))
}

// Checks wether ids intersect
const intersection = (ids1, ids2) => {
  return lodash.intersectionBy(ids1, ids2, v => JSON.stringify(v._id || v)).length
}

// Checks wether ids intersect
const setIntersects = (ids1, ids2) => {
  const inter_length=intersection(ids1, ids2)
  return inter_length>0
}

// Return true if obj1.targets intersects obj2.targets
const shareTargets = (obj1, obj2) => {
  if (!(obj1.targets && obj2.targets)) {
    throw new Error(`obj1 && obj2 must have targets:${!!obj1.targets}/${!!obj2.targets}`)
  }
  return lodash.intersectionBy(obj1.targets, obj2.targets, t => t._id.toString()).length>0
}

const putToDb = async (input_params) => {
  const {model, id, params, user, skip_validation} = await callPrePutData(input_params)
  return mongoose.connection.models[model].findById(id)
    .then(data => {
      if (!data) {throw new NotFoundError(`${model}/${id} not found`)}

      Object.keys(params).forEach(k => { data[k]=params[k] })
      const validation=!!skip_validation ? {validateBeforeSave: false} : {}
      return data.save(validation)
    })
    .then(data => callPostPutData({model, id, params, data, user}))
}

const lean = ({model, data}) => {
  console.time(`Leaning model ${model}`)
  /** Original mongoose. Only leans 1st level
   * const res=data.map(d => d.toObject()))
   * */
  const res=JSON.parse(JSON.stringify(data))
  console.timeEnd(`Leaning model ${model}`)
  return res
}

const display = data => {
  console.trace("Data", JSON.stringify(data))
  return data
}

/*TODO: retainRequiredFields doesn't keep the right attributes after formatting the object to match schema
 * example: 
 * let c = await loadfromdb({...})
 * c = new Announce(c)
 * doesn't keep the virtuals and the deep objects, like c.user.company_name
*/
const loadFromDb = ({model, fields, id, user, params={}}) => {
  // Add filter fields to return them to client
  const filters=extractFilters(params)
  fields=lodash.uniq([...fields, ...Object.keys(filters)])
  return callPreprocessGet({model, fields, id, user, params})
    .then(({model, fields, id, data, params}) => {
      if (data) {
        return data
      }
      // TODO UGLY but user_surveys_progress does not return if not leaned
      const localLean=LEAN_DATA || fields.some(f => /user_surveys_progress/.test(f)) || fields.some(f => /shopping_list/.test(f))
      return buildQuery(model, id, fields, params)
        .then(data => localLean ? lean({model, data}) : data)
        .then(data => Promise.all(data.map(d => addComputedFields(fields,user?._id, params, d, model))))
        .then(data => callFilterDataUser({model, data, id, user, params}))
        .then(data => retainRequiredFields({data, fields}))
    })
}

const DATA_IMPORT_FN={}
const DATA_IMPORT_TEMPLATE_FN={}

// Imports data for model. Delegated to plugins
const setImportDataFunction = ({model, fn}) => {
  if (!model || !fn) {
    throw new Error(`Import data function: expected model and function`)
  }
  if (!!DATA_IMPORT_FN[model]) {
    throw new Error(`Import function already exists for model ${model}`)
  }
  DATA_IMPORT_FN[model]=fn
}

const importData=({model, data, user}) => {
  if (!DATA_IMPORT_FN[model]) {
    console.error(`No function to import ${model}`)
    throw new BadRequestError(`Impossible d'importer le modèle ${model}`)
  }
  return DATA_IMPORT_FN[model](data, user)
}

// Returns template file for import
const setImportDataTemplateFunction = ({model, fn}) => {
  if (!model || !fn) {
    throw new Error(`Import template function: expected model and function`)
  }
  if (!!DATA_IMPORT_TEMPLATE_FN[model]) {
    throw new Error(`Import template function already exists for model ${model}`)
  }
  DATA_IMPORT_TEMPLATE_FN[model]=fn
}

const importDataTemplate=({model, user}) => {
  if (!DATA_IMPORT_TEMPLATE_FN[model]) {
    console.error(`No function to import ${model}`)
    throw new BadRequestError(`Pas de modèle de fichier pour ${model}`)
  }
  return DATA_IMPORT_TEMPLATE_FN[model](model, user)
}

const DUMMY_REF={localField: 'tagada', foreignField: 'tagada'}

const checkIntegrity = () => {
  const errors=[]
  const models=mongoose.models
  Object.entries(models).forEach(([modelName, model]) => {
    const schema=model.schema
    Object.values(schema.virtuals).filter(v => v.path!='id').forEach(virtual => {
      if (!virtual.options?.localField || !virtual.options?.foreignField) {
        errors.push(`Model "${modelName}" virtual attribute "${virtual.path}" requires localField and foreignField`)
      }
    })
  })
  if (!lodash.isEmpty(errors)) {
    throw new Error(errors.join('\n'))
  }
}

// Creates a date filter to match any hour in a day
const getDateFilter = ({attribute, day}) => {
  const start=moment(day).startOf('day')
  const end=moment(day).endOf('day')
  return {$and: [
    {[attribute]: {$gt: start}}, 
    {[attribute]: {$lt: end}}
  ]}
}

// Creates a date filter to match any moment in the month
const getMonthFilter = ({attribute, month}) => {
  const start=moment(month).startOf('month')
  const end=moment(month).endOf('month')
  return {$and: [
    {[attribute]: {$gte: start}}, 
    {[attribute]: {$lte: end}}
  ]}
}

// Creates a date filter to match any moment in the year
const getYearFilter = ({attribute, year}) => {
  const start=moment(year).startOf('year')
  const end=moment(year).endOf('month')
  return {$and: [
    {[attribute]: {$gte: start}}, 
    {[attribute]: {$lte: end}}
  ]}
}

const createSearchFilter = ({attributes}) => {
  return value => {
    const re=new RegExp(value, 'i')
    const filter=({$or:attributes.map(f => ({[f]: re}))})
    console.log('Created filter for value', value, filter)
    return filter
  }
}

module.exports = {
  hasRefs,
  MONGOOSE_OPTIONS,
  attributesComparator,
  getSimpleModelAttributes,
  getReferencedModelAttributes,
  getModelAttributes,
  getModels,
  buildQuery,
  buildPopulates,
  cloneModel,
  cloneArray,
  getModel,
  addComputedFields,
  declareComputedField,
  declareVirtualField,
  declareEnumField,
  formatTime,
  retainRequiredFields,
  setFilterDataUser,
  callFilterDataUser,
  setPreprocessGet,
  callPreprocessGet,
  setPreCreateData,
  callPreCreateData,
  setPreDeleteData,
  setPostCreateData,
  callPostCreateData,
  setPostPutData,
  callPostPutData,
  removeData,
  putAttribute,
  idEqual,
  getExposedModels,
  simpleCloneModel,
  shareTargets,
  loadFromDb,
  getMongooseModels,
  setIntersects,
  intersection,
  differenceSet,
  putToDb,
  setImportDataFunction,
  importData,
  setPostDeleteData,
  handleReliesOn,
  extractFilters, getCurrentFilter, getSubFilters, extractLimits, getSubLimits,
  getFieldsToCompute, getFirstLevelFields, getNextLevelFields, getSecondLevelFields,
  DUMMY_REF, checkIntegrity, getDateFilter, getMonthFilter, getYearFilter, declareFieldDependencies,
  setPrePutData, callPrePutData, setpreLogin, callPreLogin,  createSearchFilter, setPreRegister, callPreRegister,
  importDataTemplate, setImportDataTemplateFunction,
}


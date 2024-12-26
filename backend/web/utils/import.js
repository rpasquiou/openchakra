const csv_parse = require('csv-parse/lib/sync')
const fs = require('fs')
const lodash=require('lodash')
const moment=require('moment')
const ExcelJS = require('exceljs')
const {JSON_TYPE, TEXT_TYPE, XL_TYPE, CREATED_AT_ATTRIBUTE} = require('./consts')
const {bufferToString, guessDelimiter} = require('./text')
const mongoose=require('mongoose')
const { runPromisesWithDelay } = require('../server/utils/concurrency')
const NodeCache = require('node-cache')

const guessFileType = buffer => {
  return new Promise((resolve, reject) => {
    return new ExcelJS.Workbook().xlsx.load(buffer)
      .then(() => {
        return resolve(XL_TYPE)
      })
      .catch(() => {
        try {
          JSON.parse(buffer)
          return resolve(JSON_TYPE)
        }
        catch(err) {
          return Promise.reject(err)
        }
      })
      .catch(() => {
        return resolve(TEXT_TYPE)
      })
  })
}

const getTabs = buffer => {
  return new ExcelJS.Workbook().xlsx.load(buffer)
    .then(wb => {
      return wb.worksheets.map(w => w.name)
    })
}

const extractJSON=(bufferData, options) => {
  try {
    const data=JSON.parse(bufferData)
    if (options.columns) {
      const columns=lodash.flattenDeep(data.map(d => Object.keys(d)))
      return Promise.resolve({headers: columns, records: data})
    }
    const columns=lodash.flattenDeep(data.map(d => Object.keys(d)))
    const records=data.map(d => columns.map(c => d[c]))
    return Promise.resolve({headers: columns, records: records})
  }
  catch(err) {
    return Promise.reject(err)
  }
}

const extractCsv=(bufferData, options) => {
  if (!options.delimiter) {
    return Promise.reject(`CSV loading: missing options.delimiter`)
  }
  return new Promise((resolve, reject) => {
    const contents = bufferToString(bufferData)
    try {
      const opts={columns: true, bom: true, relax_column_count: true, ...options}
      const records=csv_parse(contents, opts)
      if (opts.columns) {
        const headers=Object.keys(records[0])
        resolve({headers: headers, records: records})
      }
      else {
        const headers=records[0]
        resolve({headers: headers, records: records.slice(1)})
      }
    }
    catch(err) {
      reject(err)
    }
  })
}

const extractXls=(bufferData, options) => {
  if (!options.tab) {
    return Promise.reject(`XLS loading: missing options.tab`)
  }
  return new ExcelJS.Workbook().xlsx.load(bufferData)
    .then(workbook => {
      const sheet=workbook.worksheets.find(w => w.name==options.tab)
      if (!sheet) {
        return Promise.reject(`XLS loading: sheet ${options.tab} not found`)
      }
      const first_line=options.from_line || 1
      const columnsRange=lodash.range(1, sheet.actualColumnCount+1)
      const rowsRange=lodash.range(first_line+1, sheet.actualRowCount+1)
      const headers=columnsRange.map(colIdx => sheet.getRow(first_line).getCell(colIdx).text)
      const records=rowsRange.map(rowIdx => columnsRange.map(colIdx => sheet.getRow(rowIdx).getCell(colIdx).text))
      if (!options.columns) {
        return {headers: headers, records: records}
      }
      let mappedRecords=records.map(r => Object.fromEntries(lodash.zip(headers, r)))
      return {headers: headers, records: mappedRecords}
    })
}

const extractData = async (bufferData, options={}) => {
  const EXTRACTS={
    [XL_TYPE]: extractXls,
    [JSON_TYPE]: extractJSON,
    [TEXT_TYPE]: extractCsv,
  }
  if (!options?.format) {
    options.format=await guessFileType(bufferData)
    if (options.format==TEXT_TYPE){
      options.delimiter=guessDelimiter(bufferData)
    }
  }
  if (!Object.keys(EXTRACTS).includes(options?.format)) {
    return Promise.reject(`Null or invalid options.format:${options?.format}`)
  }
  options={columns: true, ...options}
  return EXTRACTS[options.format](bufferData, options)
}

const extractSample = (rawData, options) => {
  return extractData(rawData, {...options, columns: false})
    .then(({headers, records}) => {
      return [headers, ...records.slice(0, 4)]
    })
}

const mapAttribute=async ({record, mappingFn, ...rest}) => {
  if (typeof mappingFn=='string') {
    return record[mappingFn]
  }
 const res=await mappingFn({record, cache:getCache, ...rest})
 return res
}

const mapRecord = async ({record, mapping, ...rest}) => {
  const mapped={}
  for (const k of Object.keys(mapping)) {
    mapped[k]=await mapAttribute({record, mappingFn: mapping[k], ...rest})
  }
  return mapped
}

const dataCache = new NodeCache()

const setCache = (model, migrationKey, destinationKey) => {
  if (lodash.isNil(migrationKey)) {
    throw new Error(`${model}:migration key is empty`)
  }
  if (lodash.isNil(destinationKey)) {
    throw new Error(`${model}:${migrationKey} dest key is empty`)
  }
  const key = `${model}/${migrationKey}`
  dataCache.set(key, destinationKey)
}

const getCache = (model, migrationKey) => {
  const key=`${model}/${migrationKey}`
  const res=dataCache.get(key)
  return res
}

const getCacheKeys = () => {
  return dataCache.keys()
}

const displayCache = () => {
  console.log(dataCache)
}

const countCache = (model) => {
  return dataCache.keys().filter(k => k.startsWith(`${model}/`)).length
}

const upsertRecord = async ({model, record, identityKey, migrationKey, updateOnly, origin}) => {
  const identityFilter=computeIdentityFilter(identityKey, migrationKey, record)
  return model.findOne(identityFilter, {[migrationKey]:1})
    .then(result => {
      if (!result) {
        if (updateOnly) {
          throw new Error(`Could not find ${model.modelName} matching ${JSON.stringify(identityFilter)}`)
        }
        return model.create({...record})
      }
      return model.findByIdAndUpdate(result._id, record, {runValidators:true, new: true})
        .then(() => ({_id: result._id}))
    })
    .then(result => {
      setCache(model.modelName, record[migrationKey], result._id.toString())
      return result
    })
    .catch(err => {
      const msg=`Model ${model.modelName}, from \n${JSON.stringify(origin)}\nto record\n${JSON.stringify(record)}\nerror(s):${err.toString()}`
      console.error(msg)
      throw err
    })
}

const computeIdentityFilter = (identityKey, migrationKey, record) => {
  const filter={$or: [ 
    {[migrationKey]: record[migrationKey]},
    {$and: identityKey.map(key => ({[key]: record[key]}))}
  ]}
  return filter
}

const importData = ({model, data, mapping, identityKey, migrationKey, progressCb, updateOnly, ...rest}) => {
  if (!model || lodash.isEmpty(data) || !lodash.isObject(mapping) || lodash.isEmpty(identityKey) || lodash.isEmpty(migrationKey)) {
    throw new Error(`Expecting model, data, mapping, identityKey, migrationKey`)
  }
  identityKey = Array.isArray(identityKey) ? identityKey : [identityKey]
  console.log(`Ready to insert ${model}, ${data.length} source records, identity key is ${identityKey}, migration key is ${migrationKey}`)
  const msg=`Inserted ${model}, ${data.length} source records`
  const mongoModel=mongoose.model(model)
  const step=parseInt(data.length/20)
  console.time('Mapping records')
  return runPromisesWithDelay(data.map((record, idx) => () => mapRecord({record, mapping, ...rest})))
    .then(result => {
      console.timeEnd('Mapping records')
      const errors=result.filter(r => r.status=='rejected').map(r => r.reason)
      if (!lodash.isEmpty(errors)) {
        console.error('Errors', errors)
      }
      const mappedData=result.filter(r => r.status=='fulfilled').map(r => r.value)
      const recordsCount=mappedData.length
      console.time(msg)
      return runPromisesWithDelay(mappedData.map((record, index) => () => {
        return upsertRecord({model: mongoModel, record, identityKey, migrationKey, updateOnly, origin: data[index]})
          .finally(() => progressCb && progressCb(index, recordsCount))
      }
      ))
      .then(results => {
        const rejected=lodash.zip([results, mappedData]).filter(([res, ]) => res.status=='rejected')
        if (!lodash.isEmpty(rejected)) {
          console.error('rejected', JSON.stringify(rejected))
          throw new Error(JSON.stringify(rejected))
        }
        const createResult=(result, index) => ({
          index,
          success: result.status=='fulfilled',
          error: result.reason?.message || result.reason?._message || result.reason
        })
        const mappedResults=results.map((r, index) => createResult(r, index))
        return mappedResults
      })
    })
    .finally(()=> {
      console.timeEnd(msg)
      delete mongoose.model(model)
      saveCache()
    })
}

const CACHE_PATH='/home/seb/smartdiet-migration-cache'

const loadCache= () => {
  if (!fs.existsSync(CACHE_PATH)) {
    return 
  }
  const contents=JSON.parse(fs.readFileSync(CACHE_PATH).toString())
  const formatted=Object.entries(contents).map(([key, val]) => ({key, val}))
  dataCache.mset(formatted)  
  console.log('Loaded from cache', formatted.length, 'keys')
}

const saveCache= () => {
  const data=dataCache.mget(dataCache.keys())
  fs.writeFileSync(CACHE_PATH, JSON.stringify(data, null,2))
  console.log('Saved to cache', Object.keys(data).length, 'keys')
}

module.exports={
  extractData, 
  guessFileType, 
  getTabs, 
  extractSample,
  importData,
  getCacheKeys,
  displayCache,
  cache: getCache,
  setCache,
  loadCache, saveCache,
}


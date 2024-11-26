const NodeCache = require("node-cache")
const moment=require('moment')

const withCache = fn => {
  const cache=new NodeCache({stdTTL: 30})

  const internal = async (...params) => {
    const key=JSON.stringify(params)
    if (cache.has(key)) {
      console.log('Got res in cache for', fn.name, ...params)
      return cache.get(key)
    }
    console.log('Have to compute res in cache for', fn.name, ...params)
    const res=await fn(...params)
    cache.set(key, res)
    return res
  }
  internal.name=fn.name

  return internal
}


const withMeasureTime = (fn, prefix) => {

  const internal = async (...params) => {
    // const msg=`${prefix} ${fn.name} ${JSON.stringify(params)}`
    const msg=`Measure time ${process.hrtime.bigint()} ${prefix} ${fn.name} ${JSON.stringify(params)} took`
    console.time(msg)
    const res=await fn(...params)
    console.timeEnd(msg)
    return res
  }
  internal.name=fn.name

  return internal
}

module.exports={
  withCache, withMeasureTime,
}
const fs=require('fs')
const { runPromiseUntilSuccess } = require('../../server/utils/concurrency')

jest.setTimeout(10*1000)

describe('Concurrency tests', () => {

  test('Must return city suggestions', async() => {
    let nb=10
    const promiseFn= () => new Promise((res, rej) => {
      console.log(nb)
      nb--
      if (nb>0) {
        return rej('Error')
      }
      return res('ok')
    })
    return runPromiseUntilSuccess(promiseFn, 5, 1000)
     .then(console.log)
     .catch(console.error)
  })

})

const axios = require('axios')
const { runPromiseUntilSuccess } = require('../../server/utils/concurrency')

jest.setTimeout(10*1000)

describe('Concurrency tests', () => {

  test('Must run promise until success', async() => {
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

  test.only('Must run promise until success if error thrown in .then', async () => {
    const promiseFn = () => {
        return axios.get('https://www.google.com')
          .then(() => {
            throw new Error('test error')
          })
      }
      return runPromiseUntilSuccess(promiseFn, 5,1)
    })
})

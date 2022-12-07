import {getPureAuthToken, clearAuthenticationToken} from './authentication'
const {HTTP_CODES} = require('../server/utils/errors')

const blobContentTypes = [
  'application/vnd.openxmlformats',
]

async function client(
  endpoint,
  {data, token, headers: customHeaders, ...customConfig} = {},
) {
  // override supplied token , otherwise use the cookie token
  const currentToken = token ? token : getPureAuthToken()
  const config = {
    method: data ? 'POST' : 'GET',
    body: data ? JSON.stringify(data) : undefined,
    headers: {
      Authorization: currentToken ? `${currentToken}` : undefined,
      'Content-Type': data ? 'application/json' : undefined,
      ...customHeaders,
    },
    ...customConfig,
  }

  return window.fetch(endpoint, config).then(async response => {
    if (response.status === HTTP_CODES.NOT_LOGGED) {
      clearAuthenticationToken()
      // refresh the page for them
      return Promise.reject({message: 'Accès interdit.'})
    }

    if (response.ok) {
      const headers = [...response.headers].reduce((a, v) => ({...a, [v[0]]: v[1]}), {})

      /* if content-type is part of data considered as files... */
      if (blobContentTypes.includes(headers['content-type'])) {
        return await response.blob()
          .catch(e => console.log(`Error when fetching blob`, e))
      }

      const data = await response.json()
        .catch(e => console.log(`Error when fetching`, e))

      return data
    }

    const error = new Error()
    error.info = {
      status: response.status,
      message: await response.json() || 'Something went wrong',
    }

    throw error
  })
    .catch(err => {
      throw err
    })
}


export {client}

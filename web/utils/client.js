import {getPureAuthToken, clearAuthenticationToken} from './authentication'

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
    if (response.status === 401) {
      clearAuthenticationToken()
      // refresh the page for them
      window.location.assign(window.location)
      return Promise.reject({message: 'Please re-authenticate.'})
    }
    if (response.ok) {
      const headers = [...response.headers].reduce((a, v) => ({...a, [v[0]]: v[1]}), {})

      /* if content-type is part of data considered as files... */
      if (blobContentTypes.includes(headers['content-type'])) {
        const blob = await response.blob()
          .catch(e => console.log(`Error when fetching blob ${e}`))
        return blob
      }

      const data = await response.json()
        .catch(e => console.log(`Error when fetching ${e}`))
      return data
    }
    return Promise.reject(data)

  })
}


export {client}

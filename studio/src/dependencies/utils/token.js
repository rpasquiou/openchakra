import Cookies from 'universal-cookie'
import store from "store"

const KEY='token'

const cookies=new Cookies()

const ensureToken = () => {
  const cookie=cookies.get(KEY)
  const stored=store.get(KEY)
  if (cookie && !stored) {
    store.set(KEY, cookie)
  }
  if (!cookie && stored) {
    cookies.set(KEY, stored)
  }
}

const clearToken = () => {
  cookies.remove(KEY)
  store.remove(KEY)
}

const storeAndRedirect = loginUrl => {
  const fullPath=`${window.location.pathname}${window.location.search}`
  const cookies=new Cookies()
  cookies.set('redirect', fullPath)
  window.location=loginUrl
}

export {ensureToken, clearToken, storeAndRedirect}

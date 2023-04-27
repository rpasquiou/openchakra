import {WebView} from 'react-native-webview'
import {useEffect, useState} from 'react'
import axios from 'axios'
import {
  NativeModules,
} from 'react-native'

const BASE_URL_TO_POINT = 'https://fumoir.my-alfred.io'
const {RNLinkModule} = NativeModules

// TODO: subscribe on login & unsubscribe on logout using previous hook value : https://blog.logrocket.com/accessing-previous-props-state-react-hooks/

const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')

  useEffect(() => {
    if (currentUrl !== BASE_URL_TO_POINT) {
      axios.get(`${BASE_URL_TO_POINT}/myAlfred/api/studio/current-user`)
        .then(({data}) => {
          // send userId to app in order to subscribe to topic (Firebase notifications)
          RNLinkModule.isUserHasSubscribed(data.id)
        })
        .catch(err => {
          if (err.response?.status==401) {
          }
        })
    }
  }, [currentUrl])

  return (
    <>
      <WebView
        startInLoadingState={true}
        allowsBackForwardNavigationGestures
        injectedJavaScript={saveLoginScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={event => {}}
        mediaPlaybackRequiresUserAction={true}
        source={{uri: BASE_URL_TO_POINT}}
        onNavigationStateChange={({url}) => setCurrentUrl(url)}
      />
    </>
  )
}


const saveLoginScript = `
  
  const currentUrl = window.location.href
  const origUrl = window.location.origin + "/"  // if login is on the root
  const testPattern = /login|connexion/

  const handleLoginParam = () => {

    const localStorageId = 'loginitems'

    const username = document.querySelector('input[type="email"]')
    const password = document.querySelector('input[type="password"]')
    password.setAttribute('autocomplete', 'current-password')

    const isLocalStorage = localStorage.getItem(localStorageId);
    
    if (isLocalStorage) {
      const data = JSON.parse(isLocalStorage)
      username.value = data?.email

      setTimeout(() => {
        password.value = data?.password
      }, 500)

    }

    const updateToLocalStorage = (e) => {

      const name = e.currentTarget.type === 'text' ? 'password' : e.currentTarget.type

      const item = {[name]: e.currentTarget.value}
      var logItems = localStorage.getItem(localStorageId);

      if (!logItems) {
        localStorage.setItem(localStorageId, JSON.stringify(item))
      } else {
        const oldConfig = JSON.parse(logItems)
        localStorage.setItem(localStorageId, JSON.stringify({...oldConfig, ...item}))
      }
    }

    username.addEventListener('change', updateToLocalStorage)
    password.addEventListener('change', updateToLocalStorage)
  }
  
  if (testPattern.test(currentUrl) || currentUrl === origUrl) {
    handleLoginParam()
  } 


`

export default App

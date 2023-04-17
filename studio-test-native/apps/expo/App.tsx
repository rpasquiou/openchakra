import {WebView} from 'react-native-webview'
import {useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {
  NativeModules,
} from 'react-native'

const BASE_URL_TO_POINT = 'https://fumoir.my-alfred.io'
const {RNLinkModule} = NativeModules

const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')
  const [currentUser, setCurrentUser]=useState(null)

  const webviewRef = useRef(null)

  useEffect(() => {
    if (currentUrl !== BASE_URL_TO_POINT) {
      axios.get(`${BASE_URL_TO_POINT}/myAlfred/api/studio/current-user`)
        .then(({data}) => {
          setCurrentUser(data)
          // send userId to app in order to handle notifications
          RNLinkModule.setCurrentUser(data.id)
        })
        .catch(err => {
          if (err.response?.status==401) {
            setCurrentUser(null)
          }
        })
    }
  }, [currentUrl])

  return (
    <>
      <WebView
        startInLoadingState={true}
        allowsBackForwardNavigationGestures
        mediaPlaybackRequiresUserAction={true}
        source={{uri: BASE_URL_TO_POINT}}
        ref={webviewRef}
        onNavigationStateChange={({url}) => setCurrentUrl(url)}
      />
    </>
  )
}

export default App

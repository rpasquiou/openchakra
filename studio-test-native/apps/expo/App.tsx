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
        mediaPlaybackRequiresUserAction={true}
        source={{uri: BASE_URL_TO_POINT}}
        onNavigationStateChange={({url}) => setCurrentUrl(url)}
      />
    </>
  )
}

export default App

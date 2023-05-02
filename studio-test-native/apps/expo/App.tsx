import {WebView} from 'react-native-webview'
import {useEffect, useState} from 'react'
import axios from 'axios'
import {
  NativeModules,
} from 'react-native'
const {RNNotificationsModule} = NativeModules

const BASE_URL_TO_POINT = 'https://fumoir.my-alfred.io'

const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')
  const [user, setUser]=useState(null)

  useEffect(() => {
    axios.get(`${BASE_URL_TO_POINT}/myAlfred/api/studio/current-user`)
      .then(({data}) => {
        if (!user) { setUser(data) }
      })
      .catch(err => {
        if (err.response?.status==401 && user) { setUser(null) }
      })
  }, [currentUrl])


  useEffect(()=> {
    if (user) {
      RNNotificationsModule.subscribeToNotifications(user._id)
    }
    else {
      RNNotificationsModule.unsubscribeFromNotifications()
    }
  }, [user])

  return (
    <>
      <WebView
        startInLoadingState={true}
        allowsBackForwardNavigationGestures
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


export default App

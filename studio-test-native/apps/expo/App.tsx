import {WebView} from 'react-native-webview'
import {useEffect, useState} from 'react'
import axios from 'axios'
import KeyboardAvoidingView from './components/KeyboardAvoidingView'
import NotifContainer from './modules/notifications/NotifContainer'


const BASE_URL_TO_POINT = 'https://smartdiet.app'


const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')
  const [currentUser, setCurrentUser]=useState(null)

  const getCurrentUser = async() => {
    await axios.get(`${BASE_URL_TO_POINT}/myAlfred/api/studio/current-user`)
      .then(res => setCurrentUser(res?.data))
      .catch(err => {
        if (err.response?.status==401 && currentUser) { setCurrentUser(null) }
      })
  }

  useEffect(() => {
    getCurrentUser()
  }, [currentUrl, getCurrentUser])
  

  return (
    <>
      <KeyboardAvoidingView>
        <NotifContainer user={currentUser} allOnStart>
          <WebView
            startInLoadingState={true}
            allowsBackForwardNavigationGestures
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={event => {}}
            mediaPlaybackRequiresUserAction={true}
            source={{uri: BASE_URL_TO_POINT}}
            sharedCookiesEnabled={true}
            onNavigationStateChange={({url}) => setCurrentUrl(url)}
          />
        </NotifContainer>
      </KeyboardAvoidingView>
    </>
  )
}


export default App

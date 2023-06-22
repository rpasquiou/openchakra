import React, {useCallback, useEffect, useState} from 'react'
import {WebView} from 'react-native-webview'
import {StatusBar} from 'expo-status-bar'
import axios from 'axios'
import KeyboardAvoidingView from './components/KeyboardAvoidingView'
import NotifContainer from './modules/notifications/NotifContainer'


const BASE_URL_TO_POINT = 'https://hellotipi.fr'

const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')
  const [currentUser, setCurrentUser]=useState(null)

  const getCurrentUser = useCallback(async() => {
    await axios.get(`${BASE_URL_TO_POINT}/myAlfred/api/studio/current-user`)
      .then(res => setCurrentUser(res?.data))
      .catch(err => {
        if (err.response?.status==401 && currentUser) { setCurrentUser(null) }
      })
  }, [currentUser])

  useEffect(() => {
    getCurrentUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl])
  

  return (
    <>
      <NotifContainer user={currentUser} allOnStart>
        <StatusBar style={'dark'} />
        <KeyboardAvoidingView>
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
        </KeyboardAvoidingView>
      </NotifContainer>
    </>
  )
}


export default App

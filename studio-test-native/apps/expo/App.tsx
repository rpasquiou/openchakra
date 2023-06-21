import React, {useCallback, useEffect, useState} from 'react'
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview'
import { StatusBar } from 'expo-status-bar';
import axios from 'axios'
import KeyboardAvoidingView from './components/KeyboardAvoidingView'
import NotifContainer from './modules/notifications/NotifContainer'


const BASE_URL_TO_POINT = 'https://smartdiet.app'

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
  }, [currentUrl])
  

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>   
      <NotifContainer user={currentUser} allOnStart>
        <StatusBar style={"dark"} />
        <SafeAreaView 
          style={{flex: 1,}} 
          edges={['top', 'left', 'right']}
        >
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
        </SafeAreaView>
      </NotifContainer>
    </SafeAreaProvider>
  )
}



export default App

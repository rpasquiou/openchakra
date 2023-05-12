import { Button, View, Text } from 'react-native';
import {WebView} from 'react-native-webview'
import {useEffect, useRef, useState} from 'react'
import axios from 'axios'
import messaging from '@react-native-firebase/messaging';

const BASE_URL_TO_POINT = 'https://fumoir.my-alfred.io'

const TOPIC_PREFIX="user"
const ALL_SUFFIX ="ALL";

const registeredTopics = []

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


  useEffect(() => {
    // TODO set and unset registeredTopics
    async function wholeStory() {
      const permissionenabled = await requestUserPermission()
      if (permissionenabled) {
        messaging()
          .subscribeToTopic('weather')
          .then(() => console.log('Subscribed to topic!'));
      }
    }
    
    if (user) {
      wholeStory()
    } else {
      messaging()
        .unsubscribeFromTopic('weather')
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

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }

  return enabled
}


export default App

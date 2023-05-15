import {WebView} from 'react-native-webview'
import {useEffect, useRef, useState} from 'react'
import axios from 'axios'
import messaging from '@react-native-firebase/messaging';

const BASE_URL_TO_POINT = 'https://fumoir.my-alfred.io'

const TOPIC_PREFIX="user"
const UNDERSCORE = "_"
const ALL_SUFFIX ="ALL";

const gentopics = ({userid}: {userid: string}):string[] => {
  const currentSuffixTopics = [userid, ALL_SUFFIX]
  return currentSuffixTopics.map(suffix => TOPIC_PREFIX + UNDERSCORE + suffix)
}

const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')
  const [user, setUser]=useState(null)
  const [registeredTopics, setRegisteredTopics] = useState([])

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

    async function wholeStory({back = false}) {
      const permissionenabled = await requestUserPermission()
      if (permissionenabled) {

        registeredTopics.forEach(async topicName => {
          if (!back) {
            await messaging()
              .subscribeToTopic(topicName)
              .then(() => console.log(`Subscribed to topic ${topicName}!`));
            } else {
              await messaging()
                .unsubscribeFromTopic(topicName)
                .then(() => console.log(`Unsubscribed to topic ${topicName}!`));
            }
        });
      }
    }
    
    user ? wholeStory({back: false}) : wholeStory({back: true})

  }, [user])

  // Handle topics 
  useEffect(() => {
    if (user) {
      const topicsToRegister = gentopics({userid: user?._id})
      setRegisteredTopics(topicsToRegister)
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

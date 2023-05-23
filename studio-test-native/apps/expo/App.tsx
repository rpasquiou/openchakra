import {WebView} from 'react-native-webview'
import {useEffect, useState} from 'react'
import KeyboardAvoidingView from './components/KeyboardAvoidingView'
import axios from 'axios'
import { handleSubscription, Topics } from './modules/notifications'
import { TOPIC_PREFIX, SEPARATOR, ALL_SUFFIX } from './modules/notifications/config';


const BASE_URL_TO_POINT = 'https://fumoir.my-alfred.io'


const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')
  const [currentUser, setCurrentUser]=useState(null)
  const [topicsToHandle, setTopicsToHandle] = useState<Topics>([])

  useEffect(() => {
    axios.get(`${BASE_URL_TO_POINT}/myAlfred/api/studio/current-user`)
      .then(({data}) => {
        setCurrentUser(data)
      })
      .catch(err => {
        if (err.response?.status==401 && currentUser) { setCurrentUser(null) }
      })
  }, [currentUrl])


  useEffect(() => {
    if (topicsToHandle.length > 0) {
      currentUser 
        ? handleSubscription({topicsToHandle, back: false}) 
        : handleSubscription({topicsToHandle, back: true})
    }
  }, [currentUser, topicsToHandle])

  // Handle topics 
  useEffect(() => {
    if (currentUser && topicsToHandle.length === 0) {
      const topicsToRegister = gentopics({userid: currentUser?._id})
      setTopicsToHandle(topicsToRegister)
    }
  }, [currentUser])
  

  return (
    <>
      <KeyboardAvoidingView>
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
      </KeyboardAvoidingView>
    </>
  )
}

export const gentopics = ({userid}: {userid: string}): Topics => {

  const currentSuffixTopics = [
    {
      name: userid, 
      permanent: false 
    }, 
    {
      name: ALL_SUFFIX, 
      permanent: true
    }
  ]
  
  // @ts-ignore
  return currentSuffixTopics.reduce((acc, topic) => [...acc, {
      permanent: topic?.permanent,
      name: TOPIC_PREFIX + SEPARATOR + topic?.name
    }], [])
}



export default App

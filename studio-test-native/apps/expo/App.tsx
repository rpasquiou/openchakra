import {WebView} from 'react-native-webview'
import {useEffect, useState} from 'react'
import axios from 'axios'
import { handleSubscription, Topics } from './modules/notifications'
import { TOPIC_PREFIX, SEPARATOR, ALL_SUFFIX } from './modules/notifications/config';


const BASE_URL_TO_POINT = 'https://fumoir.my-alfred.io'


const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')
  const [user, setUser]=useState(null)
  const [topicsToHandle, setTopicsToHandle] = useState<Topics>([])

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
    user 
      ? handleSubscription({topicsToHandle, back: false}) 
      : handleSubscription({topicsToHandle, back: true})
  }, [user])

  // Handle topics 
  useEffect(() => {
    if (user) {
      const topicsToRegister = gentopics({userid: user?._id})
      setTopicsToHandle(topicsToRegister)
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

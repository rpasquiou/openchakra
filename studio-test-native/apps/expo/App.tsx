import {WebView} from 'react-native-webview'
import React, {useRef, useState, useEffect} from 'react'
import {
  Text,
  TouchableHighlight,
  NativeModules,
  View,
  Platform,
} from 'react-native'
// import SplashScreen from 'react-native-splash-screen';
import axios from 'axios'
import { handleSubscription, Topics } from './modules/notifications'
import { TOPIC_PREFIX, SEPARATOR, ALL_SUFFIX } from './modules/notifications/config';

const {WithingsLink} = Platform.OS === 'android' ? NativeModules : {WithingsLink: null}

const BASE_URL_TO_POINT = 'https://ma-tension.com/'

const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')
  const [displaySetup, setDisplaySetup]=useState(false)
  const [currentUser, setCurrentUser]=useState(null)
  const [shouldAskPermissions, setShouldAskPermissions]=useState(true)
  const [topicsToHandle, setTopicsToHandle] = useState<Topics>([])

  const webviewRef = useRef(null)

  // Display permissions dialogs once when user is logged
  useEffect(() => {
    if (currentUser && shouldAskPermissions) {
      console.log(`Calling askOwnPermission()`)
      if (Platform.OS === 'android') {
        WithingsLink?.askOwnPermissions()
      }
      setShouldAskPermissions(false)
    }
  }, [currentUser])

  useEffect(() => {
    console.log(`Logged:${!!currentUser} ${Date.now()}`)
    setDisplaySetup(/setup-appareil/.test(currentUrl) && !!currentUser)
  }, [currentUrl, currentUser])

  const startSync = ({mac_address, advertise_key}) => {
    console.log(`Starting sync for device ${mac_address}/${advertise_key}`)
    WithingsLink?.synchronizeDevice(mac_address, advertise_key)
  }

  useEffect(() => {
    axios.get(`${BASE_URL_TO_POINT}/myAlfred/api/studio/current-user`)
      .then(({data}) => {
        const firstLogin=!currentUser
        setCurrentUser(data)
        axios.get(`${BASE_URL_TO_POINT}/myAlfred/api/studio/user/${data._id}?fields=devices`)
          .then(({data}) => {
            const device=data[0]?.devices[0]
            if (firstLogin && device) {
              
              // Currently no code about Withings on iOS
              if (Platform.OS === 'android') {
                startSync(device)
              }
            }
          })
      })
      .catch(err => {
        if (err.response?.status==401) {
          setCurrentUser(null)
        }
      })
  }, [currentUrl])

  useEffect(() => {
    currentUser 
      ? handleSubscription({topicsToHandle, back: false}) 
      : handleSubscription({topicsToHandle, back: true})
  }, [currentUser])

    // Handle topics 
    useEffect(() => {
      if (currentUser) {
        const topicsToRegister = gentopics({userid: currentUser?._id})
        setTopicsToHandle(topicsToRegister)
      }
    }, [currentUser])

  const accessToken=currentUser?.access_token
  const csrfToken=currentUser?.csrf_token

  return (
    <>
      <WebView
        startInLoadingState={true}
        injectedJavaScript={saveLoginScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={event => {}}
        allowsBackForwardNavigationGestures
        mediaPlaybackRequiresUserAction={true}
        source={{uri: BASE_URL_TO_POINT}}
        geolocationEnabled={true}
        sharedCookiesEnabled={true}
        ref={webviewRef}
        onNavigationStateChange={({url}) => setCurrentUrl(url)}
      />

      { displaySetup && currentUser &&
          <>
            <View style={{alignItems: 'center', backgroundColor: '#f5f6fa'}}>
              <TouchableHighlight style={{margin: '2%', padding: '4%', backgroundColor: '#172D4D', borderRadius: 30}} >
                <Text
                  style={{color: '#ffffff'}}
                  onPress={() => WithingsLink.openInstall(accessToken, csrfToken)}
                >Ajouter un appareil</Text>
              </TouchableHighlight>
              <TouchableHighlight style={{margin: '2%', padding: '4%', backgroundColor: '#43ABB1', borderRadius: 30}} >
                <Text
                  style={{color: '#ffffff'}}
                  onPress={() => WithingsLink.openSettings(accessToken, csrfToken)}
                >Modifier un appareil</Text>
              </TouchableHighlight>
            </View>
          </>
      }
    </>
  )
}

const gentopics = ({userid}: {userid: string}): Topics => {

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


const saveLoginScript = `
  
  const currentUrl = window.location.href
  const origUrl = window.location.origin + "/"  // if login is on the root
  const testPattern = /login|connexion/
  const handleLoginParam = () => {
    const localStorageId = 'loginitems'
    const username = document.querySelector('input[type="email"]')
    const password = document.querySelector('input[type="password"]')
    password.setAttribute('autocomplete', 'current-password')
    const isLocalStorage = localStorage.getItem(localStorageId);
    
    if (isLocalStorage) {
      const data = JSON.parse(isLocalStorage)
      username.value = data?.email
      setTimeout(() => {
        password.value = data?.password
      }, 500)
    }
    const updateToLocalStorage = (e) => {
      const name = e.currentTarget.type === 'text' ? 'password' : e.currentTarget.type
      const item = {[name]: e.currentTarget.value}
      var logItems = localStorage.getItem(localStorageId);
      if (!logItems) {
        localStorage.setItem(localStorageId, JSON.stringify(item))
      } else {
        const oldConfig = JSON.parse(logItems)
        localStorage.setItem(localStorageId, JSON.stringify({...oldConfig, ...item}))
      }
    }
    username.addEventListener('change', updateToLocalStorage)
    password.addEventListener('change', updateToLocalStorage)
  }
  
  if (testPattern.test(currentUrl) || currentUrl === origUrl) {
    handleLoginParam()
  } 
`

export default App

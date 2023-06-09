import {WebView} from 'react-native-webview'
import React, {useRef, useState, useEffect} from 'react'
import {
  Text,
  TouchableHighlight,
  NativeModules,
  View,
  Platform,
} from 'react-native'
import KeyboardAvoidingComponent from './components/KeyboardAvoidingView'
import NotifContainer from './modules/notifications/NotifContainer'
import Spinner from './components/Spinner/Spinner'
// import SplashScreen from 'react-native-splash-screen';
import axios from 'axios'

const {WithingsLink} = Platform.OS === 'android' ? NativeModules : {WithingsLink: null}

const BASE_URL_TO_POINT = 'https://ma-tension.com'

const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')
  const [displaySetup, setDisplaySetup]=useState(false)
  const [currentUser, setCurrentUser]=useState(null)
  const [shouldAskPermissions, setShouldAskPermissions]=useState(true)

  const webviewRef = useRef(null)
  const onContentProcessDidTerminate = () => webviewRef.current?.reload()

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

  const accessToken=currentUser?.access_token
  const csrfToken=currentUser?.csrf_token

  const DekupleSpinner = () => <Spinner color={'#172D4D'}/>

  return (
    <>
      <KeyboardAvoidingComponent>
        <NotifContainer user={currentUser} allOnStart>
          <WebView
            renderLoading={DekupleSpinner}
            startInLoadingState={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={event => {}}
            allowsBackForwardNavigationGestures
            mediaPlaybackRequiresUserAction={true}
            source={{uri: BASE_URL_TO_POINT}}
            geolocationEnabled={true}
            sharedCookiesEnabled={true}
            ref={webviewRef}
            onContentProcessDidTerminate={onContentProcessDidTerminate}
            onNavigationStateChange={({url}) => setCurrentUrl(url)}
          />
        </NotifContainer>
      </KeyboardAvoidingComponent>

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

export default App

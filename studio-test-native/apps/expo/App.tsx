import {WebView} from 'react-native-webview'
import React, {useRef, useState, useEffect} from 'react'
import {
  Text,
  TouchableHighlight,
  NativeModules,
  View,
} from 'react-native'
// import SplashScreen from 'react-native-splash-screen';
import axios from 'axios'
const {WithingsLink} = NativeModules

const BASE_URL_TO_POINT = 'https://ma-tension.com/'

const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')
  const [displaySetup, setDisplaySetup]=useState(false)
  const [currentUser, setCurrentUser]=useState(null)
  const [shouldAskPermissions, setShouldAskPermissions]=useState(true)

  const webviewRef = useRef(null)

  // Display permissions dialogs once when user is logged
  useEffect(() => {
    if (currentUser && shouldAskPermissions) {
      console.log(`Calling askAllPermission()`)
      WithingsLink.askAllPermissions()
      setShouldAskPermissions(false)
    }
  }, [currentUser])

  useEffect(() => {
    setDisplaySetup(/setup-appareil/.test(currentUrl) && !!currentUser)
  }, [currentUrl, currentUser])

  const startSync = ({mac_address, advertise_key}) => {
    console.log(`Starting sync for device ${mac_address}/${advertise_key}`)
    WithingsLink.synchronizeDevice(mac_address, advertise_key)
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
              startSync(device)
            }
          })
      })
      .catch(err => {
        console.error(err)
        setCurrentUser(null)
      })
  }, [currentUrl, currentUser])

  const accessToken=currentUser?.access_token
  const csrfToken=currentUser?.csrf_token

  return (
    <>
      <WebView
        startInLoadingState={true}
        allowsBackForwardNavigationGestures
        mediaPlaybackRequiresUserAction={true}
        source={{uri: BASE_URL_TO_POINT}}
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

export default App

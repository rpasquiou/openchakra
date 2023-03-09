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

const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')
  const [displaySetup, setDisplaySetup]=useState(false)
  const [currentUser, setCurrentUser]=useState(null)

  const webviewRef = useRef(null)

  useEffect(() => {
    console.log(`WebView URL is ${currentUrl}`)
    setDisplaySetup(/setup-appareil/.test(currentUrl))
  }, [currentUrl])

  const startSync = ({mac_address, advertise_key}) => {
    console.log(`Starting sync for device ${mac_address}/${advertise_key}`)
    WithingsLink.synchronizeDevice(mac_address, advertise_key)
  }

  useEffect(() => {
    axios.get('https://dekuple.my-alfred.io/myAlfred/api/studio/current-user')
      .then(({data}) => {
        const firstLogin=!currentUser
        setCurrentUser(data)
        axios.get(`https://dekuple.my-alfred.io/myAlfred/api/studio/user/${data._id}?fields=devices`)
          .then(({data}) => {
            const device=data[0]?.devices[0]
            if (firstLogin && device) {
              startSync(device)
            }
          })
      })
      .catch(err => {
        setCurrentUser(null)
      })
    setDisplaySetup(/setup-appareil/.test(currentUrl))
  }, [currentUrl, currentUser])

  const accessToken=currentUser?.access_token
  const csrfToken=currentUser?.csrf_token

  return (
    <>
      <WebView
        startInLoadingState={true}
        allowsBackForwardNavigationGestures
        mediaPlaybackRequiresUserAction={true}
        source={{uri: 'https://dekuple.my-alfred.io'}}
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

import {WebView} from 'react-native-webview';
import React, { useRef, useState, useEffect } from 'react'
import {
    SafeAreaView,
    StyleSheet,
    Text,
    Button,
    NativeModules
} from 'react-native';
//import SplashScreen from 'react-native-splash-screen';
import axios from 'axios'
const {WithingsLink} = NativeModules;

const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')
  const [displaySetup, setDisplaySetup]=useState(false)
  const [currentUser, setCurrentUser]=useState(null)

  const webviewRef = useRef(null);

  useEffect(()=> {
    setDisplaySetup(/setup-appareil/.test(currentUrl))
  }, [currentUrl])

  const startSync = ({mac_address, advertise_key}) => {
    console.log(`Starting sync for device ${mac_address}/${advertise_key}`)
    WithingsLink.synchronizeDevice(mac_address, advertise_key)
  }

  useEffect(()=> {
    axios.get('https://dekuple.my-alfred.io/myAlfred/api/studio/current-user')
      .then(({data}) => {
        const firstLogin=!currentUser
        setCurrentUser(data)
        axios.get(`https://dekuple.my-alfred.io/myAlfred/api/studio/user/${data._id}?fields=devices`)
          .then(({data})=> {
            const device=data[0]?.devices[0]
            if (firstLogin && device) {
              startSync(device)
            }
          })
      })
      .catch(err => {
        setCurrentUser(null)
        //console.error(`Can not get current-user:${err}`)
      })
    setDisplaySetup(/setup-appareil/.test(currentUrl))
  }, [currentUrl])

  const accessToken=currentUser?.access_token
  const csrfToken=currentUser?.csrf_token

  return (
    <>
      <SafeAreaView style={styles.flexContainer}  >
        <WebView
          startInLoadingState={true}
          allowsBackForwardNavigationGestures
          mediaPlaybackRequiresUserAction={true}
          //source={{ uri: "https://dekuple.my-alfred.io/setup-appareils" }}
          source={{ uri: "https://dekuple.my-alfred.io" }}
          ref={webviewRef}
          onNavigationStateChange={({url}) => setCurrentUrl(url)}
        />
        <Text>{JSON.stringify(accessToken)}</Text>
        <Text>Devices:{currentUser?.devices}</Text>
        { displaySetup && currentUser &&
          <>
            <Button title="open install" onPress={
              ()=>WithingsLink.openInstall(accessToken, csrfToken)
            }/>
            <Button title="open settings" onPress={
              ()=>WithingsLink.openSettings(accessToken, csrfToken)
            }/>
          </>
        }
        </SafeAreaView>
    </>
  )
};

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1
    },
});

export default App

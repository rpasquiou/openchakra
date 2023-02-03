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

  useEffect(()=> {
    axios.get('https://dekuple.my-alfred.io/myAlfred/api/studio/current-user')
      .then(res => {
        setCurrentUser(res.data)
      })
      .catch(err => console.error(err))
    setDisplaySetup(/setup-appareil/.test(currentUrl))
  }, [currentUrl])

  const token='6d3d7bc59ab8b2753e77d0792ce5c48698b3a218'
  WithingsLink.sayHello()
  return (
    <>
      <SafeAreaView style={styles.flexContainer}  >
        <WebView
          startInLoadingState={true}
          allowsBackForwardNavigationGestures
          mediaPlaybackRequiresUserAction={true}
          source={{ uri: "https://dekuple.my-alfred.io/setup-appareils" }}
          //source={{ uri: "https://dekuple.my-alfred.io" }}
          ref={webviewRef}
          onNavigationStateChange={({url}) => setCurrentUrl(url)}
        />
        { displaySetup && currentUser &&
          <>
            <Button title="open install" onPress={()=>WithingsLink.openInstall()}/>
            <Button title="open settings" onPress={()=>WithingsLink.openSettings(token)}/>
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

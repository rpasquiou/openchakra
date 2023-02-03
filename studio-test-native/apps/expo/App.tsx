import {WebView} from 'react-native-webview';
import React, { useRef, useState, useEffect } from 'react'
import {
    SafeAreaView,
    StyleSheet,
    Text,
    NativeModules
} from 'react-native';
//import SplashScreen from 'react-native-splash-screen';
const {WithingsLink} = NativeModules;

const App = () => {

  const [hello, setHello]=useState('')

  const webviewRef = useRef(null);

  useEffect(()=> {
    WithingsLink.sayHello()
      .then(res => setHello(res))
  }, [])

  return (
    <>
      <SafeAreaView style={styles.flexContainer}  >
        <WebView
          startInLoadingState={true}
          allowsBackForwardNavigationGestures
          mediaPlaybackRequiresUserAction={true}
          source={{ uri: "https://dekuple.my-alfred.io/" }}
          ref={webviewRef}
        />
        <Text>Hello:{hello}</Text>
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

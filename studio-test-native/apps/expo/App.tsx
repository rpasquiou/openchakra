import {WebView} from 'react-native-webview';
import React, { useRef, useEffect } from 'react'
import {
    SafeAreaView,
    StyleSheet,
    NativeModules,
    Text
} from 'react-native';
//import SplashScreen from 'react-native-splash-screen';

const App = () => {

  /**
  useEffect(()=>{
      SplashScreen.hide();
  });
  */
  
  const webviewRef = useRef(null);

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
        </SafeAreaView>
        <Text>JS:{JSON.stringify(NativeModules)}:SJ</Text>
    </>
  )
};

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1
    },
});

export default App

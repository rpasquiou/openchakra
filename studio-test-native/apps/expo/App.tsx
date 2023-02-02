import {WebView} from 'react-native-webview';
import React, { useRef } from 'react'
import {
    SafeAreaView,
    StyleSheet,
    Text,
    NativeModules
} from 'react-native';
//import SplashScreen from 'react-native-splash-screen';
const {WithingsLink} = NativeModules;

const App = () => {

  /**
  useEffect(()=>{
      SplashScreen.hide();
  });
  */

  const webviewRef = useRef(null);

  WithingsLink.sayHello()
    .then(res => console.log(`Got ${res}`))
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
    </>
  )
};

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1
    },
});

export default App

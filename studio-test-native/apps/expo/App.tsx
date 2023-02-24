import {WebView} from 'react-native-webview'
import {useRef, useState} from 'react'
import {
  SafeAreaView,
  StyleSheet,
} from 'react-native'

const App = () => {

  const [currentUrl, setCurrentUrl]=useState('')

  const webviewRef = useRef(null)

  return (
    <>
      <SafeAreaView style={styles.flexContainer} >
        <WebView
          startInLoadingState={true}
          useWebKit={true}
          allowsBackForwardNavigationGestures
          mediaPlaybackRequiresUserAction={true}
          source={{uri: 'https://fumoir.my-alfred.io'}}
          ref={webviewRef}
          onNavigationStateChange={({url}) => setCurrentUrl(url)}
        />
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
})

export default App

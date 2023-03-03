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
      <WebView
        startInLoadingState={true}
        allowsBackForwardNavigationGestures
        mediaPlaybackRequiresUserAction={true}
        source={{uri: 'https://fumoir.my-alfred.io'}}
        ref={webviewRef}
        onNavigationStateChange={({url}) => setCurrentUrl(url)}
      />
    </>
  )
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
})

export default App

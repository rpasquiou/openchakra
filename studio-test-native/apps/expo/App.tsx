import {WebView} from 'react-native-webview'
import {useRef, useState} from 'react'

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

export default App

import React, {useEffect, useState, useRef} from 'react'
import {SafeAreaProvider, SafeAreaView, initialWindowMetrics} from 'react-native-safe-area-context'
import {WebView,WebViewNavigation} from 'react-native-webview'
import {StatusBar} from 'expo-status-bar'
import KeyboardAvoidingView from './components/KeyboardAvoidingView'
import NotifContainer from './modules/notifications/NotifContainer'
import { BackHandler } from 'react-native'

// Dekuple specific
import Spinner from './components/Spinner/Spinner'
import {Text, TouchableHighlight, NativeModules, View, Platform} from 'react-native'
const {WithingsLink} = NativeModules


const BASE_URL_TO_POINT = 'https://ma-tension.com'

const App = () => {
  const [currentUrl, setCurrentUrl] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const webViewRef = useRef<WebView | null>(null);
  const onContentProcessDidTerminate = () => webviewRef.current?.reload()
  // Dekuple specific
  const [displaySetup, setDisplaySetup]=useState(false)
  const [shouldAskPermissions, setShouldAskPermissions]=useState(true)

  const handleBackPress = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      return true
    }
    return false
  }

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [])

  const onShouldStartLoadWithRequest = (event: WebViewNavigation) => {
    return true
  };


  // Display permissions dialogs once when user is logged
  useEffect(() => {
    if (currentUser && shouldAskPermissions) {
      console.log(`Calling askOwnPermission()`)
      if (Platform.OS === 'android') {
        WithingsLink?.askOwnPermissions()
      }
      setShouldAskPermissions(false)
    }
  }, [currentUser])

  useEffect(() => {
    setDisplaySetup(/setup-appareil/.test(currentUrl) && currentUser?.access_token && currentUser?.csrf_token)
  }, [currentUrl, currentUser])

  const accessToken=currentUser?.access_token
  const csrfToken=currentUser?.csrf_token

  const DekupleSpinner = () => <Spinner color={'#172D4D'}/>

  const handleEvent = event => {
    const data=event?.nativeEvent?.data
    const user=data ? JSON.parse(data) : null
    setCurrentUser(user)
  }
  
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>   
      <NotifContainer user={currentUser} allOnStart>
      <StatusBar style="dark" />
      <SafeAreaView 
        style={{flex: 1,}} 
        edges={['top', 'left', 'right']}
      >
        <KeyboardAvoidingView>
          <WebView
            startInLoadingState={true}
            allowsBackForwardNavigationGestures
            javaScriptEnabled={true}
            domStorageEnabled={true}
            mediaPlaybackRequiresUserAction={true}
            source={{ uri: BASE_URL_TO_POINT }}
            sharedCookiesEnabled={true}
            onContentProcessDidTerminate={onContentProcessDidTerminate}
            onNavigationStateChange={({url}) => setCurrentUrl(url)}
            ref={(ref) => (webViewRef.current = ref)}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            renderLoading={DekupleSpinner}
            geolocationEnabled={true}
            onMessage={handleEvent}
          />
          { displaySetup &&
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
        </KeyboardAvoidingView>
        </SafeAreaView>
      </NotifContainer>
    </SafeAreaProvider>
  )
}

export default App;

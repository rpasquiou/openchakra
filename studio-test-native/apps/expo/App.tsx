<<<<<<< HEAD
import {WebView} from 'react-native-webview'
import React, {useRef, useState, useEffect} from 'react'
import {
  Text,
  TouchableHighlight,
  NativeModules,
  View,
} from 'react-native'
// import SplashScreen from 'react-native-splash-screen';
||||||| e45293b32
import {WebView} from 'react-native-webview';
import React, { useRef, useState, useEffect } from 'react'
import {
    SafeAreaView,
    StyleSheet,
    Text,
    Button,
    TouchableHighlight,
    NativeModules,
    View
} from 'react-native';
//import SplashScreen from 'react-native-splash-screen';
=======
import {WebView} from 'react-native-webview'
import {useEffect, useState} from 'react'
>>>>>>> solito-fumoir
import axios from 'axios'
<<<<<<< HEAD
import moment from 'moment'
import { usePrevious } from './hooks/usePrevious.hook'
const {WithingsLink, RNLinkModule} = NativeModules

const BASE_URL_TO_POINT = 'https://ma-tension.com/'
||||||| e45293b32
const {WithingsLink} = NativeModules;
=======
import {
  NativeModules,
} from 'react-native'
>>>>>>> solito-fumoir

const BASE_URL_TO_POINT = 'https://fumoir.my-alfred.io'
const {RNLinkModule} = NativeModules

<<<<<<< HEAD
  const [currentUrl, setCurrentUrl]=useState('')
  const [displaySetup, setDisplaySetup]=useState(false)
  const [currentUser, setCurrentUser]=useState(null)
  const [shouldAskPermissions, setShouldAskPermissions]=useState(true)
||||||| e45293b32
  const [currentUrl, setCurrentUrl]=useState('')
  const [displaySetup, setDisplaySetup]=useState(false)
  const [currentUser, setCurrentUser]=useState(null)
=======
// TODO: subscribe on login & unsubscribe on logout using previous hook value : https://blog.logrocket.com/accessing-previous-props-state-react-hooks/
>>>>>>> solito-fumoir

<<<<<<< HEAD
  const webviewRef = useRef(null)

  // Display permissions dialogs once when user is logged
  useEffect(() => {
    if (currentUser && shouldAskPermissions) {
      console.log(`Calling askOwnPermission()`)
      WithingsLink.askOwnPermissions()
      setShouldAskPermissions(false)
    }
  }, [currentUser])

  useEffect(() => {
    console.log(`Logged:${!!currentUser} ${moment()}`)
    setDisplaySetup(/setup-appareil/.test(currentUrl) && !!currentUser)
  }, [currentUrl, currentUser])
||||||| e45293b32
  const webviewRef = useRef(null);

  useEffect(()=> {
    console.log(`WebView URL is ${currentUrl}`)
    setDisplaySetup(/setup-appareil/.test(currentUrl))
  }, [currentUrl])
=======
const App = () => {
>>>>>>> solito-fumoir

  const [currentUrl, setCurrentUrl]=useState('')

<<<<<<< HEAD
  useEffect(() => {
    axios.get(`${BASE_URL_TO_POINT}/myAlfred/api/studio/current-user`)
      .then(({data}) => {
        const firstLogin=!currentUser
        setCurrentUser(data)
        axios.get(`${BASE_URL_TO_POINT}/myAlfred/api/studio/user/${data._id}?fields=devices`)
          .then(({data}) => {
            const device=data[0]?.devices[0]
            if (firstLogin && device) {
              startSync(device)
            }
          })
      })
      .catch(err => {
        if (err.response?.status==401) {
          setCurrentUser(null)
        }
      })
||||||| e45293b32
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
      })
    setDisplaySetup(/setup-appareil/.test(currentUrl))
=======
  useEffect(() => {
    if (currentUrl !== BASE_URL_TO_POINT) {
      axios.get(`${BASE_URL_TO_POINT}/myAlfred/api/studio/current-user`)
        .then(({data}) => {
          // send userId to app in order to subscribe to topic (Firebase notifications)
          RNLinkModule.isUserHasSubscribed(data.id)
        })
        .catch(err => {
          if (err.response?.status==401) {
          }
        })
    }
>>>>>>> solito-fumoir
  }, [currentUrl])

<<<<<<< HEAD
  useEffect(() => {
    if (currentUser) {
      RNLinkModule.isUserHasSubscribed(currentUser?.id)
    } else {
      RNLinkModule.unsubscribeUser()
    }
  }, [currentUser])

  const accessToken=currentUser?.access_token
  const csrfToken=currentUser?.csrf_token

||||||| e45293b32
  const accessToken=currentUser?.access_token
  const csrfToken=currentUser?.csrf_token

=======
>>>>>>> solito-fumoir
  return (
    <>
<<<<<<< HEAD
      <WebView
        startInLoadingState={true}
        injectedJavaScript={saveLoginScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={event => {}}
        allowsBackForwardNavigationGestures
        mediaPlaybackRequiresUserAction={true}
        source={{uri: BASE_URL_TO_POINT}}
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
||||||| e45293b32
      <SafeAreaView style={styles.flexContainer}  >
        <WebView
          startInLoadingState={true}
          allowsBackForwardNavigationGestures
          mediaPlaybackRequiresUserAction={true}
          source={{ uri: "https://dekuple.my-alfred.io" }}
          ref={webviewRef}
          onNavigationStateChange={({url}) => setCurrentUrl(url)}
        />
        </SafeAreaView>
        { displaySetup && currentUser &&
          <>
          <View style={{alignItems:'center', backgroundColor: '#f5f6fa'}}>
            <TouchableHighlight style={{margin: '2%', padding:'4%', backgroundColor:'#172D4D', borderRadius:30}} >
            <Text
              style={{color: '#ffffff'}}
              onPress={()=>WithingsLink.openInstall(accessToken, csrfToken)}
            >Ajouter un appareil</Text>
            </TouchableHighlight>
            <TouchableHighlight style={{margin: '2%', padding:'4%', backgroundColor:'#43ABB1', borderRadius:30}} >
            <Text
              style={{color: '#ffffff'}}
              onPress={()=>WithingsLink.openSettings(accessToken, csrfToken)}
            >Modifier un appareil</Text>
            </TouchableHighlight>
          </View>
          </>
        }
=======
      <WebView
        startInLoadingState={true}
        allowsBackForwardNavigationGestures
        injectedJavaScript={saveLoginScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={event => {}}
        mediaPlaybackRequiresUserAction={true}
        source={{uri: BASE_URL_TO_POINT}}
        onNavigationStateChange={({url}) => setCurrentUrl(url)}
      />
>>>>>>> solito-fumoir
    </>
  )
<<<<<<< HEAD
}
||||||| e45293b32
};
=======
}


const saveLoginScript = `
  
  const currentUrl = window.location.href
  const origUrl = window.location.origin + "/"  // if login is on the root
  const testPattern = /login|connexion/

  const handleLoginParam = () => {

    const localStorageId = 'loginitems'

    const username = document.querySelector('input[type="email"]')
    const password = document.querySelector('input[type="password"]')
    password.setAttribute('autocomplete', 'current-password')

    const isLocalStorage = localStorage.getItem(localStorageId);
    
    if (isLocalStorage) {
      const data = JSON.parse(isLocalStorage)
      username.value = data?.email

      setTimeout(() => {
        password.value = data?.password
      }, 500)

    }

    const updateToLocalStorage = (e) => {

      const name = e.currentTarget.type === 'text' ? 'password' : e.currentTarget.type

      const item = {[name]: e.currentTarget.value}
      var logItems = localStorage.getItem(localStorageId);

      if (!logItems) {
        localStorage.setItem(localStorageId, JSON.stringify(item))
      } else {
        const oldConfig = JSON.parse(logItems)
        localStorage.setItem(localStorageId, JSON.stringify({...oldConfig, ...item}))
      }
    }

    username.addEventListener('change', updateToLocalStorage)
    password.addEventListener('change', updateToLocalStorage)
  }
  
  if (testPattern.test(currentUrl) || currentUrl === origUrl) {
    handleLoginParam()
  } 

>>>>>>> solito-fumoir

<<<<<<< HEAD
const saveLoginScript = `
  
  const currentUrl = window.location.href
  const origUrl = window.location.origin + "/"  // if login is on the root
  const testPattern = /login|connexion/
  const handleLoginParam = () => {
    const localStorageId = 'loginitems'
    const username = document.querySelector('input[type="email"]')
    const password = document.querySelector('input[type="password"]')
    password.setAttribute('autocomplete', 'current-password')
    const isLocalStorage = localStorage.getItem(localStorageId);
    
    if (isLocalStorage) {
      const data = JSON.parse(isLocalStorage)
      username.value = data?.email
      setTimeout(() => {
        password.value = data?.password
      }, 500)
    }
    const updateToLocalStorage = (e) => {
      const name = e.currentTarget.type === 'text' ? 'password' : e.currentTarget.type
      const item = {[name]: e.currentTarget.value}
      var logItems = localStorage.getItem(localStorageId);
      if (!logItems) {
        localStorage.setItem(localStorageId, JSON.stringify(item))
      } else {
        const oldConfig = JSON.parse(logItems)
        localStorage.setItem(localStorageId, JSON.stringify({...oldConfig, ...item}))
      }
    }
    username.addEventListener('change', updateToLocalStorage)
    password.addEventListener('change', updateToLocalStorage)
  }
  
  if (testPattern.test(currentUrl) || currentUrl === origUrl) {
    handleLoginParam()
  } 
`
||||||| e45293b32
const styles = StyleSheet.create({
    flexContainer: {
        flex: 1
    },
});
=======
`
>>>>>>> solito-fumoir

export default App

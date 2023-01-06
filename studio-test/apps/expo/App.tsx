import 'expo-dev-client'
import React from 'react'
import { NativeNavigation } from 'app/navigation/native'
import { Provider } from 'app/provider'
import { useFonts } from 'expo-font'

export default function App() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    RadikalBold: require('../../packages/app/assets/fonts/Radikal-Bold.ttf'),
    Tomarik: require('../../packages/app/assets/fonts/Tomarik-DisplayLineShadow.ttf'),
  })

  if (!loaded) {
    return null
  }

  return (
    <Provider>
      <NativeNavigation />
    </Provider>
  )
}

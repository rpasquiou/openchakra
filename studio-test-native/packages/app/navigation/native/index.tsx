import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { HomeScreen } from 'app/features/home/screen'
import { UserDetailScreen } from 'app/features/user/detail-screen'
import {Connexion} from 'app/features/connexion'
import {Testcomponents} from 'app/features/testcomponents'

const Stack = createNativeStackNavigator<{
  home: undefined
  connexion: undefined
  testcomponents: undefined
  'user-detail': {
    id: string
  }
}>()

export function NativeNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Stack.Screen
        name="user-detail"
        component={UserDetailScreen}
        options={{
          title: 'User',
        }}
      />
      <Stack.Screen
        name="connexion"
        component={Connexion}
        options={{
          title: 'Connexion',
        }}
      />
      <Stack.Screen
        name="testcomponents"
        component={Testcomponents}
        options={{
          title: 'Test components',
        }}
      />
    </Stack.Navigator>
  )
}

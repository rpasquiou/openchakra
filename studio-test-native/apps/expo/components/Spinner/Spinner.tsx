import React, {memo} from 'react'
import { ActivityIndicator, View } from 'react-native';

const Spinner = ({color = 'indigo'}) => (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      left: 0,
      backgroundColor: 'white',
      height: '100%',
      width: '100%'
    }}>
      <ActivityIndicator size="large" color={color} />
    </View>
);



export default memo(Spinner)
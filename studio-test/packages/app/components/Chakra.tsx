import {PropsWithChildren, useState} from 'react'
import { styled } from '@tamagui/core'
import {Stack, XStack, Input, Button, Text, InputProps, useTheme} from 'tamagui'
import {TextInput as NativeInput} from 'react-native'
import { Platform } from 'react-native'
// import DateTimePicker from '@react-native-community/datetimepicker';



const mapProps = props => {
  
}

const responsiveProps = props => {
  /**
   * On Chakra, responsive values are detailed on a property fontSize={{base: '10px', sm: '12px'}}
   * In Tamagui, all properties are defined by a breakpoint sm={{fontSize: '12px'}}
   */
  // console.log(props)
  // const prepareForTamagui = props.reduce
}

export const Box = ({id, backgroundColor, reload, children, ...props}: {
  [prop: string] : any
 }) => {

  const theme = useTheme()
  const workOnResponsive = responsiveProps(props)
  const bgColor = theme[backgroundColor] || backgroundColor

  return (
    <XStack
      nativeID={id}
      data-reload={reload}
      backgroundColor={bgColor}
      {...props}
    >
      {children}
    </XStack>
  )
}

export const Flex = Box

interface extendedinput extends InputProps{
  inputMode?: string
}


export const WappizyInput = (
  {
    type, 
    focusBorderColor, 
    ...props
  }: 
  {
    id?: string
    placeholder?: string
    type?: string, 
    focusBorderColor?: string
  }) => {  //  :InputProps or extendedinput doesn't work 
    
  type keyboardTypes = 'email-address' | 'numeric' | 'phone-pad' | 'default'; 
  
  const inputType = (type): keyboardTypes => {
    if (type) {
      switch (type) {

        case 'email':
          return 'email-address'
        case 'number':
          return 'numeric'
        case 'tel':
          return 'phone-pad'
        default:
          break
        }            
      }
      return 'default'
  }

  // if (type === 'date') {
  //   return <InputDateTime />
  // }

  const keyboardType = inputType(type)
  const isPassword = type === 'password'

  return (<Input
    // inputMode={type || 'text'} // Available in RN 0.71 
    keyboardType={keyboardType} 
    {...isPassword && {secureTextEntry: true}}
    {...focusBorderColor && {focusStyle: {
      borderColor: focusBorderColor
    }}}
    {
      ...props
    }  
    /> 
  )
}


export const IconButton = ({icon, ...props}) => {
  return (
    <Button
      {...props}
      icon={icon}
    />
  )
}

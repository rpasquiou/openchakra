import {PropsWithChildren, ReactNode, useState, useEffect} from 'react'
import { SizeTokens, styled } from '@tamagui/core'
import Checkbox from 'expo-checkbox';
import {Avatar, Stack, XStack, Input, Button, Text, InputProps, useTheme, Switch, Label} from 'tamagui'
import {View, StyleSheet, ImageBackground} from 'react-native'
import {TextInput as NativeInput} from 'react-native'
import { Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native'

export function isJsonString(str: string) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}



/* TODO
  Responsive
  => Génération à la volée à tester à la suite
  Select
  Voir pour changer les icones
  Input Radio (histoire d'enum)
  IconButton (voir l'icone après)
  UploadFile
*/ 


const WithResponsive = ({...props}) => {
  /** HOC to consider backgroundColor, color, height...
   * 1. Prendre en compte les propriétés qui ont du JSON en value
   
   * 2. passer en revue chaque breakpoint pris en compte (
   *   base => xs
   *   sm   => $gtXs 
   *   md   => $gtSm
   *  ... 
   * 3. retourner dans une View toutes les props exceptées celles avec du JSON en value
   * 
   * On Chakra, responsive values are detailed on a property fontSize={{base: '10px', sm: '12px'}}
   * In Tamagui, all properties are defined by a breakpoint sm={{fontSize: '12px'}}
   * console.log(props)
   * const prepareForTamagui = props.reduce
   */

  let responsiveProps = {}
  let otherProps = {}

  const jsonProps = Object.entries(props).forEach(([key, val]) => {
    if (isJsonString(val)) {
      responsiveProps[key] = val
    } else {
      otherProps[key] = val
    }
  })
    

}

export const Box = ({
  id, 
  backgroundColor, 
  backgroundSize,
  backgroundImage, 
  reload, 
  children, 
  height,
  ...props
}: {
  [prop: string] : any
 }) => {

  const theme = useTheme()
  
  const bgColor = theme[backgroundColor] || backgroundColor

  return (backgroundImage ? 
    <ImageBackground 
      source={{uri: backgroundImage}} 
      resizeMode={backgroundSize}
      // style={{
      //   flex: 1,
      //   minWidth: 100,
      //   height
      // }}
    >
      <XStack
      nativeID={id}
      data-reload={reload}
      backgroundColor={bgColor}
      {...height && {height}}
      {...props}
      >
      {children}
    </XStack>
    </ImageBackground>
    : <XStack 
    nativeID={id}
    data-reload={reload}
    backgroundColor={bgColor}
    {...height && {height}}
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

/* type modedateinput = 'date' | 'time'

const InputDateTime = () => {

  const [date, setDate] = useState(new Date(1598051730000));
  const [mode, setMode] = useState<modedateinput>('date');
  const [show, setShow] = useState(false);
  const [platform, setPlatform] = useState('')

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
  };
  
  const onWebChange = (event) => {

    console.log('Le changement, c maintenant', event)

    // const currentDate = selectedDate;
    // setShow(false);
    // setDate(currentDate);
  };

  const showMode = (currentMode) => {
    if (platform === 'android') {
      setShow(false);
      // for iOS, add a button that closes the picker
    }
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
    setShow(true)
  };
  
  const showTimepicker = () => {
    showMode('time');
    setShow(true)
  };

  useEffect(() => {
    if (!platform) {
      setPlatform(Platform.OS)
    }
  }, [platform])

  

  return (
    <Stack>
    
    <Button onPress={showDatepicker} >Show date picker!</Button>
    <Button onPress={showTimepicker} >Show time picker!</Button>
  
    {date && <Text>selected: {date && date.toLocaleString()}</Text>}
    
    {show && platform && platform !== 'web' ? (
    <DateTimePicker 
      value={date}
      mode={mode}
      is24Hour={true}
      onChange={onChange}
    />) : null}
    {show && platform && platform === 'web' ? (
    <input
      type={'date'}
      value={date.toLocaleString()}
      onChange={onWebChange}
    />) : null}
    </Stack>
  )
} */

export const WappizyCheckbox = (
  {
    id,
    isChecked = false, 
    colorScheme = '#4630EB', 
    onChange, 
    children, 
    ...props
  }
  : PropsWithChildren<{
    id: string
    isChecked?: boolean
    colorScheme?: string
    onChange?: Function
    children: ReactNode
  }>) => {
  
  const [checkme, setCheckme] = useState(isChecked);

  return (
    <View style={styles.section}>
      <Label style={styles.paragraph}>
        <Checkbox
          style={styles.checkbox}
          value={checkme}
          onValueChange={setCheckme} // Internal state or handled via hoc ?
          // onValueChange={onChange}
          color={checkme ? colorScheme : undefined}
          {...props}
        />
        {children}
        </Label>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 32,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paragraph: {
    fontSize: 15,
  },
  checkbox: {
    margin: 8,
  },
});

export const WappizyAvatar = ({
  src, 
  size='$6',
  backgroundColor = "white", 
  circular=true,
  ...props
}: {
  id?: string
  src: string
  size?: SizeTokens
  backgroundColor?: string
  circular?: boolean
}) => {

  return (
    <Avatar circular={circular} size={size} {...props}>
      <Avatar.Image src={src} />
      <Avatar.Fallback bc="red" />
    </Avatar>
  )
}


export const WappizySwitch = ({...props}) => {

  return (
  <Switch {...props}>
    <Switch.Thumb animation="bouncy" />
  </Switch>
  )
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

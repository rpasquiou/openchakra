import {useState} from 'react'
import {XStack, Input, Button, Text} from 'tamagui'
import {TextInput as NativeInput} from 'react-native'
import { Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker';


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

export const Box = ({id, reload, children, ...props}: {
  [prop: string] : any
 }) => {

  const workOnResponsive = responsiveProps(props)

  return (
    <XStack
      nativeID={id}
      data-reload={reload}
      {...props}
    >
      {children}
    </XStack>
  )
}

export const Flex = Box


const InputDateTime = () => {

  const [date, setDate] = useState(new Date(1598051730000));
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {

    console.log(event, selectedDate)

    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
  };

  const showMode = (currentMode) => {
    if (Platform.OS === 'android') {
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

  

  return (
    <>
    <Button onPress={showDatepicker} >Show date picker!</Button>
    <Button onPress={showTimepicker} >Show time picker!</Button>
    <Text>selected: {date.toLocaleString()}</Text>
      {show && Platform.OS !== 'web' && (
    <DateTimePicker 
      value={date}
      mode={mode}
      is24Hour={true}
      onChange={onChange}
    />)}
      {show && Platform.OS === 'web' && (
    <input 
      type={mode}
      value={date.toLocaleString()}
      mode={mode}
      is24Hour={true}
      onChange={onChange}
    />)}
    </>
  )
}


export const WappizyInput = ({type = 'text', focusBorderColor, ...props}) => {

  
  const inputType = (type) => {
    if (type) {
      switch (type) {
        case 'password':
          return {'secureTextEntry': true}
        case 'email':
          return {keyboardType: 'email-address'}
        case 'number':
          return {keyboardType: 'numeric'}
        case 'tel':
          return {keyboardType: 'phone-pad'}
        default:
        break;
      }            
    }
    return null
  }

  if (type === 'date') {
    return <InputDateTime />
  }

  const keyboardType = inputType(type)

  return (
    Platform.OS !== 'web' 
    ? <Input
      {...{...props, ...keyboardType}}
      inputMode={type}
      focusStyle={focusBorderColor && {
        borderColor: focusBorderColor,
      }}
      
      /> 
      : <input 
      type={type} 
      {...{...props, ...inputType}}
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

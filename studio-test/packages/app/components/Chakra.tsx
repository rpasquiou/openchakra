import React from 'react'
import { View, Text } from "dripsy"


const chakraToDripsy = (tagName: string, propsToDerive: {[prop:string]: string}) => {
  /**
   * 'Got multiple css properties, events... (flexDirection, onClick, onBlur, data-x)
   * We return an array of css properties
   * and an array of props to spread
   * 
   */
  const sxStyles = {}
  const restToSpread = {}

  const possibleChakraProps = {
    display: ['display'], 
    flexDirection: ['flexDirection'],
    alignItems: ['alignItems'],
    justifyContent: ['justifyContent'],
    spacing: ['gap'],
    background: ['background'],
    backgroundColor: ['backgroundColor']
  }

  for (const prop in propsToDerive) {
    for (const styleProp in possibleChakraProps) {
      possibleChakraProps[styleProp].forEach(element => {
        if (element === prop) {
          sxStyles[element] = propsToDerive[prop]
        } else {
          restToSpread[prop] = propsToDerive[prop]
        }
      })
    }
  }

  return {sxStyles, restToSpread}

}

export const Box = ({id, reload, children, ...props}: {
    id?: string
    reload?:boolean
    props?: any
    children?: any
   }) => {

    const {sxStyles, restToSpread} = chakraToDripsy('div', props)
  
    return (
      <View 
        nativeID={id} 
        data-reload={reload} 
        sx={sxStyles}
        {...restToSpread}
      >
        {children}
      </View>
    )
  }

  export const Flex = ({children, ...props}) => {
    return (
      <Box flexDirection="row" {...props}>
        {children}
      </Box>
    )
  }
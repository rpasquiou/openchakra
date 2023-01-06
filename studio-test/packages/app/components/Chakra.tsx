import { XStack, ZStack } from "tamagui"

const mapProps = (props) => {
  
}

const responsiveProps = (props) => {
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



import { View } from "dripsy"

const Div = ({id, reload, children, sx, ...props}: {
  id: string
  reload?:boolean
  sx?: {[prop:string]: string}
  props?: any
  children?: any
 }) => {

  /* Filter css props */

  const chakraToDripsy = propsToDerive => {

  }

  return (
    <View 
      nativeID={id} 
      reload={reload} 
      sx={sx}
      {...props}
    >
      {children}
    </View>
  )
}

export default Div
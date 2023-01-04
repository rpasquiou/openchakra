import { View } from "dripsy"

const Box = ({id, reload, children, sx, ...props}: {
  id?: string
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
      {...props}
    >
      {children}
    </View>
  )
}

export default Box
import Div from './Div'

const Flex = ({id, reload, children, ...props}) => {
  return (
    <Div id={id} sx={{display: 'flex'}}>
      {children}
    </Div>
  )
}

export default Flex
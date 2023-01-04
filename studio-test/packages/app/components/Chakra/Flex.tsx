import Box from './Box'

const Flex = ({id, reload, children, ...props}) => {
  return (
    <Box id={id} display='flex'>
      {children}
    </Box>
  )
}

export default Flex
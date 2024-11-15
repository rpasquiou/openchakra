import React from 'react'
import { useDropComponent } from '~hooks/useDropComponent'
import { useInteractive } from '~hooks/useInteractive'
import { Box} from '@chakra-ui/react'
import Slider from '~dependencies/custom-components/Slider'

const SliderPreview: React.FC<IPreviewProps> = ({ component }) => {

  const { drop, isOver } = useDropComponent(component.id)
  const { props, ref } = useInteractive(component, true)

  if (isOver) {
    props.bg = 'teal.50'
  }

  // Preview middle value
  // const value=(props.min+props.max)/2

  return (
    <Box pos="relative" ref={drop(ref)} {...props}>
      <Slider ref={drop(ref)} {...props} value/>
    </Box>
  )
}

export default SliderPreview

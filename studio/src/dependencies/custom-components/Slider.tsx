/*TODO: 
  - Use chakraStyles instead
  - Set border, borderRadius, m and p on ChakraSlider instead of SliderTrack. If done, fix overflow of SliderTrack and SliderThumb
*/

import React from "react"
import {
  Slider as ChakraSlider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb
} from "@chakra-ui/react"

const Slider = React.forwardRef((props, ref) => {
  const {
    backgroundColor,
    color,
    border,
    height,
    width,
    p,
    m,
    borderRadius,
    ...rest
  } = props
  return (
    <ChakraSlider
      ref={ref}
      height={height}
      width={width}
      {...rest}
    >
      <SliderTrack
        bg={backgroundColor}
        border={border}
        borderRadius={borderRadius.base}
        height={height}
        width={width}
        p={p}
        m={m}
        
      >
        <SliderFilledTrack bg={color} />
      </SliderTrack>
      <SliderThumb
        bg={color}
        p={p}
        m={m}
      />
    </ChakraSlider>
  )
})

export default Slider

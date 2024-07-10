/*TODO: 
  - Use chakraStyles instead
  - Set border, borderRadius, m and p on ChakraSlider instead of SliderTrack. If done, fix overflow of SliderTrack and SliderThumb
*/

import React, { useEffect, useState } from "react";
import {
  Slider as ChakraSlider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip
} from "@chakra-ui/react";

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
    min = 0,
    max = 100,
    initialSliderValue = 50,
    ...rest
  } = props;

  console.log(props)

  const [sliderValue, setSliderValue] = useState(initialSliderValue);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setSliderValue(initialSliderValue);
  }, [initialSliderValue]);

  return (
    <ChakraSlider
      ref={ref}
      height={height}
      width={width}
      border={border}
      p={p}
      m={m}
      borderRadius={borderRadius}
      {...rest}
      onChange={(v) => setSliderValue(v)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <SliderTrack
        bg={backgroundColor}
        height="100%"
      >
        <SliderFilledTrack bg={color} />
      </SliderTrack>
      <Tooltip
        hasArrow
        bg={color}
        color="white"
        placement="top"
        isOpen={showTooltip}
        border={"1px solid"}
        label={`${sliderValue}%`}
      >
        <SliderThumb
          bg={color}
        />
      </Tooltip>
    </ChakraSlider>
  );
});

export default Slider;

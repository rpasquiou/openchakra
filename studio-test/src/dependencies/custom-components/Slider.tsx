/*TODO: 
  - Use chakraStyles instead
  - Set border, borderRadius, m and p on ChakraSlider instead of SliderTrack. If done, fix overflow of SliderTrack and SliderThumb
*/
import React, { useEffect, useState, useCallback } from "react";
import {
  Slider as ChakraSlider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useStyleConfig
} from "@chakra-ui/react";

const Slider = React.forwardRef((props, ref) => {
  const {
    backgroundColor,
    color,
    border,
    height,
    width,
    ml,
    mr,
    mt,
    mb,
    m,
    pl,
    pr,
    pt,
    pb,
    p,
    borderRadius,
    min = 0,
    max = 100,
    initialSliderValue = 50,
    ...rest
  } = props

  const [sliderValue, setSliderValue] = useState(initialSliderValue);

  useEffect(() => {
    setSliderValue(initialSliderValue);
  }, [initialSliderValue]);

  const handleSliderChange = useCallback((value) => {
    setSliderValue(value);
    console.log(value, 'Value updated');
  }, []);

  const chakraStyles = useStyleConfig("Slider", {
    baseStyle: {
      container: {
        height: height?.base,
        width: width?.base,
        border: border?.base ? `${border.base}px solid` : undefined,
        borderRadius: borderRadius?.base,
        m: m?.base,
        ml: ml?.base,
        mr: mr?.base,
        mt: mt?.base,
        mb: mb?.base,
        p: p?.base,
        pl: pl?.base,
        pr: pr?.base,
        pt: pt?.base,
        pb: pb?.base,
      }
    }
  });

  return (
    <ChakraSlider
      ref={ref}
      min={min}
      max={max}
      value={sliderValue}
      onChange={(v) => handleSliderChange(v)}
      __css={chakraStyles.container}
      {...rest}
    >
      <SliderTrack
        bg={backgroundColor}
        height="100%"
        overflow="hidden"
        borderRadius={borderRadius?.base}
      >
        <SliderFilledTrack bg={color} />
      </SliderTrack>
      <SliderThumb
        bg={color}
        borderRadius="50%"
        overflow="hidden"
      />
    </ChakraSlider>
  );
});

export default Slider;

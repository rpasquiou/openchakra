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
  } = props

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

  const chakraOnChange = value => {
    console.log('changed', value)
    props.onChange && props.onChange({target: {value: value}})
  }

  return (
    <>
    { /* TODO ChakraSlider updates value only if this input range is here. Why ? */ }
    <input type='range' {...props} onChange={undefined} ref={ref} style={{display:'none'}}/>
    <ChakraSlider
      ref={ref}
      {...props}
      onChange={chakraOnChange}
      __css={chakraStyles.container}
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
    </>
  );
});

export default Slider;

import React, { useState, useEffect } from "react";
import lodash from 'lodash'
import { Box, Icon, Stack, Flex } from '@chakra-ui/react'
import * as icons from 'lucide-react'


const Slider = React.forwardRef((props, ref) => {

  return (
    <input type={'range'} {...props} orientation={'ver'}/>
  )
  }
);

Slider.displayName = "Slider";

export default Slider;

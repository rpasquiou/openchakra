import React, { useState, useEffect } from "react";
import lodash from 'lodash'
import { Box, Icon, Stack, Flex } from '@chakra-ui/react'
import * as icons from 'lucide-react'


const Slider = React.forwardRef((props, ref) => {
  console.log('***************************************')
  console.log(props)
  console.log('***************************************')
  return (
    <input type={'range'} {...props} orientation={'ver'} color={'#999'}/>
  )
  }
);

Slider.displayName = "Slider";

export default Slider;

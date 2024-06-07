import {
    DarkMode,
    Box,
    Heading,
    Text,
    Button,
    IconButton
  } from '@chakra-ui/react'
  import React from 'react'
  import { useSelector } from 'react-redux'
import { getRoles } from '~core/selectors/roles';
  import { getModels } from '~core/selectors/dataSources'
import { Edit2Icon } from 'lucide-react';

  const ListModels = () => {
    const models = useSelector(getModels)
    const roles = useSelector(getRoles)
    let enums = {
        FR:"fr",
        EN:"en",
        DE:"de"
    }

    console.log(models);
        return (
      <DarkMode>
        <Box
          overflowY="auto"
          overflowX="visible"
          boxShadow="xl"
          position="relative"
          display="grid"
          gridTemplateRows={'auto 1fr auto'}
          p={2}
          m={0}
          as="menu"
          bg="rgb(236, 236, 236)"
          w={'100%'}
          h={'100%'}>
          <Heading
            as='h2'
            color={'black'}
            size={'md'}
            mb={'2'}>
            Models
          </Heading>
          <Box
            overflowY="auto"
            overflowX="visible"
            boxShadow="xl"
            position="relative"
            display="grid"
            gridTemplateRows={'auto 1fr auto'}
            p={2}
            m={0}
            as="menu"
            bg="rgb(236, 236, 236)"
            w={'100%'}
            h={'100%'}
            border='1px'
            borderRadius={"5px"}
            borderColor={'black'}>
          {models && Object.keys(models).map((key) => (
              <Box
                fontSize={'11px'}
                boxShadow="xl"
                position="relative"
                display="flex"
                gridTemplateRows={'auto 1fr auto'}
                p={2}
                m={0}
                as="menu"
                bg="rgb(236, 236, 236)"
                color={'black'}
                w={'100%'}
                h={'100%'}
                justifyContent={'center'}
                alignItems={'center'}
                >
                <Button
                  key={key}
                  fontSize={'12px'}>
                    {key}
                </Button>
              </Box>
            ))}
          </Box>
          <Heading
            as='h2'
            color={'black'}
            size={'md'}
            mb={'2'}>
            Enums
          </Heading>
          <Box
            overflowY="auto"
            overflowX="visible"
            boxShadow="xl"
            position="relative"
            display="grid"
            gridTemplateRows={'auto 1fr auto'}
            p={2}
            m={0}
            as="menu"
            bg="rgb(236, 236, 236)"
            w={'100%'}
            h={'100%'}
            border='1px'
            borderRadius={"5px"}
            borderColor={'black'}>
          {enums && Object.keys(enums).map((key) => (
              <Box
                fontSize={'11px'}
                boxShadow="xl"
                position="relative"
                display="flex"
                gridTemplateRows={'auto 1fr auto'}
                p={2}
                m={0}
                as="menu"
                bg="rgb(236, 236, 236)"
                color={'black'}
                w={'100%'}
                h={'100%'}
                justifyContent={'center'}
                alignItems={'center'}
                >
                <Button
                  key={key}
                  fontSize={'12px'}>
                    {key}
                </Button>
              </Box>
            ))}
          </Box>
        </Box>
      </DarkMode>
    );
  };
  
  export default ListModels;
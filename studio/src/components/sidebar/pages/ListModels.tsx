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
import usePropsSelector from '~hooks/usePropsSelector';

  const ListModels = () => {
    const models = useSelector(getModels)
    let attr = {}
    let unsortedEnums = {}
    
    const getAttributes = (m:string) => {
      const model = models[m]
      return Object.keys(model.attributes).filter(attr => !attr.includes('.'));
    }

    Object.keys(models).forEach((m) => {
      const attributes = getAttributes(m);
      attr[m] = attributes;
    
      attributes.forEach((attribute) => {
        const attributeProps = models[m].attributes[attribute];
    
        Object.keys(attributeProps).forEach((property) => {
          if (property === 'enumValues') {
            unsortedEnums[attribute] = attributeProps[property];
          }
        });
      });
    });
    const sortedEnumsKeys = Object.keys(unsortedEnums).sort();
    const enums: { [key: string]: any } = {};
    sortedEnumsKeys.forEach((key) => {
      enums[key] = unsortedEnums[key];
    })
    console.log(models['user'].attributes.role)
    console.log(enums)
    const modelEdit = usePropsSelector('modelEdit');
    const enumEdit = usePropsSelector('enumEdit');

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
          w={'100%'}
          h={'100%'}
          bg="rgb(236, 236, 236)">
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
            h={'40vh'}
            bg="rgb(236, 236, 236)"
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
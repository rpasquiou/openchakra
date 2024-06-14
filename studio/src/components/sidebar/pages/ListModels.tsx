import {
  DarkMode,
  Box,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Text,
  Flex
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { getModels } from '~core/selectors/dataSources'

const ListEnums = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEnum, setSelectedEnum] = useState({});
  const models = useSelector(getModels)
  let unsortedEnums = {}

  const getAttributes = (m: string) => {
    const model = models[m]
    return Object.keys(model.attributes).filter(attr => !attr.includes('.'));
  }

  Object.keys(models).forEach((m) => {
    const attributes = getAttributes(m);
    
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

  const handleEnumClick = (key) => {
    setSelectedEnum({ key, values: enums[key] });
    onOpen();
  }

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
              key={key}
              p={1}
              border='1px'
              borderRadius={"5px"}
              borderColor={'black'}
              cursor="pointer"
              onClick={() => handleEnumClick(key)}
              mb={2}>
              <Text fontSize={'12px'} color={'black'}>{key}</Text>
            </Box>
          ))}
        </Box>

        <Modal isOpen={isOpen} onClose={onClose} size="md">
          <ModalOverlay />
          <ModalContent background='#f4f4f4'>
            <ModalHeader>{selectedEnum.key}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedEnum.values && Object.keys(selectedEnum.values).map((valueKey) => (
                <Flex key={valueKey} p={1} background='#f4f4f4' border='1px' borderRadius={"5px"} borderColor={'black'} mb={1} justifyContent="space-between">
                  <Text fontSize={'12px'} fontWeight="bold" width="45%">{valueKey}</Text>
                  <Text fontSize={'12px'} width="45%" textAlign={'end'}>{selectedEnum.values[valueKey]}</Text>
                </Flex>
              ))}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" mr={3} onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </DarkMode>
  );
};

export default ListEnums;

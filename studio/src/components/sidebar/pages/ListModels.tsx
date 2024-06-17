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
  Flex,
  Input,
  IconButton,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { AddIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { getEnums } from '~core/selectors/enums';

const ListEnums = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEnum, setSelectedEnum] = useState({});
  const [newEnumKey, setNewEnumKey] = useState('');
  const [newEnumValue, setNewEnumValue] = useState('');
  const [newEnumLabel, setNewEnumLabel] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [editingLabel, setEditingLabel] = useState('');
  
  const enums = useSelector(getEnums)
  const handleEnumClick = (key) => {
    setSelectedEnum({ key, values: enums[key] });
    onOpen();
  }

  const handleAddEnum = () => {
    if (newEnumKey && newEnumValue) {
      setSelectedEnum((prevState) => ({
        ...prevState,
        values: {
          ...prevState.values,
          [newEnumKey]: { value: newEnumValue, label: newEnumLabel || '' },
        },
      }));
      setNewEnumKey('');
      setNewEnumValue('');
      setNewEnumLabel('');
    }
  };

  const handleEditEnum = (key) => {
    setEditingKey(key);
    setEditingValue(selectedEnum.values[key]);
  };

  const handleSaveEdit = () => {
    if (editingKey) {
      setSelectedEnum((prevState) => ({
        ...prevState,
        values: {
          ...prevState.values,
          [editingKey]: { value: editingValue, label: editingLabel || '' },
        },
      }));
      setEditingKey(null);
      setEditingValue('');
    }
  };

  const handleDeleteEnum = (key) => {
    setSelectedEnum((prevState) => {
      const newValues = { ...prevState.values };
      delete newValues[key];
      return { ...prevState, values: newValues };
    });
  };

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
                  {editingKey === valueKey ? (
                    <>
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        placeholder="Value"
                        width="30%"
                      />
                      <Input
                        value={editingLabel}
                        onChange={(e) => setEditingLabel(e.target.value)}
                        placeholder="Label (optional)"
                        width="30%"
                      />
                      <IconButton
                        icon={<AddIcon />}
                        onClick={handleSaveEdit}
                        aria-label="Save"
                      />
                    </>
                  ) : (
                    <>
                      <Text fontSize={'12px'} fontWeight="bold" width="30%">{valueKey}</Text>
                      <Text fontSize={'12px'} width="30%" textAlign={'center'}>{selectedEnum.values[valueKey]}</Text>
                      <IconButton
                        icon={<EditIcon />}
                        onClick={() => handleEditEnum(valueKey)}
                        aria-label="Edit"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        onClick={() => handleDeleteEnum(valueKey)}
                        aria-label="Delete"
                      />
                    </>
                  )}
                </Flex>
              ))}
              <Flex p={1} background='#f4f4f4' border='1px' borderRadius={"5px"} borderColor={'black'} mb={1} justifyContent="space-between">
                <Input
                  value={newEnumKey}
                  onChange={(e) => setNewEnumKey(e.target.value)}
                  placeholder="Key"
                  width="30%"
                />
                <Input
                  value={newEnumValue}
                  onChange={(e) => setNewEnumValue(e.target.value)}
                  placeholder="Value"
                  width="30%"
                />
                <IconButton
                  icon={<AddIcon />}
                  onClick={handleAddEnum}
                  aria-label="Add"
                />
              </Flex>
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

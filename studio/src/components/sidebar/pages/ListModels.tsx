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
  const [newEnumName, setNewEnumName] = useState('');
  const [newEnumKey, setNewEnumKey] = useState('');
  const [newEnumValue, setNewEnumValue] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editingNewKey, setEditingNewKey] = useState('');
  const [editingValue, setEditingValue] = useState('');
  
  const enums = useSelector(getEnums)
  const handleEnumClick = (key) => {
    setSelectedEnum({ key, values: enums[key] });
    onOpen();
  }

  const handleAddEnumKey = () => {
    if (newEnumName && newEnumKey && newEnumValue) {
      setEnums((prevEnums) => ({
        ...prevEnums,
        [newEnumName]: { [newEnumKey]: newEnumValue },
      }));
      setNewEnumName('');
      setNewEnumKey('');
      setNewEnumValue('');
      onClose();
    }
  };

  const handleAddEnum = () => {
    if (newEnumKey && newEnumValue) {
      setSelectedEnum((prevState) => ({
        ...prevState,
        values: {
          ...prevState.values,
          [newEnumKey]: newEnumValue,
        },
      }));
      setNewEnumKey('');
      setNewEnumValue('');
    }
  };

  const handleEditEnum = (key, value) => {
    setEditingKey(key);
    setEditingNewKey(key);
    setEditingValue(value);
  };

  const handleSaveEdit = () => {
    if (editingKey) {
      setSelectedEnum((prevState) => {
        const newValues = { ...prevState.values };
        delete newValues[editingKey];
        newValues[editingNewKey] = editingValue;
        return { ...prevState, values: newValues };
      });
      setEditingKey(null);
      setEditingNewKey('');
      setEditingValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditingNewKey('');
    setEditingValue('');
  };

  const handleDeleteEnum = (key) => {
    setSelectedEnum((prevState) => {
      const newValues = { ...prevState.values };
      delete newValues[key];
      return { ...prevState, values: newValues };
    });
  };

  const handleSaveEnum = () => {
    setEnums((prevEnums) => ({
      ...prevEnums,
      [selectedEnum.key]: selectedEnum.values,
    }));
    onClose();
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
        <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={() => {
          setSelectedEnum({ key: '', values: {} });
          setNewEnumName('');
          setNewEnumKey('');
          setNewEnumValue('');
          onOpen();
        }}>
          Add Enum
        </Button>

        <Modal isOpen={isOpen} onClose={onClose} size="md">
          <ModalOverlay />
          <ModalContent background='#f4f4f4'>
            <ModalHeader>{selectedEnum.key ? selectedEnum.key : 'New Enum'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {!selectedEnum.key && (
                <Flex p={1} background='#f4f4f4' border='1px' borderRadius={"5px"} borderColor={'black'} mb={1} justifyContent="space-between">
                  <Input
                    value={newEnumName}
                    onChange={(e) => setNewEnumName(e.target.value)}
                    placeholder="New Enum Name"
                    width="100%"
                  />
                </Flex>
              )}
              <Flex p={1} background='#f4f4f4' border='1px' borderRadius={"5px"} borderColor={'black'} mb={1} justifyContent="space-between">
                <Input
                  value={newEnumKey}
                  onChange={(e) => setNewEnumKey(e.target.value)}
                  placeholder="New Key"
                  width="45%"
                />
                <Input
                  value={newEnumValue}
                  onChange={(e) => setNewEnumValue(e.target.value)}
                  placeholder="New Value"
                  width="45%"
                />
                <IconButton
                  icon={<AddIcon />}
                  onClick={handleAddEnum}
                  aria-label="Add"
                />
              </Flex>
              {selectedEnum.values && Object.keys(selectedEnum.values).map((valueKey) => (
                <Flex key={valueKey} p={1} background='#f4f4f4' border='1px' borderRadius={"5px"} borderColor={'black'} mb={1} justifyContent="space-between">
                  {editingKey === valueKey ? (
                    <>
                      <Input
                        value={editingNewKey}
                        onChange={(e) => setEditingNewKey(e.target.value)}
                        placeholder="Edit Key"
                        width="45%"
                      />
                      <Input
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        placeholder="Edit Value"
                        width="45%"
                      />
                      <IconButton
                        icon={<CheckIcon />}
                        onClick={handleSaveEdit}
                        aria-label="Save"
                      />
                      <IconButton
                        icon={<CloseIcon />}
                        onClick={handleCancelEdit}
                        aria-label="Cancel"
                      />
                    </>
                  ) : (
                    <>
                      <Text fontSize={'12px'} fontWeight="bold" width="30%">{valueKey}</Text>
                      <Text fontSize={'12px'} width="40%" textAlign={'center'}>{selectedEnum.values[valueKey]}</Text>
                      <IconButton
                        icon={<EditIcon />}
                        onClick={() => handleEditEnum(valueKey, selectedEnum.values[valueKey])}
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
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" onClick={selectedEnum.key ? handleSaveEnum : handleAddEnumKey}>
                Save
              </Button>
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
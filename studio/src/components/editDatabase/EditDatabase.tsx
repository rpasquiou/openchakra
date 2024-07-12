import React, { useState, useEffect, useCallback, FC, memo } from 'react'
import {
  Box, Heading, Text, VStack, HStack, Button, Input, Checkbox, Select,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Switch
} from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { getModels } from '~core/selectors/dataSources'
import { getEnums } from '~core/selectors/enums'

interface Attribute {
  type?: string
  ref?: string
  localField?: string
  foreignField?: string
  multiple?: boolean
  required?: boolean
  enumValues?: { [key: string]: string }
  default?: string
}

interface AttributeItemProps {
  modelName: string
  attr: string
  attribute: Attribute
  onEdit: (modelName: string, attr: string) => void
}

const AttributeItem: FC<AttributeItemProps> = memo(({ modelName, attr, attribute, onEdit }) => {
  const predefinedTypes = ['Date', 'Number', 'String', 'Boolean', 'Email', 'Phone', 'URL', 'Address', 'Ref']
  const isRefType = !predefinedTypes.includes(attribute.type || '')
  
  return (
    <Box border="1px" borderColor="#2e2e2e" borderRadius="md" mb={2} p={4} width="100%" background="#d0eddf">
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton _expanded={{ bg: "#00bf91", color: "white" }}>
              <Box flex="1" textAlign="left" fontWeight="bold">{attr}</Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Text><Text as="span" fontWeight="bold">Type:</Text> {isRefType ? 'Ref' : attribute.type}</Text>
            {isRefType && <Text><Text as="span" fontWeight="bold">Ref:</Text> {attribute.type}</Text>}
            {attribute.localField && <Text><Text as="span" fontWeight="bold">Local Field:</Text> {attribute.localField}</Text>}
            {attribute.foreignField && <Text><Text as="span" fontWeight="bold">Foreign Field:</Text> {attribute.foreignField}</Text>}
            {typeof attribute.multiple !== 'undefined' && (
              <HStack mt={2}>
                <Text fontWeight="bold">Multiple:</Text>
                <Switch isChecked={attribute.multiple} isReadOnly />
              </HStack>
            )}
            {typeof attribute.required !== 'undefined' && (
              <HStack mt={2}>
                <Text fontWeight="bold">Required:</Text>
                <Switch isChecked={attribute.required} isReadOnly />
              </HStack>
            )}
            {attribute.enumValues && (
              <>
                <HStack mt={2}>
                  <Text fontWeight="bold">Enum Values:</Text>
                </HStack>
                <VStack align="start" border="1px" borderColor="#2e2e2e" borderRadius="md" p={2}>
                  {Object.keys(attribute.enumValues).map((key) => (
                    <HStack key={key} justifyContent="start">
                      <Text fontWeight="bold" fontSize="sm">{key}:</Text>
                      <Text>{attribute.enumValues![key]}</Text>
                    </HStack>
                  ))}
                </VStack>
              </>
            )}
            {attribute.default && (
              <HStack mt={2} justifyContent="start">
                <Text fontWeight="bold">Default:</Text>
                <Text>{attribute.default}</Text>
              </HStack>
            )}
            <Button mt={4} background="#00bf91" color="white" onClick={() => onEdit(modelName, attr)}>Edit</Button>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  )
})

interface ModelItemProps {
  modelName: string
  model: Model
  isOpen: boolean
  onToggle: () => void
  onEditAttribute: (modelName: string, attr: string) => void
  onAddAttribute: (modelName: string) => void
}

const ModelItem: FC<ModelItemProps> = memo(({ modelName, model, isOpen, onToggle, onEditAttribute, onAddAttribute }) => {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (isOpen && !loaded) {
      setLoaded(true)
    }
  }, [isOpen, loaded])

  return (
    <AccordionItem isExpanded={isOpen} border="1px" borderColor="#2e2e2e" borderRadius="md" mb={4} bg="#f4f4f4">
      <h2>
        <AccordionButton onClick={onToggle} _expanded={{ bg: "#00bf91", color: "white" }}>
          <Box flex="1" textAlign="left" fontWeight="bold" fontSize="xl">
            {model.name}
          </Box>
          <AccordionIcon />
        </AccordionButton>
      </h2>
      <AccordionPanel pb={4}>
        <Button mb={4} background="#00bf91" color="#f4f4f4" onClick={() => onAddAttribute(modelName)}>Add Attribute</Button>
        {loaded ? (
          <Box display="grid" gridTemplateColumns="repeat(5, 1fr)" gap={4} width="100%">
            {Object.keys(model.attributes)
              .filter((attr) => !attr.includes('.'))
              .map((attr) => (
                <AttributeItem
                  key={attr}
                  modelName={modelName}
                  attr={attr}
                  attribute={model.attributes[attr]}
                  onEdit={onEditAttribute}
                />
              ))}
          </Box>
        ) : (
          <Text>Loading...</Text>
        )}
      </AccordionPanel>
    </AccordionItem>
  )
})

const EditDatabase: FC = () => {
  const models = useSelector(getModels)
  const [modelSchemas, setModelSchemas] = useState(models)
  const [newModelName, setNewModelName] = useState('')

  const [newAttributeName, setNewAttributeName] = useState('')
  const [newAttributeType, setNewAttributeType] = useState('')
  const [newAttributeRef, setNewAttributeRef] = useState('')
  const [newAttributeLocalField, setNewAttributeLocalField] = useState('')
  const [newAttributeForeignField, setNewAttributeForeignField] = useState('')
  const [newAttributeMultiple, setNewAttributeMultiple] = useState(false)
  const [newAttributeRequired, setNewAttributeRequired] = useState(false)
  const [newAttributeEnumKey, setNewAttributeEnumKey] = useState('')
  const [newAttributeEnumValue, setNewAttributeEnumValue] = useState('')

  function filterAttributes(obj) {
    const result = {}

    for (const schemaName in obj) {
        const schema = obj[schemaName]
        const filteredAttributes = {}

        for (const attr in schema.attributes) {
            if (!attr.includes('.')) {
                filteredAttributes[attr] = schema.attributes[attr]
            }
        }

        result[schemaName] = {
            ...schema,
            attributes: filteredAttributes
        }
    }

    return result
  }

  const filteredObject = filterAttributes(models)
  
  const [openItems, setOpenItems] = useState<string[]>([])
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [editingAttribute, setEditingAttribute] = useState<{ modelName: string; attr: string } | null>(null)
  const [addingAttributeModel, setAddingAttributeModel] = useState<string | null>(null)
  const [isAddModelOpen, setAddModelOpen] = useState(false)
  const [enums, setEnums] = useState<{ [key: string]: any }>({})
  const [selectedEnumKey, setSelectedEnumKey] = useState<string>('')
  const [selectedEnumValue, setSelectedEnumValue] = useState<string>('')

  const handleToggle = useCallback((modelName: string) => {
    setOpenItems((prevOpenItems) =>
      prevOpenItems.includes(modelName)
        ? prevOpenItems.filter((item) => item !== modelName)
        : [...prevOpenItems, modelName]
    )
  }, [])

  const handleEditAttribute = useCallback((modelName: string, attr: string) => {
    const attribute = modelSchemas[modelName].attributes[attr];
    setEditingAttribute({ modelName, attr })
    setNewAttributeName(attr)
    setNewAttributeType(attribute.type || '')
    setNewAttributeRef(attribute.ref || '')
    setNewAttributeLocalField(attribute.localField || '')
    setNewAttributeForeignField(attribute.foreignField || '')
    setNewAttributeMultiple(attribute.multiple || false)
    setNewAttributeRequired(attribute.required || false)
    setNewAttributeEnumKey(Object.keys(attribute.enumValues || {})[0] || '')
    setNewAttributeEnumValue(attribute.default || '')
    onOpen()
  }, [onOpen, modelSchemas])

  const handleAddAttribute = useCallback((modelName: string) => {
    setAddingAttributeModel(modelName)
    setNewAttributeName('')
    setNewAttributeType('')
    setNewAttributeRef('')
    setNewAttributeLocalField('')
    setNewAttributeForeignField('')
    setNewAttributeMultiple(false)
    setNewAttributeRequired(false)
    setNewAttributeEnumKey('')
    setNewAttributeEnumValue('')
    onOpen()
  }, [onOpen])

  const handleModalClose = () => {
    setEditingAttribute(null)
    setAddingAttributeModel(null)
    onClose()
  }

  const handleSaveAttribute = () => {
    if (editingAttribute) {
      const { modelName, attr } = editingAttribute
      const updatedAttribute = {
        type: newAttributeType,
        ref: newAttributeType === 'Ref' ? newAttributeRef : undefined,
        localField: newAttributeType === 'Ref' ? newAttributeLocalField : undefined,
        foreignField: newAttributeType === 'Ref' ? newAttributeForeignField : undefined,
        multiple: newAttributeMultiple,
        required: newAttributeRequired,
        enumValues: newAttributeEnumKey ? enums[newAttributeEnumKey] : undefined,
        default: newAttributeEnumValue,
      }
      setModelSchemas((prevState) => ({
        ...prevState,
        [modelName]: {
          ...prevState[modelName],
          attributes: {
            ...prevState[modelName].attributes,
            [attr]: updatedAttribute,
          },
        },
      }))
    } else if (addingAttributeModel) {
      const newAttribute = {
        type: newAttributeType,
        ref: newAttributeType === 'Ref' ? newAttributeRef : undefined,
        localField: newAttributeType === 'Ref' ? newAttributeLocalField : undefined,
        foreignField: newAttributeType === 'Ref' ? newAttributeForeignField : undefined,
        multiple: newAttributeMultiple,
        required: newAttributeRequired,
        enumValues: newAttributeEnumKey ? enums[newAttributeEnumKey] : undefined,
        default: newAttributeEnumValue,
      }
      setModelSchemas((prevState) => {
        const updatedModel = {
          ...prevState[addingAttributeModel],
          attributes: {
            ...prevState[addingAttributeModel].attributes,
            [newAttributeName]: newAttribute,
          },
        };
        updatedModel.attributes = sortAttributes(updatedModel.attributes); // Sort attributes
        return {
          ...prevState,
          [addingAttributeModel]: updatedModel,
        };
      });
    }
    // Reset states
    setNewAttributeName('')
    setNewAttributeType('')
    setNewAttributeRef('')
    setNewAttributeLocalField('')
    setNewAttributeForeignField('')
    setNewAttributeMultiple(false)
    setNewAttributeRequired(false)
    setNewAttributeEnumKey('')
    setNewAttributeEnumValue('')
    handleModalClose()
  }

  const sortAttributes = (attributes) => {
    return Object.keys(attributes)
      .sort()
      .reduce((sortedAttributes, key) => {
        sortedAttributes[key] = attributes[key];
        return sortedAttributes;
      }, {});
  }

  const renderTypeOptions = () => {
    const baseTypes = ['Date', 'Number', 'String', 'Boolean', 'Email', 'Phone', 'URL', 'Address', 'Ref']
    return baseTypes
  }

  const getAttributes = (m: string) => {
    const model = models[m]
    return Object.keys(model.attributes).filter(attr => !attr.includes('.'))
  }
  const enumsFromBack = useSelector(getEnums)
  useEffect(() => {
    setEnums(enumsFromBack)
  }, [models])

  const handleAddModelOpen = () => {
    setAddModelOpen(true)
  }

  const handleAddModelClose = () => {
    setAddModelOpen(false)
  }

  const handleAddModel = () => {
    if (newModelName) {
      setModelSchemas((prevState) => ({
        ...prevState,
        [newModelName]: {
          name: newModelName,
          attributes: {},
        },
      }))
      setNewModelName('')
      handleAddModelClose()
    }
  }
  
  return (
    <Box
      overflowY="auto"
      overflowX="hidden"
      boxShadow="xl"
      position="relative"
      p={4}
      m={0}
      w={'100%'}
      h={'100%'}
      bg="rgb(236, 236, 236)"
    >
      <HStack mb={4}>
        <Button background="#00bf91" color="#f4f4f4" onClick={handleAddModelOpen}>Add Model Schema</Button>
      </HStack>
      <Accordion allowMultiple>
        {Object.keys(modelSchemas).map((modelName) => (
          <ModelItem
            key={modelName}
            modelName={modelName}
            model={modelSchemas[modelName]}
            isOpen={openItems.includes(modelName)}
            onToggle={() => handleToggle(modelName)}
            onEditAttribute={handleEditAttribute}
            onAddAttribute={handleAddAttribute}
          />
        ))}
      </Accordion>
  
      <Modal isOpen={isAddModelOpen} onClose={handleAddModelClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Model Schema</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={3} alignItems="start">
              <HStack justifyContent="start" width="100%">
                <Text fontWeight="bold" width="20%">Model Name:</Text>
                <Input placeholder="Model Name" value={newModelName} onChange={(e) => setNewModelName(e.target.value)} />
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleAddModel}>
              Save
            </Button>
            <Button variant="ghost" onClick={handleAddModelClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  
      <Modal isOpen={isOpen} onClose={handleModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingAttribute ? `Edit Attribute: ${editingAttribute.attr}` : `Add Attribute`}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingAttribute ? (
              <>
                <Text>Editing {editingAttribute.attr} of model {editingAttribute.modelName}</Text>
                <VStack spacing={3} mt={4} alignItems="start">
                  <HStack justifyContent="start">
                    <Text fontWeight="bold">Type:</Text>
                    <Select value={newAttributeType} onChange={(e) => setNewAttributeType(e.target.value)}>
                      {renderTypeOptions().map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </Select>
                  </HStack>
                  {newAttributeType === 'Ref' && (
                    <>
                      <HStack justifyContent="start">
                        <Text fontWeight="bold">Reference Model:</Text>
                        <Select value={newAttributeRef} onChange={(e) => setNewAttributeRef(e.target.value)}>
                          {Object.keys(models).map((modelName) => (
                            <option key={modelName} value={modelName}>{models[modelName].name}</option>
                          ))}
                        </Select>
                      </HStack>
                      <HStack justifyContent="start">
                        <Text fontWeight="bold">Local Field:</Text>
                        <Select value={newAttributeLocalField} onChange={(e) => setNewAttributeLocalField(e.target.value)}>
                          {getAttributes(editingAttribute.modelName).map((attr) => (
                            <option key={attr} value={attr}>{attr}</option>
                          ))}
                        </Select>
                      </HStack>
                      <HStack justifyContent="start">
                        <Text fontWeight="bold">Foreign Field:</Text>
                        <Select value={newAttributeForeignField} onChange={(e) => setNewAttributeForeignField(e.target.value)}>
                          {newAttributeRef && getAttributes(newAttributeRef).map((attr) => (
                            <option key={attr} value={attr}>{attr}</option>
                          ))}
                          <option key='id' value='id'>id</option>
                        </Select>
                      </HStack>
                    </>
                  )}
                  <HStack justifyContent="start">
                    <Text fontWeight="bold">Multiple:</Text>
                    <Checkbox
                      isChecked={newAttributeMultiple}
                      onChange={(e) => setNewAttributeMultiple(e.target.checked)}
                    />
                  </HStack>
                  <HStack justifyContent="start">
                    <Text fontWeight="bold">Required:</Text>
                    <Checkbox
                      isChecked={newAttributeRequired}
                      onChange={(e) => setNewAttributeRequired(e.target.checked)}
                    />
                  </HStack>
                  <VStack alignItems="start">
                    <Text fontWeight="bold">Enum Values:</Text>
                    {Object.entries(enums[newAttributeEnumKey] || {}).map(([key, value]) => (
                      <HStack key={key} justifyContent="start">
                        <Text>{key}:</Text>
                        <Input defaultValue={value} />
                      </HStack>
                    ))}
                    <HStack justifyContent="start">
                      <Text fontWeight="bold">Add Enum:</Text>
                      <Select placeholder="Select Enum" value={newAttributeEnumKey} onChange={(e) => setNewAttributeEnumKey(e.target.value)}>
                        {Object.keys(enums).map((enumKey) => (
                          <option key={enumKey} value={enumKey}>{enumKey}</option>
                        ))}
                      </Select>
                    </HStack>
                    {newAttributeEnumKey && (
                      <HStack justifyContent="start">
                        <Text fontWeight="bold">Default Value:</Text>
                        <Select placeholder="Select Default Value" value={newAttributeEnumValue} onChange={(e) => setNewAttributeEnumValue(e.target.value)}>
                          {Object.keys(enums[newAttributeEnumKey] || {}).map((enumVal) => (
                            <option key={enumVal} value={enumVal}>{enumVal}</option>
                          ))}
                        </Select>
                      </HStack>
                    )}
                  </VStack>
                </VStack>
              </>
            ) : addingAttributeModel ? (
              <>
                <Text>Adding attribute to model {addingAttributeModel}</Text>
                <VStack spacing={3} mt={4} alignItems="start">
                  <HStack justifyContent="start">
                    <Text fontWeight="bold">Name:</Text>
                    <Input value={newAttributeName} placeholder="Attribute Name" onChange={(e) => setNewAttributeName(e.target.value)} />
                  </HStack>
                  <HStack justifyContent="start">
                    <Text fontWeight="bold">Type:</Text>
                    <Select value={newAttributeType} onChange={(e) => setNewAttributeType(e.target.value)}>
                      {renderTypeOptions().map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </Select>
                  </HStack>
                  {newAttributeType === 'Ref' && (
                    <>
                      <HStack justifyContent="start">
                        <Text fontWeight="bold">Reference Model:</Text>
                        <Select value={newAttributeRef} onChange={(e) => setNewAttributeRef(e.target.value)}>
                          {Object.keys(models).map((modelName) => (
                            <option key={modelName} value={modelName}>{models[modelName].name}</option>
                          ))}
                        </Select>
                      </HStack>
                      <HStack justifyContent="start">
                        <Text fontWeight="bold">Local Field:</Text>
                        <Select value={newAttributeLocalField} onChange={(e) => setNewAttributeLocalField(e.target.value)}>
                          {getAttributes(addingAttributeModel).map((attr) => (
                            <option key={attr} value={attr}>{attr}</option>
                          ))}
                        </Select>
                      </HStack>
                      <HStack justifyContent="start">
                        <Text fontWeight="bold">Foreign Field:</Text>
                        <Select value={newAttributeForeignField} onChange={(e) => setNewAttributeForeignField(e.target.value)}>
                          {newAttributeRef && getAttributes(newAttributeRef).map((attr) => (
                            <option key={attr} value={attr}>{attr}</option>
                          ))}
                          <option key='id' value='id'>id</option>
                        </Select>
                      </HStack>
                    </>
                  )}
                  <HStack justifyContent="start">
                    <Text fontWeight="bold">Multiple:</Text>
                    <Checkbox
                      isChecked={newAttributeMultiple}
                      onChange={(e) => setNewAttributeMultiple(e.target.checked)}
                    />
                  </HStack>
                  <HStack justifyContent="start">
                    <Text fontWeight="bold">Required:</Text>
                    <Checkbox
                      isChecked={newAttributeRequired}
                      onChange={(e) => setNewAttributeRequired(e.target.checked)}
                    />
                  </HStack>
                  <VStack alignItems="start">
                    <Text fontWeight="bold">Enum Values:</Text>
                    {Object.entries(enums[newAttributeEnumKey] || {}).map(([key, value]) => (
                      <HStack key={key} justifyContent="start">
                        <Text>{key}:</Text>
                        <Input defaultValue={value} />
                      </HStack>
                    ))}
                    <HStack justifyContent="start">
                      <Text fontWeight="bold">Add Enum:</Text>
                      <Select placeholder="Select Enum" value={newAttributeEnumKey} onChange={(e) => setNewAttributeEnumKey(e.target.value)}>
                        {Object.keys(enums).map((enumKey) => (
                          <option key={enumKey} value={enumKey}>{enumKey}</option>
                        ))}
                      </Select>
                    </HStack>
                    {newAttributeEnumKey && (
                      <HStack justifyContent="start">
                        <Text fontWeight="bold">Default Value:</Text>
                        <Select placeholder="Select Default Value" value={newAttributeEnumValue} onChange={(e) => setNewAttributeEnumValue(e.target.value)}>
                          {Object.keys(enums[newAttributeEnumKey] || {}).map((enumVal) => (
                            <option key={enumVal} value={enumVal}>{enumVal}</option>
                          ))}
                        </Select>
                      </HStack>
                    )}
                  </VStack>
                </VStack>
              </>
            ) : null}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={handleSaveAttribute}>
              Save
            </Button>
            <Button variant="ghost" onClick={handleModalClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
export default EditDatabase

import React, { FC, memo } from 'react'
import {
  Box, Text, VStack, HStack, Button, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Switch
} from '@chakra-ui/react'

interface Attribute {
  type?: string
  ref?: boolean
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
  onDelete: (modelName: string, attr: string) => void;  // Add the onDelete prop
}

const AttributeItem: FC<AttributeItemProps> = memo(({ modelName, attr, attribute, onEdit, onDelete }) => {
  const isRefType = attribute.ref

  return (
    <Box border="1px" borderColor="#2e2e2e" borderRadius="md" mb={2} p={4} width="100%" bg="#d0eddf">
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
                <VStack align="start" border="1px" borderColor="#2e2e2e" borderRadius="md" p={2} maxH="150px" overflowY="auto">
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
            <HStack mt={4} spacing={4}>
              <Button bg="#00bf91" color="white" onClick={() => onEdit(modelName, attr)}>Edit</Button>
              <Button bg="#dc3545" color="white" onClick={() => onDelete(modelName, attr)}>Delete</Button>
            </HStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  )
})

export default AttributeItem

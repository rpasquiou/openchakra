import React, { useState, useEffect, FC, memo } from 'react'
import {
  Box, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  HStack, Button, Text
} from '@chakra-ui/react'
import AttributeItem from './AttributeItem'

interface ModelItemProps {
  modelName: string
  model: any
  isOpen: boolean
  onToggle: () => void
  onEditAttribute: (modelName: string, attr: string) => void
  onAddAttribute: (modelName: string) => void
  onEditSchema: (modelName: string) => void
  onDeleteSchema: (modelName: string) => void
  onDeleteAttribute: (modelName: string, attr: string) => void;  // Add the onDeleteAttribute prop
}

const ModelItem: FC<ModelItemProps> = memo(({ modelName, model, isOpen, onToggle, onEditAttribute, onAddAttribute, onEditSchema, onDeleteSchema, onDeleteAttribute }) => {
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
        <HStack mb={4}>
          <Button bg="#00bf91" color="#f4f4f4" onClick={() => onAddAttribute(modelName)}>Add Attribute</Button>
          <Button bg="#ffc107" color="#f4f4f4" onClick={() => onEditSchema(modelName)}>Edit Schema</Button>
          <Button bg="#dc3545" color="#f4f4f4" onClick={() => onDeleteSchema(modelName)}>Delete Schema</Button>
        </HStack>
        {loaded ? (
          <Box display="grid" gridTemplateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "repeat(4, 1fr)" }} gap={4} width="100%">
            {Object.keys(model.attributes)
              .filter((attr) => !attr.includes('.'))
              .map((attr) => (
                <AttributeItem
                  key={attr}
                  modelName={modelName}
                  attr={attr}
                  attribute={model.attributes[attr]}
                  onEdit={onEditAttribute}
                  onDelete={onDeleteAttribute}  // Pass the delete handler
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

export default ModelItem

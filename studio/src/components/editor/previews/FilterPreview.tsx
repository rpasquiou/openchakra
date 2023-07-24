import React from 'react'
import lodash from 'lodash'
import { Box } from '@chakra-ui/react'
import ComponentPreview from '~components/editor/ComponentPreview'
import { useDropComponent } from '~hooks/useDropComponent'
import { useInteractive } from '~hooks/useInteractive'
import Filter from '~dependencies/custom-components/Filter'

const FilterPreview: React.FC<{ component: IComponent }> = ({ component }) => {
  const { drop, isOver } = useDropComponent(component.id)
  const { props, ref } = useInteractive(component, true)

  if (isOver) {
    props.bg = 'teal.50'
  }

  const previewProps={...props, enumValues: {}}
  return (
    <Box pos="relative" ref={drop(ref)} >
      <Filter {...previewProps} >
      {component.children.map((key: string) => (
        <ComponentPreview key={key} componentName={key} />
      ))}
      </Filter>
    </Box>
  )
}

export default FilterPreview

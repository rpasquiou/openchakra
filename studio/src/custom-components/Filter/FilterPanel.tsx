import {Accordion, Select} from '@chakra-ui/react'
import lodash from 'lodash'
import { useSelector } from 'react-redux'
import React, { useState, useEffect, memo } from 'react'
import { getModels } from '~core/selectors/dataSources'
import AccordionContainer from '~components/inspector/AccordionContainer'
import { useForm } from '~hooks/useForm'
import FormControl from '~components/inspector/controls/FormControl'
import usePropsSelector from '~hooks/usePropsSelector'

const FilterPanel: React.FC = () => {
  const { setValueFromEvent, setValue, removeValue } = useForm()
  const models = useSelector(getModels)
  const model = usePropsSelector('model')
  const attribute = usePropsSelector('attribute')
  const [attributes, setAttributes] = useState({})
  const filterType = usePropsSelector('filterType')

  useEffect(() => {
    const attr=models?.[model]?.attributes?.[attribute]
    if (!attr) {
      removeValue('filterType')
    }
    else {
      setValue('filterType', attr.type)
      if (attr.enumValues) {
        setValue('enumValues', attr.enumValues)
      }
      else {
        removeValue('enumValues')
      }
    }
  }, [model, attribute])

  useEffect(() => {
    removeValue('attribute')
    removeValue('enumValues')
  }, [model])

  useEffect(() => {
    const attributes=lodash(models[model]?.attributes || {})
      .pickBy((params, name) => !name.includes('.') && !params.multiple && !params.ref)
      .value()
    setAttributes(attributes)
  }, [model])

  return (
    <Accordion allowToggle={true}>
      <AccordionContainer title="Filter attribute">
        <FormControl htmlFor="model" label="Model">
          <Select
            id="model"
            onChange={setValueFromEvent}
            name="model"
            size="xs"
            value={model || ''}
          >
            <option value={undefined}></option>
            {Object.keys(models).map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </Select>
        </FormControl>
        {attributes && (
          <FormControl htmlFor="attribute" label="Attribute">
            <Select
              id="attribute"
              onChange={setValueFromEvent}
              name="attribute"
              size="xs"
              value={attribute || ''}
            >
              <option value={undefined}></option>
              {Object.keys(attributes).map((attribute, i) => (
                <option key={`attr${i}`} value={attribute}>
                  {attribute}
                </option>
              ))}
            </Select>
          </FormControl>
        )}
      </AccordionContainer>
    </Accordion>
  )
}

export default memo(FilterPanel)

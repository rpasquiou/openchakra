import { Select, Checkbox } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import React, { memo } from 'react'

import { getModelNames } from '~core/selectors/dataSources'

import { useForm } from '../../hooks/useForm'
import FormControl from '../../components/inspector/controls/FormControl'
import usePropsSelector from '../../hooks/usePropsSelector'

const capitalize = (word: string) => {
  return word.replace(/\w\S*/g, w => w.replace(/^\w/, c => c.toUpperCase()))
}

const DataProviderPanel = () => {
  const { setValueFromEvent } = useForm()
  const model = usePropsSelector('model')
  const modelCardinality = usePropsSelector('modelCardinality')
  const modelNames = useSelector(getModelNames)

  return (
    <>
      <FormControl htmlFor="model" label="Model">
        <Select
          id="model"
          onChange={setValueFromEvent}
          name="model"
          size="sm"
          value={model || ''}
        >
          <option value={undefined}></option>
          {modelNames.map((mdl, i) => (
            <option key={`datm${i}`} value={mdl}>
              {capitalize(mdl)}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl htmlFor="modelCardinality" label="Cardinality">
        <Select
          id="modelCardinality"
          onChange={setValueFromEvent}
          name="modelCardinality"
          size="sm"
          value={modelCardinality || 'unique'}
        >
          <option key="unique" value="unique">
            unique
          </option>
          <option key="multiple" value="multiple">
            multiple
          </option>
        </Select>
      </FormControl>
    </>
  )
}

export default memo(DataProviderPanel)

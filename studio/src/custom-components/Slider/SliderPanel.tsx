import React, { memo } from 'react'
import {
  Input,
  Select,
} from '@chakra-ui/react'
import { useForm } from '~hooks/useForm'
import FormControl from '~components/inspector/controls/FormControl'
import usePropsSelector from '~hooks/usePropsSelector'

const SliderPanel = () => {

  const { setValueFromEvent } = useForm()
  const min = usePropsSelector('min')
  const max = usePropsSelector('max')

  const setMin = ev => {
    if (ev.target.value<max) {
      setValueFromEvent(ev)
    }
  }

  const setMax = ev => {
    if (ev.target.value>min) {
      setValueFromEvent(ev)
    }
  }

  return (
    <>
       <FormControl label="Min" htmlFor="min">
        <Input
          value={min || 0}
          id="min"
          type={'number'}
          size="sm"
          name="min"
          onChange={setMin}
        />
      </FormControl>
       <FormControl label="Max" htmlFor="max">
        <Input
          value={max || 100}
          id="max"
          type={'number'}
          size="sm"
          name="max"
          onChange={setMax}
        />
      </FormControl>
    </>
  )
}

export default memo(SliderPanel)

import React from 'react'
import { FormLabel, Checkbox, VisuallyHidden } from '@chakra-ui/react'
import {useState} from 'react'
import lodash from 'lodash'

const EnumFilter = props => {
  return (
    <>
      <h1>Enum filter</h1>
      <>
      {Object.keys(props.enumValues).map(key => (
        <Checkbox value={key}>{props.enumValues[key]}</Checkbox>
      ))}
      </>
    </>
  )
}

const StringFilter = props => {
  return (
    <>
      <h1>String filter</h1>
    </>
  )
}

const BooleanFilter = props => {
  return (
    <>
      <h1>Boolean filter</h1>
    </>
  )
}

const NumberFilter = props => {
  return (
    <>
      <h1>Number filter</h1>
    </>
  )
}

const DateFilter = props => {
  return (
    <>
      <h1>Date filter</h1>
    </>
  )
}

const Filter = ({
  id,
  value,
  model,
  filterType,
  attribute,
  children,
  ...props
}) => {

  return <FormLabel
      {...props}
      >
      <h1>Filter for {model}.{attribute}</h1>
      {children}
      {props.enumValues?
        <EnumFilter {...props} />
        : filterType=='String' ? <StringFilter {...props} />
        : filterType=='Number' ? <NumberFilter {...props} />
        : filterType=='Boolean' ? <BooleanFilter {...props} />
        : filterType=='Date' ? <DateFilter {...props} />
        : <h1>Unknown filter type:${filterType}</h1>
    }
    </FormLabel>
}

export default Filter

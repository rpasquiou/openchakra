// @ts-nocheck
/** @jsx */
import React from 'react'
import moment from 'moment'
import {get, isNil} from 'lodash'
import { Input } from '@my/ui'

export const OPERATORS = {
  Boolean: { true: v => !!v, false: v => !v, empty: isNil },
  Number: {
    '=': (v, ref) => v == ref,
    '<': (v, ref) => v < ref,
    '>': (v, ref) => v > ref,
    '<>': (v, ref) => v != ref,
    'is empty': isNil,
  },
  String: {
    '=': (v, ref) => v == ref,
    '<': (v, ref) => v < ref,
    '>': (v, ref) => v > ref,
    '<>': (v, ref) => v != ref,
    contains: (v, ref) => v?.toLowerCase()?.includes(ref?.toLowerCase()),
    'does not contain': (v, ref) =>
      v?.toLowerCase()?.includes(ref?.toLowerCase()),
    'is empty': isNil,
  },
  Date: {
    before: (v, ref) => moment(v).isBefore(moment(ref)),
    after: (v, ref) => moment(v).isAfter(moment(ref)),
    'is empty': isNil,
  },
}

const createFilters = (filterDef, props) => {
  return Object.entries(filterDef).map(([id, def]) => {
    const targetValue = props[`condition${id}`]
    const attribute = def.attribute
    const opFn = OPERATORS[def.type][def.operator]
    const vRef = def.value
    return dataSource => {
      const dataValue = get(dataSource, attribute)
      return opFn(dataValue, vRef) ? targetValue : null
    }
  })
}

export const getConditionalProperties = (props, dataSource) => {
  const conditions = Object.keys(props).filter(k => /^conditions/.test(k))
  const properties = Object.fromEntries(
    conditions
      .map(cond => {
        const property = cond.match(/^conditions(.*)$/)[1]
        const filters = createFilters(props[cond], props)
        const v = filters.map(f => f(dataSource)).find(v => !!v)
        return v ? [property, v] : null
      })
      .filter(v => !!v),
  )
  return properties
}

export const ValueComponent = ({ type, operator, ...props }) => {
  const VALUE_COMPONENTS = {
    Boolean: _ => null,
    Number: op =>
      op === 'is empty' ? null : props => <Input type="number" {...props} />,
    String: op => (op === 'is empty' ? null : props => <Input {...props} />),
    Date: op =>
      op === 'is empty' ? null : props => <Input type="date" {...props} />,
  }

  const Cmp = VALUE_COMPONENTS[type]?.(operator)
  return Cmp ? <Cmp {...props} /> : null
}

export const getConditionPropertyName = conditionId => {
  return `condition${conditionId}`
}

export const getConditionsPropertyName = property => {
  return `conditions${property}`
}

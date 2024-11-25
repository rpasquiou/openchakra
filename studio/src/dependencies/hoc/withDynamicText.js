import React from 'react'
import lodash from 'lodash'
import { getConditionalProperties } from '../utils/filters'
import { formatAddress, joinDelimiter } from '../utils/misc'
import { formatDisplay, isPhoneOk } from '../utils/phone'

const withDynamicText = Component => {
  const internal = props => {
    const enums=props.enum ?  JSON.parse(props.enum) : null
    let value = lodash.get(props.dataSource, props.attribute)
    if (enums && !!value) {
      value=lodash.isArray(value) ? value : [value]
      const mappedValues=value.map(v => enums[v])
      const undef=mappedValues.indexOf(undefined)
      if (undef>-1) {
        console.warn(`Constante ${value[undef]} introuvable parmi ${Object.keys(enums).join(',')}`)
        return (<h1 style={{color: 'red'}}>#ENUM ERROR</h1>)
      }
      else {
        value=joinDelimiter({array: mappedValues})
      }
    }
    // Is it an address ??
    if (value?.city) {
      value=formatAddress(value)
    }

    if (isPhoneOk(value)) {
      value=formatDisplay(value)
    }
    const conditionalProperties = getConditionalProperties(
      props,
      props.dataSource,
    )

    return (
      <Component
        {...lodash.omit(props, ['children'])}
        {...conditionalProperties}
        data-value={value}
        value={value}
      >
        {value}
      </Component>
    )
  }

  return internal
}

export default withDynamicText

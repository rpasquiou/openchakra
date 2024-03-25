import React, {useState, useMemo} from 'react'
import lodash from 'lodash'
import { ACTIONS } from '../utils/actions'
import {Select} from 'chakra-react-select'

const withDynamicSelect = Component => {
  const Internal = ({noautosave, dataSource, subDataSource, subAttribute, subAttributeDisplay, setComponentValue, isSearchable, ...props}) => {

    let values = props.dataSourceId ? dataSource: null
    let value=lodash.get(dataSource, props.attribute)
    value=value?._id || value
    const [internalValue, setInternalValue]=useState(value)

    const computeOptions = () => {

      const enumValues=props.enum ? JSON.parse(props.enum) : null
      let refValues=null
      if (subDataSource) {
        refValues=lodash.get(subDataSource, subAttribute, subDataSource)
      }
      const attribute = props.attribute

  
      const res=refValues ?
        refValues.map(v => ({ key: v?._id, value: v?._id, label: lodash.get(v, subAttributeDisplay) }))
        :
        enumValues ?
          lodash(enumValues).entries().sortBy(v => v[1]).value().map(([k, v]) => ({ key: k, value: k, label: v }))
          :
          (values || []).map(v => ({ key: v._id, value: v._id, label: attribute ? lodash.get(v, attribute) : v }))
      return res
    }

    const options=useMemo(() => computeOptions(),
      [props.enum, subDataSource, subAttribute, props.attribute]
    )

    const onChange = ev => {
      const {value} = isSearchable ? ev : ev.target
      setInternalValue(value)
      if (setComponentValue) {
        setComponentValue(props.id, value)
      }
      if (!noautosave) {
        ACTIONS.putValue({
          context: dataSource?._id,
          value: value,
          props,
        })
          .then(() => props.reload())
          .catch(err => console.error(err))
      }
    }

    if (isSearchable) {
      return (
        <Select {...props} onChange={onChange}
          options={options} placeholder={null}
        />
      )
    }

    return (
      <Component {...props} value={internalValue} onChange={onChange}>
        <option value={undefined}></option>
        {options.map(opt => (<option key={opt.key} value={opt.value}>{opt.label}</option>))}
      </Component>
    )


  }

  return Internal
}

export default withDynamicSelect

import React, {useState, useMemo} from 'react'
import lodash from 'lodash'
import { ACTIONS } from '../utils/actions'
import {Select} from 'chakra-react-select'

const withDynamicSelect = Component => {
  const Internal = ({noautosave, dataSource, subDataSource, subAttribute, subAttributeDisplay, setComponentValue, isSearchable, isMulti, ...props}) => {

    let values = props.dataSourceId ? dataSource: null
    let value=lodash.get(dataSource, props.attribute)
    value=value?._id || value
    const [internalValue, setInternalValue]=useState(value)

    if (props.setComponentAttribute) {
      props.setComponentAttribute(props.id, props.attribute)
    }
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
          lodash(enumValues).entries().value().map(([k, v]) => ({ key: k, value: k, label: v }))
          :
          (values || []).map(v => ({ key: v._id, value: v._id, label: attribute ? lodash.get(v, attribute) : v }))
      return res
    }

    const options=useMemo(() => computeOptions(),
      [props.enum, subDataSource, subAttribute, props.attribute]
    )

    const onChange = ev => {
      let value=null
      // react checkra select
      if (isSearchable || isMulti) {
        if (isMulti) {
          value=ev.map(e => e.value)
        }
        else {
          value=ev.value
        }
      }
      else {
        value=ev.target.value
      }

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
      if (props.onChange) {
        
      }
    }

    const chakraStyles={
      option: (provided, state) => ({
        ...provided,
        fontFamily: props.fontFamily || provided.fontFamily,
        backgroundColor: props.backgroundColor || provided.backgroundColor,
      }),
      container: (provided, state) => ({
        ...provided,
        minWidth: props.minWidth || provided.minWidth,
        maxWidth: props.maxWidth || provided.maxWidth,
      }),
      control: (provided, status) => ({
        ...provided, 
        fontFamily: props.fontFamily || provided.fontFamily,
        borderRadius: props.borderRadius || provided.borderRadius,
        backgroundColor: props.backgroundColor || provided.backgroundColor,
      }),
      dropdownIndicator: (provided, status) => ({
        ...provided, 
        backgroundColor: props.backgroundColor || provided.backgroundColor,
      }),
    }

    if (isSearchable || isMulti) {
      return (
        <Select {...props} onChange={onChange}
          isMulti={isMulti}
          options={options} placeholder={null}
          chakraStyles={chakraStyles}
        />
      )
    }

    console.log(props)
    return (
      <Component {...props} value={internalValue} onChange={onChange} >
        <option style={{...props}} value={undefined}></option>
        {options.map(opt => (<option style={{...props}} key={opt.key} value={opt.value}>{opt.label}</option>))}
      </Component>
    )


  }

  return Internal
}

export default withDynamicSelect

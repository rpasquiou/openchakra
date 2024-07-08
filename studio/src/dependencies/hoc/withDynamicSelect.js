import React, {useState, useMemo} from 'react'
import lodash from 'lodash'
import { ACTIONS } from '../utils/actions'
import {Select} from 'chakra-react-select'

const withDynamicSelect = Component => {
  const Internal = ({noautosave, dataSource, subDataSource, subAttribute, subAttributeDisplay, setComponentValue, isSearchable, isMulti, ...props}) => {

    let values = props.dataSourceId ? dataSource: null
    let value=lodash.get(dataSource, props.attribute)
    value=isMulti ?
      (value ? value.map(v => v?._id || v) : [])
      :
      value?._id || value
    const [internalValue, setInternalValue]=useState(value)

    if (props.setComponentAttribute) {
      props.setComponentAttribute(props.id, props.attribute)
    }
    const computeOptions = () => {

      const enumValues=props.enum ? JSON.parse(props.enum) : null
      let refValues=null
      if (subDataSource) {
        if (props.dataSourceId==props.subDataSourceId) {
          refValues=[dataSource]
        }
        else {
          refValues=subDataSource
        }
        console.log('dataSource', JSON.stringify(dataSource))
        if (subAttribute) {
          refValues=refValues.map(subData => lodash.get(subData, subAttribute))
        }
        refValues=lodash.flatten(refValues)
        if (!!refValues[0]?._id) {
          refValues=lodash.uniqBy(refValues, '_id')
        }
        
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
      if (!!dataSource && !noautosave && !props.model) {
        ACTIONS.putValue({
          context: dataSource?._id,
          value: value,
          props,
        })
          .then(() => props.reload())
          .catch(err => console.error(err))
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
      const selValue=isMulti ?
      options?.filter(opt => internalValue.some(v => v==opt.key))
      :
      options?.find(opt => opt.key==internalValue)
      return (
        <Select {...props} onChange={onChange}
          value={selValue}
          isMulti={isMulti}
          options={[{key: null, value: null, label: '<aucun>'}, ...options]} placeholder={null}
          chakraStyles={chakraStyles}
        />
      )
    }

    return (
      <Component {...props} value={internalValue} onChange={onChange}>
        <option style={{...props}} value={undefined}></option>
        {options.map(opt => (<option style={{...props}} key={opt.key} value={opt.value}>{opt.label}</option>))}
      </Component>
    )


  }

  return Internal
}

export default withDynamicSelect

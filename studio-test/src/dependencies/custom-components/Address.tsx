import { AsyncSelect } from 'chakra-react-select'
import React,  {useState} from 'react'
import axios from 'axios'
import {debounce} from 'lodash'
import lodash from 'lodash'


const Address = ({children, onChange, value, isCityOnly, ...props}: {children: React.ReactNode}) => {
  
  const [address, setAddress]=useState(lodash.isEmpty(value) ? null : lodash.isString(value) ? {city: value} : value)

  if (props.setComponentAttribute) {
    props.setComponentAttribute(props.id, props.attribute)
  }

  const addressToOption = addr => {
    return addr ?
      ({value: addr, label : isCityOnly ? addr.city : `${addr.address}, ${addr.zip_code} ${addr.city}`})
    : null
  }
  
  const _loadSuggestions = (query: string, callback) => {
    axios.get(`myAlfred/api/studio/geoloc?query=${query}&city=${isCityOnly ? 'city' : ''}`)
    .then(({data}) => {
      const suggestions=data.map(addressToOption)
      callback(suggestions)
    })
  }

  const onAddressChange = ev => {
    const value = ev?.value || null
    setAddress(value)
    onChange && onChange({target: {value}})
  }
  const loadSuggestions=debounce(_loadSuggestions, 500)
  
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
      border: 'none',
    }),
    dropdownIndicator: (provided, status) => ({
      display: 'none',
    }),
  }

  return ( 
    <AsyncSelect 
      id={props.id}
      chakraStyles={chakraStyles}
      value={addressToOption(address)}
      loadOptions={loadSuggestions} 
      noOptionsMessage={()=> 'Aucune suggestion'}
      loadingMessage={()=> 'Recherche...'}
      placeholder={isCityOnly ? 'Ville...' : 'Adresse...'}
      onChange={onAddressChange}
      isClearable 
    />
  )
}

export default Address

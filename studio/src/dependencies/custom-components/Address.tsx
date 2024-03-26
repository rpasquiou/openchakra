import { AsyncSelect } from 'chakra-react-select'
import React,  {useState} from 'react'
import axios from 'axios'
import {debounce} from 'lodash'


const Address = ({children, onChange, value, isCityOnly, ...props}: {children: React.ReactNode}) => {

  const [address, setAddress]=useState(value)

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
    setAddress(ev.value)
    onChange && onChange(ev.value)
  }
  const loadSuggestions=debounce(_loadSuggestions, 500)
  
  return ( 
    <AsyncSelect 
      value={addressToOption(address)}
      loadOptions={loadSuggestions} 
      onChange={onAddressChange} 
    />
  )
}

export default Address

import React, { useState, useEffect } from 'react'
import lodash from 'lodash'
import {Input, InputGroup, InputRightElement} from '@chakra-ui/react'
import {AiOutlineEye, AiOutlineEyeInvisible} from 'react-icons/ai'
import { ACTIONS } from '../utils/actions'
import moment from 'moment'

const CustomMonthInput = ({ value, onChange, ...props }) => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  console.log('Mode CustomMonthInput:', {
    value,
    isSafari,
    props
  })

  const formatValue = (val) => {
    if (!val) return ''
    const formattedValue = moment(val).format('YYYY-MM')
    console.log('Formatage:', { input: val, output: formattedValue })
    return formattedValue
  }

  const handleChange = (e) => {
    const newValue = e.target.value
    console.log('Changement:', { oldValue: value, newValue })
    if (onChange) {
      onChange({
        target: {
          value: newValue
        }
      })
    }
  }

  const inputProps = {
    type: isSafari ? "text" : "month",
    pattern: isSafari ? "[0-9]{4}-[0-9]{2}" : undefined,
    placeholder: isSafari ? "YYYY-MM" : undefined,
    value: formatValue(value),
    onChange: handleChange,
    ...props
  }

  console.log('Props finaux:', inputProps)

  return <Input {...inputProps} />
}

const withDynamicInput = Component => {

  const Internal = ({ dataSource, dataSourceId, noautosave, readOnly, context, suggestions, setComponentValue, displayEye, clearComponents, ...props }) => {

    let keptValue = (dataSourceId && lodash.get(dataSource, props.attribute)) || props.value

    const isADate = !isNaN(Date.parse(keptValue)) && new Date(Date.parse(keptValue));

    if (isADate instanceof Date) {
      //OPTIMIZE : better use moment to format
      const retainedDate = isADate.toLocaleString(undefined, {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute:'2-digit'})
        .split(/\s/)
      const transformedDate = `${retainedDate[0].split('/').reverse().join('-')}T${retainedDate[1]}`

      if (props?.type === 'datetime-local') {
          keptValue = transformedDate.slice(0, 16)
      }
      if (props?.type === 'date') {
        keptValue = transformedDate.slice(0, 10)
      }
      if (props?.type === 'time') {
          keptValue = transformedDate.slice(11, 16)
      }
      if (props.type === 'month') {
        return <CustomMonthInput {...props} value={keptValue} />
      }
    }

    useEffect(() => {
      if (!!props.model && clearComponents.includes(props.id)) {
        console.log(`Clear ${props.id} contents`)
        setInternalDataValue('')
      }
    }, [clearComponents])
    const [internalDataValue, setInternalDataValue] = useState(keptValue)
    const [visibilityType, setVisibilityType]= useState('password')

    const onChange = ev => {
      const val = ev.target ? ev.target.value : ev
      setInternalDataValue(val)
      if (!readOnly && !noautosave && dataSourceId) {
          ACTIONS.putValue({
            context: dataSource?._id,
            value: val,
            props,
          })
            .catch(err => {
              console.error(err)
              if (!(err.response?.status==401) && err.code!='ERR_NETWORK') {
                console.log(err.response?.data || err)
              }
            })
        }
    }

    props={...props, readOnly, value:lodash.isNil(internalDataValue) ? '' : internalDataValue}
    if (suggestions) {
      props={...props, list: 'suggestions'}
    }
    if (displayEye) {
      props={...props, type:visibilityType}
    }

    const withDisplayEye = Comp =>  {

      const toggleSecret = () => {
        setVisibilityType(visibilityType=='password' ? 'text' : 'password')
      }

      const parentProps=lodash.pick(props, 'id dataSource name dataSourceId value level model attribute noautosave readOnly context setComponentValue'.split(' '))

      return displayEye ? (
        <InputGroup {...parentProps}>
        <Component
        {...lodash.omit(props, ['id'])}
        onChange={onChange}
        />
        {suggestions && (
          <datalist id={`suggestions`}>
            {JSON.parse(suggestions).map(sugg => (
              <option key={sugg} value={sugg}/>
            ))}
          </datalist>
        )}
        {displayEye &&
          <InputRightElement>
            {visibilityType=='password' ?
            <AiOutlineEye onClick={toggleSecret} title='Afficher le mot de passe'/>
            :
            <AiOutlineEyeInvisible onClick={toggleSecret} title='Masquer le mot de passe'/>
          }
          </InputRightElement>}
        </InputGroup>
      )
      :
      (<Component {...props} setComponentValue={setComponentValue} onChange={onChange} />)
    }

    return displayEye ?
      withDisplayEye(Component)
      :
      <Component {...props} dataSource={dataSource} setComponentValue={setComponentValue} onChange={onChange}/>
  }

  return Internal
}

export default withDynamicInput

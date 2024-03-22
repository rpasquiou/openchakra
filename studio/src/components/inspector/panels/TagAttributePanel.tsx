import React, { memo } from 'react'
import { useForm } from '../../../hooks/useForm'
import lodash from 'lodash'
import { NOT_CONNECTED } from '../../../dependencies/utils/misc';
import FormControl from '../controls/FormControl'
import usePropsSelector from '../../../hooks/usePropsSelector'
import { List, Checkbox, Input } from '@chakra-ui/react'
import { getRoles } from '~core/selectors/roles'
import { useSelector } from 'react-redux'
import { MultiSelect } from 'react-multi-select-component'
import { withFilters } from '../../hoc/Filters'

const TagAttributePanel: React.FC = props => {

  const {setValue} = useForm()
  const tag = usePropsSelector('tag')

  const onTagChange = ev => {
    const {value}=ev.target
    if (/^[a-zA-Z_]*$/.test(value)) {
      setValue('tag', value.toUpperCase())
    }
    else {
      setValue('tag', tag)
    }
  }


  return (
    <FormControl htmlFor="tag" label="Tag">
      <Input
        id="tag"
        name="tag"
        size="xs"
        value={tag}
        type="text"
        onChange={onTagChange}
      />
    </FormControl>
  )
}

export default memo(TagAttributePanel)

import React, {useState, useEffect} from 'react'
import {useRouter} from 'next/router'
import Autocomplete from '@material-ui/lab/Autocomplete'
// import {ListBox} from '@headlessui/react'
import {
  TextField,
  FormControl,
  Input,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  MenuItem,
} from '@material-ui/core'
import {withTranslation} from 'react-i18next'
import {BASEPATH_EDI, RELATED} from '../../utils/feurst/consts'
import {API_PATH} from '../../utils/consts'

import {client} from '../../utils/client'
import withEdiRequest from '../../hoc/withEdiRequest'

const BaseCreate = ({
  endpoint,
  accessRights,
  wordingSection,
  t,
  createOrderId,
}) => {

  const [orderCompany, setOrderCompany] = useState(null)
  const [companies, setCompanies] = useState([])
  const [contacts, setContacts] = useState([])

  console.log(orderCompany, companies)

  const router = useRouter()

  // Possibles actions
  const isFeurstSales = accessRights.getFullAction()?.visibility==RELATED


  useEffect(() => {

    if (((orderCompany !== null && contacts.length !== false) || !isFeurstSales)) {
      createOrderId({endpoint, company: orderCompany})
        .then(data => {
          router.replace(`${BASEPATH_EDI}/${endpoint}/view/${data._id}`)
        })
        .catch(e => console.error('cant create order', e))
    }

  }, [createOrderId, endpoint, orderCompany, isFeurstSales, router])

  /* Feurst ? => Fetch companies */
  useEffect(() => {
    if (isFeurstSales) {
      const fetchCompanies = async() => {
        const companies = await client(`${API_PATH}/companies`)
        setCompanies(companies)
      }
      fetchCompanies()
    }
  }, [isFeurstSales])

  return (<>
    {isFeurstSales && contacts.length !== false ?
      <div className='container-sm mb-8'>
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={companies}
          value={orderCompany}
          onChange={(ev, value) => setOrderCompany(value)}
          getOptionLabel={option => option.name}
          sx={{width: 300}}
          renderInput={params => <TextField {...params} label="Nom de la société" />}
        />
        {orderCompany ?
          <FormControl >
            <InputLabel id="demo-mutiple-checkbox-label">Contacts</InputLabel>
            <Select
              labelId="demo-mutiple-checkbox-label"
              id="demo-mutiple-checkbox"
              multiple
              value={contacts}
              // onChange={handleChange}
              input={<Input />}
              renderValue={selected => selected.join(', ')}
              
            >
              {orderCompany.users.map(((user, i) => (
                <MenuItem key={`userCompany${i}`} value={user.id}>
                  <Checkbox />
                  <ListItemText primary={user.firstname} />
                </MenuItem>
              )))}
            </Select>
          </FormControl> : null
        }

      </div> :
      null
    }
  </>
  )
}

export default withTranslation(null, {withRef: true})(withEdiRequest(BaseCreate))

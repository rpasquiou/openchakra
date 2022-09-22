import React, {useState, useEffect} from 'react'
import {useRouter} from 'next/router'
import Autocomplete from '@material-ui/lab/Autocomplete'
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
import {BASEPATH_EDI, RELATED, ROLES} from '../../utils/feurst/consts'
import {API_PATH} from '../../utils/consts'
import {client} from '../../utils/client'
import withEdiRequest from '../../hoc/withEdiRequest'
import {NormalButton} from './Button'

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
  const router = useRouter()

  const [bookedCompany] = companies
    .filter(co => co.id == orderCompany)
  
  // Possibles actions
  const isFeurstSales = accessRights.getFullAction()?.visibility==RELATED
  
  const handleChange = event => {
    setContacts(event.target.value)
  }

  const createThisOne = async() => {
    await createOrderId({endpoint, data: {company: bookedCompany, contacts}})
      .then(data => {
        router.replace(`${BASEPATH_EDI}/${endpoint}/view/${data._id}`)
      })
      .catch(error => {
        console.error(error)
      })
  }

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
          value={orderCompany?.id}
          onChange={(ev, value) => {
            setOrderCompany(value.id)
          }}
          getOptionLabel={option => option.name}
          sx={{width: 300}}
          renderInput={params => <TextField {...params} label="Nom de la société" />}
        />
        {orderCompany ?
          <>
            <FormControl style={{marginBlock: '1rem', width: '100%'}} >
              <InputLabel id="demo-mutiple-checkbox-label">Contacts</InputLabel>
              <Select
                labelId="demo-mutiple-checkbox-label"
                id="demo-mutiple-checkbox"
                multiple
                value={contacts}
                onChange={handleChange}
                input={<Input />}
                renderValue={(selected => {
                  return bookedCompany.users
                    .filter(e => selected.includes(e.id))
                    .map(user => `${user.firstname.substr(0, 1)}. ${user.name}`)
                    .join(', ')
                })}
              >
                {bookedCompany.users.map(((user, i) => (
                  <MenuItem key={`userCompany${i}`} value={user.id}>
                    <Checkbox checked={contacts.indexOf(user.id) > -1} />
                    <ListItemText primary={`${user.firstname.substr(0, 1)}. ${user.name} - ${ROLES[user.roles[0]]}`} />
                  </MenuItem>
                )))}
              </Select>
            </FormControl>
            <div className='flex justify-end'>
              <NormalButton onClick={createThisOne} className="align-self-end">Continuer</NormalButton>
            </div>
          </>
          : null
        }

      </div> :
      null
    }
  </>
  )
}

export default withTranslation(null, {withRef: true})(withEdiRequest(BaseCreate))

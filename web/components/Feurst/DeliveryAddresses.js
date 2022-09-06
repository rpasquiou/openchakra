import React, {useEffect, Fragment, useCallback} from 'react'
import {Listbox, Transition} from '@headlessui/react'
import useAsync from '../../hooks/use-async.hook'
import {client} from '../../utils/client'
import {API_PATH} from '../../utils/consts'
import {StyledListbox} from '../../styles/feurst/StyledComponents'
import isEmpty from '../../server/validation/is-empty'

const DeliveryAddresses = ({orderid, currentAddress, setCurrentAddress, endpoint}) => {

  const {
    data,
    isLoading,
    isError,
    error,
    run,
  } = useAsync({data: []})

  const addressPattern = address => `${address.label}: ${address.address} ${address.zip_code} ${address.city}`

  /* load addresses on start */
  useEffect(() => {
    run(client(`${API_PATH}/${endpoint}/${orderid}/addresses`))
      .then(results => {
        const [mainAddress] = results.filter(address => address.label === 'Principale')
        if (isEmpty(currentAddress) && mainAddress) {
          setCurrentAddress(mainAddress)
        }
      })
      .catch(e => {
        console.error(`Can't fetch addresses in autocomplete ${e}`)
      })
  }, [currentAddress, endpoint, orderid, run, setCurrentAddress])


  return (<>
    <StyledListbox>
      <Listbox as={'div'} value={currentAddress} onChange={setCurrentAddress}>
        <Listbox.Button>
          <span>{currentAddress.address ? addressPattern(currentAddress) : 'Choisissez une adresse'}</span><span className='icon'>▲</span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          enter="enter"
          enterFrom="opacity-0 -translate-y-25"
          enterTo="opacity-100 translate-y-0"
          leave="leave"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 -translate-y-25"
        >
          <Listbox.Options>
            {data.map(address => (
              <Listbox.Option key={`${address._id}`} value={address} className={({active}) => (active ? 'active' : '')} >
                {({selected}) => (selected ? <>{addressPattern(address)}<span>✓</span></> : <>{addressPattern(address)}</>)}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </StyledListbox>
    
  </>

  )


}


export default DeliveryAddresses

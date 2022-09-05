import React, {useState} from 'react'
import styled from 'styled-components'
import {withTranslation} from 'react-i18next'
import PureDialog from '../Dialog/PureDialog'
import isEmpty from '../../server/validation/is-empty'
import {Label, Input} from './components.styles'
import {NormalButton} from './Button'


const DialogOrderRef = ({
  isOpenDialog,
  setIsOpenDialog,
  convert,
  orderid,
  endpoint,
}) => {

  const [orderRef, setOrderRef] = useState('')

  return (
    <StyledDialog
      open={isOpenDialog}
      onClose={() => setIsOpenDialog(false)}
    >

      <h2>Dernière étape avant la conversion en commande</h2>
        
      <p>Veuillez renseigner la référence pour la commande.</p>

      <div className='flex flex-wrap gap-x-2 items-center mb-6'>
        <Label htmlFor='orderref'>Référence commande</Label>
        <Input id='orderref' value={orderRef} onChange={e => setOrderRef(e.target.value)} placeholder={''} />
      </div>

      <NormalButton
        rounded={'full'}
        className={'w-full'}
        disabled={isEmpty(orderRef)}
        bgColorDisabled={'rgba(180, 180, 180, 0.4)'}
        bgColor={'#fff'}
        textColor={'#141953'}
        borderColor={'1px solid #141953'}
        onClick={() => convert({endpoint, orderid, reference: orderRef})}
      >
        Convertir en commande
      </NormalButton>

    </StyledDialog>
  )
}


const StyledDialog = styled(PureDialog)`
  
  .dialogcontent {
    padding: var(--spc-10);
  }

  h2 {
    color: var(--black);
  }

  p {
    font-size: var(--text-lg);
  }

  .info {
    display: inline-flex;
    align-items: center;
    justify-content: center;  
    width: var(--spc-6);
    height: var(--spc-6);
    border-radius: var(--rounded-full);
    background-color: var(--brand-color);
    color: var(--white);
  }

  
 
`

export default withTranslation(null, {withRef: true})(DialogOrderRef)

import React, { memo } from 'react'
import SwitchControl from '~components/inspector/controls/SwitchControl'

const AddressPanel = () => {

  return (
    <>
      <SwitchControl name='isCityOnly' label='City only' />
    </>
  )
}

export default memo(AddressPanel)
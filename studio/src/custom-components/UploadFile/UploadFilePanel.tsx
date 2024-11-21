import React, { memo, useState } from 'react'
import SwitchControl from '~components/inspector/controls/SwitchControl'
import usePropsSelector from '~hooks/usePropsSelector'
import TextControl from '~components/inspector/controls/TextControl'
import { Accordion } from '@chakra-ui/react'
import AccordionContainer from '~components/inspector/AccordionContainer'
import ColorsControl from '~components/inspector/controls/ColorsControl'
import BorderPanel from '~components/inspector/panels/styles/BorderPanel'

const UploadFilePanel = () => {
  
  const noticemsg = usePropsSelector('notifmsg')
  const preview = usePropsSelector('preview')
  const previewType = usePropsSelector('previewtype')

  const [border, setBorder] = useState('')
  const [borderRadius, setBorderRadius] = useState('')

  return (
    <>
      <SwitchControl label="Confirmation Message" name="notifmsg" />
      {noticemsg && <TextControl name="okmsg" label="OK message" />}

      <SwitchControl label="File Name" name="previewmsg" />

      <SwitchControl label="Preview" name="preview" />

      {preview && (
        <SwitchControl label="Miniature/Modal" name="previewtype" />
      )}

      {preview && previewType &&(
        <Accordion allowMultiple>
          <AccordionContainer title="Button Style">
          <ColorsControl
              withFullColor
              label="Button Color"
              name="buttoncolor"
              enableHues
            />
            <ColorsControl
              withFullColor
              label="Button Background Color"
              name="buttonbg"
              enableHues
            />
            <ColorsControl
              withFullColor
              label="Button Hover Color"
              name="buttonhovercolor"
              enableHues
            />
            <ColorsControl
              withFullColor
              label="Button Hover Background Color"
              name="buttonhoverbg"
              enableHues
            />
            <BorderPanel
              border={border}
              borderRadius={borderRadius}
              setBorder={setBorder}
              setBorderRadius={setBorderRadius}
            />
          </AccordionContainer>
        </Accordion>
      )}
    </>
  )
}

export default memo(UploadFilePanel)

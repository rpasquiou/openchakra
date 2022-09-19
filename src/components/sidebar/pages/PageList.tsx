import React from 'react'
import { Box, Button, Image, List, ListItem, useDisclosure } from '@chakra-ui/react'
import { useSelector } from 'react-redux'
import { getPages } from '~core/selectors/components'
import useDispatch from '~hooks/useDispatch'
import PageSettings from './PageSettings'

const PageActions = ({ page }: {page: string}) => {
  const dispatch = useDispatch()

  const {  onOpen, isOpen, onClose } = useDisclosure()

  const deleteP = async elem => {
    await new Promise(() => dispatch.components.deletePage(elem)).then(a =>
      console.log(a),
    )
  }

  const edit = async elem => {
    // await new Promise(() => dispatch.components.editPage(elem)).then(a =>
    //   console.log(a),
    // )
  }

  const buttonProps = {
    p: 0,
    w: '30px',
    h: '30px',
    minWidth: 'auto',
    minHeight: 'auto',
  }

  return (
    <>
      <Button {...buttonProps} onClick={onOpen}>
        <Image w={'30px'} title='Edit' src='/icons/edit.svg' />
      </Button>
      <PageSettings isOpen={isOpen} onClose={onClose} page={page} />
      
      <Button {...buttonProps} onClick={() => deleteP(page)}>
        <Image w={'30px'} title="Edit" src="/icons/delete.svg" />
      </Button>
      <Button {...buttonProps} onClick={() => console.log('Nothing yet')}>
        <Image w={'30px'} title="Save" src="/icons/save.svg" />
      </Button>
    </>
  )
}

const PageList = () => {
  const pages = useSelector(getPages)
  const dispatch = useDispatch()

  return (
    <List>
      {Object.entries(pages).map(([page, params], i) =>  {

        const isIndex = params.indexpage
      
       return (
        <ListItem
          key={i}
          display={'flex'}
          justifyContent={'space-between'}
          alignItems="center"
          color="black"
          paddingBlock={2}
          borderBottom={'1px solid black'}
        >
          <Button
            p={0}
            bg={'transparent'}
            color="black"
            whiteSpace={'normal'}
            wordBreak={'break-all'}
            overflow={'hidden'}
            textAlign={'left'}
            onClick={() => dispatch.components.setActivePage(page)}
            fontWeight={isIndex ? 'bold': 'normal'}
          >
            {params.name}
          </Button>
          <Box display={'flex'} alignItems="center">
            <PageActions page={page} />
          </Box>
        </ListItem>
      )})}
    </List>
  )
}

export default PageList

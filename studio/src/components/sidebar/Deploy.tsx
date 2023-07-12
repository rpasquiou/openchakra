import React, {useState, useEffect} from 'react'
import { useSelector } from 'react-redux'
import { Button, CheckboxGroup, Flex, Checkbox, useToast, Modal, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Input } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { ProjectState } from '~core/models/project'
import { getFullComponents } from '~core/selectors/components'
import { deploy } from '../../utils/deploy'
import { getModels } from '../../core/selectors/dataSources';
import isEmpty from 'lodash/isEmpty'

const deployComponents = (pages, state: ProjectState, models: any, toast: any) => {
  toast({
    title: 'Starting publishing',
    status: 'success',
    position: 'top',
    duration: 2000,
    isClosable: true,
  })
  return deploy(pages, state, models)
    .then(() => {
      toast({
        title: 'Published on production',
        status: 'success',
        position: 'top',
        duration: 2000,
        isClosable: true,
      })
    })
    .catch(err => {
      console.error(err)
      toast({
        title: 'Error while publishing',
        description: String(err),
        status: 'error',
        position: 'top',
        duration: 2000,
        isClosable: true,
      })
      throw err
    })
}

const Deploy = () => {
  const toast = useToast()
  const state = useSelector(getFullComponents)
  const [deploying, setIsDeploying]=useState(false)
  const models = useSelector(getModels)
  const [isModalDeployOpen, setModalDeployOpen] = useState(false)
  const [textFilter, setTextFilter] = useState('')
  const [selectedPages, setSelectedPages] = useState(Object.keys(state.pages))

  const onPagesChange = ev => {
    setSelectedPages(ev)
  }

  const reset = () => {
    setIsDeploying(false)
    setModalDeployOpen(false)
    setTextFilter('')
    setSelectedPages(Object.keys(state.pages))
  }

  const onDeployClick = () => {
    setIsDeploying(true)
	deployComponents(selectedPages, state, models, toast)
      .finally(()=> reset())
  }

  return (
   <>
    <DeployButton
      onClick={() => {
        setModalDeployOpen(true)
      }}
      disabled={isModalDeployOpen}
    >
      {deploying ? 'Deploying...' : 'Deploy'}
    </DeployButton>
     {isModalDeployOpen &&
      <Modal isOpen={isModalDeployOpen} onClose={()=>reset()}>
        <ModalContent maxW="50%">
          <ModalHeader>Select page(s) 
            <Button onClick={()=>setSelectedPages(Object.keys(state.pages))}>All</Button>
            <Button onClick={()=>setSelectedPages([])}>None</Button>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody flexDirection='row'>
            <Input onChange={ev => setTextFilter(ev.target.value)}/>
            <Flex direction='column'>
            <CheckboxGroup onChange={onPagesChange} value={selectedPages}>
            {Object.values(state.pages)
               .filter(p => new RegExp(textFilter, 'i').test(p.pageName))
               .map(p => (<Checkbox value={p.pageId}>{p.pageName}</Checkbox>))}
            </CheckboxGroup>
            </Flex>
            <Button 
              isLoading={deploying} 
              isDisabled={isEmpty(selectedPages)} 
              onClick={onDeployClick}
            >
              Deploy {selectedPages.length} pages
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    } 

   </>
  )
}

const DeployButton = styled.button`
  color: ${props => props.disabled ? 'var(--primary-color)' : 'white'};
  display: flex;
  height: min-content;
  font-weight: bold;
  border-radius: 1rem;
  background-color: ${props => props.disabled ? 'white' : 'var(--primary-color)'};
  padding-inline: 0.7rem;
  padding-block: 0.2rem;
`

export default Deploy

export const displayError = ({toast, title='Erreur', message, onClose}) => {
  toast({
    title: title,
    description: message,
    status: 'error',
    duration: 6000,
    isClosable: true,
  })
}

export const displaySuccess = ({toast, title='Information', message, onClose}) => {
  toast({
    title: title,
    description: message,
    status: 'success',
    duration: 6000,
    isClosable: true,
  })
}

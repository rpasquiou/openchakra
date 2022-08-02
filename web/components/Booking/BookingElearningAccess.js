import React from 'react'
import styled from 'styled-components'
import {screen} from '../../styles/screenWidths'
import {BookingPreviewActionButton, BookingPreviewActionLink} from '../Actions/Actions'
import {BOOK_STATUS} from '../../utils/consts'

const BookingElearningAccess = ({booking}) => {
  
  const isConfirmedBooking = booking.status === BOOK_STATUS.CONFIRMED

  const receiveAccessByMail = () => {
    // WIP
  }

  console.log(booking.elearning_link)

  return (<ElearningAccess locked={isConfirmedBooking}>
    <h3>Vos accès au contenu e-learning</h3>
    <BookingPreviewActionButton onClick={receiveAccessByMail}>Recevoir mes accès par mail</BookingPreviewActionButton>
    <BookingPreviewActionLink href={booking.elearning_link} >
      Accéder à mon parcours de formation
    </BookingPreviewActionLink>
  
  </ElearningAccess>
  )

}

const ElearningAccess = styled.div`

  background-color: var(--booking-background);

  ${props => {
  if (!props.locked) {
    return `
      opacity: 0.2;
      
      a, button {
        cursor: not-allowed;
      }
    `
  }
}
  
  };

  
  h3 {
    color: var(--black);
    @media (${screen.sm}) {
      margin-left: var(--booking-left-margin); 
      margin-block-start: 0;
    }
  }



`

export default BookingElearningAccess

import React, {useCallback, useEffect, useState} from 'react'
import Router, {useRouter} from 'next/router'
// import DateField from '@internationalized/date'
import ReactHtmlParser from 'react-html-parser'
import sum from 'lodash/sum'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'
import {withTranslation} from 'react-i18next'
import DatePicker from 'react-datepicker'
import TextField from '@material-ui/core/TextField'
import ButtonSwitch from '../../ButtonSwitch/ButtonSwitch'
import BookingDetail from '../../BookingDetail/BookingDetail'
import {useUserContext} from '../../../contextes/user.context'
import {snackBarError} from '../../../utils/notifications'
import {getDataModel} from '../../../config/config'
import {client} from '../../../utils/client'
import {API_PATH, LOCATION_CLIENT, LOCATION_ALFRED, LOCATION_VISIO, LOCATION_ELEARNING} from '../../../utils/consts'
import {getExcludedDays} from '../../../utils/dateutils'
import CPF from '../Payments/CPF'
import StyledDrawerBooking from './StyledDrawerBooking'

const labelLocations = {
  [LOCATION_CLIENT]: `à mon adresse principale`,
  [LOCATION_ALFRED]: name => `chez ${name}`,
  [LOCATION_VISIO]: `en visio`,
  [LOCATION_ELEARNING]: `en e-learning`,
}

const PureDrawerBooking = ({
  t,
  serviceUserId,
  onlyOneService,
  onClose,
}) => {

  const {user} = useUserContext()
  const router = useRouter()

  const [bookingParams, setBookingParams] = useState({
    serviceUser: {},
  })
  const [booking, setBooking] = useState({
    date: new Date(),
    location: null,
    extrapayment: false, // example: CPF
    prestations: {},
  })

  const [locations, setLocations] = useState([])
  const [prices, setPrices]=useState({})
  const [pricedPrestations, setPricedPrestations]=useState({})
  const [pending, setPending]=useState(false)
  const [shop, setShop] = useState(null)


  const computeTotal = useCallback(async({
    serviceUserId,
    date,
    prestations,
    location,
    extrapayment,
  }) => {

    const compute = await client('/myAlfred/api/booking/compute', {data: {
      serviceUserId,
      date,
      prestations,
      location,
      cpf: extrapayment,
    }})
      .catch(error => {
        console.error(error)
        if (error.info) {
          snackBarError(error?.info.message)
        }
      })

    compute && setPrices(compute)

  }, [location, booking.prestations, booking.date])


  const book = async(e, actual) => { // actual : true=> book, false=>infos request

    e.preventDefault()

    if (pending) {
      snackBarError(ReactHtmlParser(t('USERSERVICEPREVIEW.snackbar_error_resa')))
      return
    }

    let bookingObj = {
      serviceUserId,
      location: booking.location,
      prestations: booking.prestations,
      cpf: booking.extrapayment,
      date: booking.date,
      customer_booking: null,
      informationRequest: !actual,
    }


    localStorage.setItem('bookingObj', JSON.stringify(bookingObj))

    if (!user) {
      localStorage.setItem('path', Router.asPath)
      router.push('/?login=true')
      return
    }

    setPending(true)
    client(`${API_PATH}/booking`, {data: bookingObj})
      .then(response => {

        const {redirectURL, extraURLs} = response

        if (extraURLs) {
          window && extraURLs.forEach(url => {
            window.open(url, '_blank')
          })
        }

        router.push(redirectURL)
      })
      .catch(error => {
        if (error.info) {
          snackBarError(error?.info.message)
        }
      })
      .finally(() => {
        setPending(false)
      })

  }

  const onBookingDateChange = selecteddate => {
    setBooking({...booking, date: selecteddate})
  }

  const onBookingLocationChange = place => {
    setBooking({...booking, location: place})
  }

  const onBookingPaymentChange = () => {
    setBooking({...booking, extrapayment: !booking.extrapayment})
  }

  useEffect(() => {
    const pricedPrestas={}
    bookingParams?.prestations && bookingParams?.prestations.forEach(p => {
      if (booking.prestations[p._id]) {
        pricedPrestas[p.prestation.label] = booking.prestations[p._id] * p.price
      }
    })
    setPricedPrestations(pricedPrestas)
  }, [booking.prestations])

  useEffect(() => {
    computeTotal({
      location: booking.location,
      serviceUserId,
      prestations: booking.prestations,
      date: booking.date,
      extrapayment: booking.extrapayment,
    })
  }, [serviceUserId, booking.date, computeTotal, booking.location, booking.prestations, booking.extrapayment])

  useEffect(() => {

    const settle = async id => {
      if (id) {
        const serviceUser = await client(`${API_PATH}/serviceUser/${id}`)
          .catch(err => console.error(`cant fetch serviceUser`, err))

        const setUpBooking = {...booking}

        if (onlyOneService) {
          Object.assign(setUpBooking, {prestations: {[serviceUser.prestations[0]._id]: 1}})
        }

        // Force location if only one option
        const places = Object.entries(serviceUser?.location).filter(([place, proposed]) => proposed)
        setLocations(places)
        if (places.length === 1) {
          const [justOnePlace] = places
          Object.assign(setUpBooking, {location: justOnePlace[0]})
        }

        setBooking(setUpBooking)

        const availabilities = serviceUser && await client(`${API_PATH}/availability/userAvailabilities/${serviceUser.user._id}`)
          .catch(err => console.error(err))

        availabilities && setBookingParams({
          serviceUser,
          availabilities,
          excludeddates: getExcludedDays(availabilities),
          onePlace: places.length === 1,
        })

        const shop = serviceUser && await client(`${API_PATH}/shop/alfred/${serviceUser.user._id}`)
          .catch(err => console.error(err))
        shop && setShop(shop)

      }
    }

    settle(serviceUserId)

  }, [])

  const theme = getDataModel()

  const serviceToDisplay = bookingParams?.serviceUser && bookingParams?.serviceUser?.service
  const prestaToDisplay = onlyOneService && bookingParams?.serviceUser?.prestations && onlyOneService && bookingParams?.serviceUser?.prestations[0] || null

  const canBook = bookingParams?.serviceUser && booking?.location && booking?.prestations && sum(Object.values(booking.prestations)) > 0 && booking?.date

  return (
    <StyledDrawerBooking theme={theme} >

      {/* Titre */}
      <h3>{bookingParams?.serviceUser?.service?.label} - {bookingParams?.serviceUser?.user?.firstname}</h3>

      <form className='container-sm'>

        {/* CPF compatible */}
        {bookingParams?.serviceUser?.cpf_eligible && <CPF
          payWithCPF={booking.extrapayment}
          setPayWithCPF={onBookingPaymentChange}
        />}

        {/* Date - Date/heure */}
        <section className='date'>
          <label htmlFor='booking_date'>Date</label>
          <TextField
            id={'booking_date'}
            InputLabelProps={{
              shrink: true,
            }}
            InputProps={{
              inputComponent: () => {
                return (
                  <DatePicker
                    id={'booking_date'}
                    selected={booking.date}
                    dateFormat='dd/MM/yyyy'
                    onChange={onBookingDateChange}
                    placeholderText='Date'
                    locale='fr'
                    minDate={new Date()}
                    excludeDates={bookingParams?.excludeddates}
                  />
                )
              },
              disableUnderline: true,
            }}
          />

        </section>

        {/* Prestations */}
        <section className='prestations'>
          <h4>Détails</h4>
          {onlyOneService ? <div className='training'>
            <dl>
              <dt>{prestaToDisplay?.prestation?.label}</dt>
              <dd>{prestaToDisplay?.prestation && prestaToDisplay.price} €</dd>
              <dt>Durée</dt>
              <dd>{serviceToDisplay?.duration_days} jours</dd>
            </dl>
          </div> : null}

        </section>

        {/* Lieu de la prestation */}
        <section>
          {bookingParams.onePlace ?
            <p>formation {labelLocations[booking.location]}</p>
            : <Accordion >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon/>}
                id="bookinglocations_content"
                aria-controls="bookinglocations_header"
              >
                {ReactHtmlParser(t('DRAWER_BOOKING.presta_place'))}
              </AccordionSummary>
              <AccordionDetails >
                {
                  Object.entries(locations).map(([key, label]) => (
                    <ButtonSwitch
                      key={key}
                      id={key}
                      label={label}
                      isEditable={false}
                      isPrice={false}
                      isOption={false}
                      checked={location==key}
                      onChange={onBookingLocationChange}/>
                  ))
                }
              </AccordionDetails>
            </Accordion>
          }
        </section>

        {/* Détails */}

        <BookingDetail
          {...prices}
          prestations={pricedPrestations}
          count={booking.prestations}
          travel_tax={0}
          pick_tax={0}
          alfred_pro={shop?.is_professional}
        />


        {/* Message d'information (TODO in children ?)*/}

        <p className='tip'>
          <span className='img'>💡</span>
        Votre demande de réservation doit être approuvée par l'Aftral. Vous recevrez vos accès au contenu de la formation dès lors que votre réservation sera confirmée
        </p>

        <button
          type='submit'
          disabled={!canBook}
          onClick={e => book(e, true)}
          className={'custombookinresabutton'}
        >

          {booking.extrapayment ? ReactHtmlParser(t('DRAWER_BOOKING.resa_button')) : ReactHtmlParser(t('DRAWER_BOOKING.buy_button'))}
        </button>

        {prices.total !== 0
          && <p className={'custombookinginfoprice'}>{ReactHtmlParser(t('DRAWER_BOOKING.next_step_paiment'))}</p>}

        <button
          type='button'
          disabled={!canBook}
          onClick={e => book(e, false)}
          className={'custombookingaskinfo button_info'}
        >
          <HelpOutlineIcon /> {ReactHtmlParser(t('DRAWER_BOOKING.button_info'))}
        </button>

      </form>

    </StyledDrawerBooking>
  )
}

export default withTranslation('custom', {withRef: true})(PureDrawerBooking)

const moment = require('moment')
const { BadRequestError, NotFoundError, ForbiddenError } = require('../../utils/errors')
const {
  sendForgotPassword,
  sendBookingRefused2Member,
  sendBookingCancelled2Member,
  sendBookingCancelled2Admin,
  sendNewBookingToMember,
} = require('./mailing')
const bcryptjs = require('bcryptjs')
const { generatePassword } = require('../../../utils/passwords')
const User = require('../../models/User')
const {
  getEventGuestsCount,
  getEventGuests,
  inviteGuest,
  registerToEvent,
  unregisterFromEvent,
  removeOrderItem,
  setOrderItem,
} = require('./functions')
const lodash=require('lodash')
const Payment = require('../../models/Payment')
const Event = require('../../models/Event')
const Booking = require('../../models/Booking')
const UserSessionData = require('../../models/UserSessionData')
const OrderItem = require('../../models/OrderItem')
const {addAction, setAllowActionFn} = require('../../utils/studio/actions')
const {
  FUMOIR_MANAGER,
  FUMOIR_MEMBER,
  FUMOIR_CHEF,
  FUMOIR_ADMIN,
  PAYMENT_SUCCESS,
  CONFIRMATION_STATUS_CONFIRMED,
  CONFIRMATION_STATUS_WAITING,
  CONFIRMATION_STATUS_REFUSED,
  CONFIRMATION_STATUS_CANCELED,
} = require('./consts')
const {idEqual}=require('../../utils/database')

const inviteGuestAction=({parent, email, phone}, user) => {
  return inviteGuest({eventOrBooking: parent, email, phone}, user)
}


const registerToEventAction=({value}, user) => {
  return registerToEvent({event: value, user})
}

const unregisterFromEventAction=({value}, user) => {
  return unregisterFromEvent({event: value, user})
}

const removeOrderItemAction=({context, parent}) => {
  return removeOrderItem({order: context, item: parent})
}

const setOrderItemAction=({context, parent, quantity}) => {
  return setOrderItem({order: context, product: parent, quantity})
}

const forgotPasswordAction=({context, parent, email}) => {
  console.log(`Email:${email}`)
  return User.findOne({email})
   .then(user => {
     if (!user) {
       throw new BadRequestError(`Aucun compte n'est associé à cet email`)
     }
     const password=generatePassword()
     user.password=bcryptjs.hashSync(password, 10)
     return user.save()
       .then(user => sendForgotPassword({user, password}))
       .then(user => `Un email a été envoyé à l'adresse ${email}`)
   })
}

addAction('inviteGuest', inviteGuestAction)
addAction('registerToEvent', registerToEventAction)
addAction('unregisterFromEvent', unregisterFromEventAction)
addAction('removeOrderItem', removeOrderItemAction)
addAction('setOrderItem', setOrderItemAction)
addAction('forgotPassword', forgotPasswordAction)

const confirmBookingAction=({value}, user) => {
  return isActionAllowed({action: 'confirmBooking', dataId: value, user})
   .then(() => Booking.findByIdAndUpdate(value, {confirmation_status: CONFIRMATION_STATUS_CONFIRMED}))
   .then(() => Booking.findById(value).populate('booking_user'))
   .then(booking => sendNewBookingToMember({booking}))
}
addAction('confirmBooking', confirmBookingAction)

const refuseBookingAction=({value, reason}, user) => {
  return isActionAllowed({action: 'refuseBooking', dataId: value, user})
  .then(() => Booking.findByIdAndUpdate(value,{
    confirmation_status:CONFIRMATION_STATUS_REFUSED,
    refused_reason:reason
  }))
  .then(() => Booking.findById(value).populate('booking_user'))
  .then(booking => sendBookingRefused2Member({booking}))
}
addAction('refuseBooking', refuseBookingAction)

const cancelBookingAction=({value, reason}, user) => {
  return isActionAllowed({action: 'cancelBooking', dataId: value, user})
   .then(() => Booking.findByIdAndUpdate(value, {
     confirmation_status: CONFIRMATION_STATUS_CANCELED,
     reason
   }))
   .then(() => Booking.findById(value).populate('booking_user'))
   .then(booking => {
     sendBookingCancelled2Member({booking})
     return User.find({role: {$in: [FUMOIR_CHEF, FUMOIR_ADMIN, FUMOIR_MANAGER]}})
       .then(admins=>Promise.all(admins.map(admin => sendBookingCancelled2Admin({booking, admin}))))
   })
}
addAction('cancelBooking', cancelBookingAction)

const archiveOrderAction=({value}, user) => {
  return isActionAllowed({action: 'archiveOrder', dataId: value, user})
   .then(() => OrderItem.findByIdAndUpdate(value, {archived: true}))
}
addAction('archiveOrder', archiveOrderAction)

const isActionAllowed = ({action, dataId, user}) => {
  if (action=='payEvent') {
    return Promise.all([
      Event.findById(dataId),
      Payment.find({event: dataId, event_member: user, status: PAYMENT_SUCCESS}),
    ])
      .then(([ev, payments]) => {
        if (!ev) { return false }
        return getEventGuestsCount(user._id, {}, {_id: dataId})
          .then(guests_count => {
            const already_paid=lodash(payments).map('amount').sum()
            const reminingToPay=ev.price*guests_count-already_paid
            return reminingToPay>0
          })
      })
  }
  if (action=='payOrder') {
    if (user.role!=FUMOIR_MEMBER) {
      return Promise.resolve(false)
    }
    return Booking.findById(dataId)
      .populate('items')
      .populate('payments')
      .then(o => o?.paid==false)
  }
  if (action=='cashOrder') {
    if (user.role!=FUMOIR_MANAGER) {
      return Promise.resolve(false)
    }
    return Booking.findById(dataId)
      .populate('items')
      .populate('payments')
      .then(o => o.remaining_total>0)
  }
  if (action=='registerToEvent') {
    return Event.findById(dataId)
      .populate('invitations')
      .then(event=> {
        if(!event) return false
        if (moment(event.start_date).isBefore(moment())) {return false}
        if (event.people_count>=event.max_people) { return false}
        const selfMember=event.invitations.find(m => idEqual(m.member._id, user._id))
        if (selfMember) { return false}
        return true
      })
  }
  if (action=='inviteGuest') {
    return Promise.all([Booking.findById(dataId).populate('guests'), Event.findById(dataId)])
      .then(([booking, event]) => {
        if (!booking && !event) {
          throw new NotFoundError(`No booking or event with id ${dataId}`)
        }
        if (event) {
          if (event.people_count>=event.max_people) { return false}
          return getEventGuests(user._id, null, event)
            .then(guests => guests.length==0)
        }
        if (booking) {
          if (booking.guests.length>=booking.guests_count) { return false}
          return true
        }
      })
  }

  if (action=='unregisterFromEvent') {
    return Event.findById(dataId)
      .populate({path: 'invitations', populate: 'member'})
      .then(ev=> {
        if (moment(ev.start_date).isBefore(moment())) { return false }
        return ev.invitations?.some(i => idEqual(i.member._id, user._id))
      })
  }
  if (action=='confirmBooking') {
    if (!([FUMOIR_CHEF, FUMOIR_ADMIN, FUMOIR_MANAGER].includes(user?.role))) {
      return Promise.reject(new ForbiddenError(`Vous n'êtes pas autorisé à confirmer une réservation`))
    }
    return Booking.findById(dataId)
      .then(booking => booking.confirmation_status==CONFIRMATION_STATUS_WAITING)
  }
  if (action=='refuseBooking') {
    if (!([FUMOIR_CHEF, FUMOIR_ADMIN, FUMOIR_MANAGER].includes(user?.role))) {
      return Promise.reject(new ForbiddenError(`Vous n'êtes pas autorisé à refuser une réservation`))
    }
    return Booking.findById(dataId)
      .then(booking => booking.confirmation_status==CONFIRMATION_STATUS_WAITING)
  }
  if (action=='cancelBooking') {
    return Booking.findById(dataId)
      .then(booking => {
        return (user?.role!=FUMOIR_MEMBER || idEqual(booking.booking_user._id, user._id))
        && [CONFIRMATION_STATUS_WAITING, CONFIRMATION_STATUS_CONFIRMED].includes(booking.confirmation_status)
      })
  }
  if (action=='archiveOrder') {
    return OrderItem.findById(dataId)
      .then(order => !order.archived)
  }
  return Promise.resolve(true)
}

setAllowActionFn(isActionAllowed)

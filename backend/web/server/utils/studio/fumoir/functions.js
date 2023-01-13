const mongoose = require('mongoose')
const lodash=require('lodash')
const moment=require('moment')
const {
  declareComputedField,
  declareEnumField,
  declareVirtualField,
  getModel,
  setFilterDataUser,
  setPostCreateData,
  setPreCreateData,
  setPreprocessGet,
} = require('../../database')
const UserSessionData = require('../../../models/UserSessionData')
const User = require('../../../models/User')
const Booking = require('../../../models/Booking')
const {generate_id} = require('../../../../utils/consts')
const Message = require('../../../models/Message')
const {
  EVENT_STATUS,
  FUMOIR_MEMBER,
  PLACES,
  ROLES,
  MAX_EVENT_GUESTS,
} = require('../../../../utils/fumoir/consts')
const Guest = require('../../../models/Guest')
const {BadRequestError, NotFoundError} = require('../../errors')
const OrderItem = require('../../../models/OrderItem')
const Product = require('../../../models/Product')
const Order = require('../../../models/Order')
const Event = require('../../../models/Event')

const inviteGuest = ({eventOrBooking, email, phone}, user) => {
  return getModel(eventOrBooking)
    .then(modelName => {
      if (!['booking', 'event'].includes(modelName)) {
        throw new BadRequestError(`Found model ${modelName} for ${eventOrBooking}, should be event or booking`)
      }
      if (modelName=='booking') {
        return Booking.findById(eventOrBooking)
          .populate('guests')
          .then(booking => {
            if (booking.guests.find(g => g.email==email)) {
              throw new BadRequestError(`${email} est déjà invité pour cet événement`)
            }
            if (booking.guests.length>=booking.guests_count) {
              throw new BadRequestError(`Vous avez déjà envoyé ${booking.guests.length} invitations`)
            }
            return Guest.create({email, phone})
              .then(guest => {
                booking.guests.push(guest._id)
                return booking.save()
              })
          })
        return Guest.create({email, phone})
          .then(guest => Booking.findByIdAndUpdate(eventOrBooking, {$push: {guests: guest}}))
      }
      if (modelName=='event') {
        return UserSessionData.findOneAndUpdate({user: user._id},
          {user: user._id},
          {upsert: true, runValidators: true, new: true},
        )
          .populate({path: 'guests', populate: 'guest'})
          .then(r => {
            // Must not invite the same email twice
            if (r.guests.find(g => g.guest.email==email)) {
              throw new BadRequestError(`${email} est déjà invité pour cet événement`)
            }
            // Must not invite too many people
            const actualGuestsCount=r.guests.filter(g => g.event._id.toString()==eventOrBooking).length
            console.log(`Dejà ${actualGuestsCount} invités`)
            if (actualGuestsCount+1>MAX_EVENT_GUESTS) {
              throw new BadRequestError(`Le nombre d'invités maximum est ${MAX_EVENT_GUESTS} pour un événement`)
            }
            return getEventGuestsCount(user, null, {_id: eventOrBooking})
              .then(count => {
                if (actualGuestsCount+1>count) {
                  throw new BadRequestError(`Nombre d'invités (${count}) déjà atteint`)
                }
                return Guest.create({email, phone})
                  .then(guest => {
                    r.guests.push({event: eventOrBooking, guest: guest._id})
                    return r.save()
                  })
              })
          })
      }
    })
}

const setOrderItem = ({order, product, quantity}) => {
  return Order.findById(order)
    .populate('items')
    .then(order => {
      if (!order) {
        throw new NotFoundError(`Commande ${order} introuvable`)
      }
      const item = order.items.find(i => i.product.toString() == product)
      if (item) {
        item.quantity = parseInt(quantity)
        return item.save()
      }
      return Product.findById(product)
        .then(product =>
          OrderItem.create({
            product: product,
            price: product.price,
            vat_rate: product.vat_rate,
            quantity,
          }),
        )
        .then(item =>
          Order.findByIdAndUpdate(
            order,
            {$push: {items: item}},
            {new: true},
          ),
        )
    })
}

const removeOrderItem = ({order, item}) => {
  return Order.findByIdAndUpdate(order, {$pull: {items: item}})
    .then(() => {
      return OrderItem.findByIdAndRemove(item)
    })
    .then(res => {
      console.log(res)
      return res
    })
}

const payOrder = ({order, redirect, user}) => {
  console.log(`Have to redirect to ${redirect}`)
  return getModel(order)
   .then(model => {
     if (model=='event') {
       return Promise.all([
         UserSessionData.findOneAndUpdate({user: user._id},
         {user: user._id},
         {upsert: true, runValidators: true, new: true}),
         Event.findById(order)
       ])
       .then(([usd, ev]) => {
         usd.payments.push({event: order, amount: ev.price, date: moment()})
         return usd.save()
       })
       .then(() => ({redirect}))
     }
     if (model=='order') {
      return Order.findById(order)
        .then(order => {
          if (!order) { throw new NotFoundError(`Order ${order} not found`) }
          console.log(`Items are ${JSON.stringify(order.items)}`)
          return OrderItem.updateMany({_id: {$in: order.items.map(i => i._id)}}, {$set: {paid: true}})
        })
        .then(() => ({redirect}))
    }
  })
}

const registerToEvent = ({event, user}) => {
  console.log(`Adding ${user} to event ${event}`)
  return Event.findByIdAndUpdate(event, {$addToSet: {members: user}})
}

const preCreate = ({model, params}) => {
  if (model=='user') {
    return User.findOne({email: params.email})
      .then(user => {
        if (user) {
          throw new BadRequestError(`Le compte ${params.email} existe déjà`)
        }
        params={...params, password: generate_id()}
        return Promise.resolve({model, params})
      })
  }
  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)

const postCreate = ({model, params, data}) => {
  if (model=='booking') {
    return Order.create({booking: data._id})
      .then(order => {
        console.log(`Created ${order}`)
        data.orders=[order]
        return data.save()
      })
  }
  if (model=='user') {
    console.log(`Sending mail to ${params.email} with temp password ${params.password}`)
  }

  return Promise.resolve(data)
}

setPostCreateData(postCreate)

const filterDataUser = ({model, data, id, user}) => {

  // List mode
  if (!id) {
    if (model == 'category') {
      const allChildren=lodash.flattenDeep(data.map(d => (d.children||[]).map(c => c._id)))
      return data.filter(d => !allChildren.includes(d._id))
    }
    // for sub categories, return top level first
    if (/.*Category/.test(model)) {
      return lodash.sortBy(data, d => (d.parent? 1: 0))
    }
    if (model=='user') {
      if ([FUMOIR_MEMBER].includes(user.role)) {
        return data.filter(d => d.role==FUMOIR_MEMBER)
      }
    }
    if (model=='message') {
      if ([FUMOIR_MEMBER].includes(user.role)) {
        data=data.filter(d => [d.sender._id, d.receiver._id].includes(user._id.toString()))
        return lodash.orderBy(data, ['creation_date'], ['asc'])
      }
    }
    if (model=='booking') {
      if ([FUMOIR_MEMBER].includes(user.role)) {
        data=data.filter(d => d.booking_user?._id?.toString()==user._id.toString())
      }
      return lodash.orderBy(data, ['start_date'], ['desc'])
    }
  }

  return data
}

setFilterDataUser(filterDataUser)

const preprocessGet = ({model, fields, id, user}) => {
  if (/.*Category/i.test(model)) {
    console.log('adding parent')
    fields = lodash([...fields, 'parent']).uniq().value()
  }
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }

  if (model=='user') {
    fields.push('role')
  }

  if (model=='conversation') {
    const getPartner= (m, user) => {
      return m.sender._id.toString()==user._id.toString() ? m.receiver : m.sender
    }

    return Message.find({$or: [{sender: user._id}, {receiver: user._id}]})
      .populate({path: 'sender', populate: {path: 'company'}})
      .populate({path: 'receiver', populate: {path: 'company'}})
      .sort({'creation_date': 1})
      .then(messages => {
        if (id) {
          messages=messages.filter(m => getPartner(m, user)._id.toString()==id)
          // If no messages for one parner, forge it
          if (lodash.isEmpty(messages)) {
            return User.findById(id).populate('company')
              .then(partner => {
                const data=[{_id: partner._id, partner, messages: []}]
                return {model, fields, id, data}
              })
          }
        }
        const partnerMessages=lodash.groupBy(messages, m => getPartner(m, user)._id)
        const convs=lodash(partnerMessages)
          .values()
          .map(msgs => { const partner=getPartner(msgs[0], user); return ({_id: partner._id, partner, messages: msgs}) })
          .sortBy('creation_date', 'asc')
        return {model, fields, id, data: convs}
      })
  }
  return Promise.resolve({model, fields, id})
}

setPreprocessGet(preprocessGet)

const USER_MODELS=['user', 'loggedUser']
USER_MODELS.forEach(m => {
  declareEnumField({model: m, field: 'role', enumValues: ROLES})
  declareVirtualField({model: m, field: 'full_name', instance: 'String', requires: 'firstname,lastname'})
  declareVirtualField({model: m, field: 'is_active', instance: 'Boolean', requires: 'subscription_start,subscription_end'})
  declareVirtualField({model: m, field: 'is_active_str', instance: 'String', requires: 'subscription_start,subscription_end'})
  declareVirtualField({model: m, field: 'posts', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'post'}}})

  declareVirtualField({model: m, field: 'bookings', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'booking'}}})

  declareVirtualField({model: m, field: 'events', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'event'}}})

})


declareEnumField({model: 'booking', field: 'place', enumValues: PLACES})
declareVirtualField({model: 'booking', field: 'end_date', instance: 'Date', requires: ''})
declareVirtualField({model: 'booking', field: 'paid', instance: 'Boolean', requires: 'orders'})
declareVirtualField({model: 'booking', field: 'paid_str', instance: 'String', requires: 'orders,orders.items'})
declareVirtualField({model: 'booking', field: 'status', instance: 'String', requires: 'start_date,end_date', enumValues: EVENT_STATUS})
declareVirtualField({model: 'booking', field: 'people_count', instance: 'Number', requires: 'guests_count'})

const PRODUCT_MODELS=['product', 'cigar', 'drink', 'meal']
PRODUCT_MODELS.forEach(m => {
  declareVirtualField({model: m, field: 'net_price', instance: 'Number', requires: 'price,vat_rate'})
  declareVirtualField({model: m, field: 'reviews', instance: 'review', requires: ''})
})
declareVirtualField({model: 'company', field: 'full_name', instance: 'String', requires: 'name'})

const CAT_MODELS=['category', 'cigarCategory', 'mealCategory', 'drinkCategory']
CAT_MODELS.forEach(m => {
  declareVirtualField({model: m, field: 'children', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'category'},
    },
  })
  declareVirtualField({model: m, field: 'products', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'product'},
    },
  })
})

declareEnumField({model: 'event', field: 'place', enumValues: PLACES})
declareVirtualField({model: 'event', field: 'members_count', instance: 'Number', requires: 'guests_count,members'})
declareVirtualField({model: 'event', field: 'status', instance: 'String', requires: 'start_date,end_date', enumValues: EVENT_STATUS})
declareVirtualField({model: 'event', field: 'guests', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'guest'}}})
declareVirtualField({model: 'event', field: 'guests_count', instance: 'Number', requires: ''})

declareVirtualField({model: 'order', field: 'total_price', instance: 'Number', requires: 'items'})
declareVirtualField({model: 'order', field: 'paid', instance: 'Boolean', requires: 'items'})
declareVirtualField({model: 'order', field: 'paid_str', instance: 'String', requires: 'items'})
declareVirtualField({model: 'order', field: 'remaining_total', instance: 'Number', requires: 'items,payments'})

declareVirtualField({model: 'orderItem', field: 'net_price', instance: 'Number', requires: 'price,vat_rate'})
declareVirtualField({model: 'orderItem', field: 'total_price', instance: 'Number', requires: 'price,quantity'})

declareVirtualField({model: 'subscription', field: 'is_active', instance: 'Boolean', requires: 'start,end'})

const getEventGuests = (user, params, data) => {
  return UserSessionData.findOne({user: user._id, 'guests.event': data._id})
    .populate({path: 'guests', populate: 'guest'})
    .then(usd => {
      if (!usd) {return [] }
      const guests=usd.guests
        .filter(g => g.event._id.toString()==data._id.toString())
        .map(g => g.guest)
      return guests
    })
}

declareComputedField('event', 'guests', getEventGuests)

const getEventGuestsCount = (user, params, data) => {
  return UserSessionData.findOne({user: user._id, 'guests_count.event': data._id})
    .then(usd => {
      if (!usd) { return 0}
      return usd.guests_count.find(gc => gc.event._id.toString()==data._id).count
    })
}

const setEventGuestsCount = ({id, attribute, value,user}) => {
  if (value>MAX_EVENT_GUESTS) {
    throw new BadRequestError(`Vous ne pouvez inviter plus de ${MAX_EVENT_GUESTS} personnes`)
  }
  return getEventGuests(user, null, {_id: id})
    .then(guests => {
      console.log(`INvitations count:${guests.length}`)
      if (guests.length>value) {
        throw new BadRequestError(`Vous avez déjà envoyé ${guests.length} invitations`)
      }
      return UserSessionData.findOneAndUpdate({user: user._id},
        {user: user._id},
        {upsert: true, runValidators: true, new: true},
      )
    })
    .then(usd => {
      const guests_count=usd.guests_count.find(gc => gc.event._id.toString()==id)
      if (guests_count) {
        guests_count.count=value
      }
      else {
        usd.guests_count.push({event: id, count: value})
      }
      return usd.save()
    })
}

declareComputedField('event', 'guests_count', getEventGuestsCount, setEventGuestsCount)

module.exports = {
  inviteGuest,
  setOrderItem,
  removeOrderItem,
  registerToEvent,
  payOrder,
}

const mongoose = require('mongoose')
const lodash=require('lodash')
const {ROLES}=require('../../../utils/others/consts')
const {BOOK_STATUS}=require('../../../utils/consts')
const AddressSchema =require('../AddressSchema')

const Schema = mongoose.Schema

const BookingFee = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  target: {
    type: Schema.Types.ObjectId,
    ref: 'company',
    required: true,
  },
  transfer_id: String,
  transfer_status: String,
  payout_id: String,
  payout_status: String,
})

const BookingSchema = new Schema({
  reference: {
    type: String,
    required: true,
  },
  address: {
    type: AddressSchema,
  },
  service: {
    type: String,
    required: true,
  },
  equipments: [{
    type: Schema.Types.ObjectId,
    ref: 'equipment',
  }],
  // Total amount
  amount: {
    type: Number,
    required: true,
  },
  // Company supported amount
  company_amount: {
    type: Number,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  prestation_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
  },
  alfred: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  prestations: {
    type: [{
      name: {
        type: String,
        required: true,
      },
      // Unitary price
      price: {
        type: Number,
        required: true,
      },
      // Prestation count
      value: {
        type: Number,
        required: true,
      },
    }],
    required: true,
    validate: v => Array.isArray(v) && v.length > 0,
  },
  option: {
    label: {
      type: String,
    },
    price: {
      type: Number,
    },
  },
  chatroom: {
    type: Schema.Types.ObjectId,
    ref: 'chatRoom',
  },
  fileUpload: [{
    type: Schema.Types.Mixed,
  }],
  customer_fees: [
    BookingFee,
  ],
  provider_fees: [
    BookingFee,
  ],
  status: {
    type: String,
    enum: Object.values(BOOK_STATUS),
  },
  // Cancel/refuse reason
  reason: {
    type: String,
    required: false,
  },
  serviceUserId: {
    type: String,
  },
  alfred_evaluated: {
    type: Boolean,
    default: false,
  },
  user_evaluated: {
    type: Boolean,
    default: false,
  },
  paid: {
    type: Boolean,
    default: false,
  },
  date_payment: {
    type: Date,
  },
  travel_tax: {
    type: Number,
    required: true,
    default: 0,
  },
  pick_tax: {
    type: Number,
    required: true,
    default: 0,
  },
  // Customer payin id
  mangopay_payin_id: {
    type: String,
  },
  mangopay_payin_status: {
    type: String,
  },
  // Provider process
  // Transfer from customer to provider
  mangopay_transfer_id: {
    type: String,
  },
  mangopay_transfer_status: {
    type: String,
  },
  // Payout for provider
  mangopay_payout_id: {
    type: String,
  },
  mangopay_payout_status: {
    type: String,
  },
  // Client refund id
  mangopay_refund_id: {
    type: String,
  },
  mangopay_refund_status: {
    type: String,
  },
  cesu_amount: {
    type: Number,
    default: 0,
  },
  // User role when booking
  user_role: {
    type: String,
    enum: [null, ...Object.keys(ROLES)],
  },
  billing_number: {
    type: String,
  },
  receipt_number: {
    type: String,
  },
  myalfred_billing_number: {
    type: String,
  },
  // Réservation par un client Avocotés
  company_customer: {
    type: Schema.Types.ObjectId,
    ref: 'company',
  },
  // Réservation du client dans le cas de la réservation par l'Afred pour avocotes
  customer_booking: {
    type: Schema.Types.ObjectId,
    ref: 'booking',
  },
  // Booked using CPF account
  cpf_booked: {
    type: Boolean,
    default: false,
    required: false,
  },
}, {toJSON: {virtuals: true, getters: true}})

BookingSchema.virtual('alfred_amount').get(function() {
  return this.amount - this.customer_fee - this.provider_fee
})

BookingSchema.virtual('calendar_display').get(function() {
  if (!this.status) {
    return false
  }
  if ([BOOK_STATUS.CANCELLED, BOOK_STATUS.EXPIRED, BOOK_STATUS.REFUSED].includes(this.status)) {
    return false
  }
  return true
})

BookingSchema.virtual('customer_fee').get(function() {
  return lodash.sum((this.customer_fees || []).map(c => c.amount))
})

BookingSchema.virtual('provider_fee').get(function() {
  return lodash.sum((this.provider_fees||[]).map(c => c.amount))
})

BookingSchema.virtual('cpf_amount').get(function() {
  return this.cpf_booked ? this.amount : 0
})


module.exports = BookingSchema

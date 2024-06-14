const mongoose=require('mongoose')
const moment=require('moment')
const lodash=require('lodash')

const ROLES=['user', 'customer', 'freelance']
const Schema = mongoose.Schema;

// Base schema for User
const UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: String,
  role: {
    type: String,
    enum: ROLES,
    required: true,
  }
});

UserSchema.virtual('fullname').get(function() {
  return `${this.firstname} ${this.lastname}`
})

// Discriminator key to differentiate between subtypes
const options = { discriminatorKey: 'type' };

// Base schema for Customer
const CustomerSchema = new mongoose.Schema({
  siret: String,
  role: {
    type: String,
    enum: ROLES,
    required: true,
    default: 'customer'
  }
});

// Schema for Freelance, inheriting from Customer
const FreelanceSchema = new mongoose.Schema({
  ...CustomerSchema.obj,
  missions: String,
  role: {
    type: String,
    enum: ROLES,
    required: true,
    default: 'freelance'
  }
}, options);

FreelanceSchema.virtual('test').get(function() {
  return this.fullname+' '+this.role
})

// Create models
const User = mongoose.model('user', UserSchema);
const Customer = User.discriminator('customer', CustomerSchema);
const Freelance = User.discriminator('freelance', FreelanceSchema);

describe('Inheritance test', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`)
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('should get both customer and freelance', async () => {
    await Customer.create({firstname: 'client', lastname: 'client'})
    await Freelance.create({firstname: 'freelance', lastname: 'freelance', siret:52})
    const users=await User.find()
    console.log(users)
    const customers=await User.find({role: {$in: ['user', 'freelance']}})
  })
})

const moment=require('moment')
const mongoose = require('mongoose')
const {forceDataModelAftral}=require('../utils')
forceDataModelAftral()
const {MONGOOSE_OPTIONS} = require('../../server/utils/database')

const Album=require('../../server/models/Album')
const Appointment=require('../../server/models/Appointment')
const Availability=require('../../server/models/Availability')
const Billing=require('../../server/models/Billing')
const Booking=require('../../server/models/Booking')
const Category=require('../../server/models/Category')
const ChatRoom=require('../../server/models/ChatRoom')
const Cigar=require('../../server/models/Cigar')
const CigarCategory=require('../../server/models/CigarCategory')
const Commission=require('../../server/models/Commission')
const Company=require('../../server/models/Company')
const Contact=require('../../server/models/Contact')
const Conversation=require('../../server/models/Conversation')
const Drink=require('../../server/models/Drink')
const DrinkCategory=require('../../server/models/DrinkCategory')
const Equipment=require('../../server/models/Equipment')
const Event=require('../../server/models/Event')
const EventLog=require('../../server/models/EventLog')
const FilterPresentation=require('../../server/models/FilterPresentation')
const Group=require('../../server/models/Group')
const Guest=require('../../server/models/Guest')
const Job=require('../../server/models/Job')
const LoggedUser=require('../../server/models/LoggedUser')
const Meal=require('../../server/models/Meal')
const MealCategory=require('../../server/models/MealCategory')
const Measure=require('../../server/models/Measure')
const Message=require('../../server/models/Message')
const Newsletter=require('../../server/models/Newsletter')
const OrderItem=require('../../server/models/OrderItem')
const Payment=require('../../server/models/Payment')
const Post=require('../../server/models/Post')
const Prestation=require('../../server/models/Prestation')
const PriceList=require('../../server/models/PriceList')
const Product=require('../../server/models/Product')
const Program=require('../../server/models/Program')
const Quotation=require('../../server/models/Quotation')
const Reminder=require('../../server/models/Reminder')
const ResetToken=require('../../server/models/ResetToken')
const Resource=require('../../server/models/Resource')
const Review=require('../../server/models/Review')
const Service=require('../../server/models/Service')
const ServiceUser=require('../../server/models/ServiceUser')
const Session=require('../../server/models/Session')
const ShipRate=require('../../server/models/ShipRate')
const Shop=require('../../server/models/Shop')
const Theme=require('../../server/models/Theme')
const TrainingCenter=require('../../server/models/TrainingCenter')
const UIConfiguration=require('../../server/models/UIConfiguration')
const User=require('../../server/models/User')
const UserSessionData=require('../../server/models/UserSessionData')

jest.setTimeout(20000)

describe('Test virtual single ref', () => {

  beforeAll(async() => {
    await mongoose.connect(`mongodb://localhost/test${moment().unix()}`, MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
  })

  it('must know required models', async() => {
    expect(Album).toBeNull()
    expect(Appointment).toBeNull()
    expect(Availability).toBeNull()
    expect(Billing).toBeNull()
    expect(Booking).toBeNull()
    expect(Category).toBeNull()
    expect(ChatRoom).toBeNull()
    expect(Cigar).toBeNull()
    expect(CigarCategory).toBeNull()
    expect(Commission).toBeNull()
    expect(Company).toBeNull()
    expect(Contact).toBeTruthy()
    expect(Conversation).toBeNull()
    expect(Drink).toBeNull()
    expect(DrinkCategory).toBeNull()
    expect(Equipment).toBeNull()
    expect(Event).toBeNull()
    expect(EventLog).toBeNull()
    expect(FilterPresentation).toBeNull()
    expect(Group).toBeNull()
    expect(Guest).toBeNull()
    expect(Job).toBeNull()
    expect(LoggedUser).toBeTruthy()
    expect(Meal).toBeNull()
    expect(MealCategory).toBeNull()
    expect(Measure).toBeNull()
    expect(Message).toBeTruthy()
    expect(Newsletter).toBeNull()
    expect(OrderItem).toBeNull()
    expect(Payment).toBeNull()
    expect(Post).toBeNull()
    expect(Prestation).toBeNull()
    expect(PriceList).toBeNull()
    expect(Product).toBeNull()
    expect(Program).toBeTruthy()
    expect(Quotation).toBeNull()
    expect(Reminder).toBeNull()
    expect(ResetToken).toBeNull()
    expect(Resource).toBeTruthy()
    expect(Review).toBeNull()
    expect(Service).toBeNull()
    expect(ServiceUser).toBeNull()
    expect(Session).toBeTruthy()
    expect(ShipRate).toBeNull()
    expect(Shop).toBeNull()
    expect(Theme).toBeTruthy()
    expect(TrainingCenter).toBeTruthy()
    expect(UIConfiguration).toBeNull()
    expect(User).toBeTruthy()
    expect(UserSessionData).toBeTruthy()
  })
})

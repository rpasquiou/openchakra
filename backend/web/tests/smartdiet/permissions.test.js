const axios = require("axios")
const mongoose = require("mongoose")
const lodash = require("lodash")
const { API_ROOT } = require("../../utils/consts")
const https = require('https');
const { getDatabaseUri } = require("../../config/config");
const { MONGOOSE_OPTIONS } = require("../../server/utils/database");
const User = require("../../server/models/User");
const Content = require("../../server/models/Content");
const Coaching = require("../../server/models/Coaching");
const individualChallenge = require("../../server/models/IndividualChallenge");

jest.setTimeout(60*1000)

// Create an instance of axios with custom https agent
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Disable SSL certificate verification
  })
});
describe('Pack buy tests', () => {

  const PATIENT_EMAIL='hello+user@wappizy.com'
  let PATIENT_ID, PATIENT_COMPANY
  let OTHER_PATIENT_ID

  beforeAll(async() => {
    await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
    const patient=await User.findOne({email: PATIENT_EMAIL})
    PATIENT_ID=patient._id.toString()
    PATIENT_COMPANY=patient.company._id.toString()
    const otherPatient=await User.findOne({email: {$ne: PATIENT_EMAIL}})
    OTHER_PATIENT_ID=otherPatient._id
  })

  afterAll(async() => {
  })
  
  let cookie

  const login = async email => {
    return axiosInstance.post('https://localhost:4201'+API_ROOT+'/login', {email, password: 'Password1;'})
      .then(async res => {
        const headers=res.headers
        cookie=headers['set-cookie'][0].split(';').find(v => /token/.test(v)).split('=')[1]
      })
  }

  const get = async (model, id) => {
    let url='https://localhost:4201'+API_ROOT+model
    if (id) {
      url=url+'?id='+id
    }
    // console.log('GET url',url)
    return axiosInstance.get(url, {headers: {Cookie: `token=${cookie}`}})
      .then(res => {
        return res.data
      })
  }

  const put = async (model, id, attributes) => {
    const url=`https://localhost:4201${API_ROOT}${model}/${id}`
    // console.log('PUT url',url)
    const body=lodash.mapValues(attributes, v => JSON.stringify(v))
    return axiosInstance.put(url, body, {headers: {Cookie: `token=${cookie}`}})
      .then(res => {
        return res.data
      })
  }

  const post = async (model, attributes) => {
    const url=`https://localhost:4201${API_ROOT}${model}`
    // console.log('POST url',url)
    const body=lodash.mapValues(attributes, v => JSON.stringify(v))
    return axiosInstance.post(url, body, {headers: {Cookie: `token=${cookie}`}})
      .then(res => {
        return res.data
      })
  }

  const _delete = async (model, id) => {
    const url=`https://localhost:4201${API_ROOT}action`
    // console.log('DELETE url',url)
    const body={
      action: 'delete',
      id,
    }
    return axiosInstance.post(url, body, {headers: {Cookie: `token=${cookie}`}})
      .then(res => {
        return res.data
      })
  }

  it('must check patient permissions', async() => {
    await login(PATIENT_EMAIL)
    expect(get('user')).rejects.toThrow(/403/)
    const dietsCount=await User.countDocuments({customer_companies: PATIENT_COMPANY})
    expect(get('diet')).resolves.toHaveLength(dietsCount)
    expect(get('lead')).rejects.toThrow(/403/)
    expect(put('user', PATIENT_ID, {firstname: 'tagada'})).resolves.toBeTruthy()
    expect(post('user', {firstname: 'tagada'})).rejects.toThrow(/403/)
    expect(post('lead', {firstname: 'tagada'})).rejects.toThrow(/403/)
    expect(_delete('user', PATIENT_ID)).rejects.toThrow(/403/)

    const coachings=await Coaching.find({user: PATIENT_ID})
    expect(get('coaching')).resolves.toHaveLength(coachings.length)
    expect(_delete('coaching', coachings[0]._id)).rejects.toThrow(/403/)

    expect(post('content')).rejects.toThrow(/403/)
    expect(put('content')).rejects.toThrow(/403/)
    const contentsCount=await Content.countDocuments()
    expect(get('content')).resolves.toHaveLength(contentsCount)

    expect(post('recipe')).rejects.toThrow(/403/)
    expect(put('recipe')).rejects.toThrow(/403/)

    expect(post('individualChallenge')).rejects.toThrow(/403/)
    expect(put('individualChallenge')).rejects.toThrow(/403/)
    const indChallCount=await individualChallenge.countDocuments()
    return expect(get('individualChallenge')).resolves.toHaveLength(indChallCount)
  })

})

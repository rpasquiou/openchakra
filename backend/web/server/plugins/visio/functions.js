const path=require('path')
require('dotenv').config({path: path.resolve(__dirname, '../../../../../.env')})
const mongoose=require('mongoose')
const axios = require('axios')
const moment = require('moment')
const VisioSchema = require('./schemas/VisioSchema')
const { declareVirtualField } = require('../../utils/database')

mongoose.model('visio', VisioSchema)

declareVirtualField({model: 'visio', field: 'end_date', instance: 'Date', requires: 'start_date,duration'})

const KMEET_ROOT=`https://kmeet.infomaniak.com/`
const KMEET_DATE_FORMAT=`YYYY-MM-DD HH:mm:ss`


const getKmeetKey = () => {
  const key=process.env.KMEET_APIKEY
  if (!key) {
    throw new Error(`KMEET_APIKEY not found in environment`)
  }
  return key
}

const getHeaders = () => {
  return {
    Authorization: `Bearer ${getKmeetKey()}`,
    'Content-Type': 'application/json',
  }
}

const formatKmeetDate = date => {
  if (date) {
    return moment(date).format(KMEET_DATE_FORMAT)
  }
}

const getCalendarId = async () => {
  const headers=getHeaders()
  const calendars=(await axios.get('https://calendar.infomaniak.com/api/pim/calendar', {headers}))?.data?.data?.calendars
  console.log(calendars)
  const calendar=calendars?.find(c => c.account_id!=null)
  if (!calendar) {
    throw new Error(`Kmeet: Main calendar not found`)
  }
  return calendar.id
}

const createRoom = async (start_date, duration, title) => {
  console.log('here')
  if (!start_date) {
    throw new Error(`La date de début est obligatoire`)
  }
  if (!duration) {
    throw new Error(`La durée est obligatoire`)
  }

  const headers=getHeaders()
  const calendarId=await getCalendarId()

  const body={
    calendar_id: calendarId,
    starting_at: formatKmeetDate(start_date),
    ending_at: formatKmeetDate(moment(start_date).add(duration, 'minutes')),
    timezone: "Europe\/Zurich",
    hostname: "kmeet.infomaniak.com",
    title: title,
    options: {
      subject: title,
      start_audio_muted: false,
      enable_recording: false,
      enable_moderator_video: false,
      start_audio_only: false,
      lobby_enabled: false,
      password_enabled: false,
      e2ee_enabled: true
    },
  }
  // await axios.get('https://calendar.infomaniak.com/api/pim/calendar', {headers: headers})
  //   .then(res => console.log(JSON.stringify(res.data.data.calendars, null,2)))
  //   .catch(err => console.error(err.response.data))
  
  const res=(await axios.post('https://api.infomaniak.com/1/kmeet/rooms', body, {headers}))?.data?.data

  return ({
    url: `${KMEET_ROOT}${res.id}`,
    room: res.id,
  })
}

module.exports={createRoom}
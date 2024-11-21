const axios = require('axios')
const path=require('path')
console.log(path.resolve(__dirname, '../../../.env'))
require('dotenv').config({path: path.resolve(__dirname, '../../../../.env')})

describe('KMeet tests', () => {

  const TOKEN=process.env.KMEET_APIKEY

  test('Must create a room', async() => {
    const headers= {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
    }
    const body={
      calendar_id: 1379426,
      starting_at: "2024-10-25 19:30:00",
      ending_at: "2024-11-25 22:00:00",
      timezone: "Europe\/Zurich",
      hostname: "kmeet.infomaniak.com",
      title: "example",
      options: {
        subject: "example",
        start_audio_muted: false,
        enable_recording: false,
        enable_moderator_video: false,
        start_audio_only: false,
        lobby_enabled: false,
        password_enabled: false,
        e2ee_enabled: true
      },
      attendees: [{
        address: 'sebastien.auvray@free.fr',
        state: 'NEEDS-ACTION',
    }],
    }
    await axios.get('https://calendar.infomaniak.com/api/pim/calendar', {headers: headers})
      .then(res => console.log(JSON.stringify(res.data.data.calendars, null,2)))
      .catch(err => console.error(err.response.data))
    
    await axios.post('https://api.infomaniak.com/1/kmeet/rooms', body, {headers: headers})
      .then(console.log)
      .catch(err => console.error(JSON.stringify(err.response.data, null, 2)))

    // const ROOM_ID='155910'

    // await axios.get(`https://api.infomaniak.com/1/kmeet/rooms/${ROOM_ID}/settings`, {headers: headers})
    //   .then(res => console.log(JSON.stringify(res.data, null,2)))
    //   .catch(err => console.error(err.response.data))

    // await axios.delete(`https://api.infomaniak.com/1/kmeet/rooms/${ROOM_ID}`, {headers: headers})
    //   .then(res => console.log(JSON.stringify(res.data, null,2)))
    //   .catch(err => console.error(err.response.data))

  })

  })

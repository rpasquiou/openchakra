const axios = require('axios')
const request = require('request')

describe('KMeet tests', () => {

  const TOKEN=`DbwbZzYCp4mYZ0Wsfk8yj78PgkUBD-BegFBHfU2iowOwwSlt4hzJfGg4tc3w4Xs8pQdhOyZwk2oncToG`

  test('Must create a room', async() => {
    const headers= {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
    }
    const body={
      calendar_id: 1379426,
      starting_at: "2024-11-01 09:00:00",
      ending_at: "2024-11-01 11:00:00",
      timezone: "Europe\/Zurich",
      hostname: "kmeet.infomaniak.com",
      title: "example",
      options: [{
        subject: "example",
        start_audio_muted: false,
        enable_recording: true,
        enable_moderator_video: false,
        start_audio_only: false,
        lobby_enabled: false,
        password_enabled: true,
        e2ee_enabled: true
      }],
      attendees: [{
        address: 'wilfrid.albersdorfer@wappizy.com',
        state: 'NEEDS-ACTION',
    }],
    }
    // await axios.get('https://calendar.infomaniak.com/api/pim/calendar', {headers: headers})
    //   .then(res => console.log(JSON.stringify(res.data.data.calendars[0], null,2)))
    //   .catch(err => console.error(err.response.data))
    
    await axios.post('https://api.infomaniak.com/1/kmeet/rooms', body, {headers: headers})
      .then(console.log)
      .catch(err => console.error(err.response.data))
  })

})

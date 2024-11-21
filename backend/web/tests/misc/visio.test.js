const moment = require('moment')
const { createRoom } = require('../../server/plugins/visio/functions')

describe('KMeet tests', () => {

  test('Must create a room', async() => {
    const room=await createRoom(moment().add(1, 'day'), 60, 'Un test de visio')
    console.log(room)
  })
})

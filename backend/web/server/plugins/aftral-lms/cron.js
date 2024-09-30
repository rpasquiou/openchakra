const cron = require('../../utils/cron')
const { pollNewFiles } = require('./ftp')

// Check new session every 5 minutes

cron.schedule('0 */5 * * * *', async () => {
  try {
    console.log('Polling new files')
    return await pollNewFiles().then(console.log)
  }
  catch(err) {
    console.error(`Polling error:${err}`)
  }
}, null, true, 'Europe/Paris')


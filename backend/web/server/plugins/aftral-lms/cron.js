
// Check new session every 5 minutes
new cron.CronJob('0 */5 * * * *', async () => {
  try {
    await pollNewFiles()
  }
  catch(err) {
    console.error(`Polling error:${err}`)
  }
}, null, true, 'Europe/Paris')


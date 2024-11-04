const cron = require('../../utils/cron')
const Scan = require('../../models/Scan')
const { SCAN_STATUS_IN_PROGRESS, SCAN_STATUS_READY, SCAN_STATUS_ERROR } = require('./consts')
const { getSslScan } = require('../sslLabs')
const { computeScanRates } = require('./scan')

cron.schedule('*/30 * * * * *', async () => {
  const inprogressScans = await Scan.find({status: SCAN_STATUS_IN_PROGRESS},['_id','url'])
  inprogressScans.forEach(async (scan) => {
    data = await getSslScan(scan.url)
    if (data.status == SCAN_STATUS_READY) {
      const scanRates = await computeScanRates(data)
      await Scan.findByIdAndUpdate(scan._id, {...scanRates, status:SCAN_STATUS_READY})
    } else if (data.status == SCAN_STATUS_ERROR) {
      //handle error status
    }
  })
})
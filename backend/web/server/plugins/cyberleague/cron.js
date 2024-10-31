const cron = require('../../utils/cron')
const Scan = require('../../models/Scan')
const { SCAN_STATUS_INPROGRESS, SCAN_STATUS_READY } = require('./consts')
const { getSslScan } = require('../sslLabs')
const { computeScanRates } = require('./scan')

cron.schedule('*/30 * * * * *', async () => {
  const inprogressScans = await Scan.find({status: SCAN_STATUS_INPROGRESS},['_id','url'])
  inprogressScans.forEach(async (scan) => {
    res = await getSslScan(scan.url)
    if (res.data.status == SCAN_STATUS_READY) {
      const scanRates = computeScanRates(res)
      await Scan.findByIdAndUpdate(scan._id, scanRates)
    }
  })
})
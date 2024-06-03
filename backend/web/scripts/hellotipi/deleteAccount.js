const mongoose = require('mongoose')
const { paymentPlugin, getDatabaseUri } = require('../../config/config')
const User = require('../../server/models/User')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')

require('../../server/utils/database')
const deleteAccount = async account_id => {
  const exists=await User.exists({payment_account_id: account_id})
  if (exists) {
    throw new Error(`A BD user is linked to this account ${account_id}`)
  }
  return paymentPlugin.deleteProvider(account_id)
    .then(res => res)
    .catch(() => paymentPlugin.deleteCustomer(account_id))
}

const account_id=process.argv[2]
console.log('account_id', account_id)

mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  .then(() => deleteAccount(account_id))
  .then(console.log)  
  .catch(console.error)
  .finally(()=> process.exit(0))
const mongoose=require('mongoose')
const MAIL_PROVIDER=require('./sendInBlue')
const { COMPANY_ACTIVITY } = require('../plugins/smartdiet/consts')
const { getModel } = require('./database')
const { CREATED_AT_ATTRIBUTE } = require('../../utils/consts')

const crmUpsertAccount = async (userId, values) => {
  const model=await getModel(userId, ['user', 'lead'])
  const user=await mongoose.models[model].findById(userId)
      .populate('company')
      .populate({path: 'latest_coachings', populate: ['reasons', 'appointments', {path: 'diet', populate: ''}]})
  const latest_coaching=user.latest_coachings?.[0]
  const reasons=latest_coaching?.reasons?.map(r => r.name).join(',') || null
  const start_date=latest_coaching?.[CREATED_AT_ATTRIBUTE] || null
  const assessment_date=latest_coaching?.appointments?.[0]?.start_date || null

  const accountData={
    email: user.email,
    attributes: {
      EMAIL: user.email,
      PRENOM: user.firstname,
      NOM: user.lastname,
      COMPANY: user.company?.name,
      COMPANY_TYPE: COMPANY_ACTIVITY[user.company?.activity],
      COMPANY_CODE: user.company?.code,
      IS_REGISTERED: model=='user',
      HAS_COACHING: !!latest_coaching,
      REASONS: reasons,
      COACHING_START_DATE: start_date,
      COCHING_DIET: latest_coaching?.diet?.fullname,
      ASSESSMENT_DATE_COACHING: assessment_date
    }
  }

  if (!user.crm_id) {
    const acc=await MAIL_PROVIDER.createContact(accountData)
    await mongoose.models[model].findByIdAndUpdate(userId, {crm_id: acc.id})
  }
  else {
    await MAIL_PROVIDER.updateContact(user.crm_id, accountData).catch(console.error)
  }
}

const crmGetAllContacts = async () => {
  return MAIL_PROVIDER.getContacts()
}

module.exports={
  crmUpsertAccount, crmGetAllContacts,
}
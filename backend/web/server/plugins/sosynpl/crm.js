const mongoose = require('mongoose')
const MAIL_PROVIDER = require('../../utils/sendInBlue')
const {
  formatEmail,
  addEnvironmentAttributes,
} = require('../../../config/config')
const { loadFromDb } = require('../../utils/database')

const crmUpsertAccount = async (modelName, userId) => {
  const model = mongoose.models[modelName]
  if (!model) {
    throw new Error(`Model ${modelName} not found`)
  }

  const fields = [
    'firstname',
    'lastname',
    'email',
    'role',
    'creation_date',
    'email_valid',
    'picture_visible',
    'availability',
    'position',
    'headquarter_address',
    'activity_status',
    'main_job',
    'dedicated_admin',
    'company_name',
    'phone',
    'work_sector',
    'sector',
    'freelance_profile_completion',
    'customer_profile_completion',
    'customer_published_announces_count',
    'customer_received_applications_count',
    'availability_last_update',
    'main_job.name',
    'dedicated_admin.firstname',
    'dedicated_admin.lastname',
    'work_sector.name',
    'sector.name',
  ]

  const user = await loadFromDb({
    model: modelName,
    id: userId,
    fields,
  }).then((user) => user[0])

  if (!user) {
    throw new Error(`User ${userId} not found`)
  }

  const accountData = {
    email: formatEmail(user.email),
    attributes: addEnvironmentAttributes({
      FIRSTNAME: user.firstname,
      LASTNAME: user.lastname,
      ROLE: user.role,
      CREATION_DATE: user.creation_date,
      EMAIL_VALID: user.email_valid,
      PICTURE_VISIBLE: user.picture_visible,
      AVAILABILITY: user.availability,
      POSITION: user.position,
      HEADQUARTER_ADDRESS_ADDRESS: user.headquarter_address?.address,
      HEADQUARTER_ADDRESS_CITY: user.headquarter_address?.city,
      HEADQUARTER_ADDRESS_ZIP_CODE: user.headquarter_address?.zip_code,
      ACTIVITY_STATUS: user.activity_status,
      MAIN_JOB: user.main_job?.name,
      DEDICATED_ADMIN: user.dedicated_admin
        ?.map((user) => user.firstname + ' ' + user.lastname)
        .join(', '),
      COMPANY_NAME: user.company_name,
      PHONE: user.phone,
      WORK_SECTOR: user.work_sector?.map((sector) => sector.name).join('/'),
      SECTOR: user.sector?.name,
      FREELANCE_PROFILE_COMPLETION: user.freelance_profile_completion,
      CUSTOMER_PROFILE_COMPLETION: user.customer_profile_completion,
      CUSTOMER_PUBLISHED_ANNOUNCES_COUNT:
        user.customer_published_announces_count,
      CUSTOMER_RECEIVED_APPLICATIONS_COUNT:
        user.customer_received_applications_count,
      AVAILABILITY_LAST_UPDATE: user.availability_last_update,
    }),
  }

  try {
    // First, verify if the contact exists in Brevo
    try {
      const existingContact = await MAIL_PROVIDER.getContact(accountData.email)

      if (existingContact?.id) {
        // Contact exists in Brevo - update it and set crm_id in our database
        await model.findByIdAndUpdate(userId, { crm_id: existingContact.id })

        // Update contact in Brevo
        await MAIL_PROVIDER.updateContact(existingContact.id, accountData)
        return
      }
    } catch (error) {
      console.log(`Contact doen't exist in CRM, proceed to create it`)
    }

    // If the contact doesn't exist in Brevo, create it
    const response = await MAIL_PROVIDER.createContact(accountData)
    await model.findByIdAndUpdate(userId, { crm_id: response.id })
  } catch (error) {
    throw error
  }
}

module.exports = {
  crmUpsertAccount,
}

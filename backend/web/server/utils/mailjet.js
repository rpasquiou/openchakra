const { isProduction } = require('../../config/config')
const lodash=require('lodash')
/**
As from https://dev.mailjet.com/email/reference/contacts/contact-list/
*/

const Mailjet = require('node-mailjet')
const {getMailjetConfig} = require('../../config/config')
const MAILJET_CONFIG = getMailjetConfig()

const RESULTS_LIMIT=1000

class MAILJET_V6 {


  // Singleton

  static instance=null

  static getInstance() {
    if (!MAILJET_V6.instance) {
      console.log('creating instance')
      MAILJET_V6.instance=isProduction() ? new MAILJET_V6() : new MAILJET_V6_TEST()
    }
    return MAILJET_V6.instance
  }

  constructor() {
    console.log('constructing')
    this.smtpInstance = new Mailjet({
      apiKey: MAILJET_CONFIG.MAILJET_PUBLIC_KEY,
      apiSecret: MAILJET_CONFIG.MAILJET_PRIVATE_KEY,
    })
  }

  sendMail({index, email, /** ccs,*/ data, attachment=null}) {
    console.log(`Sending mail template #${index} to ${email} with data ${JSON.stringify(data)}, attachment:${attachment ? 'yes' : 'no'}`)
    console.warn(`ccs is not already handled`)
    const message={
      To: [{Email: email}],
      TemplateID: index,
      TemplateLanguage: true,
      Variables: {...data},
    }

    if (attachment) {
      message.Attachments=[{Filename: attachment.name, Base64Content: attachment.content, ContentType: "text/calendar"}]
    }

    return this.smtpInstance
      .post('send', {version: 'v3.1'})
      .request({Messages: [message]})
  }

  sendSms(/** number, data, contact*/) {
    return Promise.reject('No SMS sent through Mailjet')
  }

  getContactsLists() {
    return this.smtpInstance
      .get(`contactslist?Limit=${RESULTS_LIMIT}`, {version: 'v3'})
      .request()
      .then(res => JSON.parse(JSON.stringify(res.body.Data)))
  }

  getListContacts(listID) {
    return this.smtpInstance
      .get(`contact?ContactsList=${listID}&Limit=${RESULTS_LIMIT}`, {version: 'v3'})
      .request()
      .then(res => JSON.parse(JSON.stringify(res.body.Data)))
  }

  getContactId(email) {
    return this.smtpInstance
      .get(`contact/${email}`, {version: 'v3'})
      .request()
      .then(res => res.body.Data[0]?.ID || null)
  }

  async getContact(id) {
    return this.smtpInstance
      .get(`contact/${id}`, {version: 'v3'})
      .request()
      .then(res => res.body.Data[0] || null)
  }

  acceptEmail(email) {
    return true
  }

  // Contacts are {email, fullname}
  // Returns a JobID isf successful
  addContactsToList({contacts, listID}) {
    const filteredContacts=contacts.filter(({Email}) => this.acceptEmail(Email))
    if (filteredContacts.length!=contacts.length) {
      console.log(`${contacts.length-filteredContacts.length} rejected emails `)
    }
    return this.smtpInstance
      .post('contactslist', {'version': 'v3'})
      .id(listID)
      .action('managemanycontacts')
      .request({
        Action: 'addnoforce',
        Contacts: filteredContacts
      })
      .then(res => {
        const jobId=res.body.Data[0].JobID
        console.log(`Mailjet add ${filteredContacts.length} contacts to ${listID}:jobId is ${jobId}`)
        return jobId
      })
  }

  /** Removes contacts from list and also from workflows that use this list */
  removeContactsFromList({contacts, listID}) {
    const filteredContacts=contacts.filter(({Email}) => this.acceptEmail(Email))
    if (filteredContacts.length!=contacts.length) {
      console.log(`${contacts.length-filteredContacts.length} rejected emails `)
    }
    console.log(`Removing ${contacts.length} from contacts list ${listID}`)
    return this.smtpInstance
      .post('contactslist', {'version': 'v3'})
      .id(listID)
      .action('managemanycontacts')
      .request({
        Action: 'remove',
        Contacts: filteredContacts
      })
      .then(res => {
        const jobId=res.body.Data[0].JobID
        //console.log(`Mailjet remove ${filteredContacts.length} contacts from ${list}:jobId is ${jobId}`)
        return jobId
      })
      // Remove from workflows
      .then(() => this.getWorkflowsForContactsList(listID))
      .then(res => {
        return Promise.all(res.map(workflowId => this.removeContactsFromWorkflow({contacts: filteredContacts, workflow: workflowId})))
      })
  }

  getWorkflowsForContactsList(listID) {
    return this.smtpInstance
      .get(`campaign?ContactsListID=${listID}&FromTS=2023-01-01T00:00:00&Limit=${RESULTS_LIMIT}`, {version: 'v3'})
      .request()
      .then(res => {
        const workflows=lodash.uniq(res.body.Data.map(c => c.WorkflowID).filter(v => !!v))
        console.log(`List ${listID} has workflows ${workflows}`)
        return workflows
      })
  }

  getWorkflow(id) {
    console.log('getting workflow', id)
    return this.smtpInstance
      .get(`workflow/${id}`, {version: 'v3'})
      .request()
      .then(res => res.body.Data)
  }

  async removeContactsFromWorkflow({contacts, workflow}) {
    console.log(`Removing ${contacts.length} contacts from workflow ${workflow}`)
    const filteredContacts=contacts.filter(({Email}) => this.acceptEmail(Email))
    if (filteredContacts.length!=contacts.length) {
      console.log(`${contacts.length-filteredContacts.length} rejected emails `)
    }
    // const ids=(await Promise.all(contacts.map(({Email}) => this.getContactId(Email))))
    const ids=contacts
    return Promise.all(ids.map(id => this.smtpInstance
      .delete(`workflow/${workflow}/contact/${id}`, {'version': 'v3'})
      .request()
      .then(res => {
        console.log(`Removed contact ${id} form workflow ${workflow}`,res.response.status, res.response.statusText)
        return true
      })
    ))
  }

  async getWorkflowContacts({workflow}) {
    return this.smtpInstance
      .get(`workflow/${workflow}/contact?FromTS=2023-01-01T00:00:00&Limit=${RESULTS_LIMIT}`, {'version': 'v3'})
      .request()
      .then(res => res.body.Data)
  }

}

class MAILJET_V6_TEST extends MAILJET_V6 {
  constructor() {
    super()
  }

  acceptEmail(email) {
    // return /@wappizy.com$/i.test(email)
    // return email=='ouvreurinscrit@gmail.com'
    return true
  }

}

module.exports = MAILJET_V6.getInstance()

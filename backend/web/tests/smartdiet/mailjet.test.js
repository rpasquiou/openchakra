const {forceDataModelSmartdiet}=require('../utils')
const lodash=require('lodash')
forceDataModelSmartdiet()
const {sendNotification} = require('../../server/utils/mailing')
const mailjetProvider=require('../../server/utils/mailjet')
const { updateWorkflows } = require('../../server/plugins/smartdiet/workflows')
const { getDatabaseUri } = require('../../config/config')
const { MONGOOSE_OPTIONS } = require('../../server/utils/database')
const mongoose = require('mongoose')

jest.setTimeout(60000)

describe('Mailjet', () => {

  beforeAll(async() => {
    await mongoose.connect(getDatabaseUri(), MONGOOSE_OPTIONS)
  })

  afterAll(async() => {
  })

  const CONTACTS_LIST_NAME='Liste test workflow appli'

  it('must send notification', async() => {
    await sendNotification({
      notification: 4982108,
      destinee: {email: 'hello@wappizy.com'},
      params: {
        firstname: 'hello !!',
        FIRSTNAME: 'HELLO !!',
        CODEENTREPRISE: 'Wappizy',
      },
    })
  })

  it('must get contacts lists', async() => {
    const lists=await mailjetProvider.getContactsLists()
    console.log(JSON.stringify(lists, null, 2))
    expect(lists.length).toBeGreaterThan(0)
  })

  it('must add user to a contacts list', () => {
    return mailjetProvider.getContactsLists()
      .then(res => res.find(r => r.Name==CONTACTS_LIST_NAME))
      .then(list => {
        console.log(`Got list ${JSON.stringify(list)}`)
        return mailjetProvider.addContactToList({
          fullname: 'test user', email: 'hello@wappizy.com', list: list.ID,
        })
        .then(console.log)
      })
  })

  it('must add then remove a user to a contacts list', () => {
    return mailjetProvider.getContactsLists()
      .then(res => res.find(r => r.Name==CONTACTS_LIST_NAME))
      .then(list => {
        return mailjetProvider.addContactToList({
          fullname: 'test user', email: 'hello@wappizy.com', list: list.ID,
        })
          .then(() => list)
      })
      .then(list => mailjetProvider.removeContactFromList({
        email: 'hello@wappizy.com', list: list.ID,
      }),
      )
  })

  it('must remove from scenarios', async () => {
    const list=(await mailjetProvider.getContactsLists()).find(list => /Wfw motiv INEA/i.test(list.Name))
    console.log(list)
    const workflows=await mailjetProvider.getWorkflowsForContactsList({list: list.ID})
    console.log('workflows', workflows)
    const [workflow]=await mailjetProvider.getWorkflow(workflows[0]).catch(console.error)
    console.log(workflow)
    const contacts=await mailjetProvider.getWorkflowContacts({workflow: workflows[0]})
    console.log(contacts)
    const contact=await mailjetProvider.getContactId('ouvreurinscrit@gmail.com')
    console.log(contact)
    // console.log(res[0])
    // const contacts=await mailjetProvider.getWorkflowContacts({workflow: res[0]})
    // console.log(contacts.filter(c => c.ContactID==2905300093))
    // const contact=await mailjetProvider.getContact(2905300093)
    // console.log(contact)
    // await mailjetProvider.removeContactsFromWorkflow({contacts: [{Email: 'pascalmari@orange.fr'}], workflow: res[0]})
  })

  it.only('must remove mail from scenarios', async () => {
    const LIST=2415688
    const listContacts=(await mailjetProvider.getListContacts(LIST)).map(c => c.ID)
    console.log(listContacts.length, listContacts.slice(0, 5))
    const workflows=await mailjetProvider.getWorkflowsForContactsList(LIST)
    console.log('workflows', workflows)
    let workflowContacts=lodash.flatten(await Promise.all(workflows.map(w => mailjetProvider.getWorkflowContacts({workflow: w}))))
    workflowContacts=workflowContacts.filter(c => c.Status!='Exited').map(c => c.ContactID)
    const toRemove=lodash.difference(workflowContacts, listContacts)
    console.log(workflowContacts.length, workflowContacts.slice(0, 5))
    console.log('To remove', toRemove.length, toRemove.slice(0, 5))
    const first=toRemove[0]
    console.log(first)
    const contact=await mailjetProvider.getContact(first)
    // await mailjetProvider.removeContactsFromWorkflow({contacts: [first], workflow: workflows[0]})
    await mailjetProvider.removeContactsFromWorkflow({contacts: toRemove.slice(0, 5), workflow: workflows[0]})
  })

})

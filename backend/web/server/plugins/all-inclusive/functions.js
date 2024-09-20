const cron = require('../../utils/cron')
const { datetime_str } = require('../../../utils/dateutils')
const {
  sendAskContact,
  sendCommentReceived,
  sendMissionAskedReminder,
  sendMissionAskedSummary,
  sendMissionReminderCustomer,
  sendMissionReminderTI,
  sendNewMission,
  sendProfileOnline,
  sendProfileReminder,
  sendTipiSearch,
  sendUsersExtract
} = require('./mailing')
const {isDevelopment} = require('../../../config/config')

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const {
  AVAILABILITY,
  BOOLEAN,
  COACHING,
  COACH_ALLE,
  COMPANY_ACTIVITY,
  COMPANY_SIZE,
  COMPANY_STATUS,
  CONTACT_STATUS,
  CONTRACT_TYPE,
  DEPARTEMENTS,
  EXPERIENCE,
  GENDER,
  MISSING_QUOTATION_DELAY,
  MISSION_FREQUENCY,
  MISSION_REMINDER_DELAY,
  MISSION_STATUS_ASKING,
  MISSION_STATUS_FINISHED,
  MISSION_STATUS_QUOT_ACCEPTED,
  MISSION_STATUS_QUOT_SENT,
  MISSION_STATUS_TI_REFUSED,
  PAYMENT_STATUS,
  PENDING_QUOTATION_DELAY,
  QUOTATION_STATUS,
  ROLES,
  ROLE_ALLE_ADMIN,
  ROLE_ALLE_SUPER_ADMIN,
  ROLE_COMPANY_ADMIN,
  ROLE_COMPANY_BUYER,
  ROLE_TI,
  UNACTIVE_REASON,
  LEAD_SOURCE,
  LOCATION,
  OPP_PROGRESS,
  EMERGENCY,
  OPP_STATUS,
} = require('./consts')
const {
  declareComputedField,
  declareEnumField,
  declareVirtualField,
  getModel,
  idEqual,
  loadFromDb,
  setFilterDataUser,
  setPostCreateData,
  setPostPutData,
  setPreCreateData,
  setPreprocessGet,
} = require('../../utils/database')
const Contact = require('../../models/Contact')
const AdminDashboard = require('../../models/AdminDashboard')
const mongoose = require('mongoose')
const { paymentPlugin } = require('../../../config/config')
const { BadRequestError } = require('../../utils/errors')
const moment = require('moment')
const Mission = require('../../models/Mission')
const User = require('../../models/User')
const { CREATED_AT_ATTRIBUTE, PURCHASE_STATUS } = require('../../../utils/consts')
const lodash=require('lodash')
const Message = require('../../models/Message')
const JobUser = require('../../models/JobUser')
const NATIONALITIES = require('./nationalities.json');
const { isMine } = require('./message');

const postCreate = ({model, params, data}) => {
  if (model=='mission') {
    return loadFromDb({model: 'mission', id: data._id, fields:['user.full_name','job.user.full_name']})
      .then(([mission]) => {
        if (!!mission.job) {
          sendNewMission(mission)
          sendMissionAskedSummary(mission)
        }
        else {
          User.find({role: {$in: [ROLE_ALLE_ADMIN, ROLE_ALLE_SUPER_ADMIN]}})
            .then(admins => Promise.allSettled(admins.map(admin => sendTipiSearch({admin, mission}))))
        }
    })
  }
  if (model=='contact') {
    const contact=data
    const attachment=contact.document ? {url: contact.document} : null
    // TODO check sendMail return
    User.find({role: {$in: [ROLE_ALLE_ADMIN, ROLE_ALLE_SUPER_ADMIN]}})
      .then(users => Promise.allSettled(users.map(u => sendAskContact({
        user:{email: u.email},
        fields:{...contact.toObject({virtuals: true}), urgent: contact.urgent ? 'Oui':'Non', status: CONTACT_STATUS[contact.status]},
        attachment,
      }))))
  }

  if (model=='comment') {
    loadFromDb({model: 'mission', id: data.mission._id, fields:['user','job.user']})
      .then(([mission]) => sendCommentReceived(mission))
  }

  return Promise.resolve(data)
}

setPostCreateData(postCreate)

const preprocessGet = async ({model, fields, id, user, params}) => {
  if (model=='loggedUser') {
    model='user'
    id = user?._id || 'INVALIDID'
  }

  if (model == 'jobUser') {
    fields = lodash([...fields, 'user.hidden', 'user']).uniq().value()
  }

  if (model=='conversation') {
    const getPartner= (m, user) => {
      return idEqual(m.sender._id, user._id) ? m.receiver : m.sender
    }

    return Message.find({$or: [{sender: user._id}, {receiver: user._id}]})
      .populate({path: 'sender', populate: {path: 'company'}})
      .populate({path: 'receiver', populate: {path: 'company'}})
      .sort({CREATED_AT_ATTRIBUTE: 1})
      .then(messages => {
        messages.forEach(m => {
          m.mine = idEqual(m.sender._id, user._id);
        })
        if (id) {
          messages=messages.filter(m => idEqual(getPartner(m, user)._id, id))
          // If no messages for one parner, forge it
          if (lodash.isEmpty(messages)) {
            return User.findById(id).populate('company')
              .then(partner => {
                const data=[{_id: partner._id, partner, messages: []}]
                return {model, fields, id, data, params}
              })
          }
        }
        const partnerMessages=lodash.groupBy(messages, m => getPartner(m, user)._id)
        const convs=lodash(partnerMessages)
          .values()
          .map(msgs => { 
            const partner=getPartner(msgs[0], user)
            const newest_message = lodash.maxBy(msgs, m => new Date(m.creation_date))
            return ({_id: partner._id, partner, messages: msgs, newest_message: [newest_message]}) })
          .orderBy(conv => new Date(conv.newest_message[0][CREATED_AT_ATTRIBUTE]), ['desc'])
        return {model, fields, id, data: convs, params}
      })
  }

  return Promise.resolve({model, fields, id, params})

}

setPreprocessGet(preprocessGet)

const preCreate = async ({model, params, user}) => {
  if (['jobUser', 'request', 'mission', 'comment'].includes(model)) {
    params.user=params.user || user
    if (model=='mission' && !!params.job) {
      const job=await JobUser.findById(params.job)
      params.ti=job.user
    }
  }
  if (['lead', 'opportunity', 'note'].includes(model) && !params.creator) {
    params.creator=user._id
  }
  if (['document', 'opportunity', 'note'].includes(model) && !!params.parent)   {
    const parentType=await getModel(params.parent, ['user', 'lead']).catch(console.error)
    params[parentType=='user' ? 'user' : 'lead']=params.parent
    params.parent=undefined
  }
  if (model=='quotation' && 'mission' in params) {
    return Mission.findById(params.mission)
      .populate('user')
      .populate('quotations')
      .then(mission => {
        if (mission.quotations.length>0) {
          throw new BadRequestError(`Un devis est déjà attaché à cette mission`)
        }
        params.name=`Devis du ${moment().format('L')}`
        params.firstname=mission.user.firstname
        params.lastname=mission.user.lastname
        params.email=mission.user.email
        params.company_name=mission.user.company_name
        params.mission=mission._id
        return ({model, params})
      })
  }
  if (model=='quotationDetail' && 'quotation' in params) {
    params.quotation=params.quotation
  }

  if (model=='user' && !params.role) {
    params.role=ROLE_TI
  }

  if (model=='message'){
    params.receiver=params.parent
    params.sender=user._id
  }

  // Set ti on mission
  if (model=='mission' && !!params.job){
    const jobUser=await JobUser.findById(params.job).populate('user')
    params.ti=jobUser.user._id
  }

  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)

const postPutData = async ({model, id, attribute, data, user}) => {
  if (model=='user') {
    const account=await User.findById(user._id)
    if (attribute=='hidden' && value==false) {
      sendProfileOnline(account)
    }
    if ([ROLE_TI, ROLE_COMPANY_BUYER].includes(account.role)) {
      const fn=account.role==ROLE_TI ? paymentPlugin.upsertProvider : paymentPlugin.upsertCustomer
      const account_id=await fn(account)
      await User.findByIdAndUpdate(user._id, {payment_account_id: account_id})
    }
  }
  if (model=='mission') {
    if (attribute=='job') {
      const mission=await Mission.findById(id).populate('job')
      await Mission.findByIdAndUpdate(id, {ti: mission.job.user._id})
    }
  }
  return data
}

setPostPutData(postPutData)


const USER_MODELS=['user', 'loggedUser']
USER_MODELS.forEach(m => {
  declareVirtualField({model: m, field: 'full_name', instance: 'String', requires: 'firstname,lastname'})
  declareEnumField({model: m, field: 'role', enumValues: ROLES})
  declareVirtualField({model: m, field: 'profile_progress', instance: 'Number', requires: 'firstname,lastname,email,phone,birthday,nationality,picture,identity_proof_1,iban,company_name,company_status,siret,status_report,insurance_type,insurance_report,company_picture,jobs'})
  declareEnumField({model: m, field: 'coaching', enumValues: COACHING})
  declareVirtualField({model: m, field: 'password2', instance: 'String'})
  declareEnumField({model: m, field: 'availability', enumValues: AVAILABILITY})
  declareVirtualField({model: m, field: 'quotations', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'quotation'}}
  })
  declareVirtualField({model: m, field: 'jobs', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'jobUser'}}
  })
  declareEnumField({model: m, field: 'nationality', enumValues: NATIONALITIES})
  declareEnumField({model: m, field: 'company_status', enumValues: COMPANY_STATUS})
  declareEnumField({model: m, field: 'company_activity', enumValues: COMPANY_ACTIVITY})
  declareEnumField({model: m, field: 'company_size', enumValues: COMPANY_SIZE})
  declareVirtualField({model: m, field: 'requests', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'request'}}
  })
  declareVirtualField({model: m, field: 'qualified_str', instance: 'String'})
  declareVirtualField({model: m, field: 'visible_str', instance: 'String'})
  declareVirtualField({model: m, field: 'finished_missions_count', instance: 'Number', requires: 'missions'})
  declareVirtualField({model: m, field: 'missions', instance: 'Array', multiple: true,
    requires: 'role',
    caster: {
      instance: 'ObjectID',
      options: {ref: 'mission'}}
  })
  declareVirtualField({model: m, field: 'missions_with_bill', instance: 'Array', multiple: true,
    requires: 'missions.bill',
    caster: {
      instance: 'ObjectID',
      options: {ref: 'mission'}}
  })
  declareVirtualField({model: m, field: 'recommandations', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'recommandation'}}
  })
  declareVirtualField({model: m, field: 'recommandations_count', instance: 'Number', requires: 'jobs.recommandations_count'})
  declareVirtualField({model: m, field: 'recommandations_note', instance: 'Number', requires: 'jobs'})
  declareVirtualField({model: m, field: 'comments_count', instance: 'Number', requires: 'missions.comments'})
  declareVirtualField({model: m, field: 'comments_note', instance: 'Number', requires: 'jobs'})

  declareVirtualField({model: m, field: 'revenue', instance: 'Number',
    requires: 'role,missions.quotations.ti_total,missions.status,missions.quotations.ti_total'})
  declareVirtualField({model: m, field: 'revenue_to_come', instance: 'Number',
    requires: 'role,missions.quotations.ti_total,missions.status,missions.quotations.ti_total,missions.status'})
  declareVirtualField({model: m, field: 'accepted_quotations_count', instance: 'Number', requires: 'role,missions.status,missions.status'})
  declareVirtualField({model: m, field: 'pending_quotations_count', instance: 'Number', requires: 'role,missions.status,missions.status'})
  declareVirtualField({model: m, field: 'pending_bills_count', instance: 'Number', requires: 'role,missions.status,missions.status'})
  declareVirtualField({model: m, field: 'spent', instance: 'Number',
    requires: 'role,missions.quotations.customer_total,missions.status,missions.quotations.customer_total,missions.status'})
  declareVirtualField({model: m, field: 'spent_to_come', instance: 'Number',
    requires: 'role,missions.quotations.customer_total,missions.status,missions.quotations.customer_total,missions.status'})
  declareVirtualField({model: m, field: 'pending_bills', instance: 'Number',
    requires: 'role,missions.status,missions.quotations.customer_total,missions.status,missions.quotations.customer_total'})

  declareVirtualField({model: m, field: 'profile_shares_count', instance: 'Number', requires: ''})
  declareEnumField({model: m, field: 'unactive_reason', enumValues: UNACTIVE_REASON})
  declareVirtualField({model: m, field: 'missing_attributes', instance: 'String', requires: 'firstname,lastname,email,phone,birthday,nationality,picture,identity_proof_1,iban,company_name,company_status,siret,status_report,insurance_type,insurance_report,company_picture,jobs'})
  declareVirtualField({model: m, field: 'missing_attributes_step_1', instance: 'String', requires: 'firstname,lastname,email,phone,birthday,nationality,picture,identity_proof_1,iban,company_name,company_status,siret,status_report,insurance_type,insurance_report,company_picture,jobs'})
  declareVirtualField({model: m, field: 'missing_attributes_step_2', instance: 'String', requires: 'firstname,lastname,email,phone,birthday,nationality,picture,identity_proof_1,iban,company_name,company_status,siret,status_report,insurance_type,insurance_report,company_picture,jobs'})
  declareVirtualField({model: m, field: 'missing_attributes_step_3', instance: 'String', requires: 'firstname,lastname,email,phone,birthday,nationality,picture,identity_proof_1,iban,company_name,company_status,siret,status_report,insurance_type,insurance_report,company_picture,jobs'})
  declareVirtualField({model: m, field: 'missing_attributes_step_4', instance: 'String', requires: 'firstname,lastname,email,phone,birthday,nationality,picture,identity_proof_1,iban,company_name,company_status,siret,status_report,insurance_type,insurance_report,company_picture,jobs'})
  declareEnumField({model: m, field: 'zip_code', enumValues: DEPARTEMENTS})
  declareVirtualField({model: m, field: 'pinned_jobs', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'jobUser'}}
  })
  declareVirtualField({model: m, field: 'search_text', type: 'String',
    requires:'firstname,lastname,qualified_str,visible_str,company_name,coaching,zip_code,admin_validated',
    dbFilter: value => ({$or: [{firstname: new RegExp(value, 'i')}, {lastname: new RegExp(value, 'i')}, {company_name: new RegExp(value, 'i')}]}),
  })
  declareEnumField({model: m, field: 'gender', instance: 'String', enumValues: GENDER})
  declareVirtualField({model: m, field: 'notes', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'note'}}
  })
  declareVirtualField({model: m, field: 'opportunities', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'opportunity'}}
  })
  declareVirtualField({model: m, field: 'created_opportunities', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'opportunity'}}
  })
  declareVirtualField({model: m, field: 'documents', instance: 'Array', requires: '', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'document'}}
  })
  declareVirtualField({
    model: m,
    field: 'leads',
    instance: 'Array',
    multiple: true,
    caster: {
      instance: 'ObjectID',
      options: {ref: 'lead'}
    }
  })
})



declareEnumField({model: 'company', field: 'status', enumValues: COMPANY_STATUS})
declareEnumField({model: 'jobUser', field: 'experience', enumValues: EXPERIENCE})
declareVirtualField({model: 'jobUser', field: 'activities', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'activity'}}
})
declareVirtualField({model: 'jobUser', field: 'skills', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'skill'}}
})
declareVirtualField({model: 'jobUser', field: 'location_str', instance: 'String', requires: 'customer_location,foreign_location'})
declareVirtualField({
  model: 'jobUser', field: 'search_field', instance: 'String', requires: 'name,skills.name,activities.name,city,user.full_name'
})
declareVirtualField({model: 'jobUser', field: 'experiences', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'experience'}}
})
declareVirtualField({model: 'jobUser', field: 'diploma', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'diploma'}}
})
declareVirtualField({model: 'jobUser', field: 'photos', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'photo'}}
})
declareVirtualField({model: 'jobUser', field: 'recommandations', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'recommandation'}}
})
declareVirtualField({model: 'jobUser', field: 'missions', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'mission'}}
})
declareVirtualField({model: 'jobUser', field: 'comments', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'comment'}}
})
declareVirtualField({model: 'jobUser', field: 'recommandations_count', instance: 'Number', requires:'recommandations'})
declareVirtualField({model: 'jobUser', field: 'rate_str', instance: 'String', requires:'on_quotation,rate'})


declareEnumField({model: 'experience', field: 'contract_type', enumValues: CONTRACT_TYPE})

declareVirtualField({model: 'mission', field: 'status', instance: 'String', enumValues: QUOTATION_STATUS,
    requires: 'bill_sent_date,customer_accept_bill_date,customer_cancel_date,customer_refuse_bill_date,customer_refuse_quotation_date,job,payin_achieved,payin_id,quotation_sent_date,ti_finished_date,ti_refuse_date'})
declareVirtualField({model: 'mission', field: 'quotations', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'quotation'}}
})
declareEnumField({model: 'mission', field: 'frequency', enumValues: MISSION_FREQUENCY})
declareVirtualField({model: 'mission', field: 'location_str', instance: 'String', requires: 'customer_location,foreign_location'})
declareVirtualField({model: 'mission', field: 'ti_tip', instance: 'String', requires: ''})
declareVirtualField({model: 'mission', field: 'customer_tip', instance: 'String', requires: ''})
declareVirtualField({model: 'mission', field: 'comments', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'comment'}}
})
declareEnumField({model: 'mission', field: 'payin_status', enumValues: PAYMENT_STATUS})
declareEnumField({model: 'mission', field: 'recurrent', instance: 'String', enumValues: BOOLEAN})
// Biling
declareVirtualField({model: 'mission', field: 'aa_ht', instance: 'Number', requires: 'quotations.aa_ht'})
declareVirtualField({model: 'mission', field: 'aa_total', instance: 'Number', requires: 'quotations.aa_total'})
declareVirtualField({model: 'mission', field: 'aa_vat', instance: 'Number', requires: 'quotations.aa_vat'})
declareVirtualField({model: 'mission', field: 'customer_total', instance: 'Number', requires: 'quotations.customer_total'})
declareVirtualField({model: 'mission', field: 'customer_vat', instance: 'Number', requires: 'quotations.customer_vat'})
declareVirtualField({model: 'mission', field: 'customer_ht', instance: 'Number', requires: 'quotations.customer_ht'})
declareVirtualField({model: 'mission', field: 'gross_ht', instance: 'Number', requires: 'quotations.gross_ht'})
declareVirtualField({model: 'mission', field: 'gross_total', instance: 'Number', requires: 'quotations.gross_total'})
declareVirtualField({model: 'mission', field: 'gross_vat', instance: 'Number', requires: 'quotations.gross_vat'})
declareVirtualField({model: 'mission', field: 'mer_ht', instance: 'Number', requires: 'quotations.mer_ht'})
declareVirtualField({model: 'mission', field: 'mer_total', instance: 'Number', requires: 'quotations.mer_total'})
declareVirtualField({model: 'mission', field: 'mer_vat', instance: 'Number', requires: 'quotations.mer_vat'})
declareVirtualField({model: 'mission', field: 'ti_total', instance: 'Number', requires: 'quotations.ti_total'})
declareVirtualField({model: 'mission', field: 'ti_vat', instance: 'Number', requires: 'quotations.ti_vat'})


declareVirtualField({model: 'quotation', field: 'details', instance: 'Array', requires: '', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: {ref: 'quotationDetail'}}
})
declareVirtualField({model: 'quotation', field: 'customer_ht', instance: 'Number', requires: 'gross_ht,mer_ht'})
declareVirtualField({model: 'quotation', field: 'customer_vat', instance: 'Number', requires: 'gross_vat,mer_vat'})
declareVirtualField({model: 'quotation', field: 'gross_vat', instance: 'Number', requires: 'details.vat_total'})
declareVirtualField({model: 'quotation', field: 'gross_ht', instance: 'Number', requires: 'details.ht_total'})
declareVirtualField({model: 'quotation', field: 'customer_total', instance: 'Number', requires: 'gross_total,mer_total,gross_ht'})
declareVirtualField({model: 'quotation', field: 'mer_total', instance: 'Number', requires: 'mer_ht,mer_vat'})
declareVirtualField({model: 'quotation', field: 'mer_ht', instance: 'Number', requires: 'mission.job.user,gross_ht'})
declareVirtualField({model: 'quotation', field: 'mer_vat', instance: 'Number', requires: 'mer_ht'})
declareVirtualField({model: 'quotation', field: 'gross_total', instance: 'Number', requires: 'details.total'})
declareVirtualField({model: 'quotation', field: 'aa_ht', instance: 'Number', requires: 'gross_ht'})
declareVirtualField({model: 'quotation', field: 'aa_vat', instance: 'Number', requires: 'aa_ht'})
declareVirtualField({model: 'quotation', field: 'aa_total', instance: 'Number', requires: 'aa_ht,aa_vat'})
declareVirtualField({model: 'quotation', field: 'ti_vat', instance: 'Number', requires: 'gross_vat,aa_vat'})
declareVirtualField({model: 'quotation', field: 'ti_total', instance: 'Number', requires: 'gross_total,aa_total,ti_vat'})

declareVirtualField({model: 'quotationDetail', field: 'total', instance: 'Number', requires: 'quantity,ht_price,vat'})
declareVirtualField({model: 'quotationDetail', field: 'vat_total', instance: 'Number', requires: 'quantity,ht_price,vat'})
declareVirtualField({model: 'quotationDetail', field: 'ht_total', instance: 'Number', requires: 'quantity,ht_price,vat'})

declareEnumField({model: 'contact', field: 'status', enumValues: CONTACT_STATUS})
declareEnumField({model: 'contact', field: 'region', enumValues: DEPARTEMENTS})

/** LEAD */
declareEnumField({model: 'lead', field: 'company_size', enumValues: COMPANY_SIZE})
declareEnumField({model: 'lead', field: 'company_zip_code', enumValues: DEPARTEMENTS})
declareEnumField({model: 'lead', field: 'company_activity', enumValues: COMPANY_ACTIVITY})
declareEnumField({model: 'lead', field: 'source', enumValues: LEAD_SOURCE})
declareVirtualField({model: 'lead', field: 'opportunities', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: {ref: 'opportunity'}}
})
declareVirtualField({model: 'lead', field: 'notes', instance: 'Array', requires: '', multiple: true,
caster: {
  instance: 'ObjectID',
  options: {ref: 'note'}}
})
declareVirtualField({model: 'lead', field: 'documents', instance: 'Array', requires: '', multiple: true,
caster: {
  instance: 'ObjectID',
  options: {ref: 'document'}}
})
/** End LEAD */

/** OPPORTUNITY */
declareEnumField({model: 'opportunity', field: 'zip_code', enumValues: DEPARTEMENTS})
declareEnumField({model: 'opportunity', field: 'location', enumValues: LOCATION})
declareEnumField({model: 'opportunity', field: 'recurrent', enumValues: BOOLEAN})
declareEnumField({model: 'opportunity', field: 'progress', enumValues: OPP_PROGRESS})
declareEnumField({model: 'opportunity', field: 'emergency', enumValues: EMERGENCY})
declareEnumField({model: 'opportunity', field: 'source', enumValues: LEAD_SOURCE})
declareEnumField({model: 'opportunity', field: 'status', enumValues: OPP_STATUS})
/** End OPPORTUNITY */

declareEnumField( {model: 'purchase', field: 'status', enumValues: PURCHASE_STATUS})

/** Start MESSAGE */
declareComputedField({model: 'message', field: 'mine', requires: 'sender', getterFn: isMine})
/** End MESSAGE */

const filterDataUser = async ({ model, data, user, params }) => {
  if (model === 'jobUser') {
    const searchQuery = params?.['filter.search_field']?.toLowerCase()
    if (!searchQuery) return data

    const allJobs = await JobUser.find()
      .populate('user')
      .populate('activities')
      .populate('skills')

    return allJobs.filter((job) => {
      const nameMatch = job.name.toLowerCase().includes(searchQuery)
      const activityMatch = job.activities.some((activity) =>
        activity.name.toLowerCase().includes(searchQuery)
      )
      const skillMatch = job.skills.some((skill) =>
        skill.name.toLowerCase().includes(searchQuery)
      )
      const fullNameMatch = job.user?.full_name
        ?.toLowerCase()
        .includes(searchQuery)
      const cityMatch = job.city?.toLowerCase().includes(searchQuery)

      return (
        nameMatch || activityMatch || skillMatch || fullNameMatch || cityMatch
      )
    })
  }
  return data
}

setFilterDataUser(filterDataUser)


const getDataPinned = (userId, params, data) => {
  const pinned=data?.pins?.some(l => idEqual(l._id, userId))
  return Promise.resolve(pinned)
}

const setDataPinned = ({id, attribute, value, user}) => {
  console.log(`Pinnning:${value}`)
  return getModel(id, ['jobUser'])
    .then(model => {
      if (value) {
        // Set liked
        return mongoose.models[model].findByIdAndUpdate(id, {$addToSet: {pins: user._id}})
      }
      else {
        // Remove liked
        return mongoose.models[model].findByIdAndUpdate(id, {$pullAll: {pins: [user._id]}})
      }
    })
}

declareComputedField({model: 'jobUser', field: 'pinned', requires:'pins', getterFn: getDataPinned, setterFn: setDataPinned})


declareComputedField({model: 'adminDashboard', field: 'contact_sent', getterFn: () => Contact.countDocuments()})
declareComputedField({model: 'adminDashboard', field: 'refused_bills', getterFn: () =>
  Mission.countDocuments({customer_refuse_bill_date: {$ne: null}})
})
declareComputedField({model: 'adminDashboard', field: 'accepted_bills', getterFn: () =>
  Mission.countDocuments({customer_accept_bill_date: {$ne: null}})
})
declareComputedField({model: 'adminDashboard', field: 'visible_ti',
  getterFn: () => User.countDocuments({role: ROLE_TI, hidden:false})
})
declareComputedField({model: 'adminDashboard', field: 'hidden_ti',
getterFn: () => User.countDocuments({role: ROLE_TI, hidden:true})
})
declareComputedField({model: 'adminDashboard', field: 'qualified_ti',
getterFn: () => User.countDocuments({role: ROLE_TI, qualified:true})
})
declareComputedField({model: 'adminDashboard', field: 'visible_tipi',
getterFn: () => User.countDocuments({role: ROLE_TI, coaching: COACH_ALLE, hidden:false})
})
declareComputedField({model: 'adminDashboard', field: 'hidden_tipi',
getterFn: () => User.countDocuments({role: ROLE_TI, coaching: COACH_ALLE, hidden:true})
})
declareComputedField({model: 'adminDashboard', field: 'qualified_tipi',
getterFn: () => User.countDocuments({role: ROLE_TI, coaching: COACH_ALLE, qualified:true})
})
declareComputedField({model: 'adminDashboard', field: 'missions_requests', getterFn: () =>
  loadFromDb({model: 'mission', fields:['status']})
    .then(missions => missions.filter(m => m.status==MISSION_STATUS_ASKING).length)
})
declareComputedField({model: 'adminDashboard', field: 'refused_missions', getterFn: () =>
loadFromDb({model: 'mission', fields:['status']})
  .then(missions => missions.filter(m => m.status==MISSION_STATUS_TI_REFUSED).length)
})
declareComputedField({model: 'adminDashboard', field: 'sent_quotations', getterFn: () =>
  Mission.countDocuments({quotation_sent_date: {$ne: null}})
})

declareComputedField({model: 'adminDashboard', field: 'quotation_ca_total',
  getterFn: () => {
    return loadFromDb({model: 'mission', fields:['status','quotations.customer_total']})
      .then(missions => {
        return lodash(missions)
          .filter(m => m.status==MISSION_STATUS_QUOT_SENT)
          .sumBy(m => m.quotations[0].gross_total)
      })
  }
})

//*****************************************************************
// TODO: Compute actual AA & MER commissions
//*****************************************************************

// TODO: WTF is that value ??
declareComputedField({model: 'adminDashboard', field: 'commission_ca_total',
getterFn: () => {
  return loadFromDb({model: 'mission', fields:['status','quotations.aa_total']})
    .then(missions => {
      return lodash(missions)
        .filter(m => m.status==MISSION_STATUS_FINISHED)
        .sumBy(m => m.quotations[0].aa_total)
    })
  }
})

declareComputedField({model: 'adminDashboard', field: 'tipi_commission_ca_total',
getterFn: () => {
  return loadFromDb({model: 'mission', fields:['name','status','quotations.aa_total','job.user.coaching','job.user.coaching']})
    .then(missions => {
      return lodash(missions)
        .filter(m => m.status==MISSION_STATUS_FINISHED)
        .filter(m => m.job?.user?.coaching==COACH_ALLE)
        .sumBy(m => m.quotations[0].aa_total)
    })
  }
})

declareComputedField({model: 'adminDashboard', field: 'tini_commission_ca_total',
getterFn: () => {
  return loadFromDb({model: 'mission', fields:['status','quotations.aa_total','job.user.coaching']})
    .then(missions => {
      return lodash(missions)
        .filter(m => m.status==MISSION_STATUS_FINISHED)
        .filter(m => m.job?.user?.coaching!=COACH_ALLE)
        .sumBy(m => m.quotations[0].aa_total)
    })
  }
})

declareComputedField({model: 'adminDashboard', field: 'customer_commission_ca_total',
getterFn: () => {
  return loadFromDb({model: 'mission', fields:['status','quotations.mer_total']})
    .then(missions => {
      return lodash(missions)
        .filter(m => m.status==MISSION_STATUS_FINISHED)
        .sumBy(m => m.quotations[0].mer_total)
    })
  }
})

declareComputedField({model: 'adminDashboard', field: 'ti_registered_today', getterFn: () =>
  User.find({role:ROLE_TI}, {[CREATED_AT_ATTRIBUTE]:1})
    .then(users => users.filter(u => moment(u[CREATED_AT_ATTRIBUTE]).isSame(moment(), 'day')).length)
})

declareComputedField({model: 'adminDashboard', field: 'customers_registered_today', getterFn: () =>
  User.find({role:ROLE_COMPANY_BUYER}, {[CREATED_AT_ATTRIBUTE]:1})
  .then(users => users.filter(u => moment(u[CREATED_AT_ATTRIBUTE]).isSame(moment(), 'day')).length)
})

/** Upsert ONLY adminDashboard */
AdminDashboard.exists({})
  .then(exists => !exists && AdminDashboard.create({}))
  .catch(err=> console.error(`Only adminDashboard:${err}`))

const getUsersList = () => {
  const HEADERS=[
    {title: 'Créé le', id:'created_format'},
    {title: 'Prénom', id:'firstname'},
    {title: 'Nom', id:'lastname'},
    {title: 'Email', id:'email'},
    {title: 'Acheteur/Vendeur', id:'role_str'},
    {title: `Secteur d'activité`, id:'activity'},
    {title: 'Département', id:'zip_code'},
    {title: 'Métiers', id: 'job'},
    {title: 'Masqué', id: 'visible_str'},
    {title: 'Qualifié', id: 'qualified_str'},
    {title: 'Accompagnement', id: 'coaching_alle'},
    {title: '% complétude', id: 'profile_progress'},
    {title: 'Assurance', id: 'insurance_type'},
    {title: 'Document assurance', id: 'insurance_report'},
  ]
  const TI_BUYER_ROLES=[ROLE_TI,ROLE_COMPANY_BUYER,ROLE_COMPANY_ADMIN]
  const ROLE_LABEL={
    [ROLE_TI]: 'V',
    [ROLE_COMPANY_BUYER]: 'A',
    [ROLE_COMPANY_ADMIN]: 'A',
  }
  
  return User.find().populate('jobs').lean({virtuals:true}).sort({creation_date:1})
    .then(users => {
      return users.map(u => ({
        ...u,
        job: u.jobs.map(j => j.name).join(','),
        coaching_alle: u.coaching==COACH_ALLE ? 'oui':'non',
        created_format: moment(u[CREATED_AT_ATTRIBUTE]).format('DD/MM/YY hh:mm'),
        role_str: ROLE_LABEL[u.role],
        activity: COMPANY_ACTIVITY[u.company_activity],
      }))
    })
    .then(users => {
      const csvStringifier = createCsvWriter({
        header: HEADERS,
        fieldDelimiter: ';',
        path: 'AllTipis.csv',
      });
      return csvStringifier.csvStringifier.getHeaderString() + csvStringifier.csvStringifier.stringifyRecords(users)
    })
}

const sendUsersList = () => {
  return Promise.all([
    User.find({role: {$in: [ROLE_ALLE_ADMIN, ROLE_ALLE_SUPER_ADMIN]}}),
    getUsersList(),
  ])
  .then(([admins, contents]) => {
    // TODO: contact only. Later will send to SUPER_ADMIN roles only
    // admins=admins.filter(a => /contact/.test(a.email))
    const name=`Extraction TIPI du ${moment().format('DD/MM/YY HH:mm')}.csv`
    const content=Buffer.from(contents).toString('base64')
    const attachment={name, content}
    return Promise.allSettled(admins.map(admin => sendUsersExtract(admin, attachment)))
  })
  .then(console.log)
}

!isDevelopment() && cron.schedule('0 0 8 * * *', async() => {
  // Send each monday and thursday
  const DAYS=[1,4]
  const today=moment().startOf('day').day()
  if (DAYS.includes(today)) {
    return sendUsersList()
      .then(console.log)
      .catch(console.error)
  }
})
// Check payment status
// Poll every minute
cron.schedule('*/5 * * * * *', async() => {
  return Mission.findOne({payin_id: {$ne:null}, payin_achieved: null})
    .then(mission => paymentPlugin.getCheckout(mission.payin_id))
    .then(payment => {
      if (payment.status=='expired'  || (payment.status=='complete' && payment.payment_status=='unpaid')) {
        console.log(`Payment ${payment.id} failed`)
        return Mission.findOneAndUpdate({payin_id: payment.id}, {$unset: {payin_id:true, payin_achieved:true}})
      }
      if (payment.status=='complete'  && (payment.payment_status=='paid' || payment.payment_status=='no_payment_required')) {
        console.log(`Payment ${payment.id} succeded`)
        return Mission.findOneAndUpdate({payin_id: payment.id}, {payin_achieved:true})
      }
    })
})

// Daily notifications (every day at 8AM) for missions/quotations reminders
cron.schedule('0 0 8 * * *', async() => {
  console.log('crnoning')
  // Pending quoations: not accepted after 2 days
  loadFromDb({model: 'mission', fields: ['user.firstname','user.email','status','job.user','job.user.full_name']})
    .then(missions => {
      const pendingQuotations=missions.filter(m => m.status==MISSION_STATUS_QUOT_SENT && PENDING_QUOTATION_DELAY.includes(moment().diff(moment(m.quotation_sent_date), 'days')))
      Promise.allSettled(pendingQuotations.map(m => sendPendingQuotation(m)))
      const noQuotationMissions=missions.filter(m => m.status==MISSION_STATUS_ASKING && moment().diff(moment(m[CREATED_AT_ATTRIBUTE]), 'days')==MISSING_QUOTATION_DELAY)
      Promise.allSettled(noQuotationMissions.map(m => sendMissionAskedReminder(m)))
      const soonMissions=missions.filter(m => m.status==MISSION_STATUS_QUOT_ACCEPTED && moment().diff(moment(m[CREATED_AT_ATTRIBUTE]), 'days')==MISSION_REMINDER_DELAY)
      Promise.allSettled(soonMissions.map(m => sendMissionReminderCustomer(m)))
      Promise.allSettled(soonMissions.map(m => sendMissionReminderTI(m)))
    })
})


// Daily notifications (every day at 9PM) to complete profile
cron.schedule('0 0 19 * * *', () => {
  const today=moment().startOf('day')
  const isTuesday=today.day()==2
  console.log(`Checking uncomplete profiles, today is tuesday:${isTuesday}`)
  // Pending quoations: not accepted after 2 days
  return loadFromDb({model: 'user', fields: ['role', 'creation_date', 'email', 'profile_progress','missing_attributes']})
    .then(users => {
      const uncompleteProfiles=users
        .filter(u => u.role==ROLE_TI)
        .filter(u => isTuesday || today.diff(moment(u.creation_date).startOf('day'), 'days')==2)
        .filter(u => u.profile_progress < 100)
        .forEach(u => {
          console.log(`Sending reminder mail to ${u.email}:${u.missing_attributes}`)
          sendProfileReminder(u)
        })
    })
})

module.exports={
  getUsersList,
  sendUsersList,
}

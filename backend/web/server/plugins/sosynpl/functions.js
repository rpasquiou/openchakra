const User = require("../../models/User")
const Announce = require("../../models/Announce")
const Search = require("../../models/Search")
const { declareVirtualField, declareEnumField, callPostCreateData, setPostCreateData, setPreprocessGet, setPreCreateData, declareFieldDependencies, declareComputedField, setFilterDataUser, idEqual, setPrePutData, getModel } = require("../../utils/database");
const { addAction } = require("../../utils/studio/actions");
const { WORK_MODE, SOURCE, EXPERIENCE, ROLES, ROLE_CUSTOMER, ROLE_FREELANCE, WORK_DURATION, COMPANY_SIZE, LEGAL_STATUS, DEACTIVATION_REASON, SUSPEND_REASON, ACTIVITY_STATE, MOBILITY, AVAILABILITY, SOFT_SKILLS, SS_PILAR, DURATION_UNIT, ANNOUNCE_MOBILITY, ANNOUNCE_STATUS, APPLICATION_STATUS, AVAILABILITY_ON, SOSYNPL_LANGUAGES, ANNOUNCE_SUGGESTION, REFUSE_REASON, QUOTATION_STATUS, APPLICATION_REFUSE_REASON, MISSION_STATUS, REPORT_STATUS, SEARCH_MODE } = require("./consts")
const Customer=require('../../models/Customer')
const Freelance=require('../../models/Freelance')
const CustomerFreelance=require('../../models/CustomerFreelance')
const HardSkillCategory=require('../../models/HardSkillCategory')
const { validatePassword } = require("../../../utils/passwords")
const { sendCustomerConfirmEmail, sendFreelanceConfirmEmail } = require("./mailing")
const { ROLE_ADMIN} = require("../smartdiet/consts")
const { NATIONALITIES, PURCHASE_STATUS, LANGUAGE_LEVEL, REGIONS } = require("../../../utils/consts")
const {computeUserHardSkillsCategories, computeHSCategoryProgress } = require("./hard_skills");
const SoftSkill = require("../../models/SoftSkill");
const { computeAvailableGoldSoftSkills, computeAvailableSilverSoftSkills,computeAvailableBronzeSoftSkills } = require("./soft_skills");
const { computeSuggestedFreelances, searchFreelances, countFreelances, searchAnnounces, countAnnounce } = require("./search");
const AnnounceSugggestion=require('../../models/AnnounceSuggestion')
const cron = require('../../utils/cron')
const moment = require('moment');
const { getterPinnedFn, setterPinnedFn } = require("../../utils/pinned");
const {isMine} = require("./message");
const Conversation=require('../../models/Conversation')
const Message=require('../../models/Message');
const { REQUIRED_ATTRIBUTES, SOFT_SKILLS_ATTR, MANDATORY_ATTRIBUTES } = require("./freelance");
const { usersCount, customersCount, freelancesCount, currentMissionsCount, comingMissionsCount, registrationStatistic } = require("./statistic");
const Statistic = require("../../models/Statistic");

// TODO move in DB migration
// Ensure softSkills
const ensureSoftSkills = () => {
  const promises=Object.entries(SOFT_SKILLS).map(([value, name]) => {
    return SoftSkill.findOneAndUpdate(
      {value},
      {name, value},
      {upsert: true, new: true}
    )
  })
  return Promise.all(promises)
}

ensureSoftSkills()

const MODELS=['loggedUser', 'user', 'customer', 'freelance', 'admin', 'genericUser', 'customerFreelance']
MODELS.forEach(model => {
  if(!['admin','customer'].includes(model)){ //['loggedUser', 'user', 'freelance', 'genericUser', 'customerFreelance']
    declareVirtualField({model, field: 'availability_update_days', type: 'Number'})
  }
  if(!['user','customer','admin'].includes(model)){//['loggedUser', 'freelance', 'genericUser', 'customerFreelance']
    declareVirtualField({
      model, field: 'pinned_announces', instance: 'Array', multiple: true,
      caster: {
        instance: 'ObjectID',
        options: { ref: 'announce' }
      },
    })
  }
  if(!['admin','user'].includes(model)){
    declareVirtualField({model, field: 'received_suggestions_count', type: 'Number'})
  }
  declareVirtualField({model, field: 'password2', type: 'String'})
  declareVirtualField({model, field: 'fullname', type: 'String', requires: 'firstname,lastname'})
  declareVirtualField({model, field: 'shortname', type: 'String', requires: 'firstname,lastname'})
  declareEnumField({model, field: 'role', enumValues: ROLES})
  declareEnumField({model, field: 'nationality', enumValues: NATIONALITIES})
  declareVirtualField({
    model, field: 'pinned_missions', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'mission' }
    },
  })
  declareVirtualField({
    model, field: 'pinned_freelances', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'mission' }
    },
  })
  declareComputedField({model, field: 'pinned', requires: 'pinned_by', getterFn: getterPinnedFn(model), setterFn: setterPinnedFn(model) })
  declareVirtualField({
    model, field: 'customer_missions', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'mission' }
    },
  })
  declareEnumField({model, field: 'company_size', enumValues: COMPANY_SIZE})
  declareEnumField({model, field: 'legal_status', enumValues: LEGAL_STATUS})
  declareEnumField({model, field: 'deactivation_reason', enumValues: DEACTIVATION_REASON})
  declareEnumField({model, field: 'activity_status', enumValues: ACTIVITY_STATE})
  declareEnumField({model, field: 'suspended_reason', enumValues: SUSPEND_REASON})
  declareEnumField({model, field: 'legal_representant_nationality', enumValues: NATIONALITIES})

  // Legal representant
  declareFieldDependencies({model, field: 'legal_representant_firstname', requires: `legal_representant_self,firstname`})
  declareFieldDependencies({model, field: 'legal_representant_lastname', requires: `legal_representant_self,lastname`})
  declareFieldDependencies({model, field: 'legal_representant_birthdate', requires: `legal_representant_self,birthdate`})
  declareFieldDependencies({model, field: 'legal_representant_email', requires: `legal_representant_self,email`})
  declareFieldDependencies({model, field: 'legal_representant_phone', requires: `legal_representant_self,phone`})
  declareFieldDependencies({model, field: 'legal_representant_address', requires: `legal_representant_self,address`})
  declareFieldDependencies({model, field: 'legal_representant_nationality', requires: `legal_representant_self,nationality`})


  // Billing contact
  declareFieldDependencies({model, field: 'billing_contact_firstname', requires: `billing_contact_self,firstname`})
  declareFieldDependencies({model, field: 'billing_contact_lastname', requires: `billing_contact_self,lastname`})
  declareFieldDependencies({model, field: 'billing_contact_email', requires: `billing_contact_self,email`})
  declareFieldDependencies({model, field: 'billing_contact_address', requires: `billing_contact_self,address`})

  declareVirtualField({model, field: 'announces', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'announce' }
    },
  })

  declareVirtualField({model, field: 'sent_suggestions', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'announceSuggestion' }
    },
  })
  declareVirtualField({model, field: 'received_suggestions', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'announceSuggestion' }
    },
  })
  declareVirtualField({model, field: 'current_missions', requires: 'role', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'mission'}
    }
  })
  declareVirtualField({model, field: 'coming_missions', requires: 'role', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'mission'}
    }
  })
  declareVirtualField({
    model, field: 'pinned_freelances', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'freelance' }
    },
  })
})

const FREELANCE_MODELS=['freelance', 'loggedUser', 'genericUser', 'customerFreelance']
FREELANCE_MODELS.forEach(model => {
  declareVirtualField({model, field: 'freelance_missions', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'mission' }
    },
  })
  declareVirtualField({model, field: 'recommandations', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'recommandation' }
    },
  })
  declareVirtualField({model, field: 'communications', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'communication' }
    },
  })
  declareVirtualField({model, field: 'search_visible', instance: 'Boolean'})
  declareEnumField({model, field: 'work_mode', enumValues: WORK_MODE})
  declareEnumField({model, field: 'source', enumValues: SOURCE})
  declareEnumField({model, field: 'main_experience', enumValues: EXPERIENCE})
  declareEnumField({model, field: 'second_experience', enumValues: EXPERIENCE})
  declareEnumField({model, field: 'third_experience', enumValues: EXPERIENCE})
  declareEnumField({model, field: 'work_duration', enumValues: WORK_DURATION})
  declareEnumField({model, field: 'work_company_size', enumValues: COMPANY_SIZE})
  declareVirtualField({model, field: 'experiences', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'experience' }
    },
  })
  declareVirtualField({model, field: 'certifications', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'certification' }
    },
  })
  declareVirtualField({model, field: 'trainings', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'training' }
    },
  })
  declareComputedField({model, field: 'hard_skills_categories', requires: 'main_job.job_file', getterFn: computeUserHardSkillsCategories})
  declareEnumField( {model, field: 'mobility', enumValues: MOBILITY})
  declareEnumField( {model, field: 'mobility_regions', enumValues: REGIONS})
  declareVirtualField({model, field: 'mobility_str', instance: 'String', requires: 'mobility,mobility_regions,mobility_city,mobility_city_distance'})
  declareEnumField( {model, field: 'availability', enumValues: AVAILABILITY})
  declareVirtualField({model, field: 'availability_str', instance: 'String', requires: 'availability,available_days_per_week,available_from'})
  declareComputedField({model, field: 'available_gold_soft_skills', getterFn: computeAvailableGoldSoftSkills})
  declareComputedField({model, field: 'available_silver_soft_skills', requires: 'gold_soft_skills', getterFn: computeAvailableSilverSoftSkills})
  declareComputedField({model, field: 'available_bronze_soft_skills', requires: 'gold_soft_skills,silver_soft_skills', getterFn: computeAvailableBronzeSoftSkills})
  // Declare virtuals for each pilar
  Object.keys(SS_PILAR).forEach(pilar => {
    const virtualName=pilar.replace(/^SS_/, '').toLowerCase()
    declareVirtualField({model, field: virtualName, instance: 'Number', requires: 'gold_soft_skills,silver_soft_skills,bronze_soft_skills'})  
  })
  declareVirtualField({model, field: 'sent_applications', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'application' }
    },
  })
  declareVirtualField({model, field: 'customer_evaluations', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'evaluation' }
    },
  })
  declareVirtualField({model, field: 'freelance_evaluations', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'evaluation' }
    },
  })
  declareVirtualField({model, field: 'customer_average_note', instance: 'Number', requires: 'customer_evaluations'})
  declareVirtualField({model, field: 'freelance_average_note', instance: 'Number', requires: 'freelance_evaluations'})
})

declareEnumField( {model: 'purchase', field: 'status', enumValues: PURCHASE_STATUS})

/** JobFile start */
declareVirtualField({model: 'jobFile', field: 'jobs', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'job' }
},
})
declareVirtualField({model: 'jobFile', field: 'features', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'jobFileFeature' }
},
})
declareVirtualField({model: 'jobFile', field: 'hard_skills', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'hardSkill' }
},
})
/** JobFIle end */

/** Language level start */
declareEnumField({model: 'languageLevel', field: 'language', enumValues: SOSYNPL_LANGUAGES})
declareEnumField({model: 'languageLevel', field: 'level', enumValues: LANGUAGE_LEVEL})
/** Language level end */

/** HS Category start */
declareVirtualField({model: 'hardSkillCategory', field: 'children', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'hardSkillCategory' }
},
})
declareVirtualField({model: 'hardSkillCategory', field: 'skills', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'hardSkill' }
},
})
declareComputedField({model: 'hardSkillCategory', field: 'progress', instance: 'Number', getterFn: computeHSCategoryProgress})
/** HS Category end */

/** Expertise category start */
declareVirtualField({model: 'expertiseCategory', field: 'children', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'expertiseCategory' }
},})

declareVirtualField({model: 'expertiseCategory', field: 'expertises', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'expertise' }
},})
/** Expertise category end */

/** Soft skills start */
declareEnumField({model: 'softSkill', field: 'value', enumValues: SOFT_SKILLS})
/** Soft skills end */

/** Announce start */
declareVirtualField({model: 'announce', field: 'total_budget', instance: 'Number', requires: 'budget'})
declareComputedField({model: 'announce', field: 'suggested_freelances', getterFn: computeSuggestedFreelances})
declareEnumField({model: 'announce', field: 'duration_unit', enumValues: DURATION_UNIT})
declareEnumField({model: 'announce', field: 'mobility', enumValues: ANNOUNCE_MOBILITY})
declareEnumField({model: 'announce', field: 'soft_skills', enumValues: SS_PILAR})
declareEnumField({model: 'announce', field: 'status', enumValues: ANNOUNCE_STATUS})
declareVirtualField({model: 'announce', field: 'received_applications', instance: 'Array', multiple: true,
caster: {
  instance: 'ObjectID',
  options: { ref: 'application' }
},})
declareVirtualField({model: 'announce', field: 'received_applications_count', instance: 'Number'})
declareEnumField({model: 'announce', field: 'experience', enumValues: EXPERIENCE})
declareVirtualField({model: 'announce', field: 'average_daily_rate', instance: 'Number', requires:'duration,duration_unit,budget'})
declareVirtualField({model: 'announce', field: '_duration_days', instance: 'Number'})
declareEnumField({model: 'announce', field: 'mobility_regions', enumValues: REGIONS})
// SOFT SKILLS
declareComputedField({model: 'announce', field: 'available_gold_soft_skills', getterFn: computeAvailableGoldSoftSkills})
declareComputedField({model: 'announce', field: 'available_silver_soft_skills', requires: 'gold_soft_skills', getterFn: computeAvailableSilverSoftSkills})
declareComputedField({model: 'announce', field: 'available_bronze_soft_skills', requires: 'gold_soft_skills,silver_soft_skills', getterFn: computeAvailableBronzeSoftSkills})
  // Declare virtuals for each pilar
  /*TODO:
  Codé avec le cul
   */
  Object.keys(SS_PILAR).forEach(pilar => {
    const virtualName=pilar.replace(/^SS_/, '').toLowerCase()
    declareVirtualField({model: 'announce', field: virtualName, instance: 'Number', requires: 'gold_soft_skills,silver_soft_skills,bronze_soft_skills'})  
})
declareVirtualField({model: 'announce', field: 'serial_number', requires: '_counter', instance: 'String'})
declareComputedField({model: 'announce', field: 'pinned', requires: 'pinned_by', getterFn: getterPinnedFn('announce'), setterFn: setterPinnedFn('announce') })
/** Announce end */


/** Application start */
declareEnumField({model: 'application', field: 'status', enumValues: APPLICATION_STATUS})
declareVirtualField({model: 'application', field: 'quotations', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'quotation' }
  }
})
declareVirtualField({model: 'application', field: 'latest_quotations', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'quotation' }
  }
})
declareVirtualField({model: 'application', field: 'serial_number', requires: '_counter', instance: 'String'})
declareEnumField({model: 'application', field: 'refuse_reason', enumValues: APPLICATION_REFUSE_REASON})
/** Application end */

/** Announce suggestion start */
declareEnumField({model: 'announceSuggestion', field: 'status', enumValues: ANNOUNCE_SUGGESTION})
declareEnumField({model: 'announceSuggestion', field: 'refuse_reason', enumValues: REFUSE_REASON})
/** Announce suggestion end */

/** Quotation start */
declareVirtualField({model: 'quotation', field: 'details', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'quotationDetail' }
  }
})
declareVirtualField({model: 'quotation', field: 'ht_total', instance: 'Number', requires: 'details.ht_total'})
declareVirtualField({model: 'quotation', field: 'ttc_total', instance: 'Number', requires: 'details.ttc_total'})
declareVirtualField({model: 'quotation', field: 'vat_total', instance: 'Number', requires: 'details.vat_total'})
declareVirtualField({model: 'quotation', field: 'quantity_total', instance: 'Number', requires: 'details.quantity'})
declareVirtualField({model: 'quotation', field: 'ttc_net_revenue', instance: 'Number', requires: 'ttc_total'})
declareVirtualField({model: 'quotation', field: 'ht_net_revenue', instance: 'Number', requires: 'ht_total,ht_freelance_commission'})
declareVirtualField({model: 'quotation', field: 'ht_freelance_commission', instance: 'Number', requires: 'ttc_total'})
declareVirtualField({model: 'quotation', field: 'ttc_freelance_commission', instance: 'Number', requires: 'ht_freelance_commission'})
declareVirtualField({model: 'quotation', field: 'vat_freelance_commission', instance: 'Number', requires: 'ht_freelance_commission'})
declareVirtualField({model: 'quotation', field: 'serial_number', requires: '_counter', instance: 'String'})
declareEnumField({model: 'quotation', field: 'status', instance: 'String', enumValues: QUOTATION_STATUS})
declareVirtualField({model: 'quotation', field: 'average_daily_rate_ht', instance: 'Number', requires: 'quantity_total,ht_total'})
declareVirtualField({model: 'quotation', field: 'average_daily_rate_ttc', instance: 'Number', requires: 'quantity_total,ttc_total'})
declareVirtualField({model: 'quotation', field: 'ht_customer_commission', instance: 'Number', requires: 'ht_total'})
declareVirtualField({model: 'quotation', field: 'ttc_customer_commission', instance: 'Number', requires: 'ttc_total'})
declareVirtualField({model: 'quotation', field: 'vat_customer_commission', instance: 'Number', requires: 'ht_customer_commission'})
declareVirtualField({model: 'quotation', field: 'ttc_customer_total', instance: 'Number', requires: 'ttc_total,ttc_customer_commission'})
/** Quotation end */


/** QuotationDetail start */
declareVirtualField({model: 'quotationDetail', field: 'ht_total', instance: 'Number', requires: 'price,quantity'})
declareVirtualField({model: 'quotationDetail', field: 'ttc_total', instance: 'Number', requires: 'ht_total,vat_rate'})
declareVirtualField({model: 'quotationDetail', field: 'vat_total', instance: 'Number', requires: 'ht_total,vat_rate'})
/** QuotationDetail end */

/** Mission start */
declareVirtualField({model: 'mission', field: 'serial_number', requires: '_counter', instance: 'String'})
declareVirtualField({
  model: 'mission', field: 'status', requires: 'start_date,end_date,freelance_finish_date,customer_finish_date,close_date', 
  instance: 'String', enumValues: MISSION_STATUS})
declareVirtualField({model: 'mission', field: 'reports', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'report' }
  }
})
declareVirtualField({model: 'mission', field: 'budget', instance: 'Number', requires: 'application.latest_quotations.ht_total'})
declareVirtualField({model: 'mission', field: 'progress', instance: 'Number', requires: 'budget,paid_amount'})
declareVirtualField({model: 'mission', field: 'paid_amount', instance: 'Number', requires: 'reports.latest_quotations.ht_total'})
declareVirtualField({model: 'mission', field: 'unpaid_amount', instance: 'Number', requires: 'budget,paid_amount'})
/** Mission end */

/** Report start */
declareEnumField({model: 'report', field: 'status', instance: 'String', enumValues: REPORT_STATUS})
declareVirtualField({model: 'report', field: 'serial_number', requires: '_counter', instance: 'String'})
declareVirtualField({model: 'report', field: 'quotation', instance: 'quotation'})
declareVirtualField({model: 'report', field: 'latest_quotations', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'quotation' }
  }
})
/** Report end */

/** Search start */
const SEARCH_FIELDS='available,city,city_radius,experiences,expertises,max_daily_rate,min_daily_rate,pattern,pilars,sectors,work_durations,work_modes,mode'
declareEnumField({model: 'search', field: 'mode', instance: 'String', enumValues: SEARCH_MODE})
declareEnumField({model: 'search', field: 'work_modes', instance: 'String', enumValues: WORK_MODE})
declareEnumField({model: 'search', field: 'work_durations', instance: 'Array', enumValues: WORK_DURATION})
declareEnumField({model: 'search', field: 'experiences', instance: 'String', enumValues: EXPERIENCE})
declareEnumField({model: 'search', field: 'pilars', instance: 'String', enumValues: SS_PILAR})
declareComputedField({model: 'search', field: 'profiles', instance: 'Array', requires: SEARCH_FIELDS, getterFn: searchFreelances })
declareComputedField({model: 'search', field: 'profiles_count', instance: 'Number', requires: SEARCH_FIELDS, getterFn: countFreelances })
declareComputedField({model: 'search', field: 'announces', instance: 'Array', requires: SEARCH_FIELDS, getterFn: searchAnnounces })
declareComputedField({model: 'search', field: 'announces_count', instance: 'Number', requires: SEARCH_FIELDS, getterFn: countAnnounce })
/** Search end */

//Conversation
declareVirtualField({
  model: 'conversation', field: 'messages', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'message' }
  },
})
declareVirtualField({model: 'conversation', field: 'messages_count', instance: 'Number'})
declareVirtualField({
  model: 'conversation', field: 'latest_messages', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'message' }
  },
})
//Message
declareComputedField({model: 'message', field: 'mine', requires: 'sender', getterFn: isMine})

//CustomerFreelance
const CUSTOMERFREELANCEMODELS = ['loggedUser', 'genericUser', 'customerFreelance', 'freelance']
CUSTOMERFREELANCEMODELS.forEach(model => {
  declareVirtualField({
    model, field: 'applications', instance: 'Array', multiple: true,
    caster: {
      instance: 'ObjectID',
      options: { ref: 'application' }
    },
  })
  declareVirtualField({model, field: 'profile_completion', requires:[...REQUIRED_ATTRIBUTES, ...SOFT_SKILLS_ATTR, ...MANDATORY_ATTRIBUTES, 'missing_attributes'].join(','), instance: 'Number'})
  declareVirtualField({
    model, field: 'missing_attributes', instance: 'Array', multiple: true, requires:[...REQUIRED_ATTRIBUTES, ...SOFT_SKILLS_ATTR, ...MANDATORY_ATTRIBUTES].join(','),
    caster: {
      instance: 'String',
    },
  })
})

//Evaluation
declareVirtualField({model: 'evaluation', field: 'customer_average_note', requires:'customer_note_quality,customer_note_deadline,customer_note_team,customer_note_reporting', instance: 'Number'})
declareVirtualField({model: 'evaluation', field: 'freelance_average_note', requires:'freelance_note_interest,freelance_note_organisation,freelance_note_integration,freelance_note_communication', instance: 'Number'})

//Customer
declareVirtualField({
  model: 'customer', field: 'applications', instance: 'Array', multiple: true,
  caster: {
    instance: 'ObjectID',
    options: { ref: 'application' }
  },
})

//Statistic
declareComputedField({model:'statistic', field:'users_count', instance: 'Number', getterFn: usersCount})
declareComputedField({model:'statistic', field:'customers_count', instance: 'Number',getterFn: customersCount})
declareComputedField({model:'statistic', field:'freelances_count', instance: 'Number',getterFn: freelancesCount})
declareComputedField({model:'statistic', field:'current_missions_count', instance: 'Number',getterFn: currentMissionsCount})
declareComputedField({model:'statistic', field:'coming_missions_count', instance: 'Number',getterFn: comingMissionsCount})
declareComputedField({model:'statistic', field:'registrations_statistic', instance: 'Array', getterFn: registrationStatistic})

const soSynplRegister = props => {
  console.log(`Register with ${JSON.stringify(props)}`)
  if (![ROLE_CUSTOMER, ROLE_FREELANCE].includes(props.role)) {
    throw new Error(`Le role ${props.role || 'vide'} est invalide pour l'inscription`)
  }
  const model=CustomerFreelance //props.role==ROLE_FREELANCE ? Freelance : Customer
  const modelName='customerFreelance' //props.role==ROLE_FREELANCE ? 'freelance' : 'customer'
  return User.exists({email: props.email})
    .then(exists => {
      if (exists) {
        return Promise.reject(`Un compte avec le mail ${props.email} existe déjà`)
      }

      let promise
      if (props.password) {
        promise=validatePassword({...props})
      }
      else {
        //props.password=generatePassword()
        promise=Promise.resolve()
      }

      return promise
        .then(()=> {
          console.log(`DB create with ${JSON.stringify(props)}`)
          return model.create({...props})
        })
        .then(user => callPostCreateData({model: modelName, data:user}))
  })
}

addAction('register', soSynplRegister)

const ROLE_MODEL_MAPPING={
  [ROLE_CUSTOMER]: 'customer',
  [ROLE_FREELANCE]: 'freelance',
  [ROLE_CUSTOMER]: 'customerFreelance',
  [ROLE_FREELANCE]: 'customerFreelance',
  [ROLE_ADMIN]: 'admin',
}

const preProcessGet = async ({ model, fields, id, user, params }) => {
  if (model=='loggedUser') {
    const modelName=ROLE_MODEL_MAPPING[user.role]
    return({model: modelName, fields, id: user._id, user, params})
  }
  if (['freelance', 'customer'].includes(model)) {
    const role=model=='freelance' ? ROLE_FREELANCE : ROLE_CUSTOMER
    return({model: 'customerFreelance', fields, id, user, params: {...params, 'filter.role': role}})
  }
  // User gets a new search: create it
  if (model=='search' && !id) {
    const newSearch=await Search.create({})
    return { model, fields, id: newSearch._id, user, params }
  }
  if (model == 'conversation') {
    if (id) {
      return Conversation.findById(id)
        .then(async(conv) => {
          if(!conv){
            const partner = await User.findById(id)
            if(!partner) {
              throw new Error(`${id} is not a valid user`)
            }
            if (idEqual(partner._id, user._id)) {
              throw new Error(`Vous ne pouvez avoir de conversation avec vous-même`)
            }
          }
          const res=conv || Conversation.getFromUsers(user._id, id)
          return res
        })
        .then(conv => {
          return {model, fields, id: conv._id, params }
        })
    }
    else {
      params['filter.users']=user._id
    }
  }
  if (model == 'statistic') {
    // if(user.role == ROLE_ADMIN){
      await Statistic.deleteMany()
      const s= Statistic.create({})
      id = s._id
    // }
  }
  return { model, fields, id, user, params }
}

setPreprocessGet(preProcessGet)

const preCreate = async ({model, params, user}) => {
  if (['experience', 'communication', 'certification', 'training'].includes(model) && !params.user) {
    params.user=user
  }
  if (['software', 'languageLevel'].includes(model)) {
    if (!params.parent) {
      throw new Error(`Parent parameter is required`)
    }
  }
  // Announce will be validated on "publish action"
  if (model=='announce') {
    params.user=user
    return { model, params, user, skip_validation: true }
  }
  if (model=='report') {
    params.mission=params.mission || params.parent
    return { model, params, user, skip_validation: true  }
  }
  if (model=='application') {
    const parentModel=await getModel(params.parent)
    if (parentModel=='announceSuggestion') {
      params.parent=(await AnnounceSugggestion.findById(params.parent))?.announce?._id
    }
    params.announce=params.parent
    params.freelance = params.freelance || user._id
    return { model, params, user, skip_validation: true}
  }
  if (model=='quotation') {
    params.application=params.application || params.parent
    return { model, params, user, skip_validation: true}
  }
  if (model=='quotationDetail') {
    params.quotation=params.quotation || params.parent
    return { model, params, user}
  }
  if (['message'].includes(model)) {
    params.sender = user
    const conversation=await Conversation.findById(params.parent)
    params.conversation=conversation
    params.receiver=await conversation.getPartner(user)
  }
  return Promise.resolve({model, params})
}

setPreCreateData(preCreate)

const postCreate = async ({model, params, data}) => {
  if (data.role==ROLE_CUSTOMER) {
    await sendCustomerConfirmEmail({user: data})
  }
  if (data.role==ROLE_FREELANCE) {
    await sendFreelanceConfirmEmail({user: data})
  }
  if (model=='software' && params.parent) {
    const parentModel=await getModel(params.parent)
    if (['customerFreelance', 'user'].includes(parentModel)) {
      await Freelance.findByIdAndUpdate(params.parent, {$addToSet: {softwares: data._id}})
    }
    if (parentModel=='announce') {
      await Announce.findByIdAndUpdate(params.parent, {$addToSet: {softwares: data._id}})
    }
  }
  if (model=='languageLevel' && params.parent) {
    const parentModel=await getModel(params.parent)
    if (['customerFreelance', 'user'].includes(parentModel)) {
      await Freelance.findByIdAndUpdate(params.parent, {$addToSet: {languages: data._id}})
    }
    if (parentModel=='announce') {
      await Announce.findByIdAndUpdate(params.parent, {$addToSet: {languages: data._id}})
    }
  }
  return Promise.resolve(data)
}

setPostCreateData(postCreate)

const prePutData = async ({model, id, params, user}) => {
  // Skip validaaiton for these models. Will be validated on publish action
  if (['announce', 'application', 'quotation'].includes(model)) {
    return {model, id, params, user, skip_validation: true}
  }
  const targetUser = await User.findById(id, {availability:1})
  if(!!params.availability && params.availability!= targetUser.availability) {
    params.availability_last_update = moment()
    console.log(params)
    return {model, id, params, user}
  }
  return {model, id, params, user}
}

setPrePutData(prePutData)

const filterDataUser = async ({ model, data, id, user }) => {
  if (model=='hardSkillCategory' && !id) {
    const top_level=await HardSkillCategory.find({parent: null}, {_id:1})
    data=data.filter(d => top_level.some(t => idEqual(t._id, d._id)))
  }
  return data
}

setFilterDataUser(filterDataUser)

const getConversationPartner = (userId, params, data) => {
  return Conversation.findById(data._id, {users:1})
    .then(conv => {
      return conv.getPartner(userId) 
    })
    .then(partner => {
      return User.findById(partner._id).populate('company')
    })
}

declareComputedField({model: 'conversation', field: 'partner', getterFn: getConversationPartner})

//**** CRONS start*/

// Freelance whose availability date is before tonight become available
cron.schedule('0 0 * * * *', async () => {
  console.log('Checking freelance availabilities')
  await Freelance.updateMany(
    {available_from: {$lt: moment().endOf('day')}},
    {available_from: null, availability: AVAILABILITY_ON}
  )
})

//**** CRONS end */

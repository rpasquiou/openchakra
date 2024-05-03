const mongoose = require("mongoose")
const { schemaOptions } = require('../../../utils/schemas');
const { DUMMY_REF } = require("../../../utils/database");

const Schema = mongoose.Schema;

const AdminDashboardSchema = new Schema({
  }, schemaOptions
);

AdminDashboardSchema.virtual('company', DUMMY_REF).get(function() { return null })
AdminDashboardSchema.virtual('webinars_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('average_webinar_registar', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('webinars_replayed_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('groups_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('messages_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('users_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('leads_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('users_men_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('user_women_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual('users_no_gender_count', DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual(`started_coachings`, DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual(`specificities_users`, DUMMY_REF).get(function() { return 0 })
AdminDashboardSchema.virtual(`reasons_users`, DUMMY_REF).get(function() { return 0 })

AdminDashboardSchema.virtual(`coachings_started`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_stopped`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_dropped`, DUMMY_REF).get(function() {return 0})
//AdminDashboardSchema.virtual(`nut_advices`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c1`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c2`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c3`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c4`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c5`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c6`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c7`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c8`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c9`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c10`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c11`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c12`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c13`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c14`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c15`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_done_c16`, DUMMY_REF).get(function() {return 0})

module.exports = AdminDashboardSchema

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
AdminDashboardSchema.virtual(`coachings_ongoing`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`nut_advices`, DUMMY_REF).get(function() {return 0})
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
AdminDashboardSchema.virtual(`cs_upcoming`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c1`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c2`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c3`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c4`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c5`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c6`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c7`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c8`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c9`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c10`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c11`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c12`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c13`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c14`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c15`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`cs_upcoming_c16`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_18_24`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_25_29`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_30_34`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_35_39`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_40_44`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_45_49`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_50_54`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_55_59`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_60_64`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_65_69`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_70_74`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_18_24_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_25_29_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_30_34_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_35_39_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_40_44_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_45_49_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_50_54_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_55_59_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_60_64_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_65_69_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`started_coachings_70_74_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_unknown`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_male`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_female`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_non_binary`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_renewed`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`jobs_details`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`jobs_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reasons_details`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reasons_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reasons_details`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reasons_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`ratio_stopped_started`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`ratio_dropped_started`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`incalls_per_operator`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`outcalls_per_operator`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`incalls_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`outcalls_total`, DUMMY_REF).get(function() {return 0})
module.exports = AdminDashboardSchema

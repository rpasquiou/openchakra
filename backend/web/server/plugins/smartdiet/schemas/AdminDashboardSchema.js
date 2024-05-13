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
AdminDashboardSchema.virtual(`coachings_unknown`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_male`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_female`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_non_binary`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`coachings_renewed`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_1_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_2_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_3_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_4_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_5_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_1_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_2_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_3_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_4_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_5_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_1_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_2_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_3_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_4_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`job_5_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`jobs_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_1_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_2_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_3_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_4_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_5_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_6_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_7_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_8_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_9_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_10_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_11_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_12_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_13_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_14_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_15_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_16_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_17_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_18_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_19_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_20_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_1_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_2_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_3_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_4_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_5_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_6_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_7_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_8_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_9_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_10_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_11_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_12_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_13_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_14_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_15_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_16_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_17_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_18_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_19_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_20_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_1_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_2_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_3_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_4_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_5_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_6_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_7_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_8_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_9_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_10_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_11_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_12_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_13_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_14_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_15_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_16_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_17_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_18_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_19_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reason_20_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`join_reasons_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_1_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_2_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_3_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_4_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_5_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_6_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_7_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_8_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_9_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_10_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_1_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_2_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_3_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_4_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_5_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_6_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_7_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_8_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_9_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_10_percent`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_1_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_2_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_3_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_4_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_5_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_6_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_7_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_8_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_9_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reason_10_name`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`decline_reasons_total`, DUMMY_REF).get(function() {return 0})
AdminDashboardSchema.virtual(`ratio_stopped_started`, DUMMY_REF).get(function() {return 0})
module.exports = AdminDashboardSchema

const lodash = require('lodash')
const Appointment = require('../../models/Appointment')
const Company = require('../../models/Company')
const {
  APPOINTMENT_TYPE_ASSESSMENT,
  APPOINTMENT_TYPE_FOLLOWUP,
  APPOINTMENT_TYPE_NUTRITION,
} = require('./consts')
const NutritionAdvice = require('../../models/NutritionAdvice')
require('../../models/Comment')

const computeBilling = async () => {
  try {
    // Étape 1 : Récupérer tous les rendez-vous
    const appointments = await Appointment.find().populate('diet').limit(3)

    // Étape 2 : Regrouper les rendez-vous par diététicien
    const appointmentsByDiet = lodash.groupBy(appointments, (appointment) =>
      appointment.diet._id.toString()
    )

    // Étape 3 : Récupérer les Company avec une projection sur assessement_appointment_type
    const companies = await Company.find(
      { assessment_appointment_type: { $ne: null } },
      { assessment_appointment_type: 1 }
    ).lean()

    // Étape 4 : Traiter les rendez-vous pour déterminer leur type
    const companyAssessmentTypes = companies.map((company) =>
      company.assessment_appointment_type.toString()
    )
    const processedAppointmentsByDiet = lodash.mapValues(
      appointmentsByDiet,
      (dietAppointments) => {
        return lodash.groupBy(dietAppointments, (appointment) => {
          return companyAssessmentTypes.includes(
            appointment.appointment_type.toString()
          )
            ? APPOINTMENT_TYPE_ASSESSMENT
            : APPOINTMENT_TYPE_FOLLOWUP
        })
      }
    )

    // Étape 5 : Récupérer tous les conseils nutritionnels
    const nutritionAdvices = await NutritionAdvice.find()
      .populate('diet')
      .limit(3)

    // Étape 6 : Regrouper les conseils nutritionnels par diététicien
    const nutritionAdvicesByDiet = lodash.mapValues(
      lodash.groupBy(nutritionAdvices, (advice) => advice.diet._id.toString()),
      (advices) => ({ [APPOINTMENT_TYPE_NUTRITION]: advices })
    )

    // Étape 7 : Combiner les rendez-vous et les conseils nutritionnels
    const combinedData = lodash.mergeWith(
      {},
      processedAppointmentsByDiet,
      nutritionAdvicesByDiet,
      (objValue, srcValue) => {
        if (lodash.isObject(objValue) && lodash.isObject(srcValue)) {
          return lodash.merge(objValue, srcValue)
        }
      }
    )
    return combinedData
  } catch (error) {
    console.error(error)
    throw error
  }
}

module.exports = { computeBilling }

const lodash = require(`lodash`)
const Quizz = require("../../models/Quizz")
const { loadFromDb } = require("../../utils/database")
const { QUIZZ_TYPE_PROGRESS } = require("./consts")

const copyProgressAnswers = async ({sourceQuizz, destinationQuizz}) => {
  if (!sourceQuizz.questions || !destinationQuizz.questions) {
    throw new Error(`source and destination questions must be loaded (${!!sourceQuizz.questions},${!!destinationQuizz.questions}))`)
  }
  sourceQuizz.questions.forEach(async (question, idx) => {
    destinationQuizz.questions[idx].single_enum_answer=question.single_enum_answer
    await destinationQuizz.questions[idx].save()
  })
}
/** Create a progres quizz for an appointment
 * If the coaching already has an appintment, the latest one's answer are copied
 * 
 */
const createAppointmentProgress = async ({coaching}) => {
  const progressTemplate=await Quizz.findOne({ type: QUIZZ_TYPE_PROGRESS }).populate('questions')
  const progressUser = await progressTemplate.cloneAsUserQuizz()
  // Copy progress answer from previous appointment if any
  const [loadedCoaching]=await loadFromDb({model: 'coaching', id: coaching, fields:['latest_appointments.progress.questions']})
  if (!lodash.isEmpty(loadedCoaching.latest_appointments)) {
    await copyProgressAnswers({sourceQuizz: loadedCoaching.latest_appointments[0].progress, destinationQuizz: progressUser})
  }
  return progressUser._id
}

module.exports={
  createAppointmentProgress, copyProgressAnswers,
}
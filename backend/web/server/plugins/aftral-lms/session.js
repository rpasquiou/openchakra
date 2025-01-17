const Progress = require("../../models/Progress")
const Session = require("../../models/Session")

/**
 * Certificate is available if:
 * - today is the last day of the session
 * - the trainee has finished all the mandatory resources in the session
 */
const isCertificateAvailable = async (userId, sessionId) => {
  const session=await Session.findById(sessionId)
  if (!session) {
    throw new Error(`Session ${sessionId} not found`)
  }
  const {mandatory_resources_count}=session
  if (mandatory_resources_count==null) {
    throw new Error(`Session ${sessionId} has no mandatory_resources_count`)
  }
  const finishedProgress = await Progress.exists({block: sessionId, user: userId, finished_resources_count: mandatory_resources_count})
  return finishedProgress
}

module.exports = {
  isCertificateAvailable,
}
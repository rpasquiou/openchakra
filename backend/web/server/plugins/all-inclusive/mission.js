const Mission = require("../../models/Mission")

const clone = async mission_id => {
  const origin = await Mission.findById(mission_id)

  const cloned = new Mission({
    name: `Copie de ${origin.name}`,
    description: origin.description,
    duration: origin.duration,
    address: origin.address,
    required_services: origin.required_services,
    document: origin.document,
    document_2: origin.document_2,
    document_3: origin.document_3,
    customer_location: origin.customer_location,
    foreign_location: origin.foreign_location,
    recurrent: origin.recurrent,
    frequency: origin.frequency,
    user: origin.user,
    dummy: origin.dummy,
  })

  await cloned.save({ validateBeforeSave: false })
  return cloned
}

module.exports = {
  clone,
}
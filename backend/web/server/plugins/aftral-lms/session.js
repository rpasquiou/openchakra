import { getBlockResources } from "./resources"

const getEvalResources = async (userId, params, data) => {
  const resources = await getBlockResources (userId, params, data)
  console.log(resources)
}

module.exports()
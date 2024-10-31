// Compute rates according to rating guide here : https://github.com/ssllabs/research/wiki/SSL-Server-Rating-Guide

const PROTOCOL_RATES = {
  ['2']: 0,     //SSL 2.0
  ['768']: 80,  //SSL 3.0
  ['769']: 90,  //TLS 1.0
  ['770']: 95,  //TLS 1.1
  ['771']: 100, //TLS 1.2
  ['772']: 100, //TLS 1.3
}

const computeCipherRate = (strength) => {
  if (strength == 0) {
    return 0
  }
  if (strength < 128) {
    return 20
  }
  if (strength < 256) {
    return 80
  }
  return 100
}

const computeKeyRate = (keyStrength) => {
  if (!keyStrength) {
    return 0
  }
  if (keyStrength < 512) {
    return 20
  }
  if (keyStrength < 1024) {
    return 40
  }
  if (keyStrength < 2048) {
    return 80
  }
  if (keyStrength < 4096) {
    return 90
  }
  return 100
}

const updateBest = (newValue, oldValue) =>  {
  if (! oldValue || oldValue < newValue) {
      return newValue
  }
  return oldValue
}

const updateWorst = (newValue, oldValue) =>  {
  if (! oldValue || oldValue > newValue) {
      return newValue
  }
  return oldValue
}

const computeScanRates = async (scanId, json) => {
  const nutriscore = json.data.endpoints[0].grade

  const suites = json.data.endpoints[0].details.suites

  let bestProtocol, worstProtocol, worstKey, bestCipher, worstCipher
  suites.forEach(s => {
    const protocolRate = PROTOCOL_RATES[s.protocol]
    bestProtocol = updateBest(protocolRate, bestProtocol)
    worstProtocol = updateWorst(protocolRate, worstProtocol)
    s.list.forEach(l => {
      const keyRate = computeKeyRate(l.kxStrength)
      worstKey = updateWorst(keyRate, worstKey)

      const cipherRate = computeCipherRate(l.cipherStrength)
      bestCipher = updateBest(cipherRate, bestCipher)
      worstCipher = updateWorst(cipherRate, worstCipher)
    })
  })

  const protocole_rate = Math.round((bestProtocol+worstProtocol)/2)
  const cipher_strength_rate = Math.round((bestCipher+worstCipher)/2)

  return {protocole_rate,cipher_strength_rate, key_exchange_rate: worstKey}
}

module.exports = {
  computeScanRates,
}
const roundCurrency = amount => {
  if (!amount) {
    return amount
  }
  const rounded=Math.round(amount*100)/100
  return rounded
}

module.exports = {
  roundCurrency,
}

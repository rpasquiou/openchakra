const computeUserSkillsCategories = async (p1, p2, p3) => {
  [p1, p2, p3].forEach((p, idx) => {
    console.log('param', idx, p)
  })
  return [{name: 'cat1'}]
}

module.exports={
  computeUserSkillsCategories,
}
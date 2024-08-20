const isLiked = async(userId, params, data) => {
  const likes = data._likes.map(l=> l._id)
  return likes.includes(userId)
}

module.exports={
  isLiked
}
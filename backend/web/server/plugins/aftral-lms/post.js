const isLiked = (userId, params, data) => {
  const likes = data.likes.map(l=> l._id)
  return likes.includes(userId)
}

module.exports={
  isLiked
}
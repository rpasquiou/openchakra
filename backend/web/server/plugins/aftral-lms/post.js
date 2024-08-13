const isLiked = (userId, params, data) => {
  return data.likes && data.likes.length>0
}

module.exports={
  isLiked
}
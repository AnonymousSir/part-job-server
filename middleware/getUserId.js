
const getUserId = (req, res, next) => {
  const tokenObj = req.tokenObj
  req.userId = tokenObj.id
  next()
}
module.exports = getUserId
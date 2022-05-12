const db = require('../utils/mysqlDB')
const jwt = require('jsonwebtoken')
const { token: { tokenKey } } = require('../config')
// 验证token
const verifyToken = async (req, res, next) => {
  const token = req.cookies.token
  if (!token) return res.send({ code: 401, msg: '登录信息不存在!' })
  
  try {
    const verifyToken = jwt.verify(token, tokenKey)
    const { id, username } = verifyToken
    const result = await db.query(`select username from users where id='${id}'`)
    if (result[0].username !== username) {
      return res.send({ code: 400, msg: '登录信息错误，请重新登录' })
    }
    req.tokenObj = {...verifyToken}
    next()
  } catch (error) {
    console.log(error);
    if (error.name === 'TokenExpiredError') {
      return res.send({ code: 401, msg: '登录信息已过期, 请重新登录!' })
    }
    res.send({ code: 401, msg: '登录信息错误!' })
  }
}

module.exports = verifyToken
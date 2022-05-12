const fs = require('fs')
const db = require('../utils/mysqlDB')
const { validateAll, validateUsername, validatePassword } = require('../utils/validateData')
const getColumnModel = require('../utils/getColumnModel')
const jwt = require('jsonwebtoken')
const { uploadConfig, server, token: { tokenKey } } = require('../config')
const whereSQL = require('../utils/whereSQL')

const DBModel = {
  users: '*',
  u_users: '*'
}
async function getModel() {
  DBModel.users = await getColumnModel('users', '', 'password')
  DBModel.u_users = await getColumnModel('users', 'u', 'password')
}
getModel()

// 注册
const createUser = async (req, res) => {
  const { nickname, username, password, phone, email } = req.body
  // 验证参数格式
  if (!validateAll({ nickname, username, password, phone, email })) {
    res.send({
      code: 400,
      msg: '参数错误，请重新输入'
    })
    return
  }
  // 参数正确，往数据库里添加用户
  try {
    const sql = `insert into users (id, username, password, nickname, phone, email) value (replace(uuid(), '-', ''), ?, ?, ?, ?, ?);`
    const sqlArr = [username, password, nickname, phone, email]
    const result = await db.query(sql, sqlArr)
    res.send({
      code: 200,
      msg: '创建成功!',
      data: result
    })
  } catch (error) {
    let msg = '服务器出错了'
    // 判断是否是已存在
    if (error.code === 'ER_DUP_ENTRY') {
      // 判断是哪个字段出现错误，好返回相应的提示
      if (/users.username_UNIQUE/.test(error.sqlMessage)) {
        msg = '创建失败，用户名已存在!'
      }
    }
    res.send({
      code: 400,
      msg,
      errMsg: error.sqlMessage
    })
  }
}

// 登录
const login = async (req, res) => {
  const { username, password, isToken=true } = req.body
  try {
    const sql = `select * from users where username='${username}';`
    const sqlArr = []
    const result = await db.query(sql, sqlArr)
    // 用户不存在
    if (!result.length) {
      return res.send({ code: 400, msg: '用户不存在!' })
    }
    // 密码错误
    if (result[0].password !== password) {
      return res.send({ code: 400, msg: '用户名或密码错误!' })
    }
    // 设置token cookie
    const token = jwt.sign({
      id: result[0].id,
      usertype: result[0].usertype,
      username: result[0].username,
      nickname: result[0].nickname
    }, tokenKey, { expiresIn: 7 * 24 * 60 * 60 * 1 })
    if (isToken) {
      res.cookie('token', token, { maxAge: 7 * 24 * 60 * 60 * 1000 })
    } else {
      // 不记住登录的话就把token设置为关闭浏览器清除(不设置maxAge就是会话)
      res.cookie('token', token)
    }
    console.log('token',token);
    res.send({
      code: 200,
      msg: '登录成功!',
      data: {
        id: result[0].id,
        username: result[0].username,
        nickname: result[0].nickname,
        phone: result[0].phone,
        email: result[0].email
      }
    })
  } catch (error) {
    console.log(error);
    res.send({
      code: 400,
      msg: '登录失败，服务器错误!',
      data: error.sqlMessage
    })
  }
}

// 验证token(这里只做成功后的处理，验证的封装成中间件了)
const verifyToken = (req, res) => {
  const {tokenObj: { id, usertype }} = req
  res.send({
    code: 200,
    msg: '登录信息正确!',
    data: { id, usertype }
  })
}

// 获取用户基本信息
const getUser = async (req, res) => {
  const { id } = req.query
  try {
    const userModel = DBModel.users.replace(/,details|details,|,demand|demand,/g, '')
    const sql = `select ${userModel} from users where id='${id}'`
    const result = await db.query(sql)
    console.log(result);
    res.send({
      code: 200,
      data: result
    })
  } catch (error) {
    console.log(error);
    console.log(error.sqlMessage);
    res.send({
      code: 400,
      msg: '获取用户信息失败',
      err: error.sqlMessage
    })
  }
}

// 获取用户详细信息
const getUserDetails = async (req, res) => {
  const { id } = req.query
  try {
    const sql = `select ${DBModel.users} from users where id='${id}'`
    const result = await db.query(sql)  
    console.log(result);
    res.send({
      code: 200,
      data: result
    })
  } catch (error) {
    console.log(error, error.sqlMessage);
    res.send({ code: 400, msg: '获取用户信息失败!', errMsg: error.sqlMessage })
  }
}

// 修改密码
const changePassword = async (req, res) => {
  const { username, oldPassword, newPassword, confirmPassword } = req.body
  if (!(validateUsername(username) && validatePassword(oldPassword) && validatePassword(newPassword) && validatePassword(confirmPassword)) || newPassword !== confirmPassword) {
    return res.send({
      code: 400,
      msg: '参数错误，请重新输入'
    })
  }
  try {
    const sql = `update users set password='${newPassword}' where username='${username}' and password='${oldPassword}'`
    const result = await db.query(sql)
    console.log(result);
    res.send({
      code: 200,
      msg: '修改成功',
      data: result
    })
  } catch (error) {
    console.log(error, error.sqlMessage);
    res.send({ code: 400, msg: 'err', errMsg: error.sqlMessage })
  }
}

// 验证用户token
const verifyPortrait = async (req, res, next) => {
  const token = req.cookies.token
  if (!token) return res.status(401).send({ code: 401, msg: '登录信息不存在!' })
  
  try {
    const verifyToken = jwt.verify(token, tokenKey)
    const { id, username } = verifyToken
    const result = await db.query(`select username from users where id='${id}'`)
    if (result[0].username !== username) {
      return res.status(401).send({ code: 400, msg: '登录信息错误，请重新登录' })
    }
    req.tokenObj = {...verifyToken}
    next()
  } catch (error) {
    console.log(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send({ code: 401, msg: '登录信息已过期, 请重新登录!' })
    }
    res.status(401).send({ code: 401, msg: '登录信息错误!' })
  }
}

// 修改头像
const changePortrait = async (req, res) => {
  const { id } = req.tokenObj
  try {
    const { url } = server
    const { pic, static } = uploadConfig
    const userSql = `select pic_url from users where id='${id}';`
    const picUrlData = await db.query(userSql)

    const oldPic = picUrlData[0].pic_url
    const postPath = `${url}/${pic}`
    // 上传/修改头像
    const newPic = `${postPath}/${req.file.filename}`
    const upSql = `update users set pic_url='${newPic}' where id='${id}';`
    const result = await db.query(upSql)

    // 删除旧头像
    let deleleMsg = '旧头像删除成功'
    if (oldPic) {
      const fileName = oldPic.split(pic)[1]
      fs.unlink(`${static}/${pic}${fileName}`, (err) => {
        if (!err) return
        deleleMsg = '旧头像删除失败'
        console.log('detele err', err);
      })
    }
    
    res.send({
      code: 200,
      data: result,
      deleleMsg
    })
  } catch (error) {
    console.log('err', error, error.sqlMessage);
    res.send({ code: 400, msg: '更换头像失败!', errMsg: error.sqlMessage })
  }
}
// 修改用户信息
const changeUserDetails = async (req, res) => {
  const { id, nickname, sex, phone, email, education, occupation, age, details, demand } = req.body
  if (!nickname) return res.send({ code: 400, msg: '昵称不能为空' })
  try {
    const sql = `update users set nickname=?, sex=?, phone=?, email=?, education=?, occupation=?, age=?, details=?, demand=? where id=?`
    const sqlArr = [nickname, sex, phone, email, education, occupation, age, details, demand, id]
    const result = await db.query(sql, sqlArr)
    console.log(result);
    res.send({
      code: 200,
      msg: '修改用户信息成功',
      data:result
    })
  } catch (error) {
    console.log(error, error.sqlMessage);
    res.send({
      code: 400,
      msg: '修改用户信息失败',
      errMsg: error.sqlMessage
    })
  }
}
module.exports = {
  createUser,
  login,
  verifyToken,
  getUser,
  getUserDetails,
  changePassword,
  verifyPortrait,
  changePortrait,
  changeUserDetails
}
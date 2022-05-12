var express = require('express');
var router = express.Router();
const upload = require('../middleware/upload')
// 引入controllers
const user = require('../controllers/usersController')
const verifyToken = require('../middleware/verifyToken');
const db = require('../utils/mysqlDB')
const jwt = require('jsonwebtoken')
const { token: { tokenKey } } = require('../config')
const config = require('../config')

// 登录
router.post('/login', user.login)
// 创建用户
router.post('/create', user.createUser)
// 验证token
router.post('/verifyToken', verifyToken, user.verifyToken)
// 获取用户基本信息
router.get('/getUser', user.getUser)
// 获取用户详细信息
router.get('/getUserDetails', user.getUserDetails)
// 修改密码
router.post('/changePassword', user.changePassword)

// 修改头像信息
router.post('/changePortrait', user.verifyPortrait, upload.single('pic'), user.changePortrait)
// 修改用户信息
router.post('/changeUserDetails', verifyToken, user.changeUserDetails)


module.exports = router;

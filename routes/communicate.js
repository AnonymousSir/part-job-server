var express = require('express')
var router = express.Router()
const communicate = require('../controllers/communicateController')
const verifyToken = require('../middleware/verifyToken')

// 用户绑定公司(要发布招聘信息必须先绑定)
router.post('/exParticipate', communicate.exParticipate)
// 获取待审核的用户列表
router.get('/getExParticipateList', communicate.getExParticipateList)
// 获取已审核的用户列表(state: {1 | 2})
router.get('/getParticipateList', communicate.getParticipateList)
// 审核(ex_id, type=(1 | 2))
router.post('/examine', verifyToken, communicate.examine)
// 修改报名状态
router.post('/updateState', verifyToken, communicate.updateState)


module.exports = router;

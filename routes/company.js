var express = require('express')
var router = express.Router()
const company = require('../controllers/companyController')
const verifyToken = require('../middleware/verifyToken')

// 用户绑定公司(要发布招聘信息必须先绑定)
router.post('/create', verifyToken, company.createCompany)
// 获取用户绑定的公司信息
router.get('/getCompany', company.getCompany)
// 发布招聘信息
router.post('/information', verifyToken, company.releaseInformation)
// 修改招聘信息
router.post('/changeInformation', verifyToken, company.changeInformation)
// 删除招聘信息
router.post('/delateInformation', verifyToken, company.delateInformation)
// 获取详细的招聘信息
router.get('/getJobInfo', company.getJobInfo)
// 获招聘信息(全部,或者用户已发布的)
router.get('/getJobInfoList', company.getJobInfoList)

module.exports = router;

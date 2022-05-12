const path = require('path')
const multer = require('multer')
const { uploadConfig } = require('../config')

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const url = `${uploadConfig.static}/${uploadConfig.pic}`
    callback(null, url)
  },
  filename(req, file, callback) {
    const extname = path.extname(file.originalname)
    callback(null, Date.now() + extname)
  }
})

module.exports = multer({ storage })
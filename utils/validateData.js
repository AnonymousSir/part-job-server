// 验证全部的信息
function validateAll(options) {
  const { nickname, username, password, phone, email } = options
  if (validatePhone(phone) && validateEmail(email) && validateNickname(nickname) && validateUsername(username) && validatePassword(password)) return true
  return false
  // return true
}

// 验证手机号码格式
function validatePhone (value) {
  // 可以为空，空不return的话后面value.trim()会报错
  if (!value) return true
  value = value.trim()
  let regTest = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
  if (!regTest.test(value)) return false
  return true
}
// 验证邮箱格式
function validateEmail (value) {
  if (!value) return true
  value = value.trim()
  let regTest = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
  if (!regTest.test(value)) return false
  return true
}
// 验证昵称格式
function validateNickname (value) {
  if (!value) return false
  value = value.trim()
  if (value.length < 2 || value.length > 16) return false
  return true
}
// 验证用户名格式
function validateUsername (value) {
  if (!value) return false
  value = value.trim()
  if (value.length < 8 || value.length > 16) return false
  return true
}
// 验证密码格式
function validatePassword (value) {
  if (!value) return false
  value = value.trim()
  if (value.length < 8 || value.length > 16) return false
  return true
}

// 非空验证
function validateEmpty(arr) {
  return arr.every(i => i != '')
}

module.exports = {
  validatePhone,
  validateEmail,
  validateNickname,
  validateUsername,
  validatePassword,
  validateAll,
  validateEmpty
}
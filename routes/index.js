// 引入路由
const home = require('./home')
const users = require('./users')
const company = require('./company')
const communicate = require('./communicate')

// 配置路由
const routes = [
  { route: home, path: '/' },
  { route: users, path: '/users' },
  { route: company, path: '/company' },
  { route: communicate, path: '/communicate' },
]

const config = require('../config')
// 遍历注册路由
function registerRoutes(app) {
  for (let i of routes) {
    // 设置路由地址
    // /part_job/api + xxx
    i.path = config.api.url + i.path
    app.use(i.path, i.route)
  }
}

module.exports = {
  registerRoutes
}
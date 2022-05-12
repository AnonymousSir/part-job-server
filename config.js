const config = {
  // 服务器设置相关
  server: {
    host: 'localhost',
    port: '3002',
    // 用host+port或者域名domainName(二选一)
    domainName: '',
    url: ''
  },
  // 上传文件路径配置(需要先新建对应文件夹)
  uploadConfig: {
    // 静态资源存放的文件夹(可以获取到文件)
    static: 'static',
    // 用户头像(获取的时候不能写static，默认是从static/开始获取的)
    pic: 'pic'
  },
  // 数据库配置
  mysqlConfig: {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '1983274477',
    database: 'part_job',
    acquireTimeout: 15000, // 连接超时时间
    connectionLimit: 1000, // 最大连接数
    waitForConnections: true, // 超过最大连接时排队
    queueLimit: 0, // 排队最大数量(0 代表不做限制)
    multipleStatements: true, // 是否执行多条sql语句
  },
  api: {
    // 接口基准地址(http.../part_job/api)
    // url: '/part_job/api'
    url: ''
  },
  token: {
    // token的密钥
    tokenKey: "pandadaopartjoblxaho5rd2g5th13ad"
  }
}
const { server: { host, port, domainName } } = config
config.server.url = domainName ? domainName : `http://${host}:${port}`

module.exports = {
  ...config
}

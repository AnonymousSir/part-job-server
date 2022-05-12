const mysql = require('mysql')
const { mysqlConfig: config } = require('../config')

// 创建连接池
const pool = mysql.createPool(config)

// 执行单条sql语句
function query(sql, sqlArr = []) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      if (err) return reject(err)
      connection.query(sql, sqlArr, (sqlErr, result) => {
        if (sqlErr) {
          connection.release()
          return reject(sqlErr)
        }
        connection.release()
        resolve(result)
      })
    })
  })
}

// 执行多条sql语句，并开启事务，所有sql语句成功执行才算成功否则就是失败，不保存
// sqls是一个数组,sqls[index][0]是sql(必须要传), sqls[index][1]是sqlArr(可以不传，默认[])
// sqls : [] -> [sqlItem1, sqlItem2, ...] -> [[sql, sqlArr], sqlItem2...]
function querys() {
  let sqls = [...arguments]
  console.log(111, sqls);
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, connection) {
      // 连接失败 promise直接返回失败
      if (err) return reject(err)

      // 如果 语句和参数数量不匹配 promise直接返回失败(改成数组了，params就不用了)
      // if (sqls.length !== params.length) {
      //   connection.release() // 释放掉
      //   return reject(new Error('语句与传值不匹配'))
      // }
      // 开始执行事务
      connection.beginTransaction(beginErr => {
        // 创建事务失败
        if (beginErr) {
          connection.release()
          return reject(beginErr)
        }

        console.log('开始执行事务，共执行' + sqls.length + '条语句')
        // 返回一个promise 数组
        let funcAry = sqls.map((item, index) => {
          return new Promise((sqlResolve, sqlReject) => {
            let sql = item.length > 2 ? item : item[0]
            console.log(item.length);
            console.log(222, sql, item);
            // 如果没传sqlArr就为[]
            let sqlArr = item[1] ? item[1] : []
            connection.query(sql, sqlArr, (sqlErr, result) => {
              if (sqlErr) {
                console.log('第', (index + 1), '条sql语句错误');
                return sqlReject(sqlErr)
              }
              sqlResolve(result)
            })
          })
        })
        // 使用all 方法 对里面的每个promise执行的状态 检查
        Promise.all(funcAry).then(arrResult => {
          // 若每个sql语句都执行成功了 才会走到这里 在这里需要提交事务，前面的sql执行才会生效
          // 提交事务
          connection.commit(function (commitErr, info) {
            if (commitErr) {
              // 提交事务失败了
              console.log('提交事务失败:' + commitErr)
              // 事务回滚，之前运行的sql语句不生效
              connection.rollback(function (err) {
                if (err) console.log('回滚失败：' + err)
                connection.release()
              })
              // 返回promise失败状态
              return reject(commitErr)
            }
            connection.release()
            // 事务成功 返回 每个sql运行的结果 是个数组结构
            resolve(arrResult)
          })
        }).catch(error => {
          // 多条sql语句执行中 其中有一条报错 直接回滚
          connection.rollback(function () {
            console.log('sql运行失败： ' + error)
            connection.release()
            reject(error)
          })
        })
      })
    })
  })
}

module.exports = {
  query,
  querys
}

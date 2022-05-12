const db = require('./mysqlDB')

// 获取用户的报名状态
function getParticipateState(user_id, information_id) {
  return new Promise(async (resolve, reject) => {
    try {
      const exSql = "select ex_state from ex_participate where user_id=? and information_id=?;"
      const ex_stateData = await db.query(exSql, [user_id, information_id])
      const postSql = "select post_state from participate where user_id=? and information_id=?;"
      const post_stateData = await db.query(postSql, [user_id, information_id])
      let ex_state = '', post_state = ''
      if (ex_stateData.length) {
        ex_state = ex_stateData[0].ex_state
      }
      if (post_stateData.length) {
        post_state=  post_stateData[0].post_state
      }
      resolve({
        ex_state,
        post_state
      })
    } catch (error) {
      console.log(error);
      console.log(error.sqlMessage);
      reject(error)
    }
  })
}

module.exports = getParticipateState
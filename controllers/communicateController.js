const db = require('../utils/mysqlDB')
const getColumnModel = require('../utils/getColumnModel')
// const Model = {
//   users: '*'
// }
// async function getModel () {
//   const usersModel = await getColumnModel('users')
//   Model.users = usersModel.replace('password,', '')
// }
// getModel()

// 报名进入审核
const exParticipate = async (req, res) => {
  const { user_id, information_id, publisher_id } = req.body
  // 是否是审核状态
  const ex_state = 1
  if (!user_id || !information_id || !publisher_id) return res.send({
    code: 400,
    msg: '参数缺少!'
  })

  if (user_id === publisher_id) return res.send({
    code: 400,
    msg: '不能参加自己发布的招聘!'
  })

  try {
    const sql = "insert into ex_participate (id, user_id, information_id, publisher_id, ex_state) values (replace(uuid(), '-', ''), ?, ?, ?, ?);"
    const sqlArr = [user_id, information_id, publisher_id, ex_state]
    const result = await db.query(sql, sqlArr)
    console.log(result);

    res.send({
      code: 200,
      data: result,
      msg: '报名成功!'
    })
  } catch (error) {
    console.log(error);
    console.log(error.sqlMessage);

    let msg = '服务器错误!'
    if (error.sqlMessage.includes('Duplicate entry')) {
      msg = '已报名参加, 请不要重复报名!'
    }

    res.send({
      code: 400,
      msg,
      errMsg: error.sqlMessage
    })
  }

}

// 获取待审核的信息
const getExParticipateList = async (req, res) => {
  let { id, limit=20, skip=0 } = req.query
  if (limit > 20) limit = 20

  try {
    const usersModel = await getColumnModel('users', 'u')
    const u = usersModel.replace('u.password,', '')

    const sql = `select ${u}, e.id as ex_id, e.ex_state from users as u inner join ex_participate as e on u.id=e.user_id where u.id=e.user_id and e.information_id=? limit ?, ?;`
    const result = await db.query(sql, [id, skip, limit])
    res.send({
      code: 200,
      data: result
    })
  } catch (error) {
    console.log(error);
    console.log(error.sqlMessage);
    res.send({
      code: 400,
      msg: 'err',
      err: error.sqlMessage
    })
  }
}

// 获取已经审核的信息
const getParticipateList = async (req, res) => {
  let { id, state=1, limit=20, skip=0 } = req.query
  if (state != 1 && state != 2) state = 1
  if (limit > 20) limit = 20

  try {
    const usersModel = await getColumnModel('users', 'u')
    const u = usersModel.replace('u.password,', '')

    const sql = `select ${u}, p.id as part_id, p.post_state from users as u inner join participate as p on u.id=p.user_id where u.id=p.user_id and p.information_id='${id}' and p.post_state=${state} limit ${skip}, ${limit};`
    const result = await db.query(sql)
    res.send({
      code: 200,
      data: result
    })
  } catch (error) {
    console.log(error, error.sqlMessage)
    res.send({
      code: 400,
      msg: 'err',
      err: error.sqlMessage
    })
  }
}
// 审核
const examine = async (req, res) => {
  // type -> '1' || '2'
  let { ex_id, type=1 } = req.body
  if (type != 1 && type != 2) type = 1
  try {
    const infoSQL = `select * from ex_participate where id='${ex_id}';`
    const exInfo = await db.query(infoSQL)
    const { user_id, information_id, publisher_id } = exInfo[0]
    const deleteSQL = `delete from ex_participate where id='${ex_id}';`
    const insertSQL = "insert into participate (id, user_id, information_id, publisher_id, post_state) values (replace(uuid(), '-', ''), ?, ?, ?, ?);"
    const insertSQLArr = [user_id, information_id, publisher_id, type]
    const result = await db.querys(deleteSQL, [insertSQL, insertSQLArr])
    console.log(result);
    return res.send({
      code: 200,
      msg: '审核通过!',
      data: result
    })
  } catch (error) {
    console.log(error);
    console.log(error.sqlMessage);
    res.send({
      code: 400,
      msg: '审核出错!',
      errMsg: error.sqlMessage
    })
  }
}

// 修改报名状态
const updateState = async (req, res) => {
  let { part_id, type=1 } = req.body
  if (type != 1 && type != 2) type = 1
  try {
    const sql = `update participate set post_state=${type} where id='${part_id}'`
    const result = await db.query(sql)
    console.log(result);
    console.log(111111, 'type:', );
    res.send({
      code: 200,
      msg: '修改成功!',
      data: result
    })
  } catch (error) {
    console.log(error, error.sqlMessage);
    res.send({ code: 400, err: '审核出错!', errMsg: error.sqlMessage })
  }
}


module.exports = {
  exParticipate,
  getExParticipateList,
  getParticipateList,
  examine,
  updateState,
}
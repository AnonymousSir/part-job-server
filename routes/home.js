var express = require('express');
var router = express.Router();
const verifyToken = require('../middleware/verifyToken')
const getUserId = require('../middleware/getUserId')
const db = require('../utils/mysqlDB')
const index = require("../utils/db.js");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/demo2', async (req, res) => {
  const { x } = req.query
  console.log('x', x);
  const sql = "show global variables like '%max_connections%';"
  // const sql = 'show processlist;'
  const result = await db.query(sql, [])
  // console.log(result);

  res.send({
    code: 200,
    msg: 'demo',
    data: result
  })
})

const xx =  require('../utils/db')
router.get('/test', async (req, res) => {
  const { id1, id2, sex1, sex2 } = req.query
  try {
    const sql = [
      ['select count(*) from users;', [id1]],
      ['select count(*) from users where id=?;', [id2]],
    ]
    const result = await db.querys(sql)
    
    res.send({
      code: 200,
      data: result
    })
  } catch (error) {
    res.send(400)
  }
})
const getstate = require('../utils/getParticipateState')
router.get('/test2', async (req, res) => {
  // const { user_id, info_id } = req.query
  // const information_id=''
  // const user_id = '9a63fb4ebfbe11ec90ad54e1ad54b304'
  // const info_id = 'd165dbabc7a111ecbfd854e1ad54b304'
  // const sql = 'select * from users as u left join ex_participate as e on e.user_id=? and e.information_id=?'
  const info_id = 'd165dbabc7a111ecbfd854e1ad54b304'
  try {
    const sql = 'select u.*, e.id, e.ex_state from users as u inner join ex_participate as e on u.id=e.user_id where u.id=e.user_id and e.information_id=?'
    const result = await db.query(sql, [info_id])
    console.log(result)
    res.send({
      code: 200,
      result
    })
  } catch (error) {
    console.log(error)
    console.log(error.sqlMessage)
    res.send({
      code: 400,
      msg: error.sqlMessage
    })
  }
})

module.exports = router;

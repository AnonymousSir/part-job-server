const db = require('../utils/mysqlDB')
const { validateEmpty } = require('../utils/validateData')
const jwt = require('jsonwebtoken')
const { token: { tokenKey } } = require('../config')
const whereSQL = require('../utils/whereSQL')
const getParticipateState = require('../utils/getParticipateState')

const DBModel = {
  information: '*'
}
// 获取数据库表的字段，好控制select 查询哪些字段
// select * 获取的数据量比较大，把一些不用的字段不查询效率会更高
// 如1000字的text类型的detals介绍，不需要的时候就可以不查询，而mysql本身没有适合的语法
// 要一个一个字段写的话字段太多了，而且数据库修改表字段的时候也要改后端代码
async function getModel() {
  try {
    const informationModelData = await db.query('desc information;')
    DBModel.information = informationModelData.map(i => i.Field).join()
  } catch (error) {
    console.log(error.sqlMessage);
  }
}
getModel()

// 用户注册公司信息(要发布信息必须填写)
const createCompany = async (req, res) => {
  const { token } = req.cookies
  let {
    company_name,
    company_scale,
    industry,
    contacts,
    phone,
    company_address,
    company_profile
  } = req.body

  const isEmpty = validateEmpty([company_name, company_scale, industry, contacts, phone, company_address])
  if (!isEmpty) return res.send({ code: 400, msg: '请完善信息!' })

  try {
    const { id: user_id } = jwt.verify(token, tokenKey)
    // 添加公司信息
    const sql = "insert into company (id, company_name, company_scale, industry, contacts, phone, company_address, company_profile, user_id) values (replace(uuid(), '-', ''), ?,?,?,?,?,?,?,?)"
    const sqlArr = [company_name, company_scale, industry, contacts, phone, company_address, company_profile, user_id]
    const result = await db.query(sql, sqlArr)
    console.log(result);

    // 修改用户的状态
    const userSql = `update users set usertype='5' where id=?`
    const userResult = await db.query(userSql, [user_id])
    console.log(userResult);
    res.send({
      code: 200,
      msg: '公司信息完善成功!'
    })
  } catch (error) {
    console.log(error.sqlMessage);
    let msg = error.sqlMessage
    // 判断是否是已存在
    if (error.code === 'ER_DUP_ENTRY') {
      // 判断是哪个字段出现错误，好返回相应的提示
      if (/company.user_id/.test(error.sqlMessage)) {
        msg = '添加失败，用户已完善公司信息'
      }
    }
    res.send({ code: 400, msg })
  }
}

// 获取用户绑定的公司信息
const getCompany = async (req, res) => {
  const { id } = req.query
  if (!id) return res.send({ code: 400, msg: '请填写正确的参数!' })

  try {
    const sql = `select * from company where id='${id}';`
    const result = await db.query(sql)
    console.log(result);
    res.send({
      code: 200,
      msg: '20',
      data: result,
      id
    })
  } catch (error) {
    console.log(error);
    console.log(error.sqlMessage);
    res.send({
      code: 400,
      msg: '请填写正确的参数!',
      err: error.sqlMessage
    })
  }
}

// 用户发布招聘信息
const releaseInformation = async (req, res) => {
  const { job_name, people_num, job_date, salary, salary_type, settlement_time, sex, age, education, city, job_type, address, details } = req.body
  const { token } = req.cookies
  const { id: user_id } = jwt.verify(token, tokenKey)
  const time = Date.now()

  try {
    const companyId = await db.query("select id from company where user_id=?;", [user_id])
    const company_id = companyId[0].id
    const sql = "insert into information(id, user_id, company_id, time, job_name, people_num, job_date, salary, salary_type, settlement_time, sex, age, education, city, job_type, address, details) value (replace(uuid(), '-', '') ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,? ,?)"
    const sqlArr = [user_id, company_id, time, job_name, people_num, job_date, salary, salary_type, settlement_time, sex, age, education, city, job_type, address, details]
    const result = await db.query(sql, sqlArr)
    console.log(result);
    res.send({
      code: 200,
      msg: '招聘信息发布成功!'
    })
  } catch (error) {
    console.log(error);
    console.log(error.sqlMessage);
    res.send({
      code: 400,
      msg: '用户信息错误!',
      err: error.sqlMessage
    })
  }
}

// 用户修改招聘信息
const changeInformation = async (req, res) => {
  const { id, job_name, people_num, job_date, salary, salary_type, settlement_time, sex, age, education, city, job_type, address, details } = req.body

  try {
    const sql = 'update information set job_name=?, people_num=?, job_date=?, salary=?, salary_type=?, settlement_time=?, sex=?, age=?, education=?, city=?, job_type=?, address=?, details=? where id=?'
    const sqlArr = [job_name, people_num, job_date, salary, salary_type, settlement_time, sex, age, education, city, job_type, address, details, id]
    const result = await db.query(sql, sqlArr)
    res.send({
      code: 200,
      msg: '修改成功!',
      data: result
    })
  } catch (error) {
    console.log(error);
    res.send({
      code: 400,
      msg: '修改失败!xx',
      errMsg: error.sqlMessage
    })
  }
}

// 用户删除招聘信息
const delateInformation = async (req, res) => {
  const { id, user_id } = req.body

  try {
    const sqlUser = 'select user_id from information where id=?;'
    const sqlUserArr = [id]
    const verifyUser = await db.query(sqlUser, sqlUserArr)
    
    // 只能删除用户自己发布的信息
    if (verifyUser[0].user_id != user_id) {
      return res.send({
        code: 400,
        msg: '只能删除自己发布的信息!'
      })
    }

    const sql = 'delete from information where id=?'
    const result = await db.query(sql, [id])  
    res.send({
      code: 200,
      msg: '删除成功!',
      data: result
    })
  } catch (error) {
    console.log(error);
    console.log(error.sqlMessage);
    res.send({
      code: 400,
      msg: '删除失败!',
      errMsg: error.sqlMessage
    })
  }

  res.send({
    code: 400,
    msg: '删除失败!',
    // errMsg: error.sqlMessage
  })
  // }
}

// 获取一条发布的招聘信息(按时间)
const getJobInfo = async (req, res) => {
  const { id, user_id } = req.query
  try {
    sql = `select * from information where id='${id}';`
    let ex_state='',post_state=''
    const result = await db.query(sql)
    // 获取用户的报名状态
    if (user_id) {
      const ParticipateState = await getParticipateState(user_id, id)
      ex_state = ParticipateState.ex_state || ''
      post_state = ParticipateState.post_state || ''
    }
    res.send({
      code: 200,
      data: [{
        ...result[0],
        ex_state, post_state
      }]
    })
  } catch (error) {
    console.log(error);
    res.send({
      code: 400,
      err: 'err',
      error,
      msg: error.sqlMessage
    })
  }
}
// 获取招聘信息列表
// user_id, 查询一个用户发布的招聘信息
const getJobInfoList = async (req, res) => {
  // user_id是在获取列表时该用户是否报名
  // publisher_id是获取该用户发布的所有信息
  let { user_id, publisher_id, city, job_type, settlement_time, order = 'time', get_details = 0, limit = 20, skip = 0 } = req.query
  // 限制一次最多可获取的数据量
  limit = limit > 20 ? 20 : limit

  // 查询的字段
  let information = DBModel.information

  // 查询条件(whereSQL是封装的创建where条件语句的工具方法)(key就是数据库的字段名)
  let where = whereSQL({
    'user_id': publisher_id,
    city,
    job_type,
    settlement_time
  })
  // 是否查询工作介绍
  // get_details为0时不查询details，可以传入1来查询(details数据量太大了，最大可达1000字)
  // 在首页之类的地方用不到details，查询会白白消耗性能
  if (!Number(get_details)) {
    information = DBModel.information.replace(',details', '')
  }

  try {
    let sql = `select ${information} from information${where} order by ${order} desc limit ${skip}, ${limit};`
    // 传入user_id来获取用户报名参加了哪些招聘
    if (user_id) {
      where = whereSQL({
        'user_id': publisher_id,
        city,
        job_type,
        settlement_time
      }, 'i')
      let i_Information = 'i.' + information.replace(/\,/g, ',i.')
      // sql = `select sql_calc_found_rows ${i_Information},ex_p.ex_state from information as i left join ex_participate as ex_p on i.id=ex_p.information_id and ex_p.user_id='${user_id}'${where} order by ${order} desc limit ${skip}, ${limit};`
      sql = `
        select sql_calc_found_rows ${i_Information},ex_p.ex_state,p.post_state 
        from information as i 
        left join ex_participate as ex_p 
        on i.id=ex_p.information_id and ex_p.user_id='${user_id}' 
        left join participate as p 
        on i.id=p.information_id and p.user_id='${user_id}'
        ${where} 
        order by ${order} desc limit ${skip}, ${limit};`
    }
    let totalSQL = 'select found_rows() total'
    const result = await db.querys(sql, totalSQL)
    res.send({
      code: 200,
      data: result[0],
      total: result[1][0].total
    })
    // console.log(result);
  } catch (error) {
    console.log(error);
    console.log(error.sqlMessage);
    res.send({
      code: 400,
      msg: error.sqlMessage
    })
  }
}

module.exports = {
  createCompany,
  getCompany,
  releaseInformation,
  changeInformation,
  delateInformation,
  getJobInfo,
  getJobInfoList
}
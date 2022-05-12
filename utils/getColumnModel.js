const db = require('./mysqlDB')
function getModel(table, prefix='', remove='') {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await db.query(`desc ${table};`)
      let model = res.map(i => i.Field).join() || ''
      if (remove) {
        // model = model.replace(',' + remove , '')
        // model = model.replace(remove + ',', '')
        const reg = new RegExp(`,${remove}|${remove},`)
        model = model.replace(reg, '')
      }
      if (prefix && model) {
        model = `${prefix}.${model.replace(/\,/g,',' + prefix + '.')}`
      }
      resolve(model)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = getModel
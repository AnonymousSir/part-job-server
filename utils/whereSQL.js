function whereSQL (obj='', prefix='') {
  if (!obj) return ''
  let where = ''
  for (let i in obj) {
    if (obj[i]) {
      if (!where) where += ` where ${i}='${obj[i]}'`
      else where += ` and ${i}='${obj[i]}'`
    }
  }
  if (prefix && where) {
    where = where.replace('where ', `where ${prefix}.`).replace('and ', `and ${prefix}.`)
  }
  return where
}
module.exports = whereSQL
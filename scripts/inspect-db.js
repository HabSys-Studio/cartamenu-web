const { DatabaseSync } = require('node:sqlite')
const db = new DatabaseSync('prisma/dev.db')
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all()
for (const table of tables) {
  console.log(table.sql)
  console.log('---')
  const count = db.prepare(`SELECT COUNT(*) AS c FROM "${table.name}"`).get()
  console.log(table.name, count)
  console.log('')
}

import sqlite3 from './sqlite3.js'

async function betterSqlite3 (item) {
  await sqlite3.call(item)
}

export default betterSqlite3

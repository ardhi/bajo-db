const dbTypes = [
  { name: 'better-sqlite3', driver: 'knex' },
  { name: 'cockroachdb', driver: 'knex' },
  { name: 'mssql', driver: 'knex' },
  { name: 'mysql', driver: 'knex' },
  { name: 'mysql2', driver: 'knex' },
  { name: 'oracle', driver: 'knex' },
  { name: 'oracledb', driver: 'knex' },
  { name: 'pgnative', driver: 'knex' },
  { name: 'postgres', driver: 'knex' },
  { name: 'redshift', driver: 'knex' },
  { name: 'sqlite3', driver: 'knex' },
  { name: 'memory', driver: 'mingo' }
]

export default dbTypes

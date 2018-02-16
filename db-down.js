const { Client } = require('pg')
const client = new Client({
  user: 'test',
  host: 'localhost',
  database: 'test',
  password: 'test',
  port: 5432,
})

const up = function() {
  return client.connect()
    .then(() =>
      client.query(`DROP TABLE tbl_positions;`)
    )
    .then(() => client.query(`DROP FUNCTION notify_position() CASCADE;`))
    .then(() =>
      client.end()
    )
}

up()


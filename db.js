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
    .then(() => client.query(`
        CREATE TABLE positions(
           id VARCHAR (16) UNIQUE NOT NULL,
           position VARCHAR (50) NOT NULL
        );
      `)
    )
    .then(() =>
      client.end()
    )
}

  
up()


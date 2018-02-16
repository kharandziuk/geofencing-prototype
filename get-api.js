const { Client } = require('pg')
let client = new Client({
  user: 'test',
  database: 'test',
  password: 'test',
  host: 'localhost',
  port: 5432,
})
var cors = require('cors');
const express = require('express')
const app = express()
app.use(cors());
client.connect().then(() => {

  app.get('/', (req, res) => {
    client.query('select ST_AsText(position) as latlng from tbl_positions;')
      .then(({rows}) => {
        res.json(rows.map(x => {
          const [latitude, longitude] = x.latlng.slice(6, -1).split(' ').map(Number)
          return {latitude, longitude}
        })
        )
      })
  })
  app.listen(3000, () => console.log('Example app listening on port 3000!'))
})

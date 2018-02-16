const WebSocket = require('ws');
const crypto = require("crypto");
const { Client } = require('pg')

const wss = new WebSocket.Server({ port: 8080 });

const getId = () => crypto.randomBytes(16).toString("hex");

const client = new Client({
  user: 'test',
  database: 'test',
  password: 'test',
  host: 'localhost',
  port: 5432,
})
client.connect()
  .then(() => {
    client.query("DELETE FROM tbl_positions;");
    client.on('notification', function(msg) {
    });
    client.query("LISTEN q_event;");
  })

const upsertCMD = (id, lat, lng) => `
INSERT INTO tbl_positions (id, position)
VALUES ('${id}', 'SRID=4326;POINT(${lat} ${lng})')
ON CONFLICT (id) DO UPDATE
SET position = excluded.position;
`

wss.on('connection', function connection(ws) {
  const id = getId()
  console.log(`${id} open ${id.length}`)
  ws.on('message', function incoming(message) {
    const data = JSON.parse(message)
    if (data.type === 'position') {
      client.query(upsertCMD(id, Number(data.latitude), Number(data.longitude)))
    } else {
      assert.fail(data.position)
    }
  });
  ws.on('close', function() {
    console.log(`${id} closed ${id.length}`)
    client.query(`DELETE FROM tbl_positions WHERE id = $1;`, [id])
  })

});

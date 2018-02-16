const util = require('util')
const WebSocket = require('ws')
const bluebird = require('bluebird')
const _ = require('lodash')
const u = require('./utils')
const geolib = require('geolib')

const radius = 2000

const center = {
  latitude: 52.5302162,
  longitude: 13.3851564
}
const initialPosition = center


const runLoop = async (ws) => {
  let bearing = 45;
  let distance = 20
  let _initialPosition = initialPosition
  let { latitude, longitude } = _initialPosition

  do {
    await u.send(ws, { 
      type: "position",
      latitude,
      longitude
    })
    await bluebird.delay(10)
    _initialPosition = geolib.computeDestinationPoint(_initialPosition, 10, bearing)
  } while (true)
}


function createClient() {
  const ws = new WebSocket('ws://localhost:8080')
  return new Promise(function(resolve) {
    ws.on('open', () => resolve(ws))
  }).then(ws => {
    runLoop(ws)
    return ws
  })
}


const clients = Promise.all(Array(4).fill().map(() => createClient()))
process.on('exit', (code) => {
  clients.forEach(c => c.close())
});

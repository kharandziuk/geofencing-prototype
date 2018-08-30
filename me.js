const util = require('util')
const WebSocket = require('ws')
const bluebird = require('bluebird')
const _ = require('lodash')
const u = require('./utils')
const geolib = require('geolib')

const center = {
  latitude: 52.53021621,
  longitude: 13.38515641
}
const runLoop = async (ws) => {
  ws.on('message', function(data) {
    data = JSON.parse(data)
    console.log(
      `${data.value} are near you`
    )
  })
  do {
    let { latitude, longitude } = center
    await u.send(ws, { 
      type: "position",
      latitude,
      longitude
    })
    await bluebird.delay(500)
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

createClient()


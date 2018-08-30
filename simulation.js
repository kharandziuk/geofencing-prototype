const util = require('util')
const WebSocket = require('ws')
const bluebird = require('bluebird')
const _ = require('lodash')
const u = require('./utils')
const geolib = require('geolib')

const radius = 4000

const center = {
  latitude: 52.5302162,
  longitude: 13.3851564
}
const initialPosition = geolib.computeDestinationPoint(center, 700, 45)
const COUNT = 100

const isBehind = function(point) {
  return geolib.getDistance(center, point) > radius
}

getBearing = () =>
  _.random(45, 90)

getSpeed = () =>
  _.random(100, 300)
const runLoop = async (ws) => {
  let bearing = getBearing();
  let _initialPosition = initialPosition
  let speed = getSpeed()
  do {
    let { latitude, longitude } = _initialPosition
    await u.send(ws, { 
      type: "position",
      latitude,
      longitude
    })
    await bluebird.delay(5000)
    _initialPosition = geolib.computeDestinationPoint(_initialPosition, speed, bearing)
    if (isBehind(_initialPosition)) {
      bearing += getBearing()
      speed = getSpeed()
    }
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


const clients = Promise.all(Array(COUNT).fill().map(() => createClient()))
process.on('exit', (code) => {
  clients.forEach(c => c.close())
});

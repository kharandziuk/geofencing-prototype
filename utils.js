const util = require('util')

module.exports = {
  send: function(ws, data) {
    const dataJSON = JSON.stringify(data, null, 0)
    return util.promisify(ws.send.bind(ws))(dataJSON)
  }
}

const config = require('../config').notifier
const request = require('request-promise')

class Notifier {
  async notifyPushbullet (title, body) {
    const { pushbullet } = config
    if (!pushbullet) {
      return
    }
    return request({
      url: pushbullet.url,
      method: pushbullet.method,
      headers: {
        'Access-Token': pushbullet.token
      },
      json: {
        iden: pushbullet.iden,
        type: 'note',
        title,
        body
      }
    })
  }

  async notifyAll (title, message) {
    return Promise.all([
      this.notifyPushbullet(title, message).catch(e => console.log('Could not notify via Pushbullet', e))
    ])
  }
}

module.exports = Notifier

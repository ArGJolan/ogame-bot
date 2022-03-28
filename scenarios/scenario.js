const config = require('../config')

class Scenario {
  /**
   * @param {Array} planets - list of planets of the account
   * @param {Array} researches - list of researches of the account
   * @param {Array} fleets - list of currently flying fleets
   */
  constructor (planets, researches, fleets) {
    this.planets = planets
    this.researches = researches
    this.fleets = fleets
  }

  /**
   * Sleep
   * @param {Number} ms - Sleep duration in milliseconds
   */
  async sleep (ms) {
    return new Promise(resolve => {
      setTimeout(resolve, Math.floor((Math.random() * 0.4 + 0.8) * ms))
    })
  }

  async forcePage (browser, page, component) {
    console.log('FORCING PAGE', page, component)
    await browser.goto(`https://s${config.account.server}-fr.ogame.gameforge.com/game/index.php?page=${page}${component ? `&component=${component}` : ''}`)
    await this.sleep(2000)
  }

  isAppliable () {
    throw new Error('You need to define the isAppliable method on your scenario')
  }
}

module.exports = Scenario

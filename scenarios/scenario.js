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

  async sleep (ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }

  async forcePage (page, pageType, force) {
    if (force || !page.url().match(`page=${pageType}`)) {
      await page.goto(`https://s${config.account.server}-fr.ogame.gameforge.com/game/index.php?page=${pageType}`)
      await this.sleep(2000)
    }
  }

  isAppliable () {
    throw new Error('You need to define the isAppliable method on your scenario')
  }
}

module.exports = Scenario

const Scenario = require('./scenario')

class Spy extends Scenario {
  constructor (planets, researches, fleets) {
    super(planets, researches, fleets)

    this.reports = {}
    this.flightTime = {
      0: 2400,
      1: 3956,
      2: 4022,
      3: 4086,
      4: 4150,
      5: 4214
      // up to 10
    }
  }

  async waitUntilFleetAvailable (page) {
    let availableFleets
    let maxFleets
    [ availableFleets, maxFleets ] = (await page.$eval('#slotValue', el => el.innerText)).split('/')
    while (availableFleets === maxFleets) {
      await page.click('#galaxyHeader .btn_blue')
      await this.sleep(2000);
      [ availableFleets, maxFleets ] = (await page.$eval('#slotValue', el => el.innerText)).split('/')
    }
  }

  /**
   * Spy all inactive players in current page
   * @param {Object} page - Puppeteer page object
   */
  async spyCurrentSystem (page) {
    const inactives = await page.$$eval('.inactive_filter:not(.vacation_filter):not(.ago_highlight) .position', els => {
      return els.map(el => el.innerText)
    })

    for (let position of inactives) {
      await this.waitUntilFleetAvailable(page)
      await page.click(`[rel="planet${position}"] .ListImage a img`)
      await this.sleep(1300)
    }
  }

  /**
   * Spy all inactive players in range
   * @param {Object} page - Puppeteer page object
   * @param {Planet} planet - Planet from which probes are to be sent
   * @param {Number} systemDelta - Spy system at this range
   * @param {Number} maxFleets - Max number of fleets
   */
  async spyFromPlanet (page, planet, systemDelta, maxFleets) {
    // await planet.forcePlanet(page)
    // await this.forcePage(page, 'ingame', 'galaxy')
    await page.navigate(planet.name, 'ingame', 'galaxy')

    const { system } = planet.getCoordinates()

    for (let currentSystem = system - systemDelta; currentSystem <= system + systemDelta; currentSystem++) {
      await page.type('#system_input', `${currentSystem}`)
      await this.sleep(200)
      await page.click('#galaxyHeader .btn_blue')
      await this.sleep(1800)
      try {
        await this.spyCurrentSystem(page)
      } catch (e) {
        console.error('Could not spy system', currentSystem, 'from', planet.getCoordinates())
      }
    }
  }

  /**
   * @param {Object} page - Puppeteer page object
   * @param {Array} planetsCoordinates - Array of Strings (['1:332:10', '2:101:14' ...])
   * @param {Number} systemDelta - Distance at right & left to spy
   */
  async action (page, { planetsCoordinates, systemDelta }) {
    console.log('Spy.action')
    if (!planetsCoordinates || !systemDelta) {
      throw new Error('Invalid parametters, expected planetsCoordinates, systemDelta')
    }

    await this.forcePage(page, 'messages')
    await this.sleep(2500)
    await page.click('input[name="delShown"]')
    await this.sleep(5000)

    const shuffledCoordinates = [...planetsCoordinates]
    for (let i = shuffledCoordinates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCoordinates[i], shuffledCoordinates[j]] = [shuffledCoordinates[j], shuffledCoordinates[i]]
    }
    // Spy from each provided planet
    for (let coordinates of shuffledCoordinates) {
      let planet = null

      // Find the planet by its coordinates
      for (let planetId of Object.keys(this.planets)) {
        if (this.planets[planetId].isCoordinates(coordinates)) {
          planet = this.planets[planetId]
        }
      }

      if (planet) {
        try {
          await this.spyFromPlanet(page, planet, systemDelta)
        } catch (e) {
          console.error('Could not spy from planet', coordinates)
        }
      } else {
        console.error('Could not find planet', coordinates)
      }
    }
  }
}

module.exports = Spy

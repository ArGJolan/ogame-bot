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
    const inactives = await page.$$eval('.inactive_filter:not(.vacation_filter) .position', els => {
      return els.map(el => el.innerText)
    })

    for (let position of inactives) {
      await this.waitUntilFleetAvailable(page)
      await page.click(`[rel="planet${position}"] .ListImage a img`)
      await this.sleep(2000)
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
    await planet.forcePlanet(page)
    await this.forcePage(page, 'galaxy')

    const { system } = planet.getCoordinates()

    for (let currentSystem = system - systemDelta; currentSystem <= system + systemDelta; currentSystem++) {
      await page.type('#system_input', `${currentSystem}`)
      await this.sleep(200)
      await page.click('#galaxyHeader .btn_blue')
      await this.sleep(2500)
      await this.spyCurrentSystem(page)
    }
  }

  /**
   * @param {Object} page - Puppeteer page object
   * @param {Array} planetsCoordinates - Array of Strings (['1:332:10', '2:101:14' ...])
   * @param {Number} systemDelta - Distance at right & left to spy
   */
  async action (page, { planetsCoordinates, systemDelta }) {
    if (!planetsCoordinates || !systemDelta) {
      throw new Error('Invalid parametters, expected planetsCoordinates, systemDelta')
    }
    // Spy from each provided planet
    for (let coordinates of planetsCoordinates) {
      let planet = null

      // Find the planet by its coordinates
      for (let planetId of Object.keys(this.planets)) {
        if (this.planets[planetId].isCoordinates(coordinates)) {
          planet = this.planets[planetId]
        }
      }

      if (planet) {
        await this.spyFromPlanet(page, planet, systemDelta)
      } else {
        console.error('Could not find planet', coordinates)
      }
    }

    // Wait till every probe is back
    // await this.sleep(120000)

    // await this.forcePage(page, 'messages')

    // const messagePaginationString = await page.$eval('#fleetsgenericpage > ul > ul:nth-child(1) > li.curPage', el => {
    //   return el.innerText
    // })
    // let [currentPage, maxPage] = messagePaginationString.split('/').map(page => +page)
    // let spyReports = []

    // while (currentPage <= maxPage) {
    //   const currentPageSpyReports = await this.parseSpyReports(page)
    //   spyReports = [...spyReports, ...currentPageSpyReports]
    //   if (currentPage !== maxPage) {
    //     await page.click('#fleetsgenericpage > ul > ul:nth-child(1) > li:nth-child(4)')
    //     await this.sleep(3500)
    //   }
    //   currentPage++
    // }
  }
}

module.exports = Spy

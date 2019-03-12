const Scenario = require('./scenario')

class Spy extends Scenario {
  constructor (planets, researches, fleets) {
    super(planets, researches, fleets)
    this.availableFleets = researches.computer.getValue() - Object.keys(fleets).length

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

  async waitUntilFleetAvailable () {
    return new Promise(resolve => {
      const interval = setInterval(() => {
        if (this.availableFleets) {
          clearInterval(interval)
          resolve()
        }
      }, 50)
    })
  }

  /**
   * Parse all spy reports in current page
   * @param {Object} page - Puppeteer page object
   */
  async parseSpyReports (page) {
    // TODO
  }

  /**
   * Spy all inactive players in current page
   * @param {Object} page - Puppeteer page object
   */
  async spyCurrentSystem (page) {
    const inactives = await page.$$eval('.inactive_filter:not(.vacation_filter) .position', el => el.innerText)

    for (let position of inactives) {
      await this.waitUntilFleetAvailable()
      await page.click(`[rel="planet${position}"] .ListImage a img`)
      this.availableFleets--
      setTimeout(() => {
        this.availableFleets++
      }, 90000)
      await this.sleep(3500)
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
    this.availableFleets = maxFleets
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
   */
  async action (page, planetsCoordinates, systemDelta, maxFleets) {
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
        await this.spyFromPlanet(page, planet, systemDelta, maxFleets)
      } else {
        console.error('Could not find planet', coordinates)
      }
    }

    // Wait till every probe is back
    await this.sleep(120000)

    await this.forcePage(page, 'messages')

    const messagePaginationString = await page.$eval('#fleetsgenericpage > ul > ul:nth-child(1) > li.curPage', el => {
      return el.innerText
    })
    let [currentPage, maxPage] = messagePaginationString.split('/').map(page => +page)
    let spyReports = []

    while (currentPage <= maxPage) {
      const currentPageSpyReports = await this.parseSpyReports(page)
      spyReports = [...spyReports, ...currentPageSpyReports]
      if (currentPage !== maxPage) {
        await page.click('#fleetsgenericpage > ul > ul:nth-child(1) > li:nth-child(4)')
        await this.sleep(3500)
      }
      currentPage++
    }
  }

  async loop (page) {
    // if (Object.keys(this.reports).length) {
    //   return
    // }
    // for (let planet of this.planets) {
    //   await planet.forcePlanet(page)
    //   await planet.forcePage('galaxy')
    //   const system = planet.getSystem()
    //   let currentSystem = system - this.config.systemRange
    //   //  while (currentSystem !== system + config.systemRange) {
    //   //    type currentSystem in system box
    //   //    const inactives = await page.$$eval('inactive selector')
    //   //    for (player of inatives) {
    //   //      await this.waitUntilFleetAvailable()
    //   //      await player.spy()
    //   //      this.availableFleets--
    //   //      setTimeout(() => {
    //   //        this.availableFleets++
    //   //      }, 85)
    //   //    }
    //   //  }
    // }

    // await this.sleep(120000)
    // await this.parseSpyReports(page)
    // check messages & fill this.reports
  }

  /**
   * @returns {Object}
   */
  getBestReport () {
    return {
      coordinates: '1:331:10',
      attackFrom: '1:332:10',
      lootScore: 8000000 / this.flightTime[1],
      smallCargoCount: 8000000 / 5000
    }
  }
}

module.exports = Spy

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

  async parseReports (page) {

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
    // await this.parseReports(page)
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

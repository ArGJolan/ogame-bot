const Scenario = require('./scenario')

class Raid extends Scenario {
  constructor (planets, researches, fleets) {
    super(planets, researches, fleets)

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

  async filterOutUninterestingReports (page) {
    /**
     * TODO: Set AGO min resource to 2M and go up if too many reports are kept
     */
    for (let i = 0; i < 50; i++) {
      await this.forcePage(page, 'messages', true)
      await this.sleep(2500)
      await page.click('input[name=delEspLoot]')
      await this.sleep(500)
      await page.click('input[name=delEspDef]')
      await this.sleep(500)

      const messagePaginationString = await page.$eval('#fleetsgenericpage > ul > ul:nth-child(1) > li.curPage', el => {
        return el.innerText
      })
      let [currentPage, maxPage] = messagePaginationString.split('/').map(page => +page)
      if (currentPage === maxPage) {
        return
      }
    }
  }

  getDistance (planet, target) {
    const [galaxyFrom, systemFrom, positionFrom] = planet.replace(/\[|\]/g, '').split(':')
    const [galaxyTo, systemTo, positionTo] = target.replace(/\[|\]/g, '').split(':')
    return Math.abs(galaxyFrom - galaxyTo) * 100000 + Math.abs(systemFrom - systemTo) * 100 + Math.abs(positionFrom - positionTo)
  }

  getClosestPlanet (planetList, target) {
    let minDistance = 9999999
    let bestPlanet = null
    for (let planet of planetList) {
      const distance = this.getDistance(planet, target)
      if (distance < minDistance) {
        minDistance = distance
        bestPlanet = planet
      }
    }

    for (let planetId of Object.keys(this.planets)) {
      if (this.planets[planetId].isCoordinates(bestPlanet)) {
        return this.planets[planetId]
      }
    }
  }

  async action (page, { maxFleets, planetsCoordinates }) {
    if (!maxFleets || maxFleets < 0 || !planetsCoordinates) {
      throw new Error('maxFleets && planetsCoordinates need to be set')
    }

    let spyCount = 1
    await this.filterOutUninterestingReports(page)
    while (maxFleets) {
      try {
        await this.forcePage(page, 'messages')
        await this.sleep(2500)
        const coords = await page.$eval(`#spyTable .row:nth-child(${spyCount}) a.txt_link`, el => el.innerText)
        if (!coords) {
          maxFleets = 0
        }
        const planet = this.getClosestPlanet(planetsCoordinates, coords)
        await planet.forcePlanet(page)
        await this.sleep(2500)
        await page.click(`#spyTable .row:nth-child(${spyCount}) a.spyTableIcon.icon_attack`)
        await this.sleep(2500)
        await page.click('#continue')
        await this.sleep(2500)
        await page.click('#continue')
        await this.sleep(2500)
        await page.click('#start')
        await this.sleep(2500)
        maxFleets--
      } catch (e) {
        console.error(`Could not attack n°${spyCount}: ${e}`)
      }
      spyCount++
    }

    await this.forcePage(page, 'messages')
    await this.sleep(2500)
    await page.click('input[name="delShown"]')
  }
}

module.exports = Raid

const Building = require('./building')

class Shipyard extends Building {
  constructor (planet, value, expiration) {
    super(planet.name, 'facilities', 'shipyard', value, expiration)
    this.planetObj = planet

    this.ids = {
      lightFighter: 204,
      heavyFighter: 205,
      cruiser: 206,
      battleship: 207,
      hunter: 215,
      bomber: 211,
      destroyer: 213,
      rip: 214,
      smallCargo: 202,
      largeCargo: 203,
      coloniser: 208,
      recycler: 209,
      proble: 210,
      satellite: 212
    }
  }

  async raid (page, { galaxy, system, position }, vessels) {
    // await this.forcePlanet(page)
    // await this.forcePage(page, 'ingame', 'fleetdispatch')
    await page.navigate(this.planet, 'ingame', 'fleetdispatch')

    if (!vessels) {
      await page.click('#sendall')
      await this.sleep(200)
    } else {
      /**
       * TODO
       * Send ships individually
       */
    }

    await page.click('#continue')
    await this.sleep(2000)

    console.log(`Raiding [${galaxy}:${system}:${position}]`)
    if (await page.$eval('#galaxy', el => el.value) !== galaxy) {
      await page.type('#galaxy', `${galaxy}`, { delay: 150 })
    }
    if (await page.$eval('#system', el => el.value) !== system) {
      await page.type('#system', `${system}`, { delay: 150 })
    }
    if (await page.$eval('#position', el => el.value) !== position) {
      await page.type('#position', `${position}`, { delay: 150 })
    }

    await page.click('#continue')
    await this.sleep(2000)

    await page.click('#missionButton1')
    await page.click('#start')
    this.planet.revalidateFleets(page)
  }

  async build (page, vessel, quantity) {
    // await this.forcePlanet(page)
    // await this.forcePage(page, 'ingame', 'shipyard')
    await page.navigate(this.planet, 'ingame', 'shipyard')

    await page.click(`#details${this.ids[vessel]}`)
    await this.sleep(2000)
    await page.type('#number', `${quantity}`)
    await page.click('.build-it')
    this.planetObj.autoRevalidateResources(page)
  }
}

module.exports = Shipyard

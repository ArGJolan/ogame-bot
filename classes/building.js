const Data = require('./data')

class Building extends Data {
  /**
   * @param {String} planet - name of the planet
   * @param {String} type - type of building (can be 'resources' or 'station')
   * @param {String} name - name of the building (e.g 'metalMine')
   * @param {Integer} level - Level of the building
   * @param {Date} expiration - Data expiration
   */
  constructor (planet, type, name, level, expiration = new Date('2030/12/31')) {
    super(`building-${name}`, level, expiration)
    this.planet = planet
    this.type = type
    this.simpleName = name

    this.id = ({
      metalMine: 1,
      crystalMine: 2,
      deuteriumMine: 3,
      solarPlant: 4,
      fusionPlant: 5,
      metalStorage: 7,
      crystalStorage: 8,
      deuteriumStorage: 9,
      robotFactory: 0,
      naniteFactory: 5,
      shipyard: 1,
      laboratory: 2,
      terraformer: 6,
      missileBay: 4
    })[name]
  }

  nextLevelCost () {
    return ({
      metalMine: {
        metal: 60 * Math.pow(1.5, this.value),
        crystal: 15 * Math.pow(1.5, this.value)
      },
      crystalMine: {
        metal: 48 * Math.pow(1.6, this.value),
        crystal: 24 * Math.pow(1.6, this.value)
      },
      deuteriumMine: {
        metal: 225 * Math.pow(1.5, this.value),
        crystal: 75 * Math.pow(1.5, this.value)
      },
      solarPlant: {
        metal: 75 * Math.pow(1.5, this.value),
        crystal: 30 * Math.pow(1.5, this.value)
      },
      fusionPlant: {
        metal: 900 * Math.pow(1.6, this.value),
        crystal: 360 * Math.pow(1.6, this.value),
        deuterium: 180 * Math.pow(1.8, this.value)
      },
      metalStorage: {
        metal: 2000 * Math.pow(2, this.value)
      },
      crystalStorage: {
        metal: 2000 * Math.pow(2, this.value),
        crystal: 1000 * Math.pow(2, this.value)
      },
      deuteriumStorage: {
        metal: 2000 * Math.pow(2, this.value),
        crystal: 2000 * Math.pow(2, this.value)
      },
      robotFactory: {
        metal: 400 * Math.pow(2, this.value),
        crystal: 120 * Math.pow(2, this.value),
        deuterium: 200 * Math.pow(2, this.value)
      },
      naniteFactory: {
        metal: 1000000 * Math.pow(2, this.value),
        crystal: 500000 * Math.pow(2, this.value),
        deuterium: 100000 * Math.pow(2, this.value)
      },
      shipyard: {
        metal: 400 * Math.pow(2, this.value),
        crystal: 200 * Math.pow(2, this.value),
        deuterium: 100 * Math.pow(2, this.value)
      },
      laboratory: {
        metal: 200 * Math.pow(2, this.value),
        crystal: 400 * Math.pow(2, this.value),
        deuterium: 200 * Math.pow(2, this.value)
      },
      terraformer: {
        crystal: 50000 * Math.pow(2, this.value),
        deuterium: 100000 * Math.pow(2, this.value)
      },
      missileBay: {
        metal: 20000 * Math.pow(2, this.value),
        crystal: 20000 * Math.pow(2, this.value),
        deuterium: 1000 * Math.pow(2, this.value)
      },
      lunarBase: {
        metal: 20000 * Math.pow(2, this.value),
        crystal: 40000 * Math.pow(2, this.value),
        deuterium: 20000 * Math.pow(2, this.value)
      },
      phalanx: {
        metal: 20000 * Math.pow(2, this.value),
        crystal: 40000 * Math.pow(2, this.value),
        deuterium: 20000 * Math.pow(2, this.value)
      },
      stargate: {
        metal: 2000000 * Math.pow(2, this.value),
        crystal: 4000000 * Math.pow(2, this.value),
        deuterium: 2000000 * Math.pow(2, this.value)
      }
    })[this.simpleName]
  }

  revalidate (value) {
    Data.revalidate.bind(this)(this.name, value, new Date('2030/12/31'))
  }

  async autoRevalidate (page) {
    await this.forcePlanet(page, this.planet)
    await this.forcePage(page, this.type)

    const value = await page.$eval(`#button${this.id} span.level`, el => {
      return +el.innerText.split('\n')[1]
    })
    this.revalidate(value)
  }

  async upgrade (page) {
    console.log('UPGRADING', this.name)
    await this.forcePlanet(page, this.planet)
    await this.forcePage(page, this.type, true)

    await page.click(`#button${this.id} a.fastBuild`)

    await this.sleep(2000)
    const value = await page.$eval('#inhalt > div.content-box-s > div.content > table > tbody', el => {
      return el.innerHTML
    })
    const match = value.match(/<span id="Countdown">([0-9]*h |)([0-9]*m |)([0-9]*s)<\/span>/)
    const hours = +match[1].split('h')[0]
    const minutes = +match[2].split('m')[0]
    const seconds = +match[3].split('s')[0]
    const expires = new Date()
    expires.setSeconds(expires.getSeconds() + 3600 * hours + 60 * minutes + seconds + 5)
    this.setExpiration(expires)
    return expires
  }

  getLevel () {
    return Data.getValue.bind(this)()
  }

  async forcePlanet (page, planet = this.planet, force) {
    try {
      const curentPlanet = await page.$eval('a.planetlink.active', el => {
        return el.parentNode.id
      })
      if (force || curentPlanet !== planet) {
        console.log('NOT ON THE RIGHT PLANET', curentPlanet, planet)
        await page.click(`#${this.planet} > a.planetlink`)
        await this.sleep(2000)
      } else {
        console.log('RIGHT PLANET !!', this.planet, planet)
      }
    } catch (e) {}
  }
}

module.exports = Building

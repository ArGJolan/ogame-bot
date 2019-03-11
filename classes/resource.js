const Data = require('./data')
const _ = require('lodash')

class Resource extends Data {
  constructor (planet, type, value, expiration = new Date('2030/12/31')) {
    super(`resource-${type}`, value, expiration)
    this.planet = planet
    this.type = type
    this.initDate = new Date()
    this.production = 0
  }

  async autoRevalidate (page) {
    await this.forcePlanet(page, this.planet.name)

    const value = await page.$eval(`#resources_${this.type}`, el => +(el.innerHTML.replace(/\./g, '')))
    this.revalidate(value)
  }

  revalidate (value) {
    Data.revalidate.bind(this)(this.name, value, new Date('2030/12/31'))
    this.initDate = new Date()
    if (this.type !== 'energy') {
      this.production = this.planet[`getReal${_.upperFirst(this.type)}Production`]()
    }
  }

  getValue () {
    return Data.getValue.bind(this)() + Math.floor((new Date() - this.initDate) / 1000 * this.production / 3600)
  }
}

module.exports = Resource

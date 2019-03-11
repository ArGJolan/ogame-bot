const config = require('../config')

class Data {
  // Autorevalidate at each loop if current page
  constructor (name, value, expiration, autoRevalidateMethod = () => {}) {
    this.name = name
    this.value = value
    this.expiration = expiration

    this.autoRevalidateMethod = autoRevalidateMethod.bind(this)
  }

  setExpiration (date) {
    this.expiration = date
  }

  invalidate () {
    this.expiration = new Date()
  }

  async autoRevalidate (page) {
    return this.autoRevalidateMethod(page)
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

  async forcePlanet (page, planet, force) {
    try {
      const curentPlanet = await page.$eval('a.planetlink.active', el => {
        return el.parentNode.id
      })
      if (force || curentPlanet !== planet) {
        console.log('NOT ON THE RIGHT PLANET', curentPlanet, planet)
        await page.click(`#${this.planet} > a.planetlink`)
        await this.sleep(2000)
      }
    } catch (e) {}
  }

  static revalidate (name, value, expiration) {
    console.log(`Revalidating ${name} from ${this.value} to ${value}, now expires at ${expiration}`)
    this.name = name
    this.value = value
    this.expiration = expiration
  }

  revalidate (name, value, expiration) {
    console.log(`Revalidating ${name} from ${this.value} to ${value}, now expires at ${expiration}`)
    this.name = name
    this.value = value
    this.expiration = expiration
  }

  static getValue () {
    return this.value
  }

  getValue () {
    return this.value
  }

  isValid () {
    return this.expiration - new Date() > 0
  }
}

module.exports = Data

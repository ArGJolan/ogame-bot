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
    console.log('Autorevalidating data', this.name)
    return this.autoRevalidateMethod(page)
  }

  async sleep (ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }

  async forcePage (browser, page, component) {
    console.log('FORCING PAGE', page, component)
    await browser.goto(`https://s${config.account.server}-fr.ogame.gameforge.com/game/index.php?page=${page}${component ? `&component=${component}` : ''}`)
    await this.sleep(2000)
  }

  async forcePlanet (page, planet = this.planet || this.name) {
    try {
      console.log('FORCING PLANET', `#${planet} > a.planetlink`)
      await page.click(`#${planet} > a.planetlink`)
      await this.sleep(2000)
    } catch (e) {
      console.error('[BUILDING] FAILED TO SWITCH PLANET', e)
    }
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

const Data = require('./data')
const config = require('../config')

class Research extends Data {
  constructor (name, level, expiration = new Date('2030/12/31')) {
    super(`research-${name}`, level, expiration)
    this.simpleName = name

    this.id = ({
      energy: 113,
      lazer: 120,
      ion: 121,
      hyperspace: 114,
      plasma: 122,
      combustionReactor: 115,
      impulsionReactor: 117,
      hyperspacePropulsion: 118,
      spy: 106,
      computer: 108,
      astrophysics: 124,
      intergalacticNetwork: 123,
      graviton: 199,
      weapons: 109,
      shields: 110,
      structure: 111
    })[name]
  }

  revalidate (value) {
    Data.revalidate.bind(this)(this.name, value, new Date('2030/12/31'))
  }

  getValue () {
    return super.getValue() +
    (this.simpleName === 'spy' ? config.account.hasCommanding ? 1 : 0 : 0) +
    (this.simpleName === 'computer' ? config.account.hasAdmiral ? 2 : 0 : 0) +
    (this.simpleName === 'computer' ? config.account.hasCommanding ? 1 : 0 : 0)
  }

  async autoRevalidate (page) {
    await this.forcePage(page, 'ingame', 'research')

    console.log(`li[data-technology="${this.id}"] span.level`)
    const value = await page.$eval(`li[data-technology="${this.id}"] span.level`, el => {
      return +el.innerText
    })
    this.revalidate(value)
  }

  async upgrade (page) {
    console.log('UPGRADING', this.name)
    await this.forcePage(page, 'ingame', 'research')

    await page.click(`li[data-technology="${this.id}"] button.upgrade`)

    await this.sleep(2000)
    const value = await page.$eval('#countdownresearchDetails', el => {
      return el.innerHTML
    })
    const match = value.match(/([0-9]*h |)([0-9]*m |)([0-9]*s)/)
    const hours = +match[1].split('h')[0]
    const minutes = +match[2].split('m')[0]
    const seconds = +match[3].split('s')[0]
    const expires = new Date()
    expires.setSeconds(expires.getSeconds() + 3600 * hours + 60 * minutes + seconds + 5)
    this.setExpiration(expires)
    return expires
  }

  nextLevelCost () {
    return ({
      energy: {
        metal: 0 * Math.pow(2, this.value),
        crystal: 800 * Math.pow(2, this.value),
        deuterium: 400 * Math.pow(2, this.value)
      },
      lazer: {
        metal: 200 * Math.pow(2, this.value),
        crystal: 100 * Math.pow(2, this.value),
        deuterium: 0 * Math.pow(2, this.value)
      },
      ion: {
        metal: 1000 * Math.pow(2, this.value),
        crystal: 300 * Math.pow(2, this.value),
        deuterium: 100 * Math.pow(2, this.value)
      },
      hyperspace: {
        metal: 0 * Math.pow(2, this.value),
        crystal: 4000 * Math.pow(2, this.value),
        deuterium: 2000 * Math.pow(2, this.value)
      },
      plasma: {
        metal: 2000 * Math.pow(2, this.value),
        crystal: 4000 * Math.pow(2, this.value),
        deuterium: 1000 * Math.pow(2, this.value)
      },
      combustionReactor: {
        metal: 400 * Math.pow(2, this.value),
        crystal: 0 * Math.pow(2, this.value),
        deuterium: 600 * Math.pow(2, this.value)
      },
      impulsionReactor: {
        metal: 2000 * Math.pow(2, this.value),
        crystal: 4000 * Math.pow(2, this.value),
        deuterium: 600 * Math.pow(2, this.value)
      },
      hyperspacePropulsion: {
        metal: 10000 * Math.pow(2, this.value),
        crystal: 20000 * Math.pow(2, this.value),
        deuterium: 6000 * Math.pow(2, this.value)
      },
      spy: {
        metal: 200 * Math.pow(2, this.value),
        crystal: 1000 * Math.pow(2, this.value),
        deuterium: 200 * Math.pow(2, this.value)
      },
      computer: {
        metal: 0 * Math.pow(2, this.value),
        crystal: 400 * Math.pow(2, this.value),
        deuterium: 600 * Math.pow(2, this.value)
      },
      astrophysics: {
        metal: 40000 * Math.pow(2, this.value),
        crystal: 40000 * Math.pow(2, this.value),
        deuterium: 40000 * Math.pow(2, this.value)
      },
      intergalacticNetwork: {
        metal: 0 * Math.pow(2, this.value),
        crystal: 0 * Math.pow(2, this.value),
        deuterium: 0 * Math.pow(2, this.value)
      },
      graviton: {
        metal: 0 * Math.pow(2, this.value),
        crystal: 0 * Math.pow(2, this.value),
        deuterium: 0 * Math.pow(2, this.value)
      },
      weapons: {
        metal: 800 * Math.pow(2, this.value),
        crystal: 200 * Math.pow(2, this.value),
        deuterium: 0 * Math.pow(2, this.value)
      },
      shields: {
        metal: 200 * Math.pow(2, this.value),
        crystal: 600 * Math.pow(2, this.value),
        deuterium: 0 * Math.pow(2, this.value)
      },
      structure: {
        metal: 1000 * Math.pow(2, this.value),
        crystal: 0 * Math.pow(2, this.value),
        deuterium: 0 * Math.pow(2, this.value)
      }
    })[this.simpleName]
  }
}

module.exports = Research

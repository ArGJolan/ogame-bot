const Resource = require('./resource')
const Building = require('./building')
const Shipyard = require('./shipyard')
const Data = require('./data')

class Planet {
  constructor ({ config, researches, name }) {
    /**
     * System of data validity :
     *
     * The script visits the planet at t0, there is x resource, but a fleet is inbound in 4h,
     * we set a callback to be called after the data is revalidated 4h later (mostly the "What to do now script")
     */
    this.config = config
    this.researches = researches

    this.name = name

    this.maxTemperature = 29

    this.metalStock = new Resource(this, 'metal', 0, new Date())
    this.crystalStock = new Resource(this, 'crystal', 0, new Date())
    this.deuteriumStock = new Resource(this, 'deuterium', 0, new Date())
    this.energy = new Resource(this, 'energy', 0, new Date())

    this.metalMine = new Building(this.name, 'supplies', 'metalMine', 0, new Date())
    this.crystalMine = new Building(this.name, 'supplies', 'crystalMine', 0, new Date())
    this.deuteriumMine = new Building(this.name, 'supplies', 'deuteriumMine', 0, new Date())
    this.solarPlant = new Building(this.name, 'supplies', 'solarPlant', 0, new Date())
    this.fusionPlant = new Building(this.name, 'supplies', 'fusionPlant', 0, new Date())
    this.metalStorage = new Building(this.name, 'supplies', 'metalStorage', 0, new Date())
    this.crystalStorage = new Building(this.name, 'supplies', 'crystalStorage', 0, new Date())
    this.deuteriumStorage = new Building(this.name, 'supplies', 'deuteriumStorage', 0, new Date())

    this.shipyard = new Shipyard(this, 0, new Date())
    this.robotFactory = new Building(this.name, 'facilities', 'robotFactory', 0, new Date())
    this.naniteFactory = new Building(this.name, 'facilities', 'naniteFactory', 0, new Date())
    this.laboratory = new Building(this.name, 'facilities', 'laboratory', 0, new Date())
    this.terraformer = new Building(this.name, 'facilities', 'terraformer', 0, new Date())
    this.missileBay = new Building(this.name, 'facilities', 'missileBay', 0, new Date())

    this.buildingAvailable = new Data(this.name, false, new Date(), async function (page) {
      // await this.forcePlanet(page, this.name)
      // await this.forcePage(page, 'ingame', 'overview')
      await page.navigate(this.name, 'ingame', 'overview')

      const value = await page.$eval('#productionboxbuildingcomponent > div:nth-child(1) > div.content > table > tbody', el => {
        return el.innerHTML
      })
      if (value.indexOf('Aucun bâtiment en construction.') !== -1) {
        this.revalidate(this.name, true, new Date('2030/12/31'))
      } else {
        const countdown = await page.$eval('#buildingcountdown', el => el.innerHTML)
        const match = countdown.match(/([0-9]*h |)([0-9]*m |)([0-9]*s)/)
        const hours = +match[1].split('h')[0]
        const minutes = +match[2].split('m')[0]
        const seconds = +match[3].split('s')[0]
        const expires = new Date()
        expires.setSeconds(expires.getSeconds() + 3600 * hours + 60 * minutes + seconds + 5)
        console.log('Setting building available expiration', expires)
        this.revalidate(this.name, false, expires)
      }
    })

    this.researchAvailable = new Data(this.name, false, new Date(), async function (page) {
      // await this.forcePlanet(page, this.name)
      // await this.forcePage(page, 'ingame', 'overview')
      await page.navigate(this.name, 'ingame', 'overview')

      const value = await page.$eval('#productionboxresearchcomponent > div:nth-child(1) > div.content > table > tbody', el => {
        return el.innerHTML
      })
      if (value.indexOf('Aucune recherche en cours') !== -1) {
        this.revalidate(this.name, true, new Date('2030/12/31'))
      } else {
        const match = value.match(/<span id="researchCountdown">([0-9]*h |)([0-9]*m |)([0-9]*s)<\/span>/)
        const hours = +match[1].split('h')[0]
        const minutes = +match[2].split('m')[0]
        const seconds = +match[3].split('s')[0]
        const expires = new Date()
        expires.setSeconds(expires.getSeconds() + 3600 * hours + 60 * minutes + seconds + 5)
        this.revalidate(this.name, false, expires)
      }
    })

    this.toRevalidate = [
      'buildingAvailable',
      'researchAvailable',
      'metalMine',
      'crystalMine',
      'deuteriumMine',
      'solarPlant',
      'fusionPlant',
      'metalStorage',
      'crystalStorage',
      'deuteriumStorage',
      'robotFactory',
      'naniteFactory',
      'shipyard',
      'laboratory',
      'terraformer',
      'missileBay',
      'metalStock',
      'crystalStock',
      'deuteriumStock',
      'energy'
    ]
  }

  async sleep (ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }

  getCoordinates () {
    const [, galaxy, system, position] = (this.coordinates.match(/(?:\[|)([0-9]+):([0-9]+):([0-9]+)(?:\]|)/) || []).map(num => +num)
    return { galaxy, system, position }
  }

  isCoordinates (coordinates) {
    const [, galaxy, system, position] = coordinates.match(/(?:\[|)([0-9]+):([0-9]+):([0-9]+)(?:\]|)/) || []
    return `[${galaxy}:${system}:${position}]` === this.coordinates
  }

  async setCoordinates (page) {
    this.coordinates = await page.$eval(`#${this.name} .planet-koords`, el => el.innerText)
  }

  hasResources ({ metal = 0, crystal = 0, deuterium = 0 }) {
    console.log({metal, crystal, deuterium})
    console.log(this.metalStock.getValue(), this.crystalStock.getValue(), this.deuteriumStock.getValue())
    return this.metalStock.getValue() > metal && this.crystalStock.getValue() > crystal && this.deuteriumStock.getValue() > deuterium
  }

  async forcePlanet (page, planet = this.name) {
    try {
      console.log('FORCING PLANET', `#${planet} > a.planetlink`)
      await page.click(`#${planet} > a.planetlink`)
      await this.sleep(2000)
    } catch (e) {
      console.error('[BUILDING] FAILED TO SWITCH PLANET', e)
    }
  }

  async research ({ type, level }, page) {
    if (!this.researches[type] || !(this.researches[type].getValue() + 1 === level) || !this.researchAvailable.getValue()) {
      console.log(`Skipping ${type} level ${level} (${this.researches[type] && this.researches[type].getValue() + 1}) ${this.researchAvailable.getValue() ? 'available' : 'unavailable'}`)
      return
    }

    if (this.hasResources(this.researches[type].nextLevelCost())) {
    await page.navigate(this.name, 'ingame', 'overview')
    // await this.forcePlanet(page, this.name)
      this.researchAvailable.invalidate()
      await this.researches[type].upgrade(page)
    } else {
      console.log('Missing resources for', type, level)
    }
    return true
  }

  async buildLevel ({ isResearch, type, level }, page) {
    if (isResearch) {
      return this.research({ type, level }, page)
    }
    if (!(this[type] instanceof Building) || !(this[type].getValue() + 1 === level)) {
      console.log(`Skipping ${type} level ${level} (${this[type].getValue() + 1})}`)
      return
    }
    if (!this.canBuild()) {
      console.log('Cannot build yet')
      return
    }

    if (this.hasResources(this[type].nextLevelCost())) {
      await this.upgrade(type, page)
    } else {
      console.log('Missing resources for', type, level)
    }
    return true
  }

  canBuild () {
    return this.buildingAvailable.getValue()
  }

  async autoRevalidateResources (page) {
    await this.metalStock.autoRevalidate(page)
    await this.crystalStock.autoRevalidate(page)
    await this.deuteriumStock.autoRevalidate(page)
  }

  async upgrade (type, page) {
    if (this[type] instanceof Building) {
      this.buildingAvailable.invalidate()
      const ends = await this[type].upgrade(page)
      await page.navigate(this.name, 'ingame', 'overview')
      await this.metalStock.autoRevalidate(page)
      await this.crystalStock.autoRevalidate(page)
      await this.deuteriumStock.autoRevalidate(page)
      await this.energy.autoRevalidate(page)
      this.metalStock.setExpiration(ends)
      this.crystalStock.setExpiration(ends)
      this.deuteriumStock.setExpiration(ends)
      this.energy.setExpiration(ends)
    }
  }

  async autoRevalidate (page) {
    console.log('autoRevalidate planet', this.name)
    for (let item of this.toRevalidate) {
      if (!this[item].isValid()) {
        console.log('Revalidating', item)
        await this[item].autoRevalidate(page)
      }
    }
  }

  getRawMetalProduction (level = this.metalMine.getValue()) {
    return Math.floor(30 * level * Math.pow(1.1, level)) * this.config.speed
  }

  getRealMetalProduction (level = this.metalMine.getValue()) {
    return this.getRawMetalProduction(level) * (1 + 0.01 * this.researches.plasma.getValue())
  }

  getRawCrystalProduction (level = this.crystalMine.getValue()) {
    return Math.floor(20 * level * Math.pow(1.1, level)) * this.config.speed
  }

  getRealCrystalProduction (level = this.crystalMine.getValue()) {
    return this.getRawCrystalProduction(level) * (1 + 0.0066 * this.researches.plasma.getValue())
  }

  getRawDeuteriumProduction (level = this.deuteriumMine.getValue()) {
    return Math.floor(10 * level * Math.pow(1.1, level)) * (-0.002 * this.maxTemperature + 1.28) * this.config.speed
  }

  getRealDeuteriumProduction (level = this.deuteriumMine.getValue()) {
    return this.getRawDeuteriumProduction(level) * (1 + 0.0033 * this.researches.plasma.getValue())
  }

  nextMetalRentability () {
    const metalCost = 60 * Math.pow(1.5, this.metalMine.getValue())
    const crystalCost = 15 * Math.pow(1.5, this.metalMine.getValue())

    const totalMetalCost = metalCost + crystalCost * this.config.metalRatio / this.config.crystalRatio
    const newProd = this.getRealMetalProduction(this.metalMine.getValue() + 1)
    const oldProd = this.getRealMetalProduction(this.metalMine.getValue())
    const metalUpgrade = newProd - oldProd
    return totalMetalCost / metalUpgrade
  }

  nextCrystalRentability () {
    const metalCost = 48 * Math.pow(1.6, this.crystalMine.getValue())
    const crystalCost = 24 * Math.pow(1.6, this.crystalMine.getValue())

    const totalcrystalCost = crystalCost + metalCost * this.config.crystalRatio / this.config.metalRatio
    const newProd = this.getRealCrystalProduction(this.crystalMine.getValue() + 1)
    const oldProd = this.getRealCrystalProduction(this.crystalMine.getValue())
    const crystalUpgrade = newProd - oldProd
    return totalcrystalCost / crystalUpgrade
  }

  nextDeuteriumRentability () {
    const metalCost = 225 * Math.pow(1.5, this.deuteriumMine.getValue())
    const crystalCost = 75 * Math.pow(1.5, this.deuteriumMine.getValue())

    const totalDeuteriumCost = crystalCost * this.config.deuteriumRatio / this.config.crystalRatio + metalCost * this.config.deuteriumRatio / this.config.metalRatio
    const newProd = this.getRealDeuteriumProduction(this.deuteriumMine.getValue() + 1)
    const oldProd = this.getRealDeuteriumProduction(this.deuteriumMine.getValue())
    const deuteriumUpgrade = newProd - oldProd
    return totalDeuteriumCost / deuteriumUpgrade
  }
}

module.exports = Planet

const Scenario = require('./scenario')
const fs = require('fs')

class InactiveRaid extends Scenario {
  constructor (planets, researches, fleets) {
    super(planets, researches, fleets)
    this.planet = this.planets[Object.keys(this.planets)[0]]

    this.noDefense = []

    try {
      this.noDefense = require('./no-defense.json')
    } catch (e) {}
  }

  isAppliable () {
    return false
    return this.researches.combustionReactor.getValue() && this.planet.shipyard.getValue() >= 2
  }

  async loop (page) {
    if (!this.noDefense.length) {
      await this.fetchNoDefense(page)
    }
    const target = await this.findTargets(page)
    try {
      await this.planet.shipyard.raid(page, target[0])
    } catch (e) {
      console.error(e)
    }
    await this.sleep(600000)
  }

  async findTargets (page, count = 1) {
    await this.forcePage(page, 'ingame', 'galaxy')

    let targets = []

    while (targets.length < count) {
      const galaxy = await page.$eval('#galaxy_input', el => el.value)
      const system = await page.$eval('#system_input', el => el.value)
      const result = await page.$eval('#galaxytable > tbody', el => {
        const result = []
        el.childNodes.forEach(item => {
          if (item.classList && item.classList.length === 2 && item.classList[1] === 'inactive_filter' && item.classList[0] === 'row') {
            result.push({ name: item.childNodes[11].innerText.replace(/ \(I\)/g, ''), position: item.childNodes[1].innerText })
          }
        })
        return result
      })

      targets = [...targets, ...result.map(item => { return { ...item, galaxy, system } }).filter(item => this.noDefense.includes(item.name))]
    }
    return targets
  }

  async fetchNoDefense (page) {
    await this.forcePage(page, 'highscore')
    await page.click('#fleet')
    await this.sleep(2000)
    let elemCount = await page.$eval('.pagebar', el => el.childElementCount)
    try {
      await page.click(`#content > div > div:nth-child(2) > a:nth-child(${elemCount})`)
    } catch (e) {}

    let shouldContinue = true
    let shouldReduce = true
    while (shouldContinue) {
      elemCount = shouldReduce ? elemCount - 1 : 6
      if (elemCount < 6) {
        shouldReduce = false
      }

      const noDefense = await page.$$eval('#ranks tr', elems => {
        const noDefense = []
        elems.forEach(elem => {
          if (elem.childNodes[1].innerText !== 'Position' && !(+elem.childNodes[9].innerText)) {
            console.log('Pushing item with', +elem.childNodes[9].innerText, 'points')
            noDefense.push(elem.childNodes[5].innerText.match(/(\[.*\] ||)(.*)( \(.*)/)[2])
          }
        })
        return noDefense
      })
      this.noDefense = [...this.noDefense, ...noDefense]

      if (!noDefense.length) {
        shouldContinue = false
      }
      try {
        await page.click(`#content > div > div:nth-child(2) > a:nth-child(${elemCount})`)
        await this.sleep(2000)
      } catch (e) {
        console.log(e)
      }
    }
    fs.writeFileSync('./no-defense.json', JSON.stringify(this.noDefense))
  }
}

module.exports = InactiveRaid

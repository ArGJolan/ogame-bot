const Scenario = require('./scenario')

class WatchDog extends Scenario {
  constructor (planets, researches, fleets) {
    super(planets, researches, fleets)

    this.ids = {}
  }

  isAppliable () {
    return true
  }

  async loop (page) {
    const hostilesId = await page.$$eval('#eventContent .hostile', els => {
      const result = []
      for (let el of els) {
        const value = el.id.split('-')[2]
        result.push(value)
      }
      return result
    })
    console.log(hostilesId)

    for (let id of hostilesId) {
      if (!this.ids[id]) {
        this.ids[id] = { arrival: 0, comp: '' }
      }

      const info = await page.$eval(`#eventRow-${id}`, el => {
        return {
          arrival: el.dataset.arrivalTime,
          comp: el.nextElementSibling.childNodes[0].childNodes[1].innerText
        }
      })

      if (this.ids[id].arrival !== info.arrival) {
        console.log('Someone is attacking', this.info.comp)
        this.ids[id] = info
      } else {
        console.log(this.ids[id].arrival, info.arrival)
      }
    }
  }
}

module.exports = WatchDog

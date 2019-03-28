const Scenario = require('./scenario')
const config = require('../config')
const Notifier = require('../classes/notifier')

class WatchDog extends Scenario {
  constructor (planets, researches, fleets) {
    super(planets, researches, fleets)

    this.ids = {}
    this.lastCheck = new Date()
    this.notifier = new Notifier()
    this.notifier.notifyAll('Ogame Bot', 'Watchdog started').then(data => console.log('Wathdog started')).catch(e => console.log('Notify may not work properly'))

    this.alerts = {
      eventWindow: false
    }
  }

  isAppliable () {
    return true
  }

  async watchDogCheck (page) {
    const currentMinutes = await page.$eval('#bar .OGameClock > span', el => {
      return el.innerText.split(':')[1]
    })
    const lastRefreshMinutes = await page.$eval('#bar > .ago_clock', el => {
      return el.innerText.split(' ')[1].split(':')[1]
    })

    if (!this.nextRefresh) {
      this.nextRefresh = 10 + Math.floor(Math.random() * 10)
    }

    if (Math.abs(currentMinutes - lastRefreshMinutes) > this.nextRefresh) {
      console.log(`Page has not changed in ${this.nextRefresh} minutes, refreshing`)
      this.nextRefresh = 0
      await this.sleep(Math.floor(Math.random() * 30))
      await page.goto(`https://s${config.account.server}-fr.ogame.gameforge.com/game/index.php?page=overview`)
      await this.sleep(10000)
      return
    }

    let hostilesId = []
    try {
      hostilesId = await page.$$eval('#eventContent .hostile', els => {
        const result = []
        for (let el of els) {
          const value = el.id.split('-')[2]
          result.push(value)
        }
        return result
      })
      this.lastCheck = new Date()
      this.alerts.eventWindow = false
    } catch (e) {
      console.error('Could not check event window')
      if (new Date() - this.lastCheck > 120000 && !this.alerts.eventWindow) {
        this.alerts.eventWindow = true
        console.error('Event windows has not been checked in 2 minutes, something is wrong')
        await this.notifier.notifyAll('Error', 'Event window check failed in the last 2 minutes')
      }
    }

    // console.log(Math.abs(currentMinutes - lastRefreshMinutes), hostilesId)

    for (let id of hostilesId) {
      if (!this.ids[id]) {
        this.ids[id] = { arrival: 0, comp: '' }
      }

      const info = await page.$eval(`#eventRow-${id}`, el => {
        const comp = el.nextElementSibling.childNodes[0].childNodes[1].innerText.split('\n').map(item => item.trim())
        comp.splice(0, 7)
        return {
          arrival: el.dataset.arrivalTime,
          comp: comp.join('\r\n'),
          attacker: el.nextElementSibling.childNodes[0].childNodes[0].childNodes[0].innerText
        }
      })

      if (this.ids[id].arrival !== info.arrival) {
        const time = new Date(info.arrival * 1000)
        const format = num => `${num < 10 ? '0' : ''}${num}`
        await this.notifier.notifyAll(`►►► ATTACK ◄◄◄`, `[${format(time.getHours())}:${format(time.getMinutes())}:${format(time.getSeconds())}] ${info.attacker} is attacking you with :\r\n` + info.comp)
        this.ids[id] = info
      }
    }
  }

  async loop (page) {
    try {
      await this.watchDogCheck(page)
    } catch (e) {
      const time = new Date()
      const format = num => `${num < 10 ? '0' : ''}${num}`
      console.log(`[${format(time.getHours())}:${format(time.getMinutes())}:${format(time.getSeconds())}]\tWatchDog check failed : ${e.message}`)
    }
  }
}

module.exports = WatchDog

const Scenario = require('./scenario')

class Raid extends Scenario {
  constructor (planets, researches, fleets) {
    super(planets, researches, fleets)

    this.flightTime = {
      0: 2400,
      1: 3956,
      2: 4022,
      3: 4086,
      4: 4150,
      5: 4214
      // up to 10
    }
  }

  async filterOutUninterestingReports (page) {
    for (let i = 0; i < 50; i++) {
      await this.forcePage(page, 'messages', true)
      await this.sleep(5000)
      await page.click('input[name=delEspLoot]')
      await this.sleep(500)
      await page.click('input[name=delEspDef]')
      await this.sleep(500)

      const messagePaginationString = await page.$eval('#fleetsgenericpage > ul > ul:nth-child(1) > li.curPage', el => {
        return el.innerText
      })
      let [currentPage, maxPage] = messagePaginationString.split('/').map(page => +page)
      if (currentPage === maxPage) {
        return
      }
    }
  }

  async action (page, { maxFleets }) {
    if (!maxFleets) {
      throw new Error('maxFleets needs to be set')
    }

    await this.filterOutUninterestingReports(page)
  }
}

module.exports = Raid

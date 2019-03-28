const Scenario = require('./scenario')
const Spy = require('./spy')
const Raid = require('./raid')

class AutoRaid extends Scenario {
  // constructor (planets, researches, fleets) {
  //   super(planets, researches, fleets)
  // }

  async action (page, { planetsCoordinates, systemDelta, maxFleets }) {
    if (!planetsCoordinates || !systemDelta || !maxFleets) {
      throw new Error('Invalid parametters, expected planetsCoordinates, systemDelta and maxFleets')
    }
    const spy = new Spy(this.planets, this.researches, this.fleets)
    const raid = new Raid(this.planets, this.researches, this.fleets)

    await spy.action(page, { planetsCoordinates, systemDelta, maxFleets })
    await this.sleep(5000)
    await raid.action(page, { planetsCoordinates, systemDelta, maxFleets })
  }
}

module.exports = AutoRaid

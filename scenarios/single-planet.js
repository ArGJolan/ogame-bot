const Scenario = require('./scenario')

class SinglePlanet extends Scenario {
  constructor (planets, researches, fleets) {
    super(planets, researches, fleets)
    this.planet = this.planets[Object.keys(this.planets)[0]]
  }
  isAppliable () {
    if (Object.keys(this.planets).length === 1) {
      return true
    }
  }

  async loop (page) {
    const builds = [
      { isResearch: false, type: 'solarPlant', level: 1 },
      { isResearch: false, type: 'metalMine', level: 1 },
      { isResearch: false, type: 'metalMine', level: 2 },
      { isResearch: false, type: 'solarPlant', level: 2 },
      { isResearch: false, type: 'metalMine', level: 3 },
      { isResearch: false, type: 'metalMine', level: 4 },
      { isResearch: false, type: 'solarPlant', level: 3 },
      { isResearch: false, type: 'crystalMine', level: 1 },
      { isResearch: false, type: 'crystalMine', level: 2 },
      { isResearch: false, type: 'metalMine', level: 6 },
      { isResearch: false, type: 'solarPlant', level: 4 },
      { isResearch: false, type: 'crystalMine', level: 3 },
      { isResearch: false, type: 'metalMine', level: 7 },
      { isResearch: false, type: 'solarPlant', level: 5 },
      { isResearch: false, type: 'crystalMine', level: 4 },
      { isResearch: false, type: 'solarPlant', level: 6 },
      { isResearch: false, type: 'crystalMine', level: 5 },
      { isResearch: false, type: 'solarPlant', level: 7 },
      { isResearch: false, type: 'deuteriumMine', level: 1 },
      { isResearch: false, type: 'deuteriumMine', level: 2 },
      { isResearch: false, type: 'solarPlant', level: 8 },
      { isResearch: false, type: 'metalMine', level: 8 },
      { isResearch: false, type: 'metalMine', level: 9 },
      { isResearch: false, type: 'solarPlant', level: 9 },
      { isResearch: false, type: 'crystalMine', level: 6 },
      { isResearch: false, type: 'metalMine', level: 10 },
      { isResearch: false, type: 'solarPlant', level: 10 },
      { isResearch: false, type: 'crystalMine', level: 7 },
      { isResearch: false, type: 'crystalMine', level: 8 },
      { isResearch: false, type: 'solarPlant', level: 11 },
      { isResearch: false, type: 'deuteriumMine', level: 3 },
      { isResearch: false, type: 'deuteriumMine', level: 4 },
      { isResearch: false, type: 'deuteriumMine', level: 5 },
      { isResearch: false, type: 'laboratory', level: 1 },
      { isResearch: false, type: 'robotFactory', level: 1 },
      { isResearch: false, type: 'robotFactory', level: 2 },
      { isResearch: false, type: 'shipyard', level: 1 },
      { isResearch: true, type: 'energy', level: 1 },
      { isResearch: true, type: 'combustionReactor', level: 1 },
      { isResearch: false, type: 'shipyard', level: 2 },
      { isResearch: true, type: 'combustionReactor', level: 2 }
    ]
    for (let build of builds) {
      if (await this.planet.buildLevel(build, page)) {
        return
      }
    }
    if (this.planet.researches.combustionReactor.getValue() >= 2 && this.planet.hasResources({ metal: 2000, crystal: 2000 })) {
      await this.planet.shipyard.build(page, 'smallCargo', 9999)
      await this.planet.autoRevalidateResources(page)
      await this.planet.sleep(10000)
    }
  }
}

module.exports = SinglePlanet
